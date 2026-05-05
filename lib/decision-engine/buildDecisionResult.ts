import { getToolsBySlugs } from '../data/tools.ts';
import { didMatchSpecificTemplate, matchDecisionTemplate } from './matchDecisionTemplate.ts';
import type { DecisionResult, DecisionTemplate } from '../schemas/toolDecision.ts';

export function buildDecisionResult(template: DecisionTemplate, input: string): DecisionResult {
  return {
    input,
    matched: didMatchSpecificTemplate(template),
    templateId: template.id,
    templateSlug: template.slug,
    setupSlug: template.setupSlug,
    taskTitle: template.taskTitle,
    resultTitle: template.resultTitle,
    oneLineReason: template.oneLineReason,
    recommendedTools: template.recommendedTools.map((item) => ({
      ...item,
      tools: getToolsBySlugs(item.toolSlugs)
    })),
    usagePlan: template.usagePlan,
    skipAdvice: template.skipAdvice.map((item) => ({
      ...item,
      tools: getToolsBySlugs(item.toolSlugs)
    })),
    betterOptions: template.betterOptions,
    costAdvice: template.costAdvice,
    bestFor: template.bestFor,
    notIdealFor: template.notIdealFor,
    switchSignals: template.switchSignals
  };
}

export function getDecisionResultForInput(input: string) {
  return buildDecisionResult(matchDecisionTemplate(input), input);
}
