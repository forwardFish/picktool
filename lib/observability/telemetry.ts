import 'server-only';

import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { runErrorEvents, runLifecycleEvents } from '@/lib/db/schema';
import { getFamilyEduRuntimeRoot, isFamilyEduDemoMode } from '@/lib/family/config';

export type RunLifecycleEvent = {
  id: string;
  runId: number;
  userId: number;
  childId: number | null;
  uploadId: number | null;
  eventType:
    | 'queued'
    | 'state_transition'
    | 'completed'
    | 'needs_review'
    | 'retry_queued'
    | 'deleted';
  status: string;
  stage: string;
  message: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type RunErrorEvent = {
  id: string;
  runId: number;
  userId: number;
  errorType: 'timeout' | 'forced_failure' | 'processing_error';
  message: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();
const runtimeRoot = path.join(getFamilyEduRuntimeRoot(), 'observability');
const lifecyclePath = path.join(runtimeRoot, 'run_lifecycle_events.json');
const errorPath = path.join(runtimeRoot, 'error_events.json');

function nowIso() {
  return new Date().toISOString();
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function toLifecycleEvent(row: typeof runLifecycleEvents.$inferSelect): RunLifecycleEvent {
  return {
    id: row.id,
    runId: row.runId,
    userId: row.userId,
    childId: row.childId,
    uploadId: row.uploadId,
    eventType: row.eventType as RunLifecycleEvent['eventType'],
    status: row.status,
    stage: row.stage,
    message: row.message,
    createdAt: toIsoString(row.createdAt) || nowIso(),
    metadata: (row.metadata || {}) as Record<string, unknown>,
  };
}

function toRunErrorEvent(row: typeof runErrorEvents.$inferSelect): RunErrorEvent {
  return {
    id: row.id,
    runId: row.runId,
    userId: row.userId,
    errorType: row.errorType as RunErrorEvent['errorType'],
    message: row.message,
    createdAt: toIsoString(row.createdAt) || nowIso(),
    metadata: (row.metadata || {}) as Record<string, unknown>,
  };
}

// Legacy local observability files stay available only for demo/local fallback.
async function ensureLegacyObservabilityStore() {
  await mkdir(runtimeRoot, { recursive: true });

  for (const filePath of [lifecyclePath, errorPath]) {
    try {
      await readFile(filePath, 'utf8');
    } catch {
      await writeFile(filePath, JSON.stringify({ events: [] }, null, 2), 'utf8');
    }
  }
}

async function readLegacyEventStore<T>(filePath: string): Promise<{ events: T[] }> {
  await ensureLegacyObservabilityStore();
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as { events?: T[] };
  return {
    events: Array.isArray(parsed.events) ? parsed.events : [],
  };
}

async function writeLegacyEventStore<T>(filePath: string, store: { events: T[] }) {
  await ensureLegacyObservabilityStore();
  await writeFile(filePath, JSON.stringify(store, null, 2), 'utf8');
}

export async function recordRunLifecycleEvent(input: Omit<RunLifecycleEvent, 'id' | 'createdAt'>) {
  const event: RunLifecycleEvent = {
    id: `run_evt_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    createdAt: nowIso(),
    ...input,
  };

  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyEventStore<RunLifecycleEvent>(lifecyclePath);
    store.events.unshift(event);
    await writeLegacyEventStore(lifecyclePath, store);
    console.log(`[family.telemetry.lifecycle] ${JSON.stringify(event)}`);
    return event;
  }

  await db.insert(runLifecycleEvents).values({
    id: event.id,
    runId: event.runId,
    userId: event.userId,
    childId: event.childId,
    uploadId: event.uploadId,
    eventType: event.eventType,
    status: event.status,
    stage: event.stage,
    message: event.message,
    metadata: event.metadata,
    createdAt: new Date(event.createdAt),
  });
  console.log(`[family.telemetry.lifecycle] ${JSON.stringify(event)}`);
  return event;
}

export async function recordRunErrorEvent(input: Omit<RunErrorEvent, 'id' | 'createdAt'>) {
  const event: RunErrorEvent = {
    id: `run_err_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    createdAt: nowIso(),
    ...input,
  };

  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyEventStore<RunErrorEvent>(errorPath);
    store.events.unshift(event);
    await writeLegacyEventStore(errorPath, store);
    console.log(`[family.telemetry.error] ${JSON.stringify(event)}`);
    return event;
  }

  await db.insert(runErrorEvents).values({
    id: event.id,
    runId: event.runId,
    userId: event.userId,
    errorType: event.errorType,
    message: event.message,
    metadata: event.metadata,
    createdAt: new Date(event.createdAt),
  });
  console.log(`[family.telemetry.error] ${JSON.stringify(event)}`);
  return event;
}

export async function getObservabilityPaths() {
  if (FAMILY_EDU_DEMO_MODE) {
    await ensureLegacyObservabilityStore();
    return {
      runtimeRoot,
      lifecyclePath,
      errorPath,
    };
  }

  return {
    runtimeRoot: 'vercel://neon/observability',
    lifecyclePath: 'vercel://neon/run_lifecycle_events',
    errorPath: 'vercel://neon/run_error_events',
  };
}

export async function removeRunLifecycleEvents(runIds: number[]) {
  if (runIds.length === 0) {
    return 0;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyEventStore<RunLifecycleEvent>(lifecyclePath);
    const before = store.events.length;
    store.events = store.events.filter((event) => !runIds.includes(event.runId));
    await writeLegacyEventStore(lifecyclePath, store);
    return before - store.events.length;
  }

  const rows = await db
    .select({ id: runLifecycleEvents.id })
    .from(runLifecycleEvents)
    .where(inArray(runLifecycleEvents.runId, runIds))
    .orderBy(desc(runLifecycleEvents.createdAt));

  if (rows.length === 0) {
    return 0;
  }

  await db.delete(runLifecycleEvents).where(inArray(runLifecycleEvents.id, rows.map((row) => row.id)));
  return rows.length;
}

export async function removeRunErrorEvents(runIds: number[]) {
  if (runIds.length === 0) {
    return 0;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyEventStore<RunErrorEvent>(errorPath);
    const before = store.events.length;
    store.events = store.events.filter((event) => !runIds.includes(event.runId));
    await writeLegacyEventStore(errorPath, store);
    return before - store.events.length;
  }

  const rows = await db
    .select({ id: runErrorEvents.id })
    .from(runErrorEvents)
    .where(inArray(runErrorEvents.runId, runIds))
    .orderBy(desc(runErrorEvents.createdAt));

  if (rows.length === 0) {
    return 0;
  }

  await db.delete(runErrorEvents).where(inArray(runErrorEvents.id, rows.map((row) => row.id)));
  return rows.length;
}

export async function removeRunObservabilityArtifacts(runIds: number[]) {
  const [lifecycleRemoved, errorRemoved] = await Promise.all([
    removeRunLifecycleEvents(runIds),
    removeRunErrorEvents(runIds),
  ]);

  if (FAMILY_EDU_DEMO_MODE) {
    const runArtifactDir = path.join(runtimeRoot, 'run_artifacts');
    for (const runId of runIds) {
      const artifactPath = path.join(runArtifactDir, `run_${runId}.json`);
      try {
        await unlink(artifactPath);
      } catch {}
    }
  }

  return {
    lifecycleRemoved,
    errorRemoved,
  };
}
