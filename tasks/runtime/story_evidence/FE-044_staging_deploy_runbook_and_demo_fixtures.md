# FE-044 Staging Deploy Runbook And Demo Fixtures

- Story: `FE-044`
- Requirement: `OPS-003`
- Test cases:
  - `OPS-RLS-001`
  - `OPS-RLS-002`

## Scope Delivered

- Added a release-candidate staging runbook with env checklist, migration dry run, minimum smoke path, and blocker notes.
- Added the demo fixture guide plus a concrete fixture-pack manifest for local release-candidate replay.
- Updated the handoff path to describe Sprint 7 as local release-candidate hardening rather than a claimed live deployment.

## Verification

- `node scripts/run_sprint7_smoke.mjs`
- `python scripts/run_sprint7_delivery.py`

## Evidence

- `docs/release/staging_runbook.md`
- `docs/release/demo_fixtures.md`
- `tasks/runtime/fixtures/release_candidate_fixture_pack.json`
- `docs/handoff/current_handoff.md`
- `PROJECT_STATE.md`
