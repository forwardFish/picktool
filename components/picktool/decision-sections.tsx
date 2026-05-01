import Link from 'next/link';
import { ArrowRight, CheckCircle2, CircleDollarSign, Info, Sparkles, XCircle } from 'lucide-react';
import type { DecisionTemplate, ToolRole } from '@/lib/picktool/decisions';

function roleClass(role: ToolRole) {
  if (role === 'Core') {
    return 'bg-violet-500 text-white';
  }

  if (role === 'Optional') {
    return 'bg-blue-500 text-white';
  }

  return 'bg-slate-700 text-slate-100';
}

export function DecisionSummary({ decision, task }: { decision: DecisionTemplate; task: string }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5 sm:p-7">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-cyan-200">{decision.subtitle}</p>
          <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">{decision.title}</h1>
          <p className="mt-3 text-lg text-cyan-200">{task}</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{decision.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Matched a task decision, not a tool list.
            </span>
            <span className="rounded-full border border-white/14 px-3 py-2 text-sm text-slate-200">
              {decision.category}
            </span>
            {decision.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/14 px-3 py-2 text-sm text-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[1.35rem] border border-fuchsia-300/30 bg-fuchsia-300/8 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-fuchsia-100">
            <Sparkles className="size-4" aria-hidden="true" />
            Decision map
          </div>
          <div className="space-y-3">
            {decision.tools.map((tool, index) => (
              <div key={tool.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/7 p-3">
                <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-300/12 text-sm text-cyan-100">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-white">{tool.name}</p>
                  <p className="text-xs text-slate-400">{tool.role} - {tool.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ToolSetupTable({ decision }: { decision: DecisionTemplate }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5 sm:p-7">
      <h2 className="text-2xl font-bold text-white">Recommended tool setup</h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[0.8fr_1fr_1fr_0.45fr] bg-white/6 px-4 py-3 text-xs font-semibold uppercase tracking-normal text-slate-400">
          <span>Tool</span>
          <span>What it does</span>
          <span>Use in this task</span>
          <span>Role</span>
        </div>
        {decision.tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="grid grid-cols-1 gap-3 border-t border-white/10 px-4 py-4 text-sm text-slate-200 sm:grid-cols-[0.8fr_1fr_1fr_0.45fr]"
            >
              <Link href={`/tools/${tool.id}`} className="flex items-center gap-3 font-semibold text-white">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white text-slate-950">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {tool.name}
              </Link>
              <span>{tool.summary}</span>
              <span>{tool.useInTask}</span>
              <span>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${roleClass(tool.role)}`}>
                  {tool.role}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HowToUse({ decision }: { decision: DecisionTemplate }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5 sm:p-7">
      <h2 className="text-2xl font-bold text-white">How to use it</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {decision.steps.map((step, index) => (
          <article key={step.title} className="relative rounded-2xl border border-white/12 bg-white/6 p-5">
            <span className="absolute -top-4 left-5 flex size-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
              {index + 1}
            </span>
            <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{step.body}</p>
            <p className="mt-4 rounded-xl border border-yellow-300/20 bg-yellow-300/8 p-3 text-sm text-yellow-100">
              Tip: {step.tip}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RecommendedTools({ decision }: { decision: DecisionTemplate }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Recommended tools</h2>
          <p className="mt-1 text-sm text-slate-400">Curated for the best result, not ranked as a directory.</p>
        </div>
        <span className="hidden items-center gap-2 rounded-full border border-cyan-300/30 px-3 py-2 text-sm text-cyan-100 sm:inline-flex">
          <Info className="size-4" aria-hidden="true" />
          Why these tools?
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {decision.tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group rounded-2xl border border-white/12 bg-white/7 p-5 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-950">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-white">{tool.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{tool.summary}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${roleClass(tool.role)}`}>
                  {tool.role}
                </span>
                <span className="rounded-lg bg-emerald-400/12 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                  {tool.level}
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">
                  {tool.price}
                </span>
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                View detail <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function BetterOptionsAndCost({ decision }: { decision: DecisionTemplate }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <section className="glass-panel rounded-[1.5rem] p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Sparkles className="size-5 text-fuchsia-200" aria-hidden="true" />
          Better options if
        </h2>
        <div className="mt-5 grid gap-3">
          {decision.betterOptions.map((option) => (
            <div key={option.condition} className="rounded-2xl border border-white/12 bg-white/7 p-4">
              <p className="font-semibold text-white">{option.condition}</p>
              <p className="mt-1 text-sm text-slate-300">{option.recommendation}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="glass-panel rounded-[1.5rem] p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <CircleDollarSign className="size-5 text-yellow-200" aria-hidden="true" />
          Cost advice
        </h2>
        <div className="mt-5 grid gap-4">
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/8 p-4">
            <h3 className="font-semibold text-emerald-200">Free-first path</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {decision.freePath.map((item) => (
                <span key={item} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-sm text-emerald-100">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-red-300/35 bg-red-300/8 p-4">
            <h3 className="flex items-center gap-2 font-semibold text-red-200">
              <XCircle className="size-4" aria-hidden="true" />
              Avoid paying for
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {decision.avoidPayingFor.map((item) => (
                <span key={item} className="rounded-lg border border-red-300/35 px-3 py-2 text-sm text-red-100">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
