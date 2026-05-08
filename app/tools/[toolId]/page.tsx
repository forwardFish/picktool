import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';
import { AiToolDetailPage } from '@/components/tool-catalog/AiToolDetailPage';
import { getToolDetailBySlug } from '@/lib/tool-catalog/tool-details';

type ToolPageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;
  const result = getToolDetailBySlug(toolId);

  if (!result) {
    notFound();
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <article className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
        <Link href="/copilot" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
          <ArrowLeft className="size-4" aria-hidden="true" />
          回到 Copilot
        </Link>
        <div className="mt-6">
          <AiToolDetailPage detail={result.detail} detailStatus={result.detailStatus} />
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
