'use client';

import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketingRoute =
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/contact' ||
    pathname === '/help' ||
    pathname === '/faq' ||
    pathname === '/data-deletion' ||
    pathname.startsWith('/legal/');
  return (
    <section className="pn-page-shell flex min-h-screen flex-col">
      {isMarketingRoute ? <LandingHeader /> : null}
      {children}
      {isMarketingRoute ? <LandingFooter /> : null}
    </section>
  );
}
