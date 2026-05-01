import 'server-only';

import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import {
  getFileStorageBackend,
  isFamilyEduDemoAutoAuth,
  isFamilyEduDemoMode,
  isRunningOnVercel,
} from '@/lib/family/config';
import {
  isUsingFallbackDatabaseUrl,
  isUsingLegacyPostgresUrl,
} from '@/lib/db/drizzle';

type RuntimeAuditSection = {
  area: string;
  entries: string[];
};

export type FamilyRuntimeAudit = {
  generatedAt: string;
  runtime: {
    mode: 'demo' | 'live';
    demoModeEnabled: boolean;
    demoAutoAuthEnabled: boolean;
    normalRuntimeExpected: boolean;
    runningOnVercel: boolean;
    storageBackend: 'local' | 'blob';
  };
  database: {
    source: 'database_url' | 'postgres_url' | 'legacy_local_fallback';
    usingDatabaseUrl: boolean;
    usingLegacyPostgresUrl: boolean;
    usingFallbackDatabaseUrl: boolean;
  };
  mockState: {
    exists: boolean;
    path: string;
    bytes: number | null;
    updatedAt: string | null;
    parentProfileEmail: string | null;
    childCount: number | null;
    runCount: number | null;
    reportCount: number | null;
  };
  vercel: {
    linked: boolean;
    projectId: string | null;
    orgId: string | null;
    projectName: string | null;
    previewSmokeStatus: 'pass' | 'fail' | null;
    productionSmokeStatus: 'pass' | 'fail' | null;
    previewLinkedRepoMatch: boolean | null;
    productionLinkedRepoMatch: boolean | null;
    previewBaseUrl: string | null;
    productionBaseUrl: string | null;
    issues: string[];
  };
  fallbackInventory: RuntimeAuditSection[];
};

const fallbackInventory: RuntimeAuditSection[] = [
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

function resolveDatabaseSource() {
  if (process.env.DATABASE_URL) {
    return 'database_url' as const;
  }

  if (process.env.POSTGRES_URL) {
    return 'postgres_url' as const;
  }

  return 'legacy_local_fallback' as const;
}

async function readJsonIfPresent<T>(absolutePath: string): Promise<T | null> {
  try {
    const payload = await readFile(absolutePath, 'utf8');
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

export async function getFamilyRuntimeAudit(): Promise<FamilyRuntimeAudit> {
  const cwd = process.cwd();
  const demoModeEnabled = isFamilyEduDemoMode();
  const demoAutoAuthEnabled = isFamilyEduDemoAutoAuth();
  const runtimeRoot = path.join(cwd, 'tasks', 'runtime', 'family_local_runtime');
  const mockStatePath = path.join(runtimeRoot, 'family_mock_state.json');
  const vercelProjectPath = path.join(cwd, '.vercel', 'project.json');
  const smokePath = path.join(
    cwd,
    'tasks',
    'runtime',
    'final_acceptance',
    'vercel_deployment_smoke.json'
  );

  let mockStateExists = false;
  let mockStateStats: Awaited<ReturnType<typeof stat>> | null = null;
  try {
    await access(mockStatePath);
    mockStateExists = true;
    mockStateStats = await stat(mockStatePath);
  } catch {
    mockStateExists = false;
  }

  const mockState = mockStateExists
    ? await readJsonIfPresent<{
        auth?: { parentProfile?: { email?: string | null } | null };
        children?: unknown[];
        runs?: unknown[];
        reports?: unknown[];
      }>(mockStatePath)
    : null;

  const project = await readJsonIfPresent<{
    projectId?: string;
    orgId?: string;
    projectName?: string;
  }>(vercelProjectPath);

  const smoke = await readJsonIfPresent<{
    issues?: string[];
    suites?: Array<{
      label?: string;
      status?: 'pass' | 'fail' | 'failed';
      linkedRepoMatch?: boolean;
      baseUrl?: string;
    }>;
  }>(smokePath);

  const previewSuite = smoke?.suites?.find((suite) => suite.label === 'preview') || null;
  const productionSuite = smoke?.suites?.find((suite) => suite.label === 'production') || null;

  return {
    generatedAt: new Date().toISOString(),
    runtime: {
      mode: demoModeEnabled ? 'demo' : 'live',
      demoModeEnabled,
      demoAutoAuthEnabled,
      normalRuntimeExpected: !demoModeEnabled,
      runningOnVercel: isRunningOnVercel(),
      storageBackend: getFileStorageBackend(),
    },
    database: {
      source: resolveDatabaseSource(),
      usingDatabaseUrl: Boolean(process.env.DATABASE_URL),
      usingLegacyPostgresUrl: isUsingLegacyPostgresUrl,
      usingFallbackDatabaseUrl: isUsingFallbackDatabaseUrl,
    },
    mockState: {
      exists: mockStateExists,
      path: mockStatePath,
      bytes: mockStateStats?.size ?? null,
      updatedAt: mockStateStats?.mtime.toISOString() ?? null,
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
      previewSmokeStatus:
        previewSuite?.status === 'failed' ? 'fail' : previewSuite?.status ?? null,
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
}
