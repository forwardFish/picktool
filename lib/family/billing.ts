import 'server-only';

import { and, desc, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  analysisRuns,
  reports,
  subscriptions,
  teamMembers,
  teams,
} from '@/lib/db/schema';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import { readFamilyMockState, updateFamilyMockState } from '@/lib/family/mock-store';
import type {
  FamilyMockState,
  StoredBillingEvent,
  StoredSubscription,
} from '@/lib/family/types';
import {
  BILLING_ADD_ONS,
  BILLING_PLANS,
  getBillingPlanByPriceId,
  getPlanNameByType,
  isAnnualBillingMode,
  isRecurringPlanType,
  type BillingPlanType,
} from '@/lib/payments/catalog';
import {
  getBillingSnapshotFromEntitlements,
  recordProviderWebhookEvent,
  syncBillingEntitlement,
  syncBillingProviderAccount,
  type BillingSnapshot,
} from '@/lib/payments/entitlements';
import { scheduleReportReadyReminderForReport } from '@/lib/notifications/reminders';

type CheckoutCompletionInput = {
  userId: number;
  priceId: string;
  checkoutSessionId: string;
  provider?: 'freemius' | 'creem' | 'stripe' | 'demo';
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: string;
  currentPeriodEndsAt?: string | null;
};

type BillingWebhookInput = {
  source: 'freemius' | 'creem' | 'stripe' | 'demo';
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  userId: number;
  priceId: string;
  checkoutSessionId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: string;
  currentPeriodEndsAt?: string | null;
};

type StoredSubscriptionStatus =
  | 'pending'
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'expired'
  | 'paused'
  | 'scheduled_cancel'
  | 'unpaid';

function isDemoMode() {
  return isFamilyEduDemoMode();
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeUnlockedReportIds(ids: number[]) {
  return Array.from(
    new Set(ids.filter((id) => Number.isInteger(id) && id > 0))
  ).sort((left, right) => right - left);
}

function hasRecurringAccess(status: string) {
  return (
    status === 'active' ||
    status === 'trialing' ||
    status === 'scheduled_cancel'
  );
}

function normalizeSubscriptionStatus(
  status: string | null | undefined,
  fallback: StoredSubscriptionStatus
): StoredSubscriptionStatus {
  switch (status) {
    case 'pending':
    case 'active':
    case 'trialing':
    case 'canceled':
    case 'expired':
    case 'paused':
    case 'scheduled_cancel':
    case 'unpaid':
      return status;
    default:
      return fallback;
  }
}

function getTeamSubscriptionStatus(snapshot: BillingSnapshot) {
  if (isRecurringPlanType(snapshot.activePlanType)) {
    return snapshot.subscriptionStatus;
  }
  if (snapshot.activePlanType === 'single_review') {
    return snapshot.accessibleReportIds.length > 0 || snapshot.reportCredits > 0
      ? 'active'
      : 'expired';
  }
  return 'free';
}

function getPlanName(planType: 'free' | BillingPlanType) {
  return getPlanNameByType(planType);
}

function getSubjectAllocationPolicy(priceId: string | null | undefined) {
  const plan = getBillingPlanByPriceId(priceId);
  if (!plan) {
    return 'No active subject allocation policy yet.';
  }

  return isAnnualBillingMode(plan.billingMode)
    ? 'Active subject slots stay managed as annual continuity capacity with a higher annual ceiling.'
    : 'Active subject slots may be reallocated each natural month and cannot be switched infinitely inside one cycle.';
}

function buildBillingSnapshotFromPlan(options: {
  activePlanType: 'free' | BillingPlanType;
  priceId?: string | null;
  subscriptionStatus: string;
  reportCredits: number;
  unlockedReportIds: number[];
  accessibleReportIds: number[];
  lockedReportIds: number[];
  currentPeriodEndsAt: string | null;
  portalAvailable: boolean;
}): BillingSnapshot {
  const plan = getBillingPlanByPriceId(options.priceId);

  return {
    activePlanType: options.activePlanType,
    activePlanCode: plan?.planCode || null,
    billingMode: plan?.billingMode || null,
    planName: getPlanName(options.activePlanType),
    subscriptionStatus: options.subscriptionStatus,
    reportCredits: options.reportCredits,
    reviewCreditsRemaining: options.reportCredits,
    seatLimit: plan?.seatLimit || 0,
    subjectSlotLimit: plan?.subjectSlotLimit || 0,
    reviewCreditLimit: plan?.reviewCreditLimit || 0,
    unlockedReportIds: options.unlockedReportIds,
    accessibleReportIds: options.accessibleReportIds,
    lockedReportIds: options.lockedReportIds,
    currentPeriodEndsAt: options.currentPeriodEndsAt,
    subjectAllocationPolicy: getSubjectAllocationPolicy(options.priceId),
    addOnSummary: BILLING_ADD_ONS,
    plans: BILLING_PLANS,
    portalAvailable: options.portalAvailable,
  };
}

function getUserReportIdsFromState(state: FamilyMockState, userId: number) {
  return state.reports
    .map((report) => {
      const run = state.runs.find((candidate) => candidate.id === report.runId);
      if (!run || run.userId !== userId) {
        return null;
      }
      return {
        id: report.id,
        createdAt: report.createdAt,
      };
    })
    .filter((item): item is { id: number; createdAt: string } => Boolean(item))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((item) => item.id);
}

function getLatestActiveRecurringSubscriptionFromState(
  state: FamilyMockState,
  userId: number
) {
  return (
    state.subscriptions
      .filter(
        (item) =>
          item.userId === userId &&
          isRecurringPlanType(item.planType) &&
          hasRecurringAccess(item.status)
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ||
    null
  );
}

function getRecurringPlanIdsForDb() {
  return BILLING_PLANS.filter((plan) => isRecurringPlanType(plan.planType)).map(
    (plan) => plan.planType
  );
}

function applyCreditsToDemoSubscription(state: FamilyMockState, userId: number) {
  const subscription = state.subscriptions
    .filter((item) => item.userId === userId && item.planType === 'single_review')
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];

  if (!subscription || subscription.reportCredits <= 0) {
    return subscription || null;
  }

  const reportIds = getUserReportIdsFromState(state, userId);
  const unlocked = new Set(normalizeUnlockedReportIds(subscription.unlockedReportIds));

  for (const reportId of reportIds) {
    if (subscription.reportCredits <= 0) {
      break;
    }

    if (!unlocked.has(reportId)) {
      unlocked.add(reportId);
      subscription.reportCredits -= 1;
    }
  }

  subscription.unlockedReportIds = normalizeUnlockedReportIds(Array.from(unlocked));
  subscription.updatedAt = nowIso();
  return subscription;
}

function buildSnapshotFromDemoState(state: FamilyMockState, userId: number): BillingSnapshot {
  const recurringSubscription = getLatestActiveRecurringSubscriptionFromState(
    state,
    userId
  );
  const oneTimeSubscription = applyCreditsToDemoSubscription(state, userId);
  const allReportIds = getUserReportIdsFromState(state, userId);

  if (recurringSubscription) {
    return buildBillingSnapshotFromPlan({
      activePlanType: recurringSubscription.planType,
      priceId: recurringSubscription.priceId,
      subscriptionStatus: recurringSubscription.status,
      reportCredits: recurringSubscription.reportCredits,
      unlockedReportIds: allReportIds,
      accessibleReportIds: allReportIds,
      lockedReportIds: [],
      currentPeriodEndsAt: recurringSubscription.currentPeriodEndsAt,
      portalAvailable: Boolean(recurringSubscription.stripeCustomerId),
    });
  }

  const unlockedReportIds = normalizeUnlockedReportIds(
    oneTimeSubscription?.unlockedReportIds || []
  ).filter((reportId) => allReportIds.includes(reportId));
  const lockedReportIds = allReportIds.filter((reportId) => !unlockedReportIds.includes(reportId));

  if (oneTimeSubscription) {
    return buildBillingSnapshotFromPlan({
      activePlanType: 'single_review',
      priceId: oneTimeSubscription.priceId,
      subscriptionStatus: oneTimeSubscription.status,
      reportCredits: oneTimeSubscription.reportCredits,
      unlockedReportIds,
      accessibleReportIds: unlockedReportIds,
      lockedReportIds,
      currentPeriodEndsAt: oneTimeSubscription.currentPeriodEndsAt,
      portalAvailable: Boolean(oneTimeSubscription.stripeCustomerId),
    });
  }

  return buildBillingSnapshotFromPlan({
    activePlanType: 'free',
    subscriptionStatus: 'free',
    reportCredits: 0,
    unlockedReportIds: [],
    accessibleReportIds: [],
    lockedReportIds: allReportIds,
    currentPeriodEndsAt: null,
    portalAvailable: false,
  });
}

async function getUserTeamId(userId: number) {
  const rows = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  return rows[0]?.teamId || null;
}

function cancelOtherDemoRecurringSubscriptions(
  state: FamilyMockState,
  userId: number,
  activePlanType: BillingPlanType
) {
  for (const subscription of state.subscriptions) {
    if (
      subscription.userId === userId &&
      isRecurringPlanType(subscription.planType) &&
      subscription.planType !== activePlanType &&
      subscription.status !== 'canceled'
    ) {
      subscription.status = 'canceled';
      subscription.updatedAt = nowIso();
    }
  }
}

async function listUserReportIds(userId: number) {
  const rows = await db
    .select({
      reportId: reports.id,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .where(eq(analysisRuns.userId, userId))
    .orderBy(desc(reports.createdAt));

  return rows.map((row) => row.reportId);
}

async function applyCreditsToDbSubscription(userId: number) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.planType, 'single_review')))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);

  const subscription = rows[0];
  if (!subscription || subscription.reportCredits <= 0) {
    return subscription || null;
  }

  const reportIds = await listUserReportIds(userId);
  const unlocked = new Set(normalizeUnlockedReportIds(subscription.unlockedReportIds || []));

  for (const reportId of reportIds) {
    if (subscription.reportCredits <= 0) {
      break;
    }

    if (!unlocked.has(reportId)) {
      unlocked.add(reportId);
      subscription.reportCredits -= 1;
    }
  }

  const nextUnlocked = normalizeUnlockedReportIds(Array.from(unlocked));

  const [updated] = await db
    .update(subscriptions)
    .set({
      reportCredits: subscription.reportCredits,
      unlockedReportIds: nextUnlocked,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id))
    .returning();

  return updated || subscription;
}

async function buildSnapshotFromDb(userId: number): Promise<BillingSnapshot> {
  const recurringRows = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        inArray(subscriptions.planType, getRecurringPlanIdsForDb())
      )
    )
    .orderBy(desc(subscriptions.updatedAt));
  const recurringSubscription =
    recurringRows.find((subscription) => hasRecurringAccess(subscription.status)) || null;
  const oneTimeSubscription = await applyCreditsToDbSubscription(userId);
  const allReportIds = await listUserReportIds(userId);

  if (recurringSubscription) {
    return buildBillingSnapshotFromPlan({
      activePlanType: recurringSubscription.planType as BillingPlanType,
      priceId: recurringSubscription.priceId,
      subscriptionStatus: recurringSubscription.status,
      reportCredits: recurringSubscription.reportCredits,
      unlockedReportIds: allReportIds,
      accessibleReportIds: allReportIds,
      lockedReportIds: [],
      currentPeriodEndsAt: recurringSubscription.currentPeriodEndsAt
        ? recurringSubscription.currentPeriodEndsAt.toISOString()
        : null,
      portalAvailable: Boolean(recurringSubscription.stripeCustomerId),
    });
  }

  const unlockedReportIds = normalizeUnlockedReportIds(
    (oneTimeSubscription?.unlockedReportIds as number[] | undefined) || []
  ).filter((reportId) => allReportIds.includes(reportId));
  const lockedReportIds = allReportIds.filter((reportId) => !unlockedReportIds.includes(reportId));

  if (oneTimeSubscription) {
    return buildBillingSnapshotFromPlan({
      activePlanType: 'single_review',
      priceId: oneTimeSubscription.priceId,
      subscriptionStatus: oneTimeSubscription.status,
      reportCredits: oneTimeSubscription.reportCredits,
      unlockedReportIds,
      accessibleReportIds: unlockedReportIds,
      lockedReportIds,
      currentPeriodEndsAt: oneTimeSubscription.currentPeriodEndsAt
        ? oneTimeSubscription.currentPeriodEndsAt.toISOString()
        : null,
      portalAvailable: Boolean(oneTimeSubscription.stripeCustomerId),
    });
  }

  return buildBillingSnapshotFromPlan({
    activePlanType: 'free',
    subscriptionStatus: 'free',
    reportCredits: 0,
    unlockedReportIds: [],
    accessibleReportIds: [],
    lockedReportIds: allReportIds,
    currentPeriodEndsAt: null,
    portalAvailable: false,
  });
}

export async function getBillingSnapshotForUser(userId: number): Promise<BillingSnapshot> {
  if (isDemoMode()) {
    const state = await readFamilyMockState();
    return buildSnapshotFromDemoState(state, userId);
  }

  return getBillingSnapshotFromEntitlements(userId);
}

export async function isReportUnlockedForUser(userId: number, reportId: number) {
  const snapshot = await getBillingSnapshotForUser(userId);
  return snapshot.accessibleReportIds.includes(reportId);
}

function upsertDemoSubscription(
  state: FamilyMockState,
  input: CheckoutCompletionInput,
  teamId: number
) {
  const plan = getBillingPlanByPriceId(input.priceId);
  if (!plan) {
    throw new Error(`Unknown billing price: ${input.priceId}`);
  }

  const existing = state.subscriptions
    .filter((item) => item.userId === input.userId && item.planType === plan.planType)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];

  if (existing) {
    existing.provider = input.provider || 'demo';
    existing.priceId = input.priceId;
    existing.checkoutSessionId = input.checkoutSessionId;
    existing.stripeCustomerId = input.stripeCustomerId || existing.stripeCustomerId;
    existing.stripeSubscriptionId =
      input.stripeSubscriptionId || existing.stripeSubscriptionId;
    existing.status =
      isRecurringPlanType(plan.planType)
        ? normalizeSubscriptionStatus(input.status, 'active')
        : 'active';
    existing.currentPeriodEndsAt = input.currentPeriodEndsAt || null;
    existing.updatedAt = nowIso();
    if (plan.planType === 'single_review') {
      existing.reportCredits += 1;
    }
    if (isRecurringPlanType(plan.planType)) {
      cancelOtherDemoRecurringSubscriptions(state, input.userId, plan.planType);
    }
    return existing;
  }

  const subscription: StoredSubscription = {
    id: state.meta.nextIds.subscription++,
    teamId,
    userId: input.userId,
    provider: input.provider || 'demo',
    planType: plan.planType,
    priceId: input.priceId,
    status:
      isRecurringPlanType(plan.planType)
        ? normalizeSubscriptionStatus(input.status, 'active')
        : 'active',
    stripeCustomerId: input.stripeCustomerId || null,
    stripeSubscriptionId: input.stripeSubscriptionId || null,
    checkoutSessionId: input.checkoutSessionId,
    reportCredits: plan.planType === 'single_review' ? 1 : 0,
    unlockedReportIds: [],
    currentPeriodEndsAt: input.currentPeriodEndsAt || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  state.subscriptions.unshift(subscription);
  if (isRecurringPlanType(plan.planType)) {
    cancelOtherDemoRecurringSubscriptions(state, input.userId, plan.planType);
  }
  return subscription;
}

async function upsertDbSubscription(input: CheckoutCompletionInput) {
  const plan = getBillingPlanByPriceId(input.priceId);
  if (!plan) {
    throw new Error(`Unknown billing price: ${input.priceId}`);
  }

  const teamId = await getUserTeamId(input.userId);
  if (!teamId) {
    throw new Error('User is not associated with a team.');
  }

  const existingRows = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, input.userId), eq(subscriptions.planType, plan.planType)))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  const existing = existingRows[0];

  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set({
        provider: input.provider || 'creem',
        priceId: input.priceId,
        status:
          isRecurringPlanType(plan.planType)
            ? normalizeSubscriptionStatus(input.status, 'active')
            : 'active',
        stripeCustomerId: input.stripeCustomerId || existing.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId || existing.stripeSubscriptionId,
        checkoutSessionId: input.checkoutSessionId,
        reportCredits:
          plan.planType === 'single_review'
            ? existing.reportCredits + 1
            : existing.reportCredits,
        currentPeriodEndsAt: input.currentPeriodEndsAt
          ? new Date(input.currentPeriodEndsAt)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id))
      .returning();

    if (isRecurringPlanType(plan.planType)) {
      await db
        .update(subscriptions)
        .set({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(subscriptions.userId, input.userId),
            inArray(subscriptions.planType, getRecurringPlanIdsForDb()),
            ne(subscriptions.planType, plan.planType)
          )
        );
    }

    await db
      .update(teams)
      .set({
        planName: plan.name,
        subscriptionStatus:
          isRecurringPlanType(plan.planType)
            ? normalizeSubscriptionStatus(input.status, 'active')
            : 'active',
        stripeCustomerId: input.stripeCustomerId || existing.stripeCustomerId || null,
        stripeSubscriptionId:
          isRecurringPlanType(plan.planType)
            ? input.stripeSubscriptionId || existing.stripeSubscriptionId || null
            : existing.stripeSubscriptionId || null,
        stripeProductId: plan.productId,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));

    return updated || existing;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      teamId,
      userId: input.userId,
      provider: input.provider || 'creem',
      planType: plan.planType,
      priceId: input.priceId,
      status:
        isRecurringPlanType(plan.planType)
          ? normalizeSubscriptionStatus(input.status, 'active')
          : 'active',
      stripeCustomerId: input.stripeCustomerId || null,
      stripeSubscriptionId: input.stripeSubscriptionId || null,
      checkoutSessionId: input.checkoutSessionId,
      reportCredits: plan.planType === 'single_review' ? 1 : 0,
      unlockedReportIds: [],
      currentPeriodEndsAt: input.currentPeriodEndsAt
        ? new Date(input.currentPeriodEndsAt)
        : null,
    })
    .returning();

  if (isRecurringPlanType(plan.planType)) {
    await db
      .update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(subscriptions.userId, input.userId),
          inArray(subscriptions.planType, getRecurringPlanIdsForDb()),
          ne(subscriptions.planType, plan.planType)
        )
      );
  }

  await db
    .update(teams)
    .set({
      planName: plan.name,
      subscriptionStatus:
        isRecurringPlanType(plan.planType)
          ? normalizeSubscriptionStatus(input.status, 'active')
          : 'active',
      stripeCustomerId: input.stripeCustomerId || null,
      stripeSubscriptionId: input.stripeSubscriptionId || null,
      stripeProductId: plan.productId,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));

  return created;
}

export async function applyCheckoutCompletionForUser(input: CheckoutCompletionInput) {
  if (isDemoMode()) {
    const before = await getBillingSnapshotForUser(input.userId);
    await updateFamilyMockState((state) => {
      upsertDemoSubscription(state, input, 1);
      buildSnapshotFromDemoState(state, input.userId);
      return state;
    });
    const after = await getBillingSnapshotForUser(input.userId);
    const newlyUnlocked = after.accessibleReportIds.filter(
      (reportId) => !before.accessibleReportIds.includes(reportId)
    );
    for (const reportId of newlyUnlocked) {
      await scheduleReportReadyReminderForReport(input.userId, reportId);
    }
    return after;
  }

  const before = await getBillingSnapshotForUser(input.userId);
  const persistedSubscription = await upsertDbSubscription({
    provider: input.provider || 'creem',
    ...input,
  });
  const plan = getBillingPlanByPriceId(input.priceId);
  const normalizedSubscription =
    plan?.planType === 'single_review'
      ? await applyCreditsToDbSubscription(input.userId)
      : persistedSubscription;

  const entitlementUnlockedReportIds =
    normalizedSubscription && isRecurringPlanType(normalizedSubscription.planType as BillingPlanType)
      ? await listUserReportIds(input.userId)
      : ((normalizedSubscription?.unlockedReportIds as number[] | undefined) || []);

  if (normalizedSubscription) {
    await syncBillingProviderAccount({
      teamId: normalizedSubscription.teamId,
      userId: normalizedSubscription.userId,
      provider: (input.provider || 'creem') as 'freemius' | 'creem' | 'demo',
      providerCustomerId: input.stripeCustomerId || null,
      providerSubscriptionId: input.stripeSubscriptionId || null,
    });

    await syncBillingEntitlement({
      teamId: normalizedSubscription.teamId,
      userId: normalizedSubscription.userId,
      provider: (input.provider || 'creem') as 'freemius' | 'creem' | 'demo',
      planType: normalizedSubscription.planType as BillingPlanType,
      priceId: normalizedSubscription.priceId,
      status: normalizedSubscription.status,
      providerCustomerId: normalizedSubscription.stripeCustomerId,
      providerSubscriptionId: normalizedSubscription.stripeSubscriptionId,
      checkoutSessionId: normalizedSubscription.checkoutSessionId,
      reportCredits: normalizedSubscription.reportCredits,
      unlockedReportIds: entitlementUnlockedReportIds,
      currentPeriodEndsAt: normalizedSubscription.currentPeriodEndsAt
        ? normalizedSubscription.currentPeriodEndsAt.toISOString()
        : null,
      legacySubscriptionId: normalizedSubscription.id,
    });
  }

  const after = await getBillingSnapshotForUser(input.userId);
  const newlyUnlocked = after.accessibleReportIds.filter(
    (reportId) => !before.accessibleReportIds.includes(reportId)
  );
  for (const reportId of newlyUnlocked) {
    await scheduleReportReadyReminderForReport(input.userId, reportId);
  }
  return after;
}

async function recordDemoBillingEvent(
  state: FamilyMockState,
  input: BillingWebhookInput
) {
  const existing = state.billingEvents.find((item) => item.eventId === input.eventId);
  if (existing) {
    return false;
  }

  const event: StoredBillingEvent = {
    id: state.meta.nextIds.billingEvent++,
    source: input.source,
    eventId: input.eventId,
    eventType: input.eventType,
    payload: input.payload,
    processedAt: nowIso(),
  };
  state.billingEvents.unshift(event);
  return true;
}

async function recordDbBillingEvent(input: BillingWebhookInput) {
  const isNew = await recordProviderWebhookEvent({
    provider: input.source,
    eventId: input.eventId,
    eventType: input.eventType,
    payload: input.payload,
  });

  if (!isNew) {
    return false;
  }

  return true;
}

export async function processBillingWebhookEvent(input: BillingWebhookInput) {
  const plan = getBillingPlanByPriceId(input.priceId);
  if (!plan) {
    throw new Error(`Unknown billing price: ${input.priceId}`);
  }

  if (isDemoMode()) {
    let applied = false;
    await updateFamilyMockState(async (state) => {
      const isNew = await recordDemoBillingEvent(state, input);
      if (!isNew) {
        applied = false;
        return state;
      }

      upsertDemoSubscription(
        state,
        {
          userId: input.userId,
          priceId: input.priceId,
          checkoutSessionId: input.checkoutSessionId || input.eventId,
          provider: input.source,
          stripeCustomerId: input.stripeCustomerId || null,
          stripeSubscriptionId: input.stripeSubscriptionId || null,
          status: input.status || 'active',
          currentPeriodEndsAt: input.currentPeriodEndsAt || null,
        },
        1
      );

      buildSnapshotFromDemoState(state, input.userId);
      applied = true;
      return state;
    });

    return { applied, snapshot: await getBillingSnapshotForUser(input.userId) };
  }

  const isNew = await recordDbBillingEvent(input);
  if (!isNew) {
    return { applied: false, snapshot: await getBillingSnapshotForUser(input.userId) };
  }

  await upsertDbSubscription({
    userId: input.userId,
    priceId: input.priceId,
    checkoutSessionId: input.checkoutSessionId || input.eventId,
    provider: input.source,
    stripeCustomerId: input.stripeCustomerId || null,
    stripeSubscriptionId: input.stripeSubscriptionId || null,
    status: input.status || 'active',
    currentPeriodEndsAt: input.currentPeriodEndsAt || null,
  });

  const persisted =
    plan.planType === 'single_review'
      ? await applyCreditsToDbSubscription(input.userId)
      : (
          await db
            .select()
            .from(subscriptions)
            .where(and(eq(subscriptions.userId, input.userId), eq(subscriptions.planType, plan.planType)))
            .orderBy(desc(subscriptions.updatedAt))
            .limit(1)
        )[0] || null;

  const entitlementUnlockedReportIds = isRecurringPlanType(plan.planType)
    ? await listUserReportIds(input.userId)
    : ((persisted?.unlockedReportIds as number[] | undefined) || []);

  if (persisted) {
    await syncBillingProviderAccount({
      teamId: persisted.teamId,
      userId: persisted.userId,
      provider: input.source,
      providerCustomerId: input.stripeCustomerId || null,
      providerSubscriptionId: input.stripeSubscriptionId || null,
    });

    await syncBillingEntitlement({
      teamId: persisted.teamId,
      userId: persisted.userId,
      provider: input.source,
      planType: persisted.planType as BillingPlanType,
      priceId: persisted.priceId,
      status: persisted.status,
      providerCustomerId: persisted.stripeCustomerId,
      providerSubscriptionId: persisted.stripeSubscriptionId,
      checkoutSessionId: persisted.checkoutSessionId,
      reportCredits: persisted.reportCredits,
      unlockedReportIds: entitlementUnlockedReportIds,
      currentPeriodEndsAt: persisted.currentPeriodEndsAt
        ? persisted.currentPeriodEndsAt.toISOString()
        : null,
      legacySubscriptionId: persisted.id,
    });
  }

  return { applied: true, snapshot: await getBillingSnapshotForUser(input.userId) };
}

export function getBillingPaywallSummary(snapshot: BillingSnapshot) {
  return {
    planName: snapshot.planName,
    subscriptionStatus: snapshot.subscriptionStatus,
    activePlanType: snapshot.activePlanType,
    reportCredits: snapshot.reportCredits,
    billingUrl: '/dashboard/billing',
  };
}

export type { BillingSnapshot };
