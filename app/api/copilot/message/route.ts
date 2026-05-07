import { NextResponse } from 'next/server.js';
import { appendUserMessage, toWorkflowResult } from '../../../../lib/copilot/session-store.ts';

export async function POST(request: Request) {
  let payload: { sessionId?: unknown; message?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (typeof payload.sessionId !== 'string') return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  if (typeof payload.message !== 'string' || payload.message.trim().length < 1) return NextResponse.json({ error: 'message is required.' }, { status: 400 });
  const session = await appendUserMessage(payload.sessionId, payload.message.trim());
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json(toWorkflowResult(session));
}


