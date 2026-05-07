import { NextResponse } from 'next/server.js';
import { getArchiveStoreSelection } from '../../../lib/archive/index.ts';
import { getCopilotSessionStoreSelection } from '../../../lib/copilot/session-storage.ts';

export async function GET() {
  const archive = getArchiveStoreSelection();
  const sessions = getCopilotSessionStoreSelection();
  return NextResponse.json({
    ok: true,
    service: 'AI Task Workflow Copilot',
    mode: process.env.LLM_PROVIDER ?? 'mock',
    archiveStore: archive.store.kind,
    archivePersistent: archive.persistent,
    sessionStore: sessions.store.kind,
    sessionPersistent: sessions.persistent
  });
}
