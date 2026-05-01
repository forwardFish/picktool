# Sprint 17 Plan

## Sprint Name
Continuity And Schema

## Goal
Repair continuity drift, formalize the 1.3.x planning lane, and land the deck persistence/data contracts that every downstream player story depends on.

## Exit Criteria
- Continuity files point to `backlog_v4_diagnosis_player_1_3_x`.
- Story/YAML, sprint plans, epic docs, and execution order are complete for Sprint 17 through Sprint 20.
- Canonical requirement, traceability, and testing docs include the `DECK13-*` requirement and test rows.
- Deck schema, migrations, and repository contracts can persist empty decks, slides, actions, exports, share settings, and snapshots.

## Epic Overview
| Epic | Story Count | Core Responsibility |
| :--- | :--- | :--- |
| Continuity And Planning Bootstrap | 1 | Repair continuity state and establish formal 1.3.x delivery assets. |
| Deck Schema And Contracts | 1 | Add deck persistence, link reports/runs to decks, and expose the repository contract. |

## Delivery Order
1. FE-087
2. FE-088
