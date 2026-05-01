import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

let runtimeRoot = '';
let extractOpenAICompatibleText: (payload: Record<string, unknown>) => string;
let extractOpenAICompatibleUsage: (payload: Record<string, unknown>) => Record<string, unknown> | undefined;
let getTaskPolicy: (taskType: 'extract-items') => {
  primaryModel: string;
  fallbackModels: string[];
};
let getProvider: (providerName: 'openai' | 'moonshot') => Promise<{
  name: string;
  isConfigured(): boolean;
  runTask?: (request: {
    taskType: 'extract-items';
    schemaName: string;
    systemPrompt: string;
    inputPayload: unknown;
    model?: string;
    temperature?: number;
  }) => Promise<{
    raw: Record<string, unknown>;
    provider: string;
    model: string;
    output: Record<string, unknown>;
  }>;
}>;
let processRunExtraction: (args: {
  runId: number;
  pages: ReturnType<typeof samplePages>;
  preferMathpix?: boolean;
}) => Promise<{
  bundle: { engine: string };
  execution: { fallbackApplied: boolean; attemptCount: number };
}>;
let canonicalExtractionBundleSchema: {
  parse(input: Record<string, unknown>): { engine: string };
};

const originalFetch = globalThis.fetch;

function buildModelOutput() {
  return {
    pages: [
      {
        pageId: 11,
        pageNo: 1,
        sourceName: 'worksheet-1',
        detectedLanguage: 'en',
        pageConfidence: 0.91,
        qualityFlags: {
          blurry: false,
          rotated: false,
          dark: false,
          lowContrast: false,
        },
        items: [
          {
            problemNo: '1',
            problemText: '12 + 7 = ?',
            studentWork: '12 + 7 = 20',
            teacherMark: 'wrong',
            modelIsCorrect: false,
            itemConfidence: 0.88,
            evidenceAnchor: {
              pageId: 11,
              pageNo: 1,
              problemNo: '1',
              previewLabel: 'Page 1',
            },
          },
        ],
      },
    ],
    labeledItems: [
      {
        problemNo: '1',
        problemText: '12 + 7 = ?',
        studentWork: '12 + 7 = 20',
        teacherMark: 'wrong',
        modelIsCorrect: false,
        itemConfidence: 0.88,
        evidenceAnchor: {
          pageId: 11,
          pageNo: 1,
          problemNo: '1',
          previewLabel: 'Page 1',
        },
        labels: [
          {
            code: 'calculation_slip',
            severity: 'med',
            labelConfidence: 0.82,
            role: 'primary',
          },
        ],
        rationale:
          'The final addition is off by one even though the setup matches the problem statement.',
      },
    ],
    overallConfidence: 0.83,
    requiresReview: false,
    reviewReason: null,
  };
}

function makeChatCompletionResponse(output: Record<string, unknown>) {
  return new Response(
    JSON.stringify({
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: JSON.stringify(output),
          },
        },
      ],
      usage: {
        prompt_tokens: 120,
        completion_tokens: 90,
        total_tokens: 210,
        completion_tokens_details: {
          reasoning_tokens: 12,
        },
      },
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}

async function readJson(relativePath: string) {
  const filePath = path.join(runtimeRoot, 'observability', relativePath);
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as { records: Array<Record<string, unknown>> };
}

function samplePages() {
  return [
    {
      id: 11,
      pageNumber: 1,
      previewLabel: 'Page 1',
      sourceName: 'worksheet-1',
      storagePath: '/tmp/page-1.png',
      qualityFlags: {
        blurry: false,
        rotated: false,
        dark: false,
        lowContrast: false,
      },
    },
  ];
}

before(async () => {
  runtimeRoot = await mkdtemp(path.join(tmpdir(), 'pathnook-ai-runtime-'));
  process.env.FAMILY_EDU_DEMO_MODE = '1';
  process.env.FAMILY_EDU_RUNTIME_ROOT = runtimeRoot;
  process.env.MODEL_PROVIDER = 'openai';
  process.env.OPENAI_MODEL_VISION = 'gpt-4.1-mini';
  process.env.MOONSHOT_MODEL = 'kimi-k2.5';

  ({
    extractOpenAICompatibleText,
    extractOpenAICompatibleUsage,
  } = await import('../lib/ai/providers/openai-compatible.ts'));
  ({ getTaskPolicy } = await import('../lib/ai/task-policy.ts'));
  ({ getProvider } = await import('../lib/ai/providers/registry.ts'));
  ({ processRunExtraction } = await import('../lib/ai/pipeline.ts'));
  ({ canonicalExtractionBundleSchema } = await import('../lib/ai/extraction-schema.ts'));
});

beforeEach(() => {
  process.env.FAMILY_EDU_DEMO_MODE = '1';
  delete process.env.MODEL_DEFAULT;
  process.env.MODEL_PROVIDER = 'openai';
  process.env.OPENAI_API_KEY = '';
  process.env.MOONSHOT_API_KEY = '';
  globalThis.fetch = originalFetch;
});

after(async () => {
  globalThis.fetch = originalFetch;
  await rm(runtimeRoot, { recursive: true, force: true });
});

test('task policy keeps OpenAI primary and Kimi fallback for extract-items', () => {
  const policy = getTaskPolicy('extract-items');

  assert.equal(policy.primaryModel, 'openai:gpt-4.1-mini');
  assert.deepEqual(policy.fallbackModels, ['moonshot:kimi-k2.5']);
});

test('provider registry resolves Moonshot configuration from env', async () => {
  process.env.MOONSHOT_API_KEY = 'moonshot-test-key';

  const provider = await getProvider('moonshot');

  assert.equal(provider.name, 'moonshot');
  assert.equal(provider.isConfigured(), true);
});

test('moonshot provider normalizes kimi temperature to 1', async () => {
  process.env.MOONSHOT_API_KEY = 'moonshot-test-key';
  let capturedBody = '';
  globalThis.fetch = async (_input, init) => {
    capturedBody = String(init?.body || '');
    return makeChatCompletionResponse(buildModelOutput());
  };

  const provider = await getProvider('moonshot');
  await provider.runTask?.({
    taskType: 'extract-items',
    schemaName: 'canonical-extraction-bundle',
    systemPrompt: 'Return JSON only.',
    inputPayload: { ok: true },
    temperature: 0.1,
  });

  const payload = JSON.parse(capturedBody) as { temperature?: number };
  assert.equal(payload.temperature, 1);
});

test('openai-compatible helpers read text and usage payloads', () => {
  const payload = {
    choices: [
      {
        message: {
          content: [{ text: '{"ok":true}' }],
        },
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
      completion_tokens_details: {
        reasoning_tokens: 5,
      },
    },
  };

  assert.equal(extractOpenAICompatibleText(payload), '{"ok":true}');
  assert.deepEqual(extractOpenAICompatibleUsage(payload), {
    inputTokens: 10,
    outputTokens: 20,
    reasoningTokens: 5,
    totalTokens: 30,
  });
});

test('canonical extraction schema accepts legacy and new provider engine names', () => {
  const legacy = canonicalExtractionBundleSchema.parse({
    runId: 1,
    engine: 'openai',
    modelVersion: 'gpt-4.1-mini',
    ...buildModelOutput(),
  });
  const nextGen = canonicalExtractionBundleSchema.parse({
    runId: 2,
    engine: 'moonshot',
    modelVersion: 'kimi-k2.5',
    ...buildModelOutput(),
  });

  assert.equal(legacy.engine, 'openai');
  assert.equal(nextGen.engine, 'moonshot');
});

test('processRunExtraction records a successful OpenAI attempt', async () => {
  process.env.OPENAI_API_KEY = 'openai-test-key';
  globalThis.fetch = async () => makeChatCompletionResponse(buildModelOutput());

  const result = await processRunExtraction({
    runId: 501,
    pages: samplePages(),
  });

  assert.equal(result.bundle.engine, 'openai');
  assert.equal(result.execution.fallbackApplied, false);
  assert.equal(result.execution.attemptCount, 1);

  const runModels = await readJson('analysis_run_models.json');
  const records = runModels.records.filter((record) => record.runId === 501);
  assert.equal(records.length, 1);
  assert.equal(records[0]?.providerName, 'openai');
  assert.equal(records[0]?.status, 'success');
});

test('processRunExtraction repairs partial provider output into the report contract', async () => {
  process.env.MOONSHOT_API_KEY = 'moonshot-test-key';
  globalThis.fetch = async () =>
    makeChatCompletionResponse({
      pages: samplePages().map((page) => ({
        pageId: page.id,
        pageNo: page.pageNumber,
        sourceName: page.sourceName,
      })),
      labeledItems: [],
      overallConfidence: 0.51,
    });

  const result = await processRunExtraction({
    runId: 503,
    pages: samplePages(),
  });

  assert.equal(result.bundle.engine, 'moonshot');
  assert.equal(result.bundle.pages.length, 1);
  assert.equal(result.bundle.pages[0]?.items.length, 1);
  assert.equal(result.bundle.pages[0]?.pageConfidence, 0.45);
  assert.equal(result.bundle.labeledItems.length, 1);
  assert.equal(result.bundle.labeledItems[0]?.labels[0]?.code, 'incomplete_reasoning');
});

test('processRunExtraction falls back to Kimi and records failover', async () => {
  process.env.OPENAI_API_KEY = 'openai-test-key';
  process.env.MOONSHOT_API_KEY = 'moonshot-test-key';

  let callCount = 0;
  globalThis.fetch = async (input) => {
    callCount += 1;
    const url = String(input);
    if (callCount === 1 && url.includes('api.openai.com')) {
      return new Response(JSON.stringify({ error: 'upstream unavailable' }), { status: 500 });
    }
    if (url.includes('moonshot.cn')) {
      return makeChatCompletionResponse(buildModelOutput());
    }
    throw new Error(`Unexpected fetch target: ${url}`);
  };

  const result = await processRunExtraction({
    runId: 502,
    pages: samplePages(),
  });

  assert.equal(result.bundle.engine, 'moonshot');
  assert.equal(result.execution.fallbackApplied, true);
  assert.equal(result.execution.attemptCount, 2);

  const runModels = await readJson('analysis_run_models.json');
  const modelRecords = runModels.records.filter((record) => record.runId === 502);
  assert.equal(modelRecords.length, 2);
  assert.equal(modelRecords[0]?.providerName, 'moonshot');
  assert.equal(modelRecords[1]?.providerName, 'openai');

  const failovers = await readJson('model_call_failovers.json');
  const failoverRecords = failovers.records.filter((record) => record.runId === 502);
  assert.equal(failoverRecords.length, 1);
  assert.equal(failoverRecords[0]?.fromProviderName, 'openai');
  assert.equal(failoverRecords[0]?.toProviderName, 'moonshot');
});
