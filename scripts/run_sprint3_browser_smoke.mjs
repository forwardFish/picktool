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
  const fixturePath = path.join(fixturesDir, 'sprint3-upload-fixture.pdf');
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
    page.drawText(`Browser Fixture Page ${pageIndex + 1}`, {
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

async function main() {
  const fixturePath = await ensureFixturePdf();
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
    page.setDefaultTimeout(25000);

    await page.goto(`${env.BASE_URL}/dashboard`, { waitUntil: 'load' });
    assert(
      ((await page.textContent('body')) || '').includes('Parent Dashboard'),
      'Dashboard page is missing the overview shell.'
    );

    await page.goto(`${env.BASE_URL}/dashboard/children/new`, { waitUntil: 'load' });
    await page.fill('input[name="nickname"]', `Maya-${Date.now()}`);
    await page.selectOption('select[name="grade"]', '4th Grade');
    await page.selectOption('select[name="curriculum"]', 'Common Core');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/children\/\d+$/);
    const childId = page.url().split('/').pop();
    assert(childId, 'Child id was not present after create flow.');

    await page.goto(`${env.BASE_URL}/dashboard/children/${childId}/upload`, { waitUntil: 'load' });
    await page.setInputFiles('input[type="file"]', fixturePath);
    await page.waitForFunction(() => document.body.textContent?.includes('Total pages detected: 5'));
    await page.click('button:has-text("Generate Diagnosis")');
    await page.waitForURL(/\/dashboard\/runs\/\d+$/);
    await page.waitForFunction(() => document.body.textContent?.includes('View Report'), {
      timeout: 25000,
    });
    await page.click('a:has-text("View Report")');
    await page.waitForURL(/\/dashboard\/reports\/\d+$/);
    await page.waitForFunction(() => document.body.textContent?.includes('Diagnosis'), {
      timeout: 10000,
    });
    assert(
      ((await page.textContent('body')) || '').includes('Evidence') &&
        ((await page.textContent('body')) || '').includes('7-Day Plan'),
      'Report page is missing tab labels.'
    );
    await page.click('button:has-text("Evidence")');
    await page.waitForFunction(() => document.body.textContent?.includes('Procedure gap') || document.body.textContent?.includes('Calculation slip'));
    await page.click('button:has-text("7-Day Plan")');
    await page.waitForFunction(() => document.body.textContent?.includes('Day 1'));

    await page.goto(`${env.BASE_URL}/dashboard/children/${childId}/upload`, { waitUntil: 'load' });
    await page.setInputFiles('input[type="file"]', fixturePath);
    await page.fill('textarea[name="notes"], textarea#notes', 'review this run');
    await page.click('button:has-text("Generate Diagnosis")');
    await page.waitForURL(/\/dashboard\/runs\/\d+$/);
    await page.waitForFunction(() => document.body.textContent?.includes('Preview Draft Report'), {
      timeout: 25000,
    });
    await page.click('a:has-text("Preview Draft Report")');
    await page.waitForURL(/\/dashboard\/reports\/\d+$/);
    await page.waitForFunction(() => document.body.textContent?.includes('Draft report only'), {
      timeout: 10000,
    });
    await page.click('button:has-text("Evidence")');
    await page.waitForFunction(() => document.body.textContent?.includes('Why it matters'));

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'report_tabs_browser',
            'report_evidence_browser',
            'report_plan_browser',
            'needs_review_preview_browser',
            'review_banner_browser',
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
