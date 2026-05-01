import Link from 'next/link';
import { getSharedReportByToken } from '@/lib/family/repository';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedReportPage({ params }: PageProps) {
  const { token } = await params;
  const payload = await getSharedReportByToken(token);

  if (payload.status !== 'active' || !payload.report) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {payload.status === 'expired'
                ? 'This share link has expired.'
                : payload.status === 'revoked'
                  ? 'This share link has been revoked.'
                  : 'This share link could not be found.'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Ask the parent to generate a new tutor-ready share summary if they still want to collaborate.
          </CardContent>
        </Card>
      </main>
    );
  }

  const tutorReport = payload.report.tutorReportJson as Record<string, any>;
  const evidenceGroups = Array.isArray(tutorReport.evidenceGroups)
    ? tutorReport.evidenceGroups
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-12">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-600">
          Tutor-ready Share
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          {payload.report.child?.nickname || 'Student'} intake snapshot
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This shared view is read-only and intentionally omits parent-only notes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>{tutorReport.recommendedFocus || 'Focus unavailable.'}</p>
          {tutorReport.notes ? <p>{tutorReport.notes}</p> : null}
          <Button asChild variant="outline">
            <Link href={`/share/${token}/play`}>Open Guided Walkthrough</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {evidenceGroups.map((group: any, index: number) => (
          <Card key={`${group.code || group.displayName}-${index}`}>
            <CardHeader>
              <CardTitle>{group.displayName || 'Evidence group'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>{group.description}</p>
              {(group.items || []).map((item: any, itemIndex: number) => (
                <div key={`${item.pageNo}-${item.problemNo}-${itemIndex}`} className="rounded-2xl border border-gray-200 p-4">
                  <p className="font-medium text-gray-900">
                    Page {item.pageNo} / {item.problemNo}
                  </p>
                  <p className="mt-2">{item.problemText}</p>
                  <p className="mt-2 text-gray-600">{item.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
