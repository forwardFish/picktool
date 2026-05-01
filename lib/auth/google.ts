import crypto from 'node:crypto';
import { proxyAwareFetch } from './proxy-fetch';
import { getConfiguredBaseUrl } from '@/lib/runtime/base-url';

const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_TOKEN_INFO_ENDPOINT = 'https://oauth2.googleapis.com/tokeninfo';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

export type GoogleOAuthContext = {
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectTo: string;
  priceId: string;
  inviteId: string;
  mode: 'signin' | 'signup';
};

type GoogleOAuthStateEnvelope = {
  ctx: GoogleOAuthContext;
  sig: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleIdentity = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
};

type GoogleTokenInfoResponse = {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
  nonce?: string;
  exp?: string;
  iat?: string;
  error_description?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  const normalizedValue = value?.trim();
  if (!normalizedValue) {
    throw new Error(`${name} is not configured.`);
  }
  return normalizedValue;
}

function getOAuthStateSecret() {
  return (
    process.env.AUTH_SECRET?.trim() || 'family-education-dev-auth-secret'
  );
}

export function isGoogleAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}

export function getGoogleClientId() {
  return getRequiredEnv('GOOGLE_CLIENT_ID');
}

function getGoogleClientSecret() {
  return getRequiredEnv('GOOGLE_CLIENT_SECRET');
}

export function getGoogleCallbackUrl() {
  const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  const baseUrl = getConfiguredBaseUrl();
  return `${baseUrl}/api/auth/google/callback`;
}

function toBase64Url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function randomToken(size = 32) {
  return toBase64Url(crypto.randomBytes(size));
}

function createCodeChallenge(codeVerifier: string) {
  return toBase64Url(crypto.createHash('sha256').update(codeVerifier).digest());
}

function signGoogleOAuthStatePayload(payload: string) {
  return toBase64Url(
    crypto.createHmac('sha256', getOAuthStateSecret()).update(payload).digest()
  );
}

export function buildGoogleOAuthContext(
  input: Partial<Pick<GoogleOAuthContext, 'redirectTo' | 'priceId' | 'inviteId' | 'mode'>>
): GoogleOAuthContext {
  const redirectTo =
    input.redirectTo === 'checkout'
      ? 'checkout'
      : input.redirectTo && input.redirectTo.startsWith('/')
        ? input.redirectTo
        : '/dashboard';

  return {
    state: randomToken(),
    nonce: randomToken(),
    codeVerifier: randomToken(48),
    redirectTo,
    priceId: input.priceId || '',
    inviteId: input.inviteId || '',
    mode: input.mode === 'signup' ? 'signup' : 'signin',
  };
}

export function buildGoogleAuthorizationUrl(context: GoogleOAuthContext) {
  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  url.searchParams.set('client_id', getGoogleClientId());
  url.searchParams.set('redirect_uri', getGoogleCallbackUrl());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GOOGLE_SCOPES.join(' '));
  url.searchParams.set('state', serializeGoogleOAuthState(context));
  url.searchParams.set('nonce', context.nonce);
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('code_challenge', createCodeChallenge(context.codeVerifier));
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export function serializeGoogleOAuthState(context: GoogleOAuthContext) {
  const payload = toBase64Url(Buffer.from(JSON.stringify(context), 'utf8'));
  const envelope: GoogleOAuthStateEnvelope = {
    ctx: context,
    sig: signGoogleOAuthStatePayload(payload),
  };

  return `${payload}.${envelope.sig}`;
}

export function parseGoogleOAuthState(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split('.');
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signGoogleOAuthStatePayload(payload);
  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as GoogleOAuthContext;

    if (
      !parsed ||
      typeof parsed.state !== 'string' ||
      typeof parsed.nonce !== 'string' ||
      typeof parsed.codeVerifier !== 'string' ||
      typeof parsed.redirectTo !== 'string' ||
      typeof parsed.priceId !== 'string' ||
      typeof parsed.inviteId !== 'string' ||
      (parsed.mode !== 'signin' && parsed.mode !== 'signup')
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function exchangeGoogleCodeForTokens(code: string, codeVerifier: string) {
  const response = await proxyAwareFetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleCallbackUrl(),
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  });

  const payload = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || payload.error || !payload.id_token) {
    throw new Error(
      payload.error_description || payload.error || 'Google token exchange failed.'
    );
  }

  return payload;
}

export async function verifyGoogleIdToken(idToken: string, nonce: string) {
  const tokenInfoUrl = new URL(GOOGLE_TOKEN_INFO_ENDPOINT);
  tokenInfoUrl.searchParams.set('id_token', idToken);

  const response = await proxyAwareFetch(tokenInfoUrl, {
    method: 'GET',
  });
  const payload = (await response.json()) as GoogleTokenInfoResponse;

  if (!response.ok) {
    throw new Error(payload.error_description || 'Google token verification failed.');
  }

  if (payload.aud !== getGoogleClientId()) {
    throw new Error('Google audience validation failed.');
  }

  if (!payload.iss || !GOOGLE_ISSUERS.includes(payload.iss)) {
    throw new Error('Google issuer validation failed.');
  }

  if (payload.nonce !== nonce) {
    throw new Error('Google nonce validation failed.');
  }

  return payload;
}

export function extractGoogleIdentity(payload: GoogleTokenInfoResponse): GoogleIdentity {
  const sub = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email : null;
  const emailVerified = payload.email_verified === 'true';

  if (!sub || !email || !emailVerified) {
    throw new Error('Google account is missing a verified email address.');
  }

  return {
    sub,
    email,
    emailVerified: emailVerified,
    name: typeof payload.name === 'string' ? payload.name : null,
    picture: typeof payload.picture === 'string' ? payload.picture : null,
  };
}
