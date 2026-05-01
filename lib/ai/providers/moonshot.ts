import type { ModelProvider, ModelTaskRequest } from './base';
import type { ProviderRuntimeConfig } from './base';
import { runOpenAICompatibleTask } from './openai-compatible';

export class MoonshotProvider implements ModelProvider {
  name = 'moonshot' as const;

  constructor(private readonly config: ProviderRuntimeConfig) {}

  isConfigured() {
    return this.config.isEnabled && Boolean(this.config.apiKey);
  }

  runTask<T = unknown>(request: ModelTaskRequest) {
    const normalizedRequest: ModelTaskRequest = {
      ...request,
      // kimi-k2.5 currently rejects non-1 temperatures on the OpenAI-compatible API.
      temperature: 1,
    };

    return runOpenAICompatibleTask<T>({
      providerName: this.name,
      request: normalizedRequest,
      config: this.config,
    });
  }
}
