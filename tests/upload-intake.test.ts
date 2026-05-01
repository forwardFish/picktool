import test from 'node:test';
import assert from 'node:assert/strict';
import { composeDeepResearchReport } from '../lib/family/report-composer.ts';

function sampleBundle() {
  return {
    runId: 12,
    engine: 'moonshot',
    modelVersion: 'kimi-k2.5',
    pages: [
      {
        pageId: 3,
        pageNo: 1,
        sourceName: 'quiz-1',
        detectedLanguage: 'en',
        pageConfidence: 0.9,
        qualityFlags: {
          blurry: false,
          rotated: false,
          dark: false,
          lowContrast: false,
        },
        items: [],
      },
    ],
    labeledItems: [
      {
        problemNo: '2',
        problemText: '18 - 9 = ?',
        studentWork: '8',
        teacherMark: 'wrong',
        modelIsCorrect: false,
        itemConfidence: 0.84,
        evidenceAnchor: {
          pageId: 3,
          pageNo: 1,
          problemNo: '2',
          previewLabel: 'Page 1',
        },
        labels: [
          {
            code: 'calculation_slip',
            severity: 'med',
            labelConfidence: 0.8,
            role: 'primary',
          },
        ],
        rationale: 'The subtraction fact is unstable under light pressure.',
      },
    ],
    overallConfidence: 0.78,
    requiresReview: false,
    reviewReason: null,
  } as const;
}

test('composeDeepResearchReport carries intake context into compatibility and structured payloads', () => {
  const payload = composeDeepResearchReport({
    bundle: sampleBundle(),
    child: {
      nickname: 'Ava',
      grade: 'Grade 3',
      curriculum: 'US Common Core',
    },
    upload: {
      sourceType: 'quiz',
      diagnosticGoal: 'Find the main subtraction bottleneck.',
      recentTrend: 'Looks better on homework, worse on timed checks.',
      parentConcernJson: ['rushing', 'forgets to check'],
      teacherFeedbackPresent: true,
      hasTutor: true,
      intakeCompletedAt: '2026-04-20T08:00:00.000Z',
    },
  });

  assert.equal(
    payload.parentReportJson.sourceMeta?.diagnosticGoal,
    'Find the main subtraction bottleneck.'
  );
  assert.equal(
    payload.parentReportJson.sourceMeta?.recentTrend,
    'Looks better on homework, worse on timed checks.'
  );
  assert.equal(payload.structured.diagnosisOutline.sourceMetaJson.parentConcernSummary, 'rushing, forgets to check');
  assert.equal(payload.structured.shareArtifact.artifactJson.diagnosticGoal, 'Find the main subtraction bottleneck.');
});
