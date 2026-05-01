# Sprint 19 Plan

## Sprint Name
Player Routes And Playback

## Goal
Ship the diagnosis deck playback core first, then connect parent and tutor-share walkthrough routes on top of the same persisted playback contract.

## Exit Criteria
- ActionEngine and PlaybackEngine support start/pause/resume/stop, navigation, and snapshot restore.
- Parent route `/dashboard/reports/[reportId]/play` is available with `Guided Walkthrough` positioning and voice-off-by-default UX.
- Share route `/share/[token]/play` is read-only and preserves share expiry/revoke/privacy constraints.

## Epic Overview
| Epic | Story Count | Core Responsibility |
| :--- | :--- | :--- |
| Playback Core | 1 | Persist playback state and expose the deck playback/snapshot APIs. |
| Parent Player | 1 | Add the parent walkthrough route and report entry point. |
| Share Player | 1 | Add the tutor-read-only walkthrough route and share APIs. |

## Delivery Order
1. FE-093
2. FE-091
3. FE-092
