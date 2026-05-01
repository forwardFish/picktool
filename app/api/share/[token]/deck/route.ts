import { getSharedDeckByToken } from '@/lib/family/decks';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { token } = await context.params;
  const payload = await getSharedDeckByToken(token);

  if (payload.status === 'missing') {
    return Response.json({ error: 'Deck share not found.', status: payload.status }, { status: 404 });
  }

  if (payload.status === 'revoked' || payload.status === 'expired') {
    return Response.json({ error: 'Deck share is not active.', status: payload.status }, { status: 410 });
  }

  if (payload.status === 'blocked') {
    return Response.json({ error: 'Deck share playback is blocked.', status: payload.status }, { status: 403 });
  }

  return Response.json(payload);
}
