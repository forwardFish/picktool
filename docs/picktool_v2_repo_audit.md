# picktool v2.0 仓库实现度扫描报告

> 扫描对象：`https://github.com/forwardFish/picktool` 的 `main` 分支  
> 对照文档：`AI_Task_Workflow_Copilot_MVP_Dev_Doc_v2.0.md`  
> 结论时间：2026-05-07  
> 说明：本报告基于公开 GitHub 主分支静态扫描、仓库内交付报告、用户上传的 PRD 与 UI 参考图进行判断；我没有在你的本地机器上执行 `pnpm build/test`，因此最终部署前仍建议本地再跑一次验证命令。

---

## 1. 总结结论

当前 GitHub 仓库 **已经基本实现 AI Task Workflow Copilot MVP v2.0 的核心功能**，不是还停留在 v1.2。主流程从“静态工具决策页”升级成了“对话式任务工作流助手”：

```text
首页输入任务
→ 创建 Copilot 会话
→ /copilot 对话式页面
→ 先给基础够用方案
→ 选择升级方向
→ 查看完整执行方案
→ 继续细化脚本/素材/字幕封面/交付检查
→ 保存到 archive
→ 查看 archive 列表与详情
```

从仓库结构看，v2.0 的核心目录和接口已经存在：

```text
app/copilot
app/archive
app/api/copilot
app/api/workflow/generate
app/api/archive
app/api/sessions/[sessionId]/save
app/api/health
components/copilot
components/current-plan
components/full-plan
lib/workflow-generation
lib/archive
lib/copilot
scripts/smoke-test.mjs
tests/*.test.ts
```

仓库内 `docs/21-v2-full-delivery-report.md` 声明最终 verdict 为 `PASS`，`docs/23-v2-production-hardening-report.md` 声明最终 verdict 为 `READY FOR DEPLOYMENT`。结合代码结构与报告内容判断：**当前版本可以进入本地生产模式测试与 Vercel 部署准备阶段。**

---

## 2. 按 PRD 核心要求逐项对照

| 模块 | PRD 要求 | 当前仓库状态 | 判断 |
|---|---|---|---|
| 首页任务输入 | `/` 首页，用户输入任务，点击开始规划 | `app/page.tsx` + `components/copilot/CopilotStartForm.tsx` 已实现 | ✅ 已实现 |
| 产品定位 | AI Task Workflow Copilot，不再是静态工具结果页 | 首页标题为 `Get a simple AI workflow for your task.`，流程进入 `/copilot` | ✅ 已实现 |
| 对话式 Copilot 页面 | `/copilot` 对话主区域 | `app/copilot/page.tsx` + `CopilotPageClient` | ✅ 已实现 |
| 左侧当前方案栏 | 当前推荐、状态、可升级方向、暂时不用 | `components/current-plan/CurrentPlanSidebar.tsx` | ✅ 已实现 |
| 当前方案栏可折叠 | desktop 可折叠，移动端应有替代交互 | `CopilotPageClient` 有 sidebarCollapsed 与 mobilePlanOpen | ✅ 已实现 |
| 基础够用方案 | ChatGPT / Claude + 剪映 / CapCut | `lib/workflow-generation/templates.ts` 中毕业设计模板 baseTools 含 ChatGPT/Claude + CapCut | ✅ 已实现 |
| 升级方向 | 更专业 / 更省钱 / 更自动化 / 查看完整方案 | `baseUpgradeOptions` 与 `applyUpgrade` 支持 professional/budget/automated/full_plan | ✅ 已实现 |
| 更专业方案 | 加 Canva | `applyUpgrade(..., professional)` 加 Canva | ✅ 已实现 |
| 更自动化方案 | ChatGPT / Claude + InVideo，Canva 可选 | `applyUpgrade(..., automated)` 对视频模板使用 InVideo + Canva optional | ✅ 已实现 |
| 完整执行方案按需展开 | 用户确认后才生成 full plan | `/api/copilot/generate-full-plan` + `FullPlanAccordion` | ✅ 已实现 |
| 继续细化模块 | 脚本 / 素材清单 / 字幕封面 / 交付检查 | `refinementOptions` 含 script/materials/subtitles_cover/delivery_check | ✅ 已实现 |
| 5 个高频模板 | 毕业设计视频、TikTok、PDF转PPT、Landing Page、竞品分析 | `taskTemplates` 已包含 5 个模板 | ✅ 已实现 |
| 对话状态持久化 | 会话状态持久化 | memory 默认 + Vercel KV adapter | ✅ MVP 实现，生产需配置 KV |
| 存档 archive | 保存、列表、详情、删除 | `/api/archive`、`/api/archive/[id]`、`/archive`、`/archive/[id]` | ✅ 已实现 |
| Vercel 部署准备 | 无 secrets 本地可跑，KV 可选 | docs/22、23、24 已写 env 与部署说明 | ✅ 已实现 |
| 不做图片生成 | docs/pic 仅作为 UI 参考，不是图片生成需求 | 报告与 smoke 均确认无 `/api/image/generate` | ✅ 正确 |

---

## 3. 已实现的关键代码与功能

### 3.1 首页

已实现：

```text
app/page.tsx
components/copilot/CopilotStartForm.tsx
```

功能：

- 展示 v2 首页标题与副标题；
- 默认任务为“我有一个毕业设计，想用 AI 帮我剪辑展示视频。”；
- 点击“开始规划”调用 `POST /api/copilot/start`；
- 成功后跳转 `/copilot?sessionId=...`；
- 示例 chips 包含：毕业设计展示视频、产品宣传视频、PDF 转 PPT、Landing Page、竞品分析报告、短视频脚本。

### 3.2 Copilot 页面

已实现：

```text
app/copilot/page.tsx
components/copilot/CopilotPageClient.tsx
components/copilot/ChatPanel.tsx
components/current-plan/CurrentPlanSidebar.tsx
components/full-plan/FullPlanAccordion.tsx
```

功能：

- 读取 session；
- 展示当前方案栏；
- 支持升级选项；
- 支持对话消息；
- 支持生成完整方案；
- 支持继续细化；
- 支持保存方案；
- 移动端有当前方案弹层状态。

### 3.3 工作流生成引擎

已实现：

```text
lib/workflow-generation/templates.ts
lib/workflow-generation/engine.ts
lib/workflow-generation/provider.ts
lib/workflow-generation/mock-provider.ts
lib/workflow-generation/types.ts
```

核心函数/能力：

```text
matchTaskTemplate(input)
buildBasicPlan(template, input)
applyUpgrade(plan, optionKey)
buildSidebarState(plan)
generateFullExecutionPlan(plan)
refinePlanModule(...)
```

模板覆盖：

```text
1. graduation-project-video
2. tiktok-product-promo-video
3. pdf-to-ppt
4. landing-page
5. competitor-analysis-report
6. fallback general-ai-workflow
```

### 3.4 后端 API

已实现：

```text
GET  /api/health
POST /api/copilot/start
GET  /api/copilot/session
POST /api/copilot/message
POST /api/copilot/option
POST /api/copilot/generate-full-plan
POST /api/copilot/refine
POST /api/workflow/generate
POST /api/sessions/[sessionId]/save
GET  /api/archive
POST /api/archive
GET  /api/archive/[id]
DELETE /api/archive/[id]
```

### 3.5 Archive / session 存储

已实现：

```text
lib/archive/archive-store.ts
lib/archive/memory-store.ts
lib/archive/vercel-kv-store.ts
lib/archive/get-archive-store.ts
lib/copilot/session-storage.ts
lib/copilot/session-store.ts
```

当前支持：

```text
ARCHIVE_STORE=memory      # 本地/测试默认
ARCHIVE_STORE=vercel-kv   # 生产持久化
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

判断：**本地 MVP 可跑，生产持久化需要 Vercel KV / Upstash Redis REST 变量。**

### 3.6 测试与 Smoke

已实现：

```text
tests/api-routes.test.ts
tests/archive-store.test.ts
tests/decision-engine.test.ts
tests/workflow-generation.test.ts
scripts/smoke-test.mjs
```

package.json 中已有脚本：

```bash
pnpm test
pnpm lint
pnpm build
pnpm test:smoke
```

---

## 4. 还差什么？

严格说，**MVP v2.0 核心功能不缺大块功能**。现在主要差的是“上线前生产化细节”和“体验打磨”。

### 4.1 必须补：真实本地运行确认

虽然仓库报告声明：

```text
pnpm test PASS
pnpm lint PASS
pnpm build PASS
pnpm test:smoke PASS
```

但你最好在本地执行一次：

```powershell
cd D:\lyh\agent\agent-frame\picktool
$env:LLM_PROVIDER="mock"
$env:ARCHIVE_STORE="memory"
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm build
pnpm test:smoke
pnpm start
```

然后打开：

```text
http://localhost:3000/
http://localhost:3000/copilot
http://localhost:3000/archive
http://localhost:3000/api/health
```

### 4.2 必须补：Vercel KV 线上验证

现在只做到 adapter 级别和类型/构建验证，还没有真实 KV 线上验证。

生产环境需要配置：

```env
LLM_PROVIDER=mock
ARCHIVE_STORE=vercel-kv
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

部署后打开：

```text
/api/health
```

需要看到：

```json
{
  "archiveStore": "vercel-kv",
  "archivePersistent": true,
  "sessionStore": "vercel-kv",
  "sessionPersistent": true
}
```

### 4.3 必须补：README 仍是 v1.2 定位

当前 GitHub 首页 README 仍然写的是：

```text
AI Tool Decision Assistant
best AI tool setup
how to use the tools
which tools can be skipped
cost advice
```

这已经落后于 v2.0。建议改成：

```text
AI Task Workflow Copilot
Conversational AI workflow assistant
Good-enough plan first
Upgrade only when needed
Archive/save workflow
```

这是一个明显的“对外文档落后”问题，不影响运行，但影响项目识别、后续部署介绍和团队协作。

### 4.4 建议补：真实浏览器 E2E 测试

当前 smoke test 很强，但主要是：

```text
启动 server
fetch 页面 HTML
fetch API
验证字段/文本
```

建议增加 Playwright E2E：

```text
用户打开首页
输入毕业设计任务
点击开始规划
进入 /copilot
点击更专业一点
点击查看完整方案
点击保存方案
进入 /archive
打开详情
```

这能验证真实点击和前端状态，不只是 API 和 HTML。

### 4.5 建议补：中文体验统一

当前代码中有一些英文标签：

```text
Professional plan
More professional
Good enough
View full plan
Archive
Starting your AI workflow copilot
```

你的 UI 图片和 PRD 大部分是中文场景，建议做一次中文化统一：

```text
Professional plan → 更专业方案
More professional → 更专业一点
Good enough → 现在这套就够了
View full plan → 查看完整方案
Archive → 存档
Starting your AI workflow copilot → 正在启动你的工作流助手
```

### 4.6 建议补：UI 像素级还原检查

仓库已有 `docs/20-v2-ui-reference-inventory.md`，说明已经把图片映射到组件。但这不等于 1:1 还原。

建议新增：

```text
docs/30-v2-visual-diff-report.md
```

要求：

```text
1. 对比 docs/pic 原图和 docs/qa-screenshots-v2 实际截图
2. 检查每个页面：布局、间距、卡片、按钮、文字层级、颜色
3. 给出需要修的 UI 差异清单
```

### 4.7 可后置：真实 LLM API 接入

当前是 mock deterministic 输出。MVP 可接受。

后续真实模型接入需要：

```env
LLM_PROVIDER=openai 或 deepseek
OPENAI_API_KEY=...
DEEPSEEK_API_KEY=...
```

但现在不建议马上接。先部署 mock 版验证产品体验。

### 4.8 可后置：用户系统 / 用户隔离

当前没有：

```text
登录
用户隔离
每个用户自己的 archive
权限控制
```

如果公开上线，存档不是完整用户级功能。MVP 可先接受，但一旦有真实用户，就要接：

```text
Auth.js / Clerk / Supabase Auth
UserId 绑定 session/archive
```

---

## 5. 建议下一阶段实施计划

### P0：上线前必须做

```text
1. 本地重新跑完整验证
2. 更新 README 为 v2.0
3. 配置 Vercel KV
4. 部署 Vercel
5. 做线上 smoke test
6. 查看 /api/health 是否 persistent=true
```

### P1：体验打磨

```text
1. 做中文化统一
2. 做视觉还原差异报告
3. 修正首页 / copilot / archive 视觉细节
4. 加 Playwright E2E 测试
```

### P2：产品增强

```text
1. 接真实 LLM provider
2. 增加用户登录
3. Archive 用户隔离
4. 添加 TTL / 清理策略
5. 增加更多任务模板
```

---

## 6. 可直接发给 oh-my-codex 的下一步指令

```text
$ralph "Run final implementation gap audit and deployment readiness cleanup for picktool v2.0.

Repository:
D:\lyh\agent\agent-frame\picktool

Source of truth:
docs/AI_Task_Workflow_Copilot_MVP_Dev_Doc_v2.0.md

Important:
Do not add new product features.
Do not redesign from scratch.
Do not implement image generation.
Do not implement auth or payment.
This task is only final gap audit, README update, local verification, visual-diff preparation, and deployment readiness cleanup.

Tasks:
1. Run pnpm test, pnpm lint, pnpm build, pnpm test:smoke.
2. Compare current implementation against v2.0 PRD and docs/pic.
3. Update README.md from v1.2 AI Tool Decision Assistant wording to v2.0 AI Task Workflow Copilot wording.
4. Scan UI copy for mixed English/Chinese labels and create a list of strings to localize.
5. Compare docs/pic reference images against docs/qa-screenshots-v2 screenshots if available.
6. Create docs/30-v2-final-gap-audit.md.
7. Create docs/31-v2-visual-diff-and-copy-polish-plan.md.
8. Update docs/24-v2-vercel-deployment-checklist.md if needed.

Acceptance criteria:
- tests pass
- lint passes
- build passes
- smoke passes
- README reflects v2.0
- docs/30 exists
- docs/31 exists
- no secrets committed
- no unrelated files deleted

Proceed now. Do not stop after planning."
```

---

## 7. 最终判断

```text
是否实现 v2.0 核心功能：是
是否完全达到可上线 MVP：基本是
是否已经生产级完整产品：还不是
是否还需要大改：不需要
下一步重点：本地验证 + README 更新 + Vercel KV + 部署 smoke + 视觉/文案打磨
```

