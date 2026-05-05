import type { Tool } from '../schemas/toolDecision.ts';

const tiktokSetup = {
  slug: 'tiktok-product-promo-video',
  title: 'Create a TikTok product promo video',
  role: 'Part of the short-video decision setup'
};

export const tools: Tool[] = [
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'Fast task framing, hooks, scripts, and critique.',
    category: 'AI assistant',
    pricing: 'Free / Paid',
    level: 'Beginner',
    decisionSummary: 'Use ChatGPT early when the task needs a hook, structure, script, prompt, checklist, or critique before opening production tools.',
    worthUsingIf: [
      'You need to turn a vague idea into a clear short-video angle',
      'You need hook options, scripts, captions, or prompt drafts',
      'You want a low-cost first pass before using paid production tools'
    ],
    probablySkipIf: [
      'You already have a finished script and only need timeline editing',
      'You need generated video clips as the main output',
      'You need direct design or video export instead of planning text'
    ],
    bestFitTasks: ['Script a TikTok product video', 'Draft landing page copy', 'Create critique checklists'],
    useWhen: [
      'Define the audience, product angle, hook, and success criteria',
      'Create a short script before editing or generating visuals',
      'Review the final hook and caption before publishing'
    ],
    avoidWhen: [
      'The production brief is already final',
      'The next task is pure video trimming or export',
      'The output must be a finished visual asset with no text planning step'
    ],
    workflowRoles: {
      position: 'First step',
      role: 'Message planning and quality critique',
      bestWith: ['Claude', 'CapCut', 'Canva', 'Runway', 'Kling'],
      usedAfter: 'The user describes the task.',
      usedBefore: 'Opening CapCut, Canva, Runway, Kling, or another production tool.'
    },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Want a more reflective writing partner', recommendation: 'Use Claude for longer reasoning and critique.', bestFor: 'Nuanced scripts and message review', toolSlugs: ['claude'] },
      { condition: 'Need current facts', recommendation: 'Use a source-backed research tool before drafting.', bestFor: 'Recent claims, vendor comparisons, or citations' }
    ],
    practicalDetails: {
      officialWebsite: 'chatgpt.com',
      category: 'AI assistant',
      pricing: 'Free / Paid',
      input: 'Text, documents, and images depending on plan',
      output: 'Scripts, outlines, prompts, captions, and critiques',
      platforms: 'Web, mobile, desktop apps depending on plan',
      commercialUse: 'Review workspace and provider terms for your plan.'
    }
  },
  {
    slug: 'claude',
    name: 'Claude',
    tagline: 'Careful writing, long-context reasoning, and script refinement.',
    category: 'AI assistant',
    pricing: 'Free / Paid',
    level: 'Beginner',
    decisionSummary: 'Use Claude when the task benefits from careful writing, structured critique, or longer source material before the production step.',
    worthUsingIf: [
      'You need a polished script or stronger narrative structure',
      'You want multiple hook angles with pros and cons',
      'You have longer notes or product context to condense'
    ],
    probablySkipIf: [
      'You already have a clear hook and script',
      'You only need video editing, captions, and export',
      'You need visual generation rather than text planning'
    ],
    bestFitTasks: ['Refine product video scripts', 'Summarize source material', 'Critique launch messaging'],
    useWhen: [
      'Improve the product angle and script clarity',
      'Condense product notes into a short-video plan',
      'Critique a final draft before publishing'
    ],
    avoidWhen: [
      'The task is direct video production',
      'You need one-click social export',
      'You need AI avatar or generated footage first'
    ],
    workflowRoles: {
      position: 'First step',
      role: 'Message planning and script refinement',
      bestWith: ['ChatGPT', 'CapCut', 'Canva'],
      usedAfter: 'The user describes the task or provides product notes.',
      usedBefore: 'Moving into a visual or video production tool.'
    },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Want faster short prompts', recommendation: 'Use ChatGPT for quick hook and caption variations.', bestFor: 'Fast ideation', toolSlugs: ['chatgpt'] },
      { condition: 'Need finished visual assets', recommendation: 'Move to CapCut or Canva after the message is clear.', bestFor: 'Production and export', toolSlugs: ['capcut', 'canva'] }
    ],
    practicalDetails: {
      officialWebsite: 'claude.ai',
      category: 'AI assistant',
      pricing: 'Free / Paid',
      input: 'Text, documents, and images depending on plan',
      output: 'Scripts, outlines, summaries, prompts, and critiques',
      platforms: 'Web, mobile, desktop apps depending on provider support',
      commercialUse: 'Review provider terms and workspace policy for commercial work.'
    }
  },
  {
    slug: 'capcut',
    name: 'CapCut',
    tagline: 'Fast short-video editing for social publishing.',
    category: 'Video editing',
    pricing: 'Free / Paid',
    level: 'Beginner',
    decisionSummary: 'Use CapCut when you already have clips and need fast editing, captions, templates, music, and social-ready export.',
    worthUsingIf: [
      'You publish TikTok, Reels, or Shorts-style videos',
      'You already have product clips or screen recordings',
      'You need captions, cuts, templates, music, and quick exports',
      'You want a free or low-cost editing path'
    ],
    probablySkipIf: [
      'You only need text-to-video from a prompt',
      'You want an AI avatar or talking-head presenter',
      'You need cinematic long-form production',
      'Your team already has a pro editing workflow'
    ],
    bestFitTasks: ['TikTok product promo video', 'Short social edits', 'Captioned product clips'],
    useWhen: [
      'You already have usable product footage',
      'You need captions and quick edits',
      'You want TikTok, Reels, or Shorts format',
      'You need templates, cuts, music, and export in one place'
    ],
    avoidWhen: [
      'You do not have a hook, script, or product angle yet',
      'You need AI-generated visuals before editing',
      'You need avatar-style video',
      'You need a high-end cinematic brand commercial'
    ],
    workflowRoles: {
      position: 'Middle step',
      role: 'Main editing tool',
      bestWith: ['ChatGPT', 'Claude', 'Canva', 'Runway', 'Kling'],
      usedAfter: 'You have a hook, short script, and product footage.',
      usedBefore: 'You create cover, caption, and publishing assets.'
    },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Need generated visuals', recommendation: 'Use Runway or Kling before editing.', bestFor: 'Extra b-roll or product scenes from prompts', toolSlugs: ['runway', 'kling'] },
      { condition: 'Want one-tool video generation', recommendation: 'Use InVideo.', bestFor: 'Script-to-video drafts with less editing control', toolSlugs: ['invideo'] },
      { condition: 'Need an AI presenter', recommendation: 'Use HeyGen.', bestFor: 'Avatar or talking-head product demos', toolSlugs: ['heygen'] }
    ],
    practicalDetails: {
      officialWebsite: 'capcut.com',
      category: 'Video editing',
      pricing: 'Free / Paid',
      input: 'Video clips, images, audio, text',
      output: 'Edited video, social video',
      platforms: 'Web, iOS, Android, desktop',
      commercialUse: 'Check music, template, and asset licensing before commercial use.'
    }
  },
  {
    slug: 'runway',
    name: 'Runway',
    tagline: 'AI-generated clips and creative b-roll.',
    category: 'AI video generation',
    pricing: 'Free / Paid',
    level: 'Intermediate',
    decisionSummary: 'Use Runway only when real footage is not enough and you need generated visuals to support the story.',
    worthUsingIf: ['You lack product b-roll or scene variety', 'You need visual concepts that are hard to film quickly', 'You can spend time testing prompts and selecting usable clips'],
    probablySkipIf: ['You already have strong product footage', 'You need only captions, cuts, and export', 'You need predictable product accuracy on the first try'],
    bestFitTasks: ['Generate b-roll', 'Create product mood shots', 'Prototype visual hooks'],
    useWhen: ['Generate missing b-roll', 'Create mood shots or transitions', 'Test visual hooks before editing'],
    avoidWhen: ['The message and hook are not defined', 'Existing footage is enough', 'The project requires exact product accuracy'],
    workflowRoles: { position: 'Optional middle step', role: 'AI visual generator', bestWith: ['ChatGPT', 'Claude', 'CapCut'], usedAfter: 'You know the visual gap in the video.', usedBefore: 'Final editing in CapCut.' },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Need final editing', recommendation: 'Use CapCut.', bestFor: 'Captions, trimming, music, and exports', toolSlugs: ['capcut'] },
      { condition: 'Need presenter video', recommendation: 'Use HeyGen.', bestFor: 'Avatar or talking-head product demos', toolSlugs: ['heygen'] }
    ],
    practicalDetails: { officialWebsite: 'runwayml.com', category: 'AI video generation', pricing: 'Free / Paid', input: 'Text prompts, images, reference clips', output: 'Generated short video clips', platforms: 'Web', commercialUse: 'Review plan-specific commercial and training-data policies.' }
  },
  {
    slug: 'kling',
    name: 'Kling',
    tagline: 'AI-generated motion clips from prompts or images.',
    category: 'AI video generation',
    pricing: 'Free / Paid',
    level: 'Intermediate',
    decisionSummary: 'Use Kling when you need generated motion clips and are prepared to iterate on prompts before editing the best results.',
    worthUsingIf: ['You need additional generated visual scenes', 'You have product images that could become motion clips', 'You can evaluate multiple outputs'],
    probablySkipIf: ['Existing clips are already strong', 'You only need captions and edits', 'You need exact product fidelity without review'],
    bestFitTasks: ['Image-to-video product scenes', 'Generated b-roll', 'Visual concept testing'],
    useWhen: ['Turn a still product image into motion', 'Create extra scenes for short social video', 'Fill gaps before final editing'],
    avoidWhen: ['The script is not clear', 'You have enough real footage', 'The product must be represented with exact details'],
    workflowRoles: { position: 'Optional middle step', role: 'AI motion generator', bestWith: ['ChatGPT', 'Claude', 'CapCut'], usedAfter: 'The visual need is defined.', usedBefore: 'Editing and captioning in CapCut.' },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Need quick editing', recommendation: 'Use CapCut.', bestFor: 'Timeline edits and social export', toolSlugs: ['capcut'] },
      { condition: 'Want one-tool video draft', recommendation: 'Use InVideo.', bestFor: 'Prompt-to-video drafts', toolSlugs: ['invideo'] }
    ],
    practicalDetails: { officialWebsite: 'klingai.com', category: 'AI video generation', pricing: 'Free / Paid', input: 'Text prompts, images, reference clips', output: 'Generated short video clips', platforms: 'Web and mobile availability varies by region', commercialUse: 'Review plan and region-specific commercial policies.' }
  },
  {
    slug: 'canva',
    name: 'Canva',
    tagline: 'Simple covers, thumbnails, captions, and launch assets.',
    category: 'Design and publishing',
    pricing: 'Free / Paid',
    level: 'Beginner',
    decisionSummary: 'Use Canva when the main content is ready and you need covers, thumbnails, social assets, simple layouts, or presentation polish.',
    worthUsingIf: ['You need clean visuals without a design-heavy workflow', 'You need covers, thumbnails, or social graphics', 'You want quick brand polish before publishing'],
    probablySkipIf: ['You only need raw text or research', 'You need advanced product design or code', 'The production tool already exports everything you need'],
    bestFitTasks: ['TikTok cover image', 'Social caption graphic', 'Product launch asset'],
    useWhen: ['Package a finished video or campaign asset', 'Create a cover, thumbnail, or visual summary', 'Apply simple brand style and export'],
    avoidWhen: ['The message is still unclear', 'You need complex interactive product UI', 'You need generated video clips rather than design assets'],
    workflowRoles: { position: 'Last step', role: 'Final visual packaging', bestWith: ['ChatGPT', 'Claude', 'CapCut'], usedAfter: 'The main video or message is ready.', usedBefore: 'Publishing or sharing the final asset.' },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Need main video editing', recommendation: 'Use CapCut.', bestFor: 'Editing, captions, music, and export', toolSlugs: ['capcut'] },
      { condition: 'Need generated visuals', recommendation: 'Use Runway or Kling.', bestFor: 'New video scenes', toolSlugs: ['runway', 'kling'] }
    ],
    practicalDetails: { officialWebsite: 'canva.com', category: 'Design and publishing', pricing: 'Free / Paid', input: 'Text, images, video clips, brand assets', output: 'Graphics, slides, PDFs, social assets', platforms: 'Web, mobile, desktop apps', commercialUse: 'Check template, stock, and brand asset licensing.' }
  },
  {
    slug: 'heygen',
    name: 'HeyGen',
    tagline: 'AI avatar and talking-head product explainers.',
    category: 'AI avatar video',
    pricing: 'Free / Paid',
    level: 'Beginner',
    decisionSummary: 'Use HeyGen when the task specifically needs an avatar presenter or talking-head explainer instead of product-footage editing.',
    worthUsingIf: ['You need a presenter-style product explanation', 'You do not want to film a spokesperson', 'The script is already clear'],
    probablySkipIf: ['You have strong product clips', 'You need quick TikTok-style editing', 'A real founder or creator video would feel more authentic'],
    bestFitTasks: ['AI avatar product demo', 'Explainer video from a script', 'Localized talking-head variants'],
    useWhen: ['The video needs a presenter', 'You need script-to-avatar output', 'You can review voice, likeness, and usage rights'],
    avoidWhen: ['You only need captions and cuts', 'The product footage should be the hero', 'The brand needs a human creator feel'],
    workflowRoles: { position: 'Shortcut production path', role: 'Avatar presenter generator', bestWith: ['ChatGPT', 'Claude', 'Canva'], usedAfter: 'A script has been drafted.', usedBefore: 'Final packaging and publishing.' },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Have real clips', recommendation: 'Use CapCut.', bestFor: 'Authentic short social edits', toolSlugs: ['capcut'] },
      { condition: 'Need generated b-roll', recommendation: 'Use Runway or Kling.', bestFor: 'Non-avatar visual scenes', toolSlugs: ['runway', 'kling'] }
    ],
    practicalDetails: { officialWebsite: 'heygen.com', category: 'AI avatar video', pricing: 'Free / Paid', input: 'Script, avatar choice, voice settings', output: 'Avatar video', platforms: 'Web', commercialUse: 'Review avatar, voice, consent, and plan-specific commercial terms.' }
  },
  {
    slug: 'invideo',
    name: 'InVideo',
    tagline: 'One-tool prompt-to-video and script-to-video drafting.',
    category: 'AI video creation',
    pricing: 'Free / Paid',
    level: 'Beginner',
    decisionSummary: 'Use InVideo when you want a quicker script-to-video draft in one place and can accept less timeline control than a dedicated editor.',
    worthUsingIf: ['You want one place to draft a simple video', 'You have a clear script and need a fast first version', 'You prefer speed over detailed manual editing'],
    probablySkipIf: ['You already have clips and want precise editing', 'You need exact brand control', 'You need generated cinematic scenes as separate assets'],
    bestFitTasks: ['Prompt-to-video draft', 'Script-to-video social asset', 'Simple explainer video'],
    useWhen: ['You want a shortcut from script to draft video', 'The task does not require detailed timeline control', 'You need a starting version to refine'],
    avoidWhen: ['You need precise edit control', 'You have strong footage and only need captions', 'Brand accuracy is more important than speed'],
    workflowRoles: { position: 'Shortcut path', role: 'One-tool video draft', bestWith: ['ChatGPT', 'Claude', 'Canva'], usedAfter: 'The script and angle are clear.', usedBefore: 'Final review and packaging.' },
    commonSetups: [tiktokSetup],
    betterOptionsIf: [
      { condition: 'Need editing control', recommendation: 'Use CapCut.', bestFor: 'Precise short-video editing', toolSlugs: ['capcut'] },
      { condition: 'Need generated visual scenes', recommendation: 'Use Runway or Kling.', bestFor: 'Prompted b-roll assets', toolSlugs: ['runway', 'kling'] }
    ],
    practicalDetails: { officialWebsite: 'invideo.io', category: 'AI video creation', pricing: 'Free / Paid', input: 'Prompts, scripts, media assets', output: 'Draft social videos and explainers', platforms: 'Web', commercialUse: 'Review stock, voice, watermark, and export rights for your plan.' }
  }
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsBySlugs(slugs: string[]) {
  return slugs.map(getToolBySlug).filter((tool): tool is Tool => Boolean(tool));
}
