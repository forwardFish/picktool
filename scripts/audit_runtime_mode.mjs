import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

function isDemoMode() {
  return process.env.FAMILY_EDU_DEMO_MODE === '1';
}

function isDemoAutoAuth() {
  return isDemoMode() && process.env.FAMILY_EDU_DEMO_AUTO_AUTH === '1';
}

function isRunningOnVercel() {
  return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
}

function getStorageBackend() {
  if (process.env.FILE_STORAGE_BACKEND === 'blob') {
    return 'blob';
  }
  if (isRunningOnVercel()) {
    return 'blob';
  }
  return 'local';
}

function getDatabaseSource() {
  if (process.env.DATABASE_URL) {
    return 'database_url';
  }
  if (process.env.POSTGRES_URL) {
    return 'postgres_url';
  }
  return 'legacy_local_fallback';
}

const fallbackInventory = [
  {
    area: 'Auth and session injection',
    entries: [
      'lib/db/queries.ts',
      'app/(login)/actions.ts',
      'app/api/auth/google/callback/route.ts',
      'lib/family/demo-auth.ts',
    ],
  },
  {
    area: 'Dashboard / upload / run / report main chain',
    entries: [
      'lib/family/repository.ts',
      'app/(dashboard)/dashboard/children/actions.ts',
    ],
  },
  {
    area: 'Billing unlock and paywall',
    entries: ['lib/family/billing.ts'],
  },
  {
    area: 'Deck / walkthrough / export / share-deck',
    entries: ['lib/family/decks.ts'],
  },
  {
    area: 'Admin review',
    entries: ['lib/family/admin-review.ts'],
  },
  {
    area: 'AI extraction fallbacks',
    entries: ['lib/ai/openai-vision.ts', 'lib/ai/mathpix.ts'],
  },
  {
    area: 'Mock runtime persistence',
    entries: ['lib/family/mock-store.ts', 'tasks/runtime/family_local_runtime/family_mock_state.json'],
  },
];

async function readJsonIfPresent(absolutePath) {
  try {
    const payload = await readFile(absolutePath, 'utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

async function main() {
  const cwd = process.cwd();
  const mockStatePath = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime', 'family_mock_state.json');
  const smokePath = path.join(cwd, 'tasks', 'runtime', 'final_acceptance', 'vercel_deployment_smoke.json');
  const projectPath = path.join(cwd, '.vercel', 'project.json');
  const outputDir = path.join(cwd, 'tasks', 'runtime', 'final_acceptance');
  const outputPath = path.join(outputDir, 'runtime_mode_audit.json');

  let mockStateExists = false;
  let mockStats = null;
  try {
    await access(mockStatePath);
    mockStateExists = true;
    mockStats = await stat(mockStatePath);
  } catch {
    mockStateExists = false;
  }

  const [mockState, smoke, project] = await Promise.all([
    mockStateExists ? readJsonIfPresent(mockStatePath) : Promise.resolve(null),
    readJsonIfPresent(smokePath),
    readJsonIfPresent(projectPath),
  ]);

  const previewSuite = smoke?.suites?.find((suite) => suite.label === 'preview') || null;
  const productionSuite = smoke?.suites?.find((suite) => suite.label === 'production') || null;

  const audit = {
    generatedAt: new Date().toISOString(),
    runtime: {
      mode: isDemoMode() ? 'demo' : 'live',
      demoModeEnabled: isDemoMode(),
      demoAutoAuthEnabled: isDemoAutoAuth(),
      normalRuntimeExpected: !isDemoMode(),
      runningOnVercel: isRunningOnVercel(),
      storageBackend: getStorageBackend(),
    },
    database: {
      source: getDatabaseSource(),
      usingDatabaseUrl: Boolean(process.env.DATABASE_URL),
      usingLegacyPostgresUrl: Boolean(process.env.POSTGRES_URL) && !process.env.DATABASE_URL,
      usingFallbackDatabaseUrl: !process.env.DATABASE_URL && !process.env.POSTGRES_URL,
    },
    mockState: {
      exists: mockStateExists,
      path: mockStatePath,
      bytes: mockStats?.size ?? null,
      updatedAt: mockStats?.mtime?.toISOString?.() ?? null,
      parentProfileEmail: mockState?.auth?.parentProfile?.email ?? null,
      childCount: Array.isArray(mockState?.children) ? mockState.children.length : null,
      runCount: Array.isArray(mockState?.runs) ? mockState.runs.length : null,
      reportCount: Array.isArray(mockState?.reports) ? mockState.reports.length : null,
    },
    vercel: {
      linked: Boolean(project?.projectId && project?.orgId),
      projectId: project?.projectId ?? null,
      orgId: project?.orgId ?? null,
      projectName: project?.projectName ?? null,
      previewSmokeStatus: previewSuite?.status === 'failed' ? 'fail' : previewSuite?.status ?? null,
      productionSmokeStatus:
        productionSuite?.status === 'failed' ? 'fail' : productionSuite?.status ?? null,
      previewLinkedRepoMatch: previewSuite?.linkedRepoMatch ?? null,
      productionLinkedRepoMatch: productionSuite?.linkedRepoMatch ?? null,
      previewBaseUrl: previewSuite?.baseUrl ?? null,
      productionBaseUrl: productionSuite?.baseUrl ?? null,
      issues: smoke?.issues || [],
    },
    fallbackInventory,
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(audit, null, 2), 'utf8');

  console.log(`[runtime-audit] mode=${audit.runtime.mode}`);
  console.log(
    `[runtime-audit] database=${audit.database.source} storage=${audit.runtime.storageBackend}`
  );
  console.log(
    `[runtime-audit] mockState.exists=${audit.mockState.exists} previewRepoMatch=${String(
      audit.vercel.previewLinkedRepoMatch
    )} productionRepoMatch=${String(audit.vercel.productionLinkedRepoMatch)}`
  );
  console.log(`[runtime-audit] wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
