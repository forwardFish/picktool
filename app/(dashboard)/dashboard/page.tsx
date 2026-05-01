import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Plus } from 'lucide-react';
import { SharedIntakeComposer } from '@/components/intake/shared-intake-composer';
import { getUser } from '@/lib/db/queries';
import { getOverviewWorkspace } from '@/lib/dashboard/get-overview-workspace';

type PageProps = {
  searchParams: Promise<{ resumeDraft?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const [query, user] = await Promise.all([searchParams, getUser()]);
  if (!user) {
    notFound();
  }

  const workspace = await getOverviewWorkspace(user.id);
  const resumeDraft = query.resumeDraft === '1';

  if (!workspace.selectedChild) {
    return (
      <section className="space-y-6">
        <section className="overview-focus-header">
          <div>
            <div className="breadcrumb">
              <span className="current">Overview</span>
              <span>/</span>
              <span>AI Learning Workspace</span>
            </div>
            <h1>Start your Pathnook workspace</h1>
            <p className="muted overview-focus-lead">
              Add your first child profile so the workspace can track real reports, runs, and next
              actions.
            </p>
          </div>
        </section>

        <section className="panel pad">
          <div className="overview-chat-only-top">
            <div>
              <div className="soft-badge">Empty state / No members yet</div>
              <h2 className="overview-chat-only-title">Start with your first child</h2>
            <p className="overview-chat-only-copy">
                {resumeDraft
                  ? 'No child profile yet; create one to continue this diagnosis.'
                  : 'Once a member exists, Pathnook can connect uploads, diagnosis runs, reports, and weekly follow-through in one workspace.'}
              </p>
            </div>
            <Link
              className="btn btn-primary"
              href={resumeDraft ? '/dashboard/children/new?resumeDraft=1' : '/dashboard/children/new'}
            >
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </section>
    );
  }

  const selectedChild = workspace.selectedChild;
  const latestReport = workspace.latestReport;
  const currentFocus = workspace.currentFocus;
  const nextAction = workspace.nextBestAction;
  const promptChips = workspace.suggestionChips;

  return (
    <section className="space-y-6">
      <section className="overview-focus-header">
        <div>
          <div className="breadcrumb">
            <span className="current">Overview</span>
            <span>/</span>
            <span>AI Learning Workspace</span>
          </div>
          <h1>Talk to Pathnook</h1>
          <p className="muted overview-focus-lead">
            This workspace reflects the real member, latest diagnosis, pending run, and next action
            instead of a demo summary.
          </p>
        </div>
      </section>

      <section className="overview-members overview-members-compact">
        <div className="section-kicker">Select a member</div>
        <div className="member-chip-row compact-row">
          {workspace.members.map((member) => (
            <Link
              key={member.childId}
              href={member.href}
              className={`member-chip compact ${
                member.childId === selectedChild.id ? 'active' : ''
              }`}
            >
              <div className="avatar" style={{ display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                {member.avatarLabel}
              </div>
              <div className="member-chip-body">
                <div className="member-chip-name">{member.displayName}</div>
                <div className="member-chip-grade">{member.gradeLabel}</div>
              </div>
            </Link>
          ))}

          <Link href="/dashboard/children/new" className="member-chip compact member-chip-add">
            <div className="member-chip-add-icon">+</div>
            <div className="member-chip-add-text">Add Member</div>
          </Link>
        </div>
      </section>

      <section className="panel pad overview-chat-only-panel">
        <div className="overview-chat-only-top">
          <div>
            <div className="soft-badge">
              Selected member / {selectedChild.nickname} / {selectedChild.grade}
            </div>
            <h2 className="overview-chat-only-title">
              {currentFocus?.title || 'What do you want help with today?'}
            </h2>
            <p className="overview-chat-only-copy">
              {currentFocus?.description ||
                'Upload recent schoolwork, describe the current difficulty, or resume the latest diagnosis flow.'}
            </p>
            {selectedChild.note ? (
              <p className="muted overview-focus-lead">Parent note: {selectedChild.note}</p>
            ) : null}
          </div>
          <Link
            className="btn btn-primary"
            href={`/dashboard/children/${selectedChild.id}/upload${
              resumeDraft ? '?resumeDraft=1' : ''
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>New Diagnosis</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overview-chat-only-prompts">
          {promptChips.map((chip) => (
            <button key={chip} type="button" className="prompt-chip">
              {chip}
            </button>
          ))}
        </div>

        <SharedIntakeComposer
          variant="overview"
          childId={selectedChild.id}
          childNickname={selectedChild.nickname}
          resumeDraft={resumeDraft}
        />
      </section>

      <section className="overview-hint-row">
        <Link
          href={
            workspace.pendingRun
              ? `/dashboard/runs/${workspace.pendingRun.id}`
              : `/dashboard/children/${selectedChild.id}/upload`
          }
          className="hint-card"
        >
          <div className="hint-kicker">Continue</div>
          <div className="hint-title">
            {workspace.pendingRun ? 'Latest unfinished run' : 'No active run yet'}
          </div>
          <div className="hint-copy">
            {workspace.pendingRun
              ? `${workspace.pendingRun.childNickname}'s run is at ${workspace.pendingRun.stage}.`
              : 'Upload recent work to create the next diagnosis run.'}
          </div>
        </Link>
        <Link
          href={latestReport ? `/dashboard/reports/${latestReport.id}` : '/dashboard/reports'}
          className="hint-card"
        >
          <div className="hint-kicker">Recent report</div>
          <div className="hint-title">
            {latestReport?.topFinding || 'No published report yet'}
          </div>
          <div className="hint-copy">
            {latestReport?.summary ||
              'The latest report will appear here once the first diagnosis is complete.'}
          </div>
        </Link>
        <Link href={`/dashboard/children/${selectedChild.id}`} className="hint-card">
          <div className="hint-kicker">Current context</div>
          <div className="hint-title">
            {selectedChild.nickname} / {selectedChild.curriculum}
          </div>
          <div className="hint-copy">
            {currentFocus?.description ||
              'Open the child workspace to review history, subject summaries, and the latest next move.'}
          </div>
        </Link>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Recent activity</h3>
            <p>Real workspace events from the current household.</p>
          </div>
          <div className="section-note">
            Plan / {workspace.billingSnapshot.planName || 'Free setup state'}
          </div>
        </div>
        <div className="list" style={{ marginTop: 18 }}>
          {workspace.recentActivity.length > 0 ? (
            workspace.recentActivity.map((activity) => (
              <div key={activity.id} className="list-item">
                <div className="title">{activity.title}</div>
                <div className="sub">{activity.timestamp}</div>
              </div>
            ))
          ) : (
            <div className="list-item">
              <div className="title">No recent activity yet</div>
              <div className="sub">Your first diagnosis and review events will appear here.</div>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
