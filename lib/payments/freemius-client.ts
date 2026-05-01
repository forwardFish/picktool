import { BILLING_CYCLE, Freemius, type PurchaseData } from '@freemius/sdk';
import {
  getBillingPlanByPriceId,
  type BillingMode,
  type BillingPlan,
  type BillingPlanCode,
} from './catalog';

function readRequiredEnv(name: string) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readBooleanEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readPricingEnv(planCode: BillingPlanCode, billingMode: BillingMode) {
  if (planCode === 'single_review') {
    return (
      readRequiredEnv('FREEMIUS_PRICING_SINGLE_REVIEW_ID') ||
      readRequiredEnv('FREEMIUS_PRICING_ONE_TIME_ID')
    );
  }

  const prefix = `FREEMIUS_PRICING_${planCode.toUpperCase()}`;
  const cadence = billingMode === 'monthly' ? 'MONTHLY' : 'ANNUAL';
  return readRequiredEnv(`${prefix}_${cadence}_ID`);
}

export function isFreemiusConfigured() {
  return Boolean(
    readRequiredEnv('FREEMIUS_PRODUCT_ID') &&
      readRequiredEnv('FREEMIUS_API_KEY') &&
      readRequiredEnv('FREEMIUS_SECRET_KEY') &&
      readRequiredEnv('FREEMIUS_PUBLIC_KEY')
  );
}

export function getFreemiusClientOrThrow() {
  const productId = readRequiredEnv('FREEMIUS_PRODUCT_ID');
  const apiKey = readRequiredEnv('FREEMIUS_API_KEY');
  const secretKey = readRequiredEnv('FREEMIUS_SECRET_KEY');
  const publicKey = readRequiredEnv('FREEMIUS_PUBLIC_KEY');

  if (!productId || !apiKey || !secretKey || !publicKey) {
    throw new Error(
      'Freemius is not configured. Set FREEMIUS_PRODUCT_ID, FREEMIUS_API_KEY, FREEMIUS_SECRET_KEY, and FREEMIUS_PUBLIC_KEY.'
    );
  }

  return new Freemius({
    productId,
    apiKey,
    secretKey,
    publicKey,
  });
}

export function isFreemiusSandboxMode() {
  return readBooleanEnv('FREEMIUS_SANDBOX_MODE');
}

export function getFreemiusPricingIdForPlan(plan: BillingPlan) {
  return readPricingEnv(plan.planCode, plan.billingMode);
}

export function getFreemiusPricingIdByPriceId(priceId: string) {
  const plan = getBillingPlanByPriceId(priceId);
  if (!plan) {
    return null;
  }

  return getFreemiusPricingIdForPlan(plan);
}

export function getInternalPlanByFreemiusPricingId(pricingId: string | null | undefined) {
  if (!pricingId) {
    return null;
  }

  return (
    BILLING_PLANS.find((plan) => getFreemiusPricingIdForPlan(plan) === pricingId) || null
  );
}

function inferPlanFromBillingCycle(purchase: Pick<PurchaseData, 'billingCycle'>) {
  if (purchase.billingCycle === BILLING_CYCLE.MONTHLY) {
    return (
      getBillingPlanByPriceId('price_pathnook_starter_monthly') ||
      getBillingPlanByPriceId('price_pathnook_plus_monthly') ||
      getBillingPlanByPriceId('price_pathnook_family_monthly')
    );
  }

  if (purchase.billingCycle === BILLING_CYCLE.YEARLY) {
    return (
      getBillingPlanByPriceId('price_pathnook_starter_annual') ||
      getBillingPlanByPriceId('price_pathnook_plus_annual') ||
      getBillingPlanByPriceId('price_pathnook_family_annual')
    );
  }

  return getBillingPlanByPriceId('price_pathnook_single_review');
}

export function getInternalPlanFromFreemiusPurchase(
  purchase: Pick<PurchaseData, 'pricingId' | 'billingCycle'>,
  fallbackPriceId?: string | null
) {
  const fromPricing = getInternalPlanByFreemiusPricingId(purchase.pricingId);
  if (fromPricing) {
    return fromPricing;
  }

  const fallbackPlan = getBillingPlanByPriceId(fallbackPriceId);
  if (fallbackPlan) {
    return fallbackPlan;
  }

  return inferPlanFromBillingCycle(purchase);
}

export const BILLING_PLANS = [
  getBillingPlanByPriceId('price_pathnook_single_review'),
  getBillingPlanByPriceId('price_pathnook_starter_monthly'),
  getBillingPlanByPriceId('price_pathnook_starter_annual'),
  getBillingPlanByPriceId('price_pathnook_plus_monthly'),
  getBillingPlanByPriceId('price_pathnook_plus_annual'),
  getBillingPlanByPriceId('price_pathnook_family_monthly'),
  getBillingPlanByPriceId('price_pathnook_family_annual'),
].filter((plan): plan is BillingPlan => Boolean(plan));
