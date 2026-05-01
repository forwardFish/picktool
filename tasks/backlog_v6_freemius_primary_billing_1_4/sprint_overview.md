# FamilyEducation Backlog v6 Freemius Primary Billing 1.4

## Source
- `docs/需求文档.md`
- `docs/需求文档_1.3.md`
- `docs/需求文档_1.3.1.md`
- `docs/需求文档_1.3.2.md`
- `docs/需求文档_1.3.3.md`
- `docs/需求文档_1.4.md`
- Version: `v1.4-freemius-primary-billing`
- Scope: Pathnook public-brand cutover, Freemius-primary billing architecture, local entitlement control, and Creem compatibility retention.
- Extension: `docs/需求文档_1.5.5_pathnook_pricing_v2.md` now acts as the pricing-v2 overlay for the public ladder, billing-center snapshot, and plan-to-provider mapping work inside this lane.

## Sprint Overview

| Sprint | Name | Story Count | Core Goal |
| :--- | :--- | :--- | :--- |
| Sprint 25 | Bootstrap And Traceability | 3 | Bootstrap the `1.4` backlog root, register `BILL14-*` requirements/tests, and freeze the public-copy and billing-gap baseline. |
| Sprint 26 | Provider And Data Layer | 4 | Introduce provider abstraction, entitlement logic, and additive billing tables while preserving old billing reads. |
| Sprint 27 | API Cutover And Compatibility | 3 | Route checkout, portal, and webhook traffic through the new billing service while keeping Creem compatibility endpoints available but hidden. |
| Sprint 28 | Public Brand And Release | 3 | Switch public copy to Pathnook, ship the billing center UX, hide Creem from public flows, and close the lane through formal acceptance. |

## Governance Notes
- `docs/需求文档_1.4.md` is the authoritative contract for this backlog.
- Public branding must switch to `Pathnook`; internal repository, table, and legacy field names may remain unchanged when they are compatibility-preserving.
- `Freemius` becomes the default public billing provider, but `Creem` code, env keys, and compatibility routes stay in the repository.
- Existing accepted backlog roots remain immutable references; v6 may add only new stories, traceability rows, regression coverage, and continuity switches.
- Every story keeps `execution_policy: continuous_full_sprint`, `interaction_policy: non_interactive_auto_run`, and `workflow_enforcement_policy: strict_agentsystem`.
- Sprint 28 closes only when the public Pathnook copy, Freemius-first billing entry points, entitlement mapping, compatibility layer, and regression evidence are all green.
- Pricing v2 is part of Sprint 28 release quality: the public ladder must reflect `Single Review / Starter / Plus / Family`, expose seat/subject/review semantics, and keep billing-center copy in sync with the same plan model.

## Inheritance Rules
- Reuse accepted billing shell, auth shell, and report paywall behavior from `backlog_v1` as the starting point for checkout and unlock UX.
- Reuse `backlog_v4_diagnosis_player_1_3_x` and `backlog_v5_stage1_boundary_1_3_4` as active dependency lanes for report/share/deck non-regression coverage; v6 must not reopen those scopes.
- Reuse the current `lib/payments/catalog.ts`, `lib/payments/actions.ts`, `lib/payments/creem.ts`, and `app/api/creem/*` structure as compatibility input, not as the final architectural shape.
- New billing work must remain additive inside the existing Next.js + Vercel + Drizzle application; no standalone backend service or separate billing repo may be introduced.

## Delivery Order
1. Sprint 25: `FE-114` -> `FE-115` -> `FE-116`
2. Sprint 26: `FE-117` -> `FE-118` -> `FE-119` -> `FE-120`
3. Sprint 27: `FE-121` -> `FE-122` -> `FE-123`
4. Sprint 28: `FE-124` -> `FE-125` -> `FE-126`
