'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { promptExamples } from '@/lib/data/decisionTemplates';

type DecisionFormProps = {
  initialTask?: string;
  compact?: boolean;
  onTaskSubmit?: (task: string) => void | Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
};

export function DecisionForm({ initialTask = '', compact = false, onTaskSubmit, submitLabel = 'Start workflow', disabled = false }: DecisionFormProps) {
  const router = useRouter();
  const [task, setTask] = useState(initialTask);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTask = task.trim();

    if (!trimmedTask) {
      setError('Describe one task first.');
      return;
    }

    if (trimmedTask.length < 3) {
      setError('Describe a task with at least 3 characters.');
      return;
    }

    if (trimmedTask.length > 2500) {
      setError('Keep the task under 2500 characters.');
      return;
    }

    setError('');

    if (onTaskSubmit) {
      await onTaskSubmit(trimmedTask);
      return;
    }

    router.push(`/results?task=${encodeURIComponent(trimmedTask)}`);
  }

  return (
    <div className={compact ? 'w-full' : 'mx-auto w-full max-w-5xl'}>
      <form onSubmit={submit} className="neon-border flex flex-col overflow-hidden rounded-[1.75rem] bg-slate-950/78 md:flex-row">
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
            disabled={disabled}
          />
        </label>
        <button
          type="submit"
          disabled={disabled}
          className="m-3 inline-flex min-h-14 items-center justify-center gap-3 rounded-[1.35rem] bg-[linear-gradient(90deg,var(--cyan),var(--blue),var(--magenta))] px-7 text-base font-semibold text-white shadow-[0_18px_50px_rgba(126,86,255,0.38)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65"
        >
          <Sparkles className="size-5" aria-hidden="true" />
          {disabled ? 'Planning workflow...' : submitLabel}
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
              {formatExample(example)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatExample(example: string) {
  const lower = example.toLowerCase();

  if (lower.includes('product promo video')) return 'Product video';
  if (lower.includes('pdf')) return 'PDF to slides';
  if (lower.includes('landing page')) return 'Landing page';
  if (lower.includes('carousel')) return 'Instagram carousel';
  if (lower.includes('avatar')) return 'AI avatar video';
  if (lower.includes('course')) return 'Course sales page';

  return example.replace(/^I want to /, '').replace(/\.$/, '');
}

