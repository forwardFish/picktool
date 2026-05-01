'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { FamilyLogoStatic } from '@/components/branding/family-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { countryOptions } from '@/lib/family/options';
import { PUBLIC_CONTACT_EMAIL } from '@/lib/site/public-trust';

function getOauthErrorMessage(errorCode?: string) {
  switch (errorCode) {
    case 'google_not_configured':
      return 'Google sign-in is unavailable right now. Please try again later or use email and password.';
    case 'google_session_missing':
    case 'google_session_invalid':
    case 'google_state_invalid':
      return 'Google sign-in expired or could not be verified. Please try again.';
    case 'google_access_denied':
      return 'Google sign-in was canceled before completion.';
    case 'google_sign_in_failed':
      return 'Google sign-in failed. Please try again or use email and password.';
    default:
      return '';
  }
}

export function Login({
  mode = 'signin',
  redirectTo,
  priceId,
  inviteId,
  oauthError,
  googleAuthAvailable
}: {
  mode?: 'signin' | 'signup';
  redirectTo?: string;
  priceId?: string;
  inviteId?: string;
  oauthError?: string;
  googleAuthAvailable?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );
  const googleHref = `/api/auth/google/start?mode=${mode}${
    redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''
  }${priceId ? `&priceId=${encodeURIComponent(priceId)}` : ''}${
    inviteId ? `&inviteId=${encodeURIComponent(inviteId)}` : ''
  }`;
  const oauthErrorMessage = getOauthErrorMessage(oauthError);
  const switchHref = `${mode === 'signin' ? '/sign-up' : '/sign-in'}${
    redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''
  }${priceId ? `${redirectTo ? '&' : '?'}priceId=${encodeURIComponent(priceId)}` : ''}${
    inviteId
      ? `${redirectTo || priceId ? '&' : '?'}inviteId=${encodeURIComponent(inviteId)}`
      : ''
  }`;

  return (
    <div className="pn-page-shell flex min-h-[100dvh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
          {/* Left-side marketing panel intentionally disabled for the sign-in experience. */}
          {/* <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pn-soft-border)] bg-[var(--pn-soft)] px-4 py-2 text-sm font-extrabold text-[var(--pn-violet)]">
                <GoogleIcon className="h-4 w-4" />
                Pathnook account access
              </div>
              <h1 className="mt-6 text-5xl font-black leading-[1.04] tracking-[-0.05em] text-[#111827]">
                Continue with the same
                <span className="pn-gradient-text mt-2 block">
                  premium Pathnook workflow
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-[var(--pn-muted)]">
                Sign in to manage diagnoses, billing, report continuity, and
                weekly follow-through from one parent-first workspace.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  'Google sign-in for the fastest entry',
                  'Adults-only account creation',
                  'Freemius-powered billing and recovery routes',
                  'Unified household workflow after sign-in',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.3rem] border border-[var(--pn-soft-border)] bg-white/80 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.05)]"
                  >
                    <p className="text-sm font-semibold leading-7 text-[var(--pn-muted-2)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div> */}

          <div className="pn-surface mx-auto w-full max-w-xl p-3">
            <div className="rounded-[1.6rem] border border-[var(--pn-border)] bg-white p-6 sm:p-8">
              <div className="flex justify-center">
                <FamilyLogoStatic size="lg" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-black tracking-[-0.04em] text-[#111827]">
                {mode === 'signin'
                  ? 'Sign in to continue your Pathnook household workflow.'
                  : 'Start with Google or create your account'}
              </h2>
              <p className="mt-3 text-center text-sm leading-7 text-[var(--pn-muted)]">
                {mode === 'signin'
                  ? 'Google sign-in is the fastest path. Email and password remain available if you prefer a standard sign-in.'
                  : 'Google sign-in is recommended for the fastest setup. Email and password remain available for parent, guardian, or other authorized adult use. Children may not create accounts directly.'}
              </p>

              {googleAuthAvailable ? (
                <div className="mb-6 mt-8 space-y-3">
                  <a
                    href={googleHref}
                    className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[1rem] border border-[var(--pn-border)] bg-white px-4 text-sm font-semibold text-[var(--pn-text)] shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:bg-[var(--pn-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--pn-violet)]"
                  >
                    <GoogleIcon />
                    {mode === 'signin' ? 'Sign in with Google' : 'Continue with Google'}
                  </a>
                  <p className="text-center text-xs text-[var(--pn-muted)]">
                    Use your Google account to sign in or create an account in one step.
                  </p>
                </div>
              ) : null}

              <form className="space-y-6" action={formAction}>
                <input type="hidden" name="redirect" value={redirectTo || ''} />
                <input type="hidden" name="priceId" value={priceId || ''} />
                <input type="hidden" name="inviteId" value={inviteId || ''} />

                <div>
                  <Label htmlFor="email" className="block text-sm font-semibold text-[var(--pn-muted-2)]">
                    Email
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      defaultValue={state.email}
                      required
                      maxLength={50}
                      className="h-12 rounded-[1rem] border-[var(--pn-border)] bg-white px-4 focus:ring-[var(--pn-violet)]"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <>
                    <div>
                      <Label htmlFor="name" className="block text-sm font-semibold text-[var(--pn-muted-2)]">
                        Full name
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          defaultValue={state.name}
                          maxLength={100}
                          className="h-12 rounded-[1rem] border-[var(--pn-border)] bg-white px-4 focus:ring-[var(--pn-violet)]"
                          placeholder="How should we address you?"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country" className="block text-sm font-semibold text-[var(--pn-muted-2)]">
                        Country
                      </Label>
                      <select
                        id="country"
                        name="country"
                        defaultValue={(state.country as string) || 'US'}
                        className="mt-2 flex h-12 w-full rounded-[1rem] border border-[var(--pn-border)] bg-white px-4 py-2 text-sm text-gray-900 focus:border-[var(--pn-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--pn-violet)]"
                        required
                      >
                        {countryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="password" className="block text-sm font-semibold text-[var(--pn-muted-2)]">
                    Password
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={
                        mode === 'signin' ? 'current-password' : 'new-password'
                      }
                      defaultValue={state.password}
                      required
                      minLength={8}
                      maxLength={100}
                      className="h-12 rounded-[1rem] border-[var(--pn-border)] bg-white px-4 focus:ring-[var(--pn-violet)]"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="rounded-[1.4rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,var(--pn-soft-2)_0%,white_100%)] p-4">
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 text-sm leading-7 text-[var(--pn-muted-2)]">
                        <input
                          type="checkbox"
                          name="is18PlusConfirmed"
                          defaultChecked={Boolean(state.is18PlusConfirmed)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--pn-violet)] focus:ring-[var(--pn-violet)]"
                        />
                        <span>
                          I confirm that I am at least 18 years old and I am creating
                          this account for parent, guardian, or other authorized adult use.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 text-sm leading-7 text-[var(--pn-muted-2)]">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          defaultChecked={Boolean(state.acceptTerms)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--pn-violet)] focus:ring-[var(--pn-violet)]"
                        />
                        <span>
                          I agree to the Pathnook Terms of Service and Privacy Policy.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {state?.error ? (
                  <div className="text-sm text-red-500">{state.error}</div>
                ) : null}
                {!state?.error && oauthErrorMessage ? (
                  <div className="text-sm text-red-500">{oauthErrorMessage}</div>
                ) : null}

                <div>
                  <Button type="submit" className="h-12 w-full rounded-[1rem]" disabled={pending}>
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : mode === 'signin' ? (
                      'Sign in'
                    ) : (
                      'Sign up'
                    )}
                  </Button>
                </div>

                {mode === 'signin' ? (
                  <div className="text-center text-sm text-[var(--pn-muted)]">
                    <a
                      href={`mailto:${PUBLIC_CONTACT_EMAIL}?subject=Pathnook password recovery`}
                      className="font-semibold text-[var(--pn-violet)] underline-offset-4 hover:underline"
                    >
                      Need help recovering your password?
                    </a>
                  </div>
                ) : null}
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--pn-border)]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-[var(--pn-muted)]">
                      {googleAuthAvailable ? 'Or continue with email' : ''}
                      {mode === 'signin'
                        ? googleAuthAvailable ? '' : 'New to Pathnook?'
                        : googleAuthAvailable ? '' : 'Already have an account?'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button asChild variant="outline" className="h-12 w-full rounded-[1rem]">
                    <Link href={switchHref}>
                      {mode === 'signin'
                        ? 'Create an account'
                        : 'Sign in to existing account'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className || 'h-5 w-5'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 12.23c0-.68-.061-1.334-.174-1.962H12v3.713h5.499a4.704 4.704 0 0 1-2.04 3.087v2.565h3.302c1.933-1.78 3.044-4.403 3.044-7.403Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.078-.915 6.771-2.477l-3.302-2.565c-.915.614-2.085.977-3.469.977-2.668 0-4.928-1.803-5.735-4.227H2.85v2.646A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.265 13.708A5.996 5.996 0 0 1 5.944 12c0-.593.102-1.169.321-1.708V7.646H2.85A9.998 9.998 0 0 0 2 12c0 1.613.385 3.14 1.069 4.354l3.196-2.646Z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.065c1.502 0 2.85.516 3.911 1.53l2.932-2.932C17.073 3.016 14.754 2 12 2a9.998 9.998 0 0 0-9.15 5.646l3.415 2.646C7.072 7.868 9.332 6.065 12 6.065Z"
        fill="#EA4335"
      />
    </svg>
  );
}
