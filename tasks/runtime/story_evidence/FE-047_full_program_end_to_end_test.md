# FE-047 Full Program End To End Test

- Story: `FE-047`
- Requirement: `GOV-004`
- Test cases:
  - `FP-002`
  - `RESP-001`
  - `RESP-002`
  - `RESP-003`
  - `NF-001`
  - `CLICK-006`
  - `CLICK-007`
  - `CLICK-009`
  - `CLICK-010`

## Acceptance Scope

- Re-ran the current-state final API/data/AI/ops smoke suite against the local deterministic runtime.
- Re-ran the final browser evidence pack for desktop/mobile route coverage and the admin review browser flow for the release path.
- Re-ran Sprint 1 browser onboarding coverage to re-check the public-to-dashboard entry path in the final program lane.

## Verification

- `node scripts/run_final_program_smoke.mjs`
- `node scripts/run_final_browser_evidence_pack.mjs`
- `node scripts/run_admin_review_browser_smoke.mjs`
- `node scripts/run_sprint1_browser_smoke.mjs`
- `node scripts/run_sprint8_smoke.mjs`
- `node scripts/run_sprint8_browser_smoke.mjs`
- `tasks/runtime/final_acceptance/final_api_smoke_manifest.json`
- `tasks/runtime/browser_evidence/final_browser_evidence_manifest.json`

## Evidence Notes

- The final smoke manifest now covers child, upload, run, report, billing, share, tutor, reminder, delete, retention, telemetry, and cost-artifact flows in one deterministic lane.
- The final browser manifest now captures desktop and mobile evidence for landing, pricing, sign-up, sign-in, dashboard, child detail, upload, run status, report, billing, tutor workspace, share, and admin review.
