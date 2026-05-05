import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';
import { ToolDetailView } from '@/components/picktool/tool-detail';
import { getToolBySlug } from '@/lib/data/tools';

type ToolPageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;
  const tool = getToolBySlug(toolId);

  if (!tool) {
    notFound();
  }

  const firstSetup = tool.commonSetups[0]?.slug ?? 'tiktok-product-promo-video';

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <article className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
        <Link href={`/setups/${firstSetup}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to setup
        </Link>
        <div className="mt-6">
          <ToolDetailView tool={tool} />
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
