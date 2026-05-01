import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright-core';

const cwd = process.cwd();
const env = {
  ...process.env,
  POSTGRES_URL:
    process.env.POSTGRES_URL ||
    'postgres://postgres:postgres@127.0.0.1:54322/postgres',
  AUTH_SECRET:
    process.env.AUTH_SECRET || 'family-education-dev-auth-secret',
  BASE_URL: process.env.BASE_URL || 'http://127.0.0.1:3000',
  FAMILY_EDU_DEMO_MODE: process.env.FAMILY_EDU_DEMO_MODE || '1',
  FAMILY_EDU_DEMO_AUTO_AUTH: process.env.FAMILY_EDU_DEMO_AUTO_AUTH || '0',
  NODE_ENV: 'production'
};

const edgePathX86 =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edgePathX64 =
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';

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
        stdio: 'ignore'
      });
      killer.on('exit', resolve);
      killer.on('error', resolve);
    });
    return;
  }

  server.kill('SIGTERM');
}

function getBrowserExecutable() {
  if (process.platform !== 'win32') {
    return undefined;
  }
  if (existsSync(edgePathX86)) {
    return edgePathX86;
  }
  if (existsSync(edgePathX64)) {
    return edgePathX64;
  }
  return undefined;
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

async function resetDemoState() {
  const runtimeDir = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime');
  const statePath = path.join(runtimeDir, 'family_mock_state.json');
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
            billingEvent: 1
          }
        },
        auth: {
          parentProfile: null
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
        activityLogs: []
      },
      null,
      2
    )
  );
}

async function main() {
  await resetDemoState();
  const server =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/c', 'pnpm start'], {
          cwd,
          env,
          stdio: 'pipe'
        })
      : spawn('pnpm', ['start'], {
          cwd,
          env,
          stdio: 'pipe'
        });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  let browser;

  try {
    await waitForServer(`${env.BASE_URL}/sign-in`);

    browser = await chromium.launch({
      executablePath: getBrowserExecutable(),
      headless: true
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);

    await page.goto(`${env.BASE_URL}/`, { waitUntil: 'load' });
    const landingText = (await page.textContent('body')) || '';
    assert(
      landingText.includes('Try a Diagnosis') &&
        landingText.includes('See Pricing'),
      'Landing page is missing expected CTA copy.'
    );

    await page.goto(`${env.BASE_URL}/pricing`, { waitUntil: 'load' });
    const pricingText = (await page.textContent('body')) || '';
    assert(
      pricingText.includes('One-Time Diagnosis') &&
        pricingText.includes('Parent Weekly') &&
        pricingText.includes('Parent Annual'),
      'Pricing page is missing expected plan copy.'
    );

    await page.goto(`${env.BASE_URL}/sign-up`, { waitUntil: 'load' });
    await page.waitForSelector('form[action]');
    await page.waitForSelector('select[name="country"]');
    await page.waitForSelector('input[name="is18PlusConfirmed"]');
    await page.waitForSelector('input[name="acceptTerms"]');
    await page.fill('input[name="email"]', 'missing-18@example.com');
    await page.fill('input[name="password"]', 'ParentPass123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=You must confirm that you are 18 or older.');

    await page.goto(`${env.BASE_URL}/sign-up`, { waitUntil: 'load' });
    await page.fill('input[name="email"]', 'weak-password@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.selectOption('select[name="country"]', 'US');
    await page.check('input[name="is18PlusConfirmed"]');
    await page.check('input[name="acceptTerms"]');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Password must contain at least one letter and one number.');

    const signedUpEmail = `parent-${Date.now()}@example.com`;
    const signedUpPassword = 'ParentPass123';

    await page.goto(`${env.BASE_URL}/sign-up`, { waitUntil: 'load' });
    await page.fill('input[name="name"]', 'Casey Parent');
    await page.fill('input[name="email"]', signedUpEmail);
    await page.fill('input[name="password"]', signedUpPassword);
    await page.selectOption('select[name="country"]', 'US');
    await page.check('input[name="is18PlusConfirmed"]');
    await page.check('input[name="acceptTerms"]');
    await Promise.all([
      page.waitForURL(/\/dashboard$/),
      page.click('button[type="submit"]')
    ]);
    const dashboardText = (await page.textContent('body')) || '';
    assert(
      dashboardText.includes('Welcome back, Casey Parent.'),
      'Successful sign-up did not land on the dashboard with the saved account name.'
    );

    await page.goto(`${env.BASE_URL}/dashboard/general`, { waitUntil: 'load' });
    await page.waitForFunction(
      (expectedEmail) => {
        const input = document.querySelector('input[name="email"]');
        return Boolean(input) && input.value === expectedEmail;
      },
      signedUpEmail
    );
    assert(
      (await page.inputValue('input[name="email"]')) === signedUpEmail,
      'Saved email did not persist to the parent account page.'
    );
    assert(
      (await page.inputValue('input[name="name"]')) === 'Casey Parent',
      'Saved account name did not persist to the account page.'
    );
    assert(
      (await page.locator('select[name="timezone"]').inputValue()) === 'America/New_York',
      'Default timezone did not persist to the account page.'
    );
    assert(
      (await page.locator('select[name="locale"]').inputValue()) === 'en-US',
      'Default language did not persist to the account page.'
    );

    await page.goto(`${env.BASE_URL}/dashboard/children/new`, { waitUntil: 'load' });
    await page.fill('input[name="nickname"]', 'Maya');
    await page.selectOption('select[name="grade"]', '4th Grade');
    await page.selectOption('select[name="curriculum"]', 'Common Core');
    await Promise.all([
      page.waitForURL(/\/dashboard\/children\/\d+$/),
      page.click('button:has-text("Create Child Profile")')
    ]);
    assert(
      ((await page.textContent('body')) || '').includes('Edit Child Profile'),
      'Child create flow did not open the child detail shell.'
    );
    await page.fill('input[name="nickname"]', 'Maya Updated');
    await page.selectOption('select[name="grade"]', '5th Grade');
    await Promise.all([
      page.waitForSelector('text=Child profile updated successfully.'),
      page.click('button:has-text("Save Child Profile")')
    ]);

    await page.context().clearCookies();

    await page.goto(`${env.BASE_URL}/dashboard`, { waitUntil: 'load' });
    assert(
      page.url().includes('/sign-in'),
      'Unauthenticated dashboard navigation did not redirect to sign-in.'
    );
    assert(
      page.url().includes('redirect=%2Fdashboard') || page.url().includes('redirect=/dashboard'),
      'Protected-route redirect did not preserve the original destination.'
    );

    const signInText = (await page.textContent('body')) || '';
    assert(
      signInText.includes('Need help recovering your password?'),
      'Sign-in page is missing the password recovery entry.'
    );

    await page.fill('input[name="email"]', signedUpEmail);
    await page.fill('input[name="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Invalid email or password. Please try again.');

    await page.goto(
      `${env.BASE_URL}/sign-in?redirect=${encodeURIComponent('/dashboard/children')}`,
      { waitUntil: 'load' }
    );
    await page.fill('input[name="email"]', signedUpEmail);
    await page.fill('input[name="password"]', signedUpPassword);
    await Promise.all([
      page.waitForURL(/\/dashboard\/children$/),
      page.click('button[type="submit"]')
    ]);
    assert(
      ((await page.textContent('body')) || '').includes('Maya Updated'),
      'Successful sign-in did not return to the original protected route.'
    );

    const apiResponse = await fetch(`${env.BASE_URL}/api/children`, {
      redirect: 'manual'
    });
    assert(
      apiResponse.status === 401,
      'Unauthenticated children API should return 401.'
    );

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: [
            'landing_cta_browser',
            'pricing_browser',
            'signup_fields_browser',
            'signup_validation_18_plus',
            'signup_validation_password_strength',
            'signup_success_redirect_dashboard',
            'account_defaults_persistence',
            'child_create_browser',
            'child_edit_browser',
            'dashboard_redirect_browser',
            'sign_in_recovery_entry',
            'sign_in_wrong_password',
            'sign_in_redirect_back_to_original_route',
            'children_api_unauthorized'
          ]
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
    await delay(500);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
