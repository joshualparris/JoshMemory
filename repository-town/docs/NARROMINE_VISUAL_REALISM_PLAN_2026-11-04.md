# Narromine visual realism — evidence-first roadmap

Date: 4 November 2026 (Australia/Sydney)
Owner: Josh / Repository Town
Status: ACTIVE — Phase A first implementation pass (not a surveyed as-built model).

## Goal

Make Narromine in `repository-town/` recognisable from street level: geographically grounded roofs, facades, verandahs, windows, doors, signs and shopfronts, with convincing lighting and walkable access. Do not trade geographic accuracy for decorative guesses.

## Available evidence and limits

- **Geography/footprints:** OSM street graph and NSW Spatial Services aerial/cadastre traced lots in `narromine-layout.js` and `narromine-buildings-data.js`.
- **Heights:** NSW 2023/2011 LiDAR measurements in `narromine-lidar-data.js` (medians and percentiles, **not** exact eave/ridge CAD geometry); raw LAZ held separately on Josh's Drive.
- **Photographs:** Josh's reference screenshots documented in `NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md` and `NARROMINE_KIERATHS_SHOPPING_SQUARE_2026-11-03.md`. They are not committed as reusable game textures. Photo dates vary; signage may be historic.
- **Evidence tiers:** `surveyed` (source-measured geometry), `photo-matched` (visual detail visible in an identified photograph), `estimated` (plausible, *not* evidence of a specific real window/door/colour). Multiple tiers can coexist on one structure: surveyed footprint + estimated shopfront.
- Never represent invented tenants, door positions, brick colour, window pattern, or sign designs as measured or as proof of a currently operating business.

## Six milestones

| Stage | Target | Definition of done |
|---|---|---|
| **A — Dandaloo Street architecture** | Royal Hotel, Narromine Hotel, Post Office, Coles/Kierath frontage and adjoining mapped shops | Retain detailed survey geometry; give the remaining generic shop façades visible glazing, door, façade rhythm, fascia/verandah, varied appropriate materials; add provenance and desktop/mobile visual checks |
| **B — Kierath's precinct** | Ten separate bays, kiosk, open-air pedestrian route, rear arch, car park, Coles | Measure/align arcade bay positions to a licensed site plan; preserve both accessible pedestrian exits, avoid solid masses in courtyard; verify roof silhouettes against aerial/ground images |
| **C — Civics/landmarks** | Railway, Court House museum, churches, aviation precinct, hotels | Individually model documented exteriors and functional entrances; measure footprint and roof height where evidence supports it |
| **D — Rest of Narromine** | Residential streets, shops, schools, sheds, yards | Replace repetitive placeholders with parcel-correct and photo-backed building families as source evidence becomes available; optimise distant LOD |
| **E — Living streets** | Traffic, parked vehicles, pedestrians, railway, business hours | Deterministic and culturally grounded town-life routines; don't fabricate real living residents or current tenant identities |
| **F — Environmental fidelity** | Terrain, plants, sky, weather, daylight, moving shadows | Use correct geographical solar position, locally appropriate trees and terrain, adaptive shadow and LOD budget on Android |

## Phase A implementation contract

### Included in this pass

1. A pure, tested `narromine-facade-profiles.js` for deterministic, evidence-tagged shop façade palettes and bay layout. This is a **visual estimate generator** for buildings not yet photographed; it must not overwrite measured heights/footprints.
2. Street-facing windows with mullions, recessed-looking visual door leaf, lintels, brick piers, signs and eaves/coping for mapped frontages and generic infill shop boxes; preserve all existing collisions and walkways.
3. Preserve **hand-modelled** Post Office, Coles, Kierath's, St Mary's and other detailed geometry; never replace their real geometry with a universal storefront.
4. Give the traced Royal and Narromine hotels conservative roof-edge/ground-floor frontage detail based on existing traced fronts and their known verandah structures; positions/materials remain clearly estimated unless photographed.
5. Add test assertions for evidence labels, profile determinism, count/spacing and no regression to established mapped property or arcade geometry.

### Excluded until better evidence

- Exact opening locations, shop occupants and logos not visible in verified current photography; real building interiors or licensed brand art.
- Assumed roof pitch for non-detailed OSM buildings: measured LiDAR height does **not** reveal precise roof profile by itself.
- Automatic AI-derived textures or facade features with no verifiable visual reference.
- Colliders for cosmetic windows/doors; painted doors must not imply an operational entrance.

## Acceptance gates

- Unit checks of profile classification/bay spacing, existing `narromine-layout.mjs`, Kierath's walk-through and `narromine-browser.mjs` where available.
- Build and privacy checks, full release/integration gates before merging.
- Actual desktop + Android browser capture of **Dandaloo Street** from pedestrian height, repeat at day/night and with moving solar shadows; no major overlapping geometry, clipping, dropped performance or inaccessible corridors.
- Deploy only verified merged main; compare served production source revision and inspect production scene. CI/build success by itself is not visual proof.
- Report exactly which surfaces are photo-matched vs visually plausible only.

## Priorities after this PR

1. Reconcile individual Dandaloo shop entrance locations with *permissioned* on-the-ground photographs.
2. Tighten historic Royal/Narromine Hotel façade details from ground-level images and survey.
3. Compare LiDAR point cloud roof slopes/ridges and façade profiles where enough points exist.
4. Add a developer fidelity overlay for measured/photo-estimated status and screenshot evidence record.
5. Expand from photographed core to the remaining town. No contact with businesses/council/people on Josh's behalf.

## Source files

- `docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md`
- `docs/NARROMINE_KIERATHS_SHOPPING_SQUARE_2026-11-03.md`
- `src/world/narromine-buildings-data.js`
- `src/world/narromine-lidar-data.js`
- `src/world/narromine-kieraths-data.js`
- `tools/narromine_lidar.py`

NSW data: © State of New South Wales (Spatial Services), CC BY 4.0; OSM © OpenStreetMap contributors (ODbL).
