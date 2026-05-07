import { NextResponse } from 'next/server.js';
import { refineSessionModule, toWorkflowResult } from '../../../../lib/copilot/session-store.ts';
import { validateModuleType } from '../../../../lib/workflow-generation/types.ts';

export async function POST(request: Request) {
  let payload: { sessionId?: unknown; moduleType?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (typeof payload.sessionId !== 'string') return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  const module = validateModuleType(payload.moduleType);
  if (!module.ok) return NextResponse.json({ error: module.error }, { status: module.status });
  const session = await refineSessionModule(payload.sessionId, module.moduleType);
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json(toWorkflowResult(session));
}

