# v2 API and Environment Guide

## Runtime mode

The MVP runs in deterministic mock mode by default. No LLM API key, database credential, or KV credential is required for local development, tests, lint, build, or smoke tests.

## LLM provider env vars

```bash
LLM_PROVIDER=mock | openai | deepseek | anthropic
OPENAI_API_KEY=...
DEEPSEEK_API_KEY=...
ANTHROPIC_API_KEY=...
```

If `LLM_PROVIDER` is set to a real provider but the matching API key is missing, the app falls back to mock mode.

## Archive and session storage env vars

```bash
ARCHIVE_STORE=memory | vercel-kv
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

`ARCHIVE_STORE` controls both saved archive output storage and live Copilot session storage.

### Local/default memory mode

Use this for local development and tests:

```bash
ARCHIVE_STORE=memory
LLM_PROVIDER=mock
```

`ARCHIVE_STORE` may also be omitted; memory is the default. Memory mode is process-local and resets when the server restarts.

### Vercel KV persistent mode

Use this for production persistence:

```bash
ARCHIVE_STORE=vercel-kv
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
LLM_PROVIDER=mock
```

The app uses thin Redis REST adapters and does not require `@vercel/kv`. If `ARCHIVE_STORE=vercel-kv` is set but either KV env var is missing, the app falls back to memory mode so build/test/local dev still work.

Persistent mode stores:

- saved archive outputs;
- active Copilot sessions and their dialogue/current-plan state.

### Example `.env.local`

Memory-only local MVP:

```bash
LLM_PROVIDER=mock
ARCHIVE_STORE=memory
```

Local test against a real KV instance, if desired:

```bash
LLM_PROVIDER=mock
ARCHIVE_STORE=vercel-kv
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-token
```

## How to test locally without KV

```bash
pnpm test
pnpm lint
pnpm build
pnpm test:smoke
```

The smoke script forces `ARCHIVE_STORE=memory` for its local server process, so no KV credentials are needed.

## How to enable persistent archive and session storage in Vercel

1. Create or connect a Vercel KV / Upstash Redis database.
2. Add these environment variables to the Vercel project:
   - `ARCHIVE_STORE=vercel-kv`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `LLM_PROVIDER=mock` unless enabling a real LLM provider later.
3. Redeploy the app.
4. Check `GET /api/health`; it should return `archiveStore: "vercel-kv"`, `archivePersistent: true`, `sessionStore: "vercel-kv"`, and `sessionPersistent: true`.
5. Run a production smoke path: generate a workflow, choose an upgrade, generate full plan, save it, open `/archive`, and open `/archive/[id]`.

## API routes

### `GET /api/health`

Response in local memory mode:

```json
{
  "ok": true,
  "service": "AI Task Workflow Copilot",
  "mode": "mock",
  "archiveStore": "memory",
  "archivePersistent": false,
  "sessionStore": "memory",
  "sessionPersistent": false
}
```

### `POST /api/copilot/start`

Request:

```json
{ "input": "我有一个毕业设计，想用 AI 帮我剪辑展示视频。" }
```

Response includes:

```json
{
  "sessionId": "sess_...",
  "matchedTemplateSlug": "graduation-project-video",
  "messages": [],
  "currentPlan": { "planType": "basic" },
  "sidebarState": {},
  "fullPlanState": "collapsed"
}
```

### `GET /api/copilot/session?sessionId=...`

Returns the current Copilot session state from the configured session store.

### `POST /api/copilot/message`

Request:

```json
{ "sessionId": "sess_...", "message": "更专业一点" }
```

The deterministic message handler recognizes core intents such as more professional, save money, more automated, advanced presentation, view full plan, good enough, and refinement modules.

### `POST /api/copilot/option`

Request:

```json
{ "sessionId": "sess_...", "optionKey": "professional" }
```

Supported `optionKey`: `professional`, `budget`, `automated`, `advanced_visual`, `full_plan`, `good_enough`.

### `POST /api/copilot/generate-full-plan`

Request:

```json
{ "sessionId": "sess_..." }
```

Returns `fullPlanState: "expanded"` and a deterministic `fullPlan`.

### `POST /api/copilot/refine`

Request:

```json
{ "sessionId": "sess_...", "moduleType": "script" }
```

Supported `moduleType`: `script`, `materials`, `subtitles_cover`, `delivery_check`.

### `POST /api/workflow/generate`

Stateless helper for tests/smoke/API consumers.

Request:

```json
{
  "input": "我有一个毕业设计，想用 AI 帮我剪辑展示视频。",
  "optionKey": "professional",
  "includeFullPlan": true
}
```

### `POST /api/sessions/[sessionId]/save`

Saves a Copilot session to the configured archive store.

### `GET /api/archive`

Returns:

```json
{ "items": [] }
```

### `POST /api/archive`

Request:

```json
{
  "title": "Saved plan",
  "userInput": "Task input",
  "workflowData": { "currentPlan": {}, "fullPlan": {} }
}
```

### `GET /api/archive/[id]`

Returns one saved archive item, or:

```json
{ "error": "Archive item not found." }
```

with HTTP 404.

### `DELETE /api/archive/[id]`

Deletes one saved archive item.

## Storage behavior

Archive items preserve:

- `id`
- `title`
- `userInput`
- `resultType`
- `workflowData`
- `createdAt`
- `updatedAt`

Copilot sessions preserve:

- `id`
- `userInput`
- `matchedTemplateSlug`
- `messages`
- `currentPlan`
- `sidebarState`
- `fullPlanState`
- `fullPlan`
- `refinements`
- `savedArchiveId`
- `createdAt`
- `updatedAt`

Memory mode is local and ephemeral. Vercel KV mode is persistent as long as the Vercel KV REST credentials are configured.

## What is not included

- No auth.
- No payment.
- No user-specific archive isolation.
- No real LLM call is required by default.
- Image-to-image generation is not part of this MVP.
- AI image generation is not part of this MVP.
- `/api/image/generate`, `IMAGE_PROVIDER`, and image-generation provider modules are intentionally not implemented.
