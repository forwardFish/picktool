# FE-042 Delete Entry Points And Retention Controls

- Story: `FE-042`
- Requirement: `OPS-001`
- Test cases:
  - `OPS-DEL-001`
  - `OPS-DEL-002`
  - `NF-006`
  - `DATA-DEL-001`

## Scope Delivered

- Added delete entry points for child, upload, and report flows.
- Cascaded linked upload, run, report, share-link, reminder, and runtime observability cleanup.
- Added the retention policy document and a local cleanup script with an auditable JSON artifact.

## Verification

- `node scripts/run_sprint7_smoke.mjs`
- `node scripts/run_sprint7_browser_smoke.mjs`
- `python scripts/run_retention_cleanup.py`

## Evidence

- `app/api/uploads/[uploadId]/route.ts`
- `app/api/reports/[reportId]/route.ts`
- `components/children/upload-list-client.tsx`
- `components/ui/delete-resource-button.tsx`
- `docs/privacy/data_retention.md`
- `scripts/run_retention_cleanup.py`
- `tasks/runtime/retention/latest_cleanup_audit.json`
