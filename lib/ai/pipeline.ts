import { calculateOverallConfidence, getReviewDecision } from '@/lib/ai/confidence';
import { generateDemoExtractionPages, generateDemoLabels } from '@/lib/ai/demo-engine';
import {
  canonicalExtractionBundleSchema,
  type CanonicalExtractionBundle,
} from '@/lib/ai/extraction-schema';
import { extractPageContentSnippet } from '@/lib/ai/page-content';
import { extractWithMathpixFallback } from '@/lib/ai/mathpix';
import { runExtractItemsTask } from '@/lib/ai/task-runner';

type PageInput = {
  id: number;
  pageNumber: number;
  previewLabel: string;
  sourceName: string;
  storagePath: string;
  contentSnippet?: string | null;
  qualityFlags: {
    blurry: boolean;
    rotated: boolean;
    dark: boolean;
    lowContrast: boolean;
  };
};

async function buildDemoBundle(
  runId: number,
  modelVersion: string,
  pages: PageInput[]
): Promise<CanonicalExtractionBundle> {
  const extractedPages = generateDemoExtractionPages(pages);
  const labeledItems = generateDemoLabels(extractedPages);
  const overallConfidence = calculateOverallConfidence(extractedPages, labeledItems);
  const reviewDecision = getReviewDecision(extractedPages, overallConfidence);

  return canonicalExtractionBundleSchema.parse({
    runId,
    engine: 'demo',
    modelVersion,
    pages: extractedPages,
    labeledItems,
    overallConfidence,
    requiresReview: reviewDecision.requiresReview,
    reviewReason: reviewDecision.reviewReason,
  });
}

export type ProcessRunExtractionResult = {
  bundle: CanonicalExtractionBundle;
  execution: {
    engine: string;
    modelVersion: string;
    fallbackApplied: boolean;
    attemptCount: number;
    taskType: 'extract-items' | 'mathpix-fallback';
  };
};

export async function processRunExtraction(args: {
  runId: number;
  pages: PageInput[];
  preferMathpix?: boolean;
}): Promise<ProcessRunExtractionResult> {
  const modelVersion = process.env.OPENAI_MODEL_VISION || 'gpt-4.1-mini';
  const fallback = () => buildDemoBundle(args.runId, modelVersion, args.pages);
  const pagesWithContent = await Promise.all(
    args.pages.map(async (page) => ({
      ...page,
      contentSnippet: await extractPageContentSnippet(page.storagePath),
    }))
  );

  if (pagesWithContent.every((page) => !page.contentSnippet)) {
    const bundle = canonicalExtractionBundleSchema.parse({
      runId: args.runId,
      engine: 'content-check',
      modelVersion,
      pages: pagesWithContent.map((page) => ({
        pageId: page.id,
        pageNo: page.pageNumber,
        sourceName: page.sourceName,
        detectedLanguage: 'en',
        pageConfidence: 0.22,
        qualityFlags: page.qualityFlags,
        items: [],
      })),
      labeledItems: [],
      overallConfidence: 0.22,
      requiresReview: true,
      reviewReason:
        'Uploaded pages could not be parsed into reliable worksheet evidence. Please re-upload a clearer text-based PDF or review the run manually.',
    });

    return {
      bundle,
      execution: {
        engine: bundle.engine,
        modelVersion,
        fallbackApplied: false,
        attemptCount: 0,
        taskType: 'extract-items',
      },
    };
  }

  if (args.preferMathpix) {
    const bundle = await extractWithMathpixFallback({
        runId: args.runId,
        fallback,
      })
    return {
      bundle: canonicalExtractionBundleSchema.parse(bundle),
      execution: {
        engine: bundle.engine,
        modelVersion: bundle.modelVersion,
        fallbackApplied: false,
        attemptCount: 1,
        taskType: 'mathpix-fallback',
      },
    };
  }

  const taskResult = await runExtractItemsTask({
    runId: args.runId,
    pages: pagesWithContent,
  });

  return {
    bundle: canonicalExtractionBundleSchema.parse(taskResult.bundle),
    execution: {
      engine: taskResult.bundle.engine,
      modelVersion: taskResult.bundle.modelVersion,
      fallbackApplied: taskResult.trace.fallbackApplied,
      attemptCount: taskResult.trace.attempts.length,
      taskType: 'extract-items',
    },
  };
}
