# FE-040 Evidence Highlight Overlay

- Story: `FE-040`
- Requirements:
  - `SHD-005`
  - `REP-005`
- Test cases:
  - `PAGE-RPT-010`
  - `CLICK-004`

## Implemented Scope

- Kept the existing `highlightBox`-driven viewer and added an explicit fallback path:
  - `components/reports/PageViewer.tsx`
  - `components/reports/EvidenceTab.tsx`
- When a bounding box exists, the viewer renders the overlay preview.
- When a bounding box is absent, the viewer explains the fallback and still keeps the source-page link active.

## Verification

- `node scripts/run_sprint6_should_scope_browser_smoke.mjs`
  - `evidence_overlay_and_fallback_browser`

## Evidence Notes

- The browser smoke rewrites one evidence anchor in demo state to remove its bounding box, then verifies both the fallback message and the overlay path on another evidence item in the same report.
