# Sprint 1 Delivery Run

Generated at: `2026-04-04T19:37:26`

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
   Generating static pages (0/28) ...
   Generating static pages (7/28) 
   Generating static pages (14/28) 
   Generating static pages (21/28) 
 ✓ Generating static pages (28/28) in 1204ms
   Finalizing page optimization ...

Route (app)                                 Revalidate  Expire
┌ ◐ /
├ ◐ /_not-found
├ ƒ /api/billing/checkout-session
├ ƒ /api/children
├ ƒ /api/children/[childId]
├ ƒ /api/pages/[pageId]/artifact
├ ƒ /api/reports/[reportId]
├ ƒ /api/reports/[reportId]/share
├ ƒ /api/runs/[runId]
├ ƒ /api/runs/[runId]/process
├ ƒ /api/runs/[runId]/retry
├ ƒ /api/share/[token]
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
├ ◐ /pricing                                        1h      1y
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

## http_smoke

- Status: `passed`
- Command: `node scripts\run_sprint1_smoke.mjs`

### Stdout
```text
{
  "status": "pass",
  "checks": [
    "landing_cta",
    "signup_fields",
    "dashboard_redirect",
    "children_api_unauthorized",
    "dashboard_authenticated",
    "children_page",
    "child_detail",
    "children_api_authenticated"
  ],
  "blockedChecks": [],
  "seededUserEmail": "demo-parent@familyeducation.local"
}
```

### Stderr
```text
Database-backed Sprint 1 seeding is unavailable, switching to demo-runtime authenticated checks: connect ECONNREFUSED 127.0.0.1:54322
```

## browser_smoke

- Status: `passed`
- Command: `node scripts\run_sprint1_browser_smoke.mjs`

### Stdout
```text
{
  "status": "pass",
  "checks": [
    "landing_cta_browser",
    "pricing_browser",
    "signup_fields_browser",
    "signup_validation_18_plus",
    "signup_validation_password_strength",
    "signup_success_redirect_dashboard",
    "account_locale_persistence",
    "child_create_browser",
    "child_edit_browser",
    "dashboard_redirect_browser",
    "sign_in_recovery_entry",
    "sign_in_wrong_password",
    "sign_in_redirect_back_to_original_route",
    "children_api_unauthorized"
  ]
}
```

### Stderr
```text

```
