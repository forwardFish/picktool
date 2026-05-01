import { chromium } from 'playwright-core';
import {
  assert,
  buildApp,
  createChild,
  demoEnv,
  ensureFixturePdf,
  resetDemoState,
  startApp,
  stopServer,
  unlockLatestReport,
  uploadAndProcess,
  waitForServer,
} from './family_demo_smoke_utils.mjs';

const edgePathX86 = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function getBrowserExecutable() {
  return process.platform === 'win32' ? edgePathX86 : undefined;
}

async function main() {
  const fixturePath = await ensureFixturePdf(
    'sprint7-browser-delete-fixture.pdf',
    'Sprint 7 Browser Delete Fixture'
  );
  await resetDemoState('en-US');
  await buildApp(demoEnv);
  const server = await startApp(demoEnv);
  let browser;

  try {
    await waitForServer(`${demoEnv.BASE_URL}/dashboard/children`);

    const childReport = await createChild(demoEnv.BASE_URL, {
      nickname: `BrowserReport-${Date.now()}`,
    });
    const processedReport = await uploadAndProcess(
      demoEnv.BASE_URL,
      childReport.id,
      fixturePath,
      { notes: 'browser report delete path' }
    );
    await unlockLatestReport(demoEnv.BASE_URL);

    const childUpload = await createChild(demoEnv.BASE_URL, {
      nickname: `BrowserUpload-${Date.now()}`,
    });
    const processedUpload = await uploadAndProcess(
      demoEnv.BASE_URL,
      childUpload.id,
      fixturePath,
      { notes: 'browser upload delete path' }
    );

    const childDelete = await createChild(demoEnv.BASE_URL, {
      nickname: `BrowserChild-${Date.now()}`,
    });

    browser = await chromium.launch({
      executablePath: getBrowserExecutable(),
      headless: true,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    page.on('dialog', (dialog) => dialog.accept());

    await page.goto(`${demoEnv.BASE_URL}/dashboard/children/${childUpload.id}`, {
      waitUntil: 'load',
    });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Delete Upload')
    );
    await page.getByRole('button', { name: 'Delete Upload' }).click();
    await page.waitForFunction(() =>
      document.body.textContent?.includes('No uploads yet.')
    );

    const deletedUploadRun = await fetch(
      `${demoEnv.BASE_URL}/api/runs/${processedUpload.run.id}`
    );
    assert(deletedUploadRun.status === 404, 'Upload delete should remove linked runs.');

    await page.goto(`${demoEnv.BASE_URL}/dashboard/reports/${processedReport.reportId}`, {
      waitUntil: 'load',
    });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Delete Report')
    );
    await page.getByRole('button', { name: 'Delete Report' }).click();
    await page.waitForURL(`${demoEnv.BASE_URL}/dashboard/children`);

    const deletedReport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${processedReport.reportId}`
    );
    assert(deletedReport.status === 404, 'Report delete should remove the report route.');

    await page.goto(`${demoEnv.BASE_URL}/dashboard/children/${childDelete.id}`, {
      waitUntil: 'load',
    });
    await page.waitForFunction(() =>
      document.body.textContent?.includes('Delete Child Profile')
    );
    await page.getByRole('button', { name: 'Delete Child Profile' }).click();
    await page.waitForURL(`${demoEnv.BASE_URL}/dashboard/children`);

    const deletedChild = await fetch(
      `${demoEnv.BASE_URL}/api/children/${childDelete.id}`
    );
    assert(deletedChild.status === 404, 'Child delete should remove the child detail route.');

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'browser_upload_delete_entrypoint',
            'browser_report_delete_entrypoint',
            'browser_child_delete_entrypoint',
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
