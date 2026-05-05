import Link from 'next/link';
import { BrandMark } from '@/components/picktool/brand';

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-8 sm:px-8">
      <Link href="/" aria-label="AI Tool Decision Assistant home">
        <BrandMark />
      </Link>
      <button className="whitespace-nowrap rounded-xl border border-cyan-300/35 bg-slate-950/45 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_0_18px_rgba(83,133,255,0.08)]">
        Log in
      </button>
    </header>
  );
}

export function SiteBackdrop() {
  return (
    <>
      <div className="starfield" />
      <div className="planet-glow" />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <BrandMark />
      <div className="flex flex-wrap gap-5">
        <span>About</span>
        <span>Decision guide</span>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
      <span>2026 AI Tool Decision Assistant.</span>
    </footer>
  );
}

