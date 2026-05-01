import { type PurchaseData } from '@freemius/sdk';
import {
  getFreemiusClientOrThrow,
  getFreemiusPricingIdByPriceId,
  getInternalPlanByFreemiusPricingId,
  getInternalPlanFromFreemiusPurchase,
  isFreemiusConfigured,
  isFreemiusSandboxMode,
} from '../freemius-client';
import { getBillingPlanByPriceId } from '../catalog';
import type {
  BillingProvider,
  CheckoutCompletionPayload,
  CheckoutRedirectParams,
  CustomerPortalResult,
  HostedCheckoutSession,
  NormalizedWebhookPayload,
} from '../provider';

function getFreemiusUnavailableError(action: string) {
  return new Error(
    `Freemius ${action} is not configured. Set the Freemius environment variables or enable the Creem rollback path.`
  );
}

function getNormalizedStatus(type: 'subscription' | 'one-off' | null, purchase: PurchaseData) {
  if (type === 'one-off') {
    return 'active';
  }

  if (purchase.canceled) {
    return 'canceled';
  }

  if (!purchase.subscriptionId && type !== 'subscription') {
    return 'active';
  }

  if (purchase.renewalDate && purchase.renewalDate < new Date()) {
    return 'expired';
  }

  return 'active';
}

function getCurrentPeriodEndsAt(purchase: PurchaseData) {
  if (purchase.renewalDate instanceof Date) {
    return purchase.renewalDate.toISOString();
  }

  return purchase.expiration instanceof Date ? purchase.expiration.toISOString() : null;
}

function getCompletionPayloadFromPurchase(
  purchase: PurchaseData,
  fallbackPriceId?: string | null
): CheckoutCompletionPayload {
  const plan = getInternalPlanFromFreemiusPurchase(purchase, fallbackPriceId);
  if (!plan) {
    throw getFreemiusUnavailableError('plan mapping');
  }

  return {
    userId: null,
    userEmail: purchase.email || null,
    priceId: plan.priceId,
    checkoutSessionId: purchase.licenseId,
    provider: 'freemius',
    stripeCustomerId: String(purchase.userId || ''),
    stripeSubscriptionId: purchase.subscriptionId || null,
    status: getNormalizedStatus(purchase.subscriptionId ? 'subscription' : 'one-off', purchase),
    currentPeriodEndsAt: getCurrentPeriodEndsAt(purchase),
    plan,
  };
}

export const freemiusProvider: BillingProvider = {
  name: 'freemius',
  isConfigured: isFreemiusConfigured,
  async createHostedCheckoutSession({
    priceId,
    userEmail,
  }): Promise<HostedCheckoutSession> {
    if (!isFreemiusConfigured()) {
      throw getFreemiusUnavailableError('checkout');
    }

    const freemius = getFreemiusClientOrThrow();
    const pricingId = getFreemiusPricingIdByPriceId(priceId);
    const plan = getBillingPlanByPriceId(priceId);

    if (!pricingId || !plan) {
      throw new Error(`Freemius pricing is not mapped for ${priceId}.`);
    }

    const checkout = await freemius.checkout.create({
      user: {
        email: userEmail,
      },
      isSandbox: isFreemiusSandboxMode(),
      withRecommendation: true,
      title: 'Pathnook Checkout',
    });

    checkout
      .setPricing(pricingId)
      .setRecommendations()
      .setCancelButton('/pricing')
      .setLanguage('en_US');

    return {
      mode: 'freemius',
      provider: 'freemius',
      checkoutUrl: checkout.getLink(),
      sessionId: pricingId,
      priceId: plan.priceId,
      planType: plan.planType,
    };
  },
  async createCustomerPortalSession({
    userEmail,
  }): Promise<CustomerPortalResult> {
    if (!isFreemiusConfigured()) {
      throw getFreemiusUnavailableError('portal');
    }

    const freemius = getFreemiusClientOrThrow();
    const portal = await freemius.api.user.retrieveHostedCustomerPortalByEmail(
      userEmail
    );

    if (!portal?.link) {
      throw new Error('Freemius billing portal is unavailable for this account.');
    }

    return {
      url: portal.link,
    };
  },
  async verifyRedirectSignature(
    params: CheckoutRedirectParams,
    _signature: string | null | undefined
  ) {
    if (!params.raw_url || !isFreemiusConfigured()) {
      return false;
    }

    const freemius = getFreemiusClientOrThrow();
    const redirectInfo = await freemius.checkout.processRedirect(params.raw_url);
    return Boolean(redirectInfo);
  },
  async getRedirectCompletionPayload(url: string, fallbackPriceId?: string | null) {
    if (!isFreemiusConfigured()) {
      throw getFreemiusUnavailableError('checkout redirect');
    }

    const freemius = getFreemiusClientOrThrow();
    const redirectInfo = await freemius.checkout.processRedirect(url);

    if (!redirectInfo?.license_id) {
      return null;
    }

    const purchase = await freemius.purchase.retrievePurchaseData(redirectInfo.license_id);
    if (!purchase) {
      return null;
    }

    return getCompletionPayloadFromPurchase(purchase, fallbackPriceId);
  },
  async retrieveCheckout(checkoutId: string): Promise<unknown> {
    if (!isFreemiusConfigured()) {
      throw getFreemiusUnavailableError('checkout retrieval');
    }

    return getFreemiusClientOrThrow().purchase.retrievePurchaseData(checkoutId);
  },
  getCheckoutCompletionPayload(rawCheckout, fallbackPriceId) {
    return getCompletionPayloadFromPurchase(rawCheckout as PurchaseData, fallbackPriceId);
  },
  verifyWebhookSignature(
    payload: string,
    signature: string | null | undefined
  ) {
    if (!isFreemiusConfigured()) {
      return false;
    }

    const listener = getFreemiusClientOrThrow().webhook.createListener();
    return listener.verifySignature(payload, signature ?? null);
  },
  normalizeWebhookPayload(rawEvent) {
    const eventType = String(rawEvent.type || '');
    const objects =
      rawEvent.objects && typeof rawEvent.objects === 'object'
        ? (rawEvent.objects as Record<string, Record<string, unknown>>)
        : {};
    const user = (objects.user || {}) as Record<string, unknown>;
    const license = (objects.license || {}) as Record<string, unknown>;
    const subscription = (objects.subscription || {}) as Record<string, unknown>;
    const pricingId =
      typeof subscription.pricing_id === 'string'
        ? subscription.pricing_id
        : typeof license.pricing_id === 'string'
          ? license.pricing_id
          : null;
    const plan = getInternalPlanByFreemiusPricingId(pricingId);
    const status = eventType.includes('cancel')
      ? 'canceled'
      : eventType.includes('expired')
        ? 'expired'
        : eventType.includes('renewal.failed')
          ? 'unpaid'
          : 'active';

    return {
      eventId: String(rawEvent.id || `freemius_event_${Date.now()}`),
      eventType,
      userId:
        typeof user.id === 'number'
          ? user.id
          : Number.parseInt(String(user.id || ''), 10) || null,
      priceId: plan?.priceId || null,
      checkoutSessionId:
        typeof license.id === 'number' || typeof license.id === 'string'
          ? String(license.id)
          : null,
      providerCustomerId:
        typeof user.id === 'number' || typeof user.id === 'string' ? String(user.id) : null,
      providerSubscriptionId:
        typeof subscription.id === 'number' || typeof subscription.id === 'string'
          ? String(subscription.id)
          : null,
      status,
      currentPeriodEndsAt:
        typeof subscription.next_payment === 'string'
          ? new Date(subscription.next_payment).toISOString()
          : typeof license.expiration === 'string'
            ? new Date(license.expiration).toISOString()
            : null,
      rawPayload: rawEvent,
    };
  },
};

export { isFreemiusConfigured };
