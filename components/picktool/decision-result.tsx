import Link from 'next/link';
import { ArrowRight, CheckCircle2, CircleDollarSign, RotateCw, Sparkles, XCircle } from 'lucide-react';
import type { DecisionResult } from '@/lib/schemas/toolDecision';
import { getToolIcon } from './tool-icons';
import { CheckList, GlassCard, RoleBadge, SectionHeading, SoftCard } from './visual-primitives';

type DecisionResultViewProps = {
  decision: DecisionResult;
  compact?: boolean;
};

export function DecisionResultView({ decision, compact = false }: DecisionResultViewProps) {
  const coreGroups = decision.recommendedTools.filter((group) => group.status === 'core');

  return (
    <div className={compact ? 'space-y-5' : 'space-y-6'}>
      <GlassCard className="p-5 sm:p-7 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-cyan-200">{decision.resultTitle}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">{decision.taskTitle}</h1>
            <p className="mt-4 rounded-2xl border border-cyan-300/24 bg-cyan-300/8 px-4 py-3 text-sm leading-6 text-cyan-50">Task: {decision.input}</p>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{decision.oneLineReason}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Focused decision result
              </span>
              {!decision.matched ? <span className="rounded-full border border-yellow-300/25 bg-yellow-300/8 px-3 py-2 text-sm text-yellow-100">Fallback path</span> : null}
            </div>
          </div>

          <SoftCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia-100">
              <Sparkles className="size-4" aria-hidden="true" />
              Best setup
            </div>
            <div className="mt-5 space-y-3">
              {coreGroups.map((group, index) => (
                <SetupGroupLink key={group.id} group={group} index={index} />
              ))}
            </div>
            <Link href={`/setups/${decision.setupSlug}`} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/16">
              View setup <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </SoftCard>
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-7">
        <SectionHeading title="Best Tool Setup for This Task" body="Each tool has a specific job. Add optional tools only when the condition fits." />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {decision.recommendedTools.map((group) => (
            <article key={group.id} className="rounded-[1.5rem] border border-white/12 bg-white/7 p-5 shadow-[inset_0_0_24px_rgba(88,126,255,0.05)]">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{group.role}</h3>
                <RoleBadge status={group.status} />
              </div>
              <p className="mt-3 text-sm leading-6 text-cyan-100">{group.decision}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{group.condition}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.tools.map((tool) => {
                  const Icon = getToolIcon(tool.slug);
                  return (
                    <Link key={tool.slug} href={`/tools/${tool.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-slate-950/35 px-3 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10">
                      <Icon className="size-4 text-cyan-200" aria-hidden="true" />
                      {tool.name}
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-7">
        <SectionHeading title="How to use it" body="Use the tools in this order and stop when the output is good enough." />
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {decision.usagePlan.map((step, index) => (
            <article key={step.title} className="relative rounded-2xl border border-white/12 bg-slate-950/35 p-5 pt-7">
              <span className="absolute -top-4 left-5 flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--cyan),var(--blue))] text-sm font-bold text-white shadow-[0_0_20px_rgba(72,183,255,0.35)]">{index + 1}</span>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{step.body}</p>
              <p className="mt-4 rounded-xl border border-yellow-300/20 bg-yellow-300/8 p-3 text-xs leading-5 text-yellow-100">Tip: {step.tip}</p>
            </article>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-5 sm:p-7">
          <SectionHeading title="What you can skip" body="Avoid unnecessary tools when they do not fit your situation." />
          <div className="mt-5 grid gap-3">
            {decision.skipAdvice.map((item) => (
              <SoftCard key={item.id} className="p-4">
                <h3 className="flex items-center gap-2 font-semibold text-rose-100">
                  <XCircle className="size-4 text-rose-200" aria-hidden="true" />
                  {item.condition}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.reason}</p>
              </SoftCard>
            ))}
          </div>
        </GlassCard>

        <div className="grid gap-5">
          <GlassCard className="p-5 sm:p-7">
            <SectionHeading title="Better options if" body="Switch only when the task condition changes." />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {decision.betterOptions.map((option) => (
                <SoftCard key={option.condition} className="p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-white">
                    <RotateCw className="size-4 text-cyan-200" aria-hidden="true" />
                    {option.condition}
                  </h3>
                  <p className="mt-2 text-sm text-cyan-100">{option.recommendation}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">Best for: {option.bestFor}</p>
                </SoftCard>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-7">
            <SectionHeading title="Cost advice" body="Start with the lowest-cost path before adding paid tools." />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SoftCard className="border-emerald-300/30 bg-emerald-300/8 p-4">
                <h3 className="font-semibold text-emerald-200">Free-first path</h3>
                <p className="mt-2 text-sm leading-6 text-emerald-50">{decision.costAdvice.freePath}</p>
              </SoftCard>
              <SoftCard className="border-yellow-300/25 bg-yellow-300/8 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-yellow-100">
                  <CircleDollarSign className="size-4" aria-hidden="true" />
                  Low-cost path
                </h3>
                <p className="mt-2 text-sm leading-6 text-yellow-50">{decision.costAdvice.lowCostPath}</p>
              </SoftCard>
            </div>
            <div className="mt-4">
              <CheckList items={decision.costAdvice.avoidPayingFor.map((item) => `Avoid paying for ${item}`)} tone="bad" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function SetupGroupLink({ group, index }: { group: DecisionResult['recommendedTools'][number]; index: number }) {
  const firstTool = group.tools[0];
  const Icon = getToolIcon(firstTool?.slug ?? '');

  return (
    <Link href={firstTool ? `/tools/${firstTool.slug}` : '#'} className="group grid grid-cols-[2.5rem_1fr] gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3 transition hover:border-cyan-300/50 hover:bg-cyan-300/10">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-950">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="flex items-center justify-between gap-3">
          <span className="font-semibold text-white">{index + 1}. {group.tools.map((tool) => tool.name).join(' / ')}</span>
          <ArrowRight className="size-4 text-cyan-200 transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">{group.role}</span>
      </span>
    </Link>
  );
}
