import type { TaskIntent } from './types.ts';

type IntentRule = {
  taskType: string;
  deliverable: string;
  capabilities: string[];
  keywords: string[];
};

const intentRules: IntentRule[] = [
  {
    taskType: 'video_editing',
    deliverable: 'short video',
    capabilities: ['video editing', 'captions', 'script writing', 'social export'],
    keywords: ['视频', '剪辑', '短视频', '出片', '字幕', 'capcut', 'tiktok', 'reels', 'shorts', 'video', 'edit']
  },
  {
    taskType: 'document_to_slides',
    deliverable: 'slide deck',
    capabilities: ['document summarization', 'slide outline', 'presentation design'],
    keywords: ['pdf', 'ppt', 'slides', 'presentation', '幻灯片', '转ppt', '转 ppt', 'deck']
  },
  {
    taskType: 'landing_page',
    deliverable: 'landing page',
    capabilities: ['copywriting', 'wireframe', 'website builder', 'page design'],
    keywords: ['landing page', '落地页', '官网', '网站', '页面', 'website', 'web page']
  },
  {
    taskType: 'market_research',
    deliverable: 'analysis report',
    capabilities: ['research', 'comparison', 'report writing', 'presentation design'],
    keywords: ['竞品', '竞争', 'analysis', 'competitor', 'research', '报告', '调研', 'market']
  },
  {
    taskType: 'image_design',
    deliverable: 'visual asset',
    capabilities: ['image generation', 'graphic design', 'layout'],
    keywords: ['图片', '海报', '封面', 'thumbnail', 'poster', 'image', 'design']
  }
];

export const capabilityKeywords: Record<string, string[]> = {
  'script writing': ['script', 'copywriting', 'writing', 'chat', 'assistant', '脚本', '文案'],
  'video editing': ['video editor', 'video editing', 'capcut', '剪辑', '字幕', 'captions'],
  captions: ['captions', 'subtitle', '字幕'],
  'social export': ['tiktok', 'reels', 'shorts', 'social'],
  'document summarization': ['pdf', 'document', 'summarize', 'summary', '文档'],
  'slide outline': ['ppt', 'slides', 'presentation', 'deck', '幻灯片'],
  'presentation design': ['presentation', 'slides', 'canva', 'design', 'layout'],
  copywriting: ['copywriting', 'landing page', 'marketing', '文案'],
  wireframe: ['wireframe', 'prototype', 'mockup'],
  'website builder': ['website builder', 'landing page builder', 'html', 'web'],
  'page design': ['page design', 'website', 'landing page', 'ui'],
  research: ['research', 'analysis', 'competitor', 'market', '调研'],
  comparison: ['comparison', 'competitor', 'benchmark', '对比'],
  'report writing': ['report', 'analysis', 'writing', '报告'],
  'graphic design': ['design', 'image', 'cover', 'thumbnail', 'poster'],
  'image generation': ['image generation', 'text to image', 'ai image']
};

function tokenize(input: string) {
  const lower = input.toLowerCase();
  const ascii = lower.match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [];
  const cjk = lower.match(/[\u4e00-\u9fff]{2,}/g) ?? [];
  return [...new Set([...ascii, ...cjk])];
}

function detectLanguage(input: string): TaskIntent['language'] {
  const hasZh = /[\u4e00-\u9fff]/.test(input);
  const hasEn = /[a-z]/i.test(input);
  if (hasZh && hasEn) return 'mixed';
  if (hasZh) return 'zh';
  return 'en';
}

export function inferTaskIntent(input: string, constraints: TaskIntent['constraints'] = {}): TaskIntent {
  const normalized = input.toLowerCase();
  const scored = intentRules
    .map((rule) => ({
      rule,
      score: rule.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).length
    }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0]?.score ? scored[0].rule : {
    taskType: 'general_ai_workflow',
    deliverable: 'finished output',
    capabilities: ['script writing'],
    keywords: []
  };

  return {
    taskType: best.taskType,
    deliverable: best.deliverable,
    requiredCapabilities: best.capabilities,
    constraints,
    language: detectLanguage(input),
    keywords: tokenize(input)
  };
}
