import { getUser } from '@/lib/db/queries';
import { regenerateDeckSlideForUser } from '@/lib/family/deck-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ deckId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { deckId } = await context.params;
  const deck = await regenerateDeckSlideForUser(
    user.id,
    Number(deckId),
    Number(body?.slideIndex || 0)
  );

  if (!deck) {
    return Response.json({ error: 'Unable to regenerate slide.' }, { status: 404 });
  }

  return Response.json(deck);
}
