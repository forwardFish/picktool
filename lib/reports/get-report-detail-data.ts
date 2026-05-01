import 'server-only';

import { isReportUnlockedForUser } from '@/lib/family/billing';
import { getDeckForReport } from '@/lib/family/decks';
import { buildDeepResearchReportViewModel } from '@/lib/family/report-read-model';
import { getDeepResearchReportForUser, listShareLinksForReport } from '@/lib/family/repository';
import { getReportLabels, localizeParentReport, resolveReportLocale } from '@/lib/reports/localize';

export async function getReportDetailData(
  userId: number,
  reportId: number,
  requestedLocale?: string | null,
  userLocale?: string | null
) {
  const deepReport = await getDeepResearchReportForUser(userId, reportId);
  if (!deepReport) {
    return null;
  }

  const isUnlocked = await isReportUnlockedForUser(userId, reportId);
  const locale = resolveReportLocale(requestedLocale || null, userLocale || 'en-US');
  const labels = getReportLabels(locale);
  const localizedParentReport = localizeParentReport(
    ((deepReport.report as any).parentReportJson || {}) as any,
    locale
  );
  const reportViewModel = buildDeepResearchReportViewModel({
    reportId,
    parentReport: localizedParentReport,
    labels: localizedParentReport.labels,
    structured: deepReport.structured,
    completedDays: localizedParentReport.completedDays,
  });
  const [shareLinks, deck] = await Promise.all([
    listShareLinksForReport(userId, reportId),
    isUnlocked ? getDeckForReport(userId, reportId) : Promise.resolve(null),
  ]);

  return {
    locale,
    labels,
    isUnlocked,
    report: deepReport.report,
    parentReport: localizedParentReport,
    reportViewModel,
    evidenceGroups: localizedParentReport.evidenceGroups || [],
    shareState: {
      count: shareLinks.length,
      latestCreatedAt: shareLinks[0]?.createdAt || null,
      hasActiveShare: shareLinks.some((link) => !link.revokedAt),
    },
    qualityGate: {
      releaseStatus: reportViewModel.review.releaseStatus || null,
      reviewReason: reportViewModel.review.reviewReason || null,
      readyCount: reportViewModel.outputGates.readyCount || 0,
      optionalCount: reportViewModel.outputGates.optionalCount || 0,
    },
    deck,
  };
}
