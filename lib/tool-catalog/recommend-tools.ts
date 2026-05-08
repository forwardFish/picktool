import { loadAiTools } from './load-tools.ts';
import { searchToolsByIntent } from './search-tools.ts';
import { inferTaskIntent } from './taxonomy.ts';
import { scoreTools } from './score-tools.ts';
import type { AiTool, TaskIntent, ToolRecommendationResult } from './types.ts';

type RecommendInput = {
  input: string;
  constraints?: TaskIntent['constraints'];
  optionKey?: string;
};

function pickBy(toolList: AiTool[], patterns: RegExp[], fallbackCount = 1) {
  const matched = toolList.filter((tool) => {
    const text = [tool.slug, tool.name, tool.primaryCategory, tool.shortDescription, ...tool.categories, ...tool.tags, ...tool.taskIntents].join(' ').toLowerCase();
    return patterns.some((pattern) => pattern.test(text));
  });
  return matched.length ? matched : toolList.slice(0, fallbackCount);
}

function uniqueTools(tools: AiTool[]) {
  const bySlug = new Map<string, AiTool>();
  for (const tool of tools) bySlug.set(tool.slug, tool);
  return [...bySlug.values()];
}

function chooseCoreTools(scoredTools: AiTool[], intent: TaskIntent, optionKey?: string) {
  const assistants = pickBy(scoredTools, [/chatgpt|claude|assistant|writing|copy|script|文案|脚本/], 1).slice(0, 1);

  if (optionKey === 'automated') {
    const automated = pickBy(scoredTools, [/invideo|template|automation|one-tool|automated|video creation/], 1).slice(0, 1);
    return uniqueTools([...assistants, ...automated]).slice(0, 3);
  }

  if (optionKey === 'professional') {
    const production = productionTools(scoredTools, intent).slice(0, 1);
    const polish = pickBy(scoredTools, [/canva|design|presentation|layout|cover|thumbnail|website builder/], 1).slice(0, 1);
    return uniqueTools([...assistants, ...production, ...polish]).slice(0, 3);
  }

  if (optionKey === 'advanced_visual') {
    const production = productionTools(scoredTools, intent).slice(0, 1);
    const visual = pickBy(scoredTools, [/runway|kling|image generation|video generation|advanced visual|text to video/], 1).slice(0, 1);
    return uniqueTools([...assistants, ...production, ...visual]).slice(0, 3);
  }

  if (optionKey === 'budget') {
    return uniqueTools([...assistants, ...productionTools(scoredTools, intent)])
      .filter((tool) => tool.pricingModel === 'free' || tool.pricingModel === 'freemium' || tool.source === 'manual')
      .slice(0, 2);
  }

  return uniqueTools([...assistants, ...productionTools(scoredTools, intent)]).slice(0, 2);
}

function productionTools(scoredTools: AiTool[], intent: TaskIntent) {
  if (intent.taskType === 'video_editing') return pickBy(scoredTools, [/capcut|剪映|video editor|captions|subtitle|editing/], 1);
  if (intent.taskType === 'document_to_slides') return pickBy(scoredTools, [/canva|presentation|slides|ppt|deck/], 1);
  if (intent.taskType === 'landing_page') return pickBy(scoredTools, [/landing|website builder|web|html|canva|aura/], 1);
  if (intent.taskType === 'market_research') return pickBy(scoredTools, [/chatgpt|claude|research|analysis|report/], 1);
  return scoredTools.slice(0, 2);
}

function buildSlots(selectedTools: AiTool[], scoredTools: AiTool[], intent: TaskIntent) {
  const assistant = selectedTools.find((tool) => /assistant|chatgpt|claude|writing|copy/i.test([tool.slug, tool.primaryCategory, ...tool.tags].join(' ')));
  const production = selectedTools.filter((tool) => tool.slug !== assistant?.slug);
  return [
    {
      id: 'plan',
      role: 'Clarify and structure the task',
      primaryTools: assistant ? [assistant] : selectedTools.slice(0, 1),
      alternatives: scoredTools.filter((tool) => tool.slug !== assistant?.slug).slice(0, 2),
      note: `Turn the request into a practical ${intent.deliverable} plan before opening production tools.`
    },
    {
      id: 'produce',
      role: `Create the ${intent.deliverable}`,
      primaryTools: production.length ? production : selectedTools.slice(0, 1),
      alternatives: scoredTools.filter((tool) => !selectedTools.some((selected) => selected.slug === tool.slug)).slice(0, 3),
      note: 'Use the smallest capable tool stack first, then upgrade only for a clear bottleneck.'
    }
  ];
}

function buildUpgrades(scoredTools: AiTool[], selectedTools: AiTool[]) {
  const selected = new Set(selectedTools.map((tool) => tool.slug));
  const remaining = scoredTools.filter((tool) => !selected.has(tool.slug));
  return [
    {
      key: 'professional' as const,
      label: '更专业一点',
      description: 'Add stronger design, presentation, or polish only when the basic output feels too rough.',
      tools: pickBy(remaining, [/canva|design|presentation|layout|cover|thumbnail/], 1).slice(0, 2)
    },
    {
      key: 'budget' as const,
      label: '更省钱一点',
      description: 'Prefer free and freemium tools; postpone paid upgrades until the workflow is proven.',
      tools: remaining.filter((tool) => tool.pricingModel === 'free' || tool.pricingModel === 'freemium').slice(0, 2)
    },
    {
      key: 'automated' as const,
      label: '更自动化一点',
      description: 'Use templates or one-tool generation when speed matters more than fine control.',
      tools: pickBy(remaining, [/invideo|template|automation|one-tool|automated|generator/], 1).slice(0, 2)
    },
    {
      key: 'advanced_visual' as const,
      label: '看更高级方案',
      description: 'Consider AI visual generation only when the task lacks visual assets or needs high-end visuals.',
      tools: pickBy(remaining, [/runway|kling|image generation|video generation|visual/], 1).slice(0, 2)
    }
  ];
}

export function recommendTools({ input, constraints = {}, optionKey }: RecommendInput): ToolRecommendationResult {
  const loaded = loadAiTools();
  const taskIntent = inferTaskIntent(input, {
    budget: constraints.budget ?? 'free_first',
    skillLevel: constraints.skillLevel ?? 'beginner',
    speed: constraints.speed
  });
  const candidates = searchToolsByIntent(loaded.tools, taskIntent, 40);
  const scored = scoreTools(candidates.length ? candidates : loaded.tools.filter((tool) => tool.safety.allowed), taskIntent);
  const sortedTools = scored.map((item) => item.tool);
  const selectedTools = chooseCoreTools(sortedTools, taskIntent, optionKey);
  const selected = selectedTools.length ? selectedTools : sortedTools.slice(0, 2);
  const selectedSlugs = new Set(selected.map((tool) => tool.slug));
  const skippedTools = sortedTools
    .filter((tool) => !selectedSlugs.has(tool.slug))
    .slice(0, 4)
    .map((tool) => ({
      tool,
      reason: optionKey === 'advanced_visual'
        ? 'Keep as an alternative unless this exact upgrade direction is selected.'
        : 'Not needed for the first good-enough workflow.'
    }));

  return {
    taskIntent,
    selectedTools: selected,
    toolSlots: buildSlots(selected, sortedTools, taskIntent),
    upgradeOptions: buildUpgrades(sortedTools, selected),
    skippedTools,
    scoringEvidence: scored.map((item) => item.evidence).slice(0, 12),
    catalogStats: {
      source: loaded.source,
      totalTools: loaded.tools.length,
      safetyFilteredCount: loaded.safetyFilteredCount
    }
  };
}
