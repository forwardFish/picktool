# FamilyEducation Backlog v7 Homepage Display Rewrite 1.5

## Source
- `docs/需求文档_1.5.md`
- `docs/需求文档_1.4.md`
- `docs/requirements/prd_requirement_index.md`
- `docs/requirements/prd_traceability_matrix.md`
- Version: `v1.5-homepage-display-rewrite`
- Scope: Pathnook homepage positioning rewrite, Stage 1 public narrative clarification, responsive polish, and public-surface release evidence.

## Sprint Overview

| Sprint | Name | Story Count | Core Goal |
| :--- | :--- | :--- | :--- |
| Sprint 29 | Bootstrap And Traceability | 3 | Bootstrap the `1.5` backlog root, register `HOME15-*` requirements/tests, and freeze the current homepage baseline before rewrite work begins. |
| Sprint 30 | Homepage Narrative And Structure Rewrite | 3 | Rewrite the homepage hero, positioning, why-use, Stage 1 value, proof, trust, and Stage 2 bridge structure around the new Pathnook system definition. |
| Sprint 31 | Public Surface Completion And Release | 3 | Finish how-it-works, pricing preview, FAQ, footer, responsive polish, CTA flow checks, and formal final acceptance for the `1.5` lane. |

## Governance Notes
- `docs/需求文档_1.5.md` is the authoritative contract for this backlog.
- `1.4 v6` remains the active execution lane until `FE-126` closes; `v7` is pre-registered as the next authoritative lane.
- Every story keeps `execution_policy: continuous_full_sprint`, `interaction_policy: non_interactive_auto_run`, and `workflow_enforcement_policy: strict_agentsystem`.
- The homepage must position `Pathnook` as an AI learning and growth system while keeping Stage 1 family learning support as the current public focus.
- Public homepage rewrite stories may change copy, layout, and presentation, but may not expand billing-provider mechanics, webhook behavior, or deck runtime scope.

## Inheritance Rules
- Reuse the accepted public Pathnook billing/legal direction from `backlog_v6_freemius_primary_billing_1_4` as the baseline trust surface.
- Reuse the current landing, pricing, FAQ, footer, sample-report CTA, and legal route structure as the implementation substrate rather than rebuilding public routing.
- Reuse accepted Stage 1 diagnosis, report, share, and walkthrough capabilities as supporting proof points, but keep them secondary to the homepage positioning story.
- `1.5` may update public homepage components and related public display components only; it must not reopen provider architecture or entitlement infrastructure work from `1.4`.

## Delivery Order
1. Sprint 29: `FE-127` -> `FE-128` -> `FE-129`
2. Sprint 30: `FE-130` -> `FE-131` -> `FE-132`
3. Sprint 31: `FE-133` -> `FE-134` -> `FE-135`
