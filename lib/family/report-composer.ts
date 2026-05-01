import type { CanonicalExtractionBundle, LabeledProblemItem } from '@/lib/ai/extraction-schema';
import { getTaxonomyByCode } from '@/lib/ai/taxonomy';
import type {
  DayPlan,
  EvidenceGroup,
  OutputGateView,
  ParentReport,
  TopFinding,
} from '@/components/reports/report-types';

type ChildSummary = {
  nickname: string;
  grade: string;
  curriculum: string;
};

type UploadSummary = {
  sourceType: string;
  diagnosticGoal?: string | null;
  recentTrend?: string | null;
  parentConcernJson?: string[];
  teacherFeedbackPresent?: boolean;
  hasTutor?: boolean;
  intakeCompletedAt?: string | null;
};

type GroupedItem = {
  code: string;
  displayName: string;
  description: string;
  rationale: string;
  items: LabeledProblemItem[];
  averageConfidence: number;
  strongestSeverity: 'low' | 'med' | 'high';
};

export type StructuredDiagnosisOutlineRecord = {
  summary: string;
  primaryIssue: string;
  secondaryIssue: string;
  doThisWeek: string;
  notNow: string;
  guardrail: string;
  confidence: number;
  locale: string;
  sourceMetaJson: Record<string, unknown>;
};

export type StructuredShortestPathRecord = {
  currentNode: string;
  nextNode: string;
  laterNodesJson: Array<{ step: string; title: string; tag: string; copy: string; duration: string }>;
  whyFirst: string;
  whatThisSolves: string;
  whatWaits: string;
};

export type StructuredOutputGateRecord = OutputGateView & {
  gateCode: string;
  sortOrder: number;
};

export type StructuredSevenDayPlanRecord = {
  dayNumber: number;
  goal: string;
  practice: string;
  parentPrompt: string;
  successSignal: string;
  sortOrder: number;
};

export type StructuredCompareSnapshotRecord = {
  improved: string;
  stillUneven: string;
  needsSupport: string;
  trendPointsJson: number[];
  resumeDecision: string;
  nextSuggestedFocus: string;
  compareSummary: string;
};

export type StructuredShareArtifactRecord = {
  shareSummary: string;
  tutorSummary: string;
  resumeCallToAction: string;
  artifactJson: Record<string, unknown>;
};

export type StructuredReviewSnapshotRecord = {
  releaseStatus: string;
  reviewReason: string | null;
  reviewBanner: string | null;
  qualityFlagsJson: Record<string, unknown>;
};

export type StructuredDeepResearchPayload = {
  diagnosisOutline: StructuredDiagnosisOutlineRecord;
  shortestPath: StructuredShortestPathRecord;
  outputGates: StructuredOutputGateRecord[];
  sevenDayPlans: StructuredSevenDayPlanRecord[];
  compareSnapshot: StructuredCompareSnapshotRecord;
  shareArtifact: StructuredShareArtifactRecord;
  reviewSnapshot: StructuredReviewSnapshotRecord;
};

export type ComposedReportPayload = {
  parentReportJson: ParentReport;
  studentReportJson: Record<string, unknown>;
  tutorReportJson: Record<string, unknown>;
  structured: StructuredDeepResearchPayload;
};

function buildHighlightBox(pageNo: number, problemNo: string) {
  const numericProblem = Number.parseInt(String(problemNo).replace(/\D/g, ''), 10);
  const normalizedIndex = Number.isFinite(numericProblem) && numericProblem > 0
    ? (numericProblem - 1) % 6
    : 0;

  return {
    x: 10,
    y: 14 + normalizedIndex * 13,
    width: 78,
    height: 10,
    label: `Problem ${problemNo} on page ${pageNo}`,
  };
}

function buildPlan(primaryFocus: string, secondaryFocus: string): DayPlan[] {
  return [
    {
      day: 1,
      minutes: 20,
      goal: `Name the pattern behind ${primaryFocus}.`,
      practice: 'Review two worked examples and explain why the method matters.',
      parentPrompt: 'Ask your child to narrate the first step before writing anything.',
      successSignal: 'They can describe the setup in words before solving.',
    },
    {
      day: 2,
      minutes: 20,
      goal: `Slow down the procedure for ${primaryFocus}.`,
      practice: 'Solve two short items while speaking each step out loud.',
      parentPrompt: 'Pause after each line and ask what changed from the line above.',
      successSignal: 'The order of steps stays consistent without guessing.',
    },
    {
      day: 3,
      minutes: 20,
      goal: `Catch slips linked to ${secondaryFocus}.`,
      practice: 'Do one warm-up and two error-correction items from the same skill family.',
      parentPrompt: 'Ask which symbol, sign, or number is easiest to lose when rushing.',
      successSignal: 'Your child can self-correct at least one slip before you point to it.',
    },
    {
      day: 4,
      minutes: 15,
      goal: 'Mix old and new without increasing pressure.',
      practice: 'Use two mixed questions and one short reflection after each answer.',
      parentPrompt: 'Ask which problem felt more stable today and why.',
      successSignal: 'They can compare one strong response and one wobbly response.',
    },
    {
      day: 5,
      minutes: 15,
      goal: `Rehearse ${primaryFocus} in a new context.`,
      practice: 'Try one worksheet-style item and one verbal explanation prompt.',
      parentPrompt: 'Ask how they know they picked the right starting strategy.',
      successSignal: 'They choose the method with less prompting than earlier in the week.',
    },
    {
      day: 6,
      minutes: 15,
      goal: 'Practice checking instead of racing to finish.',
      practice: 'Complete one timed-light practice set with a final check pass.',
      parentPrompt: 'Ask what they check first when they think they are done.',
      successSignal: 'They perform a deliberate final check on signs, units, or notation.',
    },
    {
      day: 7,
      minutes: 15,
      goal: 'Wrap the week with confidence and one small stretch.',
      practice: 'Revisit one earlier mistake and one mixed challenge item.',
      parentPrompt: 'Ask what feels easier now and what still needs one more week.',
      successSignal: 'They can explain one improvement and one next focus area.',
    },
  ];
}

function toSeverity(score: number) {
  if (score < 0.58) {
    return 'high';
  }
  if (score < 0.76) {
    return 'med';
  }
  return 'low';
}

function formatFindingAction(code: string, displayName: string) {
  switch (code) {
    case 'procedure_gap':
      return 'Rebuild the step order with slow, spoken practice before adding harder problems.';
    case 'calculation_slip':
      return 'Keep the same method but add a deliberate final arithmetic check.';
    case 'notation_error':
      return 'Use cleaner written notation and ask your child to name each symbol as they write it.';
    case 'strategy_error':
      return 'Compare two solving strategies and choose the simpler one before starting.';
    case 'concept_gap':
      return 'Use a concrete visual or verbal explanation before returning to the worksheet.';
    default:
      return `Practice ${displayName.toLowerCase()} with short, high-clarity examples before mixed review.`;
  }
}

function groupItems(bundle: CanonicalExtractionBundle): GroupedItem[] {
  const grouped = new Map<string, GroupedItem>();

  for (const item of bundle.labeledItems) {
    for (const label of item.labels) {
      const taxonomy = getTaxonomyByCode(label.code);
      if (!taxonomy) {
        continue;
      }

      const existing = grouped.get(label.code);
      if (!existing) {
        grouped.set(label.code, {
          code: taxonomy.code,
          displayName: taxonomy.displayName,
          description: taxonomy.description,
          rationale: item.rationale,
          items: [item],
          averageConfidence: label.labelConfidence,
          strongestSeverity: label.severity,
        });
        continue;
      }

      existing.items.push(item);
      existing.averageConfidence = Number(
        (
          existing.items.reduce(
            (sum, groupedItem) =>
              sum +
              groupedItem.labels.find((candidate) => candidate.code === label.code)!.labelConfidence,
            0
          ) / existing.items.length
        ).toFixed(2)
      );
      if (
        (existing.strongestSeverity === 'low' && label.severity !== 'low') ||
        (existing.strongestSeverity === 'med' && label.severity === 'high')
      ) {
        existing.strongestSeverity = label.severity;
      }
    }
  }

  return Array.from(grouped.values()).sort((left, right) => {
    if (right.items.length !== left.items.length) {
      return right.items.length - left.items.length;
    }
    return left.averageConfidence - right.averageConfidence;
  });
}

function buildTopFindings(groups: GroupedItem[]): TopFinding[] {
  return groups.slice(0, 3).map((group) => ({
    code: group.code,
    title: group.displayName,
    severity: group.strongestSeverity,
    patternType: group.items.length >= 3 ? 'pattern' : 'sporadic',
    count: group.items.length,
    evidence: group.items.slice(0, 3).map((item) => ({
      pageId: item.evidenceAnchor.pageId,
      pageNo: item.evidenceAnchor.pageNo,
      problemNo: item.evidenceAnchor.problemNo,
      previewLabel: item.evidenceAnchor.previewLabel,
      highlightBox: buildHighlightBox(item.evidenceAnchor.pageNo, item.evidenceAnchor.problemNo),
    })),
    whatToDo: formatFindingAction(group.code, group.displayName),
    rationale: group.rationale,
  }));
}

function buildEvidenceGroups(groups: GroupedItem[]): EvidenceGroup[] {
  return groups.map((group) => ({
    code: group.code,
    displayName: group.displayName,
    description: group.description,
    count: group.items.length,
    averageConfidence: group.averageConfidence,
    severity: group.strongestSeverity,
    items: group.items.map((item) => ({
      pageId: item.evidenceAnchor.pageId,
      pageNo: item.evidenceAnchor.pageNo,
      problemNo: item.evidenceAnchor.problemNo,
      previewLabel: item.evidenceAnchor.previewLabel,
      problemText: item.problemText,
      studentWork: item.studentWork,
      teacherMark: item.teacherMark,
      rationale: item.rationale,
      labelCodes: item.labels.map((label) => label.code),
      itemConfidence: item.itemConfidence,
      labelConfidence: Number(
        (
          item.labels.reduce((sum, label) => sum + label.labelConfidence, 0) /
          Math.max(1, item.labels.length)
        ).toFixed(2)
      ),
      highlightBox: buildHighlightBox(item.evidenceAnchor.pageNo, item.evidenceAnchor.problemNo),
    })),
  }));
}

export function buildStructuredOutputGates(args: {
  primaryFindingTitle: string;
  primaryAction: string;
  primaryRationale: string;
  groupTitles: string[];
}): StructuredOutputGateRecord[] {
  const { primaryFindingTitle, primaryAction, primaryRationale, groupTitles } = args;

  return [
    {
      gateCode: 'explain',
      sortOrder: 1,
      title: 'Explain',
      status: 'Ready',
      body: `Explain in your own words why ${primaryFindingTitle.toLowerCase()} is the current focus.`,
      whatThisVerifies: primaryRationale,
      howToCheck:
        'Ask the child to name the whole, the parts, and the reason the first step makes sense before solving.',
    },
    {
      gateCode: 'rebuild',
      sortOrder: 2,
      title: 'Rebuild',
      status: 'Ready',
      body: `Rebuild a mistaken example and point out where ${primaryFindingTitle.toLowerCase()} starts to drift.`,
      whatThisVerifies: primaryAction,
      howToCheck:
        'Show one mistaken solution, then ask the child to mark the first broken step and rebuild from there.',
    },
    {
      gateCode: 'transfer',
      sortOrder: 3,
      title: 'Transfer',
      status: 'Optional',
      body: `Try one similar problem with a changed surface while keeping ${primaryFindingTitle.toLowerCase()} stable.`,
      whatThisVerifies:
        groupTitles[1]
          ? `Whether ${primaryFindingTitle.toLowerCase()} survives when ${groupTitles[1].toLowerCase()} also shows up.`
          : `Whether ${primaryFindingTitle.toLowerCase()} survives when the wording changes.`,
      howToCheck:
        'Use this only after the child can already explain and rebuild without much prompting.',
    },
    {
      gateCode: 'spot-the-break',
      sortOrder: 4,
      title: 'Spot the mistake',
      status: 'Optional',
      body: 'Find the first step where the work breaks and explain why it matters.',
      whatThisVerifies:
        'Whether the child can identify the first meaningful break instead of only noticing the final wrong answer.',
      howToCheck:
        'Keep the reflection short. The goal is to identify the break clearly, not to create a long correction session.',
    },
  ];
}

export function buildReportCompareSummaryFromData(args: {
  currentTitle: string | null | undefined;
  currentCount: number;
  previousTitle?: string | null;
  previousCount?: number | null;
}) {
  const currentTitle = args.currentTitle || 'the current focus area';
  const previousTitle = args.previousTitle;
  const previousCount = typeof args.previousCount === 'number' ? args.previousCount : null;

  if (!previousTitle || previousCount === null) {
    return 'First report for this child. Use this as the baseline for next week.';
  }

  if (currentTitle === previousTitle) {
    if (args.currentCount < previousCount) {
      return `Improving: ${currentTitle} appears in fewer anchored examples than the previous report.`;
    }
    if (args.currentCount > previousCount) {
      return `Still sticky: ${currentTitle} appears in more anchored examples than the previous report.`;
    }
    return `Steady pattern: ${currentTitle} is still the main focus compared with the previous report.`;
  }

  return `Focus shifted from ${previousTitle} to ${currentTitle}.`;
}

function buildTrendPoints(confidenceScore: number) {
  const start = Math.max(40, Math.min(72, confidenceScore - 18));
  const mid = Math.max(start + 4, confidenceScore - 8);
  return [
    start,
    Math.min(96, start + 6),
    Math.min(96, start + 11),
    Math.min(96, mid),
    Math.max(45, mid - 4),
    Math.min(98, confidenceScore - 2),
    confidenceScore,
  ];
}

export function composeDeepResearchReport(args: {
  bundle: CanonicalExtractionBundle;
  child: ChildSummary;
  upload: UploadSummary;
  previousReport?: ParentReport | Record<string, unknown> | null;
}) : ComposedReportPayload {
  const { bundle, child, upload, previousReport } = args;
  const groups = groupItems(bundle);
  const hasEvidence = groups.length > 0;
  const primary = groups[0];
  const secondary = groups[1] || groups[0];
  const sevenDayPlan = buildPlan(
    primary?.displayName || 'core math procedure',
    secondary?.displayName || 'error checking'
  );
  const topFindings = buildTopFindings(groups);
  const evidenceGroups = buildEvidenceGroups(groups);

  const reportState = bundle.requiresReview ? 'needs_review' : 'ready';
  const confidenceBand = toSeverity(bundle.overallConfidence);
  const summary = hasEvidence
    ? `${primary.displayName} is the clearest repeat pattern across this upload, with ${secondary?.displayName || 'secondary slips'} showing up as the next focus area.`
    : bundle.reviewReason ||
      'We could not read enough reliable worksheet content to publish a trustworthy diagnosis yet.';
  const intakeGoal =
    typeof upload.diagnosticGoal === 'string' && upload.diagnosticGoal.trim().length > 0
      ? upload.diagnosticGoal.trim()
      : null;
  const recentTrend =
    typeof upload.recentTrend === 'string' && upload.recentTrend.trim().length > 0
      ? upload.recentTrend.trim()
      : null;
  const parentConcernSummary =
    Array.isArray(upload.parentConcernJson) && upload.parentConcernJson.length > 0
      ? upload.parentConcernJson.join(', ')
      : null;
  const doThisWeek = hasEvidence
    ? `Start by stabilizing ${primary.displayName.toLowerCase()} before introducing harder mixed practice.`
    : 'Re-upload clearer pages or use a text-based PDF before acting on this draft diagnosis.';
  const notNow = hasEvidence
    ? 'Do not turn this report into direct homework answers or jump to harder packets before the repeated pattern settles.'
    : 'Do not treat this draft as a confirmed learning diagnosis until readable evidence is available.';
  const guardrail = hasEvidence
    ? 'This report supports diagnosis and practice planning, not direct homework answers.'
    : 'This draft exists only to flag unreadable evidence, not to diagnose the child.';

  const parentReportJson: ParentReport = {
    childNickname: child.nickname,
    grade: child.grade,
    curriculum: child.curriculum,
    sourceType: upload.sourceType,
    summary,
    confidence: bundle.overallConfidence,
    confidenceBand,
    releaseStatus: reportState,
    reviewReason: bundle.reviewReason,
    topFindings,
    evidenceGroups,
    doThisWeek,
    notNow,
    sevenDayPlan,
    completedDays: [],
    reviewBanner:
      bundle.requiresReview && bundle.reviewReason
        ? `Draft report only: ${bundle.reviewReason}`
        : null,
    guardrail,
    locale: 'en-US',
    sourceMeta: {
      engine: bundle.engine,
      modelVersion: bundle.modelVersion,
      runId: bundle.runId,
      overallConfidence: bundle.overallConfidence,
      diagnosticGoal: intakeGoal,
      recentTrend,
      parentConcernSummary,
      teacherFeedbackPresent: Boolean(upload.teacherFeedbackPresent),
      hasTutor: Boolean(upload.hasTutor),
      intakeCompletedAt: upload.intakeCompletedAt || null,
    },
  };

  const studentReportJson = {
    headline: hasEvidence
      ? `This week we are making ${primary.displayName.toLowerCase()} feel more predictable.`
      : 'We need a clearer upload before we can trust the diagnosis.',
    focusAreas: topFindings.map((finding) => finding.title),
    nextSteps: sevenDayPlan.slice(0, 3),
    encouragement: hasEvidence
      ? 'The goal is not speed. The goal is clear steps, cleaner checking, and fewer repeated slips.'
      : 'A clearer upload will give a much more trustworthy diagnosis than guessing from unreadable pages.',
  };

  const tutorReportJson = {
    intakeSummary: `${child.nickname} (${child.grade}, ${child.curriculum}) uploaded a ${upload.sourceType} packet for structured diagnosis.${intakeGoal ? ` Goal: ${intakeGoal}.` : ''}${recentTrend ? ` Recent trend: ${recentTrend}.` : ''}`,
    recommendedFocus: hasEvidence ? primary?.displayName || 'clarity and slower checking' : 'recover readable evidence',
    secondaryFocus: secondary?.displayName || null,
    evidenceGroups,
    confidence: bundle.overallConfidence,
    releaseStatus: reportState,
    reviewReason: bundle.reviewReason,
    notes:
      bundle.requiresReview
        ? hasEvidence
          ? 'Use this as a draft until manual review confirms the weakest evidence anchors.'
          : 'The upload needs a clearer file before any tutoring diagnosis should be trusted.'
        : 'The extraction confidence is strong enough for a first-session tutoring brief.',
  };

  const primaryFinding = topFindings[0];
  const currentCount =
    typeof evidenceGroups[0]?.count === 'number'
      ? evidenceGroups[0]?.count || 0
      : Array.isArray(primaryFinding?.evidence)
        ? primaryFinding.evidence.length
        : 0;
  const previousParentReport = (previousReport && 'parentReportJson' in previousReport
    ? (previousReport.parentReportJson as Record<string, unknown>)
    : previousReport || null) as Record<string, unknown> | null;
  const previousFinding = Array.isArray(previousParentReport?.topFindings)
    ? (previousParentReport?.topFindings as Array<Record<string, unknown>>)[0]
    : null;
  const previousGroup = Array.isArray(previousParentReport?.evidenceGroups)
    ? (previousParentReport?.evidenceGroups as Array<Record<string, unknown>>)[0]
    : null;

  const compareSummary = buildReportCompareSummaryFromData({
    currentTitle: primaryFinding?.title || null,
    currentCount,
    previousTitle: typeof previousFinding?.title === 'string' ? previousFinding.title : null,
    previousCount: typeof previousGroup?.count === 'number'
      ? previousGroup.count
      : Array.isArray(previousFinding?.evidence)
        ? previousFinding.evidence.length
        : null,
  });

  const confidenceScore = Math.round(bundle.overallConfidence * 100);
  const outputGates = buildStructuredOutputGates({
    primaryFindingTitle: primaryFinding?.title || 'current understanding',
    primaryAction: primaryFinding?.whatToDo || doThisWeek,
    primaryRationale:
      primaryFinding?.rationale ||
      'This is the highest-leverage place to rebuild before adding more difficulty.',
    groupTitles: evidenceGroups
      .map((group) => group.displayName)
      .filter((value): value is string => Boolean(value)),
  });

  return {
    parentReportJson,
    studentReportJson,
    tutorReportJson,
    structured: {
      diagnosisOutline: {
        summary,
        primaryIssue: primaryFinding?.title || 'Needs manual review',
        secondaryIssue: secondary?.displayName || primaryFinding?.title || 'Reliable page content unavailable',
        doThisWeek,
        notNow,
        guardrail,
        confidence: bundle.overallConfidence,
        locale: 'en-US',
        sourceMetaJson: {
          child,
          upload,
          engine: bundle.engine,
          modelVersion: bundle.modelVersion,
          requiresReview: bundle.requiresReview,
          diagnosticGoal: intakeGoal,
          recentTrend,
          parentConcernSummary,
        },
      },
      shortestPath: {
        currentNode: primaryFinding?.title || 'Recover readable evidence',
        nextNode: secondary?.displayName || (hasEvidence ? 'Build solution process' : 'Re-run diagnosis with clearer pages'),
        laterNodesJson: [
          {
            step: '1',
            title: primaryFinding?.title || 'Stabilize concept understanding',
            tag: 'Current',
            copy: primaryFinding?.whatToDo || doThisWeek,
            duration: 'Estimated 3-4 days',
          },
          {
            step: '2',
            title: secondary?.displayName || 'Build solution process',
            tag: 'Next',
            copy: secondary?.rationale || 'Learn the standard process without adding pressure.',
            duration: 'Estimated 3-4 days',
          },
          {
            step: '3',
            title: 'Transfer to new problem types',
            tag: 'Later',
            copy: 'Apply the same structure in changed surfaces.',
            duration: 'Estimated 2-3 days',
          },
          {
            step: '4',
            title: 'Strengthen speed and accuracy',
            tag: 'Later',
            copy: 'Improve fluency only after the structure holds.',
            duration: 'Estimated 2-3 days',
          },
        ],
        whyFirst:
          primaryFinding?.rationale ||
          (hasEvidence
            ? 'It unlocks the strategy layer that depends on it.'
            : 'Readable evidence has to come first, otherwise the diagnosis becomes guesswork.'),
        whatThisSolves:
          primaryFinding?.whatToDo ||
          (hasEvidence
            ? 'It restores the main concept node that keeps reappearing across the upload.'
            : 'It lets the next diagnosis run use real worksheet evidence instead of placeholders.'),
        whatWaits:
          secondary?.displayName
            ? `${secondary.displayName} and harder mixed-problem volume should wait until the foundation stabilizes.`
            : hasEvidence
              ? 'Mixed-complex problems and speed work should wait until the foundation stabilizes.'
              : 'All teaching decisions should wait until the upload can be read reliably.',
      },
      outputGates,
      sevenDayPlans: sevenDayPlan.map((day, index) => ({
        dayNumber: day.day || index + 1,
        goal: day.goal || '',
        practice: day.practice || '',
        parentPrompt: day.parentPrompt || '',
        successSignal: day.successSignal || '',
        sortOrder: index + 1,
      })),
      compareSnapshot: {
        improved:
          compareSummary.startsWith('Improving:')
            ? compareSummary.replace('Improving: ', '')
            : 'The child now explains the structure more clearly before solving.',
        stillUneven:
          secondary?.displayName
            ? `${secondary.displayName} still weakens when the wording or surface changes.`
            : 'The process holds in guided tasks but weakens under changed wording.',
        needsSupport:
          primaryFinding?.title
            ? `${primaryFinding.title} is still not stable enough to push extra volume.`
            : 'Mixed-problem confidence is still not stable enough to push extra volume.',
        trendPointsJson: buildTrendPoints(confidenceScore),
        resumeDecision:
          'From here the user can return to Reports, resume from the child state, or share the summary with a tutor.',
        nextSuggestedFocus: doThisWeek,
        compareSummary,
      },
      shareArtifact: {
        shareSummary: summary,
        tutorSummary:
          typeof tutorReportJson.notes === 'string'
            ? `${tutorReportJson.recommendedFocus}. ${tutorReportJson.notes}`
            : String(tutorReportJson.recommendedFocus),
        resumeCallToAction: 'Resume from child state or share the summary with a tutor when ready.',
        artifactJson: {
          childNickname: child.nickname,
          recommendedFocus: tutorReportJson.recommendedFocus,
          secondaryFocus: tutorReportJson.secondaryFocus,
          releaseStatus: reportState,
          diagnosticGoal: intakeGoal,
          recentTrend,
          parentConcernSummary,
        },
      },
      reviewSnapshot: {
        releaseStatus: reportState,
        reviewReason: bundle.reviewReason,
        reviewBanner:
          bundle.requiresReview && bundle.reviewReason
            ? `Draft report only: ${bundle.reviewReason}`
            : null,
        qualityFlagsJson: {
          requiresReview: bundle.requiresReview,
          pageCount: bundle.pages.length,
          labeledItemCount: bundle.labeledItems.length,
        },
      },
    },
  };
}
