"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const stats = [
  { value: "5 to 10 pages", label: "Supported upload size" },
  { value: "EN / ES", label: "Report and PDF output" },
  { value: "PDF export", label: "Unlock-aware download flow" },
  { value: "Tutor-ready", label: "Owner-scoped share summary" },
];

const proofCards = [
  {
    title: "Weekly learning review",
    role: "Parent workflow snapshot",
    content:
      "Instead of staring at a red-marked packet and guessing, the parent can see which exact pages triggered the diagnosis and what to do during the next seven days.",
  },
  {
    title: "Bilingual household sharing",
    role: "Report delivery snapshot",
    content:
      "The family can switch the report between English and Spanish on the same page and export the PDF in that same language without rebuilding the diagnosis.",
  },
  {
    title: "Tutor prep without data sprawl",
    role: "Share workflow snapshot",
    content:
      "The tutor-ready share view shows the approved brief, share status, and focus areas while keeping owner-only household information out of the summary.",
  },
];

export function LandingProofSection() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-24 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-20"
      data-testid="testimonials-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700">
            Testimonials
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Proof that the workflow is ready for families
          </h2>
          <p className="mt-5 text-xl leading-9 text-slate-600">
            The layout mirrors a testimonial section, but the proof here stays
            grounded in real product capability rather than inflated growth
            claims.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-semibold tracking-tight text-sky-700 sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-lg text-slate-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-16 grid gap-8 xl:grid-cols-3">
          {proofCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
            >
              <Quote className="h-9 w-9 text-sky-200" />
              <div className="mt-4 flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-6 text-xl leading-9 text-slate-700">
                "{card.content}"
              </p>
              <div className="mt-8 border-t border-slate-200 pt-5">
                <p className="text-lg font-semibold text-slate-950">
                  {card.title}
                </p>
                <p className="mt-1 text-base text-slate-500">{card.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
