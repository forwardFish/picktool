import { getUser } from '@/lib/db/queries';
import { generateDeckForReport } from '@/lib/family/deck-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await context.params;
  const deck = await generateDeckForReport(user.id, Number(reportId));

  if (!deck) {
    return Response.json({ error: 'Unable to generate deck.' }, { status: 404 });
  }

  return Response.json(deck);
}
