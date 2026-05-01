import { redirect } from 'next/navigation';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { BILLING_PLANS } from './catalog';
import { getConfiguredBillingPlans as getConfiguredCreemBillingPlans } from './creem';
import { resolveBillingProviderSelection } from './provider-selection';
import type {
  BillingProvider,
  BillingProviderName,
  CheckoutCompletionPayload,
  CheckoutRedirectParams,
  CheckoutTeam,
  CustomerPortalResult,
  HostedCheckoutSession,
  NormalizedWebhookPayload,
} from './provider';
import { creemProvider } from './providers/creem';
import { freemiusProvider } from './providers/freemius';

const providers: Record<BillingProviderName, BillingProvider> = {
  freemius: freemiusProvider,
  creem: creemProvider,
};

function readEnabledFlag(...keys: string[]) {
  for (const key of keys) {
    const rawValue = process.env[key];
    if (rawValue === undefined) {
      continue;
    }

    const normalized = rawValue.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true;
    }

    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return null;
}

export function isBillingDemoMode() {
  return process.env['FAMILY_EDU_DEMO_MODE'] === '1';
}

export function getRequestedBillingProviderName(): BillingProviderName {
  const configured =
    process.env.BILLING_PROVIDER_ACTIVE || process.env.PAYMENT_PROVIDER_DEFAULT;
  return configured === 'creem' ? 'creem' : 'freemius';
}

export function isCreemRollbackEnabled() {
  return (
    readEnabledFlag(
      'BILLING_PROVIDER_ALLOW_CREEM_FALLBACK',
      'FEATURE_CREEM_ROUTES',
      'FEATURE_CREEM_UI'
    ) ?? false
  );
}

export function isCreemRoutesEnabled() {
  return readEnabledFlag('FEATURE_CREEM_ROUTES') ?? false;
}

function getBillingProviderByName(name: BillingProviderName) {
  return providers[name];
}

function getCompatibilityBillingProvider(name: BillingProviderName = 'creem') {
  return getBillingProviderByName(name);
}

export function getBillingProviderSelection() {
  const requested = getRequestedBillingProviderName();
  const selection = resolveBillingProviderSelection({
    demoMode: isBillingDemoMode(),
    requested,
    freemiusConfigured: providers.freemius.isConfigured(),
    creemConfigured: providers.creem.isConfigured(),
    allowCreemFallback: isCreemRollbackEnabled(),
  });

  return {
    ...selection,
    provider: getBillingProviderByName(selection.active),
  };
}

export function getActiveBillingProvider() {
  return getBillingProviderSelection().provider;
}

export async function createBillingHostedCheckoutSession({
  team,
  priceId,
  userEmail,
  userId,
}: {
  team: CheckoutTeam;
  priceId: string;
  userEmail: string;
  userId: number;
}): Promise<HostedCheckoutSession> {
  return getActiveBillingProvider().createHostedCheckoutSession({
    team,
    priceId,
    userEmail,
    userId,
  });
}

export async function redirectToBillingCheckout(params: {
  team: CheckoutTeam;
  priceId: string;
  userEmail: string;
  userId: number;
}) {
  try {
    const session = await createBillingHostedCheckoutSession(params);
    redirect(session.checkoutUrl);
  } catch (error) {
    const selection = getBillingProviderSelection();
    const reason =
      error instanceof Error && error.message.toLowerCase().includes('not configured')
        ? 'unavailable'
        : 'invalid';

    redirect(
      `/dashboard/billing?checkout=${reason}&provider=${selection.active}&requested=${selection.requested}`
    );
  }
}

export async function createBillingPortalSession({
  team,
  userEmail,
}: {
  team: { id: number; stripeCustomerId: string | null };
  userEmail: string;
}): Promise<CustomerPortalResult> {
  return getActiveBillingProvider().createCustomerPortalSession({
    team,
    userEmail,
  });
}

export async function redirectToBillingPortal(params: {
  team: { id: number; stripeCustomerId: string | null };
  userEmail: string;
}) {
  try {
    const session = await createBillingPortalSession(params);
    redirect(session.url);
  } catch {
    const selection = getBillingProviderSelection();
    redirect(
      `/dashboard/billing?portal=unavailable&provider=${selection.active}&requested=${selection.requested}`
    );
  }
}

export function verifyBillingRedirectSignature(
  params: CheckoutRedirectParams,
  signature: string | null | undefined,
  providerName: BillingProviderName = 'creem'
) {
  return getCompatibilityBillingProvider(providerName).verifyRedirectSignature(
    params,
    signature
  );
}

export function getBillingRedirectCompletionPayload(
  url: string,
  fallbackPriceId?: string | null,
  providerName?: BillingProviderName
) {
  const targetProvider = providerName || getBillingProviderSelection().active;
  return getCompatibilityBillingProvider(targetProvider).getRedirectCompletionPayload(
    url,
    fallbackPriceId
  );
}

export async function retrieveBillingCheckout(
  checkoutId: string,
  providerName: BillingProviderName = 'creem'
) {
  return getCompatibilityBillingProvider(providerName).retrieveCheckout(checkoutId);
}

export function getBillingCheckoutCompletionPayload(
  rawCheckout: unknown,
  fallbackPriceId?: string | null,
  providerName: BillingProviderName = 'creem'
): CheckoutCompletionPayload {
  return getCompatibilityBillingProvider(providerName).getCheckoutCompletionPayload(
    rawCheckout,
    fallbackPriceId
  );
}

export function verifyBillingWebhookSignature(
  payload: string,
  signature: string | null | undefined,
  providerName: BillingProviderName = 'creem'
) {
  return getCompatibilityBillingProvider(providerName).verifyWebhookSignature(
    payload,
    signature
  );
}

export function normalizeBillingWebhookPayload(
  rawEvent: Record<string, unknown>,
  providerName: BillingProviderName = 'creem'
): NormalizedWebhookPayload {
  return getCompatibilityBillingProvider(providerName).normalizeWebhookPayload(rawEvent);
}

export async function getConfiguredBillingPlans() {
  const selection = getBillingProviderSelection();
  if (selection.active === 'creem') {
    return getConfiguredCreemBillingPlans();
  }

  return BILLING_PLANS;
}

export function getPortalSupportLabel() {
  const selection = getBillingProviderSelection();

  if (selection.active === 'freemius') {
    return 'Open Freemius Billing Portal';
  }

  return selection.fallbackApplied
    ? 'Open Billing Portal'
    : 'Billing Portal Unavailable';
}

export function getBillingProviderStatusSummary() {
  const selection = getBillingProviderSelection();
  return {
    requestedProvider: selection.requested,
    activeProvider: selection.active,
    fallbackApplied: selection.fallbackApplied,
    rollbackEnabled: selection.rollbackEnabled,
  };
}

export async function createCheckoutForCurrentUser(priceId: string) {
  const [user, team] = await Promise.all([getUser(), getTeamForUser()]);

  if (!user || !team) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  return redirectToBillingCheckout({
    team,
    priceId,
    userEmail: user.email,
    userId: user.id,
  });
}
