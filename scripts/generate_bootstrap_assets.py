from __future__ import annotations

import json
import textwrap
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def write(rel_path: str, content: str) -> None:
    path = ROOT / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    normalized = textwrap.dedent(content).strip() + "\n"
    path.write_text(normalized, encoding="utf-8")


REQUIREMENTS = [
    ("GOV-001", "实现前必须先建立 requirement index、traceability matrix 和测试矩阵。", "Governance", "Summary / Governance And Traceability"),
    ("GOV-002", "任何 Story 卡都必须包含 requirement_ids、test_case_ids、expected_evidence。", "Governance", "Governance And Traceability"),
    ("GOV-003", "每个 Sprint 都必须有独立 Sprint Acceptance Story 和 traceability audit。", "Governance", "Sprint Acceptance And Final Gate"),
    ("GOV-004", "最终总测通过前不得宣称功能已实现。", "Governance", "Summary / Sprint Acceptance And Final Gate"),
    ("PAGE-001", "Landing 页必须呈现 hero、How it works、trust copy、FAQ、CTA。", "Pages", "页面清单 / 首页"),
    ("PAGE-002", "Pricing 页必须提供 one-time、monthly、Tutor/Coming soon 信息。", "Pages", "页面清单 / Billing / saas-starter 实施说明"),
    ("PAGE-003", "Sign-up 页必须包含 email、password、country、timezone、18+、TOS/Privacy。", "Pages", "注册页 / MVP 功能清单"),
    ("PAGE-004", "Sign-in 页必须允许已注册家长重新进入受保护区域。", "Pages", "页面清单 / Auth"),
    ("PAGE-005", "Dashboard 页必须展示 children、recent reports、recent runs、billing/account 入口。", "Pages", "家长仪表盘"),
    ("PAGE-006", "Children 相关页面必须覆盖新建、详情、历史/复盘、上传入口。", "Pages", "页面清单 / 历史与周度复盘"),
    ("PAGE-007", "Upload 页必须支持 5–10 页上传、预览、质量提示、source type、notes。", "Pages", "上传页"),
    ("PAGE-008", "Run Status 页必须展示步骤、状态、进度、失败重试、support 入口。", "Pages", "分析进度页"),
    ("PAGE-009", "Report 页必须提供 Diagnosis、Evidence、Plan 三个主要阅读面。", "Pages", "诊断页 / 证据页 / 7天执行单"),
    ("PAGE-010", "Billing 页必须提供 Stripe Checkout 入口。", "Pages", "付费页"),
    ("PAGE-011", "Share 页必须提供 tutor 只读访问能力。", "Pages", "Tutor 共享页"),
    ("PAGE-012", "Admin Review 页面必须提供队列和详情/编辑视图。", "Pages", "Admin（内部）"),
    ("PAGE-013", "所有核心页面必须支持桌面和移动端可用布局。", "Pages", "Detailed Test Program / 非功能测试"),
    ("AUTH-001", "家长注册必须要求 18+ 勾选，否则不可提交。", "Auth", "MVP 功能清单 / 注册页"),
    ("AUTH-002", "家长注册必须要求同意 TOS/Privacy。", "Auth", "注册页"),
    ("AUTH-003", "必须支持 Email 注册/登录/登出/找回密码或等价恢复能力。", "Auth", "MVP 功能清单 / Auth"),
    ("AUTH-004", "账户需要存储 country、timezone、locale，用于家长端配置。", "Auth", "MVP 功能清单 / Auth / users 表"),
    ("AUTH-005", "未登录用户不能访问 dashboard、children、reports、billing、admin。", "Auth", "MVP 功能清单 / Auth / API 设计概要"),
    ("CH-001", "家长可以为孩子创建 nickname、grade、curriculum。", "Children", "Child Profile / Children API"),
    ("CH-002", "同一家庭账户必须支持多个孩子。", "Children", "Child Profile"),
    ("CH-003", "MVP 默认不收集孩子真实姓名、学校名等非必要信息。", "Children", "Child Profile / 合规要点"),
    ("UP-001", "必须支持 JPG/PNG/PDF 输入，单次 5–10 页。", "Upload", "上传与处理 / 输入要求"),
    ("UP-002", "上传后必须显示页缩略图与页数。", "Upload", "上传页 / MVP 功能清单"),
    ("UP-003", "PDF 必须拆页并记录 pages。", "Upload", "上传与处理 / 数据模型"),
    ("UP-004", "系统必须识别模糊、旋转、过暗等质量标志。", "Upload", "上传页 / 图像处理需求"),
    ("UP-005", "上传时必须保存 source type 与 notes。", "Upload", "上传页 / API 设计概要"),
    ("UP-006", "超过 10 页必须阻止提交并提示拆分上传。", "Upload", "上传页验收"),
    ("UP-007", "少于 5 页时必须提示稳定性风险。", "Upload", "上传页验收"),
    ("RUN-001", "提交上传后必须创建 analysis_run 并跳转到进度页。", "Run Lifecycle", "启动分析与进度页 / API 设计概要"),
    ("RUN-002", "analysis_run 必须支持 queued、running、done、failed、needs_review。", "Run Lifecycle", "启动分析与进度页 / analysis_runs 表"),
    ("RUN-003", "进度页必须展示步骤、百分比或阶段状态与预计时间。", "Run Lifecycle", "分析进度页"),
    ("RUN-004", "失败的 run 必须支持重试。", "Run Lifecycle", "启动分析与进度页"),
    ("RUN-005", "超时 run 必须提供明确提示和支持入口。", "Run Lifecycle", "启动分析与进度页"),
    ("AI-001", "页面抽取必须输出固定 JSON schema。", "AI / OCR", "Prompt A / 数据与接口规格"),
    ("AI-002", "错误标签必须只使用固定 taxonomy code set。", "AI / OCR", "Prompt B / taxonomy"),
    ("AI-003", "模型与报告都不得直接输出作业答案。", "AI / OCR", "提示词设计要点 / Prompt A-C"),
    ("AI-004", "每个问题条目都必须带 evidence anchor。", "AI / OCR", "Prompt A / problem_items 表"),
    ("AI-005", "每个 finding 至少需要 2 条 evidence，否则降级或不输出。", "AI / OCR", "Prompt C / 后处理规则"),
    ("AI-006", "低置信度结果必须走 temporary/needs_review 分流。", "AI / OCR", "置信度阈值 / 人工审核回合"),
    ("AI-007", "weekly review 必须能利用 previous report summary 做趋势比较。", "AI / OCR", "Prompt C / History / Weekly Review"),
    ("REP-001", "Diagnosis 必须输出 Top 1–3 findings。", "Reports", "诊断页 / Diagnosis"),
    ("REP-002", "Diagnosis 必须区分 pattern vs sporadic。", "Reports", "诊断页 / Detailed Test Program"),
    ("REP-003", "Diagnosis/Plan 必须给出本周优先级与暂时不要做的事项。", "Reports", "诊断页 / 7天执行单"),
    ("REP-004", "Evidence 必须按错误类型分组展示。", "Reports", "证据页"),
    ("REP-005", "Evidence 必须允许打开页图并定位到 pageNo/problemNo。", "Reports", "证据页"),
    ("REP-006", "7-Day Plan 必须覆盖 Day1–Day7，每天含目标、任务、家长提示语、成功判定。", "Reports", "7天执行单 / Prompt C"),
    ("REP-007", "系统必须从统一事实层生成 parent/student/tutor 三版本报告。", "Reports", "报告模板 / Prompt C / reports 表"),
    ("REP-008", "低置信度报告必须有降级提示或待审核说明。", "Reports", "质量控制 / Detailed Test Program"),
    ("HIS-001", "孩子详情页必须至少显示最近 3 次报告。", "History", "历史与周度复盘"),
    ("HIS-002", "weekly review 必须支持与上一次报告对比并展示趋势变化。", "History", "历史与周度复盘"),
    ("HIS-003", "家长必须可以写复盘笔记。", "History", "历史与周度复盘"),
    ("SHR-001", "报告必须支持生成 share token。", "Share", "Tutor 共享链接"),
    ("SHR-002", "share token 必须支持到期和 revoke。", "Share", "Tutor 共享链接 / share_links 表"),
    ("SHR-003", "share 页面必须只读并隐藏敏感家长内部信息。", "Share", "Tutor 共享页"),
    ("BIL-001", "Billing 必须支持 one-time checkout。", "Billing", "付费 / Billing"),
    ("BIL-002", "Billing 必须支持 monthly checkout 或等价订阅入口。", "Billing", "付费 / Billing"),
    ("BIL-003", "未支付状态必须锁定完整报告或关键功能。", "Billing", "付费 / Billing"),
    ("BIL-004", "Stripe webhook 必须幂等，不得重复解锁或重复入账。", "Billing", "Billing / webhook 验收"),
    ("ADM-001", "内部必须有 needs_review 队列和 run 详情页。", "Admin / QC", "低置信度进入 Needs Review 队列 / Admin"),
    ("ADM-002", "审核员必须可以 approve、request-more-photos、调整展示文案。", "Admin / QC", "人工审核回合 / Admin"),
    ("SHD-001", "Should 范围包含 PDF 导出。", "Should", "Should"),
    ("SHD-002", "Should 范围包含 tutor workspace foundation。", "Should", "Should"),
    ("SHD-003", "Should 范围包含报告完成/复盘 reminder 邮件。", "Should", "Should"),
    ("SHD-004", "Should 范围包含 EN/ES 输出支持。", "Should", "Should"),
    ("SHD-005", "Should 范围包含 evidence highlight。", "Should", "Should"),
    ("OPS-001", "系统必须提供删除入口与数据保留策略。", "Compliance / Ops", "合规要点 / 风险与缓解措施"),
    ("OPS-002", "系统必须有 observability、日志、成本和运行时遥测。", "Compliance / Ops", "监控与日志 / 非功能测试"),
    ("OPS-003", "系统必须有 staging/demo fixtures/runbook 以支持 release candidate。", "Compliance / Ops", "最小可交付时间线 / Sprint 7"),
]

REQ_TEXT = {req_id: text for req_id, text, _, _ in REQUIREMENTS}


def build_requirement_index() -> str:
    lines = [
        "# PRD Requirement Index",
        "",
        "Source of truth:",
        "- `docs/需求文档.md`",
        "- `docs/saas-starter 一天落地实施说明.md`",
        "",
        "This index converts the PRD into unique requirement IDs. No feature may start implementation until its requirement IDs are linked to Story cards and test cases.",
        "",
        "| Requirement ID | Category | Source Section | Requirement |",
        "| --- | --- | --- | --- |",
    ]
    for req_id, requirement, category, source in REQUIREMENTS:
        lines.append(f"| {req_id} | {category} | {source} | {requirement} |")
    return "\n".join(lines)


def build_core_docs() -> None:
    write(
        "README.md",
        """
        # FamilyEducation Parent Dashboard

        FamilyEducation is a parent-first web product for turning 5–10 pages of math homework, quizzes, and corrections into:
        - an evidence-backed diagnosis
        - a 7-day action plan
        - a weekly review trend
        - a tutor share link

        This repository is bootstrapped from `nextjs/saas-starter`, but delivery is governed by the `agentsystem` software engineering workflow and the traceability-first backlog under `tasks/backlog_v1/`.

        ## Current Status
        - base starter repository imported
        - PRD source documents preserved under `docs/`
        - backlog, traceability, and testing assets generated
        - product features not yet implemented; execution should proceed Story-by-Story through `agentsystem`
        """,
    )
    write(
        "AGENTS.md",
        """
        # AGENTS.md

        ## Project Goal

        `familyEducation/` is the parent-first FamilyEducation Parent Dashboard repository.
        The product target is the PRD under `docs/需求文档.md`.

        ## Source Of Truth

        Read these before changing code:
        - `docs/需求文档.md`
        - `docs/saas-starter 一天落地实施说明.md`
        - `docs/requirements/prd_requirement_index.md`
        - `docs/requirements/prd_traceability_matrix.md`
        - `docs/testing/page_test_matrix.md`
        - `docs/testing/click_path_matrix.md`
        - `docs/testing/api_data_ai_test_matrix.md`
        - `docs/testing/final_program_acceptance.md`
        - `tasks/backlog_v1/sprint_overview.md`
        - `PROJECT_STATE.md`

        ## Workflow Rules
        - This repo must follow the `agentsystem` `software_engineering` workflow.
        - No Story is complete until it is `implemented + verified + agentized + accepted`.
        - Every Story card must include `requirement_ids`, `test_case_ids`, and `expected_evidence`.
        - Every UI Story must run browse/design/browser QA with durable artifacts.
        - Every Sprint must end with its dedicated Sprint Acceptance Story plus `ship`, `document-release`, and `retro`.
        - Final completion requires the full program acceptance gate in `docs/testing/final_program_acceptance.md`.
        """,
    )
    write(
        "PROJECT_STATE.md",
        """
        # PROJECT_STATE.md

        ## Repository Status
        - Base repository: `nextjs/saas-starter`
        - Local repository path: `D:\\lyh\\agent\\agent-frame\\familyEducation`
        - Existing PRD docs preserved under `docs/`
        - This repository now has planning, traceability, and testing assets, but feature implementation has not started.
        """,
    )
    write(
        "README-dev.md",
        """
        # README-dev.md

        ## Common Commands
        ```powershell
        cd D:\\lyh\\agent\\agent-frame\\familyEducation
        pnpm install
        pnpm db:setup
        pnpm db:migrate
        pnpm db:seed
        pnpm dev
        ```
        """,
    )
    write(
        "docs/handoff/current_handoff.md",
        """
        # Current Handoff

        - Starter imported from `nextjs/saas-starter`.
        - PRD preserved locally.
        - Backlog v1.2 and testing control docs generated.
        - No FamilyEducation feature Stories have been executed yet.
        """,
    )
    write(
        ".env.example",
        """
        # This is an example of your .env file format, which pnpm db:setup will create.
        # Note: this must be .env, not .env.local, without further configuration changes.
        POSTGRES_URL=postgresql://***
        STRIPE_SECRET_KEY=sk_test_***
        STRIPE_WEBHOOK_SECRET=whsec_***
        BASE_URL=http://localhost:3000
        AUTH_SECRET=***

        # FamilyEducation product settings
        OPENAI_API_KEY=
        OPENAI_MODEL_VISION=
        MATHPIX_APP_ID=
        MATHPIX_APP_KEY=
        GOOGLE_APPLICATION_CREDENTIALS=
        SUPPORT_EMAIL=support@example.com
        DATA_RETENTION_DAYS=30
        DEFAULT_LOCALE=en-US
        DEFAULT_COUNTRY=US
        DEFAULT_TIMEZONE=America/Los_Angeles
        """,
    )
    write("docs/requirements/prd_requirement_index.md", build_requirement_index())


def main() -> None:
    build_core_docs()


if __name__ == "__main__":
    main()
