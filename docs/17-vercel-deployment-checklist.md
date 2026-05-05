# Vercel Deployment Checklist

Date: 2026-05-04
Project: picktool
Status: READY TO DEPLOY after local validation

## Local validation results

All required local validation commands passed:

```text
pnpm test       PASS (10 tests, 10 pass, 0 fail)
pnpm lint       PASS (tsc --noEmit)
pnpm build      PASS (Next production build, 9 static/dynamic pages generated)
pnpm test:smoke PASS (routes and API checks)
```

Build output includes these deployment-relevant routes:

```text
/                         static
/api/decision             dynamic
/api/setups/[slug]        dynamic
/api/tools/[slug]         dynamic
/results                  dynamic
/setups/[setupId]         partial prerender
/tools/[toolId]           partial prerender
```

Non-blocking warnings:

- `baseline-browser-mapping` data age warning during build.
- Node `MODULE_TYPELESS_PACKAGE_JSON` warning during native TS test execution.

## Files to commit

Commit only the MVP delivery and QA/deployment artifacts:

- `app/page.tsx`
- `app/results/page.tsx`
- `app/tools/[toolId]/page.tsx`
- `app/setups/[setupId]/page.tsx`
- `app/api/decision/route.ts`
- `app/api/tools/[slug]/route.ts`
- `app/api/setups/[slug]/route.ts`
- `components/picktool/*`
- `lib/schemas/toolDecision.ts`
- `lib/data/tools.ts`
- `lib/data/decisionTemplates.ts`
- `lib/decision-engine/*`
- `lib/picktool/decisions.ts`
- `package.json`
- `tests/*`
- `scripts/smoke-test.mjs`
- `scripts/capture-qa-screenshots.py`
- `docs/10-runtime-audit.md`
- `docs/11-frontend-integration-report.md`
- `docs/15-full-delivery-report.md`
- `docs/16-mvp-acceptance-qa-report.md`
- `docs/17-vercel-deployment-checklist.md`
- `docs/18-deployment-report.md`
- `docs/qa-screenshots/*`

## Files to exclude

Do not commit local/runtime/unrelated artifacts:

- `.omx/`
- `.codex-runtime/`
- `.next/`
- `node_modules/`
- unrelated `docs/pic/` deletions or backup screenshot movements
- local temp files such as `_tmp_*`

## Required environment variables

None required for the MVP runtime.

Optional:

```text
NEXT_PUBLIC_SITE_URL
```

If omitted, the app uses the local fallback configured in `lib/seo/site.ts`. No AI API key, database URL, auth secret, or payment secret is required.

## Vercel project settings

Suggested Vercel settings:

```text
Framework Preset: Next.js
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Output Directory: .next (Vercel default for Next.js)
Node.js: Vercel default compatible with Next.js 15 canary / React 19
```

## Vercel output expectations

Expected after build:

- Static homepage `/`.
- Dynamic API routes:
  - `/api/decision`
  - `/api/tools/[slug]`
  - `/api/setups/[slug]`
- Dynamic/partial-prerender app routes:
  - `/results`
  - `/tools/capcut`
  - `/setups/tiktok-product-promo-video`

No runtime secrets should be requested during deployment.

## Production smoke test checklist

After Vercel provides a production or preview URL, test:

```text
GET  /
GET  /results?task=I%20want%20to%20create%20a%20product%20promo%20video%20for%20TikTok.
GET  /tools/capcut
GET  /setups/tiktok-product-promo-video
POST /api/decision { "input": "I want to create a product promo video for TikTok." }
POST /api/decision rejects short input
GET  /api/tools/capcut
GET  /api/tools/not-existing returns 404 JSON
GET  /api/setups/tiktok-product-promo-video
GET  /api/setups/not-existing returns 404 JSON
```

Expected visible sections:

- Result page: `Best Tool Setup for This Task`, `How to use it`, `What you can skip`, `Better options if`, `Cost advice`.
- Tool detail: `AI Tool Decision Detail`, `Decision Summary`, `Worth using if`, `Best-fit Tasks`, `Use when`, `Do not start here when`, `Role in workflow`, `Best setups including this tool`, `Better options if`, `Practical details`.
- Setup detail: `Setup Hero`, `Best Tool Setup`, `How to use it`, `What you can skip`, `Better options if`, `Cost advice`, `Tools in this setup`.

## Manual deployment commands

Because this local checkout has no `.vercel/` project link, do not deploy without confirmation. Safe manual path:

```bash
git push origin main
# Then let the connected Vercel Git integration deploy, if configured.
```

If the project is not yet linked in Vercel, run only after confirming the intended Vercel project/team:

```bash
vercel link
vercel deploy --prod
```