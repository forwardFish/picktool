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


def req_map() -> dict[str, str]:
    req_file = ROOT / "docs/requirements/prd_requirement_index.md"
    mapping: dict[str, str] = {}
    for line in req_file.read_text(encoding="utf-8").splitlines():
        if line.startswith("| ") and not line.startswith("| Requirement ID"):
            parts = [part.strip() for part in line.strip("|").split("|")]
            if len(parts) >= 4 and parts[0] != "---":
                mapping[parts[0]] = parts[3]
    return mapping


REQ_TEXT = req_map()

SPRINTS: list[dict] = []

SPRINTS.extend(
    [
        {
            "number": 0,
            "slug": "sprint_0_bootstrap_and_quality_contract",
            "name": "Bootstrap And Quality Contract",
            "goal": "Turn the imported starter into a governed FamilyEducation repository with durable traceability, testing, and runtime delivery assets before feature implementation begins.",
            "epics": [
                {
                    "slug": "epic_0_1_repo_bootstrap",
                    "title": "Repo Bootstrap",
                    "summary": "Make FamilyEducation a usable repo with starter import evidence, bootstrap guidance, and runtime asset scaffolding.",
                    "stories": [
                        {
                            "id": "FE-001",
                            "name": "Import Saas Starter And Preserve Product Docs",
                            "kind": "devops",
                            "summary": "Make FamilyEducation a real independent project repo without losing the PRD source docs.",
                            "value": "Provides the physical codebase boundary for all later feature work.",
                            "reqs": ["GOV-001"],
                            "tests": ["TC-GOV-001"],
                            "files": ["README.md", "AGENTS.md", "PROJECT_STATE.md", "docs/需求文档.md", "docs/saas-starter 一天落地实施说明.md"],
                            "deps": [],
                        },
                        {
                            "id": "FE-002",
                            "name": "Repository Env And Db Baseline",
                            "kind": "devops",
                            "summary": "Document and prepare the starter commands, env surface, and DB bootstrap flow for FamilyEducation.",
                            "value": "Gives later stories a stable local setup contract.",
                            "reqs": ["GOV-001"],
                            "tests": ["TC-GOV-002"],
                            "files": [".env.example", "README-dev.md", "package.json", "lib/db/setup.ts", "lib/db/seed.ts"],
                            "deps": ["FE-001"],
                        },
                        {
                            "id": "FE-003",
                            "name": "Tasks Runtime Registry Scaffolding",
                            "kind": "docs",
                            "summary": "Create runtime folders, story registry files, and backlog layout expected by agentsystem.",
                            "value": "Lets the workflow deposit admissions, failures, handoffs, and status state in a consistent place.",
                            "reqs": ["GOV-002"],
                            "tests": ["TC-GOV-003"],
                            "files": ["tasks/story_status_registry.json", "tasks/story_acceptance_reviews.json", "tasks/runtime/README.md"],
                            "deps": ["FE-001"],
                        },
                    ],
                },
                {
                    "slug": "epic_0_2_traceability_and_testing",
                    "title": "Traceability And Testing",
                    "summary": "Materialize requirement indexing, requirement-to-story mapping, and the detailed acceptance contract.",
                    "stories": [
                        {
                            "id": "FE-004",
                            "name": "Requirement Index",
                            "kind": "docs",
                            "summary": "Turn the PRD into unique requirement IDs before implementation starts.",
                            "value": "Prevents ambiguous delivery and undocumented scope drift.",
                            "reqs": ["GOV-001"],
                            "tests": ["TC-GOV-001"],
                            "files": ["docs/requirements/prd_requirement_index.md"],
                            "deps": ["FE-001"],
                        },
                        {
                            "id": "FE-005",
                            "name": "Traceability Matrix",
                            "kind": "docs",
                            "summary": "Map every requirement to routes, APIs, schema surfaces, stories, tests, and evidence expectations.",
                            "value": "Makes PRD alignment auditable at story, sprint, and program level.",
                            "reqs": ["GOV-001", "GOV-004"],
                            "tests": ["TC-GOV-002", "FP-001"],
                            "files": ["docs/requirements/prd_traceability_matrix.md"],
                            "deps": ["FE-003", "FE-004"],
                        },
                        {
                            "id": "FE-006",
                            "name": "Page Click And Final Acceptance Matrices",
                            "kind": "docs",
                            "summary": "Write the detailed page, click path, API/data/AI, and final acceptance plans.",
                            "value": "Establishes test-first delivery and prevents weak sign-off.",
                            "reqs": ["GOV-001", "GOV-004"],
                            "tests": ["TC-GOV-002", "FP-002"],
                            "files": ["docs/testing/page_test_matrix.md", "docs/testing/click_path_matrix.md", "docs/testing/api_data_ai_test_matrix.md", "docs/testing/final_program_acceptance.md"],
                            "deps": ["FE-004"],
                        },
                        {
                            "id": "FE-007",
                            "name": "Sprint 0 Acceptance",
                            "kind": "acceptance",
                            "summary": "Close Sprint 0 only after the repo, traceability, and testing contracts all exist and align.",
                            "value": "Prevents feature work from starting on an undocumented or untestable base.",
                            "reqs": ["GOV-003"],
                            "tests": ["TC-GOV-004"],
                            "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/final_program_acceptance.md", "tasks/backlog_v1/sprint_0_bootstrap_and_quality_contract/sprint_plan.md"],
                            "deps": ["FE-002", "FE-003", "FE-004", "FE-005", "FE-006"],
                        },
                    ],
                },
            ],
        },
        {
            "number": 1,
            "slug": "sprint_1_parent_identity_and_dashboard",
            "name": "Parent Identity And Dashboard",
            "goal": "Implement the parent entry flow, protected app shell, child profile basics, and the first dashboard surfaces.",
            "epics": [
                {
                    "slug": "epic_1_1_parent_identity",
                    "title": "Parent Identity",
                    "summary": "Deliver the parent-first signup, sign-in, session, and protected route shell.",
                    "stories": [
                        {
                            "id": "FE-008",
                            "name": "18 Plus Signup Gate",
                            "kind": "ui",
                            "summary": "Extend sign-up so a parent cannot register without the required age and consent gates.",
                            "value": "Matches the PRD and reduces compliance risk at the first touchpoint.",
                            "reqs": ["PAGE-003", "AUTH-001", "AUTH-002"],
                            "tests": ["PAGE-SUP-001", "PAGE-SUP-002", "PAGE-SUP-003", "API-AUTH-001", "API-AUTH-002"],
                            "files": ["app/(login)/login.tsx", "app/(login)/actions.ts", "lib/db/schema.ts"],
                            "routes": ["/sign-up"],
                            "deps": ["FE-007"],
                        },
                        {
                            "id": "FE-009",
                            "name": "Parent Auth Session And Account Shell",
                            "kind": "ui",
                            "summary": "Finish sign-in, protected session flow, and parent account profile basics.",
                            "value": "Creates the authenticated shell that every later feature depends on.",
                            "reqs": ["PAGE-004", "AUTH-003", "AUTH-004", "AUTH-005"],
                            "tests": ["PAGE-SIN-001", "PAGE-SIN-002", "PAGE-SIN-003", "API-AUTH-003", "API-AUTH-004", "API-AUTH-005", "API-AUTH-006"],
                            "files": ["app/(login)/sign-in/page.tsx", "app/(login)/sign-up/page.tsx", "middleware.ts", "app/api/user/route.ts", "lib/db/schema.ts"],
                            "routes": ["/sign-in", "/sign-up", "/dashboard"],
                            "deps": ["FE-008"],
                        },
                    ],
                },
                {
                    "slug": "epic_1_2_household_dashboard",
                    "title": "Household Dashboard",
                    "summary": "Add child profile CRUD and align the public and authenticated dashboard shell with the PRD.",
                    "stories": [
                        {
                            "id": "FE-010",
                            "name": "Child Profile Crud",
                            "kind": "ui",
                            "summary": "Let one parent manage multiple child profiles with minimal PII.",
                            "value": "Creates the data anchor for uploads, history, and billing per child.",
                            "reqs": ["CH-001", "CH-002", "CH-003", "PAGE-006"],
                            "tests": ["PAGE-CHD-001", "PAGE-CHD-002", "PAGE-CHD-003", "PAGE-CHD-007", "API-CH-001", "API-CH-002", "API-CH-003", "DATA-002", "DATA-003"],
                            "files": ["app/(dashboard)/dashboard/children/page.tsx", "app/(dashboard)/dashboard/children/new/page.tsx", "app/api/children/route.ts", "lib/db/schema.ts"],
                            "routes": ["/dashboard/children", "/dashboard/children/new"],
                            "deps": ["FE-009"],
                        },
                        {
                            "id": "FE-011",
                            "name": "Dashboard Information Architecture Nav And Public Shell",
                            "kind": "ui",
                            "summary": "Align the landing, pricing, dashboard overview, and nav structure to the parent-first PRD.",
                            "value": "Gives the repo a coherent user-facing shell before the deeper flows arrive.",
                            "reqs": ["PAGE-001", "PAGE-002", "PAGE-005", "PAGE-013"],
                            "tests": ["PAGE-LND-001", "PAGE-LND-002", "PAGE-LND-003", "PAGE-PRC-001", "PAGE-PRC-002", "PAGE-DAS-002", "PAGE-DAS-003", "RESP-001"],
                            "files": ["app/(dashboard)/page.tsx", "app/(dashboard)/layout.tsx", "app/(dashboard)/pricing/page.tsx", "app/(dashboard)/dashboard/layout.tsx", "app/(dashboard)/dashboard/page.tsx"],
                            "routes": ["/", "/pricing", "/dashboard"],
                            "deps": ["FE-010"],
                        },
                        {
                            "id": "FE-012",
                            "name": "Sprint 1 Acceptance",
                            "kind": "acceptance",
                            "summary": "Verify that parent entry and dashboard flows behave end-to-end before Sprint 1 can close.",
                            "value": "Prevents later upload/report work from resting on a broken auth or dashboard shell.",
                            "reqs": ["GOV-003"],
                            "tests": ["PAGE-SUP-001", "PAGE-SIN-001", "PAGE-DAS-001", "CLICK-001", "CLICK-002"],
                            "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/page_test_matrix.md", "tasks/backlog_v1/sprint_1_parent_identity_and_dashboard/sprint_plan.md"],
                            "deps": ["FE-008", "FE-009", "FE-010", "FE-011"],
                        },
                    ],
                },
            ],
        },
        {
            "number": 2,
            "slug": "sprint_2_upload_and_run_lifecycle",
            "name": "Upload And Run Lifecycle",
            "goal": "Deliver upload intake, file/page persistence, preprocessing, and the full run lifecycle through the status page.",
            "epics": [
                {
                    "slug": "epic_2_1_upload_intake",
                    "title": "Upload Intake",
                    "summary": "Create upload, file, and page persistence plus the upload UI and preprocess quality checks.",
                    "stories": [
                        {"id": "FE-013", "name": "Uploads And Pages Schema", "kind": "backend", "summary": "Add the upload, upload_file, and page data model.", "value": "Creates the durable input contract for all analysis work.", "reqs": ["UP-001", "UP-003", "UP-005"], "tests": ["API-UP-001", "API-UP-002", "DATA-UP-001", "DATA-UP-002"], "files": ["lib/db/schema.ts", "app/api/uploads/route.ts"], "deps": ["FE-012"]},
                        {"id": "FE-014", "name": "Upload Page Previews And Quality Messaging", "kind": "ui", "summary": "Build the upload screen with previews, page count, source type, notes, and validation messaging.", "value": "Turns raw files into a guided parent upload experience.", "reqs": ["PAGE-007", "UP-001", "UP-002", "UP-005", "UP-006", "UP-007"], "tests": ["PAGE-UPL-001", "PAGE-UPL-002", "PAGE-UPL-003", "PAGE-UPL-004", "PAGE-UPL-007", "PAGE-UPL-009", "PAGE-UPL-010"], "files": ["app/(dashboard)/dashboard/children/[childId]/upload/page.tsx", "app/api/uploads/route.ts"], "routes": ["/dashboard/children/[childId]/upload"], "deps": ["FE-013"]},
                        {"id": "FE-015", "name": "Pdf Split And Preprocess Quality Checks", "kind": "backend", "summary": "Split PDFs into pages and annotate blur, rotate, and darkness flags.", "value": "Improves downstream AI quality and user trust.", "reqs": ["UP-003", "UP-004"], "tests": ["PAGE-UPL-005", "PAGE-UPL-006", "API-UP-002", "API-UP-003", "AI-QC-001"], "files": ["app/api/uploads/[uploadId]/files/route.ts", "lib/uploads/preprocess.ts", "lib/db/schema.ts"], "deps": ["FE-013"]},
                    ],
                },
                {
                    "slug": "epic_2_2_run_lifecycle",
                    "title": "Run Lifecycle",
                    "summary": "Make upload submission create trackable runs with real status transitions, retries, and support messaging.",
                    "stories": [
                        {"id": "FE-016", "name": "Run Status State Machine And Progress Page", "kind": "ui", "summary": "Expose run creation, status transitions, and live progress on the run page.", "value": "Makes long-running analysis understandable to the user.", "reqs": ["PAGE-008", "RUN-001", "RUN-002", "RUN-003"], "tests": ["PAGE-RUN-001", "PAGE-RUN-002", "PAGE-RUN-003", "PAGE-RUN-007", "PAGE-RUN-008", "API-RUN-001", "API-RUN-002", "DATA-RUN-001", "CLICK-003"], "files": ["app/(dashboard)/dashboard/runs/[runId]/page.tsx", "app/api/runs/[runId]/route.ts", "lib/db/schema.ts"], "routes": ["/dashboard/runs/[runId]"], "deps": ["FE-014", "FE-015"]},
                        {"id": "FE-017", "name": "Retry Timeout And Failed Recovery Paths", "kind": "ui", "summary": "Handle failed, timeout, and needs_review states with user-visible next actions.", "value": "Prevents abandoned runs and reduces support friction.", "reqs": ["RUN-004", "RUN-005"], "tests": ["PAGE-RUN-004", "PAGE-RUN-005", "PAGE-RUN-006", "API-RUN-003", "CLICK-008"], "files": ["app/(dashboard)/dashboard/runs/[runId]/page.tsx", "app/api/runs/[runId]/retry/route.ts"], "routes": ["/dashboard/runs/[runId]"], "deps": ["FE-016"]},
                        {"id": "FE-018", "name": "Sprint 2 Acceptance", "kind": "acceptance", "summary": "Audit upload and run requirements before AI/reporting work starts.", "value": "Stops broken intake flows from cascading into later features.", "reqs": ["GOV-003"], "tests": ["PAGE-UPL-001", "PAGE-UPL-003", "PAGE-RUN-002", "CLICK-003", "CLICK-008"], "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/click_path_matrix.md", "tasks/backlog_v1/sprint_2_upload_and_run_lifecycle/sprint_plan.md"], "deps": ["FE-013", "FE-014", "FE-015", "FE-016", "FE-017"]},
                    ],
                },
            ],
        },
    ]
)

SPRINTS.extend(
    [
        {
            "number": 6,
            "slug": "sprint_6_admin_and_should_features",
            "name": "Admin And Should Features",
            "goal": "Deliver the internal review queue plus the should-scope export, tutor, reminder, locale, and highlight enhancements.",
            "epics": [
                {
                    "slug": "epic_6_1_review_queue",
                    "title": "Review Queue",
                    "summary": "Complete the internal human review path for low-confidence runs.",
                    "stories": [
                        {"id": "FE-035", "name": "Admin Review Queue", "kind": "ui", "summary": "Render the review queue and run detail tools for internal reviewers.", "value": "Lets the team safely ship low-confidence runs instead of blocking them forever.", "reqs": ["PAGE-012", "ADM-001", "ADM-002"], "tests": ["PAGE-ADM-001", "PAGE-ADM-002", "PAGE-ADM-003", "PAGE-ADM-004", "PAGE-ADM-005", "PAGE-ADM-006", "API-ADM-001", "API-ADM-002", "CLICK-010"], "files": ["app/admin/review/page.tsx", "app/admin/review/[runId]/page.tsx", "app/api/admin/review/route.ts", "app/api/admin/review/[runId]/approve/route.ts"], "routes": ["/admin/review", "/admin/review/[runId]"], "deps": ["FE-034"]},
                    ],
                },
                {
                    "slug": "epic_6_2_should_scope_value_adds",
                    "title": "Should Scope Value Adds",
                    "summary": "Ship the agreed Should features without breaking the core PRD contract.",
                    "stories": [
                        {"id": "FE-036", "name": "Pdf Export", "kind": "ui", "summary": "Allow the report to be exported as a PDF artifact.", "value": "Improves sharing and formal communication value.", "reqs": ["SHD-001"], "tests": ["PAGE-RPT-009", "API-PDF-001"], "files": ["components/reports/ExportPdfButton.tsx", "app/api/reports/[reportId]/export/route.ts"], "routes": ["/dashboard/reports/[reportId]"], "deps": ["FE-029"]},
                        {"id": "FE-037", "name": "Tutor Workspace Foundation", "kind": "ui", "summary": "Create the basic tutor workspace shell and access contract.", "value": "Opens the next expansion path for tutor-led usage.", "reqs": ["SHD-002"], "tests": ["PAGE-TUT-001", "API-TUT-001"], "files": ["app/(dashboard)/dashboard/tutor/page.tsx", "app/api/tutor/route.ts"], "routes": ["/dashboard/tutor"], "deps": ["FE-030"]},
                        {"id": "FE-038", "name": "Email Reminders", "kind": "backend", "summary": "Schedule and emit report-ready and weekly review reminder notifications.", "value": "Improves retention and return visits.", "reqs": ["SHD-003"], "tests": ["API-NTF-001", "OPS-NTF-001"], "files": ["lib/notifications/reminders.ts", "app/api/notifications/schedule/route.ts"], "deps": ["FE-032"]},
                        {"id": "FE-039", "name": "English And Spanish Output", "kind": "ui", "summary": "Localize report output and copy to support EN/ES delivery.", "value": "Broadens accessibility for multilingual households.", "reqs": ["SHD-004"], "tests": ["PAGE-I18N-001", "API-I18N-001"], "files": ["lib/reports/localize.ts", "app/(dashboard)/dashboard/reports/[reportId]/page.tsx"], "routes": ["/dashboard/reports/[reportId]"], "deps": ["FE-028"]},
                        {"id": "FE-040", "name": "Evidence Highlight Overlay", "kind": "ui", "summary": "Add bbox or overlay highlighting to the evidence viewer, with graceful fallback.", "value": "Strengthens the proof loop for parents and tutors.", "reqs": ["SHD-005", "REP-005"], "tests": ["PAGE-RPT-010", "CLICK-004"], "files": ["components/reports/PageViewer.tsx", "components/reports/EvidenceTab.tsx"], "routes": ["/dashboard/reports/[reportId]"], "deps": ["FE-026"]},
                        {"id": "FE-041", "name": "Sprint 6 Acceptance", "kind": "acceptance", "summary": "Verify that admin review and Should features behave correctly without regressing the core parent flow.", "value": "Keeps the product coherent as optional scope lands.", "reqs": ["GOV-003"], "tests": ["PAGE-ADM-001", "PAGE-RPT-009", "PAGE-RPT-010", "CLICK-010"], "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/page_test_matrix.md", "tasks/backlog_v1/sprint_6_admin_and_should_features/sprint_plan.md"], "deps": ["FE-035", "FE-036", "FE-037", "FE-038", "FE-039", "FE-040"]},
                    ],
                },
            ],
        },
        {
            "number": 7,
            "slug": "sprint_7_compliance_ops_release_candidate",
            "name": "Compliance Ops Release Candidate",
            "goal": "Add delete and retention controls, observability, and release-candidate deployment scaffolding.",
            "epics": [
                {
                    "slug": "epic_7_1_compliance_and_ops",
                    "title": "Compliance And Ops",
                    "summary": "Protect the product with deletion, retention, observability, and cost visibility.",
                    "stories": [
                        {"id": "FE-042", "name": "Delete Entry Points And Retention Controls", "kind": "backend", "summary": "Add delete flows and publish the repo-level data retention rule.", "value": "Makes privacy and cleanup part of the product contract instead of an afterthought.", "reqs": ["OPS-001"], "tests": ["OPS-DEL-001", "OPS-DEL-002", "NF-006", "DATA-DEL-001"], "files": ["app/api/account/delete/route.ts", "app/api/children/[childId]/delete/route.ts", "docs/privacy/data_retention.md"], "deps": ["FE-041"]},
                        {"id": "FE-043", "name": "Observability Cost And Runtime Telemetry", "kind": "backend", "summary": "Instrument logs, traces, error paths, and cost telemetry for analysis runs.", "value": "Makes the product operable and measurable in staging and production.", "reqs": ["OPS-002"], "tests": ["OPS-OBS-001", "OPS-OBS-002", "NF-007", "NF-008"], "files": ["lib/observability/telemetry.ts", "lib/observability/cost-tracking.ts", "docs/ops/telemetry_runbook.md"], "deps": ["FE-041"]},
                        {"id": "FE-044", "name": "Staging Deploy Runbook And Demo Fixtures", "kind": "devops", "summary": "Prepare release-candidate docs, demo fixtures, and deployment runbooks.", "value": "Allows the team to prove the product in a production-like environment.", "reqs": ["OPS-003"], "tests": ["OPS-RLS-001", "OPS-RLS-002"], "files": ["docs/release/staging_runbook.md", "docs/release/demo_fixtures.md", "docs/handoff/current_handoff.md"], "deps": ["FE-043"]},
                        {"id": "FE-045", "name": "Release Candidate Sprint Acceptance", "kind": "acceptance", "summary": "Treat Sprint 7 as the release-candidate hardening gate before program-wide sign-off.", "value": "Prevents final acceptance from running against an unoperational build.", "reqs": ["GOV-003"], "tests": ["OPS-DEL-001", "OPS-OBS-001", "OPS-RLS-001", "NF-007", "NF-008"], "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/final_program_acceptance.md", "tasks/backlog_v1/sprint_7_compliance_ops_release_candidate/sprint_plan.md"], "deps": ["FE-042", "FE-043", "FE-044"]},
                    ],
                },
            ],
        },
        {
            "number": 8,
            "slug": "sprint_8_final_program_acceptance",
            "name": "Final Program Acceptance",
            "goal": "Run the full PRD coverage audit, the end-to-end program test, and the final ship/document-release/retro package.",
            "epics": [
                {
                    "slug": "epic_8_1_final_validation",
                    "title": "Final Validation",
                    "summary": "Prove that every Must and Should requirement is green with durable evidence.",
                    "stories": [
                        {"id": "FE-046", "name": "Full Prd Coverage Audit", "kind": "acceptance", "summary": "Audit every Must and Should requirement row for evidence completeness and correctness.", "value": "Provides the single source of truth for final completion.", "reqs": ["GOV-004"], "tests": ["FP-001"], "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/final_program_acceptance.md"], "deps": ["FE-045"]},
                        {"id": "FE-047", "name": "Full Program End To End Test", "kind": "acceptance", "summary": "Execute the full page, click, API, data, AI, and non-functional program-wide test sweep.", "value": "Turns the repo from feature-complete to demonstrably complete.", "reqs": ["GOV-004"], "tests": ["FP-002", "CLICK-001", "CLICK-010"], "files": ["docs/testing/page_test_matrix.md", "docs/testing/click_path_matrix.md", "docs/testing/api_data_ai_test_matrix.md", "docs/testing/final_program_acceptance.md"], "deps": ["FE-046"]},
                        {"id": "FE-048", "name": "Final Delivery Pack And Handoff", "kind": "docs", "summary": "Prepare the final handoff, state summary, and delivery notes for future sessions.", "value": "Lets a fresh session continue without relying on chat history.", "reqs": ["GOV-004"], "tests": ["FP-002"], "files": ["docs/handoff/current_handoff.md", "PROJECT_STATE.md", "README.md"], "deps": ["FE-047"]},
                        {"id": "FE-049", "name": "Final Ship Document Release And Retro", "kind": "acceptance", "summary": "Close the program with ship, document-release, and retro readiness tied to the acceptance results.", "value": "Brings the repo into formal delivery parity with the standard workflow.", "reqs": ["GOV-003", "GOV-004"], "tests": ["FP-001", "FP-002"], "files": ["tasks/backlog_v1/sprint_8_final_program_acceptance/sprint_plan.md", "docs/testing/final_program_acceptance.md", "docs/handoff/current_handoff.md"], "deps": ["FE-048"]},
                    ],
                },
            ],
        },
    ]
)

SPRINTS.extend(
    [
        {
            "number": 3,
            "slug": "sprint_3_extraction_and_qc",
            "name": "Extraction And QC",
            "goal": "Build the canonical extraction, taxonomy labeling, confidence scoring, and review routing pipeline.",
            "epics": [
                {
                    "slug": "epic_3_1_extraction_pipeline",
                    "title": "Extraction Pipeline",
                    "summary": "Define the data contracts and run the primary/secondary OCR and extraction flow.",
                    "stories": [
                        {"id": "FE-019", "name": "Canonical Problem Extraction Contract", "kind": "backend", "summary": "Create the structured extraction schema that all OCR/model paths must emit.", "value": "Gives later taxonomy and reporting stages a deterministic base.", "reqs": ["AI-001", "AI-004"], "tests": ["AI-EXT-001", "AI-EXT-002", "API-AI-001", "DATA-AI-001"], "files": ["lib/db/schema.ts", "lib/ai/extraction-schema.ts", "app/api/runs/[runId]/process/route.ts"], "deps": ["FE-018"]},
                        {"id": "FE-020", "name": "OpenAI Vision Extraction Path", "kind": "backend", "summary": "Implement the primary Vision path for extracting structured page content.", "value": "Establishes the fastest path to productizing OCR and reasoning.", "reqs": ["AI-001", "AI-003", "AI-004"], "tests": ["AI-EXT-001", "AI-SAFE-001", "AI-SAFE-002"], "files": ["lib/ai/openai-vision.ts", "app/api/runs/[runId]/process/route.ts"], "deps": ["FE-019"]},
                        {"id": "FE-021", "name": "Mathpix Fallback Route", "kind": "backend", "summary": "Add a fallback path for math-heavy and handwriting-heavy pages.", "value": "Improves robustness on the hardest worksheet cases.", "reqs": ["AI-001"], "tests": ["AI-EXT-001", "AI-QC-001"], "files": ["lib/ai/mathpix.ts", "app/api/runs/[runId]/process/route.ts"], "deps": ["FE-020"]},
                    ],
                },
                {
                    "slug": "epic_3_2_labeling_and_qc",
                    "title": "Labeling And QC",
                    "summary": "Add taxonomy labeling, confidence scoring, and low-confidence routing to internal review.",
                    "stories": [
                        {"id": "FE-022", "name": "Taxonomy Labeling", "kind": "backend", "summary": "Map extracted items into the fixed error taxonomy.", "value": "Makes report aggregation and action planning consistent.", "reqs": ["AI-002"], "tests": ["AI-LBL-001", "API-AI-002"], "files": ["lib/ai/taxonomy.ts", "lib/db/schema.ts"], "deps": ["FE-019"]},
                        {"id": "FE-023", "name": "Confidence Scoring And Needs Review Routing", "kind": "backend", "summary": "Score extraction confidence and route uncertain runs into the review queue.", "value": "Protects trust by not overclaiming on weak evidence.", "reqs": ["AI-006", "REP-008"], "tests": ["AI-QC-002", "PAGE-RUN-006", "PAGE-RPT-008"], "files": ["lib/ai/confidence.ts", "app/api/runs/[runId]/route.ts", "lib/db/schema.ts"], "deps": ["FE-020", "FE-022"]},
                        {"id": "FE-024", "name": "Sprint 3 Acceptance", "kind": "acceptance", "summary": "Confirm the extraction layer is safe and structurally correct before report generation begins.", "value": "Keeps unsafe or weak AI output from propagating to user-facing reports.", "reqs": ["GOV-003"], "tests": ["AI-EXT-001", "AI-LBL-001", "AI-SAFE-001", "AI-QC-002"], "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/api_data_ai_test_matrix.md", "tasks/backlog_v1/sprint_3_extraction_and_qc/sprint_plan.md"], "deps": ["FE-019", "FE-020", "FE-021", "FE-022", "FE-023"]},
                    ],
                },
            ],
        },
        {
            "number": 4,
            "slug": "sprint_4_report_core",
            "name": "Report Core",
            "goal": "Generate diagnosis, evidence, plan, and audience-specific report structures from the shared facts layer.",
            "epics": [
                {
                    "slug": "epic_4_1_report_experience",
                    "title": "Report Experience",
                    "summary": "Deliver diagnosis, evidence, and 7-day plan surfaces with user-facing PRD alignment.",
                    "stories": [
                        {"id": "FE-025", "name": "Diagnosis Experience", "kind": "ui", "summary": "Render the diagnosis view with top findings, pattern detection, and next-step recommendations.", "value": "Answers the core parent question of what is wrong and what matters most.", "reqs": ["REP-001", "REP-002", "REP-003", "PAGE-009"], "tests": ["PAGE-RPT-001", "PAGE-RPT-002", "PAGE-RPT-003", "PAGE-RPT-008"], "files": ["app/(dashboard)/dashboard/reports/[reportId]/page.tsx", "components/reports/DiagnosisTab.tsx"], "routes": ["/dashboard/reports/[reportId]"], "deps": ["FE-024"]},
                        {"id": "FE-026", "name": "Evidence Experience", "kind": "ui", "summary": "Render evidence groups, page/problem jumps, and proof anchors for each finding.", "value": "Makes the diagnosis auditable and shareable.", "reqs": ["REP-004", "REP-005", "AI-005"], "tests": ["PAGE-RPT-004", "PAGE-RPT-005", "AI-RPT-001", "CLICK-004"], "files": ["components/reports/EvidenceTab.tsx", "components/reports/PageViewer.tsx", "app/(dashboard)/dashboard/reports/[reportId]/page.tsx"], "routes": ["/dashboard/reports/[reportId]"], "deps": ["FE-025"]},
                        {"id": "FE-027", "name": "Seven Day Plan Experience", "kind": "ui", "summary": "Render the full Day1-Day7 action plan and completion controls without giving direct answers.", "value": "Turns diagnosis into an actionable weekly routine.", "reqs": ["REP-003", "REP-006", "AI-003"], "tests": ["PAGE-RPT-006", "PAGE-RPT-007", "AI-SAFE-002", "CLICK-005"], "files": ["components/reports/PlanTab.tsx", "app/(dashboard)/dashboard/reports/[reportId]/page.tsx"], "routes": ["/dashboard/reports/[reportId]"], "deps": ["FE-025"]},
                    ],
                },
                {
                    "slug": "epic_4_2_report_payloads",
                    "title": "Report Payloads",
                    "summary": "Persist a shared facts layer and derive the parent/student/tutor views from it.",
                    "stories": [
                        {"id": "FE-028", "name": "Parent Student Tutor Report Json", "kind": "backend", "summary": "Generate the three audience-specific report payloads from a single facts layer.", "value": "Avoids inconsistent interpretations across parent, student, and tutor views.", "reqs": ["REP-007", "AI-005"], "tests": ["API-RPT-001", "DATA-RPT-001", "AI-RPT-001"], "files": ["lib/reports/generate-report.ts", "lib/db/schema.ts", "app/api/reports/[reportId]/route.ts"], "deps": ["FE-025", "FE-026", "FE-027"]},
                        {"id": "FE-029", "name": "Sprint 4 Acceptance", "kind": "acceptance", "summary": "Verify that the report experience is evidence-backed and safe before outward-facing collaboration and billing work.", "value": "Prevents incomplete reporting logic from leaking to parents and tutors.", "reqs": ["GOV-003"], "tests": ["PAGE-RPT-001", "PAGE-RPT-004", "PAGE-RPT-006", "CLICK-004", "CLICK-005", "AI-RPT-001"], "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/page_test_matrix.md", "tasks/backlog_v1/sprint_4_report_core/sprint_plan.md"], "deps": ["FE-025", "FE-026", "FE-027", "FE-028"]},
                    ],
                },
            ],
        },
        {
            "number": 5,
            "slug": "sprint_5_share_history_billing",
            "name": "Share History Billing",
            "goal": "Complete collaboration, weekly review value loops, and the MVP revenue path.",
            "epics": [
                {
                    "slug": "epic_5_1_share_and_history",
                    "title": "Share And History",
                    "summary": "Enable read-only tutor sharing and repeat-use weekly review value.",
                    "stories": [
                        {"id": "FE-030", "name": "Share Token And Read Only Page", "kind": "ui", "summary": "Generate share tokens, handle expiry/revoke, and render a sanitized read-only share page.", "value": "Turns reports into collaboration-ready artifacts for tutors.", "reqs": ["PAGE-011", "SHR-001", "SHR-002", "SHR-003"], "tests": ["PAGE-SHR-001", "PAGE-SHR-002", "PAGE-SHR-003", "PAGE-SHR-004", "PAGE-SHR-005", "API-SHR-001", "API-SHR-002", "DATA-SHR-001", "CLICK-006"], "files": ["app/share/[token]/page.tsx", "app/api/reports/[reportId]/share/route.ts", "app/api/share/[token]/route.ts", "lib/db/schema.ts"], "routes": ["/share/[token]"], "deps": ["FE-029"]},
                        {"id": "FE-031", "name": "History Timeline", "kind": "ui", "summary": "Show the child’s recent reports and weekly review entry points.", "value": "Creates the retention loop that turns one-time use into repeat use.", "reqs": ["HIS-001", "PAGE-006"], "tests": ["PAGE-CHD-004"], "files": ["app/(dashboard)/dashboard/children/[childId]/page.tsx", "components/history/ReportTimeline.tsx"], "routes": ["/dashboard/children/[childId]"], "deps": ["FE-028"]},
                        {"id": "FE-032", "name": "Weekly Review Compare And Parent Notes", "kind": "ui", "summary": "Compare consecutive reports and allow parents to record review notes.", "value": "Makes progress visible and actionable across weeks.", "reqs": ["HIS-002", "HIS-003", "AI-007"], "tests": ["PAGE-CHD-005", "PAGE-CHD-006", "API-HIS-001", "DATA-HIS-001", "AI-RVW-001", "CLICK-009"], "files": ["app/(dashboard)/dashboard/children/[childId]/page.tsx", "components/history/WeeklyReview.tsx", "app/api/children/[childId]/weekly-review/route.ts"], "routes": ["/dashboard/children/[childId]"], "deps": ["FE-031"]},
                    ],
                },
                {
                    "slug": "epic_5_2_billing",
                    "title": "Billing",
                    "summary": "Connect one-time and monthly checkout to unlock gating and webhook-safe entitlements.",
                    "stories": [
                        {"id": "FE-033", "name": "Stripe Checkout And Webhook Entitlements", "kind": "ui", "summary": "Offer one-time and monthly checkout, enforce lock/unlock, and handle webhook idempotency.", "value": "Creates the first real revenue loop for the product.", "reqs": ["PAGE-010", "BIL-001", "BIL-002", "BIL-003", "BIL-004"], "tests": ["PAGE-BIL-001", "PAGE-BIL-002", "PAGE-BIL-003", "PAGE-BIL-004", "PAGE-BIL-005", "PAGE-BIL-006", "API-BIL-001", "API-BIL-002", "API-BIL-003", "API-BIL-004", "DATA-BIL-001", "DATA-BIL-002", "CLICK-007"], "files": ["app/(dashboard)/dashboard/billing/page.tsx", "app/api/stripe/checkout/route.ts", "app/api/stripe/webhook/route.ts", "lib/db/schema.ts"], "routes": ["/dashboard/billing"], "deps": ["FE-030"]},
                        {"id": "FE-034", "name": "Sprint 5 Acceptance", "kind": "acceptance", "summary": "Confirm share, history, and billing flows behave together before Should-scope delivery starts.", "value": "Stops collaboration or payment regressions from moving downstream.", "reqs": ["GOV-003"], "tests": ["PAGE-SHR-001", "PAGE-BIL-004", "PAGE-CHD-005", "CLICK-006", "CLICK-007", "CLICK-009"], "files": ["docs/requirements/prd_traceability_matrix.md", "docs/testing/click_path_matrix.md", "tasks/backlog_v1/sprint_5_share_history_billing/sprint_plan.md"], "deps": ["FE-030", "FE-031", "FE-032", "FE-033"]},
                    ],
                },
            ],
        },
    ]
)


def story_type(kind: str) -> str:
    return {
        "ui": "ui_story",
        "backend": "ordinary_story",
        "devops": "ordinary_story",
        "docs": "ordinary_story",
        "acceptance": "sprint_acceptance_story",
    }[kind]


def required_modes(kind: str) -> list[str]:
    if kind == "ui":
        return ["plan-eng-review", "browse", "plan-design-review", "design-consultation", "design-review", "qa", "review", "code_acceptance", "acceptance_gate", "doc_writer"]
    if kind == "acceptance":
        return ["plan-eng-review", "browse", "qa", "review", "code_acceptance", "acceptance_gate", "doc_writer", "ship", "document-release", "retro"]
    return ["plan-eng-review", "qa", "review", "code_acceptance", "acceptance_gate", "doc_writer"]


def auth_expectations(story: dict) -> str:
    routes = story.get("routes", [])
    if any(route.startswith("/admin") for route in routes):
        return "admin_auth_required"
    if any(route.startswith("/share") for route in routes):
        return "public_read_only_access"
    if routes:
        return "parent_auth_required"
    return "no_browser_auth"


def expected_evidence(kind: str) -> list[str]:
    if kind == "ui":
        return ["before_after_screenshots", "browse_console_log", "browse_network_log", "qa_test_output", "acceptance_checklist"]
    if kind == "acceptance":
        return ["traceability_audit", "sprint_acceptance_report", "browser_regression_pack", "api_data_assertions", "remaining_risks_log"]
    return ["test_output", "review_report", "code_acceptance_report", "acceptance_checklist"]


def sprint_story_count(sprint: dict) -> int:
    return sum(len(epic["stories"]) for epic in sprint["epics"])


def build_sprint_overview() -> str:
    lines = [
        "# FamilyEducation Parent Dashboard Backlog v1.2",
        "",
        "## Sprint Overview",
        "| Sprint | Name | Epic Count | Story Count | Core Goal |",
        "| :--- | :--- | :--- | :--- | :--- |",
    ]
    for sprint in SPRINTS:
        lines.append(
            f"| Sprint {sprint['number']} | {sprint['name']} | {len(sprint['epics'])} | {sprint_story_count(sprint)} | {sprint['goal']} |"
        )
    lines.extend(
        [
            "",
            "## Governance Notes",
            "- Every Story card includes `requirement_ids`, `test_case_ids`, and `expected_evidence`.",
            "- Every Sprint includes a dedicated Sprint Acceptance Story.",
            "- No Sprint is complete without `ship`, `document-release`, and `retro` at the workflow level.",
            "- Final product completion requires Sprint 8 plus the full program acceptance gate.",
        ]
    )
    return "\n".join(lines)


def build_epic_md(epic: dict) -> str:
    lines = [
        f"# {epic['title']}",
        "",
        epic["summary"],
        "",
        "| Story ID | Story Name | Type | Requirement IDs |",
        "| --- | --- | --- | --- |",
    ]
    for story in epic["stories"]:
        lines.append(f"| {story['id']} | {story['name']} | {story_type(story['kind'])} | {' '.join(story['reqs'])} |")
    return "\n".join(lines)


def build_sprint_plan(sprint: dict) -> str:
    lines = [
        f"# Sprint {sprint['number']} Plan",
        "",
        "## Sprint Name",
        sprint["name"],
        "",
        "## Goal",
        sprint["goal"],
        "",
        "## Exit Criteria",
        "- All sprint stories are accepted.",
        "- Traceability rows owned by this sprint are auditable.",
        "- Sprint Acceptance Story passes with evidence.",
        "- Ship, document-release, and retro are ready to run through agentsystem.",
        "",
        "## Epic Overview",
        "| Epic | Story Count | Core Responsibility |",
        "| :--- | :--- | :--- |",
    ]
    for epic in sprint["epics"]:
        lines.append(f"| {epic['title']} | {len(epic['stories'])} | {epic['summary']} |")
    lines.extend(["", "## Delivery Order"])
    order = []
    for epic in sprint["epics"]:
        for story in epic["stories"]:
            order.append(story["id"])
    for idx, story_id in enumerate(order, start=1):
        lines.append(f"{idx}. {story_id}")
    lines.extend(
        [
            "",
            "## Sprint Acceptance Reminder",
            "- The Sprint Acceptance Story must run the relevant page, click, API, data, and traceability checks.",
            "- Any non-green requirement row blocks sprint closeout.",
        ]
    )
    return "\n".join(lines)


def build_story_yaml(sprint: dict, epic: dict, story: dict) -> str:
    lines = [
        'project: "familyEducation"',
        f'task_id: "{story["id"]}"',
        f'task_name: "{story["name"]}"',
        f'sprint: "Sprint {sprint["number"]} {sprint["name"]}"',
        f'epic: "{epic["title"]}"',
        f'story_id: "{story["id"]}"',
        'auto_run: true',
        'execution_policy: "continuous_full_sprint"',
        'interaction_policy: "non_interactive_auto_run"',
        'pause_policy: "story_boundary_or_shared_blocker_only"',
        'agent_policy: "auto"',
        f'blast_radius: "{"L2" if story["kind"] in {"ui", "backend"} else "L1"}"',
        'execution_mode: "Safe"',
        'mode: "Safe"',
        f'story_type: "{story_type(story["kind"])}"',
        f'session_policy: "{"authenticated_browser_required" if story["kind"] == "ui" else "authenticated_browser_and_runtime_evidence_required" if story["kind"] == "acceptance" else "no_browser_required"}"',
        f'auth_expectations: "{auth_expectations(story)}"',
        'workflow_enforcement_policy: "strict_agentsystem"',
        'upstream_agent_parity: "required"',
        'approval_required: false',
        f'goal: "{story["summary"]}"',
        f'business_value: "{story["value"]}"',
        "requirement_ids:",
    ]
    for req in story["reqs"]:
        lines.append(f'  - "{req}"')
    lines.append("test_case_ids:")
    for test in story["tests"]:
        lines.append(f'  - "{test}"')
    lines.append("expected_evidence:")
    for evidence in expected_evidence(story["kind"]):
        lines.append(f'  - "{evidence}"')
    lines.append("required_modes:")
    for mode in required_modes(story["kind"]):
        lines.append(f'  - "{mode}"')
    lines.append("entry_criteria:")
    lines.append('  - "Read docs/需求文档.md and docs/saas-starter 一天落地实施说明.md as the product truth source."')
    lines.append('  - "Read docs/requirements/prd_requirement_index.md and docs/requirements/prd_traceability_matrix.md before making scope decisions."')
    if story["deps"]:
        lines.append(f'  - "Dependencies accepted: {" ".join(story["deps"])}."')
    lines.append("acceptance_criteria:")
    for req in story["reqs"]:
        lines.append(f'  - "{REQ_TEXT.get(req, req)}"')
    lines.append("constraints:")
    lines.append('  - "Do not mark requirement rows green without attached evidence."')
    lines.append('  - "Do not expand beyond the declared route/API/schema/document scope unless a blocker explicitly requires it."')
    if story["kind"] == "ui":
        lines.append('  - "Collect browse, design, and browser QA evidence for the changed routes."')
    if story["kind"] == "acceptance":
        lines.append('  - "Do not add new feature work in this Story; this Story is only for regression, audit, and evidence."')
    lines.append("out_of_scope:")
    lines.append('  - "Any requirement not explicitly listed in requirement_ids."')
    lines.append("dependencies:")
    if story["deps"]:
        for dep in story["deps"]:
            lines.append(f'  - "{dep}"')
    else:
        lines.append("  []")
    if story.get("routes"):
        lines.append('preview_base_url: "http://127.0.0.1:3000"')
        lines.append("preview_urls:")
        for route in story["routes"]:
            lines.append(f'  - "http://127.0.0.1:3000{route}"')
        lines.append("qa_urls:")
        for route in story["routes"]:
            lines.append(f'  - "http://127.0.0.1:3000{route}"')
    lines.append("related_files:")
    for file_path in story["files"]:
        lines.append(f'  - "{file_path}"')
    lines.append("primary_files:")
    for file_path in story["files"][: min(3, len(story["files"]))]:
        lines.append(f'  - "{file_path}"')
    lines.append("secondary_files:")
    for file_path in story["files"][min(3, len(story["files"])) :] or story["files"][:1]:
        lines.append(f'  - "{file_path}"')
    lines.append("story_inputs:")
    lines.append('  - "The linked requirement IDs from the PRD requirement index."')
    lines.append('  - "The linked tests from the page/click/API/data/AI matrices."')
    lines.append('  - "The current starter repository structure and route layout."')
    lines.append("story_process:")
    lines.append('  - "Confirm the requirement and test scope before touching code or docs."')
    lines.append('  - "Implement only the declared route/API/schema/document scope."')
    lines.append('  - "Produce the evidence listed under expected_evidence and update the traceability row status accordingly."')
    lines.append("story_outputs:")
    lines.append('  - "Scoped code or documentation changes."')
    lines.append('  - "Acceptance evidence tied to the declared test_case_ids."')
    lines.append('  - "A delivery packet suitable for downstream Sprint Acceptance."')
    lines.append("verification_basis:")
    lines.append('  - "All declared test_case_ids execute or are deterministically evidenced."')
    lines.append('  - "Review, code acceptance, and acceptance gate pass without blocker findings."')
    lines.append('  - "Requirement rows tied to this Story move to Green only with evidence."')
    lines.append("test_cases:")
    lines.append("  normal:")
    for test in story["tests"][: min(3, len(story["tests"]))]:
        lines.append(f'    - "Execute {test} and capture pass evidence."')
    lines.append("  exception:")
    lines.append(f'    - "Run the negative or edge coverage associated with {story["tests"][-1]}."')
    return "\n".join(lines)


def main() -> None:
    write("tasks/backlog_v1/sprint_overview.md", build_sprint_overview())
    registry = {"stories": []}
    for sprint in SPRINTS:
        sprint_dir = f"tasks/backlog_v1/{sprint['slug']}"
        write(f"{sprint_dir}/sprint_plan.md", build_sprint_plan(sprint))
        order: list[str] = []
        for epic in sprint["epics"]:
            write(f"{sprint_dir}/{epic['slug']}.md", build_epic_md(epic))
            epic_dir = f"{sprint_dir}/{epic['slug']}"
            for story in epic["stories"]:
                order.append(story["id"])
                write(f"{epic_dir}/{story['id']}.yaml", build_story_yaml(sprint, epic, story))
                registry["stories"].append(
                    {
                        "project": "familyEducation",
                        "backlog_id": "backlog_v1",
                        "sprint_id": sprint["slug"],
                        "story_id": story["id"],
                        "task_name": story["name"],
                        "status": "planned",
                        "required_modes": required_modes(story["kind"]),
                        "repository": "familyEducation",
                    }
                )
        write(f"{sprint_dir}/execution_order.txt", "\n".join(order))
    write("tasks/story_status_registry.json", json.dumps(registry, ensure_ascii=False, indent=2))
    write("tasks/story_acceptance_reviews.json", json.dumps({"reviews": []}, ensure_ascii=False, indent=2))
    write("tasks/runtime/README.md", "# Runtime Artifacts\n\nThis directory stores delivery-time story evidence for admissions, failures, and handoffs.")
    write("tasks/runtime/story_admissions/.gitkeep", "")
    write("tasks/runtime/story_failures/.gitkeep", "")
    write("tasks/runtime/story_handoffs/.gitkeep", "")
    write("tasks/runtime/agent_coverage_report.json", json.dumps({"project": "familyEducation", "status": "bootstrap_only", "note": "No Stories have been executed yet."}, ensure_ascii=False, indent=2))
    write("tasks/runtime/agent_coverage_report.md", "# Agent Coverage Report\n\nStatus: bootstrap only.\n")


if __name__ == "__main__":
    main()
