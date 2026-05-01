export type ModelProviderName = 'openai' | 'moonshot' | 'custom';

export type ModelTaskType =
  | 'extract-items'
  | 'taxonomy'
  | 'diagnosis-outline'
  | 'generate-plan'
  | 'generate-compare'
  | 'generate-share-artifact'
  | 'generate-deck';

export type ModelUsage = {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  totalTokens?: number;
};

export interface ModelTaskRequest {
  taskType: ModelTaskType;
  schemaName: string;
  systemPrompt: string;
  developerPrompt?: string;
  inputPayload: unknown;
  model?: string;
  temperature?: number;
  metadata?: Record<string, unknown>;
}

export interface ModelTaskResult<T = unknown> {
  provider: ModelProviderName;
  model: string;
  output: T;
  raw: unknown;
  usage?: ModelUsage;
  finishReason?: string;
  latencyMs?: number;
}

export interface ModelProvider {
  name: ModelProviderName;
  isConfigured(): boolean;
  runTask<T = unknown>(request: ModelTaskRequest): Promise<ModelTaskResult<T>>;
}

export type ModelAttemptStatus = 'success' | 'failed' | 'skipped';

export type ModelTaskExecutionAttempt = {
  attemptIndex: number;
  provider: ModelProviderName;
  model: string;
  status: ModelAttemptStatus;
  latencyMs: number;
  finishReason?: string;
  usage?: ModelUsage;
  errorType?: string;
  errorMessage?: string;
  recordId?: string;
};

export type ModelTaskExecutionTrace = {
  taskType: ModelTaskType;
  selectedProvider: ModelProviderName;
  selectedModel: string;
  fallbackApplied: boolean;
  attempts: ModelTaskExecutionAttempt[];
};

export type ProviderRuntimeConfig = {
  providerName: ModelProviderName;
  defaultModel: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  supportsJsonSchema: boolean;
  supportsReasoning: boolean;
  supportsTools: boolean;
  isEnabled: boolean;
  apiKey: string;
  configId?: number | null;
  metadata?: Record<string, unknown>;
};

export function parseModelReference(modelRef: string): {
  provider: ModelProviderName;
  model: string;
} {
  const normalized = modelRef.trim();
  const separator = normalized.includes(':') ? ':' : '/';
  const [providerName, ...rest] = normalized.split(separator);
  const provider = providerName.trim().toLowerCase() as ModelProviderName;
  const model = rest.join(separator).trim();

  if (!provider || !model) {
    throw new Error(`Invalid model reference "${modelRef}". Expected "provider:model".`);
  }

  return { provider, model };
}

export function formatModelReference(provider: ModelProviderName, model: string) {
  return `${provider}:${model}`;
}

export function uniqueModelReferences(modelRefs: string[]) {
  return Array.from(
    new Set(modelRefs.map((item) => item.trim()).filter(Boolean))
  );
}
