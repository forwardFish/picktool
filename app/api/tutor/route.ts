import { getUser } from '@/lib/db/queries';
import { listTutorWorkspaceForUser } from '@/lib/family/tutor-workspace';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await listTutorWorkspaceForUser(user.id);
  return Response.json({
    scope: 'owner',
    viewerRole: 'parent_owner',
    items,
  });
}
