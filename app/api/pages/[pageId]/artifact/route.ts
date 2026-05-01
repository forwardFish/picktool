import { getUser } from '@/lib/db/queries';
import { getPageArtifactForUser } from '@/lib/family/repository';
import { readFamilyArtifact } from '@/lib/family/storage';

type RouteContext = {
  params: Promise<{ pageId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageId } = await context.params;
  const pageArtifact = await getPageArtifactForUser(user.id, Number(pageId));

  if (!pageArtifact) {
    return Response.json({ error: 'Page not found.' }, { status: 404 });
  }

  const artifact = await readFamilyArtifact(pageArtifact.storagePath);
  return new Response(artifact.body, {
    status: 200,
    headers: {
      'content-type': artifact.contentType,
      'cache-control': artifact.cacheControl,
      'x-content-type-options': 'nosniff',
    },
  });
}
