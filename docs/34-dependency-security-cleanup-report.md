# Dependency Security Cleanup Report

Generated: 2026-05-11

## Summary

Local dependency audit was cleaned up using the project package manager (`pnpm`) and the official npm registry audit endpoint.

Initial `npm audit` could not run because this repository uses `pnpm-lock.yaml` rather than `package-lock.json`. Initial `pnpm audit` against the configured mirror registry also failed because the mirror audit endpoint was unavailable. The final audit was run with:

```bash
$env:npm_config_registry='https://registry.npmjs.org/'
pnpm audit --json
```

## Changes

- Upgraded `next` from `15.6.0-canary.59` to `16.2.6`.
- Upgraded `react` and `react-dom` from `19.1.0` to `19.2.6`.
- Upgraded `@tailwindcss/postcss` from `4.1.7` to `4.3.0`.
- Upgraded `tailwindcss` from `4.1.7` to `4.3.0`.
- Added a `pnpm.overrides.postcss = 8.5.14` override to force transitive PostCSS usage into the patched range.
- Removed obsolete Next canary experimental config. Next 16 build no longer accepts the old `experimental.ppr` / `experimental.clientSegmentCache` shape in this project without additional rendering-boundary changes.

## Audit Result

After the upgrade and override:

```text
critical: 0
high: 0
moderate: 0
low: 0
```

## Verification

The following checks were run after the dependency cleanup:

```bash
pnpm audit --json
npm run lint
npm test
npm run build
npm run test:smoke
```

All checks passed.

## Notes

- Next 16 is a larger dependency movement than the first attempted canary patch. It was chosen because the remaining Next audit finding required `16.1.5` or later.
- The app currently runs without Partial Prerendering / Cache Components enabled. Re-enabling `cacheComponents` should be handled as a separate rendering pass because dynamic archive detail pages need additional Suspense/cache boundaries under Next 16.
- The project runs on Node `v24.13.0` locally, which satisfies the package engine requirements observed during install.
- `pnpm install` still reports ignored build scripts for `@tailwindcss/oxide` and `sharp`; this is pnpm's build-script approval model, not an audit vulnerability.
