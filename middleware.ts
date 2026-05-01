import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { shouldUseSecureCookies } from '@/lib/auth/cookies';
import { getConfiguredBaseUrl } from '@/lib/runtime/base-url';
import {
  isFamilyEduDemoAutoAuth,
  isFamilyEduDemoMode,
} from '@/lib/family/config';

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();
const FAMILY_EDU_DEMO_AUTO_AUTH = isFamilyEduDemoAutoAuth();

const protectedRoutes = '/dashboard';

function isLoopbackOrigin(origin: string) {
  return (
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1')
  );
}

function normalizeLoopbackOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const isLoopbackHost =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (!isLoopbackHost) {
      return origin;
    }
    return `${url.protocol}//loopback:${url.port || (url.protocol === 'https:' ? '443' : '80')}`;
  } catch {
    return origin;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const configuredBaseUrl = getConfiguredBaseUrl();
  const requestOrigin = request.nextUrl.origin;

  if (
    request.method === 'GET' &&
    normalizeLoopbackOrigin(configuredBaseUrl) !== normalizeLoopbackOrigin(requestOrigin) &&
    isLoopbackOrigin(configuredBaseUrl) &&
    isLoopbackOrigin(requestOrigin)
  ) {
    const redirectUrl = new URL(request.url);
    redirectUrl.protocol = new URL(configuredBaseUrl).protocol;
    redirectUrl.host = new URL(configuredBaseUrl).host;
    return NextResponse.redirect(redirectUrl);
  }

  if (
    isProtectedRoute &&
    !sessionCookie &&
    !(FAMILY_EDU_DEMO_MODE && FAMILY_EDU_DEMO_AUTO_AUTH)
  ) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: shouldUseSecureCookies(),
        sameSite: 'lax',
        path: '/',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
