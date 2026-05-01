# AI Tool Decision Assistant｜MVP 开发文档 v1.2

> 版本：v1.2  
> 本次修改重点：收敛为真正可上线的 MVP。  
> **不做「任务 + 角色 + 素材 + 预算」细化问答**，该能力放到下一个版本。  
> MVP 只做：用户输入任务 → 系统给出 AI 工具决策结果 → 用户知道该用什么、怎么用、哪些可以不用。  
> 产品名称：**AI Tool Decision Assistant**  
> 中文理解：**AI 工具决策助手**

---

# 0. MVP 最终结论

本版本只做一个核心体验：

```text
用户输入一个任务
↓
系统匹配高频任务模板
↓
展示 Best Tool Setup for This Task
↓
展示 How to use it
↓
展示 What you can skip
↓
展示 Better options if
↓
展示 Cost advice（轻量）
```

本版本不做复杂用户上下文采集。

明确不做：

```text
任务 + 角色 + 素材 + 预算问答
复杂用户画像
多轮追问
个性化推荐算法
实时工具库爬取
AI 自动执行
工具排行榜
工具目录页
复杂工作流
付费系统
用户后台
```

---

# 1. 产品定位

## 1.1 产品名称

```text
AI Tool Decision Assistant
```

## 1.2 中文理解

```text
AI 工具决策助手
```

## 1.3 首页主标题

最终定稿：

```text
Make better AI tool decisions for every task.
```

## 1.4 首页副标题

```text
Describe what you want to do. We’ll show which AI tools to use, which to skip, and how to get started.
```

## 1.5 CTA 按钮

```text
Get Decision
```

## 1.6 产品一句话

```text
AI Tool Decision Assistant helps users decide which AI tools to use, which to skip, and how to use them for a specific task.
```

中文理解：

```text
用户不是来逛 AI 工具目录的，而是来判断这个任务到底该用哪些 AI 工具、哪些可以不用、怎么开始。
```

---

# 2. 与 Toolify / There’s An AI For That 的区别

## 2.1 它们的核心

Toolify / There’s An AI For That 更像：

```text
Find AI tools.
Discover AI tools.
Browse AI tools.
Search AI tools.
```

它们主要展示：

```text
工具名称
工具分类
工具标签
工具描述
工具截图
工具替代品
工具排名
工具流量
评论 / 问答
```

用户看完后仍然要自己判断：

```text
哪个工具适合我？
哪个先用？
哪个不用？
哪个只是可选？
有没有一个工具就够了？
我需不需要为这个工具付费？
```

## 2.2 本产品的核心

本产品不是工具导航，而是：

```text
Decide which AI tools to use.
```

本产品围绕：

```text
任务
决策
使用顺序
可跳过工具
更简单选择
成本建议
```

## 2.3 差异化表达

```text
Tool directories help you find AI tools.
AI Tool Decision Assistant helps you decide which tools to use, skip, or replace.
```

---

# 3. MVP 页面范围

本版本只做 4 类页面。

```text
1. Homepage
   首页输入任务。

2. Task Decision Result Page
   任务决策结果页。

3. Tool Decision Detail Page
   AI 工具决策详情页。

4. Setup Detail Page
   可复用的任务方案详情页。
```

不做：

```text
Tools Directory
Trending Tools
Ranking
Pricing
Dashboard
User Profile
Community
Comments
Q&A
Newsletter 个性化系统
```

---

# 4. Page 1：首页 Homepage

## 4.1 页面目标

首页只完成一件事：

```text
让用户输入一个想完成的任务。
```

## 4.2 Header

左侧：

```text
AI Tool Decision Assistant
```

右侧：

```text
Log in
```

不要放：

```text
Solutions
How it works
Pricing
Tools Directory
Categories
Ranking
```

原因：

```text
这些会让用户误以为这是普通 AI 工具导航站。
```

## 4.3 Hero 文案

主标题：

```text
Make better AI tool decisions for every task.
```

副标题：

```text
Describe what you want to do. We’ll show which AI tools to use, which to skip, and how to get started.
```

输入框 placeholder：

```text
I want to create a product promo video for TikTok.
```

按钮：

```text
Get Decision
```

示例任务 chips：

```text
Product video
PDF to slides
Landing page
Instagram carousel
AI avatar video
Course sales page
```

## 4.4 首页视觉要求

风格：

```text
深色科技感
大输入框
少导航
强聚焦
中心化布局
```

不要出现：

```text
工具分类
工具榜单
工具卡片列表
复杂说明
大段介绍
```

---

# 5. Page 2：任务决策结果页 Task Decision Result Page

## 5.1 页面目标

用户输入任务后，页面不是展示工具列表，而是展示：

```text
这个任务该怎么选 AI 工具。
```

## 5.2 页面核心模块

MVP 结果页只保留 5 个模块：

```text
1. Best Tool Setup for This Task
2. How to use it
3. What you can skip
4. Better options if
5. Cost advice
```

其中：

```text
What you can skip
Cost advice
Better options if
```

可以根据模板决定是否显示，但 TikTok 产品视频模板建议都显示。

不要出现：

```text
Recommended Tool Combination
Expand to Full Toolchain
Fastest Path
Step Details
Related tools
Tool directory
```

---

## 5.3 模块 1：Best Tool Setup for This Task

模块标题：

```text
Best Tool Setup for This Task
```

任务示例：

```text
Create a TikTok product promo video
```

说明：

```text
This task needs message planning, video creation or editing, and publishing assets.
```

小提示：

```text
This is a decision result, not a tool list.
```

### For this task, use

工具项格式：

```text
Tool name
Role
Decision
Status
Condition
```

示例：

```text
ChatGPT / Claude

Role:
Angle, hook, script, and message planning.

Decision:
Use before opening any video tool.

Status:
Core

Condition:
Best when you need to clarify the product angle, audience, hook, and short script.
```

```text
CapCut

Role:
Video editing.

Decision:
Use it if you already have product clips or want fast editing.

Status:
Core

Condition:
Best for captions, cuts, templates, music, and publish-ready export.
```

```text
Runway / Kling

Role:
AI-generated visuals.

Decision:
Use only if you need generated visuals or image-to-video clips.

Status:
Optional

Condition:
Skip this if you already have strong product footage.
```

```text
Canva

Role:
Cover, caption, and publishing assets.

Decision:
Use it at the end, after the video draft is ready.

Status:
Core

Condition:
Best for cover image, caption assets, and social publishing visuals.
```

底部差异化提示：

```text
This is not a list of AI video tools. It tells you which tools are core, which are optional, and when to use each one.
```

按钮：

```text
Copy setup
Save
```

---

## 5.4 模块 2：How to use it

模块标题：

```text
How to use it
```

副标题：

```text
Use the tools in this order. The plan is based on the task, not a fixed template.
```

规则：

```text
不固定 3 步。
每个任务根据模板配置。
建议 2–6 步。
```

TikTok 产品视频示例：

```text
1. Shape the message
Use ChatGPT or Claude to create the hook, product angle, audience, and short script before opening any video tool.

Tip:
Do not start with a video generator first. A weak message will make every video output weak.
```

```text
2. Create or edit the video
Use CapCut if you already have clips. Add Runway or Kling only when you need generated visuals.

Tip:
CapCut is enough for most quick editing tasks. Runway or Kling should be added only when real footage is not enough.
```

```text
3. Package for publishing
Use Canva to create the cover image, caption, and final social assets.

Tip:
The cover should give a reason to click, not just show the product.
```

```text
4. Review before posting
Check whether the first 3 seconds give viewers a reason to keep watching.

Tip:
Ask ChatGPT or Claude to critique the hook, opening line, and cover before publishing.
```

---

## 5.5 模块 3：What you can skip

### 5.5.1 模块作用

这个模块是 MVP 的关键差异化之一。

普通工具导航会推荐更多工具。  
本产品要告诉用户：

```text
哪些工具在当前情况下可以不用。
```

这会强化“省心”和“少买错工具”的价值。

### 5.5.2 标题

```text
What you can skip
```

副标题：

```text
Avoid unnecessary tools when they do not fit your situation.
```

### 5.5.3 TikTok 产品视频示例

```text
Skip Runway / Kling if:
You already have strong product clips and only need editing, captions, and export.

Skip HeyGen if:
You do not need an avatar-style or talking-head presenter video.

Skip InVideo if:
You prefer editing control in CapCut instead of an all-in-one generated draft.
```

---

## 5.6 模块 4：Better options if

### 5.6.1 为什么不用 Alternative

不要叫：

```text
Alternative
Alternative options
```

统一叫：

```text
Better options if
```

原因：

```text
Alternative 像备选工具列表。
Better options if 更像条件化决策建议。
```

### 5.6.2 TikTok 产品视频示例

```text
Better options if:

Already have clips:
Use CapCut only.
Best if you just need quick editing, captions, templates, and export.

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

---

## 5.7 模块 5：Cost advice

### 5.7.1 模块作用

这个模块是轻量成本建议，不做复杂计算器。

核心价值：

```text
帮助用户少订阅不必要的 AI 工具。
```

### 5.7.2 标题

```text
Cost advice
```

副标题：

```text
Start with the lowest-cost path before adding paid tools.
```

### 5.7.3 TikTok 产品视频示例

```text
Free-first path:
ChatGPT free / Claude free + CapCut free + Canva free.

Low-cost path:
Use ChatGPT Plus only if you need better scripts frequently. Upgrade CapCut or Canva only if you publish weekly.

Avoid paying for:
Runway / Kling if you already have enough footage.
HeyGen if you do not need avatar videos.
InVideo if CapCut already gives you enough control.
```

---

# 6. Page 3：AI 工具详情页 Tool Decision Detail Page

## 6.1 页面定位

普通工具详情页回答：

```text
这个工具是什么？
```

本产品的工具详情页回答：

```text
这个工具什么时候该用？
什么时候不该用？
适合哪些具体任务？
在流程中处于哪一步？
和哪些工具搭配？
情况不同应该换哪个？
```

## 6.2 页面结构

```text
1. Tool Decision Hero
2. Decision Summary
3. Worth using if
4. Best-fit Tasks
5. When to Use / When Not to Use
6. Role in Workflow
7. Best Setups Including This Tool
8. Better Options If
9. Practical Details
```

Compared with v1.1, MVP v1.2 adds:

```text
Worth using if
```

这个模块让详情页更像“工具采购 / 使用决策页”，而不是普通百科页。

---

## 6.3 模块 1：Tool Decision Hero

展示：

```text
工具 Logo
工具名称
一句话定位
核心决策摘要
官网按钮
复制链接按钮
收藏按钮
分类标签
价格标签
输入 / 输出类型
学习难度
```

示例：CapCut

```text
CapCut

Fast short-video editing for creators and marketers.

Decision summary:
Use CapCut when you already have clips and need fast editing, captions, templates, and export.
Do not start here if you still need a hook, script, or product angle.

Primary role:
Video editing

Best with:
ChatGPT / Claude → CapCut → Canva
```

按钮：

```text
Open official website
Copy link
Save tool
```

---

## 6.4 模块 2：Decision Summary

```text
CapCut is the right choice when you already have video materials and need to turn them into a publish-ready short video.

It is not the best first step when you still need to define the product angle, hook, or script. In that case, start with ChatGPT or Claude.

Common workflow position:
Middle step — after message planning, before cover and publishing assets.

Works best with:
ChatGPT / Claude → CapCut → Canva
```

---

## 6.5 模块 3：Worth using if

### 6.5.1 模块作用

这个模块回答：

```text
这个工具值不值得你现在用？
```

### 6.5.2 CapCut 示例

```text
Worth using if:
- You publish short videos weekly
- You already have clips or screen recordings
- You need captions and fast editing
- You want a free or low-cost editing path

Probably skip if:
- You only need text-to-video from a prompt
- You want AI avatar video
- You need cinematic production
- Your team already uses Premiere Pro
```

---

## 6.6 模块 4：Best-fit Tasks

每个任务卡包含：

```text
任务名称
为什么适合
该工具在任务中的角色
进入任务决策页按钮
```

示例：

```text
Create a TikTok product promo video
Use CapCut for editing if you already have product clips.
Role: Main editing tool
[View setup]
```

```text
Edit a talking-head short video
Use CapCut for captions, cuts, pacing, and social export.
Role: Editing and subtitles
[View setup]
```

---

## 6.7 模块 5：When to Use / When Not to Use

示例：

```text
Use CapCut when:
- You already have video clips
- You need captions and quick edits
- You want TikTok / Reels / Shorts format
- You want fast publishing
- You need templates, cuts, music, and export in one place
```

```text
Do not start here when:
- You do not have a script
- You do not have a product angle
- You need AI-generated visuals
- You want avatar-style video
- You need a high-end cinematic brand commercial
```

---

## 6.8 模块 6：Role in Workflow

```text
Message planning → Video editing → Publishing assets

ChatGPT / Claude → CapCut → Canva
```

说明：

```text
CapCut usually sits in the middle of the workflow.

Used after:
You have a hook, script, and product footage.

Used before:
You create the final cover, caption, and publishing assets in Canva.
```

---

## 6.9 模块 7：Best Setups Including This Tool

示例：

```text
TikTok Product Promo Video
ChatGPT / Claude → CapCut → Canva
Role: Main editing tool
[View full setup]
```

```text
AI Avatar Product Video
ChatGPT → HeyGen → CapCut
Role: Final editing and subtitles
[View full setup]
```

---

## 6.10 模块 8：Better Options If

示例：

```text
Need AI-generated visuals:
Use Runway / Kling.
CapCut is better for editing existing materials. Runway or Kling are better when you need new AI-generated visuals.

Want one-tool video generation:
Use InVideo.
InVideo is better when you want prompt-to-video or script-to-video in one place.

Want AI avatar video:
Use HeyGen.
HeyGen is designed for AI presenter and talking-head style videos.
```

---

## 6.11 模块 9：Practical Details

保留基础信息，但放后面。

```text
Official website: capcut.com
Category: Video editing
Pricing: Free / Paid
Input: Video clips, images, audio, text
Output: Edited video, social video
Platform: Web, iOS, Android, Desktop
Learning curve: Beginner
Login required: Yes
Commercial use: Check tool policy
```

---

# 7. Page 4：Setup Detail Page

## 7.1 页面定位

这是某个任务方案的可复用详情页。

路径示例：

```text
/setups/tiktok-product-promo-video
```

## 7.2 页面结构

```text
1. Setup Hero
2. Best Tool Setup
3. How to use it
4. What you can skip
5. Better options if
6. Cost advice
7. Tools in this setup
```

这个页面本质上是任务结果页的静态可访问版本，方便从工具详情页跳转。

---

# 8. 暂不做：任务 + 角色 + 素材 + 预算

## 8.1 本版本明确不做

不做以下模块：

```text
Who are you?
What do you already have?
Budget preference
Team size
Existing tools
Skill level
```

## 8.2 放到下一个版本

下一版本可以增加：

```text
Refine this decision
```

位置建议：

```text
Best Tool Setup for This Task 之后
How to use it 之前
```

但 MVP 不做。

## 8.3 下版本方向

后续可选字段：

```text
Role:
Creator / Small business / SaaS founder / Marketing team / Agency

Material status:
Only an idea / Product photos / Product clips / A script / A document

Budget preference:
Free-first / Low-cost / Best quality / Team-ready
```

---

# 9. 数据结构设计

## 9.1 目录结构

```text
app/
├── page.tsx
├── tools/
│   └── [slug]/
│       └── page.tsx
├── setups/
│   └── [slug]/
│       └── page.tsx
└── api/
    ├── decision/
    │   └── route.ts
    └── tools/
        └── [slug]/
            └── route.ts

components/
├── layout/
│   └── AppHeader.tsx
├── search/
│   └── HeroSearch.tsx
├── decision/
│   ├── DecisionResult.tsx
│   ├── BestToolSetup.tsx
│   ├── UsagePlan.tsx
│   ├── SkipAdvice.tsx
│   ├── BetterOptions.tsx
│   └── CostAdvice.tsx
├── tool-detail/
│   ├── ToolDecisionHero.tsx
│   ├── DecisionSummary.tsx
│   ├── WorthUsingIf.tsx
│   ├── BestFitTasks.tsx
│   ├── WhenToUse.tsx
│   ├── WorkflowRole.tsx
│   ├── RelatedSetups.tsx
│   ├── BetterOptionsIf.tsx
│   └── PracticalDetails.tsx
└── setup-detail/
    ├── SetupHero.tsx
    └── SetupDecision.tsx

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

# 10. TypeScript 类型设计

## 10.1 Tool

```ts
export type Tool = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;

  logoUrl?: string;
  screenshotUrls?: string[];

  category: string;
  shortDescription: string;
  pricingLabel?: string;
  learningCurve: "Beginner" | "Intermediate" | "Advanced";

  inputTypes: string[];
  outputTypes: string[];
  platforms: string[];
  tags: string[];

  bestFor: string[];
  notBestFor: string[];

  decisionSummary: string;

  worthUsingIf: string[];
  probablySkipIf: string[];

  useWhen: string[];
  avoidWhen: string[];

  workflowRoles: Array<{
    role: string;
    description: string;
    commonPosition: "first" | "middle" | "last" | "standalone";
  }>;

  commonSetups: Array<{
    setupTitle: string;
    setupSlug: string;
    roleInSetup: string;
    setupPreview: string[];
  }>;

  betterOptionsIf: Array<{
    condition: string;
    toolSlugs: string[];
    reason: string;
  }>;

  practical: {
    collectedDate?: string;
    monthlyTraffic?: string;
    hasFreePlan?: boolean;
    loginRequired?: boolean;
    commercialUse?: string;
  };
};
```

---

## 10.2 RecommendedTool

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

---

## 10.3 UsageStep

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

---

## 10.4 BetterOption

```ts
export type BetterOption = {
  id: string;
  label: string;
  toolSlugs: string[];
  decision: string;
  bestFor: string;
};
```

---

## 10.5 SkipAdvice

```ts
export type SkipAdvice = {
  id: string;
  toolSlugs: string[];
  condition: string;
  reason: string;
};
```

---

## 10.6 CostAdvice

```ts
export type CostAdvice = {
  freeFirstPath: string;
  lowCostPath?: string;
  avoidPayingFor?: string[];
};
```

---

## 10.7 DecisionTemplate

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

  skipAdvice?: SkipAdvice[];
  betterOptions?: BetterOption[];
  costAdvice?: CostAdvice;

  bestFor: string[];
  notIdealFor: string[];
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  differentiationNote: string;
};
```

---

## 10.8 DecisionResult

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

  skipAdvice?: Array<{
    id: string;
    tools: Tool[];
    condition: string;
    reason: string;
  }>;

  betterOptions?: Array<{
    id: string;
    label: string;
    tools: Tool[];
    decision: string;
    bestFor: string;
  }>;

  costAdvice?: CostAdvice;

  bestFor: string[];
  notIdealFor: string[];
  estimatedTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  differentiationNote: string;
};
```

---

# 11. Zod Schema

路径：

```text
lib/schemas/toolDecision.ts
```

```ts
import { z } from "zod";

export const workflowRoleSchema = z.object({
  role: z.string(),
  description: z.string(),
  commonPosition: z.enum(["first", "middle", "last", "standalone"])
});

export const commonSetupSchema = z.object({
  setupTitle: z.string(),
  setupSlug: z.string(),
  roleInSetup: z.string(),
  setupPreview: z.array(z.string())
});

export const betterOptionIfSchema = z.object({
  condition: z.string(),
  toolSlugs: z.array(z.string()),
  reason: z.string()
});

export const practicalToolDetailSchema = z.object({
  collectedDate: z.string().optional(),
  monthlyTraffic: z.string().optional(),
  hasFreePlan: z.boolean().optional(),
  loginRequired: z.boolean().optional(),
  commercialUse: z.string().optional()
});

export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  websiteUrl: z.string().url(),

  logoUrl: z.string().optional(),
  screenshotUrls: z.array(z.string()).optional(),

  category: z.string(),
  shortDescription: z.string(),
  pricingLabel: z.string().optional(),
  learningCurve: z.enum(["Beginner", "Intermediate", "Advanced"]),

  inputTypes: z.array(z.string()),
  outputTypes: z.array(z.string()),
  platforms: z.array(z.string()),
  tags: z.array(z.string()),

  bestFor: z.array(z.string()),
  notBestFor: z.array(z.string()),

  decisionSummary: z.string(),

  worthUsingIf: z.array(z.string()),
  probablySkipIf: z.array(z.string()),

  useWhen: z.array(z.string()),
  avoidWhen: z.array(z.string()),

  workflowRoles: z.array(workflowRoleSchema),
  commonSetups: z.array(commonSetupSchema),
  betterOptionsIf: z.array(betterOptionIfSchema),

  practical: practicalToolDetailSchema
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

export const skipAdviceSchema = z.object({
  id: z.string(),
  toolSlugs: z.array(z.string()),
  condition: z.string(),
  reason: z.string()
});

export const costAdviceSchema = z.object({
  freeFirstPath: z.string(),
  lowCostPath: z.string().optional(),
  avoidPayingFor: z.array(z.string()).optional()
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

  skipAdvice: z.array(skipAdviceSchema).optional(),
  betterOptions: z.array(betterOptionSchema).optional(),
  costAdvice: costAdviceSchema.optional(),

  bestFor: z.array(z.string()),
  notIdealFor: z.array(z.string()),
  estimatedTime: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),

  differentiationNote: z.string()
});

export const decisionSearchRequestSchema = z.object({
  input: z.string().min(2).max(500)
});

export type Tool = z.infer<typeof toolSchema>;
export type RecommendedTool = z.infer<typeof recommendedToolSchema>;
export type UsageStep = z.infer<typeof usageStepSchema>;
export type BetterOption = z.infer<typeof betterOptionSchema>;
export type SkipAdvice = z.infer<typeof skipAdviceSchema>;
export type CostAdvice = z.infer<typeof costAdviceSchema>;
export type DecisionTemplate = z.infer<typeof decisionTemplateSchema>;
export type DecisionSearchRequest = z.infer<typeof decisionSearchRequestSchema>;
```

---

# 12. 决策模板示例：TikTok 产品视频

路径：

```text
lib/data/decisionTemplates.ts
```

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
          "Skip this if you already have strong product footage.",
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

    skipAdvice: [
      {
        id: "skip-runway-kling",
        toolSlugs: ["runway", "kling"],
        condition: "If you already have strong product clips",
        reason:
          "You do not need AI video generation. CapCut is enough for editing, captions, and export."
      },
      {
        id: "skip-heygen",
        toolSlugs: ["heygen"],
        condition: "If you do not need an avatar-style presenter",
        reason:
          "HeyGen is useful for talking-head avatar videos, but unnecessary for normal product clips."
      },
      {
        id: "skip-invideo",
        toolSlugs: ["invideo"],
        condition: "If you want editing control in CapCut",
        reason:
          "InVideo is better for all-in-one draft generation, but CapCut gives more editing control."
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

    costAdvice: {
      freeFirstPath:
        "ChatGPT free / Claude free + CapCut free + Canva free.",
      lowCostPath:
        "Use ChatGPT Plus only if you need better scripts frequently. Upgrade CapCut or Canva only if you publish weekly.",
      avoidPayingFor: [
        "Runway / Kling if you already have enough footage.",
        "HeyGen if you do not need avatar videos.",
        "InVideo if CapCut already gives you enough control."
      ]
    },

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
      "This is not a list of AI video tools. It is a decision result that tells you which tools are core, which are optional, what you can skip, and when to use each one."
  }
];
```

---

# 13. Codex 开发指令

```text
请把项目调整为 AI Tool Decision Assistant MVP v1.2。

本版本目标：
只上线 MVP，不做复杂个性化。

产品标题：
Make better AI tool decisions for every task.

副标题：
Describe what you want to do. We’ll show which AI tools to use, which to skip, and how to get started.

按钮：
Get Decision

核心页面：
1. Homepage
2. Task Decision Result Page
3. Tool Decision Detail Page
4. Setup Detail Page

结果页模块：
1. Best Tool Setup for This Task
2. How to use it
3. What you can skip
4. Better options if
5. Cost advice

注意：
- 不做任务 + 角色 + 素材 + 预算。
- 不做 Refine this decision。
- 不做复杂 onboarding。
- 不做多轮追问。
- 不做工具目录和排行榜。
- 不做完整工具链。

工具详情页模块：
1. Tool Decision Hero
2. Decision Summary
3. Worth using if
4. Best-fit Tasks
5. When to Use / When Not to Use
6. Role in Workflow
7. Best Setups Including This Tool
8. Better Options If
9. Practical Details

新增数据字段：
DecisionTemplate:
- skipAdvice
- costAdvice

Tool:
- worthUsingIf
- probablySkipIf

所有文案必须突出：
不是 AI 工具目录。
不是工具列表。
是帮助用户做 AI 工具决策。

默认测试输入：
I want to create a product promo video for TikTok.

必须显示：
Best Tool Setup for This Task
How to use it
What you can skip
Better options if
Cost advice
```

---

# 14. 验收标准

## 14.1 首页必须出现

```text
AI Tool Decision Assistant
Make better AI tool decisions for every task.
Describe what you want to do. We’ll show which AI tools to use, which to skip, and how to get started.
Get Decision
```

## 14.2 结果页必须出现

```text
Best Tool Setup for This Task
How to use it
What you can skip
Better options if
Cost advice
```

## 14.3 工具详情页必须出现

```text
AI Tool Decision Detail
Decision Summary
Worth using if
Best-fit Tasks
Use when
Do not start here when
Role in workflow
Best setups including this tool
Better options if
Practical details
```

## 14.4 不得出现

```text
AI Tool Combo Card
AI Task Solution Search
Recommended Tool Combination
Expand to Full Toolchain
Fastest Path
Step Details
Tool Directory
Ranking
Alternative options
3-Step Usage Plan
Refine this decision
Who are you?
What do you already have?
Budget preference
```

---

# 15. 下一版本规划，不进入 MVP

下一版本再考虑：

```text
Refine this decision
```

可以加入：

```text
Role
Material status
Budget preference
Skill level
Existing tools
```

但 MVP 暂时不做。

原因：

```text
先让用户低摩擦输入任务，并马上获得决策结果。
等核心体验跑通，再做渐进式补充信息。
```

---

# 16. 最终定稿

```text
AI Tool Decision Assistant v1.2 MVP：

不是 AI 工具导航。
不是工具组合大全。
不是复杂工作流。

它只做一件事：
用户输入任务后，告诉用户该用哪些 AI 工具、哪些可以跳过、怎么开始、如何少买错工具。
```
