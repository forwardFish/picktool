# DESIGN

## Product Intent
- Goal: Update tutor-friendly share output and add starter calibration assets for stable diagnosis behavior.
- Audience: operators and researchers who need a decision-oriented working surface
- Surface scope: app/api/share/[token]/route.ts, lib/reports/localize.ts, docs/requirements/20260408_222711_sprint_9_production_readiness_foundation.md, docs/requirements/20260408_223736_sprint_9_production_readiness_foundation.md, docs/requirements/20260408_225959_sprint_9_production_readiness_foundation.md, docs/requirements/20260409_085855_sprint_9_production_readiness_foundation.md, docs/requirements/20260409_103907_sprint_9_production_readiness_foundation.md, docs/requirements/20260409_104946_sprint_9_production_readiness_foundation.md, docs/requirements/20260409_105428_sprint_9_production_readiness_foundation.md, docs/requirements/20260409_112842_sprint_10_live_billing_and_auth.md, docs/requirements/20260409_113308_sprint_10_live_billing_and_auth.md, docs/requirements/20260409_114302_sprint_10_live_billing_and_auth.md, docs/requirements/20260409_114517_sprint_11_conversion_layer.md, docs/requirements/20260409_115117_sprint_11_conversion_layer.md, docs/requirements/20260409_115415_sprint_12_report_quality_and_run_reliability.md, docs/requirements/20260409_121053_sprint_12_report_quality_and_run_reliability.md, docs/requirements/20260409_121333_sprint_12_report_quality_and_run_reliability.md, docs/requirements/20260409_121438_sprint_13_retention_and_tutor_handoff.md, docs/requirements/20260409_122627_sprint_13_retention_and_tutor_handoff.md, docs/requirements/20260409_134812_sprint_13_retention_and_tutor_handoff.md, docs/requirements/20260409_135305_sprint_13_retention_and_tutor_handoff.md, docs/requirements/20260409_135528_sprint_14_privacy_and_beta_launch.md, docs/requirements/20260409_145129_sprint_14_privacy_and_beta_launch.md, docs/requirements/20260409_145902_sprint_14_privacy_and_beta_launch.md, docs/requirements/20260409_154047_sprint_14_privacy_and_beta_launch.md, docs/requirements/20260409_155449_sprint_14_privacy_and_beta_launch.md, docs/requirements/20260410_184856_sprint_15_foundation.md, docs/requirements/20260410_185616_sprint_15_foundation.md, docs/requirements/20260410_185758_sprint_15_foundation.md, docs/requirements/20260410_195257_sprint_15_foundation.md, docs/requirements/20260410_195437_sprint_15_foundation.md, docs/requirements/20260410_200653_sprint_15_foundation.md, docs/requirements/20260410_201518_sprint_15_foundation.md, docs/requirements/20260410_201800_sprint_15_foundation.md, docs/requirements/20260410_203021_sprint_15_foundation.md, docs/requirements/20260410_203402_sprint_15_foundation.md, docs/requirements/20260410_203416_sprint_16_product.md, docs/requirements/20260410_203938_sprint_16_product.md, docs/requirements/20260410_204823_sprint_16_product.md, docs/requirements/fe_080_taxonomy_contract.md, docs/requirements/next_phase_requirement_index.md, docs/requirements/next_phase_traceability_matrix.md, docs/requirements/prd_requirement_index.md, docs/requirements/prd_traceability_matrix.md, docs/requirements/saas-starter 一天落地实施说明.md, docs/requirements/方向判断.md, docs/requirements/需求文档_1.2.1.md, docs/requirements/需求文档_1.2.md

## Visual System
- Direction: editorial market-intelligence dashboard with layered panels and clear decision hierarchy
- Deep navy or carbon base with restrained cyan / mint accents
- Layered glass-like panels with clear contrast between summary and detail
- Large editorial headline paired with compact analytical labels

## Information Architecture
1. Hero section with page thesis, active context, and primary controls
2. Decision strip that highlights the top summary, lead theme, or top opportunity
3. Working sections that separate summary from detailed evidence
4. Shared risk and method boundary section near the end of the page
5. Explicit handling for empty, partial, failure, and refresh states

## Interaction Rules
- Active filters and view modes should be visually obvious.
- Primary metrics must sit next to interpretation, not alone.
- Dense detail blocks should be chunked into evidence, signals, and risks.
- High-risk UI work should preserve navigation continuity and state clarity across refresh and partial data.

## Copy Direction
- Write like a product surface, not an internal demo board.
- Lead with the main decision, then evidence, then risks.
- Prefer concise labels over engineering jargon in the page chrome.

## Implementation Notes
- Preserve current data contracts and route shape.
- Use layered panels, strong hierarchy, and explicit summary sections above dense detail blocks.
- Keep empty, loading, partial-data, and failure states visible.
- Route-level design review should compare the built page against these decisions, not just screenshots.

## Review Checklist
- The first screen explains what the page is for.
- The main theme or decision lead is visible without scanning the full list.
- The page no longer reads like a demo table or placeholder board.
