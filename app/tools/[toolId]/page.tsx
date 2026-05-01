import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';
import { getToolById } from '@/lib/picktool/decisions';
import { notFound } from 'next/navigation';

type ToolPageProps = {
  params: Promise<{
    toolId: string;
  }>;
};

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;
  const result = getToolById(toolId);

  if (!result) {
    notFound();
  }

  const { tool, decision } = result;
  const Icon = tool.icon;

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <article className="mx-auto w-full max-w-4xl px-5 pb-20 sm:px-8">
        <Link href={`/results?task=${encodeURIComponent(decision.exampleTask)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to matched setup
        </Link>
        <div className="glass-panel mt-6 rounded-[1.75rem] p-6 sm:p-9">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-white text-slate-950">
            <Icon className="size-8" aria-hidden="true" />
          </span>
          <p className="mt-7 text-sm font-semibold text-cyan-200">Tool decision detail</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{tool.name}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">{tool.summary}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-white/7 p-4">
              <p className="text-sm text-slate-400">Role</p>
              <p className="mt-1 font-semibold text-white">{tool.role}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/7 p-4">
              <p className="text-sm text-slate-400">Level</p>
              <p className="mt-1 font-semibold text-white">{tool.level}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/7 p-4">
              <p className="text-sm text-slate-400">Cost fit</p>
              <p className="mt-1 font-semibold text-white">{tool.price}</p>
            </div>
          </div>

          <section className="mt-8 rounded-2xl border border-cyan-300/24 bg-cyan-300/8 p-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <CheckCircle2 className="size-5 text-cyan-200" aria-hidden="true" />
              How to use it for this task
            </h2>
            <p className="mt-3 leading-7 text-slate-300">{tool.useInTask}</p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
