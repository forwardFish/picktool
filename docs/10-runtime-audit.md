# Runtime Audit

Date: 2026-05-03
Project: picktool
Product: AI Tool Decision Assistant

## Scope

This audit followed the project instructions to inspect the current Next.js App Router project, verify dependencies, run the local dev server, run type/lint verification, run the production build, fix only blocking runtime issues, and document the result.

No UI redesign, product feature expansion, auth, database, payments, or real AI/API integration was performed.

## Current project structure

```text
picktool/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ not-found.tsx
│  ├─ page.tsx
│  ├─ robots.ts
│  ├─ sitemap.ts
│  ├─ results/page.tsx
│  ├─ setups/[setupId]/page.tsx
│  └─ tools/[toolId]/page.tsx
├─ components/
│  └─ picktool/
│     ├─ brand.tsx
│     ├─ decision-form.tsx
│     ├─ decision-sections.tsx
│     └─ site-chrome.tsx
├─ docs/
│  ├─ AI_Tool_Decision_Assistant_MVP_Dev_Doc_v1.2_MVP_Only.md
│  ├─ backup/
│  ├─ pic/
│  └─ web_html/
│     ├─ 首页.tsx
│     ├─ 首页搜索信息.tsx
│     ├─ 详情页.html
│     └─ backup/
├─ lib/
│  ├─ picktool/decisions.ts
│  ├─ seo/site.ts
│  └─ utils.ts
├─ public/
├─ next.config.ts
├─ package.json
├─ pnpm-lock.yaml
├─ postcss.config.mjs
└─ tsconfig.json
```

## Package scripts inspected

From `package.json`:

```bash
pnpm dev       # next dev --turbopack
pnpm build     # next build
pnpm lint      # tsc --noEmit
pnpm typecheck # tsc --noEmit
```

## Dependency status

Dependencies were already present (`node_modules/` and `pnpm-lock.yaml` existed). I still verified the install state with the lockfile:

```bash
pnpm install --frozen-lockfile --offline
```

Result: passed after rerunning outside the sandbox. The sandboxed attempt failed with an EPERM unlink error on a generated temporary file, but the elevated/off-sandbox command completed with:

```text
Lockfile is up to date, resolution step is skipped
Already up to date
```

Non-blocking install note: pnpm reported ignored build scripts for `@tailwindcss/oxide` and `sharp`. This did not block dev, lint, or build in this audit.

## Local dev server

Command tested:

```bash
pnpm dev
```

Result: passes. A short local smoke test started the Next.js dev server on `http://localhost:3000` and requested `/` successfully.

Evidence:

```text
Next.js 15.6.0-canary.59 (Turbopack)
Ready in 1780ms
Compiled / in 2s
GET / 200 in 2519ms
```

## Lint / typecheck

Command tested:

```bash
pnpm lint
```

Result: passes.

Evidence:

```text
> picktool@ lint D:\lyh\agent\agent-frame\picktool
> tsc --noEmit
```

Exit code: 0.

## Production build

Command tested:

```bash
pnpm build
```

Result: passes.

Evidence:

```text
Compiled successfully
Running TypeScript ...
Generating static pages (8/8)
Finalizing page optimization ...
```

Generated routes:

```text
/                 static
/_not-found        static
/results           dynamic
/robots.txt        static
/sitemap.xml       static
/setups/[setupId]  partial prerender
/tools/[toolId]    partial prerender
```

Non-blocking build warning: `baseline-browser-mapping` data is over two months old. This warning did not fail the build.

## Blocking errors fixed

1. Stale Next.js dev lock
   - Symptom: `pnpm dev` failed with:
     ```text
     Unable to acquire lock at D:\lyh\agent\agent-frame\picktool\.next\dev\lock, is another instance of next dev running?
     ```
   - Cause: a stale generated lock file existed at `.next/dev/lock` with timestamp `2026-05-01 08:29:49`.
   - Fix: removed the stale generated `.next/dev/lock` file.
   - Result: `pnpm dev` then started successfully and served `/` with HTTP 200.

2. Sandbox-only process/install EPERM issues
   - `pnpm install --frozen-lockfile --offline` initially failed inside the sandbox with an EPERM unlink error on a generated temp file.
   - `pnpm dev` initially failed inside the sandbox with `Error: spawn EPERM`.
   - Fix: reran those commands outside the sandbox with approval. No source code change was required.

## Remaining non-blocking issues

- `pnpm build` and `pnpm dev` print a non-fatal warning that `baseline-browser-mapping` data is over two months old.
- `pnpm install` prints a non-fatal warning about ignored build scripts for `@tailwindcss/oxide` and `sharp` under pnpm's build-script approval model.
- The project uses `next@15.6.0-canary.59`, so runtime behavior may change more often than on a stable Next.js release. It currently builds and runs.
- Existing app UI/components were not compared pixel-by-pixel against `docs/web_html`; this audit only verified runtime health and avoided UI redesign.

## Old-project-name check

Visible/runtime source paths searched under `app/`, `components/picktool/`, `lib/picktool/`, and `lib/seo/` for old `familyEducation` naming. No matches were found.

## Exact commands to run locally

From `D:\lyh\agent\agent-frame\picktool`:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm build
```

If local dev reports a stale Next.js lock and no other dev server is running, stop any lingering Next.js/node process first, then remove the generated lock file:

```powershell
Remove-Item -LiteralPath .next\dev\lock -Force
pnpm dev
```
