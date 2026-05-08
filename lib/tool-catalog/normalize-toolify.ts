import { applySafety } from './safety-filter.ts';
import type { AiTool, PricingModel, ToolifyRawTool } from './types.ts';

function parseJsonList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizePricing(raw: string | undefined): PricingModel {
  const text = (raw ?? '').toLowerCase();
  if (!text) return 'unknown';
  if (text.includes('freemium') || text.includes('free trial')) return 'freemium';
  if (text.includes('free') && !text.includes('paid')) return 'free';
  if (text.includes('paid') || text.includes('subscription') || text.includes('$')) return 'paid';
  return 'unknown';
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function inferTaskIntents(categories: string[], tags: string[], features: string[], useCases: string[]) {
  const text = [...categories, ...tags, ...features, ...useCases].join(' ').toLowerCase();
  const intents: string[] = [];
  if (/(video editor|video editing|caption generator|subtitle generator|short video|script to video|ai video|剪辑|短视频|字幕)/.test(text)) intents.push('video_editing');
  if (/(ppt maker|presentation generator|pdf summarizer|ai pdf|slides|slide deck|presentation|ppt|pdf|幻灯片)/.test(text)) intents.push('document_to_slides');
  if (/(landing page builder|website builder|website designer|web page|html|landing page|官网|落地页)/.test(text)) intents.push('landing_page');
  if (/(report generator|report writing|research tool|data analytics|competitor|market research|analysis report|调研|报告)/.test(text)) intents.push('market_research');
  if (/image|design|poster|cover|thumbnail|图像|图片/.test(text)) intents.push('image_design');
  if (/writing|copywriting|script|chat|assistant|文案|脚本/.test(text)) intents.push('general_ai_workflow');
  return unique(intents.length ? intents : ['general_ai_workflow']);
}

function inferIoTypes(text: string) {
  const normalized = text.toLowerCase();
  const inputTypes = ['text'];
  const outputTypes = ['text'];
  if (/video|clip|mp4|字幕|剪辑/.test(normalized)) {
    inputTypes.push('video', 'image');
    outputTypes.push('video');
  }
  if (/image|photo|poster|cover|thumbnail|图像|图片/.test(normalized)) {
    inputTypes.push('image');
    outputTypes.push('image');
  }
  if (/pdf|document|doc|文档/.test(normalized)) inputTypes.push('document');
  if (/ppt|slide|deck|presentation|幻灯片/.test(normalized)) outputTypes.push('slides');
  if (/website|html|landing|web|网页/.test(normalized)) outputTypes.push('web page');
  return { inputTypes: unique(inputTypes), outputTypes: unique(outputTypes) };
}

export function normalizeToolifyTool(raw: ToolifyRawTool): AiTool | null {
  const name = String(raw.name ?? '').trim();
  if (!name) return null;
  if (/^[\u2e80-\u9fff\sㄗㄘ]{4,}$/.test(name) && !/[a-z0-9]/i.test(name)) return null;

  const categories = parseJsonList(raw.categories_json);
  const tags = parseJsonList(raw.tags_json);
  const features = parseJsonList(raw.features_json);
  const useCases = parseJsonList(raw.use_cases_json);
  const description = String(raw.introduction || raw.product_info || raw.how_to_use || '').trim();
  const text = [name, description, ...categories, ...tags, ...features, ...useCases].join(' ');
  const { inputTypes, outputTypes } = inferIoTypes(text);
  const websiteUrl = raw.external_url || undefined;

  const base: Omit<AiTool, 'safety'> = {
    id: `toolify:${raw.slug || slugify(name)}`,
    slug: raw.slug || slugify(name),
    name,
    source: 'toolify',
    sourceUrl: raw.toolify_url,
    websiteUrl,
    shortDescription: description || `${name} from Toolify local catalog.`,
    primaryCategory: categories[0] ?? 'AI tool',
    categories,
    tags: unique([...tags, ...features.slice(0, 8)]),
    taskIntents: inferTaskIntents(categories, [], features, useCases),
    inputTypes,
    outputTypes,
    bestFor: unique([...useCases.slice(0, 6), ...features.slice(0, 4)]),
    notBestFor: [],
    useWhen: unique([raw.how_to_use ?? '', ...useCases.slice(0, 4)]).slice(0, 6),
    skipWhen: [],
    pricingModel: normalizePricing(raw.pricing_model || raw.pricing_text),
    action: {
      type: 'link',
      openUrl: websiteUrl,
      promptTemplateIds: ['general-tool-usage']
    },
    metrics: {
      monthlyVisitors: typeof raw.monthly_visitors_num === 'number' ? raw.monthly_visitors_num : undefined,
      rating: typeof raw.rating === 'number' ? raw.rating : undefined,
      reviewsCount: typeof raw.reviews_count === 'number' ? raw.reviews_count : undefined,
      savedCount: typeof raw.saved_count === 'number' ? raw.saved_count : undefined
    }
  };

  return applySafety(base);
}

export function normalizeToolifyTools(rows: ToolifyRawTool[]) {
  return rows.map(normalizeToolifyTool).filter((tool): tool is AiTool => Boolean(tool));
}
