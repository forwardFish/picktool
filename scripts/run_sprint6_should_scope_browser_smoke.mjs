import { Buffer } from 'node:buffer';
import { chromium } from 'playwright-core';
import {
  assert,
  buildApp,
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

function getBrowserExecutable() {
  return process.platform === 'win32' ? edgePathX86 : undefined;
}

async function main() {
  const fixturePath = await ensureFixturePdf(
    'sprint6-should-scope-browser-fixture.pdf',
    'Sprint 6 Browser Fixture'
  );
  await resetDemoState('en-US');
  await buildApp(demoEnv);
  const server = await startApp(demoEnv);
  let browser;

  try {
    await waitForServer(`${demoEnv.BASE_URL}/dashboard/reports/1`);

    const child = await createChild(demoEnv.BASE_URL, {
      nickname: `BrowserScope-${Date.now()}`,
    });
    const processed = await uploadAndProcess(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'browser should scope flow',
      pageBuilder: (pageIndex) => ({
        pageNumber: pageIndex + 1,
        previewLabel: `Browser scope page ${pageIndex + 1}`,
        qualityFlags: {
          blurry: false,
          rotated: false,
          dark: false,
          lowContrast: pageIndex === 0,
        },
      }),
    });
    assert(processed.reportId, 'Browser smoke needs a report id.');
    const reportId = processed.reportId;

    await unlockLatestReport(demoEnv.BASE_URL);
    await createTutorShare(demoEnv.BASE_URL, reportId);

    const state = await readDemoState();
    const report = state.reports.find((item) => item.id === reportId);
    const evidenceGroups = Array.isArray(report?.parentReportJson?.evidenceGroups)
      ? report.parentReportJson.evidenceGroups
      : [];
    if (evidenceGroups[0]?.items?.[0]) {
      evidenceGroups[0].items[0].highlightBox = null;
    }
    if (report?.parentReportJson?.topFindings?.[0]?.evidence?.[0]) {
      report.parentReportJson.topFindings[0].evidence[0].highlightBox = null;
    }
    await writeDemoState(state);

    browser = await chromium.launch({
      executablePath: getBrowserExecutable(),
      headless: true,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    await page.goto(`${demoEnv.BASE_URL}/dashboard/reports/${reportId}?locale=en-US`, {
      waitUntil: 'load',
    });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Diagnosis, evidence, and next steps')
    );
    const englishExportHref = await page
      .locator('a[href*="/api/reports/"][href*="/export"]')
      .getAttribute('href');
    assert(
      englishExportHref?.includes('locale=en-US'),
      'English export link should carry locale=en-US.'
    );

    await page.getByRole('link', { name: 'Spanish' }).click();
    await page.waitForURL(new RegExp(`/dashboard/reports/${reportId}\\?locale=es-US`));
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Diagnostico, evidencia y siguientes pasos')
    );
    const spanishExportHref = await page
      .locator('a[href*="/api/reports/"][href*="/export"]')
      .getAttribute('href');
    assert(
      spanishExportHref?.includes('locale=es-US'),
      'Spanish export link should carry locale=es-US.'
    );

    const englishExport = await fetch(`${demoEnv.BASE_URL}${englishExportHref}`);
    const spanishExport = await fetch(`${demoEnv.BASE_URL}${spanishExportHref}`);
    const englishBuffer = Buffer.from(await englishExport.arrayBuffer());
    const spanishBuffer = Buffer.from(await spanishExport.arrayBuffer());
    assert(
      !englishBuffer.equals(spanishBuffer),
      'Toggling report language should change the PDF export output.'
    );

    await page.goto(`${demoEnv.BASE_URL}/dashboard/reports/${reportId}?locale=en-US`, {
      waitUntil: 'load',
    });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Diagnosis, evidence, and next steps')
    );

    await page.getByRole('button', { name: 'Evidence' }).click();
    await page.waitForFunction(() =>
      document.body.textContent?.includes(
        'No bounding box was captured for this evidence item'
      )
    );
    await page.locator('button').filter({ hasText: 'Page 2' }).first().click();
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Highlight Overlay')
    );

    await page.goto(`${demoEnv.BASE_URL}/dashboard/tutor`, { waitUntil: 'load' });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Tutor handoff foundation') &&
      document.body.textContent?.includes('Owner-scoped shell only.') &&
      document.body.textContent?.includes('Tutor share')
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'report_language_toggle_browser',
            'pdf_export_locale_link_browser',
            'evidence_overlay_and_fallback_browser',
            'tutor_workspace_shell_browser',
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
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
