import type { DeepResearchReportViewModel } from '@/components/reports/report-types';

type Props = {
  reportViewModel: DeepResearchReportViewModel;
  labels?: Record<string, string>;
};

export function OutputGatesTab({ reportViewModel, labels = {} }: Props) {
  const { outputGates, parentReport } = reportViewModel;
  const gateTitle = parentReport.topFindings?.[0]?.title || 'Current understanding';
  const groupTitles = outputGates.evidenceGroupTitles || [];
  const gateItems = outputGates.gates || [];
  const readyCount = outputGates.readyCount ?? gateItems.filter((item) => item.status === 'Ready').length;
  const optionalCount = outputGates.optionalCount ?? Math.max(0, gateItems.length - readyCount);

  return (
    <div className="space-y-6">
      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>This week&apos;s output gates</h3>
            <p className="subhead">
              These gates are the visible checkpoints for the week. They should feel concrete,
              readable, and actually usable by a parent.
            </p>
          </div>
          <div className="section-note">Verification layer</div>
        </div>

        <div className="gates-hero" style={{ marginTop: 18 }}>
          <div className="gates-card soft">
            <div className="kicker">Why output gates exist</div>
            <h4>{outputGates.heroTitle || 'Use one or two clean checks to verify understanding, instead of adding more noisy practice.'}</h4>
            <p>
              {outputGates.heroBody ||
                'At least one gate should be visible each week, so the plan has a real checkpoint. The purpose is not to create volume. The purpose is to confirm whether the child can explain, rebuild, or transfer the structure with intention.'}
            </p>
          </div>

          <div className="gates-card">
            <div className="kicker">This week&apos;s setup</div>
            <div className="gates-meta">
              <div className="gates-meta-item">
                <div className="k">Ready now</div>
                <div className="v">{readyCount} gates</div>
                <div className="s">Explain and rebuild style gates are ready to use.</div>
              </div>
              <div className="gates-meta-item">
                <div className="k">Optional later</div>
                <div className="v">{optionalCount} gates</div>
                <div className="s">Transfer and spotting mistakes can wait.</div>
              </div>
              <div className="gates-meta-item">
                <div className="k">Parent rule</div>
                <div className="v">Keep it light</div>
                <div className="s">{outputGates.parentRule || 'One clean gate is enough for this week.'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Gate list</h3>
            <p className="subhead">
              Each gate below is framed as a small, high-signal check instead of a giant
              assignment.
            </p>
          </div>
        </div>

        <div className="gates-list" style={{ marginTop: 18 }}>
          {gateItems.map((item, index) => (
            <div key={item.gateCode || `${item.title}-${index}`} className={`gate-item ${item.status === 'Ready' ? 'ready' : 'optional'}`}>
              <div className="gate-top">
                <div className="gate-left">
                  <div className="gate-num">{String(index + 1)}</div>
                  <div>
                    <div className="gate-title">{item.title}</div>
                    <div className="gate-sub">{item.body}</div>
                  </div>
                </div>
                <span className={`tag ${item.status === 'Ready' ? 'green' : 'purple'}`}>{item.status}</span>
              </div>
              <div className="gate-body">
                <div className="gate-note">
                  <div className="k">{labels.whatThisVerifies || 'What this verifies'}</div>
                  <div className="v">{item.whatThisVerifies || gateTitle}</div>
                </div>
                <div className="gate-note">
                  <div className="k">How to check</div>
                  <div className="v">{item.howToCheck}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Parent reminder</h3>
            <p className="subhead">This page should lower pressure, not increase it.</p>
          </div>
        </div>

        <div className="gates-reminder" style={{ marginTop: 18 }}>
          {(outputGates.reminders || []).map((reminder) => (
            <div key={reminder.title} className="callout">
              <strong>{reminder.title}</strong>
              <div className="sub" style={{ marginTop: 0 }}>
                {reminder.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {groupTitles.length > 0 ? (
        <section className="panel pad">
          <div className="section-head">
            <div>
              <h3>Evidence surfaces</h3>
              <p className="subhead">These current evidence groups feed the visible gates.</p>
            </div>
          </div>
          <div className="chip-row">
            {groupTitles.map((title) => (
              <span key={title} className="chip">
                {title}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
