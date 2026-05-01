import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NOINDEX_ROBOTS } from '@/lib/seo/site';

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS
};

export default function SampleReportPage() {
  const disabledReason = 'Sample report is intentionally disabled for the public site.';
  void disabledReason;
  redirect("/");
}
