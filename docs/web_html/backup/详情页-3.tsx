'use client'

import React from 'react'

type Tone = 'violet' | 'green' | 'amber' | 'blue'

const topTags: {
  icon: string
  label: string
  tone: Tone
  wide?: boolean
}[] = [
  { icon: '▣', label: 'Video editing', tone: 'violet' },
  { icon: '$', label: 'Free / Paid', tone: 'green' },
  { icon: '★', label: 'Beginner', tone: 'amber' },
  { icon: '▣', label: 'Web · iOS · Android · Desktop', tone: 'blue', wide: true },
]

const tabs = [
  { icon: '◔', label: 'Overview' },
  { icon: '☑', label: 'Best-fit Tasks' },
  { icon: '⚯', label: 'Workflow & Setups', active: true },
  { icon: '⇄', label: 'Alternatives' },
  { icon: 'ⓘ', label: 'Practical Details' },
]

const workflowSteps = [
  {
    n: 1,
    title: 'Message planning',
    desc: 'Define hook, script,\nangle, and structure',
  },
  {
    n: 2,
    title: 'Video editing',
    desc: 'Edit, add captions,\neffects, and music',
  },
  {
    n: 3,
    title: 'Publishing assets',
    desc: 'Thumbnails, graphics,\nand final export',
  },
]

const bestSetups = [
  {
    n: 1,
    title: 'AI Content → CapCut → Canva',
    desc: 'Plan with AI, edit in CapCut, design thumbnail in Canva.',
    bestFor: 'short-form promos',
    icons: ['openai', 'capcut', 'canva'] as const,
  },
  {
    n: 2,
    title: 'Product Clips → CapCut → Ads',
    desc: 'Edit product clips, add hooks & captions, export for ads.',
    bestFor: 'social ads & testing',
    icons: ['bag', 'capcut', 'megaphone'] as const,
  },
  {
    n: 3,
    title: 'UGC → CapCut → TikTok',
    desc: 'Polish UGC footage and post directly to TikTok.',
    bestFor: 'UGC & creator content',
    icons: ['person', 'capcut', 'tiktok'] as const,
  },
  {
    n: 4,
    title: 'Long Video → Shorts with CapCut',
    desc: 'Turn long videos into multiple shorts automatically.',
    bestFor: 'repurposing content',
    icons: ['play', 'capcut', 'video'] as const,
  },
]

const workflowRows = [
  {
    step: 1,
    stepTitle: 'Plan the message',
    goal: 'Create a clear hook, script,\nand key points.',
    tool: 'ChatGPT / Claude',
    toolIcon: 'openai',
    output: 'Script, hooks, and shot list\nready for editing',
  },
  {
    step: 2,
    stepTitle: 'Edit the video',
    goal: 'Assemble clips, trim, add\nmusic and transitions.',
    tool: 'CapCut',
    toolIcon: 'capcut',
    output: 'Polished video with pacing\nand structure',
  },
  {
    step: 3,
    stepTitle: 'Add captions & effects',
    goal: 'Add auto captions, effects,\nB-roll, and on-screen text.',
    tool: 'CapCut',
    toolIcon: 'capcut',
    output: 'Engaging video with captions\nand visual enhancements',
  },
  {
    step: 4,
    stepTitle: 'Export & publish',
    goal: 'Export in the right format\nand share everywhere.',
    tool: 'Canva / Platform',
    toolIcon: 'canva',
    output: 'Final assets published to\nplatforms and channels',
  },
]

const tips = [
  {
    icon: 'chat',
    title: 'Use ChatGPT first for hooks',
    desc: 'Strong hooks and scripts make editing faster and keep viewers watching.',
    pill: 'Save time',
    tone: 'amber' as const,
  },
  {
    icon: 'phone',
    title: 'Keep edits mobile-first',
    desc: 'Vertical, fast-paced edits with captions perform best on social platforms.',
    pill: 'Better performance',
    tone: 'cyan' as const,
  },
  {
    icon: 'image',
    title: 'Create thumbnail assets in Canva',
    desc: 'Design high-contrast thumbnails and covers that drive clicks.',
    pill: 'Boost engagement',
    tone: 'green' as const,
  },
]

function BrandStar({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="brand-star-gradient-v3" x1="7" y1="7" x2="57" y2="57">
          <stop stopColor="#57DAFF" />
          <stop offset="0.5" stopColor="#6F61FF" />
          <stop offset="1" stopColor="#C84CFF" />
        </linearGradient>
      </defs>
      <path
        d="M32 2L39.4 24.6L62 32L39.4 39.4L32 62L24.6 39.4L2 32L24.6 24.6L32 2Z"
        fill="url(#brand-star-gradient-v3)"
      />
      <path
        d="M32 16.8L35.9 28.1L47.2 32L35.9 35.9L32 47.2L28.1 35.9L16.8 32L28.1 28.1L32 16.8Z"
        fill="white"
      />
    </svg>
  )
}

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[18px] border border-[#2f74ff]/35 bg-[linear-gradient(180deg,rgba(5,13,34,.82),rgba(3,9,25,.92))] shadow-[0_0_28px_rgba(54,129,255,.14),0_0_34px_rgba(184,76,255,.08),inset_0_0_32px_rgba(72,124,255,.05)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_0_0_1px_rgba(190,78,255,.12)]" />
      {children}
    </section>
  )
}

function CapcutLogo() {
  return (
    <div className="relative grid h-[145px] w-[145px] place-items-center rounded-[24px] border border-white/8 bg-white shadow-[0_0_26px_rgba(81,154,255,.35)]">
      <div className="relative h-[78px] w-[98px]">
        <div className="absolute left-[6px] top-[11px] h-[14px] w-[86px] -skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[6px] top-[53px] h-[14px] w-[86px] skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[2px] top-[12px] h-[14px] w-[98px] -rotate-[34deg] rounded-[3px] bg-black" />
        <div className="absolute left-[2px] top-[52px] h-[14px] w-[98px] rotate-[34deg] rounded-[3px] bg-black" />
      </div>
    </div>
  )
}

function Tag({
  icon,
  label,
  tone,
  wide,
}: {
  icon: string
  label: string
  tone: Tone
  wide?: boolean
}) {
  const iconColor = {
    violet: 'text-violet-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-sky-400',
  }[tone]

  return (
    <span
      className={`inline-flex h-[35px] items-center gap-2 rounded-[10px] border border-white/14 bg-white/[0.02] px-3 text-[14px] text-white/80 shadow-[inset_0_0_14px_rgba(255,255,255,.02)] ${
        wide ? 'min-w-[254px]' : ''
      }`}
    >
      <span className={`${iconColor} text-[14px]`}>{icon}</span>
      {label}
    </span>
  )
}

function ActionButton({
  children,
  primary = false,
}: {
  children: React.ReactNode
  primary?: boolean
}) {
  return primary ? (
    <button className="inline-flex h-[48px] min-w-[232px] items-center justify-center rounded-[12px] bg-[linear-gradient(90deg,#3D8BFF_0%,#C24DFF_100%)] px-6 text-[15px] font-medium text-white shadow-[0_0_22px_rgba(97,88,255,.18),inset_0_0_16px_rgba(255,255,255,.15)]">
      {children}
    </button>
  ) : (
    <button className="inline-flex h-[48px] min-w-[160px] items-center justify-center rounded-[12px] border border-white/14 bg-white/[0.02] px-6 text-[15px] font-medium text-white/84 shadow-[inset_0_0_14px_rgba(255,255,255,.02)]">
      {children}
    </button>
  )
}

function AtAGlanceCard() {
  const items = [
    {
      icon: '▣',
      title: 'Best for',
      body: 'Short-form video editing, captions, templates, effects, and quick exports.',
    },
    {
      icon: '⚙',
      title: 'Workflow position',
      body: 'Editing & post-production',
    },
    {
      icon: '🗂',
      title: 'Works best with',
      body: 'ChatGPT / Claude → CapCut → Canva',
    },
  ]

  return (
    <GlassCard className="p-5 ring-1 ring-violet-500/28 shadow-[0_0_24px_rgba(168,78,255,.14),0_0_28px_rgba(54,129,255,.1),inset_0_0_32px_rgba(72,124,255,.05)]">
      <div className="mb-4 flex items-center gap-3">
        <BrandStar className="h-5 w-5" />
        <div className="text-[20px] font-semibold tracking-[-0.02em] text-white">At a glance</div>
      </div>

      <div className="border-t border-white/10">
        {items.map((item) => (
          <div key={item.title} className="grid grid-cols-[20px_1fr] gap-3 border-b border-white/10 py-[13px]">
            <div className="pt-[2px] text-[16px] text-sky-400">{item.icon}</div>
            <div>
              <div className="mb-1 text-[15px] font-semibold text-white/90">{item.title}</div>
              <div className="text-[13px] leading-[1.48] text-white/58">{item.body}</div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-[20px_1fr] gap-3 border-b border-white/10 py-[13px]">
          <div className="pt-[2px] text-[16px] text-sky-400">◴</div>
          <div>
            <div className="mb-2 text-[15px] font-semibold text-white/90">Learning curve</div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full ${i < 2 ? 'bg-sky-400' : 'bg-violet-500'}`}
                  />
                ))}
              </div>
              <span className="text-[13px] text-white/64">Easy</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[20px_1fr] gap-3 pt-[13px]">
          <div className="pt-[2px] text-[16px] text-sky-400">▤</div>
          <div>
            <div className="mb-1 text-[15px] font-semibold text-white/90">Starting price</div>
            <div className="text-[13px] font-semibold text-emerald-400">Free plan available</div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function ToolIcon({ type }: { type: string }) {
  if (type === 'openai') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-[inset_0_0_10px_rgba(255,255,255,.18)]">
        ◎
      </div>
    )
  }

  if (type === 'capcut') {
    return (
      <div className="relative grid h-10 w-10 place-items-center rounded-[10px] bg-white text-black shadow-[inset_0_0_0_1px_rgba(0,0,0,.05)]">
        <div className="relative h-5 w-6">
          <div className="absolute left-0 top-[2px] h-[4px] w-5 -skew-y-[22deg] rounded-[2px] bg-black" />
          <div className="absolute left-0 top-[13px] h-[4px] w-5 skew-y-[22deg] rounded-[2px] bg-black" />
          <div className="absolute left-0 top-[3px] h-[4px] w-6 -rotate-[33deg] rounded-[2px] bg-black" />
          <div className="absolute left-0 top-[12px] h-[4px] w-6 rotate-[33deg] rounded-[2px] bg-black" />
        </div>
      </div>
    )
  }

  if (type === 'canva') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-cyan-400 to-violet-600 text-xl font-semibold text-white">
        C
      </div>
    )
  }

  if (type === 'tiktok') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#091018] text-[22px] text-[#ff4fc8] shadow-[0_0_16px_rgba(70,190,255,.08)]">
        ♪
      </div>
    )
  }

  if (type === 'bag') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-[#2b264f] to-[#0f1428] text-[22px] text-amber-300">
        ◫
      </div>
    )
  }

  if (type === 'megaphone') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-[#5f2c95] to-[#1c1434] text-[22px] text-pink-300">
        📣
      </div>
    )
  }

  if (type === 'person') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-[#454f61] to-[#1d2536] text-[20px] text-white">
        ●
      </div>
    )
  }

  if (type === 'play') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-[#2a264f] to-[#0f1428] text-[22px] text-amber-300">
        ▶
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-gradient-to-br from-[#442069] to-[#1b1436] text-[20px] text-fuchsia-300">
        ▷
      </div>
    )
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/10 text-white">
      •
    </div>
  )
}

function WorkflowStepCard({
  n,
  title,
  desc,
}: {
  n: number
  title: string
  desc: string
}) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[inset_0_0_18px_rgba(255,255,255,.01)]">
      <div className="mb-2 flex items-center gap-3">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(180deg,#6a7cff_0%,#5657ff_100%)] text-[13px] font-semibold text-white shadow-[0_0_12px_rgba(100,94,255,.35)]">
          {n}
        </div>
        <div className="text-[16px] font-semibold text-white/92">{title}</div>
      </div>
      <div className="whitespace-pre-line pl-10 text-[14px] leading-[1.45] text-white/58">{desc}</div>
    </div>
  )
}

function ChainPill({
  icon,
  label,
}: {
  icon: string
  label: string
}) {
  return (
    <div className="inline-flex h-[48px] min-w-[180px] items-center gap-3 rounded-[12px] border border-white/12 bg-[#071121] px-4 shadow-[inset_0_0_14px_rgba(255,255,255,.018)]">
      <ToolIcon type={icon} />
      <span className="text-[16px] font-medium text-white/88">{label}</span>
    </div>
  )
}

function SetupCard({
  n,
  title,
  desc,
  bestFor,
  icons,
}: {
  n: number
  title: string
  desc: string
  bestFor: string
  icons: readonly string[]
}) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-[#081124]/72 p-4 shadow-[inset_0_0_18px_rgba(65,120,255,.03)]">
      <div className="mb-3 flex items-center gap-2 text-[13px] text-white/86">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(180deg,#6a7cff_0%,#5657ff_100%)] text-[12px] font-semibold text-white">
          {n}
        </span>
        <span className="font-medium">{title}</span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <ToolIcon type={icons[0]} />
        <span className="text-lg text-amber-300">→</span>
        <ToolIcon type={icons[1]} />
        <span className="text-lg text-amber-300">→</span>
        <ToolIcon type={icons[2]} />
      </div>

      <p className="min-h-[72px] text-[14px] leading-[1.45] text-white/62">{desc}</p>

      <div className="mt-3 text-[14px]">
        <span className="font-medium text-violet-400">Best for:</span>
        <span className="ml-2 text-white/64">{bestFor}</span>
      </div>
    </div>
  )
}

function WorkflowTable() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10 bg-[#07101f]">
      <div className="grid grid-cols-[1.15fr_1.1fr_1fr_1.25fr] border-b border-white/10 bg-white/[0.02] text-[13px] font-medium text-white/55">
        <div className="px-4 py-3">Step</div>
        <div className="border-l border-white/10 px-4 py-3">Goal</div>
        <div className="border-l border-white/10 px-4 py-3">Tool</div>
        <div className="border-l border-white/10 px-4 py-3">Output</div>
      </div>

      {workflowRows.map((row, idx) => (
        <div
          key={row.step}
          className={`grid grid-cols-[1.15fr_1.1fr_1fr_1.25fr] text-[14px] ${
            idx !== workflowRows.length - 1 ? 'border-b border-white/10' : ''
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-violet-400/55 bg-violet-500/10 text-[13px] font-semibold text-violet-300">
              {row.step}
            </span>
            <span className="font-medium text-white/86">{row.stepTitle}</span>
          </div>

          <div className="whitespace-pre-line border-l border-white/10 px-4 py-4 leading-[1.45] text-white/60">
            {row.goal}
          </div>

          <div className="border-l border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <ToolIcon type={row.toolIcon} />
              <span className="text-white/82">{row.tool}</span>
            </div>
          </div>

          <div className="whitespace-pre-line border-l border-white/10 px-4 py-4 leading-[1.45] text-white/60">
            {row.output}
          </div>
        </div>
      ))}
    </div>
  )
}

function TipIcon({ type }: { type: string }) {
  if (type === 'chat') {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-gradient-to-br from-violet-700 to-violet-500 text-[24px] text-white shadow-[0_0_14px_rgba(153,92,255,.2)]">
        💬
      </div>
    )
  }

  if (type === 'phone') {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-gradient-to-br from-blue-700 to-sky-500 text-[24px] text-white shadow-[0_0_14px_rgba(74,153,255,.2)]">
        📱
      </div>
    )
  }

  return (
    <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-gradient-to-br from-teal-700 to-emerald-500 text-[24px] text-white shadow-[0_0_14px_rgba(70,210,180,.2)]">
      🖼
    </div>
  )
}

function TipCard({
  icon,
  title,
  desc,
  pill,
  tone,
}: {
  icon: string
  title: string
  desc: string
  pill: string
  tone: 'amber' | 'cyan' | 'green'
}) {
  const pillClass =
    tone === 'amber'
      ? 'border-amber-500/35 bg-amber-500/10 text-amber-300'
      : tone === 'cyan'
      ? 'border-sky-500/35 bg-sky-500/10 text-sky-300'
      : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'

  return (
    <div className="rounded-[14px] border border-white/10 bg-[#081124]/72 p-4 shadow-[inset_0_0_18px_rgba(65,120,255,.03)]">
      <div className="grid grid-cols-[56px_1fr] gap-4">
        <TipIcon type={icon} />
        <div>
          <h3 className="text-[16px] font-semibold leading-[1.25] text-white/92">{title}</h3>
          <p className="mt-2 text-[14px] leading-[1.45] text-white/60">{desc}</p>
          <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[13px] ${pillClass}`}>
            {pill}
          </span>
        </div>
      </div>
    </div>
  )
}

function BottomEarthGlow() {
  return (
    <div className="pointer-events-none absolute bottom-[-126px] left-1/2 z-0 h-[250px] w-[1250px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(114,94,255,.38)_0%,rgba(74,144,255,.20)_34%,rgba(40,73,140,.12)_48%,transparent_66%)] blur-[1.5px]">
      <div className="absolute inset-x-[12%] bottom-[80px] h-[2px] rounded-full bg-[linear-gradient(90deg,rgba(95,142,255,0)_0%,rgba(117,161,255,.78)_18%,rgba(185,110,255,.82)_50%,rgba(115,164,255,.72)_82%,rgba(95,142,255,0)_100%)] shadow-[0_0_18px_rgba(116,150,255,.55)]" />
    </div>
  )
}

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020611] text-white [font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Arial,sans-serif]">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(86,85,255,.14),transparent_18%),radial-gradient(circle_at_74%_20%,rgba(198,74,255,.09),transparent_8%),radial-gradient(circle_at_18%_34%,rgba(70,163,255,.05),transparent_18%),linear-gradient(180deg,#020410_0%,#050917_55%,#030611_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(255,255,255,.66)_0_1px,transparent_1.5px),radial-gradient(circle,rgba(106,174,255,.36)_0_1px,transparent_1.6px),radial-gradient(circle,rgba(187,106,255,.24)_0_1px,transparent_1.6px)] [background-position:8px_10px,34px_52px,12px_18px] [background-size:80px_80px,120px_120px,150px_150px]" />

      <BottomEarthGlow />

      <div className="relative z-10 mx-auto max-w-[1080px] px-8 pb-8 pt-4 max-[760px]:px-4">
        {/* header */}
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandStar className="h-[31px] w-[31px] drop-shadow-[0_0_10px_rgba(132,84,255,.45)]" />
            <div className="text-[18px] font-semibold tracking-[-0.025em] text-white/92">
              AI Tool Decision Assistant
            </div>
          </div>

          <button className="h-[40px] rounded-[12px] border border-white/16 bg-white/[0.02] px-5 text-[14px] font-medium text-white/82">
            Log in
          </button>
        </header>

        {/* top */}
        <section className="grid grid-cols-[1fr_330px] gap-6 max-[980px]:grid-cols-1">
          <div>
            <button className="mb-7 inline-flex items-center gap-2 text-[15px] text-sky-400">
              <span className="text-lg">←</span>
              Back to search
            </button>

            <div className="grid grid-cols-[178px_1fr] gap-8 max-[760px]:grid-cols-1">
              <div className="pt-1">
                <CapcutLogo />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[58px] font-semibold leading-none tracking-[-0.055em] text-white max-[760px]:text-[46px]">
                    CapCut
                  </h1>
                  <span className="mt-1 grid h-[30px] w-[30px] place-items-center rounded-full bg-[#2e8cff] text-[18px] text-white shadow-[0_0_18px_rgba(46,140,255,.42)]">
                    ✓
                  </span>
                </div>

                <p className="mt-3 text-[17px] leading-[1.4] text-white/70">
                  Fast short-video editing for creators and marketers.
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  {topTags.map((tag) => (
                    <Tag key={tag.label} {...tag} />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton primary>Open official website ↗</ActionButton>
                  <ActionButton>🔗&nbsp;&nbsp;Copy link</ActionButton>
                  <ActionButton>🔖&nbsp;&nbsp;Save tool</ActionButton>
                </div>
              </div>
            </div>

            <GlassCard className="mt-5 p-5">
              <div className="mb-3 flex items-center gap-2 text-[15px] text-white/72">
                <span className="text-violet-400">✦</span>
                Decision Summary
              </div>

              <div className="max-w-[730px] text-[21px] leading-[1.5] tracking-[-0.025em] text-white/92">
                Use CapCut when you already have clips and need fast editing, captions,
                templates, and export.
              </div>

              <div className="mt-3 max-w-[730px] text-[21px] leading-[1.5] tracking-[-0.025em] text-violet-400">
                Do not start here if you still need a hook, script, or product angle.
              </div>
            </GlassCard>
          </div>

          <AtAGlanceCard />
        </section>

        {/* tabs */}
        <div className="mt-4 overflow-hidden rounded-[16px] border border-white/12 bg-white/[0.018]">
          <div className="flex flex-wrap items-center">
            {tabs.map((tab) => {
              const active = !!tab.active

              return (
                <button
                  key={tab.label}
                  className={`relative flex h-[54px] min-w-[170px] flex-1 items-center justify-center gap-3 px-4 text-[14px] ${
                    active ? 'text-white' : 'text-white/56'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-y-[6px] left-[12px] right-[12px] rounded-[12px] border border-violet-400/25 bg-[linear-gradient(180deg,rgba(91,76,255,.14),rgba(60,123,255,.06))] shadow-[0_0_18px_rgba(120,82,255,.16),inset_0_0_14px_rgba(255,255,255,.03)]" />
                  )}
                  <span className={`relative z-10 ${active ? 'text-sky-400' : 'text-white/38'}`}>
                    {tab.icon}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-[26px] right-[26px] z-10 h-[3px] rounded-full bg-[linear-gradient(90deg,#4CA7FF,#5E6EFF,#B44EFF)]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* content */}
        <GlassCard className="mt-4 p-5">
          {/* role in workflow */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[22px] text-violet-400">✦</span>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
                Role in Workflow
              </h2>
            </div>

            <div className="grid grid-cols-[1fr_56px_1fr_56px_1fr] items-center gap-2 max-[980px]:grid-cols-1">
              <WorkflowStepCard {...workflowSteps[0]} />
              <div className="grid place-items-center text-[32px] text-white/72 max-[980px]:hidden">→</div>
              <WorkflowStepCard {...workflowSteps[1]} />
              <div className="grid place-items-center text-[32px] text-white/72 max-[980px]:hidden">→</div>
              <WorkflowStepCard {...workflowSteps[2]} />
            </div>

            <div className="mt-5 grid grid-cols-[110px_1fr] items-center gap-4 max-[980px]:grid-cols-1">
              <div className="text-[16px] font-medium text-white/76">Tool chain</div>
              <div className="flex flex-wrap items-center gap-3">
                <ChainPill icon="openai" label="ChatGPT / Claude" />
                <span className="text-[28px] text-white/72">→</span>
                <ChainPill icon="capcut" label="CapCut" />
                <span className="text-[28px] text-white/72">→</span>
                <ChainPill icon="canva" label="Canva" />
              </div>
            </div>
          </div>

          {/* best setups */}
          <div className="border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[22px] text-violet-400">✦</span>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
                Best Setups Including CapCut
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[760px]:grid-cols-1">
              {bestSetups.map((card) => (
                <SetupCard key={card.title} {...card} />
              ))}
            </div>
          </div>

          {/* workflow table */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[22px] text-violet-400">✦</span>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
                How CapCut fits into a real workflow
              </h2>
            </div>

            <WorkflowTable />
          </div>

          {/* tips */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[22px] text-violet-400">✦</span>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
                Workflow tips
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
              {tips.map((tip) => (
                <TipCard key={tip.title} {...tip} />
              ))}
            </div>
          </div>
        </GlassCard>

        {/* footer */}
        <footer className="relative z-10 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[14px] text-white/42">
            <div className="flex flex-wrap items-center gap-6">
              <span>About</span>
              <span>How it works</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
            <div>© 2025 AI Tool Decision Assistant. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </main>
  )
}