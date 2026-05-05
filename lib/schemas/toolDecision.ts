export type ToolRole = 'Core' | 'Optional' | 'Shortcut';
export type ToolLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ToolPrice = 'Free' | 'Free / Paid' | 'Paid';
export type ToolStatus = 'core' | 'optional' | 'shortcut';

export type PracticalDetails = {
  officialWebsite: string;
  category: string;
  pricing: ToolPrice;
  input: string;
  output: string;
  platforms: string;
  commercialUse: string;
};

export type CommonSetup = {
  slug: string;
  title: string;
  role: string;
};

export type BetterOption = {
  condition: string;
  recommendation: string;
  bestFor: string;
  toolSlugs?: string[];
};

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  pricing: ToolPrice;
  level: ToolLevel;
  decisionSummary: string;
  worthUsingIf: string[];
  probablySkipIf: string[];
  bestFitTasks: string[];
  useWhen: string[];
  avoidWhen: string[];
  workflowRoles: {
    position: string;
    role: string;
    bestWith: string[];
    usedAfter: string;
    usedBefore: string;
  };
  commonSetups: CommonSetup[];
  betterOptionsIf: BetterOption[];
  practicalDetails: PracticalDetails;
};

export type RecommendedTool = {
  id: string;
  toolSlugs: string[];
  role: string;
  decision: string;
  condition: string;
  status: ToolStatus;
};

export type UsageStep = {
  title: string;
  body: string;
  tip: string;
};

export type SkipAdvice = {
  id: string;
  toolSlugs: string[];
  condition: string;
  reason: string;
};

export type CostAdvice = {
  freePath: string;
  lowCostPath: string;
  avoidPayingFor: string[];
};

export type DecisionTemplate = {
  id: string;
  slug: string;
  setupSlug: string;
  taskTitle: string;
  keywords: string[];
  examples: string[];
  recommendationType: 'tool_setup';
  resultTitle: 'Best Tool Setup for This Task';
  oneLineReason: string;
  recommendedTools: RecommendedTool[];
  usagePlan: UsageStep[];
  skipAdvice: SkipAdvice[];
  betterOptions: BetterOption[];
  costAdvice: CostAdvice;
  bestFor: string[];
  notIdealFor: string[];
  switchSignals: string[];
};

export type ResolvedRecommendedTool = RecommendedTool & {
  tools: Tool[];
};

export type ResolvedSkipAdvice = SkipAdvice & {
  tools: Tool[];
};

export type DecisionResult = {
  input: string;
  matched: boolean;
  templateId: string;
  templateSlug: string;
  setupSlug: string;
  taskTitle: string;
  resultTitle: 'Best Tool Setup for This Task';
  oneLineReason: string;
  recommendedTools: ResolvedRecommendedTool[];
  usagePlan: UsageStep[];
  skipAdvice: ResolvedSkipAdvice[];
  betterOptions: BetterOption[];
  costAdvice: CostAdvice;
  bestFor: string[];
  notIdealFor: string[];
  switchSignals: string[];
};

export type DecisionSearchRequest = {
  input: string;
};

export function validateDecisionInput(value: unknown): { ok: true; input: string } | { ok: false; error: string; status: number } {
  if (typeof value !== 'string') {
    return { ok: false, error: 'Input must be a string.', status: 400 };
  }

  const input = value.trim();

  if (input.length < 3) {
    return { ok: false, error: 'Describe a task with at least 3 characters.', status: 400 };
  }

  if (input.length > 2500) {
    return { ok: false, error: 'Input must be 2500 characters or fewer.', status: 400 };
  }

  return { ok: true, input };
}
