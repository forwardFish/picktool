import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  BetterOptionsAndCost,
  DecisionSummary,
  HowToUse,
  ToolSetupTable
} from '@/components/picktool/decision-sections';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';
import { getDecisionBySetupId } from '@/lib/picktool/decisions';
import { notFound } from 'next/navigation';

type SetupPageProps = {
  params: Promise<{
    setupId: string;
  }>;
};

export default async function SetupPage({ params }: SetupPageProps) {
  const { setupId } = await params;
  const decision = getDecisionBySetupId(setupId);

  if (!decision) {
    notFound();
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <div className="mx-auto w-full max-w-7xl space-y-5 px-5 pb-16 sm:px-8">
        <Link href={`/results?task=${encodeURIComponent(decision.exampleTask)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to result
        </Link>
        <DecisionSummary decision={decision} task={decision.exampleTask} />
        <ToolSetupTable decision={decision} />
        <HowToUse decision={decision} />
        <BetterOptionsAndCost decision={decision} />
      </div>
      <SiteFooter />
    </main>
  );
}
