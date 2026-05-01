import { getUser } from '@/lib/db/queries';
import { getFamilyRuntimeAudit } from '@/lib/family/runtime-audit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const audit = await getFamilyRuntimeAudit();
  return Response.json(audit);
}
