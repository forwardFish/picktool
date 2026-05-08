import { tools as legacyTools } from '../data/tools.ts';
import { applySafety } from './safety-filter.ts';
import type { AiTool, PricingModel } from './types.ts';

function pricingModel(pricing: string): PricingModel {
  const lower = pricing.toLowerCase();
  if (lower.includes('free') && lower.includes('paid')) return 'freemium';
  if (lower.includes('free')) return 'free';
  if (lower.includes('paid')) return 'paid';
  return 'unknown';
}

export function getManualCatalogTools(): AiTool[] {
  return legacyTools.map((tool) => applySafety({
    id: `manual:${tool.slug}`,
    slug: tool.slug,
    name: tool.name,
    source: 'manual',
    websiteUrl: tool.practicalDetails.officialWebsite.startsWith('http')
      ? tool.practicalDetails.officialWebsite
      : `https://${tool.practicalDetails.officialWebsite}`,
    shortDescription: tool.tagline || tool.decisionSummary,
    primaryCategory: tool.category,
    categories: [tool.category, tool.practicalDetails.category],
    tags: [
      tool.level,
      tool.workflowRoles.position,
      tool.workflowRoles.role,
      ...tool.bestFitTasks
    ],
    taskIntents: inferManualIntents(tool.slug, tool.category, tool.bestFitTasks),
    inputTypes: splitDetails(tool.practicalDetails.input),
    outputTypes: splitDetails(tool.practicalDetails.output),
    bestFor: tool.worthUsingIf,
    notBestFor: tool.probablySkipIf,
    useWhen: tool.useWhen,
    skipWhen: tool.avoidWhen,
    pricingModel: pricingModel(tool.pricing),
    action: {
      type: 'link',
      openUrl: tool.practicalDetails.officialWebsite.startsWith('http')
        ? tool.practicalDetails.officialWebsite
        : `https://${tool.practicalDetails.officialWebsite}`,
      promptTemplateIds: ['general-tool-usage']
    }
  }));
}

function splitDetails(value: string) {
  return value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function inferManualIntents(slug: string, category: string, bestFitTasks: string[]) {
  const text = [slug, category, ...bestFitTasks].join(' ').toLowerCase();
  const intents = new Set<string>();
  if (/video|capcut|runway|kling|heygen|invideo/.test(text)) intents.add('video_editing');
  if (/canva|design|publishing/.test(text)) {
    intents.add('landing_page');
    intents.add('document_to_slides');
    intents.add('image_design');
  }
  if (/chatgpt|claude|assistant|script|copy/.test(text)) {
    intents.add('general_ai_workflow');
    intents.add('market_research');
  }
  return [...intents];
}
