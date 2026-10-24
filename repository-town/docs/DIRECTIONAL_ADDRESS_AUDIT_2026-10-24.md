# Repository Town — physical two-frontage land audit (24 October 2026)

## Scope, source and address definition

This audit uses **physical scene construction**, not just the historical GitHub-project address inventory. Sources: `src/world/town.js` (188 house geometries, 26 columns and built row-1–8 roads), `src/world/life.js` (46 actual business/civic/farm sites, railway, paddocks), `src/world/townlife.js` (drawn shops/rail/crops and collisions), `src/world/property.js` (deeds) and `../../docs/repository-town.json` (188 houses). The 24 October user screenshots confirm Z7 UpskillApp, Workshop Way, the railroad, physical storefronts and that the proposed row-9 road is a **tree line rather than a constructed road**.

Road-oriented assignment: a building immediately **north of street R** receives `<col>R-S`; a building immediately **south of street R** receives `<col>(R+1)-N`. In the current code, legacy house `Z7` is `Z7-S`. The row-8 industrial/commercial buildings use `G8-S`–`Z8-S`; the full south-of-road civic frontage uses `A9-N`–`Z9-N`. The railway between Creative Court and Workshop Way uses `A8-N`–`Z8-N`. All existing repository coordinates and immutable deed keys remain valid aliases; directional addresses are the **display/navigation layer**.

## Verified site accounting

| Physical section | References | Count | Status |
|---|---|---:|---|
| Existing repository buildings on original 8 rows | A1-S–Z7-S, A8-S–F8-S | 188 | Buildings occupied as structures; tenants may be vacant |
| North frontage of Workshop Way | G8-S–Z8-S | 20 | Town Hall, stores, businesses and farm structures |
| Opposite / south frontage of Workshop Way | A9-N–Z9-N | 26 | Existing civic, service, factory, training and industry buildings |
| Rail line just south of Creative Court | A8-N–Z8-N | 26 | Reserved right of way; not empty buildable land |
| Documented working fields *behind* civic strip | B9-S, T9-S, U9-S, V9-S, W9-S, X9-S, Y9-S | 7 | Active agricultural land; not vacant building plots |
| No assigned building or surveyed clearance behind remaining row-9 sites | A9-S, C9-S–S9-S, Z9-S | 19 | Unbuilt/unsurveyed; no road 9; requires ground/utility/collision assessment |
| Opposite-frontage space for original row-1–7 blocks | A1-N–Z7-N | 182 | Not separately built or surveyed; can overlap rear yards, existing structures, roads or borders |
| Planning/perimeter bands (not streets in code) | A10-N–Z11-S | 104 | Unknown surveyed status; do not promise free plots |

**Totals:** 188 repository houses + 46 further physical town buildings = **234 existing buildings**. The atlas models 26 columns × 11 planning bands × 2 frontages = **572 references**, of which 26 are rail reservations, 7 are specified working fields, 19 are unbuilt/unverified sites behind row-9 buildings, 182 are other unverified frontages and 104 lie in planning/perimeter bands. These accounting buckets are mutually exclusive.

The first 188 repository structures are **not** the full town. The older `docs/repository-town.html` and `docs/repository-town.json` show 20 empty *repository houses* on G8–Z8, but those positions are physically occupied by TownLife's G8–Z8 businesses. **No G8–Z8 block should be described as vacant.** Separately, a property card saying `Occupier: Vacant` (as in the supplied screenshot at Z7) describes a *tenant status*, not the absence of its 3D building.

## Grounded key examples

| Address | Real on-map feature | Reason |
|---|---|---|
| Z7-S | UpskillApp | Existing repository house previously at Z7 |
| Z7-N | Undetermined backside / opposite frontage | No independently designed structure, clearance unverified |
| Z8-N | Railway | Existing track runs behind Workshop Way buildings |
| Z8-S | Farmhouse | `PLACE_DEFS` row-8 north-side entry |
| Z9-N | Macquarie Locksmith & Keys | South-of-road entry in `PLACE_DEFS` |
| Z9-S | Unbuilt, unsurveyed | No defined building; *not confirmed buildable* |
| B9-S | Macquarie Soybean Farm field | Cropped land behind the south-frontage premises |
| Y9-S | Wheat Farm field | Actively simulated field behind the frontage |
| Row 9 roadway | Not constructed | User observes trees; the renderer builds roads only for rows 1–8 |
| Rows 10–11 | Unbuilt planning/perimeter | No registered roads or per-address lot geometry currently drawn |

## Acceptance and safety constraints

- Directional addresses appear for all **234 physical building sites**, in game search/list labels, floating location sign/house card, front-of-business panels and deed presentation.
- `src/world/addresses.js` is the single formatter, parser and audit registry. `src/address-map.html` + `src/ui/address-map.js` render actual public house data and all town place definitions as a colourful scrollable 572-cell two-frontage plot atlas.
- Existing `H:Z7`, `B:farmhouse`, `B:locksmith` property IDs are **unchanged**; saves and mortgages use the same IDs. Old house `Z7` searches remain valid. Old `South Z8` business searches still resolve.
- No physical structures are cloned, moved, deleted, sold or built. Any build-out of row-9-S or row-1–7-N land needs an explicit physical clearance survey (footprints, yard props, rail exclusion, utility routing and road access), then a street-and-parcel implementation.
- No claim of live deployment or handset verification is made simply by committing code.

## Repeatable check

`node tests/directional-addresses.mjs` validates all 572 addresses, 234 non-overlapping building assignments, key N/S examples, railway and crop exclusions, and saved-property deed-key invariants. It runs as part of `npm run test:town`. The public release must also pass `npm run build:release`, the existing privacy gate and a real in-browser exploration of the map and fast travel before claiming full acceptance.

## Further work (not part of renaming)

1. Survey per-lot 3D footprints, entrances, rear yards, traffic lanes and streetlight clearance on **both** frontages before declaring developable land.
2. Determine actual map bounds for future row-9 road / agricultural rows 10–11 and commission streets only after updating traffic routing, civil services, house spawn/pathfinding and minimap.
3. Replace the old repository-only map's misleading vacancy legend with a link to the physical atlas; retain it as a *repository address directory*, not a plot survey.
