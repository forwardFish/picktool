import type { DeepResearchReportViewModel } from '@/components/reports/report-types';

type Props = {
  reportViewModel: DeepResearchReportViewModel;
};

export function DiagnosisTab({ reportViewModel }: Props) {
  const { diagnosis, parentReport } = reportViewModel;
  const topFindings = parentReport.topFindings || [];
  const primaryFinding = topFindings[0];
  const confidenceScore = diagnosis.confidenceScore || 62;
  const summary = diagnosis.summary || 'Diagnosis summary unavailable.';
  const childName = parentReport.childNickname || 'Member';
  const accordionItems = diagnosis.accordionItems || [];
  const summaryCards = diagnosis.summaryCards || [];

  return (
    <div className="space-y-6">
      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>This run concludes</h3>
            <p className="subhead">
              {diagnosis.subheading ||
                'Start with judgment, not overload. The goal of this section is to help the parent quickly see what this run is actually saying.'}
            </p>
          </div>
          <div className="section-note">Primary judgment layer</div>
        </div>

        <div className="rptv3-grid-2" style={{ marginTop: 18 }}>
          <div className="rptv3-card rptv3-soft">
            <div className="kicker">Main conclusion</div>
            <h2 className="rptv3-title">
              {diagnosis.mainConclusion ||
                primaryFinding?.title ||
                'The current report has not yet produced a stable main conclusion.'}
            </h2>
            <p className="rptv3-copy">{summary}</p>
            <div className="chip-row">
              {(diagnosis.chips || []).map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="rptv3-card">
            <div className="kicker">Confidence score</div>
            <div className="score-shell" style={{ marginTop: 10 }}>
              <div className="score-ring" />
              <div className="score-core">
                <strong>{confidenceScore}</strong>
                <span>{diagnosis.confidenceLabel || (confidenceScore >= 55 ? 'medium-high' : 'developing')}</span>
              </div>
              <div>
                <div className="title">Overall learning confidence</div>
                <div className="sub">
                  {diagnosis.confidenceCopy ||
                    'Stronger than the previous run, but still not stable enough under changed wording.'}
                </div>
              </div>
            </div>

            <div className="rptv3-kpis">
              {(diagnosis.kpis || []).map((item) => (
                <div key={`${item.label}-${item.value}`} className="rptv3-kpi">
                  <div className="kicker">{item.label}</div>
                  <h4>{item.value}</h4>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Judgment layer</h3>
            <p className="subhead">
              This is where the real issue is surfaced. Supporting explanation stays inside
              accordions.
            </p>
          </div>
        </div>

        <div className="rptv3-accordion-grid" style={{ marginTop: 18 }}>
          {accordionItems.map((item, index) => (
            <details key={item.title} className="rptv3-accordion" open={index === 0}>
              <summary>
                <div className="rptv3-acc-left">
                  <div className={`rptv3-acc-icon ${item.icon}`}>{item.symbol}</div>
                  <div>
                    <div className="rptv3-acc-title">{item.title}</div>
                    <div className="rptv3-acc-sub">{item.sub}</div>
                  </div>
                </div>
                <div className="rptv3-toggle">v</div>
              </summary>
              <div className="rptv3-acc-body">
                <div className="rptv3-note">
                  <div className="k">{item.noteKey}</div>
                  <div className="v">{item.noteValue}</div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Skeleton map</h3>
            <p className="subhead">
              A focused visual that locates the bottleneck without turning the page into a
              dashboard.
            </p>
          </div>
          <div className="section-note">Focus map</div>
        </div>

        <div className="rptv3-card" style={{ marginTop: 18 }}>
          <div className="rptv3-grid-3">
            {(diagnosis.skeletonMetrics || []).map((item) => (
              <div key={`${item.label}-${item.value}`} className="rptv3-metric">
                <div className="k">{item.label}</div>
                <div className="v">{item.value}</div>
                <div className="s">{item.copy}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chip-row">
          {(diagnosis.chips || []).map((chip) => (
            <span key={`summary-${chip}`} className="chip">
              {chip}
            </span>
          ))}
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Summary snapshot</h3>
            <p className="subhead">
              A compact executive summary. This part helps the parent decide where to go next.
            </p>
          </div>
          <div className="section-note">Decision layer</div>
        </div>

        <div className="rptv3-grid-2 equal" style={{ marginTop: 18 }}>
          <div className="rptv3-summary-stack">
            {summaryCards.map((item) => (
              <div key={item.title} className="rptv3-summary">
                <div className="rptv3-summary-icon">{item.icon}</div>
                <div>
                  <div className="rptv3-summary-title">{item.title}</div>
                  <div className="rptv3-summary-main">{item.main}</div>
                  <div className="rptv3-summary-sub">{item.sub}</div>
                </div>
                <div className="rptv3-summary-right">
                  <strong>{item.right}</strong>
                  {item.badge ? <span className="tag green">{item.badge}</span> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="rptv3-summary-stack">
            {(diagnosis.insightCards || [
              { title: 'Child', value: childName, copy: parentReport.grade || 'Current report scope' },
              { title: 'Source', value: parentReport.sourceType || 'Upload', copy: 'Evidence-backed diagnosis' },
              {
                title: 'Do this week',
                value: parentReport.doThisWeek || 'Rebuild the concept before adding more strategy.',
                copy: 'Keep the task load narrow and intentional.',
              },
            ]).map((item) => (
              <div key={`${item.title}-${item.value}`} className="rptv3-summary">
                <div className="rptv3-summary-icon">*</div>
                <div>
                  <div className="rptv3-summary-title">{item.title}</div>
                  <div className="rptv3-summary-main">{item.value}</div>
                  <div className="rptv3-summary-sub">{item.copy}</div>
                </div>
                <div className="rptv3-summary-right">
                  <strong>{item.title}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
