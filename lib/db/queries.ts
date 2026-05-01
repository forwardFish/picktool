import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, children, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import {
  getStoredDemoParentProfile,
  toDemoUser,
} from '@/lib/family/demo-auth';
import {
  isFamilyEduDemoAutoAuth,
  isFamilyEduDemoMode,
} from '@/lib/family/config';
import {
  getChildForUser,
  listActivityForUser,
  listChildrenForUser,
} from '@/lib/family/repository';

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();
const FAMILY_EDU_DEMO_AUTO_AUTH = isFamilyEduDemoAutoAuth();

async function createDemoUser() {
  return toDemoUser(await getStoredDemoParentProfile());
}

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('fetch failed') ||
    message.includes('connection') ||
    message.includes('network') ||
    message.includes('neon')
  );
}

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return FAMILY_EDU_DEMO_MODE && FAMILY_EDU_DEMO_AUTO_AUTH
      ? await createDemoUser()
      : null;
  }

  let sessionData;
  try {
    sessionData = await verifyToken(sessionCookie.value);
  } catch {
    return FAMILY_EDU_DEMO_MODE && FAMILY_EDU_DEMO_AUTO_AUTH
      ? await createDemoUser()
      : null;
  }

  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  let user;
  try {
    user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);
  } catch (error) {
    if (FAMILY_EDU_DEMO_MODE) {
      return createDemoUser();
    }
    if (isDatabaseConnectionError(error)) {
      console.error('Database unavailable while loading current user:', error);
      return null;
    }
    throw error;
  }

  if (user.length === 0) {
    return FAMILY_EDU_DEMO_MODE ? createDemoUser() : null;
  }

  return user[0];
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    const demoUser = await createDemoUser();
    return demoUser.email.toLowerCase() === normalizedEmail ? demoUser : null;
  }

  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.email, normalizedEmail), isNull(users.deletedAt)))
    .limit(1);

  return result[0] || null;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const demoUser = await createDemoUser();
    return {
      user: demoUser,
      teamId: 1,
    };
  }

  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (FAMILY_EDU_DEMO_MODE) {
    return listActivityForUser(user.id);
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    return {
      id: 1,
      name: 'Demo Household',
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: 'demo',
      subscriptionStatus: 'active',
      teamMembers: [
        {
          id: 1,
          userId: user.id,
          teamId: 1,
          role: 'owner',
          joinedAt: new Date(),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      ],
    };
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export async function getChildrenForUser(userId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return listChildrenForUser(userId);
  }

  return db
    .select()
    .from(children)
    .where(and(eq(children.userId, userId), isNull(children.deletedAt)))
    .orderBy(desc(children.updatedAt));
}

export async function getChildrenForCurrentUser() {
  const user = await getUser();
  if (!user) {
    return [];
  }

  return getChildrenForUser(user.id);
}

export async function getChildByIdForUser(userId: number, childId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    return getChildForUser(userId, childId);
  }

  const result = await db
    .select()
    .from(children)
    .where(
      and(
        eq(children.userId, userId),
        eq(children.id, childId),
        isNull(children.deletedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}
