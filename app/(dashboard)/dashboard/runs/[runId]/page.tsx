import { notFound } from 'next/navigation';
import { RunProgressClient } from '@/components/runs/run-progress-client';
import { FAMILY_EDU_SUPPORT_EMAIL } from '@/lib/family/config';
import { getUser } from '@/lib/db/queries';
import { getRunForUser } from '@/lib/family/repository';

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunPage({ params }: PageProps) {
  const [{ runId }, user] = await Promise.all([params, getUser()]);

  if (!user) {
    notFound();
  }

  const run = await getRunForUser(user.id, Number(runId));
  if (!run) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="pn-section-card">
        <p className="pn-kicker">Analysis Lifecycle</p>
        <h1 className="pn-section-title mt-3">Diagnosis run progress</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
          Long-running OCR and analysis work stays here so the dashboard never blocks. Keep queued,
          running, failed, needs-review, and ready states explicit.
        </p>
      </div>

      <RunProgressClient initialRun={run as any} supportEmail={FAMILY_EDU_SUPPORT_EMAIL} />
    </section>
  );
}
