import { NextResponse } from 'next/server.js';
import { loadAiTools } from '../../../../lib/tool-catalog/load-tools.ts';
import { searchTools } from '../../../../lib/tool-catalog/search-tools.ts';
import { validateTaskInput } from '../../../../lib/workflow-generation/types.ts';

export async function POST(request: Request) {
  let payload: { input?: unknown; query?: unknown; limit?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const input = validateTaskInput(payload.input ?? payload.query);
  if (!input.ok) return NextResponse.json({ error: input.error }, { status: input.status });

  const loaded = loadAiTools();
  const limit = typeof payload.limit === 'number' && Number.isFinite(payload.limit) ? Math.min(Math.max(payload.limit, 1), 50) : 20;
  const tools = searchTools(loaded.tools, input.input, limit);
  return NextResponse.json({
    query: input.input,
    source: loaded.source,
    totalTools: loaded.tools.length,
    safetyFilteredCount: loaded.safetyFilteredCount,
    tools
  });
}
