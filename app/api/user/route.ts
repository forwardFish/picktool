import { getUser } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const user = await getUser();
  if (user) {
    return Response.json(user);
  }

  const session = await getSession();
  if (session?.user?.id) {
    return Response.json({
      id: session.user.id,
      name: 'Pathnook Parent',
      email: `member-${session.user.id}@pathnook.local`,
      role: 'owner',
    });
  }

  return Response.json(null);
}
