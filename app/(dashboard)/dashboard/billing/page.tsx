import Link from 'next/link';
import { checkoutAction, customerPortalAction } from '@/lib/payments/actions';
import {
  BILLING_ADD_ONS,
  formatBillingInterval,
  getPublicBillingPlanGroups,
} from '@/lib/payments/catalog';
import { getUser } from '@/lib/db/queries';
import { getBillingSnapshotForUser } from '@/lib/family/billing';
import { getPortalSupportLabel } from '@/lib/payments/service';
import { FREEMIUS_BILLING_ROLE_LINE, PUBLIC_CONTACT_EMAIL } from '@/lib/site/public-trust';
import { Button } from '@/components/ui/button';

type PageProps = {
  searchParams: Promise<{
    checkout?: string;
    plan?: string;
    portal?: string;
  }>;
};

function getCheckoutMessage(checkout: string | undefined, plan: string | undefined) {
  if (checkout === 'success') {
    if (plan === 'family') {
      return 'Family is active. The household now has the highest seat, subject, and review-credit ceiling.';
    }

    if (plan === 'plus') {
      return 'Plus is active. Multi-subject tracking, tutor-ready sharing, and deeper review continuity are now unlocked.';
    }

    if (plan === 'starter') {
      return 'Starter is active. The account now has recurring seats, active subject slots, and monthly review credits.';
    }

    return 'Single Review was applied. The next formal diagnosis path can now unlock against the available review credit.';
  }

  if (checkout === 'cancelled') {
    return 'Checkout was canceled. Billing and local entitlements stay unchanged until a payment completes.';
  }

  if (checkout === 'invalid') {
    return 'Checkout could not be completed because the selected billing payload was invalid.';
  }

  if (checkout === 'unavailable') {
    return `Billing is temporarily unavailable. Please try again shortly or contact ${PUBLIC_CONTACT_EMAIL} for help.`;
  }

  return null;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([getUser(), searchParams]);

  if (!user) {
    return null;
  }

  const snapshot = await getBillingSnapshotForUser(user.id);
  const checkoutMessage = getCheckoutMessage(params.checkout, params.plan);
  const renewalLabel =
    snapshot.currentPeriodEndsAt ||
    (snapshot.billingMode && snapshot.billingMode !== 'one_time'
      ? 'Renews in the Freemius billing portal'
      : 'Not applicable');
  const portalCta = snapshot.portalAvailable ? getPortalSupportLabel() : 'Open Freemius Billing Portal';
  const planGroups = getPublicBillingPlanGroups();

  return (
    <section className="space-y-6">
      <section className="pn-section-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
              <span>Account</span>
              <span>/</span>
              <span className="text-[#111827]">Billing</span>
            </div>
            <h1 className="pn-section-title mt-4">Pathnook billing center</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
              {FREEMIUS_BILLING_ROLE_LINE}
            </p>
          </div>
          <div className="rounded-full bg-[var(--pn-soft)] px-4 py-2 text-sm font-semibold text-[var(--pn-violet)]">
            Freemius managed subscription
          </div>
        </div>
      </section>

      {checkoutMessage ? (
        <section className="pn-section-card border-orange-200 bg-orange-50/70">
          <div className="text-sm leading-7 text-orange-900">{checkoutMessage}</div>
        </section>
      ) : null}

      {params.portal === 'unavailable' ? (
        <section className="pn-section-card border-amber-200 bg-amber-50/80">
          <div className="text-sm leading-7 text-amber-900">
            A Freemius billing portal record is not available for this household yet. Complete a
            live checkout first so billing management can be opened.
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="pn-section-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="pn-kicker">Current account snapshot</p>
              <h2 className="mt-2 text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
                Household billing state
              </h2>
            </div>
            <span className="pn-status-pill" data-status={snapshot.subscriptionStatus}>
              {snapshot.subscriptionStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-6 space-y-4 text-sm text-[var(--pn-muted-2)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="pn-info-tile">
                <p className="pn-muted-label">Current plan</p>
                <p className="mt-2 font-semibold text-[#111827]">
                  {snapshot.planName || 'Free setup state'}
                </p>
              </div>
              <div className="pn-info-tile">
                <p className="pn-muted-label">Status</p>
                <p className="mt-2 font-semibold text-[#111827]">{snapshot.subscriptionStatus}</p>
              </div>
              <div className="pn-info-tile">
                <p className="pn-muted-label">Learning seats</p>
                <p className="mt-2 font-semibold text-[#111827]">{snapshot.seatLimit}</p>
              </div>
              <div className="pn-info-tile">
                <p className="pn-muted-label">Active subject slots</p>
                <p className="mt-2 font-semibold text-[#111827]">{snapshot.subjectSlotLimit}</p>
              </div>
              <div className="pn-info-tile">
                <p className="pn-muted-label">Review credits remaining</p>
                <p className="mt-2 font-semibold text-[#111827]">{snapshot.reviewCreditsRemaining}</p>
              </div>
              <div className="pn-info-tile">
                <p className="pn-muted-label">Renewal or period end</p>
                <p className="mt-2 font-semibold text-[#111827]">{renewalLabel}</p>
              </div>
            </div>

            <div className="pn-panel-soft">
              <p className="pn-muted-label">Subject allocation policy</p>
              <p className="mt-2 text-sm leading-7 text-[var(--pn-muted)]">
                {snapshot.subjectAllocationPolicy}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="pn-panel-soft">
                <p className="pn-muted-label">Accessible reports</p>
                <p className="mt-2 text-lg font-bold text-[#111827]">
                  {snapshot.accessibleReportIds.length}
                </p>
              </div>
              <div className="pn-panel-soft">
                <p className="pn-muted-label">Historical access retained</p>
                <p className="mt-2 text-sm leading-7 text-[var(--pn-muted)]">
                  {snapshot.accessibleReportIds.length > 0 ? 'Yes' : 'No retained reports yet'}
                </p>
              </div>
              <div className="pn-panel-soft">
                <p className="pn-muted-label">Locked reports</p>
                <p className="mt-2 text-lg font-bold text-[#111827]">{snapshot.lockedReportIds.length}</p>
              </div>
            </div>

            {snapshot.portalAvailable ? (
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline" className="w-full rounded-[1rem]">
                  {portalCta}
                </Button>
              </form>
            ) : null}

            <div className="pn-panel-soft">
              <p className="text-base font-bold text-[#111827]">Add-ons available inside billing</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1rem] border border-[var(--pn-border)] bg-white p-4">
                  <p className="font-medium text-slate-950">Add seat</p>
                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    +${(BILLING_ADD_ONS.seat.monthly / 100).toFixed(0)} / month or +$
                    {(BILLING_ADD_ONS.seat.annual / 100).toFixed(0)} / year
                  </p>
                </div>
                <div className="rounded-[1rem] border border-[var(--pn-border)] bg-white p-4">
                  <p className="font-medium text-slate-950">Add subject slot</p>
                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    +${(BILLING_ADD_ONS.subjectSlot.monthly / 100).toFixed(0)} / month or +$
                    {(BILLING_ADD_ONS.subjectSlot.annual / 100).toFixed(0)} / year
                  </p>
                </div>
                <div className="rounded-[1rem] border border-[var(--pn-border)] bg-white p-4">
                  <p className="font-medium text-slate-950">Extra review credits</p>
                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    {BILLING_ADD_ONS.extraReviewCredits.map(
                      (pack) => `$${(pack.unitAmount / 100).toFixed(0)} / ${pack.pack}`
                    ).join(' / ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="pn-panel-soft">
              <p className="text-base font-bold text-[#111827]">Cancellation and support</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Review local entitlements here, then open the Freemius billing portal when you
                need invoices, payment-method updates, renewals, or cancellation. For refund
                review, entitlement questions, or access mismatches, contact Pathnook directly.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm" className="rounded-[0.9rem]">
                  <Link href="/legal/refunds">Refund policy</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-[0.9rem]">
                  <Link href="/help">Help center</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-[0.9rem]">
                  <Link href="/contact">Contact</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="pn-section-card">
          <p className="pn-kicker">Available Plans</p>
          <h2 className="mt-2 text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
            Upgrade path
          </h2>

          <div className="mt-6 space-y-4">
            <div className="pn-panel-soft text-sm leading-7 text-slate-600">
              <p className="font-medium text-slate-950">Pathnook pricing ladder</p>
              <p className="mt-2">
                Billing now scales by learner seats, active subject slots, and formal review
                credits. Add-ons expand capacity after a household is already on a recurring plan.
              </p>
            </div>

            {planGroups.map((group) => (
              <div
                key={group.planCode}
                className="rounded-[1.4rem] border border-[var(--pn-border)] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{group.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{group.summaryLine}</p>
                  </div>
                  {group.badge ? (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                      {group.badge}
                    </span>
                  ) : null}
                </div>

                {group.oneTime ? (
                  <form
                    action={checkoutAction}
                    className="mt-4 rounded-[1rem] border border-slate-200 p-4"
                  >
                    <p className="text-sm font-medium text-slate-950">
                      ${group.oneTime.unitAmount / 100}{' '}
                      {formatBillingInterval(group.oneTime.interval)}
                    </p>
                    <input type="hidden" name="priceId" value={group.oneTime.priceId} />
                    <Button type="submit" className="mt-3 w-full rounded-[0.9rem]">
                      {group.oneTime.ctaLabel}
                    </Button>
                  </form>
                ) : null}

                {group.monthly ? (
                  <form
                    action={checkoutAction}
                    className="mt-4 rounded-[1rem] border border-slate-200 p-4"
                  >
                    <p className="text-sm font-medium text-slate-950">
                      ${group.monthly.unitAmount / 100}{' '}
                      {formatBillingInterval(group.monthly.interval)}
                    </p>
                    <input type="hidden" name="priceId" value={group.monthly.priceId} />
                    <Button type="submit" className="mt-3 w-full rounded-[0.9rem]">
                      {group.monthly.ctaLabel}
                    </Button>
                  </form>
                ) : null}

                {group.annual ? (
                  <form
                    action={checkoutAction}
                    className="mt-3 rounded-[1rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-medium text-slate-950">
                      ${group.annual.unitAmount / 100}{' '}
                      {formatBillingInterval(group.annual.interval)}
                    </p>
                    <input type="hidden" name="priceId" value={group.annual.priceId} />
                    <Button
                      type="submit"
                      variant="outline"
                      className="mt-3 w-full rounded-[0.9rem]"
                    >
                      {group.annual.ctaLabel}
                    </Button>
                  </form>
                ) : null}
              </div>
            ))}

            <Button asChild variant="outline" className="w-full rounded-[1rem]">
              <Link href="/pricing">View public pricing</Link>
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
