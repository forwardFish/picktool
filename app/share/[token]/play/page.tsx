import { GuidedWalkthroughPlayer } from '@/components/reports/guided-walkthrough-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSharedDeckPlayback } from '@/lib/family/deck-service';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedWalkthroughPage({ params }: PageProps) {
  const { token } = await params;
  const payload = await getSharedDeckPlayback(token);

  if (payload.status !== 'active' || !payload.playback) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {payload.status === 'expired'
                ? 'This walkthrough link has expired.'
                : payload.status === 'revoked'
                  ? 'This walkthrough link has been revoked.'
                  : payload.status === 'blocked'
                    ? 'This walkthrough is not available for share playback.'
                    : 'This walkthrough could not be found.'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Ask the parent to generate a new shared walkthrough if they still want tutor review.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-12">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-600">
          Guided Walkthrough
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">Tutor read-only visual explanation</h1>
        <p className="mt-2 text-sm text-gray-600">
          This shared walkthrough is read-only and omits parent-only notes and private owner context.
        </p>
      </div>
      <GuidedWalkthroughPlayer playback={payload.playback} readOnly />
    </main>
  );
}
