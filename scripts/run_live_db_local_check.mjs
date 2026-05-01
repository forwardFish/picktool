import { existsSync } from 'node:fs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { SignJWT } from 'jose';
import { chromium } from 'playwright-core';
import {
  assert,
  buildApp,
  ensureFixturePdf,
  startApp,
  stopServer,
  waitForServer,
} from './family_demo_smoke_utils.mjs';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const cwd = process.cwd();
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const authSecret = process.env.AUTH_SECRET || 'family-education-dev-auth-secret';
const localSmokeSecret = process.env.LOCAL_SMOKE_SECRET || '';
const runtimeOutputPath = path.join(
  cwd,
  'tasks',
  'runtime',
  'final_acceptance',
  'live_db_local_check',
  'live_db_local_check.json'
);
const screenshotDir = path.join(
  cwd,
  'tasks',
  'runtime',
  'final_acceptance',
  'live_db_local_check'
);
const terminalRunStatuses = new Set(['done', 'needs_review', 'failed']);
const edgePathX86 = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edgePathX64 = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';

function buildLiveEnv(overrides = {}) {
  return {
    ...process.env,
    BASE_URL: baseUrl,
    FAMILY_EDU_DEMO_MODE: '0',
    FAMILY_EDU_DEMO_AUTO_AUTH: '0',
    LOCAL_SMOKE_SECRET: localSmokeSecret,
    NODE_ENV: 'production',
    ...overrides,
  };
}

function getBrowserExecutable() {
  if (process.platform !== 'win32') {
    return undefined;
  }
  if (existsSync(edgePathX86)) {
    return edgePathX86;
  }
  if (existsSync(edgePathX64)) {
    return edgePathX64;
  }
  return undefined;
}

async function readJsonResponse(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} did not return JSON. Status=${response.status}. Body=${text}`);
  }
}

async function readTextResponse(response, label) {
  const text = await response.text();
  assert(response.status >= 200 && response.status < 400, `${label} failed. Status=${response.status}`);
  return text;
}

async function callLocalSmoke(action, payload = {}) {
  const response = await fetch(`${baseUrl}/api/runtime/local-smoke`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-local-smoke-secret': localSmokeSecret,
    },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });
  const body = await readJsonResponse(response, `Local smoke action ${action}`);
  assert(response.status === 200, `Local smoke action ${action} failed: ${JSON.stringify(body)}`);
  return body;
}

async function runWithRetries(label, operation, attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        throw error;
      }
      console.warn(`[live-db-local-check] retrying ${label} (${attempt}/${attempts - 1})`);
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }

  throw lastError;
}

async function createSessionCookie(userId) {
  const token = await new SignJWT({
    user: { id: userId },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day')
    .sign(new TextEncoder().encode(authSecret));

  return `session=${token}`;
}

async function fetchWithSession(url, sessionCookie, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('cookie', sessionCookie);
  return fetch(url, {
    ...options,
    headers,
  });
}

function isAbortOrTimeoutError(error) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}

async function isServerHealthy() {
  try {
    const response = await fetch(`${baseUrl}/sign-up`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

async function waitForRunCompletion(sessionCookie, runId, options = {}) {
  const timeoutMs = options.timeoutMs ?? 420000;
  const intervalMs = options.intervalMs ?? 5000;
  const startedAt = Date.now();
  let lastRunPayload = null;
  let lastError = null;
  let pollAttempts = 0;

  while (Date.now() - startedAt < timeoutMs) {
    pollAttempts += 1;

    try {
      const response = await fetchWithSession(`${baseUrl}/api/runs/${runId}`, sessionCookie, {
        signal: AbortSignal.timeout(options.pollRequestTimeoutMs ?? 60000),
      });
      const payload = await readJsonResponse(response, 'Poll run');
      assert(response.status === 200, `Run poll failed: ${JSON.stringify(payload)}`);
      lastRunPayload = payload;

      if (terminalRunStatuses.has(String(payload.status || ''))) {
        return {
          pollAttempts,
          run: payload,
        };
      }
    } catch (error) {
      lastError = error;
      if (!isAbortOrTimeoutError(error)) {
        throw error;
      }
    }
  }

  if (lastRunPayload) {
    throw new Error(
      `Run ${runId} did not reach a terminal state within ${timeoutMs}ms. Last payload=${JSON.stringify(lastRunPayload)}`
    );
  }

  throw new Error(
    `Run ${runId} could not be polled to completion within ${timeoutMs}ms.${lastError ? ` Last error=${lastError}` : ''}`
  );
}

async function uploadFixture(sessionCookie, childId, fixturePath) {
  const bytes = await readFile(fixturePath);
  const formData = new FormData();
  formData.append('childId', String(childId));
  formData.append('sourceType', 'quiz');
  formData.append('notes', 'live db local check');
  formData.append(
    'pageDrafts',
    JSON.stringify([
      {
        previewKind: 'pdf',
        pageCount: 5,
        pages: Array.from({ length: 5 }, (_, pageIndex) => ({
          pageNumber: pageIndex + 1,
          previewLabel: `Live DB local check page ${pageIndex + 1}`,
          qualityFlags: {
            blurry: false,
            rotated: false,
            dark: false,
            lowContrast: false,
          },
        })),
      },
    ])
  );
  formData.append(
    'files',
    new File([bytes], path.basename(fixturePath), {
      type: 'application/pdf',
    })
  );

  const response = await fetchWithSession(`${baseUrl}/api/uploads`, sessionCookie, {
    method: 'POST',
    body: formData,
  });
  const payload = await readJsonResponse(response, 'Create upload');
  assert(response.status === 201, `Upload creation failed: ${JSON.stringify(payload)}`);
  return payload;
}

async function startDiagnosis(sessionCookie, uploadId) {
  const response = await fetchWithSession(
    `${baseUrl}/api/uploads/${uploadId}/start-diagnosis`,
    sessionCookie,
    { method: 'POST' }
  );
  const payload = await readJsonResponse(response, 'Start diagnosis');
  assert(response.status === 201, `Start diagnosis failed: ${JSON.stringify(payload)}`);
  return payload;
}

async function runRuntimeAudit(sessionCookie) {
  const response = await fetchWithSession(`${baseUrl}/api/runtime/audit`, sessionCookie, {
    signal: AbortSignal.timeout(10000),
  });
  const payload = await readJsonResponse(response, 'Runtime audit');
  assert(response.status === 200, `Runtime audit failed: ${JSON.stringify(payload)}`);
  assert(payload?.runtime?.mode === 'live', 'Runtime audit did not report live mode.');
  assert(payload?.runtime?.demoModeEnabled === false, 'Runtime audit still reports demo mode.');
  return payload;
}

async function verifyDashboardRoute(sessionCookie, routePath, expectedText = null) {
  const response = await fetchWithSession(`${baseUrl}${routePath}`, sessionCookie, {
    signal: AbortSignal.timeout(60000),
  });
  const html = await readTextResponse(response, `Route check for ${routePath}`);
  if (expectedText) {
    assert(
      html.includes(expectedText),
      `Route ${routePath} did not include expected text "${expectedText}".`
    );
  }
  return response.status;
}

async function captureBrowserEvidence(sessionCookie, childId, runId, reportId) {
  await mkdir(screenshotDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: getBrowserExecutable(),
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1400 },
    });
    await context.addCookies([
      {
        name: 'session',
        value: sessionCookie.replace(/^session=/, ''),
        domain: '127.0.0.1',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    const childDetailScreenshotPath = path.join(
      screenshotDir,
      '05_live_child_detail_browser.png'
    );
    const runDetailScreenshotPath = path.join(
      screenshotDir,
      '06_live_run_detail_browser.png'
    );
    const reportsScreenshotPath = path.join(screenshotDir, '07_live_reports_dashboard_browser.png');
    const reportDetailScreenshotPath = path.join(
      screenshotDir,
      '08_live_report_detail_browser.png'
    );

    await page.goto(`${baseUrl}/dashboard/children/${childId}`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    await page.screenshot({ path: childDetailScreenshotPath, fullPage: true });

    await page.goto(`${baseUrl}/dashboard/runs/${runId}`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    await page.screenshot({ path: runDetailScreenshotPath, fullPage: true });

    await page.goto(`${baseUrl}/dashboard/reports`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    await page.screenshot({ path: reportsScreenshotPath, fullPage: true });

    await page.goto(`${baseUrl}/dashboard/reports/${reportId}`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    await page.screenshot({ path: reportDetailScreenshotPath, fullPage: true });

    return {
      childDetail: childDetailScreenshotPath,
      runDetail: runDetailScreenshotPath,
      reportsDashboard: reportsScreenshotPath,
      reportDetail: reportDetailScreenshotPath,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  assert(localSmokeSecret, 'LOCAL_SMOKE_SECRET is required for live DB local check.');

  const env = buildLiveEnv();
  const fixturePath = await ensureFixturePdf(
    'live-db-local-check-fixture.pdf',
    'Live DB Local Check'
  );
  let server = null;
  let managedServer = false;

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    managedServer: false,
    runtimeAudit: null,
    seededUser: null,
    childId: null,
    uploadId: null,
    runId: null,
    reportId: null,
    processTimedOut: false,
    finalRunStatus: null,
    pollAttempts: 0,
    routeChecks: {},
    reportApi: {
      lockedStatus: null,
      unlockedStatus: null,
    },
    screenshots: {
      childDetail: null,
      runDetail: null,
      reportsDashboard: null,
      reportDetail: null,
    },
  };

  try {
    if (!(await isServerHealthy())) {
      await buildApp(env);
      server = await startApp(env);
      managedServer = true;
      await waitForServer(`${baseUrl}/sign-up`);
    }
    summary.managedServer = managedServer;

    const seeded = await runWithRetries('seed-user', () =>
      callLocalSmoke('seed-user', { label: 'livecheck' })
    );
    summary.seededUser = {
      userId: seeded.userId,
      email: seeded.email,
    };
    summary.childId = seeded.childId;

    const sessionCookie = await createSessionCookie(seeded.userId);
    summary.runtimeAudit = await runRuntimeAudit(sessionCookie);
    await verifyDashboardRoute(sessionCookie, '/dashboard', 'Overview');
    await verifyDashboardRoute(sessionCookie, '/dashboard/children/new', 'Child nickname');

    const uploadPayload = await uploadFixture(sessionCookie, seeded.childId, fixturePath);
    summary.uploadId = uploadPayload.upload.id;

    const submitPayload = await startDiagnosis(sessionCookie, uploadPayload.upload.id);
    summary.runId = submitPayload.runId;

    try {
      const processResponse = await fetchWithSession(
        `${baseUrl}/api/runs/${submitPayload.runId}/process`,
        sessionCookie,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ force: true }),
          signal: AbortSignal.timeout(5000),
        }
      );
      const processPayload = await readJsonResponse(processResponse, 'Process run');
      assert(processResponse.status === 200, `Run process failed: ${JSON.stringify(processPayload)}`);
      summary.reportId = processPayload.reportId ?? null;
    } catch (error) {
      if (!isAbortOrTimeoutError(error)) {
        throw error;
      }
      summary.processTimedOut = true;
    }

    const completion = await waitForRunCompletion(sessionCookie, submitPayload.runId);
    summary.pollAttempts = completion.pollAttempts;
    summary.finalRunStatus = completion.run.status;
    summary.reportId = summary.reportId || completion.run.reportId || null;

    assert(
      summary.finalRunStatus === 'done' || summary.finalRunStatus === 'needs_review',
      `Run did not reach a success terminal state: ${JSON.stringify(completion.run)}`
    );
    assert(summary.reportId, 'Expected reportId after run completion.');

    await verifyDashboardRoute(
      sessionCookie,
      `/dashboard/runs/${summary.runId}`,
      'Diagnosis run progress'
    );
    await verifyDashboardRoute(sessionCookie, '/dashboard/reports', 'Reports');

    const lockedReportResponse = await fetchWithSession(
      `${baseUrl}/api/reports/${summary.reportId}`,
      sessionCookie,
      { signal: AbortSignal.timeout(60000) }
    );
    const lockedReportPayload = await readJsonResponse(lockedReportResponse, 'Locked report fetch');
    summary.reportApi.lockedStatus = lockedReportResponse.status;
    assert(
      lockedReportResponse.status === 402,
      `Expected locked report before unlock. Got ${lockedReportResponse.status} ${JSON.stringify(lockedReportPayload)}`
    );

    await runWithRetries('grant-single-review', () =>
      callLocalSmoke('grant-single-review', {
        label: 'livecheck',
        userId: seeded.userId,
        teamId: seeded.teamId,
      })
    );

    const unlockedReportResponse = await fetchWithSession(
      `${baseUrl}/api/reports/${summary.reportId}`,
      sessionCookie,
      { signal: AbortSignal.timeout(60000) }
    );
    const unlockedReportPayload = await readJsonResponse(
      unlockedReportResponse,
      'Unlocked report fetch'
    );
    summary.reportApi.unlockedStatus = unlockedReportResponse.status;
    assert(
      unlockedReportResponse.status === 200,
      `Unlocked report fetch failed: ${JSON.stringify(unlockedReportPayload)}`
    );
    assert(
      unlockedReportPayload?.parentReportJson?.summary,
      'Unlocked report payload is missing parent summary.'
    );

    await verifyDashboardRoute(sessionCookie, `/dashboard/reports/${summary.reportId}`);
    summary.screenshots = await captureBrowserEvidence(
      sessionCookie,
      summary.childId,
      summary.runId,
      summary.reportId
    );
  } finally {
    await mkdir(screenshotDir, { recursive: true });
    await mkdir(path.dirname(runtimeOutputPath), { recursive: true });
    await writeFile(runtimeOutputPath, JSON.stringify(summary, null, 2), 'utf8');
    if (managedServer) {
      await stopServer(server);
    }
  }

  console.log(`[live-db-local-check] wrote ${runtimeOutputPath}`);
  console.log(
    `[live-db-local-check] run=${summary.runId} report=${summary.reportId} status=${summary.finalRunStatus} processTimedOut=${summary.processTimedOut}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
