import { NextResponse } from 'next/server.js';
import { buildDecisionResult } from '../../../../lib/decision-engine/buildDecisionResult.ts';
import { getDecisionTemplateBySetupSlug } from '../../../../lib/data/decisionTemplates.ts';

type SetupRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: SetupRouteContext) {
  const { slug } = await context.params;
  const template = getDecisionTemplateBySetupSlug(slug);

  if (!template) {
    return NextResponse.json({ error: 'Setup not found.' }, { status: 404 });
  }

  return NextResponse.json(buildDecisionResult(template, template.examples[0] ?? template.taskTitle));
}
