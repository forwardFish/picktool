import React from "react";

const tabs = [
  { icon: "◴", label: "Overview" },
  { icon: "☑", label: "Best-fit Tasks", active: true },
  { icon: "⚯", label: "Workflow & Setups" },
  { icon: "⇄", label: "Alternatives" },
  { icon: "ⓘ", label: "Practical Details" },
];

const topTags = [
  { icon: "▣", text: "Video editing", tone: "violet" },
  { icon: "$", text: "Free / Paid", tone: "green" },
  { icon: "★", text: "Beginner", tone: "amber" },
  { icon: "▣", text: "Web · iOS · Android · Desktop", tone: "blue", wide: true },
] as const;

const glanceItems = [
  {
    icon: "▣",
    title: "Best for",
    body: "Short-form video editing, captions, templates, effects, and quick exports.",
  },
  { icon: "⚙", title: "Workflow position", body: "Editing & post-production" },
  { icon: "▣", title: "Works best with", body: "ChatGPT / Claude → CapCut → Canva" },
  {
    icon: "⇄",
    title: "Alternatives",
    body: "Runway / Kling, InVideo, HeyGen, DaVinci Resolve / Premiere Pro",
  },
];

const taskCards = [
  {
    icon: "♪",
    title: "Create a TikTok\nproduct promo video",
    desc: "Use templates, text styles, and quick edits to turn product clips into scroll-stopping short-form videos.",
    bestFor: "Short-form promos",
    tone: "tiktok",
  },
  {
    icon: "◉",
    title: "Edit a talking-head\nshort video",
    desc: "Cut silences, add captions, B-roll, and background music for polished talking-head content.",
    bestFor: "Social ads & testing",
    tone: "slate",
  },
  {
    icon: "📣",
    title: "Turn product clips\ninto a social ad",
    desc: "Resize, add hooks, captions, CTA, and export multiple variants for A/B testing.",
    bestFor: "UGC & creator content",
    tone: "violet",
  },
  {
    icon: "▣",
    title: "Add captions &\ntranslate videos",
    desc: "Auto-generate captions, translate to other languages, and style subtitles to match your brand.",
    bestFor: "Repurposing content",
    tone: "violet",
  },
] as const;

const audiences = [
  {
    icon: "♟",
    title: "Creators",
    desc: "Make engaging short videos faster with templates, effects, and easy tools.",
    tone: "violet",
  },
  {
    icon: "▥",
    title: "Marketers",
    desc: "Create scroll-stopping ads and campaign assets in minutes, not hours.",
    tone: "green",
  },
  {
    icon: "●●",
    title: "Small teams",
    desc: "Collaborate, standardize brand style, and produce content at scale.",
    tone: "blue",
  },
] as const;

const strongFit = [
  "Short-form videos for TikTok, Reels, Shorts",
  "Mobile-first templates with quick turnaround",
  "Fast exports and social-ready formats",
  "Caption-heavy and multilingual content",
];

const weakFit = [
  "Cinematic long-form editing",
  "Advanced color grading and finishing",
  "Heavy multi-cam and complex timelines",
  "Full text-to-video generation",
];

function BrandStar({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="capcut-v3-star" x1="7" y1="7" x2="57" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#55D9FF" />
          <stop offset="0.5" stopColor="#6D61FF" />
          <stop offset="1" stopColor="#C84CFF" />
        </linearGradient>
      </defs>
      <path d="M32 2L39.4 24.6L62 32L39.4 39.4L32 62L24.6 39.4L2 32L24.6 24.6L32 2Z" fill="url(#capcut-v3-star)" />
      <path d="M32 16.8L35.9 28.1L47.2 32L35.9 35.9L32 47.2L28.1 35.9L16.8 32L28.1 28.1L32 16.8Z" fill="white" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[17px] border border-[#2d72ff]/35 bg-[linear-gradient(180deg,rgba(5,13,34,.82),rgba(3,9,25,.92))] shadow-[0_0_26px_rgba(54,129,255,.145),0_0_32px_rgba(184,76,255,.08),inset_0_0_32px_rgba(72,124,255,.055)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_0_0_1px_rgba(190,78,255,.13)] ${className}`}
    >
      {children}
    </section>
  );
}

function CapcutLogo() {
  return (
    <div className="relative grid h-[146px] w-[146px] place-items-center rounded-[24px] border border-white/10 bg-white shadow-[0_0_26px_rgba(79,156,255,.28)]">
      <div className="relative h-[78px] w-[98px]">
        <div className="absolute left-[6px] top-[10px] h-[15px] w-[86px] -skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[6px] top-[53px] h-[15px] w-[86px] skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[2px] top-[12px] h-[15px] w-[98px] -rotate-[34deg] rounded-[3px] bg-black" />
        <div className="absolute left-[2px] top-[52px] h-[15px] w-[98px] rotate-[34deg] rounded-[3px] bg-black" />
      </div>
    </div>
  );
}

function Tag({ icon, text, tone, wide }: { icon: string; text: string; tone: string; wide?: boolean }) {
  const color =
    tone === "green" ? "text-emerald-400" : tone === "amber" ? "text-amber-400" : tone === "blue" ? "text-sky-400" : "text-violet-400";

  return (
    <span className={`inline-flex h-[35px] items-center gap-2 rounded-[10px] border border-white/14 bg-white/[.02] px-3 text-[14px] text-white/78 shadow-[inset_0_0_14px_rgba(255,255,255,.018)] ${wide ? "min-w-[254px]" : ""}`}>
      <span className={`${color} text-[14px]`}>{icon}</span>
      {text}
    </span>
  );
}

function ActionButton({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      className={
        primary
          ? "inline-flex h-[48px] min-w-[232px] items-center justify-center rounded-[11px] bg-[linear-gradient(90deg,#3e8bff_0%,#ba48ff_100%)] px-6 text-[15px] font-medium text-white shadow-[0_0_22px_rgba(97,88,255,.18),inset_0_0_16px_rgba(255,255,255,.15)]"
          : "inline-flex h-[48px] min-w-[158px] items-center justify-center rounded-[11px] border border-white/14 bg-white/[.018] px-6 text-[15px] font-medium text-white/82 shadow-[inset_0_0_14px_rgba(255,255,255,.018)]"
      }
    >
      {children}
    </button>
  );
}

function AtAGlanceCard() {
  return (
    <GlassCard className="p-5 ring-1 ring-violet-500/35 shadow-[0_0_24px_rgba(165,78,255,.18),0_0_30px_rgba(54,129,255,.12),inset_0_0_32px_rgba(72,124,255,.055)]">
      <div className="mb-4 flex items-center gap-3">
        <BrandStar className="h-5 w-5" />
        <div className="text-[20px] font-semibold tracking-[-.02em]">At a glance</div>
      </div>

      <div className="border-t border-white/10">
        {glanceItems.map((item) => (
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
                  <span key={i} className={`h-3 w-3 rounded-full ${i < 2 ? "bg-sky-400" : "bg-violet-500"}`} />
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
  );
}

function TaskCard({ icon, title, desc, bestFor, tone }: (typeof taskCards)[number]) {
  const iconClass =
    tone === "tiktok"
      ? "bg-[#061016] text-[#ff4ec7] shadow-[0_0_14px_rgba(30,200,255,.12)]"
      : tone === "slate"
      ? "bg-gradient-to-br from-[#364258] to-[#1a2438] text-white"
      : "bg-gradient-to-br from-[#5b2e91] to-[#211437] text-violet-200";

  return (
    <article className="rounded-[12px] border border-white/10 bg-[#081124]/72 p-4 shadow-[inset_0_0_20px_rgba(65,120,255,.035)]">
      <div className="grid grid-cols-[72px_1fr] gap-3.5">
        <div className={`grid h-[62px] w-[62px] place-items-center rounded-[14px] border border-white/10 text-[30px] ${iconClass}`}>{icon}</div>
        <div>
          <h3 className="whitespace-pre-line text-[19px] font-semibold leading-[1.16] tracking-[-.03em]">{title}</h3>
          <p className="mt-3 text-[14px] leading-[1.43] text-white/60">{desc}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-white/10 pt-2.5">
        <div className="text-[13px] text-white/42">Best for: <span className="ml-2 text-white/60">{bestFor}</span></div>
        <button className="mt-1.5 text-[14px] font-medium text-sky-400">View setup →</button>
      </div>
    </article>
  );
}

function AudienceCard({ icon, title, desc, tone }: (typeof audiences)[number]) {
  const color = tone === "green" ? "text-emerald-400" : tone === "blue" ? "text-sky-400" : "text-violet-400";
  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[.018] px-5 py-4">
      <div className="mb-2.5 flex items-center gap-3">
        <span className={`text-[28px] ${color}`}>{icon}</span>
        <span className="text-[16px] font-semibold text-white/90">{title}</span>
      </div>
      <p className="text-[13px] leading-[1.48] text-white/58">{desc}</p>
    </div>
  );
}

function CheckItem({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[12px] font-bold ${danger ? "border-red-500/75 text-red-500" : "border-emerald-400/75 text-emerald-400"}`}>
        {danger ? "×" : "✓"}
      </span>
      <span className="text-[14px] leading-[1.42] text-white/70">{text}</span>
    </div>
  );
}

function BottomEarthGlow() {
  return (
    <div className="pointer-events-none absolute bottom-[-126px] left-1/2 z-0 h-[250px] w-[1250px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(114,94,255,.38)_0%,rgba(74,144,255,.20)_34%,rgba(40,73,140,.12)_48%,transparent_66%)] blur-[1.5px]">
      <div className="absolute inset-x-[12%] bottom-[80px] h-[2px] rounded-full bg-[linear-gradient(90deg,rgba(95,142,255,0)_0%,rgba(117,161,255,.78)_18%,rgba(185,110,255,.82)_50%,rgba(115,164,255,.72)_82%,rgba(95,142,255,0)_100%)] shadow-[0_0_18px_rgba(116,150,255,.55)]" />
    </div>
  );
}

export default function CapcutBestFitDetailV3() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020611] text-white [font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Arial,sans-serif]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(86,85,255,.14),transparent_18%),radial-gradient(circle_at_74%_20%,rgba(198,74,255,.09),transparent_8%),radial-gradient(circle_at_18%_34%,rgba(70,163,255,.05),transparent_18%),linear-gradient(180deg,#020410_0%,#050917_55%,#030611_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(255,255,255,.66)_0_1px,transparent_1.5px),radial-gradient(circle,rgba(106,174,255,.36)_0_1px,transparent_1.6px),radial-gradient(circle,rgba(187,106,255,.24)_0_1px,transparent_1.6px)] [background-position:8px_10px,34px_52px,12px_18px] [background-size:80px_80px,120px_120px,150px_150px]" />
      <BottomEarthGlow />

      <div className="relative z-10 mx-auto max-w-[1080px] px-8 pb-8 pt-4 max-[760px]:px-4">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandStar className="h-[31px] w-[31px] drop-shadow-[0_0_10px_rgba(132,84,255,.45)]" />
            <div className="text-[18px] font-semibold tracking-[-.025em] text-white/92">AI Tool Decision Assistant</div>
          </div>
          <button className="h-[40px] rounded-[12px] border border-white/16 bg-white/[.02] px-5 text-[14px] font-medium text-white/82">Log in</button>
        </header>

        <section className="grid grid-cols-[1fr_330px] gap-6 max-[980px]:grid-cols-1">
          <div>
            <button className="mb-7 inline-flex items-center gap-2 text-[15px] text-sky-400"><span className="text-lg">←</span>Back to search</button>

            <div className="grid grid-cols-[178px_1fr] gap-8 max-[760px]:grid-cols-1">
              <div className="pt-1"><CapcutLogo /></div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[58px] font-semibold leading-none tracking-[-.055em] max-[760px]:text-[46px]">CapCut</h1>
                  <span className="mt-1 grid h-[30px] w-[30px] place-items-center rounded-full bg-[#2e8cff] text-[18px] shadow-[0_0_18px_rgba(46,140,255,.42)]">✓</span>
                </div>
                <p className="mt-3 text-[17px] leading-[1.4] text-white/70">Fast short-video editing for creators and marketers.</p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  {topTags.map((tag) => <Tag key={tag.text} {...tag} />)}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton primary>Open official website ↗</ActionButton>
                  <ActionButton>🔗&nbsp;&nbsp;Copy link</ActionButton>
                  <ActionButton>▱&nbsp;&nbsp;Save tool</ActionButton>
                </div>
              </div>
            </div>

            <GlassCard className="mt-5 p-5">
              <div className="mb-3 flex items-center gap-2 text-[15px] text-white/72"><span className="text-violet-400">✦</span>Decision Summary</div>
              <div className="max-w-[730px] text-[21px] leading-[1.5] tracking-[-.025em] text-white/92">Use CapCut when you already have clips and need fast editing, captions, templates, and export.</div>
              <div className="mt-3 max-w-[730px] text-[21px] leading-[1.5] tracking-[-.025em] text-violet-400">Do not start here if you still need a hook, script, or product angle.</div>
            </GlassCard>
          </div>

          <AtAGlanceCard />
        </section>

        <nav className="mt-4 overflow-hidden rounded-[16px] border border-white/12 bg-white/[.018]">
          <div className="flex flex-wrap items-center">
            {tabs.map((tab) => (
              <button key={tab.label} className={`relative flex h-[54px] min-w-[170px] flex-1 items-center justify-center gap-3 px-4 text-[14px] ${tab.active ? "text-white" : "text-white/56"}`}>
                <span className={tab.active ? "text-sky-400" : "text-white/38"}>{tab.icon}</span>
                {tab.label}
                {tab.active && <span className="absolute bottom-0 left-[26px] right-[26px] h-[3px] rounded-full bg-[linear-gradient(90deg,#4ca7ff,#5e6eff,#b44eff)]" />}
              </button>
            ))}
          </div>
        </nav>

        <GlassCard className="mt-4 p-5">
          <div className="mb-5">
            <div className="flex items-center gap-3"><span className="text-[22px] text-violet-400">✦</span><h2 className="text-[24px] font-semibold tracking-[-.03em]">Best-fit Tasks</h2></div>
            <p className="mt-2 pl-9 text-[16px] text-white/58">What CapCut does best and how to use it.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
            {taskCards.map((task) => <TaskCard key={task.title} {...task} />)}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">♟</span><h3 className="text-[22px] font-semibold tracking-[-.025em]">Who CapCut is best for</h3></div>
            <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
              {audiences.map((item) => <AudienceCard key={item.title} {...item} />)}
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">✦</span><h3 className="text-[22px] font-semibold tracking-[-.025em]">Task fit notes</h3></div>
            <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
              <div className="rounded-[16px] border border-emerald-400/45 bg-[linear-gradient(180deg,rgba(5,24,22,.76),rgba(4,14,20,.85))] p-5 shadow-[inset_0_0_28px_rgba(16,185,129,.05)]">
                <div className="mb-3 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-emerald-400/70 text-emerald-400">✓</span><h4 className="text-[18px] font-semibold tracking-[-.02em]">Strong fit</h4></div>
                <div className="space-y-2.5">{strongFit.map((item) => <CheckItem key={item} text={item} />)}</div>
              </div>

              <div className="rounded-[16px] border border-red-500/45 bg-[linear-gradient(180deg,rgba(25,8,14,.76),rgba(16,8,15,.85))] p-5 shadow-[inset_0_0_28px_rgba(239,68,68,.045)]">
                <div className="mb-3 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-red-500/70 text-red-500">×</span><h4 className="text-[18px] font-semibold tracking-[-.02em]">Weaker fit</h4></div>
                <div className="space-y-2.5">{weakFit.map((item) => <CheckItem key={item} text={item} danger />)}</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <footer className="relative z-10 mt-6 text-center">
          <div className="text-[14px] text-white/45">Make better tool decisions. Save time. Get better results.</div>
          <div className="mt-1 text-[13px] text-white/35">© 2026 AI Tool Decision Assistant · All rights reserved.</div>
        </footer>
      </div>
    </main>
  );
}
