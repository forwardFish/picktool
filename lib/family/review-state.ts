import type { CanonicalExtractionBundle } from '@/lib/ai/extraction-schema';

export function resolveReviewState(args: {
  bundle: Pick<CanonicalExtractionBundle, 'requiresReview' | 'reviewReason' | 'labeledItems'>;
  reviewOverride?: string | null;
}) {
  const fallbackReason =
    'Uploaded pages could not be parsed into reliable worksheet evidence. Please re-upload a clearer file or review manually.';
  const needsReview =
    Boolean(args.reviewOverride) ||
    args.bundle.requiresReview ||
    args.bundle.labeledItems.length === 0;
  const reviewReason =
    args.reviewOverride ||
    args.bundle.reviewReason ||
    (needsReview ? fallbackReason : null);

  return {
    needsReview,
    reviewReason,
  };
}
