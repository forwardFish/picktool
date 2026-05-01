'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { logActivity } from '@/lib/db/activity';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import {
  authenticateDemoParent,
  deleteDemoParentAccount,
  registerDemoParent,
  toDemoUser,
  updateDemoParentPassword,
  updateDemoParentProfile,
} from '@/lib/family/demo-auth';
import { listChildrenForUser } from '@/lib/family/repository';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { redirectToBillingCheckout } from '@/lib/payments/service';

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();

function getAuthRedirectTarget(formData: FormData) {
  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo && redirectTo.startsWith('/')) {
    return redirectTo;
  }
  return '/dashboard';
}

async function getPostAuthRedirectTarget(formData: FormData, userId: number) {
  const target = getAuthRedirectTarget(formData);

  if (!target.startsWith('/dashboard') || !target.includes('resumeDraft=1')) {
    return target;
  }

  const children = await listChildrenForUser(userId);
  if (children.length === 0) {
    return '/dashboard/children/new?resumeDraft=1';
  }

  return target;
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  if (FAMILY_EDU_DEMO_MODE) {
    const demoProfile = await authenticateDemoParent({ email, password });
    if (!demoProfile) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password
      };
    }

    await setSession(toDemoUser(demoProfile) as NewUser);

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
      redirect('/dashboard/billing');
    }

    redirect(await getPostAuthRedirectTarget(formData, demoProfile.id));
  }

  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return redirectToBillingCheckout({
      team: foundTeam,
      priceId,
      userEmail: foundUser.email,
      userId: foundUser.id,
    });
  }

  redirect(await getPostAuthRedirectTarget(formData, foundUser.id));
});

const checkedBoolean = (message: string) =>
  z.preprocess(
    (value) => value === 'on' || value === 'true' || value === true,
    z.boolean().refine((isChecked) => isChecked, message)
  );

const signUpSchema = z.object({
  name: z.string().trim().max(100).optional().default(''),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      'Password must contain at least one letter and one number.'
    ),
  country: z.string().min(2),
  timezone: z.string().min(3).optional().default('America/Los_Angeles'),
  locale: z.string().min(2).optional().default('en-US'),
  is18PlusConfirmed: checkedBoolean('You must confirm that you are 18 or older.'),
  acceptTerms: checkedBoolean(
    'You must accept the Terms of Service and Privacy Policy.'
  ),
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const {
    name,
    email,
    password,
    country,
    timezone,
    locale,
    is18PlusConfirmed,
    inviteId
  } = data;

  if (FAMILY_EDU_DEMO_MODE) {
    const demoSignup = await registerDemoParent({
      name,
      email,
      password,
      country,
      timezone,
      locale,
      is18PlusConfirmed,
    });

    if (!demoSignup.ok) {
      return {
        error: 'An account with this email already exists.',
        name,
        email,
        country
      };
    }

    await setSession(toDemoUser(demoSignup.profile) as NewUser);

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
      redirect('/dashboard/billing');
    }

    redirect(await getPostAuthRedirectTarget(formData, demoSignup.profile.id));
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'An account with this email already exists.',
      name,
      email,
      country
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    name,
    email,
    passwordHash,
    role: 'owner',
    is18PlusConfirmed,
    country,
    timezone,
    locale
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      name,
      email,
      country
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return {
        error: 'Invalid or expired invitation.',
        name,
        email,
        country
      };
    }
  } else {
    const householdName = name?.trim()
      ? `${name.trim()}'s household`
      : `${email}'s household`;

    const newTeam: NewTeam = {
      name: householdName
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        name,
        email,
        country
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return redirectToBillingCheckout({
      team: createdTeam,
      priceId,
      userEmail: createdUser.email,
      userId: createdUser.id,
    });
  }

  redirect(await getPostAuthRedirectTarget(formData, createdUser.id));
});

export async function signOut() {
  const user = (await getUser()) as User | null;
  if (FAMILY_EDU_DEMO_MODE) {
    (await cookies()).delete('session');
    redirect('/');
  }

  if (user) {
    const userWithTeam = await getUserWithTeam(user.id);
    await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  }

  (await cookies()).delete('session');
  redirect('/');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (FAMILY_EDU_DEMO_MODE) {
      if (currentPassword === newPassword) {
        return {
          currentPassword,
          newPassword,
          confirmPassword,
          error: 'New password must be different from the current password.'
        };
      }

      if (confirmPassword !== newPassword) {
        return {
          currentPassword,
          newPassword,
          confirmPassword,
          error: 'New password and confirmation password do not match.'
        };
      }

      const result = await updateDemoParentPassword({
        currentPassword,
        newPassword,
      });

      if (!result.ok) {
        return {
          currentPassword,
          newPassword,
          confirmPassword,
          error: 'Current password is incorrect.'
        };
      }

      return {
        success: 'Password updated successfully.'
      };
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    if (FAMILY_EDU_DEMO_MODE) {
      const result = await updateDemoParentPassword({
        currentPassword: password,
        newPassword: password,
      });
      if (!result.ok) {
        return {
          password,
          error: 'Incorrect password. Account deletion failed.'
        };
      }

      await deleteDemoParentAccount();
      (await cookies()).delete('session');
      redirect('/sign-in');
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  country: z.string().min(2, 'Country is required'),
  timezone: z.string().min(3, 'Timezone is required'),
  locale: z.string().min(2, 'Preferred language is required')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email, country, timezone, locale } = data;

    if (FAMILY_EDU_DEMO_MODE) {
      await updateDemoParentProfile({
        name,
        email,
        country,
        timezone,
        locale,
      });

      return {
        name,
        email,
        country,
        timezone,
        locale,
        success: 'Account updated successfully.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({
          name,
          email,
          country,
          timezone,
          locale,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return {
      name,
      email,
      country,
      timezone,
      locale,
      success: 'Account updated successfully.'
    };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);
