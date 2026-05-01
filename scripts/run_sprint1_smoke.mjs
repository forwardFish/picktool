import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { SignJWT } from 'jose';
import postgres from 'postgres';

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
  NODE_ENV: process.env.NODE_ENV || 'production'
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
        stdio: 'ignore'
      });
      killer.on('exit', resolve);
      killer.on('error', resolve);
    });
    return;
  }

  server.kill('SIGTERM');
}

async function createSessionCookie(userId) {
  const token = await new SignJWT({
    user: { id: userId },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day')
    .sign(new TextEncoder().encode(env.AUTH_SECRET));

  return `session=${token}`;
}

async function seedDemoData() {
  const sql = postgres(env.POSTGRES_URL, { max: 1 });
  const suffix = Date.now().toString().slice(-6);
  const email = `parent-${suffix}@example.com`;

  const [user] = await sql`
    insert into users (
      name,
      email,
      password_hash,
      role,
      is_18plus_confirmed,
      country,
      timezone,
      locale
    )
    values (
      'Parent Tester',
      ${email},
      'not-used-for-smoke',
      'owner',
      true,
      'US',
      'America/Los_Angeles',
      'en-US'
    )
    returning id, email
  `;

  const [team] = await sql`
    insert into teams (name)
    values ('Parent Tester household')
    returning id
  `;

  await sql`
    insert into team_members (user_id, team_id, role)
    values (${user.id}, ${team.id}, 'owner')
  `;

  const [child] = await sql`
    insert into children (user_id, nickname, grade, curriculum)
    values (${user.id}, 'Maya', '4th Grade', 'Common Core')
    returning id, nickname
  `;

  await sql.end();
  return { user, child };
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

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'manual',
    ...options
  });
  const text = await response.text();
  return {
    status: response.status,
    location: response.headers.get('location'),
    text
  };
}

async function main() {
  let seeded = null;
  let sessionCookie = null;

  try {
    seeded = await seedDemoData();
    sessionCookie = await createSessionCookie(seeded.user.id);
  } catch (error) {
    console.warn(
      `Database-backed Sprint 1 seeding is unavailable, switching to demo-runtime authenticated checks: ${
        error.message || error
      }`
    );
    sessionCookie = await createSessionCookie(1);
  }

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

  try {
    await waitForServer(`${env.BASE_URL}/sign-in`);

    const landing = await fetchText(`${env.BASE_URL}/`);
    assert(landing.status === 200, 'Landing page did not return 200.');
    assert(
      landing.text.includes('Try a Diagnosis'),
      'Landing page is missing the primary CTA.'
    );

    const signup = await fetchText(`${env.BASE_URL}/sign-up`);
    assert(signup.status === 200, 'Sign-up page did not return 200.');
    for (const field of [
      'name="country"',
      'name="timezone"',
      'name="locale"',
      'name="is18PlusConfirmed"',
      'name="acceptTerms"'
    ]) {
      assert(signup.text.includes(field), `Sign-up page is missing ${field}.`);
    }

    const protectedRedirect = await fetchText(`${env.BASE_URL}/dashboard`);
    assert(
      protectedRedirect.status >= 300 && protectedRedirect.status < 400,
      'Unauthenticated dashboard request did not redirect.'
    );
    assert(
      protectedRedirect.location?.includes('/sign-in'),
      'Unauthenticated dashboard request did not redirect to /sign-in.'
    );

    const unauthenticatedChildrenApi = await fetch(`${env.BASE_URL}/api/children`, {
      redirect: 'manual'
    });
    assert(
      unauthenticatedChildrenApi.status === 401,
      'Unauthenticated children API should return 401.'
    );

    const passedChecks = [
      'landing_cta',
      'signup_fields',
      'dashboard_redirect',
      'children_api_unauthorized'
    ];

    if (sessionCookie) {
      if (!seeded) {
        const createDemoChildResponse = await fetch(`${env.BASE_URL}/api/children`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: sessionCookie,
          },
          body: JSON.stringify({
            nickname: 'Maya',
            grade: '4th Grade',
            curriculum: 'Common Core',
          }),
        });
        const createDemoChildPayload = await createDemoChildResponse.json();
        assert(
          createDemoChildResponse.status === 201,
          'Demo-mode child creation did not return 201.'
        );
        seeded = {
          user: {
            id: 1,
            email: 'demo-parent@familyeducation.local',
          },
          child: createDemoChildPayload,
        };
      }

      const dashboard = await fetchText(`${env.BASE_URL}/dashboard`, {
        headers: { cookie: sessionCookie }
      });
      assert(
        dashboard.status === 200,
        'Authenticated dashboard did not return 200.'
      );
      assert(
        dashboard.text.includes('Parent Dashboard'),
        'Authenticated dashboard is missing the parent overview copy.'
      );

      const childrenPage = await fetchText(`${env.BASE_URL}/dashboard/children`, {
        headers: { cookie: sessionCookie }
      });
      assert(childrenPage.status === 200, 'Children page did not return 200.');
      assert(
        childrenPage.text.includes('Maya'),
        'Children page is missing the seeded child profile.'
      );

      const childDetail = await fetchText(
        `${env.BASE_URL}/dashboard/children/${seeded.child.id}`,
        {
          headers: { cookie: sessionCookie }
        }
      );
      assert(
        childDetail.status === 200,
        'Child detail page did not return 200.'
      );
      assert(
        childDetail.text.includes('Edit Child Profile'),
        'Child detail page is missing the edit form shell.'
      );

      const childrenApiResponse = await fetch(`${env.BASE_URL}/api/children`, {
        headers: { cookie: sessionCookie },
        redirect: 'manual'
      });
      assert(
        childrenApiResponse.status === 200,
        'Children API did not return 200.'
      );
      const childrenApiJson = await childrenApiResponse.json();
      assert(
        Array.isArray(childrenApiJson) && childrenApiJson.length >= 1,
        'Children API did not return the seeded child list.'
      );

      passedChecks.push(
        'dashboard_authenticated',
        'children_page',
        'child_detail',
        'children_api_authenticated'
      );
    }

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          checks: passedChecks,
          blockedChecks: [],
          seededUserEmail: seeded?.user?.email || null
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
