# AI Task Solution Search｜MVP 开发文档 v0.4

> 版本：v0.4  
> 定位：主产品为 **AI Task Solution Search**  
> 核心价值：**输入任务，获得 AI 完成方案**  
> 当前版本：**任务方案搜索**  
> 后续增强：**完整工具链方案**  
> 目标：这份文档可以直接交给 Codex / Claude Code / Trae 进行开发，实现一个可运行的 Next.js MVP。

---

# 0. v0.4 核心结论

本项目不再以“AI 决策导航”作为第一表达，也不再强调“立即执行动作”。

v0.4 的主产品是：

```text
AI Task Solution Search
输入你要完成的任务，直接获得 AI 完成方案。
```

产品第一版只做一件事：

```text
用户输入一个任务
↓
系统匹配一个高频任务方案模板
↓
展示最快完成路径
↓
展示推荐工具组合
↓
说明每一步输入什么、产出什么
↓
提供可选的“扩展成完整工具链方案”入口
```

第一版不做真正的自动执行 Agent。  
第一版不承诺一键生成视频、PPT、网页、图片。  
第一版不把产品做成提示词站。  
第一版不把产品做成普通 AI 工具导航。

---

# 1. 产品定位

## 1.1 主产品名称

英文：

```text
AI Task Solution Search
```

中文：

```text
AI 任务方案搜索
```

## 1.2 一句话定位

```text
输入你要完成的任务，直接获得 AI 完成方案。
```

## 1.3 首页主标题

```text
输入你要完成的任务，直接获得 AI 完成方案
```

## 1.4 首页副标题

```text
不用翻 AI 工具列表。系统会为你匹配最快路径、推荐工具组合，并告诉你每一步该输入什么、产出什么。
```

## 1.5 产品核心公式

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

## 1.6 当前版本与后续版本关系

```text
当前版本：任务方案搜索
后续增强：完整工具链方案
```

当前版本解决的是：

```text
我现在要完成这个任务，最快怎么做？
```

后续增强解决的是：

```text
这个任务背后其实是一个更大目标，我要一整套 AI 工具链方案。
```

例如：

```text
用户输入：我想做一个适合小红书的产品种草视频，怎么最快做出来？
当前版本输出：小红书产品种草视频最快完成方案
后续增强入口：扩展成产品推广 AI 工具链方案
```

---

# 2. 不做什么

v0.4 明确不做以下事情：

1. 不做普通 AI 工具导航。
2. 不和 Toolify / There’s An AI For That 正面拼工具数量。
3. 不展示 30 个工具让用户自己选。
4. 不把 ChatGPT 长回答包装成网页。
5. 不把“Prompt 包”作为主卖点。
6. 不承诺自动执行任务。
7. 不做真正 Agent 工作流执行。
8. 不让 LLM 自由生成任意流程。
9. 不在首页堆复杂分类。
10. 不做低频、应急、生活杂项问题。

---

# 3. 产品真正要做什么

v0.4 要做的是：

```text
把用户的自然语言任务，匹配成一个可理解、可执行、可照着走的 AI 完成方案。
```

用户看到的不是：

```text
一堆工具
一堆 Prompt
一堆流程理论
```

用户看到的是：

```text
1. 最适合的方案
2. 最快完成路径
3. 每一步该做什么
4. 每一步用什么工具
5. 每一步输入什么
6. 每一步产出什么
7. 这个任务是否可以扩展成更完整的工具链方案
```

---

# 4. MVP 第一版验证目标

## 4.1 核心验证问题

MVP 第一版只验证 5 件事：

1. 用户是否愿意用自然语言输入任务。
2. 用户是否能接受系统返回的“AI 完成方案”。
3. 用户是否能一眼看懂最快路径。
4. 用户是否觉得“工具组合 + 输入产出说明”比工具列表有价值。
5. 用户是否愿意点击“查看工具 / 复制输入模板 / 扩展完整方案”。

## 4.2 不验证什么

第一版不验证：

1. 用户是否愿意为全自动 Agent 付费。
2. 用户是否愿意使用复杂工作流。
3. 用户是否需要 1000 个任务模板。
4. 用户是否需要 10000 个工具。
5. 用户是否能从页面里直接生成完整作品。

## 4.3 MVP 成功指标

```text
首页访问 → 搜索提交：>= 15%
搜索提交 → 方案展示成功：>= 90%
方案展示 → 点击推荐工具：>= 8%
方案展示 → 点击“复制输入模板”：>= 15%
方案展示 → 点击“扩展完整方案”：>= 8%
用户反馈“有用”：>= 60%
```

注意：

```text
v0.4 的核心指标不是 action_clicked，而是：
- solution_viewed
- tool_clicked
- input_template_copied
- stack_expand_clicked
- feedback_helpful
```

---

# 5. 目标用户

第一版重点面向以下人群：

## 5.1 创作者

典型任务：

```text
我要做小红书图文
我要做短视频
我要做 Instagram 轮播图
我要写 LinkedIn 帖子
```

## 5.2 商家 / 小老板

典型任务：

```text
我要推广一个产品
我要做商品宣传图
我要做一个小红书种草视频
我要做一个本地门店活动海报
```

## 5.3 课程卖家 / 咨询服务提供者

典型任务：

```text
我要做课程销售页
我要做训练营报名页
我要做招生短视频
我要做私域成交话术
```

## 5.4 运营 / 市场人员

典型任务：

```text
我要把 PDF 变成汇报 PPT
我要做产品发布内容
我要做 Landing Page
我要做内容营销计划
```

---

# 6. MVP 首批任务范围

第一版建议只做 6 个高频任务模板。

## 6.1 任务 1：小红书产品种草视频

用户输入示例：

```text
我想做一个适合小红书的产品种草视频，怎么最快做出来？
我要给产品做一条小红书种草视频
我要做一个小红书带货视频
我要做一条产品推广短视频
```

返回方案：

```text
小红书产品种草视频最快完成方案
```

最快路径：

```text
产品信息 → 卖点提炼 → 种草角度 → 30 秒脚本 → 5 镜头分镜 → 视频生成/剪辑 → 封面标题
```

推荐工具组合：

```text
文案/脚本工具：ChatGPT / Claude / Kimi
视频生成/剪辑工具：剪映 / 即梦 / 可灵
封面设计工具：Canva / 稿定设计
```

可选扩展入口：

```text
这个任务可能属于“产品推广”目标。
可扩展成：产品推广 AI 工具链方案。
```

---

## 6.2 任务 2：抖音 / TikTok 广告视频

用户输入示例：

```text
我要给我的产品做一条广告视频
我要做一个抖音广告视频
我要做一个 TikTok UGC 广告
我要做一个课程推广短视频
```

返回方案：

```text
短视频广告快速生成方案
```

最快路径：

```text
广告目标 → 用户痛点 → Hook → 30 秒脚本 → 分镜 → 视频生成/剪辑 → 字幕封面
```

推荐工具组合：

```text
广告策略/脚本：ChatGPT / Claude
视频生成：即梦 / 可灵 / Runway
剪辑字幕：剪映 / CapCut
封面设计：Canva
```

可选扩展入口：

```text
扩展成：产品推广 AI 工具链方案 / 课程招生 AI 工具链方案
```

---

## 6.3 任务 3：小红书图文笔记

用户输入示例：

```text
我要做一篇小红书图文笔记
我要给产品做一组种草图文
我要做一篇小红书爆款笔记
```

返回方案：

```text
小红书图文笔记生成方案
```

最快路径：

```text
用户痛点 → 内容角度 → 标题 → 正文结构 → 配图 Prompt → 封面图 → 发布检查
```

推荐工具组合：

```text
内容文案：ChatGPT / Claude / Kimi
配图生成：即梦 / Midjourney / DALL·E
封面排版：Canva / 稿定设计
```

可选扩展入口：

```text
扩展成：小红书内容获客工具链方案
```

---

## 6.4 任务 4：PDF 转 PPT

用户输入示例：

```text
我要把一份 PDF 变成课程 PPT
我要把行业报告变成路演 PPT
我要把文档变成培训课件
我要把资料变成汇报 PPT
```

返回方案：

```text
PDF 转 PPT 快速方案
```

最快路径：

```text
上传资料 → 提炼大纲 → 拆页结构 → 生成 PPT 初稿 → 视觉优化 → 导出
```

推荐工具组合：

```text
文档理解：ChatGPT / Claude / Kimi
PPT 生成：Gamma / Tome / Canva
视觉优化：Canva / PowerPoint Designer
```

可选扩展入口：

```text
扩展成：课程内容生产工具链方案 / 汇报材料生产工具链方案
```

---

## 6.5 任务 5：课程销售页

用户输入示例：

```text
我要卖一门 AI 课程，需要一个销售页
我要做一个训练营报名页
我要做一个咨询服务成交页
我要做一个私教课报名页
```

返回方案：

```text
课程销售页成交方案
```

最快路径：

```text
课程定位 → 用户痛点 → 首屏标题 → 课程卖点 → 证明材料 → FAQ → 报名表单
```

推荐工具组合：

```text
销售文案：ChatGPT / Claude
页面生成：v0 / Framer / Webflow
表单支付：Tally / Typeform / Stripe / Lemon Squeezy
```

可选扩展入口：

```text
扩展成：课程招生 AI 工具链方案
```

---

## 6.6 任务 6：Landing Page

用户输入示例：

```text
我要给我的 SaaS 做一个落地页
我要做一个等待名单页面
我要做一个产品介绍页
我要做一个咨询服务预约页
```

返回方案：

```text
Landing Page 启动方案
```

最快路径：

```text
用户问题 → 产品定位 → 首屏标题 → 页面模块 → CTA → FAQ → 表单/预约
```

推荐工具组合：

```text
文案定位：ChatGPT / Claude
页面生成：v0 / Framer / Webflow
表单/预约：Tally / Calendly
```

可选扩展入口：

```text
扩展成：SaaS 获客 AI 工具链方案
```

---

# 7. 页面信息架构

## 7.1 首页结构

```text
AppHeader
HeroSection
  - 产品名：AI Task Solution Search
  - 主标题：输入你要完成的任务，直接获得 AI 完成方案
  - 副标题：不用翻 AI 工具列表。系统会为你匹配最快路径、推荐工具组合，并告诉你每一步该输入什么、产出什么。
  - 大搜索框
  - 示例任务 Chips

ResultPreview
  - 用户输入后，直接在搜索框下方展示结果
  - 不强制跳转

FeaturedTaskExamples
  - 小红书产品种草视频
  - PDF 转 PPT
  - 课程销售页
  - Landing Page
```

## 7.2 首页不需要复杂 Header

MVP 不建议做复杂导航。

建议 Header 只保留：

```text
左侧：AI Task Solution Search
右侧：Login / Feedback
```

不建议第一版出现：

```text
发现 / 方案 / 工具 / 排行榜 / 收藏 / Pro / 通知
```

原因：

```text
第一版核心是让用户马上输入任务。
导航越复杂，越像工具目录站。
```

---

# 8. 用户输入后的结果区设计

## 8.1 结果区展示顺序

必须按以下顺序：

```text
1. Best Solution Card：最佳方案
2. Fastest Path：最快路径
3. Tool Chain：工具组合 / 工具接力
4. Step Details：每一步输入与产出
5. Next Step：下一步操作
6. Stack Expansion Card：扩展成完整工具链
7. Feedback：是否有用
```

## 8.2 不要把 Prompt 作为一级模块

不要在主界面出现：

```text
Prompt Pack
提示词包
执行包
```

可复制内容应该隐藏在每一步里面，按钮文案用：

```text
复制这一步输入模板
```

不要用：

```text
复制 Prompt
```

## 8.3 推荐按钮文案

建议使用：

```text
查看推荐工具
复制这一步输入模板
扩展成完整方案
换一个方案
这个有用
```

避免使用：

```text
立即执行
一键生成
自动完成
开始执行
```

---

# 9. 核心页面示例

用户输入：

```text
我想做一个适合小红书的产品种草视频，怎么最快做出来？
```

返回结果应该类似：

```text
小红书产品种草视频最快完成方案

一句话建议：
不要一上来打开视频工具。先确定产品卖点和种草角度，再生成脚本和分镜，最后进入视频工具剪辑或生成视频。

最快路径：
产品信息 → 卖点提炼 → 种草角度 → 30 秒脚本 → 5 镜头分镜 → 视频生成/剪辑 → 封面标题

工具组合：
1. 文案/脚本工具：ChatGPT / Claude / Kimi
2. 视频生成/剪辑工具：剪映 / 即梦 / 可灵
3. 封面设计工具：Canva / 稿定设计

步骤说明：
第 1 步：整理产品信息
输入：产品名称、卖点、目标用户、价格、使用场景
产出：可用于后续脚本的产品 brief

第 2 步：生成种草角度
输入：产品 brief、目标用户、平台
产出：3 个小红书种草角度

第 3 步：生成 30 秒脚本
输入：种草角度、产品卖点、视频风格
产出：Hook + 正文 + CTA

第 4 步：拆成 5 镜头分镜
输入：30 秒脚本
产出：5 镜头分镜表

第 5 步：视频生成/剪辑
输入：分镜、素材、画面风格
产出：视频初稿

第 6 步：封面标题
输入：视频主题、核心卖点、用户痛点
产出：封面标题和首图结构

扩展入口：
这个任务背后可能是“产品推广”目标。
是否扩展成完整 AI 营销工具链方案？
```

---

# 10. 技术实现原则

## 10.1 第一版不要做动态工作流生成

第一版不要让 LLM 自由生成完整任务路径。

正确方式：

```text
本地方案模板库
↓
任务识别
↓
模板匹配
↓
结构化返回
```

原因：

1. 输出稳定。
2. 开发简单。
3. 体验可控。
4. 不容易变成 ChatGPT 长文。
5. 后续容易扩充更多模板。

## 10.2 LLM 在第一版只做轻量辅助

第一版可以完全不用 LLM，也可以用 LLM 做轻量分类。

推荐顺序：

```text
先用关键词规则匹配
匹配不到再调用 LLM 分类
仍然匹配不到返回 unknown fallback
```

LLM 不允许自由推荐数据库外工具。  
LLM 不允许自由创造步骤。  
LLM 只能选择已有 solution template，或返回 unknown。

---

# 11. 推荐技术栈

```text
Next.js 15 App Router
React 19
TypeScript
Tailwind CSS
Zod
本地 JSON 数据
后续可接 Prisma + PostgreSQL
```

MVP 第一版不强依赖数据库。

---

# 12. 推荐目录结构

```text
app/
├── page.tsx
├── layout.tsx
├── globals.css
├── api/
│   ├── search/
│   │   └── solution/
│   │       └── route.ts
│   └── feedback/
│       └── route.ts
├── solutions/
│   └── [slug]/
│       └── page.tsx

components/
├── layout/
│   └── AppHeader.tsx
├── search/
│   ├── HeroSearch.tsx
│   └── ExampleChips.tsx
├── results/
│   ├── SolutionResultPanel.tsx
│   ├── BestSolutionCard.tsx
│   ├── FastestPath.tsx
│   ├── ToolChain.tsx
│   ├── StepDetails.tsx
│   ├── StackExpansionCard.tsx
│   └── ResultFeedback.tsx
└── ui/
    ├── Button.tsx
    └── Card.tsx

lib/
├── solution-engine/
│   ├── classifyTask.ts
│   ├── matchSolution.ts
│   ├── buildSolutionResult.ts
│   └── scoreSolution.ts
├── data/
│   ├── solutionTemplates.ts
│   └── tools.ts
├── schemas/
│   └── solution.ts
└── utils.ts
```

---

# 13. 数据结构设计

## 13.1 Tool

```ts
export type Tool = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  logoUrl?: string;
  category: string;
  roles: string[];
  platforms?: string[];
  pricingLabel?: string;
  oneLineDescription: string;
  bestFor: string[];
  notGoodFor?: string[];
  trustScore: number;
  easeOfUseScore: number;
};
```

## 13.2 SolutionStep

```ts
export type SolutionStep = {
  id: string;
  order: number;
  title: string;
  purpose: string;
  toolRole: string;
  recommendedToolSlugs: string[];
  inputNeeded: string[];
  expectedOutput: string;
  handoffToNext?: string;
  qualityCheck?: string;
  inputTemplate?: string;
};
```

## 13.3 SolutionTemplate

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
  bestFor: string[];
  notGoodFor?: string[];
  estimatedTime: string;
  difficulty: "low" | "medium" | "high";
  fastestPath: string[];
  steps: SolutionStep[];
  relatedStack?: {
    title: string;
    description: string;
    stackSlug: string;
    previewPath: string[];
  };
  commonMistakes?: string[];
};
```

## 13.4 SolutionResult

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
  fastestPath: string[];
  toolChain: Array<{
    stepId: string;
    stepTitle: string;
    toolRole: string;
    tools: Tool[];
    inputNeeded: string[];
    expectedOutput: string;
    handoffToNext?: string;
    qualityCheck?: string;
    inputTemplate?: string;
  }>;
  nextStep: {
    title: string;
    description: string;
    fieldsNeeded: string[];
  };
  relatedStack?: {
    title: string;
    description: string;
    stackSlug: string;
    previewPath: string[];
  };
  commonMistakes: string[];
  fallback?: boolean;
};
```

---

# 14. Zod Schema

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
  roles: z.array(z.string()),
  platforms: z.array(z.string()).optional(),
  pricingLabel: z.string().optional(),
  oneLineDescription: z.string(),
  bestFor: z.array(z.string()),
  notGoodFor: z.array(z.string()).optional(),
  trustScore: z.number().min(0).max(100),
  easeOfUseScore: z.number().min(0).max(100)
});

export const solutionStepSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  purpose: z.string(),
  toolRole: z.string(),
  recommendedToolSlugs: z.array(z.string()),
  inputNeeded: z.array(z.string()),
  expectedOutput: z.string(),
  handoffToNext: z.string().optional(),
  qualityCheck: z.string().optional(),
  inputTemplate: z.string().optional()
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
  bestFor: z.array(z.string()),
  notGoodFor: z.array(z.string()).optional(),
  estimatedTime: z.string(),
  difficulty: z.enum(["low", "medium", "high"]),
  fastestPath: z.array(z.string()),
  steps: z.array(solutionStepSchema),
  relatedStack: z.object({
    title: z.string(),
    description: z.string(),
    stackSlug: z.string(),
    previewPath: z.array(z.string())
  }).optional(),
  commonMistakes: z.array(z.string()).optional()
});

export const solutionSearchRequestSchema = z.object({
  input: z.string().min(2).max(500),
  context: z.object({
    language: z.string().optional(),
    platform: z.string().optional(),
    budgetLevel: z.enum(["free", "low", "medium", "high"]).optional(),
    skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional()
  }).optional()
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
  fastestPath: z.array(z.string()),
  toolChain: z.array(z.object({
    stepId: z.string(),
    stepTitle: z.string(),
    toolRole: z.string(),
    tools: z.array(toolSchema),
    inputNeeded: z.array(z.string()),
    expectedOutput: z.string(),
    handoffToNext: z.string().optional(),
    qualityCheck: z.string().optional(),
    inputTemplate: z.string().optional()
  })),
  nextStep: z.object({
    title: z.string(),
    description: z.string(),
    fieldsNeeded: z.array(z.string())
  }),
  relatedStack: z.object({
    title: z.string(),
    description: z.string(),
    stackSlug: z.string(),
    previewPath: z.array(z.string())
  }).optional(),
  commonMistakes: z.array(z.string()),
  fallback: z.boolean().optional()
});

export type SolutionSearchRequest = z.infer<typeof solutionSearchRequestSchema>;
export type SolutionResult = z.infer<typeof solutionResultSchema>;
```

---

# 15. 工具种子数据

路径：`lib/data/tools.ts`

```ts
import type { Tool } from "@/lib/schemas/solution-types";

export const tools: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    slug: "chatgpt",
    websiteUrl: "https://chatgpt.com",
    category: "writing",
    roles: ["copywriting", "scriptwriting", "briefing", "content_structuring", "idea_generation"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合生成脚本、结构、标题、卖点和内容方案。",
    bestFor: ["脚本生成", "内容结构", "卖点提炼", "Prompt 生成"],
    notGoodFor: ["直接生成最终视频成片"],
    trustScore: 95,
    easeOfUseScore: 90
  },
  {
    id: "claude",
    name: "Claude",
    slug: "claude",
    websiteUrl: "https://claude.ai",
    category: "writing",
    roles: ["copywriting", "scriptwriting", "content_structuring", "document_understanding"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合长文档理解、内容重构和高质量文案生成。",
    bestFor: ["文档理解", "长文改写", "销售页文案", "课程大纲"],
    trustScore: 92,
    easeOfUseScore: 86
  },
  {
    id: "jianying",
    name: "剪映",
    slug: "jianying",
    websiteUrl: "https://www.capcut.cn",
    category: "video",
    roles: ["video_editing", "caption_generation", "short_video_production"],
    platforms: ["douyin", "xiaohongshu", "tiktok"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合短视频剪辑、字幕、转场和发布前处理。",
    bestFor: ["短视频剪辑", "字幕", "口播视频", "模板剪辑"],
    trustScore: 88,
    easeOfUseScore: 92
  },
  {
    id: "jimeng",
    name: "即梦",
    slug: "jimeng",
    websiteUrl: "https://jimeng.jianying.com",
    category: "video_generation",
    roles: ["image_generation", "video_generation", "visual_prompt"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合生成图片和视频画面素材。",
    bestFor: ["画面生成", "分镜画面", "视频素材"],
    trustScore: 82,
    easeOfUseScore: 80
  },
  {
    id: "kling",
    name: "可灵",
    slug: "kling",
    websiteUrl: "https://klingai.com",
    category: "video_generation",
    roles: ["video_generation", "visual_prompt"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合根据画面提示生成视频片段。",
    bestFor: ["AI 视频片段", "分镜画面生成"],
    trustScore: 84,
    easeOfUseScore: 78
  },
  {
    id: "canva",
    name: "Canva",
    slug: "canva",
    websiteUrl: "https://www.canva.com",
    category: "design",
    roles: ["cover_design", "presentation_design", "landing_visual", "social_design"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合封面、海报、PPT 和社媒视觉设计。",
    bestFor: ["封面图", "海报", "PPT 美化", "社媒配图"],
    trustScore: 91,
    easeOfUseScore: 94
  },
  {
    id: "gamma",
    name: "Gamma",
    slug: "gamma",
    websiteUrl: "https://gamma.app",
    category: "presentation",
    roles: ["presentation_generation", "content_structuring"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合快速生成演示文稿和课程 PPT 初稿。",
    bestFor: ["PPT 初稿", "课程课件", "报告转演示"],
    trustScore: 86,
    easeOfUseScore: 88
  },
  {
    id: "v0",
    name: "v0",
    slug: "v0",
    websiteUrl: "https://v0.dev",
    category: "website_builder",
    roles: ["landing_page_builder", "ui_generation"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合生成 React / Next.js 风格的页面原型。",
    bestFor: ["Landing Page", "SaaS 页面", "组件原型"],
    trustScore: 88,
    easeOfUseScore: 82
  },
  {
    id: "framer",
    name: "Framer",
    slug: "framer",
    websiteUrl: "https://www.framer.com",
    category: "website_builder",
    roles: ["landing_page_builder", "website_design"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合快速搭建漂亮的营销落地页。",
    bestFor: ["Landing Page", "营销页", "等待名单页面"],
    trustScore: 86,
    easeOfUseScore: 80
  },
  {
    id: "tally",
    name: "Tally",
    slug: "tally",
    websiteUrl: "https://tally.so",
    category: "form",
    roles: ["form_builder", "lead_capture"],
    platforms: ["web"],
    pricingLabel: "Free / Paid",
    oneLineDescription: "适合做报名表单、线索收集和等待名单。",
    bestFor: ["报名表", "线索表单", "预约收集"],
    trustScore: 84,
    easeOfUseScore: 92
  }
];
```

---

# 16. 方案模板种子数据

路径：`lib/data/solutionTemplates.ts`

下面是核心示例：小红书产品种草视频。

```ts
import type { SolutionTemplate } from "@/lib/schemas/solution-types";

export const solutionTemplates: SolutionTemplate[] = [
  {
    id: "xhs-product-seeding-video",
    slug: "xhs-product-seeding-video",
    taskKey: "xhs_product_seeding_video",
    title: "小红书产品种草视频",
    shortTitle: "小红书种草视频",
    category: "marketing",
    intentKeywords: ["小红书", "种草", "产品", "视频", "推广", "带货"],
    platformKeywords: ["小红书", "xhs", "rednote"],
    userInputExamples: [
      "我想做一个适合小红书的产品种草视频，怎么最快做出来？",
      "我要给产品做一条小红书种草视频",
      "我要做一个小红书带货视频"
    ],
    resultTitle: "小红书产品种草视频最快完成方案",
    oneLineAdvice: "不要一上来打开视频工具。先确定产品卖点和种草角度，再生成脚本和分镜，最后进入视频工具剪辑或生成视频。",
    primaryOutcome: "快速得到一条可拍摄、可剪辑、可发布的小红书产品种草视频方案。",
    bestFor: ["产品推广", "课程推广", "小商品带货", "本地服务种草"],
    notGoodFor: ["已经有成熟视频团队的大型品牌广告片"],
    estimatedTime: "30–60 分钟",
    difficulty: "low",
    fastestPath: ["产品信息", "卖点提炼", "种草角度", "30 秒脚本", "5 镜头分镜", "视频生成/剪辑", "封面标题"],
    steps: [
      {
        id: "product-brief",
        order: 1,
        title: "整理产品信息",
        purpose: "先把产品说清楚，避免后面生成的视频空泛。",
        toolRole: "内容整理工具",
        recommendedToolSlugs: ["chatgpt", "claude"],
        inputNeeded: ["产品名称", "核心卖点", "目标用户", "价格区间", "使用场景"],
        expectedOutput: "一份可用于脚本生成的产品 brief",
        handoffToNext: "把产品 brief 交给下一步，用来生成种草角度。",
        qualityCheck: "产品 brief 里必须有目标用户和具体使用场景，不能只有功能介绍。",
        inputTemplate: "请帮我整理一个小红书产品种草视频的产品 brief。产品名称是【填写产品名】；目标用户是【填写人群】；核心卖点是【填写卖点】；使用场景是【填写场景】；价格区间是【填写价格】。请输出：1）一句话产品定位；2）3 个用户痛点；3）3 个核心卖点；4）适合小红书表达的生活化场景。"
      },
      {
        id: "seeding-angle",
        order: 2,
        title: "生成种草角度",
        purpose: "把产品卖点转成小红书用户愿意看的内容角度。",
        toolRole: "内容角度生成工具",
        recommendedToolSlugs: ["chatgpt", "claude"],
        inputNeeded: ["产品 brief", "目标用户", "小红书平台"],
        expectedOutput: "3 个可选种草角度",
        handoffToNext: "选择一个最强角度，交给下一步生成 30 秒脚本。",
        qualityCheck: "角度要像用户真实经验，不要像硬广告。",
        inputTemplate: "基于下面的产品 brief，请生成 3 个适合小红书的产品种草视频角度。要求：生活化、有用户痛点、有真实使用场景，避免硬广。每个角度请输出：标题方向、开头 Hook、核心卖点、适合的画面。产品 brief：【粘贴上一步结果】"
      },
      {
        id: "script",
        order: 3,
        title: "生成 30 秒脚本",
        purpose: "把种草角度变成可以直接拍摄或剪辑的视频脚本。",
        toolRole: "脚本生成工具",
        recommendedToolSlugs: ["chatgpt", "claude"],
        inputNeeded: ["种草角度", "产品卖点", "视频风格"],
        expectedOutput: "Hook + 正文 + CTA 的 30 秒脚本",
        handoffToNext: "把脚本交给下一步拆成 5 个镜头。",
        qualityCheck: "前 3 秒必须有明确 Hook，中间必须有产品出现，结尾必须有行动引导。",
        inputTemplate: "请根据下面的种草角度，生成一条 30 秒小红书产品种草视频脚本。要求：前 3 秒有 Hook；中间有真实使用场景；语言自然，不像广告；结尾有轻 CTA。种草角度：【粘贴上一步结果】"
      },
      {
        id: "storyboard",
        order: 4,
        title: "拆成 5 镜头分镜",
        purpose: "把脚本文字变成视频画面结构，方便拍摄或交给视频工具。",
        toolRole: "分镜拆解工具",
        recommendedToolSlugs: ["chatgpt", "claude"],
        inputNeeded: ["30 秒脚本"],
        expectedOutput: "5 镜头分镜表",
        handoffToNext: "把分镜表交给视频生成/剪辑工具使用。",
        qualityCheck: "每个镜头都要有画面、字幕、动作和时长。",
        inputTemplate: "请把下面的 30 秒小红书视频脚本拆成 5 个镜头。每个镜头输出：镜头时长、画面内容、人物动作、字幕、拍摄建议、可用于 AI 视频生成的画面描述。脚本：【粘贴上一步脚本】"
      },
      {
        id: "video-production",
        order: 5,
        title: "视频生成/剪辑",
        purpose: "用视频工具生成素材或完成剪辑、字幕和转场。",
        toolRole: "视频生成/剪辑工具",
        recommendedToolSlugs: ["jianying", "jimeng", "kling"],
        inputNeeded: ["分镜表", "产品素材", "画面风格"],
        expectedOutput: "一条视频初稿",
        handoffToNext: "把视频主题和核心卖点交给下一步做封面标题。",
        qualityCheck: "视频必须在前 3 秒说明看点，不能只有好看的画面。",
        inputTemplate: "请根据这个分镜表生成视频画面提示词，要求适合小红书产品种草视频，画面自然、生活化、有真实使用感。分镜表：【粘贴上一步分镜】"
      },
      {
        id: "cover-title",
        order: 6,
        title: "封面标题",
        purpose: "提高点击率，让用户知道这个视频解决什么问题。",
        toolRole: "封面设计工具",
        recommendedToolSlugs: ["canva"],
        inputNeeded: ["视频主题", "核心卖点", "用户痛点"],
        expectedOutput: "封面标题 + 首图结构",
        qualityCheck: "封面标题必须像用户问题，不能只是产品名称。",
        inputTemplate: "请根据这条小红书种草视频主题，生成 10 个封面标题。要求：像真实用户会点开的表达；不要夸张违规；突出痛点、场景或结果。视频主题：【填写主题】；核心卖点：【填写卖点】；目标用户：【填写用户】"
      }
    ],
    relatedStack: {
      title: "扩展成产品推广 AI 工具链方案",
      description: "这个任务背后可能是“产品推广”。可以继续扩展为：短视频 + 图文种草 + Landing Page + 私域转化 + 发布复盘。",
      stackSlug: "product-marketing-stack",
      previewPath: ["卖点提炼", "短视频", "图文种草", "Landing Page", "私域转化", "发布复盘"]
    },
    commonMistakes: [
      "一开始就打开视频工具，导致生成的视频没有卖点和转化逻辑。",
      "只讲产品功能，不讲用户痛点和使用场景。",
      "脚本像广告词，不像真实分享。",
      "封面只放产品图，没有点击理由。"
    ]
  }
];
```

开发时必须补齐另外 5 个模板：

```text
douyin-ad-video
xhs-social-post
pdf-to-ppt
course-sales-page
landing-page
```

可以先用同样结构复制并修改。

---

# 17. 任务匹配实现

路径：`lib/solution-engine/matchSolution.ts`

```ts
import { solutionTemplates } from "@/lib/data/solutionTemplates";
import type { SolutionTemplate } from "@/lib/schemas/solution-types";

type MatchResult = {
  template: SolutionTemplate;
  confidence: number;
};

function normalizeInput(input: string): string {
  return input.trim().toLowerCase();
}

function keywordScore(input: string, keywords: string[]): number {
  const normalized = normalizeInput(input);
  let score = 0;

  for (const keyword of keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }

  return score;
}

export function matchSolutionTemplate(input: string): MatchResult {
  const scored = solutionTemplates.map((template) => {
    const intentScore = keywordScore(input, template.intentKeywords);
    const platformScore = keywordScore(input, template.platformKeywords ?? []);
    const exampleScore = template.userInputExamples.some((example) =>
      normalizeInput(input).includes(normalizeInput(example).slice(0, 8))
    ) ? 2 : 0;

    const rawScore = intentScore * 2 + platformScore + exampleScore;

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

  const confidence = Math.min(0.95, 0.45 + best.rawScore * 0.08);

  return {
    template: best.template,
    confidence
  };
}
```

---

# 18. 构建结果实现

路径：`lib/solution-engine/buildSolutionResult.ts`

```ts
import { tools } from "@/lib/data/tools";
import type { SolutionTemplate, SolutionResult } from "@/lib/schemas/solution-types";

function resolveTools(slugs: string[]) {
  return slugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter(Boolean);
}

export function buildSolutionResult(input: string, template: SolutionTemplate, confidence: number): SolutionResult {
  const toolChain = template.steps.map((step) => ({
    stepId: step.id,
    stepTitle: step.title,
    toolRole: step.toolRole,
    tools: resolveTools(step.recommendedToolSlugs),
    inputNeeded: step.inputNeeded,
    expectedOutput: step.expectedOutput,
    handoffToNext: step.handoffToNext,
    qualityCheck: step.qualityCheck,
    inputTemplate: step.inputTemplate
  }));

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
    fastestPath: template.fastestPath,
    toolChain,
    nextStep: {
      title: "下一步你该做什么",
      description: "先补充任务所需的基础信息，再从第一步开始照着做。",
      fieldsNeeded: template.steps[0]?.inputNeeded ?? []
    },
    relatedStack: template.relatedStack,
    commonMistakes: template.commonMistakes ?? [],
    fallback: confidence < 0.5
  };
}
```

---

# 19. API 实现

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
        {
          error: "Invalid request",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const { input } = parsed.data;

    const { template, confidence } = matchSolutionTemplate(input);
    const result = buildSolutionResult(input, template, confidence);

    const checked = solutionResultSchema.safeParse(result);

    if (!checked.success) {
      return NextResponse.json(
        {
          error: "Invalid solution result",
          details: checked.error.flatten()
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: result.id,
      result: checked.data
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to search solution"
      },
      { status: 500 }
    );
  }
}
```

---

# 20. 前端首页实现

路径：`app/page.tsx`

```tsx
import { HeroSearch } from "@/components/search/HeroSearch";
import { AppHeader } from "@/components/layout/AppHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <AppHeader />
      <section className="mx-auto flex w-full max-w-6xl flex-col px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            AI Task Solution Search
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            输入你要完成的任务，直接获得 AI 完成方案
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            不用翻 AI 工具列表。系统会为你匹配最快路径、推荐工具组合，并告诉你每一步该输入什么、产出什么。
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

---

# 21. HeroSearch 实现

路径：`components/search/HeroSearch.tsx`

```tsx
"use client";

import { useState } from "react";
import { SolutionResultPanel } from "@/components/results/SolutionResultPanel";
import type { SolutionResult } from "@/lib/schemas/solution";

const examples = [
  "我想做一个适合小红书的产品种草视频，怎么最快做出来？",
  "我要把一份 PDF 变成课程 PPT",
  "我要做一个 AI 课程销售页",
  "我要给 SaaS 产品做一个落地页"
];

export function HeroSearch() {
  const [input, setInput] = useState(examples[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(value?: string) {
    const finalInput = value ?? input;

    if (!finalInput.trim()) {
      setError("请输入你想完成的任务。");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/search/solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: finalInput,
          context: {
            language: "zh-CN",
            skillLevel: "beginner",
            budgetLevel: "free"
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "搜索失败");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-3 md:flex-row">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-24 flex-1 resize-none rounded-[1.5rem] border-0 bg-slate-50 px-5 py-4 text-base leading-7 text-slate-900 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-slate-300"
            placeholder="例如：我想做一个适合小红书的产品种草视频，怎么最快做出来？"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="rounded-[1.5rem] bg-slate-950 px-8 py-4 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "生成中..." : "生成方案"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => {
              setInput(example);
              handleSearch(example);
            }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          >
            {example}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-center text-sm text-red-500">{error}</p> : null}

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

# 22. 结果面板实现

路径：`components/results/SolutionResultPanel.tsx`

```tsx
import type { SolutionResult } from "@/lib/schemas/solution";
import { BestSolutionCard } from "@/components/results/BestSolutionCard";
import { FastestPath } from "@/components/results/FastestPath";
import { ToolChain } from "@/components/results/ToolChain";
import { StepDetails } from "@/components/results/StepDetails";
import { StackExpansionCard } from "@/components/results/StackExpansionCard";
import { ResultFeedback } from "@/components/results/ResultFeedback";

export function SolutionResultPanel({ result }: { result: SolutionResult }) {
  return (
    <section className="grid gap-6">
      <BestSolutionCard result={result} />
      <FastestPath path={result.fastestPath} />
      <ToolChain result={result} />
      <StepDetails steps={result.toolChain} />

      {result.relatedStack ? (
        <StackExpansionCard relatedStack={result.relatedStack} />
      ) : null}

      <ResultFeedback resultId={result.id} />
    </section>
  );
}
```

---

# 23. 最佳方案卡

路径：`components/results/BestSolutionCard.tsx`

```tsx
import type { SolutionResult } from "@/lib/schemas/solution";

const difficultyMap = {
  low: "低",
  medium: "中",
  high: "高"
};

export function BestSolutionCard({ result }: { result: SolutionResult }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-slate-950 px-3 py-1 text-white">最佳方案</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          预计 {result.estimatedTime}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          难度 {difficultyMap[result.difficulty]}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          匹配度 {Math.round(result.confidence * 100)}%
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
        {result.resultTitle}
      </h2>

      <p className="mt-4 text-base leading-7 text-slate-600">
        {result.oneLineAdvice}
      </p>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-500">最终产出</p>
        <p className="mt-1 text-slate-800">{result.primaryOutcome}</p>
      </div>

      {result.fallback ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          这个匹配结果不一定完全准确。你可以换一种说法，例如说明平台、成品形式和目标。
        </p>
      ) : null}
    </div>
  );
}
```

---

# 24. 最快路径组件

路径：`components/results/FastestPath.tsx`

```tsx
export function FastestPath({ path }: { path: string[] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">最快路径</h3>
      <p className="mt-1 text-sm text-slate-500">按这个顺序做，不要一开始就乱开工具。</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {path.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              {item}
            </span>
            {index < path.length - 1 ? (
              <span className="text-slate-300">→</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# 25. 工具组合组件

路径：`components/results/ToolChain.tsx`

```tsx
import type { SolutionResult } from "@/lib/schemas/solution";

export function ToolChain({ result }: { result: SolutionResult }) {
  const roleMap = new Map<string, typeof result.toolChain[number]>();

  for (const step of result.toolChain) {
    if (!roleMap.has(step.toolRole)) {
      roleMap.set(step.toolRole, step);
    }
  }

  const roles = Array.from(roleMap.values());

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">推荐工具组合</h3>
      <p className="mt-1 text-sm text-slate-500">工具不是孤立推荐，而是按任务步骤组合使用。</p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {roles.slice(0, 3).map((role) => (
          <div key={role.toolRole} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">{role.toolRole}</p>
            <h4 className="mt-1 font-semibold text-slate-950">{role.stepTitle}</h4>

            <div className="mt-3 flex flex-wrap gap-2">
              {role.tools.map((tool) => (
                <a
                  key={tool.slug}
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition hover:text-slate-950"
                >
                  {tool.name}
                </a>
              ))}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              产出：{role.expectedOutput}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# 26. 步骤详情组件

路径：`components/results/StepDetails.tsx`

```tsx
"use client";

import { useState } from "react";
import type { SolutionResult } from "@/lib/schemas/solution";

type Step = SolutionResult["toolChain"][number];

function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

export function StepDetails({ steps }: { steps: Step[] }) {
  const [copiedStepId, setCopiedStepId] = useState<string>("");

  async function handleCopy(step: Step) {
    if (!step.inputTemplate) return;
    await copyText(step.inputTemplate);
    setCopiedStepId(step.stepId);
    window.setTimeout(() => setCopiedStepId(""), 1500);
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">每一步输入什么、产出什么</h3>
      <p className="mt-1 text-sm text-slate-500">照着这个顺序走，每一步的产出交给下一步。</p>

      <div className="mt-6 grid gap-4">
        {steps.map((step, index) => (
          <div key={step.stepId} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-500">第 {index + 1} 步</div>
                <h4 className="mt-1 text-lg font-semibold text-slate-950">{step.stepTitle}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.toolRole}</p>
              </div>

              {step.inputTemplate ? (
                <button
                  onClick={() => handleCopy(step)}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {copiedStepId === step.stepId ? "已复制" : "复制这一步输入模板"}
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4">
                <p className="text-sm font-medium text-slate-500">需要输入</p>
                <ul className="mt-2 list-inside list-disc text-sm leading-6 text-slate-700">
                  {step.inputNeeded.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-sm font-medium text-slate-500">会得到</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{step.expectedOutput}</p>
              </div>
            </div>

            {step.handoffToNext ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                <span className="font-medium text-slate-900">交给下一步：</span>
                {step.handoffToNext}
              </div>
            ) : null}

            {step.qualityCheck ? (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                <span className="font-medium">质量检查：</span>
                {step.qualityCheck}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# 27. 扩展完整工具链入口

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
    <div className="rounded-[2rem] border border-slate-900 bg-slate-950 p-6 text-white shadow-sm">
      <div className="text-sm font-medium text-slate-300">后续增强入口</div>
      <h3 className="mt-2 text-2xl font-semibold">{relatedStack.title}</h3>
      <p className="mt-3 leading-7 text-slate-300">{relatedStack.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {relatedStack.previewPath.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {item}
            </span>
            {index < relatedStack.previewPath.length - 1 ? (
              <span className="text-white/30">→</span>
            ) : null}
          </div>
        ))}
      </div>

      <button
        disabled
        className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 opacity-70"
      >
        扩展成完整方案 Coming Soon
      </button>
    </div>
  );
}
```

第一版可以将按钮设置为 disabled，或者点击后展示一个预览弹窗。  
不要第一版就强行开发完整工具链。

---

# 28. AppHeader

路径：`components/layout/AppHeader.tsx`

```tsx
export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="font-semibold tracking-tight text-slate-950">
          AI Task Solution Search
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <a href="mailto:feedback@example.com" className="hover:text-slate-950">
            Feedback
          </a>
          <button className="rounded-full bg-slate-950 px-4 py-2 text-white">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

# 29. 类型文件

路径：`lib/schemas/solution-types.ts`

```ts
import type { z } from "zod";
import {
  toolSchema,
  solutionStepSchema,
  solutionTemplateSchema,
  solutionResultSchema
} from "@/lib/schemas/solution";

export type Tool = z.infer<typeof toolSchema>;
export type SolutionStep = z.infer<typeof solutionStepSchema>;
export type SolutionTemplate = z.infer<typeof solutionTemplateSchema>;
export type SolutionResult = z.infer<typeof solutionResultSchema>;
```

---

# 30. Codex 一次性开发指令

将下面这段直接给 Codex：

```text
你是资深 Next.js 全栈工程师。请基于本文档开发一个可运行的 MVP，产品名是 AI Task Solution Search。

核心定位：
主产品：AI Task Solution Search
核心价值：输入任务，获得 AI 完成方案
当前版本：任务方案搜索
后续增强：完整工具链方案

必须实现：
1. Next.js App Router 项目。
2. 首页大输入框。
3. 用户输入任务后，不跳转，直接在输入框下方展示结果。
4. POST /api/search/solution 接口。
5. 本地 solutionTemplates 数据。
6. 本地 tools 数据。
7. 关键词规则匹配任务模板。
8. 返回结构化 SolutionResult。
9. 前端展示：
   - 最佳方案卡
   - 最快路径
   - 推荐工具组合
   - 每一步输入 / 产出
   - 复制这一步输入模板
   - 扩展成完整工具链方案 Coming Soon
10. 第一版不要接数据库。
11. 第一版不要接真实 LLM。
12. 第一版不要做自动执行。
13. 第一版不要展示普通工具列表。
14. 第一版不要出现“Prompt Pack”作为主模块。
15. 第一版不要出现“立即执行 / 一键生成 / 自动完成”等承诺性按钮。

技术要求：
- TypeScript 严格类型。
- Zod 校验 API 入参和出参。
- Tailwind CSS。
- 组件拆分清晰。
- 页面要有现代 SaaS 质感，干净、大方、留白充足。
- 不要做深紫色、不要游戏风、不要后台管理风。
- 可运行、可部署到 Vercel。

实现目录：
app/page.tsx
app/api/search/solution/route.ts
components/layout/AppHeader.tsx
components/search/HeroSearch.tsx
components/results/SolutionResultPanel.tsx
components/results/BestSolutionCard.tsx
components/results/FastestPath.tsx
components/results/ToolChain.tsx
components/results/StepDetails.tsx
components/results/StackExpansionCard.tsx
components/results/ResultFeedback.tsx
lib/data/tools.ts
lib/data/solutionTemplates.ts
lib/schemas/solution.ts
lib/schemas/solution-types.ts
lib/solution-engine/matchSolution.ts
lib/solution-engine/buildSolutionResult.ts

默认必须支持这个输入：
我想做一个适合小红书的产品种草视频，怎么最快做出来？

必须返回：
小红书产品种草视频最快完成方案

结果必须包含：
产品信息 → 卖点提炼 → 种草角度 → 30 秒脚本 → 5 镜头分镜 → 视频生成/剪辑 → 封面标题

推荐工具组合必须包含：
ChatGPT / Claude / Kimi
剪映 / 即梦 / 可灵
Canva / 稿定设计

扩展入口必须显示：
这个任务背后可能是“产品推广”目标。
可扩展成：产品推广 AI 工具链方案。
```

---

# 31. Sprint 开发计划

## Sprint 1：跑通核心链路

目标：

```text
首页输入 → API 匹配模板 → 返回结果 → 前端展示
```

任务：

1. 初始化 Next.js 项目。
2. 配置 Tailwind。
3. 新建 schema。
4. 新建 tools 数据。
5. 新建 solutionTemplates 数据。
6. 实现 matchSolutionTemplate。
7. 实现 buildSolutionResult。
8. 实现 `/api/search/solution`。
9. 实现首页搜索框。
10. 实现结果展示。

验收：

```text
输入“小红书产品种草视频”能返回正确方案。
```

---

## Sprint 2：补齐 6 个模板

目标：

```text
支持 6 个高频任务。
```

任务：

1. 补齐 `douyin-ad-video`。
2. 补齐 `xhs-social-post`。
3. 补齐 `pdf-to-ppt`。
4. 补齐 `course-sales-page`。
5. 补齐 `landing-page`。
6. 优化关键词匹配。

验收：

```text
每个示例输入都能匹配到正确模板。
```

---

## Sprint 3：体验优化

目标：

```text
让页面不像 ChatGPT，也不像工具导航。
```

任务：

1. 优化卡片视觉。
2. 增加复制输入模板功能。
3. 增加“质量检查”展示。
4. 增加“交给下一步”展示。
5. 增加反馈按钮。
6. 增加 analytics 事件占位。

验收：

```text
用户能看懂每一步做什么、用什么工具、产出什么。
```

---

## Sprint 4：后续工具链入口预览

目标：

```text
展示完整工具链想象力，但不开发复杂功能。
```

任务：

1. StackExpansionCard。
2. Coming Soon 状态。
3. 可配置 relatedStack。
4. 可点击后打开预览弹窗。
5. 记录 `stack_expand_clicked` 事件。

验收：

```text
用户能看到“这个任务可以扩展成更完整方案”。
```

---

# 32. 关键验收用例

## 用例 1：小红书产品种草视频

输入：

```text
我想做一个适合小红书的产品种草视频，怎么最快做出来？
```

必须输出：

```text
小红书产品种草视频最快完成方案
```

必须包含路径：

```text
产品信息 → 卖点提炼 → 种草角度 → 30 秒脚本 → 5 镜头分镜 → 视频生成/剪辑 → 封面标题
```

必须包含扩展入口：

```text
扩展成产品推广 AI 工具链方案
```

---

## 用例 2：PDF 转 PPT

输入：

```text
我要把一份 PDF 变成课程 PPT
```

必须输出：

```text
PDF 转 PPT 快速方案
```

必须包含路径：

```text
上传资料 → 提炼大纲 → 拆页结构 → 生成 PPT 初稿 → 视觉优化 → 导出
```

---

## 用例 3：课程销售页

输入：

```text
我要卖一门 AI 课程，需要一个销售页
```

必须输出：

```text
课程销售页成交方案
```

必须包含路径：

```text
课程定位 → 用户痛点 → 首屏标题 → 课程卖点 → 证明材料 → FAQ → 报名表单
```

---

## 用例 4：Landing Page

输入：

```text
我要给我的 SaaS 做一个落地页
```

必须输出：

```text
Landing Page 启动方案
```

必须包含路径：

```text
用户问题 → 产品定位 → 首屏标题 → 页面模块 → CTA → FAQ → 表单/预约
```

---

# 33. v0.4 与 v0.3 的区别

## v0.3

```text
输入任务 → 最佳方案 → 工具组合 → 立即执行动作
```

问题：

```text
“立即执行动作”容易让用户期待系统真的能自动生成脚本、分镜、视频、PPT。
```

## v0.4

```text
输入任务 → AI 完成方案 → 最快路径 → 工具组合 → 每步输入/产出 → 可选扩展工具链
```

优势：

```text
更符合当前技术能力。
不会变成虚假 Agent。
不会变成提示词站。
不会变成工具导航。
保留未来工具链方案的想象力。
```

---

# 34. 最重要的产品原则

最终必须坚持一句话：

```text
用户不是来找工具的，也不是来买提示词的。
用户是想知道：这件事最快应该怎么完成。
```

所以产品结果必须让用户一眼看到：

```text
1. 这件事应该先做什么
2. 再做什么
3. 每一步用什么工具
4. 每一步输入什么
5. 每一步产出什么
6. 是否可以扩展成更完整方案
```

这就是 v0.4 的核心。

---

# 35. 最终定稿

```text
主产品：AI Task Solution Search
核心价值：输入任务，获得 AI 完成方案
当前版本：任务方案搜索
后续增强：完整工具链方案
```

MVP 第一版只需要把“任务方案搜索”做清楚。  
后续再逐步把多个任务方案串成“完整工具链方案”。

