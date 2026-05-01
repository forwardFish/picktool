import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/db/queries';
import { listAdminReviewQueue } from '@/lib/family/admin-review';
import type { AdminReviewQueueItem } from '@/lib/family/admin-review';
import { canAccessAdminReview } from '@/lib/family/admin-review-auth';

function formatConfidence(value: number | null) {
  return typeof value === 'number'
    ? `${Math.round(value * 100)}% confidence`
    : 'Confidence pending';
}

export default async function AdminReviewQueuePage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in?redirect=/admin/review');
  }

  if (!canAccessAdminReview(user)) {
    redirect('/dashboard');
  }

  const items: AdminReviewQueueItem[] = await listAdminReviewQueue();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-600">
            Internal Review Queue
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">Admin review queue</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Reviewers can inspect every low-confidence run here, adjust display copy, request more
            photos, and approve the report for parent reading.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Needs review now</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-gray-900">
            {items.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>High-friction uploads</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            Runs with multiple dark, rotated, or blurry pages surface first because they are most
            likely to need a re-upload request.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Action contract</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            Approve, request more photos, or adjust display copy only. Structured findings stay
            unchanged until the source evidence changes.
          </CardContent>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-600">
            No runs are currently waiting for internal review.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item: AdminReviewQueueItem) => (
            <Card key={item.runId}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{item.childNickname}</CardTitle>
                  <p className="mt-2 text-sm text-gray-600">
                    Run #{item.runId} • {item.sourceType} • {item.pageCount} pages
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  {item.status.replace('_', ' ')}
                </span>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">Primary finding</p>
                    <p className="mt-1">{item.topFinding}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">Quality issues</p>
                    <p className="mt-1">{item.qualityIssueCount} flagged pages</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="font-medium text-gray-900">
                    {formatConfidence(item.overallConfidence)}
                  </p>
                  <p className="mt-2 text-gray-600">
                    {item.needsReviewReason ||
                      item.reviewBanner ||
                      'Reviewer confirmation is required before release.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/admin/review/${item.runId}`}>Open Review</Link>
                  </Button>
                  {item.reportId ? (
                    <Button asChild variant="outline">
                      <Link href={`/admin/review/${item.runId}/deck`}>Open Deck Review</Link>
                    </Button>
                  ) : null}
                  {item.reportId ? (
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/reports/${item.reportId}`}>Open Draft Report</Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
