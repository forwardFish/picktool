'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteResourceButton } from '@/components/ui/delete-resource-button';
import { Textarea } from '@/components/ui/textarea';

type ReportHistoryItem = {
  id: number;
  runId: number;
  createdAt: string;
  summary: string | null;
  topFinding: string | null;
  compareSummary: string;
  parentNote: string | null;
  completedDays: number[];
};

type Props = {
  items: ReportHistoryItem[];
};

export function ReportHistoryClient({ items }: Props) {
  const [reports, setReports] = useState(items);
  const [saveError, setSaveError] = useState('');
  const [isPending, startTransition] = useTransition();

  function updateNote(reportId: number, parentNote: string) {
    setReports((current) =>
      current.map((item) => (item.id === reportId ? { ...item, parentNote } : item))
    );
  }

  function saveNote(reportId: number) {
    const report = reports.find((item) => item.id === reportId);
    if (!report) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ parentNote: report.parentNote }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setSaveError(payload.error || 'Unable to save note.');
        return;
      }

      setReports((current) =>
        current.map((item) =>
          item.id === reportId
            ? {
                ...item,
                parentNote: payload.parentReportJson?.parentNote || '',
              }
            : item
        )
      );
      setSaveError('');
    });
  }

  return (
    <div className="space-y-4">
      {reports.length > 0 ? (
        reports.map((report) => (
          <div key={report.id} className="pn-panel-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="pn-muted-label">Report #{report.id}</p>
                <p className="mt-2 text-sm text-[var(--pn-muted)]">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-[0.95rem]">
                <Link href={`/dashboard/reports/${report.id}`}>Open Report</Link>
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1rem] border border-[var(--pn-border)] bg-white p-4 text-sm text-[var(--pn-muted-2)]">
                <p className="font-semibold text-[#111827]">Top Finding</p>
                <p className="mt-2 leading-7">{report.topFinding || 'Finding label pending'}</p>
              </div>
              <div className="rounded-[1rem] border border-[var(--pn-border)] bg-white p-4 text-sm text-[var(--pn-muted-2)]">
                <p className="font-semibold text-[#111827]">Weekly Compare</p>
                <p className="mt-2 leading-7">{report.compareSummary}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--pn-muted-2)]">
              {report.summary || 'Summary text has not been finalized for this report yet.'}
            </p>

            <div className="mt-5 rounded-[1rem] border border-[var(--pn-border)] bg-white p-4">
              <p className="text-sm font-semibold text-[#111827]">Parent Review Note</p>
              <Textarea
                className="mt-3 min-h-28 rounded-[1rem]"
                value={report.parentNote || ''}
                onChange={(event) => updateNote(report.id, event.target.value)}
                placeholder="Write what felt easier this week, what stayed sticky, and what to try next."
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <Button type="button" onClick={() => saveNote(report.id)} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Note'
                  )}
                </Button>
                <p className="text-xs text-[var(--pn-muted)]">
                  Completed days: {(report.completedDays || []).join(', ') || 'none yet'}
                </p>
              </div>
              <div className="mt-4 border-t border-[var(--pn-border)] pt-4">
                <DeleteResourceButton
                  endpoint={`/api/reports/${report.id}`}
                  label="Delete Report"
                  pendingLabel="Deleting report..."
                  confirmMessage="Delete this report and revoke any linked tutor share URLs?"
                  onDeleted={() =>
                    setReports((current) => current.filter((item) => item.id !== report.id))
                  }
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="pn-panel-soft">
          <p className="text-sm leading-7 text-[var(--pn-muted)]">
            The weekly review timeline will appear after the first completed report.
          </p>
        </div>
      )}

      {saveError ? (
        <div className="pn-section-card border-red-200">
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      ) : null}
    </div>
  );
}
