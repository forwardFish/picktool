import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  shareLinks,
  reviewHistories,
  reportCompareSnapshots,
  reportDiagnosisOutlines,
  reportOutputGates,
  reportReviewSnapshots,
  reports,
  reportSevenDayPlans,
  reportShareArtifacts,
  reportShortestPaths,
} from '@/lib/db/schema';
import type { ComposedReportPayload } from '@/lib/family/report-composer';

export async function deleteStructuredReportReadModel(reportId: number) {
  await db.delete(reportOutputGates).where(eq(reportOutputGates.reportId, reportId));
  await db.delete(reportSevenDayPlans).where(eq(reportSevenDayPlans.reportId, reportId));
  await db.delete(reportDiagnosisOutlines).where(eq(reportDiagnosisOutlines.reportId, reportId));
  await db.delete(reportShortestPaths).where(eq(reportShortestPaths.reportId, reportId));
  await db.delete(reportCompareSnapshots).where(eq(reportCompareSnapshots.reportId, reportId));
  await db.delete(reportShareArtifacts).where(eq(reportShareArtifacts.reportId, reportId));
  await db.delete(reportReviewSnapshots).where(eq(reportReviewSnapshots.reportId, reportId));
  await db.delete(reviewHistories).where(eq(reviewHistories.reportId, reportId));
}

export async function deleteReportsForRun(runId: number) {
  const linkedReports = await db
    .select({ id: reports.id })
    .from(reports)
    .where(eq(reports.runId, runId));

  for (const linkedReport of linkedReports) {
    await deleteStructuredReportReadModel(linkedReport.id);
    await db.delete(shareLinks).where(eq(shareLinks.reportId, linkedReport.id));
  }

  await db.delete(reports).where(eq(reports.runId, runId));
}

export async function upsertReportReadModel(args: {
  reportId: number;
  payload: ComposedReportPayload;
}) {
  const { reportId, payload } = args;
  await deleteStructuredReportReadModel(reportId);

  await db.insert(reportDiagnosisOutlines).values({
    reportId,
    ...payload.structured.diagnosisOutline,
  });

  await db.insert(reportShortestPaths).values({
    reportId,
    ...payload.structured.shortestPath,
  });

  if (payload.structured.outputGates.length > 0) {
    await db.insert(reportOutputGates).values(
      payload.structured.outputGates.map((gate) => ({
        reportId,
        gateCode: gate.gateCode,
        title: gate.title || '',
        status: gate.status || 'Optional',
        body: gate.body || '',
        whatThisVerifies: gate.whatThisVerifies || '',
        howToCheck: gate.howToCheck || '',
        sortOrder: gate.sortOrder,
      }))
    );
  }

  if (payload.structured.sevenDayPlans.length > 0) {
    await db.insert(reportSevenDayPlans).values(
      payload.structured.sevenDayPlans.map((day) => ({
        reportId,
        dayNumber: day.dayNumber,
        goal: day.goal,
        practice: day.practice,
        parentPrompt: day.parentPrompt,
        successSignal: day.successSignal,
        sortOrder: day.sortOrder,
      }))
    );
  }

  await db.insert(reportCompareSnapshots).values({
    reportId,
    ...payload.structured.compareSnapshot,
  });

  await db.insert(reportShareArtifacts).values({
    reportId,
    ...payload.structured.shareArtifact,
  });

  await db.insert(reportReviewSnapshots).values({
    reportId,
    ...payload.structured.reviewSnapshot,
  });
}
