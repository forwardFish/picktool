import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserByEmail } from '@/lib/db/queries';
import { applyCheckoutCompletionForUser } from '@/lib/family/billing';
import { createCheckoutRouteResponse } from '@/lib/payments/route-contracts';
import { getBillingRedirectCompletionPayload } from '@/lib/payments/service';

export async function POST(request: Request) {
  return createCheckoutRouteResponse(request);
}

export async function GET(request: NextRequest) {
  const fallbackPriceId = request.nextUrl.searchParams.get('priceId');

  try {
    const completion = await getBillingRedirectCompletionPayload(
      request.url,
      fallbackPriceId
    );

    if (!completion) {
      return NextResponse.redirect(new URL('/dashboard/billing?checkout=invalid', request.url));
    }

    const currentUser = await getUser();
    const resolvedUser =
      (completion.userId ? currentUser?.id === completion.userId ? currentUser : null : null) ||
      (completion.userEmail ? await getUserByEmail(completion.userEmail) : null) ||
      currentUser;

    if (!resolvedUser) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    await applyCheckoutCompletionForUser({
      userId: resolvedUser.id,
      priceId: completion.priceId,
      checkoutSessionId: completion.checkoutSessionId,
      provider: completion.provider,
      stripeCustomerId: completion.stripeCustomerId,
      stripeSubscriptionId: completion.stripeSubscriptionId,
      status: completion.status,
      currentPeriodEndsAt: completion.currentPeriodEndsAt,
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard/billing?checkout=success&plan=${completion.plan.planType}`,
        request.url
      )
    );
  } catch (error) {
    console.error('Error handling primary checkout completion:', error);
    return NextResponse.redirect(new URL('/dashboard/billing?checkout=invalid', request.url));
  }
}
