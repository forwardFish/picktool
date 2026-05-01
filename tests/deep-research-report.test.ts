import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDeepResearchReportViewModel } from '../lib/family/report-read-model.ts';
import {
  buildReportCompareSummaryFromData,
  composeDeepResearchReport,
} from '../lib/family/report-composer.ts';

function sampleBundle() {
  return {
    runId: 9,
    engine: 'moonshot',
    modelVersion: 'kimi-k2.5',
    pages: [
      {
        pageId: 11,
        pageNo: 1,
        sourceName: 'worksheet-1',
        detectedLanguage: 'en',
        pageConfidence: 0.91,
        qualityFlags: {
          blurry: false,
          rotated: false,
          dark: false,
          lowContrast: false,
        },
        items: [
          {
            problemNo: '1',
            problemText: '12 + 7 = ?',
            studentWork: '12 + 7 = 20',
            teacherMark: 'wrong',
            modelIsCorrect: false,
            itemConfidence: 0.88,
            evidenceAnchor: {
              pageId: 11,
              pageNo: 1,
              problemNo: '1',
              previewLabel: 'Page 1',
            },
          },
        ],
      },
    ],
    labeledItems: [
      {
        problemNo: '1',
        problemText: '12 + 7 = ?',
        studentWork: '12 + 7 = 20',
        teacherMark: 'wrong',
        modelIsCorrect: false,
        itemConfidence: 0.88,
        evidenceAnchor: {
          pageId: 11,
          pageNo: 1,
          problemNo: '1',
          previewLabel: 'Page 1',
        },
        labels: [
          {
            code: 'calculation_slip',
            severity: 'med',
            labelConfidence: 0.82,
            role: 'primary',
          },
        ],
        rationale:
          'The final addition is off by one even though the setup matches the problem statement.',
      },
    ],
    overallConfidence: 0.83,
    requiresReview: false,
    reviewReason: null,
  } as const;
}

test('composeDeepResearchReport returns structured and compatibility payloads together', () => {
  const payload = composeDeepResearchReport({
    bundle: sampleBundle(),
    child: {
      nickname: 'Mia',
      grade: 'Grade 4',
      curriculum: 'US Common Core',
    },
    upload: {
      sourceType: 'worksheet',
    },
  });

  assert.match(payload.parentReportJson.summary || '', /calculation slip/i);
  assert.equal(payload.structured.diagnosisOutline.primaryIssue, 'Calculation slip');
  assert.equal(payload.structured.outputGates.length, 4);
  assert.equal(payload.structured.sevenDayPlans.length, 7);
  assert.equal(payload.structured.reviewSnapshot.releaseStatus, 'ready');
});

test('buildDeepResearchReportViewModel prefers structured data and keeps completed days', () => {
  const payload = composeDeepResearchReport({
    bundle: sampleBundle(),
    child: {
      nickname: 'Mia',
      grade: 'Grade 4',
      curriculum: 'US Common Core',
    },
    upload: {
      sourceType: 'worksheet',
    },
  });

  const viewModel = buildDeepResearchReportViewModel({
    reportId: 101,
    parentReport: {
      ...payload.parentReportJson,
      completedDays: [1, 3],
      labels: {},
    },
    structured: {
      diagnosisOutline: { id: 1, reportId: 101, createdAt: new Date(), updatedAt: new Date(), ...payload.structured.diagnosisOutline },
      shortestPath: { id: 1, reportId: 101, createdAt: new Date(), updatedAt: new Date(), ...payload.structured.shortestPath },
      outputGates: payload.structured.outputGates.map((gate, index) => ({
        id: index + 1,
        reportId: 101,
        createdAt: new Date(),
        updatedAt: new Date(),
        gateCode: gate.gateCode,
        title: gate.title || '',
        status: gate.status || 'Optional',
        body: gate.body || '',
        whatThisVerifies: gate.whatThisVerifies || '',
        howToCheck: gate.howToCheck || '',
        sortOrder: gate.sortOrder,
      })),
      sevenDayPlans: payload.structured.sevenDayPlans.map((day, index) => ({
        id: index + 1,
        reportId: 101,
        createdAt: new Date(),
        updatedAt: new Date(),
        dayNumber: day.dayNumber,
        goal: day.goal,
        practice: day.practice,
        parentPrompt: day.parentPrompt,
        successSignal: day.successSignal,
        sortOrder: day.sortOrder,
      })),
      compareSnapshot: {
        id: 1,
        reportId: 101,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...payload.structured.compareSnapshot,
      },
      shareArtifact: {
        id: 1,
        reportId: 101,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...payload.structured.shareArtifact,
      },
      reviewSnapshot: {
        id: 1,
        reportId: 101,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...payload.structured.reviewSnapshot,
      },
    },
    completedDays: [1, 3],
  });

  assert.equal(viewModel.source, 'structured');
  assert.equal(viewModel.plan.days.length, 7);
  assert.deepEqual(viewModel.plan.completedDays, [1, 3]);
  assert.equal(viewModel.outputGates.gates[0]?.title, 'Explain');
  assert.equal(viewModel.compare.compareSummary, payload.structured.compareSnapshot.compareSummary);
});

test('compare summary helper handles first report and focus shift', () => {
  assert.equal(
    buildReportCompareSummaryFromData({
      currentTitle: 'Calculation slip',
      currentCount: 2,
    }),
    'First report for this child. Use this as the baseline for next week.'
  );

  assert.equal(
    buildReportCompareSummaryFromData({
      currentTitle: 'Calculation slip',
      currentCount: 2,
      previousTitle: 'Procedure gap',
      previousCount: 4,
    }),
    'Focus shifted from Procedure gap to Calculation slip.'
  );
});
