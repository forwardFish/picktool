# AI Tool Decision Assistant｜MVP 开发文档 v1.1

> 版本：v1.1  
> 本次修改重点：在 v1.0 的基础上，新增并重构 **AI 工具详情页**。  
> 核心原则：工具详情页不能做成 Toolify / There’s An AI For That 那种“工具百科页 / 工具目录页”，而要做成 **AI Tool Decision Detail Page（AI 工具决策详情页）**。  
> 目标：用户进入某个 AI 工具详情页后，不只是知道“这个工具是什么”，而是知道 **这个工具适合什么任务、什么时候该用、什么时候不该用、在流程中处于哪一步、和哪些工具组合最好、如果情况不同应该换哪个工具**。

---

# 0. 最终产品定位

## 0.1 产品名称

```text
AI Tool Decision Assistant
```

中文理解：

```text
AI 工具决策助手
```

## 0.2 最终核心价值

```text
输入任务，获得最适合当前任务的 AI 工具选择建议、使用顺序和更简单的替代方案。
```

更直白地说：

```text
用户不是来逛 AI 工具目录的。
用户是来问：这个任务我到底该用哪个 AI 工具？
```

## 0.3 产品和工具详情页的关系

产品有两个核心页面：

```text
1. 首页 / 任务搜索页
   用户输入任务，获得 Best Tool Setup for This Task。

2. AI 工具详情页
   用户查看某个工具，了解它适合什么任务、什么时候该用、什么时候不用、和哪些工具搭配。
```

工具详情页不是普通工具介绍页，而是：

```text
AI Tool Decision Detail Page
```

---

# 1. 与 Toolify / There’s An AI For That 的区别

## 1.1 Toolify / There’s An AI For That 的核心

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
工具截图
工具评论
工具替代品
```

用户看完以后，还需要自己判断：

```text
哪个最适合？
哪个先用？
哪个可以不用？
哪个是主工具？
哪个只是辅助工具？
这个工具在我的任务里到底有什么用？
```

## 1.2 本产品的核心

本产品不是 AI 工具导航，而是：

```text
Decide which AI tools to use.
```

本产品的核心单位不是 Tool，而是：

```text
Task Decision
Tool Decision
```

典型结果页结构：

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

典型工具详情页结构：

```text
用户打开某个工具
↓
Decision Summary
↓
Best-fit Tasks
↓
When to Use / When Not to Use
↓
Role in Workflow
↓
Best Setups Including This Tool
↓
Better Options If
↓
Practical Details
```

## 1.3 一句话差异

```text
Toolify / There’s An AI For That help users find AI tools.
AI Tool Decision Assistant helps users decide which AI tools to use and how to use them.
```

中文理解：

```text
别人帮用户找工具。
我们帮用户决定用什么工具、什么时候用、怎么用、哪个可以不用。
```

---

# 2. 首页与任务结果页：保持 v1.0 核心结构

## 2.1 首页主标题

```text
Find the right AI tools for your task.
```

## 2.2 首页副标题

```text
Tell us what you want to do. We’ll recommend the best tool setup, explain when to use each tool, and show simpler options when available.
```

## 2.3 按钮文案

```text
Find Tools
```

## 2.4 首页输入框 placeholder

```text
Example: I want to create a product promo video for TikTok.
```

## 2.5 任务结果页核心模块

任务结果页只保留：

```text
1. Best Tool Setup for This Task
2. How to use it
3. Better options if
```

不要出现：

```text
Tool directory
Ranking
Latest tools
Trending tools
Fastest Path
Step Details
Full Toolchain
Alternative options
```

---

# 3. 新增：AI 工具详情页定位

## 3.1 页面名称

```text
AI Tool Decision Detail Page
```

中文理解：

```text
AI 工具决策详情页
```

## 3.2 页面目标

普通工具详情页回答：

```text
这个工具是什么？
```

本产品的工具详情页要回答：

```text
这个工具什么时候该用？
什么时候不该用？
它适合哪些具体任务？
它在工作流中处于哪一步？
它通常和哪些工具一起用？
如果我的情况不同，应该换哪个工具？
```

## 3.3 页面第一原则

首屏不要只写工具介绍。

不要写成：

```text
CapCut is a video editing tool.
```

要写成：

```text
Use CapCut when you already have clips and need fast short-video editing.
```

这句话一出现，用户马上知道你不是普通工具目录。

---

# 4. AI 工具详情页最终信息架构

工具详情页按照这个顺序展示：

```text
1. Tool Decision Hero
2. Decision Summary
3. Best-fit Tasks
4. When to Use / When Not to Use
5. Role in Workflow
6. Best Setups Including This Tool
7. Better Options If
8. Practical Details
```

---

# 5. 模块 1：Tool Decision Hero

## 5.1 模块作用

保留工具详情页必要的基础信息，但不要做成工具百科。

展示内容：

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

## 5.2 示例：CapCut

```text
CapCut

Fast short-video editing for creators and marketers.

Decision summary:
Use CapCut when you already have clips and need fast editing, captions, templates, and export.
Do not start here if you still do not have a hook, script, or product angle.

Primary role:
Video editing

Best with:
ChatGPT / Claude → CapCut → Canva
```

## 5.3 页面按钮

```text
Open official website
Copy tool link
Save tool
```

---

# 6. 模块 2：Decision Summary

## 6.1 模块作用

这是工具详情页最重要的判断模块。

必须回答：

```text
这个工具最适合什么？
什么时候应该用？
什么时候不要优先用？
它通常在流程中的位置？
它通常和谁搭配？
```

## 6.2 示例：Runway / Kling

```text
Decision Summary

Use Runway or Kling when:
You need AI-generated visuals, image-to-video clips, or visual assets that real footage cannot provide.

Do not use them when:
You already have strong product footage and only need fast editing. In that case, CapCut is usually enough.

Common workflow position:
Middle step — after message planning, before final editing and packaging.

Works best with:
ChatGPT / Claude → Runway / Kling → CapCut → Canva
```

---

# 7. 模块 3：Best-fit Tasks

## 7.1 模块作用

告诉用户这个工具最适合哪些具体任务。

不要只写分类：

```text
Video
Marketing
Design
```

要写成任务：

```text
Create a TikTok product promo video
Turn product photos into video clips
Generate AI visuals for an ad
Create image-to-video social content
```

## 7.2 字段设计

每个任务卡包含：

```text
任务名称
为什么适合
该工具在任务中的角色
进入任务决策页按钮
```

按钮文案：

```text
View setup
```

## 7.3 示例：CapCut

```text
Best-fit Tasks

Create a TikTok product promo video
Use CapCut for editing if you already have product clips.
[View setup]

Edit a talking-head short video
Use CapCut for captions, cuts, pacing, and social export.
[View setup]

Turn product clips into a social ad
Use CapCut first, then Canva for cover and caption.
[View setup]
```

---

# 8. 模块 4：When to Use / When Not to Use

## 8.1 模块作用

这是与 Toolify / There’s An AI For That 区分最大的模块。

普通工具导航会说工具很好。  
你的页面要告诉用户：

```text
什么时候该用
什么时候不用
```

## 8.2 示例：CapCut

```text
Use CapCut when:
- You already have video clips
- You need captions and quick edits
- You want TikTok / Reels / Shorts format
- You want fast publishing
- You need templates, cuts, music, and export in one place

Do not use CapCut first when:
- You do not have a script
- You do not have a product angle
- You need AI-generated visuals
- You want avatar-style video
- You need a high-end cinematic brand commercial
```

## 8.3 示例：Gamma

```text
Use Gamma when:
- You need a quick first slide deck
- Your PDF or outline is already structured
- You want a clean presentation draft fast
- You do not need heavy manual design control

Do not use Gamma first when:
- Your source document is messy and unstructured
- You need a highly custom investor deck
- You need strict brand design control
- Your content needs heavy reasoning before slide generation
```

---

# 9. 模块 5：Role in Workflow

## 9.1 模块作用

告诉用户这个工具在工作流里处于哪一步。

例如：

```text
first
middle
last
standalone
```

## 9.2 示例：TikTok 视频任务

```text
Message planning → Video creation / editing → Publishing assets

ChatGPT / Claude → CapCut / Runway / Kling → Canva
```

其中 CapCut 的位置：

```text
Role:
Middle step

Used after:
You have a hook, script, and footage or visual assets.

Used before:
Canva cover and publishing assets.
```

## 9.3 示例：PDF 转 PPT

```text
Content cleanup → Deck generation → Visual polish

ChatGPT / Claude → Gamma → Canva
```

Gamma 的位置：

```text
Role:
Main generation step

Used after:
You have a clean PDF or outline.

Used before:
Optional visual polishing in Canva.
```

---

# 10. 模块 6：Best Setups Including This Tool

## 10.1 模块作用

这个模块是你的核心商业价值。

用户进入某个工具页，不只是看工具，而是看到：

```text
这个工具在哪些任务方案里会出现？
它通常和哪些工具搭配？
```

## 10.2 示例：CapCut

```text
Best Setups Including CapCut

TikTok Product Promo Video
ChatGPT / Claude → CapCut → Canva
Role: Main editing tool

AI Avatar Product Video
ChatGPT → HeyGen → CapCut
Role: Final editing and subtitles

Product Clips to Social Ad
CapCut → Canva
Role: Fast editing and export

Talking-head Short Video
ChatGPT → CapCut
Role: Editing, captions, and pacing
```

每个 setup 卡片需要按钮：

```text
View full decision setup
```

---

# 11. 模块 7：Better Options If

## 11.1 模块作用

不是传统“替代工具列表”。

它不是：

```text
Alternatives
```

而是：

```text
Better Options If
```

意思是：

```text
如果你的情况不同，可能这个工具不是最优选择。
```

## 11.2 示例：CapCut

```text
Better Options If

Need AI-generated visuals:
Use Runway / Kling.
Reason: CapCut is better for editing, not for generating new visuals.

Want one-tool video generation:
Use InVideo.
Reason: InVideo is better when you want prompt-to-video or script-to-video in one place.

Want AI avatar video:
Use HeyGen.
Reason: HeyGen is designed for AI presenter and talking-head video.

Need professional post-production:
Use DaVinci Resolve / Premiere Pro.
Reason: CapCut is optimized for fast social editing, not high-end professional editing.
```

---

# 12. 模块 8：Practical Details

## 12.1 模块作用

保留你截图里那些“工具详情页必要信息”，但放在后面。

展示：

```text
Official website
Pricing
Free plan / paid plan
Input types
Output types
Platforms
Category
Login required
Commercial use
Learning curve
Collected date
Monthly traffic
Tags
```

## 12.2 示例

```text
Practical Details

Official website: capcut.com
Category: Video editing
Pricing: Free / Paid
Input: Video clips, images, audio, text
Output: Edited video
Platform: Web, iOS, Android, desktop
Learning curve: Beginner
Best for: Short-form video
Login required: Yes
Commercial use: Check tool policy
```

## 12.3 不建议首屏展示的信息

以下信息可以保留，但不要放首屏：

```text
作者信息
发布时间
版本号
评论数
优惠码
完整评论
问答
SEO 文本介绍
长篇工具百科
```

这些不是你的差异化核心。

---

# 13. 工具详情页字段设计

## 13.1 Tool 基础字段升级

路径：

```text
lib/schemas/toolDecision.ts
```

新增或扩展 `Tool`：

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

# 14. Tool Detail Result 类型

用于工具详情页渲染。

```ts
export type ToolDetailResult = {
  tool: Tool;

  bestFitTasks: Array<{
    taskTitle: string;
    taskSlug: string;
    whyFit: string;
    roleInTask: string;
  }>;

  relatedSetups: Array<{
    setupTitle: string;
    setupSlug: string;
    previewTools: Tool[];
    roleInSetup: string;
  }>;

  betterOptions: Array<{
    condition: string;
    tools: Tool[];
    reason: string;
  }>;
};
```

---

# 15. Zod Schema 补充

```ts
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

  useWhen: z.array(z.string()),
  avoidWhen: z.array(z.string()),

  workflowRoles: z.array(workflowRoleSchema),
  commonSetups: z.array(commonSetupSchema),
  betterOptionsIf: z.array(betterOptionIfSchema),

  practical: practicalToolDetailSchema
});
```

---

# 16. 工具数据示例：CapCut

```ts
{
  id: "capcut",
  name: "CapCut",
  slug: "capcut",
  websiteUrl: "https://www.capcut.com",
  logoUrl: "/tools/capcut/logo.png",
  screenshotUrls: ["/tools/capcut/screenshot-1.png"],

  category: "video",
  shortDescription: "Fast short-video editing, captions, templates, and publishing-ready clips.",
  pricingLabel: "Free / Paid",
  learningCurve: "Beginner",

  inputTypes: ["Video clips", "Images", "Audio", "Text"],
  outputTypes: ["Edited video", "Social video"],
  platforms: ["Web", "iOS", "Android", "Desktop"],
  tags: ["Video editing", "Short video", "Captions", "TikTok", "Reels"],

  bestFor: [
    "Fast short-video editing",
    "Captions and cuts",
    "TikTok / Reels / Shorts",
    "Editing existing product clips"
  ],
  notBestFor: [
    "Writing the product angle",
    "Generating AI visuals from scratch",
    "High-end cinematic production",
    "AI avatar generation"
  ],

  decisionSummary:
    "Use CapCut when you already have clips and need fast editing, captions, templates, and export. Do not start here if you still need a hook, script, or product angle.",

  useWhen: [
    "You already have video clips",
    "You need captions and quick edits",
    "You want TikTok / Reels / Shorts format",
    "You want fast publishing"
  ],
  avoidWhen: [
    "You do not have a script",
    "You do not have a product angle",
    "You need AI-generated visuals",
    "You want avatar-style video"
  ],

  workflowRoles: [
    {
      role: "Video editing",
      description:
        "Used after message planning and footage preparation, before final cover and publishing assets.",
      commonPosition: "middle"
    }
  ],

  commonSetups: [
    {
      setupTitle: "TikTok Product Promo Video",
      setupSlug: "tiktok-product-promo-video",
      roleInSetup: "Main editing tool",
      setupPreview: ["ChatGPT / Claude", "CapCut", "Canva"]
    },
    {
      setupTitle: "AI Avatar Product Video",
      setupSlug: "ai-avatar-product-video",
      roleInSetup: "Final editing and subtitles",
      setupPreview: ["ChatGPT", "HeyGen", "CapCut"]
    },
    {
      setupTitle: "Product Clips to Social Ad",
      setupSlug: "product-clips-social-ad",
      roleInSetup: "Fast editing and export",
      setupPreview: ["CapCut", "Canva"]
    }
  ],

  betterOptionsIf: [
    {
      condition: "Need AI-generated visuals",
      toolSlugs: ["runway", "kling"],
      reason:
        "CapCut is better for editing existing materials. Runway or Kling are better when you need new AI-generated visuals."
    },
    {
      condition: "Want one-tool video generation",
      toolSlugs: ["invideo"],
      reason:
        "InVideo is better when you want prompt-to-video or script-to-video in one place."
    },
    {
      condition: "Want AI avatar video",
      toolSlugs: ["heygen"],
      reason:
        "HeyGen is designed for AI presenter and talking-head style videos."
    }
  ],

  practical: {
    collectedDate: "2026-04-29",
    monthlyTraffic: "",
    hasFreePlan: true,
    loginRequired: true,
    commercialUse: "Check CapCut terms before commercial use."
  }
}
```

---

# 17. 工具详情页 API

## 17.1 路由

```text
app/api/tools/[slug]/route.ts
```

## 17.2 查询逻辑

```ts
import { NextResponse } from "next/server";
import { tools } from "@/lib/data/tools";

function resolveTools(slugs: string[]) {
  return slugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter(Boolean);
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const tool = tools.find((item) => item.slug === params.slug);

  if (!tool) {
    return NextResponse.json(
      { error: "Tool not found" },
      { status: 404 }
    );
  }

  const betterOptions = tool.betterOptionsIf.map((item) => ({
    condition: item.condition,
    tools: resolveTools(item.toolSlugs),
    reason: item.reason
  }));

  return NextResponse.json({
    tool,
    betterOptions
  });
}
```

---

# 18. 工具详情页路由

```text
app/tools/[slug]/page.tsx
```

页面组件：

```text
components/tool-detail/
├── ToolDecisionHero.tsx
├── DecisionSummary.tsx
├── BestFitTasks.tsx
├── WhenToUse.tsx
├── WorkflowRole.tsx
├── RelatedSetups.tsx
├── BetterOptionsIf.tsx
└── PracticalDetails.tsx
```

---

# 19. 工具详情页组件设计

## 19.1 ToolDetailPage

```tsx
import { ToolDecisionHero } from "@/components/tool-detail/ToolDecisionHero";
import { DecisionSummary } from "@/components/tool-detail/DecisionSummary";
import { BestFitTasks } from "@/components/tool-detail/BestFitTasks";
import { WhenToUse } from "@/components/tool-detail/WhenToUse";
import { WorkflowRole } from "@/components/tool-detail/WorkflowRole";
import { RelatedSetups } from "@/components/tool-detail/RelatedSetups";
import { BetterOptionsIf } from "@/components/tool-detail/BetterOptionsIf";
import { PracticalDetails } from "@/components/tool-detail/PracticalDetails";
import { tools } from "@/lib/data/tools";

export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tool = tools.find((item) => item.slug === params.slug);

  if (!tool) {
    return <main className="min-h-screen bg-[#070b16] text-white">Tool not found</main>;
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
        <ToolDecisionHero tool={tool} />
        <DecisionSummary tool={tool} />
        <BestFitTasks tool={tool} />
        <WhenToUse tool={tool} />
        <WorkflowRole tool={tool} />
        <RelatedSetups tool={tool} />
        <BetterOptionsIf tool={tool} />
        <PracticalDetails tool={tool} />
      </div>
    </main>
  );
}
```

## 19.2 ToolDecisionHero

```tsx
import type { Tool } from "@/lib/schemas/toolDecision";

export function ToolDecisionHero({ tool }: { tool: Tool }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between gap-8">
        <div>
          <p className="text-sm font-medium text-blue-300">
            AI Tool Decision Detail
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white">
            {tool.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            {tool.shortDescription}
          </p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white">
            {tool.decisionSummary}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white"
          >
            Open official website
          </a>
          <button className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-slate-200">
            Copy link
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm text-slate-200">
          {tool.category}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm text-slate-200">
          {tool.pricingLabel}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm text-slate-200">
          {tool.learningCurve}
        </span>
      </div>
    </section>
  );
}
```

## 19.3 WhenToUse

```tsx
import type { Tool } from "@/lib/schemas/toolDecision";

export function WhenToUse({ tool }: { tool: Tool }) {
  return (
    <section className="grid grid-cols-2 gap-5">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-2xl font-semibold text-white">Use when</h2>
        <ul className="mt-4 grid gap-3">
          {tool.useWhen.map((item) => (
            <li key={item} className="text-sm leading-6 text-slate-300">
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-2xl font-semibold text-white">Do not start here when</h2>
        <ul className="mt-4 grid gap-3">
          {tool.avoidWhen.map((item) => (
            <li key={item} className="text-sm leading-6 text-slate-300">
              • {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

## 19.4 RelatedSetups

```tsx
import Link from "next/link";
import type { Tool } from "@/lib/schemas/toolDecision";

export function RelatedSetups({ tool }: { tool: Tool }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
      <h2 className="text-2xl font-semibold text-white">
        Best setups including {tool.name}
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        See where this tool fits in real task setups.
      </p>

      <div className="mt-6 grid gap-4">
        {tool.commonSetups.map((setup) => (
          <div
            key={setup.setupSlug}
            className="rounded-[24px] border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {setup.setupTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Role: {setup.roleInSetup}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  {setup.setupPreview.join(" → ")}
                </p>
              </div>

              <Link
                href={`/setups/${setup.setupSlug}`}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200"
              >
                View setup
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

# 20. 工具详情页视觉方向

可以借鉴截图里的：

```text
大卡片
工具 Logo
标签
截图
替代工具
Tab 结构
基础信息
```

但你的页面不要以 Tab 为主，不要让用户像逛工具库。

建议视觉结构：

```text
深色 SaaS 背景
超大 Hero 决策卡
大号工具推荐模块
左右两列的 Use / Avoid 判断区
横向 setup 卡片
Better Options If 卡片
底部 practical details
```

---

# 21. 工具详情页验收标准

## 21.1 必须出现

```text
AI Tool Decision Detail
Decision Summary
Best-fit Tasks
Use when
Do not start here when
Role in workflow
Best setups including this tool
Better options if
Practical details
```

## 21.2 不得只出现

```text
工具介绍
工具截图
价格
评论
替代品
作者信息
发布时间
```

这些可以有，但不能成为页面主结构。

## 21.3 页面第一屏必须回答

```text
这个工具什么时候该用？
什么时候不该用？
它在任务流程里负责什么？
```

---

# 22. Codex 开发指令补充：工具详情页

把下面内容追加给 Codex：

```text
请在 AI Tool Decision Assistant 中新增工具详情页。

工具详情页不是普通 Tool Directory Detail，不要照着 Toolify / There’s An AI For That 做工具百科页。

页面定位：
AI Tool Decision Detail Page

目标：
用户打开某个工具后，能快速知道：
- 这个工具什么时候该用
- 什么时候不该用
- 它适合哪些具体任务
- 它在任务流程里处于哪一步
- 它通常和哪些工具搭配
- 如果情况不同，应该换哪个工具

新增路由：
app/tools/[slug]/page.tsx
app/api/tools/[slug]/route.ts

新增组件：
components/tool-detail/ToolDecisionHero.tsx
components/tool-detail/DecisionSummary.tsx
components/tool-detail/BestFitTasks.tsx
components/tool-detail/WhenToUse.tsx
components/tool-detail/WorkflowRole.tsx
components/tool-detail/RelatedSetups.tsx
components/tool-detail/BetterOptionsIf.tsx
components/tool-detail/PracticalDetails.tsx

工具数据 Tool 类型需要扩展：
- logoUrl
- screenshotUrls
- learningCurve
- inputTypes
- outputTypes
- platforms
- tags
- notBestFor
- decisionSummary
- useWhen
- avoidWhen
- workflowRoles
- commonSetups
- betterOptionsIf
- practical

工具详情页模块顺序：
1. Tool Decision Hero
2. Decision Summary
3. Best-fit Tasks
4. When to Use / When Not to Use
5. Role in Workflow
6. Best Setups Including This Tool
7. Better Options If
8. Practical Details

首屏不要只写：
CapCut is a video editing tool.

要写成：
Use CapCut when you already have clips and need fast short-video editing.

必须突出：
This is not a tool directory page. This is a decision page for when and how to use the tool.
```

---

# 23. 最终定稿

```text
AI Tool Decision Assistant 有两个核心页面：

1. 任务决策结果页
   输入任务 → Best Tool Setup for This Task → How to use it → Better options if

2. 工具决策详情页
   打开工具 → Decision Summary → When to Use / When Not to Use → Role in Workflow → Best Setups Including This Tool
```

最终差异：

```text
Toolify / There’s An AI For That：
帮用户找工具、看工具、浏览工具。

AI Tool Decision Assistant：
帮用户判断工具什么时候该用、什么时候不用、怎么搭配、怎么完成任务。
```
