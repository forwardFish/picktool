import Link from 'next/link';
import { ArrowRight, CheckCircle2, Layers3, Search, Sparkles, WalletCards } from 'lucide-react';
import { DecisionForm } from '@/components/picktool/decision-form';
import { SiteBackdrop, SiteFooter, SiteHeader } from '@/components/picktool/site-chrome';

const valueCards = [
  {
    title: 'Best tool setup',
    body: 'Get a small stack for the task instead of a long directory of tools.',
    icon: Layers3
  },
  {
    title: 'How to use it',
    body: 'See the order of use, what each tool does, and where to start.',
    icon: CheckCircle2
  },
  {
    title: 'What to skip',
    body: 'Avoid optional tools, paid plans, and overbuilt workflows when they are not needed.',
    icon: WalletCards
  }
];

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />

      <section className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-7xl flex-col items-center px-5 pb-12 pt-16 text-center sm:px-8 lg:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/8 px-4 py-2 text-sm font-medium text-cyan-100">
          <Sparkles className="size-4" aria-hidden="true" />
          Decision first. Tool list second.
        </div>

        <h1 className="mt-8 max-w-5xl text-5xl font-bold leading-[1.05] tracking-normal text-white sm:text-7xl lg:text-8xl">
          Make better <span className="text-gradient">AI tool decisions</span> for every task.
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-2xl sm:leading-10">
          Describe what you want to do. We will show which AI tools to use, which to skip, and how to get started.
        </p>

        <div className="mt-12 w-full">
          <DecisionForm />
        </div>

        <div id="examples" className="mt-14 grid w-full gap-4 md:grid-cols-3">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="glass-panel rounded-[1.5rem] p-5 text-left">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{card.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-cyan-200">MVP scope</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-white sm:text-5xl">
              Built for one clear question: what should I use?
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Picktool does not try to be a tool directory, ranking board, dashboard, or paid workflow system. The first version focuses on matching a task to a practical AI tool setup.
            </p>
            <Link
              href="/results?task=I%20want%20to%20create%20a%20product%20promo%20video%20for%20TikTok."
              className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-300/16"
            >
              See a sample result <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-5 sm:p-7">
            <div className="grid gap-4">
              {[
                ['1', 'Describe a task', 'Use plain language, like "create a product promo video".'],
                ['2', 'Get a setup', 'See core tools, optional tools, and the order of use.'],
                ['3', 'Skip noise', 'Know what not to pay for and what alternatives fit edge cases.']
              ].map(([number, title, body]) => (
                <div key={number} className="flex gap-4 rounded-2xl border border-white/10 bg-white/7 p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950">
                    {number}
                  </span>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
