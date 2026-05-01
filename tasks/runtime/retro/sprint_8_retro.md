# Sprint 8 Retro

## What Worked

- The final deterministic smoke scripts now match the current product surface instead of relying on stale early-sprint wrappers.
- The final browser evidence pack produces route-level desktop/mobile artifacts and captures the current release-candidate shell clearly.
- The final acceptance workflow now separates local completion from external deployment follow-up, which keeps the verdict honest.

## What Was Hard

- Several legacy browser scripts assumed reports were immediately readable before the later billing gate existed.
- Final acceptance initially depended on stale Sprint 7 wrappers and needed to be realigned to current-state coverage.
- Browser note-persistence checks were sensitive to locator choice even after the underlying data had saved correctly.

## Next Follow-Through

- If remote deployment becomes in-scope, execute the staging runbook and capture new evidence instead of reusing local-only artifacts.
- Consider replacing the deprecated `middleware` convention with `proxy` in a later maintenance pass.
- Consider refreshing `baseline-browser-mapping` to remove repeated build warnings in future runs.
