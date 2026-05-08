import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rawPath = path.join(root, 'data', 'ai-tools', 'raw', 'toolify_tools_raw.jsonl');
const normalizedPath = path.join(root, 'data', 'ai-tools', 'normalized', 'tool-details.jsonl');

function parseJsonList(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value) {
  if (!value || typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function unique(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function pricingModel(raw = '') {
  const text = raw.toLowerCase();
  if (text.includes('freemium') || text.includes('free trial')) return 'freemium';
  if (text.includes('free') && !text.includes('paid')) return 'free';
  if (text.includes('paid') || text.includes('subscription') || text.includes('$')) return 'paid';
  return 'unknown';
}

function priceLabel(model) {
  if (model === 'free') return 'Free';
  if (model === 'freemium') return 'Free / Paid';
  if (model === 'paid') return 'Paid';
  return 'Unknown';
}

function levelFromCategories(categories, features) {
  const text = [...categories, ...features].join(' ').toLowerCase();
  if (/api|developer|automation|agent|advanced|enterprise/.test(text)) return 'Intermediate';
  return 'Beginner';
}

function sentence(value, fallback) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function shortDescription(value, max = 120) {
  const text = sentence(value, '');
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function featureCards(features, useCases, name) {
  const candidates = unique([...features, ...useCases]).slice(0, 4);
  return candidates.map((item) => ({
    title: item.length > 42 ? shortDescription(item, 42) : item,
    description: `${name} supports ${item.toLowerCase()} for practical AI workflow execution.`
  }));
}

function overview(row, categories, features, useCases, traffic) {
  const name = row.name;
  const product = sentence(row.product_info, row.introduction);
  const firstFeature = features[0] ?? categories[0] ?? 'AI workflow support';
  const visitors = traffic['Monthly Visits'] || row.monthly_visitors_raw;
  return {
    whatIs: product,
    whyItMatters: `${name} helps users complete ${firstFeature.toLowerCase()} faster with a smaller tool stack.`,
    whoItsFor: useCases.slice(0, 4).join(', ') || `Teams and individuals working on ${categories[0] ?? 'AI'} tasks.`,
    whereItWorks: visitors ? `Public catalog traffic: ${visitors} monthly visits. Works through its official website or supported app surfaces.` : 'Use through the official website or supported app surfaces.',
    whatYouGet: unique([...features.slice(0, 4), ...useCases.slice(0, 2)]).join(', ') || row.introduction || product
  };
}

function alternativesFor(row, rows) {
  const categories = parseJsonList(row.categories_json);
  const primary = categories[0];
  return rows
    .filter((candidate) => candidate.slug !== row.slug)
    .map((candidate) => ({
      candidate,
      categories: parseJsonList(candidate.categories_json)
    }))
    .filter(({ categories: candidateCategories }) => primary && candidateCategories.includes(primary))
    .slice(0, 3)
    .map(({ candidate }) => ({
      slug: candidate.slug,
      name: candidate.name,
      description: shortDescription(candidate.introduction || candidate.product_info || `${candidate.name} is another ${primary} option.`, 96)
    }));
}

function relatedTopics(categories, tags, useCases) {
  return unique([...categories, ...tags, ...useCases])
    .filter((item) => !/^https?:\/\//i.test(item))
    .filter((item) => item.toLowerCase() !== 'category')
    .slice(0, 12);
}

function completeness(row, features, useCases) {
  const score = [
    row.product_info,
    row.how_to_use,
    features.length >= 4,
    useCases.length >= 3,
    row.external_url,
    row.toolify_url
  ].filter(Boolean).length;
  if (score >= 5) return 'full';
  if (score >= 3) return 'partial';
  return 'basic';
}

function detailFromRaw(row, rows) {
  const categories = parseJsonList(row.categories_json);
  const tags = parseJsonList(row.tags_json);
  const features = parseJsonList(row.features_json);
  const useCases = parseJsonList(row.use_cases_json);
  const traffic = parseJsonObject(row.traffic_json);
  const model = pricingModel(row.pricing_model || row.pricing_text);
  const sourceUrl = row.toolify_url;
  const websiteUrl = row.external_url || undefined;
  const core = unique([...features, ...useCases]).slice(0, 8);
  const name = row.name;

  return {
    slug: row.slug,
    toolSlug: row.slug,
    name,
    source: 'toolify',
    sourceUrl,
    websiteUrl,
    hero: {
      tagline: sentence(row.introduction, `${name} from the Toolify local catalog.`),
      category: categories[0] ?? 'AI tool',
      pricingModel: model,
      level: levelFromCategories(categories, features),
      rating: typeof row.rating === 'number' ? row.rating : undefined,
      reviewsCount: typeof row.reviews_count === 'number' ? row.reviews_count : undefined,
      savedCount: typeof row.saved_count === 'number' ? row.saved_count : undefined,
      monthlyVisitors: typeof row.monthly_visitors_num === 'number' ? row.monthly_visitors_num : undefined
    },
    overview: overview(row, categories, features, useCases, traffic),
    howToUse: sentence(row.how_to_use, `Open ${name}, prepare your task inputs, create a first output, then review it against your plan.`),
    features: {
      core,
      cards: featureCards(features, useCases, name)
    },
    pricing: {
      model,
      freePlan: model === 'paid' ? 'Not confirmed in Toolify data' : 'Yes or available through a free/freemium entry point',
      paidPlan: model === 'free' ? 'Not required by catalog pricing model' : priceLabel(model),
      billing: /year|month|subscription/i.test(row.pricing_text || row.pricing_model || '') ? 'Monthly / yearly availability should be verified on the official site' : 'Verify current billing on the official website',
      note: sentence(row.pricing_text, `Toolify catalog pricing model: ${priceLabel(model)}.`)
    },
    alternatives: alternativesFor(row, rows),
    relatedTopics: relatedTopics(categories, tags, useCases),
    sourceMeta: {
      crawledAt: row.crawled_at || row.updated_at,
      sourceUrl,
      dataCompleteness: completeness(row, features, useCases)
    }
  };
}

if (!fs.existsSync(rawPath)) {
  throw new Error(`Missing raw Toolify data: ${rawPath}`);
}

const rows = fs.readFileSync(rawPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((row) => row.slug && row.name);

const details = rows.map((row) => detailFromRaw(row, rows));
fs.mkdirSync(path.dirname(normalizedPath), { recursive: true });
fs.writeFileSync(normalizedPath, `${details.map((detail) => JSON.stringify(detail)).join('\n')}\n`, 'utf8');

const required = ['capcut-com', 'invideo', 'writesonic', 'gamma-ai-1', 'lovable'];
const available = new Set(details.map((detail) => detail.slug));
const missing = required.filter((slug) => !available.has(slug));
if (missing.length) {
  console.warn(`[tool-details] Missing expected sample details: ${missing.join(', ')}`);
}
console.log(`[tool-details] Wrote ${details.length} details to ${normalizedPath}`);
