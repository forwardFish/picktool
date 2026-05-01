# FamilyEducation Backlog v2.0 Beta Launch

## Sprint Overview

| Sprint | Name | Epic Count | Story Count | Core Goal |
| :--- | :--- | :--- | :--- | :--- |
| Sprint 9 | Production Readiness Foundation | 2 | 4 | Move the product from local-only assumptions into a real preview/production-ready baseline with storage, smoke, and observability foundations. |
| Sprint 10 | Live Billing And Auth | 2 | 4 | Connect live Creem billing, webhook entitlements, and production-grade Google OAuth while preserving normal account login. |
| Sprint 11 | Conversion Layer | 2 | 5 | Turn landing, pricing, and sample-report surfaces into a measurable conversion funnel. |
| Sprint 12 | Report Quality And Run Reliability | 2 | 5 | Upgrade diagnosis quality, evidence clarity, plan actionability, and upload/run explainability. |
| Sprint 13 | Retention And Tutor Handoff | 2 | 5 | Deepen weekly review, history/trends, annual-plan value, and tutor-handoff workflows. |
| Sprint 14 | Privacy And Beta Launch | 2 | 5 | Close privacy/deletion UX, audit boundaries, and Beta release governance with a final verdict. |

## Governance Notes

- Every Story card includes `requirement_ids`, `test_case_ids`, and `expected_evidence`.
- Every Story card keeps `execution_policy: continuous_full_sprint`, `interaction_policy: non_interactive_auto_run`, and `workflow_enforcement_policy: strict_agentsystem`.
- Every Sprint includes a dedicated Sprint Acceptance Story.
- Every Sprint Acceptance Story must run with `ship`, `document-release`, and `retro`.
- Final next-phase completion requires Sprint 14 plus the Beta final acceptance gate in `docs/testing/next_phase/final_program_acceptance.md`.
- `docs/需求文档_1.1.md` is the only approved next-phase business source unless a formally checked-in derived spec is added later.

## Planning Assumption

- `docs/需求文档_1.1.md` references `parent-dashboard-copy-and-pricing-spec.md`, but that file is not currently present in the repository. Sprint 11 should therefore treat `docs/需求文档_1.1.md` as the authoritative landing/pricing/sample-report source and only treat any future copy spec as refinement rather than scope reset.
