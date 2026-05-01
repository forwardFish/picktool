# FE-037 Tutor Workspace Foundation

- Story: `FE-037`
- Requirement: `SHD-002`
- Test cases:
  - `PAGE-TUT-001`
  - `API-TUT-001`

## Implemented Scope

- Preserved `/dashboard/tutor` as a parent-owned tutor handoff shell rather than introducing a tutor auth system.
- Clarified the scope contract in:
  - `app/(dashboard)/dashboard/tutor/page.tsx`
  - `app/api/tutor/route.ts`
- The API now returns an explicit owner-scope marker while still limiting data to the current parent household.

## Verification

- `node scripts/run_sprint6_should_scope_smoke.mjs`
  - `tutor_workspace_owner_scope`
- `node scripts/run_sprint6_should_scope_browser_smoke.mjs`
  - `tutor_workspace_shell_browser`

## Evidence Notes

- The API smoke injects foreign-household data into demo state and verifies that `/api/tutor` does not leak it.
- The browser smoke verifies the shell, summary cards, and share-state language on `/dashboard/tutor`.
