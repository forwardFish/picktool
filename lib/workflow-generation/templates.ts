import type { TaskTemplate, UpgradeOption, WorkflowTool } from './types.ts';

export const toolCatalog: Record<string, WorkflowTool> = {
  chatgpt: {
    slug: 'chatgpt',
    name: 'ChatGPT / Claude',
    role: 'Script and structure',
    note: 'Turn messy project notes into a clear narration outline, section structure, and concise copy.',
    badge: 'AI writing',
    status: 'core'
  },
  capcut: {
    slug: 'capcut',
    name: '剪映 / CapCut',
    role: 'Editing, captions, export',
    note: 'Cut clips, add captions, transitions, music, and export the final video quickly.',
    badge: 'Editor',
    status: 'core'
  },
  canva: {
    slug: 'canva',
    name: 'Canva',
    role: 'Cover and info pages',
    note: 'Create covers, title pages, diagrams, and information pages so the presentation looks polished.',
    badge: 'Visual polish',
    status: 'upgrade'
  },
  invideo: {
    slug: 'invideo',
    name: 'InVideo',
    role: 'Template video automation',
    note: 'Generate a first-cut video from templates faster, with less manual editing but less control.',
    badge: 'Automation',
    status: 'upgrade'
  },
  runway: {
    slug: 'runway',
    name: 'Runway / Kling',
    role: 'Advanced AI visuals',
    note: 'Only useful when you lack visual assets and need generated footage.',
    badge: 'Advanced',
    status: 'skip'
  },
  heygen: {
    slug: 'heygen',
    name: 'HeyGen',
    role: 'Avatar narration',
    note: 'Skip unless you specifically need a talking avatar presenter.',
    badge: 'Avatar',
    status: 'skip'
  },
  premiere: {
    slug: 'premiere-pro',
    name: 'Premiere Pro',
    role: 'Professional editing suite',
    note: 'Powerful but too heavy for a fast MVP-style student showcase video.',
    badge: 'Pro editor',
    status: 'skip'
  }
};

export const baseUpgradeOptions: UpgradeOption[] = [
  {
    key: 'professional',
    label: '更专业一点',
    shortLabel: 'More professional',
    description: 'Add Canva or a stronger presentation layer for cleaner layout and deliverable polish.',
    icon: '💎'
  },
  {
    key: 'budget',
    label: '更省钱一点',
    shortLabel: 'Save money',
    description: 'Prioritize free tiers and avoid paid add-ons until the workflow is proven.',
    icon: '🪙'
  },
  {
    key: 'automated',
    label: '更自动化一点',
    shortLabel: 'More automated',
    description: 'Use templates and AI-assisted structure if speed matters more than fine manual control.',
    icon: '⚡'
  },
  {
    key: 'full_plan',
    label: '我想看完整方案',
    shortLabel: 'View full plan',
    description: 'Generate the execution steps only after you confirm this direction.',
    icon: '📄'
  }
];

export const refinementOptions = [
  { key: 'script', label: '帮我生成脚本', description: 'Generate the detailed outline, copy, or step-by-step content.' },
  { key: 'materials', label: '帮我列素材清单', description: 'List required assets, source materials, references, and constraints.' },
  { key: 'subtitles_cover', label: '帮我优化字幕与封面', description: 'Improve titles, presentation hierarchy, and visual packaging.' },
  { key: 'delivery_check', label: '导出方案', description: 'Create a final export, handoff, or delivery checklist.' }
] as const;

export const taskTemplates: TaskTemplate[] = [
  {
    id: 'graduation-project-video',
    slug: 'graduation-project-video',
    title: '毕业设计展示视频',
    keywords: ['毕业设计', '毕业论文', '展示视频', '答辩视频', '剪辑', 'PPT', '项目截图', '录屏', 'student project', 'graduation', 'portfolio video'],
    examples: ['我有一个毕业设计，想用 AI 帮我剪辑展示视频。', '毕业设计答辩视频怎么做？'],
    baseSummary: 'This is enough for most graduation project showcase videos: write the story clearly, then edit it into a clean short presentation.',
    baseTools: [toolCatalog.chatgpt, toolCatalog.capcut],
    skippedTools: [
      { toolSlug: 'runway', name: 'Runway / Kling', reason: 'Skip unless you lack screenshots, recordings, or visual assets.' },
      { toolSlug: 'heygen', name: 'HeyGen', reason: 'Skip unless you need a talking avatar.' },
      { toolSlug: 'premiere-pro', name: 'Premiere Pro', reason: 'Powerful but high learning cost for a quick showcase video.' }
    ]
  },
  {
    id: 'tiktok-product-promo-video',
    slug: 'tiktok-product-promo-video',
    title: 'TikTok product promo video',
    keywords: ['tiktok', 'product promo', '产品宣传', '短视频', 'product video', 'reels'],
    examples: ['I want to create a product promo video for TikTok.'],
    baseSummary: 'Start with copy and shot structure, then edit a short vertical video in CapCut.',
    baseTools: [toolCatalog.chatgpt, toolCatalog.capcut],
    skippedTools: [
      { toolSlug: 'runway', name: 'Runway / Kling', reason: 'Skip unless you need generated product visuals.' },
      { toolSlug: 'premiere-pro', name: 'Premiere Pro', reason: 'Too heavy for fast social video testing.' }
    ]
  },
  {
    id: 'pdf-to-ppt',
    slug: 'pdf-to-ppt',
    title: 'PDF 转 PPT',
    keywords: ['pdf', 'ppt', 'slides', 'presentation', '幻灯片'],
    examples: ['Help me turn a PDF into slides.'],
    baseSummary: 'Extract structure with ChatGPT / Claude, then rebuild the slides with Canva or PowerPoint.',
    baseTools: [toolCatalog.chatgpt, { ...toolCatalog.canva, status: 'core' }],
    skippedTools: [{ toolSlug: 'runway', name: 'Runway / Kling', reason: 'Video generation is unnecessary for document-to-slide work.' }]
  },
  {
    id: 'landing-page',
    slug: 'landing-page',
    title: 'Landing Page 制作',
    keywords: ['landing page', '官网', '落地页', 'website', '页面'],
    examples: ['做一个 Landing Page'],
    baseSummary: 'Start with messaging and page sections before choosing a no-code builder or developer workflow.',
    baseTools: [toolCatalog.chatgpt, { ...toolCatalog.canva, status: 'core', role: 'Wireframe and visuals' }],
    skippedTools: [{ toolSlug: 'premiere-pro', name: 'Premiere Pro', reason: 'Video editing is not needed for the first landing page draft.' }]
  },
  {
    id: 'competitor-analysis-report',
    slug: 'competitor-analysis-report',
    title: '竞品分析报告',
    keywords: ['竞品', 'competitor', 'analysis', 'report', 'market research', '调研'],
    examples: ['帮我做一份竞品分析报告'],
    baseSummary: 'Use an AI assistant to structure the analysis, then produce a concise report or deck.',
    baseTools: [toolCatalog.chatgpt, { ...toolCatalog.canva, status: 'core', role: 'Report layout' }],
    skippedTools: [{ toolSlug: 'invideo', name: 'InVideo', reason: 'Automated video is not required for a written report.' }]
  }
];

export const fallbackTemplate: TaskTemplate = {
  id: 'general-ai-workflow',
  slug: 'general-ai-workflow',
  title: 'General AI task workflow',
  keywords: [],
  examples: ['Tell me what you want to finish.'],
  baseSummary: 'Start with an AI assistant to clarify the deliverable, then use one practical creation tool to finish the output.',
  baseTools: [toolCatalog.chatgpt, toolCatalog.capcut],
  skippedTools: [
    { toolSlug: 'runway', name: 'Runway / Kling', reason: 'Skip advanced generation until the task clearly needs it.' },
    { toolSlug: 'premiere-pro', name: 'Premiere Pro', reason: 'Skip professional tools until simple tools become limiting.' }
  ]
};

