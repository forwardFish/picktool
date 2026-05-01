import type { Metadata } from 'next';
import {
  PUBLIC_CONTACT_EMAIL,
} from '@/lib/site/public-trust';

export const metadata: Metadata = {
  title: 'Pathnook Terms of Service',
  description:
    'Read the Pathnook Terms of Service covering account eligibility, uploads, AI limitations, and acceptable use.',
  alternates: {
    canonical: '/legal/terms'
  }
};

export default function TermsPage() {
  return (
    <main className="pn-doc-shell">
      <article className="pn-doc-card">
        <p className="pn-kicker">
          Terms
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#111827]">
          Pathnook Terms of Service
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--pn-muted)]">
          Effective date: April 14, 2026
        </p>

        <div className="pn-doc-prose mt-8 space-y-8">
          <section>
            <h2>1. Operator and service description</h2>
            <p className="mt-3">
              These Terms of Service govern your use of Pathnook, a software
              product operated by Yanhui Lin, an individual software maker based
              in Mainland China. Pathnook provides parent-facing family
              learning support software, including upload handling,
              AI-assisted diagnosis, report generation, workflow continuity, and
              billing-linked access control.
            </p>
            <p className="mt-3">
              Pathnook is not a school, therapist, law firm, medical provider,
              or official educational authority.
            </p>
          </section>

          <section>
            <h2>2. Eligibility and adult-only accounts</h2>
            <p className="mt-3">
              Accounts may be created only by adults, including parents,
              guardians, or other authorized adults. You must provide accurate
              information, protect your login credentials, and use the product
              only for lawful purposes. Children may not create accounts
              directly or independently purchase the service.
            </p>
          </section>

          <section>
            <h2>3. Upload rights, user content, and sharing</h2>
            <p className="mt-3">
              You represent that you have the right to upload, review, use, and
              share the materials you submit. You keep ownership of your
              content, but you grant Pathnook the permissions reasonably
              necessary to host, process, analyze, display, export, and share
              that content for the purpose of operating the service. If you use
              report export or share features, you are responsible for deciding
              what to share and with whom.
            </p>
          </section>

          <section>
            <h2>4. AI limitations and no guarantee</h2>
            <p className="mt-3">
              Pathnook outputs are generated with AI-assisted methods and may be
              incomplete, probabilistic, or context-limited. The service does
              not guarantee academic outcomes, admission outcomes, score
              changes, or any official educational result. Families should use
              their own judgment, source evidence, and any appropriate human
              review before acting on the output.
            </p>
          </section>

          <section>
            <h2>5. Acceptable use and prohibited conduct</h2>
            <p className="mt-3">
              You may not misuse the service, reverse engineer it except where
              law clearly permits, upload unlawful or abusive content, attempt
              payment abuse or fraud, impersonate another person, interfere with
              platform security, use the product to generate shortcut answers
              for children, or use Pathnook in a way that creates legal or
              safety risk for others.
            </p>
          </section>

          <section>
            <h2>6. One-time and recurring billing</h2>
            <p className="mt-3">
              Paid access may include one-time diagnosis purchases and recurring
              monthly or annual plans. One-time purchases unlock a limited local
              entitlement. Recurring plans renew automatically until canceled
              and keep the associated Pathnook software workflow active while
              billing remains in good standing.
            </p>
          </section>

          <section>
            <h2>7. Freemius as Merchant of Record</h2>
            <p className="mt-3">
              Freemius acts as Merchant of Record for checkout, certain tax
              handling, invoicing, payment methods, renewals, and cancellation
              operations. Billing records, invoices, payment methods, and
              cancellation actions are handled through the Freemius billing
              portal. Pathnook provides the local billing-management page that
              shows entitlements and opens the Freemius portal when billing
              actions are needed.
            </p>
          </section>

          <section>
            <h2>8. Refunds, access changes, and payment risk</h2>
            <p className="mt-3">
              Refunds are governed by the Pathnook Refund Policy, which is
              incorporated into these terms by reference. Eligibility may depend
              on whether diagnosis credits or subscription benefits have already
              been consumed. Pathnook may suspend or limit access when payment
              risk, chargeback activity, fraud review, or materially abusive use
              creates a legitimate security or billing concern.
            </p>
          </section>

          <section>
            <h2>9. Service availability, changes, and termination</h2>
            <p className="mt-3">
              Pathnook may update, improve, limit, or discontinue parts of the
              service over time. We may suspend or terminate access for
              security, abuse, fraud, payment risk, legal compliance, or
              material violation of these terms. We may also disable access to
              specific content when continued access would create legal or
              security risk.
            </p>
          </section>

          <section>
            <h2>10. Intellectual property, feedback, and exports</h2>
            <p className="mt-3">
              Pathnook and its service design, software, branding, and output
              structure remain protected by applicable intellectual-property
              law. You retain rights in your own uploaded materials. If you send
              suggestions or feedback, Pathnook may use them without further
              obligation to you. Exported or shared reports remain subject to
              these terms and any lawful use restrictions.
            </p>
          </section>

          <section>
            <h2>11. Disclaimer of warranties and liability limits</h2>
            <p className="mt-3">
              Pathnook is provided on an &quot;as is&quot; and &quot;as available&quot; basis
              to the maximum extent permitted by law. To the extent permitted by
              law, Pathnook disclaims implied warranties of merchantability,
              fitness for a particular purpose, and non-infringement. Pathnook
              is not liable for indirect, incidental, special, consequential, or
              punitive damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2>12. Governing law and dispute handling</h2>
            <p className="mt-3">
              These terms are governed by the laws of Mainland China, without
              regard to conflict-of-law principles. Before filing a formal
              dispute, you agree to contact Pathnook at <strong>{PUBLIC_CONTACT_EMAIL}</strong>
              {' '}so the parties can attempt informal resolution. If a dispute
              cannot be resolved informally, it will be submitted to a court
              with lawful jurisdiction in Mainland China.
            </p>
          </section>

          <section>
            <h2>13. Contact</h2>
            <p className="mt-3">
              Use <strong>{PUBLIC_CONTACT_EMAIL}</strong> for support, privacy
              requests, refund review, deletion requests, export requests, and
              billing-help escalation.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
