import { getUser } from '@/lib/db/queries';
import { approveAdminReview } from '@/lib/family/admin-review';
import { canAccessAdminReview } from '@/lib/family/admin-review-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ runId: string }>;
};

function toRunId(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canAccessAdminReview(user)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { runId } = await context.params;
  const parsedRunId = toRunId(runId);
  if (!parsedRunId) {
    return Response.json({ error: 'A valid run id is required.' }, { status: 400 });
  }

  const detail = await approveAdminReview(parsedRunId, user);
  if (!detail) {
    return Response.json({ error: 'Review run not found.' }, { status: 404 });
  }

  return Response.json(detail);
}
