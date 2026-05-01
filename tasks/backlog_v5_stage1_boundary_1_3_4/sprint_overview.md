# FamilyEducation Backlog v5 Stage 1 Boundary 1.3.4

## Source
- `docs/需求文档_1.3.md`
- `docs/需求文档_1.3.1.md`
- `docs/需求文档_1.3.2.md`
- `docs/需求文档_1.3.3.md`
- `docs/需求文档_1.3.4.md`
- Version: `v1.3.4-stage-boundary`
- Scope: stage-boundary decomposition for Stage 1 `must-do`, `light-do`, and explicit `postpone` guardrails.

## Sprint Overview

| Sprint | Name | Story Count | Core Goal |
| :--- | :--- | :--- | :--- |
| Sprint 21 | Boundary Bootstrap And Traceability | 3 | Bootstrap the `1.3.4` backlog root, switch continuity to v5, and expand the canonical requirement and testing matrices with `BND134-*` coverage. |
| Sprint 22 | Must-Do Core Alignment | 5 | Map the required Stage 1 fact, diagnosis, report, share, privacy, provider, and run-lifecycle contracts onto accepted implementation lanes without rewriting them. |
| Sprint 23 | Light-Lane Mapping | 4 | Position walkthrough, playback, export, and compare/timeline capabilities as lightweight enhancements backed by the dependent `v4` deck/player lane. |
| Sprint 24 | Final Boundary Closure | 2 | Freeze non-scope guardrails and close the `1.3.4` boundary lane through formal acceptance. |

## Governance Notes
- `docs/需求文档_1.3.4.md` is the authoritative stage-boundary contract for this backlog.
- `tasks/backlog_v4_diagnosis_player_1_3_x/` remains intact as the dependent light-lane backlog for deck/player execution; it is inherited, not rewritten.
- Accepted assets in `backlog_v1`, `backlog_v2_beta_launch`, and `backlog_v3_diagnosis_1_2_2` remain immutable and may only be referenced through dependency, regression, and traceability links.
- This backlog decomposes Stage 1 into `must-do`, `light-do`, and `postpone` classes; only `must-do` and `light-do` enter sprint execution.
- Every Story keeps `execution_policy: continuous_full_sprint`, `interaction_policy: non_interactive_auto_run`, and `workflow_enforcement_policy: strict_agentsystem`.
- Sprint 24 closes only after `BND134-*` rows are green or explicitly delegated to accepted dependency lanes with evidence.

## Inheritance Rules
- Reuse `backlog_v3_diagnosis_1_2_2` Sprint 15 and Sprint 16 as the accepted source for structured diagnosis facts, 7-day plan contracts, quality gates, and tutor-share payloads.
- Reuse `backlog_v4_diagnosis_player_1_3_x` Sprint 17 through Sprint 20 as the dependent light lane for guided walkthrough, playback, admin review, and export enhancement contracts.
- Reuse accepted `backlog_v1` and `backlog_v2_beta_launch` routes, auth, billing, history, and admin surfaces as the Stage 1 product shell.
- Boundary stories may add only planning, traceability, regression, and handoff assets; they must not rewrite accepted implementation cards in inherited lanes.

## Delivery Order
1. Sprint 21: `FE-100` -> `FE-101` -> `FE-102`
2. Sprint 22: `FE-103` -> `FE-104` -> `FE-105` -> `FE-106` -> `FE-107`
3. Sprint 23: `FE-108` -> `FE-109` -> `FE-110` -> `FE-111`
4. Sprint 24: `FE-112` -> `FE-113`
