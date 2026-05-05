import { NextResponse } from 'next/server.js';
import { buildDecisionResult } from '../../../lib/decision-engine/buildDecisionResult.ts';
import { matchDecisionTemplate } from '../../../lib/decision-engine/matchDecisionTemplate.ts';
import { validateDecisionInput } from '../../../lib/schemas/toolDecision.ts';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const inputCandidate = typeof body === 'object' && body !== null && 'input' in body ? (body as { input?: unknown }).input : undefined;
  const validation = validateDecisionInput(inputCandidate);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const template = matchDecisionTemplate(validation.input);
  const result = buildDecisionResult(template, validation.input);

  return NextResponse.json(result);
}
