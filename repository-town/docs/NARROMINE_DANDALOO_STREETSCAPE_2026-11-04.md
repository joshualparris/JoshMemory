# Dandaloo Street — physical streetscape and geographic fidelity (4 Nov 2026)

**Branch / PR:** `feat/narromine-dandaloo-streetscape-20261104`, #333  
**Status:** PARTIALLY COMPLETE — first code pass; full browser / deployed visual verification required.  
**Shared coordination policy:** [PARALLEL_AGENT_COORDINATION.md](../docs/PARALLEL_AGENT_COORDINATION.md) (canonical on `main`). Multiple agents can work on Dandaloo Street, with distinct features.

## Exact scoped implementation, not geographic exclusivity

- **NR-DS-001:** Dandaloo dual-carriageway centre planted strip and protective kerbs, from the north shopping section at z −877…−932 and south of Nymagee at z −979…−1165, deliberately leaving the cross-street gaps clear.
- **NR-DS-002:** side-of-road parking bay white-line visuals and paving, in those same two split-carriageway sections; offsets, counts and orientation are illustrative pending field survey.
- **NR-DS-003:** planted median gardens, selective flowering verge trees, a supplementary palm and curved heritage-style street lamps, without replacing the existing Kierath's median palm/sculpture or modelled building trees.

**Code:** `src/world/narromine-dandaloo-streetscape-data.js`, `src/world/narromine-dandaloo-streetscape.js`; two-line import/build integration in `src/world/narromine.js`; `tests/narromine-dandaloo-streetscape.mjs`, `package.json` test command. No hotel, post office, railway, arcade, RTD, Google Street View or visual QA files edited.

**Interfaces:** world coordinates = `src/world/narromine-layout.js` `STREETS` from OSM anchor (WGS84, metres, x east/z south); `push` batching and `flatPoly`, `strip`, `box` in `buildNarromine`. Asphalt remains exclusively owned by `narromine-road-surfaces.js`, avoiding coplanar overlapping road surfaces. No new colliders, services, keys or textures.

## Evidence and uncertainty

1. [OpenStreetMap](https://www.openstreetmap.org/copyright) export dated 2026-11-03: separate Dandaloo trunk carriageways; mapped widths (~10 m each), shape and Nymagee/Burraway/Meringo junctions. ODbL 1.0, attributed in game.
2. [Narromine Shire Council 2019 streetscape design attachment](https://www.narromine.nsw.gov.au/__media_downloads/03%20-%20Reports%20of%20Committees%20-%20July%202019.pdf?downloadable=1): documented planting palette, kerb extensions, parking arrangements and streetlights. **It is a design proposal covering distinct Dandaloo North/South precincts; not proof all elements were built at the modelled coordinates.**
3. [2023 40–42 Dandaloo Street planning application](https://www.planningportal.nsw.gov.au/daex/determined/da202347-alterations-additions-commercial-development) and associated submitted photos: supplementary built-environment context, not a measured pole/planting survey.
4. [Josh's 55 side-by-side real/game comparison screenshots, 2026-11-04](https://drive.google.com/drive/folders/1wgPC3JnTWJIPurRXzbW_5T5DLcn1QXJR): shows need for detailed trees, green central medians, angled parking, pavers and real lamps. **Reference only. Do not copy Google Street View pixels to source textures or redistributed screenshots.**
5. [Wikimedia Commons Dandaloo streetscape, CC BY 3.0](https://commons.wikimedia.org/wiki/File:Narromine_Dandaloo_Street_002.JPG): historical photograph of the central planted median and vegetation. Recheck capture date before inferring its current appearance.

**Confidence:** mapped centreline topology = high; median positions relative to modelled asphalt = mathematically derived; actual kerb boundaries, shop-side parking separator positions, exact planting counts/species, solar fixtures, pedestrian crossing markings and night illumination = **unverified estimates**. The existing flattened terrain means raised footpath/kerb dimensions are not a survey.

## Verification performed / still required

- **Performed via connected GitHub source-evaluation check (NOT full Node or browser):** 2 independently mapped trunk road lines span the target; computed 35 nonoverlapping median pieces, 140 kerb fragments, 70 paver surfaces, 72 bay separators, 11 trees and 9 lamps; every median vertex remains outside both mapped road asphalt edges with at least 0.4m clearance; no new planted tree or lamp within 7m of the existing detail model's trees / palm / post-office lamps / statue. This tests data geometry only.
- **Required for full acceptance:** run Node test and required build/privacy/regression suites; desktop/mobile WebGL screenshot QA, close-up at planted median and 82 Dandaloo, entrances/collision/driveability, frame-rate and draw calls; verify dusk and night lamp appearance, no z-fighting, actual deployment SHA and URL.
- **Known caveats:** paint stripes are approximated; tree canopies deliberately varied but geometry is stylised, not photogrammetric; lamps are modelled props without real emissive dynamic lights; no trunk colliders yet (adding them needs pathfinding clearance tests); not all existing historical street details are present.

## Next truthful reconstruction priorities

1. Align actual planting/parking/kerb footprints with council and dated field photographs, not the naive regular spacing.
2. Reconstruct missing local shop awnings, fascia signs, façades and interiors individually from permitted photography and LiDAR (keep other agents' building ownership).
3. Add measured road levels and shadows, lamp fixtures and lighting, signs, tactile kerb ramps, pedestrian crossings, drain covers and power/utility infrastructure only where evidence supports them.
4. Expand the building/vegetation register to every street, with source licences, uncertainty, dates and visual review acceptance per site.
5. Make in-game NPC movements, transport, day/night, seasons, sound and opening hours match reality where verified; mark invented gameplay clearly fictional.
