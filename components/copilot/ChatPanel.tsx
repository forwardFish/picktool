'use client';

import { useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { ToolActionButtons } from '@/components/tool-actions/ToolActionButtons';
import type { ChatMessage as ChatMessageType, UpgradeOptionKey, WorkflowPlan } from '@/lib/workflow-generation/types';

function ToolTile({ tool }: { tool: WorkflowPlan['tools'][number] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/70 to-blue-500/70 text-lg font-bold text-white">
        {tool.name.slice(0, 1)}
      </div>
      <p className="font-bold text-white">{tool.name}</p>
      <p className="mt-1 text-sm text-slate-400">{tool.role}</p>
      <ToolActionButtons tool={tool} />
    </div>
  );
}

function PlanCard({ plan }: { plan: WorkflowPlan }) {
  return (
    <div className="rounded-3xl border border-violet-400/45 bg-violet-500/10 p-6 shadow-[inset_0_0_38px_rgba(140,92,255,0.12)]">
      <div className="mb-4 flex items-center gap-3 text-violet-200">
        <span className="rounded-full border border-violet-300/50 bg-violet-400/15 p-2">★</span>
        <span className="font-bold">{plan.title}</span>
      </div>
      <h3 className="text-2xl font-bold text-white sm:text-3xl">{plan.combinationLabel}</h3>
      <p className="mt-3 text-slate-300">{plan.summary}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plan.tools.map((tool) => <ToolTile key={tool.slug} tool={tool} />)}
      </div>
    </div>
  );
}

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-violet-300/40 bg-violet-500/20 text-violet-100"><Sparkles className="size-5" aria-hidden="true" /></div> : null}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-3`}>
        <div className={`rounded-2xl px-5 py-4 text-base leading-7 ${isUser ? 'bg-violet-600/40 text-white' : 'bg-white/[0.06] text-slate-100'}`}>
          {message.content}
        </div>
        {message.plan ? <PlanCard plan={message.plan} /> : null}
        {message.generatedOutput ? (
          <div className="rounded-3xl border border-blue-300/30 bg-blue-500/10 p-5 text-slate-100">
            <p className="text-xl font-bold text-white">{message.generatedOutput.title}</p>
            <p className="mt-2 text-slate-300">{message.generatedOutput.summary}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {message.generatedOutput.sections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="font-bold text-white">{section.title}</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-300">
                    {section.items.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {isUser ? <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-slate-200 to-blue-200" aria-hidden="true" /> : null}
    </div>
  );
}

type ChatPanelProps = {
  stepNumber: number;
  stepTitle: string;
  messages: ChatMessageType[];
  options: { key: UpgradeOptionKey; label: string; description: string }[];
  onOption: (key: UpgradeOptionKey) => void;
  onSend: (message: string) => void;
  isLoading?: boolean;
};

export function ChatPanel({ stepNumber, stepTitle, messages, options, onOption, onSend, isLoading }: ChatPanelProps) {
  const [draft, setDraft] = useState('');

  function submit() {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-3xl border border-white/10 bg-slate-950/55 shadow-2xl">
      <div className="border-b border-white/10 p-6">
        <h1 className="text-3xl font-bold text-white sm:text-4xl"><span className="text-violet-400">第 {stepNumber} 步</span> / {stepTitle}</h1>
      </div>
      <div className="flex-1 space-y-6 p-5 sm:p-8">
        {messages.map((item) => <ChatMessage key={item.id} message={item} />)}
        {options.length ? (
          <div className="ml-0 grid gap-3 sm:grid-cols-2 lg:ml-14">
            {options.map((option) => (
              <button key={option.key} type="button" disabled={isLoading} onClick={() => onOption(option.key)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-white transition hover:border-violet-300/50 hover:bg-violet-400/10 disabled:opacity-60">
                <span>{option.label}</span>
                <span className="text-slate-400">›</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            placeholder="继续告诉我的需求..."
            className="min-w-0 flex-1 bg-transparent px-2 py-3 text-white outline-none placeholder:text-slate-500"
          />
          <button type="button" onClick={submit} disabled={isLoading || !draft.trim()} className="rounded-full bg-violet-600 p-3 text-white disabled:opacity-60">
            {isLoading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Send className="size-5" aria-hidden="true" />}
          </button>
        </div>
        <p className="mt-2 px-2 text-xs text-slate-500">按 Enter 发送，Shift + Enter 换行</p>
      </div>
    </section>
  );
}




