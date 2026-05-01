import type { Metadata } from 'next';
import {
  PUBLIC_CONTACT_EMAIL,
  PUBLIC_OPERATOR_LINE,
} from '@/lib/site/public-trust';

export const metadata: Metadata = {
  title: 'Pathnook Privacy Policy',
  description:
    'Read the Pathnook Privacy Policy for account data, uploaded learning materials, cookies, and data handling.',
  alternates: {
    canonical: '/legal/privacy'
  }
};

export default function PrivacyPage() {
  return (
    <main className="pn-doc-shell">
      <article className="pn-doc-card">
        <p className="pn-kicker">
          Privacy
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#111827]">
          Pathnook Privacy Policy
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--pn-muted)]">
          Effective date: April 14, 2026
        </p>

        <div className="pn-doc-prose mt-8 space-y-8">
          <section>
            <h2>1. Operator and account eligibility</h2>
            <p className="mt-3">
              {PUBLIC_OPERATOR_LINE} This Privacy Policy describes how Pathnook
              collects, uses, stores, shares, and protects personal data for
              adult account holders. Pathnook is designed for parents,
              guardians, and other authorized adults. Children may not create
              accounts directly.
            </p>
          </section>

          <section>
            <h2>2. Information we collect</h2>
            <p className="mt-3">
              We may collect account and identity data such as name, email
              address, hashed credentials, authentication records, country,
              household membership, billing references, and support
              correspondence. We also collect product and technical data such as
              uploads, diagnosis artifacts, report summaries, entitlements,
              report history, session records, device or browser logs, and
              operational security events needed to run the service.
            </p>
          </section>

          <section>
            <h2>3. Child and student materials</h2>
            <p className="mt-3">
              Pathnook may process learning materials that relate to a child or
              student when an adult account holder uploads those materials. The
              adult user is responsible for having the authority to upload,
              review, share, and request deletion of that material. We ask users
              to upload only what is reasonably necessary for diagnosis, review,
              compare, and follow-through workflows.
            </p>
          </section>

          <section>
            <h2>4. How we use information</h2>
            <p className="mt-3">
              We use information to create and protect accounts, run diagnosis
              workflows, generate reports, maintain entitlements, keep billing
              effects synchronized, provide support, investigate abuse or fraud,
              improve reliability, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2>5. Cookies, sessions, and device signals</h2>
            <p className="mt-3">
              Pathnook uses cookies, session records, and similar technical data
              to keep users signed in, protect accounts, remember workflow
              state, prevent abuse, and diagnose service failures. Device and
              browser signals may also be logged for security, fraud
              investigation, and operational monitoring.
            </p>
          </section>

          <section>
            <h2>6. AI processing and model-training stance</h2>
            <p className="mt-3">
              Pathnook uses AI-assisted processing to analyze uploaded learning
              evidence and produce structured outputs. Pathnook does not use
              uploaded family materials, report artifacts, or household history
              to train public foundation models. AI-generated output may still
              be probabilistic and should be treated as decision support rather
              than a guaranteed educational judgment.
            </p>
          </section>

          <section>
            <h2>7. Service providers and Freemius billing role</h2>
            <p className="mt-3">
              We may use service providers for cloud hosting, authentication,
              file storage, AI processing, infrastructure security, email or
              support delivery, and payment operations. Freemius acts as
              Merchant of Record for checkout, recurring billing, invoicing,
              certain tax handling, payment methods, and cancellation flows. To
              complete a purchase, we may share necessary transaction
              identifiers, account email, and product reference information with
              Freemius. Pathnook does not publish full card details inside the
              application.
            </p>
          </section>

          <section>
            <h2>8. Sharing, exports, and support access</h2>
            <p className="mt-3">
              Pathnook may share information with service providers, legal
              authorities where required, fraud-prevention partners, or other
              parties involved in a payment or dispute review. Within the
              product, adult users control whether they export or share a
              report. Shared report views are designed to preserve the diagnosis
              context without exposing more raw material than is reasonably
              needed for the intended share summary.
            </p>
          </section>

          <section>
            <h2>9. Retention and deletion boundaries</h2>
            <p className="mt-3">
              We retain data for as long as needed to operate the service,
              preserve report history, maintain billing reconciliation, enforce
              security, and comply with legal obligations. Deletion requests may
              cover account data, uploads, report artifacts, and household
              history, but some records may remain longer when required for tax,
              fraud prevention, chargeback defense, audit, dispute handling, or
              legal compliance.
            </p>
          </section>

          <section>
            <h2>10. Regional rights and international processing</h2>
            <p className="mt-3">
              Depending on your location, you may request access, correction,
              deletion, export, objection, or restriction of certain personal
              data. Data may be processed in more than one jurisdiction
              depending on infrastructure and service-provider operations. When
              local law grants additional privacy rights, Pathnook will review
              requests in light of those rights and any lawful exceptions.
            </p>
          </section>

          <section>
            <h2>11. Security and policy updates</h2>
            <p className="mt-3">
              Pathnook uses reasonable administrative, technical, and
              organizational safeguards such as access control, encrypted
              transport, least-privilege handling, and operational monitoring.
              We may update this policy when the product, legal obligations, or
              service-provider relationships change. Material updates will be
              reflected by updating the effective date and, where appropriate,
              by providing additional notice inside the product or through the
              public site.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p className="mt-3">
              Use <strong>{PUBLIC_CONTACT_EMAIL}</strong> for general support,
              privacy requests, deletion requests, correction requests, export
              requests, refund review, and billing-help escalation. If a request
              involves a payment handled by Freemius, Pathnook may coordinate
              with Freemius before confirming the final outcome.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
