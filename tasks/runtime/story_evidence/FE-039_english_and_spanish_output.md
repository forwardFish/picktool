# FE-039 English And Spanish Output

- Story: `FE-039`
- Requirement: `SHD-004`
- Test cases:
  - `PAGE-I18N-001`
  - `API-I18N-001`

## Implemented Scope

- Converted report localization to an explicit per-report toggle instead of relying only on account locale:
  - `app/(dashboard)/dashboard/reports/[reportId]/page.tsx`
  - `app/api/reports/[reportId]/route.ts`
  - `app/api/reports/[reportId]/export/route.ts`
  - `lib/reports/localize.ts`
- The active language now propagates through report UI labels and the exported PDF.

## Verification

- `node scripts/run_sprint6_should_scope_smoke.mjs`
  - `localized_report_api`
- `node scripts/run_sprint6_should_scope_browser_smoke.mjs`
  - `report_language_toggle_browser`
  - `pdf_export_locale_link_browser`

## Evidence Notes

- API verification confirms EN/ES payload labels resolve differently for the same report.
- Browser verification confirms the same report page can switch language in place and that export links follow the active locale.
