import 'server-only';

import {
  buildWorkspaceActivityFeed,
  buildNextBestAction,
  buildSuggestionChips,
  type OverviewActionCard,
} from '@/lib/dashboard/workspace-derivations';
import { getBillingSnapshotForUser } from '@/lib/family/billing';
import {
  getChildNoteForUser,
  listActivityForUser,
  listChatThreadsForUser,
  listChildrenForUser,
  listRecentRunsForUser,
  listRecentShareEventsForUser,
  listReportsForUser,
} from '@/lib/family/repository';

type ChildRow = Awaited<ReturnType<typeof listChildrenForUser>>[number];
type ReportRow = Awaited<ReturnType<typeof listReportsForUser>>[number];
type RunRow = Awaited<ReturnType<typeof listRecentRunsForUser>>[number];

export type OverviewWorkspace = {
  members: Array<{
    childId: number;
    href: string;
    displayName: string;
    gradeLabel: string;
    avatarLabel: string;
    lastReportStatus: string;
    lastActiveAtLabel: string;
    currentFocus: string;
  }>;
  selectedChild:
    | {
        id: number;
        nickname: string;
        grade: string;
        curriculum: string;
        note: string | null;
      }
    | null;
  currentFocus: {
    title: string;
    description: string;
  } | null;
  nextBestAction: OverviewActionCard | null;
  pendingRun: RunRow | null;
  latestReport: ReportRow | null;
  recentActivity: Array<{
    id: number | string;
    title: string;
    timestamp: string;
  }>;
  chatThread:
    | {
        id: number;
        title: string;
        latestMessageBody: string | null;
      }
    | null;
  suggestionChips: string[];
  billingSnapshot: Awaited<ReturnType<typeof getBillingSnapshotForUser>>;
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

function getPendingRun(runs: RunRow[], childId: number | null) {
  if (!childId) {
    return null;
  }

  return (
    runs.find(
      (run) =>
        run.childId === childId &&
        run.status !== 'done' &&
        run.status !== 'failed'
    ) || null
  );
}

function buildCurrentFocus(latestReport: ReportRow | null, pendingRun: RunRow | null) {
  if (pendingRun) {
    return {
      title: pendingRun.statusMessage || 'Diagnosis run in progress',
      description: 'Continue the active diagnosis before starting a new workflow.',
    };
  }

  if (latestReport?.topFinding) {
    return {
      title: latestReport.topFinding,
      description:
        latestReport.summary ||
        'Use the latest report to decide what to practice next and what to ignore for now.',
    };
  }

  return null;
}

export async function getOverviewWorkspace(userId: number): Promise<OverviewWorkspace> {
  const [children, reports, runs, activities, shareEvents, billingSnapshot]: [
    ChildRow[],
    ReportRow[],
    RunRow[],
    Awaited<ReturnType<typeof listActivityForUser>>,
    Awaited<ReturnType<typeof listRecentShareEventsForUser>>,
    Awaited<ReturnType<typeof getBillingSnapshotForUser>>,
  ] = await Promise.all([
    listChildrenForUser(userId),
    listReportsForUser(userId, 24),
    listRecentRunsForUser(userId, 12),
    listActivityForUser(userId),
    listRecentShareEventsForUser(userId, 6),
    getBillingSnapshotForUser(userId),
  ]);

  const selectedChild = children[0] || null;
  const selectedChildId = selectedChild?.id ?? null;
  const selectedChildReports = selectedChild
    ? reports.filter((report: ReportRow) => report.childId === selectedChild.id)
    : [];
  const latestReport = selectedChildReports[0] || null;
  const pendingRun = getPendingRun(runs, selectedChildId);
  const childNote = selectedChild ? await getChildNoteForUser(userId, selectedChild.id) : null;
  const chatThread =
    selectedChildId !== null
      ? (await listChatThreadsForUser(userId, { childId: selectedChildId, limit: 1 }))[0] || null
      : null;
  const currentFocus = buildCurrentFocus(latestReport, pendingRun);
  const hasIncompletePlan =
    latestReport !== null &&
    Array.isArray(latestReport.completedDays) &&
    latestReport.completedDays.length < 7;

  const suggestionChips = buildSuggestionChips({
    hasPreviousReport: Boolean(latestReport),
    hasRecurringIssue: Boolean(latestReport?.compareSummary),
    hasIncompletePlan,
    hasPendingRun: Boolean(pendingRun),
  });

  return {
    members: children.map((child: ChildRow) => {
      const childReports = reports.filter((report: ReportRow) => report.childId === child.id);
      const childRuns = runs.filter((run: RunRow) => run.childId === child.id);
      const latestChildReport = childReports[0] || null;
      const latestChildRun = childRuns[0] || null;
      return {
        childId: child.id,
        href: `/dashboard/children/${child.id}`,
        displayName: child.nickname,
        gradeLabel: child.grade,
        avatarLabel: child.nickname.slice(0, 1).toUpperCase(),
        lastReportStatus: formatStatus(latestChildReport?.releaseStatus || latestChildRun?.status),
        lastActiveAtLabel: new Date(
          latestChildRun?.updatedAt || latestChildReport?.createdAt || child.updatedAt
        ).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        currentFocus:
          latestChildReport?.topFinding ||
          latestChildRun?.statusMessage ||
          'Start the first diagnosis to establish a focus.',
      };
    }),
    selectedChild: selectedChild
      ? {
          id: selectedChild.id,
          nickname: selectedChild.nickname,
          grade: selectedChild.grade,
          curriculum: selectedChild.curriculum,
          note: childNote?.parentNote || null,
        }
      : null,
    currentFocus,
    nextBestAction: buildNextBestAction({
      selectedChildId,
      pendingRun,
      latestReport,
      hasIncompletePlan,
    }),
    pendingRun,
    latestReport,
    recentActivity: buildWorkspaceActivityFeed({
      activities,
      runs,
      reports,
      shareEvents,
      limit: 4,
    }),
    chatThread: chatThread
      ? {
          id: chatThread.id,
          title: chatThread.title,
          latestMessageBody: chatThread.latestMessageBody,
        }
      : null,
    suggestionChips,
    billingSnapshot,
  };
}
