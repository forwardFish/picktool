import { getUser } from '@/lib/db/queries';
import { getUploadForUser } from '@/lib/family/repository';

type RouteContext = {
  params: Promise<{ uploadId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId } = await context.params;
  const snapshot = await getUploadForUser(user.id, Number(uploadId));

  if (!snapshot) {
    return Response.json({ error: 'Upload not found.' }, { status: 404 });
  }

  return Response.json(snapshot);
}
