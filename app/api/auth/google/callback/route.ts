import crypto from 'node:crypto';
import { and, eq, isNull, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeGoogleCodeForTokens,
  extractGoogleIdentity,
  parseGoogleOAuthState,
  verifyGoogleIdToken,
} from '@/lib/auth/google';
import { buildSessionCookie, hashPassword } from '@/lib/auth/session';
import { logActivity } from '@/lib/db/activity';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users, type NewTeam, type NewTeamMember } from '@/lib/db/schema';
import { ActivityType } from '@/lib/db/schema';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import { toDemoUser, upsertDemoParentFromGoogle } from '@/lib/family/demo-auth';
import { listChildrenForUser } from '@/lib/family/repository';
import { shouldUseSecureCookies } from '@/lib/auth/cookies';
import { createBillingHostedCheckoutSession } from '@/lib/payments/service';

const GOOGLE_OAUTH_COOKIE = 'google_oauth_ctx';
const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();

type GoogleOAuthContext = {
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectTo: string;
  priceId: string;
  inviteId: string;
  mode: 'signin' | 'signup';
};

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}

function clearGoogleOAuthCookie(response: NextResponse) {
  response.cookies.set(GOOGLE_OAUTH_COOKIE, '', getCookieOptions());
  return response;
}

async function applySessionCookie(
  response: NextResponse,
  user: { id: number }
) {
  const sessionCookie = await buildSessionCookie(user);
  response.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.options
  );
  return response;
}

function getRequestOrigin(request: NextRequest) {
  const host = request.headers.get('host');
  const protocol =
    request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');

  return host ? `${protocol}://${host}` : request.nextUrl.origin;
}

function getLoginUrl(request: NextRequest, mode: 'signin' | 'signup', oauthError: string) {
  const pathname = mode === 'signup' ? '/sign-up' : '/sign-in';
  const url = new URL(pathname, getRequestOrigin(request));
  url.searchParams.set('oauthError', oauthError);
  return url;
}

function getUserDefaults() {
  return {
    country: process.env.DEFAULT_COUNTRY || 'US',
    timezone: process.env.DEFAULT_TIMEZONE || 'America/Los_Angeles',
    locale: process.env.DEFAULT_LOCALE || 'en-US',
  };
}

async function findUserForGoogleAccount(sub: string, email: string) {
  const matches = await db
    .select()
    .from(users)
    .where(
      and(
        or(eq(users.googleSub, sub), eq(users.email, email)),
        isNull(users.deletedAt)
      )
    )
    .limit(1);

  return matches[0] || null;
}

async function ensureUserTeam(userId: number, displayName: string, email: string) {
  const existingMembership = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (existingMembership[0]) {
    return existingMembership[0].teamId;
  }

  const householdName = displayName?.trim()
    ? `${displayName.trim()}'s household`
    : `${email}'s household`;

  const [createdTeam] = await db
    .insert(teams)
    .values({ name: householdName } satisfies NewTeam)
    .returning();

  const [createdTeamMember] = await db
    .insert(teamMembers)
    .values({
      userId,
      teamId: createdTeam.id,
      role: 'owner',
    } satisfies NewTeamMember)
    .returning();

  await Promise.all([
    logActivity(createdTeam.id, userId, ActivityType.CREATE_TEAM),
    logActivity(createdTeam.id, userId, ActivityType.SIGN_UP),
  ]);

  return createdTeamMember.teamId;
}

async function findOrCreateGoogleUser(identity: {
  sub: string;
  email: string;
  name: string | null;
}) {
  const existingUser = await findUserForGoogleAccount(identity.sub, identity.email);

  if (existingUser) {
    if (!existingUser.googleSub || existingUser.googleSub !== identity.sub) {
      const [updatedUser] = await db
        .update(users)
        .set({
          googleSub: identity.sub,
          name: identity.name || existingUser.name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();

      return updatedUser || existingUser;
    }

    return existingUser;
  }

  const { country, timezone, locale } = getUserDefaults();
  const generatedPassword = await hashPassword(crypto.randomUUID());

  const [createdUser] = await db
    .insert(users)
    .values({
      name: identity.name || identity.email.split('@')[0],
      email: identity.email,
      googleSub: identity.sub,
      passwordHash: generatedPassword,
      role: 'owner',
      is18PlusConfirmed: true,
      country,
      timezone,
      locale,
    })
    .returning();

  return createdUser;
}

async function getPostAuthRedirectTarget(redirectTo: string, userId: number) {
  const target = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';

  if (!target.startsWith('/dashboard') || !target.includes('resumeDraft=1')) {
    return target;
  }

  const children = await listChildrenForUser(userId);
  if (children.length === 0) {
    return '/dashboard/children/new?resumeDraft=1';
  }

  return target;
}

export async function GET(request: NextRequest) {
  const storedContext = request.cookies.get(GOOGLE_OAUTH_COOKIE)?.value;
  const stateParam = request.nextUrl.searchParams.get('state');
  const stateContext = parseGoogleOAuthState(stateParam);

  if (!storedContext && !stateContext) {
    return clearGoogleOAuthCookie(NextResponse.redirect(
      getLoginUrl(request, 'signin', 'google_session_missing')
    ));
  }

  let context: GoogleOAuthContext | null = stateContext;

  if (storedContext) {
    try {
      context = JSON.parse(storedContext) as GoogleOAuthContext;
    } catch {
      if (!stateContext) {
        return clearGoogleOAuthCookie(NextResponse.redirect(
          getLoginUrl(request, 'signin', 'google_session_invalid')
        ));
      }
    }
  }

  if (!context) {
    return clearGoogleOAuthCookie(NextResponse.redirect(
      getLoginUrl(request, 'signin', 'google_session_invalid')
    ));
  }

  const code = request.nextUrl.searchParams.get('code');
  const oauthError = request.nextUrl.searchParams.get('error');

  if (oauthError) {
    return clearGoogleOAuthCookie(
      NextResponse.redirect(getLoginUrl(request, context.mode, 'google_access_denied'))
    );
  }

  if (!code || !stateContext || stateContext.state !== context.state) {
    return clearGoogleOAuthCookie(
      NextResponse.redirect(getLoginUrl(request, context.mode, 'google_state_invalid'))
    );
  }

  try {
    const tokenResponse = await exchangeGoogleCodeForTokens(code, context.codeVerifier);
    const payload = await verifyGoogleIdToken(tokenResponse.id_token!, context.nonce);
    const identity = extractGoogleIdentity(payload);

    if (FAMILY_EDU_DEMO_MODE) {
      const demoProfile = await upsertDemoParentFromGoogle({
        sub: identity.sub,
        email: identity.email,
        name: identity.name,
      });

      if (context.redirectTo === 'checkout' && context.priceId) {
        const checkoutUrl = new URL('/dashboard/billing/demo-checkout', getRequestOrigin(request));
        checkoutUrl.searchParams.set('priceId', context.priceId);
        checkoutUrl.searchParams.set('session_id', `demo_google_${Date.now()}`);
        const response = clearGoogleOAuthCookie(NextResponse.redirect(checkoutUrl));
        return applySessionCookie(response, toDemoUser(demoProfile));
      }

      const response = clearGoogleOAuthCookie(
        NextResponse.redirect(
          new URL(
            await getPostAuthRedirectTarget(context.redirectTo, demoProfile.id),
            getRequestOrigin(request)
          )
        )
      );
      return applySessionCookie(response, toDemoUser(demoProfile));
    }

    const user = await findOrCreateGoogleUser(identity);
    const teamId = await ensureUserTeam(user.id, user.name || identity.name || '', user.email);

    await Promise.all([
      logActivity(teamId, user.id, ActivityType.SIGN_IN),
    ]);

    if (context.redirectTo === 'checkout' && context.priceId) {
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      if (team[0]) {
        const session = await createBillingHostedCheckoutSession({
          team: team[0],
          priceId: context.priceId,
          userEmail: user.email,
          userId: user.id,
        });
        const response = clearGoogleOAuthCookie(
          NextResponse.redirect(session.checkoutUrl)
        );
        return applySessionCookie(response, { id: user.id });
      }
    }

    const response = clearGoogleOAuthCookie(
      NextResponse.redirect(
        new URL(
          await getPostAuthRedirectTarget(context.redirectTo, user.id),
          getRequestOrigin(request)
        )
      )
    );
    return applySessionCookie(response, { id: user.id });
  } catch (error) {
    console.error('Google OAuth callback failed:', error);
    return clearGoogleOAuthCookie(
      NextResponse.redirect(
        getLoginUrl(request, context.mode, 'google_sign_in_failed')
      )
    );
  }
}
