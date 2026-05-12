import { spawn, spawnSync } from 'node:child_process';

const port = 3107;
const baseUrl = `http://127.0.0.1:${port}`;
const checks = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForServer() {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/health`, {}, 2500);
      if (response.ok) return;
    } catch {}
    await wait(1000);
  }
  throw new Error('Local Next.js server did not become ready in time.');
}

async function expectPage(path, expectedText) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`);
  const html = await response.text();
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  for (const text of expectedText) {
    if (!html.includes(text)) throw new Error(`${path} did not include: ${text}`);
  }
  checks.push(`PASS ${path}`);
}

async function expectJson(path, expectedStatus, validate, label, options = {}) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`, options);
  const body = await response.json();
  if (response.status !== expectedStatus) throw new Error(`${path} returned ${response.status}, expected ${expectedStatus}`);
  validate(body);
  checks.push(`PASS ${label}`);
  return body;
}

async function postJson(path, payload, expectedStatus, validate, label) {
  return expectJson(path, expectedStatus, validate, label, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function expectDecisionApiRejectsShortInput() {
  const body = await postJson('/api/decision', { input: 'Hi' }, 400, (payload) => {
    if (typeof payload.error !== 'string') throw new Error('/api/decision short input missing error');
  }, 'POST /api/decision rejects short input');
  return body;
}

async function expectDecisionApi() {
  await postJson('/api/decision', { input: 'I want to create a product promo video for TikTok.' }, 200, (body) => {
    if (body.resultTitle !== 'Best Tool Setup for This Task') throw new Error('/api/decision missing expected resultTitle');
  }, 'POST /api/decision');
}

async function expectCopilotFlow() {
  const started = await postJson('/api/copilot/start', { input: '我有一个毕业设计，想用 AI 帮我剪辑展示视频。' }, 200, (body) => {
    if (!body.sessionId) throw new Error('/api/copilot/start missing sessionId');
    if (body.currentPlan?.planType !== 'basic') throw new Error('/api/copilot/start did not return basic plan');
    if (body.fullPlanState !== 'collapsed') throw new Error('/api/copilot/start should be collapsed');
    if (body.currentPlan?.catalogBacked !== true) throw new Error('/api/copilot/start did not use catalog-backed recommendation');
  }, 'POST /api/copilot/start');

  await postJson('/api/workflow/generate', { input: '我有一个毕业设计，想用 AI 帮我剪辑展示视频。', optionKey: 'professional', includeFullPlan: true }, 200, (body) => {
    if (body.currentPlan?.planType !== 'professional') throw new Error('/api/workflow/generate missing professional plan');
    if (!body.fullPlan?.executionSteps?.length) throw new Error('/api/workflow/generate missing full plan');
  }, 'POST /api/workflow/generate');

  await postJson('/api/workflow/generate', { input: 'Please convert this PDF into slides', optionKey: 'automated', includeFullPlan: true }, 200, (body) => {
    const serialized = JSON.stringify({ tools: body.currentPlan?.tools, steps: body.fullPlan?.executionSteps, outputs: body.fullPlan?.outputs }).toLowerCase();
    if (body.matchedTemplateSlug !== 'pdf-to-ppt') throw new Error('/api/workflow/generate did not match PDF template');
    if (!serialized.includes('slide') && !serialized.includes('ppt')) throw new Error('/api/workflow/generate PDF flow missing slide language');
    if (/capcut|invideo|runway|kling/.test(serialized)) throw new Error('/api/workflow/generate PDF flow used video-specific tools');
  }, 'POST /api/workflow/generate non-video');

  await postJson('/api/copilot/message', { sessionId: started.sessionId, message: '更专业一点' }, 200, (body) => {
    if (body.currentPlan?.planType !== 'professional') throw new Error('/api/copilot/message did not interpret professional intent');
  }, 'POST /api/copilot/message intent');

  await postJson('/api/copilot/option', { sessionId: started.sessionId, optionKey: 'professional' }, 200, (body) => {
    if (body.currentPlan?.planType !== 'professional') throw new Error('/api/copilot/option did not upgrade to professional');
  }, 'POST /api/copilot/option');

  const full = await postJson('/api/copilot/generate-full-plan', { sessionId: started.sessionId }, 200, (body) => {
    if (body.fullPlanState !== 'expanded') throw new Error('/api/copilot/generate-full-plan did not expand');
    if (!body.fullPlan?.executionSteps?.length) throw new Error('/api/copilot/generate-full-plan missing steps');
  }, 'POST /api/copilot/generate-full-plan');

  await postJson('/api/copilot/refine', { sessionId: started.sessionId, moduleType: 'materials' }, 200, (body) => {
    if (body.fullPlanState !== 'completed') throw new Error('/api/copilot/refine did not complete');
    if (!body.refinements?.length) throw new Error('/api/copilot/refine missing generated output');
  }, 'POST /api/copilot/refine');

  const archive = await postJson(`/api/sessions/${encodeURIComponent(started.sessionId)}/save`, {}, 201, (body) => {
    if (!body.id) throw new Error('/api/sessions/[sessionId]/save missing archive id');
  }, 'POST /api/sessions/[sessionId]/save');

  await expectJson('/api/archive', 200, (body) => {
    if (!Array.isArray(body.items) || !body.items.some((item) => item.id === archive.id)) throw new Error('/api/archive missing saved item');
  }, 'GET /api/archive');

  await expectJson(`/api/archive/${encodeURIComponent(archive.id)}`, 200, (body) => {
    if (body.id !== archive.id) throw new Error('/api/archive/[id] returned wrong item');
    if (!body.workflowData?.currentPlan) throw new Error('/api/archive/[id] missing workflow data');
  }, 'GET /api/archive/[id]');

  await expectJson('/api/archive/not-existing', 404, (body) => {
    if (body.error !== 'Archive item not found.') throw new Error('/api/archive/not-existing missing 404 JSON');
  }, 'GET /api/archive/not-existing');

  if (!full.fullPlan) throw new Error('Full plan flow did not return fullPlan');
}

async function expectToolCatalogFlow() {
  await expectPage('/tools-dataset', ['Local AI Tool Dataset', 'Total tools', 'Safety filtered']);

  await postJson('/api/tools/search', { input: 'Landing Page' }, 200, (body) => {
    if (!Array.isArray(body.tools)) throw new Error('/api/tools/search missing tools');
    if (typeof body.totalTools !== 'number') throw new Error('/api/tools/search missing totalTools');
  }, 'POST /api/tools/search');

  for (const input of ['AI 视频剪辑', 'PDF 转 PPT', 'Landing Page']) {
    await postJson('/api/tools/recommend', { input }, 200, (body) => {
      if (!body.taskIntent?.taskType) throw new Error(`/api/tools/recommend missing taskIntent for ${input}`);
      if (!Array.isArray(body.selectedTools) || body.selectedTools.length < 1) throw new Error(`/api/tools/recommend missing selected tools for ${input}`);
      if (!Array.isArray(body.scoringEvidence) || body.scoringEvidence.length < 1) throw new Error(`/api/tools/recommend missing scoring evidence for ${input}`);
    }, `POST /api/tools/recommend ${input}`);
  }
}

const nextArgs = ['exec', 'next', 'start', '-p', String(port), '-H', '127.0.0.1'];
const smokeEnv = { ...process.env, ARCHIVE_STORE: 'memory', LLM_PROVIDER: process.env.LLM_PROVIDER || 'local' };
const server = process.platform === 'win32'
  ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `pnpm ${nextArgs.join(' ')}`], { stdio: ['ignore', 'pipe', 'pipe'], env: smokeEnv })
  : spawn('pnpm', nextArgs, { stdio: ['ignore', 'pipe', 'pipe'], env: smokeEnv });

let output = '';
server.stdout.on('data', (chunk) => { output += chunk.toString(); });
server.stderr.on('data', (chunk) => { output += chunk.toString(); });

function stopServer() {
  if (!server.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
  } else {
    server.kill('SIGTERM');
  }
}

try {
  await waitForServer();
  await expectPage('/', ['AI Task Workflow Copilot', 'Get a simple', 'AI workflow', '开始规划']);
  await expectPage('/copilot', ['AI Task Workflow Copilot', '正在启动你的工作流助手']);
  await expectPage('/archive', ['已保存方案']);
  await expectToolCatalogFlow();
  await expectPage('/results?task=I%20want%20to%20create%20a%20product%20promo%20video%20for%20TikTok.', [
    'Best Tool Setup for This Task',
    'How to use it',
    'What you can skip',
    'Better options if',
    'Cost advice'
  ]);
  await expectPage('/tools/capcut', [
    'CapCut',
    'CapCut 是什么？',
    '如何使用 CapCut？',
    'CapCut 的核心功能',
    '价格',
    '替代工具',
    '评价',
    '问答',
    '相关主题'
  ]);
  await expectPage('/setups/tiktok-product-promo-video', [
    'Setup Hero',
    'Best Tool Setup',
    'How to use it',
    'What you can skip',
    'Better options if',
    'Cost advice',
    'Tools in this setup'
  ]);
  await expectDecisionApi();
  await expectDecisionApiRejectsShortInput();
  await expectCopilotFlow();
  await expectJson('/api/health', 200, (body) => {
    if (body.ok !== true) throw new Error('/api/health missing ok=true');
    if (body.providerMode !== 'local') throw new Error('/api/health expected local provider mode');
    if (body.archiveStore !== 'memory') throw new Error('/api/health expected memory archive store in local smoke');
    if (body.sessionStore !== 'memory') throw new Error('/api/health expected memory session store in local smoke');
  }, 'GET /api/health');
  await expectJson('/api/tools/not-existing', 404, (body) => {
    if (body.error !== 'Tool not found.') throw new Error('/api/tools/not-existing missing 404 JSON');
  }, 'GET /api/tools/not-existing');
  await expectJson('/api/setups/not-existing', 404, (body) => {
    if (body.error !== 'Setup not found.') throw new Error('/api/setups/not-existing missing 404 JSON');
  }, 'GET /api/setups/not-existing');
  await postJson('/api/copilot/start', { input: 'Hi' }, 400, (body) => {
    if (typeof body.error !== 'string') throw new Error('/api/copilot/start short input missing error');
  }, 'POST /api/copilot/start rejects short input');
  const imageResponse = await fetchWithTimeout(`${baseUrl}/api/image/generate`);
  if (imageResponse.status !== 404) throw new Error('/api/image/generate should not exist');
  checks.push('PASS /api/image/generate is not implemented');
  console.log(checks.join('\n'));
} catch (error) {
  console.error(output);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopServer();
}


