import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { reminderEvents } from '@/lib/db/schema';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import { getReportForUser } from '@/lib/family/repository';

export type ReminderKind = 'report_ready' | 'weekly_review';

export type ReminderRecord = {
  id: string;
  kind: ReminderKind;
  userId: number;
  reportId: number | null;
  childId: number | null;
  deliveryChannel: 'email_safe_fallback';
  status: 'scheduled' | 'send_attempted';
  subject: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  scheduledFor: string;
  attemptedAt: string | null;
};

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();
const runtimeDir = path.join(
  process.cwd(),
  'tasks',
  'runtime',
  'family_local_runtime'
);
const reminderPath = path.join(runtimeDir, 'reminder_events.json');

function nowIso() {
  return new Date().toISOString();
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function buildRecord(input: {
  kind: ReminderKind;
  userId: number;
  reportId?: number | null;
  childId?: number | null;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
  scheduledFor?: string;
}): ReminderRecord {
  const createdAt = nowIso();
  return {
    id: `reminder_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    kind: input.kind,
    userId: input.userId,
    reportId: input.reportId ?? null,
    childId: input.childId ?? null,
    deliveryChannel: 'email_safe_fallback',
    status: 'send_attempted',
    subject: input.subject,
    message: input.message,
    metadata: input.metadata || {},
    createdAt,
    scheduledFor: input.scheduledFor || createdAt,
    attemptedAt: createdAt,
  };
}

function toReminderRecord(row: typeof reminderEvents.$inferSelect): ReminderRecord {
  return {
    id: row.id,
    kind: row.kind as ReminderKind,
    userId: row.userId,
    reportId: row.reportId,
    childId: row.childId,
    deliveryChannel: row.deliveryChannel as ReminderRecord['deliveryChannel'],
    status: row.status as ReminderRecord['status'],
    subject: row.subject,
    message: row.message,
    metadata: (row.metadata || {}) as Record<string, unknown>,
    createdAt: toIsoString(row.createdAt) || nowIso(),
    scheduledFor: toIsoString(row.scheduledFor) || nowIso(),
    attemptedAt: toIsoString(row.attemptedAt),
  };
}

// Legacy local JSON reminder store is retained for demo/local fallback only.
async function ensureLegacyReminderStore() {
  await mkdir(runtimeDir, { recursive: true });
  try {
    await readFile(reminderPath, 'utf8');
  } catch {
    await writeFile(reminderPath, JSON.stringify({ events: [] }, null, 2), 'utf8');
  }
}

async function readLegacyReminderStore(): Promise<{ events: ReminderRecord[] }> {
  await ensureLegacyReminderStore();
  const raw = await readFile(reminderPath, 'utf8');
  const parsed = JSON.parse(raw) as { events?: ReminderRecord[] };
  return {
    events: Array.isArray(parsed.events) ? parsed.events : [],
  };
}

async function writeLegacyReminderStore(store: { events: ReminderRecord[] }) {
  await ensureLegacyReminderStore();
  await writeFile(reminderPath, JSON.stringify(store, null, 2), 'utf8');
}

async function recordLegacyReminderAttempt(input: {
  kind: ReminderKind;
  userId: number;
  reportId?: number | null;
  childId?: number | null;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
  scheduledFor?: string;
}) {
  const store = await readLegacyReminderStore();
  const dedupeKey = input.dedupeKey || null;

  if (
    dedupeKey &&
    store.events.some(
      (event) =>
        String(event.metadata.dedupeKey || '') === dedupeKey &&
        event.kind === input.kind &&
        event.userId === input.userId
    )
  ) {
    return store.events.find(
      (event) =>
        String(event.metadata.dedupeKey || '') === dedupeKey &&
        event.kind === input.kind &&
        event.userId === input.userId
    ) as ReminderRecord;
  }

  const record = buildRecord({
    ...input,
    metadata: {
      ...(input.metadata || {}),
      dedupeKey,
      transport: 'legacy_local_json',
    },
  });
  store.events.unshift(record);
  await writeLegacyReminderStore(store);
  return record;
}

export async function recordReminderAttempt(input: {
  kind: ReminderKind;
  userId: number;
  reportId?: number | null;
  childId?: number | null;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
  scheduledFor?: string;
}) {
  if (FAMILY_EDU_DEMO_MODE) {
    return recordLegacyReminderAttempt(input);
  }

  const dedupeKey = input.dedupeKey || null;
  if (dedupeKey) {
    const existingRows = await db
      .select()
      .from(reminderEvents)
      .where(eq(reminderEvents.dedupeKey, dedupeKey))
      .limit(1);

    if (existingRows[0]) {
      return toReminderRecord(existingRows[0]);
    }
  }

  const record = buildRecord({
    ...input,
    metadata: {
      ...(input.metadata || {}),
      dedupeKey,
      transport: 'neon_runtime_record',
    },
  });

  await db.insert(reminderEvents).values({
    id: record.id,
    kind: record.kind,
    userId: record.userId,
    reportId: record.reportId,
    childId: record.childId,
    deliveryChannel: record.deliveryChannel,
    status: record.status,
    subject: record.subject,
    message: record.message,
    metadata: record.metadata,
    dedupeKey,
    createdAt: new Date(record.createdAt),
    scheduledFor: new Date(record.scheduledFor),
    attemptedAt: record.attemptedAt ? new Date(record.attemptedAt) : null,
  });

  return record;
}

export async function scheduleReportReadyReminderForReport(userId: number, reportId: number) {
  const report = await getReportForUser(userId, reportId);
  const parentReport = ((report as any)?.parentReportJson || {}) as Record<string, unknown>;
  const childNickname =
    typeof parentReport.childNickname === 'string' ? parentReport.childNickname : 'your child';

  return recordReminderAttempt({
    kind: 'report_ready',
    userId,
    reportId,
    childId: (report as any)?.run?.childId ?? null,
    subject: `Pathnook report ready for ${childNickname}`,
    message:
      'Your report is now readable in the parent dashboard. Review the diagnosis, evidence, and 7-day plan before you share it onward.',
    metadata: {
      reportId,
      childNickname,
      source: 'billing_unlock',
    },
    dedupeKey: `report_ready:${userId}:${reportId}`,
  });
}

export async function scheduleWeeklyReviewReminder(input: {
  userId: number;
  childId?: number | null;
  childNickname?: string | null;
  scheduledFor?: string;
}) {
  const childLabel = input.childNickname || 'this learner';
  return recordReminderAttempt({
    kind: 'weekly_review',
    userId: input.userId,
    childId: input.childId ?? null,
    subject: `Weekly Pathnook review for ${childLabel}`,
    message:
      'Open the dashboard to compare the latest report, review parent notes, and decide whether a fresh upload is needed this week.',
    metadata: {
      childNickname: childLabel,
      source: 'manual_schedule_api',
    },
    dedupeKey: `weekly_review:${input.userId}:${input.childId ?? 'all'}`,
    scheduledFor: input.scheduledFor,
  });
}

export async function listReminderEventsForUser(userId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyReminderStore();
    return store.events.filter((event) => event.userId === userId);
  }

  const rows = await db
    .select()
    .from(reminderEvents)
    .where(eq(reminderEvents.userId, userId))
    .orderBy(desc(reminderEvents.createdAt));

  return rows.map(toReminderRecord);
}

export async function getReminderStorePath() {
  if (FAMILY_EDU_DEMO_MODE) {
    await ensureLegacyReminderStore();
    return reminderPath;
  }

  return 'vercel://neon/reminder_events';
}

export async function purgeReminderEvents(input: {
  userId?: number;
  reportIds?: number[];
  childIds?: number[];
}) {
  if (FAMILY_EDU_DEMO_MODE) {
    const store = await readLegacyReminderStore();
    const reportIds = input.reportIds || [];
    const childIds = input.childIds || [];
    const before = store.events.length;

    store.events = store.events.filter((event) => {
      if (typeof input.userId === 'number' && event.userId !== input.userId) {
        return true;
      }

      if (reportIds.length > 0 && event.reportId && reportIds.includes(event.reportId)) {
        return false;
      }

      if (childIds.length > 0 && event.childId && childIds.includes(event.childId)) {
        return false;
      }

      return true;
    });

    await writeLegacyReminderStore(store);
    return before - store.events.length;
  }

  const scopedRows =
    typeof input.userId === 'number'
      ? await db
          .select({
            id: reminderEvents.id,
            reportId: reminderEvents.reportId,
            childId: reminderEvents.childId,
          })
          .from(reminderEvents)
          .where(eq(reminderEvents.userId, input.userId))
      : await db.select({
          id: reminderEvents.id,
          reportId: reminderEvents.reportId,
          childId: reminderEvents.childId,
        }).from(reminderEvents);

  const reportIds = input.reportIds || [];
  const childIds = input.childIds || [];
  const idsToDelete = scopedRows
    .filter((row) => {
      if (reportIds.length > 0 && row.reportId && reportIds.includes(row.reportId)) {
        return true;
      }

      if (childIds.length > 0 && row.childId && childIds.includes(row.childId)) {
        return true;
      }

      return false;
    })
    .map((row) => row.id);

  if (idsToDelete.length === 0) {
    return 0;
  }

  await db.delete(reminderEvents).where(inArray(reminderEvents.id, idsToDelete));
  return idsToDelete.length;
}
