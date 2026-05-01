import { notFound } from 'next/navigation';
import { GuidedWalkthroughPlayer } from '@/components/reports/guided-walkthrough-player';
import { getUser } from '@/lib/db/queries';
import { ensureDeckForReport, getDeckPlaybackForUser } from '@/lib/family/deck-service';

type PageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportPlayPage({ params }: PageProps) {
  const [{ reportId }, user] = await Promise.all([params, getUser()]);
  if (!user) {
    notFound();
  }

  const deck = await ensureDeckForReport(user.id, Number(reportId));
  if (!deck) {
    notFound();
  }

  const playback = await getDeckPlaybackForUser(user.id, deck.deck.id);
  if (!playback) {
    notFound();
  }

  if (playback.walkthroughVisibility === 'hidden') {
    return (
      <section className="space-y-6">
        <section className="pn-section-card">
          <h1 className="text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
            Guided Walkthrough is not available for this report yet.
          </h1>
          <div className="mt-3 text-sm leading-7 text-[var(--pn-muted)]">
            This deck is currently in the D-tier hidden state. Keep the report, evidence, and
            7-day plan as the main value layer.
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="pn-section-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
          <span>Reports</span>
          <span>/</span>
          <span>Overview</span>
          <span>/</span>
          <span className="text-[#111827]">Guided Walkthrough</span>
        </div>
        <h1 className="pn-section-title mt-4">
          {deck.deck.title || 'Visual explanation and review steps'}
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--pn-muted)]">
          This walkthrough is generated from the live diagnosis deck and playback snapshot for this
          report. Voice guidance stays off by default.
        </p>
      </section>

      <GuidedWalkthroughPlayer
        playback={playback}
        snapshotEndpoint={`/api/decks/${playback.deckId}/snapshot`}
      />
    </section>
  );
}
