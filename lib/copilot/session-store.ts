import { getArchiveStore } from '../archive/index.ts';
import {
  applyUpgrade,
  buildBasicPlan,
  buildSidebarState,
  buildAssistantIntro,
  createId,
  createInitialMessages,
  markPlanFullGenerated,
  markPlanRefinementReady,
  matchTaskTemplate,
  message,
  optionLabel
} from '../workflow-generation/engine.ts';
import { getConfiguredProvider } from '../workflow-generation/provider.ts';
import type { CopilotSession, FullPlanState, ModuleType, UpgradeOptionKey } from '../workflow-generation/types.ts';
import { getCopilotSessionStore } from './session-storage.ts';

function now() {
  return new Date().toISOString();
}

export async function startSession(taskInput: string): Promise<CopilotSession> {
  const template = matchTaskTemplate(taskInput);
  const plan = buildBasicPlan(template, taskInput);
  const timestamp = now();
  const session: CopilotSession = {
    id: createId('sess'),
    userInput: taskInput,
    matchedTemplateSlug: template.slug,
    messages: createInitialMessages(taskInput, plan),
    currentPlan: plan,
    sidebarState: buildSidebarState(plan),
    fullPlanState: 'collapsed',
    refinements: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
  return getCopilotSessionStore().save(session);
}

export function getSession(sessionId: string): Promise<CopilotSession | null> {
  return getCopilotSessionStore().get(sessionId);
}

async function saveSession(session: CopilotSession): Promise<CopilotSession> {
  session.updatedAt = now();
  return getCopilotSessionStore().save(session);
}

export function listSessions(): Promise<CopilotSession[]> {
  return getCopilotSessionStore().list();
}

export function clearSessions(): Promise<void> {
  return getCopilotSessionStore().clear();
}

function detectOptionIntent(content: string): UpgradeOptionKey | null {
  const normalized = content.toLowerCase();
  if (/完整|full plan|view full|execution plan|方案/.test(normalized)) return 'full_plan';
  if (/专业|professional|canva|polish|better/.test(normalized)) return 'professional';
  if (/省钱|免费|budget|cheap|free|cost/.test(normalized)) return 'budget';
  if (/自动|automated|automation|更快|invideo|template|模板|fast/.test(normalized)) return 'automated';
  if (/高级|advanced|视觉|visual|presentation/.test(normalized)) return 'advanced_visual';
  if (/够了|good enough|confirm/.test(normalized)) return 'good_enough';
  return null;
}

function detectRefinementIntent(content: string): ModuleType | null {
  const normalized = content.toLowerCase();
  if (/素材|materials|asset|资源/.test(normalized)) return 'materials';
  if (/字幕|封面|标题|cover|subtitle|visual/.test(normalized)) return 'subtitles_cover';
  if (/检查|导出|交付|check|export|delivery/.test(normalized)) return 'delivery_check';
  if (/脚本|文案|大纲|script|copy|outline/.test(normalized)) return 'script';
  return null;
}

async function applyOptionToSession(session: CopilotSession, optionKey: UpgradeOptionKey, userContent: string): Promise<CopilotSession> {
  session.messages.push(message('user', userContent));

  if (optionKey === 'full_plan' || optionKey === 'good_enough') {
    session.fullPlanState = 'ready';
    session.messages.push(message('assistant', 'The current setup is ready for a full execution plan. Click View full plan to expand the detailed steps and outputs.'));
    return saveSession(session);
  }

  const nextPlan = applyUpgrade(session.currentPlan, optionKey);
  session.currentPlan = nextPlan;
  session.sidebarState = buildSidebarState(nextPlan);
  session.fullPlanState = 'ready';
  session.messages.push(message('assistant', buildAssistantIntro(nextPlan)));
  session.messages.push(message('assistant', `${nextPlan.title}: ${nextPlan.combinationLabel}`, nextPlan.planType === 'basic' ? 'recommendation' : 'upgrade', { plan: nextPlan }));
  return saveSession(session);
}

export async function appendUserMessage(sessionId: string, content: string): Promise<CopilotSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const refinementIntent = detectRefinementIntent(content);
  if (refinementIntent && session.fullPlan) {
    session.messages.push(message('user', content));
    await saveSession(session);
    return refineSessionModule(sessionId, refinementIntent);
  }

  const optionIntent = detectOptionIntent(content);
  if (optionIntent) return applyOptionToSession(session, optionIntent, content);

  session.messages.push(message('user', content));
  session.messages.push(message('assistant', 'I got it. You can say “more professional”, “save money”, “more automated”, or “view full plan”, and I will update the current plan.'));
  return saveSession(session);
}

export async function selectOption(sessionId: string, optionKey: UpgradeOptionKey): Promise<CopilotSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;
  return applyOptionToSession(session, optionKey, optionLabel(optionKey));
}

export async function generateFullPlanForSession(sessionId: string): Promise<CopilotSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const provider = getConfiguredProvider();
  const fullPlan = await provider.generateFullPlan(session.currentPlan);
  const markedPlan = markPlanFullGenerated(session.currentPlan);
  session.currentPlan = markedPlan;
  session.sidebarState = buildSidebarState(markedPlan);
  session.fullPlan = fullPlan;
  session.fullPlanState = 'expanded';
  session.messages.push(message('user', 'View full plan'));
  session.messages.push(message('assistant', 'Here is the concise full execution plan based on your current setup.', 'full_plan', { fullPlan }));
  return saveSession(session);
}

export async function refineSessionModule(sessionId: string, moduleType: ModuleType): Promise<CopilotSession | null> {
  let session = await getSession(sessionId);
  if (!session) return null;
  if (!session.fullPlan) {
    const generated = await generateFullPlanForSession(sessionId);
    if (!generated?.fullPlan) return null;
    session = generated;
  }

  const provider = getConfiguredProvider();
  const fullPlan = session.fullPlan;
  if (!fullPlan) return null;
  const output = await provider.refine(fullPlan, moduleType);
  const markedPlan = markPlanRefinementReady(session.currentPlan);
  session.currentPlan = markedPlan;
  session.sidebarState = buildSidebarState(markedPlan);
  session.fullPlanState = 'completed';
  session.refinements.push(output);
  session.messages.push(message('assistant', `Generated: ${output.title}`, 'refinement', { generatedOutput: output }));
  return saveSession(session);
}

export function toWorkflowResult(session: CopilotSession) {
  return {
    sessionId: session.id,
    matchedTemplateSlug: session.matchedTemplateSlug,
    messages: session.messages,
    currentPlan: session.currentPlan,
    sidebarState: session.sidebarState,
    fullPlanState: session.fullPlanState as FullPlanState,
    fullPlan: session.fullPlan,
    refinements: session.refinements,
    savedArchiveId: session.savedArchiveId
  };
}

export async function saveSessionToArchive(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) return null;
  const archive = await getArchiveStore().create({
    title: `${session.currentPlan.title} · ${session.currentPlan.combinationLabel}`,
    userInput: session.userInput,
    resultType: 'copilot_session',
    workflowData: {
      session,
      currentPlan: session.currentPlan,
      fullPlan: session.fullPlan,
      refinements: session.refinements
    }
  });
  session.savedArchiveId = archive.id;
  await saveSession(session);
  return archive;
}
