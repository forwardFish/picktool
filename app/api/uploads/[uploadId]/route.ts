import { getUser } from '@/lib/db/queries';
import { deleteUploadForUser, getUploadForUser } from '@/lib/family/repository';

type RouteContext = {
  params: Promise<{ uploadId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId } = await context.params;
  const upload = await getUploadForUser(user.id, Number(uploadId));
  if (!upload) {
    return Response.json({ error: 'Upload not found.' }, { status: 404 });
  }

  const deleted = await deleteUploadForUser(user.id, Number(uploadId));
  if (!deleted) {
    return Response.json({ error: 'Upload not found.' }, { status: 404 });
  }

  return Response.json({
    success: true,
    ...deleted,
  });
}
