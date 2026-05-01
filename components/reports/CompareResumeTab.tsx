import Link from 'next/link';
import type { DeepResearchReportViewModel } from '@/components/reports/report-types';

type Props = {
  reportViewModel: DeepResearchReportViewModel;
};

export function CompareResumeTab({ reportViewModel }: Props) {
  const { compare, history = [], parentReport, trend = [] } = reportViewModel;
  const confidenceScore =
    typeof parentReport.confidence === 'number' ? Math.round(parentReport.confidence * 100) : 62;

  return (
    <div className="space-y-6">
      <section className="grid-3">
        <div className="stat-card">
          <div className="title" style={{ fontWeight: 900, color: '#16a34a' }}>
            Improved
          </div>
          <p className="muted">
            {compare.improved || 'The child now explains the part-whole idea more clearly before solving.'}
          </p>
        </div>
        <div className="stat-card">
          <div className="title" style={{ fontWeight: 900, color: '#d97706' }}>
            Still uneven
          </div>
          <p className="muted">
            {compare.stillUneven || 'The process holds in guided tasks but weakens under changed wording.'}
          </p>
        </div>
        <div className="stat-card">
          <div className="title" style={{ fontWeight: 900, color: '#dc2626' }}>
            Needs support
          </div>
          <p className="muted">
            {compare.needsSupport || 'Mixed-problem confidence is still not stable enough to push volume.'}
          </p>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel pad">
          <h3>Trend</h3>
          <div className="chart">
            <div style={{ display: 'flex', alignItems: 'end', gap: 12, height: '100%' }}>
              {(compare.trendPoints || [48, 56, 60, 72, 66, 82, confidenceScore]).map((score, index) => (
                <div key={`${score}-${index}`} style={{ flex: 1 }}>
                  <div
                    style={{
                      height: `${Math.max(48, score * 1.3)}px`,
                      borderTopLeftRadius: 999,
                      borderTopRightRadius: 999,
                      background: 'linear-gradient(180deg,#a78bfa 0%,#7c3aed 100%)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel pad">
          <h3>Next suggested focus</h3>
          <p className="muted" style={{ fontSize: 19, lineHeight: 1.8 }}>
            {compare.nextSuggestedFocus ||
              parentReport.doThisWeek ||
              'Keep part-whole understanding as the main weekly focus. Use one transfer gate next week instead of pushing mixed-problem speed.'}
          </p>
          <div className="bottom-nav">
            <Link className="btn btn-secondary" href="/dashboard/reports">
              Back to Reports
            </Link>
            <Link className="btn btn-primary" href="/dashboard/children">
              Resume from child state
            </Link>
          </div>
        </div>
      </section>

      <section className="panel pad">
        <h3>Resume decision</h3>
        <div className="status-banner">
          {compare.resumeDecision ||
            'This is the final checkpoint in the detail flow. From here the user can either return to Reports, resume from the child state, or share the summary with a tutor.'}
        </div>
        {compare.compareSummary ? (
          <p className="subhead" style={{ marginTop: 16 }}>
            {compare.compareSummary}
          </p>
        ) : null}
        <div className="bottom-nav">
          <Link className="btn btn-secondary" href="/dashboard/reports">
            Back to Reports
          </Link>
          <Link className="btn btn-primary" href="/dashboard/tutor">
            Share with tutor
          </Link>
        </div>
      </section>

      {history.length > 0 ? (
        <section className="panel pad">
          <h3>Review history</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {history.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-[1rem] border border-[var(--pn-border)] p-4">
                <p className="text-sm font-semibold text-[#111827]">
                  {entry.primaryIssue || 'Current focus'}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--pn-muted-2)]">
                  {entry.compareSummary || 'Baseline report for this child.'}
                </p>
                <p className="mt-3 text-xs text-[var(--pn-muted)]">
                  Completed days: {(entry.completedDays || []).join(', ') || 'none yet'}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {trend.length > 0 ? (
        <section className="panel pad">
          <h3>Issue trends</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {trend.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-[1rem] border border-[var(--pn-border)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#111827]">
                    {entry.issueTitle || 'Trend summary'}
                  </p>
                  <span className="soft-pill">
                    {entry.trendDirection || 'new'} / {entry.occurrenceCount || 1}x
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--pn-muted-2)]">
                  {entry.summary || 'Trend summary unavailable.'}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
