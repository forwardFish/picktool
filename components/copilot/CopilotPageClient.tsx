'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Archive, CheckCircle2, Loader2, Save, Sparkles } from 'lucide-react';
import { ChatPanel } from '@/components/copilot/ChatPanel';
import { CurrentPlanSidebar } from '@/components/current-plan/CurrentPlanSidebar';
import { FullPlanAccordion } from '@/components/full-plan/FullPlanAccordion';
import type { ChatMessage, CurrentPlanSidebarState, FullExecutionPlan, FullPlanState, GeneratedOutput, ModuleType, UpgradeOptionKey, WorkflowPlan } from '@/lib/workflow-generation/types';

type CopilotPayload = {
  sessionId: string;
  matchedTemplateSlug: string;
  messages: ChatMessage[];
  currentPlan: WorkflowPlan;
  sidebarState: CurrentPlanSidebarState;
  fullPlanState: FullPlanState;
  fullPlan?: FullExecutionPlan;
  refinements?: GeneratedOutput[];
  savedArchiveId?: string;
};

const defaultTask = '我有一个毕业设计，想用 AI 帮我剪辑展示视频。';

type CopilotPageClientProps = {
  initialSessionId?: string;
  initialTask?: string;
};

export function CopilotPageClient({ initialSessionId, initialTask }: CopilotPageClientProps) {
  const [data, setData] = useState<CopilotPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobilePlanOpen, setMobilePlanOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const task = initialTask || defaultTask;

  async function requestJson(path: string, body?: object, method = 'POST') {
    const response = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : `Request failed: ${path}`);
    return payload;
  }

  useEffect(() => {
    let alive = true;
    async function boot() {
      setIsLoading(true);
      setError('');
      try {
        const payload = initialSessionId
          ? await requestJson(`/api/copilot/session?sessionId=${encodeURIComponent(initialSessionId)}`, undefined, 'GET')
          : await requestJson('/api/copilot/start', { input: task });
        if (alive) setData(payload);
      } catch (bootError) {
        if (alive) setError(bootError instanceof Error ? bootError.message : 'Unable to load copilot session.');
      } finally {
        if (alive) setIsLoading(false);
      }
    }
    boot();
    return () => {
      alive = false;
    };
  }, [initialSessionId, task]);

  async function mutate(action: () => Promise<CopilotPayload>) {
    setIsLoading(true);
    setError('');
    try {
      const payload = await action();
      setData(payload);
      setSaveState(payload.savedArchiveId ? 'saved' : 'idle');
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Action failed.');
    } finally {
      setIsLoading(false);
    }
  }

  async function chooseOption(optionKey: UpgradeOptionKey) {
    if (!data) return;
    if (optionKey === 'full_plan' || optionKey === 'good_enough') {
      await generateFullPlan();
      return;
    }
    await mutate(() => requestJson('/api/copilot/option', { sessionId: data.sessionId, optionKey }));
  }

  async function sendMessage(message: string) {
    if (!data) return;
    await mutate(() => requestJson('/api/copilot/message', { sessionId: data.sessionId, message }));
  }

  async function generateFullPlan() {
    if (!data) return;
    await mutate(() => requestJson('/api/copilot/generate-full-plan', { sessionId: data.sessionId }));
  }

  async function refine(moduleType: ModuleType) {
    if (!data) return;
    await mutate(() => requestJson('/api/copilot/refine', { sessionId: data.sessionId, moduleType }));
  }

  async function save() {
    if (!data) return;
    setSaveState('saving');
    setError('');
    try {
      const archiveItem = await requestJson(`/api/sessions/${encodeURIComponent(data.sessionId)}/save`, {});
      setData({ ...data, savedArchiveId: archiveItem.id });
      setSaveState('saved');
    } catch (saveError) {
      setSaveState('idle');
      setError(saveError instanceof Error ? saveError.message : 'Unable to save archive.');
    }
  }

  const visibleOptions = useMemo(() => data?.currentPlan.upgradeDirections.slice(0, 4) ?? [], [data]);

  if (isLoading && !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <Loader2 className="size-6 animate-spin text-violet-300" aria-hidden="true" />
          Starting your AI workflow copilot...
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-lg rounded-3xl border border-rose-300/30 bg-rose-300/10 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 size-8 text-rose-200" aria-hidden="true" />
          <p>{error || 'Unable to load the copilot.'}</p>
          <Link href="/" className="mt-5 inline-flex rounded-2xl bg-white px-4 py-2 font-bold text-slate-950">Back home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#050915] text-white">
      <header className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-5">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold">
          <span className="flex size-10 items-center justify-center rounded-2xl border border-violet-300/50 bg-violet-400/15"><Sparkles className="size-5 text-violet-100" aria-hidden="true" /></span>
          AI Task Workflow Copilot
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMobilePlanOpen(true)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white lg:hidden">当前方案</button>
          <button type="button" onClick={save} disabled={saveState === 'saving'} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-semibold text-white disabled:opacity-70">
            {saveState === 'saving' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : saveState === 'saved' ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
            {saveState === 'saved' ? '已保存' : '保存方案'}
          </button>
          <Link href="/archive" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white"><Archive className="size-4" aria-hidden="true" />Archive</Link>
          <div className="size-11 rounded-full bg-gradient-to-br from-slate-200 to-blue-200" aria-hidden="true" />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] gap-4 px-2 pb-4 sm:px-4">
        <CurrentPlanSidebar state={data.sidebarState} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} onOption={chooseOption} isLoading={isLoading} />
        <ChatPanel
          stepNumber={data.currentPlan.stepNumber}
          stepTitle={data.currentPlan.stepTitle}
          messages={data.messages}
          options={visibleOptions}
          onOption={chooseOption}
          onSend={sendMessage}
          isLoading={isLoading}
        />
      </div>

      <div className="mx-auto max-w-[1440px] px-2 pb-8 sm:px-4">
        {error ? <div className="mb-4 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-rose-50">{error}</div> : null}
        <FullPlanAccordion state={data.fullPlanState} fullPlan={data.fullPlan} onGenerate={generateFullPlan} onRefine={refine} isLoading={isLoading} />
      </div>

      {mobilePlanOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 lg:hidden" onClick={() => setMobilePlanOpen(false)}>
          <div className="mt-20 rounded-3xl border border-white/10 bg-slate-950 p-5" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-2xl font-bold">当前方案</h2>
            <p className="mt-3 text-lg text-white">{data.sidebarState.recommendationLabel}</p>
            <p className="mt-2 text-slate-300">{data.sidebarState.combinationLabel}</p>
            <p className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-emerald-100">{data.sidebarState.statusLabel}</p>
            <button type="button" onClick={() => setMobilePlanOpen(false)} className="mt-5 w-full rounded-2xl bg-violet-600 px-4 py-3 font-bold">Close</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
