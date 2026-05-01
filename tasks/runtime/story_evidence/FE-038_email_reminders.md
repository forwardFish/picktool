# FE-038 Email Reminders

- Story: `FE-038`
- Requirement: `SHD-003`
- Test cases:
  - `API-NTF-001`
  - `OPS-NTF-001`

## Implemented Scope

- Added a safe-fallback reminder scheduler and artifact store:
  - `lib/notifications/reminders.ts`
  - `app/api/notifications/schedule/route.ts`
- Reminder delivery remains artifact-only; no live email provider is required.
- Report-ready reminders now fire when billing unlock makes a report readable.
- Weekly-review reminders can be scheduled through the dedicated API route.

## Verification

- `node scripts/run_sprint6_should_scope_smoke.mjs`
  - `report_ready_reminder_artifact`
  - `weekly_review_reminder_artifact`

## Evidence Notes

- Reminder artifacts persist in `tasks/runtime/family_local_runtime/reminder_events.json`.
- The smoke verifies both reminder kinds and confirms the stored delivery channel remains `email_safe_fallback`.
