import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  assert,
  buildApp,
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
  statePath,
  stopServer,
  submitUpload,
  unlockLatestReport,
  uploadAndProcess,
  waitForServer,
  writeDemoState,
} from './family_demo_smoke_utils.mjs';

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJsonFile(filePath, payload) {
  await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

async function scheduleWeeklyReminder(baseUrl, child) {
  const response = await fetch(`${baseUrl}/api/notifications/schedule`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      kind: 'weekly_review',
      childId: child.id,
      childNickname: child.nickname,
    }),
  });
  const payload = await readJson(response, 'Schedule weekly reminder');
  assert(response.status === 201, 'Weekly reminder schedule should return 201.');
  return payload;
}

async function main() {
  const fixturePath = await ensureFixturePdf(
    'sprint7-release-candidate-fixture.pdf',
    'Sprint 7 Release Candidate Fixture'
  );
  await resetDemoState('en-US');
  await buildApp(demoEnv);
  const server = await startApp(demoEnv);

  try {
    await waitForServer(`${demoEnv.BASE_URL}/dashboard/children`);

    const childA = await createChild(demoEnv.BASE_URL, {
      nickname: `RetentionA-${Date.now()}`,
    });
    const processedA = await uploadAndProcess(demoEnv.BASE_URL, childA.id, fixturePath, {
      notes: 'sprint7 observability success path',
    });
    assert(processedA.reportId, 'Success path should create a report.');
    await unlockLatestReport(demoEnv.BASE_URL);
    const shareLink = await createTutorShare(demoEnv.BASE_URL, processedA.reportId);

    const lifecycleStore = await readJsonFile(
      path.join(observabilityDir, 'run_lifecycle_events.json')
    );
    assert(
      lifecycleStore.events.some(
        (event) => event.runId === processedA.run.id && event.eventType === 'completed'
      ),
      'Lifecycle telemetry should include a completed event for the successful run.'
    );

    const costStore = await readJsonFile(
      path.join(observabilityDir, 'cost_artifacts.json')
    );
    assert(
      costStore.artifacts.some((artifact) => artifact.runId === processedA.run.id),
      'Cost tracking should include a per-run artifact for the successful run.'
    );

    const childFail = await createChild(demoEnv.BASE_URL, {
      nickname: `TelemetryFail-${Date.now()}`,
    });
    const failedUpload = await createUpload(demoEnv.BASE_URL, childFail.id, fixturePath, {
      notes: 'fail sprint7 error event',
    });
    const failedSubmit = await submitUpload(demoEnv.BASE_URL, failedUpload.upload.id);
    assert(
      failedSubmit.status === 'failed',
      `Expected failed run from forced failure notes, received ${failedSubmit.status}.`
    );

    const failedRunResponse = await fetch(
      `${demoEnv.BASE_URL}/api/runs/${failedSubmit.runId}`
    );
    const failedRunPayload = await readJson(failedRunResponse, 'Failed run fetch');
    assert(failedRunResponse.status === 200, 'Failed run fetch should return 200.');
    assert(failedRunPayload.status === 'failed', 'Failed run should remain failed.');

    const errorStore = await readJsonFile(
      path.join(observabilityDir, 'error_events.json')
    );
    assert(
      errorStore.events.some((event) => event.runId === failedSubmit.runId),
      'Error telemetry should include the forced-failure run.'
    );

    const deleteReportResponse = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${processedA.reportId}`,
      { method: 'DELETE' }
    );
    const deleteReportPayload = await readJson(deleteReportResponse, 'Delete report');
    assert(deleteReportResponse.status === 200, 'Delete report should return 200.');
    assert(deleteReportPayload.success === true, 'Delete report should return success=true.');

    const missingReport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${processedA.reportId}?locale=en-US`
    );
    assert(missingReport.status === 404, 'Deleted report should return 404.');
    const missingExport = await fetch(
      `${demoEnv.BASE_URL}/api/reports/${processedA.reportId}/export?locale=en-US`
    );
    assert(missingExport.status === 404, 'Deleted report export should return 404.');
    const shareToken = shareLink.token || shareLink.shareUrl.split('/').pop();
    const missingShare = await fetch(`${demoEnv.BASE_URL}/api/share/${shareToken}`);
    assert(missingShare.status === 404, 'Deleted report share link should return 404.');

    const childB = await createChild(demoEnv.BASE_URL, {
      nickname: `DeleteUpload-${Date.now()}`,
    });
    const processedB = await uploadAndProcess(demoEnv.BASE_URL, childB.id, fixturePath, {
      notes: 'sprint7 upload delete flow',
    });
    const uploadIdB = processedB.run.uploadId;
    const runIdB = processedB.run.id;
    const pageIdB = processedB.run.pageRecords[0]?.id;

    const deleteUploadResponse = await fetch(
      `${demoEnv.BASE_URL}/api/uploads/${uploadIdB}`,
      { method: 'DELETE' }
    );
    const deleteUploadPayload = await readJson(deleteUploadResponse, 'Delete upload');
    assert(deleteUploadResponse.status === 200, 'Delete upload should return 200.');
    assert(deleteUploadPayload.success === true, 'Delete upload should return success=true.');

    const missingRunB = await fetch(`${demoEnv.BASE_URL}/api/runs/${runIdB}`);
    assert(missingRunB.status === 404, 'Deleted upload run should return 404.');
    const missingPageB = await fetch(`${demoEnv.BASE_URL}/api/pages/${pageIdB}/artifact`);
    assert(missingPageB.status === 404, 'Deleted upload page artifact should return 404.');

    const childC = await createChild(demoEnv.BASE_URL, {
      nickname: `DeleteChild-${Date.now()}`,
    });
    const processedC = await uploadAndProcess(demoEnv.BASE_URL, childC.id, fixturePath, {
      notes: 'sprint7 child delete cascade',
    });
    const deleteChildResponse = await fetch(
      `${demoEnv.BASE_URL}/api/children/${childC.id}`,
      { method: 'DELETE' }
    );
    const deleteChildPayload = await readJson(deleteChildResponse, 'Delete child');
    assert(deleteChildResponse.status === 200, 'Delete child should return 200.');
    assert(deleteChildPayload.success === true, 'Delete child should return success=true.');

    const missingChild = await fetch(`${demoEnv.BASE_URL}/api/children/${childC.id}`);
    assert(missingChild.status === 404, 'Deleted child should return 404.');
    const missingRunC = await fetch(`${demoEnv.BASE_URL}/api/runs/${processedC.run.id}`);
    assert(missingRunC.status === 404, 'Deleted child run should return 404.');
    const missingReportC = await fetch(`${demoEnv.BASE_URL}/api/reports/${processedC.reportId}`);
    assert(missingReportC.status === 404, 'Deleted child report should return 404.');

    await scheduleWeeklyReminder(demoEnv.BASE_URL, childFail);

    const state = await readDemoState();
    const archivedChild = state.children.find((child) => child.id === childC.id);
    assert(archivedChild?.deletedAt, 'Deleted child should remain archived for retention cleanup.');
    archivedChild.deletedAt = isoDaysAgo(45);
    await writeDemoState(state);

    const reminderStore = await readJsonFile(path.join(runtimeDir, 'reminder_events.json'));
    const agedReminder = reminderStore.events.find((event) => event.kind === 'weekly_review');
    assert(agedReminder, 'Expected a weekly reminder artifact to age for retention cleanup.');
    agedReminder.createdAt = isoDaysAgo(100);
    await writeJsonFile(path.join(runtimeDir, 'reminder_events.json'), reminderStore);

    const agedLifecycleStore = await readJsonFile(
      path.join(observabilityDir, 'run_lifecycle_events.json')
    );
    const agedLifecycleEvent = agedLifecycleStore.events.find(
      (event) => event.runId === processedA.run.id
    );
    assert(agedLifecycleEvent, 'Expected a lifecycle event to age for cleanup.');
    agedLifecycleEvent.createdAt = isoDaysAgo(45);
    await writeJsonFile(
      path.join(observabilityDir, 'run_lifecycle_events.json'),
      agedLifecycleStore
    );

    const agedErrorStore = await readJsonFile(path.join(observabilityDir, 'error_events.json'));
    const agedErrorEvent = agedErrorStore.events.find(
      (event) => event.runId === failedSubmit.runId
    );
    assert(agedErrorEvent, 'Expected an error event to age for cleanup.');
    agedErrorEvent.createdAt = isoDaysAgo(45);
    await writeJsonFile(path.join(observabilityDir, 'error_events.json'), agedErrorStore);

    const agedCostStore = await readJsonFile(path.join(observabilityDir, 'cost_artifacts.json'));
    const agedCostArtifact = agedCostStore.artifacts.find(
      (artifact) => artifact.runId === processedA.run.id
    );
    assert(agedCostArtifact, 'Expected a cost artifact to age for cleanup.');
    agedCostArtifact.createdAt = isoDaysAgo(45);
    await writeJsonFile(path.join(observabilityDir, 'cost_artifacts.json'), agedCostStore);

    const cleanup = spawnSync('python', ['scripts/run_retention_cleanup.py'], {
      cwd: process.cwd(),
      env: demoEnv,
      encoding: 'utf-8',
    });
    assert(cleanup.status === 0, `Retention cleanup should pass.\n${cleanup.stderr}`);

    const cleanedState = await readDemoState();
    assert(
      !cleanedState.children.some((child) => child.id === childC.id),
      'Retention cleanup should purge archived child metadata beyond retention.'
    );

    const cleanedReminderStore = await readJsonFile(path.join(runtimeDir, 'reminder_events.json'));
    assert(
      !cleanedReminderStore.events.some((event) => event.id === agedReminder.id),
      'Retention cleanup should purge aged reminder events.'
    );

    const cleanedLifecycleStore = await readJsonFile(
      path.join(observabilityDir, 'run_lifecycle_events.json')
    );
    assert(
      !cleanedLifecycleStore.events.some((event) => event.id === agedLifecycleEvent.id),
      'Retention cleanup should purge aged lifecycle events.'
    );

    const cleanedErrorStore = await readJsonFile(path.join(observabilityDir, 'error_events.json'));
    assert(
      !cleanedErrorStore.events.some((event) => event.id === agedErrorEvent.id),
      'Retention cleanup should purge aged error events.'
    );

    const cleanedCostStore = await readJsonFile(path.join(observabilityDir, 'cost_artifacts.json'));
    assert(
      !cleanedCostStore.artifacts.some((artifact) => artifact.id === agedCostArtifact.id),
      'Retention cleanup should purge aged cost artifacts.'
    );

    const retentionAudit = await readJsonFile(retentionAuditPath);
    assert(
      retentionAudit.cleanup_counts.archived_children_purged >= 1,
      'Retention audit should report at least one purged archived child.'
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'ops_delete_report_flow',
            'ops_delete_upload_flow',
            'ops_delete_child_flow',
            'telemetry_lifecycle_and_error_events',
            'cost_artifact_per_run',
            'retention_cleanup_audit',
            'release_candidate_fixture_pack_present',
          ],
          artifacts: {
            statePath,
            lifecyclePath: path.join(observabilityDir, 'run_lifecycle_events.json'),
            errorPath: path.join(observabilityDir, 'error_events.json'),
            costPath: path.join(observabilityDir, 'cost_artifacts.json'),
            retentionAuditPath,
            fixturePackPath: path.join(
              process.cwd(),
              'tasks',
              'runtime',
              'fixtures',
              'release_candidate_fixture_pack.json'
            ),
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
