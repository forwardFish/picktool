import type { ArchiveCreateInput, ArchiveItem } from './types.ts';

export type ArchiveStoreKind = 'memory' | 'vercel-kv';

export type ArchiveStore = {
  kind: ArchiveStoreKind;
  create(input: ArchiveCreateInput): Promise<ArchiveItem>;
  list(): Promise<ArchiveItem[]>;
  get(id: string): Promise<ArchiveItem | null>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
};
