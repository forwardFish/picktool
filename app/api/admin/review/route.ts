import { getUser } from '@/lib/db/queries';
import { listAdminReviewQueue } from '@/lib/family/admin-review';
import { canAccessAdminReview } from '@/lib/family/admin-review-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canAccessAdminReview(user)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const items = await listAdminReviewQueue();
  return Response.json({ items });
}
