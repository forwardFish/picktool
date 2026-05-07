import type { CopilotSession, FullExecutionPlan, GeneratedOutput, WorkflowPlan } from '../workflow-generation/types.ts';

export type ArchiveResultType = 'copilot_session' | 'workflow_plan' | 'full_execution_plan';

export type ArchiveWorkflowData = {
  session?: CopilotSession;
  currentPlan?: WorkflowPlan;
  fullPlan?: FullExecutionPlan;
  refinements?: GeneratedOutput[];
};

export type ArchiveItem = {
  id: string;
  title: string;
  userInput: string;
  resultType: ArchiveResultType;
  workflowData: ArchiveWorkflowData;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveCreateInput = {
  title?: string;
  userInput: string;
  resultType?: ArchiveResultType;
  workflowData: ArchiveWorkflowData;
};

export function validateArchiveCreateInput(value: unknown): { ok: true; input: ArchiveCreateInput } | { ok: false; error: string; status: number } {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Archive payload must be an object.', status: 400 };
  const payload = value as Partial<ArchiveCreateInput>;
  if (typeof payload.userInput !== 'string' || payload.userInput.trim().length < 3) {
    return { ok: false, error: 'Archive userInput must be at least 3 characters.', status: 400 };
  }
  if (!payload.workflowData || typeof payload.workflowData !== 'object') {
    return { ok: false, error: 'Archive workflowData is required.', status: 400 };
  }
  return {
    ok: true,
    input: {
      title: typeof payload.title === 'string' ? payload.title.trim() : undefined,
      userInput: payload.userInput.trim(),
      resultType: payload.resultType ?? 'copilot_session',
      workflowData: payload.workflowData
    }
  };
}

