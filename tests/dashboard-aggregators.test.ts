import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNextBestAction,
  buildQuickOverview,
  buildSubjectSummaries,
  buildSuggestionChips,
  buildWorkspaceActivityFeed,
} from '../lib/dashboard/workspace-derivations.ts';

test('buildSuggestionChips prioritizes report comparison and follow-through prompts', () => {
  const chips = buildSuggestionChips({
    hasPreviousReport: true,
    hasRecurringIssue: true,
    hasIncompletePlan: true,
    hasPendingRun: false,
  });

  assert.deepEqual(chips, [
    'What changed compared with the last diagnosis?',
    'Is this a concept issue or an execution issue?',
    "Help me respond to my child's question today.",
    'Based on this worksheet, what should we do next?',
  ]);
});

test('buildNextBestAction prefers continuing an active run before starting new work', () => {
  const action = buildNextBestAction({
    selectedChildId: 9,
    pendingRun: {
      id: 12,
      childId: 9,
      statusMessage: 'Extracting items from the upload.',
    } as any,
    latestReport: null,
    hasIncompletePlan: false,
  });

  assert.equal(action?.label, 'Continue analysis');
  assert.equal(action?.href, '/dashboard/runs/12');
});

test('buildSubjectSummaries derives review counts and status from recent report state', () => {
  const summaries = buildSubjectSummaries({
    curriculum: 'US Common Core',
    reports: [
      {
        id: 1,
        topFinding: 'Fractions under changed wording',
        summary: 'Transfer breaks when wording changes.',
        releaseStatus: 'completed',
        completedDays: [1, 2],
      },
      {
        id: 2,
        topFinding: 'Fractions under changed wording',
        summary: 'The same focus returned in another worksheet.',
        releaseStatus: 'completed',
        completedDays: [1],
      },
    ] as any,
    issueTrends: [
      {
        issueTitle: 'Fractions under changed wording',
        trendDirection: 'recurring',
        status: 'active',
        summary: 'Still recurring across multiple uploads.',
      },
    ] as any,
    reviewHistories: [
      {
        completedDaysJson: [1, 2, 3],
      },
    ] as any,
  });

  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.statusLabel, 'Needs Focus');
  assert.equal(summaries[0]?.reviewCount, 2);
  assert.equal(summaries[0]?.topicCount, 1);
});

test('buildQuickOverview counts unfinished plans and unique focus labels from real rows', () => {
  const overview = buildQuickOverview([
    {
      id: 1,
      sourceType: 'quiz',
      topFinding: 'Fractions',
      completedDays: [1, 2],
      releaseStatus: 'completed',
    },
    {
      id: 2,
      sourceType: 'quiz',
      topFinding: 'Fractions',
      completedDays: [],
      releaseStatus: 'needs_review',
    },
    {
      id: 3,
      sourceType: 'worksheet',
      topFinding: 'Reading recall',
      completedDays: [1, 2, 3, 4, 5, 6, 7],
      releaseStatus: 'completed',
    },
  ] as any);

  assert.equal(overview.reportCountBySubject[0]?.label, 'quiz');
  assert.equal(overview.reportCountBySubject[0]?.count, 2);
  assert.equal(overview.currentFocusCount, 2);
  assert.equal(overview.unfinishedPlans, 2);
  assert.equal(overview.reviewNeededCount, 1);
});

test('buildWorkspaceActivityFeed merges logs, unfinished runs, reports, and shares by recency', () => {
  const feed = buildWorkspaceActivityFeed({
    activities: [
      { id: 1, action: 'CREATE_CHILD', timestamp: '2026-04-21T09:00:00.000Z' },
    ],
    runs: [
      {
        id: 8,
        childNickname: 'Ava',
        status: 'processing',
        statusMessage: 'Extracting problems.',
        updatedAt: '2026-04-21T10:00:00.000Z',
      },
    ] as any,
    reports: [
      {
        id: 3,
        childNickname: 'Ava',
        releaseStatus: 'completed',
        completedDays: [1],
        createdAt: '2026-04-21T11:00:00.000Z',
      },
    ] as any,
    shareEvents: [
      {
        id: 5,
        reportId: 3,
        childNickname: 'Ava',
        createdAt: '2026-04-21T12:00:00.000Z',
      },
    ],
    limit: 4,
  });

  assert.equal(feed.length, 4);
  assert.equal(feed[0]?.title, 'Shared report for Ava');
  assert.equal(feed[1]?.title, 'Published report for Ava');
  assert.equal(feed[2]?.title, 'Continue diagnosis for Ava');
  assert.equal(feed[3]?.title, 'Added a new member');
});
