'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FamilyLogo } from '@/components/branding/family-logo';
import { DashboardUserMenu } from '@/components/dashboard/user-menu';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3.5 3.5 0 0 1 0 6.74" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v5h5" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h1" />
    </svg>
  );
}

function BillingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.5 16.9l.06-.06A1.65 1.65 0 0 0 4 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2.5a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82L3.8 6.32A2 2 0 1 1 6.63 3.5l.06.06A1.65 1.65 0 0 0 8.5 4c.39 0 .77-.14 1.06-.4.29-.27.45-.65.44-1.04V2.5a2 2 0 1 1 4 0v.09c0 .39.15.77.44 1.04.29.26.67.4 1.06.4a1.65 1.65 0 0 0 1.18-.47l.06-.06A2 2 0 1 1 20.5 6.3l-.06.06A1.65 1.65 0 0 0 20 7.5c0 .39.14.77.4 1.06.27.29.65.45 1.04.44h.06a2 2 0 1 1 0 4h-.09c-.39 0-.77.15-1.04.44-.26.29-.4.67-.4 1.06Z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const nav = [
    { href: '/dashboard', label: 'Overview', icon: HomeIcon },
    { href: '/dashboard/children', label: 'Members', icon: MembersIcon },
    { href: '/dashboard/reports', label: 'Reports', icon: ReportsIcon },
  ];

  const account = [
    { href: '/dashboard/billing', label: 'Billing', icon: BillingIcon, arrow: false },
    { href: '/dashboard/general', label: 'Settings', icon: SettingsIcon, arrow: true },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <div className="workspace">
      <aside className="sidebar sidebar-ts">
        <div className="sidebar-brand">
          <FamilyLogo
            href="/dashboard"
            size="sm"
            showSubtitle={false}
            className="gap-3"
            textClassName="text-[#0f172a] text-[18px] font-semibold"
            markClassName="rounded-[16px] shadow-none"
          />
        </div>

        <nav className="side-nav side-nav-main">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} className={`side-link ${isActive(item.href) ? 'active' : ''}`} href={item.href}>
                <span className="nav-icon">
                  <Icon />
                </span>
                <span className="side-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="side-divider" />
        <div className="side-section-title">Account</div>
        <nav className="side-nav side-nav-account">
          {account.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} className={`side-link ${isActive(item.href) ? 'active' : ''}`} href={item.href}>
                <span className="nav-icon">
                  <Icon />
                </span>
                <span className="side-label">{item.label}</span>
                {item.arrow ? (
                  <span className="side-arrow">
                    <ChevronRight />
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-profile">
          <DashboardUserMenu fullWidth />
        </div>
      </aside>

      <main className="main-stack">{children}</main>
    </div>
  );
}
