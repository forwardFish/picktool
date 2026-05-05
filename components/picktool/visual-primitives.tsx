import type { ReactNode } from 'react';
import type { ToolStatus } from '@/lib/schemas/toolDecision';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = '' }: CardProps) {
  return <section className={`glass-panel relative overflow-hidden rounded-[1.75rem] ${className}`}>{children}</section>;
}

export function SoftCard({ children, className = '' }: CardProps) {
  return <div className={`rounded-2xl border border-white/12 bg-white/7 shadow-[inset_0_0_24px_rgba(88,126,255,0.05)] ${className}`}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div>
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">{title}</h2>
      {body ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{body}</p> : null}
    </div>
  );
}

export function RoleBadge({ status }: { status: ToolStatus }) {
  const className =
    status === 'core'
      ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100'
      : status === 'shortcut'
        ? 'border-emerald-300/45 bg-emerald-300/12 text-emerald-100'
        : 'border-blue-300/40 bg-blue-300/10 text-blue-100';

  return <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${className}`}>{status}</span>;
}

export function CheckList({ items, tone = 'good' }: { items: string[]; tone?: 'good' | 'bad' | 'neutral' }) {
  const toneClass = tone === 'good' ? 'text-emerald-200' : tone === 'bad' ? 'text-rose-200' : 'text-cyan-100';
  const mark = tone === 'bad' ? '×' : '✓';

  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
          <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-xs ${toneClass}`}>{mark}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
