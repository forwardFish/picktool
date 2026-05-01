# Sprint 3 Delivery Run

Generated at: `2026-04-04T17:52:39`

## planning_validation

- Status: `passed`
- Command: `python scripts\validate_planning_assets.py`

### Stdout
```text
PASS: planning assets are structurally complete and internally linked.
PASS: validated 72 requirement IDs.
PASS: validated 49 story YAML files.
PASS: validated 166 test case IDs across matrices.
```

### Stderr
```text

```

## db_generate

- Status: `passed`
- Command: `powershell -NoProfile -Command "$env:POSTGRES_URL='postgres://postgres:postgres@127.0.0.1:54322/postgres'; pnpm db:generate"`

### Stdout
```text
> @ db:generate D:\lyh\agent\agent-frame\familyEducation
> drizzle-kit generate

No config path provided, using default 'drizzle.config.ts'
Reading config file 'D:\lyh\agent\agent-frame\familyEducation\drizzle.config.ts'
14 tables
activity_logs 6 columns 0 indexes 2 fks
analysis_runs 16 columns 0 indexes 3 fks
children 8 columns 0 indexes 1 fks
error_labels 5 columns 0 indexes 0 fks
invitations 7 columns 0 indexes 2 fks
item_errors 7 columns 0 indexes 2 fks
pages 13 columns 0 indexes 2 fks
problem_items 11 columns 0 indexes 2 fks
reports 7 columns 0 indexes 1 fks
team_members 5 columns 0 indexes 2 fks
teams 9 columns 0 indexes 0 fks
upload_files 9 columns 0 indexes 1 fks
uploads 10 columns 0 indexes 2 fks
users 12 columns 0 indexes 0 fks

No schema changes, nothing to migrate 😴
```

### Stderr
```text

```

## build

- Status: `passed`
- Command: `pnpm build`

### Stdout
```text
> @ build D:\lyh\agent\agent-frame\familyEducation
> next build

   ▲ Next.js 15.6.0-canary.59 (Turbopack)
   - Experiments (use with caution):
     ✓ ppr
     ✓ rdcForNavigations (enabled by `experimental.ppr`)

   Creating an optimized production build ...
 ✓ Compiled successfully in 4.3s
   Running TypeScript ...
   Collecting page data ...
   Generating static pages (0/25) ...
   Generating static pages (6/25) 
   Generating static pages (12/25) 
   Generating static pages (18/25) 
 ✓ Generating static pages (25/25) in 1393ms
   Finalizing page optimization ...

Route (app)                                 Revalidate  Expire
┌ ◐ /
├ ◐ /_not-found
├ ƒ /api/children
├ ƒ /api/children/[childId]
├ ƒ /api/reports/[reportId]
├ ƒ /api/runs/[runId]
├ ƒ /api/runs/[runId]/process
├ ƒ /api/runs/[runId]/retry
├ ƒ /api/stripe/checkout
├ ƒ /api/stripe/webhook
├ ƒ /api/team
├ ƒ /api/uploads
├ ƒ /api/uploads/[uploadId]/files
├ ƒ /api/uploads/[uploadId]/submit
├ ƒ /api/user
├ ƒ /dashboard
├ ◐ /dashboard/account
├ ◐ /dashboard/activity
├ ƒ /dashboard/billing
├ ƒ /dashboard/children
├ ◐ /dashboard/children/[childId]
├   └ /dashboard/children/[childId]
├ ◐ /dashboard/children/[childId]/upload
├   └ /dashboard/children/[childId]/upload
├ ◐ /dashboard/children/new
├ ◐ /dashboard/general
├ ◐ /dashboard/reports/[reportId]
├   └ /dashboard/reports/[reportId]
├ ◐ /dashboard/runs/[runId]
├   └ /dashboard/runs/[runId]
├ ◐ /dashboard/security
├ ◐ /pricing                                        1h      1y
├ ƒ /sign-in
└ ƒ /sign-up


◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
ƒ  (Dynamic)            server-rendered on demand
```

### Stderr
```text
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
```

## api_smoke

- Status: `passed`
- Command: `node scripts\run_sprint3_smoke.mjs`

### Stdout
```text
{
  "status": "pass",
  "checks": [
    "api_ai_process_route",
    "ai_canonical_schema",
    "ai_evidence_anchor_integrity",
    "ai_taxonomy_allow_list",
    "ai_safe_no_direct_answers",
    "ai_confidence_needs_review_routing",
    "report_grouped_evidence_minimums",
    "mathpix_fallback_request_path"
  ]
}
```

### Stderr
```text

```

## browser_smoke

- Status: `passed`
- Command: `node scripts\run_sprint3_browser_smoke.mjs`

### Stdout
```text
{
  "status": "pass",
  "checks": [
    "report_tabs_browser",
    "report_evidence_browser",
    "report_plan_browser",
    "needs_review_preview_browser",
    "review_banner_browser"
  ]
}
```

### Stderr
```text

```
