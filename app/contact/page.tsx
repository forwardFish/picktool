import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FREEMIUS_BILLING_ROLE_LINE,
  PUBLIC_CONTACT_EMAIL,
  PUBLIC_OPERATOR_LINE,
  PUBLIC_OPERATOR_SHORT,
} from '@/lib/site/public-trust';

export const metadata: Metadata = {
  title: 'Contact Pathnook',
  description:
    'Contact Pathnook for support, billing help, privacy requests, and legal inquiries.',
  alternates: {
    canonical: '/contact'
  }
};

export default function ContactPage() {
  return (
    <main className="pn-doc-shell max-w-[1180px]">
      <div className="pn-doc-card">
        <p className="pn-kicker">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#111827]">
          Contact Pathnook
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
          Pathnook is an AI learning and growth system that currently starts
          with family learning support and structured weekly follow-through.
          This page is the public support, legal, and billing-help hub for the
          service.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,var(--pn-soft-2)_0%,white_100%)] p-6">
            <p className="text-sm font-semibold text-[var(--pn-muted)]">Operator</p>
            <p className="mt-2 text-lg font-semibold text-[#111827]">{PUBLIC_OPERATOR_SHORT}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--pn-muted)]">{PUBLIC_OPERATOR_LINE}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,var(--pn-soft-2)_0%,white_100%)] p-6">
            <p className="text-sm font-semibold text-[var(--pn-muted)]">Unified public inbox</p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="mt-2 inline-block text-lg font-semibold text-[#111827]"
            >
              {PUBLIC_CONTACT_EMAIL}
            </a>
            <p className="mt-4 text-sm leading-7 text-[var(--pn-muted)]">
              Use this address for support, refund review, privacy requests,
              billing help, and legal contact. Pathnook aims to reply within 2
              business days.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--pn-border)] bg-white/70 p-6">
            <p className="text-sm font-semibold text-[var(--pn-muted)]">Billing and subscription help</p>
            <p className="mt-2 text-sm leading-7 text-[var(--pn-muted)]">
              {FREEMIUS_BILLING_ROLE_LINE}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--pn-muted)]">
              Start from Pathnook billing management if you need to check local
              access, household entitlements, or report history. Open the
              Freemius billing portal from there when you need invoices, payment
              methods, renewals, or cancellation.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--pn-border)] bg-white/70 p-6">
            <p className="text-sm font-semibold text-[var(--pn-muted)]">Privacy and deletion requests</p>
            <p className="mt-2 text-sm leading-7 text-[var(--pn-muted)]">
              Adult account holders can use the same inbox for privacy, export,
              correction, and deletion requests. Pathnook may keep limited
              records when required for billing reconciliation, fraud prevention,
              tax obligations, security review, or legal compliance.
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--pn-muted)]">
              If your request concerns a charge handled by Freemius, Pathnook may
              coordinate with Freemius as Merchant of Record before confirming the
              final outcome.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in?redirect=%2Fdashboard%2Fbilling"
            className="rounded-[1rem] bg-[linear-gradient(90deg,var(--pn-indigo),var(--pn-violet),var(--pn-fuchsia))] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(124,58,237,0.24)]"
          >
            Open billing management
          </Link>
          <Link
            href="/help"
            className="rounded-[1rem] border border-[var(--pn-border)] px-5 py-3 text-sm font-semibold text-[var(--pn-text)]"
          >
            Help center
          </Link>
          <Link
            href="/pricing"
            className="rounded-[1rem] border border-[var(--pn-border)] px-5 py-3 text-sm font-semibold text-[var(--pn-text)]"
          >
            View pricing
          </Link>
          <Link
            href="/faq"
            className="rounded-[1rem] border border-[var(--pn-border)] px-5 py-3 text-sm font-semibold text-[var(--pn-text)]"
          >
            Billing FAQ
          </Link>
          <Link
            href="/legal/privacy"
            className="rounded-[1rem] border border-[var(--pn-border)] px-5 py-3 text-sm font-semibold text-[var(--pn-text)]"
          >
            Privacy policy
          </Link>
          <Link
            href="/legal/terms"
            className="rounded-[1rem] border border-[var(--pn-border)] px-5 py-3 text-sm font-semibold text-[var(--pn-text)]"
          >
            Terms
          </Link>
          <Link
            href="/legal/refunds"
            className="rounded-[1rem] border border-[var(--pn-border)] px-5 py-3 text-sm font-semibold text-[var(--pn-text)]"
          >
            Refund policy
          </Link>
          <Link
            href="/data-deletion"
            className="rounded-[1rem] border border-[var(--pn-border)] px-5 py-3 text-sm font-semibold text-[var(--pn-text)]"
          >
            Data deletion
          </Link>
        </div>
      </div>
    </main>
  );
}
