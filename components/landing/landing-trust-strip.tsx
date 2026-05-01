"use client";

import { motion } from "framer-motion";
import { BadgeCheck, FileOutput, Languages, ShieldCheck, UsersRound } from "lucide-react";

const proofPoints = [
  {
    value: "5 to 10 pages",
    label: "Supported per diagnosis run",
    icon: BadgeCheck,
  },
  {
    value: "EN / ES",
    label: "Report display and export toggle",
    icon: Languages,
  },
  {
    value: "PDF export",
    label: "Parent-ready file for school or tutoring",
    icon: FileOutput,
  },
  {
    value: "Tutor-ready",
    label: "Owner-scoped share summary without a second login",
    icon: UsersRound,
  },
];

const trustNotes = [
  "Evidence-backed findings, not generic AI summaries",
  "Household privacy defaults from sign-up through tutor share",
  "Admin-reviewed release path for unclear or low-confidence runs",
];

export function LandingTrustStrip() {
  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {proofPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <motion.div
                  key={point.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5"
                >
                  <div className="inline-flex rounded-2xl bg-slate-950 p-2 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                    {point.value}
                  </p>
                  <p className="mt-2 text-base leading-7 text-slate-600">
                    {point.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {trustNotes.map((note) => (
              <div
                key={note}
                className="flex items-start gap-3 rounded-3xl bg-sky-50 px-4 py-4 text-base leading-7 text-slate-700"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-sky-700" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
