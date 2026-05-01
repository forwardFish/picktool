import { NextRequest, NextResponse } from 'next/server';
import { applyCheckoutCompletionForUser } from '@/lib/family/billing';
import { getUser } from '@/lib/db/queries';
import { getBillingPlanByPriceId } from '@/lib/payments/catalog';
import {
  getBillingRedirectCompletionPayload,
  isCreemRoutesEnabled,
  verifyBillingRedirectSignature,
} from '@/lib/payments/service';

function getDemoCurrentPeriodEnd(interval: 'once' | 'month' | 'year') {
  if (interval === 'month') {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (interval === 'year') {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (!isCreemRoutesEnabled()) {
    return NextResponse.json({ error: 'Creem checkout route is disabled.' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const checkoutId = searchParams.get('checkout_id');
  const priceIdParam = searchParams.get('priceId');
  const signature = searchParams.get('signature');

  if (!checkoutId) {
    return NextResponse.redirect(new URL('/dashboard/billing?checkout=invalid', request.url));
  }

  if (process.env['FAMILY_EDU_DEMO_MODE'] === '1' || checkoutId.startsWith('demo_')) {
    const user = await getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const plan = getBillingPlanByPriceId(priceIdParam);
    if (!plan) {
      return NextResponse.redirect(new URL('/dashboard/billing?checkout=invalid', request.url));
    }

    await applyCheckoutCompletionForUser({
      userId: user.id,
      priceId: plan.priceId,
      checkoutSessionId: checkoutId,
      provider: 'demo',
      status: 'active',
      currentPeriodEndsAt: getDemoCurrentPeriodEnd(plan.interval),
    });

    return NextResponse.redirect(
      new URL(`/dashboard/billing?checkout=success&plan=${plan.planType}`, request.url)
    );
  }

  const signatureValid = await Promise.resolve(verifyBillingRedirectSignature(
    {
      request_id: searchParams.get('request_id'),
      checkout_id: checkoutId,
      order_id: searchParams.get('order_id'),
      customer_id: searchParams.get('customer_id'),
      subscription_id: searchParams.get('subscription_id'),
      product_id: searchParams.get('product_id'),
      raw_url: request.url,
    },
    signature,
    'creem'
  ));

  if (!signatureValid) {
    return NextResponse.redirect(new URL('/dashboard/billing?checkout=invalid', request.url));
  }

  try {
    const completion = await getBillingRedirectCompletionPayload(
      request.url,
      priceIdParam,
      'creem'
    );

    if (!completion?.userId) {
      throw new Error('Creem checkout completion did not resolve a local user id.');
    }

    await applyCheckoutCompletionForUser({
      userId: completion.userId,
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
    console.error('Error handling Creem checkout completion:', error);
    return NextResponse.redirect(new URL('/dashboard/billing?checkout=invalid', request.url));
  }
}
