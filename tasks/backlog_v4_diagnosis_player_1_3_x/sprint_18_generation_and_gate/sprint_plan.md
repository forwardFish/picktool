# Sprint 18 Plan

## Sprint Name
Generation And Gate

## Goal
Turn accepted diagnosis/report/share facts into a guided deck with fixed slide ordering, validated actions, and explicit degrade policy.

## Exit Criteria
- Deck generation uses report/share facts instead of raw DOM capture.
- Outline, slide, and action generation all produce deterministic contract output.
- Quality scoring assigns `A/B/C/D` tiers and deck playback policy follows the degrade contract.
- Slide/action regenerate services re-run validation and persist updated gate results.

## Epic Overview
| Epic | Story Count | Core Responsibility |
| :--- | :--- | :--- |
| Deck Generation Pipeline | 1 | Outline and slide generation from diagnosis facts. |
| Deck Gate And TTS Policy | 1 | Action validation, quality scoring, and degrade rules. |

## Delivery Order
1. FE-089
2. FE-090
