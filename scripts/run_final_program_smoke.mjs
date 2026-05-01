import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import {
  assert,
  createChild,
  createTutorShare,
  createUpload,
  demoEnv,
  ensureFixturePdf,
  observabilityDir,
  readDemoState,
  readJson,
  resetDemoState,
  retentionAuditPath,
  runtimeDir,
  startApp,
  stopServer,
  submitUpload,
  unlockLatestReport,
  uploadAndProcess,
  waitForServer,
  writeDemoState,
} from './family_demo_smoke_utils.mjs';

const manifestPath = path.join(
  process.cwd(),
  'tasks',
  'runtime',
  'final_acceptance',
  'final_api_smoke_manifest.json'
);

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

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJsonFile(filePath, payload) {
  await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

async function fetchJson(url, options, label) {
  const response = await fetch(url, options);
  const payload = await readJson(response, label);
  return { response, payload };
}

async function main() {
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await killPort3000();

  const fixturePath = await ensureFixturePdf(
    'final-program-smoke-fixture.pdf',
    'Final Program Smoke Fixture'
  );
  await resetDemoState('en-US');
  const server = await startApp(demoEnv);

  try {
    await waitForServer(`${demoEnv.BASE_URL}/dashboard`);

    const manifest = {
      generated_at: new Date().toISOString(),
      checks: [],
      artifacts: {},
    };

    const child = await createChild(demoEnv.BASE_URL, {
      nickname: `FinalApi-${Date.now()}`,
      grade: '5th Grade',
      curriculum: 'Common Core',
    });
    manifest.checks.push('api_child_create');

    const uploadPayload = await createUpload(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'final api smoke upload',
    });
    assert(uploadPayload.upload.totalPages === 5, 'Upload should record 5 total pages.');
    assert(uploadPayload.pages.length === 5, 'Upload should return 5 persisted pages.');
    manifest.checks.push('api_upload_create');

    const uploadFiles = await fetchJson(
      `${demoEnv.BASE_URL}/api/uploads/${uploadPayload.upload.id}/files`,
      {},
      'Upload files'
    );
    assert(uploadFiles.response.status === 200, 'Upload files route should return 200.');
    assert(uploadFiles.payload.pages.length === 5, 'Upload files route should return 5 pages.');
    manifest.checks.push('api_upload_files');

    const processed = await uploadAndProcess(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'final api smoke report',
    });
    assert(processed.run.status === 'done', 'Normal run should finish as done.');
    assert(processed.reportId, 'Normal run should produce a report.');
    manifest.checks.push('api_run_done');

    const lockedReport = await fetchJson(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}?locale=en-US`,
      {},
      'Locked report'
    );
    assert(lockedReport.response.status === 402, 'Locked report API should return 402.');
    manifest.checks.push('billing_lock_gate');

    const lockedShare = await fetchJson(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}/share`,
      { method: 'POST' },
      'Locked share'
    );
    assert(lockedShare.response.status === 402, 'Locked share route should return 402.');

    const lockedExport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}/export?locale=en-US`
    );
    assert(lockedExport.status === 402, 'Locked export route should return 402.');

    await unlockLatestReport(demoEnv.BASE_URL);
    manifest.checks.push('billing_unlock_checkout');

    const reportEn = await fetchJson(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}?locale=en-US`,
      {},
      'Unlocked report EN'
    );
    assert(reportEn.response.status === 200, 'Unlocked report API should return 200.');
    assert(reportEn.payload.requestedLocale === 'en-US', 'EN report locale should round-trip.');

    const reportEs = await fetchJson(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}?locale=es-US`,
      {},
      'Unlocked report ES'
    );
    assert(reportEs.response.status === 200, 'Spanish report API should return 200.');
    assert(reportEs.payload.requestedLocale === 'es-US', 'ES report locale should round-trip.');
    manifest.checks.push('api_report_locale_variants');

    const exportResponse = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}/export?locale=es-US`
    );
    assert(exportResponse.status === 200, 'Unlocked export should return 200.');
    assert(
      exportResponse.headers.get('content-type')?.includes('application/pdf'),
      'Unlocked export should return a PDF content type.'
    );
    manifest.checks.push('api_report_export');

    const dayProgress = await fetchJson(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}`,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ completedDays: [1, 3], parentNote: 'Final smoke note.' }),
      },
      'Report patch'
    );
    assert(dayProgress.response.status === 200, 'Report patch should return 200.');
    assert(
      Array.isArray(dayProgress.payload.parentReportJson?.completedDays) &&
        dayProgress.payload.parentReportJson.completedDays.includes(3),
      'Completed day progress should persist through the report API.'
    );
    manifest.checks.push('api_report_plan_progress');

    const share = await createTutorShare(demoEnv.BASE_URL, processed.reportId);
    const shared = await fetchJson(
      `${demoEnv.BASE_URL}/api/share/${share.token}`,
      {},
      'Share read'
    );
    assert(shared.response.status === 200, 'Active share token should return 200.');
    manifest.checks.push('api_share_create_and_read');

    const revoke = await fetchJson(
      `${demoEnv.BASE_URL}/api/reports/${processed.reportId}/share?token=${encodeURIComponent(share.token)}`,
      { method: 'DELETE' },
      'Share revoke'
    );
    assert(revoke.response.status === 200, 'Share revoke should return 200.');
    const revokedShare = await fetchJson(
      `${demoEnv.BASE_URL}/api/share/${share.token}`,
      {},
      'Revoked share read'
    );
    assert(revokedShare.response.status === 410, 'Revoked share token should return 410.');
    manifest.checks.push('api_share_revoke');

    const secondProcessed = await uploadAndProcess(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'final api smoke second report',
    });
    await unlockLatestReport(demoEnv.BASE_URL);
    const childDetail = await fetch(
      `${demoEnv.BASE_URL}/dashboard/children/${child.id}`
    );
    const childHtml = await childDetail.text();
    assert(childDetail.status === 200, 'Child detail page should return 200.');
    assert(
      childHtml.includes('Weekly Compare') || childHtml.includes('Parent Review Note'),
      'Child detail page should include weekly review history after multiple reports.'
    );
    manifest.checks.push('history_compare_surface');

    const tutorWorkspace = await fetchJson(
      `${demoEnv.BASE_URL}/api/tutor`,
      {},
      'Tutor workspace'
    );
    assert(tutorWorkspace.response.status === 200, 'Tutor workspace API should return 200.');
    assert(tutorWorkspace.payload.scope === 'owner', 'Tutor workspace should remain owner-scoped.');
    manifest.checks.push('api_tutor_workspace');

    const invalidReminder = await fetchJson(
      `${demoEnv.BASE_URL}/api/notifications/schedule`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'report_ready' }),
      },
      'Invalid reminder schedule'
    );
    assert(invalidReminder.response.status === 400, 'Unsupported reminder kind should return 400.');

    const reminder = await fetchJson(
      `${demoEnv.BASE_URL}/api/notifications/schedule`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'weekly_review',
          childId: child.id,
          childNickname: child.nickname,
        }),
      },
      'Weekly reminder schedule'
    );
    assert(reminder.response.status === 201, 'Weekly reminder schedule should return 201.');
    assert(reminder.payload.mode === 'safe_fallback', 'Reminder route should stay in safe fallback mode.');
    const reminderEvents = await fetchJson(
      `${demoEnv.BASE_URL}/api/notifications/schedule`,
      {},
      'Reminder list'
    );
    assert(reminderEvents.response.status === 200, 'Reminder list should return 200.');
    assert(reminderEvents.payload.events.length >= 1, 'Reminder list should include the scheduled event.');
    manifest.checks.push('api_reminder_schedule');

    const needsReview = await uploadAndProcess(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'review this run for final api smoke',
    });
    assert(needsReview.run.status === 'needs_review', 'Review-noted run should enter needs_review.');
    manifest.checks.push('api_needs_review_routing');

    const failedUpload = await createUpload(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'fail this run for final api smoke',
    });
    const failedSubmit = await submitUpload(demoEnv.BASE_URL, failedUpload.upload.id);
    assert(failedSubmit.status === 'failed', 'Fail-noted run should return failed from submit.');
    const failedRun = await fetchJson(
      `${demoEnv.BASE_URL}/api/runs/${failedSubmit.runId}`,
      {},
      'Failed run'
    );
    assert(failedRun.response.status === 200, 'Failed run detail should return 200.');
    assert(
      String(failedRun.payload.errorMessage || '').toLowerCase().includes('fail'),
      'Forced-failure run should expose a failure-flavored error message.'
    );
    const retry = await fetchJson(
      `${demoEnv.BASE_URL}/api/runs/${failedSubmit.runId}/retry`,
      { method: 'POST' },
      'Retry run'
    );
    assert(retry.response.status === 200, 'Retry route should return 200.');
    manifest.checks.push('api_retry_run');

    const timeoutUpload = await createUpload(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'timeout this run for final api smoke',
    });
    const timeoutSubmit = await submitUpload(demoEnv.BASE_URL, timeoutUpload.upload.id);
    assert(timeoutSubmit.status === 'failed', 'Timeout-noted run should resolve as failed.');
    const timeoutRun = await fetchJson(
      `${demoEnv.BASE_URL}/api/runs/${timeoutSubmit.runId}`,
      {},
      'Timeout run'
    );
    assert(timeoutRun.response.status === 200, 'Timeout run detail should return 200.');
    assert(
      String(timeoutRun.payload.errorMessage || '').toLowerCase().includes('time'),
      'Timeout run should expose a timeout-flavored error message.'
    );
    manifest.checks.push('api_timeout_run');

    const lifecycleStore = await readJsonFile(
      path.join(observabilityDir, 'run_lifecycle_events.json')
    );
    const errorStore = await readJsonFile(path.join(observabilityDir, 'error_events.json'));
    const costStore = await readJsonFile(path.join(observabilityDir, 'cost_artifacts.json'));
    assert(lifecycleStore.events.length >= 1, 'Lifecycle telemetry should record run events.');
    assert(errorStore.events.length >= 1, 'Error telemetry should record failed runs.');
    assert(costStore.artifacts.length >= 1, 'Cost tracking should record per-run artifacts.');
    manifest.checks.push('ops_observability_and_cost');

    const reportDeleteShare = await createTutorShare(demoEnv.BASE_URL, secondProcessed.reportId);
    const deletedReport = await fetchJson(
      `${demoEnv.BASE_URL}/api/reports/${secondProcessed.reportId}`,
      { method: 'DELETE' },
      'Delete report'
    );
    assert(deletedReport.response.status === 200, 'Deleting a report should return 200.');
    const missingReport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${secondProcessed.reportId}?locale=en-US`
    );
    assert(missingReport.status === 404, 'Deleted report should return 404.');
    const missingShare = await fetch(
      `${demoEnv.BASE_URL}/api/share/${reportDeleteShare.token}`
    );
    assert(missingShare.status === 404, 'Deleted report share link should return 404.');
    manifest.checks.push('ops_delete_report');

    const uploadDelete = await uploadAndProcess(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'delete upload final api smoke',
    });
    const uploadDeleteResponse = await fetchJson(
      `${demoEnv.BASE_URL}/api/uploads/${uploadDelete.run.uploadId}`,
      { method: 'DELETE' },
      'Delete upload'
    );
    assert(uploadDeleteResponse.response.status === 200, 'Deleting an upload should return 200.');
    const missingRun = await fetch(`${demoEnv.BASE_URL}/api/runs/${uploadDelete.run.id}`);
    assert(missingRun.status === 404, 'Deleting an upload should remove its run.');
    const missingPage = await fetch(
      `${demoEnv.BASE_URL}/api/pages/${uploadDelete.run.pageRecords[0].id}/artifact`
    );
    assert(missingPage.status === 404, 'Deleting an upload should remove its page artifacts.');
    manifest.checks.push('ops_delete_upload');

    const childDelete = await uploadAndProcess(demoEnv.BASE_URL, child.id, fixturePath, {
      notes: 'delete child final api smoke',
    });
    const deleteChildResponse = await fetchJson(
      `${demoEnv.BASE_URL}/api/children/${child.id}`,
      { method: 'DELETE' },
      'Delete child'
    );
    assert(deleteChildResponse.response.status === 200, 'Deleting a child should return 200.');
    const missingChild = await fetch(`${demoEnv.BASE_URL}/api/children/${child.id}`);
    assert(missingChild.status === 404, 'Deleted child should return 404.');
    const missingChildRun = await fetch(`${demoEnv.BASE_URL}/api/runs/${childDelete.run.id}`);
    assert(missingChildRun.status === 404, 'Deleted child should remove linked runs.');
    manifest.checks.push('ops_delete_child');

    const state = await readDemoState();
    const archivedChild = state.children.find((entry) => entry.id === child.id);
    assert(archivedChild?.deletedAt, 'Deleted child should remain archived before retention cleanup.');
    archivedChild.deletedAt = isoDaysAgo(45);
    await writeDemoState(state);

    const reminderStore = await readJsonFile(path.join(runtimeDir, 'reminder_events.json'));
    const agedReminder = reminderStore.events[0];
    if (agedReminder) {
      agedReminder.createdAt = isoDaysAgo(90);
      await writeJsonFile(path.join(runtimeDir, 'reminder_events.json'), reminderStore);
    }

    lifecycleStore.events[0].createdAt = isoDaysAgo(45);
    errorStore.events[0].createdAt = isoDaysAgo(45);
    costStore.artifacts[0].createdAt = isoDaysAgo(45);
    await writeJsonFile(path.join(observabilityDir, 'run_lifecycle_events.json'), lifecycleStore);
    await writeJsonFile(path.join(observabilityDir, 'error_events.json'), errorStore);
    await writeJsonFile(path.join(observabilityDir, 'cost_artifacts.json'), costStore);

    const cleanup = spawnSync('python', ['scripts/run_retention_cleanup.py'], {
      cwd: process.cwd(),
      env: demoEnv,
      encoding: 'utf8',
    });
    assert(cleanup.status === 0, `Retention cleanup should pass.\n${cleanup.stderr}`);
    const retentionAudit = await readJsonFile(retentionAuditPath);
    assert(
      retentionAudit.cleanup_counts.archived_children_purged >= 1,
      'Retention cleanup should purge at least one archived child.'
    );
    manifest.checks.push('ops_retention_cleanup');

    manifest.artifacts = {
      observability_dir: observabilityDir,
      retention_audit: retentionAuditPath,
      reminder_events: path.join(runtimeDir, 'reminder_events.json'),
    };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(JSON.stringify({ status: 'pass', manifest: manifestPath }, null, 2));
  } finally {
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
