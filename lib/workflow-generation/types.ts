export type PlanType = 'basic' | 'professional' | 'budget' | 'automated' | 'advanced_visual';
export type FullPlanState = 'collapsed' | 'ready' | 'expanded' | 'completed';
export type ModuleType = 'script' | 'materials' | 'subtitles_cover' | 'delivery_check';
export type ChatMessageKind = 'text' | 'recommendation' | 'upgrade' | 'full_plan' | 'refinement';

export type ToolRole = 'core' | 'optional' | 'upgrade' | 'skip' | 'output';

export type WorkflowTool = {
  slug: string;
  name: string;
  role: string;
  note: string;
  badge?: string;
  status: ToolRole;
};

export type UpgradeOptionKey = 'professional' | 'budget' | 'automated' | 'advanced_visual' | 'full_plan' | 'good_enough';

export type UpgradeOption = {
  key: UpgradeOptionKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
};

export type SkippedTool = {
  toolSlug: string;
  name: string;
  reason: string;
};

export type TaskTemplate = {
  id: string;
  slug: string;
  title: string;
  keywords: string[];
  examples: string[];
  baseSummary: string;
  baseTools: WorkflowTool[];
  skippedTools: SkippedTool[];
};

export type WorkflowPlan = {
  id: string;
  templateSlug: string;
  taskInput: string;
  title: string;
  planType: PlanType;
  stepNumber: number;
  stepTitle: string;
  combinationLabel: string;
  summary: string;
  statusLabel: string;
  statusDescription: string;
  tools: WorkflowTool[];
  upgradeDirections: UpgradeOption[];
  skippedTools: SkippedTool[];
  nextActionLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentPlanSidebarState = {
  title: string;
  recommendationLabel: string;
  combinationLabel: string;
  statusLabel: string;
  statusDescription: string;
  upgradeTitle: string;
  upgradeDirections: UpgradeOption[];
  skippedTools: SkippedTool[];
  selectedTools: WorkflowTool[];
  ctaLabel: string;
};

export type ExecutionStep = {
  id: string;
  title: string;
  body: string;
  toolSlugs: string[];
};

export type OutputCard = {
  id: ModuleType;
  title: string;
  body: string;
};

export type FullExecutionPlan = {
  id: string;
  planId: string;
  recommendation: {
    title: string;
    combinationLabel: string;
    tools: WorkflowTool[];
  };
  executionSteps: ExecutionStep[];
  outputs: OutputCard[];
  cautions: string[];
  actionChips: { key: ModuleType; label: string; description: string }[];
  createdAt: string;
};

export type GeneratedOutput = {
  id: string;
  moduleType: ModuleType;
  title: string;
  summary: string;
  sections: { title: string; items: string[] }[];
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  kind: ChatMessageKind;
  content: string;
  createdAt: string;
  plan?: WorkflowPlan;
  fullPlan?: FullExecutionPlan;
  generatedOutput?: GeneratedOutput;
};

export type CopilotSession = {
  id: string;
  userInput: string;
  matchedTemplateSlug: string;
  messages: ChatMessage[];
  currentPlan: WorkflowPlan;
  sidebarState: CurrentPlanSidebarState;
  fullPlanState: FullPlanState;
  fullPlan?: FullExecutionPlan;
  refinements: GeneratedOutput[];
  createdAt: string;
  updatedAt: string;
  savedArchiveId?: string;
};

export type WorkflowGenerationResult = {
  sessionId: string;
  matchedTemplateSlug: string;
  messages: ChatMessage[];
  currentPlan: WorkflowPlan;
  sidebarState: CurrentPlanSidebarState;
  fullPlanState: FullPlanState;
  fullPlan?: FullExecutionPlan;
};

export function validateTaskInput(value: unknown): { ok: true; input: string } | { ok: false; error: string; status: number } {
  if (typeof value !== 'string') return { ok: false, error: 'Task input must be a string.', status: 400 };
  const input = value.trim();
  if (input.length < 3) return { ok: false, error: 'Describe the task with at least 3 characters.', status: 400 };
  if (input.length > 2500) return { ok: false, error: 'Task input must be 2500 characters or fewer.', status: 400 };
  return { ok: true, input };
}

export function validateOptionKey(value: unknown): { ok: true; optionKey: UpgradeOptionKey } | { ok: false; error: string; status: number } {
  const allowed: UpgradeOptionKey[] = ['professional', 'budget', 'automated', 'advanced_visual', 'full_plan', 'good_enough'];
  if (typeof value === 'string' && allowed.includes(value as UpgradeOptionKey)) {
    return { ok: true, optionKey: value as UpgradeOptionKey };
  }
  return { ok: false, error: 'Unsupported optionKey.', status: 400 };
}

export function validateModuleType(value: unknown): { ok: true; moduleType: ModuleType } | { ok: false; error: string; status: number } {
  const allowed: ModuleType[] = ['script', 'materials', 'subtitles_cover', 'delivery_check'];
  if (typeof value === 'string' && allowed.includes(value as ModuleType)) return { ok: true, moduleType: value as ModuleType };
  return { ok: false, error: 'Unsupported moduleType.', status: 400 };
}
