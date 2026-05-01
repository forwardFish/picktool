import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
import { SiteBackdrop, SiteHeader } from '@/components/picktool/site-chrome';

export default function NotFound() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <SiteBackdrop />
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <span className="flex size-16 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
          <SearchX className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-7 text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          This route is not part of the current MVP decision flow.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-300/16"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </Link>
      </section>
    </main>
  );
}
