import { z } from 'zod';
import { getChildByIdForUser, getUser } from '@/lib/db/queries';
import {
  archiveChildForUser,
  updateChildForUser,
} from '@/lib/family/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const updateChildSchema = z.object({
  nickname: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(50),
  curriculum: z.string().trim().min(1).max(100)
});

type RouteContext = {
  params: Promise<{ childId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { childId } = await context.params;
  const child = await getChildByIdForUser(user.id, Number(childId));

  if (!child) {
    return Response.json({ error: 'Child not found' }, { status: 404 });
  }

  return Response.json(child);
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { childId } = await context.params;
  const child = await getChildByIdForUser(user.id, Number(childId));

  if (!child) {
    return Response.json({ error: 'Child not found' }, { status: 404 });
  }

  const body = await request.json();
  const result = updateChildSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0]?.message || 'Invalid child payload.' },
      { status: 400 }
    );
  }

  const updatedChild = await updateChildForUser(user.id, child.id, {
    nickname: result.data.nickname,
    grade: result.data.grade,
    curriculum: result.data.curriculum,
  });

  return Response.json(updatedChild);
}

export async function DELETE(_: Request, context: RouteContext) {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { childId } = await context.params;
  const child = await getChildByIdForUser(user.id, Number(childId));

  if (!child) {
    return Response.json({ error: 'Child not found' }, { status: 404 });
  }

  await archiveChildForUser(user.id, child.id);

  return Response.json({ success: true });
}
