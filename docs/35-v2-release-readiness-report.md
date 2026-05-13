# picktool v2 Release Readiness Report

Generated: 2026-05-13 00:06:52 +08:00

## Verdict

**READY WITH LIMITATIONS**

The local v2 MVP release candidate is ready for final human acceptance in local/mock mode. It has not been deployed, and durable production archive persistence is not configured in this pass.

## Scope

This pass completed release-readiness hygiene, verification, browser/API E2E, tool-data spot-checking, and documentation. It did not add auth, database, payment, real AI providers, production configuration, secrets, push, or deployment.

## Pre-commit git state

- Base commit before this release-readiness commit: `a5c69b0`
- Branch state before this release-readiness commit: `main...origin/main [ahead 1]`
- Modified files at report generation time:
  - `data/ai-tools/normalized/tool-details.jsonl`
  - `scripts/build-tool-details.mjs`
  - `docs/35-v2-release-readiness-report.md`
  - `docs/AUTOPILOT_DELIVERY_REPORT.md`
- `next.config.ts`: earlier LF/CRLF-only working-copy noise was safely restored and is not part of the intended diff.
- Tracked temporary files check: no tracked `_tmp_*`, `.next`, `coverage`, `playwright*`, or `*.log` files were found.

## Environment

All validation used:

```powershell
$env:ARCHIVE_STORE='memory'
$env:LLM_PROVIDER='mock'
```

`memory` mode is acceptable for local demo and test validation only. It is not durable production persistence.

## Verification results

| Check | Result | Evidence |
|---|---:|---|
| `pnpm install --frozen-lockfile` | PASS | Lockfile up to date, already up to date |
| `pnpm lint` | PASS | `tsc --noEmit` completed |
| `pnpm test` | PASS | 32 tests, 32 pass, 0 fail |
| `pnpm build` | PASS | Next.js 16.2.6 compiled successfully, generated 21/21 pages |
| `pnpm test:smoke` | PASS | 29 smoke checks passed |

Important ordering note: `pnpm build` must run before `pnpm test:smoke`. A previous parallel build/smoke attempt failed because smoke started before `.next` existed; sequential execution passes.

## Browser/API E2E result

**PASS**

Automated Playwright checks verified:

- `/`
- `/copilot`
- `/archive`
- `/tools-dataset`
- `/tools/capcut`
- `/tools/capcut-com`
- `/api/health`
- homepage task input: `I want to create a product promo video for TikTok`
- navigation into `/copilot?sessionId=...`
- initial basic plan visible
- professional upgrade visible and includes Canva
- full plan generation visible with execution steps
- save/archive UI state becomes saved
- archive list contains the saved item
- archive detail route displays the saved item
- tool card `查看详情` opens an in-app `/tools/[toolId]` page
- external website action remains a separate secondary link (`target="_blank"`)

## Tool data spot-check

**PASS**

Data files:

| File | Rows |
|---|---:|
| `data/ai-tools/normalized/tools.jsonl` | 96 |
| `data/ai-tools/normalized/tool-details.jsonl` | 97 |
| `data/ai-tools/raw/toolify_tools_raw.jsonl` | 97 |

Sample tools verified present in local detail data:

- `capcut-com`
- `gamma-ai-1`
- `invideo`
- `writesonic`
- `lovable`

API spot-check verified `/api/tools/[slug]` fields:

- `requestedSlug`
- `resolvedSlug`
- `detailStatus`
- `detail`

Alias check:

- `capcut -> capcut-com`: PASS

Data fidelity correction made during this pass:

- `scripts/build-tool-details.mjs` now uses a conservative generated pricing note instead of copying raw `pricing_text` into `pricing.note`.
- `data/ai-tools/normalized/tool-details.jsonl` was regenerated with 97 detail rows.
- Follow-up scan found no generated detail JSON strings matching review-form/ad noise patterns such as `Reviews (`, `Leave a comment`, `Login to comment`, `Try Now AD`, or `Would you recommend`.

This preserves the policy that local detail pages do not fabricate or surface unstructured review/Q&A content. The UI review and Q&A sections remain conservative empty-state summaries.

## Deployment status

- Real deployment performed: **No**
- Push performed: **No**
- Production configuration changed: **No**
- Secrets added: **No**

## KV / persistence status

- Local validation used `ARCHIVE_STORE=memory`.
- Production durable archive/session persistence still requires Vercel KV / Upstash-compatible REST credentials.
- Required for durable production mode:
  - `ARCHIVE_STORE=vercel-kv`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
- This pass did not configure KV because credentials and deployment authority were not provided.

## Known limitations

- `memory` archive/session storage is process-local and resets when the server restarts.
- No real AI provider is connected.
- No auth is implemented.
- No payment is implemented.
- No database is implemented.
- No real deployment was performed.
- Branch is ahead of `origin/main` by 1 commit and should be pushed only after human approval.

## Release readiness judgment

**READY WITH LIMITATIONS**

The local/mock v2 MVP is ready for human acceptance and push/deploy preparation. Before a durable production launch, configure KV persistence and perform an explicit deployment pass.
