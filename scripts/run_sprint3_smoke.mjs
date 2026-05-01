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

const taxonomyCodeSet = new Set([
  'concept_gap',
  'procedure_gap',
  'calculation_slip',
  'reading_issue',
  'notation_error',
  'strategy_error',
  'careless_slip',
  'incomplete_reasoning',
]);

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
    page.drawText(`FamilyEducation Sprint 3 Fixture Page ${pageIndex + 1}`, {
      x: 64,
      y: 710,
      size: 24,
      font,
      color: rgb(0.12, 0.14, 0.18),
    });
    page.drawText('Structured extraction and taxonomy smoke coverage.', {
      x: 64,
      y: 676,
      size: 13,
      font,
      color: rgb(0.32, 0.35, 0.41),
    });
  }

  const bytes = await pdf.save();
  await writeFile(fixturePath, Buffer.from(bytes));
  return fixturePath;
}

function buildPageDrafts(qualityOverrides = {}) {
  return Array.from({ length: 5 }, (_, pageIndex) => ({
    pageNumber: pageIndex + 1,
    previewLabel: `PDF page ${pageIndex + 1}`,
    qualityFlags: {
      blurry: false,
      rotated: false,
      dark: false,
      lowContrast: false,
      ...(qualityOverrides[pageIndex + 1] || {}),
    },
  }));
}

async function createChild() {
  const nickname = `Maya-${Date.now()}`;
  const response = await fetch(`${env.BASE_URL}/api/children`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nickname,
      grade: '4th Grade',
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

  assert(payload?.id, 'Child creation response did not include an id.');
  return payload;
}

async function uploadFixturePdf(childId, fixturePath, notes, qualityOverrides = {}) {
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
        pages: buildPageDrafts(qualityOverrides),
      },
    ])
  );
  formData.append(
    'files',
    new File([bytes], 'sprint3-upload-fixture.pdf', {
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

  return {
    uploadId: uploadPayload.upload.id,
    runId: submitPayload.runId,
  };
}

async function processRun(runId, options = {}) {
  const response = await fetch(`${env.BASE_URL}/api/runs/${runId}/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(options),
  });
  const payload = await response.json();
  assert(response.status === 200, `Run process API did not return 200 for run ${runId}.`);
  return payload;
}

async function getReport(reportId) {
  const response = await fetch(`${env.BASE_URL}/api/reports/${reportId}`);
  const payload = await response.json();
  assert(response.status === 200, `Report API did not return 200 for report ${reportId}.`);
  return payload;
}

function assertCanonicalBundle(bundle) {
  assert(bundle && typeof bundle === 'object', 'Bundle payload is missing.');
  assert(Array.isArray(bundle.pages) && bundle.pages.length === 5, 'Bundle did not return 5 pages.');
  assert(
    Array.isArray(bundle.labeledItems) && bundle.labeledItems.length >= 5,
    'Bundle did not return labeled items.'
  );

  for (const page of bundle.pages) {
    assert(page.pageId > 0, 'Extraction page is missing pageId.');
    assert(page.pageNo >= 1 && page.pageNo <= 5, 'Extraction page has invalid pageNo.');
    assert(Array.isArray(page.items) && page.items.length >= 1, 'Extraction page is missing items.');
  }

  for (const item of bundle.labeledItems) {
    assert(item.evidenceAnchor?.pageId > 0, 'Item is missing evidenceAnchor.pageId.');
    assert(item.evidenceAnchor?.pageNo >= 1, 'Item is missing evidenceAnchor.pageNo.');
    assert(item.evidenceAnchor?.problemNo, 'Item is missing evidenceAnchor.problemNo.');
    assert(item.evidenceAnchor?.previewLabel, 'Item is missing evidenceAnchor.previewLabel.');
    assert(Array.isArray(item.labels) && item.labels.length >= 1, 'Item is missing labels.');
    for (const label of item.labels) {
      assert(taxonomyCodeSet.has(label.code), `Unexpected taxonomy code: ${label.code}`);
    }
  }
}

function assertNoDirectAnswer(content, label) {
  const serialized = JSON.stringify(content).toLowerCase();
  assert(!serialized.includes('answer is'), `${label} leaked a direct answer phrase.`);
  assert(!serialized.includes('final answer'), `${label} leaked a final answer phrase.`);
  assert(!serialized.includes('just write'), `${label} leaked direct completion language.`);
}

function assertReportShape(reportPayload, expectReviewBanner) {
  const parentReport = reportPayload.parentReportJson || {};
  assert(
    Array.isArray(parentReport.topFindings) &&
      parentReport.topFindings.length >= 1 &&
      parentReport.topFindings.length <= 3,
    'Parent report is missing top findings.'
  );
  assert(
    Array.isArray(parentReport.sevenDayPlan) && parentReport.sevenDayPlan.length === 7,
    'Parent report is missing the 7-day plan.'
  );
  assert(
    Array.isArray(parentReport.evidenceGroups) && parentReport.evidenceGroups.length >= 1,
    'Parent report is missing grouped evidence.'
  );
  for (const finding of parentReport.topFindings) {
    assert(
      Array.isArray(finding.evidence) && finding.evidence.length >= 2,
      'Each finding must include at least two evidence anchors.'
    );
  }
  if (expectReviewBanner) {
    assert(parentReport.reviewBanner, 'Low-confidence report is missing the draft review banner.');
  } else {
    assert(!parentReport.reviewBanner, 'Ready report unexpectedly shows a review banner.');
  }
  assertNoDirectAnswer(parentReport, 'Report payload');
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

    const normalRun = await uploadFixturePdf(child.id, fixturePath, 'normal sprint3 run');
    const normalProcessed = await processRun(normalRun.runId, { force: true });
    assert(normalProcessed.requestedEngine === 'openai', 'Normal processing did not record openai as requested engine.');
    assert(normalProcessed.run?.status === 'done', 'Normal run did not finish as done.');
    assertCanonicalBundle(normalProcessed.bundle);
    assertNoDirectAnswer(normalProcessed.bundle, 'Extraction bundle');
    const normalReport = await getReport(normalProcessed.reportId);
    assertReportShape(normalReport, false);

    const reviewRun = await uploadFixturePdf(child.id, fixturePath, 'quality confidence review', {
      1: { blurry: true, dark: true, lowContrast: true },
      2: { blurry: true, rotated: true, dark: true },
      3: { blurry: true, dark: true },
    });
    const reviewProcessed = await processRun(reviewRun.runId, { force: true });
    assert(reviewProcessed.run?.status === 'needs_review', 'Low-confidence run did not route to needs_review.');
    assert(reviewProcessed.bundle?.requiresReview === true, 'Bundle did not mark requiresReview.');
    assert(reviewProcessed.bundle?.reviewReason, 'Needs-review bundle is missing a review reason.');
    assert(
      typeof reviewProcessed.run?.overallConfidence === 'number' &&
        reviewProcessed.run.overallConfidence < 0.72,
      'Low-confidence run did not persist a sub-threshold overall confidence.'
    );
    const reviewReport = await getReport(reviewProcessed.reportId);
    assertReportShape(reviewReport, true);

    const mathpixRun = await uploadFixturePdf(child.id, fixturePath, 'mathpix route please');
    const mathpixProcessed = await processRun(mathpixRun.runId, {
      force: true,
      preferMathpix: true,
    });
    assert(mathpixProcessed.requestedEngine === 'mathpix', 'Mathpix fallback request was not recorded.');
    assertCanonicalBundle(mathpixProcessed.bundle);

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'api_ai_process_route',
            'ai_canonical_schema',
            'ai_evidence_anchor_integrity',
            'ai_taxonomy_allow_list',
            'ai_safe_no_direct_answers',
            'ai_confidence_needs_review_routing',
            'report_grouped_evidence_minimums',
            'mathpix_fallback_request_path',
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
