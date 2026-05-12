# v2 QA Screenshot Archive Empty Fix Report

Generated: 2026-05-12
Updated: 2026-05-12 21:06 Asia/Shanghai

## Root Cause

`scripts/capture-qa-screenshots.py` captured the saved archive state first and then captured `archive-empty-desktop.png` later in the same `next start` process. With `ARCHIVE_STORE=memory`, archive items live in the server process memory, so the later `/archive` visit could see items saved earlier by the same screenshot run.

The previous `docs/qa-screenshots-v2/archive-empty-desktop.png` contained a saved archive card (`More professional plan - ChatGPT / Claude + CapCut + Canva`), so it was polluted and was not valid empty-state evidence.

## Fix

The script fix is intentionally minimal and limited to `scripts/capture-qa-screenshots.py`:

1. The `next start` process launched by the script now receives `ARCHIVE_STORE=memory` and `LLM_PROVIDER=mock` explicitly.
2. Added `capture_archive_empty(browser)`:
   - It calls `/api/archive` before any Copilot save.
   - It fails fast if `items` is not an empty array.
   - It only captures `archive-empty-desktop.png` after the page shows the empty-state text.
3. The capture order is now: home screenshots, archive empty screenshot, Copilot flow, archive save, archive with-item screenshot, tool detail screenshot.
4. The with-item capture verifies that the saved archive id is present in `/api/archive` before writing `archive-with-item-desktop.png`.

## Impact Scope

- QA screenshot script and QA screenshot artifacts.
- Smoke-test expectations updated to match the Chinese tool-detail page copy.
- Tool-detail visible section labels are localized to Chinese.
- No auth, database, payment, or real AI API integration.
- No new dependency.

## Acceptance Commands and Results

| Command | Result | Evidence |
|---|---:|---|
| `$env:ARCHIVE_STORE='memory'; $env:LLM_PROVIDER='mock'; pnpm run lint` | PASS | `tsc --noEmit` completed successfully. |
| `$env:ARCHIVE_STORE='memory'; $env:LLM_PROVIDER='mock'; pnpm test` | PASS | 32 tests passed. Node still prints the existing `MODULE_TYPELESS_PACKAGE_JSON` warning; this pass intentionally does not add `type: module`. |
| `$env:ARCHIVE_STORE='memory'; $env:LLM_PROVIDER='mock'; pnpm build` | PASS | Next.js 16.2.6 production build completed successfully; 21 static pages generated. |
| `$env:ARCHIVE_STORE='memory'; $env:LLM_PROVIDER='mock'; pnpm test:smoke` | PASS | 29 smoke checks passed across home, Copilot, archive, catalog, tool detail, setup detail, and API routes. |
| `$env:ARCHIVE_STORE='memory'; $env:LLM_PROVIDER='mock'; python scripts/capture-qa-screenshots.py` | PASS | All 10 QA screenshots were regenerated. |

## Screenshot Asset List

Target directory: `docs/qa-screenshots-v2`

- `home-desktop.png`
- `home-mobile.png`
- `archive-empty-desktop.png` - regenerated as a true empty state; it now shows `还没有保存方案。` and no saved archive card.
- `copilot-initial-desktop.png`
- `copilot-collapsed-sidebar-desktop.png`
- `copilot-professional-desktop.png`
- `copilot-full-plan-desktop.png`
- `copilot-refinement-completed-desktop.png`
- `archive-with-item-desktop.png`
- `tool-capcut-catalog-desktop.png`

## Remaining Watch Items

1. v1 legacy paths remain a broader migration watch item and are not part of this fix.
2. Node `MODULE_TYPELESS_PACKAGE_JSON` warning remains; per instruction, this pass does not add `type: module`.
3. The archive empty-state pollution is fixed and verified by regenerated screenshot evidence.

## Final Conclusion

The screenshot-order bug is fixed and verified. `archive-empty-desktop.png` is now captured before any archive save, the script fails fast if `/api/archive` is not empty, and the regenerated image shows the expected empty state.
