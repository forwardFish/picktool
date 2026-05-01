import type { Metadata } from 'next';
import {
  ONE_TIME_REFUND_WINDOW_DAYS,
  SUBSCRIPTION_REFUND_WINDOW_DAYS,
} from '@/lib/site/public-trust';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Pathnook FAQ',
  description:
    'Read common Pathnook questions about billing, diagnosis workflows, refunds, and tutor sharing.',
  alternates: {
    canonical: '/faq'
  }
};

const faqItems = [
  {
    question: 'Who can use Pathnook?',
    answer:
      'Pathnook is designed for parents, guardians, and other authorized adult account holders. Children may not create accounts directly.',
  },
  {
    question: 'What does a purchase unlock?',
    answer:
      'A one-time purchase unlocks one diagnosis workflow. Monthly and annual plans unlock recurring Pathnook software access and report continuity while billing remains active.',
  },
  {
    question: 'Who handles billing?',
    answer:
      'Freemius handles checkout, invoices, recurring billing, and the billing portal as Merchant of Record. Pathnook handles report access, entitlements, product support, and the billing-management page that opens the Freemius portal when billing actions are needed.',
  },
  {
    question: 'How do I cancel a subscription?',
    answer:
      'Recurring plans are canceled through the Freemius billing portal. Cancellation stops future renewals and does not promise retroactive refunds for prior billing periods.',
  },
  {
    question: 'What if I need a refund?',
    answer:
      `Unused one-time credits may be reviewed within ${ONE_TIME_REFUND_WINDOW_DAYS} days of purchase. Recurring-plan refund review is generally limited to the first ${SUBSCRIPTION_REFUND_WINDOW_DAYS} days of the initial billing cycle. After a diagnosis has been completed or recurring access has already been substantially used, refunds are generally limited to duplicate charge, technical failure, billing error, unauthorized charge confirmed after review, or legal requirement.`,
  },
  {
    question: 'Can I share a report with a tutor?',
    answer:
      'Yes. Pathnook is designed to keep the output share-safe so another adult helper can understand the diagnosis context without digging through every original upload.',
  },
] as const;

export default function FaqPage() {
  return (
    <main className="pn-doc-shell">
      <section className="pn-doc-card overflow-hidden">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
              }
            }))
          }}
        />
        <p className="pn-kicker">FAQ</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.04em] text-[#111827] sm:text-6xl">
          Common Pathnook questions
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--pn-muted-2)] sm:text-xl">
          Straight answers about access, billing, refunds, and how Pathnook fits
          into a family&apos;s weekly learning rhythm.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {faqItems.map((item) => (
            <article
              key={item.question}
              className="rounded-[1.75rem] border border-[var(--pn-border)] bg-[linear-gradient(180deg,var(--pn-soft-2)_0%,white_100%)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-7"
            >
              <h2 className="max-w-[22ch] text-[1.65rem] font-black leading-tight tracking-[-0.03em] text-[#111827]">
                {item.question}
              </h2>
              <p className="mt-3 text-[1.05rem] leading-8 text-[var(--pn-muted)] sm:text-[1.1rem]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
