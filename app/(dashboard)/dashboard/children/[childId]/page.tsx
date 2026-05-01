import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReportHistoryClient } from '@/components/children/report-history-client';
import { getUser } from '@/lib/db/queries';
import { getMembersPageData } from '@/lib/members/get-members-page-data';

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const [{ childId }, user] = await Promise.all([params, getUser()]);

  if (!user) {
    notFound();
  }

  const data = await getMembersPageData(user.id, Number(childId));
  if (!data.selectedMember) {
    notFound();
  }

  const selected = data.selectedMember;

  return (
    <section className="space-y-6">
      <section className="panel pad">
        <div className="header-row">
          <div>
            <div className="breadcrumb">
              <Link href="/dashboard/children" className="current">
                Members
              </Link>
              <span>/</span>
              <span>{selected.displayName}</span>
            </div>
            <h1>Child Detail</h1>
            <p className="muted" style={{ marginTop: 10 }}>
              This page ties the child profile, recent reports, current focus, and next move into
              one real workspace summary.
            </p>
          </div>
          <div className="stats-inline">
            <span className="soft-pill">{selected.gradeLabel}</span>
            <span className="soft-pill">{data.recentReports.length} reports</span>
            <span className="soft-pill">{selected.currentPlanStatus}</span>
          </div>
        </div>
      </section>

      <section className="detail-shell">
        <div className="panel pad">
          <div className="profile-card">
            <div className="avatar" style={{ display: 'grid', placeItems: 'center', fontWeight: 800 }}>
              {selected.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="title" style={{ fontSize: 26 }}>
                {selected.displayName}
              </div>
              <div className="sub">
                {selected.gradeLabel} / {selected.curriculum}
              </div>
              <div className="chip-row">
                <span className="chip">Current focus / {selected.currentFocus}</span>
                <span className="chip">
                  Recent score / {selected.recentScore !== null ? selected.recentScore : 'Pending'}
                </span>
                <span className="chip">
                  Weekly review / {selected.lastWeeklyReviewDate || 'Not yet generated'}
                </span>
              </div>
            </div>
          </div>

          <div className="note-grid" style={{ marginTop: 18 }}>
            <div className="callout">
              <strong>Current bottleneck</strong>
              <div className="sub" style={{ marginTop: 0 }}>
                {selected.currentFocus}
              </div>
            </div>
            <div className="callout">
              <strong>Next move</strong>
              <div className="sub" style={{ marginTop: 0 }}>
                {selected.nextMove}
              </div>
            </div>
            {selected.note ? (
              <div className="callout">
                <strong>Parent note</strong>
                <div className="sub" style={{ marginTop: 0 }}>
                  {selected.note}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel pad">
          <h3>Quick actions</h3>
          <div className="list">
            <div className="list-item">
              <div className="title">Start or continue diagnosis</div>
              <div className="sub">
                <Link className="link-arrow" href={`/dashboard/children/${selected.id}/upload`}>
                  Open upload workspace
                </Link>
              </div>
            </div>
            <div className="list-item">
              <div className="title">Open latest report</div>
              <div className="sub">
                <Link
                  className="link-arrow"
                  href={
                    data.recentReports[0]
                      ? `/dashboard/reports/${data.recentReports[0].id}`
                      : '/dashboard/reports'
                  }
                >
                  Go to detail
                </Link>
              </div>
            </div>
            <div className="list-item">
              <div className="title">Back to members workspace</div>
              <div className="sub">
                <Link className="link-arrow" href="/dashboard/children">
                  Return to member switcher
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Subject summaries</h3>
            <p>Derived from recent reports, issue trends, and review history.</p>
          </div>
        </div>
        <div className="note-grid" style={{ marginTop: 18 }}>
          {data.subjectSummaries.length > 0 ? (
            data.subjectSummaries.map((summary) => (
              <div key={`${summary.title}-${summary.statusLabel}`} className="callout">
                <strong>{summary.title}</strong>
                <div className="sub" style={{ marginTop: 0 }}>
                  {summary.progressLabel} / {summary.statusLabel}
                </div>
                <div className="sub" style={{ marginTop: 0 }}>
                  {summary.mostRecentFocus}
                </div>
              </div>
            ))
          ) : (
            <div className="callout">
              <strong>No subject summaries yet</strong>
              <div className="sub" style={{ marginTop: 0 }}>
                Complete the first diagnosis to start tracking focus and review patterns.
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Recent reports for {selected.displayName.split(' ')[0]}</h3>
            <p>Use the review timeline to compare runs and keep weekly notes in one place.</p>
          </div>
        </div>
        <ReportHistoryClient items={data.recentReports as any} />
      </section>
    </section>
  );
}
