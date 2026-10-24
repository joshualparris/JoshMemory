# RTD-003 — Complete Repo Town NPC identity and population inventory

**Date:** 24 October 2026 (Australia/Sydney)  
**Status:** Source roster audited and machine-readable population snapshot committed; runtime behaviour unchanged.  
**Source of truth:** `joshualparris/JoshMemory`, `repository-town/` (not the generated Parris-Tech-Services mirror).  
**Machine-readable full inventory:** [NPC_POPULATION_INVENTORY_2026-10-24.json](NPC_POPULATION_INVENTORY_2026-10-24.json)  
**Automated regression:** `node tests/npc-population-inventory.mjs`, now included in `npm run test:integration`.

## Population categories — the critical distinction

| Type | Current count | Stable key | Source of truth | Actual simulation? |
|---|---:|---|---|---|
| Named street characters | **32** | `named:<npc.id>` | `src/ui/npc-data.js`, rendered by `src/world/npcs.js` | Basic street roaming and dialogue, **not** the complete `TownLife` work/day planner |
| Living Town named workers/residents | **99** | `worker:<numeric-id>` | `src/world/life.js` `JOBS`, `VILLAGER_NAMES`, `TownLife.villagers` | **Yes**: simulated work, home, shifts, money, needs and social events |
| Repository-house resident **slots/aliases** | **188** | `resident:<house-coordinate>` | 188 project records in `docs/repository-town.json`; `src/ui/resident-identity.js` | **Not 188 additional simulated people**; per-house deterministic dialogue identity |
| Grid positions without a project house | **20** | No resident identity/house | 26 × 8 = 208 possible positions | **No** |
  
**Do not sum the three main counts as 319 independently simulated NPCs.** They are **319 distinct namespaced conversation/identity slots**, with different lifecycles and a shared physical world. At present **99 of the 188 houses** are also assigned as the simulated workers' homes, leaving **89 houses without an assigned simulated worker**. Those houses still have a deterministic local resident name; they are **not** separate full-day simulated workers. There are no actual project houses at grid coordinates `G8`–`Z8`.

### Why the earlier figure of 38 is now outdated

The first **38 worker IDs (0–37)** and their home assignments are preserved for backwards-compatible saved games. `src/world/life.js` now builds a **99-person `ROSTER_SIZE`**:
- 61 starting job entries, of which the first 38 were original workers and another 23 were added later
- 30 dynamically appended relief shifts for understaffed facilities
- 8 appended security office/HQ and locksmith workers

The worker display-name pool contains **99 unique names** and each worker has a stable numeric `id` and a unique house coordinate in the current 188-house inventory. Keep `worker:<id>` as the future dialogue key; do not treat name or home coordinate as a worker's primary key.

## All 32 named street characters

| # | Stable key | Character | Role | Map home | Approved ElevenLabs Game300 | Quiz |
|---:|---|---|---|---|---|---|
| 01 | `named:rowan` | Rowan | Town Guide | M4 | Game300 approved | No |
| 02 | `named:pip` | Pip | Dice Goblin | M5 | Game300 approved | No |
| 03 | `named:circuit` | Circuit | Robot Mechanic | Y2 | Game300 approved | No |
| 04 | `named:wren` | Wren | Wildlife Ranger | B2 | Game300 approved | No |
| 05 | `named:sol` | Sol | Travelling Chef | M2 | Game300 approved | No |
| 06 | `named:sage` | Sage | Library Sage | A2 | Game300 approved | No |
| 07 | `named:spark` | Spark | Radio Inventor | L4 | Game300 approved | No |
| 08 | `named:lyra` | Lyra | Street Musician | J7 | Game300 approved | No |
| 09 | `named:nova` | Nova | Star Navigator | C7 | Game300 approved | No |
| 10 | `named:kit` | Kit | Repair Café Volunteer | V2 | Game300 approved | No |
| 11 | `named:ember` | Ember | Arena Champion | F5 | No approved Game300 voice | No |
| 12 | `named:vale` | Captain Vale | Space Captain | Z1 | No approved Game300 voice | No |
| 13 | `named:bramble` | Bramble | Walking Tree | H1 | No approved Game300 voice | Yes |
| 14 | `named:echo` | Echo | Friendly Ghost | Q3 | No approved Game300 voice | Yes |
| 15 | `named:moss` | Moss | Mushroom Keeper | H7 | No approved Game300 voice | Yes |
| 16 | `named:byte` | Byte | Glitch Sprite | J5 | No approved Game300 voice | Yes |
| 17 | `named:tick` | Tick | Clockwork Timekeeper | S3 | No approved Game300 voice | Yes |
| 18 | `named:nimbus` | Nimbus | Raincloud Poet | D6 | No approved Game300 voice | Yes |
| 19 | `named:fizz` | Fizz | Potion Slime | W1 | No approved Game300 voice | Yes |
| 20 | `named:coral` | Captain Coral | Sea Dragon | P3 | No approved Game300 voice | Yes |
| 21 | `named:quill` | Quill | Talking Raven | A4 | No approved Game300 voice | Yes |
| 22 | `named:orbit` | Orbit | Curious Alien | X1 | No approved Game300 voice | Yes |
| 23 | `named:thistle` | Thistle | Fox Merchant | O4 | No approved Game300 voice | Yes |
| 24 | `named:basil` | Basil | Tea Witch | M6 | No approved Game300 voice | Yes |
| 25 | `named:pebble` | Pebble | Stone Golem | G1 | No approved Game300 voice | Yes |
| 26 | `named:zig` | Zig | Robot Dog | L6 | No approved Game300 voice | Yes |
| 27 | `named:pollen` | Pollen | Bee Engineer | N2 | No approved Game300 voice | Yes |
| 28 | `named:lumen` | Lumen | Lantern Spirit | T4 | No approved Game300 voice | Yes |
| 29 | `named:vesper` | Vesper | Night Owl | R6 | No approved Game300 voice | Yes |
| 30 | `named:kestrel` | Kestrel | Sky Pirate | F6 | No approved Game300 voice | Yes |
| 31 | `named:drift` | Drift | Sleepy Astronaut | U7 | No approved Game300 voice | Yes |
| 32 | `named:tangle` | Tangle | Octopus Puzzle Master | T2 | No approved Game300 voice | Yes |

There are **10 distinct approved Game300 voiced characters** (Rowan, Pip, Circuit, Wren, Sol, Sage, Spark, Lyra, Nova and Kit) and **20 NPC quiz challenges**. Other 22 named street actors do **not** currently have approved Game300 character recordings; do not represent device speech or another actor's lines as their voices. Being assigned a house coordinate does not turn a street actor into that house's resident alias.

## Full workers and house-resident mapping

The committed JSON contains, without private repository titles, summaries, files or URLs:

- **32 `namedStreetActors`** with canonical `id`, namespaced key, character name, title, coordinate, Game300 casting and quiz indicator.
- **99 `livingTownWorkers`** with numeric persistent `id`, namespaced key, display name, real work role, `workplace`, current `homeCoordinate` and roster layer (`original38`, `baseline`, `relief`, `security`).
- **188 `projectHouseResidentSlots`** with coordinate, namespaced key, deterministic public-safe display name and `assignedWorkerId` (or `null` if no simulated worker lives there).
- **20 `emptyGridCells`** excluded from all house-resident or simulated-worker counts.
- Source blob SHA references and a count breakdown so a future assistant can detect drift and regenerate an authoritative snapshot.

### Display-name collisions are not identity links

The current street-actor and worker rosters both include **Rowan**. These are **two different identities**: `named:rowan` and a separate `worker:<id>`. The full 208-coordinate grid's deterministic first-name pool also includes `Kit`, `Pip`, `Sol` and `Wren`, which may look like the named cast, but full house-resident identities are **coordinate-keyed**. Never merge social memories, quest progress or voice entitlements based on display names alone.

## Evidence, regression and scope

The source snapshot was built from:

- `src/ui/npc-data.js` — all 32 `NPCS`, unique `id` and map coordinates.
- `src/ui/voicebank.js` — exact 10 Game300 actor IDs.
- `src/world/life.js` — 61 baseline job rows + 30 relief posts + 8 security/locksmith posts, `VILLAGER_NAMES`, original 38 saved-ID compatibility and actual worker home-selection algorithm.
- `docs/repository-town.json` — authoritative 188 project coordinates, **not** the whole 208-place map.
- `src/ui/resident-identity.js` — deterministic full resident names for every valid town coordinate.
- `src/ui/npc.js`, `src/world/npcs.js`, `src/world/townlife.js` — distinct house, street and simulated-worker rendering/chat roles.

`tests/npc-population-inventory.mjs` instantiates the **real `TownLife` class with the actual ordered house coordinates** and compares all 99 workers, roles, workplaces and homes against the committed JSON. It also checks all 32 named actors, quiz and recorded casting, 188 resident aliases, uniqueness, all 20 empty grid cells and privacy of the snapshot. This is a regression for the **inventory data**, not a substitute for live 3D playtesting or casting/recording missing lines.

**RTD-003 handover:** The NPC roster is fully enumerated and saved in reusable JSON. Future dialogue engine work (RTD-009/010) should use these distinct keys and join on authoritative worker `id`, not name. RTD-004's [dialogue-system audit](RTD_004_DIALOGUE_SYSTEM_AUDIT_2026-10-24.md) identifies the state and persistence integration points.

**Coordination:** Replit usage was exhausted before this takeover. No Replit-authored new runtime work was overwritten; the audit was performed on canonical `main` through its existing GitHub sources. No app runtime code, deployed game, VoiceBank assets or backups were modified.
