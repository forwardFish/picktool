# AI Task Solution Search｜MVP 开发文档 v0.5

> 版本：v0.5  
> 本次修改重点：**删除独立 Fastest Path 模块**，删除数据库里的 `fastestPath` 字段，删除页面里的 `FastestPath` 组件。  
> 主产品：**AI Task Solution Search**  
> 核心价值：**输入任务，获得 AI 完成方案**  
> 当前版本：**任务方案搜索**  
> 后续增强：**完整工具链方案**

---

# 0. v0.5 核心结论

v0.5 只保留 MVP 最重要的 3 个结果模块：

```text
1. Solution Card
   展示匹配方案 + 一句话解释

2. Recommended Tool Combination
   展示 3 个工具角色卡，每张卡说明输入和产出

3. Expand to Full Toolchain
   展示后续完整工具链占位入口
```

本版本明确删除：

```text
Fastest Path 独立模块
Step Details 独立模块
Next Step 独立模块
复杂流程图
长表格式输入/产出说明
```

原因：

```text
用户第一眼不是要看完整 SOP，而是要知道：
1. 我这个任务匹配到了什么方案？
2. 应该用哪几类工具？
3. 每类工具负责什么输入和产出？
4. 后面能不能扩展成完整工具链？
```

---

# 1. 产品定位

## 1.1 产品名称

```text
AI Task Solution Search
```

## 1.2 英文首页主标题

```text
Enter a task. Get the best AI solution.
```

## 1.3 英文首页副标题

```text
Tell us what you want to accomplish. We’ll match the right solution and recommend the best AI tool combination.
```

## 1.4 中文定位

```text
输入你要完成的任务，直接获得 AI 完成方案。
```

---

# 2. 产品核心流程

## 2.1 用户流程

```text
用户输入任务
↓
系统匹配任务方案
↓
展示 Solution Card
↓
展示 Recommended Tool Combination
↓
展示 Expand to Full Toolchain 占位入口
```

## 2.2 不再展示的流程

以下内容不再作为页面主模块展示：

```text
输入任务
↓
匹配 AI 完成方案
↓
展示最快路径
↓
推荐工具组合
↓
说明每一步输入与产出
↓
可选扩展为完整工具链
```

改为更轻的表达：

```text
输入任务
↓
匹配 AI 完成方案
↓
推荐工具组合
↓
可选扩展为完整工具链
```

---

# 3. 页面信息架构

## 3.1 输入前首页

页面只保留：

```text
AppHeader
HeroSearch
ExampleChips
```

Header 只保留：

```text
左侧：Logo + AI Task Solution Search
右侧：Log in
```

不显示：

```text
Templates
Tools
Ranking
Pricing
Prompt
Category
Sidebar
Dashboard Menu
```

## 3.2 输入后结果页

用户输入任务后，直接在输入框下方展示结果。

结果页只保留 3 个核心区：

```text
1. Solution Card
2. Recommended Tool Combination
3. Expand to Full Toolchain
```

可选保留一个轻量反馈：

```text
Was this useful?
```

---

# 4. 输入后页面结构

## 4.1 Solution Card

作用：

```text
告诉用户：你输入的任务匹配到了什么方案。
```

卡片内容：

```text
Recommended solution
TikTok Product Promo Video Solution

Start with the product angle, then create a short script, produce the video, and package it with the right cover and caption.

Tags:
Marketing
30–60 min
3 tools
Beginner-friendly
```

注意：

```text
Solution Card 里可以用一句话自然说明顺序，
但不再出现独立 Fastest Path 流程模块。
```

---

## 4.2 Recommended Tool Combination

作用：

```text
告诉用户：完成这个任务需要哪 3 类 AI 工具，以及每类工具负责什么输入和产出。
```

卡片固定为 3 张大卡：

```text
1. Plan & Script
   Tools: ChatGPT / Claude
   Input: Product, audience, benefit
   Output: Angle + short script

2. Create Video
   Tools: CapCut / Runway / Kling
   Input: Script + visuals
   Output: Draft video

3. Package & Publish
   Tools: Canva
   Input: Draft video + title angle
   Output: Cover + caption
```

注意：

```text
这里不是工具列表。
每张卡都必须说明：
- 工具角色
- 推荐工具
- 输入
- 产出
```

---

## 4.3 Expand to Full Toolchain

作用：

```text
告诉用户：这个任务未来可以扩展成完整业务目标工具链。
```

卡片内容：

```text
Expand to full toolchain

This task may be part of a larger goal: Product Marketing.

Product positioning → Promo video → Social posts → Landing page → Lead capture

Coming soon
```

第一版按钮：

```text
Coming soon
```

或者：

```text
Preview full toolchain
```

如果点击，先显示 Coming Soon 弹窗即可。

---

# 5. 删除模块清单

## 5.1 页面删除

删除以下页面模块：

```text
FastestPath
StepDetails
NextStep
Detailed Step Table
Large Workflow Timeline
You may also need
Related Tasks
Footer 多链接
```

## 5.2 组件删除

删除这些组件：

```text
components/results/FastestPath.tsx
components/results/StepDetails.tsx
components/results/NextStep.tsx
```

保留这些组件：

```text
components/layout/AppHeader.tsx
components/search/HeroSearch.tsx
components/search/ExampleChips.tsx
components/results/SolutionResultPanel.tsx
components/results/SolutionCard.tsx
components/results/RecommendedToolCombination.tsx
components/results/StackExpansionCard.tsx
components/results/ResultFeedback.tsx
```

## 5.3 数据库字段删除

删除：

```text
fastestPath
steps
SolutionStep
stepId
stepTitle
handoffToNext
qualityCheck
inputTemplate
nextStep
commonMistakes  // MVP 首页暂不展示，可以后续详情页再加
```

保留或新增：

```text
toolCombination
relatedStack
```

---

# 6. 推荐目录结构

```text
app/
├── page.tsx
├── layout.tsx
├── globals.css
└── api/
    └── search/
        └── solution/
            └── route.ts

components/
├── layout/
│   └── AppHeader.tsx
├── search/
│   ├── HeroSearch.tsx
│   └── ExampleChips.tsx
├── results/
│   ├── SolutionResultPanel.tsx
│   ├── SolutionCard.tsx
│   ├── RecommendedToolCombination.tsx
│   ├── StackExpansionCard.tsx
│   └── ResultFeedback.tsx
└── ui/
    ├── Button.tsx
    └── Card.tsx

lib/
├── data/
│   ├── solutionTemplates.ts
│   └── tools.ts
├── schemas/
│   ├── solution.ts
│   └── solution-types.ts
└── solution-engine/
    ├── matchSolution.ts
    └── buildSolutionResult.ts
```

---

# 7. 数据结构设计

## 7.1 Tool

```ts
export type Tool = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  logoUrl?: string;
  category: string;
  oneLineDescription: string;
};
```

## 7.2 ToolCombinationItem

```ts
export type ToolCombinationItem = {
  id: string;
  roleTitle: string;
  roleSubtitle: string;
  recommendedToolSlugs: string[];
  inputSummary: string;
  outputSummary: string;
  description: string;
};
```

## 7.3 SolutionTemplate

```ts
export type SolutionTemplate = {
  id: string;
  slug: string;
  taskKey: string;
  title: string;
  shortTitle: string;
  category: "creator" | "marketing" | "productivity" | "sales" | "business";
  intentKeywords: string[];
  platformKeywords?: string[];
  userInputExamples: string[];

  resultTitle: string;
  oneLineAdvice: string;
  primaryOutcome: string;

  estimatedTime: string;
  difficulty: "low" | "medium" | "high";

  badges: string[];

  toolCombination: ToolCombinationItem[];

  relatedStack?: {
    title: string;
    description: string;
    stackSlug: string;
    previewPath: string[];
  };
};
```

## 7.4 SolutionResult

```ts
export type SolutionResult = {
  id: string;
  userInput: string;
  matchedTemplateSlug: string;
  taskKey: string;
  confidence: number;

  resultTitle: string;
  oneLineAdvice: string;
  primaryOutcome: string;

  estimatedTime: string;
  difficulty: "low" | "medium" | "high";
  badges: string[];

  toolCombination: Array<{
    id: string;
    roleTitle: string;
    roleSubtitle: string;
    tools: Tool[];
    inputSummary: string;
    outputSummary: string;
    description: string;
  }>;

  relatedStack?: {
    title: string;
    description: string;
    stackSlug: string;
    previewPath: string[];
  };

  fallback?: boolean;
};
```

---

# 8. Zod Schema

路径：`lib/schemas/solution.ts`

```ts
import { z } from "zod";

export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  websiteUrl: z.string().url(),
  logoUrl: z.string().optional(),
  category: z.string(),
  oneLineDescription: z.string()
});

export const toolCombinationItemSchema = z.object({
  id: z.string(),
  roleTitle: z.string(),
  roleSubtitle: z.string(),
  recommendedToolSlugs: z.array(z.string()),
  inputSummary: z.string(),
  outputSummary: z.string(),
  description: z.string()
});

export const solutionTemplateSchema = z.object({
  id: z.string(),
  slug: z.string(),
  taskKey: z.string(),
  title: z.string(),
  shortTitle: z.string(),
  category: z.enum(["creator", "marketing", "productivity", "sales", "business"]),
  intentKeywords: z.array(z.string()),
  platformKeywords: z.array(z.string()).optional(),
  userInputExamples: z.array(z.string()),

  resultTitle: z.string(),
  oneLineAdvice: z.string(),
  primaryOutcome: z.string(),

  estimatedTime: z.string(),
  difficulty: z.enum(["low", "medium", "high"]),
  badges: z.array(z.string()),

  toolCombination: z.array(toolCombinationItemSchema).length(3),

  relatedStack: z.object({
    title: z.string(),
    description: z.string(),
    stackSlug: z.string(),
    previewPath: z.array(z.string())
  }).optional()
});

export const solutionSearchRequestSchema = z.object({
  input: z.string().min(2).max(500)
});

export const solutionResultSchema = z.object({
  id: z.string(),
  userInput: z.string(),
  matchedTemplateSlug: z.string(),
  taskKey: z.string(),
  confidence: z.number().min(0).max(1),

  resultTitle: z.string(),
  oneLineAdvice: z.string(),
  primaryOutcome: z.string(),

  estimatedTime: z.string(),
  difficulty: z.enum(["low", "medium", "high"]),
  badges: z.array(z.string()),

  toolCombination: z.array(z.object({
    id: z.string(),
    roleTitle: z.string(),
    roleSubtitle: z.string(),
    tools: z.array(toolSchema),
    inputSummary: z.string(),
    outputSummary: z.string(),
    description: z.string()
  })).length(3),

  relatedStack: z.object({
    title: z.string(),
    description: z.string(),
    stackSlug: z.string(),
    previewPath: z.array(z.string())
  }).optional(),

  fallback: z.boolean().optional()
});

export type Tool = z.infer<typeof toolSchema>;
export type ToolCombinationItem = z.infer<typeof toolCombinationItemSchema>;
export type SolutionTemplate = z.infer<typeof solutionTemplateSchema>;
export type SolutionResult = z.infer<typeof solutionResultSchema>;
export type SolutionSearchRequest = z.infer<typeof solutionSearchRequestSchema>;
```

---

# 9. 工具数据

路径：`lib/data/tools.ts`

```ts
import type { Tool } from "@/lib/schemas/solution";

export const tools: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    slug: "chatgpt",
    websiteUrl: "https://chatgpt.com",
    category: "writing",
    oneLineDescription: "Useful for turning goals into briefs, angles, scripts, and structured content."
  },
  {
    id: "claude",
    name: "Claude",
    slug: "claude",
    websiteUrl: "https://claude.ai",
    category: "writing",
    oneLineDescription: "Strong for long-form reasoning, structured writing, and high-quality content drafts."
  },
  {
    id: "capcut",
    name: "CapCut",
    slug: "capcut",
    websiteUrl: "https://www.capcut.com",
    category: "video",
    oneLineDescription: "Useful for editing short videos, captions, cuts, and publishing-ready drafts."
  },
  {
    id: "runway",
    name: "Runway",
    slug: "runway",
    websiteUrl: "https://runwayml.com",
    category: "video_generation",
    oneLineDescription: "Useful for AI-assisted video generation and visual exploration."
  },
  {
    id: "kling",
    name: "Kling",
    slug: "kling",
    websiteUrl: "https://klingai.com",
    category: "video_generation",
    oneLineDescription: "Useful for generating short AI video clips from visual prompts."
  },
  {
    id: "canva",
    name: "Canva",
    slug: "canva",
    websiteUrl: "https://www.canva.com",
    category: "design",
    oneLineDescription: "Useful for covers, social graphics, presentation design, and visual assets."
  },
  {
    id: "gamma",
    name: "Gamma",
    slug: "gamma",
    websiteUrl: "https://gamma.app",
    category: "presentation",
    oneLineDescription: "Useful for turning outlines into clean slide decks."
  },
  {
    id: "framer",
    name: "Framer",
    slug: "framer",
    websiteUrl: "https://www.framer.com",
    category: "website_builder",
    oneLineDescription: "Useful for building polished landing pages quickly."
  },
  {
    id: "tally",
    name: "Tally",
    slug: "tally",
    websiteUrl: "https://tally.so",
    category: "form",
    oneLineDescription: "Useful for lead forms, waitlists, and simple data collection."
  }
];
```

---

# 10. 方案模板数据

路径：`lib/data/solutionTemplates.ts`

核心示例：TikTok Product Promo Video。

```ts
import type { SolutionTemplate } from "@/lib/schemas/solution";

export const solutionTemplates: SolutionTemplate[] = [
  {
    id: "tiktok-product-promo-video",
    slug: "tiktok-product-promo-video",
    taskKey: "tiktok_product_promo_video",
    title: "TikTok Product Promo Video",
    shortTitle: "Product promo video",
    category: "marketing",
    intentKeywords: ["tiktok", "product", "promo", "video", "ad", "marketing", "short video"],
    platformKeywords: ["tiktok"],
    userInputExamples: [
      "I want to create a product promo video for TikTok.",
      "Create a TikTok product video.",
      "I need a short product ad video."
    ],
    resultTitle: "TikTok Product Promo Video Solution",
    oneLineAdvice: "Start with the product angle, then create a short script, produce the video, and package it with the right cover and caption.",
    primaryOutcome: "A clear AI-assisted plan for creating a short product promo video ready for publishing.",
    estimatedTime: "30–60 min",
    difficulty: "low",
    badges: ["Marketing", "3 tools", "Beginner-friendly"],
    toolCombination: [
      {
        id: "plan-and-script",
        roleTitle: "Plan & Script",
        roleSubtitle: "Angle and writing",
        recommendedToolSlugs: ["chatgpt", "claude"],
        inputSummary: "Product, audience, benefit",
        outputSummary: "Angle + short script",
        description: "Turn the product idea into a clear angle, hook, and short promo script."
      },
      {
        id: "create-video",
        roleTitle: "Create Video",
        roleSubtitle: "Video creation",
        recommendedToolSlugs: ["capcut", "runway", "kling"],
        inputSummary: "Script + visuals",
        outputSummary: "Draft video",
        description: "Create or edit the short video draft with captions, cuts, and visual assets."
      },
      {
        id: "package-publish",
        roleTitle: "Package & Publish",
        roleSubtitle: "Cover and assets",
        recommendedToolSlugs: ["canva"],
        inputSummary: "Draft video + title angle",
        outputSummary: "Cover + caption",
        description: "Design the cover, caption, and final visual assets for publishing."
      }
    ],
    relatedStack: {
      title: "Expand to full product marketing toolchain",
      description: "This task may be part of a larger goal: product marketing. Expand it into positioning, promo video, social posts, landing page, and lead capture.",
      stackSlug: "product-marketing-stack",
      previewPath: ["Product positioning", "Promo video", "Social posts", "Landing page", "Lead capture"]
    }
  }
];
```

开发时建议补齐另外 5 个模板：

```text
pdf-to-slides
saas-landing-page
ai-course-sales-page
rednote-product-post
instagram-carousel
```

每个模板都必须有 3 张工具角色卡，不能超过 3 张。

---

# 11. 匹配逻辑

路径：`lib/solution-engine/matchSolution.ts`

```ts
import { solutionTemplates } from "@/lib/data/solutionTemplates";
import type { SolutionTemplate } from "@/lib/schemas/solution";

type MatchResult = {
  template: SolutionTemplate;
  confidence: number;
};

function normalizeInput(input: string): string {
  return input.trim().toLowerCase();
}

function keywordScore(input: string, keywords: string[]): number {
  const normalized = normalizeInput(input);
  return keywords.reduce((score, keyword) => {
    return normalized.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

export function matchSolutionTemplate(input: string): MatchResult {
  const scored = solutionTemplates.map((template) => {
    const intentScore = keywordScore(input, template.intentKeywords);
    const platformScore = keywordScore(input, template.platformKeywords ?? []);
    const rawScore = intentScore * 2 + platformScore;

    return {
      template,
      rawScore
    };
  });

  scored.sort((a, b) => b.rawScore - a.rawScore);

  const best = scored[0];

  if (!best || best.rawScore <= 0) {
    return {
      template: solutionTemplates[0],
      confidence: 0.35
    };
  }

  return {
    template: best.template,
    confidence: Math.min(0.95, 0.45 + best.rawScore * 0.08)
  };
}
```

---

# 12. 构建结果

路径：`lib/solution-engine/buildSolutionResult.ts`

```ts
import { tools } from "@/lib/data/tools";
import type { SolutionTemplate, SolutionResult } from "@/lib/schemas/solution";

function resolveTools(slugs: string[]) {
  return slugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));
}

export function buildSolutionResult(
  input: string,
  template: SolutionTemplate,
  confidence: number
): SolutionResult {
  return {
    id: crypto.randomUUID(),
    userInput: input,
    matchedTemplateSlug: template.slug,
    taskKey: template.taskKey,
    confidence,

    resultTitle: template.resultTitle,
    oneLineAdvice: template.oneLineAdvice,
    primaryOutcome: template.primaryOutcome,

    estimatedTime: template.estimatedTime,
    difficulty: template.difficulty,
    badges: template.badges,

    toolCombination: template.toolCombination.map((item) => ({
      id: item.id,
      roleTitle: item.roleTitle,
      roleSubtitle: item.roleSubtitle,
      tools: resolveTools(item.recommendedToolSlugs),
      inputSummary: item.inputSummary,
      outputSummary: item.outputSummary,
      description: item.description
    })),

    relatedStack: template.relatedStack,
    fallback: confidence < 0.5
  };
}
```

---

# 13. API

路径：`app/api/search/solution/route.ts`

```ts
import { NextResponse } from "next/server";
import { solutionSearchRequestSchema, solutionResultSchema } from "@/lib/schemas/solution";
import { matchSolutionTemplate } from "@/lib/solution-engine/matchSolution";
import { buildSolutionResult } from "@/lib/solution-engine/buildSolutionResult";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = solutionSearchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { input } = parsed.data;
    const { template, confidence } = matchSolutionTemplate(input);
    const result = buildSolutionResult(input, template, confidence);

    const checked = solutionResultSchema.safeParse(result);

    if (!checked.success) {
      return NextResponse.json(
        { error: "Invalid solution result", details: checked.error.flatten() },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: checked.data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to search solution" },
      { status: 500 }
    );
  }
}
```

---

# 14. 页面组件

## 14.1 SolutionResultPanel

路径：`components/results/SolutionResultPanel.tsx`

```tsx
import type { SolutionResult } from "@/lib/schemas/solution";
import { SolutionCard } from "@/components/results/SolutionCard";
import { RecommendedToolCombination } from "@/components/results/RecommendedToolCombination";
import { StackExpansionCard } from "@/components/results/StackExpansionCard";
import { ResultFeedback } from "@/components/results/ResultFeedback";

export function SolutionResultPanel({ result }: { result: SolutionResult }) {
  return (
    <section className="grid gap-6">
      <SolutionCard result={result} />
      <RecommendedToolCombination items={result.toolCombination} />
      {result.relatedStack ? (
        <StackExpansionCard relatedStack={result.relatedStack} />
      ) : null}
      <ResultFeedback resultId={result.id} />
    </section>
  );
}
```

## 14.2 SolutionCard

路径：`components/results/SolutionCard.tsx`

```tsx
import type { SolutionResult } from "@/lib/schemas/solution";

export function SolutionCard({ result }: { result: SolutionResult }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20">
      <p className="text-sm font-medium text-blue-300">Recommended solution</p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {result.resultTitle}
      </h2>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        {result.oneLineAdvice}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {result.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-200"
          >
            {badge}
          </span>
        ))}
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-200">
          {result.estimatedTime}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-200">
          {Math.round(result.confidence * 100)}% match
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-medium text-slate-400">Outcome</p>
        <p className="mt-1 text-slate-200">{result.primaryOutcome}</p>
      </div>
    </div>
  );
}
```

## 14.3 RecommendedToolCombination

路径：`components/results/RecommendedToolCombination.tsx`

```tsx
import type { SolutionResult } from "@/lib/schemas/solution";

type ToolCombination = SolutionResult["toolCombination"];

export function RecommendedToolCombination({ items }: { items: ToolCombination }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white">Recommended tool combination</h3>

      <div className="mt-4 grid grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10"
          >
            <p className="text-sm text-blue-300">{item.roleSubtitle}</p>
            <h4 className="mt-2 text-xl font-semibold text-white">{item.roleTitle}</h4>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.tools.map((tool) => (
                <a
                  key={tool.slug}
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-200 hover:bg-white/[0.1]"
                >
                  {tool.name}
                </a>
              ))}
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {item.description}
            </p>

            <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
              <div>
                <p className="text-slate-500">Input</p>
                <p className="mt-1 text-slate-200">{item.inputSummary}</p>
              </div>
              <div>
                <p className="text-slate-500">Output</p>
                <p className="mt-1 text-slate-200">{item.outputSummary}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 14.4 StackExpansionCard

路径：`components/results/StackExpansionCard.tsx`

```tsx
type RelatedStack = {
  title: string;
  description: string;
  stackSlug: string;
  previewPath: string[];
};

export function StackExpansionCard({ relatedStack }: { relatedStack: RelatedStack }) {
  return (
    <div className="rounded-[28px] border border-blue-400/20 bg-blue-500/[0.08] p-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-blue-300">Future extension</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {relatedStack.title}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {relatedStack.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {relatedStack.previewPath.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-200">
                  {item}
                </span>
                {index < relatedStack.previewPath.length - 1 ? (
                  <span className="text-slate-500">→</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <button
          disabled
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-slate-300"
        >
          Coming soon
        </button>
      </div>
    </div>
  );
}
```

---

# 15. 首页 HeroSearch

路径：`components/search/HeroSearch.tsx`

```tsx
"use client";

import { useState } from "react";
import type { SolutionResult } from "@/lib/schemas/solution";
import { SolutionResultPanel } from "@/components/results/SolutionResultPanel";

const examples = [
  "I want to create a product promo video for TikTok.",
  "Turn a PDF into slides.",
  "Build a SaaS landing page.",
  "Create an AI course sales page."
];

export function HeroSearch() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(value?: string) {
    const finalInput = value ?? input;

    if (!finalInput.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/search/solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: finalInput })
      });

      const data = await response.json();
      setResult(data.result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-[32px] border border-blue-400/40 bg-white/[0.04] p-3 shadow-2xl shadow-blue-950/30">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe what you want to accomplish..."
            className="h-16 flex-1 bg-transparent px-5 text-lg text-white outline-none placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="h-14 rounded-2xl bg-blue-600 px-6 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Finding..." : "Find Solution"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => {
              setInput(example);
              handleSearch(example);
            }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.08]"
          >
            {example}
          </button>
        ))}
      </div>

      {result ? (
        <div className="mt-10">
          <SolutionResultPanel result={result} />
        </div>
      ) : null}
    </div>
  );
}
```

---

# 16. Codex 开发指令

把下面这段给 Codex：

```text
请基于 AI Task Solution Search v0.5 开发 MVP。

本版本删除独立 Fastest Path 模块，删除 Step Details 模块，删除 Next Step 模块。

结果页只保留：

1. Solution Card
   展示匹配方案 + 一句话解释 + badges + outcome

2. Recommended Tool Combination
   展示 3 个工具角色卡
   每张卡必须有：
   - 角色名
   - 推荐工具
   - 这类工具负责什么
   - Input
   - Output

3. Expand to Full Toolchain
   展示后续完整工具链占位入口
   按钮为 Coming soon

数据库 / 本地数据也必须同步精简：

删除：
- fastestPath
- steps
- SolutionStep
- StepDetails
- FastestPath
- nextStep
- commonMistakes

新增或保留：
- toolCombination

技术要求：
- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- 本地 seed data
- 不接数据库
- 不接真实 LLM
- 不做自动执行

组件只需要：
- AppHeader
- HeroSearch
- ExampleChips
- SolutionResultPanel
- SolutionCard
- RecommendedToolCombination
- StackExpansionCard
- ResultFeedback

默认输入：
I want to create a product promo video for TikTok.

必须匹配：
TikTok Product Promo Video Solution

必须展示 3 张工具卡：
1. Plan & Script — ChatGPT / Claude
2. Create Video — CapCut / Runway / Kling
3. Package & Publish — Canva

必须展示完整工具链占位：
Product positioning → Promo video → Social posts → Landing page → Lead capture
```

---

# 17. 验收标准

## 17.1 首页

必须只有：

```text
Logo
Login
Hero title
Search input
Example chips
```

## 17.2 输入后结果

必须只有：

```text
Solution Card
Recommended Tool Combination
Expand to Full Toolchain
```

## 17.3 不允许出现

```text
Fastest Path
Step Details
Next Step
Detailed Table
You may also need
Related Tasks
多余导航
左侧 Sidebar
```

## 17.4 数据字段检查

代码里不应该再出现：

```text
fastestPath
steps
SolutionStep
StepDetails
FastestPath
nextStep
```

---

# 18. 最终定稿

```text
主产品：AI Task Solution Search
核心价值：输入任务，获得 AI 完成方案
当前版本：任务方案搜索
当前页面模块：
1. Solution Card
2. Recommended Tool Combination
3. Expand to Full Toolchain
后续增强：完整工具链方案
```

MVP 第一版的重点不是展示完整路径，而是让用户快速理解：

```text
这个任务匹配到了什么方案？
应该用哪几类 AI 工具？
每类工具的输入和产出是什么？
后面能不能扩展成完整工具链？
```
