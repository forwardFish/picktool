import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = process.argv.includes('--input')
  ? process.argv[process.argv.indexOf('--input') + 1]
  : path.join(root, 'toolify_ai_source_crawler', 'data', 'export', 'toolify_tools.jsonl');
const outPath = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(root, 'data', 'ai-tools', 'normalized', 'tools.jsonl');
const rawOutPath = path.join(root, 'data', 'ai-tools', 'raw', 'toolify_tools_raw.jsonl');

const blocked = {
  adult: ['nsfw', 'adult', 'porn', 'erotic', 'nude', 'nudify', 'undress', 'onlyfans', 'sexy', 'bikini'],
  bypass: ['anti-detection', 'anti detection', 'bypass', 'captcha solver', 'stealth', 'undetectable'],
  gambling: ['gambling', 'casino', 'betting', 'sports betting', 'bookmaker'],
  weapons: ['weapon', 'gun', 'firearm', 'ammo', 'knife'],
  drugs: ['drug', 'cannabis', 'marijuana', 'thc', 'cbd', 'vape', 'nicotine', 'alcohol'],
  relationship: ['ai girlfriend', 'ai boyfriend', 'dating assistant', 'pickup lines', 'pick-up lines', 'rizz', 'waifu']
};

function jsonList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function pricing(raw = '') {
  const text = raw.toLowerCase();
  if (!text) return 'unknown';
  if (text.includes('freemium') || text.includes('free trial')) return 'freemium';
  if (text.includes('free') && !text.includes('paid')) return 'free';
  if (text.includes('paid') || text.includes('subscription') || text.includes('$')) return 'paid';
  return 'unknown';
}

function safety(parts) {
  const text = parts.join(' ').toLowerCase();
  const riskTags = Object.entries(blocked)
    .filter(([, words]) => words.some((word) => text.includes(word)))
    .map(([tag]) => tag);
  return {
    allowed: riskTags.length === 0,
    riskTags,
    blockedReason: riskTags.length ? `Blocked by safety filter: ${riskTags.join(', ')}` : undefined
  };
}

function unique(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function inferTaskIntents(values) {
  const text = values.join(' ').toLowerCase();
  const intents = [];
  if (/(video editor|video editing|caption generator|subtitle generator|short video|script to video|ai video|剪辑|短视频|字幕)/.test(text)) intents.push('video_editing');
  if (/(ppt maker|presentation generator|pdf summarizer|ai pdf|slides|slide deck|presentation|ppt|pdf|幻灯片)/.test(text)) intents.push('document_to_slides');
  if (/(landing page builder|website builder|website designer|web page|html|landing page|官网|落地页)/.test(text)) intents.push('landing_page');
  if (/(report generator|report writing|research tool|data analytics|competitor|market research|analysis report|调研|报告)/.test(text)) intents.push('market_research');
  if (/image|design|poster|cover|thumbnail|图像|图片/.test(text)) intents.push('image_design');
  if (/writing|copywriting|script|chat|assistant|文案|脚本/.test(text)) intents.push('general_ai_workflow');
  return unique(intents.length ? intents : ['general_ai_workflow']);
}

function inferIo(text) {
  const lower = text.toLowerCase();
  const inputTypes = ['text'];
  const outputTypes = ['text'];
  if (/video|clip|mp4|字幕|剪辑/.test(lower)) {
    inputTypes.push('video', 'image');
    outputTypes.push('video');
  }
  if (/image|photo|poster|cover|thumbnail|图像|图片/.test(lower)) {
    inputTypes.push('image');
    outputTypes.push('image');
  }
  if (/pdf|document|doc|文档/.test(lower)) inputTypes.push('document');
  if (/ppt|slide|deck|presentation|幻灯片/.test(lower)) outputTypes.push('slides');
  if (/website|html|landing|web|网页/.test(lower)) outputTypes.push('web page');
  return { inputTypes: unique(inputTypes), outputTypes: unique(outputTypes) };
}

function normalize(row) {
  if (!row.name) return null;
  const nameQualityText = String(row.name || '').trim();
  if (/^[\u2e80-\u9fff\sㄗㄘ]{4,}$/.test(nameQualityText) && !/[a-z0-9]/i.test(nameQualityText)) return null;
  const categories = jsonList(row.categories_json);
  const features = jsonList(row.features_json);
  const useCases = jsonList(row.use_cases_json);
  const tags = unique([...jsonList(row.tags_json), ...features.slice(0, 8)]);
  const shortDescription = row.introduction || row.product_info || row.how_to_use || `${row.name} from Toolify local catalog.`;
  const allText = [row.name, shortDescription, ...categories, ...tags, ...features, ...useCases].join(' ');
  const io = inferIo(allText);
  const safe = safety([row.name, shortDescription, ...categories, ...tags, ...useCases]);
  return {
    id: `toolify:${row.slug || slugify(row.name)}`,
    slug: row.slug || slugify(row.name),
    name: row.name,
    source: 'toolify',
    sourceUrl: row.toolify_url,
    websiteUrl: row.external_url || undefined,
    shortDescription,
    primaryCategory: categories[0] || 'AI tool',
    categories,
    tags,
    taskIntents: inferTaskIntents([row.name, shortDescription, ...categories, ...features, ...useCases]),
    inputTypes: io.inputTypes,
    outputTypes: io.outputTypes,
    bestFor: unique([...useCases.slice(0, 6), ...features.slice(0, 4)]),
    notBestFor: [],
    useWhen: unique([row.how_to_use || '', ...useCases.slice(0, 4)]).slice(0, 6),
    skipWhen: [],
    pricingModel: pricing(row.pricing_model || row.pricing_text),
    action: {
      type: 'link',
      openUrl: row.external_url || undefined,
      promptTemplateIds: ['general-tool-usage']
    },
    safety: safe,
    metrics: {
      monthlyVisitors: typeof row.monthly_visitors_num === 'number' ? row.monthly_visitors_num : undefined,
      rating: typeof row.rating === 'number' ? row.rating : undefined,
      reviewsCount: typeof row.reviews_count === 'number' ? row.reviews_count : undefined,
      savedCount: typeof row.saved_count === 'number' ? row.saved_count : undefined
    }
  };
}

if (!fs.existsSync(inputPath)) {
  console.error(`[normalize] input not found: ${inputPath}`);
  process.exit(1);
}

const rows = fs.readFileSync(inputPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const tools = rows.map(normalize).filter(Boolean);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.mkdirSync(path.dirname(rawOutPath), { recursive: true });
fs.copyFileSync(inputPath, rawOutPath);
fs.writeFileSync(outPath, tools.map((tool) => JSON.stringify(tool)).join('\n') + (tools.length ? '\n' : ''), 'utf8');
console.log(`[normalize] raw=${rows.length} normalized=${tools.length} allowed=${tools.filter((tool) => tool.safety.allowed).length} out=${outPath}`);
