import React from "react";

const useItems = [
  "You already have raw footage or clips.",
  "You need fast edits, captions, and templates.",
  "You're creating short-form content (9:16, 1:1, 16:9).",
  "You want an easy, all-in-one editing solution.",
  "You need quick exports optimized for social platforms.",
];

const avoidItems = [
  "You still need a hook, script, or product angle.",
  "You need AI video generation from text only.",
  "You need advanced cinematic or color workflows.",
  "You want complex multi-cam or long-form editing.",
  "You need deep motion graphics or VFX compositing.",
];

const takeaways = [
  ["⚡", "CapCut shines when you have footage and need speed."],
  ["▦", "It's built for short-form platforms (TikTok, Reels, Shorts)."],
  ["🪄", "Use AI for planning and assets, CapCut for editing, Canva for thumbnails and graphics."],
  ["△", "Not the first step if you still need a hook, script, or product angle."],
];

const tabs = [
  ["◉", "Overview"],
  ["☑", "Best-fit Tasks"],
  ["⚯", "Workflow & Setups"],
  ["⇄", "Alternatives"],
  ["ⓘ", "Practical Details"],
];

function StarLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="starLogoGradientV2" x1="7" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#57D9FF" />
          <stop offset="0.46" stopColor="#705EFF" />
          <stop offset="1" stopColor="#C74CFF" />
        </linearGradient>
      </defs>
      <path d="M32 2L39.3 24.7L62 32L39.3 39.3L32 62L24.7 39.3L2 32L24.7 24.7L32 2Z" fill="url(#starLogoGradientV2)" />
      <path d="M32 16.8L35.8 28.2L47.2 32L35.8 35.8L32 47.2L28.2 35.8L16.8 32L28.2 28.2L32 16.8Z" fill="white" />
    </svg>
  );
}

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[18px] border border-[#3277ff]/40 bg-[linear-gradient(180deg,rgba(5,13,34,.82),rgba(3,9,25,.9))] shadow-[0_0_28px_rgba(57,135,255,.14),inset_0_0_34px_rgba(81,126,255,.055)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_0_0_1px_rgba(184,70,255,.14)] ${className}`}
    >
      {children}
    </section>
  );
}

function CapCutLogo() {
  return (
    <div className="relative grid h-[154px] w-[154px] place-items-center rounded-[24px] bg-white shadow-[0_0_30px_rgba(75,155,255,.38),inset_0_0_0_1px_rgba(0,0,0,.05)]">
      <div className="relative h-[84px] w-[104px]">
        <div className="absolute left-[6px] top-[11px] h-[16px] w-[94px] -skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[6px] top-[58px] h-[16px] w-[94px] skew-y-[24deg] rounded-[3px] bg-black" />
        <div className="absolute left-[3px] top-[14px] h-[15px] w-[104px] -rotate-[34deg] rounded-[3px] bg-black" />
        <div className="absolute left-[3px] top-[54px] h-[15px] w-[104px] rotate-[34deg] rounded-[3px] bg-black" />
      </div>
    </div>
  );
}

function Tag({ icon, text, color = "violet" }: { icon: string; text: string; color?: "violet" | "green" | "amber" | "blue" }) {
  const iconColor = {
    violet: "text-violet-400",
    green: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-sky-400",
  }[color];
  return (
    <span className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-white/15 bg-white/[.025] px-3.5 text-[14px] text-white/80 shadow-[inset_0_0_14px_rgba(255,255,255,.025)]">
      <span className={`${iconColor} text-[15px]`}>{icon}</span>
      {text}
    </span>
  );
}

function ActionButton({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      className={
        primary
          ? "h-[52px] min-w-[246px] rounded-[12px] bg-[linear-gradient(90deg,#3b8dff_0%,#b948ff_100%)] px-7 text-[16px] font-medium text-white shadow-[0_0_24px_rgba(101,90,255,.20),inset_0_0_18px_rgba(255,255,255,.14)]"
          : "h-[52px] min-w-[168px] rounded-[12px] border border-white/16 bg-white/[.018] px-6 text-[15px] font-semibold text-white/86 shadow-[inset_0_0_16px_rgba(255,255,255,.018)]"
      }
    >
      {children}
    </button>
  );
}

function AtAGlance() {
  return (
    <Glass className="h-fit p-[22px]">
      <div className="mb-[18px] flex items-center gap-3">
        <StarLogo className="h-[25px] w-[25px]" />
        <h2 className="text-[20px] font-semibold tracking-[-.025em]">At a glance</h2>
      </div>
      <div className="border-t border-white/10">
        {[
          ["▣", "Best for", "Short-form video editing, captions, templates, effects, and quick exports."],
          ["⚙", "Workflow position", "Editing & post-production"],
          ["▣", "Works best with", "ChatGPT / Claude → CapCut → Canva"],
        ].map(([icon, title, body]) => (
          <div key={title} className="grid grid-cols-[24px_1fr] gap-3 border-b border-white/10 py-[18px] last:border-b-0">
            <div className="pt-[2px] text-[17px] text-sky-400">{icon}</div>
            <div>
              <div className="mb-1.5 text-[15px] font-semibold text-white/92">{title}</div>
              <div className="text-[14px] leading-[1.55] text-white/62">{body}</div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-[24px_1fr] gap-3 border-b border-white/10 py-[18px]">
          <div className="pt-[2px] text-[17px] text-sky-400">◴</div>
          <div>
            <div className="mb-2.5 text-[15px] font-semibold text-white/92">Learning curve</div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`h-3.5 w-3.5 rounded-full ${i < 2 ? "bg-sky-400" : "bg-violet-500"}`} />
                ))}
              </div>
              <span className="text-[14px] text-white/70">Easy</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[24px_1fr] gap-3 pt-[18px]">
          <div className="pt-[2px] text-[17px] text-sky-400">▤</div>
          <div>
            <div className="mb-2 text-[15px] font-semibold text-white/92">Starting price</div>
            <div className="text-[14px] font-semibold text-emerald-400">Free plan available</div>
          </div>
        </div>
      </div>
    </Glass>
  );
}

function EditorPreview() {
  return (
    <div className="relative h-[318px] overflow-hidden rounded-[14px] border border-white/12 bg-[#0a101c] shadow-[0_0_22px_rgba(0,0,0,.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_10%,rgba(92,132,255,.14),transparent_28%),linear-gradient(180deg,#0d1424_0%,#080d18_100%)]" />

      <aside className="absolute bottom-0 left-0 top-0 w-[44px] border-r border-white/8 bg-black/30">
        <div className="flex h-full flex-col items-center gap-4 pt-5 text-[14px] text-white/38">
          {['⌘','↔','T','▣','♪','♫','⚙'].map((x) => <span key={x}>{x}</span>)}
        </div>
      </aside>

      <aside className="absolute bottom-0 right-0 top-0 w-[126px] border-l border-white/8 bg-black/28 p-3">
        <div className="mb-3 text-[11px] text-white/42">Text</div>
        <div className="mb-3 rounded-[8px] border border-white/8 bg-white/[.035] p-2 text-[11px] leading-[1.7] text-white/75">
          TRAVEL<br />MORE
        </div>
        <div className="mb-3 rounded-[8px] border border-white/8 bg-white/[.035] px-2 py-2 text-[10px] text-white/55">Montserrat</div>
        <div className="mb-3 flex gap-2 text-[12px] text-white/75"><b>B</b><i>I</i><span>＋</span></div>
        <div className="text-[10px] text-white/48">Color</div>
        <div className="mt-2 h-5 w-9 rounded bg-white" />
      </aside>

      <div className="absolute left-[58px] right-[140px] top-[26px] overflow-hidden rounded-[9px] border border-white/10 bg-[#111827]">
        <div className="relative h-[180px] bg-[linear-gradient(180deg,#7c94b7_0%,#2d4d76_50%,#0d1728_100%)]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 300" preserveAspectRatio="none">
            <polygon points="0,220 70,120 155,205 250,80 355,205 435,95 535,205 600,120 600,300 0,300" fill="#263852" />
            <polygon points="0,175 75,65 180,175 270,28 365,160 445,40 535,155 600,84 600,300 0,300" fill="#596f91" />
            <polygon points="0,155 75,42 176,150 270,12 365,136 448,25 535,135 600,70 600,300 0,300" fill="#aeb9ca" />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[40px] font-extrabold leading-none tracking-[-.04em]">TRAVEL</div>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-black/50 text-sm">▶</span>
                <span className="text-[25px] font-bold tracking-[-.04em]">MORE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[16px] left-[58px] right-[140px] rounded-[9px] border border-white/8 bg-white/[.035] p-2.5">
        <div className="mb-2 flex justify-end">
          <span className="rounded-md border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[10px] text-violet-300">✦ Auto captions</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`h-9 flex-1 overflow-hidden rounded border border-white/8 ${i === 3 ? "ring-2 ring-violet-500/75" : ""}`}>
              <div className="h-full bg-[linear-gradient(180deg,#7f99bd_0%,#3d6089_45%,#111f34_100%)]" />
            </div>
          ))}
        </div>
        <div className="mt-2.5 h-[5px] rounded-full bg-emerald-500/70" />
      </div>
    </div>
  );
}

function CheckRow({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-[2px] grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[12px] font-bold ${danger ? "border-red-500/75 text-red-500" : "border-emerald-400/75 text-emerald-400"}`}>
        {danger ? "×" : "✓"}
      </span>
      <span className="text-[15.5px] leading-[1.45] text-white/72">{text}</span>
    </div>
  );
}

function ScoreRing() {
  return (
    <div className="relative grid h-[190px] w-[190px] place-items-center">
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_220deg,#2f8cff_0deg,#47a4ff_96deg,#685cff_205deg,#9f45ff_318deg,#2f8cff_360deg)] p-[16px] shadow-[0_0_32px_rgba(94,108,255,.28)]">
        <div className="h-full w-full rounded-full bg-[#061024] shadow-[inset_0_0_26px_rgba(40,90,180,.18)]" />
      </div>
      <div className="relative z-10 text-center">
        <div className="text-[57px] font-semibold leading-none tracking-[-.05em]">8.8</div>
        <div className="mt-1 text-[24px] text-white/58">/ 10</div>
      </div>
    </div>
  );
}

export default function CapCutDetailPageV2() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020611] text-white [font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Arial,sans-serif]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(86,85,255,.16),transparent_18%),radial-gradient(circle_at_74%_20%,rgba(198,74,255,.10),transparent_8%),radial-gradient(circle_at_18%_34%,rgba(70,163,255,.06),transparent_18%),linear-gradient(180deg,#020410_0%,#050917_55%,#030611_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(255,255,255,.72)_0_1px,transparent_1.5px),radial-gradient(circle,rgba(106,174,255,.42)_0_1px,transparent_1.6px),radial-gradient(circle,rgba(187,106,255,.28)_0_1px,transparent_1.6px)] [background-position:8px_10px,34px_52px,12px_18px] [background-size:80px_80px,120px_120px,150px_150px]" />

      <div className="relative z-10 mx-auto max-w-[1088px] px-[28px] pb-8 pt-4">
        <header className="mb-[24px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StarLogo className="h-[31px] w-[31px] drop-shadow-[0_0_10px_rgba(132,84,255,.45)]" />
            <div className="text-[18px] font-semibold tracking-[-.025em] text-white/92">AI Tool Decision Assistant</div>
          </div>
          <button className="h-[38px] rounded-[10px] border border-white/16 bg-white/[.018] px-5 text-[14px] font-medium text-white/80">Log in</button>
        </header>

        <section className="grid grid-cols-[1fr_352px] gap-6 max-[980px]:grid-cols-1">
          <div>
            <button className="mb-[30px] inline-flex items-center gap-2 text-[15px] text-sky-400">← <span>Back to search</span></button>

            <div className="grid grid-cols-[170px_1fr] gap-[34px] max-[760px]:grid-cols-1">
              <div className="pt-1"><CapCutLogo /></div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[58px] font-semibold leading-none tracking-[-.055em] max-[760px]:text-[48px]">CapCut</h1>
                  <span className="mt-2 grid h-[30px] w-[30px] place-items-center rounded-full bg-[#2e8cff] text-[18px] shadow-[0_0_18px_rgba(46,140,255,.42)]">✓</span>
                </div>
                <p className="mt-3 text-[18px] leading-[1.4] text-white/70">Fast short-video editing for creators and marketers.</p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Tag icon="✦" text="Video editing" color="violet" />
                  <Tag icon="$" text="Free / Paid" color="green" />
                  <Tag icon="★" text="Beginner" color="amber" />
                  <Tag icon="▣" text="Web · iOS · Android · Desktop" color="blue" />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton primary>Open official website ↗</ActionButton>
                  <ActionButton>🔗&nbsp;&nbsp;Copy link</ActionButton>
                  <ActionButton>▱&nbsp;&nbsp;Save tool</ActionButton>
                </div>
              </div>
            </div>

            <Glass className="mt-5 p-5">
              <div className="mb-3 flex items-center gap-2 text-[15px] text-white/72"><span className="text-violet-400">✦</span>Decision Summary</div>
              <div className="max-w-[720px] text-[22px] leading-[1.45] tracking-[-.025em] text-white/90">Use CapCut when you already have clips and need fast editing, captions, templates, and export.</div>
              <div className="mt-2 max-w-[720px] text-[22px] leading-[1.45] tracking-[-.025em] text-violet-400">Do not start here if you still need a hook, script, or product angle.</div>
            </Glass>
          </div>

          <AtAGlance />
        </section>

        <nav className="mt-4 overflow-hidden rounded-[15px] border border-white/12 bg-white/[.018]">
          <div className="flex flex-wrap items-center">
            {tabs.map(([icon, label], i) => (
              <button key={label} className={`relative flex h-[54px] min-w-[178px] flex-1 items-center justify-center gap-3 px-4 text-[14px] ${i === 0 ? "text-white" : "text-white/56"}`}>
                <span className={i === 0 ? "text-sky-400" : "text-white/38"}>{icon}</span>
                {label}
                {i === 0 && <span className="absolute bottom-0 left-[28px] right-[28px] h-[3px] rounded-full bg-[linear-gradient(90deg,#4CA7FF,#5E6EFF,#B44EFF)]" />}
              </button>
            ))}
          </div>
        </nav>

        <Glass className="mt-4 p-6">
          <div className="grid grid-cols-[1fr_520px] gap-5 max-[980px]:grid-cols-1">
            <div>
              <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">✦</span><h2 className="text-[24px] font-semibold tracking-[-.03em]">What is CapCut?</h2></div>
              <p className="max-w-[535px] text-[16px] leading-[1.62] text-white/72">CapCut is an all-in-one video editing platform built for creators and marketers who need to produce short-form videos quickly. It offers intuitive timeline editing, auto captions, templates, effects, AI features, and one-click export for TikTok, Instagram Reels, YouTube Shorts, and more.</p>
              <div className="mt-7 grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
                {[["⚡", "Edit faster", "Intuitive tools and smart features."], ["🎨", "Stay on-brand", "Templates, text styles, and branding tools."], ["⤴", "Export anywhere", "Optimized for every short-video platform."]].map(([icon, title, sub]) => (
                  <div key={title}>
                    <div className="mb-1.5 flex items-center gap-2.5 text-[20px] text-violet-400"><span>{icon}</span><span className="text-[13px] font-semibold text-white">{title}</span></div>
                    <div className="pl-8 text-[11px] leading-[1.55] text-white/58">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <EditorPreview />
          </div>
        </Glass>

        <div className="mt-4 grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
          <div className="rounded-[16px] border border-emerald-400/45 bg-[linear-gradient(180deg,rgba(5,24,22,.76),rgba(4,14,20,.85))] p-5 shadow-[inset_0_0_28px_rgba(16,185,129,.055)]">
            <div className="mb-4 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-emerald-400/70 text-emerald-400">✓</span><h3 className="text-[20px] font-semibold tracking-[-.025em]">When to use CapCut</h3></div>
            <div className="space-y-2.5">{useItems.map((x) => <CheckRow key={x} text={x} />)}</div>
          </div>
          <div className="rounded-[16px] border border-red-500/45 bg-[linear-gradient(180deg,rgba(25,8,14,.76),rgba(16,8,15,.85))] p-5 shadow-[inset_0_0_28px_rgba(239,68,68,.045)]">
            <div className="mb-4 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-red-500/70 text-red-500">×</span><h3 className="text-[20px] font-semibold tracking-[-.025em]">Do not start here when</h3></div>
            <div className="space-y-2.5">{avoidItems.map((x) => <CheckRow key={x} text={x} danger />)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
          <Glass className="p-5">
            <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">✦</span><h3 className="text-[20px] font-semibold tracking-[-.025em]">Quick Verdict</h3></div>
            <div className="grid grid-cols-[190px_1fr] gap-3 max-[760px]:grid-cols-1">
              <div className="grid place-items-center"><ScoreRing /></div>
              <div className="flex flex-col justify-center gap-4 text-[15px] leading-[1.35] text-white/74">
                <div className="flex gap-3"><span className="text-emerald-400">✓</span><span>Extremely fast for short videos</span></div>
                <div className="flex gap-3"><span className="text-emerald-400">✓</span><span>Huge template & effect library</span></div>
                <div className="flex gap-3"><span className="text-emerald-400">✓</span><span>Great captions & auto features</span></div>
                <div className="flex gap-3"><span className="text-red-500">×</span><span>Not ideal for complex cinematic editing</span></div>
              </div>
            </div>
          </Glass>
          <Glass className="p-5">
            <div className="mb-4 flex items-center gap-3"><span className="text-[22px] text-violet-400">✦</span><h3 className="text-[20px] font-semibold tracking-[-.025em]">Key takeaways</h3></div>
            <div className="space-y-3">
              {takeaways.map(([icon, text]) => (
                <div key={text} className="grid grid-cols-[42px_1fr] gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-violet-400/25 bg-violet-500/10 text-[20px] text-violet-300">{icon}</div>
                  <div className="text-[15.5px] leading-[1.42] text-white/74">{text}</div>
                </div>
              ))}
            </div>
          </Glass>
        </div>

        <footer className="mt-5 text-center text-white/36">
          <div className="text-[14px]">Make better tool decisions. Save time. Get better results.</div>
          <div className="mt-1 text-[13px]">© 2025 AI Tool Decision Assistant · All rights reserved.</div>
        </footer>
      </div>
    </main>
  );
}
