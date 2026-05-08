import type { AiTool } from './types.ts';

export type ToolAction = {
  type: 'open' | 'copy_prompt' | 'steps';
  label: string;
  value: string;
};

export function buildToolActions(tool: AiTool, taskInput = '当前任务'): ToolAction[] {
  const actions: ToolAction[] = [];
  if (tool.websiteUrl || tool.action.openUrl) {
    actions.push({
      type: 'open',
      label: '打开官网',
      value: tool.action.openUrl ?? tool.websiteUrl ?? ''
    });
  }
  actions.push({
    type: 'copy_prompt',
    label: '复制 Prompt',
    value: `我想完成这个任务：${taskInput}\n请你作为 ${tool.name} 使用助手，给我一套适合初学者的操作步骤、输入素材清单和交付检查清单。`
  });
  actions.push({
    type: 'steps',
    label: '查看步骤',
    value: [
      `1. 先确认 ${tool.name} 是否适合当前任务。`,
      '2. 准备输入材料：任务目标、素材、格式限制和参考样例。',
      `3. 在 ${tool.name} 中完成第一版输出。`,
      '4. 回到当前方案检查质量、成本和是否需要升级。'
    ].join('\n')
  });
  return actions;
}
