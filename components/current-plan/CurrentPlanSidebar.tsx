'use client';

import { ChevronLeft, ChevronRight, CheckCircle2, CircleMinus, Gem, Send, Zap } from 'lucide-react';
import type { CurrentPlanSidebarState, UpgradeOptionKey } from '@/lib/workflow-generation/types';

function iconFor(key: string) {
  if (key === 'professional' || key === 'advanced_visual') return <Gem className="size-4" aria-hidden="true" />;
  if (key === 'automated') return <Zap className="size-4" aria-hidden="true" />;
  return <Send className="size-4" aria-hidden="true" />;
}

type CurrentPlanSidebarProps = {
  state: CurrentPlanSidebarState;
  collapsed: boolean;
  onToggle: () => void;
  onOption: (key: UpgradeOptionKey) => void;
  isLoading?: boolean;
};

export function CurrentPlanSidebar({ state, collapsed, onToggle, onOption, isLoading }: CurrentPlanSidebarProps) {
  if (collapsed) {
    return (
      <aside className="hidden w-20 shrink-0 rounded-3xl border border-white/10 bg-slate-950/55 p-4 lg:flex lg:flex-col lg:items-center lg:gap-7">
        <button type="button" onClick={onToggle} className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100" aria-label="Expand current plan sidebar">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
        <div className="rounded-full border border-violet-300/40 bg-violet-400/15 p-3 text-violet-100">★</div>
        <div className="rounded-full border border-emerald-300/40 bg-emerald-400/15 p-3 text-emerald-100">✓</div>
        <div className="rounded-full border border-blue-300/40 bg-blue-400/15 p-3 text-blue-100">↑</div>
        <div className="mt-auto text-xs text-slate-500">?</div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-[300px] shrink-0 rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-2xl lg:block">
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold text-white">{state.title}</h2>
        <button type="button" onClick={onToggle} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-100" aria-label="Collapse current plan sidebar">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      </div>

      <section className="space-y-3 border-b border-white/10 pb-5">
        <p className="text-sm font-semibold text-violet-200">👍 当前推荐</p>
        <div className="rounded-2xl border border-violet-400/60 bg-violet-500/15 p-4 shadow-[inset_0_0_28px_rgba(140,92,255,0.15)]">
          <p className="text-lg font-bold text-white">{state.recommendationLabel}</p>
          <p className="mt-2 whitespace-pre-line text-slate-200">{state.combinationLabel}</p>
        </div>
      </section>

      <section className="space-y-3 border-b border-white/10 py-5">
        <p className="text-sm font-semibold text-emerald-200">✅ 当前状态</p>
        <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/15 p-4">
          <p className="font-bold text-emerald-100"><CheckCircle2 className="mr-2 inline size-4" aria-hidden="true" />{state.statusLabel}</p>
          <p className="mt-2 text-sm text-emerald-50/80">{state.statusDescription}</p>
        </div>
      </section>

      <section className="space-y-3 border-b border-white/10 py-5">
        <p className="text-sm font-semibold text-violet-200">⬆ {state.upgradeTitle}</p>
        {state.upgradeDirections.length ? state.upgradeDirections.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={isLoading}
            onClick={() => onOption(option.key)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left text-sm text-slate-100 transition hover:border-violet-300/50 hover:bg-violet-400/10 disabled:opacity-60"
          >
            <span className="flex items-center gap-2">{iconFor(option.key)} {option.label}</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        )) : state.selectedTools.map((tool) => (
          <div key={tool.slug} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-100">
            <p className="font-semibold">{tool.name}</p>
            <p className="text-slate-400">{tool.role}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3 py-5">
        <p className="text-sm font-semibold text-slate-300">暂时不用</p>
        {state.skippedTools.slice(0, 3).map((tool) => (
          <div key={tool.toolSlug} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-400">
            <span className="flex items-center gap-2"><CircleMinus className="size-4" aria-hidden="true" />{tool.name}</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </div>
        ))}
      </section>

      <button type="button" disabled={isLoading} onClick={() => onOption('full_plan')} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-4 font-bold text-white disabled:opacity-60">
        <Send className="size-4" aria-hidden="true" /> {state.ctaLabel}
      </button>
    </aside>
  );
}
