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
  const exports = await createDeckExportForUser(user.id, Number(deckId), 'pdf', {
    requestedBy: user.id,
  });

  if (!exports || exports.length === 0) {
    return Response.json({ error: 'Unable to create PDF export.' }, { status: 404 });
  }

  const latest = exports[0];
  const updated = await updateDeckExportForUser(user.id, Number(deckId), latest.id, {
    status: 'ready',
    artifactPath: `/exports/decks/${deckId}/guided-walkthrough.pdf.json`,
    metadata: {
      ...latest.metadata,
      formatLabel: 'Guided Walkthrough PDF',
      role: 'secondary_export',
    },
    completedAt: new Date().toISOString(),
  });

  return Response.json(updated);
}
