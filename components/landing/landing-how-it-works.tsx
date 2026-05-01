"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FileStack, SearchCheck, Share2, Sparkles, type LucideIcon } from "lucide-react";

const steps: {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    number: "01",
    title: "Upload recent work",
    description:
      "Start with 5 to 10 pages from homework, quizzes, tests, or correction packets in a single intake flow.",
    icon: FileStack,
  },
  {
    number: "02",
    title: "Validate quality before processing",
    description:
      "The run lifecycle checks page count, blur, darkness, and rotation before the async analysis pipeline moves forward.",
    icon: SearchCheck,
  },
  {
    number: "03",
    title: "Review the parent report",
    description:
      "The diagnosis, evidence tabs, and 7 day plan stay together so a parent can understand what actually happened.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Export or hand off",
    description:
      "Once unlocked, export a PDF in the selected language or create a tutor-ready share summary without losing the owner boundary.",
    icon: Share2,
  },
];

export function LandingHowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20" data-testid="how-it-works-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700">
                How It Works
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                How Pathnook works
              </h2>
              <p className="mt-5 text-xl leading-9 text-slate-600">
                The workflow is deliberately linear so a parent always knows
                what happens next, whether the upload finishes cleanly or needs
                a reviewer in the loop.
              </p>
            </motion.div>

            <div className="mt-12 space-y-5">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65, delay: index * 0.08 }}
                    className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                          {step.number}
                        </div>
                        <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-lg leading-8 text-slate-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="lg:sticky lg:top-28"
          >
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-sky-200">
                  Evidence view preview
                </p>
                <h3 className="mt-3 text-3xl font-semibold">
                  Every diagnosis keeps the why visible
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-200">
                  The report is not just a conclusion card. It preserves the
                  source page, the extracted problem, and the parent-friendly
                  next step in one place.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-white p-5 text-slate-900">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Diagnosis
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      Repeated regrouping across subtraction
                    </p>
                    <p className="mt-3 text-base text-slate-600">
                      Shows up on page 2 problem 3 and page 4 problems 1 and 2.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-sky-500/15 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-sky-100">
                        Evidence anchor
                      </p>
                      <p className="mt-2 text-lg font-semibold">Open source page</p>
                      <p className="mt-2 text-base text-slate-200">
                        Jump back to the exact page and problem.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-orange-400/15 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-orange-100">
                        This week
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        10 minute place-value reset
                      </p>
                      <p className="mt-2 text-base text-slate-200">
                        Parent-friendly language, not teacher shorthand.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-medium text-white">
                          Tutor-ready share foundation
                        </p>
                        <p className="mt-1 text-base text-slate-300">
                          Share only the owner-approved brief.
                        </p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-sky-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
