import { NextResponse } from 'next/server.js';
import { startSession, toWorkflowResult } from '../../../../lib/copilot/session-store.ts';
import { validateTaskInput } from '../../../../lib/workflow-generation/types.ts';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const input = validateTaskInput((payload as { input?: unknown; task?: unknown }).input ?? (payload as { task?: unknown }).task);
  if (!input.ok) return NextResponse.json({ error: input.error }, { status: input.status });

  const session = await startSession(input.input);
  return NextResponse.json(toWorkflowResult(session));
}


