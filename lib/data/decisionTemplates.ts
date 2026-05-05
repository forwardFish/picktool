import type { DecisionTemplate } from '../schemas/toolDecision.ts';

export const promptExamples = [
  'I want to create a product promo video for TikTok.',
  'Turn a PDF into slides.',
  'Create a landing page.',
  'Make an Instagram carousel.',
  'Create an AI avatar video.',
  'Build a course sales page.'
];

export const decisionTemplates: DecisionTemplate[] = [
  {
    id: 'tiktok-product-promo-video',
    slug: 'tiktok-product-promo-video',
    setupSlug: 'tiktok-product-promo-video',
    taskTitle: 'Create a TikTok product promo video',
    keywords: ['tiktok', 'product', 'promo', 'video', 'ad', 'short', 'reel', 'reels', 'shorts', 'clip', 'caption'],
    examples: [
      'I want to create a product promo video for TikTok.',
      'Create a TikTok product video.',
      'I need a short product ad video.'
    ],
    recommendationType: 'tool_setup',
    resultTitle: 'Best Tool Setup for This Task',
    oneLineReason: 'This task needs message planning, video creation or editing, and publishing assets.',
    recommendedTools: [
      {
        id: 'message',
        toolSlugs: ['chatgpt', 'claude'],
        role: 'Angle, hook, script, and message planning',
        decision: 'Use ChatGPT or Claude before opening any video tool.',
        condition: 'Best when you need to clarify the product angle, audience, hook, and short script.',
        status: 'core'
      },
      {
        id: 'editing',
        toolSlugs: ['capcut'],
        role: 'Video editing',
        decision: 'Use CapCut if you already have product clips or want fast short-video editing.',
        condition: 'Best for captions, cuts, templates, music, and publish-ready export.',
        status: 'core'
      },
      {
        id: 'visuals',
        toolSlugs: ['runway', 'kling'],
        role: 'AI-generated visuals',
        decision: 'Use Runway or Kling only when real footage is not enough.',
        condition: 'Skip this if you already have strong product footage.',
        status: 'optional'
      },
      {
        id: 'packaging',
        toolSlugs: ['canva'],
        role: 'Cover, thumbnail, and publishing assets',
        decision: 'Use Canva at the end for the cover and supporting social assets.',
        condition: 'Best when the video draft is ready and you need clean publishing visuals.',
        status: 'core'
      }
    ],
    usagePlan: [
      {
        title: 'Shape the message',
        body: 'Use ChatGPT or Claude to create the hook, product angle, audience, and short script before opening any video tool.',
        tip: 'Do not start with a video generator first. A weak message will make every video output weak.'
      },
      {
        title: 'Create or edit the video',
        body: 'Use CapCut if you already have clips. Add Runway or Kling only when you need generated visuals.',
        tip: 'CapCut is enough for most quick editing tasks. Runway or Kling should be added only when real footage is not enough.'
      },
      {
        title: 'Package for publishing',
        body: 'Use Canva for a cover, thumbnail, caption graphic, or simple product visual that supports the final video.',
        tip: 'Ask ChatGPT or Claude to critique the hook, opening line, and cover before publishing.'
      }
    ],
    skipAdvice: [
      {
        id: 'skip-ai-video-generation',
        toolSlugs: ['runway', 'kling'],
        condition: 'You already have strong product footage',
        reason: 'Do not add AI video generation just because it is available. Editing real footage in CapCut is usually faster and more accurate.'
      },
      {
        id: 'skip-avatar',
        toolSlugs: ['heygen'],
        condition: 'The product should be the hero',
        reason: 'An AI avatar can distract from a simple product demo unless the task specifically needs a presenter.'
      },
      {
        id: 'skip-one-tool-video',
        toolSlugs: ['invideo'],
        condition: 'You need detailed control over clips, captions, and pacing',
        reason: 'A one-tool video generator is convenient, but CapCut gives more control when you already have usable clips.'
      }
    ],
    betterOptions: [
      {
        condition: 'Need AI-generated visuals',
        recommendation: 'Use Runway or Kling.',
        bestFor: 'New b-roll, product scenes, or motion clips when real footage is not enough.',
        toolSlugs: ['runway', 'kling']
      },
      {
        condition: 'Want one-tool video generation',
        recommendation: 'Use InVideo.',
        bestFor: 'Fast script-to-video drafts when you prefer speed over timeline control.',
        toolSlugs: ['invideo']
      },
      {
        condition: 'Need an AI avatar presenter',
        recommendation: 'Use HeyGen.',
        bestFor: 'Talking-head product explainers from a finished script.',
        toolSlugs: ['heygen']
      }
    ],
    costAdvice: {
      freePath: 'Start with ChatGPT or Claude for the script, edit existing footage in CapCut, and use Canva only for final cover assets.',
      lowCostPath: 'Pay only when a specific bottleneck appears: generated b-roll, avatar presenter, or higher-volume exports.',
      avoidPayingFor: [
        'AI video generation when existing product footage is strong',
        'avatar video when a simple product demo is enough',
        'multiple production tools before the message is clear'
      ]
    },
    bestFor: ['Short product promo videos', 'TikTok/Reels/Shorts-style launches', 'Teams with product clips or screen recordings'],
    notIdealFor: ['Cinematic commercials', 'Long-form brand films', 'Presenter-led avatar explainers as the main format'],
    switchSignals: ['You have no usable footage', 'You need a presenter', 'You want a one-tool draft more than edit control']
  },
  {
    id: 'general-task-fallback',
    slug: 'general-task-fallback',
    setupSlug: 'general-ai-task-decision',
    taskTitle: 'Clarify an AI tool setup for a task',
    keywords: [],
    examples: ['I need help choosing AI tools for a task.'],
    recommendationType: 'tool_setup',
    resultTitle: 'Best Tool Setup for This Task',
    oneLineReason: 'This input does not match a specific high-frequency template yet, so start with a small planning-first setup.',
    recommendedTools: [
      {
        id: 'message',
        toolSlugs: ['chatgpt', 'claude'],
        role: 'Clarify the task and draft the first plan',
        decision: 'Use ChatGPT or Claude to define the desired output, constraints, and first draft.',
        condition: 'Best when the task is still broad or does not match a specific local template.',
        status: 'core'
      },
      {
        id: 'packaging',
        toolSlugs: ['canva'],
        role: 'Simple visual packaging when needed',
        decision: 'Use Canva only if the final output needs simple visuals or publishing assets.',
        condition: 'Skip it for text-only work.',
        status: 'optional'
      }
    ],
    usagePlan: [
      {
        title: 'Clarify the output',
        body: 'Use ChatGPT or Claude to state the final asset, audience, format, and quality bar in one short brief.',
        tip: 'Do not pick a specialist tool until the output is clear.'
      },
      {
        title: 'Choose one production path',
        body: 'Use the brief to decide whether this is mainly writing, design, video, slides, or research.',
        tip: 'Start with one production tool, not a stack.'
      },
      {
        title: 'Package only if needed',
        body: 'Use Canva only when the output needs a visual cover, graphic, or shareable asset.',
        tip: 'Skip design tools for text-only deliverables.'
      }
    ],
    skipAdvice: [
      {
        id: 'skip-large-stack',
        toolSlugs: [],
        condition: 'The task is still vague',
        reason: 'Do not add multiple tools before you know the output format and success criteria.'
      }
    ],
    betterOptions: [
      {
        condition: 'It is a TikTok product promo video',
        recommendation: 'Use the TikTok product promo video setup.',
        bestFor: 'Message planning, editing, optional generated visuals, and cover assets.',
        toolSlugs: ['chatgpt', 'claude', 'capcut', 'runway', 'kling', 'canva']
      }
    ],
    costAdvice: {
      freePath: 'Use ChatGPT or Claude to create the brief and first draft. Add a production tool only when the output type is clear.',
      lowCostPath: 'Pay for one specialist tool only after a free draft proves the task direction.',
      avoidPayingFor: ['multiple tools before the task is clear', 'visual tools for text-only deliverables']
    },
    bestFor: ['Early task clarification', 'Inputs that do not match a local template yet', 'Low-cost first decisions'],
    notIdealFor: ['Highly specialized production work that already has a known tool', 'Tasks needing current market data'],
    switchSignals: ['The task maps to a known setup', 'A single specialist tool is clearly required']
  }
];

export const fallbackDecisionTemplate = decisionTemplates.find((template) => template.id === 'general-task-fallback')!;

export function getDecisionTemplateBySetupSlug(slug: string) {
  const normalized = slug === 'tiktok-product-video' ? 'tiktok-product-promo-video' : slug;
  return decisionTemplates.find((template) => template.setupSlug === normalized || template.slug === normalized);
}
