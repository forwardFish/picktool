import { getUser } from '@/lib/db/queries';
import {
  getBillingPaywallSummary,
  getBillingSnapshotForUser,
  isReportUnlockedForUser,
} from '@/lib/family/billing';
import {
  deleteReportForUser,
  getDeepResearchReportForUser,
  updateReportPlanProgressForUser,
} from '@/lib/family/repository';
import { buildDeepResearchReportViewModel } from '@/lib/family/report-read-model';
import { localizeParentReport, resolveReportLocale } from '@/lib/reports/localize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await context.params;
  const report = await getDeepResearchReportForUser(user.id, Number(reportId));

  if (!report) {
    return Response.json({ error: 'Report not found.' }, { status: 404 });
  }

  const isUnlocked = await isReportUnlockedForUser(user.id, Number(reportId));
  if (!isUnlocked) {
    return Response.json(
      {
        error: 'Report is locked until payment is completed.',
        paywall: getBillingPaywallSummary(await getBillingSnapshotForUser(user.id)),
      },
      { status: 402 }
    );
  }

  const locale = resolveReportLocale(
    new URL(request.url).searchParams.get('locale'),
    user.locale || 'en-US'
  );
  const localizedParentReport = localizeParentReport(
    ((report.report as any).parentReportJson || {}) as any,
    locale
  );
  const localizedViewModel = buildDeepResearchReportViewModel({
    reportId: Number(reportId),
    parentReport: localizedParentReport,
    labels: localizedParentReport.labels,
    structured: report.structured,
    completedDays: localizedParentReport.completedDays,
  });

  return Response.json({
    ...report.report,
    parentReportJson: localizedParentReport,
    reportViewModel: localizedViewModel,
    requestedLocale: locale,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const completedDays = Array.isArray(body?.completedDays) ? body.completedDays : undefined;
  const parentNote =
    typeof body?.parentNote === 'string' || body?.parentNote === null
      ? body.parentNote
      : undefined;

  if (typeof completedDays === 'undefined' && typeof parentNote === 'undefined') {
    return Response.json(
      { error: 'Provide completedDays and/or parentNote.' },
      { status: 400 }
    );
  }

  const { reportId } = await context.params;
  const isUnlocked = await isReportUnlockedForUser(user.id, Number(reportId));
  if (!isUnlocked) {
    return Response.json(
      {
        error: 'Report is locked until payment is completed.',
        paywall: getBillingPaywallSummary(await getBillingSnapshotForUser(user.id)),
      },
      { status: 402 }
    );
  }

  const report = await updateReportPlanProgressForUser(
    user.id,
    Number(reportId),
    {
      completedDays: completedDays?.map((day: unknown) => Number(day)),
      parentNote,
    }
  );

  if (!report) {
    return Response.json({ error: 'Report not found.' }, { status: 404 });
  }

  const refreshed = await getDeepResearchReportForUser(user.id, Number(reportId));
  if (!refreshed) {
    return Response.json(report);
  }

  const localizedParentReport = localizeParentReport(
    ((refreshed.report as any).parentReportJson || {}) as any,
    user.locale || 'en-US'
  );

  return Response.json({
    ...refreshed.report,
    parentReportJson: localizedParentReport,
    reportViewModel: buildDeepResearchReportViewModel({
      reportId: Number(reportId),
      parentReport: localizedParentReport,
      labels: localizedParentReport.labels,
      structured: refreshed.structured,
      completedDays: localizedParentReport.completedDays,
    }),
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await context.params;
  const deleted = await deleteReportForUser(user.id, Number(reportId));

  if (!deleted) {
    return Response.json({ error: 'Report not found.' }, { status: 404 });
  }

  return Response.json({
    success: true,
    ...deleted,
  });
}
