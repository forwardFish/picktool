import { NextResponse } from 'next/server.js';
import { selectOption, toWorkflowResult } from '../../../../lib/copilot/session-store.ts';
import { validateOptionKey } from '../../../../lib/workflow-generation/types.ts';

export async function POST(request: Request) {
  let payload: { sessionId?: unknown; optionKey?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (typeof payload.sessionId !== 'string') return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  const option = validateOptionKey(payload.optionKey);
  if (!option.ok) return NextResponse.json({ error: option.error }, { status: option.status });
  const session = await selectOption(payload.sessionId, option.optionKey);
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json(toWorkflowResult(session));
}


