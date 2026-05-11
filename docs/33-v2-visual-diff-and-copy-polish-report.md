# v2 Visual Diff And Copy Polish Report

Generated: 2026-05-11

## Scope

This report compares the v2 reference assets in `docs/pic` with the latest QA screenshot set in `docs/qa-screenshots-v2`, then lists the next copy-polish work needed for the AI Task Workflow Copilot MVP.

It is intentionally limited to frontend polish and readiness cleanup. It does not introduce auth, payment, a database, real AI API calls, or image generation.

## Reference Coverage

| Reference | Current route / screenshot | Status | Notes |
|---|---|---|---|
| `docs/pic/首页.png` | `docs/qa-screenshots-v2/home-desktop.png`, `home-mobile.png` | Implemented | Homepage keeps the single-task entry, dark SaaS hero, large task input, CTA, and example chips. |
| `docs/pic/搜索结果-1.png` | `copilot-initial-desktop.png` | Implemented | Initial Copilot state shows left current-plan sidebar, basic good-enough plan, upgrade options, and collapsed full plan. |
| `docs/pic/搜索结果-2.png` | `copilot-professional-desktop.png` | Implemented | Professional upgrade path adds Canva and updates the sidebar state. |
| `docs/pic/搜索结果-3.png` | Not captured in current QA set | Partial | The collapsed sidebar interaction exists, but a dedicated collapsed-sidebar screenshot should be captured. |
| `docs/pic/搜索结果-4.png` | `copilot-full-plan-desktop.png` | Implemented | Full execution plan renders only after user confirmation. |
| `docs/pic/搜索结果-5.png` | Not captured in current QA set | Partial | Refinement actions exist, but a dedicated post-refinement screenshot should be captured. |
| `docs/pic/详情页.png` | `/tools/[toolId]` via current app | Partial | Tool detail route was upgraded to the local catalog layout, so the visual shape differs from the older v1.2 reference by design. |

## Visual Findings

- Homepage: Acceptable for v2 MVP. The page matches the reference intent: focused task input, modern dark SaaS tone, clear CTA, and no directory-style clutter.
- Copilot initial state: Acceptable. The product principle of "good-enough plan first" is visible, and the full plan stays collapsed.
- Professional upgrade state: Acceptable. The user choice and added Canva path are visible.
- Full plan state: Acceptable. The four-column structure matches the reference intent, though the current density is slightly more compact than the mock.
- Archive page: Functional but not part of the original visual references. It now uses Chinese page copy and can remain utilitarian.
- Tool detail page: Useful for catalog SEO/data inspection, but it is no longer the primary v2 workflow. It should be treated as a secondary polish target.

## Copy Polish Completed In This Pass

- README now describes `AI Task Workflow Copilot` v2.0 instead of the old v1.2 decision-assistant positioning.
- Header/footer navigation changed from `Archive`, `Log in`, `Privacy`, and `Terms` to Chinese equivalents where visible.
- Copilot loading, save/archive, mobile sheet, and archive list/detail labels now use Chinese copy.
- Workflow option short labels changed from English snippets such as `View full plan`, `Good enough`, and `More professional` to Chinese labels.
- Smoke and QA screenshot scripts were updated to assert the current Chinese UI copy.

## Remaining Copy Polish List

| Area | Current issue | Recommendation | Priority |
|---|---|---|---|
| Tool detail page tabs | `Overview`, `Alternatives`, `Pricing`, `Reviews`, `Q&A` remain English. | Translate to `概览`, `替代工具`, `价格`, `评价`, `问答`. | P1 |
| Tool detail stats | `Rating`, `Reviews`, `Saves`, `Visits`, `No rating` remain English. | Translate labels while keeping numeric values unchanged. | P1 |
| Tool detail sections | `What is...`, `How to use...`, `Core Features`, `Top alternatives`, `Related topics` remain English. | Translate static wrappers; preserve tool names and imported catalog content. | P1 |
| Tool detail empty states | Toolify empty-state text is English. | Translate local fallback copy. | P1 |
| Legacy result/setup pages | Compatibility pages still use v1.2 English section titles. | Keep for compatibility unless they become primary entry points; document as legacy. | P2 |
| API error messages | Some JSON errors remain English. | Keep stable for tests and clients unless a UI layer displays them directly. | P2 |
| README | README is English. | Acceptable for developer docs; add a Chinese overview only if external collaborators need it. | P3 |

## Recommended Next QA Captures

1. Capture Copilot collapsed-sidebar state for `搜索结果-3.png` parity.
2. Capture post-refinement state for `搜索结果-5.png` parity.
3. Capture `/tools/capcut` desktop after copy localization.
4. Capture `/archive` after creating at least one saved plan, not only the empty state.

## Risk Notes

- The visual reference set mixes old v1.2 tool-detail designs and v2.0 Copilot designs. The primary product flow should continue to favor `/` and `/copilot`.
- Full visual matching should not override the v2 principle of progressive disclosure. Avoid turning `/copilot` into a dense dashboard.
- Toolify catalog content may remain partly English because source data is English. Local chrome and action labels should be Chinese first.
