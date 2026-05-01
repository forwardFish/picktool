import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const cwd = process.cwd();
export const runtimeDir = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime');
export const statePath = path.join(runtimeDir, 'family_mock_state.json');
export const observabilityDir = path.join(cwd, 'tasks', 'runtime', 'observability');
export const retentionAuditPath = path.join(
  cwd,
  'tasks',
  'runtime',
  'retention',
  'latest_cleanup_audit.json'
);

export const demoEnv = {
  ...process.env,
  POSTGRES_URL:
    process.env.POSTGRES_URL ||
    'postgres://postgres:postgres@127.0.0.1:54322/postgres',
  AUTH_SECRET:
    process.env.AUTH_SECRET || 'family-education-dev-auth-secret',
  BASE_URL: process.env.BASE_URL || 'http://127.0.0.1:3000',
  FAMILY_EDU_DEMO_MODE: '1',
  FAMILY_EDU_DEMO_AUTO_AUTH: '1',
  NODE_ENV: 'production',
};

const terminalRunStatuses = new Set(['done', 'needs_review', 'failed']);

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function readJson(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} did not return JSON. Status=${response.status}. Body=${text}`);
  }
}

export async function stopServer(server) {
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

export async function waitForServer(url) {
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

export async function ensureFixturePdf(filename, title, pageCount = 5) {
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
  }

  const bytes = await pdf.save();
  await writeFile(fixturePath, Buffer.from(bytes));
  return fixturePath;
}

export async function resetDemoState(locale = 'en-US') {
  const now = new Date().toISOString();
  await mkdir(runtimeDir, { recursive: true });
  await writeFile(
    statePath,
    JSON.stringify(
      {
        meta: {
          nextIds: {
            child: 1,
            upload: 1,
            uploadFile: 1,
            page: 1,
            run: 1,
            report: 1,
            activity: 1,
            problemItem: 1,
            errorLabel: 1,
            itemError: 1,
            shareLink: 1,
            subscription: 1,
            billingEvent: 1,
          },
        },
        auth: {
          parentProfile: {
            id: 1,
            name: 'Demo Parent',
            email: 'demo-parent@familyeducation.local',
            password: 'DemoParent123',
            role: 'owner',
            is18PlusConfirmed: true,
            country: 'US',
            timezone: 'America/Los_Angeles',
            locale,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          },
        },
        children: [],
        uploads: [],
        uploadFiles: [],
        pages: [],
        runs: [],
        reports: [],
        problemItems: [],
        errorLabels: [],
        itemErrors: [],
        shareLinks: [],
        subscriptions: [],
        billingEvents: [],
        activityLogs: [],
      },
      null,
      2
    )
  );
}

export async function readDemoState() {
  return JSON.parse(await readFile(statePath, 'utf8'));
}

export async function writeDemoState(state) {
  await writeFile(statePath, JSON.stringify(state, null, 2), 'utf8');
}

export async function buildApp(env = demoEnv) {
  const build =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/c', 'pnpm build'], {
          cwd,
          env,
          stdio: 'inherit',
        })
      : spawn('pnpm', ['build'], {
          cwd,
          env,
          stdio: 'inherit',
        });

  const exitCode = await new Promise((resolve, reject) => {
    build.on('exit', resolve);
    build.on('error', reject);
  });
  assert(exitCode === 0, `Demo build failed with exit code ${String(exitCode)}.`);
}

export async function startApp(env = demoEnv) {
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

  return server;
}

export async function createChild(baseUrl, input = {}) {
  const response = await fetch(`${baseUrl}/api/children`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nickname: input.nickname || `Child-${Date.now()}`,
      grade: input.grade || '4th Grade',
      curriculum: input.curriculum || 'Common Core',
    }),
  });
  const payload = await readJson(response, 'Create child');
  assert(response.status === 201, 'Child creation API did not return 201.');

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const listResponse = await fetch(`${baseUrl}/api/children`);
    const listPayload = await readJson(listResponse, 'List children');
    if (
      listResponse.status === 200 &&
      Array.isArray(listPayload) &&
      listPayload.some((child) => Number(child?.id) === Number(payload.id))
    ) {
      await delay(1000);
      return payload;
    }
    await delay(700);
  }

  throw new Error(`Created child ${String(payload.id)} but it never appeared in the list API.`);
}

export async function createUpload(baseUrl, childId, fixturePath, options = {}) {
  const bytes = await readFile(fixturePath);
  const pageCount = options.pageCount || 5;
  const pageBuilder =
    options.pageBuilder ||
    ((pageIndex) => ({
      pageNumber: pageIndex + 1,
      previewLabel: `Fixture page ${pageIndex + 1}`,
      qualityFlags: {
        blurry: false,
        rotated: false,
        dark: false,
        lowContrast: false,
      },
    }));

  let uploadResponse;
  let uploadPayload;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const formData = new FormData();
    formData.append('childId', String(childId));
    formData.append('sourceType', options.sourceType || 'quiz');
    formData.append('notes', options.notes || '');
    formData.append(
      'pageDrafts',
      JSON.stringify([
        {
          previewKind: 'pdf',
          pageCount,
          pages: Array.from({ length: pageCount }, (_, pageIndex) => pageBuilder(pageIndex)),
        },
      ])
    );
    formData.append(
      'files',
      new File([bytes], options.filename || path.basename(fixturePath), {
        type: 'application/pdf',
      })
    );
    uploadResponse = await fetch(`${baseUrl}/api/uploads`, {
      method: 'POST',
      body: formData,
    });
    uploadPayload = await readJson(uploadResponse, 'Create upload');
    if (
      uploadResponse.status === 404 &&
      String(uploadPayload?.error || '').toLowerCase().includes('child not found')
    ) {
      await delay(1200);
      continue;
    }
    break;
  }
  assert(
    uploadResponse.status === 201,
    `Upload creation API did not return 201. Status=${uploadResponse.status}. Payload=${JSON.stringify(uploadPayload)}`
  );
  return uploadPayload;
}

export async function submitUpload(baseUrl, uploadId) {
  const submitResponse = await fetch(
    `${baseUrl}/api/uploads/${uploadId}/submit`,
    { method: 'POST' }
  );
  const submitPayload = await readJson(submitResponse, 'Submit upload');
  assert(submitResponse.status === 201, 'Upload submit API did not return 201.');
  return submitPayload;
}

function isAbortOrTimeoutError(error) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}

export async function waitForRunCompletion(baseUrl, runId, options = {}) {
  const timeoutMs = options.timeoutMs ?? 420000;
  const intervalMs = options.intervalMs ?? 5000;
  const startedAt = Date.now();
  let lastRunPayload = null;
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const pollResponse = await fetch(`${baseUrl}/api/runs/${runId}`, {
        signal: AbortSignal.timeout(options.pollRequestTimeoutMs ?? 60000),
      });
      const pollPayload = await readJson(pollResponse, 'Poll run');
      assert(pollResponse.status === 200, `Run poll failed: ${JSON.stringify(pollPayload)}`);
      lastRunPayload = pollPayload;

      if (terminalRunStatuses.has(String(pollPayload.status || ''))) {
        return pollPayload;
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

export async function uploadAndProcess(baseUrl, childId, fixturePath, options = {}) {
  const uploadPayload = await createUpload(baseUrl, childId, fixturePath, options);

  const submitPayload = await submitUpload(baseUrl, uploadPayload.upload.id);
  let processPayload = null;
  let processTimedOut = false;

  try {
    const processResponse = await fetch(`${baseUrl}/api/runs/${submitPayload.runId}/process`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ force: true }),
      signal: AbortSignal.timeout(options.processRequestTimeoutMs ?? 45000),
    });
    processPayload = await readJson(processResponse, 'Process run');
    assert(processResponse.status === 200, 'Run process API did not return 200.');
  } catch (error) {
    if (!isAbortOrTimeoutError(error)) {
      throw error;
    }
    processTimedOut = true;
  }

  const run = await waitForRunCompletion(baseUrl, submitPayload.runId, {
    timeoutMs: options.processCompletionTimeoutMs,
    intervalMs: options.processPollIntervalMs,
    pollRequestTimeoutMs: options.pollRequestTimeoutMs,
  });

  return {
    ...(processPayload || {}),
    run,
    reportId: processPayload?.reportId ?? run.reportId ?? null,
    processTimedOut,
  };
}

export async function unlockLatestReport(baseUrl, priceId = 'price_fe_one_time') {
  const sessionId = `demo_unlock_${Date.now()}`;
  const response = await fetch(
    `${baseUrl}/api/creem/checkout?checkout_id=${sessionId}&priceId=${priceId}`,
    { redirect: 'manual' }
  );
  assert(
    response.status === 307 || response.status === 303,
    `Demo checkout did not redirect as expected. Status=${response.status}`
  );
  return sessionId;
}

export async function createTutorShare(baseUrl, reportId) {
  const response = await fetch(`${baseUrl}/api/reports/${reportId}/share`, {
    method: 'POST',
  });
  const payload = await readJson(response, 'Create tutor share');
  assert(response.status === 201, 'Create tutor share did not return 201.');
  return payload;
}
