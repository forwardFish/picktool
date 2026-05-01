"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "What kinds of student work can a parent upload?",
    answer:
      "The current intake is designed for 5 to 10 pages from homework, quizzes, tests, or correction packets. Mixed packets work as long as the pages are readable.",
  },
  {
    question: "Does Pathnook give the child the answers?",
    answer:
      "No. The report is built for parents and tutors. It focuses on error patterns, evidence anchors, and next steps rather than handing over completed work.",
  },
  {
    question: "Can I share the report with a tutor?",
    answer:
      "Yes. Once the report is unlocked, you can create a tutor-ready share summary while keeping the shared view owner-scoped and read-only for the recipient.",
  },
  {
    question: "Can I switch the report into Spanish?",
    answer:
      "Yes. The report page supports an English and Spanish toggle, and the selected language carries through to the exported PDF.",
  },
  {
    question: "What happens if the upload is too unclear?",
    answer:
      "The run can move into a needs-review state. That protects the family from a low-confidence release and keeps the reviewer decisions visible in the admin queue.",
  },
  {
    question: "How does billing work?",
    answer:
      "Families can start with a one-time diagnosis unlock or use the monthly family plan for ongoing uploads and weekly review. Locked reports stay preview-only until the unlock flow is complete.",
  },
];

export function LandingFaqSection() {
  const [openQuestion, setOpenQuestion] = useState(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-slate-50 py-20" data-testid="faq-section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700">
            FAQ
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Questions families ask before uploading
          </h2>
          <p className="mt-5 text-xl leading-9 text-slate-600">
            The landing page should answer the practical questions a family has
            before trusting the workflow with a real packet of schoolwork.
          </p>
        </motion.div>

        <div className="mt-14 space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openQuestion === index;

            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                >
                  <span className="text-xl font-semibold text-slate-950">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 flex-none text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-none text-slate-500" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-lg leading-8 text-slate-600">
                    {item.answer}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="mt-14 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
        >
          <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
            Ready to test the workflow with a real packet?
          </h3>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            Start with an account or review the public pricing
            model before your first unlock.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
            >
              <Link href="/sign-up?redirect=dashboard">Try a Diagnosis</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300">
              <Link href="/pricing">Review Pricing</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
