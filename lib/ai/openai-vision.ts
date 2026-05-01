import {
  canonicalExtractionBundleSchema,
  type CanonicalExtractionBundle,
  type CanonicalExtractionPage,
} from '@/lib/ai/extraction-schema';
import { isFamilyEduDemoMode } from '@/lib/family/config';

type PageAsset = {
  id: number;
  pageNumber: number;
  sourceName: string;
  previewLabel: string;
  storagePath: string;
  qualityFlags: {
    blurry: boolean;
    rotated: boolean;
    dark: boolean;
    lowContrast: boolean;
  };
};

type Args = {
  runId: number;
  modelVersion: string;
  pages: PageAsset[];
  fallback: () => Promise<CanonicalExtractionBundle>;
};

export async function extractWithOpenAIVision({
  runId,
  modelVersion,
  pages,
  fallback,
}: Args): Promise<CanonicalExtractionBundle> {
  const apiKey = process.env.OPENAI_API_KEY;
  const isDemoMode = isFamilyEduDemoMode();
  if (!apiKey) {
    if (isDemoMode) {
      return fallback();
    }
    throw new Error('OPENAI_API_KEY is not configured for production extraction.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelVersion,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text:
                  'Extract worksheet structure into a JSON object. Never provide direct homework answers. Each item must include an evidence anchor with page number and problem number.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({
                  task: 'Convert worksheet pages into the canonical extraction bundle.',
                  pages: pages.map((page) => ({
                    pageId: page.id,
                    pageNo: page.pageNumber,
                    sourceName: page.sourceName,
                    previewLabel: page.previewLabel,
                    qualityFlags: page.qualityFlags,
                  })),
                }),
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (isDemoMode) {
        return fallback();
      }
      throw new Error(`OpenAI extraction failed with status ${response.status}.`);
    }

    const payload = await response.json();
    const outputText = payload?.output_text;
    if (!outputText) {
      if (isDemoMode) {
        return fallback();
      }
      throw new Error('OpenAI extraction returned no output_text payload.');
    }

    const parsed = JSON.parse(outputText) as Omit<CanonicalExtractionBundle, 'runId' | 'engine' | 'modelVersion'> & {
      pages: CanonicalExtractionPage[];
    };

    return canonicalExtractionBundleSchema.parse({
      runId,
      engine: 'openai',
      modelVersion,
      ...parsed,
      pages: parsed.pages,
    });
  } catch (error) {
    if (isDemoMode) {
      return fallback();
    }
    throw error;
  }
}
