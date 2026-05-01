import { getUser } from '@/lib/db/queries';
import { getDeckForReport } from '@/lib/family/decks';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await context.params;
  const deck = await getDeckForReport(user.id, Number(reportId));

  if (!deck) {
    return Response.json({ error: 'Deck not found.' }, { status: 404 });
  }

  return Response.json(deck);
}
