import type { Metadata } from 'next';
import { PUBLIC_CONTACT_EMAIL } from '@/lib/site/public-trust';

export const metadata: Metadata = {
  title: 'Pathnook Data Deletion',
  description:
    'Learn how to request account deletion, data deletion, export, or correction for Pathnook.',
  alternates: {
    canonical: '/data-deletion'
  }
};

export default function DataDeletionPage() {
  return (
    <main className="pn-doc-shell">
      <article className="pn-doc-card">
        <p className="pn-kicker">
          Data Deletion
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#111827]">
          Request account or data deletion
        </h1>
        <div className="pn-doc-prose mt-6 space-y-5">
          <p>
            To request deletion of your Pathnook account data, email
            <strong> {PUBLIC_CONTACT_EMAIL}</strong> and include the account email
            address you use to sign in.
          </p>
          <p>
            Use the same inbox for privacy-specific deletion, correction, export,
            or access requests so Pathnook can route the request through one
            monitored support channel.
          </p>
          <p>
            Deletion requests may cover account records, uploads, report artifacts,
            and product history, subject to legal, billing, fraud-prevention, or
            audit retention requirements. Billing records maintained by Freemius may
            remain subject to Merchant of Record obligations.
          </p>
          <p>
            Pathnook aims to acknowledge deletion requests within 2 business days
            and explain the expected handling scope.
          </p>
        </div>
      </article>
    </main>
  );
}
