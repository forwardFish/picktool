import test from 'node:test';
import assert from 'node:assert/strict';
import { matchDecisionTemplate } from '../lib/decision-engine/matchDecisionTemplate.ts';
import { buildDecisionResult } from '../lib/decision-engine/buildDecisionResult.ts';
import { validateDecisionInput } from '../lib/schemas/toolDecision.ts';

test('matches TikTok product promo video template', () => {
  const template = matchDecisionTemplate('I want to create a product promo video for TikTok.');
  assert.equal(template.slug, 'tiktok-product-promo-video');
});

test('buildDecisionResult resolves required result sections and tools', () => {
  const input = 'I want to create a product promo video for TikTok.';
  const result = buildDecisionResult(matchDecisionTemplate(input), input);

  assert.equal(result.resultTitle, 'Best Tool Setup for This Task');
  assert.ok(result.recommendedTools.some((group) => group.tools.some((tool) => tool.slug === 'capcut')));
  assert.ok(result.usagePlan.length >= 3);
  assert.ok(result.skipAdvice.length >= 1);
  assert.ok(result.betterOptions.length >= 1);
  assert.ok(result.costAdvice.freePath.includes('CapCut'));
});

test('unknown input returns fallback decision', () => {
  const template = matchDecisionTemplate('Organize my messy personal notes into a calmer plan.');
  const result = buildDecisionResult(template, 'Organize my messy personal notes into a calmer plan.');

  assert.equal(template.slug, 'general-task-fallback');
  assert.equal(result.matched, false);
  assert.equal(result.resultTitle, 'Best Tool Setup for This Task');
});

test('validates decision input length and type', () => {
  assert.equal(validateDecisionInput('Hi').ok, false);
  assert.equal(validateDecisionInput('I need a product video').ok, true);
  assert.equal(validateDecisionInput('x'.repeat(2501)).ok, false);
  assert.equal(validateDecisionInput(null).ok, false);
});
