import type { DeepResearchReportViewModel } from '@/components/reports/report-types';

type Props = {
  reportViewModel: DeepResearchReportViewModel;
};

const phases = [
  {
    step: '1',
    title: 'Stabilize part-whole understanding',
    tag: 'Current',
    copy: 'Build a solid concept foundation and number sense.',
    duration: 'Estimated 3-4 days',
  },
  {
    step: '2',
    title: 'Build solution process',
    tag: 'Next',
    copy: 'Learn the standard process to solve problems.',
    duration: 'Estimated 3-4 days',
  },
  {
    step: '3',
    title: 'Transfer to new problem types',
    tag: 'Later',
    copy: 'Apply the same structure in changed surfaces.',
    duration: 'Estimated 2-3 days',
  },
  {
    step: '4',
    title: 'Strengthen speed & accuracy',
    tag: 'Later',
    copy: 'Improve fluency and reduce careless errors.',
    duration: 'Estimated 2-3 days',
  },
] as const;

export function ShortestPathTab({ reportViewModel }: Props) {
  const { shortestPath, parentReport } = reportViewModel;
  const primaryFinding = parentReport.topFindings?.[0];
  const phasesToRender =
    shortestPath.phases && shortestPath.phases.length > 0 ? shortestPath.phases : phases;

  return (
    <div className="space-y-6">
      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Shortest path overview</h3>
            <p className="subhead">
              {shortestPath.overviewCopy ||
                'Make the path easy to scan. The parent should instantly see the current stage, what comes next, and what is intentionally postponed.'}
            </p>
          </div>
          <div className="section-note">Sequence layer</div>
        </div>

        <div className="rptv3-banner" style={{ marginTop: 16 }}>
          {shortestPath.banner ||
            'This path is intentionally narrow: concept first, process second, transfer third, and speed last. The goal is to restore leverage, not create more work.'}
        </div>

        <div className="rptv3-phase-list" style={{ marginTop: 16 }}>
          {phasesToRender.map((phase, index) => (
            <div key={phase.step} className={`rptv3-phase ${index === 0 ? 'active' : ''}`}>
              <div className="rptv3-phase-num">{phase.step}</div>
              <div>
                <div className="rptv3-phase-title">{phase.title}</div>
                <div className="rptv3-phase-copy">
                  {phase.copy ||
                    (index === 0
                      ? primaryFinding?.whatToDo ||
                        parentReport.doThisWeek ||
                        'Build a solid concept foundation and number sense.'
                      : index === 1
                        ? 'Learn the standard process to solve problems.'
                        : index === 2
                          ? 'Apply the same structure in changed surfaces.'
                          : 'Improve fluency and reduce careless errors.')}
                </div>
                <div className="rptv3-phase-copy">
                  {phase.duration || (index <= 1 ? 'Estimated 3-4 days' : 'Estimated 2-3 days')}
                </div>
              </div>
              <span
                className={`tag ${
                  phase.tag === 'Current'
                    ? 'green'
                    : phase.tag === 'Next'
                      ? 'purple'
                      : 'amber'
                }`}
              >
                {phase.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>Path summary</h3>
            <p className="subhead">
              Use this block to explain why this path exists. Keep the visible layer short; let
              supporting explanation open below.
            </p>
          </div>
          <div className="section-note">Reasoning layer</div>
        </div>

        <div className="rptv3-grid-2 equal" style={{ marginTop: 18 }}>
          <div className="stack">
            <div className="rptv3-metric">
              <div className="k">Current node</div>
              <div className="v">{shortestPath.currentNode || primaryFinding?.title || 'Part-whole understanding'}</div>
              <div className="s">The present leverage point behind this week's work.</div>
            </div>

            <div className="rptv3-metric rptv3-soft">
              <div className="k">Key leverage</div>
              <div className="v">
                {shortestPath.keyLeverage ||
                  primaryFinding?.rationale ||
                  'Around 80% of current errors connect back to this node.'}
              </div>
              <div className="s">
                {shortestPath.leverageCopy ||
                  'That is why the path is narrow and why the recommendation is to resist adding more content too early.'}
              </div>
              <div className="chip-row">
                <span className="chip">Current node / concept</span>
                <span className="chip">Next node / process</span>
                <span className="chip">Later node / transfer</span>
              </div>
            </div>
          </div>

          <div className="stack">
            {[
              {
                icon: 'amber',
                title: 'Why first',
                sub: 'It unlocks the strategy layer that depends on it.',
                body: shortestPath.whyFirst ||
                  'If this step stays weak, process work will look like progress but will break again as soon as the surface changes.',
              },
              {
                icon: 'green',
                title: 'What this step solves',
                sub: 'Word problems with part-whole confusion, missing quantity, or misinterpreting the whole.',
                body: shortestPath.whatThisSolves ||
                  'Multi-step success improves, transfer gets easier, and confidence rises without adding unnecessary load.',
              },
              {
                icon: 'blue',
                title: 'What waits',
                sub: 'Mixed-complex problems and multi-step operations should wait until the foundation is stable.',
                body: shortestPath.whatWaits ||
                  'After the child can explain the whole and the parts reliably, move into process building and only then test transfer.',
              },
            ].map((item, index) => (
              <details key={item.title} className="rptv3-accordion" open={index === 0}>
                <summary>
                  <div className="rptv3-acc-left">
                    <div className={`rptv3-acc-icon ${item.icon}`}>!</div>
                    <div>
                      <div className="rptv3-acc-title">{item.title}</div>
                      <div className="rptv3-acc-sub">{item.sub}</div>
                    </div>
                  </div>
                  <div className="rptv3-toggle">v</div>
                </summary>
                <div className="rptv3-acc-body">
                  <div className="rptv3-note">
                    <div className="k">Path reason</div>
                    <div className="v">{item.body}</div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="panel pad">
        <div className="section-head">
          <div>
            <h3>What to communicate to the child</h3>
            <p className="subhead">
              This section should feel calm and usable in real parenting. Lead with one visible
              message, then let coaching language expand on demand.
            </p>
          </div>
          <div className="section-note">Parent coaching layer</div>
        </div>

        <div className="rptv3-grid-2 equal" style={{ marginTop: 18 }}>
          <div className="rptv3-metric">
            <div className="k">Current focus</div>
            <div className="v">{shortestPath.communicationFocus || 'We are fixing the foundation.'}</div>
            <div className="s">
              This is the one message the child should feel most clearly this week.
            </div>
          </div>

          <div className="stack">
            {(shortestPath.communicationItems || [
              {
                title: 'Why this comes first',
                sub: 'It will make the next steps much easier.',
                body: 'Keep the language calm, simple, and reusable during the week.',
              },
              {
                title: 'What success looks like',
                sub: 'The child can explain the whole and the parts before solving.',
                body: 'Keep the language calm, simple, and reusable during the week.',
              },
              {
                title: 'What stays later',
                sub: 'Speed and mixed-problem volume stay out until the structure holds.',
                body: 'Keep the language calm, simple, and reusable during the week.',
              },
            ]).map((item, index) => (
              <details key={item.title} className="rptv3-accordion" open={index === 0}>
                <summary>
                  <div className="rptv3-acc-left">
                    <div className="rptv3-acc-icon purple">!</div>
                    <div>
                      <div className="rptv3-acc-title">{item.title}</div>
                      <div className="rptv3-acc-sub">{item.sub}</div>
                    </div>
                  </div>
                  <div className="rptv3-toggle">v</div>
                </summary>
                <div className="rptv3-acc-body">
                  <div className="rptv3-note">
                    <div className="k">Coaching note</div>
                    <div className="v">{item.body}</div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
