'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Archive, Loader2, Trash2 } from 'lucide-react';
import type { ArchiveItem } from '@/lib/archive/types';

type ArchiveListPayload = { items: ArchiveItem[] };

export function ArchiveListClient() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/archive');
      const payload = (await response.json()) as ArchiveListPayload | { error?: string };
      if (!response.ok) throw new Error('error' in payload && payload.error ? payload.error : 'Unable to load archive.');
      setItems((payload as ArchiveListPayload).items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load archive.');
    } finally {
      setIsLoading(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/archive/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setItems((current) => current.filter((item) => item.id !== id));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-dvh bg-[#050915] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold">AI Task Workflow Copilot</Link>
          <Link href="/copilot" className="rounded-2xl bg-violet-600 px-4 py-3 font-semibold">New workflow</Link>
        </header>
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Archive className="size-7 text-violet-200" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold">Saved workflow archive</h1>
              <p className="text-slate-400">Local MVP archive. Data is in memory for this running server process.</p>
            </div>
          </div>

          {isLoading ? <div className="flex items-center gap-3 text-slate-300"><Loader2 className="size-5 animate-spin" /> Loading saved plans...</div> : null}
          {error ? <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-rose-50">{error}</div> : null}
          {!isLoading && !items.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-300">
              <p className="text-xl font-semibold text-white">No saved workflows yet.</p>
              <p className="mt-2">Generate a Copilot plan and click “保存方案”.</p>
            </div>
          ) : null}

          <div className="grid gap-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{item.title}</h2>
                    <p className="mt-2 text-slate-300">{item.userInput}</p>
                    <p className="mt-3 text-xs text-slate-500">Saved {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/archive/${encodeURIComponent(item.id)}`} className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Open</Link>
                    <button type="button" onClick={() => remove(item.id)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-200" aria-label="Delete archive item"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
