# PROJECT_STATE.md

## Repository Status
- Base repository: `nextjs/saas-starter`
- Local repository path: `D:\lyh\agent\agent-frame\familyEducation`
- Existing PRD docs remain preserved under `docs/`.
- This repository now has canonical planning, traceability, and testing assets under `docs/` plus authoritative backlog roots under `tasks/`.
- A new Freemius-primary billing lane now exists at `tasks/backlog_v6_freemius_primary_billing_1_4/` for `需求文档_1.4`.
- The homepage rewrite lane at `tasks/backlog_v7_homepage_display_rewrite_1_5/` for `需求文档_1.5` is now implemented and accepted locally.
- `tasks/backlog_v5_stage1_boundary_1_3_4/` remains the documented `1.3.4` boundary lane, and `tasks/backlog_v4_diagnosis_player_1_3_x/` remains the dependent deck/player lane.
- Continuity and runtime evidence scaffolding exists under `.meta/familyEducation/continuity/` and `tasks/runtime/`.
- `scripts/validate_planning_assets.py` can now verify v1, v3, v4, v5, v6, and v7 planning roots together before feature work starts.
- The local codebase already contains partial `1.3.x` deck/player implementation surfaces, but formal flow rows for those lanes remain planned until their acceptance stories close.
- The local codebase now carries an accepted `1.5 v7` homepage baseline with a real `/sample-report` route and HOME15 acceptance evidence.

## Accepted Delivery History
- Sprint 0 bootstrap is accepted with a passing planning-asset audit and a passing `pnpm build`.
- Sprint 1 through Sprint 8 of the local deterministic acceptance lane are accepted, covering auth, child CRUD, upload, run lifecycle, structured diagnosis facts, report tabs, billing/paywall, share, admin review, PDF export, tutor shell, reminders, localization, evidence highlight, retention, observability, and final local acceptance artifacts.
- `tests/deck-playback.test.ts` and the current local `npm run build` remain the key non-regression checks for the deck/player and web shell surface.

## Current Known Gaps
- `1.4` had a requirement document but no authoritative backlog, traceability, or testing lane until the new v6 bootstrap.
- Public `Pathnook` brand alignment is incomplete across landing, pricing, billing, footer, and support/legal surfaces.
- Billing is still architecturally Creem-centered in the current runtime code; Freemius provider abstraction, additive billing tables, entitlement projection, and primary routes have not yet started execution.
- `1.5` homepage rewrite is accepted locally, but future public-route polish should preserve the HOME15 copy guardrails and sample-report entry path.
- `FE-087` through `FE-113` remain outside formal closeout for the older `1.3.x` / `1.3.4` lanes, so `1.4` must treat them as dependency and regression context rather than as newly accepted scope.

## Next Best Step
- Run `python scripts/validate_planning_assets.py` from `familyEducation/` when preparing the next lane.
- Use `tasks/runtime/final_program_acceptance/home15_final_acceptance.md` as the latest accepted public-surface checkpoint.
- Decide the next authoritative backlog lane before reopening `NOW.md` into an active story.
