import 'server-only';

import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { processRunExtraction } from '@/lib/ai/pipeline';
import type { CanonicalExtractionBundle } from '@/lib/ai/extraction-schema';
import { TAXONOMY } from '@/lib/ai/taxonomy';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import { composeDeepResearchReport, buildReportCompareSummaryFromData } from '@/lib/family/report-composer';
import { resolveReviewState } from '@/lib/family/review-state';
import { deleteFamilyArtifact } from '@/lib/family/storage';
import { buildDeepResearchReportViewModel, type StructuredReportReadModel } from '@/lib/family/report-read-model';
import { deleteReportsForRun, deleteStructuredReportReadModel, upsertReportReadModel } from '@/lib/family/report-persistence';
import {
  readFamilyMockState,
  updateFamilyMockState,
} from '@/lib/family/mock-store';
import { purgeReminderEvents } from '@/lib/notifications/reminders';
import {
  recordRunCostArtifact,
  removeRunCostArtifacts,
} from '@/lib/observability/cost-tracking';
import { removeModelRuntimeArtifacts } from '@/lib/observability/model-runtime';
import {
  recordRunErrorEvent,
  recordRunLifecycleEvent,
  removeRunObservabilityArtifacts,
} from '@/lib/observability/telemetry';
import type {
  FamilyMockState,
  IncomingUploadFile,
  PageQualityFlags,
  StoredActivity,
  StoredChild,
  StoredEvidenceAnchor,
  StoredErrorLabel,
  StoredIssueTrend,
  StoredItemError,
  StoredProblemItem,
  StoredReport,
  StoredReviewHistory,
  StoredRun,
  StoredShareLink,
  StoredUpload,
  UploadIntakeInput,
} from '@/lib/family/types';
import type { DeepResearchReportViewModel, ParentReport } from '@/components/reports/report-types';
import {
  activityLogs,
  analysisRuns,
  chatMessages,
  chatThreads,
  children,
  childNotes,
  evidenceAnchors,
  errorLabels,
  issueTrends,
  itemErrors,
  pages,
  problemItems,
  reportCompareSnapshots,
  reportDiagnosisOutlines,
  reportOutputGates,
  reportReviewSnapshots,
  reportSevenDayPlans,
  reportShareArtifacts,
  reportShortestPaths,
  reports,
  reviewHistories,
  shareLinks,
  uploadFiles,
  uploads,
} from '@/lib/db/schema';

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();

function nowIso() {
  return new Date().toISOString();
}

function cloneQualityFlags(flags: PageQualityFlags): PageQualityFlags {
  return {
    blurry: Boolean(flags.blurry),
    rotated: Boolean(flags.rotated),
    dark: Boolean(flags.dark),
    lowContrast: Boolean(flags.lowContrast),
    width: typeof flags.width === 'number' ? flags.width : undefined,
    height: typeof flags.height === 'number' ? flags.height : undefined,
  };
}

function summarizeQuality(flags: PageQualityFlags) {
  const issues = [flags.blurry, flags.rotated, flags.dark, flags.lowContrast].filter(Boolean).length;
  return Math.max(35, 100 - issues * 18);
}

function extractParentReportJson(input: StoredReport | Record<string, unknown>) {
  return (
    'parentReportJson' in input ? input.parentReportJson : input
  ) as ParentReport;
}

function buildLegacyStructuredReadModel(parentReport: ParentReport): StructuredReportReadModel {
  return {
    diagnosisOutline: null,
    shortestPath: null,
    outputGates: [],
    sevenDayPlans: [],
    compareSnapshot: null,
    shareArtifact: null,
    reviewSnapshot: null,
    reviewHistories: [],
    issueTrends: [],
  };
}

function normalizeUploadIntake(input?: UploadIntakeInput | null) {
  const parentConcernJson = Array.isArray(input?.parentConcernJson)
    ? input!.parentConcernJson
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter((entry) => entry.length > 0)
    : [];

  return {
    diagnosticGoal:
      typeof input?.diagnosticGoal === 'string' && input.diagnosticGoal.trim().length > 0
        ? input.diagnosticGoal.trim()
        : null,
    recentTrend:
      typeof input?.recentTrend === 'string' && input.recentTrend.trim().length > 0
        ? input.recentTrend.trim()
        : null,
    parentConcernJson,
    teacherFeedbackPresent: Boolean(input?.teacherFeedbackPresent),
    hasTutor: Boolean(input?.hasTutor),
    intakeCompletedAt:
      typeof input?.intakeCompletedAt === 'string' && input.intakeCompletedAt
        ? input.intakeCompletedAt
        : nowIso(),
  };
}

function parseDateValue(value: string | Date | null | undefined) {
  if (!value) {
    return new Date(0);
  }
  return value instanceof Date ? value : new Date(value);
}

function getPrimaryFindingDetails(report: StoredReport | Record<string, unknown>) {
  const parentReport = extractParentReportJson(report);
  const topFindings = Array.isArray(parentReport.topFindings) ? parentReport.topFindings : [];
  const evidenceGroups = Array.isArray(parentReport.evidenceGroups) ? parentReport.evidenceGroups : [];
  const primaryFinding = topFindings[0];
  const primaryGroup = evidenceGroups[0];

  return {
    code: primaryFinding?.code || null,
    title: primaryFinding?.title || null,
    count:
      typeof primaryGroup?.count === 'number'
        ? primaryGroup.count
        : Array.isArray(primaryFinding?.evidence)
          ? primaryFinding.evidence.length
          : 0,
  };
}

function buildReviewSnapshotJson(report: StoredReport | Record<string, unknown>) {
  const parentReport = extractParentReportJson(report);
  return {
    summary: parentReport.summary || null,
    doThisWeek: parentReport.doThisWeek || null,
    guardrail: parentReport.guardrail || null,
    releaseStatus: parentReport.releaseStatus || null,
  };
}

function logMockActivity(state: FamilyMockState, userId: number, action: string, detail: string) {
  const record: StoredActivity = {
    id: state.meta.nextIds.activity++,
    userId,
    action,
    detail,
    timestamp: nowIso(),
  };
  state.activityLogs.unshift(record);
}

async function deleteArtifactsByPath(storagePaths: Array<string | null | undefined>) {
  const uniquePaths = Array.from(
    new Set(
      storagePaths
        .filter((storagePath): storagePath is string => typeof storagePath === 'string')
        .filter(Boolean)
    )
  );

  for (const storagePath of uniquePaths) {
    await deleteFamilyArtifact(storagePath);
  }
}

async function recordRunTelemetryTransition(args: {
  previousStatus: string;
  previousStage: string;
  run: StoredRun;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  if (
    args.previousStatus === args.run.status &&
    args.previousStage === args.run.stage
  ) {
    return;
  }

  await recordRunLifecycleEvent({
    runId: args.run.id,
    userId: args.run.userId,
    childId: args.run.childId,
    uploadId: args.run.uploadId,
    eventType: 'state_transition',
    status: args.run.status,
    stage: args.run.stage,
    message: args.message,
    metadata: {
      previousStatus: args.previousStatus,
      previousStage: args.previousStage,
      ...(args.metadata || {}),
    },
  });
}

async function recordRunCompletionArtifacts(args: {
  run: StoredRun;
  bundle: CanonicalExtractionBundle;
  engine: string;
  executionMetadata?: Record<string, unknown>;
}) {
  await recordRunLifecycleEvent({
    runId: args.run.id,
    userId: args.run.userId,
    childId: args.run.childId,
    uploadId: args.run.uploadId,
    eventType: args.run.status === 'needs_review' ? 'needs_review' : 'completed',
    status: args.run.status,
    stage: args.run.stage,
    message: args.run.statusMessage,
    metadata: {
      confidence: args.run.overallConfidence,
      reviewReason: args.run.needsReviewReason,
      engine: args.engine,
      ...(args.executionMetadata || {}),
    },
  });

  await recordRunCostArtifact({
    runId: args.run.id,
    userId: args.run.userId,
    engine: args.engine,
    pageCount: args.bundle.pages.length,
    labeledItemCount: args.bundle.labeledItems.length,
    status: args.run.status === 'needs_review' ? 'needs_review' : 'done',
    metadata: {
      confidence: args.run.overallConfidence,
      reviewReason: args.run.needsReviewReason,
      engine: args.engine,
      ...(args.executionMetadata || {}),
    },
  });
}

async function deleteDemoUploadCascade(state: FamilyMockState, userId: number, uploadId: number) {
  const upload = state.uploads.find((item) => item.userId === userId && item.id === uploadId);
  if (!upload) {
    return null;
  }

  const runIds = state.runs
    .filter((run) => run.userId === userId && run.uploadId === uploadId)
    .map((run) => run.id);
  const reportIds = state.reports
    .filter((report) => runIds.includes(report.runId))
    .map((report) => report.id);
  const pageStoragePaths = state.pages
    .filter((page) => page.uploadId === uploadId)
    .map((page) => page.storagePath);
  const fileStoragePaths = state.uploadFiles
    .filter((file) => file.uploadId === uploadId)
    .map((file) => file.storagePath);

  for (const runId of runIds) {
    removeDemoExtractionArtifacts(state, runId);
  }

  state.shareLinks = state.shareLinks.filter((link) => !reportIds.includes(link.reportId));
  state.runs = state.runs.filter((run) => !runIds.includes(run.id));
  state.pages = state.pages.filter((page) => page.uploadId !== uploadId);
  state.uploadFiles = state.uploadFiles.filter((file) => file.uploadId !== uploadId);
  state.uploads = state.uploads.filter((item) => item.id !== uploadId);

  await deleteArtifactsByPath([...pageStoragePaths, ...fileStoragePaths]);
  await purgeReminderEvents({
    userId,
    reportIds,
    childIds: [upload.childId],
  });
  await removeRunObservabilityArtifacts(runIds);
  await removeModelRuntimeArtifacts(runIds);
  await removeRunCostArtifacts(runIds);

  logMockActivity(
    state,
    userId,
    'DELETE_UPLOAD',
    `Deleted upload ${uploadId} and removed ${runIds.length} linked run(s).`
  );

  return {
    uploadId,
    childId: upload.childId,
    runIds,
    reportIds,
  };
}

async function deleteDemoReportRecord(state: FamilyMockState, userId: number, reportId: number) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) {
    return null;
  }

  const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
  if (!run) {
    return null;
  }

  state.shareLinks = state.shareLinks.filter((item) => item.reportId !== reportId);
  state.reviewHistories = state.reviewHistories.filter((item) => item.reportId !== reportId);
  state.reports = state.reports.filter((item) => item.id !== reportId);
  const nextTrends = buildIssueTrendRecordsFromHistory(
    run.childId,
    state.reviewHistories.filter((item) => item.childId === run.childId)
  );
  state.issueTrends = state.issueTrends.filter((item) => item.childId !== run.childId);
  nextTrends.forEach((trend) => {
    state.issueTrends.push({
      ...trend,
      id: state.meta.nextIds.issueTrend++,
    });
  });
  await purgeReminderEvents({
    userId,
    reportIds: [reportId],
    childIds: [run.childId],
  });

  logMockActivity(
    state,
    userId,
    'DELETE_REPORT',
    `Deleted report ${reportId} for run ${run.id}.`
  );

  return {
    reportId,
    runId: run.id,
    childId: run.childId,
  };
}

function removeDemoExtractionArtifacts(state: FamilyMockState, runId: number) {
  const itemIds = state.problemItems
    .filter((item) => item.runId === runId)
    .map((item) => item.id);

  if (itemIds.length > 0) {
    state.itemErrors = state.itemErrors.filter((itemError) => !itemIds.includes(itemError.itemId));
  }

  state.evidenceAnchors = state.evidenceAnchors.filter((item) => !itemIds.includes(item.problemItemId));
  state.problemItems = state.problemItems.filter((item) => item.runId !== runId);
  const removedReportIds = state.reports
    .filter((report) => report.runId === runId)
    .map((report) => report.id);
  state.reviewHistories = state.reviewHistories.filter((item) => !removedReportIds.includes(item.reportId));
  state.reports = state.reports.filter((report) => report.runId !== runId);
}

function getOrCreateDemoErrorLabel(state: FamilyMockState, code: string): StoredErrorLabel | null {
  const existing = state.errorLabels.find((label) => label.code === code);
  if (existing) {
    return existing;
  }

  const taxonomy = TAXONOMY.find((item) => item.code === code);
  if (!taxonomy) {
    return null;
  }

  const label: StoredErrorLabel = {
    id: state.meta.nextIds.errorLabel++,
    code: taxonomy.code,
    displayName: taxonomy.displayName,
    description: taxonomy.description,
    createdAt: nowIso(),
  };
  state.errorLabels.push(label);
  return label;
}

function buildBundleFromDemoState(
  state: FamilyMockState,
  run: StoredRun
): CanonicalExtractionBundle | null {
  const runItems = state.problemItems.filter((item) => item.runId === run.id);
  if (runItems.length === 0) {
    return null;
  }

  const pageMap = new Map(state.pages.map((page) => [page.id, page] as const));
  const labelMap = new Map(state.errorLabels.map((label) => [label.id, label] as const));

  const pagesById = new Map<
    number,
    {
      pageId: number;
      pageNo: number;
      sourceName: string;
      detectedLanguage: string;
      pageConfidence: number;
      qualityFlags: {
        blurry: boolean;
        rotated: boolean;
        dark: boolean;
        lowContrast: boolean;
      };
      items: Array<{
        problemNo: string;
        problemText: string;
        studentWork: string;
        teacherMark: 'correct' | 'wrong' | 'partial' | 'unknown';
        modelIsCorrect: boolean | null;
        itemConfidence: number;
        evidenceAnchor: {
          pageId: number;
          pageNo: number;
          problemNo: string;
          previewLabel: string;
        };
      }>;
    }
  >();

  const labeledItems = runItems.map((item) => {
    const page = pageMap.get(item.pageId);
    const linkedErrors = state.itemErrors.filter((itemError) => itemError.itemId === item.id);
    const labels = linkedErrors
      .map((linkedError) => {
        const label = labelMap.get(linkedError.labelId);
        if (!label) {
          return null;
        }
        return {
          code: label.code,
          severity: linkedError.severity,
          labelConfidence: linkedError.confidence,
          role: linkedError.isPrimary ? ('primary' as const) : ('secondary' as const),
        };
      })
      .filter((label): label is NonNullable<typeof label> => Boolean(label));

    if (page) {
      const existingPage = pagesById.get(page.id);
      const pagePayload = {
        problemNo: item.problemNo,
        problemText: item.problemText,
        studentWork: item.studentWork,
        teacherMark: item.teacherMark,
        modelIsCorrect: item.modelIsCorrect,
        itemConfidence: item.itemConfidence,
        evidenceAnchor: {
          pageId: page.id,
          pageNo: item.evidenceAnchor.pageNo,
          problemNo: item.evidenceAnchor.problemNo,
          previewLabel: item.evidenceAnchor.previewLabel,
        },
      };

      if (existingPage) {
        existingPage.items.push(pagePayload);
      } else {
        pagesById.set(page.id, {
          pageId: page.id,
          pageNo: page.pageNumber,
          sourceName: page.sourceName,
          detectedLanguage: 'en',
          pageConfidence: Number((Math.max(0.38, page.qualityScore / 100)).toFixed(2)),
          qualityFlags: {
            blurry: page.qualityFlags.blurry,
            rotated: page.qualityFlags.rotated,
            dark: page.qualityFlags.dark,
            lowContrast: page.qualityFlags.lowContrast,
          },
          items: [pagePayload],
        });
      }
    }

    return {
      problemNo: item.problemNo,
      problemText: item.problemText,
      studentWork: item.studentWork,
      teacherMark: item.teacherMark,
      modelIsCorrect: item.modelIsCorrect,
      itemConfidence: item.itemConfidence,
      evidenceAnchor: {
        pageId: item.pageId,
        pageNo: item.evidenceAnchor.pageNo,
        problemNo: item.evidenceAnchor.problemNo,
        previewLabel: item.evidenceAnchor.previewLabel,
      },
      labels,
      rationale:
        linkedErrors[0]?.rationale ||
        'The extracted work pattern needs a focused practice response rather than a direct answer.',
    };
  });

  return {
    runId: run.id,
    engine: 'demo',
    modelVersion: 'demo-persisted',
    pages: Array.from(pagesById.values()).sort((left, right) => left.pageNo - right.pageNo),
    labeledItems,
    overallConfidence: run.overallConfidence ?? 0.5,
    requiresReview: run.status === 'needs_review',
    reviewReason: run.needsReviewReason,
  };
}

async function persistDemoExtractionBundle(
  state: FamilyMockState,
  run: StoredRun,
  bundle: CanonicalExtractionBundle
) {
  removeDemoExtractionArtifacts(state, run.id);

  const now = nowIso();

  for (const item of bundle.labeledItems) {
    const storedItem: StoredProblemItem = {
      id: state.meta.nextIds.problemItem++,
      runId: run.id,
      pageId: item.evidenceAnchor.pageId,
      problemNo: item.problemNo,
      problemText: item.problemText,
      studentWork: item.studentWork,
      teacherMark: item.teacherMark,
      modelIsCorrect: item.modelIsCorrect,
      itemConfidence: item.itemConfidence,
      evidenceAnchor: {
        pageNo: item.evidenceAnchor.pageNo,
        problemNo: item.evidenceAnchor.problemNo,
        previewLabel: item.evidenceAnchor.previewLabel,
      },
      createdAt: now,
    };
    state.problemItems.push(storedItem);
    const evidenceAnchor: StoredEvidenceAnchor = {
      id: state.meta.nextIds.evidenceAnchor++,
      problemItemId: storedItem.id,
      pageId: storedItem.pageId,
      pageNo: item.evidenceAnchor.pageNo,
      problemNo: item.evidenceAnchor.problemNo,
      previewLabel: item.evidenceAnchor.previewLabel,
      highlightBoxJson: {},
      anchorKind: 'problem',
      createdAt: now,
    };
    state.evidenceAnchors.push(evidenceAnchor);

    for (const label of item.labels) {
      const storedLabel = getOrCreateDemoErrorLabel(state, label.code);
      if (!storedLabel) {
        continue;
      }

      const itemError: StoredItemError = {
        id: state.meta.nextIds.itemError++,
        itemId: storedItem.id,
        labelId: storedLabel.id,
        severity: label.severity,
        rationale: item.rationale,
        confidence: label.labelConfidence,
        isPrimary: label.role !== 'secondary',
        createdAt: now,
      };
      state.itemErrors.push(itemError);
    }
  }

  const child = state.children.find((item) => item.id === run.childId);
  const upload = state.uploads.find((item) => item.id === run.uploadId);
  if (!child || !upload) {
    return null;
  }

  const previousReport =
    state.reports
      .filter((item) => item.runId !== run.id)
      .map((item) => ({
        report: item,
        siblingRun: state.runs.find((candidate) => candidate.id === item.runId) || null,
      }))
      .filter((entry) => entry.siblingRun?.childId === run.childId)
      .sort((left, right) => (right.report.createdAt || '').localeCompare(left.report.createdAt || ''))[0]
      ?.report || null;

  const composedReport = composeDeepResearchReport({
    bundle,
    child,
    upload,
    previousReport,
  });

  const report: StoredReport = {
    id: state.meta.nextIds.report++,
    runId: run.id,
    parentReportJson: composedReport.parentReportJson,
    studentReportJson: composedReport.studentReportJson,
    tutorReportJson: composedReport.tutorReportJson,
    deepResearchReportJson: composedReport.structured as unknown as Record<string, unknown>,
    deckId: null,
    deckStatus: 'idle',
    deckTier: 'pending',
    walkthroughVisibility: 'hidden',
    voiceGuidanceDefault: false,
    createdAt: now,
    updatedAt: now,
  };
  state.reports.push(report);
  syncDemoReviewHistoryForReport(state, {
    childId: run.childId,
    runId: run.id,
    report,
  });
  return report;
}

async function finalizeDemoRunWithExtraction(
  state: FamilyMockState,
  run: StoredRun,
  options?: {
    preferMathpix?: boolean;
    force?: boolean;
    reviewOverride?: string | null;
  }
  ) {
    if (!options?.force) {
      const existingBundle = buildBundleFromDemoState(state, run);
      const existingReport = state.reports.find((report) => report.runId === run.id) || null;
      if (existingBundle && existingReport) {
        return {
          bundle: existingBundle,
          report: existingReport,
        };
      }
    }

  const pageRecords = state.pages.filter((page) => page.uploadId === run.uploadId);
  await removeModelRuntimeArtifacts([run.id]);
  const extractionResult = await processRunExtraction({
    runId: run.id,
    pages: pageRecords.map((page) => ({
      id: page.id,
      pageNumber: page.pageNumber,
      previewLabel: page.previewLabel,
      sourceName: page.sourceName,
      storagePath: page.storagePath,
      qualityFlags: {
        blurry: page.qualityFlags.blurry,
        rotated: page.qualityFlags.rotated,
        dark: page.qualityFlags.dark,
        lowContrast: page.qualityFlags.lowContrast,
      },
    })),
    preferMathpix: options?.preferMathpix,
  });
  const bundle = extractionResult.bundle;
  const reviewState = resolveReviewState({
    bundle,
    reviewOverride: options?.reviewOverride,
  });
  const reviewReason = reviewState.reviewReason;
  run.overallConfidence = bundle.overallConfidence;
  run.progressPercent = 100;
  run.finishedAt = nowIso();
  run.updatedAt = nowIso();

  if (reviewState.needsReview) {
    run.status = 'needs_review';
    run.stage = 'review';
    run.statusMessage = 'Needs review before the full report is released.';
    run.needsReviewReason = reviewReason;
  } else {
    run.status = 'done';
    run.stage = 'done';
    run.statusMessage = 'Diagnosis generated successfully.';
    run.needsReviewReason = null;
  }

  const report = await persistDemoExtractionBundle(state, run, {
    ...bundle,
    requiresReview: reviewState.needsReview,
    reviewReason,
  });

  await recordRunCompletionArtifacts({
    run,
    bundle: {
      ...bundle,
      requiresReview: reviewState.needsReview,
      reviewReason,
    },
    engine: extractionResult.execution.engine,
    executionMetadata: {
      fallbackApplied: extractionResult.execution.fallbackApplied,
      attemptCount: extractionResult.execution.attemptCount,
      taskType: extractionResult.execution.taskType,
      modelVersion: extractionResult.execution.modelVersion,
    },
  });

    return {
      bundle: {
        ...bundle,
        requiresReview: reviewState.needsReview,
        reviewReason,
      },
      report,
      execution: extractionResult.execution,
    };
  }

function getLatestDemoReportForRun(state: FamilyMockState, runId: number) {
  return (
    state.reports
      .filter((item) => item.runId === runId)
      .sort((left, right) => {
        const updatedCompare = right.updatedAt.localeCompare(left.updatedAt);
        if (updatedCompare !== 0) {
          return updatedCompare;
        }
        return right.createdAt.localeCompare(left.createdAt);
      })[0] || null
  );
}

function getDemoRunWithReport(state: FamilyMockState, runId: number) {
  const run = state.runs.find((item) => item.id === runId);
  if (!run) {
    return null;
  }

  const report = getLatestDemoReportForRun(state, run.id);
  const upload = state.uploads.find((item) => item.id === run.uploadId) || null;
  const child = state.children.find((item) => item.id === run.childId) || null;
  const pageRecords = state.pages.filter((item) => item.uploadId === run.uploadId);

  return {
    ...run,
    reportId: report?.id ?? null,
    upload,
    child,
    pageRecords,
  };
}

function getForcedReviewReason(
  notes: string | null | undefined,
  pageRecords: Array<{ isBlurry: boolean; isRotated: boolean; isDark: boolean }>
) {
  const normalizedNotes = (notes || '').toLowerCase();
  const qualityIssueCount = pageRecords.filter(
    (page) => page.isBlurry || page.isRotated || page.isDark
  ).length;

  if (normalizedNotes.includes('review')) {
    return 'This upload was explicitly flagged for manual review before release.';
  }

  if (qualityIssueCount >= Math.max(2, Math.ceil(pageRecords.length * 0.35))) {
    return 'Several pages were dark, blurry, or rotated and need manual review.';
  }

  return null;
}

async function syncDemoRunState(state: FamilyMockState, runId: number) {
  const run = state.runs.find((item) => item.id === runId);
  if (!run) {
    return null;
  }

  const previousStatus = run.status;
  const previousStage = run.stage;

  if (run.status === 'done' || run.status === 'failed' || run.status === 'needs_review') {
    if (
      (run.status === 'done' || run.status === 'needs_review') &&
      !state.problemItems.some((item) => item.runId === run.id)
    ) {
      const upload = state.uploads.find((item) => item.id === run.uploadId);
      const pageRecords = state.pages.filter((item) => item.uploadId === run.uploadId);
      const reviewOverride =
        run.status === 'needs_review'
          ? run.needsReviewReason ||
            getForcedReviewReason(upload?.notes, pageRecords) ||
            'This run needs manual review before release.'
          : null;

      if (upload) {
        await finalizeDemoRunWithExtraction(state, run, {
          force: true,
          reviewOverride,
          preferMathpix: upload.notes.toLowerCase().includes('mathpix'),
        });
      }
    }

    return getDemoRunWithReport(state, runId);
  }

  const upload = state.uploads.find((item) => item.id === run.uploadId);
  const pageRecords = state.pages.filter((item) => item.uploadId === run.uploadId);
  const qualityIssueCount = pageRecords.filter(
    (page) => page.isBlurry || page.isRotated || page.isDark
  ).length;
  const elapsedMs = Date.now() - new Date(run.createdAt).getTime();
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  if (upload?.notes.toLowerCase().includes('timeout')) {
    run.status = 'failed';
    run.stage = 'failed';
    run.progressPercent = 100;
    run.errorMessage =
      'This run exceeded the expected time window. Please retry or contact support.';
    run.statusMessage = 'Analysis timed out before the diagnosis could finish.';
    run.finishedAt = nowIso();
    run.updatedAt = nowIso();
    await recordRunTelemetryTransition({
      previousStatus,
      previousStage,
      run,
      message: run.statusMessage,
      metadata: {
        reason: 'timeout',
      },
    });
    await recordRunErrorEvent({
      runId: run.id,
      userId: run.userId,
      errorType: 'timeout',
      message: run.errorMessage || run.statusMessage,
      metadata: {
        uploadId: run.uploadId,
        childId: run.childId,
      },
    });
    return getDemoRunWithReport(state, runId);
  }

  if (upload?.notes.toLowerCase().includes('fail')) {
    run.status = 'failed';
    run.stage = 'failed';
    run.progressPercent = 100;
    run.errorMessage = 'The run was intentionally forced into failure mode for retry testing.';
    run.statusMessage = 'Analysis failed. Please retry or contact support.';
    run.finishedAt = nowIso();
    run.updatedAt = nowIso();
    await recordRunTelemetryTransition({
      previousStatus,
      previousStage,
      run,
      message: run.statusMessage,
      metadata: {
        reason: 'forced_failure',
      },
    });
    await recordRunErrorEvent({
      runId: run.id,
      userId: run.userId,
      errorType: 'forced_failure',
      message: run.errorMessage || run.statusMessage,
      metadata: {
        uploadId: run.uploadId,
        childId: run.childId,
      },
    });
    return getDemoRunWithReport(state, runId);
  }

  if (elapsedSeconds < 2) {
    run.status = 'queued';
    run.stage = 'queued';
    run.progressPercent = 12;
    run.statusMessage = 'Queued for preprocessing.';
  } else if (elapsedSeconds < 5) {
    run.status = 'running';
    run.stage = 'preprocessing';
    run.progressPercent = 36;
    run.statusMessage = 'Checking page quality, count, and source metadata.';
    run.startedAt = run.startedAt || nowIso();
  } else if (elapsedSeconds < 8) {
    run.status = 'running';
    run.stage = 'extracting';
    run.progressPercent = 68;
    run.statusMessage = 'Extracting item-level evidence anchors from each page.';
  } else if (elapsedSeconds < 11) {
    run.status = 'running';
    run.stage = 'composing';
    run.progressPercent = 86;
    run.statusMessage = 'Composing diagnosis, evidence, and next steps.';
  } else {
    const forcedReviewReason = getForcedReviewReason(upload?.notes, pageRecords);

    await finalizeDemoRunWithExtraction(state, run, {
      reviewOverride: forcedReviewReason,
      preferMathpix: upload?.notes.toLowerCase().includes('mathpix'),
    });
  }

  run.updatedAt = nowIso();
  await recordRunTelemetryTransition({
    previousStatus,
    previousStage,
    run,
    message: run.statusMessage,
    metadata: {
      qualityIssueCount,
      elapsedSeconds,
    },
  });

  return getDemoRunWithReport(state, runId);
}

export async function listChildrenForUser(userId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    return state.children
      .filter((child) => child.userId === userId && !child.deletedAt)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  return db
    .select()
    .from(children)
    .where(and(eq(children.userId, userId), isNull(children.deletedAt)))
    .orderBy(desc(children.updatedAt));
}

export async function getChildForUser(userId: number, childId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    return (
      state.children.find(
        (child) => child.userId === userId && child.id === childId && !child.deletedAt
      ) || null
    );
  }

  const result = await db
    .select()
    .from(children)
    .where(
      and(
        eq(children.userId, userId),
        eq(children.id, childId),
        isNull(children.deletedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function getChildNoteForUser(userId: number, childId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const child = state.children.find(
      (item) => item.userId === userId && item.id === childId && !item.deletedAt
    );
    if (!child) {
      return null;
    }

    return state.childNotes.find((item) => item.childId === childId) || null;
  }

  const child = await getChildForUser(userId, childId);
  if (!child) {
    return null;
  }

  const [note] = await db
    .select()
    .from(childNotes)
    .where(eq(childNotes.childId, childId))
    .limit(1);

  return note || null;
}

export async function createChildForUser(
  userId: number,
  input: { nickname: string; grade: string; curriculum: string }
) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => {
      const child: StoredChild = {
        id: state.meta.nextIds.child++,
        userId,
        nickname: input.nickname,
        grade: input.grade,
        curriculum: input.curriculum,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        deletedAt: null,
      };
      state.children.push(child);
      logMockActivity(state, userId, 'CREATE_CHILD', `Created child profile ${child.nickname}.`);
      return child;
    });
  }

  const [createdChild] = await db
    .insert(children)
    .values({
      userId,
      nickname: input.nickname,
      grade: input.grade,
      curriculum: input.curriculum,
    })
    .returning();

  return createdChild;
}

export async function updateChildForUser(
  userId: number,
  childId: number,
  input: { nickname: string; grade: string; curriculum: string }
) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => {
      const child = state.children.find(
        (item) => item.userId === userId && item.id === childId && !item.deletedAt
      );
      if (!child) {
        return null;
      }

      child.nickname = input.nickname;
      child.grade = input.grade;
      child.curriculum = input.curriculum;
      child.updatedAt = nowIso();
      logMockActivity(state, userId, 'UPDATE_CHILD', `Updated child profile ${child.nickname}.`);
      return child;
    });
  }

  const [updatedChild] = await db
    .update(children)
    .set({
      nickname: input.nickname,
      grade: input.grade,
      curriculum: input.curriculum,
      updatedAt: new Date(),
    })
    .where(and(eq(children.userId, userId), eq(children.id, childId)))
    .returning();

  return updatedChild || null;
}

export async function archiveChildForUser(userId: number, childId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState(async (state) => {
      const child = state.children.find(
        (item) => item.userId === userId && item.id === childId && !item.deletedAt
      );
      if (!child) {
        return null;
      }

      child.deletedAt = nowIso();
      child.updatedAt = nowIso();
      const childUploadIds = state.uploads
        .filter((upload) => upload.userId === userId && upload.childId === child.id)
        .map((upload) => upload.id);
      for (const uploadId of childUploadIds) {
        await deleteDemoUploadCascade(state, userId, uploadId);
      }
      await purgeReminderEvents({
        userId,
        childIds: [child.id],
      });
      logMockActivity(state, userId, 'ARCHIVE_CHILD', `Archived child profile ${child.nickname}.`);
      return child;
    });
  }

  const childUploads = await db
    .select({ id: uploads.id })
    .from(uploads)
    .where(and(eq(uploads.userId, userId), eq(uploads.childId, childId)));

  for (const uploadRecord of childUploads) {
    await deleteUploadForUser(userId, uploadRecord.id);
  }

  const [archivedChild] = await db
    .update(children)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(children.userId, userId), eq(children.id, childId)))
    .returning();

  return archivedChild || null;
}

export async function listUploadsForChild(userId: number, childId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    return state.uploads
      .filter((upload) => upload.userId === userId && upload.childId === childId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  return db
    .select()
    .from(uploads)
    .where(and(eq(uploads.userId, userId), eq(uploads.childId, childId)))
    .orderBy(desc(uploads.createdAt));
}

export async function getUploadForUser(userId: number, uploadId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const upload = state.uploads.find((item) => item.userId === userId && item.id === uploadId);
    if (!upload) {
      return null;
    }

    return {
      upload,
      files: state.uploadFiles.filter((item) => item.uploadId === upload.id),
      pages: state.pages.filter((item) => item.uploadId === upload.id),
    };
  }

  const [upload] = await db
    .select()
    .from(uploads)
    .where(and(eq(uploads.userId, userId), eq(uploads.id, uploadId)))
    .limit(1);

  if (!upload) {
    return null;
  }

  return {
    upload,
    files: await db.select().from(uploadFiles).where(eq(uploadFiles.uploadId, upload.id)),
    pages: await db.select().from(pages).where(eq(pages.uploadId, upload.id)),
  };
}

export async function deleteUploadForUser(userId: number, uploadId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => deleteDemoUploadCascade(state, userId, uploadId));
  }

  const uploadRecord = await getUploadForUser(userId, uploadId);
  if (!uploadRecord) {
    return null;
  }

  const runRows = await db
    .select({ id: analysisRuns.id })
    .from(analysisRuns)
    .where(and(eq(analysisRuns.userId, userId), eq(analysisRuns.uploadId, uploadId)));
  const runIds = runRows.map((run) => run.id);
  const reportRows =
    runIds.length > 0
      ? await db
          .select({ id: reports.id })
          .from(reports)
          .where(inArray(reports.runId, runIds))
      : [];
  const reportIds = reportRows.map((report) => report.id);

  await purgeReminderEvents({
    userId,
    reportIds,
    childIds: [uploadRecord.upload.childId],
  });

  await removeRunObservabilityArtifacts(runIds);
  await removeModelRuntimeArtifacts(runIds);
  await removeRunCostArtifacts(runIds);

  if (reportIds.length > 0) {
    await db.delete(shareLinks).where(inArray(shareLinks.reportId, reportIds));
    await db.delete(reports).where(inArray(reports.id, reportIds));
  }

  if (runIds.length > 0) {
    const itemRows = await db
      .select({ id: problemItems.id })
      .from(problemItems)
      .where(inArray(problemItems.runId, runIds));
    if (itemRows.length > 0) {
      await db.delete(itemErrors).where(inArray(itemErrors.itemId, itemRows.map((item) => item.id)));
      await db.delete(problemItems).where(inArray(problemItems.id, itemRows.map((item) => item.id)));
    }
    await db.delete(analysisRuns).where(inArray(analysisRuns.id, runIds));
  }

  await db.delete(pages).where(eq(pages.uploadId, uploadId));
  await db.delete(uploadFiles).where(eq(uploadFiles.uploadId, uploadId));
  await db.delete(uploads).where(and(eq(uploads.id, uploadId), eq(uploads.userId, userId)));

  await deleteArtifactsByPath([
    ...uploadRecord.files.map((file) => file.storagePath),
    ...uploadRecord.pages.map((page) => page.storagePath),
  ]);

  return {
    uploadId,
    childId: uploadRecord.upload.childId,
    runIds,
    reportIds,
  };
}

export async function deleteReportForUser(userId: number, reportId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => deleteDemoReportRecord(state, userId, reportId));
  }

  const reportRecord = await getReportForUser(userId, reportId);
  if (!reportRecord) {
    return null;
  }

  const runId = Number((reportRecord as any).runId ?? (reportRecord as any).run?.id ?? 0);
  const childId = Number((reportRecord as any).childId ?? (reportRecord as any).run?.childId ?? 0);

  await purgeReminderEvents({
    userId,
    reportIds: [reportId],
    childIds: childId > 0 ? [childId] : [],
  });

  await deleteStructuredReportReadModel(reportId);
  await db.delete(shareLinks).where(eq(shareLinks.reportId, reportId));
  await db.delete(reviewHistories).where(eq(reviewHistories.reportId, reportId));
  await db.delete(reports).where(eq(reports.id, reportId));
  const historyRows = childId > 0
    ? await db
        .select()
        .from(reviewHistories)
        .where(eq(reviewHistories.childId, childId))
        .orderBy(reviewHistories.createdAt)
    : [];
  await db.delete(issueTrends).where(eq(issueTrends.childId, childId));
  const nextTrends = buildIssueTrendRecordsFromHistory(childId, historyRows);
  if (nextTrends.length > 0) {
    await db.insert(issueTrends).values(
      nextTrends.map((trend) => ({
        childId: trend.childId,
        issueCode: trend.issueCode,
        issueTitle: trend.issueTitle,
        status: trend.status,
        trendDirection: trend.trendDirection,
        firstSeenReportId: trend.firstSeenReportId,
        latestReportId: trend.latestReportId,
        occurrenceCount: trend.occurrenceCount,
        summary: trend.summary,
        trendPointsJson: trend.trendPointsJson,
        updatedAt: new Date(trend.updatedAt),
      }))
    );
  }

  return {
    reportId,
    runId: runId > 0 ? runId : null,
    childId: childId > 0 ? childId : null,
  };
}

export async function listRecentRunsForUser(userId: number, limit = 5) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    return state.runs
      .filter((run) => run.userId === userId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit)
      .map((run) => {
        const child = state.children.find((item) => item.id === run.childId);
        return {
          ...run,
          childNickname: child?.nickname || 'Unknown child',
        };
      });
  }

  const rows = await db
    .select({
      id: analysisRuns.id,
      userId: analysisRuns.userId,
      childId: analysisRuns.childId,
      uploadId: analysisRuns.uploadId,
      status: analysisRuns.status,
      stage: analysisRuns.stage,
      progressPercent: analysisRuns.progressPercent,
      estimatedMinutes: analysisRuns.estimatedMinutes,
      statusMessage: analysisRuns.statusMessage,
      needsReviewReason: analysisRuns.needsReviewReason,
      errorMessage: analysisRuns.errorMessage,
      startedAt: analysisRuns.startedAt,
      finishedAt: analysisRuns.finishedAt,
      createdAt: analysisRuns.createdAt,
      updatedAt: analysisRuns.updatedAt,
      childNickname: children.nickname,
    })
    .from(analysisRuns)
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .where(eq(analysisRuns.userId, userId))
    .orderBy(desc(analysisRuns.createdAt))
    .limit(limit);

  return rows;
}

export async function createUploadForUser(
  userId: number,
  input: {
    childId: number;
    sourceType: StoredUpload['sourceType'];
    notes: string;
    files: IncomingUploadFile[];
    intake?: UploadIntakeInput;
  }
) {
  const totalPages = input.files.reduce((sum, file) => sum + file.pageCount, 0);
  const intake = normalizeUploadIntake(input.intake);

  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => {
      const upload: StoredUpload = {
        id: state.meta.nextIds.upload++,
        userId,
        childId: input.childId,
        sourceType: input.sourceType,
        notes: input.notes,
        diagnosticGoal: intake.diagnosticGoal,
        recentTrend: intake.recentTrend,
        parentConcernJson: intake.parentConcernJson,
        teacherFeedbackPresent: intake.teacherFeedbackPresent,
        hasTutor: intake.hasTutor,
        intakeCompletedAt: intake.intakeCompletedAt,
        totalPages,
        status: 'draft',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        submittedAt: null,
      };

      state.uploads.push(upload);

      let runningPageNumber = 1;
      for (const file of input.files) {
        const uploadFileId = state.meta.nextIds.uploadFile++;
        state.uploadFiles.push({
          id: uploadFileId,
          uploadId: upload.id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          storagePath: file.storagePath,
          pageCount: file.pageCount,
          previewKind: file.previewKind,
          createdAt: nowIso(),
        });

        for (const pageDraft of file.pages) {
          const qualityFlags = cloneQualityFlags(pageDraft.qualityFlags);
          state.pages.push({
            id: state.meta.nextIds.page++,
            uploadId: upload.id,
            uploadFileId,
            pageNumber: runningPageNumber++,
            sourceName: file.originalName,
            storagePath: pageDraft.storagePath,
            previewLabel: pageDraft.previewLabel,
            isBlurry: qualityFlags.blurry,
            isRotated: qualityFlags.rotated,
            isDark: qualityFlags.dark,
            qualityScore: summarizeQuality(qualityFlags),
            qualityFlags,
            createdAt: nowIso(),
          });
        }
      }

      logMockActivity(
        state,
        userId,
        'CREATE_UPLOAD',
        `Created upload ${upload.id} with ${upload.totalPages} pages.`
      );

      return {
        upload,
        pages: state.pages.filter((page) => page.uploadId === upload.id),
      };
    });
  }

  const [upload] = await db
    .insert(uploads)
    .values({
      userId,
      childId: input.childId,
      sourceType: input.sourceType,
      notes: input.notes,
      diagnosticGoal: intake.diagnosticGoal,
      recentTrend: intake.recentTrend,
      parentConcernJson: intake.parentConcernJson,
      teacherFeedbackPresent: intake.teacherFeedbackPresent,
      hasTutor: intake.hasTutor,
      intakeCompletedAt: intake.intakeCompletedAt ? new Date(intake.intakeCompletedAt) : null,
      totalPages,
      status: 'draft',
    })
    .returning();

  const createdFiles = [];
  let runningPageNumber = 1;

  for (const file of input.files) {
    const [createdFile] = await db
      .insert(uploadFiles)
      .values({
        uploadId: upload.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        storagePath: file.storagePath,
        pageCount: file.pageCount,
        previewKind: file.previewKind,
      })
      .returning();

    createdFiles.push(createdFile);

    for (const pageDraft of file.pages) {
      const qualityFlags = cloneQualityFlags(pageDraft.qualityFlags);
      await db.insert(pages).values({
        uploadId: upload.id,
        uploadFileId: createdFile.id,
        pageNumber: runningPageNumber++,
        sourceName: file.originalName,
        storagePath: pageDraft.storagePath,
        previewLabel: pageDraft.previewLabel,
        isBlurry: qualityFlags.blurry,
        isRotated: qualityFlags.rotated,
        isDark: qualityFlags.dark,
        qualityScore: summarizeQuality(qualityFlags),
        qualityFlags,
      });
    }
  }

  return {
    upload,
    pages: await db.select().from(pages).where(eq(pages.uploadId, upload.id)),
    createdFiles,
  };
}

export async function submitUploadForUser(userId: number, uploadId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState(async (state) => {
      const upload = state.uploads.find((item) => item.userId === userId && item.id === uploadId);
      if (!upload) {
        return null;
      }

      upload.status = 'submitted';
      upload.submittedAt = nowIso();
      upload.updatedAt = nowIso();

      const run: StoredRun = {
        id: state.meta.nextIds.run++,
        userId,
        childId: upload.childId,
        uploadId: upload.id,
        status: 'queued',
        stage: 'queued',
        progressPercent: 0,
        estimatedMinutes: 4,
        statusMessage: 'Queued for preprocessing.',
        overallConfidence: null,
        needsReviewReason: null,
        errorMessage: null,
        deckId: null,
        deckGenerationStatus: 'idle',
        deckReviewStatus: 'not_requested',
        deckExportStatus: 'idle',
        startedAt: null,
        finishedAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      state.runs.push(run);
      logMockActivity(
        state,
        userId,
        'SUBMIT_UPLOAD',
        `Submitted upload ${upload.id} and created run ${run.id}.`
      );

      await recordRunLifecycleEvent({
        runId: run.id,
        userId,
        childId: run.childId,
        uploadId: run.uploadId,
        eventType: 'queued',
        status: run.status,
        stage: run.stage,
        message: run.statusMessage,
        metadata: {
          sourceType: upload.sourceType,
          totalPages: upload.totalPages,
          diagnosticGoal: upload.diagnosticGoal,
          recentTrend: upload.recentTrend,
          parentConcernCount: upload.parentConcernJson.length,
          teacherFeedbackPresent: upload.teacherFeedbackPresent,
          hasTutor: upload.hasTutor,
        },
      });

      return syncDemoRunState(state, run.id);
    });
  }

  const [uploadRecord] = await db
    .select({
      id: uploads.id,
      childId: uploads.childId,
      sourceType: uploads.sourceType,
      diagnosticGoal: uploads.diagnosticGoal,
      recentTrend: uploads.recentTrend,
      parentConcernJson: uploads.parentConcernJson,
      teacherFeedbackPresent: uploads.teacherFeedbackPresent,
      hasTutor: uploads.hasTutor,
      totalPages: uploads.totalPages,
      status: uploads.status,
    })
    .from(uploads)
    .where(and(eq(uploads.id, uploadId), eq(uploads.userId, userId)))
    .limit(1);

  if (!uploadRecord) {
    return null;
  }

  const [run] = await db
    .insert(analysisRuns)
    .values({
      userId,
      childId: uploadRecord.childId,
      uploadId: uploadRecord.id,
      status: 'queued',
      stage: 'queued',
      progressPercent: 0,
      estimatedMinutes: 4,
      statusMessage: 'Queued for preprocessing.',
    })
    .returning();

  await db
    .update(uploads)
    .set({
      status: 'submitted',
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(uploads.id, uploadRecord.id), eq(uploads.userId, userId)));

  await recordRunLifecycleEvent({
    runId: run.id,
    userId,
    childId: run.childId,
    uploadId: run.uploadId,
    eventType: 'queued',
    status: run.status,
    stage: run.stage,
    message: run.statusMessage || 'Queued for preprocessing.',
    metadata: {
      sourceType: uploadRecord.sourceType,
      totalPages: uploadRecord.totalPages,
      diagnosticGoal: uploadRecord.diagnosticGoal,
      recentTrend: uploadRecord.recentTrend,
      parentConcernCount: Array.isArray(uploadRecord.parentConcernJson)
        ? uploadRecord.parentConcernJson.length
        : 0,
      teacherFeedbackPresent: uploadRecord.teacherFeedbackPresent,
      hasTutor: uploadRecord.hasTutor,
    },
  });

  return {
    ...run,
    upload: uploadRecord,
    reportId: null,
  };
}

export async function getRunForUser(userId: number, runId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => {
      const run = state.runs.find((item) => item.userId === userId && item.id === runId);
      if (!run) {
        return null;
      }
      return syncDemoRunState(state, run.id);
    });
  }

  const [run] = await db
    .select()
    .from(analysisRuns)
    .where(and(eq(analysisRuns.id, runId), eq(analysisRuns.userId, userId)))
    .limit(1);

  if (!run) {
    return null;
  }

  const [report] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(eq(reports.runId, run.id))
    .orderBy(desc(reports.createdAt), desc(reports.id))
    .limit(1);

  const [child] = await db
    .select({ nickname: children.nickname, grade: children.grade, curriculum: children.curriculum })
    .from(children)
    .where(eq(children.id, run.childId))
    .limit(1);

  const [upload] = await db
    .select({
      id: uploads.id,
      totalPages: uploads.totalPages,
      sourceType: uploads.sourceType,
      notes: uploads.notes,
    })
    .from(uploads)
    .where(eq(uploads.id, run.uploadId))
    .limit(1);

  const pageRecords = await db.select().from(pages).where(eq(pages.uploadId, run.uploadId));

  return {
    ...run,
    reportId: report?.id ?? null,
    child,
    upload,
    pageRecords,
  };
}

export async function processRunForUser(
  userId: number,
  runId: number,
  options?: {
    force?: boolean;
    preferMathpix?: boolean;
  }
) {
  const requestedEngine = options?.preferMathpix ? 'mathpix' : 'openai';

  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState(async (state) => {
      const run = state.runs.find((item) => item.userId === userId && item.id === runId);
      if (!run) {
        return null;
      }

      const upload = state.uploads.find((item) => item.id === run.uploadId) || null;
      const pageRecords = state.pages.filter((item) => item.uploadId === run.uploadId);

      if (run.status === 'failed' && !options?.force) {
        return {
          run: getDemoRunWithReport(state, run.id),
          bundle: null,
          reportId: null,
          requestedEngine,
        };
      }

      const result = await finalizeDemoRunWithExtraction(state, run, {
        force: options?.force,
        preferMathpix:
          options?.preferMathpix || Boolean(upload?.notes.toLowerCase().includes('mathpix')),
        reviewOverride: getForcedReviewReason(upload?.notes, pageRecords),
      });
      const updatedRun = getDemoRunWithReport(state, run.id);

      return {
        run: updatedRun,
        bundle: result.bundle,
        reportId: result.report?.id ?? updatedRun?.reportId ?? null,
        requestedEngine: result.execution?.engine || requestedEngine,
      };
    });
  }

  const run = await getRunForUser(userId, runId);
  if (!run) {
    return null;
  }

  if (run.status === 'failed' && !options?.force) {
    return {
      run,
      bundle: null,
      reportId: run.reportId ?? null,
      requestedEngine,
    };
  }

  const [upload] = await db
    .select({
      id: uploads.id,
      notes: uploads.notes,
      sourceType: uploads.sourceType,
      diagnosticGoal: uploads.diagnosticGoal,
      recentTrend: uploads.recentTrend,
      parentConcernJson: uploads.parentConcernJson,
      teacherFeedbackPresent: uploads.teacherFeedbackPresent,
      hasTutor: uploads.hasTutor,
      intakeCompletedAt: uploads.intakeCompletedAt,
    })
    .from(uploads)
    .where(eq(uploads.id, run.uploadId))
    .limit(1);

  const pageRecords = await db.select().from(pages).where(eq(pages.uploadId, run.uploadId));
  await removeModelRuntimeArtifacts([run.id]);
  const extractionResult = await processRunExtraction({
    runId: run.id,
    pages: pageRecords.map((page) => ({
      id: page.id,
      pageNumber: page.pageNumber,
      previewLabel: page.previewLabel,
      sourceName: page.sourceName,
      storagePath: page.storagePath,
      qualityFlags: {
        blurry: Boolean(page.qualityFlags?.blurry),
        rotated: Boolean(page.qualityFlags?.rotated),
        dark: Boolean(page.qualityFlags?.dark),
        lowContrast: Boolean(page.qualityFlags?.lowContrast),
      },
    })),
    preferMathpix:
      options?.preferMathpix || Boolean(upload?.notes?.toLowerCase().includes('mathpix')),
  });
  const bundle = extractionResult.bundle;

  const forcedReviewReason = getForcedReviewReason(upload?.notes, pageRecords);
  const reviewState = resolveReviewState({
    bundle,
    reviewOverride: forcedReviewReason,
  });
  const reviewReason = reviewState.reviewReason;

  await deleteReportsForRun(run.id);

  const existingItems = await db
    .select({ id: problemItems.id })
    .from(problemItems)
    .where(eq(problemItems.runId, run.id));

  if (existingItems.length > 0) {
    await db
      .delete(evidenceAnchors)
      .where(inArray(evidenceAnchors.problemItemId, existingItems.map((item) => item.id)));
    await db
      .delete(itemErrors)
      .where(inArray(itemErrors.itemId, existingItems.map((item) => item.id)));
    await db
      .delete(problemItems)
      .where(eq(problemItems.runId, run.id));
  }

  const labelsByCode = new Map(
    (
      await db
        .select()
        .from(errorLabels)
    ).map((label) => [label.code, label] as const)
  );

  for (const taxonomy of TAXONOMY) {
    if (!labelsByCode.has(taxonomy.code)) {
      const [createdLabel] = await db
        .insert(errorLabels)
        .values({
          code: taxonomy.code,
          displayName: taxonomy.displayName,
          description: taxonomy.description,
        })
        .returning();
      labelsByCode.set(createdLabel.code, createdLabel);
    }
  }

  for (const item of bundle.labeledItems) {
    const [createdItem] = await db
      .insert(problemItems)
      .values({
        runId: run.id,
        pageId: item.evidenceAnchor.pageId,
        problemNo: item.problemNo,
        problemText: item.problemText,
        studentWork: item.studentWork,
        teacherMark: item.teacherMark,
        modelIsCorrect: item.modelIsCorrect,
        itemConfidence: item.itemConfidence,
        evidenceAnchor: item.evidenceAnchor,
      })
      .returning();

    await db.insert(evidenceAnchors).values({
      problemItemId: createdItem.id,
      pageId: item.evidenceAnchor.pageId,
      pageNo: item.evidenceAnchor.pageNo,
      problemNo: item.evidenceAnchor.problemNo,
      previewLabel: item.evidenceAnchor.previewLabel,
      highlightBoxJson: {},
      anchorKind: 'problem',
    });

    for (const label of item.labels) {
      const storedLabel = labelsByCode.get(label.code);
      if (!storedLabel) {
        continue;
      }
      await db.insert(itemErrors).values({
        itemId: createdItem.id,
        labelId: storedLabel.id,
        severity: label.severity,
        rationale: item.rationale,
        confidence: label.labelConfidence,
        isPrimary: label.role !== 'secondary',
      });
    }
  }

  const [child] = await db
    .select({
      nickname: children.nickname,
      grade: children.grade,
      curriculum: children.curriculum,
    })
    .from(children)
    .where(eq(children.id, run.childId))
    .limit(1);

  let createdReportId: number | null = null;

  if (child && upload) {
    const previousReportRows = await db
      .select({
        report: reports,
        run: analysisRuns,
      })
      .from(reports)
      .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
      .where(and(eq(analysisRuns.userId, userId), eq(analysisRuns.childId, run.childId)))
      .orderBy(desc(reports.createdAt))
      .limit(2);
    const previousReport =
      previousReportRows.find((entry) => entry.report.runId !== run.id)?.report || null;

    const reportPayload = composeDeepResearchReport({
      bundle: {
        ...bundle,
        requiresReview: reviewState.needsReview,
        reviewReason,
      },
      child,
      upload: {
        ...upload,
        intakeCompletedAt: upload.intakeCompletedAt
          ? upload.intakeCompletedAt.toISOString()
          : null,
      },
      previousReport,
    });

    const [createdReport] = await db.insert(reports).values({
      runId: run.id,
      parentReportJson: reportPayload.parentReportJson,
      studentReportJson: reportPayload.studentReportJson,
      tutorReportJson: reportPayload.tutorReportJson,
    }).returning();
    createdReportId = createdReport.id;

    await upsertReportReadModel({
      reportId: createdReport.id,
      payload: reportPayload,
    });
    await syncReviewHistoryForReport({
      userId,
      childId: run.childId,
      runId: run.id,
      reportId: createdReport.id,
      report: createdReport,
      createdAt: createdReport.createdAt,
      compareSummary: reportPayload.structured.compareSnapshot.compareSummary,
    });
  }

  await db
    .update(analysisRuns)
    .set({
      overallConfidence: bundle.overallConfidence,
      status: reviewState.needsReview ? 'needs_review' : 'done',
      stage: reviewState.needsReview ? 'review' : 'done',
      progressPercent: 100,
      statusMessage: reviewState.needsReview
        ? 'Needs review before the full report is released.'
        : 'Diagnosis generated successfully.',
      needsReviewReason: reviewReason,
      errorMessage: null,
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(analysisRuns.id, run.id), eq(analysisRuns.userId, userId)));

  await recordRunCompletionArtifacts({
    run: {
      ...run,
      status: reviewState.needsReview ? 'needs_review' : 'done',
      stage: reviewState.needsReview ? 'review' : 'done',
      statusMessage: reviewState.needsReview
        ? 'Needs review before the full report is released.'
        : 'Diagnosis generated successfully.',
      overallConfidence: bundle.overallConfidence,
      needsReviewReason: reviewReason,
      finishedAt: nowIso(),
      updatedAt: nowIso(),
    } as StoredRun,
    bundle: {
      ...bundle,
      requiresReview: reviewState.needsReview,
      reviewReason,
    },
    engine: extractionResult.execution.engine,
    executionMetadata: {
      requestedEngine,
      fallbackApplied: extractionResult.execution.fallbackApplied,
      attemptCount: extractionResult.execution.attemptCount,
      taskType: extractionResult.execution.taskType,
      modelVersion: extractionResult.execution.modelVersion,
    },
  });

  const refreshedRun = await getRunForUser(userId, runId);
  return {
    run: refreshedRun,
    bundle: {
      ...bundle,
      requiresReview: reviewState.needsReview,
      reviewReason,
    },
    reportId: createdReportId ?? refreshedRun?.reportId ?? null,
    requestedEngine: extractionResult.execution.engine,
  };
}

export async function retryRunForUser(userId: number, runId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState(async (state) => {
      const run = state.runs.find((item) => item.userId === userId && item.id === runId);
      if (!run) {
        return null;
      }
      const upload = state.uploads.find((item) => item.id === run.uploadId);
      if (upload && upload.notes.toLowerCase().includes('fail')) {
        upload.notes = upload.notes.replace(/fail/gi, 'retried');
        upload.updatedAt = nowIso();
      }

      run.status = 'queued';
      run.stage = 'queued';
      run.progressPercent = 0;
      run.statusMessage = 'Retry queued.';
      run.overallConfidence = null;
      run.needsReviewReason = null;
      run.errorMessage = null;
      run.startedAt = null;
      run.finishedAt = null;
      run.createdAt = nowIso();
      run.updatedAt = nowIso();
      removeDemoExtractionArtifacts(state, run.id);
      logMockActivity(state, userId, 'RETRY_RUN', `Retried run ${run.id}.`);
      await recordRunLifecycleEvent({
        runId: run.id,
        userId,
        childId: run.childId,
        uploadId: run.uploadId,
        eventType: 'retry_queued',
        status: run.status,
        stage: run.stage,
        message: run.statusMessage,
        metadata: {},
      });
      return syncDemoRunState(state, run.id);
    });
  }

  const [run] = await db
    .update(analysisRuns)
    .set({
      status: 'queued',
      stage: 'queued',
      progressPercent: 0,
      statusMessage: 'Retry queued.',
      overallConfidence: null,
      needsReviewReason: null,
      errorMessage: null,
      startedAt: null,
      finishedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(analysisRuns.id, runId), eq(analysisRuns.userId, userId)))
    .returning();

  if (run) {
    await recordRunLifecycleEvent({
      runId: run.id,
      userId,
      childId: run.childId,
      uploadId: run.uploadId,
      eventType: 'retry_queued',
      status: run.status,
      stage: run.stage,
      message: run.statusMessage || 'Retry queued.',
      metadata: {},
    });
  }

  return run || null;
}

export async function getReportForUser(userId: number, reportId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const report = state.reports.find((item) => item.id === reportId);
    if (!report) {
      return null;
    }
    const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
    if (!run) {
      return null;
    }
    const child = state.children.find((item) => item.id === run.childId) || null;
    return {
      ...report,
      run,
      child,
      shareLinks: state.shareLinks.filter((item) => item.reportId === report.id),
    };
  }

  const [row] = await db
    .select({
      report: reports,
      run: analysisRuns,
      child: children,
      upload: uploads,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .leftJoin(uploads, eq(analysisRuns.uploadId, uploads.id))
    .where(and(eq(reports.id, reportId), eq(analysisRuns.userId, userId)))
    .limit(1);

  if (!row) {
    return null;
  }

  const reportLinks = await listShareLinksForReport(userId, reportId);
  return {
    ...row.report,
    run: row.run,
    child: row.child,
    upload: row.upload,
    shareLinks: reportLinks,
  };
}

export async function getDeepResearchReportForUser(
  userId: number,
  reportId: number
): Promise<{
  report: Awaited<ReturnType<typeof getReportForUser>>;
  structured: StructuredReportReadModel;
  reportViewModel: DeepResearchReportViewModel;
} | null> {
  const reportRecord = await getReportForUser(userId, reportId);
  if (!reportRecord) {
    return null;
  }

  const parentReport = ((reportRecord as any).parentReportJson || {}) as ParentReport;
  let structured: StructuredReportReadModel = buildLegacyStructuredReadModel(parentReport);

  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const demoStructured = ((reportRecord as StoredReport).deepResearchReportJson || null) as
      | Record<string, unknown>
      | null;
    if (demoStructured) {
      structured = {
        diagnosisOutline: (demoStructured.diagnosisOutline as StructuredReportReadModel['diagnosisOutline']) || null,
        shortestPath: (demoStructured.shortestPath as StructuredReportReadModel['shortestPath']) || null,
        outputGates: Array.isArray(demoStructured.outputGates)
          ? (demoStructured.outputGates as StructuredReportReadModel['outputGates'])
          : [],
        sevenDayPlans: Array.isArray(demoStructured.sevenDayPlans)
          ? (demoStructured.sevenDayPlans as StructuredReportReadModel['sevenDayPlans'])
          : [],
        compareSnapshot: (demoStructured.compareSnapshot as StructuredReportReadModel['compareSnapshot']) || null,
        shareArtifact: (demoStructured.shareArtifact as StructuredReportReadModel['shareArtifact']) || null,
        reviewSnapshot: (demoStructured.reviewSnapshot as StructuredReportReadModel['reviewSnapshot']) || null,
        reviewHistories: state.reviewHistories
          .filter((item) => item.childId === Number((reportRecord as any).run?.childId || 0))
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          })),
        issueTrends: state.issueTrends
          .filter((item) => item.childId === Number((reportRecord as any).run?.childId || 0))
          .map((item) => ({
            ...item,
            updatedAt: new Date(item.updatedAt),
          })),
      };
    }
  } else {
    const [diagnosisOutline] = await db
      .select()
      .from(reportDiagnosisOutlines)
      .where(eq(reportDiagnosisOutlines.reportId, reportId))
      .limit(1);
    const [shortestPath] = await db
      .select()
      .from(reportShortestPaths)
      .where(eq(reportShortestPaths.reportId, reportId))
      .limit(1);
    const outputGates = await db
      .select()
      .from(reportOutputGates)
      .where(eq(reportOutputGates.reportId, reportId));
    const sevenDayPlans = await db
      .select()
      .from(reportSevenDayPlans)
      .where(eq(reportSevenDayPlans.reportId, reportId));
    const [compareSnapshot] = await db
      .select()
      .from(reportCompareSnapshots)
      .where(eq(reportCompareSnapshots.reportId, reportId))
      .limit(1);
    const [shareArtifact] = await db
      .select()
      .from(reportShareArtifacts)
      .where(eq(reportShareArtifacts.reportId, reportId))
      .limit(1);
    const [reviewSnapshot] = await db
      .select()
      .from(reportReviewSnapshots)
      .where(eq(reportReviewSnapshots.reportId, reportId))
      .limit(1);
    const historyRows = await db
      .select()
      .from(reviewHistories)
      .where(eq(reviewHistories.childId, Number((reportRecord as any).run?.childId || 0)))
      .orderBy(desc(reviewHistories.createdAt));
    const trendRows = await db
      .select()
      .from(issueTrends)
      .where(eq(issueTrends.childId, Number((reportRecord as any).run?.childId || 0)));

    structured = {
      diagnosisOutline: diagnosisOutline || null,
      shortestPath: shortestPath || null,
      outputGates: outputGates.sort((left, right) => left.sortOrder - right.sortOrder),
      sevenDayPlans: sevenDayPlans.sort((left, right) => left.sortOrder - right.sortOrder),
      compareSnapshot: compareSnapshot || null,
      shareArtifact: shareArtifact || null,
      reviewSnapshot: reviewSnapshot || null,
      reviewHistories: historyRows,
      issueTrends: trendRows,
    };
  }

  const reportViewModel = buildDeepResearchReportViewModel({
    reportId,
    parentReport,
    labels: parentReport.labels,
    structured,
    completedDays: parentReport.completedDays,
  });

  return {
    report: reportRecord,
    structured,
    reportViewModel,
  };
}

export async function getReportByRunForUser(userId: number, runId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const run = state.runs.find((item) => item.id === runId && item.userId === userId);
    if (!run) {
      return null;
    }
    const report = getLatestDemoReportForRun(state, run.id);
    return report || null;
  }

  const [row] = await db
    .select({
      report: reports,
      run: analysisRuns,
      child: children,
      upload: uploads,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .leftJoin(uploads, eq(analysisRuns.uploadId, uploads.id))
    .where(and(eq(reports.runId, runId), eq(analysisRuns.userId, userId)))
    .orderBy(desc(reports.createdAt), desc(reports.id))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    ...row.report,
    run: row.run,
    child: row.child,
    upload: row.upload,
  };
}

export async function updateReportPlanProgressForUser(
  userId: number,
  reportId: number,
  input: {
    completedDays?: number[];
    parentNote?: string | null;
  }
) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => {
      const report = state.reports.find((item) => item.id === reportId);
      if (!report) {
        return null;
      }

      const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
      if (!run) {
        return null;
      }

      const currentCompletedDays = Array.isArray(report.parentReportJson.completedDays)
        ? (report.parentReportJson.completedDays as number[])
        : [];
      const normalizedDays = Array.from(
        new Set(
          (input.completedDays || currentCompletedDays)
            .filter((day) => Number.isInteger(day))
            .filter((day) => day >= 1 && day <= 7)
        )
      ).sort((left, right) => left - right);

      report.parentReportJson = {
        ...report.parentReportJson,
        completedDays: normalizedDays,
        parentNote:
          typeof input.parentNote === 'string'
            ? input.parentNote.trim()
            : (report.parentReportJson.parentNote as string | undefined) || '',
      };
      report.updatedAt = nowIso();
      const reviewHistory = state.reviewHistories.find((item) => item.reportId === reportId);
      if (reviewHistory) {
        reviewHistory.parentNote =
          typeof input.parentNote === 'string'
            ? input.parentNote.trim()
            : reviewHistory.parentNote;
        reviewHistory.completedDaysJson = normalizedDays;
        reviewHistory.updatedAt = report.updatedAt;
      }

      const child = state.children.find((item) => item.id === run.childId) || null;
      return {
        ...report,
        run,
        child,
      };
    });
  }

  const reportRecord = await getReportForUser(userId, reportId);
  if (!reportRecord) {
    return null;
  }

  const currentCompletedDays = Array.isArray((reportRecord as any).parentReportJson?.completedDays)
    ? ((reportRecord as any).parentReportJson.completedDays as number[])
    : [];
  const normalizedDays = Array.from(
    new Set(
      (input.completedDays || currentCompletedDays)
        .filter((day) => Number.isInteger(day))
        .filter((day) => day >= 1 && day <= 7)
    )
  ).sort((left, right) => left - right);

  const nextParentReport = {
    ...(reportRecord as any).parentReportJson,
    completedDays: normalizedDays,
    parentNote:
      typeof input.parentNote === 'string'
        ? input.parentNote.trim()
        : (reportRecord as any).parentReportJson?.parentNote || '',
  };

  await db
    .update(reports)
    .set({
      parentReportJson: nextParentReport,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, reportId));

  await db
    .update(reviewHistories)
    .set({
      parentNote:
        typeof input.parentNote === 'string'
          ? input.parentNote.trim()
          : ((reportRecord as any).parentReportJson?.parentNote as string | undefined) || null,
      completedDaysJson: normalizedDays,
      updatedAt: new Date(),
    })
    .where(eq(reviewHistories.reportId, reportId));

  return getReportForUser(userId, reportId);
}

export async function getPageArtifactForUser(userId: number, pageId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const page = state.pages.find((item) => item.id === pageId);
    if (!page) {
      return null;
    }
    const upload = state.uploads.find((item) => item.id === page.uploadId && item.userId === userId);
    if (!upload) {
      return null;
    }
    return page;
  }

  const rows = await db
    .select({
      id: pages.id,
      uploadId: pages.uploadId,
      uploadFileId: pages.uploadFileId,
      pageNumber: pages.pageNumber,
      sourceName: pages.sourceName,
      storagePath: pages.storagePath,
      previewLabel: pages.previewLabel,
      isBlurry: pages.isBlurry,
      isRotated: pages.isRotated,
      isDark: pages.isDark,
      qualityScore: pages.qualityScore,
      qualityFlags: pages.qualityFlags,
      createdAt: pages.createdAt,
    })
    .from(pages)
    .innerJoin(uploads, eq(pages.uploadId, uploads.id))
    .where(and(eq(pages.id, pageId), eq(uploads.userId, userId)))
    .limit(1);

  return rows[0] || null;
}

function extractTopFinding(report: StoredReport | Record<string, unknown>) {
  const parentReport = (
    'parentReportJson' in report ? report.parentReportJson : report
  ) as Record<string, unknown>;
  const topFindings = Array.isArray(parentReport.topFindings)
    ? (parentReport.topFindings as Array<Record<string, unknown>>)
    : [];
  const evidenceGroups = Array.isArray(parentReport.evidenceGroups)
    ? (parentReport.evidenceGroups as Array<Record<string, unknown>>)
    : [];

  const primaryFinding = topFindings[0] || null;
  const primaryGroup = evidenceGroups[0] || null;

  return {
    title: typeof primaryFinding?.title === 'string' ? primaryFinding.title : null,
    count:
      typeof primaryGroup?.count === 'number'
        ? primaryGroup.count
        : Array.isArray(primaryFinding?.evidence)
          ? primaryFinding.evidence.length
          : 0,
  };
}

function buildReportCompareSummary(
  currentReport: StoredReport | Record<string, unknown>,
  previousReport: StoredReport | Record<string, unknown> | null
) {
  const currentFinding = extractTopFinding(currentReport);
  const previousFinding = previousReport ? extractTopFinding(previousReport) : null;

  return buildReportCompareSummaryFromData({
    currentTitle: currentFinding.title,
    currentCount: currentFinding.count,
    previousTitle: previousFinding?.title,
    previousCount: previousFinding?.count,
  });
}

function buildIssueTrendRecordsFromHistory(
  childId: number,
  histories: Array<StoredReviewHistory | {
    id: number;
    childId: number;
    reportId: number;
    primaryIssue: string;
    secondaryIssue: string | null;
    compareSummary: string;
    snapshotJson: Record<string, unknown>;
    createdAt: string | Date;
  }>
): StoredIssueTrend[] {
  const ordered = histories
    .slice()
    .sort(
      (left, right) =>
        parseDateValue(left.createdAt).getTime() - parseDateValue(right.createdAt).getTime()
    );
  const trendMap = new Map<string, StoredIssueTrend>();

  for (const history of ordered) {
    const issues = [
      { code: history.primaryIssue || 'current_focus', title: history.primaryIssue || 'Current focus', role: 'primary' },
      history.secondaryIssue
        ? { code: history.secondaryIssue, title: history.secondaryIssue, role: 'secondary' }
        : null,
    ].filter((entry): entry is { code: string; title: string; role: string } => Boolean(entry));

    for (const issue of issues) {
      const existing = trendMap.get(issue.code);
      if (!existing) {
        trendMap.set(issue.code, {
          id: trendMap.size + 1,
          childId,
          issueCode: issue.code,
          issueTitle: issue.title,
          status: issue.role === 'primary' ? 'active' : 'watch',
          trendDirection: 'new',
          firstSeenReportId: history.reportId,
          latestReportId: history.reportId,
          occurrenceCount: 1,
          summary: history.compareSummary,
          trendPointsJson: [58],
          updatedAt:
            history.createdAt instanceof Date
              ? history.createdAt.toISOString()
              : history.createdAt,
        });
        continue;
      }

      existing.latestReportId = history.reportId;
      existing.occurrenceCount += 1;
      existing.status = issue.role === 'primary' ? 'active' : existing.status;
      existing.trendDirection = existing.occurrenceCount > 1 ? 'recurring' : existing.trendDirection;
      existing.summary = history.compareSummary;
      existing.trendPointsJson = [
        ...existing.trendPointsJson,
        Math.min(96, 54 + existing.occurrenceCount * 8),
      ];
      existing.updatedAt =
        history.createdAt instanceof Date ? history.createdAt.toISOString() : history.createdAt;
    }
  }

  return Array.from(trendMap.values());
}

async function syncReviewHistoryForReport(args: {
  userId: number;
  childId: number;
  runId: number;
  reportId: number;
  report: StoredReport | Record<string, unknown>;
  createdAt?: string | Date;
  compareSummary?: string | null;
}) {
  const parentReport = extractParentReportJson(args.report);
  const primary = getPrimaryFindingDetails(args.report);
  const secondary = Array.isArray(parentReport.topFindings) ? parentReport.topFindings[1] : null;
  const completedDays = Array.isArray(parentReport.completedDays) ? parentReport.completedDays : [];

  await db.delete(reviewHistories).where(eq(reviewHistories.reportId, args.reportId));
  await db.insert(reviewHistories).values({
    childId: args.childId,
    runId: args.runId,
    reportId: args.reportId,
    primaryIssue: primary.title || 'Current focus',
    secondaryIssue: secondary?.title || null,
    compareSummary: args.compareSummary || buildReportCompareSummary(args.report, null),
    parentNote: typeof parentReport.parentNote === 'string' ? parentReport.parentNote : null,
    completedDaysJson: completedDays,
    snapshotJson: buildReviewSnapshotJson(args.report),
    createdAt: args.createdAt ? parseDateValue(args.createdAt) : new Date(),
    updatedAt: new Date(),
  });

  const historyRows = await db
    .select()
    .from(reviewHistories)
    .where(eq(reviewHistories.childId, args.childId))
    .orderBy(reviewHistories.createdAt);
  const nextTrends = buildIssueTrendRecordsFromHistory(
    args.childId,
    historyRows.map((row) => ({
      ...row,
      createdAt: row.createdAt,
    }))
  );

  await db.delete(issueTrends).where(eq(issueTrends.childId, args.childId));
  if (nextTrends.length > 0) {
    await db.insert(issueTrends).values(
      nextTrends.map((trend) => ({
        childId: trend.childId,
        issueCode: trend.issueCode,
        issueTitle: trend.issueTitle,
        status: trend.status,
        trendDirection: trend.trendDirection,
        firstSeenReportId: trend.firstSeenReportId,
        latestReportId: trend.latestReportId,
        occurrenceCount: trend.occurrenceCount,
        summary: trend.summary,
        trendPointsJson: trend.trendPointsJson,
        updatedAt: new Date(trend.updatedAt),
      }))
    );
  }
}

function syncDemoReviewHistoryForReport(state: FamilyMockState, args: {
  childId: number;
  runId: number;
  report: StoredReport;
}) {
  const parentReport = extractParentReportJson(args.report);
  const primary = getPrimaryFindingDetails(args.report);
  const secondary = Array.isArray(parentReport.topFindings) ? parentReport.topFindings[1] : null;

  state.reviewHistories = state.reviewHistories.filter((item) => item.reportId !== args.report.id);
  state.reviewHistories.push({
    id: state.meta.nextIds.reviewHistory++,
    childId: args.childId,
    runId: args.runId,
    reportId: args.report.id,
    primaryIssue: primary.title || 'Current focus',
    secondaryIssue: secondary?.title || null,
    compareSummary:
      typeof args.report.deepResearchReportJson?.compareSnapshot === 'object' &&
      args.report.deepResearchReportJson?.compareSnapshot &&
      typeof (args.report.deepResearchReportJson.compareSnapshot as Record<string, unknown>).compareSummary ===
        'string'
        ? ((args.report.deepResearchReportJson.compareSnapshot as Record<string, unknown>)
            .compareSummary as string)
        : buildReportCompareSummary(args.report, null),
    parentNote: typeof parentReport.parentNote === 'string' ? parentReport.parentNote : null,
    completedDaysJson: Array.isArray(parentReport.completedDays) ? parentReport.completedDays : [],
    snapshotJson: buildReviewSnapshotJson(args.report),
    createdAt: args.report.createdAt,
    updatedAt: args.report.updatedAt,
  });

  const nextTrends = buildIssueTrendRecordsFromHistory(
    args.childId,
    state.reviewHistories.filter((item) => item.childId === args.childId)
  );
  state.issueTrends = state.issueTrends.filter((item) => item.childId !== args.childId);
  nextTrends.forEach((trend) => {
    state.issueTrends.push({
      ...trend,
      id: state.meta.nextIds.issueTrend++,
    });
  });
}

export async function listReportsForChild(userId: number, childId: number, limit = 5) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const childRuns = state.runs
      .filter((run) => run.userId === userId && run.childId === childId)
      .map((run) => ({
        run,
        report: getLatestDemoReportForRun(state, run.id),
      }))
      .filter((entry) => entry.report)
      .sort((left, right) =>
        (right.report?.createdAt || '').localeCompare(left.report?.createdAt || '')
      )
      .slice(0, limit);

    return childRuns.map((entry, index) => {
      const currentReport = entry.report as StoredReport;
      const previousReport = childRuns[index + 1]?.report || null;
      const reviewHistory =
        state.reviewHistories.find((item) => item.reportId === currentReport.id) || null;
      return {
        id: currentReport.id,
        runId: currentReport.runId,
        createdAt: currentReport.createdAt,
        summary:
          typeof currentReport.parentReportJson.summary === 'string'
            ? currentReport.parentReportJson.summary
            : null,
        topFinding: extractTopFinding(currentReport).title,
        compareSummary: reviewHistory?.compareSummary || buildReportCompareSummary(currentReport, previousReport),
        parentNote: reviewHistory?.parentNote || (typeof currentReport.parentReportJson.parentNote === 'string'
          ? currentReport.parentReportJson.parentNote
          : null),
        completedDays: reviewHistory?.completedDaysJson || (Array.isArray(currentReport.parentReportJson.completedDays)
          ? (currentReport.parentReportJson.completedDays as number[])
          : []),
        releaseStatus:
          typeof currentReport.parentReportJson.releaseStatus === 'string'
            ? currentReport.parentReportJson.releaseStatus
            : null,
        confidence:
          typeof currentReport.parentReportJson.confidence === 'number'
            ? currentReport.parentReportJson.confidence
            : null,
      };
    });
  }

  const rows = await db
    .select({
      report: reports,
      runId: analysisRuns.id,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .where(and(eq(analysisRuns.userId, userId), eq(analysisRuns.childId, childId)))
    .orderBy(desc(reports.createdAt))
    .limit(limit);
  const historyByReportId = rows.length
    ? new Map(
        (
          await db
            .select()
            .from(reviewHistories)
            .where(inArray(reviewHistories.reportId, rows.map((entry) => entry.report.id)))
        ).map((entry) => [entry.reportId, entry] as const)
      )
    : new Map<number, any>();
  const diagnosisByReportId = rows.length
    ? new Map(
        (
          await db
            .select()
            .from(reportDiagnosisOutlines)
            .where(inArray(reportDiagnosisOutlines.reportId, rows.map((entry) => entry.report.id)))
        ).map((entry) => [entry.reportId, entry] as const)
      )
    : new Map<number, any>();
  const reviewSnapshotByReportId = rows.length
    ? new Map(
        (
          await db
            .select()
            .from(reportReviewSnapshots)
            .where(inArray(reportReviewSnapshots.reportId, rows.map((entry) => entry.report.id)))
        ).map((entry) => [entry.reportId, entry] as const)
      )
    : new Map<number, any>();
  const compareByReportId = rows.length
    ? new Map(
        (
          await db
            .select()
            .from(reportCompareSnapshots)
            .where(inArray(reportCompareSnapshots.reportId, rows.map((entry) => entry.report.id)))
        ).map((entry) => [entry.reportId, entry] as const)
      )
    : new Map<number, any>();

  return rows.map((entry, index) => ({
    id: entry.report.id,
    runId: entry.runId,
    createdAt: entry.report.createdAt,
    summary:
      diagnosisByReportId.get(entry.report.id)?.summary ||
      (typeof (entry.report.parentReportJson as any)?.summary === 'string'
        ? ((entry.report.parentReportJson as any).summary as string)
        : null),
    topFinding:
      historyByReportId.get(entry.report.id)?.primaryIssue ||
      diagnosisByReportId.get(entry.report.id)?.primaryIssue ||
      extractTopFinding(entry.report).title,
    compareSummary:
      compareByReportId.get(entry.report.id)?.compareSummary ||
      historyByReportId.get(entry.report.id)?.compareSummary ||
      buildReportCompareSummary(entry.report, rows[index + 1]?.report || null),
    parentNote:
      historyByReportId.get(entry.report.id)?.parentNote ||
      (typeof (entry.report.parentReportJson as any)?.parentNote === 'string'
        ? ((entry.report.parentReportJson as any).parentNote as string)
        : null),
    completedDays:
      historyByReportId.get(entry.report.id)?.completedDaysJson ||
      (Array.isArray((entry.report.parentReportJson as any)?.completedDays)
        ? ((entry.report.parentReportJson as any).completedDays as number[])
        : []),
    releaseStatus:
      reviewSnapshotByReportId.get(entry.report.id)?.releaseStatus ||
      (typeof (entry.report.parentReportJson as any)?.releaseStatus === 'string'
        ? ((entry.report.parentReportJson as any).releaseStatus as string)
        : null),
    confidence:
      diagnosisByReportId.get(entry.report.id)?.confidence ??
      (typeof (entry.report.parentReportJson as any)?.confidence === 'number'
        ? ((entry.report.parentReportJson as any).confidence as number)
        : null),
  }));
}

export async function listReportsDashboardForUser(
  userId: number,
  limit = 24,
  _filters?: {
    childId?: number;
    status?: string;
    sourceType?: string;
  }
) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const userRuns = state.runs
      .filter((run) => run.userId === userId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return userRuns
      .map((run) => {
        const report = getLatestDemoReportForRun(state, run.id);
        if (!report) {
          return null;
        }
        const child = state.children.find((item) => item.id === run.childId) || null;
        return {
          id: report.id,
          runId: run.id,
          childId: run.childId,
          childNickname: child?.nickname || null,
          childGrade: child?.grade || null,
          createdAt: report.createdAt,
          releaseStatus:
            typeof report.parentReportJson.releaseStatus === 'string'
              ? report.parentReportJson.releaseStatus
              : null,
          sourceType: run.uploadId
            ? state.uploads.find((item) => item.id === run.uploadId)?.sourceType || null
            : null,
          summary:
            typeof report.parentReportJson.summary === 'string'
              ? report.parentReportJson.summary
              : null,
          topFinding: extractTopFinding(report).title,
          compareSummary:
            typeof report.deepResearchReportJson?.compareSnapshot === 'object' &&
            report.deepResearchReportJson?.compareSnapshot &&
            typeof (report.deepResearchReportJson.compareSnapshot as Record<string, unknown>)
              .compareSummary === 'string'
              ? ((report.deepResearchReportJson.compareSnapshot as Record<string, unknown>)
                  .compareSummary as string)
              : '',
          completedDays: Array.isArray(report.parentReportJson.completedDays)
            ? (report.parentReportJson.completedDays as number[])
            : [],
          confidence:
            typeof report.parentReportJson.confidence === 'number'
              ? (report.parentReportJson.confidence as number)
              : null,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .slice(0, limit)
      .map((entry, index, collection) => ({
        ...entry,
        compareSummary:
          entry.compareSummary ||
          buildReportCompareSummary(
            state.reports.find((report) => report.id === entry.id) as StoredReport,
            collection[index + 1]
              ? (state.reports.find((report) => report.id === collection[index + 1].id) as StoredReport)
              : null
          ),
      }));
  }

  const rows = await db
    .select({
      report: reports,
      runId: analysisRuns.id,
      childId: analysisRuns.childId,
      sourceType: uploads.sourceType,
      childNickname: children.nickname,
      childGrade: children.grade,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .leftJoin(uploads, eq(analysisRuns.uploadId, uploads.id))
    .where(eq(analysisRuns.userId, userId))
    .orderBy(desc(reports.createdAt))
    .limit(limit);

  const compareRows = rows.length
    ? await db
        .select()
        .from(reportCompareSnapshots)
        .where(inArray(reportCompareSnapshots.reportId, rows.map((entry) => entry.report.id)))
    : [];
  const diagnosisRows = rows.length
    ? await db
        .select()
        .from(reportDiagnosisOutlines)
        .where(inArray(reportDiagnosisOutlines.reportId, rows.map((entry) => entry.report.id)))
    : [];
  const reviewSnapshotRows = rows.length
    ? await db
        .select()
        .from(reportReviewSnapshots)
        .where(inArray(reportReviewSnapshots.reportId, rows.map((entry) => entry.report.id)))
    : [];
  const historyRows = rows.length
    ? await db
        .select()
        .from(reviewHistories)
        .where(inArray(reviewHistories.reportId, rows.map((entry) => entry.report.id)))
    : [];
  const compareByReportId = new Map(compareRows.map((entry) => [entry.reportId, entry] as const));
  const diagnosisByReportId = new Map(diagnosisRows.map((entry) => [entry.reportId, entry] as const));
  const reviewSnapshotByReportId = new Map(
    reviewSnapshotRows.map((entry) => [entry.reportId, entry] as const)
  );
  const historyByReportId = new Map(historyRows.map((entry) => [entry.reportId, entry] as const));

  return rows.map((entry, index) => ({
    id: entry.report.id,
    runId: entry.runId,
    childId: entry.childId,
    childNickname: entry.childNickname,
    childGrade: entry.childGrade || null,
    createdAt: entry.report.createdAt,
    releaseStatus:
      reviewSnapshotByReportId.get(entry.report.id)?.releaseStatus ||
      (typeof (entry.report.parentReportJson as any)?.releaseStatus === 'string'
        ? ((entry.report.parentReportJson as any).releaseStatus as string)
        : null),
    sourceType: entry.sourceType || null,
    summary:
      diagnosisByReportId.get(entry.report.id)?.summary ||
      (typeof (entry.report.parentReportJson as any)?.summary === 'string'
        ? ((entry.report.parentReportJson as any).summary as string)
        : null),
    topFinding:
      historyByReportId.get(entry.report.id)?.primaryIssue ||
      diagnosisByReportId.get(entry.report.id)?.primaryIssue ||
      extractTopFinding(entry.report).title,
    compareSummary:
      compareByReportId.get(entry.report.id)?.compareSummary ||
      historyByReportId.get(entry.report.id)?.compareSummary ||
      buildReportCompareSummary(entry.report, rows[index + 1]?.report || null),
    completedDays: Array.isArray((entry.report.parentReportJson as any)?.completedDays)
      ? ((entry.report.parentReportJson as any).completedDays as number[])
      : [],
    confidence:
      diagnosisByReportId.get(entry.report.id)?.confidence ??
      (typeof (entry.report.parentReportJson as any)?.confidence === 'number'
        ? ((entry.report.parentReportJson as any).confidence as number)
        : null),
  }));
}

export async function listReportsForUser(userId: number, limit = 24) {
  return listReportsDashboardForUser(userId, limit);
}

export async function listShareLinksForReport(userId: number, reportId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const report = state.reports.find((item) => item.id === reportId);
    if (!report) {
      return [];
    }
    const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
    if (!run) {
      return [];
    }
    return state.shareLinks
      .filter((item) => item.reportId === reportId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  const rows = await db
    .select({ shareLink: shareLinks })
    .from(shareLinks)
    .innerJoin(reports, eq(shareLinks.reportId, reports.id))
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .where(and(eq(analysisRuns.userId, userId), eq(reports.id, reportId)))
    .orderBy(desc(shareLinks.createdAt));

  return rows.map((row) => row.shareLink);
}

export async function listRecentShareEventsForUser(userId: number, limit = 6) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    return state.shareLinks
      .filter((link) => {
        const report = state.reports.find((item) => item.id === link.reportId);
        if (!report) {
          return false;
        }
        const run = state.runs.find((item) => item.id === report.runId);
        return run?.userId === userId;
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit)
      .map((link) => {
        const report = state.reports.find((item) => item.id === link.reportId) || null;
        const run = report ? state.runs.find((item) => item.id === report.runId) : null;
        const child = run ? state.children.find((item) => item.id === run.childId) : null;
        return {
          id: link.id,
          reportId: link.reportId,
          token: link.token,
          createdAt: link.createdAt,
          childNickname: child?.nickname || null,
          topFinding: report ? extractTopFinding(report).title : null,
        };
      });
  }

  const rows = await db
    .select({
      shareLink: shareLinks,
      report: reports,
      childNickname: children.nickname,
    })
    .from(shareLinks)
    .innerJoin(reports, eq(shareLinks.reportId, reports.id))
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .where(eq(analysisRuns.userId, userId))
    .orderBy(desc(shareLinks.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.shareLink.id,
    reportId: row.shareLink.reportId,
    token: row.shareLink.token,
    createdAt: row.shareLink.createdAt,
    childNickname: row.childNickname,
    topFinding: extractTopFinding(row.report).title,
  }));
}

export async function createShareLinkForReport(userId: number, reportId: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = randomUUID().replace(/-/g, '');

  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => {
      const report = state.reports.find((item) => item.id === reportId);
      if (!report) {
        return null;
      }
      const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
      if (!run) {
        return null;
      }

      const shareLink: StoredShareLink = {
        id: state.meta.nextIds.shareLink++,
        reportId,
        token,
        role: 'tutor',
        createdAt: nowIso(),
        expiresAt: expiresAt.toISOString(),
        revokedAt: null,
      };
      state.shareLinks.unshift(shareLink);
      return shareLink;
    });
  }

  const report = await getReportForUser(userId, reportId);
  if (!report) {
    return null;
  }

  const [createdLink] = await db
    .insert(shareLinks)
    .values({
      reportId,
      token,
      role: 'tutor',
      expiresAt,
    })
    .returning();

  return createdLink;
}

export async function revokeShareLinkForReport(userId: number, reportId: number, token: string) {
  if (FAMILY_EDU_DEMO_MODE) {
    return updateFamilyMockState((state) => {
      const report = state.reports.find((item) => item.id === reportId);
      if (!report) {
        return null;
      }
      const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
      if (!run) {
        return null;
      }
      const shareLink = state.shareLinks.find(
        (item) => item.reportId === reportId && item.token === token
      );
      if (!shareLink) {
        return null;
      }
      shareLink.revokedAt = nowIso();
      return shareLink;
    });
  }

  const report = await getReportForUser(userId, reportId);
  if (!report) {
    return null;
  }

  const [updatedLink] = await db
    .update(shareLinks)
    .set({ revokedAt: new Date() })
    .where(and(eq(shareLinks.reportId, reportId), eq(shareLinks.token, token)))
    .returning();

  return updatedLink || null;
}

export async function getSharedReportByToken(token: string) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const shareLink = state.shareLinks.find((item) => item.token === token) || null;
    if (!shareLink) {
      return { status: 'missing' as const, report: null, shareLink: null };
    }
    if (shareLink.revokedAt) {
      return { status: 'revoked' as const, report: null, shareLink };
    }
    if (new Date(shareLink.expiresAt) < new Date()) {
      return { status: 'expired' as const, report: null, shareLink };
    }

    const report = state.reports.find((item) => item.id === shareLink.reportId) || null;
    if (!report) {
      return { status: 'missing' as const, report: null, shareLink };
    }
    const run = state.runs.find((item) => item.id === report.runId) || null;
    const child = run ? state.children.find((item) => item.id === run.childId) || null : null;

    return {
      status: 'active' as const,
      shareLink,
      report: {
        id: report.id,
        tutorReportJson: report.tutorReportJson,
        child: child
          ? {
              nickname: child.nickname,
              grade: child.grade,
              curriculum: child.curriculum,
            }
          : null,
      },
    };
  }

  const rows = await db
    .select({
      shareLink: shareLinks,
      report: reports,
      run: analysisRuns,
      child: children,
    })
    .from(shareLinks)
    .innerJoin(reports, eq(shareLinks.reportId, reports.id))
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .where(eq(shareLinks.token, token))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return { status: 'missing' as const, report: null, shareLink: null };
  }
  if (row.shareLink.revokedAt) {
    return { status: 'revoked' as const, report: null, shareLink: row.shareLink };
  }
  if (new Date(row.shareLink.expiresAt) < new Date()) {
    return { status: 'expired' as const, report: null, shareLink: row.shareLink };
  }

  return {
    status: 'active' as const,
    shareLink: row.shareLink,
    report: {
      id: row.report.id,
      tutorReportJson: row.report.tutorReportJson,
      child: {
        nickname: row.child.nickname,
        grade: row.child.grade,
        curriculum: row.child.curriculum,
      },
    },
  };
}

export async function listActivityForUser(userId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    return state.activityLogs
      .filter((item) => item.userId === userId)
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        action: item.action,
        timestamp: item.timestamp,
        ipAddress: '127.0.0.1',
        userName: 'Demo Parent',
      }));
  }

  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
    })
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function listChatThreadsForUser(
  userId: number,
  options?: {
    childId?: number;
    limit?: number;
  }
) {
  const limit = options?.limit ?? 5;

  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const threadRows = state.chatThreads
      .filter((thread) => thread.userId === userId)
      .filter((thread) => (options?.childId ? thread.childId === options.childId : true))
      .sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt))
      .slice(0, limit);

    return threadRows.map((thread) => {
      const latestMessage =
        state.chatMessages
          .filter((message) => message.threadId === thread.id)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] || null;

      return {
        ...thread,
        latestMessageBody: latestMessage?.body || null,
        latestMessageRole: latestMessage?.role || null,
      };
    });
  }

  const threadRows = await db
    .select()
    .from(chatThreads)
    .where(
      options?.childId
        ? and(eq(chatThreads.userId, userId), eq(chatThreads.childId, options.childId))
        : eq(chatThreads.userId, userId)
    )
    .orderBy(desc(chatThreads.lastMessageAt))
    .limit(limit);

  if (threadRows.length === 0) {
    return [];
  }

  const messageRows = await db
    .select()
    .from(chatMessages)
    .where(inArray(chatMessages.threadId, threadRows.map((thread) => thread.id)))
    .orderBy(desc(chatMessages.createdAt));

  const latestMessageByThreadId = new Map<number, (typeof messageRows)[number]>();
  for (const message of messageRows) {
    if (!latestMessageByThreadId.has(message.threadId)) {
      latestMessageByThreadId.set(message.threadId, message);
    }
  }

  return threadRows.map((thread) => {
    const latestMessage = latestMessageByThreadId.get(thread.id);
    return {
      ...thread,
      latestMessageBody: latestMessage?.body || null,
      latestMessageRole: latestMessage?.role || null,
    };
  });
}
