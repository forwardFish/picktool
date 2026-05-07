import { Sparkles } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl border border-violet-300/50 bg-violet-300/10 shadow-[0_0_24px_rgba(140,92,255,0.36)]">
        <Sparkles className="size-5 text-violet-100" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-normal text-white sm:text-xl">
        AI Task Workflow Copilot
      </span>
    </div>
  );
}
