"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { FamilyLogo } from "@/components/branding/family-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingNavItems } from "./landing-nav";

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-[color:color-mix(in_srgb,var(--pn-border)_82%,white)] bg-white/88 backdrop-blur-lg">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex items-center justify-between gap-6 px-5 py-4 sm:px-7 sm:py-5 lg:px-10">
          <FamilyLogo
            href="/"
            size="lg"
            showSubtitle={true}
            className="shrink-0"
            textClassName="text-[#202643]"
            subtitleClassName="hidden text-[0.98rem] font-medium tracking-[-0.01em] text-[#6b7280] xl:block"
          />

          <nav className="hidden flex-1 items-center justify-center gap-3 px-8 lg:flex xl:gap-4">
            {landingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="pn-link-chip whitespace-nowrap text-[1.02rem] font-bold text-[#4b5565] xl:px-6"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="outline"
              className="h-13 rounded-[1.1rem] border-[var(--pn-border)] bg-white/92 px-6 text-[15px] font-semibold text-[var(--pn-text)] shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
            >
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button
              asChild
              className="h-13 rounded-[1.1rem] px-7 text-[15px] font-semibold shadow-[0_22px_48px_rgba(124,58,237,0.30)]"
            >
              <Link href="/sign-up?redirect=dashboard">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-[1.05rem] border border-[var(--pn-border)] bg-white/95 text-[var(--pn-text)] shadow-[0_12px_36px_rgba(15,23,42,0.08)] lg:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto max-w-[1440px] overflow-hidden border-t border-[var(--pn-border)] bg-white/96 transition-[max-height,opacity] duration-300 lg:hidden",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
          {landingNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[1rem] px-4 py-3 text-base font-semibold text-[var(--pn-muted-2)] transition hover:bg-[var(--pn-soft)] hover:text-[var(--pn-text)]"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-3 pt-3">
            <Button asChild variant="outline" className="rounded-[1rem]">
              <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                Log in
              </Link>
            </Button>
            <Button asChild className="rounded-[1rem]">
              <Link
                href="/sign-up?redirect=dashboard"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
