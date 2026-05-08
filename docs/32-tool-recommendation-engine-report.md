# Tool Recommendation Engine Report

Generated: 2026-05-07

## Implemented

- Added deterministic TaskIntent inference for video editing, PDF-to-PPT, landing pages, market research, image design, and general AI workflows.
- Added local catalog search across name, description, categories, tags, task intents, input/output types, use cases, and capabilities.
- Added scoring evidence so recommendations explain why each tool matched.
- Added `/api/tools/search` and `/api/tools/recommend`.
- Added `/tools-dataset` for local data inspection.
- Integrated catalog-backed recommendation into `buildBasicPlan` and `applyUpgrade` without breaking existing v2 Copilot flow.
- Added tool actions: open website, copy prompt, and show use steps.

## Fallback

If `data/ai-tools/normalized/tools.jsonl` is missing, the loader still merges the existing manual tool set from `lib/data/tools.ts`, so Copilot and v1.2 compatibility routes remain usable.

## Acceptance Scenarios

- `AI 视频剪辑` maps to `video_editing`.
- `PDF 转 PPT` maps to `document_to_slides`.
- `Landing Page` maps to `landing_page`.
- Copilot start returns a catalog-backed basic plan.
- Full plan remains collapsed until explicitly requested.
