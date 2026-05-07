# AI Task Workflow Copilot｜MVP 开发文档 v2.0

> 版本：v2.0  
> 目标：将原来的「静态 AI 工具决策结果页」升级为「对话式 AI 任务工作流助手」。  
> 核心变化：不再一次性给用户一大页工具组合，而是先给一个**够用方案**，再通过对话逐步引导用户选择「更专业 / 更省钱 / 更自动化 / 查看完整方案」。  
> 产品名称：**AI Task Workflow Copilot**  
> 中文理解：**AI 任务工作流助手 / AI 工具方案助手**  
> MVP 场景示例：用户想用 AI 帮自己完成一个毕业设计展示视频的剪辑。

---

## 0. 本版最终结论

本版本核心不是「工具目录」，不是「静态结果页」，也不是「完整流程一上来全展示」。

本版本只做一个核心体验：

```text
用户输入一个真实任务
↓
AI 先给一个足够完成任务的基础够用方案
↓
左侧“当前方案”自动记录当前推荐、状态、可升级方向、暂时不用工具
↓
用户选择是否升级：更专业 / 更省钱 / 更自动化 / 查看完整方案
↓
AI 根据用户选择逐步带出更多工具和替代方案
↓
用户确认后，才在下方展开完整执行方案
↓
用户可以继续让 AI 生成脚本、素材清单、剪辑步骤、交付检查等更细内容
```

一句话：

```text
先满足当前需求，再逐步带出更好的选择。
```

---

## 1. 产品定位

### 1.1 产品名称

```text
AI Task Workflow Copilot
```

### 1.2 中文名称

```text
AI 任务工作流助手
AI 工具方案助手
AI 工作流 Copilot
```

### 1.3 一句话定位

```text
Tell us what you want to finish. We’ll give you a simple AI-powered plan first, then help you upgrade it only when needed.
```

中文：

```text
告诉我你想完成什么，我先给你一套够用方案；如果你想更好、更快、更省钱，我再逐步推荐其他 AI 工具和替代方案。
```

### 1.4 产品核心心智

用户不是来逛 AI 工具大全的。

用户真正想知道：

```text
我现在要完成这个任务，用什么就够了？
如果想更好，还有什么选择？
哪些工具现在不用碰？
什么时候才需要完整执行方案？
```

所以本产品的核心心智是：

```text
基础够用方案 → 升级方向 → 确认后生成完整方案
```

---

## 2. 与原 v1.2 文档的关键差异

原 v1.2 文档的核心是：

```text
用户输入任务
↓
系统匹配高频任务模板
↓
展示 Best Tool Setup / How to use it / What you can skip / Better options / Cost advice
```

v2.0 改为：

```text
用户输入任务
↓
AI 对话式给出“基础够用方案”
↓
用户按需选择升级方向
↓
当前方案栏实时更新
↓
用户确认后才生成完整执行方案
```

### 2.1 删除 / 弱化的旧逻辑

以下旧逻辑不再作为结果页主逻辑：

```text
Best Tool Setup for This Task
How to use it
What you can skip
Better options if
Cost advice
```

这些内容不是删除，而是被拆到新的对话和状态结构中：

| 旧模块 | v2.0 对应位置 |
|---|---|
| Best Tool Setup | 对话中的“基础够用方案 / 升级方案”卡片 |
| How to use it | 用户点击“查看完整方案”后，下方完整执行方案展示 |
| What you can skip | 当前方案栏里的“暂时不用”模块 |
| Better options if | 对话中的升级选项：更专业 / 更省钱 / 更自动化 |
| Cost advice | “更省钱一点”分支中展示 |

### 2.2 新增核心能力

```text
1. 对话式任务拆解
2. 基础够用方案优先
3. 渐进式升级选项
4. 左侧可折叠“当前方案”栏
5. 下方完整执行方案按需展开
6. 方案状态实时同步
7. 可继续细化生成脚本 / 素材清单 / 剪辑步骤 / 交付检查
```

---

## 3. 产品原则

### 3.1 先给够用方案，不先给复杂方案

错误方式：

```text
一上来给用户 5 个步骤、8 个工具、完整执行流程。
```

正确方式：

```text
你先用 ChatGPT / Claude + 剪映 / CapCut 就够了。
如果想更专业，再加 Canva。
如果想更自动化，再考虑 InVideo。
如果有高级视觉需求，再考虑 Runway / Kling。
```

### 3.2 工具是配角，任务完成是主角

工具推荐必须围绕任务：

```text
不是：这里有很多视频 AI 工具。
而是：你这个毕业设计展示视频，当前最少需要这两个工具。
```

### 3.3 用户不确认，不生成完整执行方案

完整方案默认收起。

只有用户点击：

```text
我想看完整方案
查看完整方案
现在这套就够了
```

系统才生成并展开完整执行方案。

### 3.4 当前方案栏只做“状态”，不做“正文”

当前方案栏不是完整执行方案。

它只显示：

```text
当前推荐是什么
当前是否够用
还能往哪里升级
哪些工具暂时不用
下一步应该点什么
```

### 3.5 对话区负责推进，当前方案栏负责沉淀，完整方案负责交付

| 区域 | 作用 |
|---|---|
| 对话区 | 自然交流、解释方案、提出选择 |
| 当前方案栏 | 记录当前选择、状态、可升级方向 |
| 完整执行方案 | 用户确认后的最终交付内容 |

---

## 4. MVP 范围

### 4.1 MVP 必须做

```text
1. 首页任务输入
2. 对话式 Copilot 页面
3. 左侧可折叠当前方案栏
4. 基础够用方案生成
5. 升级方向选择：更专业 / 更省钱 / 更自动化 / 查看完整方案
6. 当前方案状态更新
7. 完整执行方案按需展开
8. 继续细化模块：脚本 / 素材清单 / 字幕封面 / 导出检查
9. 工具数据结构与工具角色定义
10. 对话状态持久化
```

### 4.2 MVP 不做

```text
工具目录页
排行榜
社区评论
复杂个人账号系统
复杂用户画像
实时工具库爬虫
自动打开第三方工具执行任务
复杂团队协作
付费系统
复杂权限管理
```

### 4.3 MVP 默认验证场景

第一版重点做 5 个高频任务模板：

```text
1. 毕业设计展示视频
2. TikTok 产品宣传视频
3. PDF 转 PPT
4. Landing Page 制作
5. 竞品分析报告
```

其中第一个场景「毕业设计展示视频」必须做到完整流程。

---

## 5. 核心用户流程

### 5.1 主流程

```text
用户进入首页
↓
输入：我有一个毕业设计，想用 AI 帮我剪辑展示视频
↓
进入 Copilot 页面
↓
AI 回复：先给你一个够用方案
↓
展示基础够用方案：ChatGPT / Claude + 剪映 / CapCut
↓
左侧当前方案栏同步显示当前推荐
↓
AI 询问：如果想更好，可以选择不同方向
↓
用户选择：更专业一点 / 更省钱一点 / 更自动化一点 / 我想看完整方案
↓
系统根据选择更新当前方案栏和对话内容
↓
用户点击查看完整方案
↓
下方完整执行方案展开
↓
用户继续选择：帮我生成脚本 / 帮我做素材清单 / 帮我优化字幕与封面 / 导出方案
```

---

## 6. 页面与 UI 设计

## 6.1 Page 1：首页

### 页面目标

让用户快速输入想完成的任务。

### 页面结构

```text
Header
- Logo: AI Task Workflow Copilot
- 右侧：Log in / 保存方案可不展示

Hero
- 主标题
- 副标题
- 大输入框
- CTA 按钮
- 示例任务 Chips
```

### 首页文案

主标题：

```text
Get a simple AI workflow for your task.
```

副标题：

```text
Tell us what you want to finish. We’ll give you a good-enough AI tool setup first, then help you upgrade only if needed.
```

输入框 placeholder：

```text
我有一个毕业设计，想用 AI 帮我剪辑展示视频。
```

按钮：

```text
开始规划
```

示例任务：

```text
毕业设计展示视频
产品宣传视频
PDF 转 PPT
做一个 Landing Page
竞品分析报告
短视频脚本
```

---

## 6.2 Page 2：Copilot 对话页总结构

页面分为三部分：

```text
顶部 Header
左侧：当前方案栏，可展开 / 可折叠
中间：对话主区域
下方：完整执行方案，默认收起
```

### 6.2.1 桌面布局

```text
--------------------------------------------------
| Header                                         |
--------------------------------------------------
| 当前方案栏 | 对话主区域                          |
| 260px     | flex-1                              |
--------------------------------------------------
| 完整执行方案 Accordion                         |
--------------------------------------------------
```

建议尺寸：

```text
页面最大宽度：1440px
当前方案栏展开宽度：260px - 300px
当前方案栏折叠宽度：64px - 76px
对话主区域最小宽度：760px
左右间距：16px - 24px
底部完整方案区域：全宽
```

### 6.2.2 移动端布局

移动端不常驻当前方案栏。

改为：

```text
顶部按钮：当前方案
点击后 Bottom Sheet 弹出当前方案栏
完整执行方案仍在对话下方
```

---

## 7. 左侧“当前方案”栏设计

### 7.1 为什么放左边

右侧更容易像信息结果面板，容易和下方完整执行方案重复。

放左边后，它更像：

```text
当前选择篮子
当前方案状态栏
方案导航栏
```

用户视觉中心仍然在对话区。

### 7.2 栏目名称

不要叫：

```text
任务工作台
```

建议叫：

```text
当前方案
```

原因：用户一看就知道这是自己当前选中的方案状态。

### 7.3 展开状态内容

```text
当前方案
[折叠按钮]

1. 当前推荐
   基础够用方案 / 更专业方案 / 更自动化方案
   当前工具组合

2. 当前状态
   已满足基础需求 / 基础方案已升级 / 更快完成 / 完整方案已生成

3. 可升级方向 / 本次新增 / 可继续细化
   根据不同阶段动态显示

4. 暂时不用
   当前阶段不建议使用的工具

5. 主 CTA
   选择一个优化方向 / 查看完整方案 / 继续优化方案
```

### 7.4 折叠状态内容

折叠宽度：64px - 76px。

显示内容：

```text
顶部：展开按钮
图标 1：当前推荐
图标 2：当前状态
图标 3：升级方向
图标 4：下一步
底部：帮助 / 设置
```

折叠状态可以显示一个 hover 卡片：

```text
当前推荐
更自动化方案
ChatGPT / Claude + InVideo
状态：更快完成
```

### 7.5 当前方案栏状态定义

#### 状态 A：基础够用方案

```text
当前推荐：基础够用方案
工具组合：ChatGPT / Claude + 剪映 / CapCut
当前状态：已满足基础需求
可升级方向：
- 更专业：Canva
- 更省钱：免费版优先
- 更自动化：InVideo
暂时不用：
- Runway / Kling
- HeyGen
- Premiere Pro
CTA：选择一个优化方向
```

#### 状态 B：更专业方案

```text
当前推荐：更专业方案
工具组合：ChatGPT / Claude + 剪映 / CapCut + Canva
当前状态：基础方案已升级
本次新增：Canva，用于封面 / 标题页 / 信息页
还可升级：更高级视觉：Runway / Kling
CTA：查看完整方案
```

#### 状态 C：更自动化方案

```text
当前推荐：更自动化方案
工具组合：ChatGPT / Claude + InVideo
当前状态：更快完成
适合场景：快速出片，少手动剪辑
可选补充：Canva
可回退方案：剪映 / CapCut
CTA：查看完整方案
```

#### 状态 D：完整方案已生成

```text
当前推荐：更专业方案
当前状态：完整方案已生成
已选工具：
- ChatGPT / Claude
- 剪映 / CapCut
- Canva
CTA：继续优化方案
```

#### 状态 E：继续优化

```text
当前推荐：更专业方案
当前状态：完整方案已生成
可继续细化：
- 脚本
- 素材清单
- 字幕与封面
- 交付检查
CTA：选择一个深化方向
```

---

## 8. 对话区设计

### 8.1 对话区原则

```text
短消息推进
少长篇解释
结构化信息用卡片
每轮只给 1 个主要判断
每轮最多 3-4 个选择按钮
```

### 8.2 消息类型

#### 1. UserMessage

用于用户输入和用户选择。

示例：

```text
我有一个毕业设计，想用 AI 帮我剪辑展示视频。
```

#### 2. AssistantMessage

自然语言解释。

示例：

```text
如果你只是想先把视频做出来，我先给你一个够用方案。
```

#### 3. RecommendationCard

用于展示当前推荐方案。

示例：

```text
基础够用方案
ChatGPT / Claude + 剪映 / CapCut
```

#### 4. UpgradeCard

用于展示升级方案。

示例：

```text
升级方案：更专业一点
ChatGPT / Claude + 剪映 / CapCut + Canva
```

#### 5. ToolTile

工具小卡，不展示过多详情。

字段：

```text
工具名
角色
图标
是否可选
```

#### 6. OptionChip

用于用户下一步选择。

示例：

```text
更专业一点
更省钱一点
更自动化一点
我想看完整方案
```

#### 7. FullPlanAccordion

完整方案折叠区。

默认关闭。

---

## 9. 对话流程页面状态

### 9.1 Step 1：先给够用方案

用户输入：

```text
我有一个毕业设计，想用 AI 帮我剪辑展示视频。
```

AI 回复：

```text
如果你只是想先把视频做出来，我先给你一个够用方案。
```

展示卡片：

```text
基础够用方案
ChatGPT / Claude + 剪映 / CapCut

ChatGPT / Claude：整理脚本与讲解逻辑
剪映 / CapCut：剪辑、字幕、导出
```

继续追问：

```text
如果你希望更好一点，我还可以继续给你不同方向：
```

选项：

```text
更专业一点
更省钱一点
更自动化一点
我想看完整方案
```

当前方案栏：状态 A。

完整方案区：收起。

---

### 9.2 Step 2：更专业一点

用户点击：

```text
更专业一点
```

AI 回复：

```text
如果你想让展示视频更专业一点，建议在基础方案上加一个 Canva。
```

展示卡片：

```text
升级方案：更专业一点
ChatGPT / Claude + 剪映 / CapCut + Canva

Canva 适合做封面、标题页、信息页，让展示更整洁、更像正式作品。
```

工具：

```text
ChatGPT / Claude：脚本与结构
剪映 / CapCut：剪辑、字幕、导出
Canva：封面、标题页、信息页
```

选项：

```text
看更高级方案
现在这套就够了
查看完整方案
```

当前方案栏：状态 B。

完整方案区：仍然收起，但显示“当前方案已可生成完整执行方案”。

---

### 9.3 Step 3：更自动化一点

用户点击：

```text
更自动化一点
```

AI 回复：

```text
如果你希望更快出片、少手动剪辑，可以考虑更自动化的组合。
```

展示卡片：

```text
自动化方案
ChatGPT / Claude + InVideo
Canva 可选

InVideo 更适合模板化成片、快速生成展示视频；控制感不如剪映，但更省时间。
```

工具：

```text
ChatGPT / Claude：生成脚本与提纲
InVideo：快速成片与模板化视频
Canva：封面与视觉补充，可选
```

补充提示：

```text
如果你更在意可控性，还是推荐剪映 / CapCut。
```

选项：

```text
对比基础方案
现在这套就够了
查看完整方案
```

当前方案栏：状态 C。

折叠状态示例：如果用户折叠当前方案栏，只展示图标和一个当前方案 hover 卡。

---

### 9.4 Step 4：查看完整方案

用户点击：

```text
查看完整方案
```

AI 回复：

```text
下面是基于你当前选择生成的精简完整方案。
```

展示当前方案摘要：

```text
当前方案：
ChatGPT / Claude + 剪映 / CapCut + Canva
```

当前方案栏：状态 D。

下方完整方案展开。

完整方案内容：

```text
1. 推荐组合
2. 执行步骤
3. 你会得到
4. 注意事项
```

---

### 9.5 Step 5：继续优化方案

用户点击：

```text
继续优化方案
```

AI 回复：

```text
完整方案已经准备好。你可以继续让我生成更细的内容。
你想先从哪一项开始？
```

操作卡片：

```text
帮我生成脚本
帮我做素材清单
帮我优化字幕与封面
导出方案
```

当前方案栏：状态 E。

下方完整方案显示已完成状态，并提供继续生成入口。

---

## 10. 完整执行方案设计

### 10.1 默认状态：收起

标题：

```text
完整执行方案（按需查看）
```

内容：

```text
点击“我想看完整方案”后，这里会展示详细步骤与输出内容。
```

### 10.2 可生成状态

当用户选择了升级方案后，显示：

```text
当前方案已可生成完整执行方案。
点击“查看完整方案”后，这里会展示详细步骤与输出内容。
```

### 10.3 展开状态

标题：

```text
完整执行方案
```

模块 1：推荐组合

```text
ChatGPT / Claude：脚本与内容策划
剪映 / CapCut：视频剪辑与导出
Canva：封面与信息页设计
```

模块 2：执行步骤

```text
1. 整理脚本
   用 ChatGPT / Claude 梳理脚本与结构。

2. 剪辑成片
   用 剪映 / CapCut 完成剪辑、字幕、配乐和导出。

3. 做封面与信息页
   用 Canva 设计封面、标题页、信息页。
```

模块 3：你会得到

```text
视频脚本
素材清单
剪辑步骤
交付检查清单
```

模块 4：注意事项

```text
不用一开始上复杂 AI 视频工具。
已有素材时不必先用 Runway / Kling。
不需要数字人口播时，不必用 HeyGen。
不熟悉专业剪辑软件时，不建议先用 Premiere Pro。
```

操作按钮：

```text
帮我生成脚本
帮我列素材清单
继续优化方案
```

### 10.4 完成状态

当用户进入继续优化阶段，完整方案区显示：

```text
完整执行方案 已完成

目标已明确，执行路径已规划完成。你可以继续深化任一模块，生成更详细的内容。
```

模块卡：

```text
视频脚本
素材清单
剪辑步骤
交付检查清单
```

每个模块卡按钮：

```text
继续生成
```

---

## 11. 工具分层策略

### 11.1 第一层：够用工具

默认优先推荐。

特点：

```text
低成本
易上手
能完成任务
学习成本低
```

毕业设计视频示例：

```text
ChatGPT / Claude
剪映 / CapCut
```

### 11.2 第二层：升级工具

用户希望更好时才出现。

特点：

```text
提升质量
提升效率
不是必须
```

示例：

```text
Canva
InVideo
Descript
ElevenLabs
```

### 11.3 第三层：特殊需求工具

只有明确场景才出现。

特点：

```text
专业但不一定必要
成本可能更高
学习成本可能更高
需要特定场景
```

示例：

```text
Runway / Kling
HeyGen
Premiere Pro
After Effects
```

---

## 12. 数据库设计

MVP 可以先用 JSON Seed + LocalStorage / Server Session 实现。  
但为了后续可扩展，建议按数据库思路设计。

推荐技术：

```text
Next.js App Router
TypeScript
Tailwind CSS
Zod
Prisma
PostgreSQL / Supabase
```

### 12.1 核心实体

```text
User
ChatSession
ChatMessage
TaskTemplate
WorkflowPlan
PlanVersion
Tool
ToolSlot
UpgradeOption
SkippedTool
FullExecutionPlan
PlanModule
GeneratedOutput
UserEvent
```

---

## 13. Prisma 数据模型建议

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  ChatSession[]
}

model ChatSession {
  id              String   @id @default(cuid())
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])

  originalInput   String
  taskTemplateId  String?
  currentPlanId   String?
  currentStep     String   @default("base_plan")
  sidebarCollapsed Boolean @default(false)

  status          String   @default("active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  messages        ChatMessage[]
  plans           WorkflowPlan[]
  events          UserEvent[]
}

model ChatMessage {
  id          String   @id @default(cuid())
  sessionId   String
  session     ChatSession @relation(fields: [sessionId], references: [id])

  role        String   // user | assistant | system
  type        String   // text | recommendation_card | option_group | full_plan_notice
  content     Json
  createdAt   DateTime @default(now())
}

model TaskTemplate {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String
  keywords    String[]
  examples    String[]
  language    String   @default("zh")

  basePlanConfig Json
  upgradeOptions UpgradeOption[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model WorkflowPlan {
  id             String   @id @default(cuid())
  sessionId      String
  session        ChatSession @relation(fields: [sessionId], references: [id])

  planType       String   // basic | professional | budget | automated | advanced_visual | full
  title          String
  summary        String
  status         String   // draft | selected | full_generated | completed

  toolCombination Json
  upgradePaths    Json
  skippedTools    Json
  stateSnapshot   Json

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  versions       PlanVersion[]
  fullPlan       FullExecutionPlan?
}

model PlanVersion {
  id          String   @id @default(cuid())
  planId      String
  plan        WorkflowPlan @relation(fields: [planId], references: [id])

  version     Int
  reason      String?
  snapshot    Json
  createdAt   DateTime @default(now())
}

model Tool {
  id             String   @id @default(cuid())
  slug           String   @unique
  name           String
  websiteUrl     String?
  logoUrl        String?
  category       String
  shortDesc      String
  pricingLabel   String?
  learningCurve  String

  bestFor        String[]
  notBestFor     String[]
  useWhen        String[]
  skipWhen       String[]
  alternatives   Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model UpgradeOption {
  id             String   @id @default(cuid())
  taskTemplateId String
  taskTemplate   TaskTemplate @relation(fields: [taskTemplateId], references: [id])

  key            String   // professional | budget | automated | advanced_visual | avatar
  label          String
  description    String
  toolSlugs      String[]
  isDefaultShown Boolean @default(true)
  sortOrder      Int     @default(0)
}

model FullExecutionPlan {
  id          String   @id @default(cuid())
  planId      String   @unique
  plan        WorkflowPlan @relation(fields: [planId], references: [id])

  title       String
  summary     String
  modules     Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PlanModule {
  id          String   @id @default(cuid())
  fullPlanId  String
  title       String
  moduleType  String   // script | material_list | editing_steps | checklist
  content     Json
  status      String   @default("pending")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model GeneratedOutput {
  id          String   @id @default(cuid())
  sessionId   String
  moduleType  String
  title       String
  content     Json
  createdAt   DateTime @default(now())
}

model UserEvent {
  id          String   @id @default(cuid())
  sessionId   String
  session     ChatSession @relation(fields: [sessionId], references: [id])

  eventType   String
  payload     Json
  createdAt   DateTime @default(now())
}
```

---

## 14. TypeScript 类型设计

### 14.1 Tool

```ts
export type Tool = {
  id: string;
  slug: string;
  name: string;
  websiteUrl?: string;
  logoUrl?: string;

  category: string;
  shortDesc: string;
  pricingLabel?: string;
  learningCurve: "Beginner" | "Intermediate" | "Advanced";

  bestFor: string[];
  notBestFor: string[];
  useWhen: string[];
  skipWhen: string[];

  roles: Array<{
    taskType: string;
    roleName: string;
    description: string;
    position: "first" | "middle" | "last" | "optional";
  }>;
};
```

### 14.2 ToolSlot

工具不再是单纯推荐列表，而是方案中的“角色槽位”。

```ts
export type ToolSlot = {
  id: string;
  role: string;
  primaryToolSlugs: string[];
  alternativeToolSlugs?: string[];
  optionalToolSlugs?: string[];
  useIf?: string;
  skipIf?: string;
  note: string;
};
```

### 14.3 WorkflowPlan

```ts
export type WorkflowPlan = {
  id: string;
  planType: "basic" | "professional" | "budget" | "automated" | "advanced_visual" | "full";
  title: string;
  summary: string;
  status: "draft" | "selected" | "full_generated" | "completed";

  toolSlots: ToolSlot[];
  currentCombinationLabel: string;

  upgradePaths: UpgradePath[];
  skippedTools: SkippedTool[];
  nextAction: PlanNextAction;
};
```

### 14.4 UpgradePath

```ts
export type UpgradePath = {
  id: string;
  key: "professional" | "budget" | "automated" | "advanced_visual" | "avatar";
  label: string;
  description: string;
  toolSlugs: string[];
  tradeoff?: string;
  nextActionLabel: string;
};
```

### 14.5 SkippedTool

```ts
export type SkippedTool = {
  toolSlug: string;
  reason: string;
  condition?: string;
};
```

### 14.6 CurrentPlanSidebarState

```ts
export type CurrentPlanSidebarState = {
  collapsed: boolean;
  currentRecommendation: {
    title: string;
    combinationLabel: string;
    toolSlugs: string[];
  };
  currentStatus: {
    label: string;
    description: string;
    tone: "neutral" | "success" | "warning";
  };
  upgradeItems: Array<{
    label: string;
    toolSlug?: string;
    actionKey: string;
  }>;
  skippedTools: SkippedTool[];
  primaryCTA: {
    label: string;
    action: string;
  };
};
```

### 14.7 ChatMessage

```ts
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  type:
    | "text"
    | "recommendation_card"
    | "upgrade_card"
    | "option_group"
    | "full_plan_summary"
    | "module_action_grid";
  content: unknown;
  createdAt: string;
};
```

### 14.8 FullExecutionPlan

```ts
export type FullExecutionPlan = {
  id: string;
  title: string;
  summary: string;
  recommendation: {
    title: string;
    tools: Array<{
      toolSlug: string;
      role: string;
      description: string;
    }>;
  };
  executionSteps: Array<{
    id: string;
    title: string;
    description: string;
    toolSlugs: string[];
  }>;
  outputs: Array<{
    id: string;
    title: string;
    description: string;
    moduleType: "script" | "material_list" | "editing_steps" | "checklist";
  }>;
  cautions: string[];
  actionChips: Array<{
    label: string;
    action: string;
  }>;
};
```

---

## 15. Zod Schema 设计

```ts
import { z } from "zod";

export const toolSlotSchema = z.object({
  id: z.string(),
  role: z.string(),
  primaryToolSlugs: z.array(z.string()).min(1),
  alternativeToolSlugs: z.array(z.string()).optional(),
  optionalToolSlugs: z.array(z.string()).optional(),
  useIf: z.string().optional(),
  skipIf: z.string().optional(),
  note: z.string()
});

export const upgradePathSchema = z.object({
  id: z.string(),
  key: z.enum(["professional", "budget", "automated", "advanced_visual", "avatar"]),
  label: z.string(),
  description: z.string(),
  toolSlugs: z.array(z.string()),
  tradeoff: z.string().optional(),
  nextActionLabel: z.string()
});

export const skippedToolSchema = z.object({
  toolSlug: z.string(),
  reason: z.string(),
  condition: z.string().optional()
});

export const workflowPlanSchema = z.object({
  id: z.string(),
  planType: z.enum(["basic", "professional", "budget", "automated", "advanced_visual", "full"]),
  title: z.string(),
  summary: z.string(),
  status: z.enum(["draft", "selected", "full_generated", "completed"]),
  toolSlots: z.array(toolSlotSchema),
  currentCombinationLabel: z.string(),
  upgradePaths: z.array(upgradePathSchema),
  skippedTools: z.array(skippedToolSchema),
  nextAction: z.object({
    label: z.string(),
    action: z.string()
  })
});

export const currentPlanSidebarStateSchema = z.object({
  collapsed: z.boolean(),
  currentRecommendation: z.object({
    title: z.string(),
    combinationLabel: z.string(),
    toolSlugs: z.array(z.string())
  }),
  currentStatus: z.object({
    label: z.string(),
    description: z.string(),
    tone: z.enum(["neutral", "success", "warning"])
  }),
  upgradeItems: z.array(z.object({
    label: z.string(),
    toolSlug: z.string().optional(),
    actionKey: z.string()
  })),
  skippedTools: z.array(skippedToolSchema),
  primaryCTA: z.object({
    label: z.string(),
    action: z.string()
  })
});

export const fullExecutionPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  recommendation: z.object({
    title: z.string(),
    tools: z.array(z.object({
      toolSlug: z.string(),
      role: z.string(),
      description: z.string()
    }))
  }),
  executionSteps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    toolSlugs: z.array(z.string())
  })),
  outputs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    moduleType: z.enum(["script", "material_list", "editing_steps", "checklist"])
  })),
  cautions: z.array(z.string()),
  actionChips: z.array(z.object({
    label: z.string(),
    action: z.string()
  }))
});
```

---

## 16. API 设计

### 16.1 创建会话

```http
POST /api/copilot/start
```

Request:

```json
{
  "input": "我有一个毕业设计，想用 AI 帮我剪辑展示视频。"
}
```

Response:

```json
{
  "sessionId": "sess_123",
  "matchedTemplateSlug": "graduation-project-video",
  "messages": [],
  "currentPlan": {},
  "sidebarState": {},
  "fullPlanState": "collapsed"
}
```

### 16.2 用户发送消息

```http
POST /api/copilot/message
```

Request:

```json
{
  "sessionId": "sess_123",
  "message": "更专业一点"
}
```

Response:

```json
{
  "messagesToAppend": [],
  "currentPlan": {},
  "sidebarState": {},
  "fullPlanState": "collapsed"
}
```

### 16.3 点击选项

```http
POST /api/copilot/option
```

Request:

```json
{
  "sessionId": "sess_123",
  "optionKey": "professional"
}
```

Response:

```json
{
  "messagesToAppend": [],
  "currentPlan": {},
  "sidebarState": {},
  "fullPlanState": "ready"
}
```

### 16.4 生成完整方案

```http
POST /api/copilot/generate-full-plan
```

Request:

```json
{
  "sessionId": "sess_123"
}
```

Response:

```json
{
  "fullPlan": {},
  "sidebarState": {},
  "fullPlanState": "expanded"
}
```

### 16.5 继续细化模块

```http
POST /api/copilot/refine
```

Request:

```json
{
  "sessionId": "sess_123",
  "moduleType": "script"
}
```

Response:

```json
{
  "messagesToAppend": [],
  "generatedOutput": {}
}
```

### 16.6 保存方案

```http
POST /api/sessions/:sessionId/save
```

---

## 17. 决策引擎设计

### 17.1 引擎职责

```text
1. 识别用户任务
2. 匹配 TaskTemplate
3. 生成基础够用方案
4. 根据用户选择切换 planType
5. 更新当前方案栏状态
6. 决定是否展开完整方案
7. 生成完整方案内容
8. 支持继续细化模块
```

### 17.2 核心函数

```ts
matchTaskTemplate(input: string): TaskTemplate
buildBasicPlan(template: TaskTemplate): WorkflowPlan
applyUpgrade(plan: WorkflowPlan, optionKey: string): WorkflowPlan
buildSidebarState(plan: WorkflowPlan, collapsed: boolean): CurrentPlanSidebarState
generateFullExecutionPlan(plan: WorkflowPlan): FullExecutionPlan
refinePlanModule(fullPlan: FullExecutionPlan, moduleType: string): GeneratedOutput
```

### 17.3 LLM 使用边界

MVP 不要完全依赖 LLM 自由发挥。

推荐：

```text
模板负责结构
LLM 负责自然语言表达和详细内容生成
Zod 负责校验
失败时回退到模板文案
```

### 17.4 LLM 输出必须 JSON 化

生成完整方案时要求 LLM 输出符合 `fullExecutionPlanSchema` 的 JSON。

---

## 18. Prompt 设计

### 18.1 基础方案 Prompt

```text
你是 AI Task Workflow Copilot。
用户给出一个想完成的任务。
你的目标不是推荐很多工具，而是先给一个足够完成任务的基础方案。

请返回：
1. 一个简短判断
2. 一个基础够用工具组合
3. 每个工具在这个任务里的角色
4. 3-4 个升级方向选项

规则：
- 不要一次性给完整执行方案。
- 不要列很多工具。
- 不要像工具目录。
- 先给能完成任务的最小方案。
```

### 18.2 升级方案 Prompt

```text
用户选择了一个升级方向：{optionKey}。
请基于当前基础方案，生成一个升级方案。

要求：
1. 说明为什么升级
2. 明确新增工具
3. 说明新增工具的角色
4. 说明这个升级的代价或取舍
5. 给出下一步选择：查看完整方案 / 继续升级 / 当前就够了
```

### 18.3 完整方案 Prompt

```text
用户已经确认当前方案，请生成完整执行方案。

当前方案：{plan}
用户任务：{task}

请生成 JSON：
- recommendation
- executionSteps
- outputs
- cautions
- actionChips

规则：
- 内容精简，不要长篇大论。
- 每个步骤要可执行。
- 必须包含“不需要一开始使用的复杂工具”。
- 输出必须适合前端卡片展示。
```

### 18.4 继续细化 Prompt

```text
用户想继续细化模块：{moduleType}
当前完整方案：{fullPlan}

请生成该模块的详细输出。
要求：
- 直接可用
- 结构清晰
- 不要泛泛而谈
- 适合复制到剪辑或制作流程中使用
```

---

## 19. 默认模板：毕业设计展示视频

### 19.1 TaskTemplate

```ts
export const graduationProjectVideoTemplate = {
  id: "graduation-project-video",
  slug: "graduation-project-video",
  title: "毕业设计展示视频",
  keywords: [
    "毕业设计",
    "毕业论文",
    "展示视频",
    "答辩视频",
    "剪辑",
    "PPT",
    "项目截图",
    "录屏"
  ],
  examples: [
    "我有一个毕业设计，想用 AI 帮我剪辑展示视频。",
    "毕业设计答辩视频怎么做？",
    "我想用 AI 做一个项目展示视频。"
  ],
  basePlan: {
    title: "基础够用方案",
    combinationLabel: "ChatGPT / Claude + 剪映 / CapCut",
    summary: "这套已经能满足大多数毕业设计展示视频。",
    toolSlots: [
      {
        id: "script",
        role: "整理脚本与讲解逻辑",
        primaryToolSlugs: ["chatgpt", "claude"],
        note: "先把毕业设计的结构、亮点、讲解词整理清楚。"
      },
      {
        id: "editing",
        role: "剪辑、字幕、导出",
        primaryToolSlugs: ["capcut", "jianying"],
        note: "用剪映或 CapCut 完成快速剪辑与导出。"
      }
    ]
  },
  upgradeOptions: [
    {
      key: "professional",
      label: "更专业一点",
      description: "加入 Canva，提升封面、标题页、信息页和视觉排版。",
      toolSlugs: ["canva"]
    },
    {
      key: "budget",
      label: "更省钱一点",
      description: "优先使用免费版工具，避免一开始订阅付费视频工具。",
      toolSlugs: ["chatgpt", "claude", "capcut"]
    },
    {
      key: "automated",
      label: "更自动化一点",
      description: "加入 InVideo，适合快速模板化成片，但可控性弱于剪映。",
      toolSlugs: ["invideo"]
    },
    {
      key: "advanced_visual",
      label: "看更高级方案",
      description: "加入 Runway / Kling，仅适合缺画面素材或需要 AI 视觉生成。",
      toolSlugs: ["runway", "kling"]
    }
  ],
  skippedTools: [
    {
      toolSlug: "runway",
      reason: "已有 PPT、截图、录屏时，不必先用 AI 生成画面。"
    },
    {
      toolSlug: "kling",
      reason: "除非缺少视觉素材，否则不需要一开始使用。"
    },
    {
      toolSlug: "heygen",
      reason: "除非要数字人口播，否则毕业设计视频通常不需要。"
    },
    {
      toolSlug: "premiere-pro",
      reason: "专业但学习成本高，不适合快速完成。"
    }
  ]
};
```

---

## 20. 前端组件结构

```text
app/
├── page.tsx
├── copilot/
│   └── page.tsx
├── api/
│   └── copilot/
│       ├── start/route.ts
│       ├── message/route.ts
│       ├── option/route.ts
│       ├── generate-full-plan/route.ts
│       └── refine/route.ts

components/
├── app-shell/
│   ├── AppHeader.tsx
│   ├── MainLayout.tsx
│   └── PageBackground.tsx
├── copilot/
│   ├── CopilotPage.tsx
│   ├── ChatPanel.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── RecommendationCard.tsx
│   ├── UpgradeCard.tsx
│   ├── ToolTile.tsx
│   ├── OptionChipGrid.tsx
│   └── ModuleActionGrid.tsx
├── current-plan/
│   ├── CurrentPlanSidebar.tsx
│   ├── CollapsedPlanRail.tsx
│   ├── CurrentRecommendationCard.tsx
│   ├── CurrentStatusCard.tsx
│   ├── UpgradeDirectionList.tsx
│   ├── SkippedToolList.tsx
│   └── SidebarCTA.tsx
├── full-plan/
│   ├── FullPlanAccordion.tsx
│   ├── FullPlanPlaceholder.tsx
│   ├── FullPlanExpanded.tsx
│   ├── RecommendationModule.tsx
│   ├── ExecutionStepsModule.tsx
│   ├── OutputCardsModule.tsx
│   ├── CautionModule.tsx
│   └── RefinementModuleCards.tsx
```

---

## 21. 状态管理

### 21.1 前端状态

推荐使用：

```text
React useReducer / Zustand
```

核心状态：

```ts
type CopilotUIState = {
  sessionId: string;
  messages: ChatMessage[];
  currentPlan: WorkflowPlan;
  sidebarState: CurrentPlanSidebarState;
  fullPlanState: "collapsed" | "ready" | "expanded" | "completed";
  fullPlan?: FullExecutionPlan;
  isLoading: boolean;
};
```

### 21.2 事件流

```text
START_SESSION
APPEND_MESSAGES
SELECT_OPTION
UPDATE_CURRENT_PLAN
TOGGLE_SIDEBAR
GENERATE_FULL_PLAN
EXPAND_FULL_PLAN
REFINE_MODULE
SAVE_SESSION
```

---

## 22. 关键交互规则

### 22.1 当前方案栏折叠规则

```text
用户点击左侧折叠按钮 → sidebarCollapsed = true
折叠后主对话区域自动变宽
折叠状态只显示图标
鼠标 hover 图标显示当前方案摘要
再次点击展开按钮 → sidebarCollapsed = false
```

### 22.2 完整方案显示规则

```text
fullPlanState = collapsed：默认收起，提示按需查看
fullPlanState = ready：当前方案已可生成完整方案
fullPlanState = expanded：完整方案已生成并展开
fullPlanState = completed：完整方案已完成，可继续细化
```

### 22.3 工具推荐显示规则

```text
基础方案最多展示 2 个核心工具。
升级方案最多展示 3 个工具。
特殊工具默认不出现，只在对应升级方向出现。
暂时不用工具只在当前方案栏弱展示。
```

### 22.4 对话推进规则

```text
每轮最多 1 个主要方案卡。
每轮最多 4 个选择按钮。
不在同一轮同时展示完整方案和多个升级方向。
完整方案只在用户确认后生成。
```

---

## 23. 页面验收标准

### 23.1 首页验收

必须看到：

```text
AI Task Workflow Copilot
Get a simple AI workflow for your task.
任务输入框
开始规划按钮
示例任务 chips
```

不得出现：

```text
工具目录
排行榜
大量工具卡片
复杂功能导航
```

### 23.2 Copilot 页面验收

必须看到：

```text
左侧当前方案栏
当前方案栏可折叠
对话主区域
基础够用方案卡
升级方向按钮
完整执行方案默认收起
```

### 23.3 基础方案验收

输入：

```text
我有一个毕业设计，想用 AI 帮我剪辑展示视频。
```

必须输出：

```text
基础够用方案
ChatGPT / Claude + 剪映 / CapCut
更专业一点
更省钱一点
更自动化一点
我想看完整方案
```

### 23.4 更专业方案验收

点击：

```text
更专业一点
```

必须输出：

```text
ChatGPT / Claude + 剪映 / CapCut + Canva
Canva 用于封面、标题页、信息页
看更高级方案
现在这套就够了
查看完整方案
```

### 23.5 当前方案栏验收

必须能实时显示：

```text
当前推荐
当前状态
可升级方向 / 本次新增 / 可继续细化
暂时不用
主 CTA
```

### 23.6 完整方案验收

只有用户点击查看完整方案后，才展开：

```text
推荐组合
执行步骤
你会得到
注意事项
帮我生成脚本
帮我列素材清单
继续优化方案
```

---

## 24. Codex 开发指令

```text
请将当前 AI Tool Decision Assistant MVP v1.2 重构为 AI Task Workflow Copilot MVP v2.0。

核心方向：
不要再做静态结果页。
改成对话式 AI 任务工作流助手。

必须实现：
1. 首页任务输入。
2. Copilot 对话页。
3. 左侧“当前方案”栏，可展开 / 可折叠。
4. 当前方案栏显示当前推荐、当前状态、可升级方向、暂时不用、下一步 CTA。
5. 对话区先给基础够用方案，不一开始给完整方案。
6. 基础方案默认：ChatGPT / Claude + 剪映 / CapCut。
7. 升级选项：更专业一点 / 更省钱一点 / 更自动化一点 / 我想看完整方案。
8. 点击“更专业一点”后升级为：ChatGPT / Claude + 剪映 / CapCut + Canva。
9. 点击“更自动化一点”后升级为：ChatGPT / Claude + InVideo，Canva 可选。
10. 完整执行方案默认收起。
11. 只有用户点击“查看完整方案”后，才展开完整执行方案。
12. 完整方案包含：推荐组合、执行步骤、你会得到、注意事项。
13. 完整方案生成后，可以继续细化：脚本、素材清单、字幕封面、交付检查。

技术要求：
- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod Schema
- 组件化实现
- 所有状态可以先用前端 mock 数据 + API mock 实现
- 后续可接 Prisma / Supabase

UI 要求：
- 深色现代 SaaS 风格
- 左侧当前方案栏
- 当前方案栏可折叠
- 对话区为主视觉
- 下方完整方案按需展开
- 不要做工具目录
- 不要一上来展示大量工具
- 工具通过对话逐步带出来

默认测试输入：
我有一个毕业设计，想用 AI 帮我剪辑展示视频。
```

---

## 25. 最终定稿

```text
AI Task Workflow Copilot v2.0：

不是 AI 工具导航。
不是静态工具结果页。
不是一上来生成完整流程。

它是一个对话式 AI 工作流助手：
先给用户一个够用方案，
再根据用户选择逐步升级，
左侧当前方案栏实时记录当前选择，
用户确认后才生成完整执行方案，
最后继续细化生成脚本、素材清单、剪辑步骤和交付检查。
```
