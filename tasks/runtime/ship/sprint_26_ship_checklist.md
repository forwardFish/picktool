# Sprint 26 Ship Checklist

- Sprint 26 provider/data foundation changes compiled with `pnpm exec tsc --noEmit --pretty false`.
- Sprint 26 provider/data regression tests passed with `npx tsx --test tests/billing-provider.test.ts tests/billing-entitlements.test.ts`.
- Next.js production build passed with `pnpm build`.
- Planning asset integrity passed with `python scripts/validate_planning_assets.py`.
- Sprint 26 acceptance and traceability artifacts were updated under `tasks/runtime/qa_results/`, `tasks/runtime/sprint_acceptance/`, and `tasks/runtime/traceability_audits/`.
- FE-118 and FE-119 implementation handoffs were added under `tasks/runtime/story_handoffs/`.
- Public route cutover, public Pathnook copy, and billing-center release polish remain deferred follow-up work and are not part of this ship checklist.
