# FE-036 Pdf Export

- Story: `FE-036`
- Requirement: `SHD-001`
- Test cases:
  - `PAGE-RPT-009`
  - `API-PDF-001`

## Implemented Scope

- Kept the existing report export route and button path:
  - `components/reports/ExportPdfButton.tsx`
  - `app/api/reports/[reportId]/export/route.ts`
- Added locale-aware export links so the active report language also drives PDF output.
- Confirmed negative API responses stay distinct:
  - `401` when auth is unavailable
  - `404` when the report does not exist for the parent
  - `402` when the report is still locked behind billing

## Verification

- `node scripts/run_sprint6_should_scope_smoke.mjs`
  - `pdf_export_negative_statuses`
  - `pdf_export_download_stream`
- `node scripts/run_sprint6_should_scope_browser_smoke.mjs`
  - `pdf_export_locale_link_browser`

## Evidence Notes

- The API smoke validates a readable PDF response and confirms EN/ES export outputs are not byte-identical.
- The browser smoke validates that the report page exposes the export link and that the link tracks the current language toggle.
