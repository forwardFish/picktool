# FamilyEducation 1.4 / 1.5 Compact Execution Plan

## Purpose
- Keep `1.4 v6` as the active authoritative lane and finish it before any `1.5 v7` implementation starts.
- Reduce story blast radius so `software_engineering` can progress without another reviewer/fixer loop.
- Force every story to finish as 2-4 small delivery slices with explicit stop lines.

## Active Order
1. `1.4 v6`: `FE-117 -> FE-118 -> FE-119 -> FE-120 -> FE-121 -> FE-122 -> FE-123 -> FE-124 -> FE-125 -> FE-126`
2. `1.5 v7`: `FE-127 -> FE-128 -> FE-129 -> FE-130 -> FE-131 -> FE-132 -> FE-133 -> FE-134 -> FE-135`

## Anti-Stall Rules
- Do not change lane structure, story ids, or sprint order.
- Acceptance stories stay audit-only. They do not absorb implementation spillover.
- Each ordinary story may expand at most one primary concern at a time: interface, data, entitlement, route, copy, or responsive polish.
- Finish structure before integration, and finish integration before broad regression.
- If a story fails, resume the same story and same slice first. Do not skip ahead.
- When a slice finishes, stop at evidence collection instead of opportunistically widening scope.

## Resume Protocol
1. Run `python scripts/validate_planning_assets.py`.
2. Read this file before resuming the active story.
3. Resume `FE-117` and execute only `FE-117-A`, then `FE-117-B`, then `FE-117-C`.
4. Advance to the next story only after the current story's exit line is satisfied.

## Sprint 26

### FE-117 `Billing Provider Interface And Service Layer`
`Goal`: create the provider-neutral skeleton without mixing schema, public route, or UI work.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-117-A` | Define provider types, service contract, and Freemius/Creem provider module boundaries. | `lib/payments/provider.ts`, `lib/payments/providers/freemius.ts`, `lib/payments/providers/creem.ts`, `lib/payments/service.ts` | The billing service can select a provider and expose typed checkout, portal, and webhook methods. |
| `FE-117-B` | Rewire existing action entry points onto the new service without changing public signatures. | `lib/payments/actions.ts`, `lib/payments/service.ts` | `checkoutAction` and `customerPortalAction` still exist externally, but no longer hard-code provider logic. |
| `FE-117-C` | Add provider flags, default Freemius selection, Creem rollback, and proof notes. | `.env.example`, `lib/payments/service.ts`, `lib/payments/providers/*` | Default provider is Freemius, rollback to Creem is explicit, and no public route copy is changed yet. |

`Do not mix`: database tables, new API routes, dashboard copy, legal copy.

### FE-118 `Billing Tables, Compat Reads, And Legacy Mapping`
`Goal`: make persistence additive before entitlement logic consumes it.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-118-A` | Add new provider-account, entitlement, and webhook-event schema objects. | `lib/db/schema.ts`, `lib/db/migrations/*` | The three new billing tables exist additively with no destructive rename. |
| `FE-118-B` | Add compatibility read helpers from old billing/subscription sources into the new neutral shape. | `lib/payments/service.ts`, `lib/family/billing.ts`, `lib/db/*` | Legacy subscription and billing-event reads still work through a documented fallback order. |
| `FE-118-C` | Capture legacy-to-new mapping notes and webhook idempotency schema evidence. | `tasks/backlog_v6_freemius_primary_billing_1_4/*`, migration notes | Mapping rules are explicit and webhook-event uniqueness is documented. |

`Do not mix`: report unlock rules, route cutover, public UI.

### FE-119 `Local Entitlement Projection And Snapshot Service`
`Goal`: centralize product access decisions after the data layer is ready.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-119-A` | Define projection rules for one-time, monthly, annual, cancel, expire, and upgrade states. | `lib/payments/entitlements.ts` | Projection rules exist in one place and do not depend on raw provider payloads in UI code. |
| `FE-119-B` | Route billing snapshot consumers onto the local entitlement layer. | `lib/family/billing.ts`, `app/(dashboard)/dashboard/billing/page.tsx`, `app/(dashboard)/dashboard/reports/[reportId]/page.tsx` | Billing and report unlock surfaces read the local snapshot instead of provider-specific state. |
| `FE-119-C` | Add snapshot examples and regression proof for historical rights retention. | `tasks/runtime/*`, story evidence, tests | Cancellation and expiry do not incorrectly revoke historical access. |

`Do not mix`: webhook receiver, public copy rewrite, pricing/footer work.

### FE-120 `Sprint 26 Provider And Data Acceptance`
- Audit only.
- Allowed changes: docs, traceability links, acceptance packet, release closeout files.
- Forbidden changes: provider implementation, schema edits, entitlement logic changes.

## Sprint 27

### FE-121 `Primary Checkout And Portal Route Cutover`
`Goal`: cut over main route entry points after the service layer is already stable.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-121-A` | Add `POST /api/checkout` and `POST /api/portal` using the billing service. | `app/api/checkout/route.ts`, `app/api/portal/route.ts`, `lib/payments/service.ts` | New primary routes exist and are provider-neutral. |
| `FE-121-B` | Convert `/api/billing/checkout-session` into a compatibility facade only. | `app/api/billing/checkout-session/route.ts`, `lib/payments/actions.ts` | Legacy checkout facade delegates to the new service path rather than bypassing it. |
| `FE-121-C` | Capture route smoke and provider-default evidence. | route tests, story evidence, QA assets | Checkout and portal flows are Freemius-first without public Creem leakage. |

`Do not mix`: webhook persistence, homepage/legal copy, billing-center redesign.

### FE-122 `Primary Webhook Route And Creem Compatibility Delegation`
`Goal`: make webhook ingestion idempotent before sprint acceptance.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-122-A` | Add `POST /webhook` and persist events before entitlement application. | `app/webhook/route.ts`, `lib/payments/service.ts`, `lib/db/*` | Primary webhook route exists and writes idempotency records first. |
| `FE-122-B` | Delegate hidden Creem webhook compatibility through the new service. | `app/api/creem/webhook/route.ts`, `lib/payments/providers/creem.ts` | Creem route remains available but is no longer the default public path. |
| `FE-122-C` | Prove replay safety and entitlement sync mapping. | story evidence, QA assets, `lib/payments/entitlements.ts` | Replayed events are safe and entitlement state remains stable. |

`Do not mix`: pricing surface rewrite, billing-center polish.

### FE-123 `Sprint 27 API Cutover Acceptance`
- Audit only.
- Allowed changes: route inventory, evidence packets, closeout docs.
- Forbidden changes: route handlers, provider code, schema, UI.

## Sprint 28

### FE-124 `Pathnook Public Copy, Pricing, Footer, And Legal Alignment`
`Goal`: separate public brand work from billing-center implementation.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-124-A` | Rewrite homepage, pricing, and shared footer/public trust copy. | `app/(dashboard)/page.tsx`, `app/(dashboard)/pricing/page.tsx`, `components/landing/*` | Public Pathnook/Freemius-first copy is in place on `/` and `/pricing`. |
| `FE-124-B` | Align contact and legal routes to the same trust language. | `app/(dashboard)/contact/page.tsx`, `app/(dashboard)/legal/*` | Contact, privacy, terms, and refunds routes are reachable and copy-aligned. |
| `FE-124-C` | Run copy audit focused on removing public `FamilyEducation` and `Creem` leakage. | public route evidence, story docs | Public copy is clean without touching provider internals. |

`Do not mix`: dashboard billing UX, entitlement logic, webhook work.

### FE-125 `Billing Center UX, Provider Status, And Regression Evidence`
`Goal`: make `/dashboard/billing` trustworthy without reopening public-copy scope.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-125-A` | Show entitlement state, plan state, portal entry, and provider status on `/dashboard/billing`. | `app/(dashboard)/dashboard/billing/page.tsx`, `lib/family/billing.ts`, `lib/payments/entitlements.ts` | Billing center renders the local snapshot and provider state clearly. |
| `FE-125-B` | Add controlled unavailable UX for incomplete Freemius setup. | `app/(dashboard)/dashboard/billing/page.tsx` | The page does not fall back to public Creem copy or hidden entry points. |
| `FE-125-C` | Run non-regression sweep for upload, analysis, report, share, and deck playback. | route tests, `tests/deck-playback.test.ts`, runtime evidence | Billing-center work does not break dependent routes. |

`Do not mix`: homepage hero rewrite, FAQ/footer rewrite, new provider features.

### FE-126 `1.4 Freemius Primary Billing Final Acceptance`
- Audit only.
- Allowed changes: final acceptance matrix, release packet, browser/API evidence linkage.
- Forbidden changes: runtime billing code, homepage structure, legal copy implementation.

## Sprint 29

### FE-127 `1.5 Continuity Repair And Backlog V7 Bootstrap`
`Goal`: queue `1.5` cleanly without starting its implementation early.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-127-A` | Confirm v7 backlog structure and execution order behind `FE-126`. | `tasks/backlog_v7_homepage_display_rewrite_1_5/*` | Sprint 29-31 assets and `FE-127` to `FE-135` cards are complete. |
| `FE-127-B` | Align continuity and handoff assets to show `v6 active`, `v7 queued`. | `NOW.md`, `STATE.md`, `DECISIONS.md`, `PROJECT_STATE.md`, `docs/handoff/current_handoff.md`, `.meta/familyEducation/continuity/continuity_manifest.json` | Continuity never implies `FE-127` starts before `FE-126`. |
| `FE-127-C` | Freeze homepage component scope map for later implementation. | `tasks/backlog_v7_homepage_display_rewrite_1_5/*` | The planned section map is explicit and stable before copy work begins. |

`Do not mix`: canonical requirement rows, homepage implementation code.

### FE-128 `1.5 Requirement, Traceability, And Homepage Baseline Expansion`
`Goal`: keep all planning-only work in one story.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-128-A` | Add `HOME15-*` requirement rows. | `docs/requirements/prd_requirement_index.md`, `docs/requirements/prd_traceability_matrix.md` | Requirement and traceability rows exist but are not marked delivered. |
| `FE-128-B` | Add governance, page, click, API/non-functional, and final acceptance test rows. | `docs/testing/*` | Every `HOME15-*` rule links to a story and a test matrix row. |
| `FE-128-C` | Capture homepage baseline copy, structure, CTA, and positioning debt. | baseline evidence docs under `tasks/backlog_v7_homepage_display_rewrite_1_5/*` | Old homepage state is frozen for later before/after comparison. |

`Do not mix`: homepage runtime components, responsive polish.

### FE-129 `Sprint 29 Homepage Bootstrap Acceptance`
- Audit only.
- Allowed changes: planning audits, acceptance packet, release closeout docs.
- Forbidden changes: homepage runtime implementation.

## Sprint 30

### FE-130 `Homepage Hero, Positioning, And Why-Use Rewrite`
`Goal`: rewrite the top of the homepage only.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-130-A` | Rewrite hero with fixed Pathnook system definition and support line. | `app/(dashboard)/page.tsx`, `components/landing/*` | Hero clearly says Pathnook is an AI learning and growth system. |
| `FE-130-B` | Add dedicated positioning section. | `app/(dashboard)/page.tsx`, `components/landing/*` | The page no longer reads as report-only or math-only. |
| `FE-130-C` | Add dedicated why-use section. | `app/(dashboard)/page.tsx`, `components/landing/*` | Why-use explains clarity, next-step guidance, and follow-through instead of feature bullets. |

`Do not mix`: proof/trust, FAQ/footer, pricing preview.

### FE-131 `Homepage Stage-1 Value, Proof, Trust, And Stage-2 Bridge`
`Goal`: rewrite the middle narrative only.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-131-A` | Add `What families get today` Stage 1 value section. | `app/(dashboard)/page.tsx`, `components/landing/*` | Stage 1 support is explicit and remains the current public focus. |
| `FE-131-B` | Add proof and trust sections. | `app/(dashboard)/page.tsx`, `components/landing/*`, `app/(dashboard)/sample-report/*` | Proof and trust exist as dedicated sections, not generic bullets. |
| `FE-131-C` | Add secondary Stage 2 bridge. | `app/(dashboard)/page.tsx`, `components/landing/*` | Stage 2 is visible but clearly future-facing and not the main CTA story. |

`Do not mix`: pricing preview, FAQ, footer, responsive polish.

### FE-132 `Sprint 30 Homepage Narrative Acceptance`
- Audit only.
- Allowed changes: narrative audits, acceptance packet, release closeout docs.
- Forbidden changes: homepage runtime components.

## Sprint 31

### FE-133 `Homepage How-It-Works, Pricing Preview, FAQ, And Footer Rewrite`
`Goal`: finish remaining public sections without widening back into hero/value work.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-133-A` | Rewrite how-it-works. | `app/(dashboard)/page.tsx`, `components/landing/*` | Product flow is explained in public-value language. |
| `FE-133-B` | Rewrite pricing preview and FAQ. | `app/(dashboard)/page.tsx`, `app/(dashboard)/pricing/page.tsx`, `components/landing/*` | Pricing preview and FAQ align to `1.4` trust language and `1.5` positioning rules. |
| `FE-133-C` | Rewrite footer and verify legal/contact alignment. | `components/landing/*`, `app/(dashboard)/contact/page.tsx`, `app/(dashboard)/legal/*` | Footer/legal links and copy are aligned across public routes. |

`Do not mix`: responsive final polish, CTA regression sweep, billing-provider mechanics.

### FE-134 `Homepage Responsive Polish, Sample CTA Flow, And Copy Regression`
`Goal`: verify release safety after the rewrite is structurally complete.

| Slice | Scope | File Focus | Stop Line |
| :--- | :--- | :--- | :--- |
| `FE-134-A` | Polish desktop/mobile layout stability. | `app/(dashboard)/page.tsx`, `components/landing/*` | No blocking overflow or layout break on desktop/mobile. |
| `FE-134-B` | Validate CTA paths into sample report and pricing surfaces. | homepage routes, `app/(dashboard)/sample-report/*`, `app/(dashboard)/pricing/page.tsx` | CTA chains are live and do not use outdated copy. |
| `FE-134-C` | Run full copy regression audit against old positioning. | public route evidence, QA docs | The homepage does not regress into math-only, report-only, bilingual-first, or family-action-plan-first framing. |

`Do not mix`: billing-center changes, provider code, webhook behavior.

### FE-135 `1.5 Homepage Rewrite Final Acceptance`
- Audit only.
- Allowed changes: final acceptance matrix, browser bundle, responsive/copy evidence links, release closeout docs.
- Forbidden changes: homepage runtime implementation, billing service changes.

## Recommended Resume Command
```powershell
cd D:\lyh\agent\agent-frame\agentsystem
python cli.py run-roadmap --project familyEducation --env test --tasks-root "D:\lyh\agent\agent-frame\familyEducation\tasks" --roadmap-prefix backlog_v6_freemius_primary_billing_1_4 --resume
```

## Immediate Recovery Target
- Active story: `FE-117`
- First slice to finish: `FE-117-A`
- Only after `FE-117-A` is stable should the workflow move to `FE-117-B`
