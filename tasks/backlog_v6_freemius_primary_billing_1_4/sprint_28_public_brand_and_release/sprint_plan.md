# Sprint 28 Plan

## Sprint Name
Public Brand And Release

## Goal
Switch public copy to Pathnook, ship a Freemius-first billing center, hide Creem from public flows, and close the `1.4` lane with regression and release evidence.

## Exit Criteria
- Landing, pricing, footer, legal, and trust copy use `Pathnook` publicly and no longer expose `FamilyEducation` or `Creem` in public billing surfaces.
- `/dashboard/billing` renders a Pathnook billing center with entitlement, plan, portal, and provider-status states.
- Public UI does not fall back to Creem copy when Freemius configuration is incomplete; it shows a controlled unavailable state instead.
- Final acceptance captures browser, API, webhook replay, entitlement diff, and public-route smoke evidence.

## Epic Overview
| Epic | Story Count | Core Responsibility |
| :--- | :--- | :--- |
| Public Brand And Legal UI | 1 | Switch public Pathnook copy, trust, and legal/billing disclosure text. |
| Billing Center And Regression | 1 | Deliver the dashboard billing center, unavailable-state UX, and regression evidence map. |
| Sprint Acceptance | 1 | Close the lane only if Pathnook branding, Freemius-first UX, compatibility fallback, and regression coverage are all green. |

## Delivery Order
1. FE-124
2. FE-125
3. FE-126

## Anti-Stall Breakdown
- Use [tasks/compact_execution_1_4_1_5.md](/d:/lyh/agent/agent-frame/familyEducation/tasks/compact_execution_1_4_1_5.md) as the execution pack for this sprint.
- `FE-124`: run `FE-124-A -> FE-124-B -> FE-124-C`; keep dashboard billing work out.
- `FE-125`: run `FE-125-A -> FE-125-B -> FE-125-C`; keep homepage/public copy work out.
- `FE-126`: audit only; close the lane with evidence, not new implementation.
