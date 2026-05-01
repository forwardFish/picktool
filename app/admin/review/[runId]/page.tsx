import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AdminReviewActions } from '@/components/admin/admin-review-actions';
import { ReportTabsClient } from '@/components/reports/report-tabs-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/db/queries';
import { getAdminReviewDetail } from '@/lib/family/admin-review';
import { canAccessAdminReview } from '@/lib/family/admin-review-auth';
import { buildDeepResearchReportViewModel } from '@/lib/family/report-read-model';
import { localizeParentReport } from '@/lib/reports/localize';

type PageProps = {
  params: Promise<{ runId: string }>;
};

function getQualityFlags(flags: {
  blurry: boolean;
  rotated: boolean;
  dark: boolean;
  lowContrast: boolean;
}) {
  return [
    flags.blurry ? 'blurry' : null,
    flags.rotated ? 'rotated' : null,
    flags.dark ? 'dark' : null,
    flags.lowContrast ? 'low contrast' : null,
  ]
    .filter(Boolean)
    .join(', ');
}

export default async function AdminReviewDetailPage({ params }: PageProps) {
  const [{ runId }, user] = await Promise.all([params, getUser()]);

  if (!user) {
    redirect(`/sign-in?redirect=/admin/review/${runId}`);
  }

  if (!canAccessAdminReview(user)) {
    redirect('/dashboard');
  }

  const detail = await getAdminReviewDetail(Number(runId));
  if (!detail) {
    notFound();
  }

  const parentReport = localizeParentReport(
    (detail.report?.parentReportJson || {}) as any,
    user.locale || 'en-US'
  );
  const reportViewModel = buildDeepResearchReportViewModel({
    reportId: detail.run.reportId || detail.run.id,
    parentReport,
    labels: parentReport.labels,
    structured: {
      diagnosisOutline: null,
      shortestPath: null,
      outputGates: [],
      sevenDayPlans: [],
      compareSnapshot: null,
      shareArtifact: null,
      reviewSnapshot: null,
      reviewHistories: [],
      issueTrends: [],
    },
    completedDays: parentReport.completedDays,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-600">
            Admin Review Detail
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Run #{detail.run.id} for {detail.child.nickname}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Confirm the source pages, scan the structured extraction, and finalize only the
            reviewer-facing wording before release.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/review">Back to Queue</Link>
          </Button>
          {detail.run.reportId ? (
            <Button asChild variant="outline">
              <Link href={`/admin/review/${detail.run.id}/deck`}>Open Deck Review</Link>
            </Button>
          ) : null}
          {detail.run.reportId ? (
            <Button asChild variant="outline">
              <Link href={`/dashboard/reports/${detail.run.reportId}`}>Open Parent Draft</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Status</p>
                <p className="mt-1">{detail.run.status.replace('_', ' ')}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Confidence</p>
                <p className="mt-1">
                  {typeof detail.run.overallConfidence === 'number'
                    ? `${Math.round(detail.run.overallConfidence * 100)}%`
                    : 'Pending'}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Source</p>
                <p className="mt-1">
                  {detail.upload.sourceType} • {detail.upload.totalPages} pages
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Review reason</p>
                <p className="mt-1">
                  {detail.run.needsReviewReason ||
                    'Reviewer confirmation is still required.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviewer actions</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminReviewActions
                runId={detail.run.id}
                runStatus={detail.run.status}
                initialSummary={String(parentReport.summary || '')}
                initialDoThisWeek={String(parentReport.doThisWeek || '')}
                initialNotNow={String(parentReport.notNow || '')}
                initialReviewBanner={String(parentReport.reviewBanner || '')}
                initialRequestMessage={String(
                  parentReport.reviewReason || detail.run.needsReviewReason || ''
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detail.pages.map((page) => {
                const flagSummary = getQualityFlags(page.qualityFlags);
                return (
                  <div key={page.id} className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Page {page.pageNumber} • {page.previewLabel}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Quality score {page.qualityScore}
                          {flagSummary ? ` • ${flagSummary}` : ' • no flags'}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={`/api/pages/${page.id}/artifact#page=${page.pageNumber}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Page
                        </a>
                      </Button>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      <iframe
                        title={`Review page ${page.pageNumber}`}
                        src={`/api/pages/${page.id}/artifact#page=${page.pageNumber}`}
                        className="h-64 w-full"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Structured extraction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detail.extractionItems.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Extraction items will appear here once the diagnosis bundle is available.
                </p>
              ) : (
                detail.extractionItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-700"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-900">
                      <span>Page {item.pageNo}</span>
                      <span>{item.problemNo}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                        {item.previewLabel}
                      </span>
                    </div>
                    <p className="mt-3">{item.problemText}</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                          Student work
                        </p>
                        <p className="mt-2">{item.studentWork}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                          Reviewer rationale
                        </p>
                        <p className="mt-2">{item.rationale}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                        teacher mark: {item.teacherMark}
                      </span>
                      {typeof item.itemConfidence === 'number' ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                          item confidence: {Math.round(item.itemConfidence * 100)}%
                        </span>
                      ) : null}
                      {item.labels.map((label) => (
                        <span
                          key={`${item.id}-${label.code}`}
                          className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700"
                        >
                          {label.displayName} • {label.severity}
                          {typeof label.confidence === 'number'
                            ? ` • ${Math.round(label.confidence * 100)}%`
                            : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
            <CardTitle>Draft report preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTabsClient
                reportViewModel={reportViewModel}
                activeTab="diagnosis"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {detail.auditTrail.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No manual review actions have been recorded for this run yet.
                </p>
              ) : (
                detail.auditTrail.map((entry, index) => (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-700"
                  >
                    <p className="font-medium text-gray-900">
                      {entry.action.replaceAll('_', ' ')} by {entry.reviewerEmail}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{entry.timestamp}</p>
                    {entry.note ? <p className="mt-2">{entry.note}</p> : null}
                    {entry.fields?.length ? (
                      <p className="mt-2 text-xs text-gray-500">
                        fields: {entry.fields.join(', ')}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
