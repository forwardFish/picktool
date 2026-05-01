/**
 * Provider-neutral billing contract.
 * All provider implementations must satisfy this interface.
 * Service consumers import from here and from service.ts only.
 */

import type { BillingPlan, BillingPlanType } from './catalog';

// ---------------------------------------------------------------------------
// Shared payload types
// ---------------------------------------------------------------------------

export type BillingProviderName = 'freemius' | 'creem';

export type BillingRuntimeProvider = BillingProviderName | 'demo';

export type CheckoutTeam = {
  id: number;
  stripeCustomerId: string | null;
} | null;

export type HostedCheckoutSession = {
  mode: 'demo' | 'freemius' | 'creem';
  provider: BillingRuntimeProvider;
  checkoutUrl: string;
  sessionId: string;
  priceId: string;
  planType: BillingPlanType;
};

export type CustomerPortalResult = {
  url: string;
};

export type CheckoutRedirectParams = {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
  raw_url?: string | null;
};

export type NormalizedWebhookPayload = {
  eventId: string;
  eventType: string;
  userId: number | null;
  priceId: string | null;
  checkoutSessionId: string | null;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  status: string;
  currentPeriodEndsAt: string | null;
  rawPayload: Record<string, unknown>;
};

export type CheckoutCompletionPayload = {
  userId: number | null;
  userEmail: string | null;
  priceId: string;
  checkoutSessionId: string;
  provider: BillingRuntimeProvider;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodEndsAt: string | null;
  plan: BillingPlan;
};

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface BillingProvider {
  readonly name: BillingProviderName;

  isConfigured(): boolean;

  createHostedCheckoutSession(params: {
    team: CheckoutTeam;
    priceId: string;
    userEmail: string;
    userId: number;
  }): Promise<HostedCheckoutSession>;

  createCustomerPortalSession(params: {
    team: { id: number; stripeCustomerId: string | null };
    userEmail: string;
  }): Promise<CustomerPortalResult>;

  verifyRedirectSignature(
    params: CheckoutRedirectParams,
    signature: string | null | undefined
  ): Promise<boolean> | boolean;

  getRedirectCompletionPayload(
    url: string,
    fallbackPriceId?: string | null
  ): Promise<CheckoutCompletionPayload | null>;

  retrieveCheckout(checkoutId: string): Promise<unknown>;

  getCheckoutCompletionPayload(
    rawCheckout: unknown,
    fallbackPriceId?: string | null
  ): CheckoutCompletionPayload;

  verifyWebhookSignature(
    payload: string,
    signature: string | null | undefined
  ): boolean;

  normalizeWebhookPayload(
    rawEvent: Record<string, unknown>
  ): NormalizedWebhookPayload;
}
