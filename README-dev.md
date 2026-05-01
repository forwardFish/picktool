# README-dev.md

## Common Commands

### Local planning and build validation
```powershell
cd D:\lyh\agent\agent-frame\familyEducation
pnpm install
python scripts\validate_planning_assets.py
python scripts\validate_beta_planning_assets.py
pnpm qa:runtime-audit
pnpm build
```

### Vercel-first database workflow
```powershell
cd D:\lyh\agent\agent-frame\familyEducation
pnpm db:setup
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### Sprint 14 / next-phase standard delivery run
```powershell
cd D:\lyh\agent\agent-frame\familyEducation
python scripts\run_sprint14_delivery.py
python scripts\run_final_program_acceptance.py --phase next_phase --mode final
```

### Vercel cutover acceptance
```powershell
cd D:\lyh\agent\agent-frame\familyEducation
pnpm qa:vercel-smoke
python scripts\run_final_program_acceptance.py --phase next_phase --mode beta_smoke
python scripts\run_final_program_acceptance.py --phase next_phase --mode final
```

### Vercel direct deployment
```powershell
cd D:\lyh\agent\agent-frame\familyEducation
pnpm dlx vercel link --yes --project pathnook --scope 5184250-8087s-projects
pnpm dlx vercel env pull .env.local
pnpm dlx vercel deploy
pnpm dlx vercel deploy --prod
```

## Notes
- Normal local and Vercel runtime should use `FAMILY_EDU_DEMO_MODE=0`. Demo mode is now explicit opt-in only.
- `FAMILY_EDU_DEMO_AUTO_AUTH` only takes effect when `FAMILY_EDU_DEMO_MODE=1`.
- Production-like runs should use `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `FILE_STORAGE_BACKEND=blob`, and `FAMILY_EDU_DEMO_MODE=0`.
- The local Docker Postgres flow is legacy fallback only; the primary deployment target is Vercel + Neon + Blob.
- `.vercelignore` now excludes local `.env*`, `.next`, `.meta`, and `tasks/runtime` so direct CLI deployments do not depend on local runtime files or unpublished secrets.
- Vercel runtime now treats `DATABASE_URL` as the only valid production database entrypoint. `POSTGRES_URL` remains a local-only fallback for legacy bootstrap scripts.
- `pnpm qa:runtime-audit` writes `tasks/runtime/final_acceptance/runtime_mode_audit.json` so you can verify whether localhost is live/demo, whether mock state still exists, and whether preview/production Vercel repo linkage matches the current repo.
- The full cutover sequence and gate criteria live in `docs/testing/next_phase/vercel_cutover_runbook.md`.
