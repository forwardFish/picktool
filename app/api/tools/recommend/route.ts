import { NextResponse } from 'next/server.js';
import { recommendTools } from '../../../../lib/tool-catalog/recommend-tools.ts';
import { validateTaskInput } from '../../../../lib/workflow-generation/types.ts';

export async function POST(request: Request) {
  let payload: { input?: unknown; task?: unknown; constraints?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const input = validateTaskInput(payload.input ?? payload.task);
  if (!input.ok) return NextResponse.json({ error: input.error }, { status: input.status });

  const constraints = typeof payload.constraints === 'object' && payload.constraints !== null
    ? payload.constraints as { budget?: string; skillLevel?: string; speed?: string }
    : undefined;

  return NextResponse.json(recommendTools({ input: input.input, constraints }));
}
