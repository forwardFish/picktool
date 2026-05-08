import { isAllowedTool } from './safety-filter.ts';
import { capabilityKeywords, inferTaskIntent } from './taxonomy.ts';
import type { AiTool, TaskIntent } from './types.ts';

function textForTool(tool: AiTool) {
  return [
    tool.name,
    tool.shortDescription,
    tool.primaryCategory,
    ...tool.categories,
    ...tool.tags,
    ...tool.taskIntents,
    ...tool.inputTypes,
    ...tool.outputTypes,
    ...tool.bestFor,
    ...tool.useWhen
  ].join(' ').toLowerCase();
}

function keywordScore(toolText: string, keywords: string[]) {
  return keywords.reduce((score, keyword) => score + (toolText.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

export function searchTools(tools: AiTool[], input: string, limit = 20) {
  const intent = inferTaskIntent(input);
  return searchToolsByIntent(tools, intent, limit);
}

export function searchToolsByIntent(tools: AiTool[], intent: TaskIntent, limit = 20) {
  const capabilityTerms = intent.requiredCapabilities.flatMap((capability) => capabilityKeywords[capability] ?? [capability]);
  return tools
    .filter(isAllowedTool)
    .map((tool) => {
      const text = textForTool(tool);
      const directIntentMatch = tool.taskIntents.includes(intent.taskType) ? 8 : 0;
      const keywordMatches = keywordScore(text, intent.keywords);
      const capabilityMatches = keywordScore(text, capabilityTerms);
      const score = directIntentMatch + keywordMatches * 2 + capabilityMatches;
      return { tool, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.tool.metrics?.monthlyVisitors ?? 0) - (a.tool.metrics?.monthlyVisitors ?? 0))
    .slice(0, limit)
    .map((item) => item.tool);
}
