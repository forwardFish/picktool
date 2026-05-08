import fs from 'node:fs';
import path from 'node:path';
import { getToolBySlug } from '../data/tools.ts';
import { getAiToolBySlug, loadAiTools } from './load-tools.ts';
import type { AiTool, AiToolDetail, PricingModel } from './types.ts';

const detailPath = path.join(process.cwd(), 'data', 'ai-tools', 'normalized', 'tool-details.jsonl');

const explicitAliases: Record<string, string> = {
  capcut: 'capcut-com'
};

export type ToolDetailResult = {
  tool: AiTool;
  detail: AiToolDetail;
  requestedSlug: string;
  resolvedSlug: string;
  detailStatus: 'full' | 'partial' | 'basic';
};

function readDetailJsonl(filePath: string): AiToolDetail[] {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AiToolDetail);
}

export function loadAiToolDetails() {
  return readDetailJsonl(detailPath);
}

function bySlug() {
  return new Map(loadAiToolDetails().map((detail) => [detail.slug, detail]));
}

function sameNameDetail(slug: string) {
  const legacy = getToolBySlug(slug);
  if (!legacy) return undefined;
  const normalizedLegacyName = legacy.name.toLowerCase();
  return loadAiToolDetails().find((detail) => detail.name.toLowerCase() === normalizedLegacyName);
}

export function resolveToolDetailSlug(slug: string) {
  const details = bySlug();
  if (details.has(slug)) return slug;
  const explicit = explicitAliases[slug];
  if (explicit && details.has(explicit)) return explicit;
  return sameNameDetail(slug)?.slug ?? slug;
}

function priceLabel(model: PricingModel) {
  if (model === 'free') return 'Free';
  if (model === 'freemium') return 'Free / Paid';
  if (model === 'paid') return 'Paid';
  return 'Unknown';
}

function buildBasicDetail(tool: AiTool, resolvedSlug: string): AiToolDetail {
  const core = [...tool.bestFor, ...tool.tags].filter(Boolean).slice(0, 6);
  return {
    slug: resolvedSlug,
    toolSlug: tool.slug,
    name: tool.name,
    source: tool.source,
    sourceUrl: tool.sourceUrl,
    websiteUrl: tool.websiteUrl,
    hero: {
      tagline: tool.shortDescription,
      category: tool.primaryCategory,
      pricingModel: tool.pricingModel,
      level: tool.source === 'manual' ? 'Beginner' : 'Catalog',
      rating: tool.metrics?.rating,
      reviewsCount: tool.metrics?.reviewsCount,
      savedCount: tool.metrics?.savedCount,
      monthlyVisitors: tool.metrics?.monthlyVisitors
    },
    overview: {
      whatIs: tool.shortDescription,
      whyItMatters: tool.bestFor[0] ?? `Use ${tool.name} when it fits the current workflow bottleneck.`,
      whoItsFor: tool.bestFor.slice(0, 3).join(', ') || 'Users evaluating AI workflow tools.',
      whereItWorks: tool.inputTypes.concat(tool.outputTypes).slice(0, 5).join(', ') || tool.primaryCategory,
      whatYouGet: core.join(', ') || tool.shortDescription
    },
    howToUse: tool.useWhen[0] ?? `Open ${tool.name}, prepare your task inputs, create a first output, then review it against your current plan.`,
    features: {
      core,
      cards: core.slice(0, 4).map((item) => ({ title: item, description: `${tool.name} supports this capability for ${tool.primaryCategory.toLowerCase()} workflows.` }))
    },
    pricing: {
      model: tool.pricingModel,
      freePlan: tool.pricingModel === 'paid' ? 'Not confirmed in local catalog' : 'Available or likely available based on catalog pricing model',
      paidPlan: tool.pricingModel === 'free' ? 'Not required for the basic workflow' : priceLabel(tool.pricingModel),
      billing: 'Verify current billing on the official website',
      note: 'Pricing details come from local catalog data and should be verified before purchase.'
    },
    alternatives: [],
    relatedTopics: [tool.primaryCategory, ...tool.categories, ...tool.taskIntents].filter(Boolean).slice(0, 10),
    sourceMeta: {
      sourceUrl: tool.sourceUrl,
      dataCompleteness: 'basic'
    }
  };
}

export function getToolDetailBySlug(slug: string): ToolDetailResult | null {
  const resolvedSlug = resolveToolDetailSlug(slug);
  const details = bySlug();
  const detail = details.get(resolvedSlug);
  const tool = getAiToolBySlug(resolvedSlug) ?? getAiToolBySlug(slug);

  if (detail && tool) {
    return {
      tool,
      detail,
      requestedSlug: slug,
      resolvedSlug,
      detailStatus: detail.sourceMeta.dataCompleteness
    };
  }

  if (tool) {
    const fallback = buildBasicDetail(tool, resolvedSlug);
    return {
      tool,
      detail: fallback,
      requestedSlug: slug,
      resolvedSlug,
      detailStatus: 'basic'
    };
  }

  const legacy = getToolBySlug(slug);
  if (!legacy) return null;
  const manualTool = loadAiTools().tools.find((item) => item.slug === legacy.slug);
  if (!manualTool) return null;
  const fallback = buildBasicDetail(manualTool, resolvedSlug);
  return {
    tool: manualTool,
    detail: fallback,
    requestedSlug: slug,
    resolvedSlug,
    detailStatus: 'basic'
  };
}

export function getToolDetailPath() {
  return detailPath;
}
