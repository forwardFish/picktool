import { getSharedReportByToken } from '@/lib/family/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { token } = await context.params;
  const payload = await getSharedReportByToken(token);

  if (payload.status === 'missing') {
    return Response.json({ error: 'Share link not found.', status: payload.status }, { status: 404 });
  }

  if (payload.status === 'revoked' || payload.status === 'expired') {
    return Response.json({ error: 'Share link is not active.', status: payload.status }, { status: 410 });
  }

  return Response.json(payload);
}
