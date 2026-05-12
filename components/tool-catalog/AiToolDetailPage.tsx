import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, BadgeDollarSign, Bookmark, CheckCircle2, ExternalLink, Gauge, Hash, MessageCircle, Star, Users } from 'lucide-react';
import type { AiToolDetail } from '@/lib/tool-catalog/types';

type AiToolDetailPageProps = {
  detail: AiToolDetail;
  detailStatus: 'full' | 'partial' | 'basic';
};

function formatNumber(value?: number) {
  if (typeof value !== 'number') return '暂无数据';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function pricingLabel(value: AiToolDetail['pricing']['model']) {
  if (value === 'free') return '免费';
  if (value === 'freemium') return '免费 / 付费';
  if (value === 'paid') return '付费';
  return '未知';
}

function detailStatusLabel(value: AiToolDetailPageProps['detailStatus']) {
  if (value === 'partial') return '部分详情';
  if (value === 'basic') return '基础详情';
  return '完整详情';
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
      <span className="text-cyan-200">{icon}</span>
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function SectionCard({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="rounded-2xl border border-white/10 bg-slate-950/58 p-5 shadow-[inset_0_0_28px_rgba(56,189,248,0.05)] sm:p-7">
      <h2 className="text-2xl font-bold tracking-normal text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoTile({ title, body, icon }: { title: string; body: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 inline-flex rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">{icon}</div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

export function AiToolDetailPage({ detail, detailStatus }: AiToolDetailPageProps) {
  const tabs = [
    ['overview', '概览'],
    ['alternatives', '替代工具'],
    ['pricing', '价格'],
    ['reviews', '评价'],
    ['qa', '问答']
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-cyan-100">首页</Link>
        <span>/</span>
        <span>{detail.hero.category}</span>
        <span>/</span>
        <span className="font-semibold text-slate-200">{detail.name}</span>
      </div>

      <section className="grid gap-7 lg:grid-cols-[280px_1fr] lg:items-center">
        <div className="flex aspect-square items-center justify-center rounded-[1.75rem] border border-white/10 bg-white text-slate-950 shadow-[0_26px_90px_rgba(14,165,233,0.18)]">
          <span className="text-7xl font-black tracking-normal">{detail.name.slice(0, 1)}</span>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-bold tracking-normal text-white sm:text-6xl">{detail.name}</h1>
            <span className="rounded-full border border-blue-300/40 bg-blue-400/15 px-3 py-1 text-sm font-bold text-blue-100">
              {detail.source === 'toolify' ? 'Toolify 数据' : '本地目录'}
            </span>
            {detailStatus !== 'full' ? (
              <span className="rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-sm font-semibold text-amber-100">
                {detailStatusLabel(detailStatus)}
              </span>
            ) : null}
          </div>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">{detail.hero.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Stat icon={<Star className="size-4" aria-hidden="true" />} label="评分" value={typeof detail.hero.rating === 'number' && detail.hero.rating > 0 ? `${detail.hero.rating}` : '暂无评分'} />
            <Stat icon={<MessageCircle className="size-4" aria-hidden="true" />} label="评价" value={formatNumber(detail.hero.reviewsCount)} />
            <Stat icon={<Bookmark className="size-4" aria-hidden="true" />} label="收藏" value={formatNumber(detail.hero.savedCount)} />
            <Stat icon={<Users className="size-4" aria-hidden="true" />} label="访问" value={formatNumber(detail.hero.monthlyVisitors)} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {detail.websiteUrl ? (
              <a href={detail.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-bold text-white shadow-[0_0_28px_rgba(14,165,233,0.26)]">
                打开官网 <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            ) : null}
            {detail.sourceUrl ? (
              <a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-slate-100">
                查看 Toolify 来源 <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto border-b border-white/10">
        {tabs.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-slate-300 hover:border-cyan-300 hover:text-white">
            {label}
          </a>
        ))}
      </nav>

      <SectionCard id="overview" title={`${detail.name} 是什么？`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <p className="text-base leading-7 text-slate-300">{detail.overview.whatIs}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoTile icon={<Gauge className="size-5" aria-hidden="true" />} title="为什么值得关注" body={detail.overview.whyItMatters} />
              <InfoTile icon={<Users className="size-5" aria-hidden="true" />} title="适合谁使用" body={detail.overview.whoItsFor} />
              <InfoTile icon={<ExternalLink className="size-5" aria-hidden="true" />} title="适用场景" body={detail.overview.whereItWorks} />
              <InfoTile icon={<CheckCircle2 className="size-5" aria-hidden="true" />} title="可以得到什么" body={detail.overview.whatYouGet} />
            </div>
          </div>
          <div className="min-h-[330px] rounded-2xl border border-white/10 bg-[#07111f] p-5">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-white">{detail.name}</span>
              <span className="rounded-lg bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-950">导出</span>
            </div>
            <div className="flex min-h-48 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-900/45 via-slate-900 to-blue-900/45">
              <div className="text-center">
                <p className="text-4xl font-black text-white">{detail.hero.category}</p>
                <p className="mt-3 text-sm text-cyan-100">{detail.features.core.slice(0, 3).join(' / ')}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {detail.features.core.slice(0, 6).map((feature) => (
                <span key={feature} className="min-h-12 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-slate-300">{feature}</span>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="how-to-use" title={`如何使用 ${detail.name}？`}>
        <p className="text-base leading-7 text-slate-300">{detail.howToUse}</p>
      </SectionCard>

      <SectionCard id="features" title={`${detail.name} 的核心功能`}>
        <div className="grid gap-3 md:grid-cols-2">
          {detail.features.core.slice(0, 8).map((feature) => (
            <div key={feature} className="flex gap-3 text-sm leading-6 text-slate-300">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden="true" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {detail.features.cards.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                <Hash className="size-6" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard id="pricing" title="价格">
        <div className="grid gap-3 md:grid-cols-4">
          <InfoTile icon={<BadgeDollarSign className="size-5" aria-hidden="true" />} title="收费模式" body={pricingLabel(detail.pricing.model)} />
          <InfoTile icon={<CheckCircle2 className="size-5" aria-hidden="true" />} title="免费方案" body={detail.pricing.freePlan} />
          <InfoTile icon={<Star className="size-5" aria-hidden="true" />} title="付费方案" body={detail.pricing.paidPlan} />
          <InfoTile icon={<Gauge className="size-5" aria-hidden="true" />} title="计费方式" body={detail.pricing.billing} />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">{detail.pricing.note}</p>
      </SectionCard>

      <SectionCard id="alternatives" title="替代工具">
        {detail.alternatives.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {detail.alternatives.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group rounded-xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/55 hover:bg-cyan-300/10">
                <h3 className="font-bold text-white">{tool.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{tool.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-100">查看工具 <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">当前本地 Toolify 数据还没有收录足够的同类替代工具。</p>
        )}
      </SectionCard>

      <SectionCard id="reviews" title="评价">
        <p className="text-slate-300">
          当前 Toolify 数据只提供评分和评价数量；这里不会编造具体评价内容。
        </p>
      </SectionCard>

      <SectionCard id="qa" title="问答">
        <p className="text-slate-300">
          本地 Toolify 数据暂未抓取公开问答内容，因此这里保持为空状态。
        </p>
      </SectionCard>

      <section className="rounded-2xl border border-white/10 bg-slate-950/58 p-5">
        <h2 className="text-xl font-bold text-white">相关主题</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {detail.relatedTopics.map((topic) => (
            <span key={topic} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"># {topic}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
