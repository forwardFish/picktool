import { getUser } from '@/lib/db/queries';
import { isReportUnlockedForUser } from '@/lib/family/billing';
import {
  createShareLinkForReport,
  revokeShareLinkForReport,
} from '@/lib/family/repository';
import { getRequestBaseUrl } from '@/lib/runtime/base-url';

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await context.params;
  const isUnlocked = await isReportUnlockedForUser(user.id, Number(reportId));
  if (!isUnlocked) {
    return Response.json(
      { error: 'Complete billing before sharing this report.' },
      { status: 402 }
    );
  }
  const shareLink = await createShareLinkForReport(user.id, Number(reportId));

  if (!shareLink) {
    return Response.json({ error: 'Report not found.' }, { status: 404 });
  }

  return Response.json(
    {
      ...shareLink,
      shareUrl: `${getRequestBaseUrl(request)}/share/${shareLink.token}`,
    },
    { status: 201 }
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await context.params;
  const isUnlocked = await isReportUnlockedForUser(user.id, Number(reportId));
  if (!isUnlocked) {
    return Response.json(
      { error: 'Complete billing before sharing this report.' },
      { status: 402 }
    );
  }
  const token = new URL(request.url).searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'token is required.' }, { status: 400 });
  }

  const shareLink = await revokeShareLinkForReport(user.id, Number(reportId), token);
  if (!shareLink) {
    return Response.json({ error: 'Share link not found.' }, { status: 404 });
  }

  return Response.json(shareLink);
}
