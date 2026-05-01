import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BILLING_COMPAT_READ_ORDER,
  projectBillingSnapshotFromEntitlements,
} from '../lib/payments/entitlement-projection';

test('Compat read order stays provider-neutral first and legacy last', () => {
  assert.deepEqual(BILLING_COMPAT_READ_ORDER, [
    'billing_entitlements + billing_provider_accounts',
    'subscriptions + billing_events',
    'teams.stripeCustomerId / stripeSubscriptionId / stripeProductId / planName / subscriptionStatus',
  ]);
});

test('Active recurring plans project seat, subject, and review limits', () => {
  const snapshot = projectBillingSnapshotFromEntitlements(
    [31, 22, 11],
    [
      {
        planType: 'starter',
        priceId: 'price_pathnook_starter_monthly',
        status: 'active',
        reportCredits: 4,
        unlockedReportIds: [],
        currentPeriodEndsAt: new Date('2026-05-01T00:00:00.000Z'),
        providerCustomerId: 'cus_active',
      },
    ]
  );

  assert.equal(snapshot?.activePlanType, 'starter');
  assert.equal(snapshot?.billingMode, 'monthly');
  assert.equal(snapshot?.seatLimit, 2);
  assert.equal(snapshot?.subjectSlotLimit, 3);
  assert.equal(snapshot?.reviewCreditsRemaining, 4);
  assert.deepEqual(snapshot?.accessibleReportIds, [31, 22, 11]);
  assert.equal(snapshot?.portalAvailable, true);
});

test('Higher recurring tier wins when it is the newest active entitlement', () => {
  const snapshot = projectBillingSnapshotFromEntitlements(
    [18, 9],
    [
      {
        planType: 'family',
        priceId: 'price_pathnook_family_annual',
        status: 'active',
        reportCredits: 16,
        unlockedReportIds: [18, 9],
        currentPeriodEndsAt: new Date('2027-01-01T00:00:00.000Z'),
        providerCustomerId: 'cus_family',
      },
      {
        planType: 'starter',
        priceId: 'price_pathnook_starter_monthly',
        status: 'canceled',
        reportCredits: 4,
        unlockedReportIds: [18],
        currentPeriodEndsAt: new Date('2026-04-20T00:00:00.000Z'),
        providerCustomerId: 'cus_starter',
      },
    ]
  );

  assert.equal(snapshot?.activePlanType, 'family');
  assert.equal(snapshot?.billingMode, 'annual');
  assert.equal(snapshot?.subjectSlotLimit, 24);
  assert.equal(snapshot?.subscriptionStatus, 'active');
  assert.deepEqual(snapshot?.accessibleReportIds, [18, 9]);
});

test('Expired recurring entitlement keeps historical unlocked reports only', () => {
  const snapshot = projectBillingSnapshotFromEntitlements(
    [101, 88, 77],
    [
      {
        planType: 'plus',
        priceId: 'price_pathnook_plus_monthly',
        status: 'expired',
        reportCredits: 8,
        unlockedReportIds: [101, 77],
        currentPeriodEndsAt: new Date('2026-04-01T00:00:00.000Z'),
        providerCustomerId: null,
      },
    ],
    [{ providerCustomerId: 'cus_portal_only' }]
  );

  assert.equal(snapshot?.activePlanType, 'plus');
  assert.equal(snapshot?.subscriptionStatus, 'expired');
  assert.equal(snapshot?.seatLimit, 4);
  assert.deepEqual(snapshot?.accessibleReportIds, [101, 77]);
  assert.deepEqual(snapshot?.lockedReportIds, [88]);
  assert.equal(snapshot?.portalAvailable, true);
});

test('Single Review keeps one-time report history and no recurring entitlement', () => {
  const snapshot = projectBillingSnapshotFromEntitlements(
    [14, 7, 3],
    [
      {
        planType: 'single_review',
        priceId: 'price_pathnook_single_review',
        status: 'expired',
        reportCredits: 0,
        unlockedReportIds: [7, 3],
        currentPeriodEndsAt: null,
        providerCustomerId: null,
      },
    ]
  );

  assert.equal(snapshot?.activePlanType, 'single_review');
  assert.equal(snapshot?.billingMode, 'one_time');
  assert.equal(snapshot?.seatLimit, 1);
  assert.equal(snapshot?.subjectSlotLimit, 1);
  assert.deepEqual(snapshot?.accessibleReportIds, [7, 3]);
});

test('Sprint 26 migration defines the three additive billing tables and idempotency key', () => {
  const sql = readFileSync(
    new URL('../lib/db/migrations/0010_curious_freemius_foundation.sql', import.meta.url),
    'utf8'
  );

  assert.equal(sql.includes('CREATE TABLE IF NOT EXISTS "billing_provider_accounts"'), true);
  assert.equal(sql.includes('CREATE TABLE IF NOT EXISTS "billing_entitlements"'), true);
  assert.equal(sql.includes('CREATE TABLE IF NOT EXISTS "billing_webhook_events"'), true);
  assert.equal(sql.includes('"provider_event_key" varchar(220) NOT NULL UNIQUE'), true);
});
