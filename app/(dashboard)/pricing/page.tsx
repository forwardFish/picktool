'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  FileSearch,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  ONE_TIME_REFUND_WINDOW_DAYS,
  SUBSCRIPTION_REFUND_WINDOW_DAYS,
} from '@/lib/site/public-trust';

type BillingCycle = 'monthly' | 'annual';

const FAQS = [
  {
    q: 'What do seats, subjects, and reviews mean?',
    a: 'A seat is one active long-term learner identity. A subject slot is one active school subject or structured learning track. A review credit is one formal upload-to-diagnosis cycle when you want deeper analysis.',
  },
  {
    q: 'Do parents and children use the same type of seat?',
    a: 'Yes. Any active long-term user account uses one seat. We do not separate parent seats and child seats.',
  },
  {
    q: 'What counts as a subject?',
    a: 'A subject slot is one active learning track. It can be a school subject like math or English, or a structured parent learning track such as AI learning or family follow-through.',
  },
  {
    q: 'Can one learner track more than one subject?',
    a: 'Yes. Subject capacity is shared across the household plan as long as you still have available subject slots.',
  },
  {
    q: 'What happens if I run out of review credits?',
    a: 'You can keep using lighter workflow features, then add more review credits later from billing when you need more formal upload-to-diagnosis cycles.',
  },
  {
    q: 'Can I add more seats or subjects later?',
    a: 'Yes. Add-ons can be added later from billing.',
  },
] as const;

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-6 py-3 text-base font-semibold transition',
        active
          ? 'bg-[var(--pn-violet)] text-white shadow-[0_10px_24px_rgba(124,58,237,0.24)]'
          : 'text-[var(--pn-muted-2)]',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function StatInline({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-base text-[var(--pn-muted-2)]">
      {icon}
      {text}
    </span>
  );
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Check className="mt-1 h-5 w-5 flex-none text-[var(--pn-violet)]" />
      <span className="text-lg leading-8">{children}</span>
    </li>
  );
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [compareOpen, setCompareOpen] = useState(false);

  const starterPrice = billingCycle === 'monthly' ? '$39' : '$390';
  const familyPrice = billingCycle === 'monthly' ? '$99' : '$990';
  const plusPrice = billingCycle === 'monthly' ? '$69' : '$690';
  const starterSubjects = billingCycle === 'monthly' ? '3 subjects' : '5 subjects';
  const familySubjects = billingCycle === 'monthly' ? '15 subjects' : '24 subjects';
  const plusSubjects = billingCycle === 'monthly' ? '8' : '12';

  const compareRows = [
    {
      label: 'Seats',
      caption: 'Active learner identities',
      values: ['1', '2', '4', '6'],
    },
    {
      label: 'Subjects',
      caption: 'Active learning tracks',
      values: ['1', billingCycle === 'monthly' ? '3' : '5', plusSubjects, billingCycle === 'monthly' ? '15' : '24'],
    },
    {
      label: 'Reviews / month',
      caption: 'Formal diagnostic cycles',
      values: ['1', '4', '8', '16'],
    },
    {
      label: 'Best fit',
      caption: 'Who this plan suits best',
      values: [
        'Proof-first',
        'Small household',
        'Growing family',
        'Multi-child continuity',
      ],
    },
    {
      label: 'Price',
      caption: billingCycle === 'monthly' ? 'Monthly starting price' : 'Annual starting price',
      values: ['$19', starterPrice, plusPrice, familyPrice],
    },
  ] as const;

  const comparePlans = [
    { name: 'Single Review', note: 'Proof-first' },
    { name: 'Starter', note: 'Small household' },
    { name: 'Plus', note: 'Growing family' },
    { name: 'Family', note: 'Most complete' },
  ] as const;

  return (
    <main className="pn-page-shell">
      <section className="relative overflow-hidden border-b border-[var(--pn-border)] bg-[linear-gradient(180deg,#fdfaff_0%,#ffffff_100%)]">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_42%)]" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.12),transparent_70%)] blur-2xl" />

        <div className="relative mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-5xl">
            <p className="pn-kicker">Pricing</p>
            <h1 className="mt-4 max-w-4xl text-6xl font-black leading-[1.01] tracking-[-0.06em] text-[#111827] lg:text-7xl">
              Clear family pricing for diagnosis, follow-through, and steady growth
            </h1>
            <p className="mt-6 max-w-3xl text-2xl leading-10 text-[var(--pn-muted)]">
              Start with one high-signal review, then move into ongoing household
              plans when you need more seats, more active subjects, and more
              review capacity across the week.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--pn-soft-border)] bg-white/90 px-5 py-3 text-base font-semibold text-[var(--pn-muted-2)] shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[var(--pn-violet)]" />
                Cancel anytime
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--pn-soft-border)] bg-white/90 px-5 py-3 text-base font-semibold text-[var(--pn-muted-2)] shadow-sm">
                <Sparkles className="h-4 w-4 text-[var(--pn-violet)]" />
                Annual plans unlock more subject capacity
              </span>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-[var(--pn-soft-border)] bg-white/85 p-5 shadow-sm">
              <p className="text-base font-semibold text-[#111827]">
                Start from Pathnook billing management when you want to review plan effects first.
              </p>
              <p className="mt-2 text-base leading-8 text-[var(--pn-muted)]">
                Pathnook shows the local household view for learning seats, active subject slots,
                and formal review credits before you jump into the billing portal.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/sign-in?redirect=%2Fdashboard%2Fbilling"
                  className="inline-flex items-center gap-2 rounded-[1rem] border border-[var(--pn-border)] px-4 py-2 text-sm font-semibold text-[var(--pn-text)]"
                >
                  Open billing management
                </Link>
                <Link
                  href="/legal/refunds"
                  className="inline-flex items-center gap-2 rounded-[1rem] border border-[var(--pn-border)] px-4 py-2 text-sm font-semibold text-[var(--pn-text)]"
                >
                  Refund policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--pn-soft-border)] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_320px] lg:gap-10">
            <div className="min-w-0">
              <div className="flex items-start gap-5">
                <div className="hidden h-18 w-18 shrink-0 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(180deg,#ede9fe_0%,#ddd6fe_100%)] text-[var(--pn-violet)] sm:flex">
                  <FileSearch className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold uppercase tracking-[0.22em] text-[var(--pn-muted)]">
                    Single Review
                  </div>
                  <h2 className="mt-3 max-w-3xl text-[34px] font-black tracking-[-0.04em] text-[#111827] sm:text-[42px] lg:text-[48px]">
                    Fast clarity before you commit
                  </h2>
                  <p className="mt-4 max-w-3xl text-xl leading-9 text-[var(--pn-muted)]">
                    A focused first diagnostic for one learner and one active subject.
                    Upload real schoolwork, uncover the main bottleneck, and leave
                    with a clear next step for this week.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--pn-border)] pt-6">
                <StatInline icon={<Users className="h-4 w-4 text-[var(--pn-violet)]" />} text="1 seat" />
                <StatInline icon={<Layers3 className="h-4 w-4 text-[var(--pn-violet)]" />} text="1 subject" />
                <StatInline icon={<CreditCard className="h-4 w-4 text-[var(--pn-violet)]" />} text="1 review" />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] p-6 shadow-[0_16px_40px_rgba(109,40,217,0.10)]">
              <div className="text-base font-semibold uppercase tracking-[0.18em] text-[var(--pn-muted)]">
                One-time
              </div>
              <div className="mt-4 text-6xl font-black tracking-[-0.05em] text-[#111827]">
                $19
              </div>
              <p className="mt-3 text-lg leading-8 text-[var(--pn-muted)]">
                Best for families who want proof first before moving into a recurring plan.
              </p>

              <a
                href="#single-review"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#4f46e5,#7c3aed,#6d28d9)] px-7 py-4 text-lg font-bold text-white shadow-[0_16px_40px_rgba(124,58,237,0.20)]"
              >
                Get Single Review
                <ArrowRight className="h-4 w-4" />
              </a>

              <div className="mt-5 text-base leading-7 text-[var(--pn-muted)]">
                One learner. One active subject. One focused diagnostic cycle.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-6 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-[var(--pn-soft-border)] bg-white/78 px-6 py-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="pn-kicker">Household Plans</p>
              <h2 className="mt-3 max-w-3xl text-5xl font-black tracking-[-0.05em] text-[#111827]">
                Choose the ongoing plan that fits your family rhythm
              </h2>
              <p className="mt-4 max-w-3xl text-xl leading-9 text-[var(--pn-muted)]">
                Starter is designed for a lighter family setup. Family is built
                for multi-child continuity and heavier weekly review volume.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="inline-flex rounded-full border border-[var(--pn-soft-border)] bg-violet-50 p-1 shadow-sm">
                <ToggleButton
                  active={billingCycle === 'monthly'}
                  label="Monthly"
                  onClick={() => setBillingCycle('monthly')}
                />
                <ToggleButton
                  active={billingCycle === 'annual'}
                  label="Annual"
                  onClick={() => setBillingCycle('annual')}
                />
              </div>
              <div className="rounded-full bg-[var(--pn-soft)] px-5 py-3 text-base font-semibold text-[var(--pn-violet)]">
                Save up to 17% with annual billing
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-6 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] p-6">
          <p className="pn-kicker">Refund Review</p>
          <p className="mt-3 max-w-4xl text-lg leading-8 text-[var(--pn-muted)]">
            Unused one-time diagnosis purchases may be reviewed for refund within{' '}
            {ONE_TIME_REFUND_WINDOW_DAYS} days. Recurring subscriptions are generally reviewed
            during the first {SUBSCRIPTION_REFUND_WINDOW_DAYS} days of the initial billing cycle,
            subject to actual usage, duplicate-charge review, technical failure, unauthorized
            charge review, and local law.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="group relative overflow-hidden rounded-[2rem] border border-[var(--pn-border)] bg-white p-7 shadow-[0_16px_46px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(124,58,237,0.10),transparent)] opacity-80" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <h3 className="text-[46px] font-black tracking-[-0.04em] text-[#111827]">
                  Starter
                </h3>
                <span className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-[var(--pn-violet)]">
                  Best for small households
                </span>
              </div>

              <p className="mt-4 min-h-[90px] text-xl leading-9 text-[var(--pn-muted)]">
                For one child plus one parent, or two light users who want
                ongoing structured reviews and a simple weekly operating rhythm.
              </p>

              <div className="mt-6 flex items-end gap-2">
                <div className="text-6xl font-black tracking-[-0.05em] text-[#111827]">
                  {starterPrice}
                </div>
                <div className="pb-2 text-lg text-[var(--pn-muted)]">
                  per {billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-b border-[var(--pn-border)] pb-6 text-[var(--pn-muted-2)]">
                <StatInline icon={<Users className="h-4 w-4 text-[var(--pn-violet)]" />} text="2 seats" />
                <StatInline icon={<Layers3 className="h-4 w-4 text-[var(--pn-violet)]" />} text={starterSubjects} />
                <StatInline icon={<CreditCard className="h-4 w-4 text-[var(--pn-violet)]" />} text="4 reviews / month" />
              </div>

              <ul className="mt-6 space-y-4 text-[var(--pn-muted-2)]">
                <PlanFeature>Compare and resume progress over time</PlanFeature>
                <PlanFeature>Basic AI chat for lighter ongoing follow-through</PlanFeature>
                <PlanFeature>Add more seats, subjects, or reviews later as needed</PlanFeature>
              </ul>

              <a
                href={billingCycle === 'monthly' ? '#starter-monthly' : '#starter-annual'}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#4f46e5,#7c3aed,#6d28d9)] px-5 py-4 text-lg font-bold text-white shadow-[0_16px_40px_rgba(124,58,237,0.20)]"
              >
                Start Starter Plan
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-[2rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#fbf8ff_0%,#ffffff_100%)] p-7 shadow-[0_20px_56px_rgba(109,40,217,0.12)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(109,40,217,0.18)]">
            <div className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pn-violet)] shadow-sm">
              Most complete
            </div>
            <div className="relative">
              <div className="flex items-center gap-3">
                <h3 className="text-[46px] font-black tracking-[-0.04em] text-[#111827]">
                  Family
                </h3>
                <span className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-[var(--pn-violet)]">
                  Best for larger households
                </span>
              </div>

              <p className="mt-4 min-h-[90px] text-xl leading-9 text-[var(--pn-muted)]">
                For multi-child families and heavier shared use where reports,
                review capacity, and continuity need to stay consistently visible.
              </p>

              <div className="mt-6 flex items-end gap-2">
                <div className="text-6xl font-black tracking-[-0.05em] text-[#111827]">
                  {familyPrice}
                </div>
                <div className="pb-2 text-lg text-[var(--pn-muted)]">
                  per {billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-b border-[var(--pn-soft-border)] pb-6 text-[var(--pn-muted-2)]">
                <StatInline icon={<Users className="h-4 w-4 text-[var(--pn-violet)]" />} text="6 seats" />
                <StatInline icon={<Layers3 className="h-4 w-4 text-[var(--pn-violet)]" />} text={familySubjects} />
                <StatInline icon={<CreditCard className="h-4 w-4 text-[var(--pn-violet)]" />} text="16 reviews / month" />
              </div>

              <ul className="mt-6 space-y-4 text-[var(--pn-muted-2)]">
                <PlanFeature>Compare, trend, and resume across a wider household context</PlanFeature>
                <PlanFeature>Premium AI chat and stronger continuity support</PlanFeature>
                <PlanFeature>Room for more seats, more subjects, and more review demand</PlanFeature>
              </ul>

              <a
                href={billingCycle === 'monthly' ? '#family-monthly' : '#family-annual'}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#4f46e5,#7c3aed,#6d28d9)] px-5 py-4 text-lg font-bold text-white shadow-[0_16px_40px_rgba(124,58,237,0.20)]"
              >
                Start Family Plan
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--pn-border)] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[var(--pn-border)] bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] px-6 py-7 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="pn-kicker">Compare All Plans</p>
                <h3 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#111827] sm:text-5xl">
                  See the full ladder before you choose
                </h3>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
                  The main decision is usually Single Review versus ongoing access.
                  After that, the question becomes how much learner capacity,
                  subject capacity, and review depth your family actually needs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCompareOpen((value) => !value)}
                className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--pn-soft-border)] bg-white px-5 py-3 text-base font-semibold text-[var(--pn-violet)] shadow-sm"
              >
                {compareOpen ? 'Hide deeper notes' : 'Show deeper notes'}
                <ChevronDown
                  className={`h-4 w-4 transition ${compareOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          <div className="px-6 py-6 lg:px-8">
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[220px_repeat(4,minmax(0,1fr))]">
                <div className="hidden rounded-[1.6rem] border border-[var(--pn-border)] bg-white px-5 py-5 lg:flex lg:flex-col lg:justify-center">
                  <span className="text-lg font-semibold text-[#111827]">
                    Plan dimension
                  </span>
                  <span className="mt-1 text-sm leading-6 text-[var(--pn-muted)]">
                    Compare household capacity, fit, and pricing at a glance.
                  </span>
                </div>
                {comparePlans.map((plan, index) => (
                  <div
                    key={plan.name}
                    className={[
                      'rounded-[1.6rem] border px-5 py-5 text-center shadow-sm',
                      index === comparePlans.length - 1
                        ? 'border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#f6f1ff_0%,#ffffff_100%)]'
                        : 'border-[var(--pn-border)] bg-slate-50/80',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'text-2xl font-black tracking-[-0.03em]',
                        index === comparePlans.length - 1
                          ? 'text-[var(--pn-violet)]'
                          : 'text-[#111827]',
                      ].join(' ')}
                    >
                      {plan.name}
                    </div>
                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--pn-muted)]">
                      {plan.note}
                    </div>
                  </div>
                ))}
              </div>

              {compareRows.map((row) => (
                <div
                  key={row.label}
                  className="grid overflow-hidden rounded-[1.7rem] border border-[var(--pn-border)] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)] lg:grid-cols-[220px_repeat(4,minmax(0,1fr))]"
                >
                  <div className="border-b border-[var(--pn-border)] bg-slate-50/70 px-5 py-4 lg:border-b-0 lg:border-r">
                    <div className="text-xl font-semibold text-[#111827]">{row.label}</div>
                    <div className="mt-1 text-sm leading-6 text-[var(--pn-muted)]">
                      {row.caption}
                    </div>
                  </div>

                  {row.values.map((value, index) => (
                    <div
                      key={`${row.label}-${value}`}
                      className={[
                        'flex min-h-[92px] flex-col items-center justify-center border-b border-[var(--pn-border)] px-4 py-5 text-center lg:min-h-[104px] lg:border-b-0 lg:border-r',
                        index === row.values.length - 1
                          ? 'bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)]'
                          : 'bg-white',
                        index === row.values.length - 1
                          ? 'border-r-0'
                          : '',
                        index === row.values.length - 1 && row.label === 'Price'
                          ? 'text-[var(--pn-violet)]'
                          : 'text-[#111827]',
                      ].join(' ')}
                    >
                      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--pn-muted)] lg:hidden">
                        {comparePlans[index]?.name}
                      </div>
                      <div
                        className={[
                          'mt-1 text-2xl font-semibold tracking-[-0.02em] lg:mt-0',
                          row.label === 'Price' || index === row.values.length - 1
                            ? 'font-black'
                            : '',
                          row.label === 'Best fit'
                            ? 'text-xl lg:text-[1.7rem] leading-8'
                            : 'lg:text-[2rem]',
                        ].join(' ')}
                      >
                        {row.label === 'Best fit' ? (
                          <span
                            className={[
                              'inline-flex rounded-full px-4 py-2 text-base font-semibold lg:px-5 lg:py-2.5 lg:text-lg',
                              index === row.values.length - 1
                                ? 'bg-violet-100 text-[var(--pn-violet)]'
                                : 'bg-slate-100 text-[#111827]',
                            ].join(' ')}
                          >
                            {value}
                          </span>
                        ) : row.label === 'Price' ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl font-black tracking-[-0.04em] lg:text-[2.5rem]">
                              {value}
                            </span>
                            <span className="text-sm font-medium text-[var(--pn-muted)]">
                              {billingCycle === 'monthly' || index === 0 ? 'starting price' : 'starting price'}
                            </span>
                          </div>
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {compareOpen ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <h4 className="text-xl font-semibold text-[#111827]">Single Review</h4>
                  <p className="mt-2 text-base leading-8 text-[var(--pn-muted)]">
                    Best for first-time families who want a real diagnostic before
                    deciding whether ongoing access is worth it.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <h4 className="text-xl font-semibold text-[#111827]">Starter and Plus</h4>
                  <p className="mt-2 text-base leading-8 text-[var(--pn-muted)]">
                    These middle tiers are about controlled growth. Annual billing
                    is strongest when your subject load stays stable through the year.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] p-5">
                  <h4 className="text-xl font-semibold text-[#111827]">Family</h4>
                  <p className="mt-2 text-base leading-8 text-[var(--pn-muted)]">
                    The highest-clarity option for larger households that need
                    broader active coverage and steadier review throughput.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-[var(--pn-border)] bg-white p-6 shadow-[0_16px_44px_rgba(15,23,42,0.05)] lg:p-8">
            <p className="pn-kicker">FAQ</p>
            <h3 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] text-[#111827] sm:text-5xl">
              Common questions before checkout
            </h3>
            <div className="mt-6 divide-y divide-[var(--pn-border)]">
              {FAQS.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-2xl font-semibold leading-9 text-[#111827]">
                    <span>{item.q}</span>
                    <ChevronDown className="h-6 w-6 flex-none text-[var(--pn-muted)] transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 max-w-5xl text-xl leading-9 text-[var(--pn-muted)]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
