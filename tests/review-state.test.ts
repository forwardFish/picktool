import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveReviewState } from '../lib/family/review-state.ts';

test('resolveReviewState forces manual review when extraction returns no labeled items', () => {
  const reviewState = resolveReviewState({
    bundle: {
      requiresReview: false,
      reviewReason: null,
      labeledItems: [],
    },
  });

  assert.equal(reviewState.needsReview, true);
  assert.match(reviewState.reviewReason || '', /reliable worksheet evidence/i);
});

test('resolveReviewState preserves an explicit review reason from the bundle', () => {
  const reviewState = resolveReviewState({
    bundle: {
      requiresReview: true,
      reviewReason: 'Overall extraction confidence is below the release threshold.',
      labeledItems: [],
    },
  });

  assert.equal(reviewState.needsReview, true);
  assert.equal(
    reviewState.reviewReason,
    'Overall extraction confidence is below the release threshold.'
  );
});
