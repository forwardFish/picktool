# AI Workflow Finder 产品需求文档 PRD v1.0

> 产品方向：AI 工具决策与工作流生成系统  
> 核心定位：不是 AI 工具导航站，而是帮助用户选择 AI 工具，并把工具组合成可执行工作流。  
> 文档版本：v1.0  
> 适用对象：产品、研发、设计、运营、增长、商业化团队

---

## 0. 一句话总结

用户输入一个想完成的任务，系统自动判断任务类型、推荐最合适的 AI 工具组合，并生成可执行的步骤、Prompt、成本估算、风险提示、质量检查清单和替代方案。

简单说：

> Toolify / There’s An AI For That 帮用户“找到 AI 工具”。  
> AI Workflow Finder 帮用户“用 AI 工具把事情做成”。

---

## 1. 背景与市场判断

### 1.1 当前市场现象

AI 工具数量快速增长，已经出现大量 AI 工具导航网站和工具目录，例如：

- Toolify
- There’s An AI For That
- Futurepedia
- AIChief
- FutureTools
- aitools.fyi
- AIStackHub

这些平台主要解决第一阶段需求：

> 用户想知道“有没有 AI 工具可以做这件事”。

但随着工具数量越来越多，用户面临新的问题：

1. 工具太多，不知道选哪个。
2. 每个工具都说自己很强，但不知道是否适合自己。
3. 用户真正要的是结果，不是工具列表。
4. 一个任务通常不是一个工具完成，而是多个工具组合完成。
5. 用户不知道哪些环节 AI 可以做，哪些环节仍需要人工。
6. 用户不知道工具是否靠谱、是否值得付费、是否存在隐私或订阅陷阱。
7. 用户订阅了很多 AI 工具，但功能重叠、成本上升。

因此，传统 AI 导航站正在出现结构性瓶颈。

---

### 1.2 传统 AI 导航站的问题

传统 AI 导航站通常提供：

- 工具名称
- 工具分类
- 工具描述
- 官网链接
- 价格标签
- 收藏数 / 热度
- 排名 / 榜单

但它们通常缺少：

- 基于任务的决策能力
- 工具之间的组合建议
- 明确推荐理由
- 成本与风险判断
- AI 可替代边界判断
- Prompt 与操作步骤
- 结果质量检查
- 工具可信度评分
- 用户工具栈预算管理

用户最终仍然要自己判断、试错、组合工具。

---

### 1.3 新机会

下一代 AI 工具平台不应该是：

> AI Tool Directory

而应该是：

> AI Tool Decision Engine

也就是：

> 从“发现工具”升级为“选择工具 + 组合工具 + 生成工作流 + 辅助执行 + 检查结果”。

---

## 2. 产品定位

### 2.1 产品名称暂定

英文名称候选：

1. AI Workflow Finder
2. Best AI Workflow
3. AI Task Router
4. Workflow for That
5. AI Stack Advisor
6. Task2AI
7. DonePath AI

中文名称候选：

1. AI 工作流助手
2. AI 任务完成路径
3. AI 工具决策系统
4. AI 最优完成方案
5. AI 工作流导航
6. AI 工具组合助手

推荐主名称：

> AI Workflow Finder

中文副标题：

> 为每个任务找到最优 AI 完成路径。

---

### 2.2 产品一句话定位

用户输入想完成的任务，系统自动生成最优 AI 工具组合、执行步骤、Prompt、成本估算、风险提示和检查清单。

---

### 2.3 产品核心价值

| 用户问题 | 产品提供的价值 |
|---|---|
| 不知道用哪个 AI 工具 | 根据任务、预算、水平推荐 1–3 个最合适工具 |
| 不知道怎么组合工具 | 自动生成完整工具组合和工作流 |
| 不知道怎么开始 | 给出第一步和完整执行步骤 |
| 不知道怎么写 Prompt | 直接生成可复制 Prompt |
| 不知道 AI 能不能完全替代人工 | 标注 AI 可完成环节和人工介入点 |
| 不知道结果好不好 | 提供质量检查清单和结果复盘能力 |
| 不知道工具靠不靠谱 | 提供 Trust Score 和风险提示 |
| 订阅太多 AI 工具 | 提供工具栈预算优化建议 |

---

### 2.4 产品差异化

| 类型 | 传统 AI 导航站 | AI Workflow Finder |
|---|---|---|
| 核心对象 | 工具 | 任务 |
| 用户入口 | 搜索工具 | 输入任务 |
| 输出结果 | 工具列表 | 工作流方案 |
| 推荐方式 | 分类/热度/关键词 | 任务适配度/预算/水平/目标 |
| 是否给步骤 | 通常没有 | 必须有 |
| 是否给 Prompt | 通常没有 | 必须有 |
| 是否给风险提示 | 很少 | 必须有 |
| 是否给工具组合 | 很少 | 核心功能 |
| 商业化 | 广告/收录/排名 | 广告/工作流赞助/Launch/Pro/企业报告 |

---

## 3. 目标用户

### 3.1 普通 AI 新手

#### 用户特征

- 听说 AI 很强，但不知道怎么用。
- 不熟悉各种 AI 工具。
- 不想研究 30 个工具，只想知道哪个最适合自己。

#### 典型问题

- 我要做一个 PPT，用哪个 AI？
- 我要做一条广告视频，用什么工具？
- 我想把 PDF 变成演示稿，怎么做？
- 我想做 Logo，是用 Canva、Looka 还是 LogoAI？

#### 核心需求

> 给我一个最简单、最省钱、最不容易错的做法。

---

### 3.2 独立开发者 / 创业者

#### 用户特征

- 自己开发产品。
- 需要低成本完成大量非核心任务。
- 关注效率、工具组合、增长路径。

#### 典型任务

- Landing Page
- Pitch Deck
- Product Demo Video
- 竞品分析
- 用户研究
- Product Hunt 发布包
- 邮件序列
- 产品说明文档

#### 核心需求

> 我人少、预算少、时间紧，需要用 AI 快速做出能上线/能验证/能发布的东西。

---

### 3.3 小企业老板 / 个体商家

#### 用户特征

- 缺设计、缺文案、缺视频、缺营销能力。
- 不知道找人做要多少钱。
- 想用 AI 省钱，但又怕做出来很差。

#### 典型任务

- 官网
- Logo
- 门店宣传图
- 短视频广告
- 小红书/Instagram 内容
- 客服 FAQ
- 商品图
- 邮件营销

#### 核心需求

> 我想知道这件事最稳、最省钱、最快的完成方法。

---

### 3.4 内容创作者 / 课程老师 / 咨询顾问

#### 用户特征

- 有知识、服务或课程。
- 需要包装自己、制作内容、提高信任度。
- 经常需要做页面、PPT、视频、社媒内容。

#### 典型任务

- 个人品牌主页
- 课程销售页
- 课程 PPT
- 招生视频
- 邮件跟进序列
- LinkedIn 内容
- 短视频脚本

#### 核心需求

> 我想把自己的知识和服务包装得更专业，但不想花很多钱找团队。

---

### 3.5 企业用户 / 团队采购人员

#### 用户特征

- 代表团队筛选 AI 工具。
- 关注安全、隐私、价格、协作、集成。
- 不只是个人使用，而是团队落地。

#### 典型任务

- 筛选 AI 客服工具
- 筛选 AI 会议纪要工具
- 筛选 AI 销售工具
- 筛选 AI 知识库工具
- 做 AI 工具采购比较
- 管理团队 AI 工具订阅预算

#### 核心需求

> 我需要知道哪个工具适合团队，风险在哪里，成本是多少，是否值得采购。

---

### 3.6 AI 工具开发者 / SaaS 创始人

#### 用户特征

- 已经开发了一个 AI 工具。
- 需要曝光、注册用户、SEO、Launch 渠道。
- 想知道自己的工具适合哪些场景。

#### 核心需求

> 把我的工具放到高意向任务场景里，让真正需要它的人看到。

---

## 4. 核心产品逻辑

### 4.1 核心链路

```text
用户输入任务
  ↓
系统理解任务类型
  ↓
追问关键条件
  ↓
匹配任务模板
  ↓
推荐工具组合
  ↓
生成执行步骤
  ↓
生成 Prompt
  ↓
提示人工介入点
  ↓
生成质量检查清单
  ↓
用户执行 / 保存 / 导出 / 分享
```

---

### 4.2 产品核心不是工具库，而是任务完成路径库

工具库本身不是护城河。

真正的核心资产是：

> 不同任务的最佳 AI 完成路径。

例如：

- 做 Landing Page 的路径
- 做广告视频的路径
- PDF 转 PPT 的路径
- 做课程销售页的路径
- 做 AI 客服 Bot 的路径
- 做竞品分析的路径

每个任务都应该有：

1. 任务定义
2. 适合用户
3. 输入素材
4. 输出结果
5. 推荐工具组合
6. 执行步骤
7. Prompt 模板
8. 常见错误
9. 人工介入点
10. 质量检查清单

---

## 5. 核心功能模块

---

# 模块一：Task-to-Workflow Finder

## 5.1 功能定位

用户输入想完成的任务，系统生成完整 AI 工作流。

这是 MVP 的核心功能。

---

## 5.2 用户输入

### 输入字段

| 字段 | 类型 | 是否必填 | 说明 |
|---|---|---|---|
| task_description | text | 是 | 用户想完成的任务 |
| user_type | enum | 否 | 新手/创业者/小企业/创作者/企业 |
| budget_level | enum | 否 | 免费/低预算/中等预算/专业预算 |
| skill_level | enum | 否 | 小白/基础/熟练/专业 |
| deadline | enum | 否 | 今天/3天/1周/不限 |
| output_quality | enum | 否 | 快速可用/正式发布/商业投放/团队使用 |
| existing_assets | text | 否 | 用户已有素材：PDF、图片、链接、文案、视频等 |
| target_platform | enum | 否 | 网站/PPT/TikTok/LinkedIn/小红书/邮件等 |
| language | enum | 否 | 输出语言 |

---

## 5.3 AI 追问逻辑

如果用户输入不完整，系统应自动追问 3–6 个关键问题。

### 示例

用户输入：

> 我要做一个广告视频。

系统追问：

1. 你推广的是什么产品或服务？
2. 视频发布在哪个平台？TikTok、Instagram、YouTube Shorts、小红书还是官网？
3. 你有产品图片、官网链接或素材吗？
4. 你希望视频是真人口播、产品展示、动画还是 UGC 风格？
5. 你的预算大概是多少？
6. 你希望多久完成？

---

## 5.4 输出内容

每个工作流结果页必须包含：

1. 任务理解
2. 最推荐路线
3. 三种方案：省钱版 / 平衡版 / 专业版
4. 推荐工具组合
5. 每一步执行流程
6. 每一步需要输入什么
7. 每一步输出什么
8. 可复制 Prompt
9. 人工介入点
10. 风险提示
11. 质量检查清单
12. 常见坑
13. 下一步行动

---

## 5.5 输出结构示例

```json
{
  "task_summary": "用户想为一个在线课程制作销售页",
  "recommended_strategy": "AI 生成页面结构和文案，使用 Framer 或 Webflow 搭建页面，使用 Tally 收集线索，Stripe 或 Lemon Squeezy 处理支付。",
  "routes": [
    {
      "name": "省钱版",
      "cost": "$0-$30",
      "time": "半天到1天",
      "suitable_for": "快速验证课程需求",
      "tools": ["ChatGPT", "Canva", "Carrd", "Tally"],
      "risk": "页面视觉可能较普通，转化率不稳定"
    },
    {
      "name": "平衡版",
      "cost": "$30-$150",
      "time": "1-2天",
      "suitable_for": "正式发布课程销售页",
      "tools": ["Claude", "Framer", "Canva", "Tally", "Stripe"],
      "risk": "需要人工检查定价和承诺表达"
    },
    {
      "name": "专业版",
      "cost": "$150+",
      "time": "2-5天",
      "suitable_for": "高客单课程或广告投放",
      "tools": ["Claude", "Webflow", "Figma", "ConvertKit", "Stripe"],
      "risk": "建议人工参与转化文案和视觉优化"
    }
  ],
  "workflow_steps": [],
  "prompts": [],
  "human_review_points": [],
  "quality_checklist": []
}
```

---

# 模块二：Tool Decision Assistant

## 5.6 功能定位

帮助用户在多个 AI 工具之间做明确选择。

用户不是想看 30 个工具，而是想知道：

> 我该用哪个？为什么？哪个不适合我？

---

## 5.7 典型输入

- Gamma、Canva、Beautiful.ai 做 PPT 哪个好？
- HeyGen、Synthesia、Vidyard 哪个适合课程老师？
- ChatGPT、Claude、Gemini 哪个适合写长文档？
- Runway、Pika、Sora 哪个适合做产品广告？
- Framer、Webflow、Durable 哪个适合建 Landing Page？

---

## 5.8 输出内容

1. 用户任务理解
2. 工具对比表
3. 每个工具适合什么
4. 每个工具不适合什么
5. 价格与学习成本
6. 最推荐工具
7. 备选工具
8. 是否建议组合使用
9. 明确结论

---

## 5.9 输出示例

```markdown
你的任务是做“课程销售 PPT”，重点是结构清晰、制作速度快、视觉不丑。

推荐结论：
优先使用 Gamma 生成初版结构，再用 Canva 优化视觉。

不建议优先使用 Beautiful.ai，原因是它更适合标准商务演示模板，不如 Gamma 适合从内容快速生成 PPT。

最终推荐：
1. 首选：Gamma
2. 搭配：Canva
3. 备选：Beautiful.ai
```

---

# 模块三：AI Tool Trust Score

## 5.10 功能定位

帮助用户判断某个 AI 工具是否靠谱、是否值得试用、是否适合长期订阅。

这个模块适合第二阶段开发。

---

## 5.11 评分维度

| 维度 | 权重 | 说明 |
|---|---:|---|
| 价格透明度 | 15% | 是否清楚展示价格、试用、退款 |
| 隐私政策清晰度 | 15% | 是否有隐私政策，是否说明数据用途 |
| 公司/团队可信度 | 15% | 是否能看到团队、公司、联系方式 |
| 产品维护活跃度 | 15% | 是否近期更新，是否还在运营 |
| 用户评价质量 | 15% | 是否有真实用户反馈 |
| 功能描述可信度 | 10% | 是否夸大宣传 |
| 订阅风险 | 10% | 是否存在诱导订阅、取消困难等风险 |
| 替代工具丰富度 | 5% | 是否有大量同类替代品 |

---

## 5.12 评级规则

| 分数 | 等级 | 解释 |
|---:|---|---|
| 85–100 | A | 推荐长期使用 |
| 70–84 | B | 可以试用，注意部分风险 |
| 55–69 | C | 谨慎使用，不建议年付 |
| 40–54 | D | 不建议长期订阅 |
| 0–39 | Risk | 高风险，谨慎访问或付费 |

---

## 5.13 输出示例

```markdown
Trust Score：72 / 100

结论：可以试用，但不建议直接年付。

原因：
- 价格页面比较清楚。
- 有隐私政策。
- 团队信息较少。
- 用户评价不足。
- 功能描述存在一定夸大。
- 同类替代工具较多。
```

---

# 模块四：AI Stack Budget Manager

## 5.14 功能定位

帮助重度 AI 用户管理自己的 AI 工具订阅，减少重复购买。

适合第三阶段开发。

---

## 5.15 用户输入

用户手动输入已订阅工具：

| 字段 | 说明 |
|---|---|
| tool_name | 工具名称 |
| monthly_cost | 月费用 |
| usage_frequency | 使用频率 |
| main_use | 主要用途 |
| user_satisfaction | 满意度 |
| replaceable | 是否可替代 |

---

## 5.16 输出内容

1. 当前月度总成本
2. 功能重叠分析
3. 必留工具
4. 可暂停工具
5. 可取消工具
6. 替代组合
7. 最省钱工具栈
8. 专业工具栈
9. 下次复查提醒

---

## 5.17 输出示例

```markdown
当前 AI 工具月成本：$150

建议保留：
- ChatGPT：通用任务和代码
- Claude：长文档分析和写作
- Canva：设计和社媒内容

建议暂停观察：
- Perplexity：如果你最近很少做外部研究，可以暂停 1 个月。

建议按需订阅：
- Runway：如果不是每周做视频，建议只在视频项目期间订阅。

预计可节省：$35-$55/月
```

---

# 模块五：Market Signal Analyzer

## 5.18 功能定位

面向创业者、产品经理、内容创作者，帮助分析某个 AI 方向是否值得做。

---

## 5.19 用户输入

- AI 广告视频生成器还有机会吗？
- AI 客服工具是不是太卷了？
- AI 工具导航还有没有机会？
- AI+玄学海外市场怎么样？
- AI 个人品牌视频素材包有没有竞品？

---

## 5.20 输出内容

1. 赛道成熟度
2. 用户需求强度
3. 竞品密度
4. 主要玩家
5. 常见盈利模式
6. 红海部分
7. 空白机会
8. MVP 建议
9. Go / No-Go 判断
10. MRR 粗略路径

---

## 5.21 输出结构

```json
{
  "market": "AI 广告视频生成",
  "maturity": "成熟",
  "competition_level": "高",
  "user_demand": "强",
  "willingness_to_pay": "较强",
  "red_ocean_areas": ["泛视频生成", "通用广告模板"],
  "opportunity_gaps": ["投放前质检", "多版本测试包", "素材复盘"],
  "recommended_angle": "AI 广告素材复盘与测试包生成",
  "mvp_suggestion": "输入产品链接，生成 10 个广告角度和投放检查清单"
}
```

---

## 6. MVP 范围

### 6.1 MVP 核心原则

第一版不要做成“大而全 AI 工具目录”。

必须控制范围：

- 不追求收录 3 万工具
- 不做全网爬虫
- 不做复杂企业采购系统
- 不做浏览器插件
- 不做全自动价格更新
- 不做完整订阅管理

第一版只验证一件事：

> 用户是否愿意输入任务，并接受系统生成的 AI 工具组合和执行工作流。

---

### 6.2 MVP 必做功能

| 优先级 | 功能 | 说明 |
|---|---|---|
| P0 | 首页任务输入 | 用户输入想完成的任务 |
| P0 | 任务澄清问答 | AI 追问关键问题 |
| P0 | 工作流生成 | 输出工具组合、步骤、Prompt、检查清单 |
| P0 | 工具库 | 首批 100–300 个精选工具 |
| P0 | 任务模板库 | 首批 20 个高频任务 |
| P0 | 工作流结果页 | 可复制、保存、分享 |
| P0 | 用户注册登录 | 保存历史工作流 |
| P1 | 工具对比 | 支持 2–3 个工具对比 |
| P1 | Markdown/PDF 导出 | Pro 功能 |
| P1 | 收藏工具 | 用户保存工具 |
| P2 | Trust Score | 第二阶段 |
| P2 | 订阅预算管理 | 第三阶段 |
| P2 | Market Analyzer | 第三阶段 |

---

### 6.3 首批 20 个任务模板

#### 创业 / 商业类

1. 做 Landing Page
2. 做 Logo / 品牌基础包
3. 做 Pitch Deck
4. 做产品 Demo 视频
5. 做竞品分析
6. 做用户研究
7. 做商业计划书

#### 内容 / 营销类

8. 做广告视频
9. 长视频转短视频
10. 做社媒内容包
11. 做 LinkedIn 内容
12. 做邮件营销序列
13. 做 YouTube 缩略图 / 封面

#### 教育 / 知识类

14. PDF 转 PPT
15. 课程讲义转 PPT
16. 做课程销售页
17. 做个人品牌主页

#### 运营 / 自动化类

18. 做客服 FAQ Bot
19. 会议纪要转任务清单
20. AI 工具订阅优化

---

## 7. 页面与信息架构

### 7.1 首页

#### 核心文案

英文：

```text
Find the best AI workflow for any task.
Tell us what you want to do. We'll recommend tools, steps, prompts, and checklists.
```

中文：

```text
为每个任务找到最优 AI 完成路径。
告诉我们你想做什么，我们帮你选择工具、生成步骤、Prompt 和检查清单。
```

#### 首页模块

1. Header
   - Logo
   - Explore Workflows
   - Compare Tools
   - Submit Tool
   - Pricing
   - Login

2. Hero
   - 大输入框
   - 示例任务
   - CTA：Generate Workflow

3. Popular Tasks
   - Build a Landing Page
   - Create an Ad Video
   - Turn PDF into Slides
   - Create a Pitch Deck
   - Build a FAQ Bot
   - Create Social Content

4. How It Works
   - Describe your task
   - Answer a few questions
   - Get your AI workflow
   - Execute with tools and prompts

5. Example Output
   - 工具组合
   - 执行步骤
   - Prompt
   - 成本估算
   - 检查清单

6. For Tool Makers
   - Submit your AI tool
   - Get listed in relevant workflows
   - Sponsor high-intent tasks

7. Newsletter CTA
   - Weekly AI Workflow Report

---

### 7.2 任务输入页

#### 页面元素

- 任务输入框
- 用户类型选择
- 预算选择
- 技能水平选择
- 时间要求选择
- 输出平台选择
- 已有素材上传 / 输入

---

### 7.3 任务澄清页

系统根据任务自动生成问题。

例如任务：

> 做 Landing Page

追问：

1. 你要推广什么产品或服务？
2. 目标用户是谁？
3. 页面目标是收集线索、卖产品、预约咨询还是测试需求？
4. 你有没有现成文案或品牌素材？
5. 你是否会使用 Framer / Webflow / Carrd 这类工具？
6. 你的预算是多少？

---

### 7.4 工作流结果页

页面结构：

1. 任务摘要
2. 推荐结论
3. 三种方案
   - 省钱版
   - 平衡版
   - 专业版
4. 推荐工具组合
5. 执行步骤
6. Prompt 模板
7. 人工介入点
8. 风险提示
9. 质量检查清单
10. 常见错误
11. 下一步行动
12. 保存 / 导出 / 分享 / 复制

---

### 7.5 工具详情页

字段：

- 工具名称
- 官网链接
- 一句话介绍
- 分类
- 适合任务
- 不适合任务
- 价格
- 免费试用
- 优点
- 缺点
- 替代工具
- 推荐使用方式
- 被哪些工作流使用
- Trust Score，后续阶段

---

### 7.6 工具对比页

示例：

> Gamma vs Canva vs Beautiful.ai

对比字段：

| 维度 | 工具 A | 工具 B | 工具 C |
|---|---|---|---|
| 适合任务 |  |  |  |
| 不适合任务 |  |  |  |
| 上手难度 |  |  |  |
| 价格 |  |  |  |
| 输出质量 |  |  |  |
| 推荐人群 |  |  |  |
| 最终建议 |  |  |  |

---

### 7.7 Submit Tool 页面

AI 工具开发者可以提交工具。

字段：

- 工具名称
- 官网
- 一句话介绍
- 详细介绍
- 分类
- 适合任务
- 不适合任务
- 价格
- 免费试用
- Affiliate 信息
- Logo
- 截图
- 联系邮箱

后续可以提供付费 Launch Package。

---

## 8. 数据结构设计

### 8.1 users 表

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT,
  skill_level TEXT,
  preferred_budget TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.2 tools 表

```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website_url TEXT NOT NULL,
  description TEXT,
  categories TEXT[],
  pricing_type TEXT,
  starting_price NUMERIC,
  free_trial BOOLEAN,
  best_for TEXT[],
  not_good_for TEXT[],
  integrations TEXT[],
  privacy_url TEXT,
  company_info TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.3 tasks 表

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  typical_user TEXT[],
  output_type TEXT,
  complexity_level TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.4 workflows 表

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  name TEXT NOT NULL,
  user_type TEXT,
  budget_level TEXT,
  skill_level TEXT,
  quality_level TEXT,
  recommended_strategy TEXT,
  estimated_cost_min NUMERIC,
  estimated_cost_max NUMERIC,
  estimated_time TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.5 workflow_steps 表

```sql
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  step_order INT,
  title TEXT,
  description TEXT,
  recommended_tool_id UUID REFERENCES tools(id),
  input_required TEXT,
  output_expected TEXT,
  prompt_template TEXT,
  human_review_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.6 generated_workflows 表

```sql
CREATE TABLE generated_workflows (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  task_description TEXT,
  user_context JSONB,
  generated_result JSONB,
  saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.7 tool_comparisons 表

```sql
CREATE TABLE tool_comparisons (
  id UUID PRIMARY KEY,
  tools UUID[],
  comparison_context TEXT,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.8 trust_scores 表，第二阶段

```sql
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY,
  tool_id UUID REFERENCES tools(id),
  pricing_transparency_score INT,
  privacy_score INT,
  company_score INT,
  maintenance_score INT,
  review_score INT,
  marketing_claim_score INT,
  total_score INT,
  risk_summary TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 8.9 sponsored_placements 表

```sql
CREATE TABLE sponsored_placements (
  id UUID PRIMARY KEY,
  tool_id UUID REFERENCES tools(id),
  placement_type TEXT,
  task_id UUID REFERENCES tasks(id),
  start_date DATE,
  end_date DATE,
  price NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. AI Prompt 设计

### 9.1 工作流生成 Prompt

```text
你是一个 AI 工具决策专家和工作流顾问。

用户想完成的任务是：
{{task}}

用户类型：
{{user_type}}

预算：
{{budget_level}}

技能水平：
{{skill_level}}

时间要求：
{{deadline}}

已有素材：
{{existing_assets}}

目标平台：
{{target_platform}}

请生成一个可执行的 AI 工作流方案。

必须输出：
1. 任务理解
2. 最推荐完成路线
3. 省钱版、平衡版、专业版三种方案
4. 每种方案的工具组合
5. 每一步的执行步骤
6. 每一步需要的输入和输出
7. 可复制 Prompt
8. 哪些地方需要人工判断
9. 质量检查清单
10. 常见错误
11. 用户现在应该做的第一步

要求：
- 不要一次推荐超过 5 个工具。
- 必须给明确结论。
- 必须说明为什么推荐这些工具。
- 必须说明不推荐哪些常见工具以及原因。
- 不要夸大 AI 能力。
- 高风险领域必须提示人工审核。
- 如果存在赞助工具，必须标记 Sponsored，且不能影响客观推荐结论。
```

---

### 9.2 工具选择 Prompt

```text
你是 AI 工具选型顾问。

用户正在比较以下工具：
{{tools}}

用户任务：
{{task}}

用户预算：
{{budget}}

用户技能水平：
{{skill_level}}

请输出：
1. 每个工具适合什么场景
2. 每个工具不适合什么场景
3. 对该用户的推荐排序
4. 最终只推荐 1 个首选工具和 1 个备选工具
5. 如果建议组合使用，请说明组合方式
6. 给出明确原因
7. 如果某个工具价格高或学习成本高，需要明确提示
```

---

### 9.3 Trust Score Prompt

```text
你是 AI 工具风险评估专家。

请根据以下信息评估工具可信度：

工具名称：{{tool_name}}
官网内容：{{website_content}}
价格页面：{{pricing_content}}
隐私政策：{{privacy_content}}
用户评价：{{reviews}}
公司信息：{{company_info}}

请从以下维度评分：
1. 价格透明度
2. 隐私政策清晰度
3. 公司/团队可信度
4. 产品维护活跃度
5. 用户评价质量
6. 功能描述可信度
7. 订阅风险
8. 替代工具丰富度

输出：
- 每项评分
- 总分
- 风险摘要
- 是否建议试用
- 是否建议年付
- 替代工具建议
```

---

### 9.4 结果质检 Prompt

```text
你是一个任务结果质检专家。

用户完成的任务类型：
{{task_type}}

用户上传的结果：
{{result}}

请根据该任务的质量标准检查：
1. 是否达成目标
2. 是否结构清晰
3. 是否有明显错误
4. 是否有 AI 味过重的问题
5. 是否适合目标平台
6. 是否有风险表达
7. 是否需要人工修改
8. 给出 10 条具体修改建议
```

---

## 10. 推荐算法

### 10.1 Tool Fit Score

```text
Tool Fit Score =
任务匹配度 35%
用户技能匹配度 15%
预算匹配度 15%
输出质量匹配度 15%
工具稳定性 10%
学习成本 5%
集成能力 5%
```

---

### 10.2 Workflow Score

```text
Workflow Score =
完成目标可能性 30%
成本合理性 20%
执行难度 15%
时间效率 15%
输出质量 10%
风险可控性 10%
```

---

### 10.3 Trust Score

```text
Trust Score =
价格透明度 15%
隐私清晰度 15%
团队可信度 15%
维护活跃度 15%
用户评价质量 15%
功能描述可信度 10%
订阅风险 10%
替代工具丰富度 5%
```

---

## 11. 商业模式

### 11.1 总体原则

普通用户前期不应强制付费。

原因：

1. 用户还没有建立信任。
2. 用户只是想找工具或方案。
3. 过早订阅会降低流量增长。
4. 前期最重要的是影响力、数据和工具厂商生态。

推荐商业模式：

> 普通用户免费使用基础功能，工具厂商为曝光、Launch、赞助工作流付费；重度用户和企业用户为深度决策能力付费。

---

### 11.2 收入模式一：免费提交 + 付费 Launch

AI 工具开发者可以免费提交工具。

付费 Launch 包：

| 套餐 | 价格建议 | 内容 |
|---|---:|---|
| Free Listing | $0 | 基础收录，审核后展示 |
| Standard Launch | $49 | 快速审核 + 工具页优化 |
| Featured Launch | $149 | 首页/分类页短期曝光 + newsletter 简短露出 |
| Maximum Exposure | $299–$499 | 工具页 + 工作流匹配 + newsletter + 社媒发布 + 数据报告 |

---

### 11.3 收入模式二：Sponsored Workflow

某个任务工作流中的工具节点可以赞助。

示例：

任务：做广告视频  
节点：视频生成工具  
赞助商：某 AI 视频工具

必须标注：

> Sponsored

但推荐逻辑必须仍以任务适配度为基础，避免损害用户信任。

定价方式：

- 固定月费：$99–$999/月
- CPC：$0.5–$5/click
- CPL：$5–$50/lead
- CPA / Affiliate：按注册或付费分成

---

### 11.4 收入模式三：Newsletter Sponsorship

建立 Weekly AI Workflow Report。

内容包括：

- 本周最佳 AI 工作流
- 新工具推荐
- 工具对比
- AI 工具风险提醒
- 任务案例拆解

广告形式：

- 顶部赞助
- 中间插入
- 单工具推荐
- 专题赞助

早期定价：

- $99–$299/期

有影响力后：

- $500–$3000/期

---

### 11.5 收入模式四：Affiliate 分成

推荐用户使用某些工具后获得佣金。

适合工具类型：

- AI 写作
- AI 视频
- AI 图片
- AI 配音
- AI 建站
- AI 自动化
- AI 搜索
- AI 数据分析

原则：

> 不为佣金推荐不合适的工具。否则平台信任会崩。

---

### 11.6 收入模式五：Pro 用户订阅

不作为第一阶段重点。

适合重度用户。

| 套餐 | 价格 | 功能 |
|---|---:|---|
| Free | $0 | 每天 3 次基础工作流 |
| Pro | $9–$19/月 | 无限工作流、Prompt、导出、保存 |
| Founder | $29–$49/月 | 竞品分析、工具栈预算、市场信号 |
| Team | $99–$299/月 | 团队工具管理、采购建议、白标报告 |

---

### 11.7 收入模式六：企业选型报告

面向企业用户。

提供：

- AI 工具选型报告
- 工具风险评估
- 价格对比
- 替代方案
- 团队预算优化
- 采购建议

定价：

- 单次报告：$99–$499
- 企业深度报告：$1000+
- 团队订阅：$99–$299/月

---

### 11.8 收入模式七：白标版本

给 AI 服务商、培训机构、顾问公司使用。

他们可以把系统嵌入自己网站：

> 输入你想完成什么 → 生成 AI 解决方案 → 留联系方式 → 服务商跟进。

定价：

- Basic White-label：$99/月
- Agency：$299/月
- Enterprise：定制

---

### 11.9 收入模式八：市场数据报告

当平台积累大量任务搜索和工具点击数据后，可以生成行业报告。

报告类型：

- AI 工具趋势报告
- AI 工具类目增长报告
- AI 工具竞品地图
- 用户任务需求趋势
- 工具转化数据报告

定价：

- 月度报告：$49–$199/月
- 专题报告：$299–$999/份
- 数据 API：$500–$5000/月

---

## 12. MRR 预估路径

> 以下为商业假设，不是承诺。实际结果取决于流量、内容影响力、SEO、工具厂商付费意愿、用户留存和执行质量。

---

### 阶段 0：0–3 个月

目标：验证产品价值。

假设：

- 月访问：1000–5000
- newsletter：0–1000
- paid launch：0–3 个/月
- Pro 用户：很少

预计 MRR：

> $0–$500

重点：

- 做出核心工作流生成体验
- 发布 20 个高质量任务页面
- 开始内容和 SEO
- 收集用户反馈

---

### 阶段 1：3–6 个月

目标：小规模影响力。

假设：

- 月访问：10,000–30,000
- newsletter：1000–5000
- paid launch：5–10 个/月
- 平均 launch 价格：$49–$149
- 少量 affiliate

预计 MRR：

> $500–$3,000

---

### 阶段 2：6–12 个月

目标：形成细分品牌。

假设：

- 月访问：50,000–150,000
- newsletter：10,000–30,000
- paid launch：20 个/月
- 平均价格：$149
- workflow sponsor：2–5 个
- Pro 用户：200–500 人

收入示例：

- Paid Launch：20 × $149 = $2,980
- Workflow Sponsor：5 × $500 = $2,500
- Pro：300 × $9 = $2,700
- Affiliate：$1000–$3000

预计 MRR：

> $5,000–$20,000

---

### 阶段 3：12–24 个月

目标：成为 AI Workflow 细分头部。

假设：

- 月访问：300,000–1,000,000
- newsletter：50,000–200,000
- paid launch：50–100 个/月
- sponsor 成熟
- 企业报告开始销售
- Pro 用户增长

收入示例：

- Paid Launch：80 × $199 = $15,920
- Workflow Sponsor：20 × $500 = $10,000
- Newsletter Sponsorship：4 × $2000 = $8,000
- Pro 用户：1000 × $19 = $19,000
- Affiliate：$5,000–$20,000
- 企业报告/API：$5,000–$20,000

预计 MRR：

> $30,000–$100,000

---

## 13. 增长策略

### 13.1 核心增长逻辑

前期不靠收费，而靠：

1. 免费工具
2. SEO
3. 工作流内容
4. Newsletter
5. 工具厂商提交
6. 社交平台传播
7. 高质量对比页

---

### 13.2 SEO 页面类型

#### 任务型页面

- Best AI workflow to create a landing page
- Best AI tools to create ad videos
- How to turn PDF into PPT with AI
- AI workflow for course sales page
- AI workflow for YouTube Shorts
- AI workflow for customer support bot

#### 工具对比页

- Gamma vs Canva vs Beautiful.ai
- HeyGen vs Synthesia vs Vidyard
- Framer vs Webflow vs Durable
- Perplexity vs Genspark vs ChatGPT Search
- Zapier vs Make vs n8n

#### 工具替代页

- Best alternatives to Runway
- Best alternatives to Midjourney
- Best alternatives to Jasper
- Best alternatives to Synthesia

#### 角色工具栈页

- Best AI stack for indie hackers
- Best AI stack for course creators
- Best AI stack for consultants
- Best AI stack for ecommerce sellers
- Best AI stack for marketers

---

### 13.3 内容策略

每周发布：

1. 5 个实用 AI 工作流
2. 1 个工具对比
3. 1 个工具可信度分析
4. 1 个创业机会分析
5. 1 个 AI 工具栈优化案例

内容重点：

> 不是介绍工具，而是介绍“怎么完成任务”。

---

### 13.4 Newsletter 策略

Newsletter 名称建议：

- Weekly AI Workflow Report
- AI Workflow Weekly
- Best AI Workflows

栏目：

1. 本周最佳 AI 工作流
2. 新工具推荐
3. 工具对比
4. AI 工具风险提醒
5. 一个完整案例拆解
6. Sponsor 区域

---

### 13.5 工具厂商增长

提供 Submit Tool。

给工具厂商的卖点：

> 不只是被收录，而是进入相关任务工作流，触达真正有需求的用户。

例如：

- AI 视频工具进入“做广告视频”工作流
- AI PPT 工具进入“PDF 转 PPT”工作流
- AI 客服工具进入“做 FAQ Bot”工作流
- AI 建站工具进入“做 Landing Page”工作流

这比普通导航曝光更有价值。

---

## 14. 后台管理系统

### 14.1 工具管理

管理员可以：

- 添加工具
- 编辑工具
- 设置分类
- 设置适合任务
- 设置不适合任务
- 添加价格
- 添加官网链接
- 设置是否 sponsored
- 设置 affiliate 链接
- 查看点击数据

---

### 14.2 任务模板管理

管理员可以：

- 添加任务
- 编辑任务说明
- 设置任务分类
- 设置默认追问问题
- 设置推荐工具规则
- 设置工作流步骤模板
- 设置质量检查清单

---

### 14.3 Sponsor 管理

管理员可以：

- 添加赞助工具
- 设置赞助任务
- 设置开始和结束时间
- 设置曝光位置
- 查看展示、点击、转化数据

---

### 14.4 内容管理

管理员可以：

- 发布工具对比文章
- 发布工作流文章
- 发布工具可信度分析
- 发布市场趋势报告
- 管理 SEO 页面

---

## 15. 技术方案建议

### 15.1 前端

推荐：

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Markdown 渲染
- 可复制代码块组件
- 工作流结果页组件化

---

### 15.2 后端

推荐：

- Next.js API Routes / Node.js
- PostgreSQL / Supabase
- Prisma ORM
- Redis 缓存
- Stripe 支付
- Resend / Loops 邮件系统

---

### 15.3 AI 架构

#### MVP 阶段

- 主模型：OpenAI / Claude
- RAG：工具库 + 任务模板库 + Prompt 模板库
- 人工维护首批工具和任务模板

#### 后续阶段

- 多模型路由
- 工具信息自动抓取
- 价格变化监控
- 用户行为反馈训练推荐规则

---

### 15.4 数据来源

MVP 不建议一开始爬取全网。

首批人工维护：

- 100–300 个精选 AI 工具
- 20 个任务模板
- 每个任务 3 套工作流
- 每个工具适合/不适合任务

后续再扩展：

- 用户提交
- 工具厂商提交
- 半自动爬取
- 人工审核

---

## 16. 关键指标

### 16.1 用户激活指标

- 首页任务输入率
- 完成任务澄清率
- 成功生成工作流率
- 工作流保存率
- Prompt 复制率
- 推荐工具点击率

---

### 16.2 留存指标

- 7 日再次使用率
- 每用户平均生成工作流数
- 收藏工具数
- 保存工作流数
- newsletter 订阅率

---

### 16.3 商业化指标

- 工具提交数
- 付费 Launch 数
- Sponsored Workflow 数
- Affiliate 点击数
- Pro 转化率
- Newsletter sponsor 收入
- 工具厂商复购率

---

### 16.4 质量指标

- 用户对推荐满意度
- 用户标记“有用”的比例
- 用户重新生成比例
- 用户投诉“不准确”的比例
- 工具推荐点击后停留率
- 工具厂商反馈质量

---

## 17. 主要风险与解决方案

### 17.1 风险一：变成普通导航站

#### 问题

如果产品只是列工具，就会和 Toolify、TAAFT 正面竞争。

#### 解决方案

- 首页只强调任务输入，不强调工具列表。
- 每个结果必须包含工作流。
- 工具必须绑定任务场景。
- 输出必须有步骤、Prompt、检查清单。

---

### 17.2 风险二：推荐不准确

#### 问题

AI 可能胡乱推荐工具。

#### 解决方案

- 首批只支持 20 个任务。
- 每个任务人工整理标准工作流。
- AI 只负责个性化组合，不完全自由发挥。
- 加入用户反馈机制。
- 定期更新工具库。

---

### 17.3 风险三：工具信息过时

#### 问题

AI 工具价格、功能变化很快。

#### 解决方案

- 标注更新时间。
- 支持用户和工具厂商提交更新。
- 不强依赖单一工具。
- 每个任务提供替代工具。

---

### 17.4 风险四：Sponsored 影响信任

#### 问题

如果谁付钱谁排前面，用户会失去信任。

#### 解决方案

- 明确标注 Sponsored。
- Sponsor 不影响客观推荐结论。
- 保留 Trust Score。
- 如果赞助工具不适合任务，不能进入推荐。

---

### 17.5 风险五：用户只用一次

#### 问题

用户完成一个任务后可能离开。

#### 解决方案

- 保存工作流
- 历史任务
- 下一步推荐
- 结果质检
- 工具栈预算管理
- newsletter 持续触达

---

## 18. 开发里程碑

### 第 1 阶段：核心 Demo，2–3 周

目标：跑通任务到工作流体验。

功能：

- 首页
- 任务输入
- AI 追问
- 工作流生成
- 结果页
- Prompt 复制
- 工具推荐

---

### 第 2 阶段：MVP，4–6 周

目标：形成可用产品。

功能：

- 用户登录
- 工作流保存
- 20 个任务模板
- 100 个工具库
- 工具详情页
- 工具对比
- Submit Tool
- Newsletter 收集

---

### 第 3 阶段：商业化，8–12 周

目标：开始工具厂商付费。

功能：

- Paid Launch
- Sponsored Workflow
- Affiliate 链接
- Newsletter sponsor
- 工具厂商后台
- 基础数据统计

---

### 第 4 阶段：高级能力，3–6 个月

目标：增强壁垒。

功能：

- Trust Score
- AI Stack Budget Manager
- Market Signal Analyzer
- 结果质检
- 团队版
- 白标版

---

## 19. 最终产品愿景

第一阶段：

> AI 任务工作流生成器。

第二阶段：

> AI 工具决策系统。

第三阶段：

> AI 工具厂商高意向流量分发平台。

第四阶段：

> AI 工具选型、工作流、预算、风险和市场信号的综合决策平台。

最终形态：

# AI Workflow OS

帮助个人、小团队和企业回答三个问题：

1. 我这个任务该怎么用 AI 完成？
2. 哪些工具最适合我？
3. 怎么用最少的钱和时间做出最好的结果？

---

## 20. 最终建议

这个产品可以做，但不要一开始做大而全。

第一版最重要的是：

> 20 个高频任务 + 100 个精选工具 + 高质量工作流模板 + 免费使用入口。

前期不要强推用户订阅。

前期增长重点：

- SEO
- 免费工具
- Newsletter
- 工作流内容
- 工具厂商提交
- 工具对比页

前期商业化重点：

- Paid Launch
- Sponsored Workflow
- Affiliate
- Newsletter Sponsorship

中后期再加入：

- Pro 用户订阅
- Trust Score
- 工具栈预算管理
- 企业选型报告
- 白标版本

一句话战略：

> 不和 Toolify 拼工具数量，不和 TAAFT 拼搜索规模，而是做“任务到结果”的 AI 工作流决策系统。

