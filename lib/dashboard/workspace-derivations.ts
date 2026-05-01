import type { IssueTrend, ReviewHistory } from '@/lib/db/schema';

export type OverviewActionCard = {
  label: string;
  href: string;
  description: string;
};

type ActivityLogLike = {
  id: number | string;
  action: string;
  timestamp: string | Date;
};

type PendingRunLike = {
  id: number;
  childNickname?: string | null;
  statusMessage: string | null;
  status?: string | null;
  updatedAt?: string | Date;
};

type ReportLike = {
  id: number;
  childNickname?: string | null;
  topFinding?: string | null;
  sourceType?: string | null;
  completedDays: number[];
  confidence?: number | null;
  releaseStatus?: string | null;
  createdAt?: string | Date;
};

type ChildReportLike = ReportLike & {
  summary?: string | null;
};

type ShareEventLike = {
  id: number | string;
  reportId: number;
  childNickname?: string | null;
  topFinding?: string | null;
  createdAt: string | Date;
};

function formatDateTime(value: string | Date | undefined) {
  return new Date(value || Date.now()).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeActionTitle(action: string) {
  switch (action) {
    case 'CREATE_CHILD':
      return 'Added a new member';
    case 'UPDATE_CHILD':
      return 'Updated a child profile';
    case 'DELETE_UPLOAD':
      return 'Removed an upload and linked run';
    case 'RETRY_RUN':
      return 'Retried a diagnosis run';
    default:
      return action
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
  }
}

function getToneFromStatus(statusLabel: string): 'violet' | 'blue' | 'amber' {
  if (statusLabel === 'Improving' || statusLabel === 'Stable') {
    return 'blue';
  }

  if (statusLabel === 'Needs Focus') {
    return 'amber';
  }

  return 'violet';
}

export function buildSuggestionChips(input: {
  hasPreviousReport: boolean;
  hasRecurringIssue: boolean;
  hasIncompletePlan: boolean;
  hasPendingRun: boolean;
}) {
  const chips: string[] = [];

  if (input.hasPreviousReport) {
    chips.push('What changed compared with the last diagnosis?');
  }

  if (input.hasRecurringIssue) {
    chips.push('Is this a concept issue or an execution issue?');
  }

  if (input.hasIncompletePlan) {
    chips.push("Help me respond to my child's question today.");
  }

  if (!input.hasPendingRun) {
    chips.push('Based on this worksheet, what should we do next?');
  }

  return chips.slice(0, 4);
}

export function buildNextBestAction(input: {
  selectedChildId: number | null;
  pendingRun: PendingRunLike | null;
  latestReport: Pick<ReportLike, 'id'> | null;
  hasIncompletePlan: boolean;
}): OverviewActionCard | null {
  if (!input.selectedChildId) {
    return {
      label: 'Add your first member',
      href: '/dashboard/children/new',
      description: 'Create a child profile before starting the first diagnosis.',
    };
  }

  if (input.pendingRun) {
    return {
      label: 'Continue analysis',
      href: `/dashboard/runs/${input.pendingRun.id}`,
      description:
        input.pendingRun.statusMessage ||
        'Resume the active diagnosis run and wait for the report to publish.',
    };
  }

  if (input.latestReport && input.hasIncompletePlan) {
    return {
      label: "Continue this week's action",
      href: `/dashboard/reports/${input.latestReport.id}?tab=plan`,
      description: 'Pick up the current 7-day plan before opening a new diagnosis.',
    };
  }

  if (input.latestReport) {
    return {
      label: 'Review latest diagnosis',
      href: `/dashboard/reports/${input.latestReport.id}`,
      description: 'Open the newest structured report and decide the next move.',
    };
  }

  return {
    label: 'Start new diagnosis',
    href: `/dashboard/children/${input.selectedChildId}/upload`,
    description: 'Upload recent schoolwork to create the first diagnosis run.',
  };
}

export function buildSubjectSummaries(input: {
  curriculum: string;
  reports: ChildReportLike[];
  issueTrends: IssueTrend[];
  reviewHistories: ReviewHistory[];
}) {
  if (input.reports.length === 0) {
    return [];
  }

  const grouped = new Map<string, ChildReportLike[]>();
  for (const report of input.reports.slice(0, 5)) {
    const key = report.topFinding || input.curriculum || 'Learning focus';
    const collection = grouped.get(key) || [];
    collection.push(report);
    grouped.set(key, collection);
  }

  return Array.from(grouped.entries())
    .map(([key, reports]) => {
      const reviewCount = reports.length;
      const topicCount = new Set(
        reports.map((report) => report.topFinding || report.summary || key)
      ).size;
      const activeTrend = input.issueTrends[0] || null;
      const latestReview = input.reviewHistories[0] || null;
      const statusLabel =
        activeTrend?.trendDirection === 'improving'
          ? 'Improving'
          : activeTrend?.trendDirection === 'recurring' || activeTrend?.status === 'active'
            ? 'Needs Focus'
            : 'Stable';
      const progress = Math.min(
        100,
        Math.max(18, 30 + reviewCount * 14 + (latestReview?.completedDaysJson.length || 0) * 6)
      );

      return {
        title: reports[0]?.topFinding || key,
        subtitle: `${topicCount} topic${topicCount === 1 ? '' : 's'} across ${reviewCount} review${reviewCount === 1 ? '' : 's'}`,
        progress,
        progressLabel: `${reviewCount} reviews / ${topicCount} topics`,
        statusLabel,
        tone: getToneFromStatus(statusLabel),
        mostRecentFocus:
          activeTrend?.summary ||
          reports[0]?.summary ||
          'Use the latest report to keep the focus narrow.',
        reviewCount,
        topicCount,
      };
    })
    .slice(0, 4);
}

export function buildQuickOverview(reports: ReportLike[]) {
  const reportCountBySubject = Array.from(
    reports.reduce((accumulator, report) => {
      const key = report.sourceType || 'Unknown';
      accumulator.set(key, (accumulator.get(key) || 0) + 1);
      return accumulator;
    }, new Map<string, number>())
  )
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);

  return {
    reportCountBySubject,
    currentFocusCount: new Set(reports.map((report) => report.topFinding).filter(Boolean)).size,
    unfinishedPlans: reports.filter((report) => report.completedDays.length < 7).length,
    reviewNeededCount: reports.filter(
      (report) => report.releaseStatus === 'needs_review' || report.releaseStatus === 'in_review'
    ).length,
  };
}

export function buildWorkspaceActivityFeed(input: {
  activities: ActivityLogLike[];
  runs: PendingRunLike[];
  reports: ReportLike[];
  shareEvents: ShareEventLike[];
  limit?: number;
}) {
  const derived = [
    ...input.activities.map((activity) => ({
      id: `activity-${activity.id}`,
      title: normalizeActionTitle(activity.action),
      timestamp: formatDateTime(activity.timestamp),
      sortAt: new Date(activity.timestamp).getTime(),
    })),
    ...input.runs
      .filter((run) => run.status && run.status !== 'done' && run.status !== 'failed')
      .map((run) => ({
        id: `run-${run.id}`,
        title:
          run.status === 'needs_review'
            ? `Run needs review${run.childNickname ? ` for ${run.childNickname}` : ''}`
            : `Continue diagnosis${run.childNickname ? ` for ${run.childNickname}` : ''}`,
        timestamp: formatDateTime(run.updatedAt),
        sortAt: new Date(run.updatedAt || Date.now()).getTime(),
      })),
    ...input.reports.map((report) => ({
      id: `report-${report.id}`,
      title:
        report.releaseStatus === 'needs_review' || report.releaseStatus === 'in_review'
          ? `Report needs review${report.childNickname ? ` for ${report.childNickname}` : ''}`
          : `Published report${report.childNickname ? ` for ${report.childNickname}` : ''}`,
      timestamp: formatDateTime(report.createdAt),
      sortAt: new Date(report.createdAt || Date.now()).getTime(),
    })),
    ...input.shareEvents.map((shareEvent) => ({
      id: `share-${shareEvent.id}`,
      title: `Shared report${shareEvent.childNickname ? ` for ${shareEvent.childNickname}` : ''}`,
      timestamp: formatDateTime(shareEvent.createdAt),
      sortAt: new Date(shareEvent.createdAt).getTime(),
    })),
  ];

  return derived
    .sort((left, right) => right.sortAt - left.sortAt)
    .slice(0, input.limit ?? 4)
    .map(({ id, title, timestamp }) => ({
      id,
      title,
      timestamp,
    }));
}
