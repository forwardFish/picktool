import { getUser } from '@/lib/db/queries';
import { getDeckPlaybackForUser } from '@/lib/family/deck-service';

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
  const playback = await getDeckPlaybackForUser(user.id, Number(deckId));

  if (!playback) {
    return Response.json({ error: 'Playback not found.' }, { status: 404 });
  }

  return Response.json(playback);
}
