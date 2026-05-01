export type BillingPlanCode = 'single_review' | 'starter' | 'plus' | 'family';

export type BillingPlanType = BillingPlanCode;

export type BillingMode = 'one_time' | 'monthly' | 'annual';

export type BillingInterval = 'once' | 'month' | 'year';

export type BillingCapabilityFlags = {
  compareLevel: 'none' | 'basic' | 'full' | 'full_with_trend';
  shareLevel: 'single' | 'basic' | 'tutor_ready' | 'continuity';
  aiChatTier: 'none' | 'basic' | 'guided' | 'full';
};

export type BillingPlan = {
  planType: BillingPlanType;
  planCode: BillingPlanCode;
  billingMode: BillingMode;
  productId: string;
  priceId: string;
  name: string;
  shortName: string;
  description: string;
  audience: string;
  unitAmount: number;
  currency: 'usd';
  interval: BillingInterval;
  badge?: string;
  featured?: boolean;
  ctaLabel: string;
  summaryLine: string;
  seatLimit: number;
  subjectSlotLimit: number;
  reviewCreditLimit: number;
  features: string[];
  capabilityFlags: BillingCapabilityFlags;
  addOnsVisibleInBilling: boolean;
};

export type BillingPlanGroup = {
  planCode: BillingPlanCode;
  name: string;
  badge?: string;
  featured?: boolean;
  description: string;
  audience: string;
  summaryLine: string;
  oneTime?: BillingPlan;
  monthly?: BillingPlan;
  annual?: BillingPlan;
};

export const BILLING_ADD_ONS = {
  seat: {
    monthly: 1500,
    annual: 15000,
    description: 'Each extra seat also includes one additional active subject slot.',
  },
  subjectSlot: {
    monthly: 600,
    annual: 6000,
    description: 'Use this when the number of active learners stays the same but one learner needs more tracked subjects or themes.',
  },
  extraReviewCredits: [
    {
      pack: 2,
      unitAmount: 1500,
    },
    {
      pack: 5,
      unitAmount: 3500,
    },
  ],
} as const;

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getEnvProductId(
  planCode: BillingPlanCode,
  billingMode: BillingMode,
  fallback: string
) {
  if (planCode === 'single_review') {
    return (
      readEnv('CREEM_PRODUCT_SINGLE_REVIEW_ID', 'CREEM_PRODUCT_ONE_TIME_ID') || fallback
    );
  }

  const prefix = `CREEM_PRODUCT_${planCode.toUpperCase()}`;
  const cadence = billingMode === 'monthly' ? 'MONTHLY' : 'ANNUAL';

  return readEnv(`${prefix}_${cadence}_ID`) || fallback;
}

function buildPlan(plan: Omit<BillingPlan, 'planType' | 'planCode'> & { planCode: BillingPlanCode }) {
  return {
    ...plan,
    planType: plan.planCode,
  };
}

export const BILLING_PLANS: BillingPlan[] = [
  buildPlan({
    planCode: 'single_review',
    billingMode: 'one_time',
    productId: getEnvProductId('single_review', 'one_time', 'prod_pathnook_single_review'),
    priceId: 'price_pathnook_single_review',
    name: 'Single Review',
    shortName: 'Single Review',
    description:
      'A first paid diagnostic pass for one learner and one active subject when a family wants proof before committing to a recurring workflow.',
    audience: 'First-time trial or one concrete question',
    unitAmount: 1900,
    currency: 'usd',
    interval: 'once',
    badge: 'Fastest start',
    ctaLabel: 'Buy Single Review',
    summaryLine: '1 seat · 1 subject · 1 review',
    seatLimit: 1,
    subjectSlotLimit: 1,
    reviewCreditLimit: 1,
    features: [
      '1 learning seat',
      '1 active subject slot',
      '1 formal review credit',
      '1 diagnosis report',
      '1 weekly plan',
      '1 tutor-ready summary',
    ],
    capabilityFlags: {
      compareLevel: 'none',
      shareLevel: 'single',
      aiChatTier: 'none',
    },
    addOnsVisibleInBilling: true,
  }),
  buildPlan({
    planCode: 'starter',
    billingMode: 'monthly',
    productId: getEnvProductId('starter', 'monthly', 'prod_pathnook_starter_monthly'),
    priceId: 'price_pathnook_starter_monthly',
    name: 'Starter',
    shortName: 'Starter Monthly',
    description:
      'Recurring access for a small family footprint: one child plus one parent, or two light users who want ongoing structured reviews.',
    audience: '1 child + 1 parent or 2 light users',
    unitAmount: 3900,
    currency: 'usd',
    interval: 'month',
    badge: 'Popular',
    featured: true,
    ctaLabel: 'Start Starter Monthly',
    summaryLine: '2 seats · 3 subjects · 4 reviews / month',
    seatLimit: 2,
    subjectSlotLimit: 3,
    reviewCreditLimit: 4,
    features: [
      '2 learning seats',
      '3 active subject slots',
      '4 formal review credits per month',
      'Basic compare and resume',
      'Basic AI chat',
    ],
    capabilityFlags: {
      compareLevel: 'basic',
      shareLevel: 'basic',
      aiChatTier: 'basic',
    },
    addOnsVisibleInBilling: true,
  }),
  buildPlan({
    planCode: 'starter',
    billingMode: 'annual',
    productId: getEnvProductId('starter', 'annual', 'prod_pathnook_starter_annual'),
    priceId: 'price_pathnook_starter_annual',
    name: 'Starter',
    shortName: 'Starter Annual',
    description:
      'Starter with a higher subject ceiling for families that already know they want Pathnook as an always-on workflow.',
    audience: 'Small household with year-round follow-through',
    unitAmount: 39000,
    currency: 'usd',
    interval: 'year',
    badge: 'Best annual entry',
    ctaLabel: 'Start Starter Annual',
    summaryLine: '2 seats · 5 subjects · 4 reviews / month',
    seatLimit: 2,
    subjectSlotLimit: 5,
    reviewCreditLimit: 4,
    features: [
      '2 learning seats',
      '5 active subject slots',
      '4 formal review credits per month',
      'Basic compare and resume',
      'Basic AI chat',
    ],
    capabilityFlags: {
      compareLevel: 'basic',
      shareLevel: 'basic',
      aiChatTier: 'basic',
    },
    addOnsVisibleInBilling: true,
  }),
  buildPlan({
    planCode: 'plus',
    billingMode: 'monthly',
    productId: getEnvProductId('plus', 'monthly', 'prod_pathnook_plus_monthly'),
    priceId: 'price_pathnook_plus_monthly',
    name: 'Plus',
    shortName: 'Plus Monthly',
    description:
      'A deeper family workflow for multi-subject tracking, tutor-ready sharing, and steadier compare/resume continuity.',
    audience: '2 children, or one learner with deep multi-subject tracking',
    unitAmount: 6900,
    currency: 'usd',
    interval: 'month',
    ctaLabel: 'Start Plus Monthly',
    summaryLine: '4 seats · 8 subjects · 8 reviews / month',
    seatLimit: 4,
    subjectSlotLimit: 8,
    reviewCreditLimit: 8,
    features: [
      '4 learning seats',
      '8 active subject slots',
      '8 formal review credits per month',
      'Full compare and resume',
      'Tutor-ready share',
      'Guided AI chat',
    ],
    capabilityFlags: {
      compareLevel: 'full',
      shareLevel: 'tutor_ready',
      aiChatTier: 'guided',
    },
    addOnsVisibleInBilling: true,
  }),
  buildPlan({
    planCode: 'plus',
    billingMode: 'annual',
    productId: getEnvProductId('plus', 'annual', 'prod_pathnook_plus_annual'),
    priceId: 'price_pathnook_plus_annual',
    name: 'Plus',
    shortName: 'Plus Annual',
    description:
      'Plus with a higher annual subject ceiling for families treating Pathnook as a persistent learning operations layer.',
    audience: 'Multi-learner family with ongoing annual tracking',
    unitAmount: 69000,
    currency: 'usd',
    interval: 'year',
    badge: 'Best value',
    ctaLabel: 'Start Plus Annual',
    summaryLine: '4 seats · 12 subjects · 8 reviews / month',
    seatLimit: 4,
    subjectSlotLimit: 12,
    reviewCreditLimit: 8,
    features: [
      '4 learning seats',
      '12 active subject slots',
      '8 formal review credits per month',
      'Full compare and resume',
      'Tutor-ready share',
      'Guided AI chat',
    ],
    capabilityFlags: {
      compareLevel: 'full',
      shareLevel: 'tutor_ready',
      aiChatTier: 'guided',
    },
    addOnsVisibleInBilling: true,
  }),
  buildPlan({
    planCode: 'family',
    billingMode: 'monthly',
    productId: getEnvProductId('family', 'monthly', 'prod_pathnook_family_monthly'),
    priceId: 'price_pathnook_family_monthly',
    name: 'Family',
    shortName: 'Family Monthly',
    description:
      'The highest recurring tier for larger households, long-running continuity work, and heavier AI-assisted planning across learners.',
    audience: 'Multi-child family and parent-heavy shared use',
    unitAmount: 9900,
    currency: 'usd',
    interval: 'month',
    ctaLabel: 'Start Family Monthly',
    summaryLine: '6 seats · 15 subjects · 16 reviews / month',
    seatLimit: 6,
    subjectSlotLimit: 15,
    reviewCreditLimit: 16,
    features: [
      '6 learning seats',
      '15 active subject slots',
      '16 formal review credits per month',
      'Full compare, trend, and resume',
      'Full share and continuity',
      'Full AI chat',
    ],
    capabilityFlags: {
      compareLevel: 'full_with_trend',
      shareLevel: 'continuity',
      aiChatTier: 'full',
    },
    addOnsVisibleInBilling: true,
  }),
  buildPlan({
    planCode: 'family',
    billingMode: 'annual',
    productId: getEnvProductId('family', 'annual', 'prod_pathnook_family_annual'),
    priceId: 'price_pathnook_family_annual',
    name: 'Family',
    shortName: 'Family Annual',
    description:
      'Family with the highest annual subject ceiling for households running Pathnook as a true family learning operations hub.',
    audience: 'Large household with year-round coordinated use',
    unitAmount: 99000,
    currency: 'usd',
    interval: 'year',
    badge: 'Max continuity',
    ctaLabel: 'Start Family Annual',
    summaryLine: '6 seats · 24 subjects · 16 reviews / month',
    seatLimit: 6,
    subjectSlotLimit: 24,
    reviewCreditLimit: 16,
    features: [
      '6 learning seats',
      '24 active subject slots',
      '16 formal review credits per month',
      'Full compare, trend, and resume',
      'Full share and continuity',
      'Full AI chat',
    ],
    capabilityFlags: {
      compareLevel: 'full_with_trend',
      shareLevel: 'continuity',
      aiChatTier: 'full',
    },
    addOnsVisibleInBilling: true,
  }),
];

export function getBillingPlanByPriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }

  return BILLING_PLANS.find((plan) => plan.priceId === priceId) || null;
}

export function getBillingPlanByProductId(productId: string | null | undefined) {
  if (!productId) {
    return null;
  }

  return BILLING_PLANS.find((plan) => plan.productId === productId) || null;
}

export function getBillingPlansByCode(planCode: BillingPlanCode) {
  return BILLING_PLANS.filter((plan) => plan.planCode === planCode);
}

export function getBillingPlanGroup(planCode: BillingPlanCode): BillingPlanGroup {
  const plans = getBillingPlansByCode(planCode);
  const basePlan = plans[0];

  return {
    planCode,
    name: basePlan.name,
    badge: plans.find((plan) => Boolean(plan.badge))?.badge,
    featured: plans.some((plan) => Boolean(plan.featured)),
    description: basePlan.description,
    audience: basePlan.audience,
    summaryLine: basePlan.summaryLine,
    oneTime: plans.find((plan) => plan.billingMode === 'one_time'),
    monthly: plans.find((plan) => plan.billingMode === 'monthly'),
    annual: plans.find((plan) => plan.billingMode === 'annual'),
  };
}

export function getPublicBillingPlanGroups() {
  return (['single_review', 'starter', 'plus', 'family'] as BillingPlanCode[]).map(
    (planCode) => getBillingPlanGroup(planCode)
  );
}

export function isRecurringPlanType(
  planType: BillingPlanType | 'free' | null | undefined
): planType is Exclude<BillingPlanType, 'single_review'> {
  return Boolean(planType) && planType !== 'free' && planType !== 'single_review';
}

export function isAnnualBillingMode(
  billingMode: BillingMode | null | undefined
): billingMode is 'annual' {
  return billingMode === 'annual';
}

export function isMonthlyBillingMode(
  billingMode: BillingMode | null | undefined
): billingMode is 'monthly' {
  return billingMode === 'monthly';
}

export function formatBillingInterval(interval: BillingInterval) {
  if (interval === 'once') {
    return 'one-time';
  }

  return interval === 'month' ? 'per month' : 'per year';
}

export function getAnnualSavings(planCode: Exclude<BillingPlanCode, 'single_review'>) {
  const monthlyPlan = BILLING_PLANS.find(
    (plan) => plan.planCode === planCode && plan.billingMode === 'monthly'
  );
  const annualPlan = BILLING_PLANS.find(
    (plan) => plan.planCode === planCode && plan.billingMode === 'annual'
  );

  if (!monthlyPlan || !annualPlan) {
    return 0;
  }

  return monthlyPlan.unitAmount * 12 - annualPlan.unitAmount;
}

export function getPlanNameByType(planType: 'free' | BillingPlanType) {
  if (planType === 'free') {
    return null;
  }

  return BILLING_PLANS.find((plan) => plan.planType === planType)?.name || null;
}

export function getPlanLimitsByPriceId(priceId: string | null | undefined) {
  const plan = getBillingPlanByPriceId(priceId);
  if (!plan) {
    return null;
  }

  return {
    activePlanCode: plan.planCode,
    billingMode: plan.billingMode,
    seatLimit: plan.seatLimit,
    subjectSlotLimit: plan.subjectSlotLimit,
    reviewCreditLimit: plan.reviewCreditLimit,
    capabilityFlags: plan.capabilityFlags,
  };
}
