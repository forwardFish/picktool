import 'server-only';

import { buildQuickOverview, buildWorkspaceActivityFeed } from '@/lib/dashboard/workspace-derivations';
import { getBillingSnapshotForUser } from '@/lib/family/billing';
import {
  listActivityForUser,
  listRecentRunsForUser,
  listRecentShareEventsForUser,
  listReportsDashboardForUser,
} from '@/lib/family/repository';

type ReportRow = Awaited<ReturnType<typeof listReportsDashboardForUser>>[number];

export type ReportsDashboardData = {
  stats: {
    totalReports: number;
    completed: number;
    inReview: number;
    thisWeek: number;
    locked: number;
  };
  reports: Array<
    ReportRow & {
      locked: boolean;
      statusLabel: string;
      score: number;
    }
  >;
  recentActivity: Array<{
    id: number | string;
    title: string;
    timestamp: string;
  }>;
  quickOverview: {
    reportCountBySubject: Array<{ label: string; count: number }>;
    currentFocusCount: number;
    unfinishedPlans: number;
    reviewNeededCount: number;
  };
};

function formatStatus(value: string | null | undefined) {
  if (!value) {
    return 'Draft';
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function getReportsDashboardData(userId: number): Promise<ReportsDashboardData> {
  const [reports, activities, runs, shareEvents, billingSnapshot] = await Promise.all([
    listReportsDashboardForUser(userId, 24),
    listActivityForUser(userId),
    listRecentRunsForUser(userId, 12),
    listRecentShareEventsForUser(userId, 6),
    getBillingSnapshotForUser(userId),
  ]);

  const lockedReportIds = new Set(billingSnapshot.lockedReportIds);
  const withState = reports.map((report) => ({
    ...report,
    locked: lockedReportIds.has(report.id),
    statusLabel: lockedReportIds.has(report.id)
      ? 'Locked'
      : formatStatus(report.releaseStatus),
    score:
      typeof report.confidence === 'number'
        ? Math.round(report.confidence * 100)
        : Math.max(70, 76 + report.completedDays.length * 3),
  }));

  const now = Date.now();

  return {
    stats: {
      totalReports: reports.length,
      completed: reports.filter((report) => report.releaseStatus === 'completed').length,
      inReview: reports.filter(
        (report) =>
          report.releaseStatus === 'needs_review' || report.releaseStatus === 'in_review'
      ).length,
      thisWeek: reports.filter(
        (report) => now - new Date(report.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
      ).length,
      locked: withState.filter((report) => report.locked).length,
    },
    reports: withState,
    recentActivity: buildWorkspaceActivityFeed({
      activities,
      runs,
      reports,
      shareEvents,
      limit: 4,
    }),
    quickOverview: buildQuickOverview(reports),
  };
}
