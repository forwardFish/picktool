import type { Metadata } from 'next';
import {
  ONE_TIME_REFUND_WINDOW_DAYS,
  PUBLIC_CONTACT_EMAIL,
  SUBSCRIPTION_REFUND_WINDOW_DAYS,
} from '@/lib/site/public-trust';

export const metadata: Metadata = {
  title: 'Pathnook Refund Policy',
  description:
    'Read the Pathnook refund policy for one-time diagnosis purchases, recurring plans, and billing review.',
  alternates: {
    canonical: '/legal/refunds'
  }
};

export default function RefundsPage() {
  return (
    <main className="pn-doc-shell">
      <article className="pn-doc-card">
        <p className="pn-kicker">
          Refunds
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#111827]">
          Pathnook Refund Policy
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--pn-muted)]">
          Effective date: April 14, 2026
        </p>

        <div className="pn-doc-prose mt-8 space-y-8">
          <section>
            <h2>1. Policy approach</h2>
            <p className="mt-3">
              Pathnook uses a consumptive-usage approach. Refund eligibility
              depends on whether a diagnosis credit, generated report, or
              recurring-plan benefit has already been consumed. This approach is
              intended to reduce confusion for AI-assisted software where value
              is delivered through completed workflows rather than shipped
              physical goods.
            </p>
          </section>

          <section>
            <h2>2. One-time diagnosis purchases</h2>
            <p className="mt-3">
              Unused one-time diagnosis credits may be reviewed for refund
              within <strong>{ONE_TIME_REFUND_WINDOW_DAYS} days</strong> of purchase.
              Once a diagnosis has been completed, a report has been generated,
              or the credit has otherwise been consumed, refunds are generally
              not available except for duplicate charge, technical failure,
              billing error, unauthorized charge confirmed after review, or
              legal requirement.
            </p>
          </section>

          <section>
            <h2>3. Subscription plans</h2>
            <p className="mt-3">
              Monthly and annual plans renew automatically until canceled.
              Refund review for recurring plans is generally limited to the
              first <strong>{SUBSCRIPTION_REFUND_WINDOW_DAYS} days</strong> of
              the initial billing cycle, subject to actual usage and local law.
              After a recurring plan has already delivered substantial access,
              report continuity, or historical retention, refunds are generally
              not granted for elapsed billing periods.
            </p>
          </section>

          <section>
            <h2>4. Exceptions and review factors</h2>
            <p className="mt-3">
              Pathnook may review refunds outside the standard rule for
              duplicate charges, technical failures that blocked normal use,
              obvious billing mistakes, unauthorized charges confirmed after
              review, or where refund is required by law. Actual usage,
              diagnosis completion, report delivery, household access history,
              and available billing records may all be considered during the
              review.
            </p>
          </section>

          <section>
            <h2>5. Freemius coordination</h2>
            <p className="mt-3">
              Freemius acts as Merchant of Record for checkout, invoicing,
              payment methods, renewals, and cancellation. If the payment was
              processed through Freemius, refund review and fulfillment may
              require coordination with Freemius before the final outcome is
              confirmed. Pathnook can review product access, entitlement sync,
              and usage history, while Freemius may control the underlying
              billing record.
            </p>
          </section>

          <section>
            <h2>6. How to request a refund</h2>
            <p className="mt-3">
              Email <strong>{PUBLIC_CONTACT_EMAIL}</strong> with the purchase
              email, order date, and a short description of the issue. Pathnook
              aims to reply within 2 business days. When needed, Pathnook may
              request more information to confirm usage state, technical
              failure, duplicate charge, or ownership of the billing record.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
