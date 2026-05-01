# AI Tool Decision Engine｜MVP 开发文档 v0.1

> 可直接交给 Codex / Claude Code / Trae 开发使用  
> 产品原则：**少工具，强决策；少列表，强工作流；少分类，强任务结果**  
> MVP 目标：不是做 AI 工具导航站，而是验证用户是否愿意输入任务，并接受系统给出的 **AI 工具决策 + 执行路径 + Prompt + 检查清单**。

---

## 0. 这个 MVP 到底要做什么

### 0.1 产品一句话

用户输入一个想完成的任务，系统自动判断任务类型，追问必要信息，然后只推荐最合适的 1–3 个 AI 工具，并生成可执行步骤、Prompt、风险提示和质量检查清单。

### 0.2 核心差异

普通导航站：

```text
用户搜索：AI PPT 工具
系统返回：30 个 PPT 工具列表
用户自己判断、自己试错
```

本产品：

```text
用户输入：我要把一份 PDF 变成课程 PPT
系统判断：这是 PDF → 课程型 PPT 任务
系统追问：PPT 用于授课、路演、销售还是汇报？
系统推荐：
- 首选：Gamma，用于生成 PPT 初稿
- 搭配：Canva，用于优化封面和重点页
- 不建议优先用 Beautiful.ai，原因是更适合标准商务模板
系统输出：
- 7 步执行路径
- 每步工具
- 每步 Prompt
- 人工检查点
- 质量检查清单
```

### 0.3 MVP 成功标准

MVP 不以收入为第一指标，先验证这 5 个行为：

1. 用户愿意输入任务。
2. 用户愿意回答 3–6 个澄清问题。
3. 用户生成工作流后愿意复制 Prompt。
4. 用户愿意点击推荐工具。
5. 用户愿意保存或分享工作流。

---

## 1. 产品边界

### 1.1 MVP 必须坚持

```text
少工具，强决策：
每一步最多推荐 1 个首选工具 + 1 个备选工具 + 1 个低成本替代。

少列表，强工作流：
工具必须嵌入执行步骤，而不是独立堆列表。

少分类，强任务结果：
首页不按 AI 写作、AI 图片、AI 视频分类，而按用户想完成的任务进入。
```

### 1.2 MVP 不做什么

第一版明确不做：

1. 不做全量 AI 工具导航。
2. 不追求收录 3 万工具。
3. 不直接爬 Toolify / TAAFT 作为核心数据源。
4. 不做浏览器插件。
5. 不做复杂企业采购系统。
6. 不做全自动价格监控。
7. 不做完整订阅预算管理。
8. 不做付费墙优先。
9. 不做通用 Agent 自动执行。
10. 不做 App Store / Chrome Store 全量爬取。

### 1.3 MVP 只做什么

第一版只做：

1. 5 个高价值任务。
2. 50 个精选 AI 工具。
3. 结构化任务模板。
4. 工具匹配评分器。
5. 工作流生成。
6. Prompt 复制。
7. 推荐工具点击追踪。
8. 用户反馈。
9. 后台工具录入。
10. 离线爬虫/采集脚本，用于辅助整理工具数据。

---

## 2. 第一版任务范围

MVP 第一版先做 5 个任务，不要一开始做 20 个。

### 2.1 任务 1：做 Landing Page

用户场景：

```text
我要为一个产品、课程、服务、SaaS 或等待名单做一个落地页。
```

最终交付：

- 页面结构
- 首屏文案
- CTA
- FAQ
- 推荐建站工具
- 视觉辅助工具
- 表单/支付工具
- 发布前检查清单

### 2.2 任务 2：做广告视频

用户场景：

```text
我要为一个产品或服务做一条短视频广告。
```

最终交付：

- 目标用户
- 广告角度
- Hook
- 脚本
- 分镜
- 配音稿
- 视频生成工具
- 字幕/封面工具
- 投放前检查清单

### 2.3 任务 3：PDF 转 PPT

用户场景：

```text
我有一份 PDF、报告、讲义或文档，想变成 PPT。
```

最终交付：

- PDF 提取方式
- PPT 结构
- 每页大纲
- 推荐 PPT 工具
- Prompt
- 视觉优化工具
- 演讲稿建议
- 检查清单

### 2.4 任务 4：做课程销售页

用户场景：

```text
我要卖一门课、训练营、咨询服务或知识产品，需要一个销售页。
```

最终交付：

- 课程定位
- 目标用户痛点
- 页面结构
- 首屏标题
- 卖点模块
- 讲师介绍
- FAQ
- 报名 CTA
- 邮件跟进建议

### 2.5 任务 5：做个人品牌主页

用户场景：

```text
我是顾问、讲师、教练、自由职业者、服务商，需要一个个人品牌主页。
```

最终交付：

- 一句话定位
- 个人介绍
- 服务套餐
- 案例展示
- 信任证明
- 预约入口
- 个人介绍视频脚本
- 页面检查清单

---

## 3. 技术架构

### 3.1 总体架构

```text
Next.js on Vercel
    ↓
前端页面 / API Routes / Server Actions
    ↓
PostgreSQL / Supabase / Neon
    ↓
Prisma ORM
    ↓
AI Provider：OpenAI / Claude / Gemini / DeepSeek
    ↓
结构化任务模板库 + 工具库 + 规则库
    ↓
生成工作流结果
```

### 3.2 离线数据架构

爬虫不要跑在 Vercel 里。数据采集单独放在本地、VPS、GitHub Actions 或独立 Worker 中。

```text
外部工具官网 / 工具目录 / Product Hunt / 官方文档
    ↓
crawler/ 离线采集脚本
    ↓
raw_tools.json / raw_tools 表
    ↓
AI 辅助清洗和结构化
    ↓
人工审核
    ↓
tools / tool_roles / tool_task_scores 正式表
    ↓
Vercel 产品读取正式数据
```

### 3.3 推荐技术栈

| 层级 | 技术 |
|---|---|
| Web 前端 | Next.js App Router + React + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| 后端 | Next.js Route Handlers |
| ORM | Prisma |
| 数据库 | Supabase PostgreSQL 或 Neon PostgreSQL |
| AI SDK | Vercel AI SDK 或 OpenAI SDK |
| 邮件 | Resend，MVP 可先不做 |
| 鉴权 | NextAuth/Auth.js 或 Supabase Auth |
| 部署 | Vercel |
| 爬虫 | Crawl4AI / Crawlee / Firecrawl / Scrapy |
| 离线脚本 | Python 或 Node.js |

### 3.4 推荐项目结构

```text
ai-tool-decision-engine/
├── app/
│   ├── page.tsx
│   ├── workflow/
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── tools/
│   │   └── [slug]/page.tsx
│   ├── compare/page.tsx
│   ├── submit-tool/page.tsx
│   ├── admin/
│   │   ├── tools/page.tsx
│   │   ├── tools/new/page.tsx
│   │   ├── tasks/page.tsx
│   │   └── imports/page.tsx
│   └── api/
│       ├── task/identify/route.ts
│       ├── task/questions/route.ts
│       ├── workflow/generate/route.ts
│       ├── tools/compare/route.ts
│       ├── feedback/route.ts
│       ├── admin/tools/route.ts
│       └── admin/import-tools/route.ts
├── components/
│   ├── marketing/
│   ├── workflow/
│   │   ├── WorkflowResult.tsx
│   │   ├── RouteCards.tsx
│   │   ├── WorkflowStepCard.tsx
│   │   ├── PromptBlock.tsx
│   │   └── Checklist.tsx
│   ├── tools/
│   │   ├── ToolBadge.tsx
│   │   └── ToolCard.tsx
│   └── ui/
├── lib/
│   ├── ai/
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   ├── schemas.ts
│   │   └── workflow-generator.ts
│   ├── decision/
│   │   ├── task-classifier.ts
│   │   ├── tool-ranker.ts
│   │   ├── workflow-selector.ts
│   │   └── rules.ts
│   ├── db.ts
│   ├── slug.ts
│   └── validators.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── data/
│   ├── seed-tools.json
│   ├── seed-tasks.json
│   ├── seed-workflows.json
│   └── seed-tool-scores.json
├── crawler/
│   ├── README.md
│   ├── requirements.txt
│   ├── crawl_urls.py
│   ├── normalize_tools.py
│   ├── import_tools.py
│   └── input_urls.csv
├── scripts/
│   ├── import-tools.ts
│   └── validate-data.ts
├── .env.example
├── package.json
└── README.md
```

---

## 4. 数据库设计

### 4.1 Prisma Schema

Codex 直接生成 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  NEWBIE
  FOUNDER
  SMALL_BUSINESS
  CREATOR
  CONSULTANT
  ENTERPRISE
  TOOL_MAKER
}

enum BudgetLevel {
  FREE
  LOW
  MEDIUM
  PRO
}

enum SkillLevel {
  BEGINNER
  BASIC
  ADVANCED
  EXPERT
}

enum QualityLevel {
  QUICK
  PUBLISHABLE
  COMMERCIAL
  TEAM
}

enum PricingType {
  FREE
  FREEMIUM
  PAID
  TRIAL
  UNKNOWN
}

model User {
  id              String   @id @default(uuid())
  email           String   @unique
  name            String?
  role            UserRole?
  skillLevel      SkillLevel?
  preferredBudget BudgetLevel?
  generatedWorkflows GeneratedWorkflow[]
  feedbacks       Feedback[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Task {
  id              String   @id @default(uuid())
  key             String   @unique
  name            String
  slug            String   @unique
  category        String
  description     String
  expectedOutputs String[]
  complexity      String?
  questions       TaskQuestion[]
  workflows       WorkflowTemplate[]
  toolScores      ToolTaskScore[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model TaskQuestion {
  id          String   @id @default(uuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  fieldKey    String
  question    String
  required    Boolean  @default(false)
  type        String   @default("text")
  options     String[]
  orderIndex  Int
}

model Tool {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  websiteUrl      String
  description     String
  categories      String[]
  pricingType     PricingType @default(UNKNOWN)
  startingPrice   Float?
  freeTrial       Boolean?
  bestFor         String[]
  notGoodFor      String[]
  workflowRoles   String[]
  skillLevel      SkillLevel?
  outputQuality   QualityLevel?
  easeOfUseScore  Int      @default(70)
  trustScore      Int      @default(70)
  logoUrl         String?
  affiliateUrl    String?
  status          String   @default("active")
  lastCheckedAt   DateTime?
  roles           ToolRole[]
  taskScores      ToolTaskScore[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ToolRole {
  id        String @id @default(uuid())
  toolId    String
  tool      Tool   @relation(fields: [toolId], references: [id], onDelete: Cascade)
  roleKey   String
  score     Int    @default(70)

  @@unique([toolId, roleKey])
}

model ToolTaskScore {
  id        String @id @default(uuid())
  toolId    String
  taskId    String
  tool      Tool   @relation(fields: [toolId], references: [id], onDelete: Cascade)
  task      Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  roleKey   String
  score     Int    @default(70)
  reason    String?

  @@unique([toolId, taskId, roleKey])
}

model WorkflowTemplate {
  id                  String   @id @default(uuid())
  taskId              String
  task                Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  name                String
  slug                String   @unique
  userRole            UserRole?
  budgetLevel         BudgetLevel?
  skillLevel          SkillLevel?
  qualityLevel        QualityLevel?
  recommendedStrategy String
  estimatedCostMin    Float?
  estimatedCostMax    Float?
  estimatedTime       String?
  steps               WorkflowStepTemplate[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model WorkflowStepTemplate {
  id                 String   @id @default(uuid())
  workflowId          String
  workflow            WorkflowTemplate @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  stepOrder           Int
  title               String
  goal                String
  description         String
  toolRole            String
  inputRequired       String?
  outputExpected      String?
  promptTemplate      String?
  humanReviewRequired Boolean @default(false)
}

model GeneratedWorkflow {
  id              String   @id @default(uuid())
  userId          String?
  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  taskDescription String
  taskKey         String?
  userContext     Json
  resultJson      Json
  saved           Boolean  @default(false)
  createdAt       DateTime @default(now())
  feedbacks       Feedback[]
}

model Feedback {
  id                  String   @id @default(uuid())
  userId              String?
  user                User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  generatedWorkflowId String?
  generatedWorkflow   GeneratedWorkflow? @relation(fields: [generatedWorkflowId], references: [id], onDelete: Cascade)
  rating              Int?
  useful              Boolean?
  selectedTools       Json?
  comment             String?
  createdAt           DateTime @default(now())
}

model RawTool {
  id             String   @id @default(uuid())
  source         String
  sourceUrl      String
  name           String?
  websiteUrl     String?
  rawTitle       String?
  rawDescription String?
  rawContent     String?
  normalizedJson Json?
  status         String   @default("raw")
  crawledAt      DateTime @default(now())
}
```

---

## 5. 种子数据设计

### 5.1 任务种子数据

`data/seed-tasks.json`

```json
[
  {
    "key": "build_landing_page",
    "name": "Build a Landing Page",
    "slug": "build-landing-page",
    "category": "business",
    "description": "Create a landing page for a product, service, course, or waitlist.",
    "expectedOutputs": [
      "page structure",
      "hero copy",
      "CTA",
      "FAQ",
      "tool recommendations",
      "launch checklist"
    ],
    "complexity": "medium"
  },
  {
    "key": "create_ad_video",
    "name": "Create an Ad Video",
    "slug": "create-ad-video",
    "category": "marketing",
    "description": "Create a short ad video for a product or service.",
    "expectedOutputs": [
      "ad angles",
      "hooks",
      "scripts",
      "storyboard",
      "voiceover",
      "video prompts",
      "publishing checklist"
    ],
    "complexity": "medium"
  },
  {
    "key": "pdf_to_slides",
    "name": "Turn PDF into Slides",
    "slug": "pdf-to-slides",
    "category": "productivity",
    "description": "Turn a PDF, report, or course material into slides.",
    "expectedOutputs": [
      "outline",
      "slide structure",
      "slide prompts",
      "presentation tool recommendation",
      "quality checklist"
    ],
    "complexity": "low"
  },
  {
    "key": "course_sales_page",
    "name": "Create a Course Sales Page",
    "slug": "course-sales-page",
    "category": "education",
    "description": "Create a sales page for a course, cohort, coaching offer, or consulting service.",
    "expectedOutputs": [
      "positioning",
      "pain points",
      "page copy",
      "FAQ",
      "CTA",
      "email follow-up",
      "quality checklist"
    ],
    "complexity": "medium"
  },
  {
    "key": "personal_brand_page",
    "name": "Create a Personal Brand Page",
    "slug": "personal-brand-page",
    "category": "creator",
    "description": "Create a personal brand page for a consultant, coach, teacher, freelancer, or service provider.",
    "expectedOutputs": [
      "positioning",
      "bio",
      "service packages",
      "proof",
      "booking flow",
      "intro video script"
    ],
    "complexity": "medium"
  }
]
```

### 5.2 任务问题种子数据

`data/seed-task-questions.json`

```json
[
  {
    "taskKey": "create_ad_video",
    "questions": [
      {
        "fieldKey": "product",
        "question": "What product or service are you promoting?",
        "required": true,
        "type": "text",
        "options": [],
        "orderIndex": 1
      },
      {
        "fieldKey": "audience",
        "question": "Who is the target audience?",
        "required": true,
        "type": "text",
        "options": [],
        "orderIndex": 2
      },
      {
        "fieldKey": "platform",
        "question": "Where will you publish this video?",
        "required": true,
        "type": "select",
        "options": ["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn", "Website", "Other"],
        "orderIndex": 3
      },
      {
        "fieldKey": "style",
        "question": "What video style do you prefer?",
        "required": false,
        "type": "select",
        "options": ["UGC style", "Founder talking head", "Product demo", "Animated explainer", "AI avatar"],
        "orderIndex": 4
      },
      {
        "fieldKey": "budget",
        "question": "What is your budget level?",
        "required": false,
        "type": "select",
        "options": ["Free", "Low", "Medium", "Professional"],
        "orderIndex": 5
      }
    ]
  }
]
```

### 5.3 工具种子数据

`data/seed-tools.json`

第一版先录入 50 个，不要追求全量。下面是建议分类：

```json
[
  {
    "name": "ChatGPT",
    "slug": "chatgpt",
    "websiteUrl": "https://chatgpt.com",
    "description": "General-purpose AI assistant for writing, reasoning, coding, and ideation.",
    "categories": ["chatbot", "writing", "reasoning"],
    "pricingType": "FREEMIUM",
    "startingPrice": 0,
    "freeTrial": true,
    "bestFor": ["general tasks", "brainstorming", "copywriting", "coding help"],
    "notGoodFor": ["specialized video generation", "pixel-perfect design"],
    "workflowRoles": ["copywriting", "research", "task_planning", "prompt_generation"],
    "skillLevel": "BEGINNER",
    "outputQuality": "PUBLISHABLE",
    "easeOfUseScore": 90,
    "trustScore": 90
  },
  {
    "name": "Claude",
    "slug": "claude",
    "websiteUrl": "https://claude.ai",
    "description": "AI assistant strong at long-context writing, analysis, and structured documents.",
    "categories": ["chatbot", "writing", "analysis"],
    "pricingType": "FREEMIUM",
    "startingPrice": 0,
    "freeTrial": true,
    "bestFor": ["long documents", "structured writing", "analysis", "page copy"],
    "notGoodFor": ["visual design", "video generation"],
    "workflowRoles": ["copywriting", "long_context_analysis", "content_structuring"],
    "skillLevel": "BEGINNER",
    "outputQuality": "PUBLISHABLE",
    "easeOfUseScore": 88,
    "trustScore": 88
  },
  {
    "name": "Gamma",
    "slug": "gamma",
    "websiteUrl": "https://gamma.app",
    "description": "AI presentation and document generation tool.",
    "categories": ["presentation", "document"],
    "pricingType": "FREEMIUM",
    "startingPrice": 0,
    "freeTrial": true,
    "bestFor": ["quick slide drafts", "PDF to slides", "course slides", "pitch deck first draft"],
    "notGoodFor": ["high-end custom visual design", "complex animation"],
    "workflowRoles": ["presentation_generation", "content_structuring"],
    "skillLevel": "BEGINNER",
    "outputQuality": "PUBLISHABLE",
    "easeOfUseScore": 86,
    "trustScore": 78
  }
]
```

后续 Codex 按同一结构补充：

- Canva
- Beautiful.ai
- Framer
- Webflow
- Carrd
- Durable
- Tally
- Typeform
- Stripe
- Lemon Squeezy
- ConvertKit
- MailerLite
- HeyGen
- Synthesia
- Runway
- Pika
- CapCut
- VEED
- Opus Clip
- ElevenLabs
- Midjourney
- Leonardo
- Freepik
- remove.bg
- Figma
- Notion
- Perplexity
- Genspark
- Zapier
- Make
- n8n
- Gumloop
- Loom
- Descript

---

## 6. 核心推荐逻辑

### 6.1 不允许纯 LLM 推荐

错误做法：

```text
用户输入任务
↓
直接把任务丢给大模型
↓
大模型自由推荐工具
```

正确做法：

```text
用户输入任务
↓
任务分类器识别 taskKey
↓
读取 Task + WorkflowTemplate + WorkflowStepTemplate
↓
根据 step.toolRole 从 ToolRole / ToolTaskScore 里筛选工具
↓
用 Tool Fit Score 排序
↓
把结构化上下文传给 LLM
↓
LLM 只负责生成自然语言和结构化结果
```

### 6.2 Tool Fit Score

`lib/decision/tool-ranker.ts`

```ts
type ToolCandidate = {
  id: string;
  name: string;
  slug: string;
  workflowRoles: string[];
  skillLevel?: string | null;
  outputQuality?: string | null;
  easeOfUseScore: number;
  trustScore: number;
  taskScore?: number;
  roleScore?: number;
  pricingType?: string;
  startingPrice?: number | null;
};

type RankContext = {
  taskKey: string;
  roleKey: string;
  budgetLevel?: string;
  skillLevel?: string;
  qualityLevel?: string;
};

export function calculateToolFitScore(tool: ToolCandidate, context: RankContext): number {
  const taskMatch = normalize(tool.taskScore ?? 60);
  const roleMatch = normalize(tool.roleScore ?? (tool.workflowRoles.includes(context.roleKey) ? 80 : 40));
  const skillMatch = getSkillMatch(tool.skillLevel, context.skillLevel);
  const budgetMatch = getBudgetMatch(tool, context.budgetLevel);
  const qualityMatch = getQualityMatch(tool.outputQuality, context.qualityLevel);
  const trust = normalize(tool.trustScore ?? 70);
  const ease = normalize(tool.easeOfUseScore ?? 70);

  const score =
    taskMatch * 0.30 +
    roleMatch * 0.25 +
    skillMatch * 0.10 +
    budgetMatch * 0.10 +
    qualityMatch * 0.10 +
    trust * 0.10 +
    ease * 0.05;

  return Math.round(score * 100);
}

function normalize(score: number): number {
  return Math.max(0, Math.min(100, score)) / 100;
}

function getSkillMatch(toolSkill?: string | null, userSkill?: string): number {
  if (!userSkill) return 0.75;
  if (!toolSkill) return 0.7;
  if (userSkill === "BEGINNER" && toolSkill === "BEGINNER") return 0.95;
  if (userSkill === "BEGINNER" && toolSkill === "EXPERT") return 0.35;
  return 0.75;
}

function getBudgetMatch(tool: ToolCandidate, budget?: string): number {
  if (!budget) return 0.75;
  if (budget === "FREE") return tool.pricingType === "FREE" || tool.pricingType === "FREEMIUM" ? 0.95 : 0.35;
  if (budget === "LOW") return (tool.startingPrice ?? 0) <= 20 ? 0.9 : 0.55;
  if (budget === "MEDIUM") return (tool.startingPrice ?? 0) <= 100 ? 0.8 : 0.6;
  return 0.75;
}

function getQualityMatch(toolQuality?: string | null, quality?: string): number {
  if (!quality) return 0.75;
  if (!toolQuality) return 0.7;
  if (quality === "COMMERCIAL" && toolQuality === "QUICK") return 0.45;
  if (quality === toolQuality) return 0.9;
  return 0.75;
}
```

### 6.3 推荐结果限制

每个工作流步骤输出：

```ts
type StepRecommendation = {
  primaryTool: Tool;
  backupTool?: Tool;
  budgetTool?: Tool;
};
```

展示规则：

- 主页面只展示首选工具和备选工具。
- “更多替代”折叠显示。
- 不展示超过 3 个工具。
- 必须展示“为什么推荐”和“为什么不推荐某些常见工具”。

---

## 7. AI Prompt 与 JSON Schema

### 7.1 任务识别 Prompt

`lib/ai/prompts.ts`

```ts
export const TASK_CLASSIFIER_PROMPT = `
You are a task classifier for an AI tool decision engine.

Classify the user's input into one of these task keys:
- build_landing_page
- create_ad_video
- pdf_to_slides
- course_sales_page
- personal_brand_page
- unknown

Return strict JSON:
{
  "taskKey": string,
  "confidence": number,
  "reason": string,
  "needClarification": boolean
}

User input:
{{input}}
`;
```

### 7.2 工作流生成 Prompt

```ts
export const WORKFLOW_GENERATION_PROMPT = `
You are an AI tool decision expert.

Your job is NOT to list many tools.
Your job is to make a clear decision and generate an executable workflow.

Principles:
1. Fewer tools, stronger decision.
2. Fewer lists, stronger workflow.
3. Fewer categories, stronger task result.
4. Recommend only tools from the provided candidate list.
5. For each step, recommend at most one primary tool and one backup tool.
6. Explain why the chosen tool fits this task.
7. Mention human review points and risks.
8. Generate copyable prompts.
9. Do not exaggerate AI capabilities.
10. If a tool is sponsored, mark it clearly and do not let sponsorship override fit.

User context:
{{userContext}}

Task:
{{task}}

Workflow template:
{{workflowTemplate}}

Step-level tool recommendations:
{{toolRecommendations}}

Rules:
{{rules}}

Return strict JSON matching this schema:
{
  "taskSummary": string,
  "recommendedStrategy": string,
  "routes": [
    {
      "name": string,
      "costRange": string,
      "timeRequired": string,
      "bestFor": string,
      "tools": string[],
      "risk": string
    }
  ],
  "workflowSteps": [
    {
      "step": number,
      "title": string,
      "goal": string,
      "primaryTool": string,
      "backupTool": string,
      "whyThisTool": string,
      "prompt": string,
      "expectedOutput": string,
      "humanReview": boolean,
      "humanReviewReason": string
    }
  ],
  "notRecommendedTools": [
    {
      "tool": string,
      "reason": string
    }
  ],
  "qualityChecklist": string[],
  "commonMistakes": string[],
  "risks": string[],
  "nextAction": string
}
`;
```

### 7.3 Zod Schema

`lib/ai/schemas.ts`

```ts
import { z } from "zod";

export const workflowResultSchema = z.object({
  taskSummary: z.string(),
  recommendedStrategy: z.string(),
  routes: z.array(z.object({
    name: z.string(),
    costRange: z.string(),
    timeRequired: z.string(),
    bestFor: z.string(),
    tools: z.array(z.string()),
    risk: z.string()
  })),
  workflowSteps: z.array(z.object({
    step: z.number(),
    title: z.string(),
    goal: z.string(),
    primaryTool: z.string(),
    backupTool: z.string().optional().default(""),
    whyThisTool: z.string(),
    prompt: z.string(),
    expectedOutput: z.string(),
    humanReview: z.boolean(),
    humanReviewReason: z.string()
  })),
  notRecommendedTools: z.array(z.object({
    tool: z.string(),
    reason: z.string()
  })).default([]),
  qualityChecklist: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  risks: z.array(z.string()),
  nextAction: z.string()
});

export type WorkflowResult = z.infer<typeof workflowResultSchema>;
```

---

## 8. API 设计

### 8.1 POST /api/task/identify

输入：

```json
{
  "input": "我要做一个卖课页面"
}
```

输出：

```json
{
  "taskKey": "course_sales_page",
  "confidence": 0.91,
  "needClarification": true,
  "questions": [
    {
      "fieldKey": "course_topic",
      "question": "What is your course about?",
      "required": true,
      "type": "text",
      "options": []
    }
  ]
}
```

### 8.2 GET /api/task/questions?taskKey=create_ad_video

输出：

```json
{
  "taskKey": "create_ad_video",
  "questions": []
}
```

### 8.3 POST /api/workflow/generate

输入：

```json
{
  "taskKey": "create_ad_video",
  "taskDescription": "I want to create a TikTok ad video for my AI course",
  "answers": {
    "product": "AI course",
    "audience": "small business owners",
    "platform": "TikTok",
    "style": "UGC style",
    "budget": "Low"
  },
  "userContext": {
    "userRole": "CREATOR",
    "budgetLevel": "LOW",
    "skillLevel": "BEGINNER",
    "qualityLevel": "PUBLISHABLE"
  }
}
```

输出：

```json
{
  "id": "generated-workflow-id",
  "result": {
    "taskSummary": "...",
    "recommendedStrategy": "...",
    "routes": [],
    "workflowSteps": [],
    "qualityChecklist": []
  }
}
```

### 8.4 POST /api/tools/compare

输入：

```json
{
  "task": "做课程 PPT",
  "toolSlugs": ["gamma", "canva", "beautiful-ai"],
  "userContext": {
    "skillLevel": "BEGINNER",
    "budgetLevel": "LOW"
  }
}
```

输出：

```json
{
  "recommendation": "Use Gamma to generate the first draft and Canva to polish visuals.",
  "table": []
}
```

### 8.5 POST /api/feedback

输入：

```json
{
  "generatedWorkflowId": "id",
  "rating": 5,
  "useful": true,
  "selectedTools": ["Gamma", "Canva"],
  "comment": "The recommendation was accurate."
}
```

---

## 9. 页面开发细节

### 9.1 首页 `/`

核心组件：

- HeroTaskInput
- PopularTasks
- HowItWorks
- ExampleWorkflow
- ForToolMakers
- NewsletterCTA

首页不展示工具分类列表。

Hero 文案：

```text
Stop browsing AI tools.
Tell us what you want to do. We'll give you the best AI workflow.
```

中文：

```text
别再逛 AI 工具了。
告诉我们你想完成什么，我们直接给你最优 AI 完成方案。
```

### 9.2 新建工作流页 `/workflow/new`

表单字段：

- taskDescription
- userRole
- budgetLevel
- skillLevel
- deadline
- outputQuality
- existingAssets
- targetPlatform

交互流程：

1. 用户输入任务。
2. 调用 `/api/task/identify`。
3. 如果需要澄清，展示问题。
4. 用户回答。
5. 调用 `/api/workflow/generate`。
6. 跳转 `/workflow/[id]`。

### 9.3 工作流结果页 `/workflow/[id]`

组件：

```text
WorkflowHeader
RecommendedStrategyCard
RouteCards
WorkflowStepList
NotRecommendedTools
QualityChecklist
RiskBox
NextActionCard
FeedbackBox
```

每个 Step 显示：

- step number
- title
- goal
- primary tool
- backup tool
- why this tool
- prompt copy button
- expected output
- human review marker

### 9.4 工具详情页 `/tools/[slug]`

展示：

- 工具名
- 描述
- 官网按钮
- Best for
- Not good for
- Workflow roles
- Pricing
- Trust score
- Used in workflows
- Alternatives

### 9.5 Submit Tool `/submit-tool`

第一版只收集：

- name
- websiteUrl
- oneLineDescription
- categories
- bestFor
- notGoodFor
- contactEmail

提交后进入后台审核，不直接上线。

### 9.6 Admin Tools `/admin/tools`

第一版可简单保护：

```text
如果 ADMIN_EMAILS 环境变量包含当前用户邮箱，则可访问。
```

功能：

- 查看工具列表
- 新建工具
- 编辑工具
- 导入 JSON
- 设置 active/inactive

---

## 10. 爬虫与数据采集方案

### 10.1 核心判断

MVP 不需要大规模爬虫。  
爬虫只用于 **辅助工具信息整理**，不作为产品实时依赖。

正确路线：

```text
人工选定工具 URL
↓
离线爬虫抓官网内容
↓
AI 提取结构化字段
↓
人工审核
↓
导入数据库
```

### 10.2 推荐爬虫工具

#### 方案 A：Crawl4AI，推荐 MVP 首选

适合：

- 把官网转成干净 Markdown。
- 给 LLM 做结构化抽取。
- 本地或 VPS 离线跑。
- Python 开发快。

GitHub：

```text
https://github.com/unclecode/crawl4ai
```

理由：

- 面向 LLM/RAG 数据管道。
- 输出 Markdown 方便 AI 分析。
- 开源。
- 对本项目最贴合。

#### 方案 B：Firecrawl，最快但依赖 API/服务

适合：

- 快速获得网页 Markdown / JSON。
- 不想自己处理复杂网页。
- 可用 hosted service，也可 self-host。

GitHub：

```text
https://github.com/firecrawl/firecrawl
```

官网：

```text
https://www.firecrawl.dev/
```

注意：

- 如果用 hosted service，会产生 API 成本。
- Self-host 需要关注部署和许可证。

#### 方案 C：Crawlee，TypeScript 栈推荐

适合：

- 你希望爬虫也用 Node/TypeScript。
- 需要 Playwright/Puppeteer 抓动态页面。
- 以后做更复杂数据采集。

GitHub：

```text
https://github.com/apify/crawlee
```

#### 方案 D：Scrapy，适合大规模结构化爬虫

适合：

- 未来要做大规模定向爬虫。
- 多站点、多规则、队列化抓取。
- Python 爬虫工程化。

GitHub：

```text
https://github.com/scrapy/scrapy
```

MVP 不建议一开始用 Scrapy，除非你要做大量站点规则。

### 10.3 MVP 爬虫推荐结论

第一版推荐：

```text
Crawl4AI + Python 脚本 + 人工审核
```

不要一开始用 Playwright 批量跑复杂动态网页。

### 10.4 爬虫目录

```text
crawler/
├── README.md
├── requirements.txt
├── input_urls.csv
├── crawl_urls.py
├── normalize_tools.py
├── import_tools.py
├── output/
│   ├── raw/
│   ├── normalized/
│   └── reviewed/
└── prompts/
    └── normalize_tool_prompt.txt
```

### 10.5 requirements.txt

```txt
crawl4ai
pydantic
python-dotenv
openai
pandas
psycopg[binary]
```

### 10.6 input_urls.csv

```csv
name,url,source
Gamma,https://gamma.app,manual
Canva,https://www.canva.com,manual
Framer,https://www.framer.com,manual
HeyGen,https://www.heygen.com,manual
Runway,https://runwayml.com,manual
```

### 10.7 crawl_urls.py

Codex 生成：

```python
import asyncio
import csv
import json
from pathlib import Path
from datetime import datetime
from crawl4ai import AsyncWebCrawler

INPUT = Path("input_urls.csv")
OUTPUT_DIR = Path("output/raw")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

async def crawl_one(name: str, url: str, source: str):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)
        payload = {
            "name": name,
            "url": url,
            "source": source,
            "crawled_at": datetime.utcnow().isoformat(),
            "markdown": result.markdown if hasattr(result, "markdown") else "",
            "success": getattr(result, "success", True)
        }
        safe_name = name.lower().replace(" ", "-").replace("/", "-")
        path = OUTPUT_DIR / f"{safe_name}.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Saved {path}")

async def main():
    with INPUT.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    for row in rows:
        await crawl_one(row["name"], row["url"], row.get("source", "manual"))

if __name__ == "__main__":
    asyncio.run(main())
```

### 10.8 normalize_tools.py

用 LLM 把 raw markdown 变成结构化 JSON。

```python
import json
import os
from pathlib import Path
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List, Optional

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

RAW_DIR = Path("output/raw")
OUT_DIR = Path("output/normalized")
OUT_DIR.mkdir(parents=True, exist_ok=True)

class NormalizedTool(BaseModel):
    name: str
    slug: str
    websiteUrl: str
    description: str
    categories: List[str] = Field(default_factory=list)
    pricingType: str = "UNKNOWN"
    startingPrice: Optional[float] = None
    freeTrial: Optional[bool] = None
    bestFor: List[str] = Field(default_factory=list)
    notGoodFor: List[str] = Field(default_factory=list)
    workflowRoles: List[str] = Field(default_factory=list)
    skillLevel: Optional[str] = None
    outputQuality: Optional[str] = None
    confidence: float = 0.0
    extractionNotes: str = ""

PROMPT = """
You are extracting structured data for an AI tool decision engine.

Extract the following fields from the website markdown.
Do not invent facts. If unknown, use UNKNOWN or null.
Focus on what this tool is actually good for in task workflows.

Allowed workflowRoles:
- copywriting
- long_context_analysis
- research
- landing_page_builder
- presentation_generation
- design
- video_generation
- video_editing
- voiceover
- form_builder
- payment
- automation
- faq_bot
- image_generation
- social_content
- competitive_research

Allowed skillLevel:
- BEGINNER
- BASIC
- ADVANCED
- EXPERT

Allowed outputQuality:
- QUICK
- PUBLISHABLE
- COMMERCIAL
- TEAM

Return strict JSON only.
"""

def slugify(name: str) -> str:
    return name.lower().strip().replace(" ", "-").replace("/", "-")

def normalize_file(path: Path):
    raw = json.loads(path.read_text(encoding="utf-8"))
    markdown = raw.get("markdown", "")[:12000]

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": f"Tool name: {raw.get('name')}\nURL: {raw.get('url')}\nMarkdown:\n{markdown}"}
        ]
    )

    text = response.output_text
    data = json.loads(text)
    data["slug"] = data.get("slug") or slugify(data["name"])
    data["websiteUrl"] = data.get("websiteUrl") or raw.get("url")

    tool = NormalizedTool(**data)
    out_path = OUT_DIR / f"{tool.slug}.json"
    out_path.write_text(tool.model_dump_json(indent=2), encoding="utf-8")
    print(f"Normalized {out_path}")

def main():
    for path in RAW_DIR.glob("*.json"):
        try:
            normalize_file(path)
        except Exception as e:
            print(f"Failed {path}: {e}")

if __name__ == "__main__":
    main()
```

### 10.9 import_tools.py

导入数据库，MVP 可以先导入 JSON 到 `tools` 表。

```python
import json
import os
from pathlib import Path
import psycopg
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
REVIEWED_DIR = Path("output/reviewed")
NORMALIZED_DIR = Path("output/normalized")

def main():
    source_dir = REVIEWED_DIR if REVIEWED_DIR.exists() and list(REVIEWED_DIR.glob("*.json")) else NORMALIZED_DIR

    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            for path in source_dir.glob("*.json"):
                data = json.loads(path.read_text(encoding="utf-8"))
                cur.execute(
                    """
                    INSERT INTO "Tool" (
                        id, name, slug, "websiteUrl", description, categories,
                        "pricingType", "startingPrice", "freeTrial", "bestFor",
                        "notGoodFor", "workflowRoles", "skillLevel", "outputQuality",
                        "easeOfUseScore", "trustScore", status, "createdAt", "updatedAt"
                    )
                    VALUES (
                        gen_random_uuid(), %(name)s, %(slug)s, %(websiteUrl)s, %(description)s,
                        %(categories)s, %(pricingType)s, %(startingPrice)s, %(freeTrial)s,
                        %(bestFor)s, %(notGoodFor)s, %(workflowRoles)s, %(skillLevel)s,
                        %(outputQuality)s, 70, 70, 'active', NOW(), NOW()
                    )
                    ON CONFLICT (slug) DO UPDATE SET
                        description = EXCLUDED.description,
                        categories = EXCLUDED.categories,
                        "pricingType" = EXCLUDED."pricingType",
                        "startingPrice" = EXCLUDED."startingPrice",
                        "freeTrial" = EXCLUDED."freeTrial",
                        "bestFor" = EXCLUDED."bestFor",
                        "notGoodFor" = EXCLUDED."notGoodFor",
                        "workflowRoles" = EXCLUDED."workflowRoles",
                        "skillLevel" = EXCLUDED."skillLevel",
                        "outputQuality" = EXCLUDED."outputQuality",
                        "updatedAt" = NOW()
                    """,
                    data
                )
            conn.commit()

if __name__ == "__main__":
    main()
```

注意：Prisma 默认表名可能是 `"Tool"`，如果你用 `@@map("tools")`，SQL 要改成 `tools`。

### 10.10 爬虫合规规则

Codex 在 `crawler/README.md` 中写入：

```text
Crawler rules:
1. Respect robots.txt and site terms.
2. Do not bypass login, paywalls, anti-bot, or access controls.
3. Do not scrape personal data.
4. Do not copy full third-party directories as your core database.
5. Store source URL and crawled_at.
6. Human review is required before publishing tool data.
7. The crawler is offline data ingestion, not a real-time dependency.
```

---

## 11. Codex 开发任务拆分

下面这部分可以直接复制给 Codex。

### 11.1 Codex 总任务

```text
你是资深全栈工程师。请根据本 MVP 文档开发一个 Next.js 全栈应用：AI Tool Decision Engine。

核心原则：
- 不做 AI 工具导航站。
- 首页以任务输入为中心。
- 用户输入任务后，系统识别任务类型、追问必要问题、推荐最合适的 1–3 个 AI 工具，并生成执行步骤、Prompt、风险提示和质量检查清单。
- 工具必须嵌入工作流步骤，不要展示大列表。
- MVP 只支持 5 个任务：Landing Page、广告视频、PDF 转 PPT、课程销售页、个人品牌主页。
- 数据库使用 Prisma + PostgreSQL。
- 前端使用 Next.js App Router + TypeScript + Tailwind + shadcn/ui。
- AI 调用封装在 lib/ai。
- 推荐逻辑必须先用本地任务模板和工具评分，再让 LLM 个性化生成，不能让 LLM 自由推荐。
```

### 11.2 第 1 步：初始化项目

```text
创建 Next.js 项目。
安装：
- prisma
- @prisma/client
- zod
- openai
- ai，可选
- lucide-react
- shadcn/ui
- clsx
- tailwind-merge
- date-fns

配置：
- Tailwind
- shadcn/ui
- Prisma
- .env.example

生成基础页面：
- /
- /workflow/new
- /workflow/[id]
- /tools/[slug]
- /compare
- /submit-tool
- /admin/tools
```

### 11.3 第 2 步：数据库

```text
根据文档创建 prisma/schema.prisma。
运行：
npx prisma migrate dev --name init
npx prisma generate

创建 seed 脚本：
- 导入 5 个 tasks
- 导入 task questions
- 导入 20 个工具，先不要强求 50 个
- 导入 5 个 workflow templates
- 导入 workflow step templates
- 导入 tool roles 和 tool task scores
```

### 11.4 第 3 步：任务识别 API

```text
实现 /api/task/identify。

逻辑：
1. 接收 input。
2. 先用关键词规则判断：
   - landing/page/site/homepage → build_landing_page
   - ad/video/tiktok/reels → create_ad_video
   - pdf/slides/ppt → pdf_to_slides
   - course/sales page/cohort → course_sales_page
   - personal brand/consultant/profile → personal_brand_page
3. 如果规则置信度低，再调用 LLM 分类。
4. 返回 taskKey、confidence、needClarification、questions。
```

### 11.5 第 4 步：工作流生成 API

```text
实现 /api/workflow/generate。

逻辑：
1. 根据 taskKey 查 Task。
2. 查 WorkflowTemplate。
3. 查 WorkflowStepTemplate。
4. 对每个 step.toolRole 查候选工具。
5. 调用 calculateToolFitScore 排序。
6. 每步选 primaryTool、backupTool、budgetTool。
7. 将任务、用户上下文、工作流模板、工具推荐结果传入 LLM。
8. 使用 workflowResultSchema 校验结果。
9. 保存到 GeneratedWorkflow。
10. 返回 id 和 result。
```

### 11.6 第 5 步：前端工作流结果页

```text
实现 /workflow/[id]。

展示：
- 任务摘要
- 推荐策略
- 三种方案卡片
- 工作流步骤列表
- 每步工具、原因、Prompt
- 复制 Prompt 按钮
- 不推荐工具
- 风险提示
- 质量检查清单
- 下一步行动
- 反馈按钮：有用 / 不准 / 过时
```

### 11.7 第 6 步：工具详情页

```text
实现 /tools/[slug]。

展示：
- 工具名
- 官网链接
- 描述
- bestFor
- notGoodFor
- workflowRoles
- pricing
- trustScore
- used in workflows
- feedback button
```

### 11.8 第 7 步：工具对比页

```text
实现 /compare。

输入：
- task
- tools

MVP 可先使用手动输入工具名称。
系统调用 /api/tools/compare，输出：
- 对比表
- 推荐结论
- 首选工具
- 备选工具
- 不推荐原因
```

### 11.9 第 8 步：后台工具管理

```text
实现 /admin/tools。

MVP 可先不做完整登录，只用 ADMIN_SECRET 或 ADMIN_EMAILS 环境变量保护。
功能：
- 工具列表
- 新增工具
- 编辑工具
- 激活/禁用工具
- 导入 JSON
```

### 11.10 第 9 步：爬虫脚本

```text
创建 crawler/ 目录。
使用 Crawl4AI 实现：
- input_urls.csv
- crawl_urls.py
- normalize_tools.py
- import_tools.py
- README.md

要求：
- 爬虫不跑在 Vercel。
- 只作为离线数据采集。
- normalize 后必须人工审核再进入正式库。
```

### 11.11 第 10 步：验收

```text
验收任务：
1. 用户进入首页，可以输入“我要做一个广告视频”。
2. 系统识别为 create_ad_video。
3. 系统提出 3–5 个澄清问题。
4. 用户回答后生成工作流。
5. 结果页显示：
   - 推荐策略
   - 三种方案
   - 每步工具
   - Prompt
   - 风险
   - 检查清单
6. 每步不超过 2 个推荐工具。
7. 可以复制 Prompt。
8. 可以点击工具官网。
9. 可以提交反馈。
10. 后台可以新增工具。
11. 离线爬虫可以抓取工具官网并生成 normalized JSON。
```

---

## 12. 环境变量

`.env.example`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_workflow"
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"

ADMIN_SECRET="change-me"
ADMIN_EMAILS="your@email.com"

# Optional
RESEND_API_KEY=""
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

---

## 13. package.json 脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "data:validate": "tsx scripts/validate-data.ts",
    "data:import-tools": "tsx scripts/import-tools.ts"
  }
}
```

---

## 14. 首页与结果页 UI 要求

### 14.1 风格

- 现代 SaaS 风格
- 清爽、专业、可信
- 不要像普通导航站
- 不要密密麻麻工具卡片
- 首屏重点必须是任务输入框
- 结果页像一份执行报告

### 14.2 首页布局

```text
Header
Hero
  - headline
  - subheadline
  - task input
  - quick examples
Popular task cards
How it works
Example workflow preview
For tool makers
Newsletter CTA
Footer
```

### 14.3 结果页布局

```text
Left main column:
- task summary
- recommended strategy
- routes
- workflow steps
- prompts
- checklist
- risks

Right sidebar:
- recommended tool stack
- save/export buttons
- feedback
- related workflows
```

---

## 15. 质量与风险控制

### 15.1 必须防止 AI 幻觉

实现方式：

1. LLM 只能基于候选工具生成。
2. 推荐工具来自数据库。
3. 如果工具不在数据库，标记为 `external_suggestion`。
4. 输出结果必须通过 Zod schema。
5. 每个工具展示 lastCheckedAt。
6. 推荐理由必须来自工具字段和任务上下文。

### 15.2 必须防止广告破坏信任

实现方式：

1. sponsored tool 必须显示 Sponsored。
2. sponsored tool 不能强制成为 primaryTool。
3. 不适合任务的 sponsored tool 不能进入工作流。
4. 用户可以看到推荐原因。

### 15.3 必须防止结果太泛

每个工作流输出必须包含：

- 至少 5 个具体步骤。
- 至少 3 个可复制 Prompt。
- 至少 8 条质量检查项。
- 至少 3 条风险提示。
- 至少 1 条不推荐工具原因。

---

## 16. 关键指标埋点

MVP 必须记录：

```text
task_input_submitted
task_identified
clarification_answered
workflow_generated
prompt_copied
tool_clicked
workflow_saved
feedback_submitted
submit_tool_clicked
newsletter_subscribed
```

每个事件包含：

```json
{
  "userId": "optional",
  "sessionId": "required",
  "taskKey": "optional",
  "toolSlug": "optional",
  "generatedWorkflowId": "optional",
  "timestamp": "ISO date"
}
```

### 16.1 MVP 及格线

```text
首页访问 → 任务输入：>= 15%
任务输入 → 完成澄清：>= 40%
生成结果 → 复制 Prompt：>= 15%
生成结果 → 点击工具：>= 8%
生成结果 → 提交反馈：>= 5%
用户标记有用：>= 60%
```

---

## 17. 开发优先级

### Sprint 1：核心链路

目标：跑通输入任务 → 生成工作流 → 展示结果。

任务：

1. 初始化项目。
2. 配置数据库。
3. 建 Prisma schema。
4. Seed 5 个任务、20 个工具。
5. 实现首页输入。
6. 实现任务识别。
7. 实现工作流生成。
8. 实现结果页。

### Sprint 2：决策质量

目标：让结果不是普通 ChatGPT。

任务：

1. 实现工具评分器。
2. 每步只推荐 1–2 个工具。
3. 添加不推荐工具原因。
4. 添加 Prompt 复制。
5. 添加检查清单。
6. 添加反馈。

### Sprint 3：后台与数据

目标：可维护工具库。

任务：

1. Admin 工具管理。
2. JSON 导入工具。
3. Submit Tool 页面。
4. 离线爬虫脚本。
5. 工具 normalized JSON 审核流程。

### Sprint 4：增长准备

目标：可上线验证。

任务：

1. SEO 元信息。
2. 工具详情页。
3. 比较页。
4. Newsletter 收集。
5. 基础 analytics。
6. Vercel 部署。

---

## 18. 上线前 Checklist

### 功能

- [ ] 首页任务输入可用
- [ ] 5 个任务都能识别
- [ ] 每个任务都有澄清问题
- [ ] 每个任务能生成工作流
- [ ] 结果页结构化展示
- [ ] Prompt 可复制
- [ ] 工具官网可点击
- [ ] 反馈可提交
- [ ] 工具后台可新增
- [ ] 爬虫可生成工具 JSON

### 数据

- [ ] 至少 5 个任务
- [ ] 至少 20 个工具，最好 50 个
- [ ] 每个任务至少 1 个 workflow template
- [ ] 每个 workflow 至少 5 个 step
- [ ] 每个 step 至少有 toolRole
- [ ] 每个 tool 至少有 workflowRoles、bestFor、notGoodFor

### 体验

- [ ] 首页不展示大量工具列表
- [ ] 每步不超过 2 个工具
- [ ] 有明确推荐结论
- [ ] 有不推荐原因
- [ ] 有风险提示
- [ ] 有检查清单

### 安全

- [ ] API key 不暴露到前端
- [ ] Admin 页面有保护
- [ ] 爬虫不跑在 Vercel
- [ ] Sponsored 标识预留
- [ ] 用户输入有基础限流

---

## 19. 后续版本路线

### v0.2

- 支持 20 个任务
- 支持 100 个工具
- 工具对比页完善
- 工具提交审核
- 工作流保存
- Markdown 导出

### v0.3

- Trust Score
- AI 工具订阅优化
- 结果质检
- Newsletter
- Sponsored Workflow 基础

### v1.0

- Pro 订阅
- Paid Launch
- 工具厂商后台
- Workflow sponsorship
- 企业选型报告
- 白标版本

---

## 20. 最重要的产品判断

这个项目不是靠“工具数量”赢，而是靠“决策质量”赢。

Codex 开发时要一直遵守：

```text
不要做 Toolify。
不要做 TAAFT。
不要做 ChatGPT wrapper。

要做：
用户输入一个具体任务，
系统给出一个明确工具决策，
并把工具嵌入可执行步骤里，
最后让用户能直接开始做。
```

最终体验要让用户感到：

```text
我不是又看了一堆 AI 工具。
我终于知道这件事该怎么做了。
```

---

## 21. 参考开源爬虫工具

- Crawl4AI GitHub: https://github.com/unclecode/crawl4ai
- Firecrawl GitHub: https://github.com/firecrawl/firecrawl
- Firecrawl Website: https://www.firecrawl.dev/
- Crawlee GitHub: https://github.com/apify/crawlee
- Crawlee Docs: https://crawlee.dev/
- Scrapy GitHub: https://github.com/scrapy/scrapy
- Scrapy Website: https://scrapy.org/

MVP 推荐：

```text
首选：Crawl4AI
备选：Crawlee
最快商业化：Firecrawl hosted API
未来大规模：Scrapy
```
