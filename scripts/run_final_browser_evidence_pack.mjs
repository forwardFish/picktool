import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright-core';
import {
  assert,
  createChild,
  createTutorShare,
  demoEnv,
  ensureFixturePdf,
  readDemoState,
  resetDemoState,
  startApp,
  stopServer,
  unlockLatestReport,
  uploadAndProcess,
  waitForServer,
  writeDemoState,
} from './family_demo_smoke_utils.mjs';

const edgePathX86 = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edgePathX64 = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
const browserEvidenceDir = path.join(
  process.cwd(),
  'tasks',
  'runtime',
  'browser_evidence',
  'final_program'
);
const manifestPath = path.join(
  process.cwd(),
  'tasks',
  'runtime',
  'browser_evidence',
  'final_browser_evidence_manifest.json'
);

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

function killPort3000() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve();
      return;
    }

    const child = spawn(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($conn) { taskkill /PID $conn.OwningProcess /T /F | Out-Null }",
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'ignore',
      }
    );
    child.on('exit', () => resolve());
    child.on('error', () => resolve());
  });
}

async function setDemoRole(role) {
  const state = await readDemoState();
  state.auth = state.auth || {};
  state.auth.parentProfile = state.auth.parentProfile || {};
  state.auth.parentProfile.role = role;
  state.auth.parentProfile.updatedAt = new Date().toISOString();
  await writeDemoState(state);
}

async function waitForText(page, text) {
  if (text instanceof RegExp) {
    await page.waitForFunction(
      (source, flags) => new RegExp(source, flags).test(document.body.textContent || ''),
      text.source,
      text.flags
    );
    return;
  }

  await page.waitForFunction(
    (expectedText) => (document.body.textContent || '').includes(expectedText),
    text
  );
}

async function waitForHeading(page, text) {
  await page.getByRole('heading', { name: text }).waitFor();
}

async function restoreLanding(page) {
  await page.goto(`${demoEnv.BASE_URL}/`, { waitUntil: 'load' });
  await waitForText(page, 'Try a Diagnosis');
  await delay(900);
}

async function verifyLandingInteractions(page) {
  await waitForText(page, 'Features designed for the parent workflow');
  await waitForText(page, 'How FamilyEducation works');
  await waitForText(page, 'Proof that the workflow is ready for families');
  await waitForText(page, 'Questions families ask before uploading');
  await page.locator('[data-testid="landing-footer"]').waitFor();

  const viewport = page.viewportSize();
  if (viewport?.width && viewport.width < 1024) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.locator('header').getByRole('link', { name: 'Features' }).click();
  } else {
    await page.locator('header nav').getByRole('link', { name: 'Features' }).click();
  }
  await page.waitForURL(`${demoEnv.BASE_URL}/#features`);
  await page.locator('[data-testid="features-section"]').waitFor();

  await restoreLanding(page);
  await page.locator('[data-testid="hero-tertiary-cta"]').click();
  await page.waitForURL(`${demoEnv.BASE_URL}/#how-it-works`);
  await page.locator('[data-testid="how-it-works-section"]').waitFor();

  await restoreLanding(page);
  await page.locator('[data-testid="hero-secondary-cta"]').click();
  await page.waitForURL(`${demoEnv.BASE_URL}/pricing`);
  await waitForText(page, 'One-Time Diagnosis');

  await restoreLanding(page);
  await page.locator('[data-testid="hero-primary-cta"]').click();
  await page.waitForURL(new RegExp(`${demoEnv.BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sign-up\\?redirect=dashboard$`));
  await waitForText(page, 'Create your account');

  await restoreLanding(page);
}

async function captureRoute(page, route, manifest) {
  const consoleErrors = [];
  const handleConsole = (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  };
  page.on('console', handleConsole);

  try {
    await route.beforeVisit?.();
    await page.goto(route.url, { waitUntil: 'load' });
    if (route.waitFor) {
      await waitForText(page, route.waitFor);
    }
    if (route.afterVisit) {
      await route.afterVisit(page);
    }
    if (route.settleMs) {
      await delay(route.settleMs);
    }

    const desktopPath = path.join(browserEvidenceDir, `${route.slug}_desktop.png`);
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.screenshot({ path: desktopPath, fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'load' });
    if (route.waitFor) {
      await waitForText(page, route.waitFor);
    }
    if (route.afterVisit) {
      await route.afterVisit(page);
    }
    if (route.settleMs) {
      await delay(route.settleMs);
    }
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    );
    assert(mobileOverflow, `Mobile viewport overflow detected on ${route.slug}.`);
    const mobilePath = path.join(browserEvidenceDir, `${route.slug}_mobile.png`);
    await page.screenshot({ path: mobilePath, fullPage: true });

    manifest.routes.push({
      slug: route.slug,
      url: route.url,
      final_url: page.url(),
      desktop_screenshot: desktopPath,
      mobile_screenshot: mobilePath,
      mobile_check: 'pass',
      console_errors: consoleErrors,
    });
    assert(consoleErrors.length === 0, `Console errors detected on ${route.slug}.`);
  } finally {
    page.removeListener('console', handleConsole);
  }
}

async function main() {
  await mkdir(browserEvidenceDir, { recursive: true });
  await killPort3000();

  const fixturePath = await ensureFixturePdf(
    'final-program-browser-fixture.pdf',
    'Final Program Browser Fixture'
  );
  await resetDemoState('en-US');
  const server = await startApp(demoEnv);
  let browser;

  try {
    await waitForServer(`${demoEnv.BASE_URL}/dashboard`);

    const child = await createChild(demoEnv.BASE_URL, {
      nickname: `FinalFlow-${Date.now()}`,
      grade: '5th Grade',
      curriculum: 'Common Core',
    });
    const firstProcessed = await uploadAndProcess(
      demoEnv.BASE_URL,
      child.id,
      fixturePath,
      { notes: 'final program first report' }
    );
    assert(firstProcessed.reportId, 'Expected the first processed upload to create a report.');
    await unlockLatestReport(demoEnv.BASE_URL);
    const shareLink = await createTutorShare(demoEnv.BASE_URL, firstProcessed.reportId);
    const shareUrl =
      shareLink.shareUrl ||
      `${demoEnv.BASE_URL}/share/${shareLink.token || shareLink.id || ''}`;

    const secondProcessed = await uploadAndProcess(
      demoEnv.BASE_URL,
      child.id,
      fixturePath,
      { notes: 'final program second report for weekly review' }
    );
    assert(secondProcessed.reportId, 'Expected the second processed upload to create a report.');
    await unlockLatestReport(demoEnv.BASE_URL);
    const reviewProcessed = await uploadAndProcess(
      demoEnv.BASE_URL,
      child.id,
      fixturePath,
      { notes: 'review this run for final admin evidence' }
    );
    assert(
      reviewProcessed.run?.status === 'needs_review',
      `Expected a needs_review run, received ${reviewProcessed.run?.status}.`
    );

    browser = await chromium.launch({
      executablePath: getBrowserExecutable(),
      headless: true,
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
    page.setDefaultTimeout(30000);

    const manifest = {
      generated_at: new Date().toISOString(),
      checks: [
        'RESP-001',
        'RESP-002',
        'RESP-003',
        'NF-001',
        'CLICK-006',
        'CLICK-007',
        'CLICK-009',
        'CLICK-010',
        'FULL-ROUTE-COVERAGE',
      ],
      routes: [],
    };

    const demoCheckoutUrl = `${demoEnv.BASE_URL}/dashboard/billing/demo-checkout?priceId=price_fe_one_time&session_id=demo-preview-session`;
    const routes = [
      {
        slug: 'landing',
        url: `${demoEnv.BASE_URL}/`,
        waitFor: 'Try a Diagnosis',
        afterVisit: verifyLandingInteractions,
        settleMs: 400,
      },
      {
        slug: 'pricing',
        url: `${demoEnv.BASE_URL}/pricing`,
        waitFor: 'One-Time Diagnosis',
      },
      {
        slug: 'sign_up',
        url: `${demoEnv.BASE_URL}/sign-up`,
        waitFor: 'Create your account',
      },
      {
        slug: 'sign_in',
        url: `${demoEnv.BASE_URL}/sign-in`,
        waitFor: 'Sign in to your account',
      },
      {
        slug: 'dashboard',
        url: `${demoEnv.BASE_URL}/dashboard`,
        waitFor: /Parent Dashboard|Welcome back,/,
      },
      {
        slug: 'dashboard_account',
        url: `${demoEnv.BASE_URL}/dashboard/account`,
        waitFor: 'Parent Profile',
      },
      {
        slug: 'dashboard_activity',
        url: `${demoEnv.BASE_URL}/dashboard/activity`,
        waitFor: 'Household Activity',
      },
      {
        slug: 'dashboard_billing',
        url: `${demoEnv.BASE_URL}/dashboard/billing`,
        waitFor: /Buy One Diagnosis|Start Parent Weekly|Claim Annual Price/,
      },
      {
        slug: 'dashboard_demo_checkout',
        url: demoCheckoutUrl,
        waitFor: 'Review the selected FamilyEducation plan',
      },
      {
        slug: 'dashboard_children',
        url: `${demoEnv.BASE_URL}/dashboard/children`,
        waitFor: "Manage each child's learning profile",
      },
      {
        slug: 'dashboard_child_new',
        url: `${demoEnv.BASE_URL}/dashboard/children/new`,
        waitFor: 'Create a child learning profile',
      },
      {
        slug: 'child_detail',
        url: `${demoEnv.BASE_URL}/dashboard/children/${child.id}`,
        waitFor: 'Parent Review Note',
      },
      {
        slug: 'upload',
        url: `${demoEnv.BASE_URL}/dashboard/children/${child.id}/upload`,
        waitFor: 'Generate Diagnosis',
      },
      {
        slug: 'dashboard_general',
        url: `${demoEnv.BASE_URL}/dashboard/general`,
        waitFor: 'Parent Profile',
      },
      {
        slug: 'dashboard_security',
        url: `${demoEnv.BASE_URL}/dashboard/security`,
        waitFor: 'Security Settings',
      },
      {
        slug: 'run_status',
        url: `${demoEnv.BASE_URL}/dashboard/runs/${firstProcessed.run.id}`,
        waitFor: 'View Report',
      },
      {
        slug: 'report',
        url: `${demoEnv.BASE_URL}/dashboard/reports/${firstProcessed.reportId}`,
        waitFor: 'Diagnosis',
      },
      {
        slug: 'tutor_workspace',
        url: `${demoEnv.BASE_URL}/dashboard/tutor`,
        waitFor: 'Tutor handoff foundation',
      },
      {
        slug: 'share_read_only',
        url: shareUrl,
        waitFor: 'Tutor Share',
      },
      {
        slug: 'admin_review',
        url: `${demoEnv.BASE_URL}/admin/review`,
        waitFor: 'Admin review queue',
        beforeVisit: async () => {
          await setDemoRole('admin');
        },
        afterVisit: async (currentPage) => {
          await waitForText(currentPage, `Run #${reviewProcessed.run.id}`);
        },
      },
      {
        slug: 'admin_review_detail',
        url: `${demoEnv.BASE_URL}/admin/review/${reviewProcessed.run.id}`,
        waitFor: 'Structured extraction',
        beforeVisit: async () => {
          await setDemoRole('admin');
        },
        afterVisit: async (currentPage) => {
          await waitForText(currentPage, `Run #${reviewProcessed.run.id}`);
          await waitForText(currentPage, 'Draft report preview');
        },
      },
    ];

    for (const route of routes) {
      await captureRoute(page, route, manifest);
    }

    assert(
      manifest.routes.length === routes.length,
      `Expected ${routes.length} route captures but received ${manifest.routes.length}.`
    );

    await setDemoRole('owner');
    const noteText = 'Final acceptance note persisted through the browser evidence pack.';
    const noteUpdateResponse = await fetch(`${demoEnv.BASE_URL}/api/reports/${secondProcessed.reportId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parentNote: noteText }),
    });
    const noteUpdatePayload = await noteUpdateResponse.json();
    assert(noteUpdateResponse.status === 200, 'Final browser evidence note seed should return 200.');
    assert(
      String(noteUpdatePayload.parentReportJson?.parentNote || '').includes(noteText),
      'Final browser evidence note seed should persist in the report API.'
    );
    await page.goto(`${demoEnv.BASE_URL}/dashboard/children/${child.id}`, {
      waitUntil: 'load',
    });
    await waitForText(page, 'Parent Review Note');
    await page.reload({ waitUntil: 'load' });
    await waitForText(page, `Report #${secondProcessed.reportId}`);
    const savedNotes = await page
      .locator('textarea')
      .evaluateAll((elements) => elements.map((element) => element.value));
    assert(
      savedNotes.some((value) => value.includes(noteText)),
      'Final browser evidence note did not persist after reload.'
    );

    manifest.final_flow = {
      first_report_id: firstProcessed.reportId,
      second_report_id: secondProcessed.reportId,
      review_run_id: reviewProcessed.run.id,
      share_url: shareUrl,
      route_count: manifest.routes.length,
    };

    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(JSON.stringify({ status: 'pass', manifest: manifestPath }, null, 2));
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
