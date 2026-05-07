import { NextResponse } from 'next/server.js';
import { getArchiveStore, validateArchiveCreateInput } from '../../../lib/archive/index.ts';

export async function GET() {
  return NextResponse.json({ items: await getArchiveStore().list() });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const parsed = validateArchiveCreateInput(payload);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const item = await getArchiveStore().create(parsed.input);
  return NextResponse.json(item, { status: 201 });
}


