'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, FileText, Loader2, Search, Send, Sparkles } from 'lucide-react';

const examples = [
  '毕业设计展示视频',
  '产品宣传视频',
  'PDF 转 PPT',
  '做一个 Landing Page',
  '竞品分析报告',
  '短视频脚本'
];

const examplePrompts: Record<string, string> = {
  '毕业设计展示视频': '我有一个毕业设计，想用 AI 帮我剪辑展示视频。',
  '产品宣传视频': 'I want to create a product promo video for TikTok.',
  'PDF 转 PPT': 'Help me turn a PDF into a clear presentation deck.',
  '做一个 Landing Page': 'Help me make a landing page for a new SaaS product.',
  '竞品分析报告': '帮我做一份竞品分析报告。',
  '短视频脚本': '帮我规划一条 60 秒短视频脚本。'
};

export function CopilotStartForm() {
  const router = useRouter();
  const [task, setTask] = useState(examplePrompts['毕业设计展示视频']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function start() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/copilot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: task })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to start the copilot.');
      router.push(`/copilot?sessionId=${encodeURIComponent(payload.sessionId)}`);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Unable to start the copilot.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="neon-border grid overflow-hidden rounded-[2rem] bg-slate-950/70 p-2 shadow-2xl sm:grid-cols-[1fr_auto]">
        <label className="flex min-h-20 items-center gap-4 px-5 text-left sm:px-7" aria-label="Task input">
          <Search className="size-7 shrink-0 text-slate-200" aria-hidden="true" />
          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            rows={2}
            className="min-h-16 flex-1 resize-none border-0 bg-transparent py-5 text-lg text-white outline-none placeholder:text-slate-500"
            placeholder="我有一个毕业设计，想用 AI 帮我剪辑展示视频。"
          />
        </label>
        <button
          type="button"
          onClick={start}
          disabled={isLoading}
          className="m-1 inline-flex items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-8 py-5 text-lg font-bold text-white shadow-[0_0_30px_rgba(140,92,255,0.42)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Sparkles className="size-5" aria-hidden="true" />}
          开始规划
        </button>
      </div>

      {error ? (
        <div className="mx-auto mt-5 flex max-w-3xl gap-3 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-left text-rose-50">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setTask(examplePrompts[example])}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-violet-300/60 hover:bg-violet-400/10"
          >
            <FileText className="size-4 text-violet-200" aria-hidden="true" />
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
