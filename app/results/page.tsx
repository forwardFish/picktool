import { DecisionForm } from '@/components/picktool/decision-form';
import {
  BetterOptionsAndCost,
  DecisionSummary,
  HowToUse,
  RecommendedTools,
  ToolSetupTable
} from '@/components/picktool/decision-sections';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';
import { matchDecision } from '@/lib/picktool/decisions';

type ResultsPageProps = {
  searchParams: Promise<{
    task?: string;
  }>;
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const task = params.task?.trim() || 'I want to create a product promo video for TikTok.';
  const decision = matchDecision(task);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <div className="mx-auto w-full max-w-7xl space-y-5 px-5 pb-16 sm:px-8">
        <DecisionForm initialTask={task} compact />
        <DecisionSummary decision={decision} task={task} />
        <ToolSetupTable decision={decision} />
        <HowToUse decision={decision} />
        <RecommendedTools decision={decision} />
        <BetterOptionsAndCost decision={decision} />
      </div>
      <SiteFooter />
    </main>
  );
}
