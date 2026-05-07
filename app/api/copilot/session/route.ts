import { NextResponse } from 'next/server.js';
import { getSession, toWorkflowResult } from '../../../../lib/copilot/session-store.ts';

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json(toWorkflowResult(session));
}


