import Link from 'next/link';
import { BrandMark } from '@/components/picktool/brand';

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-8 sm:px-8">
      <Link href="/" aria-label="AI Tool Decision Assistant home">
        <BrandMark />
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
        <Link href="/#how-it-works" className="transition hover:text-white">
          How it works
        </Link>
        <Link href="/#examples" className="transition hover:text-white">
          Examples
        </Link>
      </nav>
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
        <span>How it works</span>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
      <span>2026 AI Tool Decision Assistant.</span>
    </footer>
  );
}
