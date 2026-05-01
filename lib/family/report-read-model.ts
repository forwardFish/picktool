import type {
  CompareSnapshotView,
  DeepResearchReportViewModel,
  DiagnosisAccordionItem,
  DiagnosisSummaryCard,
  DiagnosisView,
  IssueTrendView,
  OutputGatesView,
  ParentReport,
  ReviewHistoryView,
  ReviewStateView,
  ShortestPathView,
} from '@/components/reports/report-types';
import type {
  IssueTrend,
  ReviewHistory,
  ReportCompareSnapshot,
  ReportDiagnosisOutline,
  ReportOutputGate,
  ReportReviewSnapshot,
  ReportSevenDayPlan,
  ReportShareArtifact,
  ReportShortestPath,
} from '@/lib/db/schema';
import { buildReportCompareSummaryFromData } from '@/lib/family/report-composer';

export type StructuredReportReadModel = {
  diagnosisOutline: ReportDiagnosisOutline | null;
  shortestPath: ReportShortestPath | null;
  outputGates: ReportOutputGate[];
  sevenDayPlans: ReportSevenDayPlan[];
  compareSnapshot: ReportCompareSnapshot | null;
  shareArtifact: ReportShareArtifact | null;
  reviewSnapshot: ReportReviewSnapshot | null;
  reviewHistories: ReviewHistory[];
  issueTrends: IssueTrend[];
};

function buildDiagnosisAccordion(parentReport: ParentReport): DiagnosisAccordionItem[] {
  const primaryFinding = parentReport.topFindings?.[0];

  return [
    {
      icon: 'red',
      symbol: '!',
      title: 'Real learning bottleneck',
      sub:
        primaryFinding?.title ||
        'The current upload points to a repeat pattern that needs clearer concept understanding first.',
      noteKey: "This week's focus",
      noteValue:
        primaryFinding?.whatToDo ||
        parentReport.doThisWeek ||
        'Rebuild the current concept foundation before adding more strategy complexity.',
    },
    {
      icon: 'amber',
      symbol: '!',
      title: 'Why this matters now',
      sub:
        primaryFinding?.rationale ||
        'Until the concept is stable, later strategy work will keep breaking down under changed wording.',
      noteKey: 'Leverage reason',
      noteValue:
        'This node sits earlier than strategy execution, so improving it reduces repeated failure across several visible surfaces.',
    },
    {
      icon: 'blue',
      symbol: '!',
      title: 'Ignore for now',
      sub: parentReport.notNow || 'Do not overreact to isolated slips this week.',
      noteKey: 'Why ignore',
      noteValue:
        'These are downstream and noisy. Fixing them first would create activity without solving the main bottleneck.',
    },
    {
      icon: 'purple',
      symbol: '>',
      title: 'Most likely repeat pattern',
      sub:
        'When wording changes, the child loses track of the structure and starts guessing the next move.',
      noteKey: 'Current correction target',
      noteValue:
        'Ask the child to name the whole and the parts before choosing the operation or next step.',
    },
  ];
}

function buildDiagnosisSummaryCards(confidenceScore: number): DiagnosisSummaryCard[] {
  return [
    {
      icon: '!',
      title: 'Overall level',
      main: confidenceScore >= 70 ? 'High' : confidenceScore >= 55 ? 'Medium-High' : 'Developing',
      sub: 'Read from the current structured diagnosis layer',
      right: `${confidenceScore} / 100`,
      badge: confidenceScore >= 70 ? 'Ready' : '',
    },
    {
      icon: '>',
      title: 'Pattern trend',
      main: confidenceScore >= 70 ? 'Stabilizing' : 'Needs one more cycle',
      sub: 'Use compare and output gates before adding more volume',
      right: confidenceScore >= 70 ? 'Better' : 'Watch',
      badge: '',
    },
  ];
}

function buildDiagnosisView(
  parentReport: ParentReport,
  structured: StructuredReportReadModel
): DiagnosisView {
  const primaryFinding = parentReport.topFindings?.[0];
  const confidenceScore =
    typeof parentReport.confidence === 'number' ? Math.round(parentReport.confidence * 100) : 62;

  return {
    heading: 'This run concludes',
    subheading:
      'Start with judgment, not overload. The goal is to help the parent quickly see what this run is actually saying.',
    mainConclusion:
      structured.diagnosisOutline?.primaryIssue ||
      primaryFinding?.title ||
      'Diagnosis summary unavailable.',
    summary:
      structured.diagnosisOutline?.summary ||
      parentReport.summary ||
      'Diagnosis summary unavailable.',
    chips: [
      `Primary bottleneck / ${structured.diagnosisOutline?.primaryIssue || primaryFinding?.title || 'current focus'}`,
      `Ignore for now / ${structured.diagnosisOutline?.notNow || parentReport.notNow || 'secondary noise'}`,
      `Decision / ${structured.diagnosisOutline?.doThisWeek || parentReport.doThisWeek || 'stabilize before scaling'}`,
    ],
    confidenceScore,
    confidenceLabel: confidenceScore >= 55 ? 'medium-high' : 'developing',
    confidenceCopy:
      'Use this score as a confidence signal for the diagnosis, not as a pressure score for the child.',
    kpis: [
      {
        label: 'Trend',
        value: confidenceScore >= 70 ? 'Stabilizing' : 'Developing',
        copy: 'Compare this report against the previous run before adding more load.',
      },
      {
        label: 'Priority',
        value: primaryFinding?.severity || 'High',
        copy: 'Fix this now to unlock later work.',
      },
      {
        label: 'Risk',
        value: structured.reviewSnapshot?.releaseStatus === 'needs_review' ? 'Needs review' : 'Managed',
        copy: 'Changed wording and transfer are the main watch-outs.',
      },
    ],
    accordionItems: buildDiagnosisAccordion(parentReport),
    skeletonMetrics: [
      {
        label: "This week's focus",
        value: structured.diagnosisOutline?.primaryIssue || primaryFinding?.title || 'Current focus',
        copy: 'Stabilize concept first, then unlock strategies.',
      },
      {
        label: 'Leverage node',
        value: structured.shortestPath?.currentNode || 'Core structure',
        copy: 'This node sits before process and transfer.',
      },
      {
        label: 'Current risk',
        value: structured.diagnosisOutline?.notNow || parentReport.notNow || 'Changed wording',
        copy: 'Do not increase difficulty until this stabilizes.',
      },
    ],
    summaryCards: buildDiagnosisSummaryCards(confidenceScore),
    insightCards: [
      {
        title: 'Child scope',
        value: parentReport.grade || 'Current report scope',
        copy: parentReport.childNickname || 'Learner',
      },
      {
        title: 'Source',
        value: parentReport.sourceType || 'Upload',
        copy: 'This diagnosis stays tied to the uploaded evidence.',
      },
      {
        title: 'Do this week',
        value: structured.diagnosisOutline?.doThisWeek || parentReport.doThisWeek || 'Rebuild the concept before adding more strategy.',
        copy: 'Keep the visible message narrow and calm.',
      },
    ],
  };
}

function buildShortestPathView(
  parentReport: ParentReport,
  structured: StructuredReportReadModel
): ShortestPathView {
  const primaryFinding = parentReport.topFindings?.[0];
  const phases = structured.shortestPath?.laterNodesJson || [];
  return {
    overviewTitle: 'Shortest path overview',
    overviewCopy:
      'Make the path easy to scan. The parent should instantly see the current stage, what comes next, and what is intentionally postponed.',
    banner:
      'This path is intentionally narrow: concept first, process second, transfer third, and speed last. The goal is to restore leverage, not create more work.',
    phases: phases.map((phase) => ({
      step: String(phase.step || ''),
      title: String(phase.title || ''),
      tag: String(phase.tag || ''),
      copy: String(phase.copy || ''),
      duration: String(phase.duration || ''),
    })),
    currentNode: structured.shortestPath?.currentNode || primaryFinding?.title || 'Current node',
    keyLeverage:
      primaryFinding?.rationale ||
      structured.shortestPath?.whyFirst ||
      'Around most of the current errors connect back to this node.',
    leverageCopy:
      'That is why the path is narrow and why the recommendation is to resist adding more content too early.',
    whyFirst:
      structured.shortestPath?.whyFirst ||
      'It unlocks the strategy layer that depends on it.',
    whatThisSolves:
      structured.shortestPath?.whatThisSolves ||
      primaryFinding?.whatToDo ||
      'It restores the main concept node that keeps reappearing across the upload.',
    whatWaits:
      structured.shortestPath?.whatWaits ||
      'Mixed-complex problems and multi-step operations should wait until the foundation is stable.',
    communicationFocus: 'We are fixing the foundation.',
    communicationItems: [
      {
        title: 'Why this comes first',
        sub: 'It will make the next steps much easier.',
        body: structured.shortestPath?.whyFirst || 'This step unlocks the next layer of strategy work.',
      },
      {
        title: 'What success looks like',
        sub: 'The child can explain the whole and the parts before solving.',
        body:
          structured.shortestPath?.whatThisSolves ||
          primaryFinding?.whatToDo ||
          'The child can explain the current structure calmly before solving.',
      },
      {
        title: 'What stays later',
        sub: 'Speed and mixed-problem volume stay out until the structure holds.',
        body:
          structured.shortestPath?.whatWaits ||
          'Do not unlock speed or volume until the current node stabilizes.',
      },
    ],
  };
}

function buildOutputGatesView(
  parentReport: ParentReport,
  structured: StructuredReportReadModel
): OutputGatesView {
  const evidenceGroupTitles = (parentReport.evidenceGroups || [])
    .map((group) => group.displayName)
    .filter((title): title is string => Boolean(title))
    .slice(0, 4);
  const readyCount = structured.outputGates.filter((gate) => gate.status === 'Ready').length;
  const optionalCount = structured.outputGates.length - readyCount;

  return {
    title: "This week's output gates",
    subhead:
      'These gates are the visible checkpoints for the week. They should feel concrete, readable, and actually usable by a parent.',
    heroTitle:
      'Use one or two clean checks to verify understanding, instead of adding more noisy practice.',
    heroBody:
      'At least one gate should be visible each week, so the plan has a real checkpoint. The purpose is not to create volume. The purpose is to confirm whether the child can explain, rebuild, or transfer the structure with intention.',
    readyCount,
    optionalCount,
    parentRule: 'One clean gate is enough for this week.',
    gates: structured.outputGates.map((gate) => ({
      gateCode: gate.gateCode,
      title: gate.title,
      status: gate.status,
      body: gate.body,
      whatThisVerifies: gate.whatThisVerifies,
      howToCheck: gate.howToCheck,
    })),
    evidenceGroupTitles,
    reminders: [
      {
        title: 'Do not add extra pressure',
        body:
          'One clean gate is better than many noisy tasks. The purpose is to verify understanding, not create volume.',
      },
      {
        title: 'What success looks like',
        body:
          'If the child can explain one gate clearly and calmly, that is already a meaningful checkpoint for the week.',
      },
    ],
  };
}

function buildCompareView(
  parentReport: ParentReport,
  structured: StructuredReportReadModel
): CompareSnapshotView {
  const confidenceScore =
    typeof parentReport.confidence === 'number' ? Math.round(parentReport.confidence * 100) : 62;
  const compareSummary =
    structured.compareSnapshot?.compareSummary ||
    buildReportCompareSummaryFromData({
      currentTitle: parentReport.topFindings?.[0]?.title || null,
      currentCount: parentReport.evidenceGroups?.[0]?.count || 0,
    });

  return {
    improved:
      structured.compareSnapshot?.improved ||
      'The child now explains the part-whole idea more clearly before solving.',
    stillUneven:
      structured.compareSnapshot?.stillUneven ||
      'The process holds in guided tasks but weakens under changed wording.',
    needsSupport:
      structured.compareSnapshot?.needsSupport ||
      'Mixed-problem confidence is still not stable enough to push volume.',
    trendPoints: structured.compareSnapshot?.trendPointsJson || [48, 56, 60, 72, 66, 82, confidenceScore],
    nextSuggestedFocus:
      structured.compareSnapshot?.nextSuggestedFocus ||
      parentReport.doThisWeek ||
      'Keep the current leverage point as the main weekly focus.',
    resumeDecision:
      structured.compareSnapshot?.resumeDecision ||
      'This is the final checkpoint in the detail flow. From here the user can either return to Reports, resume from the child state, or share the summary with a tutor.',
    compareSummary,
  };
}

function buildReviewStateView(
  parentReport: ParentReport,
  structured: StructuredReportReadModel
): ReviewStateView {
  return {
    releaseStatus:
      structured.reviewSnapshot?.releaseStatus || parentReport.releaseStatus || null,
    reviewReason: structured.reviewSnapshot?.reviewReason || parentReport.reviewReason || null,
    reviewBanner: structured.reviewSnapshot?.reviewBanner || parentReport.reviewBanner || null,
    qualityFlags:
      (structured.reviewSnapshot?.qualityFlagsJson as Record<string, unknown> | undefined) || {},
  };
}

export function buildDeepResearchReportViewModel(args: {
  reportId: number;
  parentReport: ParentReport;
  labels?: Record<string, string>;
  structured: StructuredReportReadModel;
  completedDays?: number[];
}): DeepResearchReportViewModel {
  const labels = args.labels || args.parentReport.labels || {};
  const review = buildReviewStateView(args.parentReport, args.structured);

  return {
    reportId: args.reportId,
    source: args.structured.diagnosisOutline ? 'structured' : 'legacy',
    parentReport: args.parentReport,
    labels,
    diagnosis: buildDiagnosisView(args.parentReport, args.structured),
    shortestPath: buildShortestPathView(args.parentReport, args.structured),
    plan: {
      days:
        args.structured.sevenDayPlans.length > 0
          ? args.structured.sevenDayPlans
              .slice()
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map((day) => ({
                day: day.dayNumber,
                goal: day.goal,
                practice: day.practice,
                parentPrompt: day.parentPrompt,
                successSignal: day.successSignal,
              }))
          : args.parentReport.sevenDayPlan || [],
      guardrail:
        args.structured.diagnosisOutline?.guardrail ||
        args.parentReport.guardrail,
      completedDays: args.completedDays || args.parentReport.completedDays || [],
    },
    outputGates: buildOutputGatesView(args.parentReport, args.structured),
    compare: buildCompareView(args.parentReport, args.structured),
    review,
    shareArtifact: args.structured.shareArtifact
      ? {
          shareSummary: args.structured.shareArtifact.shareSummary,
          tutorSummary: args.structured.shareArtifact.tutorSummary,
          resumeCallToAction: args.structured.shareArtifact.resumeCallToAction,
        }
      : undefined,
    history: (args.structured.reviewHistories || []).map<ReviewHistoryView>((history) => ({
      id: history.id,
      reportId: history.reportId,
      runId: history.runId,
      createdAt: history.createdAt,
      primaryIssue: history.primaryIssue,
      secondaryIssue: history.secondaryIssue,
      compareSummary: history.compareSummary,
      parentNote: history.parentNote,
      completedDays: history.completedDaysJson,
    })),
    trend: (args.structured.issueTrends || []).map<IssueTrendView>((trend) => ({
      id: trend.id,
      childId: trend.childId,
      issueCode: trend.issueCode,
      issueTitle: trend.issueTitle,
      status: trend.status,
      trendDirection: trend.trendDirection,
      occurrenceCount: trend.occurrenceCount,
      summary: trend.summary,
      trendPoints: trend.trendPointsJson,
    })),
  };
}
