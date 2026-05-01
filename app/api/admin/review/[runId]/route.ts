import { z } from 'zod';
import { getUser } from '@/lib/db/queries';
import {
  getAdminReviewDetail,
  updateAdminReviewCopy,
} from '@/lib/family/admin-review';
import { canAccessAdminReview } from '@/lib/family/admin-review-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const patchSchema = z
  .object({
    summary: z.string().trim().min(1).max(800).optional(),
    doThisWeek: z.string().trim().min(1).max(800).optional(),
    notNow: z.string().trim().min(1).max(800).optional(),
    reviewBanner: z.string().trim().min(1).max(800).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one copy field to update.',
  });

type RouteContext = {
  params: Promise<{ runId: string }>;
};

function toRunId(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_: Request, context: RouteContext) {
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

  const detail = await getAdminReviewDetail(parsedRunId);
  if (!detail) {
    return Response.json({ error: 'Review run not found.' }, { status: 404 });
  }

  return Response.json(detail);
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const body = await request.json().catch(() => null);
  const result = patchSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0]?.message || 'Invalid admin review payload.' },
      { status: 400 }
    );
  }

  const detail = await updateAdminReviewCopy(parsedRunId, user, result.data);
  if (!detail) {
    return Response.json({ error: 'Review run not found.' }, { status: 404 });
  }

  return Response.json(detail);
}
