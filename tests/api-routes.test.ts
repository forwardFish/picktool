import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/decision/route.ts';
import { GET as GET_TOOL } from '../app/api/tools/[slug]/route.ts';
import { POST as SEARCH_TOOLS } from '../app/api/tools/search/route.ts';
import { POST as RECOMMEND_TOOLS } from '../app/api/tools/recommend/route.ts';
import { GET as GET_SETUP } from '../app/api/setups/[slug]/route.ts';
import { POST as START_COPILOT } from '../app/api/copilot/start/route.ts';
import { POST as SELECT_OPTION } from '../app/api/copilot/option/route.ts';
import { POST as SEND_MESSAGE } from '../app/api/copilot/message/route.ts';
import { POST as GENERATE_FULL_PLAN } from '../app/api/copilot/generate-full-plan/route.ts';
import { POST as REFINE_PLAN } from '../app/api/copilot/refine/route.ts';
import { GET as LIST_ARCHIVE, POST as CREATE_ARCHIVE } from '../app/api/archive/route.ts';
import { GET as GET_ARCHIVE } from '../app/api/archive/[id]/route.ts';
import { clearSessions } from '../lib/copilot/session-store.ts';
import { getArchiveStore } from '../lib/archive/index.ts';

test('POST /api/decision returns result for TikTok product video input', async () => {
  const request = new Request('http://localhost/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'I want to create a product promo video for TikTok.' })
  });

  const response = await POST(request);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.resultTitle, 'Best Tool Setup for This Task');
  assert.equal(body.setupSlug, 'tiktok-product-promo-video');
});

test('POST /api/decision rejects too-short input', async () => {
  const request = new Request('http://localhost/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'Hi' })
  });

  const response = await POST(request);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.error, /at least 3/);
});

test('GET /api/tools/capcut returns CapCut detail', async () => {
  const response = await GET_TOOL(new Request('http://localhost/api/tools/capcut'), {
    params: Promise.resolve({ slug: 'capcut' })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.name, 'CapCut');
  assert.ok(body.worthUsingIf.length > 0);
});

test('POST /api/tools/search returns local catalog results', async () => {
  const response = await SEARCH_TOOLS(new Request('http://localhost/api/tools/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'Landing Page' })
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body.tools));
  assert.ok(body.totalTools >= body.tools.length);
});

test('POST /api/tools/recommend returns task intent and scoring evidence', async () => {
  const response = await RECOMMEND_TOOLS(new Request('http://localhost/api/tools/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'AI 视频剪辑' })
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.taskIntent.taskType, 'video_editing');
  assert.ok(body.selectedTools.length >= 1);
  assert.ok(body.scoringEvidence.length >= 1);
});

test('GET /api/tools/not-existing returns 404', async () => {
  const response = await GET_TOOL(new Request('http://localhost/api/tools/not-existing'), {
    params: Promise.resolve({ slug: 'not-existing' })
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Tool not found.');
});

test('GET /api/setups/tiktok-product-promo-video returns setup detail', async () => {
  const response = await GET_SETUP(new Request('http://localhost/api/setups/tiktok-product-promo-video'), {
    params: Promise.resolve({ slug: 'tiktok-product-promo-video' })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.setupSlug, 'tiktok-product-promo-video');
  assert.equal(body.resultTitle, 'Best Tool Setup for This Task');
});

test('GET /api/setups/not-existing returns 404', async () => {
  const response = await GET_SETUP(new Request('http://localhost/api/setups/not-existing'), {
    params: Promise.resolve({ slug: 'not-existing' })
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Setup not found.');
});

test('POST /api/copilot/start returns initial good-enough plan', async () => {
  await clearSessions();
  const response = await START_COPILOT(new Request('http://localhost/api/copilot/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: '我有一个毕业设计，想用 AI 帮我剪辑展示视频。' })
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.matchedTemplateSlug, 'graduation-project-video');
  assert.equal(body.currentPlan.planType, 'basic');
  assert.equal(body.fullPlanState, 'collapsed');
  assert.equal(body.currentPlan.catalogBacked, true);
});

test('copilot option, full plan, and refine API flow works', async () => {
  await clearSessions();
  const start = await START_COPILOT(new Request('http://localhost/api/copilot/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: '我有一个毕业设计，想用 AI 帮我剪辑展示视频。' })
  }));
  const started = await start.json();

  const optionResponse = await SELECT_OPTION(new Request('http://localhost/api/copilot/option', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: started.sessionId, optionKey: 'professional' })
  }));
  const optionBody = await optionResponse.json();
  assert.equal(optionResponse.status, 200);
  assert.equal(optionBody.currentPlan.planType, 'professional');

  const fullResponse = await GENERATE_FULL_PLAN(new Request('http://localhost/api/copilot/generate-full-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: started.sessionId })
  }));
  const fullBody = await fullResponse.json();
  assert.equal(fullResponse.status, 200);
  assert.equal(fullBody.fullPlanState, 'expanded');
  assert.ok(fullBody.fullPlan.executionSteps.length >= 3);

  const refineResponse = await REFINE_PLAN(new Request('http://localhost/api/copilot/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: started.sessionId, moduleType: 'script' })
  }));
  const refineBody = await refineResponse.json();
  assert.equal(refineResponse.status, 200);
  assert.equal(refineBody.fullPlanState, 'completed');
  assert.ok(refineBody.refinements.length >= 1);
});

test('POST /api/copilot/message interprets option intent and advances plan', async () => {
  await clearSessions();
  const start = await START_COPILOT(new Request('http://localhost/api/copilot/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: '我有一个毕业设计，想用 AI 帮我剪辑展示视频。' })
  }));
  const started = await start.json();

  const messageResponse = await SEND_MESSAGE(new Request('http://localhost/api/copilot/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: started.sessionId, message: '更专业一点' })
  }));
  const body = await messageResponse.json();

  assert.equal(messageResponse.status, 200);
  assert.equal(body.currentPlan.planType, 'professional');
  assert.ok(body.currentPlan.combinationLabel.includes('Canva'));
  assert.equal(body.fullPlanState, 'ready');
});
test('archive API validates create/list/detail', async () => {
  await getArchiveStore().clear();
  const createResponse = await CREATE_ARCHIVE(new Request('http://localhost/api/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput: 'Archive test input', workflowData: { currentPlan: { title: 'Test plan' } } })
  }));
  const created = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.ok(created.id);

  const listResponse = await LIST_ARCHIVE();
  const listBody = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(listBody.items.length, 1);

  const detailResponse = await GET_ARCHIVE(new Request(`http://localhost/api/archive/${created.id}`), {
    params: Promise.resolve({ id: created.id })
  });
  const detailBody = await detailResponse.json();
  assert.equal(detailResponse.status, 200);
  assert.equal(detailBody.id, created.id);

  const missingResponse = await GET_ARCHIVE(new Request('http://localhost/api/archive/not-existing'), {
    params: Promise.resolve({ id: 'not-existing' })
  });
  const missingBody = await missingResponse.json();
  assert.equal(missingResponse.status, 404);
  assert.equal(missingBody.error, 'Archive item not found.');
});


