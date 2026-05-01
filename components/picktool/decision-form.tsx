'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { promptExamples } from '@/lib/picktool/decisions';

type DecisionFormProps = {
  initialTask?: string;
  compact?: boolean;
};

export function DecisionForm({ initialTask = '', compact = false }: DecisionFormProps) {
  const router = useRouter();
  const [task, setTask] = useState(initialTask);
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTask = task.trim();

    if (!trimmedTask) {
      setError('Describe one task first.');
      return;
    }

    router.push(`/results?task=${encodeURIComponent(trimmedTask)}`);
  }

  return (
    <div className={compact ? 'w-full' : 'mx-auto w-full max-w-5xl'}>
      <form
        onSubmit={submit}
        className="neon-border flex flex-col overflow-hidden rounded-[1.75rem] bg-slate-950/78 md:flex-row"
      >
        <label className="flex min-h-20 flex-1 items-center gap-4 px-5 sm:px-7">
          <Search className="size-6 shrink-0 text-white/86" aria-hidden="true" />
          <span className="sr-only">Describe your task</span>
          <textarea
            value={task}
            onChange={(event) => {
              setTask(event.target.value);
              setError('');
            }}
            rows={compact ? 1 : 2}
            placeholder="I want to create a product promo video for TikTok."
            className="min-h-12 w-full resize-none border-0 bg-transparent py-5 text-base text-white outline-none placeholder:text-slate-400 sm:text-lg"
          />
        </label>
        <button
          type="submit"
          className="m-3 inline-flex min-h-14 items-center justify-center gap-3 rounded-[1.35rem] bg-[linear-gradient(90deg,var(--cyan),var(--blue),var(--magenta))] px-7 text-base font-semibold text-white shadow-[0_18px_50px_rgba(126,86,255,0.38)] transition hover:brightness-110"
        >
          <Sparkles className="size-5" aria-hidden="true" />
          Get Decision
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      {!compact ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {promptExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setTask(example)}
              className="rounded-full border border-white/14 bg-white/7 px-4 py-3 text-sm text-slate-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
            >
              {example.replace(/^I want to /, '').replace(/\.$/, '')}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
