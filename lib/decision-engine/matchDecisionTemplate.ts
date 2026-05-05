import { decisionTemplates, fallbackDecisionTemplate } from '../data/decisionTemplates.ts';
import type { DecisionTemplate } from '../schemas/toolDecision.ts';

export function matchDecisionTemplate(input: string): DecisionTemplate {
  const normalized = input.toLowerCase();
  const scored = decisionTemplates
    .filter((template) => template.id !== fallbackDecisionTemplate.id)
    .map((template) => ({
      template,
      score: template.keywords.reduce((total, keyword) => total + (normalized.includes(keyword.toLowerCase()) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score < 2) {
    return fallbackDecisionTemplate;
  }

  return best.template;
}

export function didMatchSpecificTemplate(template: DecisionTemplate) {
  return template.id !== fallbackDecisionTemplate.id;
}
