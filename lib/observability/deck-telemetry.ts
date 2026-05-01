import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type DeckTelemetryEvent = {
  id: string;
  deckId: number;
  reportId: number | null;
  runId: number | null;
  eventType:
    | 'deck_created'
    | 'deck_generated'
    | 'deck_updated'
    | 'snapshot_saved'
    | 'snapshot_restored'
    | 'export_requested'
    | 'export_completed'
    | 'share_playback_read';
  status: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

const runtimeRoot = path.join(process.cwd(), 'tasks', 'runtime', 'observability');
const deckTelemetryPath = path.join(runtimeRoot, 'deck_events.json');

function nowIso() {
  return new Date().toISOString();
}

async function ensureDeckTelemetryStore() {
  await mkdir(runtimeRoot, { recursive: true });
  try {
    await readFile(deckTelemetryPath, 'utf8');
  } catch {
    await writeFile(deckTelemetryPath, JSON.stringify({ events: [] }, null, 2), 'utf8');
  }
}

async function readDeckTelemetryStore(): Promise<{ events: DeckTelemetryEvent[] }> {
  await ensureDeckTelemetryStore();
  const raw = await readFile(deckTelemetryPath, 'utf8');
  const parsed = JSON.parse(raw) as { events?: DeckTelemetryEvent[] };
  return {
    events: Array.isArray(parsed.events) ? parsed.events : [],
  };
}

async function writeDeckTelemetryStore(store: { events: DeckTelemetryEvent[] }) {
  await ensureDeckTelemetryStore();
  await writeFile(deckTelemetryPath, JSON.stringify(store, null, 2), 'utf8');
}

export async function recordDeckTelemetryEvent(
  input: Omit<DeckTelemetryEvent, 'id' | 'createdAt'>
) {
  const event: DeckTelemetryEvent = {
    id: `deck_evt_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
    createdAt: nowIso(),
    ...input,
  };
  const store = await readDeckTelemetryStore();
  store.events.unshift(event);
  await writeDeckTelemetryStore(store);
  console.log(`[family.telemetry.deck] ${JSON.stringify(event)}`);
  return event;
}

export async function listDeckTelemetryEvents(deckId: number) {
  const store = await readDeckTelemetryStore();
  return store.events.filter((event) => event.deckId === deckId);
}
