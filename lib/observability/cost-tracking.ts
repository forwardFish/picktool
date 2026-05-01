import 'server-only';

import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { runCostArtifacts } from '@/lib/db/schema';
import { getFamilyEduRuntimeRoot, isFamilyEduDemoMode } from '@/lib/family/config';
import { deleteFamilyArtifact, putFamilyArtifact } from '@/lib/family/storage';

export type RunCostArtifact = {
  id: string;
  runId: number;
  userId: number;
  engine: string;
  pageCount: number;
  labeledItemCount: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedUsd: number;
  status: 'done' | 'needs_review';
  createdAt: string;
  metadata: Record<string, unknown>;
};

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();
const runtimeRoot = path.join(getFamilyEduRuntimeRoot(), 'observability');
const costPath = path.join(runtimeRoot, 'cost_artifacts.json');
const runArtifactDir = path.join(runtimeRoot, 'run_artifacts');

function nowIso() {
  return new Date().toISOString();
}

async function ensureLegacyCostStore() {
  await mkdir(runtimeRoot, { recursive: true });
  await mkdir(runArtifactDir, { recursive: true });
  try {
    await readFile(costPath, 'utf8');
  } catch {
    await writeFile(costPath, JSON.stringify({ artifacts: [] }, null, 2), 'utf8');
  }
}

async function readLegacyCostStore(): Promise<{ artifacts: RunCostArtifact[] }> {
  await ensureLegacyCostStore();
  const raw = await readFile(costPath, 'utf8');
  const parsed = JSON.parse(raw) as { artifacts?: RunCostArtifact[] };
  return {
    artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
  };
}

async function writeLegacyCostStore(store: { artifacts: RunCostArtifact[] }) {
  await ensureLegacyCostStore();
  await writeFile(costPath, JSON.stringify(store, null, 2), 'utf8');
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function toRunCostArtifact(row: typeof runCostArtifacts.$inferSelect): RunCostArtifact {
  return {
    id: row.id,
    runId: row.runId,
    userId: row.userId,
    engine: row.engine as RunCostArtifact['engine'],
    pageCount: row.pageCount,
    labeledItemCount: row.labeledItemCount,
    estimatedInputTokens: row.estimatedInputTokens,
    estimatedOutputTokens: row.estimatedOutputTokens,
    estimatedUsd: row.estimatedUsd,
    status: row.status as RunCostArtifact['status'],
    createdAt: toIsoString(row.createdAt) || nowIso(),
    metadata: (row.metadata || {}) as Record<string, unknown>,
  };
}

export function estimateRunCost(input: {
  engine: string;
  pageCount: number;
  labeledItemCount: number;
}) {
  const estimatedInputTokens = input.pageCount * 1200;
  const estimatedOutputTokens = 450 + input.labeledItemCount * 160;
  const perThousandInput = input.engine === 'mathpix' ? 0.0025 : 0.006;
  const perThousandOutput = input.engine === 'mathpix' ? 0.001 : 0.003;
  const estimatedUsd = Number(
    (
      (estimatedInputTokens / 1000) * perThousandInput +
      (estimatedOutputTokens / 1000) * perThousandOutput
    ).toFixed(4)
  );

  return {
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedUsd,
  };
}

async function persistArtifactPayloadToStorage(artifact: RunCostArtifact) {
  const payload = Buffer.from(JSON.stringify(artifact, null, 2), 'utf8');
  const storedArtifact = await putFamilyArtifact({
    objectKey: `observability/run-artifacts/run_${artifact.runId}.json`,
    bytes: payload,
    contentType: 'application/json',
    cacheControlMaxAge: 60 * 5,
  });

  return storedArtifact.storagePath;
}

export async function recordRunCostArtifact(
  input: Omit<
    RunCostArtifact,
    'id' | 'createdAt' | 'estimatedInputTokens' | 'estimatedOutputTokens' | 'estimatedUsd'
  >
) {
  const estimates = estimateRunCost({
    engine: input.engine,
    pageCount: input.pageCount,
    labeledItemCount: input.labeledItemCount,
  });
  const artifact: RunCostArtifact = {
    id: `run_cost_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    createdAt: nowIso(),
    ...input,
    ...estimates,
  };

  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyCostStore();
    store.artifacts = store.artifacts.filter((item) => item.runId !== artifact.runId);
    store.artifacts.unshift(artifact);
    await writeLegacyCostStore(store);
    await writeFile(
      path.join(runArtifactDir, `run_${artifact.runId}.json`),
      JSON.stringify(artifact, null, 2),
      'utf8'
    );
    console.log(`[family.telemetry.cost] ${JSON.stringify(artifact)}`);
    return artifact;
  }

  const existingRows = await db
    .select()
    .from(runCostArtifacts)
    .where(eq(runCostArtifacts.runId, artifact.runId))
    .limit(1);
  const existing = existingRows[0] || null;

  if (existing?.artifactPath) {
    await deleteFamilyArtifact(existing.artifactPath);
  }

  const artifactPath = await persistArtifactPayloadToStorage(artifact);

  if (existing) {
    await db
      .update(runCostArtifacts)
      .set({
        id: artifact.id,
        userId: artifact.userId,
        engine: artifact.engine,
        pageCount: artifact.pageCount,
        labeledItemCount: artifact.labeledItemCount,
        estimatedInputTokens: artifact.estimatedInputTokens,
        estimatedOutputTokens: artifact.estimatedOutputTokens,
        estimatedUsd: artifact.estimatedUsd,
        status: artifact.status,
        artifactPath,
        metadata: artifact.metadata,
        createdAt: new Date(artifact.createdAt),
        updatedAt: new Date(),
      })
      .where(eq(runCostArtifacts.runId, artifact.runId));
  } else {
    await db.insert(runCostArtifacts).values({
      id: artifact.id,
      runId: artifact.runId,
      userId: artifact.userId,
      engine: artifact.engine,
      pageCount: artifact.pageCount,
      labeledItemCount: artifact.labeledItemCount,
      estimatedInputTokens: artifact.estimatedInputTokens,
      estimatedOutputTokens: artifact.estimatedOutputTokens,
      estimatedUsd: artifact.estimatedUsd,
      status: artifact.status,
      artifactPath,
      metadata: artifact.metadata,
      createdAt: new Date(artifact.createdAt),
      updatedAt: new Date(),
    });
  }

  console.log(`[family.telemetry.cost] ${JSON.stringify(artifact)}`);
  return artifact;
}

export async function getCostArtifactPaths() {
  if (FAMILY_EDU_DEMO_MODE) {
    await ensureLegacyCostStore();
    return {
      runtimeRoot,
      costPath,
      runArtifactDir,
    };
  }

  return {
    runtimeRoot: 'vercel://neon/observability',
    costPath: 'vercel://neon/run_cost_artifacts',
    runArtifactDir: 'vercel://blob/observability/run-artifacts',
  };
}

export async function removeRunCostArtifacts(runIds: number[]) {
  if (runIds.length === 0) {
    return 0;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyCostStore();
    const before = store.artifacts.length;
    store.artifacts = store.artifacts.filter((artifact) => !runIds.includes(artifact.runId));
    await writeLegacyCostStore(store);

    for (const runId of runIds) {
      try {
        await unlink(path.join(runArtifactDir, `run_${runId}.json`));
      } catch {}
    }

    return before - store.artifacts.length;
  }

  const rows = await db
    .select({
      id: runCostArtifacts.id,
      artifactPath: runCostArtifacts.artifactPath,
    })
    .from(runCostArtifacts)
    .where(inArray(runCostArtifacts.runId, runIds));

  if (rows.length === 0) {
    return 0;
  }

  for (const row of rows) {
    if (row.artifactPath) {
      await deleteFamilyArtifact(row.artifactPath);
    }
  }

  await db.delete(runCostArtifacts).where(inArray(runCostArtifacts.id, rows.map((row) => row.id)));
  return rows.length;
}
