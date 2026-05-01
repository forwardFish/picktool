import { getUser } from '@/lib/db/queries';
import { regenerateDeckActionsForUser } from '@/lib/family/deck-service';

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
  const deck = await regenerateDeckActionsForUser(
    user.id,
    Number(deckId),
    typeof body?.slideIndex === 'number' ? body.slideIndex : undefined
  );

  if (!deck) {
    return Response.json({ error: 'Unable to regenerate actions.' }, { status: 404 });
  }

  return Response.json(deck);
}
