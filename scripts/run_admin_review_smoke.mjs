import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const cwd = process.cwd();
const runtimeDir = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime');
const statePath = path.join(runtimeDir, 'family_mock_state.json');
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

async function readJson(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} did not return JSON. Status=${response.status}. Body=${text}`);
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
  const fixturePath = path.join(fixturesDir, 'sprint6-admin-review-fixture.pdf');
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
    page.drawText(`Sprint 6 Admin Review Fixture ${pageIndex + 1}`, {
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

async function createChild() {
  const nickname = `Review-${Date.now()}`;
  const response = await fetch(`${env.BASE_URL}/api/children`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nickname,
      grade: '4th Grade',
      curriculum: 'Common Core',
    }),
  });
  const payload = await readJson(response, 'Create child');
  assert(response.status === 201, 'Child creation API did not return 201.');
  return payload;
}

async function uploadAndProcess(childId, fixturePath, notes) {
  const bytes = await readFile(fixturePath);
  const formData = new FormData();
  formData.append('childId', String(childId));
  formData.append('sourceType', 'quiz');
  formData.append('notes', notes);
  formData.append(
    'pageDrafts',
    JSON.stringify([
      {
        previewKind: 'pdf',
        pageCount: 5,
        pages: Array.from({ length: 5 }, (_, pageIndex) => ({
          pageNumber: pageIndex + 1,
          previewLabel: `Admin review page ${pageIndex + 1}`,
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
    new File([bytes], 'sprint6-admin-review-fixture.pdf', {
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
  return processPayload;
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

  try {
    await waitForServer(`${env.BASE_URL}/admin/review`);

    const child = await createChild();
    const processed = await uploadAndProcess(
      child.id,
      fixturePath,
      'review this packet before release'
    );
    assert(
      processed.run?.status === 'needs_review',
      `Expected needs_review run but received ${processed.run?.status}`
    );
    assert(processed.reportId, 'Process response did not include a report id.');

    const queueResponse = await fetch(`${env.BASE_URL}/api/admin/review`);
    const queuePayload = await readJson(queueResponse, 'Admin review queue');
    assert(queueResponse.status === 200, 'Admin review queue API did not return 200.');
    assert(
      Array.isArray(queuePayload.items) &&
        queuePayload.items.some((item) => item.runId === processed.run.id),
      'The needs_review run was not visible in the admin review queue.'
    );

    const detailResponse = await fetch(`${env.BASE_URL}/api/admin/review/${processed.run.id}`);
    const detailPayload = await readJson(detailResponse, 'Admin review detail');
    assert(detailResponse.status === 200, 'Admin review detail API did not return 200.');
    assert(detailPayload.pages?.length === 5, 'Admin review detail is missing source pages.');
    assert(
      detailPayload.extractionItems?.length > 0,
      'Admin review detail is missing structured extraction rows.'
    );
    assert(
      detailPayload.report?.parentReportJson?.summary,
      'Admin review detail is missing the draft report payload.'
    );

    const patchResponse = await fetch(`${env.BASE_URL}/api/admin/review/${processed.run.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        summary: 'Reviewer adjusted summary for the Sprint 6 admin queue.',
      }),
    });
    const patchPayload = await readJson(patchResponse, 'Admin review copy update');
    assert(patchResponse.status === 200, 'Admin review PATCH did not return 200.');
    assert(
      patchPayload.report?.parentReportJson?.summary ===
        'Reviewer adjusted summary for the Sprint 6 admin queue.',
      'Admin review PATCH did not persist the updated summary.'
    );

    const requestResponse = await fetch(
      `${env.BASE_URL}/api/admin/review/${processed.run.id}/request-more-photos`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: 'Please re-upload two brighter, straight-on pages so we can confirm the pattern.',
        }),
      }
    );
    const requestPayload = await readJson(requestResponse, 'Request more photos');
    assert(requestResponse.status === 200, 'Request more photos API did not return 200.');
    assert(
      requestPayload.run?.status === 'needs_review' &&
        String(requestPayload.report?.parentReportJson?.reviewBanner || '').includes(
          'Please re-upload two brighter, straight-on pages'
        ),
      'Request more photos did not keep the run in needs_review with a parent-facing banner.'
    );

    const approveResponse = await fetch(
      `${env.BASE_URL}/api/admin/review/${processed.run.id}/approve`,
      { method: 'POST' }
    );
    const approvePayload = await readJson(approveResponse, 'Approve review');
    assert(approveResponse.status === 200, 'Approve review API did not return 200.');
    assert(
      approvePayload.run?.status === 'done' &&
        approvePayload.report?.parentReportJson?.releaseStatus === 'ready',
      'Approve review did not release the report.'
    );

    const queueAfterApproveResponse = await fetch(`${env.BASE_URL}/api/admin/review`);
    const queueAfterApprovePayload = await readJson(
      queueAfterApproveResponse,
      'Admin review queue after approve'
    );
    assert(queueAfterApproveResponse.status === 200, 'Queue API failed after approve.');
    assert(
      Array.isArray(queueAfterApprovePayload.items) &&
        !queueAfterApprovePayload.items.some((item) => item.runId === processed.run.id),
      'Approved run still appears in the needs_review queue.'
    );

    await setDemoRole('member');
    const forbiddenResponse = await fetch(`${env.BASE_URL}/api/admin/review`);
    const forbiddenPayload = await readJson(forbiddenResponse, 'Forbidden admin queue');
    assert(forbiddenResponse.status === 403, 'Non-admin access did not return 403.');
    assert(forbiddenPayload.error === 'Forbidden', 'Non-admin response did not return Forbidden.');

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'admin_queue_list',
            'admin_detail_payload',
            'admin_manual_text_adjust',
            'admin_request_more_photos',
            'admin_approve_release',
            'admin_queue_cleanup',
            'admin_forbidden_non_admin',
          ],
        },
        null,
        2
      )
    );
  } finally {
    await stopServer(server);
    await delay(500);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
