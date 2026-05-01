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

async function readJson(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
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
  const fixturePath = path.join(fixturesDir, 'sprint5-upload-fixture.pdf');
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
    page.drawText(`FamilyEducation Sprint 5 Fixture Page ${pageIndex + 1}`, {
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

async function resetDemoState() {
  const runtimeDir = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime');
  const statePath = path.join(runtimeDir, 'family_mock_state.json');
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

async function createChild() {
  const nickname = `Noah-${Date.now()}`;
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

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const listResponse = await fetch(`${env.BASE_URL}/api/children`);
    const listPayload = await readJson(listResponse, 'List children');
    if (listResponse.status === 200 && Array.isArray(listPayload)) {
      const createdChild = listPayload.find((child) => child.nickname === nickname);
      if (createdChild?.id) {
        return createdChild;
      }
    }
    await delay(500);
  }

  if (payload?.id) {
    return payload;
  }

  throw new Error(
    `Created child was not visible in the children list after polling. Payload=${JSON.stringify(payload)}`
  );
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
    new File([bytes], 'sprint5-upload-fixture.pdf', {
      type: 'application/pdf',
    })
  );

  const uploadResponse = await fetch(`${env.BASE_URL}/api/uploads`, {
    method: 'POST',
    body: formData,
  });
  const uploadPayload = await readJson(uploadResponse, 'Create upload');
  assert(
    uploadResponse.status === 201,
    `Upload creation API did not return 201. Status=${uploadResponse.status}. Body=${JSON.stringify(uploadPayload)}`
  );

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

function getSessionIdFromUrl(url) {
  const parsed = new URL(url);
  return parsed.searchParams.get('session_id');
}

async function createCheckoutSession(priceId) {
  const response = await fetch(`${env.BASE_URL}/api/billing/checkout-session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });
  const payload = await readJson(response, 'Create checkout session');
  assert(response.status === 200, 'Checkout session API did not return 200.');
  assert(payload.checkoutUrl, 'Checkout session response did not include checkoutUrl.');
  return payload;
}

async function completeDemoCheckout(priceId, sessionId) {
  const response = await fetch(
    `${env.BASE_URL}/api/creem/checkout?checkout_id=${encodeURIComponent(sessionId)}&priceId=${encodeURIComponent(priceId)}`,
    { redirect: 'manual' }
  );
  assert(
    response.status >= 300 && response.status < 400,
    `Checkout completion did not redirect. Status=${response.status}`
  );
  const location = response.headers.get('location') || '';
  assert(
    location.includes('/dashboard/billing?checkout=success'),
    `Checkout completion did not redirect to billing success. Location=${location}`
  );
}

async function assertReportStatus(reportId, expectedStatus) {
  const response = await fetch(`${env.BASE_URL}/api/reports/${reportId}`);
  if (expectedStatus === 'locked') {
    const payload = await readJson(response, 'Locked report');
    assert(response.status === 402, 'Locked report API did not return 402.');
    assert(
      payload.paywall?.billingUrl === '/dashboard/billing',
      'Locked report payload did not include billing paywall metadata.'
    );
    return;
  }

  const payload = await readJson(response, 'Unlocked report');
  assert(response.status === 200, 'Unlocked report API did not return 200.');
  assert(payload.parentReportJson?.summary, 'Unlocked report payload is missing parent summary.');
}

async function assertBillingCancelMessage() {
  const response = await fetch(`${env.BASE_URL}/dashboard/billing?checkout=cancelled`);
  const html = await response.text();
  assert(response.status === 200, 'Billing cancel page did not return 200.');
  assert(
    html.includes('Checkout was canceled.'),
    'Billing cancel return is missing the canceled checkout message.'
  );
}

async function assertWebhookIdempotency(userId) {
  const event = {
    id: `evt_demo_monthly_${Date.now()}`,
    eventType: 'subscription.paid',
    object: {
      userId,
      priceId: 'price_fe_monthly',
      stripeSubscriptionId: 'sub_demo_monthly',
      stripeCustomerId: 'cus_demo_monthly',
      status: 'active',
      currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };

  const firstResponse = await fetch(`${env.BASE_URL}/api/creem/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(event),
  });
  const firstPayload = await readJson(firstResponse, 'First webhook replay');
  assert(firstResponse.status === 200, 'First demo webhook did not return 200.');
  assert(firstPayload.applied === true, 'First demo webhook was not applied.');

  const secondResponse = await fetch(`${env.BASE_URL}/api/creem/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(event),
  });
  const secondPayload = await readJson(secondResponse, 'Second webhook replay');
  assert(secondResponse.status === 200, 'Second demo webhook did not return 200.');
  assert(secondPayload.applied === false, 'Second demo webhook should have been idempotent.');
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
    await waitForServer(`${env.BASE_URL}/dashboard`);
    const child = await createChild();
    await delay(1500);

    const firstReport = await uploadAndProcess(child.id, fixturePath, 'first report baseline');
    await assertReportStatus(firstReport.reportId, 'locked');

    const oneTimeCheckout = await createCheckoutSession('price_fe_one_time');
    const oneTimeSessionId = getSessionIdFromUrl(oneTimeCheckout.checkoutUrl);
    assert(oneTimeSessionId, 'One-time checkout URL did not include a session_id.');
    await completeDemoCheckout('price_fe_one_time', oneTimeSessionId);
    await assertReportStatus(firstReport.reportId, 'unlocked');

    const secondReport = await uploadAndProcess(child.id, fixturePath, 'second report compare');
    await assertReportStatus(secondReport.reportId, 'locked');

    await assertBillingCancelMessage();

    const monthlyCheckout = await createCheckoutSession('price_fe_monthly');
    const monthlySessionId = getSessionIdFromUrl(monthlyCheckout.checkoutUrl);
    assert(monthlySessionId, 'Monthly checkout URL did not include a session_id.');
    await completeDemoCheckout('price_fe_monthly', monthlySessionId);
    await assertReportStatus(secondReport.reportId, 'unlocked');

    await assertWebhookIdempotency(child.userId);

    const noteResponse = await fetch(`${env.BASE_URL}/api/reports/${secondReport.reportId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parentNote: 'This week felt steadier after slowing down.' }),
    });
    const notePayload = await readJson(noteResponse, 'Patch parent note');
    assert(noteResponse.status === 200, 'Parent note PATCH did not return 200.');
    assert(
      notePayload.parentReportJson?.parentNote === 'This week felt steadier after slowing down.',
      'Parent note did not persist.'
    );

    const createShareResponse = await fetch(
      `${env.BASE_URL}/api/reports/${secondReport.reportId}/share`,
      { method: 'POST' }
    );
    const sharePayload = await readJson(createShareResponse, 'Create share link');
    assert(createShareResponse.status === 201, 'Create share link API did not return 201.');
    assert(sharePayload.token, 'Share link response did not include a token.');

    const sharedApiResponse = await fetch(`${env.BASE_URL}/api/share/${sharePayload.token}`);
    const sharedApiPayload = await readJson(sharedApiResponse, 'Read shared report');
    assert(sharedApiResponse.status === 200, 'Shared report API did not return 200.');
    assert(
      sharedApiPayload.report?.tutorReportJson?.recommendedFocus,
      'Shared tutor report is missing recommended focus.'
    );
    assert(
      !JSON.stringify(sharedApiPayload).includes('parentNote'),
      'Shared tutor payload leaked the parent note.'
    );

    const sharedPageResponse = await fetch(`${env.BASE_URL}/share/${sharePayload.token}`);
    const sharedPageHtml = await sharedPageResponse.text();
    assert(sharedPageResponse.status === 200, 'Shared report page did not return 200.');
    assert(
      sharedPageHtml.includes('read-only') || sharedPageHtml.includes('Tutor Share'),
      'Shared report page is missing the read-only tutor shell.'
    );

    const revokeResponse = await fetch(
      `${env.BASE_URL}/api/reports/${secondReport.reportId}/share?token=${sharePayload.token}`,
      { method: 'DELETE' }
    );
    assert(revokeResponse.status === 200, 'Revoke share link API did not return 200.');

    const revokedApiResponse = await fetch(`${env.BASE_URL}/api/share/${sharePayload.token}`);
    assert(revokedApiResponse.status === 410, 'Revoked share link did not return 410.');

    const childHistoryResponse = await fetch(`${env.BASE_URL}/dashboard/children/${child.id}`);
    const childHistoryHtml = await childHistoryResponse.text();
    assert(childHistoryResponse.status === 200, 'Child detail page did not return 200.');
    assert(
      childHistoryHtml.includes('Weekly Review Timeline') &&
        childHistoryHtml.includes('This week felt steadier after slowing down.'),
      'Child history page is missing the weekly review timeline or persisted note.'
    );
    assert(
      childHistoryHtml.includes('Focus shifted') ||
        childHistoryHtml.includes('Improving:') ||
        childHistoryHtml.includes('Steady pattern:') ||
        childHistoryHtml.includes('First report for this child.'),
      'Child history page is missing the compare-to-last summary.'
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'billing_one_time_checkout',
            'billing_monthly_checkout',
            'billing_paywall_lock',
            'billing_checkout_cancel_return',
            'billing_unlock_after_payment',
            'billing_webhook_idempotency',
            'share_link_create',
            'share_read_only_api',
            'share_read_only_page',
            'share_revoke',
            'history_timeline_render',
            'weekly_compare_summary',
            'parent_note_persistence',
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
