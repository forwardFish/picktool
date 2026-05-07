import { Sparkles } from 'lucide-react';
import { CopilotStartForm } from '@/components/copilot/CopilotStartForm';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-14 pt-12 text-center sm:px-8 lg:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/8 px-4 py-2 text-sm font-medium text-cyan-100">
          <Sparkles className="size-4" aria-hidden="true" />
          Good-enough first. Upgrade only when needed.
        </div>

        <h1 className="mt-8 max-w-5xl text-5xl font-bold leading-[1.05] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
          Get a simple <span className="text-gradient">AI workflow</span> for your task.
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-2xl sm:leading-10">
          Tell us what you want to finish. We&apos;ll give you a good-enough AI tool setup first, then help you upgrade only if needed.
        </p>

        <div className="mt-12 w-full">
          <CopilotStartForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
