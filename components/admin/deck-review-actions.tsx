'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Props = {
  runId: number;
  deckId: number;
};

export function DeckReviewActions({ runId, deckId }: Props) {
  const [pending, setPending] = useState<'slide' | 'actions' | null>(null);

  async function invoke(endpoint: string, nextPending: 'slide' | 'actions') {
    try {
      setPending(nextPending);
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slideIndex: 0 }),
      });
      window.location.reload();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={() => invoke(`/api/decks/${deckId}/regenerate-slide`, 'slide')}
        disabled={pending !== null}
      >
        {pending === 'slide' ? 'Regenerating slide...' : 'Regenerate slide'}
      </Button>
      <Button
        variant="outline"
        onClick={() => invoke(`/api/decks/${deckId}/regenerate-actions`, 'actions')}
        disabled={pending !== null}
      >
        {pending === 'actions' ? 'Regenerating actions...' : 'Regenerate actions'}
      </Button>
      <Button asChild variant="outline">
        <Link href={`/admin/review/${runId}`}>Approve or reject</Link>
      </Button>
    </div>
  );
}
