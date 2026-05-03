import React from "react";

type Tone = "violet" | "green" | "amber" | "blue";

const topTags: Array<{ icon: string; label: string; tone: Tone; wide?: boolean }> = [
  { icon: "▣", label: "Video editing", tone: "violet" },
  { icon: "$", label: "Free / Paid", tone: "green" },
  { icon: "★", label: "Beginner", tone: "amber" },
  { icon: "▣", label: "Web · iOS · Android · Desktop", tone: "blue", wide: true },
];

const tabs = [
  { icon: "◴", label: "Overview" },
  { icon: "☑", label: "Best-fit Tasks" },
  { icon: "⚯", label: "Workflow & Setups" },
  { icon: "⇄", label: "Alternatives", active: true },
  { icon: "ⓘ", label: "Practical Details" },
];

const altCards = [
  {
    brand: "runway",
    title: "Runway /\nKling",
    desc: "Best when you need AI video generation, cinematic effects, or stronger motion control.",
    betterFor: "AI video generation, VFX, complex motion, and cinematic output.",
    link: "Explore Runway / Kling",
  },
  {
    brand: "invideo",
    title: "InVideo",
    desc: "Best when you want fast marketing videos with templates and brand kits.",
    betterFor: "Marketing videos, business content, templates at scale, and brand consistency.",
    link: "Explore InVideo",
  },
  {
    brand: "heygen",
    title: "HeyGen",
    desc: "Best when you need talking avatars or AI presenters.",
    betterFor: "Avatar videos, AI presenters, explainer videos, and multilingual content.",
    link: "Explore HeyGen",
  },
  {
    brand: "premiere",
    title: "DaVinci Resolve /\nPremiere Pro",
    desc: "Best when you need advanced color, audio, and professional workflows.",
    betterFor: "Cinematic editing, color grading, audio mixing, and long-form projects.",
    link: "Explore DaVinci / Premiere",
  },
] as const;

const stayItems = [
  "You already have footage or clips.",
  "You need fast editing and quick turnaround.",
  "You need easy auto-captions and templates.",
  "You're creating short-form content (9:16, 1:1, 16:9).",
  "You want an easy, all-in-one editing solution.",
];

const switchItems = [
  "You need text-to-video or AI video generation.",
  "You need AI avatars or talking presenters.",
  "You need advanced cinematic or color workflows.",
  "You want platform-powered template automation.",
  "You need an all-in-one workflow from idea to video.",
];

const categories = [
  {
    icon: "✦",
    title: "AI generation",
    desc: "Create videos from text, images, or prompts using AI.",
    chips: ["Runway", "Kling", "Pika"],
    tone: "violet",
  },
  {
    icon: "●",
    title: "Avatar video",
    desc: "Use AI avatars and presenters for talking-head or explainer videos.",
    chips: ["HeyGen", "Synthesia", "D-ID"],
    tone: "blue",
  },
  {
    icon: "▣",
    title: "Pro editing",
    desc: "Advanced editing, color, audio, and professional workflows.",
    chips: ["DaVinci Resolve", "Premiere Pro", "Final Cut Pro"],
    tone: "violet",
  },
] as const;

function BrandStar({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="alt-v2-brand-star" x1="7" y1="7" x2="57" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#57DAFF" />
          <stop offset="0.5" stopColor="#6F61FF" />
          <stop offset="1" stopColor="#C84CFF" />
        </linearGradient>
      </defs>
      <path d="M32 2L39.4 24.6L62 32L39.4 39.4L32 62L24.6 39.4L2 32L24.6 24.6L32 2Z" fill="url(#alt-v2-brand-star)" />
      <path d="M32 16.8L35.9 28.1L47.2 32L35.9 35.9L32 47.2L28.1 35.9L16.8 32L28.1 28.1L32 16.8Z" fill="white" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[18px] border border-[#2f74ff]/35 bg-[linear-gradient(180deg,rgba(5,13,34,.84),rgba(3,9,25,.93))] shadow-[0_0_28px_rgba(54,129,255,.14),0_0_34px_rgba(184,76,255,.08),inset_0_0_32px_rgba(72,124,255,.05)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_0_0_1px_rgba(190,78,255,.12)] ${className}`}
    >
      {children}
    </section>
  );
}

function CapcutLogo() {
  return (
    <div className="relative grid h-[145px] w-[145px] place-items-center rounded-[24px] border border-white/8 bg-white shadow-[0_0_30px_rgba(86,160,255,.44),0_0_18px_rgba(72,143,255,.24)]">
      <div className="relative h-[78px] w-[98px]">
        <div className="absolute left-[6px] top-[11px] h-[14px] w-[86px] -skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[6px] top-[53px] h-[14px] w-[86px] skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[2px] top-[12px] h-[14px] w-[98px] -rotate-[34deg] rounded-[3px] bg-black" />
        <div className="absolute left-[2px] top-[52px] h-[14px] w-[98px] rotate-[34deg] rounded-[3px] bg-black" />
      </div>
    </div>
  );
}

function Tag({ icon, label, tone, wide }: { icon: string; label: string; tone: Tone; wide?: boolean }) {
  const iconColor = {
    violet: "text-violet-400",
    green: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-sky-400",
  }[tone];

  return (
    <span
      className={`inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-white/14 bg-white/[0.02] px-3 text-[14px] text-white/78 shadow-[inset_0_0_14px_rgba(255,255,255,.02)] ${wide ? "min-w-[250px]" : ""}`}
    >
      <span className={`${iconColor} text-[14px]`}>{icon}</span>
      {label}
    </span>
  );
}

function ActionButton({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  return primary ? (
    <button className="inline-flex h-[48px] min-w-[236px] items-center justify-center rounded-[12px] bg-[linear-gradient(90deg,#3D8BFF_0%,#C24DFF_100%)] px-6 text-[15px] font-medium text-white shadow-[0_0_24px_rgba(97,88,255,.22),inset_0_0_16px_rgba(255,255,255,.15)]">
      {children}
    </button>
  ) : (
    <button className="inline-flex h-[48px] min-w-[160px] items-center justify-center rounded-[12px] border border-white/14 bg-white/[0.02] px-6 text-[15px] font-medium text-white/84 shadow-[inset_0_0_14px_rgba(255,255,255,.02)]">
      {children}
    </button>
  );
}

function AtAGlanceCard() {
  const items = [
    ["▣", "Best for", "Short-form video editing, captions, templates, effects, and quick exports."],
    ["⚙", "Workflow position", "Editing & post-production"],
    ["▣", "Works best with", "ChatGPT / Claude → CapCut → Canva"],
    ["⇄", "Alternatives", "Runway / Kling, InVideo, HeyGen, DaVinci Resolve / Premiere Pro"],
  ];

  return (
    <GlassCard className="p-5 ring-1 ring-violet-500/32 shadow-[0_0_25px_rgba(168,78,255,.16),0_0_28px_rgba(54,129,255,.10),inset_0_0_32px_rgba(72,124,255,.05)]">
      <div className="mb-4 flex items-center gap-3">
        <BrandStar className="h-5 w-5" />
        <div className="text-[20px] font-semibold tracking-[-0.02em] text-white">At a glance</div>
      </div>

      <div className="border-t border-white/10">
        {items.map(([icon, title, body]) => (
          <div key={title} className="grid grid-cols-[20px_1fr] gap-3 border-b border-white/10 py-[12px]">
            <div className="pt-[2px] text-[16px] text-sky-400">{icon}</div>
            <div>
              <div className="mb-1 text-[15px] font-semibold text-white/90">{title}</div>
              <div className="text-[13px] leading-[1.46] text-white/58">{body}</div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-[20px_1fr] gap-3 border-b border-white/10 py-[12px]">
          <div className="pt-[2px] text-[16px] text-sky-400">◴</div>
          <div>
            <div className="mb-2 text-[15px] font-semibold text-white/90">Learning curve</div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={`h-3 w-3 rounded-full ${i < 3 ? "bg-sky-400" : "bg-violet-500"}`} />
                ))}
              </div>
              <span className="text-[13px] text-white/64">Easy</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[20px_1fr] gap-3 pt-[12px]">
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

function BrandBadge({ brand }: { brand: string }) {
  if (brand === "runway") {
    return <div className="grid h-[54px] w-[54px] place-items-center rounded-[12px] bg-[#061610] text-[34px] font-black text-[#10d46a] shadow-[0_0_18px_rgba(16,212,106,.16)]">R</div>;
  }
  if (brand === "invideo") {
    return <div className="grid h-[54px] w-[54px] place-items-center rounded-[12px] bg-[radial-gradient(circle_at_30%_30%,#4bd7ff,#2b6cff_62%,#5d37ff)] text-[28px] font-bold text-white shadow-[0_0_18px_rgba(70,145,255,.16)]">▶</div>;
  }
  if (brand === "heygen") {
    return <div className="grid h-[54px] w-[54px] place-items-center rounded-[12px] bg-[radial-gradient(circle_at_30%_30%,#4f8bff,#7b56ff_55%,#3857ff_100%)] text-[24px] font-bold text-white shadow-[0_0_18px_rgba(113,96,255,.16)]">◌</div>;
  }
  return <div className="grid h-[54px] w-[54px] place-items-center rounded-[12px] bg-[#17184b] text-[28px] font-bold text-[#7a86ff] shadow-[0_0_18px_rgba(113,96,255,.14)]">Pr</div>;
}

function AlternativeCard({ brand, title, desc, betterFor, link }: (typeof altCards)[number]) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-[#081124]/72 p-4 shadow-[inset_0_0_18px_rgba(65,120,255,.03)]">
      <div className="grid grid-cols-[58px_1fr] gap-3.5">
        <BrandBadge brand={brand} />
        <div>
          <h3 className="whitespace-pre-line text-[18px] font-semibold leading-[1.2] tracking-[-0.03em] text-white">{title}</h3>
          <p className="mt-3 min-h-[72px] text-[14px] leading-[1.46] text-white/62">{desc}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3.5">
        <div className="mb-1.5 text-[14px] font-medium text-emerald-400">Better for</div>
        <p className="min-h-[68px] text-[14px] leading-[1.45] text-white/64">{betterFor}</p>
        <button className="mt-3 text-[14px] font-medium text-violet-400 hover:text-violet-300">{link} →</button>
      </div>
    </div>
  );
}

function CheckItem({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[12px] font-bold ${danger ? "border-red-500/75 text-red-500" : "border-emerald-400/75 text-emerald-400"}`}>{danger ? "×" : "✓"}</span>
      <span className="text-[14.5px] leading-[1.42] text-white/72">{text}</span>
    </div>
  );
}

function CategoryCard({ icon, title, desc, chips, tone }: (typeof categories)[number]) {
  const iconColor = tone === "blue" ? "text-sky-400" : "text-violet-400";
  return (
    <div className="rounded-[14px] border border-white/10 bg-[#081124]/72 p-4 shadow-[inset_0_0_18px_rgba(65,120,255,.03)]">
      <div className="mb-2 flex items-center gap-3">
        <span className={`text-[24px] ${iconColor}`}>{icon}</span>
        <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">{title}</h3>
      </div>
      <p className="min-h-[52px] text-[14px] leading-[1.48] text-white/62">{desc}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip} className="inline-flex rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/72">{chip}</span>
        ))}
      </div>
    </div>
  );
}

function DecisionPlanet() {
  return (
    <div className="relative h-[94px] w-[240px] overflow-hidden">
      <div className="absolute bottom-[12px] right-[42px] h-[72px] w-[72px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#b490ff_0%,#7d52ff_45%,#39217c_100%)] shadow-[0_0_26px_rgba(128,96,255,.38)]" />
      <div className="absolute bottom-[35px] right-[12px] h-[30px] w-[150px] -rotate-[8deg] rounded-[999px] border border-violet-400/42 bg-[linear-gradient(90deg,rgba(118,180,255,.04),rgba(173,92,255,.14),rgba(118,180,255,.04))] shadow-[0_0_22px_rgba(147,95,255,.22)]" />
      <div className="absolute bottom-[0px] left-0 right-0 h-[2px] rounded-full bg-[linear-gradient(90deg,rgba(77,140,255,0)_0%,rgba(107,166,255,.7)_18%,rgba(188,115,255,.8)_50%,rgba(120,166,255,.68)_82%,rgba(77,140,255,0)_100%)] shadow-[0_0_18px_rgba(116,150,255,.55)]" />
      <div className="absolute bottom-[0px] left-[20px] right-[20px] h-[70px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(112,88,255,.14),rgba(80,130,255,0)_70%)]" />
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

export default function AlternativesPageV2() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020611] text-white [font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Arial,sans-serif]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(86,85,255,.14),transparent_18%),radial-gradient(circle_at_74%_20%,rgba(198,74,255,.09),transparent_8%),radial-gradient(circle_at_18%_34%,rgba(70,163,255,.05),transparent_18%),linear-gradient(180deg,#020410_0%,#050917_55%,#030611_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(255,255,255,.66)_0_1px,transparent_1.5px),radial-gradient(circle,rgba(106,174,255,.36)_0_1px,transparent_1.6px),radial-gradient(circle,rgba(187,106,255,.24)_0_1px,transparent_1.6px)] [background-position:8px_10px,34px_52px,12px_18px] [background-size:80px_80px,120px_120px,150px_150px]" />
      <BottomEarthGlow />

      <div className="relative z-10 mx-auto max-w-[1080px] px-8 pb-8 pt-4 max-[760px]:px-4">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandStar className="h-[31px] w-[31px] drop-shadow-[0_0_10px_rgba(132,84,255,.45)]" />
            <div className="text-[18px] font-semibold tracking-[-0.025em] text-white/92">AI Tool Decision Assistant</div>
          </div>
          <button className="h-[40px] rounded-[12px] border border-white/16 bg-white/[0.02] px-5 text-[14px] font-medium text-white/82">Log in</button>
        </header>

        <section className="grid grid-cols-[1fr_330px] gap-6 max-[980px]:grid-cols-1">
          <div>
            <button className="mb-7 inline-flex items-center gap-2 text-[15px] text-sky-400"><span className="text-lg">←</span>Back to search</button>
            <div className="grid grid-cols-[178px_1fr] gap-8 max-[760px]:grid-cols-1">
              <div className="pt-1"><CapcutLogo /></div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[58px] font-semibold leading-none tracking-[-0.055em] text-white max-[760px]:text-[46px]">CapCut</h1>
                  <span className="mt-1 grid h-[30px] w-[30px] place-items-center rounded-full bg-[#2e8cff] text-[18px] text-white shadow-[0_0_18px_rgba(46,140,255,.42)]">✓</span>
                </div>
                <p className="mt-3 text-[17px] leading-[1.4] text-white/70">Fast short-video editing for creators and marketers.</p>
                <div className="mt-4 flex flex-wrap gap-2.5">{topTags.map((tag) => <Tag key={tag.label} {...tag} />)}</div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton primary>Open official website ↗</ActionButton>
                  <ActionButton>🔗&nbsp;&nbsp;Copy link</ActionButton>
                  <ActionButton>▱&nbsp;&nbsp;Save tool</ActionButton>
                </div>
              </div>
            </div>

            <GlassCard className="mt-5 p-5">
              <div className="mb-3 flex items-center gap-2 text-[15px] text-white/72"><span className="text-violet-400">✦</span>Decision Summary</div>
              <div className="max-w-[730px] text-[21px] leading-[1.5] tracking-[-0.025em] text-white/92">Use CapCut when you already have clips and need fast editing, captions, templates, and export.</div>
              <div className="mt-3 max-w-[730px] text-[21px] leading-[1.5] tracking-[-0.025em] text-violet-400">Do not start here if you still need a hook, script, or product angle.</div>
            </GlassCard>
          </div>
          <AtAGlanceCard />
        </section>

        <div className="mt-4 overflow-hidden rounded-[16px] border border-white/12 bg-white/[0.018]">
          <div className="flex flex-wrap items-center">
            {tabs.map((tab) => {
              const active = !!tab.active;
              return (
                <button key={tab.label} className={`relative flex h-[54px] min-w-[170px] flex-1 items-center justify-center gap-3 px-4 text-[14px] ${active ? "text-white" : "text-white/56"}`}>
                  {active && <span className="absolute inset-y-[6px] left-[12px] right-[12px] rounded-[12px] border border-violet-400/25 bg-[linear-gradient(180deg,rgba(91,76,255,.14),rgba(60,123,255,.06))] shadow-[0_0_18px_rgba(120,82,255,.16),inset_0_0_14px_rgba(255,255,255,.03)]" />}
                  <span className={`relative z-10 ${active ? "text-sky-400" : "text-white/38"}`}>{tab.icon}</span>
                  <span className="relative z-10">{tab.label}</span>
                  {active && <span className="absolute bottom-0 left-[26px] right-[26px] z-10 h-[3px] rounded-full bg-[linear-gradient(90deg,#4CA7FF,#5E6EFF,#B44EFF)]" />}
                </button>
              );
            })}
          </div>
        </div>

        <GlassCard className="mt-4 p-5">
          <div>
            <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">✦</span><h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">Better Options If</h2></div>
            <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[760px]:grid-cols-1">
              {altCards.map((card) => <AlternativeCard key={card.title} {...card} />)}
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">⚖</span><h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">When to stay with CapCut vs switch</h2></div>
            <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
              <div className="rounded-[16px] border border-emerald-400/45 bg-[linear-gradient(180deg,rgba(5,24,22,.76),rgba(4,14,20,.85))] p-5 shadow-[inset_0_0_28px_rgba(16,185,129,.05)]">
                <div className="mb-4 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-emerald-400/70 text-emerald-400">✓</span><h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">Stay with CapCut when...</h3></div>
                <div className="space-y-2.5">{stayItems.map((item) => <CheckItem key={item} text={item} />)}</div>
              </div>

              <div className="rounded-[16px] border border-red-500/45 bg-[linear-gradient(180deg,rgba(25,8,14,.76),rgba(16,8,15,.85))] p-5 shadow-[inset_0_0_28px_rgba(239,68,68,.045)]">
                <div className="mb-4 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-red-500/70 text-red-500">×</span><h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">Switch when...</h3></div>
                <div className="space-y-2.5">{switchItems.map((item) => <CheckItem key={item} text={item} danger />)}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">⌘</span><h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">Alternative categories</h2></div>
            <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
              {categories.map((cat) => <CategoryCard key={cat.title} {...cat} />)}
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <GlassCard className="overflow-hidden px-5 py-4">
              <div className="grid grid-cols-[1fr_240px] items-end gap-4 max-[760px]:grid-cols-1">
                <div>
                  <div className="mb-3 flex items-center gap-3"><span className="text-[22px] text-violet-400">✦</span><h2 className="text-[22px] font-semibold tracking-[-0.03em] text-white">Decision note</h2></div>
                  <p className="max-w-[760px] text-[16px] leading-[1.55] text-white/72">CapCut is strongest when you already have footage and want fast execution, not when you need the entire creative workflow generated from scratch.</p>
                </div>
                <div className="justify-self-end max-[760px]:justify-self-start"><DecisionPlanet /></div>
              </div>
            </GlassCard>
          </div>
        </GlassCard>

        <footer className="relative z-10 mt-3 text-center">
          <div className="mb-1.5 flex flex-wrap items-center justify-center gap-6 text-[14px] text-white/42"><span>About</span><span>How it works</span><span>Privacy</span><span>Terms</span></div>
          <div className="text-[14px] text-white/34">Make better tool decisions. Save time. Get better results.</div>
          <div className="mt-1 text-[13px] text-white/30">© 2026 AI Tool Decision Assistant. All rights reserved.</div>
        </footer>
      </div>
    </main>
  );
}
