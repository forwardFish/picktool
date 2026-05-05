import Link from 'next/link';
import { ArrowRight, CheckCircle2, ExternalLink, RotateCw, XCircle } from 'lucide-react';
import type { Tool } from '@/lib/schemas/toolDecision';
import { getToolIcon } from './tool-icons';
import { CheckList, GlassCard, SectionHeading, SoftCard } from './visual-primitives';

export function ToolDetailView({ tool }: { tool: Tool }) {
  const Icon = getToolIcon(tool.slug);

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="flex min-h-64 items-center justify-center rounded-[1.5rem] border border-cyan-300/24 bg-cyan-300/8">
            <div className="flex size-28 items-center justify-center rounded-[2rem] bg-white text-slate-950 shadow-[0_24px_70px_rgba(72,183,255,0.26)]">
              <Icon className="size-14" aria-hidden="true" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-cyan-200">AI Tool Decision Detail</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white sm:text-6xl">{tool.name}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{tool.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[tool.category, tool.pricing, tool.level].map((item) => (
                <span key={item} className="rounded-full border border-white/14 bg-white/7 px-3 py-2 text-sm text-slate-100">{item}</span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,var(--cyan),var(--blue),var(--magenta))] px-5 py-3 text-sm font-semibold text-white">
                Open official website <ExternalLink className="size-4" aria-hidden="true" />
              </span>
              {tool.commonSetups[0] ? (
                <Link href={`/setups/${tool.commonSetups[0].slug}`} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/16">
                  View setup <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-7">
        <SectionHeading title="Decision Summary" />
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <SoftCard className="p-5">
            <p className="text-base leading-7 text-slate-300">{tool.decisionSummary}</p>
          </SoftCard>
          <SoftCard className="p-5">
            <p className="text-sm font-semibold text-white">Works best with</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tool.workflowRoles.bestWith.map((item) => (
                <span key={item} className="rounded-xl border border-white/12 bg-slate-950/35 px-3 py-2 text-sm text-slate-200">{item}</span>
              ))}
            </div>
          </SoftCard>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5 sm:p-7">
          <SectionHeading title="Worth using if" />
          <div className="mt-5"><CheckList items={tool.worthUsingIf} /></div>
        </GlassCard>
        <GlassCard className="p-5 sm:p-7">
          <SectionHeading title="Probably skip if" />
          <div className="mt-5"><CheckList items={tool.probablySkipIf} tone="bad" /></div>
        </GlassCard>
      </div>

      <GlassCard className="p-5 sm:p-7">
        <SectionHeading title="Best-fit Tasks" body="Use this tool when its role matches the job." />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {tool.bestFitTasks.map((task) => (
            <SoftCard key={task} className="p-4 text-sm font-semibold text-white">{task}</SoftCard>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-7">
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <SoftCard className="p-5">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[-0.03em] text-white">
              <CheckCircle2 className="size-5 text-emerald-200" aria-hidden="true" />
              Use when
            </h2>
            <div className="mt-4"><CheckList items={tool.useWhen} /></div>
          </SoftCard>
          <SoftCard className="p-5">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[-0.03em] text-white">
              <XCircle className="size-5 text-rose-200" aria-hidden="true" />
              Do not start here when
            </h2>
            <div className="mt-4"><CheckList items={tool.avoidWhen} tone="bad" /></div>
          </SoftCard>
        </div>
      </GlassCard>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <GlassCard className="p-5 sm:p-7">
          <SectionHeading title="Role in workflow" />
          <div className="mt-5 space-y-4">
            <InfoRow label="Position" value={tool.workflowRoles.position} />
            <InfoRow label="Role" value={tool.workflowRoles.role} />
            <InfoRow label="Used after" value={tool.workflowRoles.usedAfter} />
            <InfoRow label="Used before" value={tool.workflowRoles.usedBefore} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-7">
          <SectionHeading title="Best setups including this tool" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {tool.commonSetups.map((setup) => (
              <Link key={setup.slug} href={`/setups/${setup.slug}`} className="group rounded-2xl border border-white/12 bg-white/7 p-5 transition hover:border-cyan-300/50 hover:bg-cyan-300/10">
                <h3 className="font-semibold text-white">{setup.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{setup.role}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">View setup <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5 sm:p-7">
        <SectionHeading title="Better options if" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tool.betterOptionsIf.map((option) => (
            <SoftCard key={option.condition} className="p-4">
              <h3 className="flex items-center gap-2 font-semibold text-white"><RotateCw className="size-4 text-cyan-200" aria-hidden="true" />{option.condition}</h3>
              <p className="mt-2 text-sm text-cyan-100">{option.recommendation}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Best for: {option.bestFor}</p>
            </SoftCard>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-7">
        <SectionHeading title="Practical details" body="Basic details only; always verify current product policy before commercial work." />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <InfoRow label="Official website" value={tool.practicalDetails.officialWebsite} />
          <InfoRow label="Category" value={tool.practicalDetails.category} />
          <InfoRow label="Pricing" value={tool.practicalDetails.pricing} />
          <InfoRow label="Input" value={tool.practicalDetails.input} />
          <InfoRow label="Output" value={tool.practicalDetails.output} />
          <InfoRow label="Platform" value={tool.practicalDetails.platforms} />
          <InfoRow label="Commercial use" value={tool.practicalDetails.commercialUse} />
        </div>
      </GlassCard>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/7 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}
