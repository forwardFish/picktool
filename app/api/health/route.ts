import { NextResponse } from 'next/server.js';
import { getArchiveStoreSelection } from '../../../lib/archive/index.ts';
import { getCopilotSessionStoreSelection } from '../../../lib/copilot/session-storage.ts';
import { getConfiguredProvider } from '../../../lib/workflow-generation/provider.ts';

export async function GET() {
  const archive = getArchiveStoreSelection();
  const sessions = getCopilotSessionStoreSelection();
  const provider = getConfiguredProvider();
  return NextResponse.json({
    ok: true,
    service: 'AI Task Workflow Copilot',
    mode: process.env.LLM_PROVIDER ?? 'local',
    provider: provider.name,
    providerMode: provider.mode,
    archiveStore: archive.store.kind,
    archivePersistent: archive.persistent,
    sessionStore: sessions.store.kind,
    sessionPersistent: sessions.persistent
  });
}
