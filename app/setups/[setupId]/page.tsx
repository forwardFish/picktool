import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SetupDetailView } from '@/components/picktool/setup-detail';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';
import { getDecisionTemplateBySetupSlug } from '@/lib/data/decisionTemplates';
import { buildDecisionResult } from '@/lib/decision-engine/buildDecisionResult';

type SetupPageProps = {
  params: Promise<{ setupId: string }>;
};

export default async function SetupPage({ params }: SetupPageProps) {
  const { setupId } = await params;
  const template = getDecisionTemplateBySetupSlug(setupId);

  if (!template) {
    notFound();
  }

  const task = template.examples[0] ?? template.taskTitle;
  const decision = buildDecisionResult(template, task);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8">
        <Link href={`/results?task=${encodeURIComponent(task)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to result
        </Link>
        <div className="mt-6">
          <SetupDetailView decision={decision} />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
