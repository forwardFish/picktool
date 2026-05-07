import type { CopilotSession } from '../workflow-generation/types.ts';
import { hasVercelKvConfig } from '../archive/vercel-kv-store.ts';

export type CopilotSessionStoreKind = 'memory' | 'vercel-kv';

export type CopilotSessionStore = {
  kind: CopilotSessionStoreKind;
  save(session: CopilotSession): Promise<CopilotSession>;
  list(): Promise<CopilotSession[]>;
  get(id: string): Promise<CopilotSession | null>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
};

export type CopilotSessionStoreSelection = {
  store: CopilotSessionStore;
  requested: CopilotSessionStoreKind;
  persistent: boolean;
  reason: string;
};

const SESSION_INDEX_KEY = 'picktool:copilot:sessions:index';
const SESSION_ITEM_PREFIX = 'picktool:copilot:sessions:item:';

const sessions = new Map<string, CopilotSession>();

export function createMemoryCopilotSessionStore(): CopilotSessionStore {
  return {
    kind: 'memory',
    async save(session) {
      sessions.set(session.id, session);
      return session;
    },
    async list() {
      return [...sessions.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async get(id) {
      return sessions.get(id) ?? null;
    },
    async delete(id) {
      return sessions.delete(id);
    },
    async clear() {
      sessions.clear();
    }
  };
}

export const memoryCopilotSessionStore = createMemoryCopilotSessionStore();

type RedisRestResponse<T> = {
  result?: T;
  error?: string;
};

export class VercelKvCopilotSessionStore implements CopilotSessionStore {
  readonly kind = 'vercel-kv' as const;
  private readonly url: string;
  private readonly token: string;

  constructor(config: { url: string; token: string }) {
    this.url = config.url.replace(/\/+$/, '');
    this.token = config.token;
  }

  async save(session: CopilotSession) {
    await this.command<string>('SET', this.itemKey(session.id), JSON.stringify(session));
    await this.command<number>('LREM', SESSION_INDEX_KEY, 0, session.id);
    await this.command<number>('LPUSH', SESSION_INDEX_KEY, session.id);
    return session;
  }

  async list() {
    const ids = await this.command<string[]>('LRANGE', SESSION_INDEX_KEY, 0, -1);
    const sessions = await Promise.all((ids ?? []).map((id) => this.get(id)));
    return sessions
      .filter((session): session is CopilotSession => Boolean(session))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async get(id: string) {
    const raw = await this.command<string | null>('GET', this.itemKey(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CopilotSession;
    } catch {
      return null;
    }
  }

  async delete(id: string) {
    const deleted = await this.command<number>('DEL', this.itemKey(id));
    await this.command<number>('LREM', SESSION_INDEX_KEY, 0, id);
    return deleted > 0;
  }

  async clear() {
    const ids = await this.command<string[]>('LRANGE', SESSION_INDEX_KEY, 0, -1);
    if (ids?.length) {
      await this.command<number>('DEL', ...ids.map((id) => this.itemKey(id)));
    }
    await this.command<number>('DEL', SESSION_INDEX_KEY);
  }

  private itemKey(id: string) {
    return `${SESSION_ITEM_PREFIX}${id}`;
  }

  private async command<T>(...command: Array<string | number>) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) {
      throw new Error(`Vercel KV session request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as RedisRestResponse<T>;
    if (payload.error) throw new Error(payload.error);
    return payload.result as T;
  }
}

export function createVercelKvCopilotSessionStoreFromEnv(env: NodeJS.ProcessEnv = process.env) {
  if (!hasVercelKvConfig({ KV_REST_API_URL: env.KV_REST_API_URL, KV_REST_API_TOKEN: env.KV_REST_API_TOKEN })) return null;
  return new VercelKvCopilotSessionStore({ url: env.KV_REST_API_URL as string, token: env.KV_REST_API_TOKEN as string });
}

let cachedSelection: CopilotSessionStoreSelection | null = null;

export function selectCopilotSessionStore(env: NodeJS.ProcessEnv = process.env): CopilotSessionStoreSelection {
  const requested = env.ARCHIVE_STORE === 'vercel-kv' ? 'vercel-kv' : 'memory';

  if (requested === 'vercel-kv') {
    const kvStore = createVercelKvCopilotSessionStoreFromEnv(env);
    if (kvStore) {
      return { store: kvStore, requested, persistent: true, reason: 'ARCHIVE_STORE=vercel-kv and KV REST env vars are configured.' };
    }
    return { store: memoryCopilotSessionStore, requested, persistent: false, reason: 'ARCHIVE_STORE=vercel-kv was requested, but KV_REST_API_URL or KV_REST_API_TOKEN is missing; using memory fallback.' };
  }

  return { store: memoryCopilotSessionStore, requested, persistent: false, reason: 'ARCHIVE_STORE is memory or unset.' };
}

export function getCopilotSessionStore() {
  cachedSelection ??= selectCopilotSessionStore();
  return cachedSelection.store;
}

export function getCopilotSessionStoreSelection() {
  cachedSelection ??= selectCopilotSessionStore();
  return cachedSelection;
}

export function resetCopilotSessionStoreForTests() {
  cachedSelection = null;
}
