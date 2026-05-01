import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import dotenv from 'dotenv';
import { SignJWT } from 'jose';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
  'kimi_local_e2e.json'
);
const terminalRunStatuses = new Set(['done', 'needs_review', 'failed']);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildEnv(overrides = {}) {
  return {
    ...process.env,
    BASE_URL: baseUrl,
    FAMILY_EDU_DEMO_MODE: '0',
    FAMILY_EDU_DEMO_AUTO_AUTH: '0',
    MODEL_PROVIDER: process.env.MODEL_PROVIDER || 'openai',
    MODEL_DEFAULT: process.env.MODEL_DEFAULT || '',
    MOONSHOT_BASE_URL: process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1',
    MOONSHOT_MODEL: process.env.MOONSHOT_MODEL || 'kimi-k2.5',
    LOCAL_SMOKE_SECRET: localSmokeSecret,
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...overrides,
  };
}

async function runSql(label, operation, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        throw error;
      }
      console.warn(`[kimi-local-e2e] retrying ${label} (${attempt}/${attempts - 1})`);
      await delay(1500 * attempt);
    }
  }

  throw lastError;
}

async function callLocalSmoke(base, action, payload = {}, sessionCookie = '') {
  const headers = {
    'content-type': 'application/json',
    'x-local-smoke-secret': localSmokeSecret,
  };

  if (sessionCookie) {
    headers.cookie = sessionCookie;
  }

  const response = await fetch(`${base}/api/runtime/local-smoke`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });
  const body = await readJsonResponse(response, `Local smoke action ${action}`);
  assert(response.status === 200, `Local smoke action ${action} failed: ${JSON.stringify(body)}`);
  return body;
}

async function stopServer(server) {
  if (!server?.pid) {
    return;
  }

  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
      killer.on('exit', resolve);
      killer.on('error', resolve);
    });
    return;
  }

  server.kill('SIGTERM');
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {}

    await delay(1000);
  }

  throw new Error(`Server did not become ready at ${url}`);
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

async function ensureFixturePdf(filename, title, pageCount = 5) {
  const fixturesDir = path.join(cwd, 'tasks', 'runtime', 'fixtures');
  const fixturePath = path.join(fixturesDir, filename);
  await mkdir(fixturesDir, { recursive: true });

  try {
    await readFile(fixturePath);
    return fixturePath;
  } catch {}

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);
    page.drawRectangle({
      x: 36,
      y: 36,
      width: 540,
      height: 720,
      borderWidth: 2,
      borderColor: rgb(0.93, 0.45, 0.08),
    });
    page.drawText(`${title} ${pageIndex + 1}`, {
      x: 64,
      y: 710,
      size: 22,
      font,
      color: rgb(0.12, 0.14, 0.18),
    });
    page.drawText('Pathnook Kimi local smoke fixture', {
      x: 64,
      y: 675,
      size: 14,
      font,
      color: rgb(0.23, 0.25, 0.28),
    });
  }

  const bytes = await pdf.save();
  await writeFile(fixturePath, Buffer.from(bytes));
  return fixturePath;
}

async function readJsonResponse(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} did not return JSON. Status=${response.status}. Body=${text}`);
  }
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

async function waitForRunCompletion(base, sessionCookie, runId, options = {}) {
  const timeoutMs = options.timeoutMs ?? 420000;
  const intervalMs = options.intervalMs ?? 5000;
  const startedAt = Date.now();
  let lastRunPayload = null;
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const runResponse = await fetchWithSession(`${base}/api/runs/${runId}`, sessionCookie, {
        signal: AbortSignal.timeout(options.pollRequestTimeoutMs ?? 60000),
      });
      const runPayload = await readJsonResponse(runResponse, 'Poll run');
      assert(runResponse.status === 200, `Run fetch failed: ${JSON.stringify(runPayload)}`);
      lastRunPayload = runPayload;

      if (terminalRunStatuses.has(String(runPayload.status || ''))) {
        return runPayload;
      }
    } catch (error) {
      lastError = error;
      if (!isAbortOrTimeoutError(error)) {
        throw error;
      }
    }

    await delay(intervalMs);
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

async function createUpload(base, sessionCookie, childId, fixturePath, notes) {
  const bytes = await readFile(fixturePath);
  const formData = new FormData();
  formData.append('childId', String(childId));
  formData.append('sourceType', 'quiz');
  formData.append('notes', notes);
  formData.append(
    'pageDrafts',
    JSON.stringify([
      {
        previewKind: 'pdf',
        pageCount: 5,
        pages: Array.from({ length: 5 }, (_, pageIndex) => ({
          pageNumber: pageIndex + 1,
          previewLabel: `Fixture page ${pageIndex + 1}`,
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

  const response = await fetchWithSession(`${base}/api/uploads`, sessionCookie, {
    method: 'POST',
    body: formData,
  });
  const payload = await readJsonResponse(response, 'Create upload');
  assert(response.status === 201, `Upload creation failed: ${JSON.stringify(payload)}`);
  return payload;
}

async function runCase(label, envOverrides = {}) {
  const env = buildEnv(envOverrides);
  const fixturePath = await ensureFixturePdf(
    `kimi-local-${label}.pdf`,
    `Kimi Local ${label.toUpperCase()}`
  );
  const server =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/c', 'pnpm start'], {
          cwd,
          env,
          stdio: 'pipe',
        })
      : spawn('pnpm', ['start'], {
          cwd,
          env,
          stdio: 'pipe',
        });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(`${baseUrl}/sign-in`);
    const seeded = await runSql(`seed live user for ${label}`, () =>
      callLocalSmoke(baseUrl, 'seed-user', { label })
    );
    const sessionCookie = await createSessionCookie(seeded.userId);

    const uploadPayload = await createUpload(
      baseUrl,
      sessionCookie,
      seeded.childId,
      fixturePath,
      `kimi-local-${label}`
    );

    const submitResponse = await fetchWithSession(
      `${baseUrl}/api/uploads/${uploadPayload.upload.id}/submit`,
      sessionCookie,
      { method: 'POST' }
    );
    const submitPayload = await readJsonResponse(submitResponse, 'Submit upload');
    assert(submitResponse.status === 201, `Upload submit failed: ${JSON.stringify(submitPayload)}`);

    let processPayload = null;
    let processTimedOut = false;
    try {
      const processResponse = await fetchWithSession(
        `${baseUrl}/api/runs/${submitPayload.runId}/process`,
        sessionCookie,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ force: true }),
          signal: AbortSignal.timeout(45000),
        }
      );
      processPayload = await readJsonResponse(processResponse, 'Process run');
      assert(processResponse.status === 200, `Run process failed: ${JSON.stringify(processPayload)}`);
    } catch (error) {
      if (!isAbortOrTimeoutError(error)) {
        throw error;
      }
      processTimedOut = true;
    }

    const runPayload = await waitForRunCompletion(baseUrl, sessionCookie, submitPayload.runId);
    assert(
      runPayload.status === 'done' || runPayload.status === 'needs_review',
      `Run did not reach terminal success state: ${JSON.stringify(runPayload)}`
    );

    const reportId = Number(processPayload?.reportId || runPayload.reportId);
    assert(reportId > 0, `No reportId returned for ${label} case.`);

    const lockedReportResponse = await fetchWithSession(
      `${baseUrl}/api/reports/${reportId}`,
      sessionCookie
    );
    const lockedReportPayload = await readJsonResponse(lockedReportResponse, 'Locked report fetch');
    assert(
      lockedReportResponse.status === 402,
      `Expected locked report before unlock for ${label}. Got ${lockedReportResponse.status}.`
    );
    assert(lockedReportPayload.paywall, 'Locked report response is missing paywall payload.');

    await runSql(`grant single review unlock for ${label}`, () =>
      callLocalSmoke(baseUrl, 'grant-single-review', {
        label,
        userId: seeded.userId,
        teamId: seeded.teamId,
      })
    );

    const reportResponse = await fetchWithSession(
      `${baseUrl}/api/reports/${reportId}`,
      sessionCookie
    );
    const reportPayload = await readJsonResponse(reportResponse, 'Unlocked report fetch');
    assert(reportResponse.status === 200, `Unlocked report fetch failed: ${JSON.stringify(reportPayload)}`);
    assert(
      reportPayload?.parentReportJson?.summary,
      `Report summary missing in ${label} case.`
    );
    assert(
      Array.isArray(reportPayload?.parentReportJson?.topFindings),
      `Report topFindings missing in ${label} case.`
    );
    assert(
      Array.isArray(reportPayload?.parentReportJson?.sevenDayPlan),
      `Report sevenDayPlan missing in ${label} case.`
    );

    const auditPayload = await runSql(`read model audit for ${label}`, () =>
      callLocalSmoke(baseUrl, 'read-model-audit', {
        runId: submitPayload.runId,
      })
    );
    const modelRows = auditPayload.modelRows || [];
    const failoverRows = auditPayload.failoverRows || [];

    assert(modelRows.length > 0, `No model runtime rows were recorded for ${label}.`);

    if (label === 'default') {
      assert(
        modelRows.some((row) => row.providerName === 'moonshot' && row.status === 'success'),
        'Default policy case did not produce a successful Moonshot/Kimi execution.'
      );
      assert(
        failoverRows.some(
          (row) => row.fromProviderName === 'openai' && row.toProviderName === 'moonshot'
        ),
        'Default policy case did not record the expected OpenAI -> Moonshot failover.'
      );
    }

    if (label === 'forced') {
      assert(
        modelRows.some(
          (row) =>
            row.providerName === 'moonshot' &&
            row.modelName === 'kimi-k2.5' &&
            row.status === 'success'
        ),
        'Forced Kimi case did not record a successful Moonshot/Kimi execution.'
      );
    }

    return {
      label,
      runId: submitPayload.runId,
      reportId,
      runStatus: runPayload.status,
      bundleEngine: processPayload?.bundle?.engine || null,
      bundleModelVersion: processPayload?.bundle?.modelVersion || null,
      fallbackApplied: Boolean(processPayload?.execution?.fallbackApplied),
      attemptCount: Number(processPayload?.execution?.attemptCount || modelRows.length),
      processTimedOut,
      modelRows,
      failoverRows,
    };
  } finally {
    await stopServer(server);
    if (serverOutput) {
      const logPath = path.join(cwd, 'tasks', 'runtime', 'final_acceptance', `kimi_local_${label}_server.log`);
      await mkdir(path.dirname(logPath), { recursive: true });
      await writeFile(logPath, serverOutput, 'utf8');
    }
  }
}

async function runRuntimeAudit(envOverrides = {}) {
  const env = buildEnv(envOverrides);
  const runner =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/c', 'pnpm qa:runtime-audit'], {
          cwd,
          env,
          stdio: 'pipe',
        })
      : spawn('pnpm', ['qa:runtime-audit'], {
          cwd,
          env,
          stdio: 'pipe',
        });

  let output = '';
  runner.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  runner.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  const exitCode = await new Promise((resolve, reject) => {
    runner.on('exit', resolve);
    runner.on('error', reject);
  });
  assert(exitCode === 0, `Runtime audit failed. Output:\n${output}`);

  const auditPath = path.join(cwd, 'tasks', 'runtime', 'final_acceptance', 'runtime_mode_audit.json');
  const payload = JSON.parse(await readFile(auditPath, 'utf8'));
  assert(payload?.runtime?.mode === 'live', 'Runtime audit did not report live mode.');
  assert(payload?.runtime?.demoModeEnabled === false, 'Runtime audit still reports demo mode.');
  return payload;
}

async function main() {
  assert(process.env.MOONSHOT_API_KEY, 'MOONSHOT_API_KEY is required for local Kimi smoke.');
  assert(localSmokeSecret, 'LOCAL_SMOKE_SECRET is required for local Kimi smoke.');

  const results = [];
  results.push(await runCase('default', { MODEL_DEFAULT: '' }));
  results.push(await runCase('forced', { MODEL_DEFAULT: 'moonshot:kimi-k2.5' }));
  const audit = await runRuntimeAudit();

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    runtimeMode: 'live',
    defaultCase: results[0],
    forcedCase: results[1],
    runtimeAudit: {
      mode: audit?.runtime?.mode || null,
      demoModeEnabled: audit?.runtime?.demoModeEnabled ?? null,
      databaseSource: audit?.database?.source || null,
      storageBackend: audit?.runtime?.storageBackend || null,
    },
  };

  await mkdir(path.dirname(runtimeOutputPath), { recursive: true });
  await writeFile(runtimeOutputPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`[kimi-local-e2e] wrote ${runtimeOutputPath}`);
  console.log(
    `[kimi-local-e2e] default=${summary.defaultCase.bundleEngine}:${summary.defaultCase.bundleModelVersion} forced=${summary.forcedCase.bundleEngine}:${summary.forcedCase.bundleModelVersion}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
