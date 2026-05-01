import {
  BILLING_ADD_ONS,
  BILLING_PLANS,
  getBillingPlanByPriceId,
  isAnnualBillingMode,
  isRecurringPlanType,
  type BillingMode,
  type BillingPlan,
  type BillingPlanType,
} from './catalog';

export type BillingSnapshot = {
  activePlanType: 'free' | BillingPlanType;
  activePlanCode: BillingPlanType | null;
  billingMode: BillingMode | null;
  planName: string | null;
  subscriptionStatus: string;
  reportCredits: number;
  reviewCreditsRemaining: number;
  seatLimit: number;
  subjectSlotLimit: number;
  reviewCreditLimit: number;
  unlockedReportIds: number[];
  accessibleReportIds: number[];
  lockedReportIds: number[];
  currentPeriodEndsAt: string | null;
  subjectAllocationPolicy: string;
  addOnSummary: typeof BILLING_ADD_ONS;
  plans: typeof BILLING_PLANS;
  portalAvailable: boolean;
};

export const BILLING_COMPAT_READ_ORDER = [
  'billing_entitlements + billing_provider_accounts',
  'subscriptions + billing_events',
  'teams.stripeCustomerId / stripeSubscriptionId / stripeProductId / planName / subscriptionStatus',
] as const;

export type BillingProjectionRow = {
  planType: string;
  priceId?: string;
  status: string;
  reportCredits: number;
  unlockedReportIds: number[];
  currentPeriodEndsAt: Date | null;
  providerCustomerId: string | null;
};

export type ProviderAccountProjection = {
  providerCustomerId: string | null;
};

function normalizeUnlockedReportIds(ids: number[]) {
  return Array.from(
    new Set(ids.filter((id) => Number.isInteger(id) && id > 0))
  ).sort((left, right) => right - left);
}

function hasRecurringAccess(status: string) {
  return status === 'active' || status === 'trialing' || status === 'scheduled_cancel';
}

function hasRetainedHistoricalAccess(row: BillingProjectionRow) {
  return normalizeUnlockedReportIds(row.unlockedReportIds || []).length > 0;
}

function hasOneTimeAccess(row: BillingProjectionRow) {
  return row.reportCredits > 0 || hasRetainedHistoricalAccess(row) || row.status !== 'expired';
}

function getPlanForProjection(row: Pick<BillingProjectionRow, 'planType' | 'priceId'>) {
  return (
    getBillingPlanByPriceId(row.priceId) ||
    BILLING_PLANS.find((plan) => plan.planType === row.planType) ||
    null
  );
}

function getSubjectAllocationPolicy(plan: BillingPlan | null) {
  if (!plan) {
    return 'No active subject allocation policy yet.';
  }

  return isAnnualBillingMode(plan.billingMode)
    ? 'Active subject slots stay managed as annual continuity capacity with a higher annual ceiling.'
    : 'Active subject slots may be reallocated each natural month and cannot be switched infinitely inside one cycle.';
}

function buildSnapshotFromPlan(
  plan: BillingPlan | null,
  status: string,
  reportCredits: number,
  unlockedReportIds: number[],
  accessibleReportIds: number[],
  lockedReportIds: number[],
  currentPeriodEndsAt: string | null,
  portalAvailable: boolean
): BillingSnapshot {
  return {
    activePlanType: plan?.planType || 'free',
    activePlanCode: plan?.planCode || null,
    billingMode: plan?.billingMode || null,
    planName: plan?.name || null,
    subscriptionStatus: status,
    reportCredits,
    reviewCreditsRemaining: reportCredits,
    seatLimit: plan?.seatLimit || 0,
    subjectSlotLimit: plan?.subjectSlotLimit || 0,
    reviewCreditLimit: plan?.reviewCreditLimit || 0,
    unlockedReportIds,
    accessibleReportIds,
    lockedReportIds,
    currentPeriodEndsAt,
    subjectAllocationPolicy: getSubjectAllocationPolicy(plan),
    addOnSummary: BILLING_ADD_ONS,
    plans: BILLING_PLANS,
    portalAvailable,
  };
}

function getPortalAvailability(
  providerCustomerId: string | null,
  providerAccounts: ProviderAccountProjection[]
) {
  return (
    Boolean(providerCustomerId) ||
    providerAccounts.some((account) => Boolean(account.providerCustomerId))
  );
}

export function buildFreeSnapshot(allReportIds: number[]): BillingSnapshot {
  return buildSnapshotFromPlan(
    null,
    'free',
    0,
    [],
    [],
    allReportIds,
    null,
    false
  );
}

export function projectBillingSnapshotFromEntitlements(
  allReportIds: number[],
  entitlementRows: BillingProjectionRow[],
  providerAccounts: ProviderAccountProjection[] = []
): BillingSnapshot | null {
  const activeRecurring =
    entitlementRows.find((row) => {
      const plan = getPlanForProjection(row);
      return Boolean(plan && isRecurringPlanType(plan.planType) && hasRecurringAccess(row.status));
    }) || null;

  if (activeRecurring) {
    return buildSnapshotFromPlan(
      getPlanForProjection(activeRecurring),
      activeRecurring.status,
      activeRecurring.reportCredits,
      allReportIds,
      allReportIds,
      [],
      activeRecurring.currentPeriodEndsAt
        ? activeRecurring.currentPeriodEndsAt.toISOString()
        : null,
      getPortalAvailability(activeRecurring.providerCustomerId, providerAccounts)
    );
  }

  const latestRecurring =
    entitlementRows.find((row) => {
      const plan = getPlanForProjection(row);
      return Boolean(plan && isRecurringPlanType(plan.planType));
    }) || null;

  if (latestRecurring) {
    const unlockedReportIds = normalizeUnlockedReportIds(
      latestRecurring.unlockedReportIds || []
    ).filter((reportId) => allReportIds.includes(reportId));

    return buildSnapshotFromPlan(
      getPlanForProjection(latestRecurring),
      latestRecurring.status,
      latestRecurring.reportCredits,
      unlockedReportIds,
      unlockedReportIds,
      allReportIds.filter((reportId) => !unlockedReportIds.includes(reportId)),
      latestRecurring.currentPeriodEndsAt
        ? latestRecurring.currentPeriodEndsAt.toISOString()
        : null,
      getPortalAvailability(latestRecurring.providerCustomerId, providerAccounts)
    );
  }

  const oneTime = entitlementRows.find((row) => {
    const plan = getPlanForProjection(row);
    return Boolean(plan && plan.planType === 'single_review' && hasOneTimeAccess(row));
  });

  if (oneTime) {
    const unlockedReportIds = normalizeUnlockedReportIds(oneTime.unlockedReportIds || []).filter(
      (reportId) => allReportIds.includes(reportId)
    );

    return buildSnapshotFromPlan(
      getPlanForProjection(oneTime),
      oneTime.status,
      oneTime.reportCredits,
      unlockedReportIds,
      unlockedReportIds,
      allReportIds.filter((reportId) => !unlockedReportIds.includes(reportId)),
      oneTime.currentPeriodEndsAt ? oneTime.currentPeriodEndsAt.toISOString() : null,
      getPortalAvailability(oneTime.providerCustomerId, providerAccounts)
    );
  }

  return null;
}
