import { NextResponse } from 'next/server.js';
import { buildBasicPlan, buildSidebarState, matchTaskTemplate, applyUpgrade } from '../../../../lib/workflow-generation/engine.ts';
import { getConfiguredProvider } from '../../../../lib/workflow-generation/provider.ts';
import { validateOptionKey, validateTaskInput } from '../../../../lib/workflow-generation/types.ts';

export async function POST(request: Request) {
  let payload: { input?: unknown; task?: unknown; optionKey?: unknown; includeFullPlan?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const input = validateTaskInput(payload.input ?? payload.task);
  if (!input.ok) return NextResponse.json({ error: input.error }, { status: input.status });
  const template = matchTaskTemplate(input.input);
  let plan = buildBasicPlan(template, input.input);
  if (payload.optionKey) {
    const option = validateOptionKey(payload.optionKey);
    if (!option.ok) return NextResponse.json({ error: option.error }, { status: option.status });
    if (option.optionKey !== 'full_plan' && option.optionKey !== 'good_enough') plan = applyUpgrade(plan, option.optionKey);
  }
  const fullPlan = payload.includeFullPlan ? await getConfiguredProvider().generateFullPlan(plan) : undefined;
  return NextResponse.json({ matchedTemplateSlug: template.slug, currentPlan: plan, sidebarState: buildSidebarState(plan), fullPlanState: fullPlan ? 'expanded' : 'collapsed', fullPlan });
}

