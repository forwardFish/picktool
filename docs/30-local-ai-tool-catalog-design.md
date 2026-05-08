# Local AI Tool Catalog Design

Generated: 2026-05-07

## Summary

picktool now treats tools as a local catalog instead of only template data. The crawler remains offline and writes local data, while the Next.js runtime reads normalized JSONL from `data/ai-tools/normalized/tools.jsonl`.

## Data Flow

```text
Toolify public pages
-> toolify_ai_source_crawler
-> raw JSONL / categories JSON
-> scripts/normalize-tools.mjs
-> data/ai-tools/normalized/tools.jsonl
-> lib/tool-catalog loader/search/score/recommend
-> /api/tools/search and /api/tools/recommend
-> workflow-generation engine and Copilot
```

## Runtime Modules

- `lib/tool-catalog/types.ts`: shared `AiTool`, `TaskIntent`, and recommendation result types.
- `lib/tool-catalog/safety-filter.ts`: blocks risky categories and terms before recommendation.
- `lib/tool-catalog/load-tools.ts`: loads local JSONL and merges manual fallback tools.
- `lib/tool-catalog/search-tools.ts`: keyword, category, tag, and intent recall.
- `lib/tool-catalog/score-tools.ts`: deterministic scoring with evidence.
- `lib/tool-catalog/recommend-tools.ts`: builds task intent, selected tools, tool slots, upgrades, skipped tools, and scoring evidence.

## Safety Defaults

The recommendation engine only uses tools with `safety.allowed = true`. Blocked groups include adult/NSFW, bypass/anti-detection, gambling, weapons, drugs/smoking/alcohol, and relationship/romance-adjacent categories.

## Product Integration

The existing v2 template flow remains the workflow skeleton. Catalog recommendation enriches plans with catalog-backed candidates and tool actions while preserving the progressive Copilot UX: good-enough plan first, upgrades on demand, full plan only after confirmation.
