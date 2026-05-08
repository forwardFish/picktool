import { capabilityKeywords } from './taxonomy.ts';
import type { AiTool, TaskIntent, ToolScoreEvidence } from './types.ts';

function haystack(tool: AiTool) {
  return {
    name: tool.name.toLowerCase(),
    description: tool.shortDescription.toLowerCase(),
    categories: tool.categories.join(' ').toLowerCase(),
    tags: tool.tags.join(' ').toLowerCase(),
    bestFor: tool.bestFor.join(' ').toLowerCase(),
    useWhen: tool.useWhen.join(' ').toLowerCase(),
    taskIntents: tool.taskIntents.join(' ').toLowerCase(),
    io: [...tool.inputTypes, ...tool.outputTypes].join(' ').toLowerCase()
  };
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term.toLowerCase()));
}

export function scoreTool(tool: AiTool, intent: TaskIntent): ToolScoreEvidence {
  const fields = haystack(tool);
  let score = 0;
  const reasons: string[] = [];
  const matchedFields: string[] = [];

  if (tool.taskIntents.includes(intent.taskType)) {
    score += 30;
    reasons.push(`Matches task type: ${intent.taskType}`);
    matchedFields.push('taskIntents');
  }

  for (const capability of intent.requiredCapabilities) {
    const terms = capabilityKeywords[capability] ?? [capability];
    const entries = Object.entries(fields).filter(([, value]) => includesAny(value, terms));
    if (entries.length) {
      score += 8;
      reasons.push(`Matches capability: ${capability}`);
      matchedFields.push(...entries.map(([name]) => name));
    }
  }

  for (const keyword of intent.keywords) {
    const entries = Object.entries(fields).filter(([, value]) => value.includes(keyword.toLowerCase()));
    if (entries.length) {
      score += 3;
      matchedFields.push(...entries.map(([name]) => name));
    }
  }

  if (intent.constraints.budget === 'free_first' || intent.constraints.budget === 'free') {
    if (tool.pricingModel === 'free' || tool.pricingModel === 'freemium') {
      score += 8;
      reasons.push('Fits free-first budget');
    } else if (tool.pricingModel === 'paid') {
      score -= 8;
      reasons.push('Paid tool is less budget-friendly');
    }
  }

  if (intent.constraints.speed === 'fast' && /template|automation|one-tool|fast|quick/i.test([...tool.tags, ...tool.bestFor, tool.shortDescription].join(' '))) {
    score += 6;
    reasons.push('Fits speed/automation preference');
  }

  if ((tool.metrics?.monthlyVisitors ?? 0) > 100000) {
    score += 3;
    reasons.push('Has stronger usage signal');
  }

  return {
    toolSlug: tool.slug,
    score: Math.max(0, Number(score.toFixed(2))),
    reasons: reasons.length ? reasons : ['Weak semantic match'],
    matchedFields: [...new Set(matchedFields)]
  };
}

export function scoreTools(tools: AiTool[], intent: TaskIntent) {
  return tools
    .map((tool) => ({ tool, evidence: scoreTool(tool, intent) }))
    .filter((item) => item.evidence.score > 0)
    .sort((a, b) => b.evidence.score - a.evidence.score);
}
