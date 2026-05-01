import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import {
  assert,
  buildApp,
  createChild,
  createTutorShare,
  demoEnv,
  ensureFixturePdf,
  readDemoState,
  readJson,
  resetDemoState,
  runtimeDir,
  startApp,
  statePath,
  stopServer,
  unlockLatestReport,
  uploadAndProcess,
  waitForServer,
  writeDemoState,
} from './family_demo_smoke_utils.mjs';

async function main() {
  const fixturePath = await ensureFixturePdf(
    'sprint6-should-scope-fixture.pdf',
    'Sprint 6 Should Scope Fixture'
  );
  await resetDemoState('en-US');
  await buildApp(demoEnv);
  const unauthorizedServer = await startApp({
    ...demoEnv,
    FAMILY_EDU_DEMO_AUTO_AUTH: '0',
  });
  await waitForServer(`${demoEnv.BASE_URL}/sign-in`);

  try {
    const unauthorizedExport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/1/export`
    );
    assert(unauthorizedExport.status === 401, 'Unauthorized export should return 401.');
  } finally {
    await stopServer(unauthorizedServer);
  }

  const server = await startApp(demoEnv);

  try {
    await waitForServer(`${demoEnv.BASE_URL}/dashboard/reports/1`);

    const child = await createChild(demoEnv.BASE_URL, {
      nickname: `ShouldScope-${Date.now()}`,
    });
    const processed = await uploadAndProcess(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'normal should scope flow',
      pageBuilder: (pageIndex) => ({
        pageNumber: pageIndex + 1,
        previewLabel: `Should scope page ${pageIndex + 1}`,
        qualityFlags: {
          blurry: false,
          rotated: false,
          dark: false,
          lowContrast: pageIndex === 0,
        },
      }),
    });

    assert(processed.run?.status === 'done', `Expected done run, received ${processed.run?.status}`);
    assert(processed.reportId, 'Process response did not include a report id.');
    const reportId = processed.reportId;

    const lockedExport = await fetch(`${demoEnv.BASE_URL}/api/reports/${reportId}/export`);
    assert(lockedExport.status === 402, 'Locked export should return 402.');

    await unlockLatestReport(demoEnv.BASE_URL);

    const missingExport = await fetch(`${demoEnv.BASE_URL}/api/reports/999999/export`);
    assert(missingExport.status === 404, 'Missing export should return 404.');

    const englishExport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${reportId}/export?locale=en-US`
    );
    assert(englishExport.status === 200, 'English PDF export should return 200.');
    assert(
      englishExport.headers.get('content-type')?.includes('application/pdf'),
      'English PDF export should return a PDF content type.'
    );
    const englishBytes = Buffer.from(await englishExport.arrayBuffer());
    const englishPdf = await PDFDocument.load(englishBytes);
    assert(englishPdf.getPageCount() >= 2, 'English export should produce a multi-page PDF.');

    const spanishExport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${reportId}/export?locale=es-US`
    );
    assert(spanishExport.status === 200, 'Spanish PDF export should return 200.');
    const spanishBytes = Buffer.from(await spanishExport.arrayBuffer());
    const spanishPdf = await PDFDocument.load(spanishBytes);
    assert(spanishPdf.getPageCount() >= 2, 'Spanish export should produce a multi-page PDF.');
    assert(
      !englishBytes.equals(spanishBytes),
      'English and Spanish PDF exports should not be byte-identical.'
    );

    const localizedEnglish = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${reportId}?locale=en-US`
    );
    const localizedEnglishPayload = await readJson(localizedEnglish, 'Localized English report');
    assert(localizedEnglish.status === 200, 'English report API should return 200.');
    assert(
      localizedEnglishPayload.parentReportJson?.labels?.parentReport === 'Parent Report',
      'English report API should return English labels.'
    );

    const localizedSpanish = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${reportId}?locale=es-US`
    );
    const localizedSpanishPayload = await readJson(localizedSpanish, 'Localized Spanish report');
    assert(localizedSpanish.status === 200, 'Spanish report API should return 200.');
    assert(
      localizedSpanishPayload.parentReportJson?.labels?.parentReport === 'Informe para padres',
      'Spanish report API should return Spanish labels.'
    );

    const shareLink = await createTutorShare(demoEnv.BASE_URL, reportId);
    assert(shareLink.shareUrl?.includes('/share/'), 'Tutor share should return a share URL.');

    const state = await readDemoState();
    const foreignRunId = state.meta.nextIds.run++;
    const foreignReportId = state.meta.nextIds.report++;
    state.children.push({
      id: state.meta.nextIds.child++,
      userId: 999,
      nickname: 'Foreign Child',
      grade: '6th Grade',
      curriculum: 'IB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });
    state.runs.push({
      id: foreignRunId,
      userId: 999,
      childId: state.children[state.children.length - 1].id,
      uploadId: processed.run.uploadId,
      status: 'done',
      stage: 'done',
      progressPercent: 100,
      estimatedMinutes: 0,
      statusMessage: 'done',
      overallConfidence: 0.82,
      needsReviewReason: null,
      errorMessage: null,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    state.reports.push({
      id: foreignReportId,
      runId: foreignRunId,
      parentReportJson: {
        childNickname: 'Foreign Child',
      },
      studentReportJson: {},
      tutorReportJson: {
        recommendedFocus: 'Foreign scope leak',
        releaseStatus: 'ready',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await writeDemoState(state);

    const tutorWorkspace = await fetch(`${demoEnv.BASE_URL}/api/tutor`);
    const tutorWorkspacePayload = await readJson(tutorWorkspace, 'Tutor workspace');
    assert(tutorWorkspace.status === 200, 'Tutor workspace API should return 200.');
    assert(tutorWorkspacePayload.scope === 'owner', 'Tutor workspace should declare owner scope.');
    assert(
      tutorWorkspacePayload.items.some((item) => item.reportId === reportId),
      'Tutor workspace should include the parent-owned report.'
    );
    assert(
      !tutorWorkspacePayload.items.some((item) => item.reportId === foreignReportId),
      'Tutor workspace should not leak foreign household data.'
    );
    assert(
      tutorWorkspacePayload.items.some((item) => item.shareStatus === 'active'),
      'Tutor workspace should reflect the active tutor share status.'
    );

    const weeklyReminder = await fetch(`${demoEnv.BASE_URL}/api/notifications/schedule`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind: 'weekly_review',
        childId: child.id,
        childNickname: child.nickname,
      }),
    });
    const weeklyReminderPayload = await readJson(weeklyReminder, 'Weekly reminder schedule');
    assert(weeklyReminder.status === 201, 'Weekly reminder schedule should return 201.');
    assert(
      weeklyReminderPayload.mode === 'safe_fallback',
      'Weekly reminder scheduling should stay in safe fallback mode.'
    );

    const reminderEvents = await fetch(`${demoEnv.BASE_URL}/api/notifications/schedule`);
    const reminderEventsPayload = await readJson(reminderEvents, 'Reminder event listing');
    assert(reminderEvents.status === 200, 'Reminder event listing should return 200.');
    assert(
      reminderEventsPayload.events.some(
        (event) => event.kind === 'report_ready' && event.reportId === reportId
      ),
      'Reminder event listing should include the report-ready reminder.'
    );
    assert(
      reminderEventsPayload.events.some(
        (event) => event.kind === 'weekly_review' && event.childId === child.id
      ),
      'Reminder event listing should include the weekly review reminder.'
    );

    const reminderStore = JSON.parse(
      await readFile(`${runtimeDir}/reminder_events.json`, 'utf8')
    );
    assert(
      Array.isArray(reminderStore.events) &&
        reminderStore.events.every((event) => event.deliveryChannel === 'email_safe_fallback'),
      'Reminder store should persist safe fallback delivery records.'
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'pdf_export_negative_statuses',
            'pdf_export_download_stream',
            'localized_report_api',
            'tutor_workspace_owner_scope',
            'report_ready_reminder_artifact',
            'weekly_review_reminder_artifact',
          ],
          artifacts: {
            statePath,
            reminderStorePath: `${runtimeDir}/reminder_events.json`,
          },
        },
        null,
        2
      )
    );
  } finally {
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
