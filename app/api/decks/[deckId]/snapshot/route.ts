import { getUser } from '@/lib/db/queries';
import {
  getDeckPlaybackSnapshotForUser,
  saveDeckPlaybackSnapshotForUser,
} from '@/lib/family/decks';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ deckId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deckId } = await context.params;
  const snapshot = await getDeckPlaybackSnapshotForUser(user.id, Number(deckId));

  if (!snapshot) {
    return Response.json({ error: 'Snapshot not found.' }, { status: 404 });
  }

  return Response.json(snapshot);
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: 'Invalid snapshot payload.' }, { status: 400 });
  }

  const { deckId } = await context.params;
  const snapshot = await saveDeckPlaybackSnapshotForUser(user.id, Number(deckId), {
    currentSlideIndex: Number(body.currentSlideIndex || 0),
    currentActionIndex: Number(body.currentActionIndex || 0),
    playbackState:
      body.playbackState === 'playing' ||
      body.playbackState === 'paused' ||
      body.playbackState === 'stopped'
        ? body.playbackState
        : 'idle',
    voiceEnabled: Boolean(body.voiceEnabled),
    snapshotJson:
      body.snapshotJson && typeof body.snapshotJson === 'object'
        ? body.snapshotJson
        : {},
  });

  if (!snapshot) {
    return Response.json({ error: 'Unable to save snapshot.' }, { status: 404 });
  }

  return Response.json(snapshot);
}
