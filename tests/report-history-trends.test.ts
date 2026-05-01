import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDeepResearchReportViewModel } from '../lib/family/report-read-model.ts';

test('buildDeepResearchReportViewModel exposes review history and issue trends', () => {
  const viewModel = buildDeepResearchReportViewModel({
    reportId: 7,
    parentReport: {
      summary: 'Calculation slip is still the clearest pattern.',
      confidence: 0.76,
      doThisWeek: 'Slow down subtraction checks.',
      completedDays: [1, 2],
      labels: {},
    },
    labels: {},
    structured: {
      diagnosisOutline: null,
      shortestPath: null,
      outputGates: [],
      sevenDayPlans: [],
      compareSnapshot: null,
      shareArtifact: null,
      reviewSnapshot: null,
      reviewHistories: [
        {
          id: 1,
          childId: 9,
          runId: 5,
          reportId: 7,
          primaryIssue: 'Calculation slip',
          secondaryIssue: 'Procedure gap',
          compareSummary: 'Improving: Calculation slip appears in fewer anchored examples than the previous report.',
          parentNote: 'Less rushing this week.',
          completedDaysJson: [1, 2],
          snapshotJson: {},
          createdAt: new Date('2026-04-19T10:00:00.000Z'),
          updatedAt: new Date('2026-04-19T10:30:00.000Z'),
        },
      ],
      issueTrends: [
        {
          id: 4,
          childId: 9,
          issueCode: 'Calculation slip',
          issueTitle: 'Calculation slip',
          status: 'active',
          trendDirection: 'recurring',
          firstSeenReportId: 3,
          latestReportId: 7,
          occurrenceCount: 2,
          summary: 'Still sticky but improving.',
          trendPointsJson: [58, 66],
          updatedAt: new Date('2026-04-19T10:30:00.000Z'),
        },
      ],
    },
    completedDays: [1, 2],
  });

  assert.equal(viewModel.history?.[0]?.primaryIssue, 'Calculation slip');
  assert.equal(viewModel.history?.[0]?.parentNote, 'Less rushing this week.');
  assert.equal(viewModel.trend?.[0]?.trendDirection, 'recurring');
  assert.deepEqual(viewModel.trend?.[0]?.trendPoints, [58, 66]);
});
