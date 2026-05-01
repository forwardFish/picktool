# AI 决策导航｜MVP 开发文档 v0.2

> 可直接交给 Codex / Claude Code / Trae 开发使用  
> 基于 v0.1 修改：从“AI 工具工作流生成器”升级为“结果优先的 AI 决策导航”。  
> 核心原则：**用户只要结果，不要看复杂决策过程；页面像工具搜索，结果像行动方案。**

---

## 0. 本次 v0.2 修改重点

### 0.1 必须改掉的问题

v0.1 的方向是对的：

```text
少工具，强决策；少列表，强工作流；少分类，强任务结果
```

但 v0.1 仍然有一个明显问题：

```text
页面和结果容易变成“把决策流程展示给用户”。
```

用户真正想要的不是：

```text
我看到你是怎么判断的。
```

用户真正想要的是：

```text
你直接告诉我：
我现在该用什么方案？
该用哪几个工具？
第一步马上点哪里？
```

所以 v0.2 的核心改动是：

```text
搜索 → 最优结果方案 → 工具组合 → 立即执行动作
```

不是：

```text
搜索 → 展示决策流程 → 展示很多步骤 → 再让用户自己判断
```

---

## 1. 产品重新定位

### 1.1 产品一句话

用户输入一个目标或问题，系统直接给出一个可执行的“最佳解决方案包”，并推荐最少但最合适的工具组合，让用户立刻开始行动。

英文：

```text
Tell us what you want to achieve. We return the best action-ready AI solution.
```

中文：

```text
告诉我们你想解决什么，我们直接给你最优行动方案。
```

### 1.2 不是做什么

本产品不是：

1. 不是 AI 工具导航站。
2. 不是 Toolify。
3. 不是 There’s An AI For That 的中文复刻。
4. 不是单纯的工具搜索引擎。
5. 不是让用户自己看 30 个工具后再判断。
6. 不是把 ChatGPT 的长答案包装成网页。
7. 不是把“决策流程”完整摊开给用户看。

### 1.3 真正要做什么

本产品要做的是：

```text
用户输入一个问题
↓
系统理解用户想要的最终结果
↓
直接生成最优解决方案包
↓
只推荐 1–3 个关键工具
↓
给出立刻可执行的动作按钮
```

用户看到的不是“复杂流程”，而是：

```text
最佳方案
推荐工具组合
立即执行
补充信息
相关方案
```

---

## 2. 与普通 AI 工具导航的核心差异

### 2.1 普通工具导航

```text
用户输入：我想解决如何找到我的宠物
系统返回：
- 通用 Agent A
- 通用 Agent B
- 自动化工具 C
- 聊天机器人 D

用户自己判断哪个能用。
```

### 2.2 本产品

```text
用户输入：我想解决如何找到我的宠物
系统返回：
- 最佳结果：寻宠行动包
- 立刻动作：上传宠物照片、填写走失地点、生成寻宠海报
- 推荐工具组合：海报生成 + 地图搜索 + 线索收集表单
- 下一步：一键生成寻宠启事并发布到附近社群
```

### 2.3 产品体验差异

| 对比项 | 普通 AI 工具导航 | AI 决策导航 |
|---|---|---|
| 用户输入 | 关键词 | 自然语言目标 |
| 系统重点 | 匹配工具 | 生成解决方案 |
| 输出形态 | 工具列表 | 行动方案包 |
| 工具数量 | 很多 | 1–3 个核心工具 |
| 用户负担 | 自己判断 | 直接行动 |
| 页面感觉 | 工具目录 | 智能搜索 + 结果面板 |
| 信任来源 | 工具多 | 推荐明确、动作可执行 |

---

## 3. 产品原则

### 3.1 用户只看结果

用户主界面不展示完整推理链，不展示复杂决策树，不展示冗长分析。

主界面只展示：

```text
1. 最佳方案是什么
2. 为什么适合你，一句话
3. 推荐工具组合
4. 现在可以做什么
5. 需要补充什么信息
```

### 3.2 决策流程放后台

系统后台仍然需要完整决策逻辑：

```text
意图识别
场景判断
紧急程度判断
任务类型判断
工具角色匹配
工具评分
方案模板选择
动作生成
质量校验
```

但这些不应该以“决策流程”的形式强行展示给用户。

用户只需要看到决策后的结果。

### 3.3 少工具，但不是只有一个工具

每个结果最多展示：

```text
1 个首选工具
1 个搭配工具
1 个低成本替代
```

工具必须服务于方案，不允许独立堆列表。

### 3.4 少分类，但保留浏览感

页面可以学习 There’s An AI For That 的浏览结构：

```text
大输入框
自然语言搜索
分类切换
结果卡片
Featured
Latest
评分、价格、热度
```

但分类不是产品核心，只是辅助浏览。

首页核心仍然是：

```text
用户输入目标 → 系统生成结果
```

---

## 4. MVP 目标

### 4.1 MVP 验证什么

MVP 第一阶段验证 5 件事：

1. 用户是否愿意用自然语言输入真实目标。
2. 用户是否能接受系统直接给出的“最佳方案”。
3. 用户是否愿意点击推荐工具。
4. 用户是否愿意点击“立即执行”动作。
5. 用户是否觉得“这比自己搜索工具更省时间”。

### 4.2 MVP 不以什么为第一指标

第一版不以工具数量为第一指标。

第一版不以订阅收入为第一指标。

第一版不以复杂工作流数量为第一指标。

第一版核心指标是：

```text
用户输入后，是否马上感觉：它懂我要解决的问题。
```

---

## 5. MVP 首批任务范围

v0.1 的 5 个任务保留，但需要增加一个“真实问题样板任务”。

### 5.1 任务 1：做 Landing Page

用户输入示例：

```text
我要给我的 AI 课程做一个落地页
我要做一个 SaaS 等待名单页面
我要做一个咨询服务预约页
```

用户看到的结果不叫“工作流”，而叫：

```text
落地页启动方案
```

输出：

- 推荐页面结构
- 首屏标题方向
- 推荐工具组合
- 可复制 Prompt
- 立即执行按钮：生成首页文案 / 生成页面结构 / 打开建站工具

### 5.2 任务 2：做广告视频

用户输入示例：

```text
我要给我的产品做一条抖音广告视频
我要做一个 TikTok UGC 广告
```

用户看到的结果：

```text
短视频广告生成方案
```

输出：

- 推荐广告角度
- Hook
- 分镜简版
- 推荐工具组合
- 立即执行按钮：生成脚本 / 生成分镜 / 打开视频工具

### 5.3 任务 3：PDF 转 PPT

用户输入示例：

```text
我要把一份 PDF 变成课程 PPT
我要把行业报告变成路演 PPT
```

用户看到的结果：

```text
PDF 转 PPT 方案
```

输出：

- 推荐转化方式
- PPT 结构
- 推荐工具组合
- 立即执行按钮：上传 PDF / 生成大纲 / 打开 PPT 工具

### 5.4 任务 4：做课程销售页

用户输入示例：

```text
我要卖一门 AI 课程，需要一个销售页
我要做一个训练营报名页
```

用户看到的结果：

```text
课程销售页成交方案
```

输出：

- 课程定位
- 用户痛点
- 页面模块
- 推荐工具组合
- 立即执行按钮：生成首屏文案 / 生成 FAQ / 生成报名页结构

### 5.5 任务 5：做个人品牌主页

用户输入示例：

```text
我要做一个个人品牌主页
我要做一个顾问预约页面
```

用户看到的结果：

```text
个人品牌主页方案
```

输出：

- 一句话定位
- 服务模块
- 信任证明
- 推荐工具组合
- 立即执行按钮：生成个人介绍 / 生成服务套餐 / 打开建站工具

### 5.6 任务 6：真实问题样板任务：寻找走失宠物

这个任务用来证明产品不是普通工具导航。

用户输入示例：

```text
我想解决如何找到我的宠物
我的猫走丢了怎么办
我的狗在小区附近不见了
```

用户看到的结果：

```text
寻宠行动包
```

输出：

- 一句话判断：这是紧急找回型问题，优先建立搜索半径、信息扩散和线索收集。
- 推荐工具组合：寻宠海报生成器 + 地图搜索路线 + 线索收集表单。
- 立即执行动作：上传宠物照片 / 生成寻宠启事 / 创建附近机构联系清单 / 记录线索。
- 不推荐：通用 Agent 作为首选，因为它不能直接扩大找回概率。

注意：

```text
这个任务不是为了做宠物垂直产品，
而是为了验证“用户输入真实问题，系统返回结果方案”的核心体验。
```

---

## 6. 首页 UI 要求

### 6.1 页面参考方向

可以学习 There’s An AI For That 的页面结构：

```text
顶部导航
大输入框
自然语言搜索
分类 tabs
结果卡片
右侧 Featured / Latest
工具价格、评分、热度
```

但不能照搬它的结果逻辑。

它是：

```text
搜索 → 工具卡片
```

本产品必须是：

```text
搜索 → 结果方案卡 → 工具组合 → 执行动作
```

### 6.2 首页信息架构

```text
Header
  - Logo：AI 决策导航 / DecisionNav
  - Nav：发现 / 方案 / 工具 / 排行榜 / 收藏
  - Search shortcut
  - User menu

Hero
  - 主标题
  - 副标题
  - 大输入框
  - 示例任务 chips

Result Preview Area
  - 用户输入后，结果直接出现在输入框下方
  - 不要跳转前就让用户等待太久

Tabs
  - 全部
  - 解决方案
  - AI 工具
  - Agent
  - 模板
  - 最新

Main Result Column
  - 最佳方案卡
  - 推荐工具组合
  - 立即执行动作
  - 相关方案

Right Sidebar
  - Featured Solutions
  - Latest Tools
  - Trending Tasks
```

### 6.3 首页首屏文案

推荐中文：

```text
别再翻 AI 工具列表了
输入你想解决的问题，直接获得最优行动方案
```

备选中文：

```text
你说目标，AI 给方案
从工具选择到执行动作，一次给你最短路径
```

推荐英文：

```text
Stop browsing AI tools.
Tell us your goal. Get the best action-ready solution.
```

### 6.4 搜索框 placeholder

```text
例如：我想解决如何找到我的宠物
例如：我要把 PDF 变成课程 PPT
例如：我要做一个课程销售页
例如：我要给产品做一条广告视频
例如：我要做一个个人品牌主页
```

### 6.5 搜索框下方快捷示例

```text
生成课程销售页
PDF 转 PPT
做广告视频
分析竞品网站
寻找走失宠物
```

---

## 7. 用户输入后的结果页/结果区设计

### 7.1 核心原则

用户输入后，不要先展示“决策流程”。

正确展示顺序：

```text
1. 最佳结果卡
2. 推荐工具组合
3. 立即执行动作
4. 需要补充的信息
5. 相关方案 / Featured / Latest
```

### 7.2 结果区结构

```text
ResultHeader
  - 用户输入原文
  - 系统识别的任务类型
  - 结果标题
  - 一句话结论
  - 置信度 / 紧急程度 / 难度

BestSolutionCard
  - 最佳方案名称
  - 适合原因
  - 预计时间
  - 预计成本
  - 主按钮：开始执行

ToolStackCards
  - 首选工具
  - 搭配工具
  - 低成本替代

ActionCards
  - 立即动作 1
  - 立即动作 2
  - 立即动作 3

PromptBlocks
  - 可复制 Prompt
  - 默认折叠，用户点击才展开

WhyThisRecommendation
  - 默认折叠
  - 展示简短推荐原因

RightSidebar
  - Featured solutions
  - Latest tools
  - Related tasks
```

### 7.3 对“寻找宠物”的展示样例

用户输入：

```text
我想解决如何找到我的宠物
```

系统主结果：

```text
最佳方案：寻宠行动包

这是一个紧急找回型问题。优先不是找通用 AI Agent，而是马上生成寻宠信息、扩大搜索半径、建立线索收集渠道。
```

推荐工具组合：

```text
1. 寻宠海报生成器
   用途：生成标准寻宠图和发布文案
   价格：免费版可用
   评分：4.8

2. 地图搜索路线工具
   用途：规划最后出现地点周边 500 米 / 2 公里搜索圈
   价格：免费
   评分：4.6

3. 线索收集表单工具
   用途：收集附近居民反馈、照片、发现时间和地点
   价格：免费版可用
   评分：4.7
```

立即执行动作：

```text
[上传宠物照片]
[生成寻宠启事]
[创建搜索路线]
[生成社群发布文案]
```

不推荐首选：

```text
不建议先用通用 Agent，因为它不能直接帮你完成信息扩散、路线规划和线索收集。
```

---

## 8. 前端页面与组件

### 8.1 页面路由

```text
app/
├── page.tsx                          # 首页，搜索与内联结果
├── solutions/
│   └── [id]/page.tsx                 # 完整方案页
├── tools/
│   └── [slug]/page.tsx               # 工具详情页
├── tasks/
│   └── [slug]/page.tsx               # 任务模板页
├── compare/page.tsx                  # 工具对比页
├── submit-tool/page.tsx              # 工具提交页
├── admin/
│   ├── tools/page.tsx
│   ├── tools/new/page.tsx
│   ├── solutions/page.tsx
│   └── imports/page.tsx
└── api/
    ├── search/solution/route.ts
    ├── solution/refine/route.ts
    ├── solution/[id]/route.ts
    ├── tools/compare/route.ts
    ├── feedback/route.ts
    └── admin/tools/route.ts
```

### 8.2 组件结构

```text
components/
├── layout/
│   ├── AppHeader.tsx
│   ├── RightSidebar.tsx
│   └── Shell.tsx
├── search/
│   ├── HeroSearch.tsx
│   ├── SearchTabs.tsx
│   ├── ExampleChips.tsx
│   └── SearchLoadingState.tsx
├── results/
│   ├── ResultHeader.tsx
│   ├── BestSolutionCard.tsx
│   ├── ToolStackCard.tsx
│   ├── ToolStackGrid.tsx
│   ├── ActionCard.tsx
│   ├── ActionGrid.tsx
│   ├── PromptDrawer.tsx
│   ├── WhyDrawer.tsx
│   └── ResultFeedback.tsx
├── sidebar/
│   ├── FeaturedSolutionCard.tsx
│   ├── LatestToolItem.tsx
│   └── TrendingTaskItem.tsx
├── tools/
│   ├── ToolCard.tsx
│   ├── ToolBadge.tsx
│   └── ToolPrice.tsx
└── ui/
```

### 8.3 首页交互流程

```text
1. 用户进入首页。
2. 看到大输入框。
3. 输入自然语言问题。
4. 点击搜索或回车。
5. 页面不马上跳转，先在输入框下方展示结果预览。
6. 如果信息不足，只问 1–3 个必要问题，同时仍给出临时方案。
7. 用户点击“开始执行”后进入完整方案页。
```

### 8.4 不允许的 UI

不要这样做：

```text
第一屏展示 20 个工具分类。
输入后展示 10 个工具卡片。
结果主区域显示 7 步复杂流程。
每一步都塞很多解释。
```

正确做法：

```text
第一屏只强调输入目标。
输入后先给最佳方案。
工具只作为方案的组成部分。
动作按钮比解释文字更重要。
```

---

## 9. 数据模型修改

v0.1 的 Tool、Task、WorkflowTemplate 可以保留，但需要增加“Solution First”的数据结构。

### 9.1 新增枚举

```prisma
enum TaskMode {
  AI_TOOL_TASK
  BUSINESS_TASK
  CREATOR_TASK
  LIFE_PROBLEM
  EMERGENCY_PROBLEM
  UNKNOWN
}

enum UrgencyLevel {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum SolutionStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum ActionType {
  OPEN_TOOL
  COPY_PROMPT
  UPLOAD_FILE
  GENERATE_ASSET
  CREATE_CHECKLIST
  OPEN_MAP
  CREATE_FORM
  SAVE_RESULT
}
```

### 9.2 修改 Task 模型

```prisma
model Task {
  id              String   @id @default(uuid())
  key             String   @unique
  name            String
  slug            String   @unique
  category        String
  mode            TaskMode @default(AI_TOOL_TASK)
  description     String
  userIntentExamples String[]
  expectedOutputs String[]
  complexity      String?
  urgencyLevel    UrgencyLevel @default(MEDIUM)
  questions       TaskQuestion[]
  workflows       WorkflowTemplate[]
  solutionTemplates SolutionTemplate[]
  toolScores      ToolTaskScore[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 9.3 新增 SolutionTemplate

```prisma
model SolutionTemplate {
  id                    String   @id @default(uuid())
  taskId                String
  task                  Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  name                  String
  slug                  String   @unique
  status                SolutionStatus @default(ACTIVE)
  resultTitle           String
  oneLineConclusion     String
  primaryOutcome        String
  recommendedStrategy   String
  visibleSummary        String
  hiddenDecisionNotes   String?
  estimatedTime         String?
  estimatedCostMin      Float?
  estimatedCostMax      Float?
  requiredInputs        String[]
  actions               SolutionActionTemplate[]
  toolSlots             SolutionToolSlot[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### 9.4 新增 SolutionActionTemplate

```prisma
model SolutionActionTemplate {
  id                  String   @id @default(uuid())
  solutionTemplateId  String
  solutionTemplate    SolutionTemplate @relation(fields: [solutionTemplateId], references: [id], onDelete: Cascade)
  orderIndex          Int
  title               String
  description         String
  actionType          ActionType
  buttonText          String
  toolRole            String?
  promptTemplate      String?
  inputRequired       String[]
  expectedOutput      String
  isPrimary           Boolean @default(false)
}
```

### 9.5 新增 SolutionToolSlot

```prisma
model SolutionToolSlot {
  id                  String   @id @default(uuid())
  solutionTemplateId  String
  solutionTemplate    SolutionTemplate @relation(fields: [solutionTemplateId], references: [id], onDelete: Cascade)
  roleKey             String
  displayName         String
  purpose             String
  maxTools            Int      @default(1)
  required            Boolean  @default(true)
  orderIndex          Int
}
```

### 9.6 修改 GeneratedWorkflow 为 GeneratedSolution

建议新增 `GeneratedSolution`，不要继续把前端概念叫 Workflow。

```prisma
model GeneratedSolution {
  id                String   @id @default(uuid())
  userId            String?
  taskKey           String?
  taskDescription   String
  detectedTaskMode   TaskMode @default(UNKNOWN)
  urgencyLevel      UrgencyLevel @default(MEDIUM)
  userContext       Json
  resultJson        Json
  saved             Boolean  @default(false)
  createdAt         DateTime @default(now())
  feedbacks         Feedback[]
}
```

保留 `GeneratedWorkflow` 也可以，但前端不要显示 Workflow 这个词。

---

## 10. 推荐逻辑修改

### 10.1 后端真实流程

后端可以保留完整逻辑：

```text
用户输入
↓
Input Normalizer
↓
Intent Classifier
↓
Task Mode Classifier
↓
Urgency Classifier
↓
Solution Template Selector
↓
Required Inputs Detector
↓
Tool Slot Resolver
↓
Tool Ranker
↓
Action Package Generator
↓
Result Schema Validator
↓
返回前端
```

### 10.2 前端可见流程

前端只展示：

```text
最佳方案
工具组合
立即执行
```

不要展示：

```text
我先识别了你的意图
然后判断任务类型
然后对工具打分
然后生成工作流
```

这些可以放到折叠区：

```text
为什么这样推荐？
```

### 10.3 工具推荐规则

每个工具槽位最多返回 3 个：

```ts
type ToolSlotRecommendation = {
  roleKey: string;
  displayName: string;
  purpose: string;
  primaryTool: ToolCard;
  backupTool?: ToolCard;
  budgetTool?: ToolCard;
};
```

主界面默认只展示 primaryTool。

用户点击“查看替代”才展示 backupTool 和 budgetTool。

### 10.4 不推荐工具规则

如果用户输入的问题不适合通用 Agent，必须明确提示。

例如：

```text
不建议首选通用 Agent，因为这个问题的关键不是聊天，而是生成可发布材料、建立搜索路径、收集线索。
```

---

## 11. Tool Fit Score v0.2

v0.1 的工具评分可以保留，但要增加“动作适配”和“结果适配”。

```ts
type ToolCandidate = {
  id: string;
  name: string;
  slug: string;
  workflowRoles: string[];
  actionRoles?: string[];
  skillLevel?: string | null;
  outputQuality?: string | null;
  easeOfUseScore: number;
  trustScore: number;
  taskScore?: number;
  roleScore?: number;
  actionScore?: number;
  outcomeScore?: number;
  pricingType?: string;
  startingPrice?: number | null;
  rating?: number | null;
  popularityScore?: number | null;
};

type RankContext = {
  taskKey: string;
  taskMode: string;
  roleKey: string;
  actionType?: string;
  desiredOutcome?: string;
  budgetLevel?: string;
  skillLevel?: string;
  qualityLevel?: string;
  urgencyLevel?: string;
};

export function calculateToolFitScoreV2(tool: ToolCandidate, context: RankContext): number {
  const taskMatch = normalize(tool.taskScore ?? 60);
  const roleMatch = normalize(tool.roleScore ?? (tool.workflowRoles.includes(context.roleKey) ? 80 : 40));
  const actionMatch = normalize(tool.actionScore ?? getActionMatch(tool, context.actionType));
  const outcomeMatch = normalize(tool.outcomeScore ?? 70);
  const skillMatch = getSkillMatch(tool.skillLevel, context.skillLevel);
  const budgetMatch = getBudgetMatch(tool, context.budgetLevel);
  const qualityMatch = getQualityMatch(tool.outputQuality, context.qualityLevel);
  const trust = normalize(tool.trustScore ?? 70);
  const ease = normalize(tool.easeOfUseScore ?? 70);
  const popularity = normalize(tool.popularityScore ?? 60);

  const score =
    taskMatch * 0.22 +
    roleMatch * 0.20 +
    actionMatch * 0.16 +
    outcomeMatch * 0.14 +
    skillMatch * 0.08 +
    budgetMatch * 0.08 +
    qualityMatch * 0.05 +
    trust * 0.04 +
    ease * 0.02 +
    popularity * 0.01;

  return Math.round(score * 100);
}

function normalize(score: number): number {
  return Math.max(0, Math.min(100, score)) / 100;
}

function getActionMatch(tool: ToolCandidate, actionType?: string): number {
  if (!actionType) return 70;
  if (!tool.actionRoles?.length) return 60;
  return tool.actionRoles.includes(actionType) ? 90 : 45;
}
```

---

## 12. AI Prompt 修改

### 12.1 任务识别 Prompt

```ts
export const TASK_INTENT_CLASSIFIER_PROMPT = `
You are the intent classifier for an AI decision navigation product.

The user may input a business task, creator task, AI tool task, or real-world problem.

Classify the input into:
- taskKey: one of known tasks or unknown
- taskMode: AI_TOOL_TASK | BUSINESS_TASK | CREATOR_TASK | LIFE_PROBLEM | EMERGENCY_PROBLEM | UNKNOWN
- urgencyLevel: LOW | MEDIUM | HIGH | URGENT
- userDesiredOutcome: what the user actually wants to achieve
- shouldAskClarification: true only if missing information blocks a useful first result
- clarificationQuestions: max 3 questions

Known task keys:
- build_landing_page
- create_ad_video
- pdf_to_slides
- course_sales_page
- personal_brand_page
- find_lost_pet
- unknown

Return strict JSON only.

User input:
{{input}}
`;
```

### 12.2 结果方案生成 Prompt

```ts
export const SOLUTION_GENERATION_PROMPT = `
You are an AI decision navigation expert.

Your job is NOT to show a long reasoning process.
Your job is to produce an action-ready solution package.

User-facing rules:
1. Start with the best result, not the process.
2. Do not expose a long decision chain.
3. Recommend the smallest effective tool stack.
4. Show immediate actions before detailed explanations.
5. If information is missing, still provide a provisional solution and ask max 3 follow-up questions.
6. Use only tools from the provided candidate list unless explicitly marked as externalSuggestion.
7. Do not recommend generic agents when a vertical action package is better.
8. Include why not recommended tools only if it prevents wrong user action.
9. Keep the visible summary concise.
10. Put detailed prompts in expandable blocks.

User input:
{{userInput}}

Detected intent:
{{detectedIntent}}

Solution template:
{{solutionTemplate}}

Tool slot recommendations:
{{toolSlotRecommendations}}

Rules:
{{rules}}

Return strict JSON matching the provided schema.
`;
```

---

## 13. Result JSON Schema v0.2

### 13.1 Zod Schema

```ts
import { z } from "zod";

export const toolCardSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  websiteUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  oneLineReason: z.string(),
  purpose: z.string(),
  pricingLabel: z.string().optional(),
  rating: z.number().optional(),
  popularityLabel: z.string().optional(),
  isSponsored: z.boolean().default(false),
  fitScore: z.number().optional()
});

export const actionCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  buttonText: z.string(),
  actionType: z.string(),
  primary: z.boolean().default(false),
  requiredInputs: z.array(z.string()).default([]),
  expectedOutput: z.string(),
  toolSlug: z.string().optional(),
  prompt: z.string().optional()
});

export const solutionResultSchema = z.object({
  userInput: z.string(),
  taskKey: z.string(),
  taskMode: z.string(),
  urgencyLevel: z.string(),
  resultTitle: z.string(),
  oneLineConclusion: z.string(),
  primaryOutcome: z.string(),
  estimatedTime: z.string().optional(),
  estimatedCost: z.string().optional(),
  confidence: z.number().min(0).max(1),
  needMoreInfo: z.boolean().default(false),
  clarificationQuestions: z.array(z.object({
    fieldKey: z.string(),
    question: z.string(),
    required: z.boolean().default(false),
    type: z.string().default("text"),
    options: z.array(z.string()).default([])
  })).max(3).default([]),
  toolStack: z.array(z.object({
    roleKey: z.string(),
    displayName: z.string(),
    purpose: z.string(),
    primaryTool: toolCardSchema,
    backupTool: toolCardSchema.optional(),
    budgetTool: toolCardSchema.optional()
  })).max(3),
  actions: z.array(actionCardSchema).min(1).max(6),
  prompts: z.array(z.object({
    title: z.string(),
    toolName: z.string().optional(),
    prompt: z.string()
  })).default([]),
  checklist: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  notRecommended: z.array(z.object({
    name: z.string(),
    reason: z.string()
  })).default([]),
  hiddenDecisionNotes: z.string().optional(),
  nextBestAction: z.string()
});

export type SolutionResult = z.infer<typeof solutionResultSchema>;
```

---

## 14. API 设计 v0.2

### 14.1 POST /api/search/solution

这是首页搜索主接口。

输入：

```json
{
  "input": "我想解决如何找到我的宠物",
  "context": {
    "language": "zh-CN",
    "budgetLevel": "FREE",
    "skillLevel": "BEGINNER"
  }
}
```

输出：

```json
{
  "id": "generated-solution-id",
  "result": {
    "userInput": "我想解决如何找到我的宠物",
    "taskKey": "find_lost_pet",
    "taskMode": "EMERGENCY_PROBLEM",
    "urgencyLevel": "HIGH",
    "resultTitle": "寻宠行动包",
    "oneLineConclusion": "优先生成寻宠信息、扩大搜索半径并建立线索收集，而不是先找通用 Agent。",
    "primaryOutcome": "快速生成可发布、可传播、可追踪的寻宠行动材料。",
    "toolStack": [],
    "actions": [],
    "nextBestAction": "先上传宠物照片和最后出现地点，生成第一版寻宠启事。"
  }
}
```

### 14.2 POST /api/solution/refine

当用户补充信息后刷新方案。

输入：

```json
{
  "solutionId": "generated-solution-id",
  "answers": {
    "petType": "cat",
    "lostLocation": "小区附近",
    "lostTime": "今天下午",
    "hasPhoto": true
  }
}
```

输出：

```json
{
  "id": "generated-solution-id",
  "result": {}
}
```

### 14.3 POST /api/action/generate

用于执行某个动作，例如生成文案、生成 Prompt、生成 checklist。

输入：

```json
{
  "solutionId": "generated-solution-id",
  "actionId": "generate-pet-poster-copy",
  "inputs": {
    "petType": "cat",
    "lostLocation": "小区附近",
    "contact": "手机号"
  }
}
```

输出：

```json
{
  "actionId": "generate-pet-poster-copy",
  "outputType": "text",
  "content": "寻猫启事……"
}
```

---

## 15. 种子数据 v0.2

### 15.1 seed-tasks.json 新增 find_lost_pet

```json
{
  "key": "find_lost_pet",
  "name": "Find a Lost Pet",
  "slug": "find-lost-pet",
  "category": "life",
  "mode": "EMERGENCY_PROBLEM",
  "description": "Help users create an action package for finding a lost pet.",
  "userIntentExamples": [
    "我想解决如何找到我的宠物",
    "我的猫走丢了怎么办",
    "我的狗不见了怎么找回来"
  ],
  "expectedOutputs": [
    "lost pet poster",
    "search area plan",
    "community post copy",
    "lead collection form",
    "nearby organization contact list"
  ],
  "complexity": "medium",
  "urgencyLevel": "HIGH"
}
```

### 15.2 seed-solution-templates.json 示例

```json
{
  "taskKey": "find_lost_pet",
  "name": "Lost Pet Action Pack",
  "slug": "lost-pet-action-pack",
  "resultTitle": "寻宠行动包",
  "oneLineConclusion": "这是紧急找回型问题，优先建立搜索半径、信息扩散和线索收集。",
  "primaryOutcome": "快速生成可发布、可传播、可追踪的寻宠材料。",
  "recommendedStrategy": "先生成标准寻宠启事，再规划搜索区域，并用表单收集附近线索。",
  "visibleSummary": "马上生成寻宠启事、搜索路线和社群发布文案。",
  "hiddenDecisionNotes": "不要优先推荐通用 Agent。用户需要的是行动材料和扩散渠道。",
  "estimatedTime": "10–20 分钟",
  "estimatedCostMin": 0,
  "estimatedCostMax": 10,
  "requiredInputs": ["宠物照片", "走失地点", "走失时间", "联系方式"]
}
```

### 15.3 seed-solution-actions.json 示例

```json
[
  {
    "solutionSlug": "lost-pet-action-pack",
    "orderIndex": 1,
    "title": "上传宠物照片",
    "description": "上传清晰正面照和特征照，用于生成寻宠海报。",
    "actionType": "UPLOAD_FILE",
    "buttonText": "上传照片",
    "inputRequired": ["pet_photo"],
    "expectedOutput": "宠物照片素材",
    "isPrimary": true
  },
  {
    "solutionSlug": "lost-pet-action-pack",
    "orderIndex": 2,
    "title": "生成寻宠启事",
    "description": "生成可直接发到微信群、小区群和朋友圈的寻宠文案。",
    "actionType": "GENERATE_ASSET",
    "buttonText": "生成启事",
    "toolRole": "poster_generation",
    "inputRequired": ["pet_photo", "lost_location", "lost_time", "contact"],
    "expectedOutput": "寻宠海报与发布文案",
    "isPrimary": true
  },
  {
    "solutionSlug": "lost-pet-action-pack",
    "orderIndex": 3,
    "title": "创建搜索路线",
    "description": "根据最后出现地点规划第一搜索圈和第二搜索圈。",
    "actionType": "OPEN_MAP",
    "buttonText": "规划路线",
    "toolRole": "map_planning",
    "inputRequired": ["lost_location"],
    "expectedOutput": "搜索区域路线"
  },
  {
    "solutionSlug": "lost-pet-action-pack",
    "orderIndex": 4,
    "title": "创建线索收集表",
    "description": "统一收集附近居民提供的时间、地点、照片和联系方式。",
    "actionType": "CREATE_FORM",
    "buttonText": "创建表单",
    "toolRole": "form_builder",
    "inputRequired": ["contact"],
    "expectedOutput": "线索收集表"
  }
]
```

### 15.4 工具角色新增

```text
poster_generation
map_planning
lead_collection
community_distribution
landing_page_builder
presentation_generation
video_generation
video_editing
copywriting
form_builder
payment
automation
competitive_research
```

---

## 16. 首页结果卡片视觉要求

### 16.1 整体风格

建议采用：

```text
深色背景
大搜索框
卡片玻璃质感
轻微霓虹边框
高对比文字
少量紫蓝渐变
```

但不要太炫，不要游戏化，不要像加密货币项目。

### 16.2 卡片布局

主结果卡：

```text
左上：最佳方案 / Recommended
标题：寻宠行动包
副标题：马上生成寻宠启事、搜索路线和线索收集表
标签：紧急 / 免费可做 / 10–20 分钟
按钮：开始执行
次按钮：查看推荐原因
```

工具组合卡：

```text
Logo
工具名
用途一句话
价格
评分
热度
按钮：打开工具 / 使用此工具
```

动作卡：

```text
图标
动作标题
一句话说明
按钮
```

### 16.3 不要出现的问题

不允许主结果区出现：

```text
01 明确场景
02 确定优先动作
03 选择工具组合
04 开始执行
```

这类内容可以作为后台逻辑，但不要作为主 UI。

用户只要看到：

```text
寻宠行动包
推荐工具组合
马上执行
```

---

## 17. 完整验收用例

### 17.1 用例 1：寻找宠物

输入：

```text
我想解决如何找到我的宠物
```

必须输出：

```text
结果标题：寻宠行动包
一句话结论：优先建立搜索半径、信息扩散和线索收集。
推荐工具组合：3 个以内
立即动作：至少 3 个
不推荐：通用 Agent 不能作为首选
```

不允许输出：

```text
SureThing.io
Notis
通用 Agent 列表
30 个工具列表
```

### 17.2 用例 2：PDF 转 PPT

输入：

```text
我要把一份 PDF 变成课程 PPT
```

必须输出：

```text
结果标题：PDF 转课程 PPT 方案
推荐工具组合：Gamma + Canva / 或其他数据库工具
立即动作：上传 PDF、生成大纲、生成 PPT 初稿
```

### 17.3 用例 3：课程销售页

输入：

```text
我要做一个 AI 课程销售页
```

必须输出：

```text
结果标题：课程销售页成交方案
推荐工具组合：文案工具 + 建站工具 + 表单/支付工具
立即动作：生成首屏文案、生成页面结构、生成 FAQ
```

### 17.4 用例 4：广告视频

输入：

```text
我要做一条产品广告视频
```

必须输出：

```text
结果标题：短视频广告生成方案
推荐工具组合：脚本工具 + 视频生成/剪辑工具 + 字幕封面工具
立即动作：生成 Hook、生成分镜、生成视频 Prompt
```

---

## 18. 埋点指标修改

### 18.1 新增事件

```text
search_submitted
solution_preview_displayed
solution_opened
action_clicked
tool_primary_clicked
tool_alternative_expanded
prompt_drawer_opened
prompt_copied
clarification_answered
solution_refined
solution_saved
feedback_submitted
```

### 18.2 MVP 及格线

```text
首页访问 → 搜索提交：>= 15%
搜索提交 → 结果预览展示：>= 90%
结果预览 → 点击主要动作：>= 20%
结果预览 → 点击工具：>= 8%
结果预览 → 打开完整方案：>= 15%
生成结果 → 用户标记有用：>= 60%
```

注意：

```text
v0.2 不再把“用户回答 3–6 个问题”作为核心成功指标。
因为用户不想先填表，用户想先看到结果。
```

---

## 19. Codex 开发任务修改版

### 19.1 Codex 总任务

```text
你是资深全栈工程师。请根据本文档开发一个 Next.js 全栈应用：AI 决策导航。

核心原则：
- 不做普通 AI 工具导航站。
- 首页以自然语言目标输入为中心。
- 用户输入后，先展示“最佳结果方案”，再展示工具组合和立即执行动作。
- 不要把复杂决策流程作为主 UI 展示给用户。
- 工具必须嵌入方案和动作里，不要展示大列表。
- 每个方案最多展示 1 个首选工具 + 1 个备选工具 + 1 个低成本替代。
- MVP 支持 6 个任务：Landing Page、广告视频、PDF 转 PPT、课程销售页、个人品牌主页、寻找走失宠物。
- 推荐逻辑必须先用本地任务模板和工具评分，再让 LLM 生成结果，不允许 LLM 自由推荐。
```

### 19.2 Sprint 1：结果优先核心链路

```text
目标：跑通首页输入 → 内联结果预览 → 完整方案页。

任务：
1. 初始化 Next.js 项目。
2. 创建首页 HeroSearch。
3. 实现 /api/search/solution。
4. 实现任务识别与 taskMode 分类。
5. 实现 SolutionResult schema。
6. 实现 BestSolutionCard。
7. 实现 ToolStackGrid。
8. 实现 ActionGrid。
9. 用 seed 数据跑通 find_lost_pet 示例。
```

### 19.3 Sprint 2：工具推荐质量

```text
目标：结果不是普通 ChatGPT，也不是工具列表。

任务：
1. 实现 SolutionTemplate。
2. 实现 SolutionToolSlot。
3. 实现 Tool Fit Score v0.2。
4. 每个工具槽位只返回 1 个首选工具。
5. 备选工具默认折叠。
6. 添加 notRecommended 逻辑。
7. 添加 “为什么这样推荐” 折叠区。
```

### 19.4 Sprint 3：动作生成

```text
目标：用户能点动作，而不是只看文字。

任务：
1. 实现 action cards。
2. 实现 /api/action/generate。
3. 支持 COPY_PROMPT。
4. 支持 GENERATE_ASSET。
5. 支持 OPEN_TOOL。
6. 支持 UPLOAD_FILE 占位。
7. 支持 SAVE_RESULT。
```

### 19.5 Sprint 4：页面完整度

```text
目标：页面像智能搜索产品，而不是表单系统。

任务：
1. 加 Header。
2. 加 Tabs：全部 / 解决方案 / AI 工具 / Agent / 模板 / 最新。
3. 加右侧 Featured Solutions。
4. 加 Latest Tools。
5. 加工具详情页。
6. 加反馈。
7. 加基础 analytics。
```

---

## 20. 上线前 Checklist v0.2

### 20.1 功能

- [ ] 首页大输入框可用。
- [ ] 输入后结果直接出现在输入框下方。
- [ ] 不需要跳转才能看到第一版结果。
- [ ] 支持 6 个任务识别。
- [ ] `find_lost_pet` 能正确返回“寻宠行动包”。
- [ ] 主结果区不展示复杂决策流程。
- [ ] 每个结果最多展示 3 个工具。
- [ ] 有立即执行动作按钮。
- [ ] 可复制 Prompt。
- [ ] 可点击工具官网。
- [ ] 可保存方案。
- [ ] 可提交反馈。

### 20.2 体验

- [ ] 首页不像普通工具导航。
- [ ] 结果不像 ChatGPT 长文。
- [ ] 工具不是大列表。
- [ ] 用户一眼能看到“最佳方案”。
- [ ] 用户一眼能看到“马上做什么”。
- [ ] “为什么推荐”默认折叠。
- [ ] “备选工具”默认折叠。

### 20.3 数据

- [ ] 至少 6 个 Task。
- [ ] 至少 6 个 SolutionTemplate。
- [ ] 至少 20 个工具。
- [ ] 每个 SolutionTemplate 至少 3 个 Action。
- [ ] 每个 SolutionTemplate 至少 2 个 ToolSlot。
- [ ] 每个工具有 bestFor、notGoodFor、workflowRoles/actionRoles。

### 20.4 安全与可信

- [ ] LLM 只能基于候选工具生成。
- [ ] 不在数据库中的工具必须标记 externalSuggestion。
- [ ] Sponsored 工具必须标记。
- [ ] Sponsored 不能覆盖 fitScore。
- [ ] 用户输入有限流。
- [ ] API key 不暴露。

---

## 21. 最重要的产品判断

v0.2 必须坚持一句话：

```text
用户不是来学习你的决策流程的。
用户是来拿结果的。
```

所以最终体验必须是：

```text
我输入了一个问题，
它马上给了我一个可执行方案，
还告诉我应该用哪几个工具，
并且我现在就能开始做。
```

不要做成：

```text
我输入了一个问题，
它告诉我一堆分析过程，
最后让我自己从一堆工具里选。
```

本产品的正确方向：

```text
问题解决导航 + 工具执行推荐
```

不是：

```text
AI 工具目录
```

---

## 22. 给设计图生成工具的 UI 提示词

如果要用 ChatGPT Image / Midjourney / 即梦生成产品 UI 图，可以使用下面提示词：

```text
设计一个中文 AI 决策导航网站首页，深色现代 SaaS 风格，参考 There’s An AI For That 的布局，但不要做普通工具导航。

页面结构：顶部导航栏，左侧 Logo “AI 决策导航”，中间有导航：发现、方案、工具、排行榜、收藏，右侧有 Pro 按钮、通知、头像。

首屏中央是大标题：别再翻 AI 工具列表了，输入你想解决的问题，直接获得最优行动方案。
副标题：从目标理解、工具组合到立即执行，一次给你最短路径。

中间是一个超大的圆角搜索框，输入内容是：我想解决如何找到我的宠物。搜索框右侧是渐变搜索按钮。
搜索框下面有快捷示例标签：PDF 转 PPT、做广告视频、课程销售页、个人品牌主页、寻找走失宠物。

搜索结果直接出现在输入框下方。不要展示复杂决策流程。主结果卡标题是：寻宠行动包。副标题：马上生成寻宠启事、搜索路线和线索收集表。卡片上有标签：紧急、免费可做、10–20 分钟。主按钮：开始执行。

主结果下方展示三个推荐工具卡：寻宠海报生成器、地图搜索路线工具、线索收集表单工具。每张卡有 logo、用途一句话、价格、评分、热度、按钮。不要展示超过 3 个工具。

再下面展示三个立即执行动作卡：上传宠物照片、生成寻宠启事、创建搜索路线、生成社群发布文案。动作卡要比长文字更醒目。

页面上方保留分类 tabs：全部、解决方案、AI 工具、Agent、模板、最新。
右侧 sidebar 展示 Featured Solutions 和 Latest Tools，两张精选方案卡即可。

视觉要求：深色背景，玻璃拟态卡片，轻微蓝紫渐变描边，高级、克制、清晰，不要游戏风，不要太花，不要密密麻麻。整体像一个智能搜索产品，而不是后台管理系统。

关键要求：用户看到的是“最佳方案 + 推荐工具组合 + 立即执行动作”，不是“决策流程步骤”。
```

---

## 23. v0.2 与 v0.1 的一句话区别

v0.1：

```text
用户输入任务，系统生成工作流。
```

v0.2：

```text
用户输入问题，系统直接给结果方案，并让用户马上执行。
```

