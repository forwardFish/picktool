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
      const response = await fetchWithTimeout(`${baseUrl}/`, {}, 2500);
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


async function expectJson(path, expectedStatus, validate, label) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`);
  const body = await response.json();
  if (response.status !== expectedStatus) throw new Error(`${path} returned ${response.status}, expected ${expectedStatus}`);
  validate(body);
  checks.push(`PASS ${label}`);
}

async function expectDecisionApiRejectsShortInput() {
  const response = await fetchWithTimeout(`${baseUrl}/api/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'Hi' })
  });
  const body = await response.json();
  if (response.status !== 400) throw new Error(`/api/decision short input returned ${response.status}`);
  if (typeof body.error !== 'string') throw new Error('/api/decision short input missing error');
  checks.push('PASS POST /api/decision rejects short input');
}

async function expectDecisionApi() {
  const response = await fetchWithTimeout(`${baseUrl}/api/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'I want to create a product promo video for TikTok.' })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`/api/decision returned ${response.status}`);
  if (body.resultTitle !== 'Best Tool Setup for This Task') throw new Error('/api/decision missing expected resultTitle');
  checks.push('PASS POST /api/decision');
}

const nextArgs = ['exec', 'next', 'start', '-p', String(port), '-H', '127.0.0.1'];
const server = process.platform === 'win32'
  ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `pnpm ${nextArgs.join(' ')}`], { stdio: ['ignore', 'pipe', 'pipe'] })
  : spawn('pnpm', nextArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

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
  await expectPage('/', ['AI Tool Decision Assistant', 'Make better', 'AI tool decisions', 'Get Decision']);
  await expectPage('/results?task=I%20want%20to%20create%20a%20product%20promo%20video%20for%20TikTok.', [
    'Best Tool Setup for This Task',
    'How to use it',
    'What you can skip',
    'Better options if',
    'Cost advice'
  ]);
  await expectPage('/tools/capcut', [
    'AI Tool Decision Detail',
    'Decision Summary',
    'Worth using if',
    'Best-fit Tasks',
    'Use when',
    'Do not start here when',
    'Role in workflow',
    'Best setups including this tool',
    'Better options if',
    'Practical details'
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
  await expectJson('/api/tools/capcut', 200, (body) => {
    if (body.name !== 'CapCut') throw new Error('/api/tools/capcut missing CapCut detail');
  }, 'GET /api/tools/capcut');
  await expectJson('/api/tools/not-existing', 404, (body) => {
    if (body.error !== 'Tool not found.') throw new Error('/api/tools/not-existing missing 404 JSON');
  }, 'GET /api/tools/not-existing');
  await expectJson('/api/setups/tiktok-product-promo-video', 200, (body) => {
    if (body.setupSlug !== 'tiktok-product-promo-video') throw new Error('/api/setups/tiktok-product-promo-video missing setup detail');
  }, 'GET /api/setups/tiktok-product-promo-video');
  await expectJson('/api/setups/not-existing', 404, (body) => {
    if (body.error !== 'Setup not found.') throw new Error('/api/setups/not-existing missing 404 JSON');
  }, 'GET /api/setups/not-existing');
  console.log(checks.join('\n'));
} catch (error) {
  console.error(output);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  stopServer();
}


