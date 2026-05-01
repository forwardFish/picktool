# Beta Release Checklist

Generated at: `2026-04-09T22:30:11`

## Deterministic Gates

- local_beta_smoke: `pass` -> `D:\lyh\agent\agent-frame\familyEducation\tasks\runtime\final_acceptance\final_api_smoke_manifest.json`
- browser_evidence_pack: `pass` -> `D:\lyh\agent\agent-frame\familyEducation\tasks\runtime\browser_evidence\final_browser_evidence_manifest.json`
- release_packet_definition: `pass` -> `D:\lyh\agent\agent-frame\familyEducation\docs\testing\next_phase\final_program_acceptance.md`

## Current Non-Green Requirements

- None

## External Dependencies

- neon_database: configured (DATABASE_URL)
- openai_live_processing: follow_up (OPENAI_API_KEY, OPENAI_MODEL_VISION)
- creem_live_checkout: follow_up (CREEM_API_KEY, CREEM_WEBHOOK_SECRET, CREEM_PRODUCT_ONE_TIME_ID, CREEM_PRODUCT_MONTHLY_ID, CREEM_PRODUCT_ANNUAL_ID)
- google_oauth: configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
- vercel_blob_storage: follow_up (FILE_STORAGE_BACKEND, BLOB_READ_WRITE_TOKEN)
- vercel_preview_and_prod: configured (VERCEL_PROJECT_ID, VERCEL_ORG_ID)
- vercel_git_autodeploy: configured (VERCEL_PROJECT_ID, VERCEL_ORG_ID)
