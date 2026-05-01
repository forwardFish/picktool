import { getUser } from '@/lib/db/queries';
import {
  createDeckExportForUser,
  updateDeckExportForUser,
} from '@/lib/family/decks';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ deckId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deckId } = await context.params;
  const exports = await createDeckExportForUser(user.id, Number(deckId), 'h5', {
    requestedBy: user.id,
  });

  if (!exports || exports.length === 0) {
    return Response.json({ error: 'Unable to create H5 export.' }, { status: 404 });
  }

  const latest = exports[0];
  const updated = await updateDeckExportForUser(user.id, Number(deckId), latest.id, {
    status: 'ready',
    artifactPath: `/exports/decks/${deckId}/guided-walkthrough.h5.json`,
    metadata: {
      ...latest.metadata,
      formatLabel: 'Guided Walkthrough H5',
    },
    completedAt: new Date().toISOString(),
  });

  return Response.json(updated);
}
