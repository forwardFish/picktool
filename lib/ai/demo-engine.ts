import type {
  CanonicalExtractionPage,
  LabeledProblemItem,
} from '@/lib/ai/extraction-schema';
import { canonicalExtractionPageSchema, labeledProblemItemSchema } from '@/lib/ai/extraction-schema';
import { shouldUsePrimaryTaxonomyLabel } from '@/lib/ai/taxonomy';
import type { PageQualityFlags } from '@/lib/family/types';

type PageInput = {
  id: number;
  pageNumber: number;
  previewLabel: string;
  sourceName: string;
  qualityFlags: PageQualityFlags;
};

function clampConfidence(base: number) {
  return Math.max(0.36, Math.min(0.96, Number(base.toFixed(2))));
}

function classifySeverity(confidence: number) {
  if (confidence < 0.58) {
    return 'high';
  }
  if (confidence < 0.75) {
    return 'med';
  }
  return 'low';
}

export function generateDemoExtractionPages(pages: PageInput[]) {
  return pages.map((page, index) => {
    const qualityPenalty =
      (page.qualityFlags.blurry ? 0.12 : 0) +
      (page.qualityFlags.dark ? 0.1 : 0) +
      (page.qualityFlags.rotated ? 0.08 : 0) +
      (page.qualityFlags.lowContrast ? 0.06 : 0);
    const pageConfidence = clampConfidence(0.9 - qualityPenalty - index * 0.02);

    return canonicalExtractionPageSchema.parse({
      pageId: page.id,
      pageNo: page.pageNumber,
      sourceName: page.sourceName,
      detectedLanguage: 'en',
      pageConfidence,
      qualityFlags: {
        blurry: page.qualityFlags.blurry,
        rotated: page.qualityFlags.rotated,
        dark: page.qualityFlags.dark,
        lowContrast: page.qualityFlags.lowContrast,
      },
      items: [
        {
          problemNo: `Q${index * 2 + 1}`,
          problemText: `Solve the mixed fraction problem from ${page.previewLabel}.`,
          studentWork: 'Student work shows steps but loses precision near the final line.',
          teacherMark: index % 2 === 0 ? 'wrong' : 'partial',
          modelIsCorrect: false,
          itemConfidence: clampConfidence(pageConfidence - 0.06),
          evidenceAnchor: {
            pageId: page.id,
            pageNo: page.pageNumber,
            problemNo: `Q${index * 2 + 1}`,
            previewLabel: page.previewLabel,
          },
        },
        {
          problemNo: `Q${index * 2 + 2}`,
          problemText: `Check the computation and notation from ${page.previewLabel}.`,
          studentWork: 'Student reaches the right setup but misses one arithmetic or notation detail.',
          teacherMark: index % 3 === 0 ? 'wrong' : 'partial',
          modelIsCorrect: false,
          itemConfidence: clampConfidence(pageConfidence - 0.1),
          evidenceAnchor: {
            pageId: page.id,
            pageNo: page.pageNumber,
            problemNo: `Q${index * 2 + 2}`,
            previewLabel: page.previewLabel,
          },
        },
      ],
    });
  });
}

export function generateDemoLabels(extractedPages: CanonicalExtractionPage[]) {
  const codeCycle = ['procedure_gap', 'calculation_slip', 'notation_error', 'strategy_error'];

  return extractedPages.flatMap((page, pageIndex) =>
    page.items.map((item, itemIndex) => {
      const code = codeCycle[(pageIndex + itemIndex) % codeCycle.length];
      const labelConfidence = clampConfidence(item.itemConfidence - 0.05);
      return labeledProblemItemSchema.parse({
        ...item,
        labels: [
          {
            code,
            severity: classifySeverity(labelConfidence),
            labelConfidence,
            role: shouldUsePrimaryTaxonomyLabel(labelConfidence) ? 'primary' : 'secondary',
          },
        ],
        rationale:
          code === 'procedure_gap'
            ? 'The student setup shows the right ingredients but the step order breaks before the result.'
            : code === 'calculation_slip'
              ? 'The method is mostly correct, but the arithmetic execution slips near the finish.'
              : code === 'notation_error'
                ? 'The student switches or drops notation, which changes the meaning of the work.'
                : 'The student chooses a weaker strategy than the page seems to require.',
      });
    })
  );
}
