import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { chromium } from 'playwright-core';

const cwd = process.cwd();
const runtimeDir = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime');
const statePath = path.join(runtimeDir, 'family_mock_state.json');
const edgePathX86 =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const env = {
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

function getBrowserExecutable() {
  return process.platform === 'win32' ? edgePathX86 : undefined;
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

async function ensureFixturePdf() {
  const fixturesDir = path.join(cwd, 'tasks', 'runtime', 'fixtures');
  const fixturePath = path.join(fixturesDir, 'sprint6-admin-review-browser-fixture.pdf');
  await mkdir(fixturesDir, { recursive: true });

  try {
    await readFile(fixturePath);
    return fixturePath;
  } catch {}

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (let pageIndex = 0; pageIndex < 5; pageIndex += 1) {
    const page = pdf.addPage([612, 792]);
    page.drawRectangle({
      x: 36,
      y: 36,
      width: 540,
      height: 720,
      borderWidth: 2,
      borderColor: rgb(0.93, 0.45, 0.08),
    });
    page.drawText(`Browser Admin Review Fixture ${pageIndex + 1}`, {
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

async function resetDemoState() {
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
            locale: 'en-US',
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

async function setDemoRole(role) {
  const current = JSON.parse(await readFile(statePath, 'utf8'));
  current.auth = current.auth || {};
  current.auth.parentProfile = current.auth.parentProfile || {};
  current.auth.parentProfile.role = role;
  current.auth.parentProfile.updatedAt = new Date().toISOString();
  await writeFile(statePath, JSON.stringify(current, null, 2));
}

async function readJson(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} did not return JSON. Status=${response.status}. Body=${text}`);
  }
}

async function createReviewRun(fixturePath) {
  const createChildResponse = await fetch(`${env.BASE_URL}/api/children`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nickname: `Browser-${Date.now()}`,
      grade: '5th Grade',
      curriculum: 'Common Core',
    }),
  });
  const child = await readJson(createChildResponse, 'Create child');
  assert(createChildResponse.status === 201, 'Child creation API did not return 201.');

  const bytes = await readFile(fixturePath);
  const formData = new FormData();
  formData.append('childId', String(child.id));
  formData.append('sourceType', 'quiz');
  formData.append('notes', 'review this packet before release');
  formData.append(
    'pageDrafts',
    JSON.stringify([
      {
        previewKind: 'pdf',
        pageCount: 5,
        pages: Array.from({ length: 5 }, (_, pageIndex) => ({
          pageNumber: pageIndex + 1,
          previewLabel: `Browser review page ${pageIndex + 1}`,
          qualityFlags: {
            blurry: pageIndex === 0,
            rotated: false,
            dark: pageIndex === 1,
            lowContrast: false,
          },
        })),
      },
    ])
  );
  formData.append(
    'files',
    new File([bytes], 'sprint6-admin-review-browser-fixture.pdf', {
      type: 'application/pdf',
    })
  );

  const uploadResponse = await fetch(`${env.BASE_URL}/api/uploads`, {
    method: 'POST',
    body: formData,
  });
  const uploadPayload = await readJson(uploadResponse, 'Create upload');
  assert(uploadResponse.status === 201, 'Upload creation API did not return 201.');

  const submitResponse = await fetch(
    `${env.BASE_URL}/api/uploads/${uploadPayload.upload.id}/submit`,
    { method: 'POST' }
  );
  const submitPayload = await readJson(submitResponse, 'Submit upload');
  assert(submitResponse.status === 201, 'Upload submit API did not return 201.');

  const processResponse = await fetch(`${env.BASE_URL}/api/runs/${submitPayload.runId}/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ force: true }),
  });
  const processPayload = await readJson(processResponse, 'Process run');
  assert(processResponse.status === 200, 'Run process API did not return 200.');
  assert(
    processPayload.run?.status === 'needs_review',
    `Expected needs_review run but received ${processPayload.run?.status}`
  );
  return processPayload.run.id;
}

async function main() {
  const fixturePath = await ensureFixturePdf();
  await resetDemoState();

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

  const buildExitCode = await new Promise((resolve, reject) => {
    build.on('exit', resolve);
    build.on('error', reject);
  });
  assert(buildExitCode === 0, `Demo build failed with exit code ${String(buildExitCode)}.`);

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

  let browser;

  try {
    await waitForServer(`${env.BASE_URL}/admin/review`);
    const runId = await createReviewRun(fixturePath);

    browser = await chromium.launch({
      executablePath: getBrowserExecutable(),
      headless: true,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    await page.goto(`${env.BASE_URL}/admin/review`, { waitUntil: 'load' });
    await page.waitForFunction(
      (currentRunId) =>
        document.body.textContent?.includes('Admin review queue') &&
        document.body.textContent?.includes(`Run #${currentRunId}`),
      runId
    );

    await page.click(`a[href="/admin/review/${runId}"]`);
    await page.waitForURL(new RegExp(`/admin/review/${runId}$`));
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Source pages') &&
      document.body.textContent?.includes('Structured extraction') &&
      document.body.textContent?.includes('Draft report preview')
    );

    await page.fill('#summary', 'Browser reviewer updated summary copy for Sprint 6.');
    await page.click('button:has-text("Save Display Copy")');
    await page.waitForFunction(() =>
      document.body.textContent?.includes(
        'Display copy saved without changing structured findings.'
      )
    );

    await page.fill(
      '#request-more-photos',
      'Please re-upload two brighter, straight-on pages so we can confirm the diagnosis.'
    );
    await page.click('button:has-text("Request More Photos")');
    await page.waitForFunction(() =>
      document.body.textContent?.includes(
        'The parent-facing draft now asks for more photos before release.'
      )
    );

    await page.click('button:has-text("Approve Review")');
    await page.waitForURL(/\/admin\/review$/);
    await page.waitForFunction(() =>
      document.body.textContent?.includes('No runs are currently waiting for internal review.')
    );

    await setDemoRole('member');
    const deniedPage = await browser.newPage();
    deniedPage.setDefaultTimeout(30000);
    await deniedPage.goto(`${env.BASE_URL}/admin/review`, { waitUntil: 'load' });
    await deniedPage.waitForURL(/\/dashboard$/);
    await deniedPage.close();

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'admin_queue_browser',
            'admin_detail_browser',
            'admin_copy_edit_browser',
            'admin_request_more_photos_browser',
            'admin_approve_browser',
            'admin_non_admin_redirect_browser',
          ],
        },
        null,
        2
      )
    );
  } finally {
    if (browser) {
      await browser.close();
    }

    await stopServer(server);
    await delay(500);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
