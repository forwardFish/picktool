import { fallbackTemplate, baseUpgradeOptions, refinementOptions, taskTemplates, toolCatalog } from './templates.ts';
import { recommendTools } from '../tool-catalog/recommend-tools.ts';
import { buildToolActions } from '../tool-catalog/tool-actions.ts';
import { getAiToolBySlug } from '../tool-catalog/load-tools.ts';
import { resolveToolDetailSlug } from '../tool-catalog/tool-details.ts';
import type { AiTool } from '../tool-catalog/types.ts';
import type {
  ChatMessage,
  CurrentPlanSidebarState,
  FullExecutionPlan,
  GeneratedOutput,
  ModuleType,
  PlanType,
  TaskTemplate,
  UpgradeOption,
  UpgradeOptionKey,
  WorkflowPlan,
  WorkflowTool
} from './types.ts';

function now() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}

export function matchTaskTemplate(input: string): TaskTemplate {
  const normalized = input.toLowerCase();
  const scored = taskTemplates
    .map((template) => ({
      template,
      score:
        template.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).length +
        template.examples.filter((example) => normalized.includes(example.toLowerCase())).length * 2
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.template ?? fallbackTemplate;
}

function cloneTool(tool: WorkflowTool, overrides: Partial<WorkflowTool> = {}): WorkflowTool {
  return { ...tool, ...overrides };
}

function workflowToolFromCatalog(tool: AiTool, status: WorkflowTool['status'] = 'optional'): WorkflowTool {
  const actions = buildToolActions(tool);
  return {
    slug: tool.slug,
    name: tool.name,
    role: tool.bestFor[0] ?? tool.primaryCategory,
    note: tool.shortDescription,
    badge: tool.primaryCategory,
    status,
    source: tool.source,
    websiteUrl: tool.websiteUrl,
    detailSlug: resolveToolDetailSlug(tool.slug),
    actionPrompt: actions.find((action) => action.type === 'copy_prompt')?.value,
    useSteps: actions.find((action) => action.type === 'steps')?.value.split('\n')
  };
}

function isVideoTemplate(slug: string) {
  return slug === 'graduation-project-video' || slug === 'tiktok-product-promo-video' || slug === 'general-ai-workflow';
}

function planHasTool(plan: WorkflowPlan, slug: string) {
  return plan.tools.some((tool) => tool.slug === slug);
}

function appendToolIfMissing(tools: WorkflowTool[], tool: WorkflowTool) {
  return tools.some((item) => item.slug === tool.slug) ? tools : [...tools, tool];
}

function planToolsWith(plan: WorkflowPlan, tool: WorkflowTool) {
  return appendToolIfMissing(plan.tools.map((item) => cloneTool(item)), tool);
}

function applyCatalogRecommendation(plan: WorkflowPlan, optionKey?: UpgradeOptionKey): WorkflowPlan {
  const recommendation = recommendTools({
    input: plan.taskInput,
    optionKey,
    constraints: {
      budget: 'free_first',
      skillLevel: 'beginner',
      speed: optionKey === 'automated' ? 'fast' : undefined
    }
  });
  const existing = new Set(plan.tools.map((tool) => tool.slug));
  const enrichedPlanTools = plan.tools.map((tool) => {
    const catalogTool = getAiToolBySlug(tool.slug);
    if (!catalogTool) return tool;
    const catalogActions = buildToolActions(catalogTool, plan.taskInput);
    return {
      ...tool,
      source: catalogTool.source,
      websiteUrl: catalogTool.websiteUrl,
      detailSlug: resolveToolDetailSlug(tool.slug),
      actionPrompt: catalogActions.find((action) => action.type === 'copy_prompt')?.value,
      useSteps: catalogActions.find((action) => action.type === 'steps')?.value.split('\n')
    };
  });
  const mayAddCatalogTools = plan.templateSlug === 'landing-page' || plan.templateSlug === 'general-ai-workflow';
  const additions = recommendation.selectedTools
    .filter((tool) => mayAddCatalogTools && !existing.has(tool.slug) && tool.source !== 'manual')
    .slice(0, plan.planType === 'basic' ? 1 : 2)
    .map((tool) => workflowToolFromCatalog(tool, plan.planType === 'basic' ? 'optional' : 'upgrade'));
  const skippedBySlug = new Set(plan.skippedTools.map((tool) => tool.toolSlug));
  const skippedTools = [
    ...plan.skippedTools,
    ...recommendation.skippedTools
      .filter(({ tool }) => !skippedBySlug.has(tool.slug) && tool.source !== 'manual')
      .slice(0, 3)
      .map(({ tool, reason }) => ({ toolSlug: tool.slug, name: tool.name, reason }))
  ];

  const tools = additions.length ? [...enrichedPlanTools, ...additions] : enrichedPlanTools;
  if (!additions.length && skippedTools.length === plan.skippedTools.length) {
    return {
      ...plan,
      tools,
      catalogBacked: recommendation.catalogStats.totalTools > 0,
      catalogCandidateSlugs: recommendation.selectedTools.map((tool) => tool.slug)
    };
  }
  return {
    ...plan,
    tools,
    skippedTools,
    combinationLabel: additions.length ? tools.map((tool) => tool.name).join(' + ') : plan.combinationLabel,
    catalogBacked: true,
    catalogCandidateSlugs: recommendation.selectedTools.map((tool) => tool.slug)
  };
}

function isDocumentTemplate(slug: string) {
  return slug === 'pdf-to-ppt' || slug === 'competitor-analysis-report';
}

function isWebTemplate(slug: string) {
  return slug === 'landing-page';
}

function deliverableLabel(plan: WorkflowPlan) {
  if (plan.templateSlug === 'pdf-to-ppt') return 'slide deck';
  if (plan.templateSlug === 'landing-page') return 'landing page';
  if (plan.templateSlug === 'competitor-analysis-report') return 'analysis report';
  return 'video';
}

function optionSet(planType: PlanType): UpgradeOption[] {
  if (planType === 'professional') {
    return [
      { key: 'advanced_visual', label: '看更高级方案', shortLabel: 'Advanced visuals', description: 'Consider a higher-polish presentation layer only if the basic output feels too plain.', icon: '💠' },
      { key: 'good_enough', label: '现在这套就够了', shortLabel: 'Good enough', description: 'Confirm this setup and generate the execution plan when ready.', icon: '✅' },
      { key: 'full_plan', label: '查看完整方案', shortLabel: 'View full plan', description: 'Generate the full execution plan for this current setup.', icon: '📄' }
    ];
  }

  if (planType === 'automated') {
    return [
      { key: 'budget', label: '对比基础方案', shortLabel: 'Compare basic', description: 'Go back to a more controllable manual editing setup.', icon: '⚖️' },
      { key: 'good_enough', label: '现在这套就够了', shortLabel: 'Good enough', description: 'Use this faster automated combination.', icon: '✅' },
      { key: 'full_plan', label: '查看完整方案', shortLabel: 'View full plan', description: 'Generate the full execution plan for this current setup.', icon: '📄' }
    ];
  }

  if (planType === 'advanced_visual') {
    return [
      { key: 'professional', label: '回到专业实用方案', shortLabel: 'Back to practical', description: 'Return to the practical polished plan without adding unnecessary tools.', icon: '↩️' },
      { key: 'full_plan', label: '查看完整方案', shortLabel: 'View full plan', description: 'Generate the plan for the advanced presentation path.', icon: '📄' }
    ];
  }

  return baseUpgradeOptions;
}

export function buildBasicPlan(template: TaskTemplate, taskInput: string): WorkflowPlan {
  const timestamp = now();
  const plan: WorkflowPlan = {
    id: createId('plan'),
    templateSlug: template.slug,
    taskInput,
    title: '基础够用方案',
    planType: 'basic',
    stepNumber: 1,
    stepTitle: '先给够用方案',
    combinationLabel: template.baseTools.map((tool) => tool.name).join(' + '),
    summary: template.baseSummary,
    statusLabel: '已满足基础需求',
    statusDescription: 'Can execute directly and produce a useful first result quickly.',
    tools: template.baseTools.map((tool) => cloneTool(tool, { status: 'core' })),
    upgradeDirections: optionSet('basic'),
    skippedTools: template.skippedTools,
    nextActionLabel: '选择一个优化方向',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  return applyCatalogRecommendation(plan);
}

export function applyUpgrade(plan: WorkflowPlan, optionKey: UpgradeOptionKey): WorkflowPlan {
  const timestamp = now();
  const deliverable = deliverableLabel(plan);
  const videoFlow = isVideoTemplate(plan.templateSlug);

  if (optionKey === 'professional') {
    const tools = planToolsWith(plan, cloneTool(toolCatalog.canva, { status: planHasTool(plan, 'canva') ? 'core' : 'upgrade' }));
    return applyCatalogRecommendation({
      ...plan,
      id: createId('plan'),
      title: 'Professional plan',
      planType: 'professional',
      stepNumber: 2,
      stepTitle: 'More professional',
      combinationLabel: tools.map((tool) => tool.name).join(' + '),
      summary: videoFlow
        ? 'Add Canva on top of the basic editing workflow for covers, title pages, information pages, and cleaner visual presentation.'
        : `Use Canva as the production layer for a more polished ${deliverable}: cleaner structure, stronger layout, and presentation-ready output.`,
      statusLabel: 'Basic plan upgraded',
      statusDescription: 'The plan has been upgraded based on your choice.',
      tools,
      upgradeDirections: optionSet('professional'),
      nextActionLabel: 'View full plan',
      updatedAt: timestamp
    }, optionKey);
  }

  if (optionKey === 'budget') {
    const tools = plan.tools.map((tool) => cloneTool(tool, { status: tool.status === 'upgrade' ? 'optional' : tool.status }));
    return applyCatalogRecommendation({
      ...plan,
      id: createId('plan'),
      title: 'Budget plan',
      planType: 'budget',
      stepNumber: 2,
      stepTitle: 'Save money',
      combinationLabel: `${tools.map((tool) => tool.name).join(' + ')} (free tiers first)`,
      summary: `Stay with free tiers and the current task-fit tools first. Avoid paid add-ons until the ${deliverable} structure is confirmed.`,
      statusLabel: 'Free tiers first',
      statusDescription: 'Keeps the workflow practical while minimizing subscriptions.',
      tools,
      upgradeDirections: optionSet('basic'),
      nextActionLabel: 'View full plan',
      updatedAt: timestamp
    }, optionKey);
  }

  if (optionKey === 'automated') {
    const tools = videoFlow
      ? [cloneTool(toolCatalog.chatgpt, { status: 'core' }), cloneTool(toolCatalog.invideo, { status: 'upgrade' }), cloneTool(toolCatalog.canva, { status: 'optional' })]
      : planToolsWith(plan, cloneTool(toolCatalog.canva, { status: planHasTool(plan, 'canva') ? 'core' : 'upgrade', role: isWebTemplate(plan.templateSlug) ? 'Template and layout acceleration' : 'Template and layout acceleration' }));
    return applyCatalogRecommendation({
      ...plan,
      id: createId('plan'),
      title: 'Automated plan',
      planType: 'automated',
      stepNumber: 3,
      stepTitle: 'More automated',
      combinationLabel: videoFlow ? 'ChatGPT / Claude + InVideo (Canva optional)' : `${tools.map((tool) => tool.name).join(' + ')} (template accelerated)`,
      summary: videoFlow
        ? 'Use InVideo for a faster template-based first cut. Keep Canva optional for cover and visual polish. Choose this when speed matters more than control.'
        : `Use templates and AI-assisted structuring to speed up the ${deliverable}. This improves throughput without switching to irrelevant video tools.`,
      statusLabel: 'Faster completion',
      statusDescription: 'Suitable for fast output with less manual production work.',
      tools,
      upgradeDirections: optionSet('automated'),
      nextActionLabel: 'View full plan',
      updatedAt: timestamp
    }, optionKey);
  }

  if (optionKey === 'advanced_visual') {
    const professionalTools = planToolsWith(plan, cloneTool(toolCatalog.canva, { status: planHasTool(plan, 'canva') ? 'core' : 'upgrade' }));
    const tools = videoFlow
      ? appendToolIfMissing(professionalTools, cloneTool(toolCatalog.runway, { status: 'optional' }))
      : planToolsWith(plan, cloneTool(toolCatalog.canva, { status: planHasTool(plan, 'canva') ? 'core' : 'upgrade', role: isDocumentTemplate(plan.templateSlug) ? 'Advanced presentation design' : 'Advanced page design system' }));
    return applyCatalogRecommendation({
      ...plan,
      id: createId('plan'),
      title: videoFlow ? 'Advanced visual plan' : 'Advanced presentation plan',
      planType: 'advanced_visual',
      stepNumber: 3,
      stepTitle: videoFlow ? 'Advanced visual option' : 'Advanced presentation option',
      combinationLabel: videoFlow ? `${tools.map((tool) => tool.name).join(' + ')} (optional advanced visuals)` : `${tools.map((tool) => tool.name).join(' + ')} (advanced layout)`,
      summary: videoFlow
        ? 'Only add advanced AI visuals when your project lacks footage or needs generated scenes. Otherwise the professional plan is safer and faster.'
        : `Upgrade the visual system of the ${deliverable} with stronger layout, hierarchy, and reusable design patterns. No video-generation tools are needed.`,
      statusLabel: videoFlow ? 'Advanced visuals optional' : 'Advanced presentation optional',
      statusDescription: 'More polish, but only useful after the core content is clear.',
      tools,
      upgradeDirections: optionSet('advanced_visual'),
      nextActionLabel: 'View full plan',
      updatedAt: timestamp
    }, optionKey);
  }

  return { ...plan, updatedAt: timestamp };
}

export function buildSidebarState(plan: WorkflowPlan): CurrentPlanSidebarState {
  const readyForRefinement = plan.stepNumber >= 4;
  return {
    title: '当前方案',
    recommendationLabel: plan.title,
    combinationLabel: plan.combinationLabel,
    statusLabel: plan.statusLabel,
    statusDescription: plan.statusDescription,
    upgradeTitle: readyForRefinement ? '可继续细化' : plan.planType === 'basic' ? '可升级方向' : plan.planType === 'professional' ? '本次新增 / 还可升级' : '可选补充',
    upgradeDirections: plan.upgradeDirections,
    skippedTools: plan.skippedTools,
    selectedTools: plan.tools,
    ctaLabel: plan.nextActionLabel
  };
}

export function buildAssistantIntro(plan: WorkflowPlan): string {
  if (plan.planType === 'basic') return '如果你只是想先把任务做出来，我先给你一个够用方案。';
  if (plan.planType === 'professional') return '如果你想让展示视频更专业一点，建议在基础方案上加一个 Canva。';
  if (plan.planType === 'automated') return '如果你希望更快出片、少手动剪辑，可以考虑更自动化的组合。';
  if (plan.planType === 'budget') return '如果你想更省钱，先坚持免费版工具，等遇到明确瓶颈再升级。';
  return '如果你还想要更强的视觉表现，可以把高级 AI 视觉工具作为可选补充。';
}

export function message(role: ChatMessage['role'], content: string, kind: ChatMessage['kind'] = 'text', extras: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: createId('msg'),
    role,
    kind,
    content,
    createdAt: now(),
    ...extras
  };
}

export function createInitialMessages(taskInput: string, plan: WorkflowPlan): ChatMessage[] {
  return [
    message('user', taskInput),
    message('assistant', buildAssistantIntro(plan)),
    message('assistant', `${plan.title}: ${plan.combinationLabel}`, 'recommendation', { plan }),
    message('assistant', '如果你希望更好一点，我还可以继续给你不同方向。')
  ];
}

export function createUpgradeMessages(optionLabel: string, plan: WorkflowPlan): ChatMessage[] {
  return [
    message('user', optionLabel),
    message('assistant', buildAssistantIntro(plan)),
    message('assistant', `${plan.title}: ${plan.combinationLabel}`, plan.planType === 'basic' ? 'recommendation' : 'upgrade', { plan })
  ];
}

export function markPlanFullGenerated(plan: WorkflowPlan): WorkflowPlan {
  return {
    ...plan,
    stepNumber: 4,
    stepTitle: '查看完整方案',
    statusLabel: '完整方案已生成',
    statusDescription: 'A directly executable plan is ready.',
    nextActionLabel: '继续优化方案',
    updatedAt: now()
  };
}

export function markPlanRefinementReady(plan: WorkflowPlan): WorkflowPlan {
  return {
    ...plan,
    stepNumber: 5,
    stepTitle: '继续优化方案',
    statusLabel: '完整方案已生成',
    statusDescription: 'All core modules are planned. Choose one module to deepen.',
    upgradeDirections: [],
    nextActionLabel: '选择一个深化方向',
    updatedAt: now()
  };
}

export function generateFullExecutionPlan(plan: WorkflowPlan): FullExecutionPlan {
  const videoFlow = isVideoTemplate(plan.templateSlug);
  const deliverable = deliverableLabel(plan);

  const stepsByTemplate: Record<string, FullExecutionPlan['executionSteps']> = {
    'graduation-project-video': [
      { id: 'script', title: 'Organize script', body: 'Use ChatGPT / Claude to organize the project story, feature order, and narration.', toolSlugs: ['chatgpt'] },
      { id: 'edit', title: 'Edit final video', body: 'Use Jianying / CapCut to cut recordings, add captions, music, transitions, and export.', toolSlugs: ['capcut'] },
      { id: 'visuals', title: 'Create cover and info pages', body: planHasTool(plan, 'canva') ? 'Use Canva to design the cover, title page, and feature information pages.' : 'Keep visuals simple first; add Canva later only if the video needs polish.', toolSlugs: ['canva'] }
    ],
    'tiktok-product-promo-video': [
      { id: 'hook', title: 'Write the short-video hook', body: 'Use ChatGPT / Claude to create the hook, benefits, and 3-5 shot outline.', toolSlugs: ['chatgpt'] },
      { id: 'edit', title: 'Edit the vertical video', body: 'Use Jianying / CapCut to assemble vertical clips, captions, product close-ups, and CTA.', toolSlugs: ['capcut'] },
      { id: 'polish', title: 'Add cover and title cards', body: planHasTool(plan, 'canva') ? 'Use Canva to make the cover, title cards, and product callout graphics.' : 'Use simple in-editor title cards first; add Canva only if the creative needs polish.', toolSlugs: ['canva'] }
    ],
    'pdf-to-ppt': [
      { id: 'extract', title: 'Extract document structure', body: 'Use ChatGPT / Claude to extract the PDF thesis, headings, and slide-worthy claims.', toolSlugs: ['chatgpt'] },
      { id: 'outline', title: 'Create slide outline', body: 'Turn the extracted structure into a concise slide sequence with one message per slide.', toolSlugs: ['chatgpt'] },
      { id: 'design', title: 'Rebuild slide pages', body: 'Use Canva or PowerPoint-style layouts to rebuild readable slides, diagrams, and section pages.', toolSlugs: ['canva'] }
    ],
    'landing-page': [
      { id: 'message', title: 'Define page messaging', body: 'Use ChatGPT / Claude to define hero copy, target user, value proposition, sections, and CTA.', toolSlugs: ['chatgpt'] },
      { id: 'wireframe', title: 'Create first wireframe', body: 'Use Canva-style wireframes to arrange hero, proof, features, use cases, and FAQ sections.', toolSlugs: ['canva'] },
      { id: 'handoff', title: 'Prepare landing-page handoff', body: 'Prepare copy blocks, image needs, CTA text, and implementation notes for a builder or developer.', toolSlugs: ['chatgpt', 'canva'] }
    ],
    'competitor-analysis-report': [
      { id: 'scope', title: 'Define analysis dimensions', body: 'Use ChatGPT / Claude to define competitors, comparison dimensions, and evidence fields.', toolSlugs: ['chatgpt'] },
      { id: 'synthesis', title: 'Synthesize findings', body: 'Cluster findings into strengths, weaknesses, positioning, pricing, and opportunities.', toolSlugs: ['chatgpt'] },
      { id: 'report', title: 'Layout report or deck', body: 'Use Canva to turn the analysis into a clear report or presentation deck.', toolSlugs: ['canva'] }
    ],
    'general-ai-workflow': [
      { id: 'clarify', title: 'Clarify the target', body: 'Use ChatGPT / Claude to define the desired output, audience, constraints, and success criteria.', toolSlugs: ['chatgpt'] },
      { id: 'draft', title: 'Create first usable version', body: 'Use the simplest task-fit creation tool in the current plan to create a usable first version.', toolSlugs: plan.tools.map((tool) => tool.slug) },
      { id: 'check', title: 'Check and hand off', body: 'Review the output against the goal, simplify unnecessary tools, and prepare the final handoff.', toolSlugs: ['chatgpt'] }
    ]
  };

  const outputsByTemplate: Record<string, FullExecutionPlan['outputs']> = {
    'graduation-project-video': [
      { id: 'script', title: 'Video script', body: 'A clear outline and narration copy ready for recording or editing.' },
      { id: 'materials', title: 'Material list', body: 'Screenshots, recordings, images, audio, and files to prepare.' },
      { id: 'subtitles_cover', title: 'Captions and cover guidance', body: 'Caption style, cover concept, and title-page guidance.' },
      { id: 'delivery_check', title: 'Delivery checklist', body: 'A final checklist for format, quality, completeness, and export settings.' }
    ],
    'tiktok-product-promo-video': [
      { id: 'script', title: 'Short-video script', body: 'Hook, shot list, benefits, and CTA copy.' },
      { id: 'materials', title: 'Shooting and material list', body: 'Product clips, close-ups, proof points, and music needs.' },
      { id: 'subtitles_cover', title: 'Captions and cover guidance', body: 'Mobile-first caption and cover guidance.' },
      { id: 'delivery_check', title: 'Publishing checklist', body: 'Aspect ratio, length, captions, CTA, and export checks.' }
    ],
    'pdf-to-ppt': [
      { id: 'script', title: 'Slide outline', body: 'Slide-by-slide structure extracted from the PDF.' },
      { id: 'materials', title: 'Charts and citation list', body: 'Figures, tables, quotes, and source pages to preserve.' },
      { id: 'subtitles_cover', title: 'Title-slide and layout guidance', body: 'Cover slide, section dividers, and visual hierarchy.' },
      { id: 'delivery_check', title: 'Presentation checklist', body: 'Readability, citations, sequence, and export checks.' }
    ],
    'landing-page': [
      { id: 'script', title: 'Page copy', body: 'Hero, section copy, proof points, and CTA text.' },
      { id: 'materials', title: 'Page asset list', body: 'Logos, screenshots, illustrations, testimonials, and trust assets.' },
      { id: 'subtitles_cover', title: 'Visual hierarchy guidance', body: 'Hero composition, section hierarchy, and CTA emphasis.' },
      { id: 'delivery_check', title: 'Launch checklist', body: 'Responsive layout, links, metadata, analytics, and form behavior.' }
    ],
    'competitor-analysis-report': [
      { id: 'script', title: 'Report structure', body: 'Executive summary, comparison dimensions, and key findings.' },
      { id: 'materials', title: 'Evidence and source list', body: 'Competitor URLs, pricing notes, feature proof, screenshots, and citations.' },
      { id: 'subtitles_cover', title: 'Charts and cover guidance', body: 'Comparison tables, positioning map, and report cover layout.' },
      { id: 'delivery_check', title: 'Report checklist', body: 'Source quality, conclusion clarity, formatting, and share-ready export.' }
    ],
    'general-ai-workflow': [
      { id: 'script', title: 'Execution outline', body: `A clear outline for the ${deliverable}.` },
      { id: 'materials', title: 'Input material list', body: 'Inputs, references, assets, and constraints needed to finish.' },
      { id: 'subtitles_cover', title: 'Presentation polish guidance', body: 'Structure, clarity, naming, and presentation polish.' },
      { id: 'delivery_check', title: 'Delivery checklist', body: 'Quality, completeness, format, and handoff checks.' }
    ]
  };

  const cautions = videoFlow
    ? [
        'Do not start with complex AI video generation tools unless you lack source visuals.',
        'If you already have PPT, screenshots, and screen recordings, Runway / Kling are usually unnecessary.',
        'Confirm the basic story before spending time polishing visual details.'
      ]
    : [
        `Do not add video-generation tools for this ${deliverable}; they do not help the main task.`,
        'Confirm the content structure before spending time on visual polish.',
        'Keep the tool stack small until a specific bottleneck appears.'
      ];

  return {
    id: createId('full'),
    planId: plan.id,
    recommendation: {
      title: 'Recommended combination',
      combinationLabel: plan.combinationLabel,
      tools: plan.tools
    },
    executionSteps: stepsByTemplate[plan.templateSlug] ?? stepsByTemplate['general-ai-workflow'],
    outputs: outputsByTemplate[plan.templateSlug] ?? outputsByTemplate['general-ai-workflow'],
    cautions,
    actionChips: refinementOptions.map((option) => ({ key: option.key, label: option.label, description: option.description })),
    createdAt: now()
  };
}

export function refinePlanModule(fullPlan: FullExecutionPlan, moduleType: ModuleType): GeneratedOutput {
  const metadata = fullPlan.outputs.find((output) => output.id === moduleType);
  const title = metadata?.title ?? 'Detailed output';
  const commonPrefix = fullPlan.recommendation.combinationLabel;
  const outputBody = metadata?.body ?? 'Generate a focused, directly usable module for the current plan.';

  const sectionsByModule: Record<ModuleType, GeneratedOutput['sections']> = {
    script: [
      { title: 'Structure draft', items: [`Start from: ${title}.`, outputBody, 'Keep each section short, ordered, and tied to the final deliverable.'] },
      { title: 'Copy-ready content', items: ['Write one clear headline or section title per block.', 'Add only the details needed for execution.', 'End with the next concrete action.'] }
    ],
    materials: [
      { title: 'Required inputs', items: ['Primary source files or notes.', 'Reference examples or screenshots.', 'Brand, format, or delivery constraints.'] },
      { title: 'Optional additions', items: ['Extra visuals or proof points.', 'Alternative examples for style matching.', 'A backup export format if the first format fails.'] }
    ],
    subtitles_cover: [
      { title: 'Presentation guidance', items: ['Use a clear title and one supporting sentence.', 'Prioritize readability and hierarchy over decoration.', 'Keep visual accents consistent with the task context.'] },
      { title: 'Polish checks', items: ['Remove clutter.', 'Make the main takeaway visible at a glance.', 'Use consistent terminology across all sections.'] }
    ],
    delivery_check: [
      { title: 'Quality checks', items: ['Check that every required output is present.', 'Review formatting and naming.', 'Verify links, citations, media, or exports where applicable.'] },
      { title: 'Delivery files', items: ['Final deliverable.', 'Editable source or working file.', 'Supporting notes, sources, or asset list.'] }
    ]
  };

  return {
    id: createId('output'),
    moduleType,
    title,
    summary: `Generated from the current plan: ${commonPrefix}.`,
    sections: sectionsByModule[moduleType],
    createdAt: now()
  };
}

export function optionLabel(optionKey: UpgradeOptionKey) {
  return [...baseUpgradeOptions, ...optionSet('professional'), ...optionSet('automated'), ...optionSet('advanced_visual')].find((option) => option.key === optionKey)?.label ?? optionKey;
}


