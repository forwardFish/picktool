import 'server-only';

import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  analysisRuns,
  children,
  errorLabels,
  itemErrors,
  pages,
  problemItems,
  reports,
  uploads,
} from '@/lib/db/schema';
import {
  readFamilyMockState,
  updateFamilyMockState,
} from '@/lib/family/mock-store';
import { isFamilyEduDemoMode } from '@/lib/family/config';

type Reviewer = {
  id: number;
  email: string;
  role?: string | null;
};

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();

export type AdminReviewAuditEntry = {
  action: 'approved' | 'request_more_photos' | 'manual_text_adjust';
  note: string | null;
  fields?: string[];
  reviewerId: number;
  reviewerEmail: string;
  reviewerRole: string | null;
  timestamp: string;
};

export type AdminReviewQueueItem = {
  runId: number;
  reportId: number | null;
  childId: number;
  childNickname: string;
  sourceType: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  overallConfidence: number | null;
  needsReviewReason: string | null;
  pageCount: number;
  qualityIssueCount: number;
  topFinding: string;
  reviewBanner: string | null;
};

export type AdminReviewExtractionItem = {
  id: number;
  pageId: number;
  pageNo: number;
  problemNo: string;
  previewLabel: string;
  problemText: string;
  studentWork: string;
  teacherMark: string;
  itemConfidence: number | null;
  rationale: string;
  labels: Array<{
    code: string;
    displayName: string;
    severity: string;
    confidence: number | null;
    role: 'primary' | 'secondary';
  }>;
};

export type AdminReviewDetail = {
  queueItem: AdminReviewQueueItem;
  run: {
    id: number;
    status: string;
    stage: string;
    progressPercent: number;
    statusMessage: string | null;
    overallConfidence: number | null;
    needsReviewReason: string | null;
    createdAt: string;
    updatedAt: string;
    reportId: number | null;
  };
  child: {
    id: number;
    nickname: string;
    grade: string;
    curriculum: string;
  };
  upload: {
    id: number;
    sourceType: string;
    notes: string | null;
    totalPages: number;
  };
  pages: Array<{
    id: number;
    pageNumber: number;
    previewLabel: string;
    qualityScore: number;
    qualityFlags: {
      blurry: boolean;
      rotated: boolean;
      dark: boolean;
      lowContrast: boolean;
    };
  }>;
  report: {
    id: number;
    parentReportJson: Record<string, unknown>;
    studentReportJson: Record<string, unknown>;
    tutorReportJson: Record<string, unknown>;
  } | null;
  extractionItems: AdminReviewExtractionItem[];
  auditTrail: AdminReviewAuditEntry[];
};

type AdminReviewQueueDbRow = {
  runId: number;
  childId: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  overallConfidence: number | null;
  needsReviewReason: string | null;
  uploadId: number;
  totalPages: number;
  sourceType: string;
  childNickname: string;
  reportId: number | null;
  parentReportJson: Record<string, unknown> | null;
};

type AdminReviewPageRow = {
  uploadId: number;
  isBlurry: boolean;
  isRotated: boolean;
  isDark: boolean;
  qualityFlags?: Record<string, unknown>;
};

type AdminReviewDetailRow = {
  runId: number;
  childId: number;
  childNickname: string;
  childGrade: string;
  childCurriculum: string;
  status: string;
  stage: string;
  progressPercent: number;
  statusMessage: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  overallConfidence: number | null;
  needsReviewReason: string | null;
  uploadId: number;
  totalPages: number;
  sourceType: string;
  notes: string | null;
  reportId: number | null;
  parentReportJson: Record<string, unknown> | null;
  studentReportJson: Record<string, unknown> | null;
  tutorReportJson: Record<string, unknown> | null;
};

type AdminReviewDetailPageRow = {
  id: number;
  pageNumber: number;
  previewLabel: string;
  qualityScore: number;
  qualityFlags: Record<string, unknown> | null;
  isBlurry: boolean;
  isRotated: boolean;
  isDark: boolean;
};

type AdminReviewDetailItemRow = {
  id: number;
  pageId: number;
  problemNo: string;
  problemText: string | null;
  studentWork: string | null;
  teacherMark: string;
  itemConfidence: number | null;
};

type AdminReviewDetailItemErrorRow = {
  itemId: number;
  labelId: number;
  severity: string;
  rationale: string | null;
  confidence: number | null;
  isPrimary: boolean;
};

type AdminReviewLabelRow = {
  id: number;
  code: string;
  displayName: string;
};

function nowIso() {
  return new Date().toISOString();
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return nowIso();
  }
  return value instanceof Date ? value.toISOString() : value;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function asAuditTrail(value: unknown): AdminReviewAuditEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      const record = asRecord(entry);
      const action: AdminReviewAuditEntry['action'] =
        record.action === 'approved' ||
        record.action === 'request_more_photos' ||
        record.action === 'manual_text_adjust'
          ? record.action
          : 'manual_text_adjust';

      return {
        action,
        note: asString(record.note),
        fields: Array.isArray(record.fields)
          ? record.fields.filter((field): field is string => typeof field === 'string')
          : undefined,
        reviewerId:
          typeof record.reviewerId === 'number' ? record.reviewerId : 0,
        reviewerEmail: asString(record.reviewerEmail) || 'unknown@review.local',
        reviewerRole: asString(record.reviewerRole),
        timestamp: asString(record.timestamp) || nowIso(),
      };
    })
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function getAuditTrailFromReport(reportJson: Record<string, unknown>) {
  const adminReview = asRecord(reportJson.adminReview);
  return asAuditTrail(adminReview.auditTrail);
}

function withAuditTrail(
  reportJson: Record<string, unknown>,
  entry: AdminReviewAuditEntry
) {
  const adminReview = asRecord(reportJson.adminReview);
  const auditTrail = getAuditTrailFromReport(reportJson);

  return {
    ...reportJson,
    adminReview: {
      ...adminReview,
      lastAction: entry.action,
      lastNote: entry.note,
      lastReviewedAt: entry.timestamp,
      lastReviewerEmail: entry.reviewerEmail,
      lastReviewerRole: entry.reviewerRole,
      auditTrail: [entry, ...auditTrail].slice(0, 12),
    },
  };
}

function buildAuditEntry(
  action: AdminReviewAuditEntry['action'],
  reviewer: Reviewer,
  note: string | null,
  fields?: string[]
): AdminReviewAuditEntry {
  return {
    action,
    note,
    fields,
    reviewerId: reviewer.id,
    reviewerEmail: reviewer.email,
    reviewerRole: reviewer.role || null,
    timestamp: nowIso(),
  };
}

function getTopFinding(parentReportJson: Record<string, unknown>) {
  const topFindings = Array.isArray(parentReportJson.topFindings)
    ? (parentReportJson.topFindings as Array<Record<string, unknown>>)
    : [];

  return asString(topFindings[0]?.title) || 'Draft report available';
}

function countQualityIssues(
  pageRecords: Array<{
    isBlurry?: boolean;
    isRotated?: boolean;
    isDark?: boolean;
    qualityFlags?: Record<string, unknown>;
  }>
) {
  return pageRecords.filter((page) => {
    const flags = asRecord(page.qualityFlags);
    return Boolean(
      page.isBlurry ||
        page.isRotated ||
        page.isDark ||
        flags.blurry ||
        flags.rotated ||
        flags.dark ||
        flags.lowContrast
    );
  }).length;
}

function buildQueueItem(args: {
  run: {
    id: number;
    childId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    overallConfidence: number | null;
    needsReviewReason: string | null;
  };
  childNickname: string;
  sourceType: string;
  pageCount: number;
  pageRecords: Array<{
    isBlurry?: boolean;
    isRotated?: boolean;
    isDark?: boolean;
    qualityFlags?: Record<string, unknown>;
  }>;
  reportId: number | null;
  parentReportJson: Record<string, unknown> | null;
}) {
  const parentReportJson = args.parentReportJson || {};

  return {
    runId: args.run.id,
    reportId: args.reportId,
    childId: args.run.childId,
    childNickname: args.childNickname,
    sourceType: args.sourceType,
    createdAt: args.run.createdAt,
    updatedAt: args.run.updatedAt,
    status: args.run.status,
    overallConfidence: args.run.overallConfidence,
    needsReviewReason: args.run.needsReviewReason,
    pageCount: args.pageCount,
    qualityIssueCount: countQualityIssues(args.pageRecords),
    topFinding: getTopFinding(parentReportJson),
    reviewBanner: asString(parentReportJson.reviewBanner),
  } satisfies AdminReviewQueueItem;
}

function buildExtractionItems(args: {
  itemRows: Array<{
    id: number;
    pageId: number;
    problemNo: string;
    problemText: string | null;
    studentWork: string | null;
    teacherMark: string;
    itemConfidence: number | null;
  }>;
  pageRows: Array<{
    id: number;
    pageNumber: number;
    previewLabel: string;
  }>;
  itemErrorRows: Array<{
    itemId: number;
    labelId: number;
    severity: string;
    rationale: string | null;
    confidence: number | null;
    isPrimary: boolean;
  }>;
  labelRows: Array<{
    id: number;
    code: string;
    displayName: string;
  }>;
}) {
  const pageMap = new Map(args.pageRows.map((page) => [page.id, page] as const));
  const labelMap = new Map(args.labelRows.map((label) => [label.id, label] as const));
  const itemErrorsByItemId = new Map<number, typeof args.itemErrorRows>();

  for (const itemError of args.itemErrorRows) {
    const bucket = itemErrorsByItemId.get(itemError.itemId) || [];
    bucket.push(itemError);
    itemErrorsByItemId.set(itemError.itemId, bucket);
  }

  return args.itemRows
    .map((item) => {
      const page = pageMap.get(item.pageId);
      const linkedErrors = itemErrorsByItemId.get(item.id) || [];

      return {
        id: item.id,
        pageId: item.pageId,
        pageNo: page?.pageNumber || 0,
        problemNo: item.problemNo,
        previewLabel: page?.previewLabel || 'Source page',
        problemText: item.problemText || 'Problem text unavailable.',
        studentWork: item.studentWork || 'Student work unavailable.',
        teacherMark: item.teacherMark,
        itemConfidence: item.itemConfidence,
        rationale:
          linkedErrors.map((entry) => entry.rationale).find(Boolean) ||
          'Use manual review to confirm the diagnosis wording before release.',
        labels: linkedErrors.map((entry) => {
          const label = labelMap.get(entry.labelId);
          return {
            code: label?.code || 'unknown',
            displayName: label?.displayName || 'Unknown label',
            severity: entry.severity,
            confidence: entry.confidence,
            role: entry.isPrimary ? ('primary' as const) : ('secondary' as const),
          };
        }),
      } satisfies AdminReviewExtractionItem;
    })
    .sort((left, right) => {
      if (left.pageNo !== right.pageNo) {
        return left.pageNo - right.pageNo;
      }
      return left.problemNo.localeCompare(right.problemNo, undefined, { numeric: true });
    });
}

function updateReviewReportCopies(
  reportJson: Record<string, unknown>,
  patch: Record<string, unknown>,
  entry: AdminReviewAuditEntry
) {
  return withAuditTrail(
    {
      ...reportJson,
      ...patch,
    },
    entry
  );
}

export async function listAdminReviewQueue() {
  const demoState = FAMILY_EDU_DEMO_MODE
    ? await readFamilyMockState().catch(() => null)
    : null;

  if (demoState) {
    return demoState.runs
      .filter((run) => run.status === 'needs_review')
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((run) => {
        const child = demoState.children.find((item) => item.id === run.childId);
        const upload = demoState.uploads.find((item) => item.id === run.uploadId);
        const report = demoState.reports.find((item) => item.runId === run.id) || null;
        const pageRecords = demoState.pages.filter((item) => item.uploadId === run.uploadId);

        return buildQueueItem({
          run: {
            id: run.id,
            childId: run.childId,
            status: run.status,
            createdAt: run.createdAt,
            updatedAt: run.updatedAt,
            overallConfidence: run.overallConfidence,
            needsReviewReason: run.needsReviewReason,
          },
          childNickname: child?.nickname || 'Unknown child',
          sourceType: upload?.sourceType || 'upload',
          pageCount: upload?.totalPages || pageRecords.length,
          pageRecords,
          reportId: report?.id ?? null,
          parentReportJson: report?.parentReportJson || null,
        });
      });
  }

  const runRows: AdminReviewQueueDbRow[] = await db
    .select({
      runId: analysisRuns.id,
      childId: analysisRuns.childId,
      status: analysisRuns.status,
      createdAt: analysisRuns.createdAt,
      updatedAt: analysisRuns.updatedAt,
      overallConfidence: analysisRuns.overallConfidence,
      needsReviewReason: analysisRuns.needsReviewReason,
      uploadId: uploads.id,
      totalPages: uploads.totalPages,
      sourceType: uploads.sourceType,
      childNickname: children.nickname,
      reportId: reports.id,
      parentReportJson: reports.parentReportJson,
    })
    .from(analysisRuns)
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .innerJoin(uploads, eq(analysisRuns.uploadId, uploads.id))
    .leftJoin(reports, eq(reports.runId, analysisRuns.id))
    .where(eq(analysisRuns.status, 'needs_review'))
    .orderBy(desc(analysisRuns.createdAt));

  const uploadIds = Array.from(new Set(runRows.map((row: AdminReviewQueueDbRow) => row.uploadId)));
  const pageRows: AdminReviewPageRow[] =
    uploadIds.length > 0
      ? await db
          .select({
            uploadId: pages.uploadId,
            isBlurry: pages.isBlurry,
            isRotated: pages.isRotated,
            isDark: pages.isDark,
            qualityFlags: pages.qualityFlags,
          })
          .from(pages)
          .where(inArray(pages.uploadId, uploadIds))
      : [];

  return runRows.map((row: AdminReviewQueueDbRow) => {
    const relatedPages = pageRows
      .filter((page: AdminReviewPageRow) => page.uploadId === row.uploadId)
      .map((page: AdminReviewPageRow) => ({
        ...page,
        qualityFlags: page.qualityFlags || undefined,
      }));

    return buildQueueItem({
      run: {
        id: row.runId,
        childId: row.childId,
        status: row.status,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        overallConfidence: row.overallConfidence,
        needsReviewReason: row.needsReviewReason,
      },
      childNickname: row.childNickname,
      sourceType: row.sourceType,
      pageCount: row.totalPages,
      pageRecords: relatedPages,
      reportId: row.reportId ?? null,
      parentReportJson: row.parentReportJson || null,
    });
  });
}

export async function getAdminReviewDetail(runId: number): Promise<AdminReviewDetail | null> {
  const demoState = FAMILY_EDU_DEMO_MODE
    ? await readFamilyMockState().catch(() => null)
    : null;

  if (demoState) {
    const run = demoState.runs.find((item) => item.id === runId);
    if (!run) {
      return null;
    }

    const child = demoState.children.find((item) => item.id === run.childId);
    const upload = demoState.uploads.find((item) => item.id === run.uploadId);
    if (!child || !upload) {
      return null;
    }

    const report = demoState.reports.find((item) => item.runId === run.id) || null;
    const pageRows = demoState.pages
      .filter((item) => item.uploadId === run.uploadId)
      .sort((left, right) => left.pageNumber - right.pageNumber);
    const itemRows = demoState.problemItems.filter((item) => item.runId === run.id);
    const itemIds = itemRows.map((item) => item.id);
    const itemErrorRows = demoState.itemErrors.filter((item) => itemIds.includes(item.itemId));
    const labelIds = Array.from(new Set(itemErrorRows.map((item) => item.labelId)));
    const labelRows = demoState.errorLabels.filter((label) => labelIds.includes(label.id));
    const queueItem = buildQueueItem({
      run: {
        id: run.id,
        childId: run.childId,
        status: run.status,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        overallConfidence: run.overallConfidence,
        needsReviewReason: run.needsReviewReason,
      },
      childNickname: child.nickname,
      sourceType: upload.sourceType,
      pageCount: upload.totalPages,
      pageRecords: pageRows,
      reportId: report?.id ?? null,
      parentReportJson: report?.parentReportJson || null,
    });

    return {
      queueItem,
      run: {
        id: run.id,
        status: run.status,
        stage: run.stage,
        progressPercent: run.progressPercent,
        statusMessage: run.statusMessage,
        overallConfidence: run.overallConfidence,
        needsReviewReason: run.needsReviewReason,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        reportId: report?.id ?? null,
      },
      child: {
        id: child.id,
        nickname: child.nickname,
        grade: child.grade,
        curriculum: child.curriculum,
      },
      upload: {
        id: upload.id,
        sourceType: upload.sourceType,
        notes: upload.notes,
        totalPages: upload.totalPages,
      },
      pages: pageRows.map((page) => ({
        id: page.id,
        pageNumber: page.pageNumber,
        previewLabel: page.previewLabel,
        qualityScore: page.qualityScore,
        qualityFlags: {
          blurry: page.qualityFlags.blurry,
          rotated: page.qualityFlags.rotated,
          dark: page.qualityFlags.dark,
          lowContrast: page.qualityFlags.lowContrast,
        },
      })),
      report: report
        ? {
            id: report.id,
            parentReportJson: report.parentReportJson,
            studentReportJson: report.studentReportJson,
            tutorReportJson: report.tutorReportJson,
          }
        : null,
      extractionItems: buildExtractionItems({
        itemRows: itemRows.map((item) => ({
          id: item.id,
          pageId: item.pageId,
          problemNo: item.problemNo,
          problemText: item.problemText,
          studentWork: item.studentWork,
          teacherMark: item.teacherMark,
          itemConfidence: item.itemConfidence,
        })),
        pageRows: pageRows.map((page) => ({
          id: page.id,
          pageNumber: page.pageNumber,
          previewLabel: page.previewLabel,
        })),
        itemErrorRows: itemErrorRows.map((item) => ({
          itemId: item.itemId,
          labelId: item.labelId,
          severity: item.severity,
          rationale: item.rationale,
          confidence: item.confidence,
          isPrimary: item.isPrimary,
        })),
        labelRows: labelRows.map((label) => ({
          id: label.id,
          code: label.code,
          displayName: label.displayName,
        })),
      }),
      auditTrail: report ? getAuditTrailFromReport(report.parentReportJson) : [],
    };
  }

  const [row]: AdminReviewDetailRow[] = await db
    .select({
      runId: analysisRuns.id,
      status: analysisRuns.status,
      stage: analysisRuns.stage,
      progressPercent: analysisRuns.progressPercent,
      statusMessage: analysisRuns.statusMessage,
      overallConfidence: analysisRuns.overallConfidence,
      needsReviewReason: analysisRuns.needsReviewReason,
      createdAt: analysisRuns.createdAt,
      updatedAt: analysisRuns.updatedAt,
      childId: children.id,
      childNickname: children.nickname,
      childGrade: children.grade,
      childCurriculum: children.curriculum,
      uploadId: uploads.id,
      sourceType: uploads.sourceType,
      notes: uploads.notes,
      totalPages: uploads.totalPages,
      reportId: reports.id,
      parentReportJson: reports.parentReportJson,
      studentReportJson: reports.studentReportJson,
      tutorReportJson: reports.tutorReportJson,
    })
    .from(analysisRuns)
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .innerJoin(uploads, eq(analysisRuns.uploadId, uploads.id))
    .leftJoin(reports, eq(reports.runId, analysisRuns.id))
    .where(eq(analysisRuns.id, runId))
    .limit(1);

  if (!row) {
    return null;
  }

  const pageRows: AdminReviewDetailPageRow[] = await db
    .select({
      id: pages.id,
      pageNumber: pages.pageNumber,
      previewLabel: pages.previewLabel,
      qualityScore: pages.qualityScore,
      qualityFlags: pages.qualityFlags,
      isBlurry: pages.isBlurry,
      isRotated: pages.isRotated,
      isDark: pages.isDark,
    })
    .from(pages)
    .where(eq(pages.uploadId, row.uploadId))
    .orderBy(pages.pageNumber);

  const itemRows: AdminReviewDetailItemRow[] = await db
    .select({
      id: problemItems.id,
      pageId: problemItems.pageId,
      problemNo: problemItems.problemNo,
      problemText: problemItems.problemText,
      studentWork: problemItems.studentWork,
      teacherMark: problemItems.teacherMark,
      itemConfidence: problemItems.itemConfidence,
    })
    .from(problemItems)
    .where(eq(problemItems.runId, runId));

  const itemIds = itemRows.map((item: AdminReviewDetailItemRow) => item.id);
  const itemErrorRows: AdminReviewDetailItemErrorRow[] =
    itemIds.length > 0
      ? await db
          .select({
            itemId: itemErrors.itemId,
            labelId: itemErrors.labelId,
            severity: itemErrors.severity,
            rationale: itemErrors.rationale,
            confidence: itemErrors.confidence,
            isPrimary: itemErrors.isPrimary,
          })
          .from(itemErrors)
          .where(inArray(itemErrors.itemId, itemIds))
      : [];
  const labelIds = Array.from(
    new Set(itemErrorRows.map((item: AdminReviewDetailItemErrorRow) => item.labelId))
  );
  const labelRows: AdminReviewLabelRow[] =
    labelIds.length > 0
      ? await db
          .select({
            id: errorLabels.id,
            code: errorLabels.code,
            displayName: errorLabels.displayName,
          })
          .from(errorLabels)
          .where(inArray(errorLabels.id, labelIds))
      : [];

  const queueItem = buildQueueItem({
    run: {
      id: row.runId,
      childId: row.childId,
      status: row.status,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
      overallConfidence: row.overallConfidence,
      needsReviewReason: row.needsReviewReason,
    },
    childNickname: row.childNickname,
    sourceType: row.sourceType,
    pageCount: row.totalPages,
    pageRecords: pageRows.map((page: AdminReviewDetailPageRow) => ({
      isBlurry: page.isBlurry,
      isRotated: page.isRotated,
      isDark: page.isDark,
      qualityFlags: asRecord(page.qualityFlags),
    })),
    reportId: row.reportId ?? null,
    parentReportJson: row.parentReportJson || null,
  });

  return {
    queueItem,
    run: {
      id: row.runId,
      status: row.status,
      stage: row.stage,
      progressPercent: row.progressPercent,
      statusMessage: row.statusMessage,
      overallConfidence: row.overallConfidence,
      needsReviewReason: row.needsReviewReason,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
      reportId: row.reportId ?? null,
    },
    child: {
      id: row.childId,
      nickname: row.childNickname,
      grade: row.childGrade,
      curriculum: row.childCurriculum,
    },
    upload: {
      id: row.uploadId,
      sourceType: row.sourceType,
      notes: row.notes,
      totalPages: row.totalPages,
    },
    pages: pageRows.map((page: AdminReviewDetailPageRow) => {
      const flags = asRecord(page.qualityFlags);
      return {
        id: page.id,
        pageNumber: page.pageNumber,
        previewLabel: page.previewLabel,
        qualityScore: page.qualityScore,
        qualityFlags: {
          blurry: Boolean(flags.blurry),
          rotated: Boolean(flags.rotated),
          dark: Boolean(flags.dark),
          lowContrast: Boolean(flags.lowContrast),
        },
      };
    }),
    report:
      row.reportId && row.parentReportJson && row.studentReportJson && row.tutorReportJson
        ? {
            id: row.reportId,
            parentReportJson: row.parentReportJson,
            studentReportJson: row.studentReportJson,
            tutorReportJson: row.tutorReportJson,
          }
        : null,
    extractionItems: buildExtractionItems({
      itemRows,
      pageRows: pageRows.map((page: AdminReviewDetailPageRow) => ({
        id: page.id,
        pageNumber: page.pageNumber,
        previewLabel: page.previewLabel,
      })),
      itemErrorRows,
      labelRows,
    }),
    auditTrail: row.parentReportJson ? getAuditTrailFromReport(row.parentReportJson) : [],
  };
}

export async function approveAdminReview(runId: number, reviewer: Reviewer) {
  const detail = await getAdminReviewDetail(runId);
  if (!detail || !detail.report) {
    return null;
  }

  const entry = buildAuditEntry(
    'approved',
    reviewer,
    'Manual review approved. The report is ready for parent reading.'
  );
  const nextParentReport = updateReviewReportCopies(
    detail.report.parentReportJson,
    {
      releaseStatus: 'ready',
      reviewReason: null,
      releasedWithReviewBanner: false,
      reviewBanner: null,
    },
    entry
  );
  const nextTutorReport = {
    ...detail.report.tutorReportJson,
    releaseStatus: 'ready',
    reviewReason: null,
    notes: 'Manual review approved. This report is ready for parent and tutor workflows.',
  };

  const demoState = FAMILY_EDU_DEMO_MODE
    ? await readFamilyMockState().catch(() => null)
    : null;
  if (demoState) {
    await updateFamilyMockState((state) => {
      const run = state.runs.find((item) => item.id === runId);
      const report = state.reports.find((item) => item.runId === runId);
      if (!run || !report) {
        return null;
      }

      run.status = 'done';
      run.stage = 'done';
      run.progressPercent = 100;
      run.statusMessage = 'Admin review approved. Report is ready for parent reading.';
      run.needsReviewReason = null;
      run.finishedAt = run.finishedAt || nowIso();
      run.updatedAt = nowIso();

      report.parentReportJson = nextParentReport;
      report.tutorReportJson = nextTutorReport;
      report.updatedAt = nowIso();

      return true;
    });
    return getAdminReviewDetail(runId);
  }

  await db
    .update(analysisRuns)
    .set({
      status: 'done',
      stage: 'done',
      progressPercent: 100,
      statusMessage: 'Admin review approved. Report is ready for parent reading.',
      needsReviewReason: null,
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(analysisRuns.id, runId));

  await db
    .update(reports)
    .set({
      parentReportJson: nextParentReport,
      tutorReportJson: nextTutorReport,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, detail.report.id));

  return getAdminReviewDetail(runId);
}

export async function requestMorePhotosForAdminReview(
  runId: number,
  reviewer: Reviewer,
  message: string
) {
  const detail = await getAdminReviewDetail(runId);
  if (!detail || !detail.report) {
    return null;
  }

  const trimmedMessage = message.trim();
  const entry = buildAuditEntry('request_more_photos', reviewer, trimmedMessage);
  const nextParentReport = updateReviewReportCopies(
    detail.report.parentReportJson,
    {
      releaseStatus: 'needs_review',
      reviewReason: trimmedMessage,
      releasedWithReviewBanner: true,
      reviewBanner: `Draft report only: ${trimmedMessage}`,
    },
    entry
  );
  const nextTutorReport = {
    ...detail.report.tutorReportJson,
    releaseStatus: 'needs_review',
    reviewReason: trimmedMessage,
    notes: 'More photos were requested before this report can be released.',
  };

  const demoState = FAMILY_EDU_DEMO_MODE
    ? await readFamilyMockState().catch(() => null)
    : null;
  if (demoState) {
    await updateFamilyMockState((state) => {
      const run = state.runs.find((item) => item.id === runId);
      const report = state.reports.find((item) => item.runId === runId);
      if (!run || !report) {
        return null;
      }

      run.status = 'needs_review';
      run.stage = 'review';
      run.progressPercent = 100;
      run.statusMessage = 'More photos requested before the diagnosis can be released.';
      run.needsReviewReason = trimmedMessage;
      run.updatedAt = nowIso();

      report.parentReportJson = nextParentReport;
      report.tutorReportJson = nextTutorReport;
      report.updatedAt = nowIso();

      return true;
    });
    return getAdminReviewDetail(runId);
  }

  await db
    .update(analysisRuns)
    .set({
      status: 'needs_review',
      stage: 'review',
      progressPercent: 100,
      statusMessage: 'More photos requested before the diagnosis can be released.',
      needsReviewReason: trimmedMessage,
      updatedAt: new Date(),
    })
    .where(eq(analysisRuns.id, runId));

  await db
    .update(reports)
    .set({
      parentReportJson: nextParentReport,
      tutorReportJson: nextTutorReport,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, detail.report.id));

  return getAdminReviewDetail(runId);
}

export async function updateAdminReviewCopy(
  runId: number,
  reviewer: Reviewer,
  input: {
    summary?: string;
    doThisWeek?: string;
    notNow?: string;
    reviewBanner?: string;
  }
) {
  const detail = await getAdminReviewDetail(runId);
  if (!detail || !detail.report) {
    return null;
  }

  const patchEntries = Object.entries(input).filter(
    ([, value]) => typeof value === 'string' && value.trim().length > 0
  );
  if (patchEntries.length === 0) {
    return detail;
  }

  const normalizedPatch = Object.fromEntries(
    patchEntries.map(([key, value]) => [key, value.trim()])
  );
  const entry = buildAuditEntry(
    'manual_text_adjust',
    reviewer,
    'Updated reviewer-facing copy without changing structured findings.',
    patchEntries.map(([key]) => key)
  );
  const nextParentReport = updateReviewReportCopies(
    detail.report.parentReportJson,
    normalizedPatch,
    entry
  );

  const demoState = FAMILY_EDU_DEMO_MODE
    ? await readFamilyMockState().catch(() => null)
    : null;
  if (demoState) {
    await updateFamilyMockState((state) => {
      const report = state.reports.find((item) => item.runId === runId);
      if (!report) {
        return null;
      }

      report.parentReportJson = nextParentReport;
      report.updatedAt = nowIso();
      return true;
    });
    return getAdminReviewDetail(runId);
  }

  await db
    .update(reports)
    .set({
      parentReportJson: nextParentReport,
      updatedAt: new Date(),
    })
    .where(
      and(eq(reports.id, detail.report.id), eq(reports.runId, runId))
    );

  return getAdminReviewDetail(runId);
}
