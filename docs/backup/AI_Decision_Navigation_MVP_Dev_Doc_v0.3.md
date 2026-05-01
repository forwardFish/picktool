# AI 决策导航｜MVP 开发文档 v0.3

> 可直接交给 Codex / Claude Code / Trae 开发使用。  
> v0.3 基于 v0.2 修改：保留“结果优先”的产品逻辑，但移除低频、特殊、生活应急型样板任务，改为普通用户、商家、创作者、课程卖家、运营人员都会遇到的高频任务。  
> 核心原则：**用户只要结果，不要看复杂决策过程；页面像智能搜索，结果像行动方案；任务必须普通、高频、可复用、可反复使用。**

---

## 0. 本次 v0.3 修改重点

### 0.1 必须改掉的问题

v0.2 的产品方向是对的：

```text
搜索 → 最优结果方案 → 工具组合 → 立即执行动作
```

但是 v0.2 的样板任务有一个明显问题：

```text
样板任务偏特殊、偏低频、偏应急，不适合作为 MVP 的主场景。
```

MVP 第一版要验证的是：

```text
普通人是否愿意用自然语言输入一个常见任务，
然后接受系统直接给出的 AI 完成方案、工具组合和执行动作。
```

所以 v0.3 的核心改动是：

```text
去掉低频生活应急任务。
把“广告视频”作为第一主样板任务。
把首批任务范围收敛到普通人更容易理解、更高频、更适合 AI 工具链完成的创作、营销、办公、销售场景。
```

### 0.2 v0.3 的主样板任务

主样板任务改为：

```text
我要给我的产品做一条广告视频
```

用户输入后，系统不展示复杂决策流程，而是直接给出：

```text
最佳方案：短视频广告生成方案
推荐工具组合：脚本生成工具 + 视频生成/剪辑工具 + 字幕封面工具
立即执行动作：生成广告角度、生成 Hook、生成分镜、生成视频 Prompt、打开视频工具
```

---

## 1. 产品重新定位

### 1.1 产品一句话

用户输入一个想完成的普通任务，系统直接给出一个可执行的“最佳 AI 完成方案”，并推荐最少但最合适的工具组合，让用户立刻开始行动。

英文：

```text
Tell us what you want to create. We return the best action-ready AI solution.
```

中文：

```text
告诉我们你想做什么，我们直接给你最优 AI 完成方案。
```

### 1.2 不是做什么

本产品不是：

1. 不是 AI 工具导航站。
2. 不是 Toolify。
3. 不是 There’s An AI For That 的中文复刻。
4. 不是单纯的工具搜索引擎。
5. 不是让用户自己看 30 个工具后再判断。
6. 不是把 ChatGPT 的长答案包装成网页。
7. 不是把复杂“决策流程”完整摊开给用户看。
8. 不是做低频生活问题大全。
9. 不是做百科问答。
10. 不是做通用应急问题助手。

### 1.3 真正要做什么

本产品要做的是：

```text
用户输入一个普通任务
↓
系统理解用户想要的最终成品
↓
直接生成最优方案包
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
可复制 Prompt
相关方案
```

---

## 2. 与普通 AI 工具导航的核心差异

### 2.1 普通工具导航

```text
用户输入：我要做一条广告视频
系统返回：
- AI 视频工具 A
- AI 视频工具 B
- AI 剪辑工具 C
- AI 文案工具 D
- AI 配音工具 E

用户自己判断哪个能用。
```

### 2.2 本产品

```text
用户输入：我要给我的产品做一条广告视频
系统返回：
- 最佳结果：短视频广告生成方案
- 推荐角度：痛点开场 + 产品解决 + 对比证明 + 行动号召
- 推荐工具组合：脚本工具 + 视频生成/剪辑工具 + 字幕封面工具
- 立即动作：生成 Hook、生成 30 秒脚本、生成分镜、生成视频 Prompt、打开工具
```

### 2.3 产品体验差异

| 对比项 | 普通 AI 工具导航 | AI 决策导航 |
|---|---|---|
| 用户输入 | 关键词 | 自然语言任务 |
| 系统重点 | 匹配工具 | 生成可执行方案 |
| 输出形态 | 工具列表 | 行动方案包 |
| 工具数量 | 很多 | 1–3 个核心工具 |
| 用户负担 | 自己判断 | 直接行动 |
| 页面感觉 | 工具目录 | 智能搜索 + 结果面板 |
| 信任来源 | 工具多 | 推荐明确、动作可执行 |
| 结果重点 | 找到工具 | 做出成品 |

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
任务类型判断
用户成品目标判断
平台/格式判断
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
用户输入任务 → 系统生成结果
```

### 3.5 任务必须普通、高频、可反复使用

MVP 首批任务必须满足以下标准：

| 标准 | 要求 |
|---|---|
| 普通人能理解 | 不需要解释行业背景，用户一看就知道自己可能用得上 |
| 高频或中高频 | 不是一年一次的极低频任务 |
| AI 可明显提效 | AI 能在脚本、文案、设计、结构、视频、PPT 等环节直接产出 |
| 结果可见 | 用户能看到明确成品，例如视频脚本、分镜、PPT、页面、海报、文案 |
| 工具链成熟 | 市面上已有可组合的 AI 工具，便于推荐和点击转化 |
| 可商业化 | 有工具点击、联盟、订阅、模板、服务化交付空间 |

---

## 4. MVP 目标

### 4.1 MVP 验证什么

MVP 第一阶段验证 5 件事：

1. 用户是否愿意用自然语言输入普通任务。
2. 用户是否能接受系统直接给出的“最佳方案”。
3. 用户是否愿意点击推荐工具。
4. 用户是否愿意点击“立即执行”动作。
5. 用户是否觉得“这比自己搜索工具更省时间”。

### 4.2 MVP 不以什么为第一指标

第一版不以工具数量为第一指标。

第一版不以订阅收入为第一指标。

第一版不以复杂工作流数量为第一指标。

第一版不以覆盖所有生活问题为第一指标。

第一版核心指标是：

```text
用户输入后，是否马上感觉：它知道我要做出什么成品，并且能让我马上开始做。
```

---

## 5. MVP 首批任务范围

v0.3 首批任务只做普通、高频、可复用任务。不要加入低频、应急、垂直小众任务。

### 5.1 任务 1：做广告视频，主样板任务

用户输入示例：

```text
我要给我的产品做一条广告视频
我要做一个抖音广告视频
我要做一个 TikTok UGC 广告
我要做一个课程推广短视频
我要做一个服务介绍视频
```

用户看到的结果：

```text
短视频广告生成方案
```

输出：

- 推荐广告角度
- 3 个 Hook 方向
- 30 秒脚本
- 分镜简版
- 配音稿
- 推荐工具组合
- 可复制 Prompt
- 立即执行按钮：生成广告角度 / 生成脚本 / 生成分镜 / 打开视频工具

首选工具槽位：

```text
脚本生成工具
视频生成/剪辑工具
字幕封面工具
```

### 5.2 任务 2：做社媒图文内容

用户输入示例：

```text
我要做一篇小红书图文笔记
我要给产品做一组种草图文
我要做一条朋友圈推广文案
我要做一篇 LinkedIn 帖子
我要做一组 Instagram 轮播图
```

用户看到的结果：

```text
社媒图文发布方案
```

输出：

- 内容角度
- 标题
- 首段文案
- 图文结构
- 图片生成提示词
- 推荐工具组合
- 立即执行按钮：生成标题 / 生成正文 / 生成配图 Prompt / 打开设计工具

首选工具槽位：

```text
文案生成工具
图片/封面设计工具
排版发布工具
```

### 5.3 任务 3：做商品宣传物料

用户输入示例：

```text
我要给一个产品做宣传图
我要做一个商品详情页
我要做一个淘宝/抖店商品卖点页
我要做一个团购产品介绍图
我要做一个线下门店活动海报
```

用户看到的结果：

```text
商品宣传物料生成方案
```

输出：

- 产品卖点提炼
- 目标用户痛点
- 宣传图结构
- 商品详情页模块
- 视觉风格建议
- 推荐工具组合
- 立即执行按钮：生成卖点 / 生成海报文案 / 生成设计 Prompt / 打开设计工具

首选工具槽位：

```text
卖点提炼工具
视觉设计工具
商品图/详情页工具
```

### 5.4 任务 4：PDF 转 PPT

用户输入示例：

```text
我要把一份 PDF 变成课程 PPT
我要把行业报告变成路演 PPT
我要把文档变成培训课件
我要把一份资料变成汇报 PPT
```

用户看到的结果：

```text
PDF 转 PPT 方案
```

输出：

- 推荐转化方式
- PPT 结构
- 每页大纲
- 推荐工具组合
- 可复制 Prompt
- 立即执行按钮：上传 PDF / 生成大纲 / 生成 PPT 初稿 / 打开 PPT 工具

首选工具槽位：

```text
文档理解工具
PPT 生成工具
视觉优化工具
```

### 5.5 任务 5：做 Landing Page

用户输入示例：

```text
我要给我的 AI 课程做一个落地页
我要做一个 SaaS 等待名单页面
我要做一个咨询服务预约页
我要做一个产品介绍页
```

用户看到的结果：

```text
落地页启动方案
```

输出：

- 页面结构
- 首屏标题方向
- CTA
- FAQ
- 推荐工具组合
- 可复制 Prompt
- 立即执行按钮：生成首页文案 / 生成页面结构 / 打开建站工具

首选工具槽位：

```text
文案生成工具
建站工具
表单/支付工具
```

### 5.6 任务 6：做课程销售页

用户输入示例：

```text
我要卖一门 AI 课程，需要一个销售页
我要做一个训练营报名页
我要做一个咨询服务成交页
我要做一个私教课报名页
```

用户看到的结果：

```text
课程销售页成交方案
```

输出：

- 课程定位
- 用户痛点
- 页面模块
- 首屏标题
- 卖点模块
- FAQ
- 推荐工具组合
- 立即执行按钮：生成首屏文案 / 生成卖点模块 / 生成 FAQ / 打开建站工具

首选工具槽位：

```text
销售文案工具
建站工具
表单/支付工具
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
输入你想完成的任务，直接获得最优 AI 完成方案
```

备选中文：

```text
你说目标，AI 给方案
从工具选择到执行动作，一次给你最短路径
```

推荐英文：

```text
Stop browsing AI tools.
Tell us what you want to create. Get the best action-ready solution.
```

### 6.4 搜索框 placeholder

```text
例如：我要给我的产品做一条广告视频
例如：我要做一篇小红书图文笔记
例如：我要把 PDF 变成课程 PPT
例如：我要做一个课程销售页
例如：我要给产品做一个落地页
```

### 6.5 搜索框下方快捷示例

```text
做广告视频
小红书图文
商品宣传图
PDF 转 PPT
课程销售页
Landing Page
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
  - 置信度 / 难度 / 预计时间

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

### 7.3 广告视频展示样例

用户输入：

```text
我要给我的产品做一条广告视频
```

系统主结果：

```text
最佳方案：短视频广告生成方案

建议先生成广告角度和 30 秒脚本，再做分镜和视频 Prompt，最后用视频工具生成或剪辑成片。
```

推荐工具组合：

```text
1. 脚本生成工具
   用途：生成广告角度、Hook、30 秒脚本、口播稿
   价格：免费版可用
   评分：4.8

2. 视频生成/剪辑工具
   用途：根据分镜生成视频片段，或完成剪辑、转场、字幕
   价格：免费版可用 / 付费增强
   评分：4.7

3. 字幕封面工具
   用途：生成封面标题、字幕样式和适合平台的发布版本
   价格：免费版可用
   评分：4.6
```

立即执行动作：

```text
[生成广告角度]
[生成 30 秒脚本]
[生成分镜]
[生成视频 Prompt]
[打开视频工具]
```

不推荐首选：

```text
不建议一开始直接打开视频生成工具，因为没有广告角度、Hook 和分镜时，生成的视频往往不聚焦、不像广告，只像随机素材。
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
    ├── action/generate/route.ts
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
3. 输入自然语言任务。
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
  PRODUCTIVITY_TASK
  SALES_TASK
  UNKNOWN
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
  CREATE_BRIEF
  GENERATE_SCRIPT
  GENERATE_STORYBOARD
  GENERATE_COPY
  GENERATE_VISUAL_PROMPT
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

### 9.6 新增 GeneratedSolution

建议新增 `GeneratedSolution`，不要继续把前端概念叫 Workflow。

```prisma
model GeneratedSolution {
  id                String   @id @default(uuid())
  userId            String?
  taskKey           String?
  taskDescription   String
  detectedTaskMode  TaskMode @default(UNKNOWN)
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
Output Goal Classifier
↓
Platform / Format Detector
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

如果用户输入的是成品导向任务，必须避免把工具推荐变成“通用聊天工具优先”。

例如广告视频任务：

```text
不建议一开始直接打开视频生成工具，因为没有广告角度、Hook 和分镜时，生成的视频往往不聚焦、不像广告，只像随机素材。
```

例如 PDF 转 PPT 任务：

```text
不建议直接把 PDF 全文丢给 PPT 工具自动生成，因为容易出现结构混乱。应先提炼大纲，再生成 PPT。
```

---

## 11. Tool Fit Score v0.3

v0.1 的工具评分可以保留，但要增加“动作适配”“结果适配”“平台适配”。

```ts
type ToolCandidate = {
  id: string;
  name: string;
  slug: string;
  workflowRoles: string[];
  actionRoles?: string[];
  platforms?: string[];
  skillLevel?: string | null;
  outputQuality?: string | null;
  easeOfUseScore: number;
  trustScore: number;
  taskScore?: number;
  roleScore?: number;
  actionScore?: number;
  outcomeScore?: number;
  platformScore?: number;
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
  targetPlatform?: string;
  budgetLevel?: string;
  skillLevel?: string;
  qualityLevel?: string;
};

export function calculateToolFitScoreV3(tool: ToolCandidate, context: RankContext): number {
  const taskMatch = normalize(tool.taskScore ?? 60);
  const roleMatch = normalize(tool.roleScore ?? (tool.workflowRoles.includes(context.roleKey) ? 80 : 40));
  const actionMatch = normalize(tool.actionScore ?? getActionMatch(tool, context.actionType));
  const outcomeMatch = normalize(tool.outcomeScore ?? 70);
  const platformMatch = normalize(tool.platformScore ?? getPlatformMatch(tool, context.targetPlatform));
  const skillMatch = getSkillMatch(tool.skillLevel, context.skillLevel);
  const budgetMatch = getBudgetMatch(tool, context.budgetLevel);
  const qualityMatch = getQualityMatch(tool.outputQuality, context.qualityLevel);
  const trust = normalize(tool.trustScore ?? 70);
  const ease = normalize(tool.easeOfUseScore ?? 70);
  const popularity = normalize(tool.popularityScore ?? 60);

  const score =
    taskMatch * 0.20 +
    roleMatch * 0.18 +
    actionMatch * 0.15 +
    outcomeMatch * 0.14 +
    platformMatch * 0.08 +
    skillMatch * 0.08 +
    budgetMatch * 0.07 +
    qualityMatch * 0.04 +
    trust * 0.03 +
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

function getPlatformMatch(tool: ToolCandidate, targetPlatform?: string): number {
  if (!targetPlatform) return 70;
  if (!tool.platforms?.length) return 65;
  return tool.platforms.includes(targetPlatform) ? 90 : 55;
}
```

---

## 12. AI Prompt 修改

### 12.1 任务识别 Prompt

```ts
export const TASK_INTENT_CLASSIFIER_PROMPT = `
You are the intent classifier for an AI decision navigation product.

The user may input a creator task, business task, sales task, productivity task, or AI tool task.

Classify the input into:
- taskKey: one of known tasks or unknown
- taskMode: AI_TOOL_TASK | BUSINESS_TASK | CREATOR_TASK | PRODUCTIVITY_TASK | SALES_TASK | UNKNOWN
- userDesiredOutcome: what the user actually wants to create or achieve
- targetPlatform: Douyin | TikTok | Xiaohongshu | Instagram | YouTube | LinkedIn | Website | PPT | Other | Unknown
- shouldAskClarification: true only if missing information blocks a useful first result
- clarificationQuestions: max 3 questions

Known task keys:
- create_ad_video
- create_social_post
- product_promo_assets
- pdf_to_slides
- build_landing_page
- course_sales_page
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
Your job is to produce an action-ready solution package for a common creator, business, sales, or productivity task.

User-facing rules:
1. Start with the best result, not the process.
2. Do not expose a long decision chain.
3. Recommend the smallest effective tool stack.
4. Show immediate actions before detailed explanations.
5. If information is missing, still provide a provisional solution and ask max 3 follow-up questions.
6. Use only tools from the provided candidate list unless explicitly marked as externalSuggestion.
7. Do not over-recommend generic chatbots when the task needs a concrete artifact.
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

## 13. Result JSON Schema v0.3

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
  targetPlatform: z.string().optional(),
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

## 14. API 设计 v0.3

### 14.1 POST /api/search/solution

这是首页搜索主接口。

输入：

```json
{
  "input": "我要给我的产品做一条广告视频",
  "context": {
    "language": "zh-CN",
    "budgetLevel": "FREE",
    "skillLevel": "BEGINNER",
    "targetPlatform": "Douyin"
  }
}
```

输出：

```json
{
  "id": "generated-solution-id",
  "result": {
    "userInput": "我要给我的产品做一条广告视频",
    "taskKey": "create_ad_video",
    "taskMode": "CREATOR_TASK",
    "targetPlatform": "Douyin",
    "resultTitle": "短视频广告生成方案",
    "oneLineConclusion": "先确定广告角度和 Hook，再生成脚本、分镜和视频 Prompt，最后进入视频工具完成成片。",
    "primaryOutcome": "快速生成一条可拍摄、可剪辑、可投放的短视频广告方案。",
    "estimatedTime": "20–40 分钟",
    "estimatedCost": "免费版可完成初稿",
    "confidence": 0.92,
    "toolStack": [],
    "actions": [],
    "nextBestAction": "先补充产品名称、目标用户和发布平台，生成第一版广告角度与 30 秒脚本。"
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
    "productName": "AI 学习诊断系统",
    "audience": "初中生家长",
    "platform": "Douyin",
    "videoLength": "30s",
    "style": "口播 + 产品演示"
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

用于执行某个动作，例如生成脚本、生成分镜、生成 Prompt、生成 checklist。

输入：

```json
{
  "solutionId": "generated-solution-id",
  "actionId": "generate-ad-script",
  "inputs": {
    "productName": "AI 学习诊断系统",
    "audience": "初中生家长",
    "platform": "Douyin",
    "videoLength": "30s"
  }
}
```

输出：

```json
{
  "actionId": "generate-ad-script",
  "outputType": "text",
  "content": "30 秒广告脚本……"
}
```

---

## 15. 种子数据 v0.3

### 15.1 seed-tasks.json 示例：create_ad_video

```json
{
  "key": "create_ad_video",
  "name": "Create an Ad Video",
  "slug": "create-ad-video",
  "category": "creator",
  "mode": "CREATOR_TASK",
  "description": "Help users create a short ad video for a product, course, service, or brand.",
  "userIntentExamples": [
    "我要给我的产品做一条广告视频",
    "我要做一个抖音广告视频",
    "我要做一个 TikTok UGC 广告",
    "我要做一个课程推广短视频",
    "我要做一个服务介绍视频"
  ],
  "expectedOutputs": [
    "ad angle",
    "hooks",
    "30-second script",
    "storyboard",
    "video prompt",
    "voiceover script",
    "publishing checklist"
  ],
  "complexity": "medium"
}
```

### 15.2 seed-solution-templates.json 示例：广告视频

```json
{
  "taskKey": "create_ad_video",
  "name": "Short Ad Video Solution Pack",
  "slug": "short-ad-video-solution-pack",
  "resultTitle": "短视频广告生成方案",
  "oneLineConclusion": "先确定广告角度和 Hook，再生成脚本、分镜和视频 Prompt，最后进入视频工具完成成片。",
  "primaryOutcome": "快速生成一条可拍摄、可剪辑、可投放的短视频广告方案。",
  "recommendedStrategy": "先用文案模型生成广告角度与脚本，再用视频工具生成素材或辅助剪辑，最后用字幕封面工具完成发布版本。",
  "visibleSummary": "马上生成广告角度、30 秒脚本、分镜和视频 Prompt。",
  "hiddenDecisionNotes": "不要直接推荐视频生成工具作为第一步。广告视频的关键不是先出画面，而是先确定卖点、Hook 和分镜。",
  "estimatedTime": "20–40 分钟",
  "estimatedCostMin": 0,
  "estimatedCostMax": 30,
  "requiredInputs": ["产品名称", "目标用户", "发布平台", "视频时长", "视频风格"]
}
```

### 15.3 seed-solution-actions.json 示例：广告视频

```json
[
  {
    "solutionSlug": "short-ad-video-solution-pack",
    "orderIndex": 1,
    "title": "生成广告角度",
    "description": "根据产品、用户和平台生成 3 个可选广告切入角度。",
    "actionType": "CREATE_BRIEF",
    "buttonText": "生成角度",
    "toolRole": "ad_strategy",
    "inputRequired": ["product_name", "target_audience", "platform"],
    "expectedOutput": "3 个广告角度",
    "isPrimary": true
  },
  {
    "solutionSlug": "short-ad-video-solution-pack",
    "orderIndex": 2,
    "title": "生成 30 秒脚本",
    "description": "生成适合短视频平台的 Hook、正文、转化 CTA。",
    "actionType": "GENERATE_SCRIPT",
    "buttonText": "生成脚本",
    "toolRole": "video_scriptwriting",
    "inputRequired": ["product_name", "target_audience", "platform", "video_length"],
    "expectedOutput": "30 秒广告脚本",
    "isPrimary": true
  },
  {
    "solutionSlug": "short-ad-video-solution-pack",
    "orderIndex": 3,
    "title": "生成分镜",
    "description": "把脚本拆成 5–8 个镜头，便于拍摄或生成视频。",
    "actionType": "GENERATE_STORYBOARD",
    "buttonText": "生成分镜",
    "toolRole": "storyboard_generation",
    "inputRequired": ["script", "video_style"],
    "expectedOutput": "短视频分镜表"
  },
  {
    "solutionSlug": "short-ad-video-solution-pack",
    "orderIndex": 4,
    "title": "生成视频 Prompt",
    "description": "为视频生成工具生成可复制的镜头提示词。",
    "actionType": "GENERATE_VISUAL_PROMPT",
    "buttonText": "生成 Prompt",
    "toolRole": "video_generation",
    "inputRequired": ["storyboard", "visual_style"],
    "expectedOutput": "视频生成 Prompt"
  },
  {
    "solutionSlug": "short-ad-video-solution-pack",
    "orderIndex": 5,
    "title": "打开视频工具",
    "description": "进入推荐的视频工具，开始生成或剪辑成片。",
    "actionType": "OPEN_TOOL",
    "buttonText": "打开工具",
    "toolRole": "video_editing",
    "inputRequired": ["storyboard", "video_prompt"],
    "expectedOutput": "广告视频初稿"
  }
]
```

### 15.4 工具角色新增

```text
ad_strategy
video_scriptwriting
storyboard_generation
video_generation
video_editing
voiceover
caption_generation
thumbnail_design
social_copywriting
social_image_generation
carousel_design
product_copywriting
product_image_design
landing_page_builder
presentation_generation
content_structuring
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
标题：短视频广告生成方案
副标题：马上生成广告角度、30 秒脚本、分镜和视频 Prompt
标签：高频 / 免费可做 / 20–40 分钟
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
短视频广告生成方案
推荐工具组合
马上执行
```

---

## 17. 完整验收用例

### 17.1 用例 1：广告视频，主验收用例

输入：

```text
我要给我的产品做一条广告视频
```

必须输出：

```text
结果标题：短视频广告生成方案
一句话结论：先确定广告角度和 Hook，再生成脚本、分镜和视频 Prompt。
推荐工具组合：3 个以内
立即动作：至少 3 个，包括生成广告角度、生成脚本、生成分镜
不推荐：不能一上来只推荐视频生成工具，必须先解决广告角度和脚本
```

不允许输出：

```text
通用 Agent 列表
30 个视频工具列表
只有工具名，没有执行动作
只给长篇分析，没有按钮
```

### 17.2 用例 2：社媒图文内容

输入：

```text
我要做一篇小红书图文笔记
```

必须输出：

```text
结果标题：社媒图文发布方案
推荐工具组合：文案工具 + 图片/封面设计工具 + 排版发布工具
立即动作：生成标题、生成正文、生成配图 Prompt、生成发布检查清单
```

### 17.3 用例 3：商品宣传物料

输入：

```text
我要给一个产品做宣传图
```

必须输出：

```text
结果标题：商品宣传物料生成方案
推荐工具组合：卖点提炼工具 + 视觉设计工具 + 商品图/详情页工具
立即动作：生成卖点、生成海报文案、生成设计 Prompt
```

### 17.4 用例 4：PDF 转 PPT

输入：

```text
我要把一份 PDF 变成课程 PPT
```

必须输出：

```text
结果标题：PDF 转课程 PPT 方案
推荐工具组合：文档理解工具 + PPT 生成工具 + 视觉优化工具
立即动作：上传 PDF、生成大纲、生成 PPT 初稿
```

### 17.5 用例 5：课程销售页

输入：

```text
我要做一个 AI 课程销售页
```

必须输出：

```text
结果标题：课程销售页成交方案
推荐工具组合：销售文案工具 + 建站工具 + 表单/支付工具
立即动作：生成首屏文案、生成页面结构、生成 FAQ
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
v0.3 不再把“用户回答 3–6 个问题”作为核心成功指标。
因为用户不想先填表，用户想先看到结果。
```

---

## 19. Codex 开发任务修改版

### 19.1 Codex 总任务

```text
你是资深全栈工程师。请根据本文档开发一个 Next.js 全栈应用：AI 决策导航。

核心原则：
- 不做普通 AI 工具导航站。
- 首页以自然语言任务输入为中心。
- 用户输入后，先展示“最佳结果方案”，再展示工具组合和立即执行动作。
- 不要把复杂决策流程作为主 UI 展示给用户。
- 工具必须嵌入方案和动作里，不要展示大列表。
- 每个方案最多展示 1 个首选工具 + 1 个备选工具 + 1 个低成本替代。
- MVP 支持 6 个普通高频任务：广告视频、社媒图文、商品宣传物料、PDF 转 PPT、Landing Page、课程销售页。
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
9. 用 seed 数据跑通 create_ad_video 示例。
```

### 19.3 Sprint 2：工具推荐质量

```text
目标：结果不是普通 ChatGPT，也不是工具列表。

任务：
1. 实现 SolutionTemplate。
2. 实现 SolutionToolSlot。
3. 实现 Tool Fit Score v0.3。
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
5. 支持 GENERATE_SCRIPT。
6. 支持 GENERATE_STORYBOARD。
7. 支持 GENERATE_VISUAL_PROMPT。
8. 支持 OPEN_TOOL。
9. 支持 UPLOAD_FILE 占位。
10. 支持 SAVE_RESULT。
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

## 20. 上线前 Checklist v0.3

### 20.1 功能

- [ ] 首页大输入框可用。
- [ ] 输入后结果直接出现在输入框下方。
- [ ] 不需要跳转才能看到第一版结果。
- [ ] 支持 6 个普通高频任务识别。
- [ ] `create_ad_video` 能正确返回“短视频广告生成方案”。
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
- [ ] 任务样例都是普通用户、创作者、商家、课程卖家容易理解的场景。

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

v0.3 必须坚持一句话：

```text
用户不是来学习你的决策流程的。
用户是来拿结果、做成品、节省试错时间的。
```

所以最终体验必须是：

```text
我输入了一个普通任务，
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
成品导向的 AI 决策导航 + 工具执行推荐
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

首屏中央是大标题：别再翻 AI 工具列表了，输入你想完成的任务，直接获得最优 AI 完成方案。
副标题：从目标理解、工具组合到立即执行，一次给你最短路径。

中间是一个超大的圆角搜索框，输入内容是：我要给我的产品做一条广告视频。搜索框右侧是渐变搜索按钮。
搜索框下面有快捷示例标签：做广告视频、小红书图文、商品宣传图、PDF 转 PPT、课程销售页、Landing Page。

搜索结果直接出现在输入框下方。不要展示复杂决策流程。主结果卡标题是：短视频广告生成方案。副标题：马上生成广告角度、30 秒脚本、分镜和视频 Prompt。卡片上有标签：高频、免费可做、20–40 分钟。主按钮：开始执行。

主结果下方展示三个推荐工具卡：脚本生成工具、视频生成/剪辑工具、字幕封面工具。每张卡有 logo、用途一句话、价格、评分、热度、按钮。不要展示超过 3 个工具。

再下面展示四个立即执行动作卡：生成广告角度、生成 30 秒脚本、生成分镜、生成视频 Prompt。动作卡要比长文字更醒目。

页面上方保留分类 tabs：全部、解决方案、AI 工具、Agent、模板、最新。
右侧 sidebar 展示 Featured Solutions 和 Latest Tools，两张精选方案卡即可，例如“课程销售页成交方案”“PDF 转 PPT 方案”。

视觉要求：深色背景，玻璃拟态卡片，轻微蓝紫渐变描边，高级、克制、清晰，不要游戏风，不要太花，不要密密麻麻。整体像一个智能搜索产品，而不是后台管理系统。

关键要求：用户看到的是“最佳方案 + 推荐工具组合 + 立即执行动作”，不是“决策流程步骤”。
```

---

## 23. v0.3 与 v0.2 的一句话区别

v0.2：

```text
用户输入问题，系统直接给结果方案，并让用户马上执行。
```

v0.3：

```text
用户输入普通高频任务，系统直接给成品导向方案、工具组合和立即执行动作。
```

