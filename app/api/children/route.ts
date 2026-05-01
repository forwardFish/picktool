import { z } from 'zod';
import { getChildrenForUser, getUser } from '@/lib/db/queries';
import { createChildForUser } from '@/lib/family/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const createChildSchema = z.object({
  nickname: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(50),
  curriculum: z.string().trim().min(1).max(100)
});

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const childList = await getChildrenForUser(user.id);
  return Response.json(childList);
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = createChildSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0]?.message || 'Invalid child payload.' },
      { status: 400 }
    );
  }

  const createdChild = await createChildForUser(user.id, {
    nickname: result.data.nickname,
    grade: result.data.grade,
    curriculum: result.data.curriculum,
  });

  return Response.json(createdChild, { status: 201 });
}
