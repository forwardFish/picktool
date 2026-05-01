import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test('shared report repository payload remains tutor-safe', () => {
  const repositorySource = readFileSync(
    path.join(process.cwd(), 'lib', 'family', 'repository.ts'),
    'utf8'
  );
  const start = repositorySource.indexOf('export async function getSharedReportByToken');
  const end = repositorySource.indexOf('export async function listActivityForUser');
  const sharedFunction =
    start >= 0 && end > start ? repositorySource.slice(start, end) : repositorySource;

  assert.match(sharedFunction, /tutorReportJson/);
  assert.doesNotMatch(sharedFunction, /parentReportJson/);
});
