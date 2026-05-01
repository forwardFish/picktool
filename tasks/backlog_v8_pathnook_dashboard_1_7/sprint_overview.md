# FamilyEducation Backlog v8 Pathnook Dashboard 1.7

## Source
- `docs/需求文档_1.7_pathnook_dashboard.md`
- `docs/requirements/prd_requirement_index.md`
- `docs/requirements/prd_traceability_matrix.md`
- Version: `v1.7-pathnook-dashboard`
- Scope: logged-in Pathnook workspace cutover for overview, members, reports, report detail, real-data aggregation, and demo-removal governance.

## Sprint Overview

| Sprint | Name | Story Count | Core Goal |
| :--- | :--- | :--- | :--- |
| Sprint 29 | Governance And Lane Bootstrap | 3 | Register the 1.7 lane, traceability, and acceptance structure without disturbing accepted 1.4/1.5 lanes. |
| Sprint 30 | Publish Contract And Data Foundations | 3 | Add missing schema/repository foundations for child notes, chat continuation, and start-diagnosis/publish contracts. |
| Sprint 31 | Overview And Members Workspace | 3 | Replace dashboard/member demo arrays with real-data aggregators, empty states, and resume/focus actions. |
| Sprint 32 | Reports Detail And Acceptance | 3 | Cut reports/detail to structured view models, add evidence-first detail tabs, and close the lane with regression evidence. |

## Governance Notes
- `docs/需求文档_1.7_pathnook_dashboard.md` is the authoritative contract for this backlog root.
- This lane is additive to `backlog_v6_freemius_primary_billing_1_4` and `backlog_v7_homepage_display_rewrite_1_5`; it must not rewrite accepted billing/homepage assets.
- Core rule: `real query first -> empty state -> no demo arrays`.
- The logged-in workspace may reuse current schemas and report blobs for compatibility, but page state must resolve from structured database objects first.
- `Settings` and full conversational AI productization remain out of scope for v8; only chat continuation foundations are allowed.

## Delivery Order
1. Sprint 29: `FE-136` -> `FE-137` -> `FE-138`
2. Sprint 30: `FE-139` -> `FE-140` -> `FE-141`
3. Sprint 31: `FE-142` -> `FE-143` -> `FE-144`
4. Sprint 32: `FE-145` -> `FE-146` -> `FE-147`
