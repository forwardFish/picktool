import { getSharedDeckPlayback } from '@/lib/family/deck-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { token } = await context.params;
  const payload = await getSharedDeckPlayback(token);

  if (payload.status === 'missing') {
    return Response.json({ error: 'Deck playback not found.', status: payload.status }, { status: 404 });
  }

  if (payload.status === 'revoked' || payload.status === 'expired') {
    return Response.json({ error: 'Deck playback is not active.', status: payload.status }, { status: 410 });
  }

  if (payload.status === 'blocked') {
    return Response.json({ error: 'Deck playback is blocked.', status: payload.status }, { status: 403 });
  }

  return Response.json(payload);
}
