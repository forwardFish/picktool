import {
  formatModelReference,
  type ModelTaskType,
  parseModelReference,
  uniqueModelReferences,
} from '@/lib/ai/providers/base';

export type ModelTaskPolicy = {
  primaryModel: string;
  fallbackModels: string[];
  temperature?: number;
};

function getDefaultPrimaryProvider() {
  return (process.env.MODEL_PROVIDER?.trim().toLowerCase() || 'openai') as 'openai' | 'moonshot';
}

function getProviderDefaultModel(provider: 'openai' | 'moonshot') {
  if (provider === 'moonshot') {
    return process.env.MOONSHOT_MODEL?.trim() || 'kimi-k2.5';
  }

  return process.env.OPENAI_MODEL_VISION?.trim() || 'gpt-4.1-mini';
}

export function resolvePrimaryModelReference(taskType: ModelTaskType) {
  const explicit = process.env.MODEL_DEFAULT?.trim();
  if (explicit) {
    const { provider, model } = parseModelReference(explicit);
    return formatModelReference(provider, model);
  }

  const provider = getDefaultPrimaryProvider();
  const model = getProviderDefaultModel(provider);
  if (taskType === 'extract-items') {
    return formatModelReference(provider, model);
  }

  return formatModelReference(provider, model);
}

export function getTaskPolicy(taskType: ModelTaskType): ModelTaskPolicy {
  const primaryModel = resolvePrimaryModelReference(taskType);
  const fallbackModels =
    taskType === 'extract-items'
      ? uniqueModelReferences([
          formatModelReference('moonshot', process.env.MOONSHOT_MODEL?.trim() || 'kimi-k2.5'),
        ]).filter((item) => item !== primaryModel)
      : [];

  return {
    primaryModel,
    fallbackModels,
    temperature: taskType === 'extract-items' ? 0.1 : 0.2,
  };
}
