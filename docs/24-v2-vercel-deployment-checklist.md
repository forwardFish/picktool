# v2 Vercel Deployment Checklist

## Build and validation commands

Run before deploy:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm build
pnpm test:smoke
```

Vercel build command:

```bash
pnpm build
```

Recommended CI test command:

```bash
pnpm test && pnpm lint && pnpm build
```

## Environment variables

### Mock/local mode

Use for local development, preview deployments, and smoke tests where persistence is not required:

```bash
LLM_PROVIDER=mock
ARCHIVE_STORE=memory
```

`ARCHIVE_STORE` may be omitted; memory is the default. In memory mode, archive and Copilot session data are ephemeral.

### Persistent archive/session mode

Use for production persistence:

```bash
LLM_PROVIDER=mock
ARCHIVE_STORE=vercel-kv
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Do not commit `.env.local` or secrets.

## Vercel KV setup steps

1. In Vercel, create/connect a KV database for the project.
2. Copy the REST URL and REST token.
3. Add project environment variables:
   - `ARCHIVE_STORE=vercel-kv`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `LLM_PROVIDER=mock`
4. Redeploy.
5. Open `/api/health` and confirm:

```json
{
  "archiveStore": "vercel-kv",
  "archivePersistent": true,
  "sessionStore": "vercel-kv",
  "sessionPersistent": true
}
```

If KV variables are missing, `/api/health` will report memory mode/fallback and saved archives/sessions will be ephemeral.

## Production smoke test checklist

After deploy:

- [ ] Open `/` and confirm the v2 homepage loads.
- [ ] Start a workflow from the homepage.
- [ ] Confirm `/copilot` shows the basic good-enough plan.
- [ ] Choose “more professional” or send “更专业一点”.
- [ ] Generate the full plan.
- [ ] Save the plan.
- [ ] Open `/archive` and confirm the saved item appears.
- [ ] Open the archive detail page.
- [ ] Request a missing archive id and confirm 404 JSON.
- [ ] Confirm `/api/health` reports the intended archive/session mode.
- [ ] Confirm `/api/image/generate` is not implemented.
- [ ] Confirm v1.2 compatibility pages still load if still part of the app:
  - `/results`
  - `/tools/capcut`
  - `/setups/tiktok-product-promo-video`

## Rollback notes

If Vercel KV causes production issues:

1. Set `ARCHIVE_STORE=memory` or remove `ARCHIVE_STORE`.
2. Redeploy.
3. The app will continue to work with ephemeral archive/session storage.
4. Existing KV data is not deleted by switching modes.

If a deployment fails at build time:

1. Re-run locally:
   - `pnpm install --frozen-lockfile`
   - `pnpm test`
   - `pnpm lint`
   - `pnpm build`
2. Check TypeScript errors first because lint is `tsc --noEmit`.
3. Check runtime environment variables only if the deployed runtime path uses `ARCHIVE_STORE=vercel-kv`.

## Not included in MVP

- No auth.
- No payment.
- No real LLM API required by default.
- No image generation.
- No image-to-image generation.
- No `/api/image/generate`.
- No automatic session/archive TTL cleanup.
