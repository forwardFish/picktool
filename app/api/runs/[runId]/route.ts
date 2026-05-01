import { getUser } from '@/lib/db/queries';
import { getRunForUser } from '@/lib/family/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { runId } = await context.params;
  const run = await getRunForUser(user.id, Number(runId));

  if (!run) {
    return Response.json({ error: 'Run not found.' }, { status: 404 });
  }

  return Response.json(run);
}
