import type { FullExecutionPlan, GeneratedOutput, ModuleType, WorkflowPlan } from './types.ts';
import { generateFullExecutionPlan, refinePlanModule } from './engine.ts';

export type LlmProviderName = 'mock' | 'openai' | 'deepseek' | 'anthropic';

export type WorkflowGenerationProvider = {
  name: LlmProviderName | 'local';
  mode: 'local' | 'external-placeholder';
  generateFullPlan(plan: WorkflowPlan): Promise<FullExecutionPlan>;
  refine(fullPlan: FullExecutionPlan, moduleType: ModuleType): Promise<GeneratedOutput>;
};

export function createLocalProvider(): WorkflowGenerationProvider {
  return {
    name: 'local',
    mode: 'local',
    async generateFullPlan(plan) {
      return generateFullExecutionPlan(plan);
    },
    async refine(fullPlan, moduleType) {
      return refinePlanModule(fullPlan, moduleType);
    }
  };
}

export const createMockProvider = createLocalProvider;

function hasKey(provider: LlmProviderName, env: NodeJS.ProcessEnv) {
  if (provider === 'openai') return Boolean(env.OPENAI_API_KEY);
  if (provider === 'deepseek') return Boolean(env.DEEPSEEK_API_KEY);
  if (provider === 'anthropic') return Boolean(env.ANTHROPIC_API_KEY);
  return true;
}

export function getConfiguredProvider(env: NodeJS.ProcessEnv = process.env): WorkflowGenerationProvider {
  const requestedRaw = (env.LLM_PROVIDER ?? 'local').toLowerCase();
  const requested = (requestedRaw === 'local' ? 'mock' : requestedRaw) as LlmProviderName;
  const supported: LlmProviderName[] = ['mock', 'openai', 'deepseek', 'anthropic'];
  const provider = supported.includes(requested) ? requested : 'mock';

  if (provider === 'mock' || !hasKey(provider, env)) {
    return createLocalProvider();
  }

  // MVP v2.0 keeps structure deterministic for build/test safety. Real providers can be wired here later
  // without changing route contracts; for now the validated deterministic provider remains authoritative.
  return {
    ...createLocalProvider(),
    name: provider,
    mode: 'external-placeholder'
  };
}

