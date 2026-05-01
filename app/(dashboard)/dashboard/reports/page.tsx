import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Ellipsis,
  FileSearch,
  Filter,
  Lock,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react';
import { getUser } from '@/lib/db/queries';
import { getReportsDashboardData } from '@/lib/reports/get-reports-dashboard-data';

function getStatusTone(statusLabel: string, locked: boolean) {
  if (locked) {
    return 'pending';
  }

  if (statusLabel === 'Completed') {
    return 'completed';
  }

  if (statusLabel === 'Needs Review' || statusLabel === 'In Review') {
    return 'review';
  }

  return 'pending';
}

function getScoreTone(score: number) {
  if (score >= 85) {
    return 'good';
  }

  if (score >= 80) {
    return 'violet';
  }

  return 'amber';
}

export default async function ReportsPage() {
  const user = await getUser();
  if (!user) {
    notFound();
  }

  const data = await getReportsDashboardData(user.id);
  const statCards = [
    {
      label: 'Total Reports',
      value: data.stats.totalReports,
      copy: 'Across all members',
      icon: <FileSearch className="h-4 w-4" />,
    },
    {
      label: 'Completed',
      value: data.stats.completed,
      copy: 'Ready to review',
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: 'In Review',
      value: data.stats.inReview,
      copy: 'Still being finalized',
      icon: <Filter className="h-4 w-4" />,
    },
    {
      label: 'This Week',
      value: data.stats.thisWeek,
      copy: 'Recently generated',
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

  return (
    <section className="reports-page-shell space-y-6">
      <section className="panel pad">
        <div className="header-row">
          <div>
            <div className="breadcrumb">
              <span className="current">Reports</span>
              <span>/</span>
              <span>All Reports</span>
            </div>
            <h2>Reports Dashboard</h2>
            <p className="muted" style={{ marginTop: 10, maxWidth: 760 }}>
              This view is now driven by real report rows, recent activity, billing lock state,
              and unfinished plan counts.
            </p>
          </div>
          <Link className="btn btn-primary btn-large" href="/dashboard/children">
            New Diagnosis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="reports-stats-grid">
        {statCards.map((item) => (
          <div key={item.label} className="reports-stat-card">
            <div className="reports-stat-top">
              <p className="text-sm font-semibold text-[#64748b]">{item.label}</p>
              <span className="reports-stat-icon">{item.icon}</span>
            </div>
            <p className="reports-stat-value">{item.value}</p>
            <p className="reports-stat-copy">{item.copy}</p>
          </div>
        ))}
      </section>

      <section className="panel pad">
        <div className="header-row">
          <div>
            <h2>All Reports</h2>
            <p className="muted" style={{ marginTop: 10 }}>
              Use this page as the main desktop list for entering the detail flow.
            </p>
          </div>
          <button type="button" className="btn btn-secondary" disabled>
            <Filter className="mr-2 h-4 w-4" />
            Filters coming next
          </button>
        </div>

        <div className="reports-filters" style={{ marginTop: 18 }}>
          <div className="reports-search-shell">
            <Search className="reports-search-icon h-5 w-5" />
            <input
              readOnly
              value=""
              placeholder="Search report title, member, or subject"
              className="search"
            />
          </div>
          <select className="select" disabled>
            <option>All Members</option>
          </select>
          <select className="select" disabled>
            <option>All Subjects</option>
          </select>
          <select className="select" disabled>
            <option>All Status</option>
          </select>
        </div>

        <div className="reports-table-shell">
          <div className="reports-table-head">
            <div>Report</div>
            <div>Member</div>
            <div>Date</div>
            <div>Status</div>
            <div>Score</div>
            <div />
          </div>

          {data.reports.length > 0 ? (
            data.reports.map((report) => {
              const statusTone = getStatusTone(report.statusLabel, report.locked);
              const scoreTone = getScoreTone(report.score);

              return (
                <Link key={report.id} href={`/dashboard/reports/${report.id}`} className="block">
                  <div className="reports-table-row">
                    <div className="report-main">
                      <div className="icon-box">
                        <FileSearch className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="title">
                          {report.topFinding || 'Diagnosis finding not titled yet'}
                        </div>
                        <div className="sub">
                          {report.summary ||
                            'The report summary will appear here once the structured output is finalized.'}
                        </div>
                      </div>
                    </div>

                    <div className="member-mini">
                      <div
                        className="avatar"
                        style={{ display: 'grid', placeItems: 'center', color: 'var(--violet)', fontWeight: 800 }}
                      >
                        {(report.childNickname || 'L').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="title" style={{ fontSize: 14 }}>
                          {report.childNickname || 'Learner record'}
                        </div>
                        <div className="sub">
                          {report.childGrade || 'Grade not set'} / {report.sourceType || 'Subject pending'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="title" style={{ fontSize: 14 }}>
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div>
                      <span
                        className={`status-pill ${
                          statusTone === 'completed'
                            ? 'completed'
                            : statusTone === 'review'
                              ? 'review'
                              : 'pending'
                        }`}
                      >
                        {report.locked ? 'Locked' : report.statusLabel}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`score-pill ${
                          scoreTone === 'good'
                            ? 'green'
                            : scoreTone === 'violet'
                              ? 'violet'
                              : 'amber'
                        }`}
                      >
                        {report.score}
                      </span>
                    </div>

                    <div className="actions">
                      {report.locked ? <Lock className="h-4 w-4" /> : null}
                      <button type="button" className="icon-btn" aria-label="More actions">
                        <Ellipsis className="h-4 w-4" />
                      </button>
                      <button type="button" className="icon-btn" aria-label="Open report">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button type="button" className="icon-btn" aria-label="Share report">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="reports-table-row">
              <div className="sub">
                No reports yet. Start the first diagnosis to populate this dashboard with real
                report rows and activity.
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="reports-lower-grid">
        <div className="panel pad">
          <div className="header-row">
            <div>
              <h2>Recent Activity</h2>
              <p className="muted" style={{ marginTop: 10 }}>
                Latest report, run, and workspace events.
              </p>
            </div>
          </div>

          <div className="activity-stack" style={{ marginTop: 18 }}>
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <div key={`activity-${activity.id}`} className="activity-item">
                  <div className="title">{activity.title}</div>
                  <div className="sub">{activity.timestamp}</div>
                </div>
              ))
            ) : (
              <div className="activity-item">
                <div className="title">No recent activity yet</div>
                <div className="sub">Workspace events will appear here after the first diagnosis.</div>
              </div>
            )}
          </div>
        </div>

        <div className="panel pad">
          <div className="header-row">
            <div>
              <h2>Quick Overview</h2>
              <p className="muted" style={{ marginTop: 10 }}>
                Real aggregates derived from report state and unfinished plans.
              </p>
            </div>
          </div>

          <div className="list" style={{ marginTop: 18 }}>
            {data.quickOverview.reportCountBySubject.map((item) => (
              <div key={item.label} className="list-item">
                <div className="title">{item.label}</div>
                <div className="sub">{item.count} reports</div>
              </div>
            ))}
            <div className="list-item">
              <div className="title">Current focus count</div>
              <div className="sub">{data.quickOverview.currentFocusCount}</div>
            </div>
            <div className="list-item">
              <div className="title">Recent unfinished plans</div>
              <div className="sub">{data.quickOverview.unfinishedPlans}</div>
            </div>
            <div className="list-item">
              <div className="title">Review needed count</div>
              <div className="sub">{data.quickOverview.reviewNeededCount}</div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
