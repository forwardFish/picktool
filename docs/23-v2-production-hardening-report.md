# v2 Production Hardening Report

## Executive summary

Final verdict: **READY FOR DEPLOYMENT**.

The AI Task Workflow Copilot MVP v2.0 storage layer was hardened from in-memory-only behavior to adapter-based storage for both saved archive outputs and live Copilot sessions. Local development and automated validation still use memory mode with no secrets. Production can enable persistent storage through thin Vercel KV / Redis REST adapters using environment variables.

No UI redesign, image generation, image-to-image generation, auth, payment, or unrelated feature work was added.

## Previous storage limitation

Before this hardening pass, archive and session data used only module-level in-memory maps. This supported local tests and smoke tests but did not persist saved archive items or active Copilot dialogue/session state across server restarts or deployment instances.

## Storage architecture implemented

Archive storage now uses an adapter interface:

- `lib/archive/archive-store.ts` defines the async `ArchiveStore` contract.
- `lib/archive/memory-store.ts` implements default local archive memory mode.
- `lib/archive/vercel-kv-store.ts` implements Vercel KV / Upstash Redis REST archive mode without adding a dependency.
- `lib/archive/get-archive-store.ts` selects the configured archive store.
- `lib/archive/index.ts` exports the public archive API.

Copilot session storage now also uses an adapter interface:

- `lib/copilot/session-storage.ts` implements memory and Vercel KV session stores plus selector helpers.
- `lib/copilot/session-store.ts` now reads/writes sessions through the selected session store.

API routes call the store-backed service functions rather than importing memory stores directly.

## Memory mode behavior

Memory mode is default when `ARCHIVE_STORE` is unset or set to `memory`.

Behavior:

- No external credentials required.
- Works for local dev, tests, build, and smoke.
- Saves, lists, reads, and deletes archive items during the current server process.
- Preserves active Copilot sessions during the current server process.
- Data is lost when the process restarts.

## Persistent mode behavior

Persistent mode is enabled with:

```bash
ARCHIVE_STORE=vercel-kv
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Behavior:

- Uses Redis REST commands through `fetch`.
- Stores archive items under `picktool:archive:item:{id}`.
- Maintains an archive index under `picktool:archive:index`.
- Stores Copilot sessions under `picktool:copilot:sessions:item:{id}`.
- Maintains a session index under `picktool:copilot:sessions:index`.
- Preserves archive metadata, workflow data, session dialogue, current-plan state, full-plan state, refinements, and saved archive references.
- Falls back to memory if `ARCHIVE_STORE=vercel-kv` is requested but KV env vars are missing.

## Env vars required for Vercel KV

- `ARCHIVE_STORE=vercel-kv`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Optional/default LLM env:

- `LLM_PROVIDER=mock`

## Files created

- `lib/archive/vercel-kv-store.ts`
- `lib/archive/get-archive-store.ts`
- `lib/copilot/session-storage.ts`
- `docs/23-v2-production-hardening-report.md`
- `docs/24-v2-vercel-deployment-checklist.md`

## Files modified

- `lib/archive/archive-store.ts`
- `lib/archive/memory-store.ts`
- `lib/archive/index.ts`
- `lib/copilot/session-store.ts`
- `app/api/archive/route.ts`
- `app/api/archive/[id]/route.ts`
- `app/api/copilot/start/route.ts`
- `app/api/copilot/session/route.ts`
- `app/api/copilot/option/route.ts`
- `app/api/sessions/[sessionId]/save/route.ts`
- `app/api/health/route.ts`
- `tests/archive-store.test.ts`
- `tests/api-routes.test.ts`
- `scripts/smoke-test.mjs`
- `docs/22-v2-api-and-env-guide.md`

## Tests added/updated

Added/updated coverage for:

- memory archive save/list/detail/delete
- archive metadata preservation
- archive store selector defaulting to memory
- archive store selector fallback when Vercel KV env is incomplete
- archive store selector choosing Vercel KV when env vars are present
- Copilot session store selector memory/fallback/Vercel KV behavior
- session save into archive
- archive API missing id 404 JSON
- smoke missing archive id 404
- smoke health check for memory archive/session mode
- smoke confirmation that `/api/image/generate` is not implemented

## Validation results

### `pnpm test`

PASS.

```text
26 tests
26 pass
0 fail
```

Non-blocking warning: Node reports `MODULE_TYPELESS_PACKAGE_JSON` for TypeScript test modules.

### `pnpm lint`

PASS.

```text
tsc --noEmit
```

### `pnpm build`

PASS.

```text
Compiled successfully
Generating static pages (21/21)
```

Non-blocking warning: `baseline-browser-mapping` data is over two months old.

### `pnpm test:smoke`

PASS.

Smoke covers homepage, `/copilot`, `/archive`, v1.2 compatibility pages, workflow generation, non-video workflow generation, copilot message intent, option/full-plan/refine APIs, session save, archive list/detail, missing archive id 404, health, validation errors, and missing image-generation route.

## Deployment readiness

Ready for deployment with either:

1. **Memory mode** for preview/demo deployments:
   - `ARCHIVE_STORE=memory`
   - no KV credentials
   - archive and session storage are ephemeral

2. **Vercel KV persistent mode** for production:
   - `ARCHIVE_STORE=vercel-kv`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - archive and session storage are persistent

`GET /api/health` reports active archive/session store modes and persistence status.

## Remaining limitations

- No auth or user-specific archive/session isolation exists yet.
- Vercel KV adapters are implemented and type/build-tested; live KV integration requires production env vars and a deployed KV instance.
- Real LLM providers remain optional/future; mock deterministic mode is still default.
- No automatic KV TTL/cleanup policy is implemented for old sessions or archives.

## Final verdict

**READY FOR DEPLOYMENT**
