import type { BillingProvider } from '../provider';
import {
  createCustomerPortalSession,
  createHostedCheckoutSession,
  getCheckoutCompletionPayload,
  getPortalSupportLabel,
  getCancelReturnUrl,
  isCreemConfigured,
  retrieveCheckout,
  verifyCreemRedirectSignature,
  verifyCreemWebhookSignature,
} from '../creem';
import type { CheckoutRedirectParams, NormalizedWebhookPayload } from '../provider';

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function getObjectId(value: unknown) {
  const object = asObject(value);
  if (!object) {
    return typeof value === 'string' ? value : null;
  }

  return typeof object.id === 'string' ? object.id : null;
}

function getMetadata(value: unknown) {
  const object = asObject(value);
  const metadata = asObject(object?.metadata);
  return metadata || {};
}

function getCurrentPeriodEndsAt(value: Record<string, unknown>) {
  const candidates = [value.currentPeriodEndDate, value.current_period_end_date];

  for (const candidate of candidates) {
    if (candidate instanceof Date) {
      return candidate.toISOString();
    }

    if (typeof candidate === 'string' && candidate) {
      return new Date(candidate).toISOString();
    }
  }

  return null;
}

function getStatusFromEvent(eventType: string, value: Record<string, unknown>) {
  const rawStatus = typeof value.status === 'string' ? value.status : null;
  if (rawStatus) {
    return rawStatus;
  }

  switch (eventType) {
    case 'subscription.trialing':
      return 'trialing';
    case 'subscription.canceled':
      return 'canceled';
    case 'subscription.expired':
      return 'expired';
    case 'subscription.paused':
      return 'paused';
    case 'subscription.scheduled_cancel':
      return 'scheduled_cancel';
    case 'subscription.past_due':
      return 'unpaid';
    default:
      return 'active';
  }
}

function getUserIdFromMetadata(metadata: Record<string, unknown>) {
  const rawValue =
    metadata.userId || metadata.referenceId || metadata.internal_customer_id;
  const userId = Number(rawValue);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export const creemProvider: BillingProvider = {
  name: 'creem',
  isConfigured: isCreemConfigured,
  createHostedCheckoutSession: async ({ team, priceId }) =>
    createHostedCheckoutSession({
      team,
      priceId,
    }),
  createCustomerPortalSession: async ({ team, userEmail: _userEmail }) =>
    createCustomerPortalSession({
      id: team.id,
      stripeCustomerId: team.stripeCustomerId,
      name: 'Billing Team',
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: null,
    } as never),
  verifyRedirectSignature: (
    params: CheckoutRedirectParams,
    signature: string | null | undefined
  ) => verifyCreemRedirectSignature(params, signature),
  async getRedirectCompletionPayload(url: string, fallbackPriceId?: string | null) {
    const requestUrl = new URL(url);
    const checkoutId = requestUrl.searchParams.get('checkout_id');

    if (!checkoutId) {
      return null;
    }

    const checkout = await retrieveCheckout(checkoutId);
    return getCheckoutCompletionPayload(checkout, fallbackPriceId);
  },
  retrieveCheckout,
  getCheckoutCompletionPayload,
  verifyWebhookSignature: (
    payload: string,
    signature: string | null | undefined
  ) => verifyCreemWebhookSignature(payload, signature),
  normalizeWebhookPayload(rawEvent: Record<string, unknown>): NormalizedWebhookPayload {
    const eventType = String(rawEvent.eventType || '');
    const object = asObject(rawEvent.object) || {};
    const metadata = getMetadata(object);
    const customerId = getObjectId(object.customer);
    const subscriptionValue =
      eventType === 'checkout.completed' ? asObject(object.subscription) || object : object;

    return {
      eventId: String(rawEvent.id || `creem_event_${Date.now()}`),
      eventType,
      userId: getUserIdFromMetadata(metadata),
      priceId:
        typeof metadata.priceId === 'string' && metadata.priceId
          ? metadata.priceId
          : null,
      checkoutSessionId:
        eventType === 'checkout.completed' && typeof object.id === 'string'
          ? object.id
          : null,
      providerCustomerId: customerId,
      providerSubscriptionId: getObjectId(subscriptionValue),
      status: getStatusFromEvent(eventType, subscriptionValue),
      currentPeriodEndsAt: getCurrentPeriodEndsAt(subscriptionValue),
      rawPayload: rawEvent,
    };
  },
};

export { getCancelReturnUrl, getPortalSupportLabel };
