import { NextResponse } from 'next/server.js';
import { saveSessionToArchive } from '../../../../../lib/copilot/session-store.ts';

type Params = { params: Promise<{ sessionId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  const archive = await saveSessionToArchive(sessionId);
  if (!archive) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json(archive, { status: 201 });
}


