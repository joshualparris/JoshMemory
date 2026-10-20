# Open-source adaptation #2: Neighborly-inspired lived social history

20 October 2026. Inspiration: https://github.com/ShiJbey/neighborly
Original author Shi Johnson-Bey, MIT licence. The upstream project was archived in April 2026.
We **did not copy** Neighborly Python source, simulation data, art or framework; this
is an original pure JavaScript module tailored to Repository Town's existing simulation.

## Implemented
- Shared deterministic, bounded social state (`src/world/social-events.js`) owned by
  `TownLife`, not another browser-only, non-simulated gossip database.
- 38 existing villagers have symmetric relationship scores. Scores can develop through
  genuine recorded events: visiting another named resident while that resident is
  home and idle, and working alongside a colleague at the same site.
- Residents choose a known available neighbour for leisure visits; they will not
  abandon meals, work or sleep. No longer visit random empty house coordinates
  while claiming to be with its owner.
- One encounter per pair, type and town day; bounded recent memories, small event log.
- Social memory saved and restored in the existing town snapshot; older saves migrate
  to an empty history without inventing events or breaking player progress.
- `TownLife.describe` and `townContext` expose actual witnessed memories to NPCs.
  Their live AI prompt and offline friendship/gossip replies use that context.
- Regression tests cover deterministic bonds, visiting, coworkers, save/restore,
  legacy compatibility and sanitising invalid persisted records.

## Deliberate limits
- This is not Neighborly's multi-generation, business-startup or romance simulation.
- Existing localStorage `ui/social.js` still records the player's conversations,
  trust and house-resident errands; game-world social events are authoritative for
  witnessed villager-villager bonds and memories. They are merged in the dialogue,
  not claimed to be identical stores.
- Only actual visits/working together cause memory changes: no fabricated social
  events from passing on the street, no AI-generated changes in town truth.
- Full browser/probook performance and model-backed Groq dialogue require
  physical/network verification beyond automated integration tests.

## QA
`node tests/social-events.mjs`
`npm run test:integration`
`npm run build && npm run check:privacy`
Ask a named villager about friends or past work. Advance the town through evenings
and shift ends. Reload: their witnessed events should remain and not duplicate.
