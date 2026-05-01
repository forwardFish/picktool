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
  const fixturePath = path.join(fixturesDir, 'sprint4-upload-fixture.pdf');
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
    page.drawText(`FamilyEducation Sprint 4 Fixture Page ${pageIndex + 1}`, {
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

async function createChild() {
  const nickname = `Ava-${Date.now()}`;
  const response = await fetch(`${env.BASE_URL}/api/children`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nickname,
      grade: '5th Grade',
      curriculum: 'Common Core',
    }),
  });
  const payload = await response.json();
  assert(response.status === 201, 'Child creation API did not return 201.');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const listResponse = await fetch(`${env.BASE_URL}/api/children`);
    const listPayload = await listResponse.json();
    if (listResponse.status === 200 && Array.isArray(listPayload)) {
      const createdChild = listPayload.find((child) => child.nickname === nickname);
      if (createdChild?.id) {
        return createdChild;
      }
    }

    await delay(300);
  }

  return payload;
}

async function uploadFixturePdf(childId, fixturePath) {
  const bytes = await readFile(fixturePath);
  const formData = new FormData();
  formData.append('childId', String(childId));
  formData.append('sourceType', 'quiz');
  formData.append('notes', 'sprint4 report core');
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
    new File([bytes], 'sprint4-upload-fixture.pdf', {
      type: 'application/pdf',
    })
  );

  const uploadResponse = await fetch(`${env.BASE_URL}/api/uploads`, {
    method: 'POST',
    body: formData,
  });
  const uploadPayload = await uploadResponse.json();
  assert(
    uploadResponse.status === 201,
    `Upload creation API did not return 201. Status=${uploadResponse.status}. Body=${JSON.stringify(uploadPayload)}`
  );

  const submitResponse = await fetch(
    `${env.BASE_URL}/api/uploads/${uploadPayload.upload.id}/submit`,
    { method: 'POST' }
  );
  const submitPayload = await submitResponse.json();
  assert(submitResponse.status === 201, 'Upload submit API did not return 201.');
  return submitPayload.runId;
}

async function processRun(runId) {
  const response = await fetch(`${env.BASE_URL}/api/runs/${runId}/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ force: true }),
  });
  const payload = await response.json();
  assert(response.status === 200, 'Run process API did not return 200.');
  return payload;
}

async function getReport(reportId) {
  const response = await fetch(`${env.BASE_URL}/api/reports/${reportId}`);
  const payload = await response.json();
  assert(response.status === 200, 'Report API did not return 200.');
  return payload;
}

async function patchReport(reportId, completedDays) {
  const response = await fetch(`${env.BASE_URL}/api/reports/${reportId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ completedDays }),
  });
  const payload = await response.json();
  assert(response.status === 200, 'Report PATCH API did not return 200.');
  return payload;
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
    await delay(800);
    const runId = await uploadFixturePdf(child.id, fixturePath);
    const processed = await processRun(runId);

    assert(processed.run?.status === 'done', 'Processed run did not finish as done.');
    assert(processed.reportId, 'Processed run did not return a reportId.');

    const reportPayload = await getReport(processed.reportId);
    const parentReport = reportPayload.parentReportJson || {};
    const studentReport = reportPayload.studentReportJson || {};
    const tutorReport = reportPayload.tutorReportJson || {};

    assert(
      Array.isArray(parentReport.topFindings) &&
        parentReport.topFindings.length >= 1 &&
        parentReport.topFindings.length <= 3,
      'Parent report is missing top findings.'
    );
    assert(
      parentReport.topFindings.every((finding) => ['pattern', 'sporadic'].includes(finding.patternType)),
      'Diagnosis findings are missing pattern/sporadic labels.'
    );
    assert(parentReport.doThisWeek, 'Parent report is missing doThisWeek guidance.');
    assert(parentReport.notNow, 'Parent report is missing notNow guidance.');
    assert(
      Array.isArray(parentReport.evidenceGroups) && parentReport.evidenceGroups.length >= 1,
      'Parent report is missing evidence groups.'
    );
    assert(
      parentReport.topFindings.every((finding) => Array.isArray(finding.evidence) && finding.evidence.length >= 2),
      'Each top finding must have at least two evidence anchors.'
    );
    assert(
      Array.isArray(parentReport.sevenDayPlan) && parentReport.sevenDayPlan.length === 7,
      'Parent report is missing the full seven-day plan.'
    );
    assert(
      Array.isArray(studentReport.focusAreas) &&
        Array.isArray(tutorReport.evidenceGroups) &&
        studentReport.focusAreas[0] === parentReport.topFindings[0].title &&
        tutorReport.recommendedFocus === parentReport.topFindings[0].title,
      'Report variants are not aligned to the same facts layer.'
    );

    const firstEvidence = parentReport.evidenceGroups[0]?.items?.[0];
    assert(firstEvidence?.pageId, 'Evidence group is missing pageId.');
    const pageArtifactResponse = await fetch(
      `${env.BASE_URL}/api/pages/${firstEvidence.pageId}/artifact`
    );
    assert(pageArtifactResponse.status === 200, 'Page artifact route did not return 200.');
    assert(
      String(pageArtifactResponse.headers.get('content-type') || '').includes('pdf'),
      'Page artifact route did not serve the expected PDF content type.'
    );

    const patchedReport = await patchReport(processed.reportId, [1, 3]);
    assert(
      JSON.stringify(patchedReport.parentReportJson?.completedDays || []) === JSON.stringify([1, 3]),
      'Plan completion state did not persist through report PATCH.'
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'report_diagnosis_payload',
            'report_pattern_detection',
            'report_evidence_grouping',
            'report_page_artifact_route',
            'report_plan_patch_persistence',
            'report_variants_same_facts_layer',
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
