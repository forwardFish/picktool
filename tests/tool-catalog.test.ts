import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectSafetyText } from '../lib/tool-catalog/safety-filter.ts';
import { normalizeToolifyTool } from '../lib/tool-catalog/normalize-toolify.ts';
import { loadAiTools } from '../lib/tool-catalog/load-tools.ts';
import { searchTools } from '../lib/tool-catalog/search-tools.ts';
import { recommendTools } from '../lib/tool-catalog/recommend-tools.ts';

test('safety filter blocks risky catalog categories', () => {
  const result = inspectSafetyText(['AI Detection & Anti-Detection bypass tool']);
  assert.equal(result.allowed, false);
  assert.ok(result.riskTags.includes('bypass'));
});

test('normalizer converts Toolify raw rows into AiTool shape', () => {
  const tool = normalizeToolifyTool({
    slug: 'aura-build',
    name: 'Aura.build',
    toolify_url: 'https://www.toolify.ai/tool/aura-build',
    external_url: 'https://www.aura.build',
    introduction: 'AI website builder generating responsive landing pages.',
    pricing_model: 'Freemium, Paid',
    categories_json: '["AI Landing Page Builder","AI Website Builder"]',
    features_json: '["Export to HTML","Screenshot to website"]',
    use_cases_json: '["Rapidly launching marketing landing pages"]'
  });

  assert.ok(tool);
  assert.equal(tool.slug, 'aura-build');
  assert.equal(tool.pricingModel, 'freemium');
  assert.equal(tool.safety.allowed, true);
  assert.ok(tool.taskIntents.includes('landing_page'));
});

test('search and recommendation cover core MVP tasks', () => {
  const loaded = loadAiTools();
  const video = recommendTools({ input: 'AI 视频剪辑' });
  const pdf = recommendTools({ input: 'PDF 转 PPT' });
  const landing = recommendTools({ input: 'Landing Page' });

  assert.ok(loaded.tools.length >= 1);
  assert.equal(video.taskIntent.taskType, 'video_editing');
  assert.equal(pdf.taskIntent.taskType, 'document_to_slides');
  assert.equal(landing.taskIntent.taskType, 'landing_page');
  assert.ok(video.selectedTools.length >= 1);
  assert.ok(pdf.selectedTools.length >= 1);
  assert.ok(landing.selectedTools.length >= 1);
  assert.ok(searchTools(loaded.tools, 'Landing Page').length >= 1);
});

test('catalog loader keeps manual fallback tools available', () => {
  const loaded = loadAiTools();
  assert.ok(loaded.tools.some((tool) => tool.source === 'manual' && tool.slug === 'chatgpt'));
  assert.ok(loaded.tools.some((tool) => tool.source === 'manual' && tool.slug === 'capcut'));
});
