# MVP Acceptance QA Report

Date: 2026-05-04
Project: picktool
Final verdict: PASS

## Executive summary

Ran final MVP acceptance audit for AI Tool Decision Assistant MVP v1.2 against the PRD and the existing delivery report. The app remains within MVP scope: deterministic local decision templates, frontend-to-backend API flow, no database, no auth implementation, no payment, no real AI API, no crawling, no rankings, no directory pages, and no dashboard.

Fresh validation passed for tests, lint/typecheck, production build, expanded live smoke checks, and screenshot capture. One small visual QA issue was fixed: the static `Log in` header button now avoids wrapping on mobile.

## PRD compliance checklist

| Area | Result | Evidence |
| --- | --- | --- |
| Homepage `/` | PASS | Smoke test `PASS /`; screenshots captured |
| Task Decision Result Page `/results` | PASS | Smoke test `PASS /results?...`; screenshots captured |
| Tool Decision Detail Page `/tools/capcut` | PASS | Smoke test `PASS /tools/capcut`; screenshot captured |
| Setup Detail Page `/setups/tiktok-product-promo-video` | PASS | Smoke test `PASS /setups/tiktok-product-promo-video`; screenshot captured |
| Homepage required copy | PASS | Brand, hero headline, explanatory text, placeholder, chips, and `Get Decision` present |
| Result five sections | PASS | `Best Tool Setup for This Task`, `How to use it`, `What you can skip`, `Better options if`, `Cost advice` present |
| Tool detail required sections | PASS | Required section headings present on `/tools/capcut` |
| MVP-only scope | PASS | No auth system, payment, database, real AI API, crawling, rankings, directory, dashboard, or refine flow added |
| Backend API | PASS | Decision, tool detail, and setup detail API routes compile and pass smoke/API tests |

## Page-by-page acceptance result

### `/`

PASS.

Verified content:

- `AI Tool Decision Assistant`
- `Make better AI tool decisions for every task.`
- `Describe what you want to do. We'll show which AI tools to use, which to skip, and how to get started.`
- `Get Decision`
- Placeholder: `I want to create a product promo video for TikTok.`
- Example chips: Product video, PDF to slides, Landing page, Instagram carousel, AI avatar video, Course sales page

Visual QA: desktop and mobile layouts are readable, centered, and not directory-like. Empty input state exists in the form validation.

### `/results`

PASS.

Verified required sections:

- `Best Tool Setup for This Task`
- `How to use it`
- `What you can skip`
- `Better options if`
- `Cost advice`

Visual QA: card-first decision result, no dense table, no tool-directory navigation pattern. Mobile stacks cards cleanly with readable contrast.

### `/tools/capcut`

PASS.

Verified required sections:

- `AI Tool Decision Detail`
- `Decision Summary`
- `Worth using if`
- `Best-fit Tasks`
- `Use when`
- `Do not start here when`
- `Role in workflow`
- `Best setups including this tool`
- `Better options if`
- `Practical details`

Visual QA: desktop screenshot shows clear hierarchy and readable cards. Tool detail links to setup detail.

### `/setups/tiktok-product-promo-video`

PASS.

Verified required sections:

- `Setup Hero`
- `Best Tool Setup`
- `How to use it`
- `What you can skip`
- `Better options if`
- `Cost advice`
- `Tools in this setup`

Visual QA: desktop screenshot shows complete reusable setup page with tool links and readable cards.

## API acceptance result

PASS.

Live smoke validation covered:

```text
PASS POST /api/decision
PASS POST /api/decision rejects short input
PASS GET /api/tools/capcut
PASS GET /api/tools/not-existing
PASS GET /api/setups/tiktok-product-promo-video
PASS GET /api/setups/not-existing
```

Unit/API test validation also covered route handler behavior for decision input, tool detail, missing tool, setup detail, and missing setup.

## Frontend-to-backend flow result

PASS.

Verified source and runtime behavior:

- `components/picktool/home-decision-search.tsx` calls `fetch('/api/decision', { method: 'POST', ... })`.
- Homepage handles loading, API error, fallback no-match, and invalid/empty input states.
- TikTok input returns `Best Tool Setup for This Task` with the expected setup slug.
- `/results` renders the deterministic decision result.
- Result setup/tool controls link to `/tools/[slug]` and `/setups/[slug]`.
- Tool detail links to setup detail.
- Setup detail renders all tools in the setup.

## Forbidden wording scan result

PASS for visible app code.

Scanned `app/`, `components/`, and `lib/` for:

- AI Tool Combo Card
- AI Task Solution Search
- Recommended Tool Combination
- Expand to Full Toolchain
- Fastest Path
- Step Details
- Tool Directory
- Ranking
- Alternative options
- 3-Step Usage Plan
- Refine this decision
- Who are you?
- What do you already have?
- Budget preference

Result:

```text
NO_FORBIDDEN_TERMS_IN_APP_COMPONENTS_LIB
```

Docs-only matches exist under `docs/backup/` from older product documents. These are non-blocking because they are not visible app UI copy and are preserved historical reference documents.

## Visual QA result

PASS.

Checked screenshots for desktop and mobile layout issues:

- No horizontal overflow observed in captured pages.
- Contrast is readable on dark SaaS-style background.
- Result UI remains card-first and decision-focused.
- Header does not include directory/ranking-style navigation.
- Homepage loading, error, and empty input states exist in code.
- One mobile header issue was fixed: the static `Log in` button no longer wraps onto two lines.

## Screenshot list

Screenshots generated with local Python Playwright tooling into `docs/qa-screenshots/`:

- `docs/qa-screenshots/home-desktop.png`
- `docs/qa-screenshots/home-mobile.png`
- `docs/qa-screenshots/result-desktop.png`
- `docs/qa-screenshots/result-mobile.png`
- `docs/qa-screenshots/tool-capcut-desktop.png`
- `docs/qa-screenshots/setup-tiktok-desktop.png`

Screenshot capture initially hit a sandbox browser-subprocess permission issue and stale local Next server ports. After inspecting and stopping only stale Next.js QA processes for this repo, screenshots were captured successfully from a fresh current-build server.

## Test command outputs

### `pnpm test`

Result: PASS.

```text
✔ POST /api/decision returns result for TikTok product video input
✔ POST /api/decision rejects too-short input
✔ GET /api/tools/capcut returns CapCut detail
✔ GET /api/tools/not-existing returns 404
✔ GET /api/setups/tiktok-product-promo-video returns setup detail
✔ GET /api/setups/not-existing returns 404
✔ matches TikTok product promo video template
✔ buildDecisionResult resolves required result sections and tools
✔ unknown input returns fallback decision
✔ validates decision input length and type
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

Non-blocking note: Node reports `MODULE_TYPELESS_PACKAGE_JSON` for native TS ESM tests. Tests pass and no runtime app behavior is affected.

## Lint result

### `pnpm lint`

Result: PASS.

```text
> picktool@ lint D:\lyh\agent\agent-frame\picktool
> tsc --noEmit
```

## Build result

### `pnpm build`

Result: PASS.

```text
✓ Compiled successfully in 2.1s
Running TypeScript ...
✓ Generating static pages (9/9)
Route (app)
/                         static
/api/decision             dynamic
/api/setups/[slug]        dynamic
/api/tools/[slug]         dynamic
/results                  dynamic
/setups/[setupId]         partial prerender
/tools/[toolId]           partial prerender
```

Non-blocking note: build prints the existing `baseline-browser-mapping` age warning. It does not block compilation.

## Smoke test result

### `pnpm test:smoke`

Result: PASS.

```text
PASS /
PASS /results?task=I%20want%20to%20create%20a%20product%20promo%20video%20for%20TikTok.
PASS /tools/capcut
PASS /setups/tiktok-product-promo-video
PASS POST /api/decision
PASS POST /api/decision rejects short input
PASS GET /api/tools/capcut
PASS GET /api/tools/not-existing
PASS GET /api/setups/tiktok-product-promo-video
PASS GET /api/setups/not-existing
```

## Deployment readiness result

PASS for local deployment readiness.

- Production build passes.
- API routes compile and are included in build output.
- No required environment variables for MVP runtime.
- No real AI API key required.
- No database credentials required.
- No payment/auth service required.
- No local-only file path is required by app runtime.
- `next.config.ts` contains only Next experimental flags and no obvious deployment blocker.
- External deployment was not performed because no Vercel credentials or preview deployment instruction was provided.

## Issues fixed during QA

1. Mobile header visual issue:
   - Symptom: `Log in` button wrapped onto two lines on mobile.
   - Fix: added `whitespace-nowrap` to the static header button in `components/picktool/site-chrome.tsx`.
   - Result: refreshed mobile screenshot shows single-line `Log in`.

2. API acceptance coverage:
   - Added minimal tests for implemented setup API success and 404 JSON.
   - Expanded smoke script to validate live tool/setup API endpoints and invalid decision input.

3. Screenshot reliability:
   - Added `scripts/capture-qa-screenshots.py` using existing Python Playwright tooling.
   - Cleaned stale local Next QA server processes after verifying their command lines pointed to this repo and QA ports.

## Remaining non-blocking issues

- Native Node TS ESM tests print `MODULE_TYPELESS_PACKAGE_JSON`; tests pass.
- `baseline-browser-mapping` age warning appears during build; build passes.
- Python Playwright screenshots require outside-sandbox execution on this Windows environment due browser subprocess permissions.
- Existing unrelated git status entries under `.omx/` and `docs/pic/` predate or are outside this QA acceptance task and were not intentionally changed.

## Final verdict

PASS