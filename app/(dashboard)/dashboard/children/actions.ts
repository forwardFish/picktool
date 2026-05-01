'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { ActivityType } from '@/lib/db/schema';
import { logActivity } from '@/lib/db/activity';
import {
  getChildByIdForUser,
  getUserWithTeam
} from '@/lib/db/queries';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import {
  archiveChildForUser,
  createChildForUser,
  updateChildForUser,
} from '@/lib/family/repository';

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();

const childBaseSchema = z.object({
  nickname: z.string().trim().min(1, 'Nickname is required.').max(100),
  grade: z.string().trim().min(1, 'Grade is required.').max(50),
  curriculum: z.string().trim().min(1, 'Curriculum is required.').max(100)
});

const createChildSchema = childBaseSchema.extend({
  resumeDraft: z.string().optional()
});

export const createChild = validatedActionWithUser(
  createChildSchema,
  async (data, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    const createdChild = await createChildForUser(user.id, {
      nickname: data.nickname,
      grade: data.grade,
      curriculum: data.curriculum,
    });

    if (!FAMILY_EDU_DEMO_MODE) {
      await logActivity(userWithTeam?.teamId, user.id, ActivityType.CREATE_CHILD);
    }

    if (data.resumeDraft === '1') {
      redirect(`/dashboard/children/${createdChild.id}/upload?resumeDraft=1`);
    }

    redirect(`/dashboard/children/${createdChild.id}`);
  }
);

const updateChildSchema = childBaseSchema.extend({
  childId: z.coerce.number().int().positive()
});

export const updateChild = validatedActionWithUser(
  updateChildSchema,
  async (data, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);
    const child = await getChildByIdForUser(user.id, data.childId);

    if (!child) {
      return { error: 'Child profile not found.' };
    }

    await updateChildForUser(user.id, data.childId, {
      nickname: data.nickname,
      grade: data.grade,
      curriculum: data.curriculum,
    });

    if (!FAMILY_EDU_DEMO_MODE) {
      await logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_CHILD);
    }

    return {
      success: 'Child profile updated successfully.',
      nickname: data.nickname,
      grade: data.grade,
      curriculum: data.curriculum
    };
  }
);

const archiveChildSchema = z.object({
  childId: z.coerce.number().int().positive()
});

export const archiveChild = validatedActionWithUser(
  archiveChildSchema,
  async (data, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);
    const child = await getChildByIdForUser(user.id, data.childId);

    if (!child) {
      return { error: 'Child profile not found.' };
    }

    await archiveChildForUser(user.id, data.childId);

    if (!FAMILY_EDU_DEMO_MODE) {
      await logActivity(userWithTeam?.teamId, user.id, ActivityType.ARCHIVE_CHILD);
    }

    redirect('/dashboard/children');
  }
);
