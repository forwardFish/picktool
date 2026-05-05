'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { DecisionForm } from '@/components/picktool/decision-form';
import { DecisionResultView } from '@/components/picktool/decision-result';
import type { DecisionResult } from '@/lib/schemas/toolDecision';

export function HomeDecisionSearch() {
  const [submittedTask, setSubmittedTask] = useState('');
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  async function requestDecision(task: string) {
    setSubmittedTask(task);
    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: task })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to create a decision result.');
      }

      setDecision(payload as DecisionResult);
    } catch (error) {
      setDecision(null);
      setApiError(error instanceof Error ? error.message : 'Unable to create a decision result.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <DecisionForm onTaskSubmit={requestDecision} disabled={isLoading} />

      {isLoading ? (
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-cyan-300/24 bg-cyan-300/8 p-5 text-center text-cyan-50">
          Matching your task to a local decision template...
        </div>
      ) : null}

      {apiError ? (
        <div className="mx-auto mt-8 flex max-w-3xl gap-3 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-5 text-left text-rose-50">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>{apiError}</p>
        </div>
      ) : null}

      {decision ? (
        <div id="decision-result" className="mx-auto mt-10 w-full max-w-7xl text-left">
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-cyan-300/24 bg-cyan-300/8 p-4 text-sm text-cyan-50 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {decision.matched
                ? 'Decision result generated from the local MVP decision engine.'
                : 'No exact template matched yet. Showing the fallback decision path.'}
            </span>
            <Link href={`/results?task=${encodeURIComponent(submittedTask)}`} className="inline-flex items-center gap-2 font-semibold text-cyan-100">
              Open full result <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <DecisionResultView decision={decision} compact />
        </div>
      ) : null}
    </div>
  );
}
