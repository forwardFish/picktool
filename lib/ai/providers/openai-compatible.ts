import type {
  ModelProviderName,
  ModelTaskRequest,
  ModelTaskResult,
  ModelUsage,
  ProviderRuntimeConfig,
} from './base';

type OpenAICompatiblePayload = {
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      content?: string | Array<{ text?: string }>;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
};

function joinPromptParts(request: ModelTaskRequest) {
  const parts = [request.systemPrompt.trim()];
  if (request.developerPrompt?.trim()) {
    parts.push(request.developerPrompt.trim());
  }
  return parts.join('\n\n');
}

export function extractOpenAICompatibleText(payload: OpenAICompatiblePayload) {
  const message = payload.choices?.[0]?.message;
  const content = message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === 'string' ? item.text : ''))
      .join('')
      .trim();
  }

  return '';
}

export function extractOpenAICompatibleUsage(
  payload: OpenAICompatiblePayload
): ModelUsage | undefined {
  const usage = payload.usage;
  if (!usage) {
    return undefined;
  }

  return {
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    reasoningTokens: usage.completion_tokens_details?.reasoning_tokens,
    totalTokens: usage.total_tokens,
  };
}

function buildProviderError(
  message: string,
  extra?: Record<string, unknown>
): Error & Record<string, unknown> {
  return Object.assign(new Error(message), extra);
}

export async function runOpenAICompatibleTask<T = unknown>(args: {
  providerName: ModelProviderName;
  request: ModelTaskRequest;
  config: ProviderRuntimeConfig;
}): Promise<ModelTaskResult<T>> {
  const startedAt = Date.now();
  const configuredMaxTokens =
    typeof args.config.metadata?.maxTokens === 'number'
      ? args.config.metadata.maxTokens
      : typeof args.config.metadata?.maxTokens === 'string'
        ? Number(args.config.metadata.maxTokens)
        : undefined;
  const response = await fetch(`${args.config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${args.config.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: args.request.model || args.config.defaultModel,
      temperature: args.request.temperature ?? 0.1,
      ...(Number.isFinite(configuredMaxTokens) ? { max_tokens: configuredMaxTokens } : {}),
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: joinPromptParts(args.request),
        },
        {
          role: 'user',
          content: JSON.stringify(args.request.inputPayload),
        },
      ],
    }),
    signal: AbortSignal.timeout(args.config.timeoutMs),
  });

  if (!response.ok) {
    const body = await response.text();
    throw buildProviderError(
      `${args.providerName} request failed with status ${response.status}.`,
      {
        code: 'provider_http_error',
        status: response.status,
        responseBody: body.slice(0, 400),
      }
    );
  }

  const payload = (await response.json()) as OpenAICompatiblePayload;
  const outputText = extractOpenAICompatibleText(payload);
  if (!outputText) {
    if (args.providerName === 'moonshot' && args.request.taskType === 'extract-items') {
      return {
        provider: args.providerName,
        model: args.request.model || args.config.defaultModel,
        output: {} as T,
        raw: payload,
        usage: extractOpenAICompatibleUsage(payload),
        finishReason: payload.choices?.[0]?.finish_reason || undefined,
        latencyMs: Date.now() - startedAt,
      };
    }

    throw buildProviderError(`${args.providerName} returned an empty completion payload.`, {
      code: 'empty_model_output',
    });
  }

  let parsedOutput: T;
  try {
    parsedOutput = JSON.parse(outputText) as T;
  } catch (error) {
    if (args.providerName === 'moonshot' && args.request.taskType === 'extract-items') {
      parsedOutput = {} as T;
    } else {
    throw buildProviderError(`${args.providerName} returned invalid JSON output.`, {
      code: 'invalid_json',
      rawOutput: outputText.slice(0, 800),
      cause: error,
    });
    }
  }

  return {
    provider: args.providerName,
    model: args.request.model || args.config.defaultModel,
    output: parsedOutput,
    raw: payload,
    usage: extractOpenAICompatibleUsage(payload),
    finishReason: payload.choices?.[0]?.finish_reason || undefined,
    latencyMs: Date.now() - startedAt,
  };
}
