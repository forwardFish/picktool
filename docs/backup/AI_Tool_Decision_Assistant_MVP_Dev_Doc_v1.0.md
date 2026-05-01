# AI Tool Decision Assistant｜MVP 开发文档 v1.0

> 版本：v1.0  
> 本次定稿：从 **AI Tool Combo Card** 正式调整为 **AI Tool Decision Assistant**。  
> 核心变化：不再强调“工具组合卡”，而是强调“帮用户做 AI 工具选择决策”。  
> 目标：让用户输入一个任务后，快速知道 **该用哪个 AI 工具、哪个必须用、哪个只是可选、有没有一个工具能直接搞定、先用哪个后用哪个**。

---

## 0. 最终定位

### 0.1 产品名称

```text
AI Tool Decision Assistant
```

中文理解：

```text
AI 工具决策助手
```

### 0.2 不再使用的旧定位

不要再使用：

```text
AI Tool Combo Card
Turn any task into the right AI tool card.
Generate Tool Card
```

原因：

```text
这些表达容易让用户误解成“生成工具卡片”，而不是“帮我判断该用什么 AI 工具”。
```

### 0.3 最终核心价值

```text
输入任务，获得最适合当前任务的 AI 工具选择建议、使用顺序和更简单的替代方案。
```

更直白地说：

```text
用户不是来逛 AI 工具目录的。
用户是来问：这个任务我到底该用哪个 AI 工具？
```

---

## 1. 产品解决的核心问题

用户真正想知道的不是：

```text
有哪些 AI 工具？
```

而是：

```text
这个任务到底用哪个工具？
哪些工具必须用？
哪些工具只是可选？
有没有一个工具可以直接搞定？
我应该先用哪个，后用哪个？
如果我已经有素材，还需要 AI 生成工具吗？
如果我想省事，有没有 all-in-one 工具？
```

所以本产品的输出不是工具列表，而是：

```text
Best Tool Setup for This Task
```

---

## 2. 与 Toolify / There’s An AI For That 的区别

### 2.1 Toolify / There’s An AI For That 的核心

它们更像：

```text
Find AI tools.
Discover AI tools.
Browse AI tools.
Search AI tools.
```

它们的核心单位是：

```text
Tool
```

典型页面结构：

```text
工具名称
工具分类
工具标签
工具介绍
工具列表
工具排行
工具搜索
```

用户看完以后，还需要自己判断：

```text
哪个最适合？
哪个先用？
哪个可以不用？
哪个是主工具？
哪个只是辅助工具？
```

### 2.2 本产品的核心

本产品不是 AI 工具导航，而是：

```text
Decide which AI tools to use.
```

本产品的核心单位不是 Tool，而是：

```text
Task Decision
```

典型页面结构：

```text
用户输入任务
↓
Best Tool Setup for This Task
↓
For this task, use
↓
How to use it
↓
Better options if
```

### 2.3 一句话差异

```text
Toolify / There’s An AI For That help users find AI tools.
AI Tool Decision Assistant helps users decide which AI tools to use and how to use them.
```

中文理解：

```text
别人帮用户找工具。
我们帮用户决定用什么工具，以及怎么用。
```

---

## 3. 最终首页文案

### 3.1 首页主标题

```text
Find the right AI tools for your task.
```

### 3.2 首页副标题

```text
Tell us what you want to do. We’ll recommend the best tool setup, explain when to use each tool, and show simpler options when available.
```

### 3.3 按钮文案

```text
Find Tools
```

### 3.4 输入框 placeholder

```text
Example: I want to create a product promo video for TikTok.
```

### 3.5 示例任务 chips

```text
Create a TikTok product video
Turn a PDF into slides
Build a SaaS landing page
Create an AI course sales page
Create an AI avatar video
Write a RedNote product post
Create an Instagram carousel
Turn a blog post into a short video
```

### 3.6 首页不出现的内容

不要出现：

```text
Tool directory
Categories
Ranking
Latest tools
Trending tools
Choose your starting point
Sidebar
Pricing
Templates
Tool database
```

原因：

```text
这些都会让用户联想到 Toolify / There’s An AI For That。
```

---

## 4. 最终 MVP 功能

MVP 只做 5 件事：

```text
1. 输入任务
2. 匹配高频任务模板
3. 展示 Best Tool Setup for This Task
4. 展示 How to use it
5. 展示 Better options if
```

不做：

```text
工具目录
排行榜
工具详情页
完整工具链
自动执行
复杂 onboarding
大量分类
用户注册
付费系统
实时爬取工具库
```

---

## 5. 最终结果页结构

用户输入：

```text
I want to create a product promo video for TikTok.
```

系统输出结果页标题：

```text
Best Tool Setup for This Task
```

结果页只分 3 个模块：

```text
1. For this task, use
2. How to use it
3. Better options if
```

---

## 6. 模块 1：For this task, use

### 6.1 模块作用

这个模块回答：

```text
这个任务到底用什么工具？
每个工具在这里负责什么？
哪些工具是核心？
哪些工具是可选？
有没有工具需要在特定条件下才使用？
```

### 6.2 展示示例：TikTok 产品推广视频

```text
For this task, use:

ChatGPT / Claude
For angle, hook, script, and message planning.

CapCut
Use it if you already have product clips or want fast editing.

Runway / Kling
Use only if you need AI-generated visuals or image-to-video clips.

Canva
Use it at the end for cover, caption, and publishing assets.
```

### 6.3 工具关系表达

每个工具推荐项必须说明：

```text
工具名
工具角色
使用条件
是否核心
是否可选
官网按钮
```

例如：

```text
Tool: CapCut
Role: Video editing
Decision: Use it if you already have product clips or want fast editing.
Condition: Best when you need captions, cuts, templates, and export.
Status: core
```

```text
Tool: Runway / Kling
Role: AI-generated visuals
Decision: Use only if you need AI-generated visuals or image-to-video clips.
Condition: Optional if you already have strong product footage.
Status: optional
```

---

## 7. 模块 2：How to use it

### 7.1 模块作用

这个模块回答：

```text
我应该先用哪个，后用哪个？
我怎么开始做？
怎样用这些工具完成任务？
```

### 7.2 重要规则

使用方案不固定 3 步。

不同任务根据具体情况配置：

```text
视频任务可以是 4 步
PDF 转 PPT 可以是 4 步
Landing Page 可以是 5 步
AI avatar video 可以是 3–4 步
```

建议限制：

```text
2–6 步
```

避免重新变成复杂 SOP。

### 7.3 展示示例：TikTok 产品推广视频

```text
How to use it:

1. Shape the message
Use ChatGPT or Claude to create the hook, product angle, audience, and short script before opening any video tool.

2. Create or edit the video
Use CapCut if you already have clips. Add Runway or Kling only when you need generated visuals.

3. Package for publishing
Use Canva to create the cover image, caption, and final social assets.

4. Review before posting
Check whether the first 3 seconds give viewers a reason to keep watching.
```

### 7.4 每一步字段

每一步包含：

```text
步骤序号
步骤标题
说明
推荐工具
关键提示
```

---

## 8. 模块 3：Better options if

### 8.1 为什么不用 Alternative

不要叫：

```text
Alternative
Alternative options
```

建议统一叫：

```text
Better options if
```

原因：

```text
Alternative 像备选工具列表，容易又变成工具目录。
Better options if 更像决策建议，表达“如果你属于这个情况，就选这个”。
```

### 8.2 模块作用

这个模块回答：

```text
如果我的情况不同，有没有更简单的选择？
如果我已经有素材，是不是不用这么多工具？
如果我想一站式完成，有没有 all-in-one？
如果我要数字人口播，该用什么？
```

### 8.3 展示示例：TikTok 产品推广视频

```text
Better options if:

Already have clips:
Use CapCut only.
Best if you just need quick editing, captions, and export.

Want all-in-one:
Use InVideo.
Best if you want one tool to turn a script or prompt into a video draft.

Want avatar style:
Use HeyGen.
Best if you want an AI presenter or talking-head video.

Need stronger visuals:
Use Runway / Kling.
Best if you do not have enough real product footage.
```

### 8.4 显示规则

Better options if 不是必显模块。

显示条件：

```text
当存在明显更简单、更快、更便宜、更高质量或不同风格的选择时显示。
```

不显示条件：

```text
主推荐已经足够明确
替代方案只会增加选择困难
任务本身就是单工具直达
```

---

## 9. 推荐类型设计

系统支持 3 种推荐类型。

### 9.1 single_tool

适用：

```text
一个工具已经能直接完成任务。
```

例子：

```text
Turn a PDF into slides → Gamma
```

结果展示：

```text
Best Tool Setup for This Task

For this task, use:
Gamma
Use it to turn uploaded content or outlines into slide decks directly.
```

### 9.2 tool_setup

适用：

```text
多个工具根据不同角色配合完成任务。
```

例子：

```text
Create TikTok product promo video → ChatGPT / Claude + CapCut + Canva + optional Runway / Kling
```

### 9.3 tool_options

适用：

```text
几个工具都可以完成任务，但适合不同场景。
```

例子：

```text
Create AI avatar video → HeyGen / Synthesia / D-ID
```

---

## 10. 数据库 / 本地数据结构设计

MVP 阶段不接真实数据库，使用本地 seed data。

推荐目录：

```text
lib/
├── data/
│   ├── tools.ts
│   └── decisionTemplates.ts
├── schemas/
│   └── toolDecision.ts
└── decision-engine/
    ├── matchDecisionTemplate.ts
    └── buildDecisionResult.ts
```

---

## 11. TypeScript 类型设计

### 11.1 Tool

```ts
export type Tool = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  category: string;
  shortDescription: string;
  bestFor: string[];
  pricingLabel?: string;
};
```

### 11.2 RecommendedTool

用于 `For this task, use` 模块。

```ts
export type RecommendedTool = {
  id: string;
  toolSlugs: string[];
  role: string;
  decision: string;
  condition?: string;
  status: "core" | "optional" | "shortcut";
};
```

示例：

```ts
{
  id: "capcut-editing",
  toolSlugs: ["capcut"],
  role: "Video editing",
  decision: "Use it if you already have product clips or want fast editing.",
  condition: "Best when you need captions, cuts, templates, and export.",
  status: "core"
}
```

### 11.3 UsageStep

用于 `How to use it` 模块。

```ts
export type UsageStep = {
  id: string;
  title: string;
  description: string;
  toolSlugs: string[];
  tip?: string;
};
```

数量规则：

```text
2–6 步
```

### 11.4 BetterOption

用于 `Better options if` 模块。

```ts
export type BetterOption = {
  id: string;
  label: string;
  toolSlugs: string[];
  decision: string;
  bestFor: string;
};
```

示例：

```ts
{
  id: "already-have-clips",
  label: "Already have clips",
  toolSlugs: ["capcut"],
  decision: "Use CapCut only.",
  bestFor: "Best if you just need quick editing, captions, and export."
}
```

### 11.5 DecisionTemplate

核心模板。

```ts
export type DecisionTemplate = {
  id: string;
  slug: string;
  taskTitle: string;
  keywords: string[];
  examples: string[];

  recommendationType: "single_tool" | "tool_setup" | "tool_options";

  resultTitle: string;
  oneLineReason: string;

  recommendedTools: RecommendedTool[];

  usagePlan: UsageStep[];

  betterOptions?: BetterOption[];

  bestFor: string[];
  notIdealFor: string[];
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  differentiationNote: string;
};
```

### 11.6 DecisionResult

API 返回结构。

```ts
export type DecisionResult = {
  id: string;
  userInput: string;
  matchedTemplateSlug: string;
  confidence: number;

  recommendationType: "single_tool" | "tool_setup" | "tool_options";

  taskTitle: string;
  resultTitle: string;
  oneLineReason: string;

  recommendedTools: Array<{
    id: string;
    tools: Tool[];
    role: string;
    decision: string;
    condition?: string;
    status: "core" | "optional" | "shortcut";
  }>;

  usagePlan: Array<{
    id: string;
    title: string;
    description: string;
    tools: Tool[];
    tip?: string;
  }>;

  betterOptions?: Array<{
    id: string;
    label: string;
    tools: Tool[];
    decision: string;
    bestFor: string;
  }>;

  bestFor: string[];
  notIdealFor: string[];
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  differentiationNote: string;
};
```

---

## 12. Zod Schema

路径：

```text
lib/schemas/toolDecision.ts
```

```ts
import { z } from "zod";

export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  websiteUrl: z.string().url(),
  category: z.string(),
  shortDescription: z.string(),
  bestFor: z.array(z.string()),
  pricingLabel: z.string().optional()
});

export const recommendedToolSchema = z.object({
  id: z.string(),
  toolSlugs: z.array(z.string()),
  role: z.string(),
  decision: z.string(),
  condition: z.string().optional(),
  status: z.enum(["core", "optional", "shortcut"])
});

export const usageStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  toolSlugs: z.array(z.string()),
  tip: z.string().optional()
});

export const betterOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  toolSlugs: z.array(z.string()),
  decision: z.string(),
  bestFor: z.string()
});

export const recommendationTypeSchema = z.enum([
  "single_tool",
  "tool_setup",
  "tool_options"
]);

export const decisionTemplateSchema = z.object({
  id: z.string(),
  slug: z.string(),
  taskTitle: z.string(),
  keywords: z.array(z.string()),
  examples: z.array(z.string()),

  recommendationType: recommendationTypeSchema,

  resultTitle: z.string(),
  oneLineReason: z.string(),

  recommendedTools: z.array(recommendedToolSchema).min(1).max(8),

  usagePlan: z.array(usageStepSchema).min(2).max(6),

  betterOptions: z.array(betterOptionSchema).optional(),

  bestFor: z.array(z.string()),
  notIdealFor: z.array(z.string()),
  estimatedTime: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),

  differentiationNote: z.string()
});

export const decisionSearchRequestSchema = z.object({
  input: z.string().min(2).max(500)
});

export const decisionResultSchema = z.object({
  id: z.string(),
  userInput: z.string(),
  matchedTemplateSlug: z.string(),
  confidence: z.number().min(0).max(1),

  recommendationType: recommendationTypeSchema,

  taskTitle: z.string(),
  resultTitle: z.string(),
  oneLineReason: z.string(),

  recommendedTools: z.array(z.object({
    id: z.string(),
    tools: z.array(toolSchema),
    role: z.string(),
    decision: z.string(),
    condition: z.string().optional(),
    status: z.enum(["core", "optional", "shortcut"])
  })).min(1).max(8),

  usagePlan: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    tools: z.array(toolSchema),
    tip: z.string().optional()
  })).min(2).max(6),

  betterOptions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    tools: z.array(toolSchema),
    decision: z.string(),
    bestFor: z.string()
  })).optional(),

  bestFor: z.array(z.string()),
  notIdealFor: z.array(z.string()),
  estimatedTime: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),

  differentiationNote: z.string()
});

export type Tool = z.infer<typeof toolSchema>;
export type RecommendedTool = z.infer<typeof recommendedToolSchema>;
export type UsageStep = z.infer<typeof usageStepSchema>;
export type BetterOption = z.infer<typeof betterOptionSchema>;
export type DecisionTemplate = z.infer<typeof decisionTemplateSchema>;
export type DecisionResult = z.infer<typeof decisionResultSchema>;
export type DecisionSearchRequest = z.infer<typeof decisionSearchRequestSchema>;
```

---

## 13. 工具数据

路径：

```text
lib/data/tools.ts
```

```ts
import type { Tool } from "@/lib/schemas/toolDecision";

export const tools: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    slug: "chatgpt",
    websiteUrl: "https://chatgpt.com",
    category: "writing",
    shortDescription: "Useful for turning ideas into hooks, scripts, briefs, and structured plans.",
    bestFor: ["Scriptwriting", "Planning", "Copywriting"],
    pricingLabel: "Free / Paid"
  },
  {
    id: "claude",
    name: "Claude",
    slug: "claude",
    websiteUrl: "https://claude.ai",
    category: "writing",
    shortDescription: "Strong for reasoning, content structure, and polished drafts.",
    bestFor: ["Long-form writing", "Reasoning", "Structured drafts"],
    pricingLabel: "Free / Paid"
  },
  {
    id: "capcut",
    name: "CapCut",
    slug: "capcut",
    websiteUrl: "https://www.capcut.com",
    category: "video",
    shortDescription: "Fast short-video editing, captions, templates, and publishing-ready clips.",
    bestFor: ["Short video editing", "Captions", "Templates"],
    pricingLabel: "Free / Paid"
  },
  {
    id: "runway",
    name: "Runway",
    slug: "runway",
    websiteUrl: "https://runwayml.com",
    category: "video_generation",
    shortDescription: "AI video generation and visual experimentation for higher-end video assets.",
    bestFor: ["AI video generation", "Visual effects", "Creative clips"],
    pricingLabel: "Paid"
  },
  {
    id: "kling",
    name: "Kling",
    slug: "kling",
    websiteUrl: "https://klingai.com",
    category: "video_generation",
    shortDescription: "AI video generation from prompts and images.",
    bestFor: ["Image-to-video", "Prompt-to-video", "Short clips"],
    pricingLabel: "Free / Paid"
  },
  {
    id: "canva",
    name: "Canva",
    slug: "canva",
    websiteUrl: "https://www.canva.com",
    category: "design",
    shortDescription: "Create covers, captions, social graphics, slides, and visual assets.",
    bestFor: ["Cover design", "Social assets", "Slides"],
    pricingLabel: "Free / Paid"
  },
  {
    id: "invideo",
    name: "InVideo",
    slug: "invideo",
    websiteUrl: "https://invideo.io",
    category: "video",
    shortDescription: "All-in-one video creation from scripts, prompts, and templates.",
    bestFor: ["All-in-one video", "Text-to-video", "Templates"],
    pricingLabel: "Free / Paid"
  },
  {
    id: "heygen",
    name: "HeyGen",
    slug: "heygen",
    websiteUrl: "https://www.heygen.com",
    category: "avatar_video",
    shortDescription: "Create AI avatar and talking-head style videos.",
    bestFor: ["AI avatar", "Talking-head video", "Course promo"],
    pricingLabel: "Paid"
  },
  {
    id: "gamma",
    name: "Gamma",
    slug: "gamma",
    websiteUrl: "https://gamma.app",
    category: "presentation",
    shortDescription: "Generate clean slide decks from outlines and documents.",
    bestFor: ["Slides", "Presentations", "Deck drafts"],
    pricingLabel: "Free / Paid"
  },
  {
    id: "framer",
    name: "Framer",
    slug: "framer",
    websiteUrl: "https://www.framer.com",
    category: "website",
    shortDescription: "Build polished landing pages quickly.",
    bestFor: ["Landing pages", "Websites", "SaaS pages"],
    pricingLabel: "Free / Paid"
  }
];
```

---

## 14. 决策模板数据

路径：

```text
lib/data/decisionTemplates.ts
```

### 14.1 TikTok 产品推广视频模板

```ts
import type { DecisionTemplate } from "@/lib/schemas/toolDecision";

export const decisionTemplates: DecisionTemplate[] = [
  {
    id: "tiktok-product-promo-video",
    slug: "tiktok-product-promo-video",
    taskTitle: "Create a TikTok product promo video",
    keywords: [
      "tiktok",
      "product",
      "promo",
      "video",
      "ad",
      "marketing",
      "short video",
      "product video"
    ],
    examples: [
      "I want to create a product promo video for TikTok.",
      "Create a TikTok product video.",
      "I need a short product ad video."
    ],

    recommendationType: "tool_setup",

    resultTitle: "Best Tool Setup for This Task",
    oneLineReason:
      "This task needs message planning, video creation or editing, and publishing assets.",

    recommendedTools: [
      {
        id: "message",
        toolSlugs: ["chatgpt", "claude"],
        role: "Angle, hook, script, and message planning",
        decision: "Use ChatGPT or Claude before opening any video tool.",
        condition:
          "Best when you need to clarify the product angle, audience, hook, and short script.",
        status: "core"
      },
      {
        id: "editing",
        toolSlugs: ["capcut"],
        role: "Video editing",
        decision: "Use CapCut if you already have product clips or want fast editing.",
        condition:
          "Best for captions, cuts, templates, music, and publish-ready export.",
        status: "core"
      },
      {
        id: "ai-visuals",
        toolSlugs: ["runway", "kling"],
        role: "AI-generated visuals",
        decision:
          "Use Runway or Kling only if you need generated visuals or image-to-video clips.",
        condition:
          "Optional if you already have strong product footage.",
        status: "optional"
      },
      {
        id: "publishing-assets",
        toolSlugs: ["canva"],
        role: "Cover, caption, and publishing assets",
        decision: "Use Canva at the end for cover, caption, and social assets.",
        condition: "Best after the video draft is ready.",
        status: "core"
      }
    ],

    usagePlan: [
      {
        id: "shape-message",
        title: "Shape the message",
        description:
          "Use ChatGPT or Claude to create the hook, product angle, audience, and short script before opening any video tool.",
        toolSlugs: ["chatgpt", "claude"],
        tip:
          "Do not start with a video generator first. A weak message will make every video output weak."
      },
      {
        id: "create-video",
        title: "Create or edit the video",
        description:
          "Use CapCut if you already have clips. Add Runway or Kling only when you need generated visuals.",
        toolSlugs: ["capcut", "runway", "kling"],
        tip:
          "CapCut is enough for most quick editing tasks. Runway or Kling should be added only when real footage is not enough."
      },
      {
        id: "package",
        title: "Package for publishing",
        description:
          "Use Canva to create the cover image, caption, and final social assets.",
        toolSlugs: ["canva"],
        tip:
          "The cover should give a reason to click, not just show the product."
      },
      {
        id: "review",
        title: "Review before posting",
        description:
          "Check whether the first 3 seconds give viewers a reason to keep watching.",
        toolSlugs: ["chatgpt"],
        tip:
          "Ask ChatGPT or Claude to critique the hook, opening line, and cover before publishing."
      }
    ],

    betterOptions: [
      {
        id: "already-have-clips",
        label: "Already have clips",
        toolSlugs: ["capcut"],
        decision: "Use CapCut only.",
        bestFor:
          "Best if you just need quick editing, captions, templates, and export."
      },
      {
        id: "all-in-one",
        label: "Want all-in-one",
        toolSlugs: ["invideo"],
        decision: "Use InVideo.",
        bestFor:
          "Best if you want one tool to turn a script or prompt into a video draft."
      },
      {
        id: "avatar-style",
        label: "Want avatar style",
        toolSlugs: ["heygen"],
        decision: "Use HeyGen.",
        bestFor:
          "Best if you want an AI presenter or talking-head video."
      },
      {
        id: "stronger-visuals",
        label: "Need stronger visuals",
        toolSlugs: ["runway", "kling"],
        decision: "Use Runway or Kling.",
        bestFor:
          "Best if you do not have enough real product footage."
      }
    ],

    bestFor: [
      "Small business product videos",
      "TikTok product tests",
      "Creator marketing",
      "Fast short-form content"
    ],
    notIdealFor: [
      "High-end cinematic brand ads",
      "Large production teams",
      "Fully automated campaign execution"
    ],
    estimatedTime: "30–90 min",
    difficulty: "Beginner",

    differentiationNote:
      "This is not a list of AI video tools. It is a decision card that tells you which tools are core, which are optional, and when to use each one."
  }
];
```

### 14.2 PDF 转 PPT 模板

```ts
export const pdfToSlidesTemplate: DecisionTemplate = {
  id: "pdf-to-slides",
  slug: "pdf-to-slides",
  taskTitle: "Turn a PDF into slides",
  keywords: ["pdf", "slides", "ppt", "presentation", "deck"],
  examples: [
    "Turn a PDF into slides.",
    "I need to convert a report into a presentation.",
    "Make a slide deck from this PDF."
  ],

  recommendationType: "single_tool",

  resultTitle: "Best Tool Setup for This Task",
  oneLineReason:
    "For a first deck draft, Gamma can turn structured content or outlines into slides directly.",

  recommendedTools: [
    {
      id: "gamma",
      toolSlugs: ["gamma"],
      role: "PDF to slide deck generation",
      decision: "Use Gamma directly if the PDF is clear and structured.",
      condition:
        "Best when you need a quick first deck draft from an existing document.",
      status: "core"
    },
    {
      id: "cleanup",
      toolSlugs: ["chatgpt", "claude"],
      role: "Outline cleanup",
      decision:
        "Use ChatGPT or Claude first only if the PDF is messy, too long, or poorly structured.",
      condition:
        "Optional when the source document needs summarizing or restructuring.",
      status: "optional"
    },
    {
      id: "visual-polish",
      toolSlugs: ["canva"],
      role: "Visual polish",
      decision:
        "Use Canva only if you need stronger design control after the deck is generated.",
      condition:
        "Optional for brand-heavy or visual-heavy presentations.",
      status: "optional"
    }
  ],

  usagePlan: [
    {
      id: "check-structure",
      title: "Check the PDF structure",
      description:
        "If the PDF is clear and structured, use Gamma directly. If it is messy or too long, use ChatGPT or Claude to extract an outline first.",
      toolSlugs: ["gamma", "chatgpt", "claude"],
      tip:
        "Do not upload a messy report and expect a perfect deck. Clean structure matters."
    },
    {
      id: "generate-deck",
      title: "Generate the first deck",
      description:
        "Use Gamma to turn the uploaded content or outline into a slide deck.",
      toolSlugs: ["gamma"],
      tip:
        "Generate quickly first, then edit. Do not over-optimize before seeing the draft."
    },
    {
      id: "simplify",
      title: "Simplify dense slides",
      description:
        "Remove overloaded text, split complex pages, and make sure each slide has one main idea.",
      toolSlugs: ["gamma"],
      tip:
        "One slide should usually carry one main point."
    },
    {
      id: "polish-export",
      title: "Polish and export",
      description:
        "Use Gamma or Canva to adjust visuals and export the final deck.",
      toolSlugs: ["gamma", "canva"],
      tip:
        "Use Canva only when you need stronger visual control."
    }
  ],

  betterOptions: [
    {
      id: "more-design-control",
      label: "Need more design control",
      toolSlugs: ["chatgpt", "canva"],
      decision: "Use ChatGPT to extract the outline, then build in Canva.",
      bestFor:
        "Best if the slide deck needs strong brand design or manual layout control."
    }
  ],

  bestFor: [
    "Fast presentation drafts",
    "Training decks",
    "Report-to-slides tasks"
  ],
  notIdealFor: [
    "Highly customized enterprise pitch decks",
    "Design-heavy investor decks"
  ],
  estimatedTime: "10–30 min",
  difficulty: "Beginner",

  differentiationNote:
    "This is not a list of presentation tools. It tells you when one tool is enough and when you should add another tool."
};
```

---

## 15. 匹配逻辑

路径：

```text
lib/decision-engine/matchDecisionTemplate.ts
```

```ts
import { decisionTemplates } from "@/lib/data/decisionTemplates";
import type { DecisionTemplate } from "@/lib/schemas/toolDecision";

type MatchResult = {
  template: DecisionTemplate;
  confidence: number;
};

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function keywordScore(input: string, keywords: string[]): number {
  const normalized = normalize(input);

  return keywords.reduce((score, keyword) => {
    return normalized.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

export function matchDecisionTemplate(input: string): MatchResult {
  const scored = decisionTemplates.map((template) => {
    const score = keywordScore(input, template.keywords);

    return {
      template,
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score === 0) {
    return {
      template: decisionTemplates[0],
      confidence: 0.35
    };
  }

  return {
    template: best.template,
    confidence: Math.min(0.95, 0.5 + best.score * 0.08)
  };
}
```

---

## 16. 构建结果

路径：

```text
lib/decision-engine/buildDecisionResult.ts
```

```ts
import { tools } from "@/lib/data/tools";
import type {
  Tool,
  DecisionTemplate,
  DecisionResult
} from "@/lib/schemas/toolDecision";

function resolveTools(slugs: string[]): Tool[] {
  return slugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is Tool => Boolean(tool));
}

export function buildDecisionResult(
  input: string,
  template: DecisionTemplate,
  confidence: number
): DecisionResult {
  return {
    id: crypto.randomUUID(),
    userInput: input,
    matchedTemplateSlug: template.slug,
    confidence,

    recommendationType: template.recommendationType,

    taskTitle: template.taskTitle,
    resultTitle: template.resultTitle,
    oneLineReason: template.oneLineReason,

    recommendedTools: template.recommendedTools.map((item) => ({
      id: item.id,
      tools: resolveTools(item.toolSlugs),
      role: item.role,
      decision: item.decision,
      condition: item.condition,
      status: item.status
    })),

    usagePlan: template.usagePlan.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      tools: resolveTools(step.toolSlugs),
      tip: step.tip
    })),

    betterOptions: template.betterOptions?.map((option) => ({
      id: option.id,
      label: option.label,
      tools: resolveTools(option.toolSlugs),
      decision: option.decision,
      bestFor: option.bestFor
    })),

    bestFor: template.bestFor,
    notIdealFor: template.notIdealFor,
    estimatedTime: template.estimatedTime,
    difficulty: template.difficulty,

    differentiationNote: template.differentiationNote
  };
}
```

---

## 17. API 设计

路径：

```text
app/api/decision/route.ts
```

```ts
import { NextResponse } from "next/server";
import {
  decisionSearchRequestSchema,
  decisionResultSchema
} from "@/lib/schemas/toolDecision";
import { matchDecisionTemplate } from "@/lib/decision-engine/matchDecisionTemplate";
import { buildDecisionResult } from "@/lib/decision-engine/buildDecisionResult";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = decisionSearchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const { input } = parsed.data;
    const { template, confidence } = matchDecisionTemplate(input);
    const result = buildDecisionResult(input, template, confidence);

    const checked = decisionResultSchema.safeParse(result);

    if (!checked.success) {
      return NextResponse.json(
        {
          error: "Invalid result",
          details: checked.error.flatten()
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: checked.data
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate decision"
      },
      { status: 500 }
    );
  }
}
```

---

## 18. 页面组件结构

```text
app/
├── page.tsx
└── api/
    └── decision/
        └── route.ts

components/
├── layout/
│   └── AppHeader.tsx
├── search/
│   └── HeroSearch.tsx
├── decision/
│   ├── DecisionResult.tsx
│   ├── BestToolSetup.tsx
│   ├── RecommendedToolItem.tsx
│   ├── UsagePlan.tsx
│   ├── BetterOptions.tsx
│   └── DecisionMeta.tsx
└── ui/
    ├── Button.tsx
    └── Card.tsx

lib/
├── data/
│   ├── tools.ts
│   └── decisionTemplates.ts
├── schemas/
│   └── toolDecision.ts
└── decision-engine/
    ├── matchDecisionTemplate.ts
    └── buildDecisionResult.ts
```

---

## 19. 前端结果页组件

### 19.1 DecisionResult

```tsx
import type { DecisionResult as DecisionResultType } from "@/lib/schemas/toolDecision";
import { BestToolSetup } from "@/components/decision/BestToolSetup";
import { UsagePlan } from "@/components/decision/UsagePlan";
import { BetterOptions } from "@/components/decision/BetterOptions";

export function DecisionResult({ result }: { result: DecisionResultType }) {
  return (
    <section className="mx-auto mt-10 grid w-full max-w-6xl gap-8">
      <BestToolSetup result={result} />
      <UsagePlan steps={result.usagePlan} />

      {result.betterOptions && result.betterOptions.length > 0 ? (
        <BetterOptions options={result.betterOptions} />
      ) : null}
    </section>
  );
}
```

### 19.2 BestToolSetup

```tsx
import type { DecisionResult } from "@/lib/schemas/toolDecision";

export function BestToolSetup({ result }: { result: DecisionResult }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-blue-300">
            Best Tool Setup for This Task
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {result.taskTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            {result.oneLineReason}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          {Math.round(result.confidence * 100)}% match
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {result.recommendedTools.map((item) => (
          <div
            key={item.id}
            className="rounded-[24px] border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  {item.tools.map((tool) => (
                    <a
                      key={tool.slug}
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm text-white hover:bg-white/[0.12]"
                    >
                      {tool.name}
                    </a>
                  ))}
                </div>

                <h3 className="mt-4 text-xl font-semibold text-white">
                  {item.role}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.decision}
                </p>

                {item.condition ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.condition}
                  </p>
                ) : null}
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm text-slate-400">
          {result.differentiationNote}
        </p>
      </div>
    </section>
  );
}
```

### 19.3 UsagePlan

```tsx
import type { DecisionResult } from "@/lib/schemas/toolDecision";

type UsageStep = DecisionResult["usagePlan"][number];

export function UsagePlan({ steps }: { steps: UsageStep[] }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
      <h2 className="text-2xl font-semibold text-white">
        How to use it
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Use the tools in this order. The plan is based on the task, not a fixed template.
      </p>

      <div className="mt-6 grid gap-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex gap-5 rounded-[24px] border border-white/10 bg-black/20 p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {index + 1}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {step.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {step.tools.map((tool) => (
                  <span
                    key={tool.slug}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-200"
                  >
                    {tool.name}
                  </span>
                ))}
              </div>

              {step.tip ? (
                <p className="mt-3 text-sm leading-6 text-blue-200">
                  Tip: {step.tip}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### 19.4 BetterOptions

```tsx
import type { DecisionResult } from "@/lib/schemas/toolDecision";

type BetterOption = NonNullable<DecisionResult["betterOptions"]>[number];

export function BetterOptions({ options }: { options: BetterOption[] }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
      <h2 className="text-2xl font-semibold text-white">
        Better options if
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Choose a simpler or more suitable path if your situation is different.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-5">
        {options.map((option) => (
          <div
            key={option.id}
            className="rounded-[24px] border border-white/10 bg-black/20 p-5"
          >
            <h3 className="text-lg font-semibold text-white">
              {option.label}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {option.tools.map((tool) => (
                <a
                  key={tool.slug}
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm text-white hover:bg-white/[0.12]"
                >
                  {tool.name}
                </a>
              ))}
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {option.decision}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {option.bestFor}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## 20. 首页实现

### 20.1 app/page.tsx

```tsx
import { AppHeader } from "@/components/layout/AppHeader";
import { HeroSearch } from "@/components/search/HeroSearch";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <AppHeader />

      <section className="mx-auto flex max-w-6xl flex-col px-6 pb-20 pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-blue-300">
            AI Tool Decision Assistant
          </p>

          <h1 className="mt-4 text-6xl font-semibold tracking-tight">
            Find the right AI tools for your task.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Tell us what you want to do. We’ll recommend the best tool setup,
            explain when to use each tool, and show simpler options when available.
          </p>
        </div>

        <div className="mt-10">
          <HeroSearch />
        </div>
      </section>
    </main>
  );
}
```

### 20.2 HeroSearch

```tsx
"use client";

import { useState } from "react";
import type { DecisionResult as DecisionResultType } from "@/lib/schemas/toolDecision";
import { DecisionResult } from "@/components/decision/DecisionResult";

const examples = [
  "I want to create a product promo video for TikTok.",
  "Turn a PDF into slides.",
  "Build a SaaS landing page.",
  "Create an AI course sales page.",
  "Create an AI avatar video."
];

export function HeroSearch() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecisionResultType | null>(null);
  const [loading, setLoading] = useState(false);

  async function findTools(value?: string) {
    const finalInput = value ?? input;
    if (!finalInput.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/decision", {
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
      <div className="rounded-[32px] border border-blue-400/30 bg-white/[0.05] p-3 shadow-2xl shadow-blue-950/30">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Example: I want to create a product promo video for TikTok."
            className="h-16 flex-1 bg-transparent px-5 text-lg text-white outline-none placeholder:text-slate-500"
          />

          <button
            onClick={() => findTools()}
            disabled={loading}
            className="h-14 rounded-2xl bg-blue-600 px-6 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Finding..." : "Find Tools"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => {
              setInput(example);
              findTools(example);
            }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.08]"
          >
            {example}
          </button>
        ))}
      </div>

      {result ? <DecisionResult result={result} /> : null}
    </div>
  );
}
```

---

## 21. Codex 开发指令

把下面内容交给 Codex：

```text
请将项目重构为 AI Tool Decision Assistant。

最终定位：
AI Tool Decision Assistant
中文理解：AI 工具决策助手

核心价值：
用户输入一个任务，系统推荐最适合当前任务的 AI 工具配置，并告诉用户：
- 这个任务到底用哪个工具
- 每个工具负责什么
- 哪些工具是 core
- 哪些工具是 optional
- 有没有更简单的选择
- 先用哪个，后用哪个

首页文案：
Find the right AI tools for your task.

副标题：
Tell us what you want to do. We’ll recommend the best tool setup, explain when to use each tool, and show simpler options when available.

按钮：
Find Tools

结果页只保留 3 个模块：
1. Best Tool Setup for This Task
2. How to use it
3. Better options if

不要再使用这些旧表达：
- AI Tool Combo Card
- Turn any task into the right AI tool card
- Generate Tool Card
- Alternative options
- 3-Step Usage Plan
- Tool Directory
- Ranking
- Full Toolchain

技术栈：
- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- 本地 seed data
- 不接数据库
- 不接真实 LLM
- 不做自动执行

目录要求：
app/page.tsx
app/api/decision/route.ts
lib/schemas/toolDecision.ts
lib/data/tools.ts
lib/data/decisionTemplates.ts
lib/decision-engine/matchDecisionTemplate.ts
lib/decision-engine/buildDecisionResult.ts
components/layout/AppHeader.tsx
components/search/HeroSearch.tsx
components/decision/DecisionResult.tsx
components/decision/BestToolSetup.tsx
components/decision/UsagePlan.tsx
components/decision/BetterOptions.tsx

数据结构要求：
使用 DecisionTemplate / DecisionResult
不要再使用 ToolComboTemplate / ToolComboResult 作为核心命名。

使用方案 usagePlan：
- 不固定 3 步
- 每个模板自行配置
- 建议 2–6 步

Better options if：
- 不是必显
- 只有 when useful 才显示
- 用来表达不同情况的更好选择
- 不要叫 Alternative

默认测试输入：
I want to create a product promo video for TikTok.

必须输出：
Best Tool Setup for This Task

For this task, use:
- ChatGPT / Claude for angle, hook, script, and message planning
- CapCut if you already have product clips or want fast editing
- Runway / Kling only if you need AI-generated visuals or image-to-video clips
- Canva at the end for cover, caption, and publishing assets

How to use it:
1. Shape the message
2. Create or edit the video
3. Package for publishing
4. Review before posting

Better options if:
- Already have clips: Use CapCut only
- Want all-in-one: Use InVideo
- Want avatar style: Use HeyGen
- Need stronger visuals: Use Runway / Kling
```

---

## 22. 验收标准

### 22.1 首页

必须出现：

```text
AI Tool Decision Assistant
Find the right AI tools for your task.
Tell us what you want to do. We’ll recommend the best tool setup, explain when to use each tool, and show simpler options when available.
Find Tools
```

不得出现：

```text
AI Tool Combo Card
Turn any task into the right AI tool card
Generate Tool Card
```

### 22.2 结果页

必须只有三个核心模块：

```text
Best Tool Setup for This Task
How to use it
Better options if
```

不得出现：

```text
Tool Directory
Ranking
Full Toolchain
Fastest Path
Step Details
3-Step Usage Plan
Alternative options
```

### 22.3 数据命名

必须使用：

```text
DecisionTemplate
DecisionResult
RecommendedTool
UsageStep
BetterOption
```

不得再以以下命名作为核心：

```text
ToolComboTemplate
ToolComboResult
AlternativeOption
```

### 22.4 测试用例

输入：

```text
I want to create a product promo video for TikTok.
```

必须显示：

```text
ChatGPT / Claude
CapCut
Runway / Kling
Canva
How to use it
Better options if
```

输入：

```text
Turn a PDF into slides.
```

必须显示：

```text
Gamma
ChatGPT / Claude optional
Canva optional
How to use it
```

---

## 23. 最终定稿

```text
产品名称：
AI Tool Decision Assistant

核心价值：
帮用户决定当前任务应该使用哪些 AI 工具，以及如何使用。

最终页面结构：
1. Best Tool Setup for This Task
2. How to use it
3. Better options if

最终差异：
Toolify / There’s An AI For That 帮用户找工具。
AI Tool Decision Assistant 帮用户决定用什么工具、怎么用、哪个可以不用。
```
