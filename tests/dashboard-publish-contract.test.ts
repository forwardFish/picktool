import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const repositorySource = readFileSync(
  new URL('../lib/family/repository.ts', import.meta.url),
  'utf8'
).replace(/\s+/g, ' ');

test('processRunForUser preserves the structured publish chain for dashboard read models', () => {
  assert.equal(repositorySource.includes('await deleteReportsForRun(run.id);'), true);
  assert.equal(repositorySource.includes('const [createdReport] = await db.insert(reports).values({'), true);
  assert.equal(repositorySource.includes('await upsertReportReadModel({ reportId: createdReport.id, payload: reportPayload, });'), true);
  assert.equal(
    repositorySource.includes(
      'await syncReviewHistoryForReport({ userId, childId: run.childId, runId: run.id, reportId: createdReport.id,'
    ),
    true
  );
  assert.equal(
    repositorySource.includes("status: reviewReason ? 'needs_review' : 'done'"),
    true
  );
});
