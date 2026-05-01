# FamilyEducation Backlog v4 Diagnosis Player 1.3.x

## Source
- `docs/需求文档_1.3.md`
- `docs/需求文档_1.3.1.md`
- `docs/需求文档_1.3.2.md`
- `docs/需求文档_1.3.3.md`
- Version: `v1.3.x-player-lane`
- Scope: diagnosis deck generation, playback, share walkthrough, admin review, and export enhancement.

## Sprint Overview

| Sprint | Name | Story Count | Core Goal |
| :--- | :--- | :--- | :--- |
| Sprint 17 | Continuity And Schema | 3 | Repair continuity drift, bootstrap the 1.3.x backlog assets, add deck persistence contracts, and close the sprint with formal acceptance. |
| Sprint 18 | Generation And Gate | 3 | Generate a guided diagnosis deck from accepted diagnosis facts, enforce deck quality degrade rules, and close the sprint with formal acceptance. |
| Sprint 19 | Player Routes And Playback | 4 | Deliver playback core plus parent/share guided walkthrough routes and close the sprint with formal acceptance. |
| Sprint 20 | Admin Export And Release | 3 | Close the lane with deck review, export lifecycle, metrics, and formal acceptance. |

## Governance Notes
- `需求文档_1.3.3.md` is the product-positioning rulebook for all user-facing copy and default UX in this lane.
- Accepted assets from `backlog_v1`, `backlog_v2_beta_launch`, and `backlog_v3_diagnosis_1_2_2` remain immutable.
- Stories in this lane may only add dependency references, regression coverage, and traceability links back to accepted v2/v3 capabilities.
- Every story keeps `execution_policy: continuous_full_sprint`, `interaction_policy: non_interactive_auto_run`, and `workflow_enforcement_policy: strict_agentsystem`.
- Each sprint ends with a dedicated acceptance story; Sprint 20 closes only after the full deck lane acceptance sweep is green.

## Inheritance Rules
- Reuse `backlog_v2_beta_launch` Sprint 11 and Sprint 13 for landing, pricing, sample-report, share, tutor, and retention context.
- Reuse `backlog_v3_diagnosis_1_2_2` Sprint 15 and Sprint 16 for diagnosis facts, 7-day plan, quality gate, and share payload foundations.
- Deck generation must consume report/share facts and structured evidence; it must not re-parse raw DOM content.

## Delivery Order
1. Sprint 17: `FE-087` -> `FE-088` -> `FE-097`
2. Sprint 18: `FE-089` -> `FE-090` -> `FE-098`
3. Sprint 19: `FE-093` -> `FE-091` -> `FE-092` -> `FE-099`
4. Sprint 20: `FE-094` -> `FE-095` -> `FE-096`
