import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileSearch,
  GraduationCap,
  Handshake,
  Layers3,
  MessageCircleMore,
  NotebookPen,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import {
  formatBillingInterval,
  getAnnualSavings,
  getPublicBillingPlanGroups,
} from "@/lib/payments/catalog";
import {
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/components/seo/JsonLd";
import { HeroIntakeComposer } from "@/components/landing/hero-intake-composer";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/seo/site";

const proofPoints = [
  "See the real bottleneck",
  "Find the shortest next path",
  "Turn review into weekly follow-through",
] as const;

const heroCards = [
  {
    title: "Diagnosis",
    body: "Main issue, repeated pattern, and what not to overreact to.",
    icon: FileSearch,
  },
  {
    title: "Skeleton Focus",
    body: "The real learning bottleneck and why it matters more than surface mistakes.",
    icon: Layers3,
  },
  {
    title: "Shortest Path",
    body: "A clear next step, what to do first, and what can wait.",
    icon: Target,
  },
  {
    title: "Share",
    body: "Tutor-ready share summary without losing family context.",
    icon: Handshake,
  },
] as const;

const stageOneCards = [
  {
    title: "See the real learning bottleneck",
    body: "Not just which questions went wrong, but where the learning process is actually breaking down.",
  },
  {
    title: "Get the shortest next path",
    body: "See what to work on first, why it comes first, and what can wait.",
  },
  {
    title: "Use small output checkpoints",
    body: "Do not stay in passive review. Use small tasks that reveal whether the learning is really holding.",
  },
  {
    title: "Carry progress forward week by week",
    body: "Every review should make the next week clearer, not disappear as a one-time report.",
  },
] as const;

const trustCards = [
  "Adults only account creation.",
  "Parent-controlled uploads and sharing.",
  "Secure billing through Freemius.",
  "Clear refund, privacy, and support routes.",
] as const;

const howItWorksSteps = [
  {
    title: "Upload Schoolwork",
    body: "Use recent homework, quizzes, tests, or corrections that show the current problem.",
    icon: NotebookPen,
  },
  {
    title: "Tell Us the Goal",
    body: "Say what feels stuck, what you want fixed first, and what kind of help you need.",
    icon: MessageCircleMore,
  },
  {
    title: "Get the Review",
    body: "See the diagnosis, the shortest next path, and a 7-day plan for this week.",
    icon: ScanSearch,
  },
] as const;

const faqItems = [
  {
    question: "What can I upload?",
    answer:
      "Pathnook is designed for recent schoolwork, corrections, quizzes, and homework pages that show where learning is getting stuck.",
  },
  {
    question: "Does Pathnook give the child answers?",
    answer:
      "No. The goal is diagnosis, evidence, and next-step guidance for the family, not shortcut answer generation.",
  },
  {
    question: "Can I share the result with a tutor?",
    answer:
      "Yes. The workflow keeps the evidence and parent context intact when a tutor-ready share summary is useful.",
  },
  {
    question: "What happens if the upload is unclear?",
    answer:
      "Pathnook is designed to surface uncertainty and quality limits instead of pretending weak input is high confidence.",
  },
  {
    question: "Is Pathnook only for math?",
    answer:
      "No. Pathnook supports parent-facing family learning support and is broader than a subject-specific worksheet tool.",
  },
  {
    question: "How does billing work?",
    answer:
      "Secure checkout is powered by Freemius as Merchant of Record. Families start from Pathnook billing management to review local access, then open the Freemius billing portal when they need invoices, payment methods, renewals, or cancellation.",
  },
  {
    question: "How is Pathnook different from a normal AI study tool?",
    answer:
      "Pathnook is not built to generate shortcut answers or generic study plans. It is built to help families see the real bottleneck, choose the most valuable next step, and keep progress moving from week to week.",
  },
] as const;

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="pn-kicker">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#111827] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-[var(--pn-muted)] sm:text-xl">
        {body}
      </p>
    </div>
  );
}

export function FamilyLandingPage() {
  const pricingGroups = getPublicBillingPlanGroups();

  return (
    <main className="pn-page-shell overflow-x-clip">
      <JsonLd data={[websiteJsonLd(SITE_URL), organizationJsonLd(SITE_URL)]} />
      <section className="mx-auto max-w-[1180px] px-4 pb-20 pt-14 sm:px-6 sm:pt-18 lg:px-8">
        <div className="hero mx-auto max-w-[1180px] text-center">
          <h1 className="mt-5 text-[clamp(1.95rem,4.1vw,3.35rem)] font-black leading-[1.06] tracking-[-0.05em] text-[#2f3d62]">
            <span className="inline-block whitespace-nowrap">
              Pathnook is an AI learning and growth system
            </span>
          </h1>
          <p className="pn-gradient-text mx-auto mt-5 max-w-5xl text-3xl font-black leading-[1.08] tracking-[-0.05em] sm:text-4xl lg:text-[3.25rem]">
            AI-driven clarity, the shortest next path,
            <br className="hidden lg:block" /> and steady family follow-through.
          </p>
          <p className="mx-auto mt-6 max-w-5xl text-lg leading-8 text-[var(--pn-muted-2)] sm:text-[1.6rem] sm:leading-[1.75]">
            Upload recent schoolwork, say what feels stuck, and get a clearer
            diagnosis, a stronger next step, and a weekly path you can actually
            follow.
          </p>
          {/*
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
            Built for families first, starting with education diagnosis,
            evidence-backed review, and weekly learning guidance.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-8 text-[var(--pn-muted)]">
            Pathnook is software for parents who want clearer learning
            decisions, evidence-backed review, and a steadier weekly
            follow-through workflow.
          </p>
          */}
        </div>

        <div className="mx-auto mt-10 max-w-[1160px]">
          <div className="rounded-[2.35rem] border border-white/80 bg-white/82 p-5 shadow-[0_30px_100px_rgba(124,58,237,0.15)] backdrop-blur">
            <div className="rounded-[2rem] border border-[#d9dee7] bg-white p-5 sm:p-7">
              <HeroIntakeComposer />
              <div className="hidden rounded-[1.7rem] border border-[#dfe4ec] bg-[#fcfcfe] px-6 py-7 sm:px-8 sm:py-8">
                <div className="font-mono text-[1rem] leading-[2.2] tracking-[0.01em] text-[#334155] sm:text-[1.1rem]">
                  My child understands the ideas in class, but still breaks down
                  on mixed schoolwork. I want to know the real bottleneck and
                  what we should focus on this week.
                </div>

                <div className="mt-8 border-t border-[#e4e7ee] pt-8">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex items-center gap-4 rounded-[1.35rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#f2efff_0%,#f8f7ff_100%)] px-5 py-5 shadow-[0_12px_30px_rgba(124,58,237,0.08)]">
                      <div className="grid h-16 w-16 place-items-center rounded-[1.15rem] bg-white text-[var(--pn-violet)] shadow-[0_10px_24px_rgba(124,58,237,0.14)]">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[1.02rem] font-black tracking-[-0.02em] text-[#111827]">
                          Upload Files
                        </p>
                        <p className="mt-1 text-sm leading-7 text-[var(--pn-muted)] sm:text-base">
                          Homework, tests, corrections - PDF or photo
                        </p>
                      </div>
                    </div>

                    <Button asChild size="lg" className="h-14 rounded-[1.2rem] px-8 text-[1.05rem]">
                      <Link href="/sign-up?redirect=/dashboard%3FresumeDraft%3D1">
                        Analyze &amp; Get Plan
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-[var(--pn-muted)]">
                <span>Adults only account creation</span>
                <span>•</span>
                <span>Parent-controlled uploads</span>
                <span>•</span>
                <span>Secure billing through Freemius</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex rounded-md bg-[linear-gradient(90deg,var(--pn-indigo),var(--pn-violet))] px-5 py-2 text-4xl font-black tracking-[-0.04em] text-white shadow-[0_18px_40px_rgba(79,70,229,0.18)] sm:text-5xl">
            How It Works
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="relative rounded-[2rem] border border-[var(--pn-border)] bg-white px-8 pb-10 pt-14 shadow-[0_16px_44px_rgba(15,23,42,0.08)]"
              >
                <div className="absolute left-8 top-[-22px] grid h-18 w-18 place-items-center rounded-full border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#f2efff_0%,#faf8ff_100%)] text-3xl font-black text-[var(--pn-violet)] shadow-[0_10px_24px_rgba(124,58,237,0.08)]">
                  {index + 1}
                </div>
                <div className="grid h-28 w-28 place-items-center rounded-[1.7rem] bg-[linear-gradient(180deg,#f4f1ff_0%,#f9f8ff_100%)] text-[var(--pn-violet)] shadow-[inset_0_0_0_1px_rgba(237,233,254,1)]">
                  <Icon className="h-11 w-11" />
                </div>
                <h3 className="mt-10 text-3xl font-black tracking-[-0.04em] text-[#111827]">
                  {step.title}
                </h3>
                <p className="mt-5 text-[1.02rem] leading-9 text-[var(--pn-muted)]">
                  {step.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/*
      <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl font-black tracking-[-0.05em] text-[#111827] sm:text-6xl">
            What You’ll Get
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stageOneCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.9rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#faf7ff_0%,white_100%)] p-7 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
            >
              <div className="grid h-22 w-22 place-items-center rounded-[1.45rem] bg-white text-[var(--pn-violet)] shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mt-8 text-[2rem] font-black leading-[1.15] tracking-[-0.04em] text-[#111827]">
                {card.title}
              </h3>
              <p className="mt-5 text-[1.02rem] leading-9 text-[var(--pn-muted)]">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </section>
      */}

      {/*
      <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
      </section>
      */}

      <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="pn-card p-8">
            <p className="pn-kicker">Built for trust</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#111827]">
              Built for trust, not just output
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--pn-muted)]">
              The public Pathnook story is software-first, parent-first, and
              explicit about billing, privacy, and support routes.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {trustCards.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,var(--pn-soft-2)_0%,white_100%)] p-4"
                >
                  <ShieldCheck className="h-5 w-5 text-[var(--pn-violet)]" />
                  <p className="mt-3 text-base leading-7 text-[var(--pn-muted-2)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pn-surface p-8 text-center">
            <p className="pn-kicker">Stage 2 Bridge</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#111827] sm:text-5xl">
              Pathnook starts with family learning and grows into a learning and growth system.
            </h2>
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-[var(--pn-muted-2)]">
              Today, Pathnook helps families turn schoolwork into diagnosis,
              next steps, and weekly follow-through. Over time, every review
              becomes part of a larger learning and growth system: clearer
              decisions, better next steps, and steadier progress over time.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Pricing"
          title="Simple pricing."
          body="Start with one review or choose the recurring tier that matches your seat count, active subjects, and monthly review depth."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {pricingGroups.map((group) => {
            const primaryPlan = group.oneTime || group.monthly || group.annual;
            if (!primaryPlan) {
              return null;
            }

            return (
            <article
              key={group.planCode}
              className={`relative flex h-full flex-col rounded-[1.75rem] border bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${
                group.featured
                  ? "border-[#c4b5fd] shadow-[0_18px_48px_rgba(124,58,237,0.14)]"
                  : "border-[var(--pn-border)]"
              }`}
            >
              {group.badge ? (
                <span className="absolute right-0 top-0 rounded-bl-[1rem] bg-[linear-gradient(90deg,var(--pn-indigo),var(--pn-violet))] px-4 py-2 text-xs font-black uppercase tracking-[0.04em] text-white">
                  {group.badge}
                </span>
              ) : null}
              <div className="text-2xl font-black tracking-[-0.03em] text-[#111827]">
                {group.name}
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="text-5xl font-black tracking-[-0.05em] text-[#111827]">
                    ${primaryPlan.unitAmount / 100}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[var(--pn-muted)]">
                    {formatBillingInterval(primaryPlan.interval)}
                  </div>
                </div>
                {group.monthly && group.annual ? (
                  <div className="rounded-[1rem] bg-[var(--pn-soft-2)] px-4 py-3 text-sm text-[var(--pn-muted-2)]">
                    <div>
                      Monthly: ${group.monthly.unitAmount / 100} · {group.monthly.summaryLine}
                    </div>
                    <div className="mt-1">
                      Annual: ${group.annual.unitAmount / 100} · {group.annual.summaryLine}
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-7 text-[var(--pn-muted)]">
                {group.description}
              </p>
              {group.annual && group.planCode !== "single_review" ? (
                <p className="mt-1 text-sm font-semibold text-[var(--pn-violet)]">
                  Saves ${(getAnnualSavings(group.planCode) / 100).toFixed(0)} compared with 12 monthly renewals.
                </p>
              ) : null}
              {group.oneTime ? (
                <p className="mt-1 text-sm text-[var(--pn-muted)]">
                  Limited early access: first review discount may apply at checkout.
                </p>
              ) : null}
              <ul className="mt-5 grid gap-3 text-sm leading-7 text-[var(--pn-muted-2)]">
                {primaryPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 flex-none text-[var(--pn-violet)]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  asChild
                  variant={group.featured ? "default" : "outline"}
                  className="h-12 w-full rounded-[1rem] text-base"
                >
                  <Link href="/pricing">{primaryPlan.ctaLabel}</Link>
                </Button>
              </div>
            </article>
          )})}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="FAQ"
          title="Common questions from families."
          body="The current Pathnook trust copy stays explicit: what you can upload, what the workflow does, how billing works, and where support routes live."
        />
        <div className="mt-8 grid gap-4">
          {faqItems.map((item) => (
            <article key={item.question} className="pn-card p-6">
              <h3 className="text-xl font-black tracking-[-0.02em] text-[#111827]">
                {item.question}
              </h3>
              <p className="mt-3 text-base leading-8 text-[var(--pn-muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
