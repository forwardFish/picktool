import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { Creem } from 'creem';
import type { CheckoutEntity, SubscriptionEntity } from 'creem/models/components';
import { getUser } from '@/lib/db/queries';
import type { Team } from '@/lib/db/schema';
import { getConfiguredBaseUrl } from '@/lib/runtime/base-url';
import {
  BILLING_PLANS,
  getBillingPlanByPriceId,
  getBillingPlanByProductId,
  isRecurringPlanType,
  type BillingPlan,
  type BillingPlanType,
} from './catalog';

type CheckoutTeam = Pick<Team, 'id' | 'stripeCustomerId'> | null;

type CheckoutRedirectParams = {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
};

export type HostedCheckoutSession = {
  mode: 'demo' | 'creem';
  provider: 'demo' | 'creem';
  checkoutUrl: string;
  sessionId: string;
  priceId: string;
  planType: BillingPlanType;
};

function getBaseUrl() {
  return getConfiguredBaseUrl();
}

function isCreemTestMode() {
  if (typeof process.env.CREEM_TEST_MODE === 'string') {
    return process.env.CREEM_TEST_MODE === '1';
  }

  return process.env.NODE_ENV !== 'production';
}

export function isCreemConfigured() {
  return Boolean(process.env.CREEM_API_KEY);
}

export function getCreemClientOrThrow() {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    throw new Error(
      'CREEM_API_KEY is not configured. Live billing actions are unavailable.'
    );
  }

  return new Creem({
    apiKey,
    serverIdx: isCreemTestMode() ? 1 : 0,
  });
}

function normalizeCheckoutPlan(plan: BillingPlan | null, priceId: string) {
  if (!plan) {
    throw new Error(`Unknown priceId: ${priceId}`);
  }

  return plan;
}

function getRecurringStatus(status: string | null | undefined) {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'canceled':
    case 'expired':
    case 'paused':
    case 'unpaid':
    case 'scheduled_cancel':
      return status;
    default:
      return 'active';
  }
}

function extractCustomerId(
  customer: CheckoutEntity['customer'] | SubscriptionEntity['customer'] | undefined
) {
  if (!customer) {
    return null;
  }

  return typeof customer === 'string' ? customer : customer.id || null;
}

function extractProductId(
  product: CheckoutEntity['product'] | SubscriptionEntity['product'] | undefined
) {
  if (!product) {
    return null;
  }

  return typeof product === 'string' ? product : product.id || null;
}

function extractSubscriptionId(
  subscription: CheckoutEntity['subscription'] | undefined
) {
  if (!subscription) {
    return null;
  }

  return typeof subscription === 'string' ? subscription : subscription.id || null;
}

function buildSuccessUrl(priceId: string) {
  const successUrl = new URL('/api/creem/checkout', getBaseUrl());
  successUrl.searchParams.set('priceId', priceId);
  return successUrl.toString();
}

function buildCancelUrl() {
  const cancelUrl = new URL('/dashboard/billing', getBaseUrl());
  cancelUrl.searchParams.set('checkout', 'cancelled');
  return cancelUrl.toString();
}

function buildRequestId(userId: number, teamId: number, priceId: string) {
  return `fe_${teamId}_${userId}_${priceId}_${Date.now()}`;
}

function createDemoHostedCheckout(plan: BillingPlan): HostedCheckoutSession {
  const previewUrl = new URL('/dashboard/billing/demo-checkout', getBaseUrl());
  const sessionId = `demo_${plan.planType}_${Date.now()}`;
  previewUrl.searchParams.set('priceId', plan.priceId);
  previewUrl.searchParams.set('session_id', sessionId);

  return {
    mode: 'demo',
    provider: 'demo',
    checkoutUrl: previewUrl.toString(),
    sessionId,
    priceId: plan.priceId,
    planType: plan.planType,
  };
}

export async function createHostedCheckoutSession({
  team,
  priceId,
}: {
  team: CheckoutTeam;
  priceId: string;
}): Promise<HostedCheckoutSession> {
  const user = await getUser();
  const plan = normalizeCheckoutPlan(getBillingPlanByPriceId(priceId), priceId);

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  if (process.env['FAMILY_EDU_DEMO_MODE'] === '1') {
    return createDemoHostedCheckout(plan);
  }

  if (!isCreemConfigured()) {
    throw new Error(
      'CREEM_API_KEY is not configured for production checkout sessions.'
    );
  }

  const creem = getCreemClientOrThrow();
  const checkout = await creem.checkouts.create({
    productId: plan.productId,
    requestId: buildRequestId(user.id, team.id, plan.priceId),
    successUrl: buildSuccessUrl(plan.priceId),
    customer: {
      id: team.stripeCustomerId || undefined,
      email: user.email,
    },
    metadata: {
      userId: String(user.id),
      teamId: String(team.id),
      priceId: plan.priceId,
      planType: plan.planType,
      productId: plan.productId,
      source: 'pathnook-web',
    },
  });

  if (!checkout.checkoutUrl) {
    throw new Error('Creem checkout did not return a checkout URL.');
  }

  return {
    mode: 'creem',
    provider: 'creem',
    checkoutUrl: checkout.checkoutUrl,
    sessionId: checkout.id,
    priceId: plan.priceId,
    planType: plan.planType,
  };
}

export async function createCheckoutSession({
  team,
  priceId,
}: {
  team: CheckoutTeam;
  priceId: string;
}) {
  const session = await createHostedCheckoutSession({ team, priceId });
  redirect(session.checkoutUrl);
}

export async function createCustomerPortalSession(team: Team) {
  if (process.env['FAMILY_EDU_DEMO_MODE'] === '1') {
    redirect('/dashboard/billing');
  }

  if (!isCreemConfigured()) {
    redirect('/dashboard/billing?portal=unavailable');
  }

  const creem = getCreemClientOrThrow();
  const user = await getUser();
  const existingCustomerId = team.stripeCustomerId;
  let resolvedCustomerId = existingCustomerId;

  if (!resolvedCustomerId && user?.email) {
    try {
      resolvedCustomerId = (await creem.customers.retrieve(undefined, user.email)).id;
    } catch {
      resolvedCustomerId = null;
    }
  }

  if (!resolvedCustomerId) {
    redirect('/dashboard/billing?portal=unavailable');
  }

  const portal = await creem.customers.generateBillingLinks({
    customerId: resolvedCustomerId,
  });

  return {
    url: portal.customerPortalLink,
  };
}

function generateRedirectSignature(params: CheckoutRedirectParams, apiKey: string) {
  const orderedEntries: Array<[keyof CheckoutRedirectParams, string | null | undefined]> = [
    ['request_id', params.request_id],
    ['checkout_id', params.checkout_id],
    ['order_id', params.order_id],
    ['customer_id', params.customer_id],
    ['subscription_id', params.subscription_id],
    ['product_id', params.product_id],
  ];

  const data = orderedEntries
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .concat(`salt=${apiKey}`)
    .join('|');

  return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyCreemRedirectSignature(
  params: CheckoutRedirectParams,
  signature: string | null | undefined
) {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey || !signature) {
    return false;
  }

  const expected = generateRedirectSignature(params, apiKey);
  return expected === signature.trim().toLowerCase();
}

export function verifyCreemWebhookSignature(
  payload: string,
  signature: string | null | undefined
) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const normalizedSignature = signature.trim().toLowerCase();

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'utf8'),
      Buffer.from(normalizedSignature, 'utf8')
    );
  } catch {
    return false;
  }
}

export function resolvePlanFromCheckout(
  checkout: CheckoutEntity,
  fallbackPriceId?: string | null
) {
  return (
    getBillingPlanByPriceId(fallbackPriceId) ||
    getBillingPlanByPriceId(String(checkout.metadata?.priceId || '')) ||
    getBillingPlanByProductId(extractProductId(checkout.product)) ||
    null
  );
}

export async function retrieveCheckout(checkoutId: string) {
  return getCreemClientOrThrow().checkouts.retrieve(checkoutId);
}

export function getCheckoutCompletionPayload(
  checkout: CheckoutEntity,
  fallbackPriceId?: string | null
) {
  const plan = resolvePlanFromCheckout(checkout, fallbackPriceId);
  if (!plan) {
    throw new Error('No supported billing plan found for this Creem checkout.');
  }

  const subscription =
    checkout.subscription && typeof checkout.subscription !== 'string'
      ? checkout.subscription
      : null;
  const customerId = extractCustomerId(checkout.customer);
  const subscriptionId = extractSubscriptionId(checkout.subscription);
  const userId = Number(checkout.metadata?.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Creem checkout metadata is missing a valid userId.');
  }

  return {
    userId,
    userEmail: null,
    priceId: plan.priceId,
    checkoutSessionId: checkout.id,
    provider: 'creem' as const,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status: isRecurringPlanType(plan.planType)
      ? getRecurringStatus(subscription?.status)
      : 'active',
    currentPeriodEndsAt:
      isRecurringPlanType(plan.planType) && subscription?.currentPeriodEndDate
        ? subscription.currentPeriodEndDate.toISOString()
        : null,
    plan,
  };
}

export async function getConfiguredBillingPlans() {
  if (process.env['FAMILY_EDU_DEMO_MODE'] === '1' || !isCreemConfigured()) {
    return BILLING_PLANS;
  }

  try {
    const creem = getCreemClientOrThrow();
    const response = await creem.products.search(1, 50);
    const products = response.items || [];

    return BILLING_PLANS.map((plan) => {
      const remoteProduct = products.find((product) => product.id === plan.productId);

      if (!remoteProduct) {
        return plan;
      }

      return {
        ...plan,
        name: remoteProduct.name || plan.name,
        description: remoteProduct.description || plan.description,
        unitAmount: remoteProduct.price || plan.unitAmount,
        currency:
          (String(remoteProduct.currency || plan.currency).toLowerCase() as 'usd') ||
          plan.currency,
      };
    });
  } catch {
    return BILLING_PLANS;
  }
}

export function getPortalSupportLabel() {
  return isCreemConfigured() ? 'Manage in Creem Portal' : 'Portal unlocks with Creem';
}

export function getCancelReturnUrl() {
  return buildCancelUrl();
}
