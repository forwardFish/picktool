import { notFound } from 'next/navigation';
import { DeckReviewActions } from '@/components/admin/deck-review-actions';
import { GuidedWalkthroughPlayer } from '@/components/reports/guided-walkthrough-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/db/queries';
import { getAdminReviewDetail } from '@/lib/family/admin-review';
import { canAccessAdminReview } from '@/lib/family/admin-review-auth';
import { ensureDeckForReport, getDeckPlaybackForUser } from '@/lib/family/deck-service';

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function AdminDeckReviewPage({ params }: PageProps) {
  const [{ runId }, user] = await Promise.all([params, getUser()]);
  if (!user || !canAccessAdminReview(user)) {
    notFound();
  }

  const detail = await getAdminReviewDetail(Number(runId));
  if (!detail || !detail.report) {
    notFound();
  }

  const deck = await ensureDeckForReport(user.id, detail.report.id);
  if (!deck) {
    notFound();
  }

  const playback = await getDeckPlaybackForUser(user.id, deck.deck.id);
  if (!playback) {
    notFound();
  }

  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-600">
          Admin Deck Review
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">Internal deck trial playback</h1>
        <p className="mt-2 text-sm text-gray-600">
          Use this internal surface to inspect the current deck tier, trial playback, and regenerate draft content before approval.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Review summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-gray-700">
          <p><span className="font-medium text-gray-900">Run:</span> {detail.run.id}</p>
          <p><span className="font-medium text-gray-900">Status:</span> {detail.run.status}</p>
          <p><span className="font-medium text-gray-900">Deck tier:</span> {playback.tier}</p>
          <p><span className="font-medium text-gray-900">Review reason:</span> {detail.run.needsReviewReason || 'None'}</p>
          <div className="pt-2">
            <DeckReviewActions runId={detail.run.id} deckId={playback.deckId} />
          </div>
        </CardContent>
      </Card>
      <GuidedWalkthroughPlayer
        playback={playback}
        snapshotEndpoint={`/api/decks/${playback.deckId}/snapshot`}
      />
    </section>
  );
}
