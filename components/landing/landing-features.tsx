"use client";

import { motion } from "framer-motion";
import {
  BellRing,
  FileOutput,
  Globe2,
  ShieldCheck,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  accentClass: string;
}[] = [
  {
    icon: Target,
    title: "Evidence-backed diagnosis",
    description:
      "Group repeated mistakes, separate one-off slips, and keep every finding tied to a page and problem reference.",
    bullets: ["Highlight overlay support", "Confidence-aware findings", "7 day action plan"],
    accentClass: "from-sky-100 to-cyan-50 text-sky-700",
  },
  {
    icon: Globe2,
    title: "Bilingual parent reports",
    description:
      "Switch between English and Spanish on the report page and carry the same language into the exported PDF.",
    bullets: ["Per-page language toggle", "Family-friendly phrasing", "No account-wide lock-in"],
    accentClass: "from-violet-100 to-fuchsia-50 text-violet-700",
  },
  {
    icon: FileOutput,
    title: "PDF export that matches the report",
    description:
      "Export a clean parent-facing PDF only after the report is unlocked, with negative-path handling already in place.",
    bullets: ["Unlock-aware download flow", "Selected language preserved", "Shareable offline artifact"],
    accentClass: "from-orange-100 to-amber-50 text-orange-700",
  },
  {
    icon: UsersRound,
    title: "Tutor-ready share foundation",
    description:
      "Prepare a tutor-ready share summary without spinning up a separate tutor account or exposing unrelated household data.",
    bullets: ["Owner-scoped share view", "Active share status", "Focus areas at a glance"],
    accentClass: "from-emerald-100 to-teal-50 text-emerald-700",
  },
  {
    icon: BellRing,
    title: "Weekly review rhythm",
    description:
      "Track the next review moment through reminder artifacts and keep the diagnosis flow tied to a parent cadence.",
    bullets: ["Report-ready reminder", "Weekly review reminder", "Progress evidence logged"],
    accentClass: "from-rose-100 to-pink-50 text-rose-700",
  },
  {
    icon: ShieldCheck,
    title: "Admin-reviewed release path",
    description:
      "Send low-confidence or unclear uploads into review so the family sees an intentional release flow instead of a vague failure.",
    bullets: ["Needs-review state", "Manual copy refinement", "Protected release gate"],
    accentClass: "from-slate-200 to-slate-50 text-slate-700",
  },
];

export function LandingFeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-24 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] py-20"
      data-testid="features-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700">
            Features
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Features designed for the parent workflow
          </h2>
          <p className="mt-5 text-xl leading-9 text-slate-600">
            The structure mirrors a strong SaaS landing page, but the product
            promise is specific: turn recent student work into a clear review
            loop backed by evidence.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="rounded-[2rem] border border-white bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
              >
                <div
                  className={`inline-flex rounded-[1rem] bg-gradient-to-br p-3 ${feature.accentClass}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {feature.description}
                </p>
                <ul className="mt-6 space-y-3 text-base text-slate-600">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
