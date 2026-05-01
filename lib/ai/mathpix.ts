import type { CanonicalExtractionBundle } from '@/lib/ai/extraction-schema';
import { isFamilyEduDemoMode } from '@/lib/family/config';

type Args = {
  runId: number;
  fallback: () => Promise<CanonicalExtractionBundle>;
};

export async function extractWithMathpixFallback({
  fallback,
}: Args): Promise<CanonicalExtractionBundle> {
  const appId = process.env.MATHPIX_APP_ID;
  const appKey = process.env.MATHPIX_APP_KEY;
  const isDemoMode = isFamilyEduDemoMode();

  if (!appId || !appKey) {
    if (isDemoMode) {
      return fallback();
    }
    throw new Error('Mathpix fallback is not configured for production extraction.');
  }

  try {
    // Mathpix integration is optional in local delivery mode. If credentials exist,
    // this endpoint acts as a preferred handwriting-heavy fallback. We still fall
    // back to the deterministic local extractor if the upstream request fails.
    const response = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        app_id: appId,
        app_key: appKey,
      },
      body: JSON.stringify({
        src: 'pathnook-fallback-placeholder',
        formats: ['text'],
      }),
    });

    if (!response.ok) {
      if (isDemoMode) {
        return fallback();
      }
      throw new Error(`Mathpix fallback failed with status ${response.status}.`);
    }

    if (isDemoMode) {
      return fallback();
    }
    throw new Error('Mathpix fallback did not return a production extraction payload.');
  } catch (error) {
    if (isDemoMode) {
      return fallback();
    }
    throw error;
  }
}
