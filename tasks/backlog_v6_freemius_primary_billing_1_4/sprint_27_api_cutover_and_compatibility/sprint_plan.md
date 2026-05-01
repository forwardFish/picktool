# Sprint 27 Plan

## Sprint Name
API Cutover And Compatibility

## Goal
Move checkout, portal, and webhook flows onto the new billing service while preserving compatibility facades and hidden Creem routes for rollback.

## Exit Criteria
- `POST /api/checkout` and `POST /api/portal` are defined as the new primary service entry points.
- `POST /webhook` is defined as the Freemius webhook receiver with idempotent event persistence.
- `/api/billing/checkout-session` and `/api/creem/*` remain available as compatibility paths but no longer define the public default flow.
- Feature flags control public exposure versus compatibility fallback.

## Epic Overview
| Epic | Story Count | Core Responsibility |
| :--- | :--- | :--- |
| Checkout And Portal | 1 | Cut the main checkout and portal entry points over to the billing service. |
| Webhook And Compatibility | 1 | Add the primary webhook route and route existing compatibility handlers through the service layer. |
| Sprint Acceptance | 1 | Close the API sprint only if the new routes, compat layers, and webhook idempotency contract are fully covered. |

## Delivery Order
1. FE-121
2. FE-122
3. FE-123

## Anti-Stall Breakdown
- Use [tasks/compact_execution_1_4_1_5.md](/d:/lyh/agent/agent-frame/familyEducation/tasks/compact_execution_1_4_1_5.md) as the execution pack for this sprint.
- `FE-121`: run `FE-121-A -> FE-121-B -> FE-121-C`; keep webhook and UI work out.
- `FE-122`: run `FE-122-A -> FE-122-B -> FE-122-C`; finish idempotent persistence before replay proof.
- `FE-123`: audit only; no route or provider implementation edits.
