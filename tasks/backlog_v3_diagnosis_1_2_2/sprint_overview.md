# FamilyEducation Backlog v3 Diagnosis 1.2.2

## Source
- `docs/需求文档_1.2_最终版.md`
- Version: `v1.2.2-final`
- Scope: professional diagnosis enhancement layer only.

## Sprint Overview

| Sprint | Name | Story Count | Core Goal |
| :--- | :--- | :--- | :--- |
| Sprint 15 | Professional Diagnosis Pipeline Foundation | 4 | Add the intake, problem-item, and taxonomy data foundation for stable diagnosis. |
| Sprint 16 | Diagnosis Productization And Calibration | 5 | Add diagnosis aggregation, 7-day prescription planning, confidence gates, share/report upgrades, and starter calibration assets. |

## Governance Notes
- This roadmap is separate from `backlog_v2_beta_launch` because `v1.2.2-final` is a P1 professional diagnosis lane, not a replacement for the existing P0/Beta launch lane.
- Every Story keeps `execution_policy: continuous_full_sprint`, `interaction_policy: non_interactive_auto_run`, and `workflow_enforcement_policy: strict_agentsystem`.
- Every implementation Story includes `requirement_ids`, `test_case_ids`, and `expected_evidence`.
- Each Sprint ends with a dedicated Sprint Acceptance Story that includes `ship`, `document-release`, and `retro`.
- Do not expand scope into tutor accounts, multi-subject, school/enterprise editions, native mobile, general analytics, or direct homework-answer generation.

## Delivery Order
1. Sprint 15: `FE-078` -> `FE-079` -> `FE-080` -> `FE-081`
2. Sprint 16: `FE-082` -> `FE-083` -> `FE-084` -> `FE-085` -> `FE-086`

