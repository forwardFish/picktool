"use client";

import { motion } from "framer-motion";
import { BookOpenCheck, FileCheck2, Languages, Route, type LucideIcon } from "lucide-react";

const useCases: {
  title: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
}[] = [
  {
    title: "Homework packet review",
    description:
      "Upload a week of mixed homework pages and isolate the repeated mistakes before the next class hand-in.",
    icon: BookOpenCheck,
    bullets: ["Repeated pattern grouping", "Weekly action plan", "Parent notes over time"],
  },
  {
    title: "Quiz correction follow-up",
    description:
      "Turn a corrected quiz into a cleaner diagnosis so the parent knows which mistakes were conceptual and which were one-off slips.",
    icon: FileCheck2,
    bullets: ["Evidence tab with page anchors", "Confidence-aware release", "Tutor brief foundation"],
  },
  {
    title: "Bilingual family communication",
    description:
      "Switch the report between English and Spanish before sending it to another caregiver or printing a PDF for home review.",
    icon: Languages,
    bullets: ["Per-page toggle", "Localized export", "Parent-friendly copy"],
  },
  {
    title: "Weekly tutor prep",
    description:
      "Export or share only the approved report sections that help a tutor pick up the story quickly.",
    icon: Route,
    bullets: ["Owner-scoped share summary", "Focus areas", "No second login required"],
  },
];

const searchIntentPhrases = [
  "learning diagnosis for parents",
  "student work mistake analysis",
  "weekly review for family learning support",
  "bilingual parent report for tutoring",
  "evidence-based student error summary",
  "parent dashboard for uploaded student work",
];

export function LandingUseCasesSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700">
            Use Cases
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Built for the materials families already have at home
          </h2>
          <p className="mt-5 text-xl leading-9 text-slate-600">
            This section fills the role of the SEO-style landing content in the
            reference design while staying grounded in the Pathnook
            product story and vocabulary.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 xl:grid-cols-2">
          {useCases.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
              >
                <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {item.description}
                </p>
                <ul className="mt-6 flex flex-wrap gap-3">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-full bg-sky-50 px-4 py-2 text-base font-medium text-sky-800"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12 }}
          className="mt-12 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8"
        >
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
            Search intent coverage
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {searchIntentPhrases.map((phrase) => (
              <span
                key={phrase}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-base text-slate-600"
              >
                {phrase}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
