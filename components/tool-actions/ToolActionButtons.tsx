'use client';

import Link from 'next/link';
import { Clipboard, ExternalLink, Info, ListChecks } from 'lucide-react';
import { useState } from 'react';
import type { WorkflowTool } from '@/lib/workflow-generation/types';

export function ToolActionButtons({ tool }: { tool: WorkflowTool }) {
  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState(false);
  const detailSlug = tool.detailSlug ?? tool.slug;

  async function copyPrompt() {
    if (!tool.actionPrompt) return;
    await navigator.clipboard.writeText(tool.actionPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (!detailSlug && !tool.websiteUrl && !tool.actionPrompt && !tool.useSteps?.length) return null;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {detailSlug ? (
          <Link href={`/tools/${detailSlug}`} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:border-cyan-300/60">
            <Info className="size-3.5" aria-hidden="true" />
            查看详情
          </Link>
        ) : null}
        {tool.websiteUrl ? (
          <a href={tool.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:border-cyan-300/60">
            <ExternalLink className="size-3.5" aria-hidden="true" />
            打开官网
          </a>
        ) : null}
        {tool.actionPrompt ? (
          <button type="button" onClick={copyPrompt} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:border-cyan-300/60">
            <Clipboard className="size-3.5" aria-hidden="true" />
            {copied ? '已复制' : '复制 Prompt'}
          </button>
        ) : null}
        {tool.useSteps?.length ? (
          <button type="button" onClick={() => setShowSteps((value) => !value)} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:border-cyan-300/60">
            <ListChecks className="size-3.5" aria-hidden="true" />
            查看步骤
          </button>
        ) : null}
      </div>
      {showSteps && tool.useSteps?.length ? (
        <ol className="space-y-1 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-xs leading-5 text-slate-300">
          {tool.useSteps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      ) : null}
    </div>
  );
}
