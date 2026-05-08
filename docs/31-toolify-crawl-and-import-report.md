# Toolify Crawl And Import Report

Generated: 2026-05-07

## Result

- Requests crawler smoke test passed.
- Requests category crawl was blocked by HTTP 403 on `https://www.toolify.ai/category`.
- The crawl runner now supports `TOOLIFY_CRAWL_MODE=auto`, which switches to browser-mode fallback when requests mode is blocked.
- Browser-mode crawler opened public pages without CAPTCHA, login wall, or access challenge during this run.
- Browser-mode targeted crawl visited 11 picktool-relevant categories, saw 88 tool URLs, saved 66 new tools, and skipped 22 already-existing or filtered items.
- Normalized local catalog contains 96 allowed Toolify rows after quality filtering.
- Category discovery wrote 445 categories to `data/ai-tools/raw/toolify_categories.json`.

## Outputs

- `toolify_ai_source_crawler/data/toolify.sqlite`
- `toolify_ai_source_crawler/data/export/toolify_tools.jsonl`
- `data/ai-tools/raw/toolify_categories.json`
- `data/ai-tools/raw/toolify_tools_raw.jsonl`
- `data/ai-tools/normalized/tools.jsonl`
- `data/ai-tools/reports/crawl_report.md`
- `data/ai-tools/reports/quality_report.md`
- `data/ai-tools/reports/crawl_blocker_report.md`

## Targeted Categories

- `ai-video-editor`
- `ai-caption-generator`
- `ai-subtitle-generator`
- `ai-short-video-generator`
- `ai-ppt-maker`
- `ai-presentation-generator`
- `ai-pdf-summarizer`
- `ai-landing-page-builder`
- `ai-website-builder`
- `ai-report-generator`
- `ai-script-writing`

## Crawl Policy

The crawler uses low rate limits and does not use proxies, login bypass, CAPTCHA bypass, or Cloudflare bypass. If future runs encounter an access challenge, stop crawling and use official/partner data or imported fixtures.
