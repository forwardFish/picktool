# Sprint 26 Plan

## Sprint Name
Provider And Data Layer

## Goal
Introduce provider abstraction, additive billing tables, entitlement projection, and old-table compatibility reads so Freemius can become the primary provider without breaking existing unlock logic.

## Exit Criteria
- Provider-neutral interfaces and service-layer entry points are defined.
- Freemius and Creem implementations are separated behind the billing service.
- Billing account, entitlement, and webhook-event tables exist with compatibility reads from existing billing data.
- The entitlement layer can compute local unlock status without trusting third-party state directly.

## Epic Overview
| Epic | Story Count | Core Responsibility |
| :--- | :--- | :--- |
| Provider Abstraction | 1 | Add the shared billing provider interface and service-selection layer. |
| Billing Data And Compatibility | 1 | Add additive billing tables and compatibility mapping from existing subscription/billing records. |
| Entitlements | 1 | Project provider purchases and subscriptions into local entitlement snapshots. |
| Sprint Acceptance | 1 | Close the provider/data sprint only if the new service contracts and persistence contracts are fully mapped. |

## Delivery Order
1. FE-117
2. FE-118
3. FE-119
4. FE-120

## Anti-Stall Breakdown
- Use [tasks/compact_execution_1_4_1_5.md](/d:/lyh/agent/agent-frame/familyEducation/tasks/compact_execution_1_4_1_5.md) as the execution pack for this sprint.
- `FE-117`: run `FE-117-A -> FE-117-B -> FE-117-C`; do not mix schema, routes, or UI.
- `FE-118`: run `FE-118-A -> FE-118-B -> FE-118-C`; keep the story additive and data-only.
- `FE-119`: run `FE-119-A -> FE-119-B -> FE-119-C`; route consumers only after projection rules exist.
- `FE-120`: audit only; no runtime implementation changes.
