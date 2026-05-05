import { DecisionForm } from '@/components/picktool/decision-form';
import { DecisionResultView } from '@/components/picktool/decision-result';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';
import { buildDecisionResult } from '@/lib/decision-engine/buildDecisionResult';
import { matchDecisionTemplate } from '@/lib/decision-engine/matchDecisionTemplate';

type ResultsPageProps = {
  searchParams: Promise<{ task?: string }>;
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const task = params.task?.trim() || 'I want to create a product promo video for TikTok.';
  const decision = buildDecisionResult(matchDecisionTemplate(task), task);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 pb-16 sm:px-8">
        <DecisionForm initialTask={task} compact submitLabel="Update decision" />
        <DecisionResultView decision={decision} />
      </div>
      <SiteFooter />
    </main>
  );
}
