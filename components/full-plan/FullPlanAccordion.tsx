'use client';

import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, ClipboardCheck, FileText, FolderOpen, Scissors } from 'lucide-react';
import { ToolActionButtons } from '@/components/tool-actions/ToolActionButtons';
import type { FullExecutionPlan, FullPlanState, ModuleType } from '@/lib/workflow-generation/types';

type FullPlanAccordionProps = {
  state: FullPlanState;
  fullPlan?: FullExecutionPlan;
  onGenerate: () => void;
  onRefine: (moduleType: ModuleType) => void;
  isLoading?: boolean;
};

const moduleIcons: Record<ModuleType, ReactNode> = {
  script: <FileText className="size-8" aria-hidden="true" />,
  materials: <FolderOpen className="size-8" aria-hidden="true" />,
  subtitles_cover: <Scissors className="size-8" aria-hidden="true" />,
  delivery_check: <ClipboardCheck className="size-8" aria-hidden="true" />
};

export function FullPlanAccordion({ state, fullPlan, onGenerate, onRefine, isLoading }: FullPlanAccordionProps) {
  const expanded = state === 'expanded' || state === 'completed';

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl">
      <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">完整执行方案（按需查看） {state === 'completed' ? <span className="ml-2 rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-100">已完成</span> : null}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {expanded ? '目标已明确，执行路径已经规划完成。你可以继续细化任一模块。' : state === 'ready' ? '当前方案已可生成完整执行方案。' : '点击“我想看完整方案”后，这里会展示详细步骤与输出内容。'}
          </p>
        </div>
        <button type="button" onClick={expanded ? undefined : onGenerate} disabled={isLoading || expanded} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white disabled:opacity-70">
          {expanded ? <ChevronUp className="size-5" aria-hidden="true" /> : <ChevronDown className="size-5" aria-hidden="true" />}
          {expanded ? '已展开' : '查看完整方案'}
        </button>
      </div>

      {!expanded ? (
        <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center text-slate-400">
          <div className="mb-5 rounded-3xl border border-violet-300/20 bg-violet-400/10 p-6 text-violet-100">🔒</div>
          <p className="max-w-md">{state === 'ready' ? '当前方案已可生成完整执行方案，点击“查看完整方案”后，这里会展示详细步骤与输出内容。' : '先确认基础够用方案或升级方向，再展开完整执行方案。'}</p>
        </div>
      ) : null}

      {expanded && fullPlan ? (
        <div className="space-y-6 p-5">
          <div className="grid gap-4 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="mb-4 text-lg font-bold text-white">1 推荐组合</p>
              <div className="space-y-3">
                {fullPlan.recommendation.tools.map((tool) => (
                  <div key={tool.slug} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
                    <p className="font-semibold text-white">{tool.name}</p>
                    <p className="text-sm text-slate-400">{tool.role}</p>
                    <ToolActionButtons tool={tool} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="mb-4 text-lg font-bold text-white">2 执行步骤</p>
              <div className="space-y-3">
                {fullPlan.executionSteps.map((step, index) => (
                  <div key={step.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
                    <p className="font-semibold text-white">{index + 1}. {step.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="mb-4 text-lg font-bold text-white">3 你会得到</p>
              <div className="space-y-3">
                {fullPlan.outputs.map((output) => (
                  <button key={output.id} type="button" onClick={() => onRefine(output.id)} className="w-full rounded-xl border border-white/10 bg-slate-950/45 p-3 text-left transition hover:border-blue-300/50">
                    <p className="font-semibold text-white">{output.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{output.body}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="mb-4 text-lg font-bold text-white">4 注意事项</p>
              <ul className="space-y-3 text-sm text-slate-300">
                {fullPlan.cautions.map((caution) => (
                  <li key={caution} className="flex gap-2"><span className="text-violet-300">•</span>{caution}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {fullPlan.actionChips.map((chip) => (
              <button key={chip.key} type="button" disabled={isLoading} onClick={() => onRefine(chip.key)} className="rounded-2xl border border-violet-300/25 bg-violet-500/10 p-5 text-left text-white transition hover:border-violet-300/60 disabled:opacity-60">
                <div className="mb-3 text-violet-200">{moduleIcons[chip.key]}</div>
                <p className="font-bold">{chip.label}</p>
                <p className="mt-1 text-sm text-slate-400">{chip.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

