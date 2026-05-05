import { NextResponse } from 'next/server.js';
import { getToolBySlug } from '../../../../lib/data/tools.ts';

type ToolRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: ToolRouteContext) {
  const { slug } = await context.params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return NextResponse.json({ error: 'Tool not found.' }, { status: 404 });
  }

  return NextResponse.json(tool);
}
