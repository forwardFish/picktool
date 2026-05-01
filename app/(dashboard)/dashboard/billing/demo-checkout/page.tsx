import Link from 'next/link';
import { notFound } from 'next/navigation';
import { completeDemoCheckoutAction } from '@/lib/payments/actions';
import { formatBillingInterval, getBillingPlanByPriceId } from '@/lib/payments/catalog';
import { Button } from '@/components/ui/button';

type PageProps = {
  searchParams: Promise<{
    priceId?: string;
    session_id?: string;
  }>;
};

export default async function DemoCheckoutPage({ searchParams }: PageProps) {
  const { priceId, session_id: sessionId } = await searchParams;
  const plan = getBillingPlanByPriceId(priceId);

  if (!plan || !sessionId) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <section className="pn-section-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
          <span>Account</span>
          <span>/</span>
          <span>Billing</span>
          <span>/</span>
          <span className="text-[#111827]">Demo Checkout</span>
        </div>
        <h1 className="pn-section-title mt-4">Review the selected Pathnook plan</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
          This sandbox preview mirrors the billing handoff so checkout success and cancel return
          paths can be validated without a live merchant account.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="pn-section-card">
          <p className="pn-kicker">Selected Plan</p>
          <h2 className="mt-2 text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
            {plan.name}
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--pn-muted-2)]">
            <div className="pn-panel-soft">
              <p>{plan.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="pn-info-tile">
                <p className="pn-muted-label">Price</p>
                <p className="mt-2 text-lg font-bold text-[#111827]">
                  ${plan.unitAmount / 100} {formatBillingInterval(plan.interval)}
                </p>
              </div>
              <div className="pn-info-tile">
                <p className="pn-muted-label">Session</p>
                <p className="mt-2 break-all text-sm font-semibold text-[#111827]">{sessionId}</p>
              </div>
            </div>
            <div className="pn-panel-soft">
              <p>
                Successful completion should unlock the report path according to the PRD billing
                rules and return the parent to the billing dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="pn-section-card">
          <p className="pn-kicker">Next Step</p>
          <h2 className="mt-2 text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
            Confirm the simulated purchase
          </h2>
          <div className="mt-6 space-y-3">
            <form action={completeDemoCheckoutAction} className="space-y-3">
              <input type="hidden" name="priceId" value={plan.priceId} />
              <input type="hidden" name="sessionId" value={sessionId} />
              <Button type="submit" className="w-full rounded-[1rem]">
                Complete Demo Checkout
              </Button>
            </form>

            <Button asChild variant="outline" className="w-full rounded-[1rem]">
              <Link href="/dashboard/billing?checkout=cancelled">Cancel And Return</Link>
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
