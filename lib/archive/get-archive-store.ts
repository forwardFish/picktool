import type { ArchiveStore } from './archive-store.ts';
import { memoryArchiveStore } from './memory-store.ts';
import { createVercelKvArchiveStoreFromEnv } from './vercel-kv-store.ts';

export type ArchiveStoreSelection = {
  store: ArchiveStore;
  requested: 'memory' | 'vercel-kv';
  persistent: boolean;
  reason: string;
};

let cachedSelection: ArchiveStoreSelection | null = null;

export function selectArchiveStore(env: NodeJS.ProcessEnv = process.env): ArchiveStoreSelection {
  const requested = env.ARCHIVE_STORE === 'vercel-kv' ? 'vercel-kv' : 'memory';

  if (requested === 'vercel-kv') {
    const kvStore = createVercelKvArchiveStoreFromEnv(env);
    if (kvStore) {
      return { store: kvStore, requested, persistent: true, reason: 'ARCHIVE_STORE=vercel-kv and KV REST env vars are configured.' };
    }
    return { store: memoryArchiveStore, requested, persistent: false, reason: 'ARCHIVE_STORE=vercel-kv was requested, but KV_REST_API_URL or KV_REST_API_TOKEN is missing; using memory fallback.' };
  }

  return { store: memoryArchiveStore, requested, persistent: false, reason: 'ARCHIVE_STORE is memory or unset.' };
}

export function getArchiveStore() {
  cachedSelection ??= selectArchiveStore();
  return cachedSelection.store;
}

export function getArchiveStoreSelection() {
  cachedSelection ??= selectArchiveStore();
  return cachedSelection;
}

export function resetArchiveStoreForTests() {
  cachedSelection = null;
}
