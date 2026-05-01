import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { analysisRunModels, modelCallFailovers } from '@/lib/db/schema';
import { getFamilyEduRuntimeRoot, isFamilyEduDemoMode } from '@/lib/family/config';
import type { ModelProviderName, ModelTaskType, ModelUsage } from '@/lib/ai/providers/base';

export type AnalysisRunModelRecord = {
  id: string;
  runId: number;
  providerConfigId: number | null;
  taskType: ModelTaskType;
  attemptIndex: number;
  providerName: ModelProviderName;
  modelName: string;
  status: 'success' | 'failed' | 'skipped';
  finishReason: string | null;
  latencyMs: number | null;
  usage?: ModelUsage;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ModelCallFailoverRecord = {
  id: string;
  runId: number;
  taskType: ModelTaskType;
  fromRunModelId: string | null;
  fromProviderName: ModelProviderName;
  fromModelName: string;
  toProviderName: ModelProviderName;
  toModelName: string;
  errorType: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

const runtimeRoot = path.join(getFamilyEduRuntimeRoot(), 'observability');
const runModelsPath = path.join(runtimeRoot, 'analysis_run_models.json');
const failoversPath = path.join(runtimeRoot, 'model_call_failovers.json');

function nowIso() {
  return new Date().toISOString();
}

async function ensureStore(filePath: string) {
  await mkdir(runtimeRoot, { recursive: true });
  try {
    await readFile(filePath, 'utf8');
  } catch {
    await writeFile(filePath, JSON.stringify({ records: [] }, null, 2), 'utf8');
  }
}

async function readStore<T>(filePath: string): Promise<{ records: T[] }> {
  await ensureStore(filePath);
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as { records?: T[] };
  return {
    records: Array.isArray(parsed.records) ? parsed.records : [],
  };
}

async function writeStore<T>(filePath: string, store: { records: T[] }) {
  await ensureStore(filePath);
  await writeFile(filePath, JSON.stringify(store, null, 2), 'utf8');
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

function toAnalysisRunModelRecord(
  row: typeof analysisRunModels.$inferSelect
): AnalysisRunModelRecord {
  return {
    id: row.id,
    runId: row.runId,
    providerConfigId: row.providerConfigId,
    taskType: row.taskType as ModelTaskType,
    attemptIndex: row.attemptIndex,
    providerName: row.providerName as ModelProviderName,
    modelName: row.modelName,
    status: row.status as AnalysisRunModelRecord['status'],
    finishReason: row.finishReason,
    latencyMs: row.latencyMs,
    usage: {
      inputTokens: row.inputTokens ?? undefined,
      outputTokens: row.outputTokens ?? undefined,
      reasoningTokens: row.reasoningTokens ?? undefined,
      totalTokens: row.totalTokens ?? undefined,
    },
    metadata: (row.metadata || {}) as Record<string, unknown>,
    createdAt: toIsoString(row.createdAt) || nowIso(),
  };
}

export async function recordAnalysisRunModel(
  input: Omit<AnalysisRunModelRecord, 'id' | 'createdAt'>
) {
  const record: AnalysisRunModelRecord = {
    id: `run_model_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    createdAt: nowIso(),
    ...input,
  };

  if (isFamilyEduDemoMode()) {
    const store = await readStore<AnalysisRunModelRecord>(runModelsPath);
    store.records.unshift(record);
    await writeStore(runModelsPath, store);
    return record;
  }

  await db.insert(analysisRunModels).values({
    id: record.id,
    runId: record.runId,
    providerConfigId: record.providerConfigId,
    taskType: record.taskType,
    attemptIndex: record.attemptIndex,
    providerName: record.providerName,
    modelName: record.modelName,
    status: record.status,
    finishReason: record.finishReason,
    latencyMs: record.latencyMs,
    inputTokens: record.usage?.inputTokens,
    outputTokens: record.usage?.outputTokens,
    reasoningTokens: record.usage?.reasoningTokens,
    totalTokens: record.usage?.totalTokens,
    metadata: record.metadata,
    createdAt: new Date(record.createdAt),
  });

  return record;
}

export async function recordModelCallFailover(
  input: Omit<ModelCallFailoverRecord, 'id' | 'createdAt'>
) {
  const record: ModelCallFailoverRecord = {
    id: `run_failover_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    createdAt: nowIso(),
    ...input,
  };

  if (isFamilyEduDemoMode()) {
    const store = await readStore<ModelCallFailoverRecord>(failoversPath);
    store.records.unshift(record);
    await writeStore(failoversPath, store);
    return record;
  }

  await db.insert(modelCallFailovers).values({
    id: record.id,
    runId: record.runId,
    taskType: record.taskType,
    fromRunModelId: record.fromRunModelId,
    fromProviderName: record.fromProviderName,
    fromModelName: record.fromModelName,
    toProviderName: record.toProviderName,
    toModelName: record.toModelName,
    errorType: record.errorType,
    errorMessage: record.errorMessage,
    metadata: record.metadata,
    createdAt: new Date(record.createdAt),
  });

  return record;
}

export async function getAnalysisRunModelRecords(runId: number) {
  if (isFamilyEduDemoMode()) {
    const store = await readStore<AnalysisRunModelRecord>(runModelsPath);
    return store.records.filter((record) => record.runId === runId);
  }

  const rows = await db
    .select()
    .from(analysisRunModels)
    .where(eq(analysisRunModels.runId, runId))
    .orderBy(desc(analysisRunModels.createdAt));
  return rows.map(toAnalysisRunModelRecord);
}

export async function getModelCallFailoverRecords(runId: number) {
  if (isFamilyEduDemoMode()) {
    const store = await readStore<ModelCallFailoverRecord>(failoversPath);
    return store.records.filter((record) => record.runId === runId);
  }

  return db
    .select()
    .from(modelCallFailovers)
    .where(eq(modelCallFailovers.runId, runId))
    .orderBy(desc(modelCallFailovers.createdAt));
}

export async function removeModelRuntimeArtifacts(runIds: number[]) {
  if (runIds.length === 0) {
    return {
      runModelsRemoved: 0,
      failoversRemoved: 0,
    };
  }

  if (isFamilyEduDemoMode()) {
    const [runModelsStore, failoversStore] = await Promise.all([
      readStore<AnalysisRunModelRecord>(runModelsPath),
      readStore<ModelCallFailoverRecord>(failoversPath),
    ]);
    const runModelsBefore = runModelsStore.records.length;
    const failoversBefore = failoversStore.records.length;
    runModelsStore.records = runModelsStore.records.filter(
      (record) => !runIds.includes(record.runId)
    );
    failoversStore.records = failoversStore.records.filter(
      (record) => !runIds.includes(record.runId)
    );
    await Promise.all([
      writeStore(runModelsPath, runModelsStore),
      writeStore(failoversPath, failoversStore),
    ]);
    return {
      runModelsRemoved: runModelsBefore - runModelsStore.records.length,
      failoversRemoved: failoversBefore - failoversStore.records.length,
    };
  }

  const [runModelRows, failoverRows] = await Promise.all([
    db
      .select({ id: analysisRunModels.id })
      .from(analysisRunModels)
      .where(inArray(analysisRunModels.runId, runIds)),
    db
      .select({ id: modelCallFailovers.id })
      .from(modelCallFailovers)
      .where(inArray(modelCallFailovers.runId, runIds)),
  ]);

  if (runModelRows.length > 0) {
    await db
      .delete(analysisRunModels)
      .where(inArray(analysisRunModels.id, runModelRows.map((row) => row.id)));
  }
  if (failoverRows.length > 0) {
    await db
      .delete(modelCallFailovers)
      .where(inArray(modelCallFailovers.id, failoverRows.map((row) => row.id)));
  }

  return {
    runModelsRemoved: runModelRows.length,
    failoversRemoved: failoverRows.length,
  };
}
