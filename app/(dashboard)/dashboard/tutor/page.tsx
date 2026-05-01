import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { listTutorWorkspaceForUser } from '@/lib/family/tutor-workspace';

export default async function TutorWorkspacePage() {
  const user = await getUser();
  if (!user) {
    notFound();
  }

  const items = await listTutorWorkspaceForUser(user.id);
  const latestItem = items[0] || null;
  const latestRecommendedFocus =
    latestItem?.recommendedFocus || 'Part-whole understanding is still the main leverage point.';
  const latestSecondaryFocus =
    latestItem?.secondaryFocus ||
    'Rebuild the concept, stabilize the process, then test one output gate.';

  return (
    <section className="space-y-6">
      <section className="panel pad">
        <div className="header-row">
          <div>
            <div className="breadcrumb">
              <span>Reports</span>
              <span>/</span>
              <span>Compare</span>
              <span>/</span>
              <span className="current">Tutor Share</span>
            </div>
            <h1>Share with Tutor</h1>
            <p className="muted" style={{ marginTop: 10 }}>
              A clean handoff page so the tutor sees diagnosis, shortest path, weekly plan, and
              current resume status in one summary.
            </p>
          </div>
          <Link className="btn btn-primary" href="/dashboard/reports">
            Back to Detail
          </Link>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel pad">
          <h3>Handoff summary</h3>
          <div className="list">
            <div className="list-item">
              <div className="title">Primary bottleneck</div>
              <div className="sub">{latestRecommendedFocus}</div>
            </div>
            <div className="list-item">
              <div className="title">Current weekly focus</div>
              <div className="sub">{latestSecondaryFocus}</div>
            </div>
            <div className="list-item">
              <div className="title">Tutor note</div>
              <div className="sub">
                Please keep the load controlled. Avoid pushing speed before the structure holds.
              </div>
            </div>
          </div>
          <div className="bottom-nav">
            <button type="button" className="btn btn-secondary">
              Copy summary
            </button>
            <button type="button" className="btn btn-secondary">
              Download PDF
            </button>
          </div>
        </div>

        <div className="panel pad">
          <h3>Share panel</h3>
          <div className="upload-drop">
            <div className="brand-mark" style={{ margin: '0 auto' }}>
              P
            </div>
            <h3>Send a clean context package</h3>
            <p className="sub" style={{ maxWidth: 520, margin: '10px auto 0' }}>
              This page stands in for the final share and export workflow. It keeps the output
              consistent with the rest of the desktop prototype.
            </p>
            <div className="bottom-nav" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button type="button" className="btn btn-primary">
                Generate tutor share link
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel pad">
        <h3>What is included in the handoff</h3>
        <div className="flow-list">
          {[
            ['1', 'Diagnosis', 'What the real bottleneck is.'],
            ['2', 'Shortest Path', 'Why this node comes first.'],
            ['3', '7-Day Plan', 'What to do this week.'],
            ['4', 'Compare', 'What improved and what stays next.'],
          ].map(([step, title, copy]) => (
            <div key={step} className="flow-step">
              <div className="kicker">{step}</div>
              <div className="title">{title}</div>
              <div className="sub">{copy}</div>
            </div>
          ))}
        </div>
      </section>

      {items.length > 0 ? (
        <section className="panel pad">
          <div className="section-head">
            <div>
              <h3>Active tutor-ready summaries</h3>
              <p>Real tutor share artifacts currently available in this workspace.</p>
            </div>
          </div>
          <div className="list">
            {items.map((item) => (
              <div key={item.reportId} className="list-item">
                <div className="title">{item.childNickname || 'Learner record'}</div>
                <div className="sub">Updated {new Date(item.lastUpdatedAt).toLocaleString()}</div>
                <div className="chip-row">
                  <span className="chip">
                    Recommended focus / {item.recommendedFocus || 'Not finalized yet'}
                  </span>
                  <span className="chip">
                    Secondary focus / {item.secondaryFocus || 'Not captured yet'}
                  </span>
                  <span className="chip">
                    Share status / {(item.releaseStatus || item.shareStatus).replaceAll('_', ' ')}
                  </span>
                </div>
                <div className="bottom-nav">
                  <Link className="btn btn-secondary" href={`/dashboard/reports/${item.reportId}`}>
                    Open Report
                  </Link>
                  {item.activeShareUrl ? (
                    <Link className="btn btn-primary" href={item.activeShareUrl}>
                      Open active link
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
