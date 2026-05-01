# Sprint 26 Release Notes

## Scope Closed

- Provider-neutral billing contract and service selection layer are implemented.
- Freemius shell and Creem rollback path are both wired behind the same service boundary.
- Additive billing tables for provider accounts, entitlements, and webhook idempotency are in place.
- Billing snapshot authority now flows through the entitlement projection layer with documented compat fallback order.
- Sprint 26 acceptance, traceability, ship, and retro artifacts were generated.

## Key Evidence

- `tasks/runtime/qa_results/sprint_26_delivery_results.json`
- `tasks/runtime/sprint_acceptance/sprint_26_acceptance_report.md`
- `tasks/runtime/traceability_audits/sprint_26_traceability_audit.md`
- `tasks/runtime/story_handoffs/FE-117.md`
- `tasks/runtime/story_handoffs/FE-118.md`
- `tasks/runtime/story_handoffs/FE-119.md`

## Explicit Non-Scope

- Public checkout route cutover to `POST /api/checkout`
- Public portal route cutover to `POST /api/portal`
- Primary webhook route cutover to `POST /webhook`
- Public Pathnook homepage/legal/footer/copy changes

These items remain deferred to later billing and public-surface sprints.
