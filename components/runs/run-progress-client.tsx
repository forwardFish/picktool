'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RunPayload = {
  id: number;
  status: 'queued' | 'running' | 'needs_review' | 'done' | 'failed';
  stage: 'queued' | 'preprocessing' | 'extracting' | 'composing' | 'review' | 'done' | 'failed';
  progressPercent: number;
  estimatedMinutes: number;
  statusMessage: string | null;
  overallConfidence?: number | null;
  needsReviewReason?: string | null;
  errorMessage?: string | null;
  reportId?: number | null;
  child?: { nickname?: string | null; grade?: string | null } | null;
  upload?: { totalPages?: number | null; sourceType?: string | null } | null;
  pageRecords?: Array<{
    id: number;
    pageNumber: number;
    isBlurry: boolean;
    isRotated: boolean;
    isDark: boolean;
  }>;
};

type Props = {
  initialRun: RunPayload;
  supportEmail: string;
};

const stages = [
  { id: 'queued', label: 'Queued' },
  { id: 'preprocessing', label: 'Quality checks' },
  { id: 'extracting', label: 'Evidence extraction' },
  { id: 'composing', label: 'Diagnosis draft' },
  { id: 'review', label: 'Manual review if needed' },
  { id: 'done', label: 'Ready' },
] as const;

function isTerminal(status: RunPayload['status']) {
  return status === 'done' || status === 'failed' || status === 'needs_review';
}

export function RunProgressClient({ initialRun, supportEmail }: Props) {
  const router = useRouter();
  const [run, setRun] = useState(initialRun);
  const [fetchError, setFetchError] = useState('');
  const [isRetryPending, startRetryTransition] = useTransition();

  useEffect(() => {
    if (isTerminal(run.status)) {
      return;
    }

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/runs/${run.id}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        setFetchError(payload.error || 'Unable to refresh run status.');
        return;
      }

      setRun(payload);
      setFetchError('');
    }, 2000);

    return () => window.clearInterval(timer);
  }, [run.id, run.status]);

  function retryRun() {
    startRetryTransition(async () => {
      const response = await fetch(`/api/runs/${run.id}/retry`, {
        method: 'POST',
      });
      const payload = await response.json();
      if (!response.ok) {
        setFetchError(payload.error || 'Retry failed.');
        return;
      }

      setRun(payload);
      setFetchError('');
      router.refresh();
    });
  }

  const qualityIssueCount =
    run.pageRecords?.filter((page) => page.isBlurry || page.isRotated || page.isDark).length || 0;
  const activeStageIndex = stages.findIndex((stage) => stage.id === run.stage);

  return (
    <div className="space-y-6">
      <div className="pn-section-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="pn-muted-label">Run #{run.id}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-[2rem] font-black tracking-[-0.04em] text-[#111827]">
                {run.child?.nickname || 'Diagnosis run'}
              </h2>
              <span className="pn-status-pill" data-status={run.status}>
                {run.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="rounded-full border border-[var(--pn-soft-border)] bg-[var(--pn-soft)] px-4 py-2 text-sm font-semibold text-[var(--pn-violet)]">
            {run.progressPercent}% complete
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm text-[var(--pn-muted)]">
            <span>{run.statusMessage || 'Preparing your diagnosis.'}</span>
            <span>ETA about {run.estimatedMinutes} min</span>
          </div>
          <div className="h-3 rounded-full bg-[#ecebfb]">
            <div
              className="h-3 rounded-full bg-[linear-gradient(90deg,var(--pn-indigo)_0%,var(--pn-violet)_100%)] transition-all"
              style={{ width: `${Math.min(100, Math.max(6, run.progressPercent))}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="pn-info-tile">
            <p className="pn-muted-label">Child</p>
            <p className="mt-2 text-sm font-semibold text-[#111827]">
              {run.child?.nickname || 'Unknown child'}
            </p>
          </div>
          <div className="pn-info-tile">
            <p className="pn-muted-label">Pages</p>
            <p className="mt-2 text-sm font-semibold text-[#111827]">
              {run.upload?.totalPages || 0} pages
            </p>
          </div>
          <div className="pn-info-tile">
            <p className="pn-muted-label">Quality flags</p>
            <p className="mt-2 text-sm font-semibold text-[#111827]">
              {qualityIssueCount} page(s) need attention
            </p>
          </div>
          <div className="pn-info-tile">
            <p className="pn-muted-label">Confidence</p>
            <p className="mt-2 text-sm font-semibold text-[#111827]">
              {typeof run.overallConfidence === 'number'
                ? `${Math.round(run.overallConfidence * 100)}%`
                : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      <div className="pn-section-card">
        <p className="pn-kicker">Lifecycle steps</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage, index) => {
            const isActive = run.stage === stage.id;
            const isComplete = activeStageIndex >= index || run.status === 'done';

            return (
              <div
                key={stage.id}
                className={`rounded-[1.35rem] border px-5 py-5 text-sm ${
                  isActive
                    ? 'border-[var(--pn-soft-border)] bg-[var(--pn-soft)]'
                    : isComplete
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-[var(--pn-border)] bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Loader2
                      className={`h-4 w-4 ${isActive ? 'animate-spin text-[var(--pn-violet)]' : 'text-gray-300'}`}
                    />
                  )}
                  <span className="font-semibold text-[#111827]">{stage.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {fetchError ? (
        <div className="pn-section-card border-red-200">
          <div className="flex items-start gap-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>{fetchError}</p>
          </div>
        </div>
      ) : null}

      {run.status === 'failed' ? (
        <div className="pn-section-card border-red-200">
          <p className="text-base leading-8 text-[var(--pn-muted-2)]">
            {run.errorMessage || 'This run failed before the diagnosis could be completed.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={retryRun} disabled={isRetryPending}>
              {isRetryPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retry Run
                </>
              )}
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${supportEmail}`}>Contact Support</a>
            </Button>
          </div>
        </div>
      ) : null}

      {run.status === 'needs_review' ? (
        <div className="pn-section-card border-amber-200">
          <p className="text-base leading-8 text-[var(--pn-muted-2)]">
            {run.needsReviewReason ||
              'The upload needs a manual review before the full diagnosis is released.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href={`mailto:${supportEmail}`}>Contact Support</a>
            </Button>
            <Button type="button" onClick={retryRun} disabled={isRetryPending}>
              Re-run After Re-upload
            </Button>
            {run.reportId ? (
              <Button asChild variant="outline">
                <Link href={`/dashboard/reports/${run.reportId}`}>Preview Draft Report</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {run.status === 'done' ? (
        <div className="pn-section-card border-emerald-200">
          <p className="text-base leading-8 text-[var(--pn-muted-2)]">
            The diagnosis is ready. Continue to the report to review the summary, evidence, and
            7-day plan.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {run.reportId ? (
              <Button asChild>
                <Link href={`/dashboard/reports/${run.reportId}`}>View Report</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
