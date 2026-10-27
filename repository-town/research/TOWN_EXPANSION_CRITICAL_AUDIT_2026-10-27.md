# First independent audit: problems with the 27 October 2026 expansion

Status: source-code geometry audit; not an engineering or planning approval. Accompanies `research/DEEP_RESEARCH_PROMPT_TOWN_PLANNING_OPTIMISATION_2026-10-27.md`.

## Critical findings

1. **Unserved parcels:** The north connector lies at z=-235, while northern parcels' nearest edge is z=-252.5, leaving 13m of separation from the connector's northern edge (z=-239.5). The south connector at z=235 ends at z=239.5, while the southern large-lot parcel starts at z=245: 5.5m separation. Western/eastern collector x=±350 extends to ±354.5, while western/eastern parcel edges begin at ±371: 16.5m separation. These are **not yet public-road frontages**. The two short access strips at z=0 touch or overlap only central east/west parcels and are themselves disconnected from the collectors by approximately 11.5m. See `src/world/town-planning-audit.js` for executable checks.
2. **Non-driveable roads:** `town-planning.js` draws flat asphalt strips, but no new edges were added to the vehicle route graph, no intersection priority rules or driveway access were added, and no pedestrian route network exists for them. The word 'collector' is an unverified future designation.
3. **Land-size realism:** 220×160m = 35,200m² = 3.52ha. That is not a realistic broadacre grazing enterprise; the current scene is better described as a small rural holding. Other reserves are 0.95–2.86ha, **not** yet surveyed subdivided house lots.
4. **Potential land-use conflict:** Industrial/service business land is placed adjacent to the residential core without documented acoustic, freight, flood, fire or amenity buffers. Institutional, commercial and agricultural uses on the old row-7 frontage remain in narrow game-world cells.
5. **Road naming/addressing:** The new parcels have IDs (e.g. W-R1) but no street numbers, address-road graph, approved road names or proven entry points. The existing `A1-S` address scheme must be preserved. Do not treat the provisional zone labels as legal LEP zoning.
6. **Road geometry:** The new road strips do not contain kerbs, footpaths, crosswalks, lane markings, signs, road hierarchy speed controls or intersection models. No traffic count or pedestrian warrant supports new signals/roundabouts.

## Prioritised corrections

P0: Freeze further occupied building placements on unserved parcels. Audit all 12 reservations, road geometry, road access and any overlap with established rail/buildings. Do not fabricate property access.

P1: Compare at least three alternate layouts quantitatively. Design actual road graph junctions with existing roads, footpaths and accessible crossings, realistic local/collector widths, safe turning movements and freight/emergency access.

P1: Ensure **every parcel** has a road-facing boundary and a buildable frontage before assigning a street number. Preserve old saves and legacy addresses.

P2: Reorganise employment and rural uses with buffers; include green corridors, drainage, public open space and appropriate housing densities.

P2: Create properly scaled agricultural tiles beyond the normal town renderer, rather than labelling a 3.52ha paddock a large farm.

P3: Introduce intersections or signals only after scenario-based traffic/pedestrian analysis, then run browser vehicle and walking tests.

## Current implementation

`src/world/town-planning-audit.js` exposes `auditOutskirts()` returning parcel areas, provisional frontage, overlapping road strips, proposed-road junctions, missing frontages and rural area. `tests/town-planning-audit.mjs` checks that these known defects remain visible rather than being hidden behind a false 'complete' status.

No claim is made that the current six roads are fully connected or that the layout is optimal. The comprehensive prompt is an actionable research and implementation specification, not completed research.
