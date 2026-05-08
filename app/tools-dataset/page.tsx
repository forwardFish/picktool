import Link from 'next/link';
import type { ReactNode } from 'react';
import { Database, Search, ShieldCheck } from 'lucide-react';
import { getCatalogSummary } from '@/lib/tool-catalog/load-tools';
import { searchTools } from '@/lib/tool-catalog/search-tools';

type ToolsDatasetPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function ToolsDatasetPage({ searchParams }: ToolsDatasetPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() || '';
  const summary = getCatalogSummary();
  const samples = query ? searchTools(summary.tools, query, 24) : summary.allowedTools.slice(0, 24);

  return (
    <main className="min-h-dvh bg-[#07101f] text-white">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold text-cyan-200">Back home</Link>
            <h1 className="mt-4 text-4xl font-bold">Local AI Tool Dataset</h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Local catalog status, safety filter summary, category distribution, and searchable sample tools.
            </p>
          </div>
          <form className="flex min-w-0 gap-3" action="/tools-dataset">
            <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4">
              <Search className="size-5 text-slate-400" aria-hidden="true" />
              <input name="q" defaultValue={query} placeholder="Search local tools..." className="min-w-0 bg-transparent py-3 text-white outline-none placeholder:text-slate-500" />
            </label>
            <button type="submit" className="rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-slate-950">Search</button>
          </form>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric icon={<Database className="size-6" />} label="Total tools" value={summary.tools.length} />
          <Metric icon={<ShieldCheck className="size-6" />} label="Allowed tools" value={summary.allowedTools.length} />
          <Metric icon={<Database className="size-6" />} label="Categories" value={summary.categoryCount} />
          <Metric icon={<ShieldCheck className="size-6" />} label="Safety filtered" value={summary.safetyFilteredCount} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-2xl font-bold">{query ? `Search results for "${query}"` : 'Sample tools'}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {samples.map((tool) => (
                <article key={tool.slug} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{tool.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-cyan-200">{tool.primaryCategory}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">{tool.pricingModel}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{tool.shortDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tool.taskIntents.slice(0, 3).map((intent) => (
                      <span key={intent} className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">{intent}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Source</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Mode" value={summary.source} />
                <Row label="Local JSONL" value={summary.localCount} />
                <Row label="Fallback tools" value={summary.fallbackCount} />
              </dl>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Top categories</h2>
              <div className="mt-4 space-y-2 text-sm">
                {summary.topCategories.map(([category, count]) => (
                  <Row key={category} label={category} value={count} />
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Missing fields</h2>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Website URL" value={summary.missing.websiteUrl} />
                <Row label="Description" value={summary.missing.shortDescription} />
                <Row label="Categories" value={summary.missing.categories} />
                <Row label="Task intents" value={summary.missing.taskIntents} />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="text-cyan-200">{icon}</div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 last:border-b-0">
      <span className="text-slate-300">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
