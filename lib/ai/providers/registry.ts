import { db } from '@/lib/db/drizzle';
import { modelProviderConfigs } from '@/lib/db/schema';
import type { ModelProviderConfigRecord } from '@/lib/db/schema';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import { MoonshotProvider } from './moonshot';
import { OpenAIProvider } from './openai';
import type { ModelProvider, ModelProviderName, ProviderRuntimeConfig } from './base';

function getProviderDefaults(): Record<'openai' | 'moonshot', ProviderRuntimeConfig> {
  return {
    openai: {
      providerName: 'openai',
      defaultModel: process.env.OPENAI_MODEL_VISION?.trim() || 'gpt-4.1-mini',
      baseUrl: process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1',
      timeoutMs: 30000,
      maxRetries: 1,
      supportsJsonSchema: true,
      supportsReasoning: true,
      supportsTools: true,
      isEnabled: true,
      apiKey: process.env.OPENAI_API_KEY?.trim() || '',
      configId: null,
      metadata: {},
    },
    moonshot: {
      providerName: 'moonshot',
      defaultModel: process.env.MOONSHOT_MODEL?.trim() || 'kimi-k2.5',
      baseUrl: process.env.MOONSHOT_BASE_URL?.trim() || 'https://api.moonshot.cn/v1',
      timeoutMs: Number(process.env.MOONSHOT_TIMEOUT_MS?.trim() || '180000'),
      maxRetries: 1,
      supportsJsonSchema: true,
      supportsReasoning: false,
      supportsTools: true,
      isEnabled: true,
      apiKey: process.env.MOONSHOT_API_KEY?.trim() || '',
      configId: null,
      metadata: {
        maxTokens: 1600,
      },
    },
  };
}

function mergeProviderConfig(
  base: ProviderRuntimeConfig,
  row: ModelProviderConfigRecord | undefined
): ProviderRuntimeConfig {
  if (!row) {
    return base;
  }

  return {
    ...base,
    configId: row.id,
    defaultModel: row.defaultModel || base.defaultModel,
    baseUrl: row.baseUrl || base.baseUrl,
    timeoutMs: row.timeoutMs ?? base.timeoutMs,
    maxRetries: row.maxRetries ?? base.maxRetries,
    supportsJsonSchema: row.supportsJsonSchema,
    supportsReasoning: row.supportsReasoning,
    supportsTools: row.supportsTools,
    isEnabled: row.isEnabled,
    metadata: {
      ...(base.metadata || {}),
      ...((row.metadata || {}) as Record<string, unknown>),
    },
  };
}

async function loadProviderConfigMap() {
  const defaults = getProviderDefaults();
  if (isFamilyEduDemoMode()) {
    return defaults;
  }

  try {
    const rows: ModelProviderConfigRecord[] = await db.select().from(modelProviderConfigs);
    const rowMap = new Map(
      rows.map((row: ModelProviderConfigRecord) => [row.providerName, row] as const)
    );
    return {
      openai: mergeProviderConfig(defaults.openai, rowMap.get('openai')),
      moonshot: mergeProviderConfig(defaults.moonshot, rowMap.get('moonshot')),
    };
  } catch {
    return defaults;
  }
}

export async function getProviderConfig(providerName: Extract<ModelProviderName, 'openai' | 'moonshot'>) {
  const configMap = await loadProviderConfigMap();
  return configMap[providerName];
}

export async function getProvider(providerName: ModelProviderName): Promise<ModelProvider> {
  if (providerName === 'openai') {
    return new OpenAIProvider(await getProviderConfig('openai'));
  }

  if (providerName === 'moonshot') {
    return new MoonshotProvider(await getProviderConfig('moonshot'));
  }

  throw new Error(`Unsupported model provider "${providerName}".`);
}
