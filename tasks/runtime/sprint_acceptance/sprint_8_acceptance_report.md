# Sprint 8 Delivery Run

Generated at: `2026-04-07T10:13:15`

## Summary

```json
{
  "target_stories": [
    "FE-046",
    "FE-047",
    "FE-048",
    "FE-049"
  ]
}
```

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
17 tables
activity_logs 6 columns 0 indexes 2 fks
analysis_runs 16 columns 0 indexes 3 fks
billing_events 6 columns 0 indexes 0 fks
children 8 columns 0 indexes 1 fks
error_labels 5 columns 0 indexes 0 fks
invitations 7 columns 0 indexes 2 fks
item_errors 7 columns 0 indexes 2 fks
pages 13 columns 0 indexes 2 fks
problem_items 11 columns 0 indexes 2 fks
reports 7 columns 0 indexes 1 fks
share_links 7 columns 0 indexes 1 fks
subscriptions 15 columns 0 indexes 2 fks
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
 ✓ Compiled successfully in 4.8s
   Running TypeScript ...
   Collecting page data ...
   Generating static pages (0/31) ...
   Generating static pages (7/31) 
   Generating static pages (15/31) 
   Generating static pages (23/31) 
 ✓ Generating static pages (31/31) in 4.2s
   Finalizing page optimization ...

Route (app)                                        Revalidate  Expire
┌ ◐ /
├ ◐ /_not-found
├ ƒ /admin/review
├ ◐ /admin/review/[runId]
├   └ /admin/review/[runId]
├ ƒ /api/admin/review
├ ƒ /api/admin/review/[runId]
├ ƒ /api/admin/review/[runId]/approve
├ ƒ /api/admin/review/[runId]/request-more-photos
├ ƒ /api/billing/checkout-session
├ ƒ /api/children
├ ƒ /api/children/[childId]
├ ƒ /api/notifications/schedule
├ ƒ /api/pages/[pageId]/artifact
├ ƒ /api/reports/[reportId]
├ ƒ /api/reports/[reportId]/export
├ ƒ /api/reports/[reportId]/share
├ ƒ /api/runs/[runId]
├ ƒ /api/runs/[runId]/process
├ ƒ /api/runs/[runId]/retry
├ ƒ /api/share/[token]
├ ƒ /api/stripe/checkout
├ ƒ /api/stripe/webhook
├ ƒ /api/team
├ ƒ /api/tutor
├ ƒ /api/uploads
├ ƒ /api/uploads/[uploadId]
├ ƒ /api/uploads/[uploadId]/files
├ ƒ /api/uploads/[uploadId]/submit
├ ƒ /api/user
├ ƒ /dashboard
├ ◐ /dashboard/account
├ ◐ /dashboard/activity
├ ƒ /dashboard/billing
├ ƒ /dashboard/billing/demo-checkout
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
├ ƒ /dashboard/tutor
├ ◐ /pricing                                               1h      1y
├ ◐ /share/[token]
├   └ /share/[token]
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
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
```

## api_smoke

- Status: `passed`
- Command: `powershell -NoProfile -Command "node scripts\run_sprint8_smoke.mjs; if ($LASTEXITCODE -ne 0) { Start-Sleep -Seconds 2; node scripts\run_sprint8_smoke.mjs }; exit $LASTEXITCODE"`

### Stdout
```text
{
  "status": "pass",
  "manifest": "D:\\lyh\\agent\\agent-frame\\familyEducation\\tasks\\runtime\\final_acceptance\\final_api_smoke_manifest.json"
}
{
  "status": "pass",
  "executed": [
    {
      "script": "scripts/run_final_program_smoke.mjs",
      "status": "passed"
    }
  ],
  "suites": [
    "api",
    "data",
    "ai",
    "ops",
    "billing",
    "history",
    "delete"
  ]
}
```

### Stderr
```text
Error: Upload creation API did not return 201. Status=404. Payload={"error":"Child not found."}
    at assert (file:///D:/lyh/agent/agent-frame/familyEducation/scripts/family_demo_smoke_utils.mjs:34:11)
    at createUpload (file:///D:/lyh/agent/agent-frame/familyEducation/scripts/family_demo_smoke_utils.mjs:309:3)
    at async main (file:///D:/lyh/agent/agent-frame/familyEducation/scripts/run_final_program_smoke.mjs:104:27)
{
  "status": "failed",
  "failed_script": "scripts/run_final_program_smoke.mjs",
  "executed": [
    {
      "script": "scripts/run_final_program_smoke.mjs",
      "status": "failed"
    }
  ]
}
```

## browser_smoke

- Status: `passed`
- Command: `powershell -NoProfile -Command "node scripts\run_sprint8_browser_smoke.mjs; if ($LASTEXITCODE -ne 0) { Start-Sleep -Seconds 2; node scripts\run_sprint8_browser_smoke.mjs }; exit $LASTEXITCODE"`

### Stdout
```text
{
  "status": "pass",
  "manifest": "D:\\lyh\\agent\\agent-frame\\familyEducation\\tasks\\runtime\\browser_evidence\\final_browser_evidence_manifest.json"
}

> @ build D:\lyh\agent\agent-frame\familyEducation
> next build

   ▲ Next.js 15.6.0-canary.59 (Turbopack)
   - Experiments (use with caution):
     ✓ ppr
     ✓ rdcForNavigations (enabled by `experimental.ppr`)

   Creating an optimized production build ...
 ✓ Compiled successfully in 5.0s
   Running TypeScript ...
   Collecting page data ...
   Generating static pages (0/31) ...
   Generating static pages (7/31) 
   Generating static pages (15/31) 
   Generating static pages (23/31) 
 ✓ Generating static pages (31/31) in 3.9s
   Finalizing page optimization ...

Route (app)                                        Revalidate  Expire
┌ ◐ /
├ ◐ /_not-found
├ ƒ /admin/review
├ ◐ /admin/review/[runId]
├   └ /admin/review/[runId]
├ ƒ /api/admin/review
├ ƒ /api/admin/review/[runId]
├ ƒ /api/admin/review/[runId]/approve
├ ƒ /api/admin/review/[runId]/request-more-photos
├ ƒ /api/billing/checkout-session
├ ƒ /api/children
├ ƒ /api/children/[childId]
├ ƒ /api/notifications/schedule
├ ƒ /api/pages/[pageId]/artifact
├ ƒ /api/reports/[reportId]
├ ƒ /api/reports/[reportId]/export
├ ƒ /api/reports/[reportId]/share
├ ƒ /api/runs/[runId]
├ ƒ /api/runs/[runId]/process
├ ƒ /api/runs/[runId]/retry
├ ƒ /api/share/[token]
├ ƒ /api/stripe/checkout
├ ƒ /api/stripe/webhook
├ ƒ /api/team
├ ƒ /api/tutor
├ ƒ /api/uploads
├ ƒ /api/uploads/[uploadId]
├ ƒ /api/uploads/[uploadId]/files
├ ƒ /api/uploads/[uploadId]/submit
├ ƒ /api/user
├ ƒ /dashboard
├ ◐ /dashboard/account
├ ◐ /dashboard/activity
├ ƒ /dashboard/billing
├ ƒ /dashboard/billing/demo-checkout
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
├ ƒ /dashboard/tutor
├ ◐ /pricing                                               1h      1y
├ ◐ /share/[token]
├   └ /share/[token]
├ ƒ /sign-in
└ ƒ /sign-up


◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
ƒ  (Dynamic)            server-rendered on demand

{
  "status": "pass",
  "checks": [
    "admin_queue_browser",
    "admin_detail_browser",
    "admin_copy_edit_browser",
    "admin_request_more_photos_browser",
    "admin_approve_browser",
    "admin_non_admin_redirect_browser"
  ]
}
{
  "status": "pass",
  "executed": [
    {
      "script": "scripts/run_final_browser_evidence_pack.mjs",
      "status": "passed"
    },
    {
      "script": "scripts/run_admin_review_browser_smoke.mjs",
      "status": "passed"
    }
  ],
  "suites": [
    "page",
    "click",
    "responsive"
  ]
}
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
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
```
