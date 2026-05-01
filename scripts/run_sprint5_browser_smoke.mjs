import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { chromium } from 'playwright-core';

const cwd = process.cwd();
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

const edgePathX86 =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

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
  const fixturePath = path.join(fixturesDir, 'sprint5-browser-upload-fixture.pdf');
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
    page.drawText(`Browser Sprint 5 Fixture ${pageIndex + 1}`, {
      x: 64,
      y: 710,
      size: 24,
      font,
      color: rgb(0.12, 0.14, 0.18),
    });
  }

  const bytes = await pdf.save();
  await writeFile(fixturePath, Buffer.from(bytes));
  return fixturePath;
}

async function resetDemoState() {
  const runtimeDir = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime');
  const statePath = path.join(runtimeDir, 'family_mock_state.json');
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

async function uploadAndReachReport(page, childId, fixturePath) {
  await page.goto(`${env.BASE_URL}/dashboard/children/${childId}/upload`, { waitUntil: 'load' });
  await page.setInputFiles('input[type="file"]', fixturePath);
  await page.waitForFunction(() => document.body.textContent?.includes('Total pages detected: 5'));
  await page.click('button:has-text("Generate Diagnosis")');
  await page.waitForURL(/\/dashboard\/runs\/\d+$/);
  await page.waitForFunction(() => document.body.textContent?.includes('View Report'), {
    timeout: 45000,
  });
  await page.click('a:has-text("View Report")');
  await page.waitForURL(/\/dashboard\/reports\/\d+$/);
  return page.url();
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
    await waitForServer(`${env.BASE_URL}/dashboard`);

    browser = await chromium.launch({
      executablePath: getBrowserExecutable(),
      headless: true,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    await page.goto(`${env.BASE_URL}/dashboard/children/new`, { waitUntil: 'load' });
    await page.fill('input[name="nickname"]', `Mia-${Date.now()}`);
    await page.selectOption('select[name="grade"]', '5th Grade');
    await page.selectOption('select[name="curriculum"]', 'Common Core');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/children\/\d+$/);
    const childId = page.url().split('/').pop();
    assert(childId, 'Child id was not present after create flow.');

    const firstReportUrl = await uploadAndReachReport(page, childId, fixturePath);
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Full report locked until payment')
    );
    await page.click('a:has-text("Go To Billing")');
    await page.waitForURL(/\/dashboard\/billing$/);
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Buy One Diagnosis') &&
      document.body.textContent?.includes('Start Parent Weekly') &&
      document.body.textContent?.includes('Claim Annual Price')
    );

    await page.click('button:has-text("Buy One Diagnosis")');
    await page.waitForURL(/\/dashboard\/billing\/demo-checkout/);
    await page.click('a:has-text("Cancel And Return")');
    await page.waitForURL(/\/dashboard\/billing\?checkout=cancelled/);
    await page.waitForFunction(() => document.body.textContent?.includes('Checkout was canceled.'));

    await page.click('button:has-text("Buy One Diagnosis")');
    await page.waitForURL(/\/dashboard\/billing\/demo-checkout/);
    await page.click('button:has-text("Complete Demo Creem Checkout")');
    await page.waitForURL(/\/dashboard\/billing\?checkout=success&plan=one_time/);
    await page.waitForFunction(() =>
      document.body.textContent?.includes('One-Time Diagnosis credit was applied')
    );

    await page.goto(firstReportUrl, { waitUntil: 'load' });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Diagnosis') &&
      document.body.textContent?.includes('Share With Tutor')
    );

    await page.click('button:has-text("Create Tutor Link")');
    const shareUrlLocator = page.locator('p').filter({ hasText: /\/share\// }).first();
    await shareUrlLocator.waitFor();
    const shareUrl = await shareUrlLocator.innerText();
    assert(shareUrl.includes('/share/'), 'Share link was not rendered after create.');

    const sharePage = await browser.newPage();
    await sharePage.goto(shareUrl, { waitUntil: 'load' });
    await sharePage.waitForFunction(() =>
      document.body.textContent?.includes('Tutor Share') &&
      document.body.textContent?.includes('read-only')
    );
    await sharePage.close();

    await page.click('button:has-text("Revoke")');
    await page.waitForFunction(() => document.body.textContent?.includes('Revoked'));

    const secondReportUrl = await uploadAndReachReport(page, childId, fixturePath);
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Full report locked until payment')
    );
    await page.click('a:has-text("Go To Billing")');
    await page.waitForURL(/\/dashboard\/billing$/);
    await page.click('button:has-text("Start Parent Weekly")');
    await page.waitForURL(/\/dashboard\/billing\/demo-checkout/);
    await page.click('button:has-text("Complete Demo Creem Checkout")');
    await page.waitForURL(/\/dashboard\/billing\?checkout=success&plan=monthly/);
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Parent Weekly is active')
    );

    await page.goto(secondReportUrl, { waitUntil: 'load' });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Diagnosis') &&
      document.body.textContent?.includes('Evidence') &&
      document.body.textContent?.includes('7-Day Plan')
    );

    await page.goto(`${env.BASE_URL}/dashboard/children/${childId}`, { waitUntil: 'load' });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Weekly Review Timeline')
    );
    await page.locator('textarea').first().fill('The second report felt calmer after the monthly unlock flow.');
    await page.click('button:has-text("Save Note")');
    await page.waitForTimeout(1000);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Focus shifted') ||
      document.body.textContent?.includes('Improving:') ||
      document.body.textContent?.includes('Steady pattern:')
    );
    const noteValue = await page.locator('textarea').first().inputValue();
    assert(
      noteValue.includes('The second report felt calmer'),
      'Weekly review note did not persist after reload.'
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'report_paywall_browser',
            'billing_cancel_return_browser',
            'billing_one_time_unlock_browser',
            'share_create_browser',
            'share_read_only_browser',
            'share_revoke_browser',
            'billing_monthly_unlock_browser',
            'weekly_review_timeline_browser',
            'weekly_review_note_browser',
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
