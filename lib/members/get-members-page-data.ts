import 'server-only';

import { buildSubjectSummaries } from '@/lib/dashboard/workspace-derivations';
import {
  getChildForUser,
  getChildNoteForUser,
  getDeepResearchReportForUser,
  listChildrenForUser,
  listRecentRunsForUser,
  listReportsForChild,
  listReportsForUser,
} from '@/lib/family/repository';

type ChildReport = Awaited<ReturnType<typeof listReportsForChild>>[number];

export type SubjectSummary = {
  title: string;
  subtitle: string;
  progress: number;
  progressLabel: string;
  statusLabel: string;
  tone: 'violet' | 'blue' | 'amber';
  mostRecentFocus: string;
  reviewCount: number;
  topicCount: number;
};

export type MembersPageData = {
  members: Array<{
    childId: number;
    href: string;
    displayName: string;
    gradeLabel: string;
    avatarLabel: string;
    lastReportStatus: string;
    currentFocus: string;
    active: boolean;
  }>;
  selectedMember:
    | {
        id: number;
        displayName: string;
        gradeLabel: string;
        curriculum: string;
        note: string | null;
        currentFocus: string;
        workspaceTitle: string;
        workspaceSummary: string;
        lastDiagnosisDate: string | null;
        lastWeeklyReviewDate: string | null;
        currentPlanStatus: string;
        nextMove: string;
        recentScore: number | null;
      }
    | null;
  subjectSummaries: SubjectSummary[];
  recentReports: ChildReport[];
  currentRun:
    | {
        id: number;
        statusLabel: string;
        statusMessage: string | null;
      }
    | null;
};

function formatStatus(value: string | null | undefined) {
  if (!value) {
    return 'New';
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function getMembersPageData(userId: number, selectedChildId?: number | null): Promise<MembersPageData> {
  const [children, runs, allReports] = await Promise.all([
    listChildrenForUser(userId),
    listRecentRunsForUser(userId, 12),
    listReportsForUser(userId, 24),
  ]);

  const selectedChild =
    (typeof selectedChildId === 'number' ? await getChildForUser(userId, selectedChildId) : null) ||
    children[0] ||
    null;

  if (!selectedChild) {
    return {
      members: [],
      selectedMember: null,
      subjectSummaries: [],
      recentReports: [],
      currentRun: null,
    };
  }

  const [recentReports, childNote] = await Promise.all([
    listReportsForChild(userId, selectedChild.id, 8),
    getChildNoteForUser(userId, selectedChild.id),
  ]);
  const latestReport = recentReports[0] || null;
  const deepReport =
    latestReport ? await getDeepResearchReportForUser(userId, latestReport.id) : null;
  const childRuns = runs.filter((run) => run.childId === selectedChild.id);
  const currentRun = childRuns.find((run) => run.status !== 'done' && run.status !== 'failed') || null;
  const latestReview = deepReport?.structured.reviewHistories[0] || null;
  const issueTrends = deepReport?.structured.issueTrends || [];
  const currentFocus =
    latestReport?.topFinding ||
    issueTrends[0]?.issueTitle ||
    'No diagnosed focus yet';
  const recentScore =
    typeof latestReport?.confidence === 'number'
      ? Math.round(latestReport.confidence * 100)
      : null;
  const currentPlanStatus =
    latestReport && latestReport.completedDays.length < 7
      ? 'Plan in progress'
      : latestReport
        ? 'Report ready'
        : 'Not started';
  const workspaceTitle = currentRun
    ? 'Diagnosis in progress'
    : latestReport?.releaseStatus === 'needs_review'
      ? 'Draft report needs review'
      : latestReport
        ? 'Current learning picture'
        : 'No diagnosis yet';
  const workspaceSummary = currentRun?.statusMessage
    || latestReport?.summary
    || (latestReport?.releaseStatus === 'needs_review'
      ? 'This upload needs a clearer review before the diagnosis can be trusted.'
      : 'Upload recent schoolwork to establish a reliable first diagnosis.');

  return {
    members: children.map((child) => {
      const childReports = child.id === selectedChild.id
        ? recentReports
        : allReports.filter((report) => report.childId === child.id);
      const childRun =
        runs.find(
          (run) => run.childId === child.id && run.status !== 'done' && run.status !== 'failed'
        ) || null;
      return {
        childId: child.id,
        href: `/dashboard/children/${child.id}`,
        displayName: child.nickname,
        gradeLabel: child.grade,
        avatarLabel: child.nickname.slice(0, 1).toUpperCase(),
        lastReportStatus: formatStatus(childReports[0]?.releaseStatus || childRun?.status),
        currentFocus:
          child.id === selectedChild.id
            ? currentFocus
            : childReports[0]?.topFinding ||
              childRun?.statusMessage ||
              'No diagnosed focus yet',
        active: child.id === selectedChild.id,
      };
    }),
    selectedMember: {
      id: selectedChild.id,
      displayName: selectedChild.nickname,
      gradeLabel: selectedChild.grade,
      curriculum: selectedChild.curriculum,
      note: childNote?.parentNote || latestReview?.parentNote || null,
      currentFocus,
      workspaceTitle,
      workspaceSummary,
      lastDiagnosisDate: latestReport ? new Date(latestReport.createdAt).toLocaleDateString('en-US') : null,
      lastWeeklyReviewDate: latestReview ? new Date(latestReview.createdAt).toLocaleDateString('en-US') : null,
      currentPlanStatus,
      nextMove:
        currentRun?.statusMessage ||
        (latestReport
          ? 'Open the latest report and keep the next action narrow.'
          : 'Upload recent schoolwork to begin the first diagnosis.'),
      recentScore,
    },
    subjectSummaries: buildSubjectSummaries({
      curriculum: selectedChild.curriculum,
      reports: recentReports,
      issueTrends,
      reviewHistories: deepReport?.structured.reviewHistories || [],
    }),
    recentReports,
    currentRun: currentRun
      ? {
          id: currentRun.id,
          statusLabel: formatStatus(currentRun.status),
          statusMessage: currentRun.statusMessage,
        }
      : null,
  };
}
