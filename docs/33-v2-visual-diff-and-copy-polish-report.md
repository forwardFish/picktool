# v2 Visual Diff And Copy Polish Report

Generated: 2026-05-12

## Scope

This report compares the v2 reference assets in `docs/pic` with the QA screenshot set in `docs/qa-screenshots-v2`, then tracks copy-polish work for the AI Task Workflow Copilot MVP.

It is limited to frontend polish and readiness cleanup. It does not introduce auth, payment, a database, real AI API calls, or image generation.

## Reference Coverage

| Reference | Current route / screenshot | Status | Notes |
|---|---|---|---|
| `docs/pic/home.png` equivalent | `home-desktop.png`, `home-mobile.png` | Implemented | Homepage keeps the single-task entry, dark SaaS hero, large task input, CTA, and example chips. |
| `docs/pic/search-result-1.png` equivalent | `copilot-initial-desktop.png` | Implemented | Initial Copilot state shows left current-plan sidebar, basic good-enough plan, upgrade options, and collapsed full plan. |
| `docs/pic/search-result-2.png` equivalent | `copilot-professional-desktop.png` | Implemented | Professional upgrade path adds Canva and updates the sidebar state. |
| `docs/pic/search-result-3.png` equivalent | `copilot-collapsed-sidebar-desktop.png` | Covered by script | The collapsed sidebar interaction exists and now has a dedicated screenshot target. |
| `docs/pic/search-result-4.png` equivalent | `copilot-full-plan-desktop.png` | Implemented | Full execution plan renders only after user confirmation. |
| `docs/pic/search-result-5.png` equivalent | `copilot-refinement-completed-desktop.png` | Covered by script | Refinement completion now has a dedicated screenshot target. |
| `docs/pic/detail-page.png` equivalent | `tool-capcut-catalog-desktop.png` | Covered by script | Tool detail now follows the local catalog layout rather than the older v1.2 detail reference. |
| Archive saved state | `archive-with-item-desktop.png` | Covered by script | Archive can now be captured with a real saved workflow, not just the empty state. |

## Visual Findings

- Homepage: Acceptable for v2 MVP. The page matches the reference intent: focused task input, modern dark SaaS tone, clear CTA, and no directory-style clutter.
- Copilot initial state: Acceptable. The product principle of "good-enough plan first" is visible, and the full plan stays collapsed.
- Professional upgrade state: Acceptable. The user choice and added Canva path are visible.
- Full plan state: Acceptable. The four-column structure matches the reference intent, though the current density is slightly more compact than the mock.
- Archive page: Functional and utilitarian. It is now covered in both empty and saved-item states.
- Tool detail page: Useful for catalog SEO/data inspection, but it is no longer the primary v2 workflow. It should be treated as a secondary polish target.

## Copy Polish Completed

- README describes `AI Task Workflow Copilot` v2.0 instead of the old v1.2 decision-assistant positioning.
- Header/footer navigation changed from `Archive`, `Log in`, `Privacy`, and `Terms` to Chinese equivalents where visible.
- Copilot loading, save/archive, mobile sheet, and archive list/detail labels use Chinese copy.
- Workflow option short labels changed from English snippets such as `View full plan`, `Good enough`, and `More professional` to Chinese labels.
- Tool detail page chrome now localizes tabs, stat labels, section headings, pricing labels, empty states, and action labels while preserving imported tool data.
- Smoke and QA screenshot scripts assert the current Chinese UI copy.

## Remaining Copy Polish List

| Area | Current issue | Recommendation | Priority |
|---|---|---|---|
| Tool detail source data | Tool names, descriptions, features, pricing details, and imported Toolify content may remain English. | Preserve source data for accuracy; localize only chrome unless a translation pipeline is added. | P1 |
| Legacy result/setup pages | Compatibility pages still use v1.2 English section titles. | Keep for compatibility unless they become primary entry points; document as legacy. | P2 |
| API error messages | Some JSON errors remain English. | Keep stable for tests and clients unless a UI layer displays them directly. | P2 |
| README | README is English. | Acceptable for developer docs; add a Chinese overview only if external collaborators need it. | P3 |

## Recommended Next QA Captures

1. Re-run `scripts/capture-qa-screenshots.py` after visual polish changes.
2. Compare `copilot-collapsed-sidebar-desktop.png` with the collapsed-sidebar reference.
3. Compare `copilot-refinement-completed-desktop.png` with the refinement-completed reference.
4. Compare `tool-capcut-catalog-desktop.png` against the current catalog-detail target, not the old v1.2 static detail page.

## Risk Notes

- The visual reference set mixes old v1.2 tool-detail designs and v2.0 Copilot designs. The primary product flow should continue to favor `/` and `/copilot`.
- Full visual matching should not override the v2 principle of progressive disclosure. Avoid turning `/copilot` into a dense dashboard.
- Toolify catalog content may remain partly English because source data is English. Local chrome and action labels should be Chinese first.
