import React from "react";

const tools = [
  {
    name: "ChatGPT / Claude",
    desc: "Ideation, scripts, and message planning",
    logo: "◎",
    logoClass: "from-emerald-400 to-teal-700 text-white",
    badges: ["Core", "Beginner", "Free"],
  },
  {
    name: "CapCut",
    desc: "AI video editing with templates & effects",
    logo: "⌘",
    logoClass: "from-white to-slate-200 text-black",
    badges: ["Core", "Beginner", "Free / Pro"],
  },
  {
    name: "Runway / Kling",
    desc: "AI video generation and b-roll creation",
    logo: "R",
    logoClass: "from-black to-zinc-900 text-white border border-white/25",
    badges: ["Optional", "Intermediate", "Free / Paid"],
  },
  {
    name: "Canva",
    desc: "Design covers, captions, and text overlays",
    logo: "Canva",
    logoClass: "from-cyan-400 to-violet-600 text-white text-[10px] italic",
    badges: ["Core", "Beginner", "Free / Pro"],
  },
  {
    name: "InVideo",
    desc: "Templates & AI editing for quick videos",
    logo: "▶",
    logoClass: "from-violet-500 to-blue-600 text-white",
    badges: ["Optional", "Beginner", "Free / Pro"],
  },
  {
    name: "HeyGen",
    desc: "AI avatar videos & product spokesperson",
    logo: "▶",
    logoClass: "from-violet-700 to-fuchsia-500 text-white",
    badges: ["Optional", "Intermediate", "Free / Paid"],
  },
];

const tableRows = [
  {
    tool: "ChatGPT / Claude",
    logo: "◎",
    logoClass: "from-emerald-400 to-teal-700 text-white",
    does: "Ideation, scripts, hooks, and message planning",
    use: "Plan the hook, key benefits, and write your script",
    badge: "Core",
  },
  {
    tool: "CapCut",
    logo: "⌘",
    logoClass: "from-white to-slate-200 text-black",
    does: "AI video editing with templates and effects",
    use: "Edit product clips into a TikTok-ready video",
    badge: "Core",
  },
  {
    tool: "Runway / Kling",
    logo: "R",
    logoClass: "from-black to-zinc-900 text-white border border-white/25",
    does: "AI video generation with text-to-video models",
    use: "Generate b-roll or product visuals from text",
    badge: "Optional",
  },
  {
    tool: "Canva",
    logo: "Canva",
    logoClass: "from-cyan-400 to-violet-600 text-white text-[10px] italic",
    does: "Design covers, captions, and on-screen text",
    use: "Create cover, captions, and branded text overlays",
    badge: "Core",
  },
];

const steps = [
  {
    n: 1,
    icon: "↗",
    title: "Shape the message",
    body: "Use ChatGPT / Claude to define the hook, key benefits, and write your script.",
    tip: "Start with the first 3 seconds hook.",
  },
  {
    n: 2,
    icon: "▣",
    title: "Create or edit the video",
    body: "Edit clips in CapCut with templates, effects, and trending formats.",
    tip: "Keep it short, clear, and attention-grabbing.",
  },
  {
    n: 3,
    icon: "✦",
    title: "Enhance with AI",
    body: "Generate b-roll or product shots using Runway / Kling to elevate visuals.",
    tip: "Add bold text and high-contrast visuals.",
  },
  {
    n: 4,
    icon: "☁",
    title: "Package & publish",
    body: "Design cover and captions in Canva, then publish your TikTok video.",
    tip: "Preview in full screen before posting.",
  },
];

const options = [
  ["✂", "Already have clips", "Use CapCut only."],
  ["▦", "Want all-in-one", "Use InVideo."],
  ["♙", "Want avatar style", "Use HeyGen."],
  ["✦", "Need stronger visuals", "Use Runway / Kling."],
];

function BrandStar({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 2L39.5 24.5L62 32L39.5 39.5L32 62L24.5 39.5L2 32L24.5 24.5L32 2Z"
        fill="url(#brand-gradient)"
      />
      <path
        d="M32 16.5L35.9 28.1L47.5 32L35.9 35.9L32 47.5L28.1 35.9L16.5 32L28.1 28.1L32 16.5Z"
        fill="white"
      />
      <defs>
        <linearGradient id="brand-gradient" x1="6" y1="7" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#54D9FF" />
          <stop offset="0.48" stopColor="#725BFF" />
          <stop offset="1" stopColor="#C94BFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="21" cy="21" r="12" stroke="currentColor" strokeWidth="4" />
      <path d="M30.5 30.5L40 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M32 5L38 26L59 32L38 38L32 59L26 38L5 32L26 26L32 5Z" fill="currentColor" />
    </svg>
  );
}

function ToolLogo({ logo, logoClass, large = false }: { logo: string; logoClass: string; large?: boolean }) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-[9px] bg-gradient-to-br font-extrabold shadow-[inset_0_0_14px_rgba(255,255,255,.12)] ${
        large ? "h-12 w-12 text-[20px]" : "h-[38px] w-[38px] text-[15px]"
      } ${logoClass}`}
    >
      {logo}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  const text = String(children);
  const cls =
    text === "Optional"
      ? "bg-gradient-to-br from-blue-700 to-sky-500 text-white"
      : text === "Beginner"
      ? "bg-emerald-500/25 text-emerald-300"
      : text === "Intermediate"
      ? "bg-amber-500/25 text-amber-300"
      : text.includes("Free")
      ? "bg-white/[.07] text-white/70"
      : "bg-gradient-to-br from-violet-700 to-fuchsia-500 text-white";

  return <span className={`inline-flex h-[26px] items-center rounded-md px-3 text-[11px] font-bold ${cls}`}>{children}</span>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[18px] border border-[#5aa0ff]/35 bg-[linear-gradient(180deg,rgba(8,15,39,.86),rgba(5,11,28,.88))] shadow-[0_0_30px_rgba(66,144,255,.18),0_0_38px_rgba(176,60,255,.12),inset_0_0_34px_rgba(66,121,255,.07)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_0_0_1px_rgba(183,70,255,.18)] ${className}`}
    >
      {children}
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative flex min-h-[422px] items-center justify-center overflow-hidden rounded-[16px]">
      <div className="absolute inset-0 opacity-75 [background:radial-gradient(circle_at_60%_32%,rgba(211,72,255,.32),transparent_17%),radial-gradient(circle_at_80%_45%,rgba(83,160,255,.23),transparent_12%),radial-gradient(circle,rgba(255,255,255,.72)_0_1px,transparent_1.6px)] [background-size:auto,auto,80px_80px]" />
      <div className="absolute bottom-[14px] left-[28px] right-[8px] h-[124px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(170,70,255,.23),transparent_42%),repeating-radial-gradient(ellipse_at_center,transparent_0_28px,rgba(84,193,255,.66)_29px_31px,transparent_33px_48px,rgba(206,66,255,.58)_49px_51px,transparent_53px_68px)] [transform:perspective(440px)_rotateX(64deg)] drop-shadow-[0_0_18px_rgba(125,75,255,.5)]" />

      <div className="relative z-10 mt-2 h-[352px] w-[182px] rotate-[6deg] rounded-[30px] border-[3px] border-white/20 bg-gradient-to-br from-[#242630] to-[#060813] p-2 shadow-[0_22px_38px_rgba(0,0,0,.44),0_0_25px_rgba(176,70,255,.18)] before:absolute before:left-1/2 before:top-[6px] before:z-30 before:h-4 before:w-[76px] before:-translate-x-1/2 before:rounded-b-xl before:bg-[#060811]">
        <div className="relative h-full overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_58%_17%,rgba(255,215,245,.72),transparent_23%),linear-gradient(180deg,#9d6abf_0%,#5c386d_44%,#171521_100%)]">
          <div className="absolute bottom-[78px] left-[18px] h-[118px] w-[38px] -rotate-[17deg] border-l-2 border-[#ffd5ce]/45 opacity-80" />
          <div className="absolute bottom-0 left-[-12px] right-[-12px] h-[88px] bg-[radial-gradient(circle_at_20%_30%,#2d2836_0_26px,transparent_27px),radial-gradient(circle_at_42%_22%,#3a3141_0_32px,transparent_33px),radial-gradient(circle_at_60%_34%,#292731_0_28px,transparent_29px),radial-gradient(circle_at_78%_20%,#352c3b_0_34px,transparent_35px),#14161f]" />

          <div className="absolute left-[57px] top-[84px] h-[132px] w-16 rounded-[18px_18px_12px_12px] border border-white/35 bg-[linear-gradient(90deg,rgba(92,39,57,.95),rgba(240,198,211,.84),rgba(53,20,36,.96))] shadow-[0_0_16px_rgba(255,217,232,.38),inset_0_0_18px_rgba(255,255,255,.22)] before:absolute before:left-[21px] before:top-[-42px] before:h-12 before:w-[22px] before:rounded-[10px_10px_4px_4px] before:bg-[linear-gradient(90deg,#08090f,#1a1b24,#06070c)] before:shadow-[0_-12px_0_-5px_#05060a]">
            <div className="absolute left-[10px] right-[10px] top-9 text-center text-[8px] leading-[1.35] tracking-[.05em] text-white/85">
              L<br />LUMINA<br />GLOW SERUM
            </div>
          </div>

          <div className="absolute bottom-10 right-[10px] grid gap-[9px] text-center text-[8px] text-white [text-shadow:0_2px_6px_rgba(0,0,0,.75)]">
            <div className="text-[18px] text-rose-500">♥</div>
            <div>12.5K</div>
            <div className="text-[15px]">●</div>
            <div>254</div>
            <div className="text-[15px]">↗</div>
            <div>1.2K</div>
          </div>

          <div className="absolute bottom-[18px] left-3.5 text-[7px] leading-snug text-white">
            00:03 / 00:15
            <div className="mt-1 h-[2px] w-24 rounded-full bg-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIToolDecisionResult() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020612] px-7 py-[18px] text-white [font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Arial,sans-serif] before:pointer-events-none before:fixed before:inset-0 before:z-0 before:opacity-75 before:[background-image:radial-gradient(circle,rgba(255,255,255,.85)_0_1px,transparent_1.5px),radial-gradient(circle,rgba(99,170,255,.58)_0_1px,transparent_1.6px),radial-gradient(circle,rgba(186,107,255,.44)_0_1px,transparent_1.6px)] before:[background-position:10px_15px,34px_60px,12px_18px] before:[background-size:80px_80px,120px_120px,150px_150px] after:pointer-events-none after:fixed after:inset-0 after:z-0 after:opacity-60 after:blur-[2px] after:[background:radial-gradient(ellipse_at_75%_15%,rgba(89,110,255,.28),transparent_18%),radial-gradient(ellipse_at_82%_12%,rgba(196,76,255,.22),transparent_7%),radial-gradient(ellipse_at_90%_38%,rgba(145,83,255,.18),transparent_11%)]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_76%_20%,rgba(95,84,255,.16),transparent_18%),radial-gradient(circle_at_82%_12%,rgba(210,80,255,.10),transparent_8%),radial-gradient(circle_at_20%_40%,rgba(66,160,255,.06),transparent_16%),linear-gradient(180deg,#020410_0%,#050a1e_52%,#040716_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1081px]">
        <header className="mb-3.5 flex h-12 items-center justify-between">
          <div className="flex items-center gap-3 text-[20px] font-bold tracking-[-.03em] text-white/95">
            <BrandStar className="h-[34px] w-[34px] drop-shadow-[0_0_10px_rgba(114,88,255,.55)]" />
            <span>AI Tool Decision Assistant</span>
          </div>
          <button className="h-10 min-w-[84px] rounded-[10px] border border-[#6e9fff]/45 bg-[#080e22]/60 px-[18px] text-[13px] font-semibold text-white shadow-[inset_0_0_14px_rgba(83,133,255,.06),0_0_18px_rgba(55,110,255,.08)]">
            Log in
          </button>
        </header>

        <section className="mb-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 p-[2px] shadow-[0_0_22px_rgba(59,168,255,.28),0_0_28px_rgba(173,60,255,.18)]">
          <div className="grid min-h-[74px] grid-cols-[58px_1fr_252px] items-center overflow-hidden rounded-[14px] bg-[#030919]/95 max-[760px]:grid-cols-[54px_1fr] max-[760px]:grid-rows-[56px_56px]">
            <div className="grid place-items-center text-white/90">
              <SearchIcon />
            </div>
            <div className="truncate pr-4 text-[17px] font-medium tracking-[-.02em] text-white/90 max-[760px]:text-[14px]">
              I want to create a product promo video for TikTok.
            </div>
            <button className="mr-2 flex h-[60px] items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-[#58c5ff] via-[#6d69ff] to-[#c34eff] text-[15px] font-bold text-white shadow-[inset_0_0_18px_rgba(255,255,255,.18)] max-[760px]:col-span-2 max-[760px]:mx-2 max-[760px]:mb-2 max-[760px]:h-12">
              <SparkleIcon className="h-[18px] w-[18px]" />
              Get Decision
            </button>
          </div>
        </section>

        <div className="mb-2.5 ml-1 flex items-center gap-2 text-[13px] text-white/70">
          <span className="text-[15px] text-emerald-400">✔</span>
          <span>Matched a task decision, not just a tool list.</span>
        </div>

        <div className="mb-3.5 flex flex-wrap gap-2.5">
          {[
            ["◎", "Marketing"],
            ["▣", "Video"],
            ["◔", "Beginner-friendly"],
          ].map(([icon, label]) => (
            <span key={label} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#7699d6]/20 bg-[#080f23]/65 px-3.5 text-[12px] font-semibold text-white/80 shadow-[inset_0_0_14px_rgba(91,113,255,.05)]">
              <span className="text-[13px] text-fuchsia-400">{icon}</span>
              {label}
            </span>
          ))}
        </div>

        <GlassCard className="mb-3.5 grid grid-cols-[1.18fr_.82fr] gap-3.5 p-[22px_24px_18px] max-[980px]:grid-cols-1">
          <div>
            <h1 className="m-0 mb-2 text-[28px] font-extrabold leading-[1.08] tracking-[-.04em]">Best Tool Setup for This Task</h1>
            <div className="mb-3 text-[15px] font-bold tracking-[-.03em] text-cyan-400">
              Create a TikTok <span className="text-violet-500">product promo video</span>
            </div>
            <p className="mb-3.5 max-w-[470px] text-[13px] leading-[1.55] text-white/65">
              A proven workflow using the best AI tools for planning, editing, generating, and publishing.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px] text-white/75">
                <thead>
                  <tr className="border-y border-[#7699d6]/15 text-left text-[12px] font-bold text-white/65">
                    <th className="h-8 min-w-[180px] pr-3">Tool</th>
                    <th className="h-8 min-w-[168px] px-3">What it does</th>
                    <th className="h-8 min-w-[240px] pl-3">Use in this task</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.tool} className="border-b border-[#7699d6]/15">
                      <td className="py-2.5 pr-3 align-middle">
                        <div className="flex items-center gap-2.5 text-[13px] font-bold text-white/90">
                          <ToolLogo logo={row.logo} logoClass={row.logoClass} />
                          <span>{row.tool}</span>
                        </div>
                      </td>
                      <td className="border-l border-[#7699d6]/15 px-3 py-2.5 leading-[1.35] align-middle">{row.does}</td>
                      <td className="border-l border-[#7699d6]/15 py-2.5 pl-3 leading-[1.35] align-middle">
                        {row.use} <Badge>{row.badge}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PhoneMockup />
        </GlassCard>

        <GlassCard className="mb-3.5 p-[14px_16px_16px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="m-0 text-[21px] font-extrabold tracking-[-.035em]">How to use it</h3>
          </div>
          <div className="grid grid-cols-4 gap-3.5 max-[980px]:grid-cols-1">
            {steps.map((step, idx) => (
              <div key={step.n} className="relative min-h-[164px] rounded-[10px] border border-[#799bdc]/25 bg-[#0a122a]/70 p-[24px_12px_12px] shadow-[inset_0_0_20px_rgba(84,117,255,.06)]">
                <div className="absolute left-1/2 top-[-14px] grid h-[29px] w-[29px] -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-blue-500 text-[13px] font-bold shadow-[0_0_14px_rgba(110,79,255,.58)]">
                  {step.n}
                </div>
                {idx < steps.length - 1 && <div className="absolute right-[-12px] top-[52px] z-20 text-[18px] text-cyan-400 max-[980px]:hidden">→</div>}
                <div className="mb-2 flex items-center gap-2 text-[13px] font-bold tracking-[-.02em]">
                  <span className="text-violet-400">{step.icon}</span>
                  {step.title}
                </div>
                <p className="m-0 text-[11.5px] leading-[1.46] text-white/62">{step.body}</p>
                <div className="mt-3.5 flex min-h-12 gap-2 rounded-lg border border-[#7b9bd8]/20 bg-[#080e20]/55 p-2 text-[10.5px] leading-[1.4] text-white/60">
                  <span className="text-amber-400">💡</span>
                  <span><b>Tip:</b> {step.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="mb-3.5 p-[14px_16px_16px]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <SparkleIcon className="h-5 w-5 text-fuchsia-400" />
              <div>
                <h3 className="m-0 text-[21px] font-extrabold leading-none tracking-[-.035em]">Recommended Tools</h3>
                <p className="mt-1 text-[12px] text-white/55">Curated tools for the best results</p>
              </div>
            </div>
            <button className="h-8 rounded-lg border border-[#7897d9]/30 bg-[#070c1d]/55 px-3 text-[11px] font-bold text-white/75">
              <span className="text-cyan-400">ⓘ</span> Why these tools?
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3.5 max-[980px]:grid-cols-1">
            {tools.map((tool) => (
              <article key={tool.name} className="min-h-[162px] rounded-[10px] border border-[#7a9cda]/25 bg-[#0a122a]/75 p-[13px] shadow-[inset_0_0_20px_rgba(88,120,255,.06)]">
                <div className="mb-3 grid grid-cols-[50px_1fr] gap-3">
                  <ToolLogo logo={tool.logo} logoClass={tool.logoClass} large />
                  <div>
                    <div className="mb-1 text-[15px] font-extrabold tracking-[-.02em]">{tool.name}</div>
                    <div className="text-[12px] leading-[1.35] text-white/62">{tool.desc}</div>
                  </div>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {tool.badges.map((badge) => <Badge key={badge}>{badge}</Badge>)}
                </div>
                <button className="h-[30px] w-full rounded-[7px] border border-[#7692ce]/25 bg-[#050a19]/40 text-[12px] font-bold text-white/80">
                  View detail <span className="ml-1.5 text-cyan-400">→</span>
                </button>
              </article>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="mb-3.5 p-[14px_16px_16px]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-[20px] text-fuchsia-400">☆</span>
            <h3 className="m-0 text-[21px] font-extrabold tracking-[-.035em]">Better options if</h3>
          </div>
          <div className="grid grid-cols-4 gap-3 max-[980px]:grid-cols-1">
            {options.map(([icon, title, sub]) => (
              <div key={title} className="grid min-h-16 grid-cols-[28px_1fr_12px] items-center gap-2 rounded-[9px] border border-[#7f9adc]/25 bg-[#091026]/70 p-[11px_10px]">
                <div className="text-[18px] text-fuchsia-400">{icon}</div>
                <div>
                  <div className="text-[12px] font-bold tracking-[-.02em]">{title}</div>
                  <div className="mt-0.5 text-[11px] text-white/55">{sub}</div>
                </div>
                <div className="text-[18px] text-white/55">→</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="mb-4 p-[14px_16px_16px]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-[20px] text-amber-400">◎</span>
            <h3 className="m-0 text-[21px] font-extrabold tracking-[-.035em]">Cost advice</h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
            <div className="grid min-h-[138px] grid-cols-[50px_1fr] gap-3 rounded-xl border border-emerald-400/40 bg-[#081123]/75 p-[15px] shadow-[inset_0_0_22px_rgba(57,188,84,.08)]">
              <div className="mt-1 grid h-[42px] w-[42px] place-items-center text-[28px] text-emerald-400">🎁</div>
              <div>
                <div className="mb-1.5 text-[16px] font-extrabold tracking-[-.02em] text-emerald-400">Free-first path</div>
                <p className="mb-3 text-[12px] leading-[1.42] text-white/62">Use free ChatGPT/Claude, CapCut free, and Canva free to complete this task end-to-end.</p>
                <div className="flex flex-wrap gap-2">
                  {['ChatGPT / Claude (Free)', 'CapCut (Free)', 'Canva (Free)'].map((item) => (
                    <button key={item} className="h-[30px] rounded-[7px] border border-emerald-400/70 bg-[#090f1f]/55 px-3.5 text-[11px] font-bold text-emerald-300">{item}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid min-h-[138px] grid-cols-[50px_1fr] gap-3 rounded-xl border border-red-400/40 bg-[#081123]/75 p-[15px] shadow-[inset_0_0_22px_rgba(202,54,54,.08)]">
              <div className="mt-1 grid h-[42px] w-[42px] place-items-center text-[28px] text-red-400">＄</div>
              <div>
                <div className="mb-1.5 text-[16px] font-extrabold tracking-[-.02em] text-red-400">Avoid paying for</div>
                <p className="mb-3 text-[12px] leading-[1.42] text-white/62">Runway/Kling, HeyGen, or InVideo if you do not need generated visuals, avatars, or templates.</p>
                <div className="flex flex-wrap gap-2">
                  {['Runway / Kling', 'HeyGen', 'InVideo'].map((item) => (
                    <button key={item} className="h-[30px] rounded-[7px] border border-red-400/70 bg-[#090f1f]/55 px-3.5 text-[11px] font-bold text-red-300">{item}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <footer className="mt-4 flex items-center justify-between px-0.5 pt-1.5 text-[12px] text-white/45 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3">
          <div className="flex items-center gap-8 max-[760px]:flex-wrap max-[760px]:gap-4">
            <span className="text-[26px] leading-none text-violet-400 drop-shadow-[0_0_8px_rgba(145,82,255,.4)]">✦</span>
            <span>About</span><span>How it works</span><span>Privacy</span><span>Terms</span>
          </div>
          <div>© 2025 AI Tool Decision Assistant. All rights reserved.</div>
        </footer>
      </div>
    </main>
  );
}
