import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveBillingProviderSelection } from '../lib/payments/provider-selection.ts';
import {
  BILLING_PLANS,
  getAnnualSavings,
  getBillingPlanByPriceId,
  getPublicBillingPlanGroups,
} from '../lib/payments/catalog.ts';

test('Freemius remains active when it is configured', () => {
  const selection = resolveBillingProviderSelection({
    demoMode: false,
    requested: 'freemius',
    freemiusConfigured: true,
    creemConfigured: true,
    allowCreemFallback: true,
  });

  assert.deepEqual(selection, {
    requested: 'freemius',
    active: 'freemius',
    fallbackApplied: false,
    rollbackEnabled: true,
  });
});

test('Creem rollback only activates when the flag is enabled', () => {
  const selection = resolveBillingProviderSelection({
    demoMode: false,
    requested: 'freemius',
    freemiusConfigured: false,
    creemConfigured: true,
    allowCreemFallback: true,
  });

  assert.deepEqual(selection, {
    requested: 'freemius',
    active: 'creem',
    fallbackApplied: true,
    rollbackEnabled: true,
  });
});

test('Provider selection stays on Freemius shell when rollback is disabled', () => {
  const selection = resolveBillingProviderSelection({
    demoMode: false,
    requested: 'freemius',
    freemiusConfigured: false,
    creemConfigured: true,
    allowCreemFallback: false,
  });

  assert.deepEqual(selection, {
    requested: 'freemius',
    active: 'freemius',
    fallbackApplied: false,
    rollbackEnabled: false,
  });
});

test('Public checkout entrypoints no longer import Creem directly', () => {
  const actionSource = readFileSync(
    new URL('../lib/payments/actions.ts', import.meta.url),
    'utf8'
  );
  const routeSource = readFileSync(
    new URL('../app/api/billing/checkout-session/route.ts', import.meta.url),
    'utf8'
  );

  assert.equal(actionSource.includes("lib/payments/creem"), false);
  assert.equal(routeSource.includes("lib/payments/creem"), false);
});

test('.env.example documents the pricing v2 Freemius ids and Pathnook admin email', () => {
  const envSource = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');

  assert.equal(envSource.includes('FREEMIUS_PRICING_SINGLE_REVIEW_ID='), true);
  assert.equal(envSource.includes('FREEMIUS_PRICING_STARTER_MONTHLY_ID='), true);
  assert.equal(envSource.includes('FREEMIUS_PRICING_STARTER_ANNUAL_ID='), true);
  assert.equal(envSource.includes('FREEMIUS_PRICING_PLUS_MONTHLY_ID='), true);
  assert.equal(envSource.includes('FREEMIUS_PRICING_PLUS_ANNUAL_ID='), true);
  assert.equal(envSource.includes('FREEMIUS_PRICING_FAMILY_MONTHLY_ID='), true);
  assert.equal(envSource.includes('FREEMIUS_PRICING_FAMILY_ANNUAL_ID='), true);
  assert.equal(envSource.includes('SUPPORT_EMAIL=admin@pathnook.com'), true);
  assert.equal(envSource.includes('BILLING_PROVIDER_ALLOW_CREEM_FALLBACK=0'), true);
  assert.equal(envSource.includes('FEATURE_CREEM_ROUTES=0'), true);
});

test('Creem routes default to disabled unless the route flag is enabled', () => {
  const serviceSource = readFileSync(
    new URL('../lib/payments/service.ts', import.meta.url),
    'utf8'
  );

  assert.equal(serviceSource.includes("export function isCreemRoutesEnabled()"), true);
  assert.equal(serviceSource.includes("readEnabledFlag('FEATURE_CREEM_ROUTES') ?? false"), true);
});

test('public pricing uses the 1.5.5 price ladder and grouped tiers', () => {
  const singleReview = getBillingPlanByPriceId('price_pathnook_single_review');
  const starterMonthly = getBillingPlanByPriceId('price_pathnook_starter_monthly');
  const starterAnnual = getBillingPlanByPriceId('price_pathnook_starter_annual');
  const plusMonthly = getBillingPlanByPriceId('price_pathnook_plus_monthly');
  const plusAnnual = getBillingPlanByPriceId('price_pathnook_plus_annual');
  const familyMonthly = getBillingPlanByPriceId('price_pathnook_family_monthly');
  const familyAnnual = getBillingPlanByPriceId('price_pathnook_family_annual');

  assert.equal(BILLING_PLANS.length, 7);
  assert.equal(singleReview?.unitAmount, 1900);
  assert.equal(starterMonthly?.unitAmount, 3900);
  assert.equal(starterAnnual?.unitAmount, 39000);
  assert.equal(plusMonthly?.unitAmount, 6900);
  assert.equal(plusAnnual?.unitAmount, 69000);
  assert.equal(familyMonthly?.unitAmount, 9900);
  assert.equal(familyAnnual?.unitAmount, 99000);

  assert.equal(starterMonthly?.seatLimit, 2);
  assert.equal(starterAnnual?.subjectSlotLimit, 5);
  assert.equal(plusAnnual?.subjectSlotLimit, 12);
  assert.equal(familyAnnual?.reviewCreditLimit, 16);

  assert.equal(getAnnualSavings('starter'), 7800);
  assert.equal(getAnnualSavings('plus'), 13800);
  assert.equal(getAnnualSavings('family'), 19800);

  const groups = getPublicBillingPlanGroups();
  assert.equal(groups.length, 4);
  assert.equal(groups[0]?.planCode, 'single_review');
  assert.equal(groups[1]?.monthly?.priceId, 'price_pathnook_starter_monthly');
  assert.equal(groups[2]?.annual?.priceId, 'price_pathnook_plus_annual');
  assert.equal(groups[3]?.annual?.priceId, 'price_pathnook_family_annual');
});
