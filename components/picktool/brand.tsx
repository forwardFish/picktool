import { Sparkles } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl border border-cyan-300/50 bg-cyan-300/10 shadow-[0_0_24px_rgba(72,183,255,0.36)]">
        <Sparkles className="size-5 text-cyan-200" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-normal text-white sm:text-xl">
        AI Tool Decision Assistant
      </span>
    </div>
  );
}
