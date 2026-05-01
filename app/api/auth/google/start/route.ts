import { NextRequest, NextResponse } from 'next/server';
import {
  buildGoogleAuthorizationUrl,
  buildGoogleOAuthContext,
  isGoogleAuthConfigured,
  type GoogleOAuthContext,
} from '@/lib/auth/google';
import { shouldUseSecureCookies } from '@/lib/auth/cookies';

const GOOGLE_OAUTH_COOKIE = 'google_oauth_ctx';

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 10 * 60,
  };
}

function getSafeRedirect(value: string | null) {
  if (value === 'checkout') {
    return value;
  }

  return value && value.startsWith('/') ? value : '/dashboard';
}

function getRequestOrigin(request: NextRequest) {
  const host = request.headers.get('host');
  const protocol =
    request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');

  return host ? `${protocol}://${host}` : request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const redirectTo = getSafeRedirect(url.searchParams.get('redirect'));
  const priceId = url.searchParams.get('priceId') || '';
  const inviteId = url.searchParams.get('inviteId') || '';
  const mode = url.searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        `/${mode === 'signup' ? 'sign-up' : 'sign-in'}?oauthError=google_not_configured`,
        getRequestOrigin(request)
      )
    );
  }

  const context: GoogleOAuthContext = buildGoogleOAuthContext({
    redirectTo,
    priceId,
    inviteId,
    mode,
  });

  const response = NextResponse.redirect(buildGoogleAuthorizationUrl(context));
  response.cookies.set(
    GOOGLE_OAUTH_COOKIE,
    JSON.stringify(context),
    getCookieOptions()
  );
  return response;
}
