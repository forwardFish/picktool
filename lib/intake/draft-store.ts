'use client';

export type IntakeDraftRecord = {
  id: 'active';
  version: 1;
  notes: string;
  sourceType: string;
  diagnosticGoal: string;
  recentTrend: string;
  parentConcerns: string;
  teacherFeedbackPresent: boolean;
  hasTutor: boolean;
  files: File[];
  createdAt: string;
  updatedAt: string;
};

export type IntakeDraftInput = Omit<IntakeDraftRecord, 'id' | 'version' | 'createdAt' | 'updatedAt'>;

const DB_NAME = 'pathnook-intake-drafts';
const STORE_NAME = 'drafts';
const ACTIVE_DRAFT_ID = 'active';
const VERSION = 1;
const MAX_DRAFT_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB unavailable.'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  const db = await openDraftDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);
    let result: T | undefined;

    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => reject(request.error || new Error('Draft store request failed.'));
    }

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('Draft store transaction failed.'));
    };
  });
}

export async function saveIntakeDraft(input: IntakeDraftInput) {
  const now = new Date().toISOString();
  const existing = await readIntakeDraft({ allowStale: true }).catch(() => null);
  const record: IntakeDraftRecord = {
    ...input,
    id: ACTIVE_DRAFT_ID,
    version: VERSION,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  await withStore('readwrite', (store) => store.put(record));
}

export async function readIntakeDraft(options: { allowStale?: boolean } = {}) {
  const record = (await withStore<IntakeDraftRecord>('readonly', (store) =>
    store.get(ACTIVE_DRAFT_ID)
  )) as IntakeDraftRecord | undefined;

  if (!record || record.version !== VERSION) {
    return null;
  }

  const updatedAt = new Date(record.updatedAt).getTime();
  if (!options.allowStale && (!updatedAt || Date.now() - updatedAt > MAX_DRAFT_AGE_MS)) {
    await clearIntakeDraft();
    return null;
  }

  return record;
}

export async function clearIntakeDraft() {
  await withStore('readwrite', (store) => store.delete(ACTIVE_DRAFT_ID));
}
