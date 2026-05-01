import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';
import { shouldUseSecureCookies } from '@/lib/auth/cookies';

const authSecret =
  process.env.AUTH_SECRET || 'family-education-dev-auth-secret';
const key = new TextEncoder().encode(authSecret);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { id: number };
  expires: string;
};

type SessionCookie = {
  name: 'session';
  value: string;
  options: {
    expires: Date;
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax';
    path: '/';
  };
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7 days from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function buildSessionCookie(
  user: Pick<NewUser, 'id'>
): Promise<SessionCookie> {
  const expiresInSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInSevenDays.toISOString(),
  };
  return {
    name: 'session',
    value: await signToken(session),
    options: {
      expires: expiresInSevenDays,
      httpOnly: true,
      secure: shouldUseSecureCookies(),
      sameSite: 'lax',
      path: '/',
    },
  };
}

export async function setSession(user: Pick<NewUser, 'id'>) {
  const sessionCookie = await buildSessionCookie(user);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.options
  );
}
