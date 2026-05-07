import type { FullExecutionPlan, GeneratedOutput, ModuleType, WorkflowPlan } from './types.ts';
import { generateFullExecutionPlan, refinePlanModule } from './engine.ts';

export type LlmProviderName = 'mock' | 'openai' | 'deepseek' | 'anthropic';

export type WorkflowGenerationProvider = {
  name: LlmProviderName;
  mode: 'mock' | 'external-placeholder';
  generateFullPlan(plan: WorkflowPlan): Promise<FullExecutionPlan>;
  refine(fullPlan: FullExecutionPlan, moduleType: ModuleType): Promise<GeneratedOutput>;
};

export function createMockProvider(): WorkflowGenerationProvider {
  return {
    name: 'mock',
    mode: 'mock',
    async generateFullPlan(plan) {
      return generateFullExecutionPlan(plan);
    },
    async refine(fullPlan, moduleType) {
      return refinePlanModule(fullPlan, moduleType);
    }
  };
}

function hasKey(provider: LlmProviderName, env: NodeJS.ProcessEnv) {
  if (provider === 'openai') return Boolean(env.OPENAI_API_KEY);
  if (provider === 'deepseek') return Boolean(env.DEEPSEEK_API_KEY);
  if (provider === 'anthropic') return Boolean(env.ANTHROPIC_API_KEY);
  return true;
}

export function getConfiguredProvider(env: NodeJS.ProcessEnv = process.env): WorkflowGenerationProvider {
  const requested = (env.LLM_PROVIDER ?? 'mock').toLowerCase() as LlmProviderName;
  const supported: LlmProviderName[] = ['mock', 'openai', 'deepseek', 'anthropic'];
  const provider = supported.includes(requested) ? requested : 'mock';

  if (provider === 'mock' || !hasKey(provider, env)) {
    return createMockProvider();
  }

  // MVP v2.0 keeps structure deterministic for build/test safety. Real providers can be wired here later
  // without changing route contracts; for now the validated deterministic provider remains authoritative.
  return {
    ...createMockProvider(),
    name: provider,
    mode: 'external-placeholder'
  };
}

