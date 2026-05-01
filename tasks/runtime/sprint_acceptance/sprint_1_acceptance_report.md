# Sprint 1 Acceptance Report

Date: `2026-04-04`
Sprint: `parent_identity_and_dashboard`
Acceptance Story: `FE-012`

## Implemented Scope
- FE-008 `18 Plus Signup Gate`
- FE-009 `Parent Auth Session And Account Shell`
- FE-010 `Child Profile Crud`
- FE-011 `Dashboard Information Architecture Nav And Public Shell`

## Verification Evidence
- `python scripts\validate_planning_assets.py`
- `pnpm build`
- `node scripts\run_sprint1_smoke.mjs`
- `node scripts\run_sprint1_browser_smoke.mjs`
- `tasks/runtime/qa_results/sprint_1_delivery_results.json`
- `tasks/runtime/sprint_acceptance/sprint_1_delivery_report.md`

## Passed Checks
- Planning assets remain structurally valid
- Production build succeeds
- Landing and pricing shells are browser-verified
- Sign-up validates 18+, password strength, and TOS gating
- Successful sign-up redirects into `/dashboard`
- Account page persists country, timezone, and locale selections
- Child create and edit flows are browser-verified
- Unauthenticated `/dashboard` redirect is verified and preserves the original destination
- Sign-in exposes a recovery entry, rejects wrong passwords, and returns to the original protected route after success
- Unauthenticated `/api/children` returns `401`
- Authenticated dashboard, children list, child detail, and children API all pass in deterministic demo-auth mode

## Runtime Notes
- Local Postgres still remains unavailable in this session because Docker Desktop could not start.
- Sprint 1 acceptance now uses the deterministic FamilyEducation demo-auth runtime to execute the authenticated flow end to end without weakening the route, session, or click-path assertions.

## Acceptance Decision
- Sprint 1 is accepted.
- FE-008 through FE-012 now have passing delivery evidence and no open blocker inside the Sprint 1 scope.
