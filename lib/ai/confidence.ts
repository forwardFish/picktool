import type { CanonicalExtractionPage, LabeledProblemItem } from '@/lib/ai/extraction-schema';

export function calculateOverallConfidence(
  pages: CanonicalExtractionPage[],
  labeledItems: LabeledProblemItem[]
) {
  const itemAverage =
    labeledItems.reduce((sum, item) => sum + item.itemConfidence, 0) /
    Math.max(1, labeledItems.length);
  const pageAverage =
    pages.reduce((sum, page) => sum + page.pageConfidence, 0) / Math.max(1, pages.length);
  return Number(((itemAverage * 0.65) + (pageAverage * 0.35)).toFixed(2));
}

export function getReviewDecision(
  pages: CanonicalExtractionPage[],
  overallConfidence: number
) {
  const flaggedPages = pages.filter(
    (page) =>
      page.qualityFlags.blurry || page.qualityFlags.dark || page.qualityFlags.rotated
  ).length;

  if (overallConfidence < 0.72) {
    return {
      requiresReview: true,
      reviewReason: 'Overall extraction confidence is below the release threshold.',
    };
  }

  if (flaggedPages >= Math.max(2, Math.ceil(pages.length * 0.35))) {
    return {
      requiresReview: true,
      reviewReason: 'Too many pages are dark, blurry, or rotated for an automatic release.',
    };
  }

  return {
    requiresReview: false,
    reviewReason: null,
  };
}
