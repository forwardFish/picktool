import { Sparkles } from 'lucide-react';
import { HomeDecisionSearch } from '@/components/picktool/home-decision-search';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-14 pt-14 text-center sm:px-8 lg:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/8 px-4 py-2 text-sm font-medium text-cyan-100">
          <Sparkles className="size-4" aria-hidden="true" />
          Decision first. Tools second.
        </div>

        <h1 className="mt-8 max-w-5xl text-5xl font-bold leading-[1.05] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
          Make better <span className="text-gradient">AI tool decisions</span> for every task.
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-2xl sm:leading-10">
          Describe what you want to do. We&apos;ll show which AI tools to use, which to skip, and how to get started.
        </p>

        <div className="mt-12 w-full">
          <HomeDecisionSearch />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
