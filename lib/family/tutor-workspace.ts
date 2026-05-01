import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  analysisRuns,
  children,
  reports,
  shareLinks,
} from '@/lib/db/schema';
import { readFamilyMockState } from '@/lib/family/mock-store';
import { isFamilyEduDemoMode } from '@/lib/family/config';

type TutorWorkspaceItem = {
  reportId: number;
  childNickname: string | null;
  recommendedFocus: string | null;
  secondaryFocus: string | null;
  releaseStatus: string | null;
  shareStatus: 'not_shared' | 'active' | 'revoked' | 'expired';
  activeShareUrl: string | null;
  lastUpdatedAt: string;
};

function buildShareStatus(link: { revokedAt: string | Date | null; expiresAt: string | Date }) {
  if (link.revokedAt) {
    return 'revoked' as const;
  }
  if (new Date(link.expiresAt) < new Date()) {
    return 'expired' as const;
  }
  return 'active' as const;
}

export async function listTutorWorkspaceForUser(userId: number): Promise<TutorWorkspaceItem[]> {
  if (isFamilyEduDemoMode()) {
    const state = await readFamilyMockState();
    return state.reports
      .map((report) => {
        const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
        if (!run) {
          return null;
        }
        const child = state.children.find((item) => item.id === run.childId);
        const activeLink = state.shareLinks
          .filter((item) => item.reportId === report.id)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
        const tutorReport = report.tutorReportJson as Record<string, any>;
        return {
          reportId: report.id,
          childNickname: child?.nickname || null,
          recommendedFocus:
            typeof tutorReport.recommendedFocus === 'string'
              ? tutorReport.recommendedFocus
              : null,
          secondaryFocus:
            typeof tutorReport.secondaryFocus === 'string' ? tutorReport.secondaryFocus : null,
          releaseStatus:
            typeof tutorReport.releaseStatus === 'string' ? tutorReport.releaseStatus : null,
          shareStatus: activeLink ? buildShareStatus(activeLink) : 'not_shared',
          activeShareUrl:
            activeLink && buildShareStatus(activeLink) === 'active'
              ? `/share/${activeLink.token}`
              : null,
          lastUpdatedAt: report.updatedAt,
        } satisfies TutorWorkspaceItem;
      })
      .filter((item): item is TutorWorkspaceItem => Boolean(item))
      .sort((left, right) => right.lastUpdatedAt.localeCompare(left.lastUpdatedAt));
  }

  const rows = await db
    .select({
      report: reports,
      run: analysisRuns,
      child: children,
      shareLink: shareLinks,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .innerJoin(children, eq(analysisRuns.childId, children.id))
    .leftJoin(shareLinks, eq(shareLinks.reportId, reports.id))
    .where(eq(analysisRuns.userId, userId))
    .orderBy(desc(reports.updatedAt));

  const latestByReport = new Map<number, TutorWorkspaceItem>();

  for (const row of rows) {
    if (latestByReport.has(row.report.id)) {
      continue;
    }

    const tutorReport = row.report.tutorReportJson as Record<string, any>;
    const shareStatus = row.shareLink ? buildShareStatus(row.shareLink) : 'not_shared';
    latestByReport.set(row.report.id, {
      reportId: row.report.id,
      childNickname: row.child.nickname,
      recommendedFocus:
        typeof tutorReport.recommendedFocus === 'string' ? tutorReport.recommendedFocus : null,
      secondaryFocus:
        typeof tutorReport.secondaryFocus === 'string' ? tutorReport.secondaryFocus : null,
      releaseStatus:
        typeof tutorReport.releaseStatus === 'string' ? tutorReport.releaseStatus : null,
      shareStatus,
      activeShareUrl:
        row.shareLink && shareStatus === 'active' ? `/share/${row.shareLink.token}` : null,
      lastUpdatedAt: row.report.updatedAt.toISOString(),
    });
  }

  return Array.from(latestByReport.values());
}
