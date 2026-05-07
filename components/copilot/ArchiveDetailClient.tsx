'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ArchiveItem } from '@/lib/archive/types';

export function ArchiveDetailClient({ id }: { id: string }) {
  const [item, setItem] = useState<ArchiveItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/archive/${encodeURIComponent(id)}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : 'Archive item not found.');
        setItem(payload);
      } catch (detailError) {
        setError(detailError instanceof Error ? detailError.message : 'Archive item not found.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <main className="min-h-dvh bg-[#050915] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link href="/archive" className="text-slate-300">← Archive</Link>
          <Link href="/copilot" className="rounded-2xl bg-violet-600 px-4 py-3 font-semibold">New workflow</Link>
        </header>
        {isLoading ? <div className="flex items-center gap-3"><Loader2 className="size-5 animate-spin" /> Loading archive item...</div> : null}
        {error ? <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-5 text-rose-50">{error}</div> : null}
        {item ? (
          <article className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <div>
              <h1 className="text-3xl font-bold">{item.title}</h1>
              <p className="mt-2 text-slate-300">{item.userInput}</p>
              <p className="mt-2 text-xs text-slate-500">{item.id} · {new Date(item.createdAt).toLocaleString()}</p>
            </div>
            {item.workflowData.currentPlan ? (
              <section className="rounded-2xl border border-violet-300/25 bg-violet-500/10 p-5">
                <h2 className="text-xl font-bold">{item.workflowData.currentPlan.title}</h2>
                <p className="mt-2 text-2xl font-bold">{item.workflowData.currentPlan.combinationLabel}</p>
                <p className="mt-2 text-slate-300">{item.workflowData.currentPlan.summary}</p>
              </section>
            ) : null}
            {item.workflowData.fullPlan ? (
              <section className="grid gap-4 md:grid-cols-2">
                {item.workflowData.fullPlan.executionSteps.map((step, index) => (
                  <div key={step.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-bold">{index + 1}. {step.title}</p>
                    <p className="mt-1 text-slate-400">{step.body}</p>
                  </div>
                ))}
              </section>
            ) : null}
            {item.workflowData.refinements?.length ? (
              <section className="space-y-3">
                <h2 className="text-xl font-bold">Generated refinements</h2>
                {item.workflowData.refinements.map((output) => (
                  <div key={output.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-bold">{output.title}</p>
                    <p className="text-slate-400">{output.summary}</p>
                  </div>
                ))}
              </section>
            ) : null}
          </article>
        ) : null}
      </div>
    </main>
  );
}
