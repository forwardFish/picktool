import test from 'node:test';
import assert from 'node:assert/strict';
import { getArchiveStore, resetArchiveStoreForTests, selectArchiveStore } from '../lib/archive/index.ts';
import { startSession, clearSessions, saveSessionToArchive } from '../lib/copilot/session-store.ts';
import { selectCopilotSessionStore } from '../lib/copilot/session-storage.ts';

test('memory archive store saves, lists, reads, preserves metadata, and deletes workflow data', async () => {
  resetArchiveStoreForTests();
  const store = getArchiveStore();
  await store.clear();
  const item = await store.create({
    title: 'Saved test plan',
    userInput: 'Test workflow input',
    workflowData: { currentPlan: undefined }
  });

  const list = await store.list();
  assert.equal(store.kind, 'memory');
  assert.equal(list.length, 1);
  assert.equal(list[0]?.id, item.id);
  assert.equal(item.title, 'Saved test plan');
  assert.equal(item.userInput, 'Test workflow input');
  assert.equal(typeof item.createdAt, 'string');
  assert.equal((await store.get(item.id))?.title, 'Saved test plan');
  assert.equal(await store.delete(item.id), true);
  assert.equal(await store.get(item.id), null);
});

test('archive store selector defaults to memory', () => {
  const selection = selectArchiveStore({} as unknown as NodeJS.ProcessEnv);
  assert.equal(selection.store.kind, 'memory');
  assert.equal(selection.requested, 'memory');
  assert.equal(selection.persistent, false);
});

test('archive store selector falls back to memory when Vercel KV env is incomplete', () => {
  const selection = selectArchiveStore({ ARCHIVE_STORE: 'vercel-kv' } as unknown as NodeJS.ProcessEnv);
  assert.equal(selection.store.kind, 'memory');
  assert.equal(selection.requested, 'vercel-kv');
  assert.equal(selection.persistent, false);
  assert.match(selection.reason, /missing/i);
});

test('archive store selector uses Vercel KV when env vars are present', () => {
  const selection = selectArchiveStore({
    ARCHIVE_STORE: 'vercel-kv',
    KV_REST_API_URL: 'https://example-kv.upstash.io',
    KV_REST_API_TOKEN: 'test-token'
  } as unknown as NodeJS.ProcessEnv);
  assert.equal(selection.store.kind, 'vercel-kv');
  assert.equal(selection.requested, 'vercel-kv');
  assert.equal(selection.persistent, true);
});

test('copilot session save creates archive entry', async () => {
  await clearSessions();
  resetArchiveStoreForTests();
  await getArchiveStore().clear();
  const session = await startSession('我有一个毕业设计，想用 AI 帮我剪辑展示视频。');
  const archive = await saveSessionToArchive(session.id);

  assert.ok(archive);
  assert.equal(archive?.userInput, session.userInput);
  assert.equal((await getArchiveStore().list()).length, 1);
});
test('copilot session store selector mirrors archive persistence mode', () => {
  const memory = selectCopilotSessionStore({} as unknown as NodeJS.ProcessEnv);
  assert.equal(memory.store.kind, 'memory');
  assert.equal(memory.persistent, false);

  const fallback = selectCopilotSessionStore({ ARCHIVE_STORE: 'vercel-kv' } as unknown as NodeJS.ProcessEnv);
  assert.equal(fallback.store.kind, 'memory');
  assert.equal(fallback.requested, 'vercel-kv');
  assert.equal(fallback.persistent, false);

  const persistent = selectCopilotSessionStore({
    ARCHIVE_STORE: 'vercel-kv',
    KV_REST_API_URL: 'https://example-kv.upstash.io',
    KV_REST_API_TOKEN: 'test-token'
  } as unknown as NodeJS.ProcessEnv);
  assert.equal(persistent.store.kind, 'vercel-kv');
  assert.equal(persistent.persistent, true);
});
