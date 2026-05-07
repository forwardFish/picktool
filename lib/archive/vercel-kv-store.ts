import type { ArchiveStore } from './archive-store.ts';
import { buildArchiveItem } from './memory-store.ts';
import type { ArchiveCreateInput, ArchiveItem } from './types.ts';

const INDEX_KEY = 'picktool:archive:index';
const ITEM_PREFIX = 'picktool:archive:item:';

type VercelKvConfig = {
  url: string;
  token: string;
};

type RedisRestResponse<T> = {
  result?: T;
  error?: string;
};

export function hasVercelKvConfig(env: Partial<Record<'KV_REST_API_URL' | 'KV_REST_API_TOKEN', string | undefined>>) {
  return Boolean(env.KV_REST_API_URL?.trim() && env.KV_REST_API_TOKEN?.trim());
}

export class VercelKvArchiveStore implements ArchiveStore {
  readonly kind = 'vercel-kv' as const;
  private readonly config: VercelKvConfig;

  constructor(config: VercelKvConfig) {
    this.config = {
      url: config.url.replace(/\/+$/, ''),
      token: config.token
    };
  }

  async create(input: ArchiveCreateInput) {
    const item = buildArchiveItem(input);
    await this.command<string>('SET', this.itemKey(item.id), JSON.stringify(item));
    await this.command<number>('LPUSH', INDEX_KEY, item.id);
    return item;
  }

  async list() {
    const ids = await this.command<string[]>('LRANGE', INDEX_KEY, 0, -1);
    const items = await Promise.all((ids ?? []).map((id) => this.get(id)));
    return items
      .filter((item): item is ArchiveItem => Boolean(item))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async get(id: string) {
    const raw = await this.command<string | null>('GET', this.itemKey(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ArchiveItem;
    } catch {
      return null;
    }
  }

  async delete(id: string) {
    const deleted = await this.command<number>('DEL', this.itemKey(id));
    await this.command<number>('LREM', INDEX_KEY, 0, id);
    return deleted > 0;
  }

  async clear() {
    const ids = await this.command<string[]>('LRANGE', INDEX_KEY, 0, -1);
    if (ids?.length) {
      await this.command<number>('DEL', ...ids.map((id) => this.itemKey(id)));
    }
    await this.command<number>('DEL', INDEX_KEY);
  }

  private itemKey(id: string) {
    return `${ITEM_PREFIX}${id}`;
  }

  private async command<T>(...command: Array<string | number>) {
    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) {
      throw new Error(`Vercel KV request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as RedisRestResponse<T>;
    if (payload.error) throw new Error(payload.error);
    return payload.result as T;
  }
}

export function createVercelKvArchiveStoreFromEnv(env: NodeJS.ProcessEnv = process.env) {
  if (!hasVercelKvConfig({ KV_REST_API_URL: env.KV_REST_API_URL, KV_REST_API_TOKEN: env.KV_REST_API_TOKEN })) return null;
  return new VercelKvArchiveStore({ url: env.KV_REST_API_URL as string, token: env.KV_REST_API_TOKEN as string });
}


