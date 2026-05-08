import test from 'node:test';
import assert from 'node:assert/strict';
import { applyUpgrade, buildBasicPlan, buildSidebarState, generateFullExecutionPlan, matchTaskTemplate, refinePlanModule } from '../lib/workflow-generation/engine.ts';
import { getConfiguredProvider } from '../lib/workflow-generation/provider.ts';

test('v2 workflow matches graduation project video and builds good-enough plan first', () => {
  const template = matchTaskTemplate('我有一个毕业设计，想用 AI 帮我剪辑展示视频。');
  const plan = buildBasicPlan(template, '我有一个毕业设计，想用 AI 帮我剪辑展示视频。');

  assert.equal(template.slug, 'graduation-project-video');
  assert.equal(plan.planType, 'basic');
  assert.equal(plan.combinationLabel, 'ChatGPT / Claude + 剪映 / CapCut');
  assert.equal(plan.stepNumber, 1);
  assert.ok(plan.upgradeDirections.some((option) => option.key === 'professional'));
});

test('v2 professional upgrade adds Canva and updates sidebar state', () => {
  const base = buildBasicPlan(matchTaskTemplate('毕业设计展示视频'), '毕业设计展示视频');
  const upgraded = applyUpgrade(base, 'professional');
  const sidebar = buildSidebarState(upgraded);

  assert.equal(upgraded.planType, 'professional');
  assert.ok(upgraded.combinationLabel.includes('Canva'));
  assert.equal(sidebar.statusLabel, 'Basic plan upgraded');
  assert.ok(sidebar.selectedTools.some((tool) => tool.slug === 'canva'));
});

test('v2 automated upgrade uses InVideo with Canva optional', () => {
  const base = buildBasicPlan(matchTaskTemplate('毕业设计展示视频'), '毕业设计展示视频');
  const upgraded = applyUpgrade(base, 'automated');

  assert.equal(upgraded.planType, 'automated');
  assert.equal(upgraded.combinationLabel, 'ChatGPT / Claude + InVideo (Canva optional)');
  assert.ok(upgraded.tools.some((tool) => tool.slug === 'invideo'));
});

test('v2 full plan and refinement are deterministic', () => {
  const base = buildBasicPlan(matchTaskTemplate('毕业设计展示视频'), '毕业设计展示视频');
  const professional = applyUpgrade(base, 'professional');
  const fullPlan = generateFullExecutionPlan(professional);
  const output = refinePlanModule(fullPlan, 'materials');

  assert.equal(fullPlan.recommendation.combinationLabel, professional.combinationLabel);
  assert.ok(fullPlan.executionSteps.length >= 3);
  assert.equal(output.moduleType, 'materials');
  assert.ok(output.sections.length >= 1);
});

test('v2 non-video templates keep downstream workflow task-centered', () => {
  const pdfBase = buildBasicPlan(matchTaskTemplate('Please convert this PDF into slides'), 'Please convert this PDF into slides');
  const automated = applyUpgrade(pdfBase, 'automated');
  const fullPlan = generateFullExecutionPlan(automated);
  const combined = JSON.stringify({ tools: automated.tools, steps: fullPlan.executionSteps, outputs: fullPlan.outputs }).toLowerCase();

  assert.equal(pdfBase.templateSlug, 'pdf-to-ppt');
  assert.equal(automated.tools.some((tool) => tool.slug === 'invideo' || tool.slug === 'capcut' || tool.slug === 'runway'), false);
  assert.match(combined, /slide|ppt|幻灯片/);
  assert.equal(/capcut|invideo|runway|kling|剪辑成片/.test(combined), false);
});
test('v2 provider defaults to local deterministic generation without API keys', async () => {
  const provider = getConfiguredProvider({ LLM_PROVIDER: 'openai' } as unknown as NodeJS.ProcessEnv);
  const base = buildBasicPlan(matchTaskTemplate('毕业设计展示视频'), '毕业设计展示视频');
  const fullPlan = await provider.generateFullPlan(base);

  assert.equal(provider.name, 'local');
  assert.equal(provider.mode, 'local');
  assert.equal(fullPlan.recommendation.combinationLabel, base.combinationLabel);
});




