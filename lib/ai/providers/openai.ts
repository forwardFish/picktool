import type { ModelProvider, ModelTaskRequest } from './base';
import type { ProviderRuntimeConfig } from './base';
import { runOpenAICompatibleTask } from './openai-compatible';

export class OpenAIProvider implements ModelProvider {
  name = 'openai' as const;

  constructor(private readonly config: ProviderRuntimeConfig) {}

  isConfigured() {
    return this.config.isEnabled && Boolean(this.config.apiKey);
  }

  runTask<T = unknown>(request: ModelTaskRequest) {
    return runOpenAICompatibleTask<T>({
      providerName: this.name,
      request,
      config: this.config,
    });
  }
}
