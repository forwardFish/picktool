import { Suspense } from 'react';
import { Login } from '../login';
import { isGoogleAuthConfigured } from '@/lib/auth/google';

type PageProps = {
  searchParams: Promise<{
    redirect?: string;
    priceId?: string;
    inviteId?: string;
    oauthError?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const googleAuthAvailable = isGoogleAuthConfigured();

  return (
    <Suspense>
      <Login
        mode="signup"
        redirectTo={params.redirect}
        priceId={params.priceId}
        inviteId={params.inviteId}
        oauthError={params.oauthError}
        googleAuthAvailable={googleAuthAvailable}
      />
    </Suspense>
  );
}
