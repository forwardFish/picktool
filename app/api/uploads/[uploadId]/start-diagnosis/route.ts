import { getUser } from '@/lib/db/queries';
import { submitUploadForUser } from '@/lib/family/repository';

type RouteContext = {
  params: Promise<{ uploadId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId } = await context.params;
  const run = await submitUploadForUser(user.id, Number(uploadId));

  if (!run) {
    return Response.json({ error: 'Upload not found.' }, { status: 404 });
  }

  return Response.json(
    {
      runId: run.id,
      status: run.status,
      progressPercent: run.progressPercent,
    },
    { status: 201 }
  );
}
