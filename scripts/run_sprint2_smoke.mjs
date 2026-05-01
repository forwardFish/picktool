import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
  const fixturePath = path.join(fixturesDir, 'sprint2-upload-fixture.pdf');
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
    page.drawText(`FamilyEducation Fixture Page ${pageIndex + 1}`, {
      x: 64,
      y: 710,
      size: 24,
      font,
      color: rgb(0.12, 0.14, 0.18),
    });
    page.drawText('Math review packet for automated Sprint 2 smoke testing.', {
      x: 64,
      y: 676,
      size: 13,
      font,
      color: rgb(0.32, 0.35, 0.41),
    });
    for (let row = 0; row < 6; row += 1) {
      const y = 620 - row * 82;
      page.drawText(`${row + 1}. Solve and show all steps.`, {
        x: 72,
        y,
        size: 16,
        font,
      });
      page.drawText(`${pageIndex + 2}/${row + 2} + ${row + 3}/${pageIndex + 4} = ______`, {
        x: 96,
        y: y - 28,
        size: 16,
        font,
      });
      page.drawLine({
        start: { x: 92, y: y - 42 },
        end: { x: 520, y: y - 42 },
        thickness: 1,
        color: rgb(0.72, 0.75, 0.79),
      });
    }
  }

  const bytes = await pdf.save();
  await writeFile(fixturePath, Buffer.from(bytes));
  return fixturePath;
}

async function createChild() {
  const response = await fetch(`${env.BASE_URL}/api/children`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nickname: 'Maya',
      grade: '4th Grade',
      curriculum: 'Common Core',
    }),
  });
  const payload = await response.json();
  assert(response.status === 201, 'Child creation API did not return 201.');
  return payload;
}

async function uploadFixturePdf(childId, fixturePath, notes) {
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
          previewLabel: `PDF page ${pageIndex + 1}`,
          qualityFlags: {
            blurry: false,
            rotated: false,
            dark: false,
            lowContrast: false,
          },
        })),
      },
    ])
  );
  formData.append(
    'files',
    new File([bytes], 'sprint2-upload-fixture.pdf', {
      type: 'application/pdf',
    })
  );

  const uploadResponse = await fetch(`${env.BASE_URL}/api/uploads`, {
    method: 'POST',
    body: formData,
  });
  const uploadPayload = await uploadResponse.json();
  assert(uploadResponse.status === 201, 'Upload creation API did not return 201.');

  const filesResponse = await fetch(
    `${env.BASE_URL}/api/uploads/${uploadPayload.upload.id}/files`
  );
  const filesPayload = await filesResponse.json();
  assert(filesResponse.status === 200, 'Upload files API did not return 200.');
  assert(filesPayload.pages.length === 5, 'Upload files API did not return 5 pages.');

  const submitResponse = await fetch(
    `${env.BASE_URL}/api/uploads/${uploadPayload.upload.id}/submit`,
    { method: 'POST' }
  );
  const submitPayload = await submitResponse.json();
  assert(submitResponse.status === 201, 'Upload submit API did not return 201.');
  return submitPayload.runId;
}

async function waitForRunStatus(runId, expectedStatus) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`${env.BASE_URL}/api/runs/${runId}`, {
      cache: 'no-store',
    });
    const payload = await response.json();
    assert(response.status === 200, `Run ${runId} status API did not return 200.`);
    if (payload.status === expectedStatus) {
      return payload;
    }
    await delay(1000);
  }

  throw new Error(`Run ${runId} did not reach status ${expectedStatus}.`);
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

  try {
    await waitForServer(`${env.BASE_URL}/dashboard`);

    const child = await createChild();

    const doneRunId = await uploadFixturePdf(child.id, fixturePath, 'normal-run');
    const doneRun = await waitForRunStatus(doneRunId, 'done');
    assert(doneRun.reportId, 'Done run did not produce a report id.');

    const reportResponse = await fetch(
      `${env.BASE_URL}/dashboard/reports/${doneRun.reportId}`
    );
    const reportHtml = await reportResponse.text();
    assert(reportResponse.status === 200, 'Report page did not return 200.');
    assert(reportHtml.includes('7-Day Plan'), 'Report page is missing the plan section.');

    const failedRunId = await uploadFixturePdf(child.id, fixturePath, 'fail this run');
    await waitForRunStatus(failedRunId, 'failed');
    const retryResponse = await fetch(`${env.BASE_URL}/api/runs/${failedRunId}/retry`, {
      method: 'POST',
    });
    const retryPayload = await retryResponse.json();
    assert(retryResponse.status === 200, 'Retry API did not return 200.');
    assert(
      retryPayload.status === 'queued' || retryPayload.status === 'running',
      'Retry API did not reset the run.'
    );

    const reviewRunId = await uploadFixturePdf(child.id, fixturePath, 'review this run');
    const reviewRun = await waitForRunStatus(reviewRunId, 'needs_review');
    assert(
      String(reviewRun.needsReviewReason || '').includes('manual review') ||
        String(reviewRun.needsReviewReason || '').includes('review'),
      'Needs-review run did not expose a review reason.'
    );

    const timeoutRunId = await uploadFixturePdf(child.id, fixturePath, 'timeout this run');
    const timeoutRun = await waitForRunStatus(timeoutRunId, 'failed');
    assert(
      String(timeoutRun.errorMessage || '').toLowerCase().includes('time'),
      'Timeout run did not expose the expected timeout message.'
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'api_children_create_demo',
            'api_upload_create',
            'api_upload_files',
            'api_run_done',
            'api_run_failed',
            'api_run_retry',
            'api_run_needs_review',
            'api_run_timeout',
            'report_route_demo',
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
