import { createId } from '../workflow-generation/engine.ts';
import type { ArchiveStore } from './archive-store.ts';
import type { ArchiveCreateInput, ArchiveItem } from './types.ts';

export function buildArchiveItem(input: ArchiveCreateInput, id = createId('archive'), timestamp = new Date().toISOString()): ArchiveItem {
  return {
    id,
    title: input.title || input.workflowData.currentPlan?.title || input.workflowData.session?.currentPlan.title || 'Saved AI workflow plan',
    userInput: input.userInput,
    resultType: input.resultType ?? 'copilot_session',
    workflowData: input.workflowData,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

const items = new Map<string, ArchiveItem>();

export function createMemoryArchiveStore(): ArchiveStore {
  return {
    kind: 'memory',
    async create(input: ArchiveCreateInput) {
      const item = buildArchiveItem(input);
      items.set(item.id, item);
      return item;
    },
    async list() {
      return [...items.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async get(id: string) {
      return items.get(id) ?? null;
    },
    async delete(id: string) {
      return items.delete(id);
    },
    async clear() {
      items.clear();
    }
  };
}

export const memoryArchiveStore = createMemoryArchiveStore();
