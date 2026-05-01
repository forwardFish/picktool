import { Bot, Clapperboard, FileText, Image, LayoutTemplate, Sparkles, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolRole = 'Core' | 'Optional' | 'Skip';

export type DecisionTool = {
  id: string;
  name: string;
  summary: string;
  useInTask: string;
  role: ToolRole;
  level: 'Beginner' | 'Intermediate';
  price: 'Free' | 'Free / Pro' | 'Free / Paid';
  icon: LucideIcon;
};

export type DecisionTemplate = {
  id: string;
  setupId: string;
  title: string;
  subtitle: string;
  summary: string;
  category: string;
  tags: string[];
  keywords: string[];
  exampleTask: string;
  tools: DecisionTool[];
  steps: Array<{
    title: string;
    body: string;
    tip: string;
  }>;
  skip: string[];
  betterOptions: Array<{
    condition: string;
    recommendation: string;
  }>;
  freePath: string[];
  avoidPayingFor: string[];
};

export const decisions: DecisionTemplate[] = [
  {
    id: 'product-video',
    setupId: 'tiktok-product-video',
    title: 'Create a TikTok product promo video',
    subtitle: 'Best Tool Setup for This Task',
    summary:
      'A proven workflow for planning, editing, generating visuals, and publishing a short product promo.',
    category: 'Marketing',
    tags: ['Video', 'Beginner-friendly'],
    keywords: ['video', 'tiktok', 'promo', 'ad', 'short', 'reel', 'product'],
    exampleTask: 'I want to create a product promo video for TikTok.',
    tools: [
      {
        id: 'chatgpt-claude',
        name: 'ChatGPT / Claude',
        summary: 'Ideation, scripts, hooks, and message planning.',
        useInTask: 'Plan the hook, key benefits, objections, and final script.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free',
        icon: Bot
      },
      {
        id: 'capcut',
        name: 'CapCut',
        summary: 'Video editing with templates, captions, and effects.',
        useInTask: 'Edit product clips into a TikTok-ready video.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free / Pro',
        icon: Clapperboard
      },
      {
        id: 'runway-kling',
        name: 'Runway / Kling',
        summary: 'AI video generation and b-roll creation.',
        useInTask: 'Generate optional b-roll or product visuals from text.',
        role: 'Optional',
        level: 'Intermediate',
        price: 'Free / Paid',
        icon: Sparkles
      },
      {
        id: 'canva',
        name: 'Canva',
        summary: 'Covers, captions, and branded text overlays.',
        useInTask: 'Create cover, captions, thumbnails, and text overlays.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free / Pro',
        icon: Image
      }
    ],
    steps: [
      {
        title: 'Shape the message',
        body: 'Use ChatGPT or Claude to define the hook, benefits, objections, and short script.',
        tip: 'Start with the first 3 seconds hook.'
      },
      {
        title: 'Create or edit the video',
        body: 'Edit clips in CapCut with templates, captions, effects, and trending formats.',
        tip: 'Keep it short, clear, and attention-grabbing.'
      },
      {
        title: 'Enhance with AI',
        body: 'Use Runway or Kling only when you need extra product visuals or b-roll.',
        tip: 'Add bold text and high-contrast visuals.'
      },
      {
        title: 'Package and publish',
        body: 'Design a cover and final captions in Canva, then publish the finished short.',
        tip: 'Preview in full screen before posting.'
      }
    ],
    skip: ['Full tool directories', 'Long workflow builders', 'Paid avatar tools unless a face-led ad is required'],
    betterOptions: [
      { condition: 'Already have clips', recommendation: 'Use CapCut only.' },
      { condition: 'Want all-in-one editing', recommendation: 'Use InVideo.' },
      { condition: 'Want avatar style', recommendation: 'Use HeyGen.' },
      { condition: 'Need stronger visuals', recommendation: 'Use Runway or Kling.' }
    ],
    freePath: ['ChatGPT / Claude Free', 'CapCut Free', 'Canva Free'],
    avoidPayingFor: ['Runway / Kling', 'HeyGen', 'InVideo']
  },
  {
    id: 'pdf-to-slides',
    setupId: 'pdf-to-slides-briefing',
    title: 'Turn a PDF into presentation slides',
    subtitle: 'Best Tool Setup for This Task',
    summary:
      'A lightweight workflow for extracting the core message, shaping the deck, and polishing visuals.',
    category: 'Content',
    tags: ['Slides', 'Research'],
    keywords: ['pdf', 'slides', 'deck', 'presentation', 'ppt', 'briefing'],
    exampleTask: 'Turn this PDF into a client presentation.',
    tools: [
      {
        id: 'chatgpt-claude',
        name: 'ChatGPT / Claude',
        summary: 'Extracts structure, key points, and slide narrative.',
        useInTask: 'Summarize the PDF and propose the slide outline.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free',
        icon: Bot
      },
      {
        id: 'gamma',
        name: 'Gamma',
        summary: 'Generates clean first-draft decks.',
        useInTask: 'Create the initial slide structure from the outline.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free / Pro',
        icon: LayoutTemplate
      },
      {
        id: 'canva',
        name: 'Canva',
        summary: 'Visual polish, layout fixes, and export.',
        useInTask: 'Refine slide visuals and make the deck presentable.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free / Pro',
        icon: Image
      }
    ],
    steps: [
      {
        title: 'Extract the message',
        body: 'Ask ChatGPT or Claude for the audience, thesis, proof points, and slide outline.',
        tip: 'Ask for one idea per slide.'
      },
      {
        title: 'Generate the first draft',
        body: 'Paste the outline into Gamma and generate a first-pass deck.',
        tip: 'Use a restrained theme before adding visuals.'
      },
      {
        title: 'Polish the visuals',
        body: 'Move the best slides into Canva or refine the Gamma deck directly.',
        tip: 'Remove dense paragraphs before export.'
      }
    ],
    skip: ['Complex BI dashboards', 'Video tools', 'Avatar tools'],
    betterOptions: [
      { condition: 'Need strict PowerPoint format', recommendation: 'Use PowerPoint Designer after the outline.' },
      { condition: 'Need a fast client-ready draft', recommendation: 'Use Gamma first.' },
      { condition: 'Need brand control', recommendation: 'Use Canva for final polish.' }
    ],
    freePath: ['ChatGPT / Claude Free', 'Gamma Free', 'Canva Free'],
    avoidPayingFor: ['Research agents', 'Avatar video tools']
  },
  {
    id: 'landing-page',
    setupId: 'landing-page-launch',
    title: 'Create a landing page for a product idea',
    subtitle: 'Best Tool Setup for This Task',
    summary:
      'A focused setup for positioning, page copy, layout generation, and launch-ready refinement.',
    category: 'Startup',
    tags: ['Website', 'Copy'],
    keywords: ['landing', 'website', 'homepage', 'saas', 'startup', 'page'],
    exampleTask: 'I need a landing page for my new SaaS idea.',
    tools: [
      {
        id: 'chatgpt-claude',
        name: 'ChatGPT / Claude',
        summary: 'Positioning, audience, objections, and page copy.',
        useInTask: 'Define the offer, headline, sections, and proof.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free',
        icon: Bot
      },
      {
        id: 'v0',
        name: 'v0',
        summary: 'Generates production-minded React UI drafts.',
        useInTask: 'Turn page sections into a modern interface draft.',
        role: 'Core',
        level: 'Intermediate',
        price: 'Free / Pro',
        icon: LayoutTemplate
      },
      {
        id: 'canva',
        name: 'Canva',
        summary: 'Simple visual assets and social preview graphics.',
        useInTask: 'Create simple supporting visuals and launch graphics.',
        role: 'Optional',
        level: 'Beginner',
        price: 'Free / Pro',
        icon: Image
      }
    ],
    steps: [
      {
        title: 'Clarify the offer',
        body: 'Use ChatGPT or Claude to define audience, promise, sections, and objections.',
        tip: 'Write the headline after the value proposition is clear.'
      },
      {
        title: 'Generate the UI draft',
        body: 'Use v0 to create a first layout with hero, CTA, proof, and FAQ sections.',
        tip: 'Ask for fewer sections, not more.'
      },
      {
        title: 'Polish and ship',
        body: 'Refine copy, remove vague claims, and add only the assets that support the offer.',
        tip: 'One primary CTA is enough for v1.'
      }
    ],
    skip: ['Full design systems', 'Analytics suites', 'Paid image generation unless visuals are central'],
    betterOptions: [
      { condition: 'Need pure copy first', recommendation: 'Use ChatGPT / Claude only.' },
      { condition: 'Need a coded UI draft', recommendation: 'Use v0.' },
      { condition: 'Need a no-code page', recommendation: 'Use Framer or Webflow.' }
    ],
    freePath: ['ChatGPT / Claude Free', 'v0 Free'],
    avoidPayingFor: ['Large CMS tools', 'Complex analytics before launch']
  },
  {
    id: 'general',
    setupId: 'general-ai-tool-decision',
    title: 'Choose the right AI tools for a task',
    subtitle: 'Best Tool Setup for This Task',
    summary:
      'A simple decision path for turning an unclear task into a small, useful AI tool stack.',
    category: 'General',
    tags: ['Decision', 'Beginner-friendly'],
    keywords: [],
    exampleTask: 'Help me pick the right AI tools for this task.',
    tools: [
      {
        id: 'chatgpt-claude',
        name: 'ChatGPT / Claude',
        summary: 'Clarifies the task and creates the first output plan.',
        useInTask: 'Break the task into inputs, desired output, and quality checks.',
        role: 'Core',
        level: 'Beginner',
        price: 'Free',
        icon: Bot
      },
      {
        id: 'perplexity',
        name: 'Perplexity',
        summary: 'Finds current options and source-backed context.',
        useInTask: 'Check recent tool options when the task depends on current products.',
        role: 'Optional',
        level: 'Beginner',
        price: 'Free / Pro',
        icon: FileText
      },
      {
        id: 'canva',
        name: 'Canva',
        summary: 'Turns simple output into a shareable visual.',
        useInTask: 'Create a clean visual if the final deliverable needs presentation.',
        role: 'Optional',
        level: 'Beginner',
        price: 'Free / Pro',
        icon: Image
      }
    ],
    steps: [
      {
        title: 'Define the output',
        body: 'Describe the task, intended audience, constraints, and the format you need.',
        tip: 'If the output is unclear, ask for three possible formats first.'
      },
      {
        title: 'Pick the smallest stack',
        body: 'Start with one core assistant, then add a specialist only if it removes real friction.',
        tip: 'Avoid using five tools when one tool can finish the job.'
      },
      {
        title: 'Check quality',
        body: 'Review accuracy, usefulness, and whether a cheaper path gives the same result.',
        tip: 'Pay only when the free path is the bottleneck.'
      }
    ],
    skip: ['Tool rankings', 'Complex automation', 'Paid plans before the first useful output'],
    betterOptions: [
      { condition: 'Need current facts', recommendation: 'Add Perplexity.' },
      { condition: 'Need visual output', recommendation: 'Add Canva.' },
      { condition: 'Need coded output', recommendation: 'Use a coding assistant.' }
    ],
    freePath: ['ChatGPT / Claude Free', 'Perplexity Free when current facts matter'],
    avoidPayingFor: ['Workflow automation tools', 'Specialist tools before the task is clear']
  }
];

export function matchDecision(task: string) {
  const normalizedTask = task.trim().toLowerCase();

  if (!normalizedTask) {
    return decisions[0];
  }

  return (
    decisions.find((decision) =>
      decision.keywords.some((keyword) => normalizedTask.includes(keyword))
    ) ?? decisions.find((decision) => decision.id === 'general') ?? decisions[0]
  );
}

export function getDecisionById(id: string) {
  return decisions.find((decision) => decision.id === id);
}

export function getDecisionBySetupId(setupId: string) {
  return decisions.find((decision) => decision.setupId === setupId);
}

export function getToolById(id: string) {
  for (const decision of decisions) {
    const tool = decision.tools.find((item) => item.id === id);
    if (tool) {
      return {
        tool,
        decision
      };
    }
  }

  return undefined;
}

export const promptExamples = [
  'I want to create a product promo video for TikTok.',
  'Turn this PDF into a client presentation.',
  'I need a landing page for my new SaaS idea.',
  'Create an Instagram carousel from a blog post.',
  'Make an AI avatar video for a product demo.'
];
