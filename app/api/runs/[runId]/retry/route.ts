import { getUser } from '@/lib/db/queries';
import { retryRunForUser } from '@/lib/family/repository';

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { runId } = await context.params;
  const run = await retryRunForUser(user.id, Number(runId));

  if (!run) {
    return Response.json({ error: 'Run not found.' }, { status: 404 });
  }

  return Response.json(run);
}
