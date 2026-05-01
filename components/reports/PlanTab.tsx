'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import type { DayPlan } from '@/components/reports/report-types';

type Props = {
  reportId: number;
  sevenDayPlan: DayPlan[];
  guardrail?: string;
  initialCompletedDays?: number[];
  labels?: Record<string, string>;
};

export function PlanTab({
  reportId,
  sevenDayPlan,
  guardrail,
  initialCompletedDays = [],
  labels = {},
}: Props) {
  const [completedDays, setCompletedDays] = useState<number[]>(initialCompletedDays);
  const [saveError, setSaveError] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggleDay(day: number) {
    startTransition(async () => {
      const nextCompletedDays = completedDays.includes(day)
        ? completedDays.filter((item) => item !== day)
        : [...completedDays, day].sort((left, right) => left - right);

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ completedDays: nextCompletedDays }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setSaveError(payload.error || labels.unableToSaveDayProgress || 'Unable to save day progress.');
        return;
      }

      setCompletedDays(
        payload.reportViewModel?.plan?.completedDays ||
          payload.parentReportJson?.completedDays ||
          nextCompletedDays
      );
      setSaveError('');
    });
  }

  return (
    <div className="space-y-6">
      <section className="panel pad">
        <h3>This week&apos;s action grid</h3>
        <div className="status-banner">
          This week&apos;s goal: rebuild the concept, stabilize the process, then test it through
          one small output checkpoint.
        </div>
        <div className="day-list" style={{ marginTop: 18 }}>
          {sevenDayPlan.map((day) => {
            const isDone = typeof day.day === 'number' && completedDays.includes(day.day);
            return (
              <div key={day.day} className="day-row">
                <div className="day-badge">
                  {labels.day || 'Day'} {day.day}
                </div>
                <div>
                  <div className="title">{day.goal}</div>
                  <div className="sub">{day.practice}</div>
                </div>
                <button
                  type="button"
                  className="mini-note"
                  onClick={() => typeof day.day === 'number' && toggleDay(day.day)}
                  disabled={isPending || typeof day.day !== 'number'}
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isDone ? 'Done' : 'Mark done'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {saveError ? (
        <section className="panel pad">
          <p className="subhead" style={{ color: '#dc2626' }}>
            {saveError}
          </p>
        </section>
      ) : null}

      <section className="panel pad">
        <h3>Why this schedule works</h3>
        <div className="note-grid">
          <div className="callout">
            <strong>Early week</strong>
            <div className="sub" style={{ marginTop: 0 }}>
              Rebuild the concept and get the child naming the structure before solving.
            </div>
          </div>
          <div className="callout">
            <strong>Late week</strong>
            <div className="sub" style={{ marginTop: 0 }}>
              Add only a small transfer check. Keep the load light and controlled.
            </div>
          </div>
        </div>
      </section>

      <section className="panel pad">
        <h3>Parent reminder</h3>
        <div className="callout">
          <strong>Guardrail</strong>
          <div className="sub" style={{ marginTop: 0 }}>
            {guardrail ||
              labels.practiceCoachingGuardrail ||
              'Use the plan for practice coaching, not direct homework answers.'}
          </div>
        </div>
      </section>
    </div>
  );
}
