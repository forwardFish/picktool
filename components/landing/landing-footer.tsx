"use client";

import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import { FamilyLogoStatic } from "@/components/branding/family-logo";
import { PUBLIC_OPERATOR_SHORT } from "@/lib/site/public-trust";
import { landingNavItems, landingSupportEmail } from "./landing-nav";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Get Started", href: "/sign-up?redirect=dashboard" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
  {
    title: "Homepage",
    links: landingNavItems,
  },
  {
    title: "Trust",
    links: [
      { label: "Billing Management", href: "/sign-in?redirect=%2Fdashboard%2Fbilling" },
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Data Deletion", href: "/data-deletion" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Refunds", href: "/legal/refunds" },
    ],
  },
];

export function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-20 bg-[var(--pn-dark)] text-white" data-testid="landing-footer">
      <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 border-b border-white/10 py-16 md:grid-cols-2 xl:grid-cols-[1.2fr,1fr,1fr,1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <FamilyLogoStatic
                size="md"
                showSubtitle={false}
                textClassName="text-white"
                markClassName="rounded-[1rem] shadow-[0_16px_36px_rgba(99,102,241,0.28)]"
              />
              <span className="text-xl text-slate-400">
                Family learning support
              </span>
            </div>
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
              Pathnook helps families turn learning evidence into diagnosis,
              next steps, and weekly progress.
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              Brand/Product: Pathnook. Operator: {PUBLIC_OPERATOR_SHORT}. Pathnook
              is a parent-facing AI learning and growth system for clearer
              learning decisions, evidence-backed review, and steadier weekly
              follow-through.
            </p>
            <a
              href={`mailto:${landingSupportEmail}`}
              className="mt-6 inline-flex items-center gap-2 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <Mail className="h-4 w-4" />
              {landingSupportEmail}
            </a>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-slate-300 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4">
              {landingNavItems.map((item) => (
                <Link
                  key={`footer-${item.href}`}
                  href={item.href}
                className="transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between gap-6 sm:justify-end">
            <span>Copyright 2026 Pathnook. Operated by {PUBLIC_OPERATOR_SHORT}.</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 transition hover:bg-white/10"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
