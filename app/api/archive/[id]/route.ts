import { NextResponse } from 'next/server.js';
import { getArchiveStore } from '../../../../lib/archive/index.ts';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await getArchiveStore().get(id);
  if (!item) return NextResponse.json({ error: 'Archive item not found.' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await getArchiveStore().delete(id);
  if (!deleted) return NextResponse.json({ error: 'Archive item not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}


