import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronDown, Plus } from 'lucide-react';
import { MemberTabs } from '@/components/dashboard/member-tabs';
import { getUser } from '@/lib/db/queries';
import { getMembersPageData } from '@/lib/members/get-members-page-data';

function toReportCards(recentReports: Awaited<ReturnType<typeof getMembersPageData>>['recentReports']) {
  return recentReports.map((report) => ({
    id: report.id,
    title: report.topFinding || 'Diagnosis finding not titled yet',
    createdAtLabel: new Date(report.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    statusLabel:
      report.releaseStatus
        ?.split('_')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || 'Draft',
    statusTone: report.releaseStatus === 'completed' ? 'completed' : 'pending',
  }));
}

export default async function ChildrenPage() {
  const user = await getUser();
  if (!user) {
    notFound();
  }

  const data = await getMembersPageData(user.id);

  if (!data.selectedMember) {
    return (
      <section className="members-page-shell space-y-6">
        <section className="panel pad">
          <div className="header-row">
            <div>
              <div className="breadcrumb">
                <span className="current">Members</span>
                <span>/</span>
                <span>Workspace</span>
              </div>
              <h1>Members workspace</h1>
              <p className="muted" style={{ marginTop: 10 }}>
                Add your first child profile to unlock real history, subject summaries, and
                diagnosis actions.
              </p>
            </div>
            <Link href="/dashboard/children/new" className="btn btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </div>
        </section>
      </section>
    );
  }

  const selected = data.selectedMember;
  const reportCards = toReportCards(data.recentReports);

  return (
    <section className="members-page-shell space-y-6">
      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
          <span className="text-[var(--pn-violet)]">Members</span>
          <span>/</span>
          <span className="text-[#64748b]">{selected.displayName}</span>
        </div>
        <Link
          href={`/dashboard/children/${selected.id}/upload`}
          className="inline-flex h-12 items-center rounded-[14px] bg-[linear-gradient(90deg,var(--pn-indigo),var(--pn-violet))] px-5 text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(124,58,237,0.18)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>New Diagnosis</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Link>
      </section>

      <section className="member-switcher">
        {data.members.map((member) => (
          <Link key={member.childId} href={member.href} className="block">
            <div className={`member-card ${member.active ? 'selected' : ''}`}>
              <div className="member-card-avatar" style={{ display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                {member.avatarLabel}
              </div>
              <div className="min-w-0">
                <div className="member-card-name">{member.displayName}</div>
                <div className="member-card-grade">{member.gradeLabel}</div>
              </div>
              {member.active ? <div className="member-card-check">OK</div> : null}
            </div>
          </Link>
        ))}

        <Link href="/dashboard/children/new" className="block">
          <div className="member-card add-member-card">
            <div className="add-member-circle">+</div>
            <div className="add-member-text">Add Member</div>
          </div>
        </Link>
      </section>

      <section className="member-detail-panel">
        <div className="member-detail-left">
          <div className="member-hero-avatar" style={{ display: 'grid', placeItems: 'center', fontWeight: 800 }}>
            {selected.displayName.slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="member-detail-head">
              <div>
                <h1>{selected.displayName}</h1>
                <span className="member-grade-pill">{selected.gradeLabel}</span>
              </div>
              <Link href={`/dashboard/children/${selected.id}`} className="member-edit-btn">
                Open Detail
              </Link>
            </div>

            <div className="member-info-list">
              <div className="member-info-row">
                <span className="member-info-label">Curriculum</span>
                <span className="member-info-value">{selected.curriculum}</span>
              </div>
              <div className="member-info-row">
                <span className="member-info-label">Current focus</span>
                <span className="member-info-value">{selected.currentFocus}</span>
              </div>
              <div className="member-info-row">
                <span className="member-info-label">Last diagnosis</span>
                <span className="member-info-value">
                  {selected.lastDiagnosisDate || 'No diagnosis yet'}
                </span>
              </div>
              <div className="member-info-row">
                <span className="member-info-label">Weekly review</span>
                <span className="member-info-value">
                  {selected.lastWeeklyReviewDate || 'No weekly review yet'}
                </span>
              </div>
              <div className="member-info-row">
                <span className="member-info-label">Plan state</span>
                <span className="member-info-value">{selected.currentPlanStatus}</span>
              </div>
              {selected.note ? (
                <div className="member-info-row">
                  <span className="member-info-label">Parent note</span>
                  <span className="member-info-value">{selected.note}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="member-detail-divider" aria-hidden />

        <div className="member-detail-right">
          <div className="member-detail-story">
            <h2>{selected.workspaceTitle}</h2>
            <p>{selected.workspaceSummary}</p>
          </div>

          <div className="member-aside-stack">
            <div className="member-aside-card">
              <div className="member-info-title">Next move</div>
              <p>{selected.nextMove}</p>
            </div>

            <div className="member-aside-grid">
              <div className="member-aside-card compact">
                <div className="member-info-title">Recent score</div>
                <p>{selected.recentScore !== null ? `${selected.recentScore} / 100` : 'Pending'}</p>
              </div>
              <div className="member-aside-card compact">
                <div className="member-info-title">Plan status</div>
                <p>{selected.currentPlanStatus}</p>
              </div>
            </div>

            {selected.note ? (
              <div className="member-aside-card compact">
                <div className="member-info-title">Parent note</div>
                <p>{selected.note}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <MemberTabs
        childId={selected.id}
        subjectCards={data.subjectSummaries}
        reports={reportCards}
        recentCompletedReports={reportCards.filter((report) => report.statusTone === 'completed')}
        currentRun={data.currentRun}
      />
    </section>
  );
}
