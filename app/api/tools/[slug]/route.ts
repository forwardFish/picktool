import { NextResponse } from 'next/server.js';
import { getToolBySlug } from '../../../../lib/data/tools.ts';
import { getToolDetailBySlug } from '../../../../lib/tool-catalog/tool-details.ts';

type ToolRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: ToolRouteContext) {
  const { slug } = await context.params;
  const result = getToolDetailBySlug(slug);

  if (result) {
    return NextResponse.json({
      ...result.tool,
      detail: result.detail,
      requestedSlug: result.requestedSlug,
      resolvedSlug: result.resolvedSlug,
      detailStatus: result.detailStatus,
      worthUsingIf: result.tool.bestFor
    });
  }

  const legacy = getToolBySlug(slug);
  if (legacy) {
    return NextResponse.json(legacy);
  }

  return NextResponse.json({ error: 'Tool not found.' }, { status: 404 });
}
