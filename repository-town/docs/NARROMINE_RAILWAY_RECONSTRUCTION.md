# Narromine Railway Station Precinct — Geospatial & Architectural Reconstruction

Date: 4 November 2026 (Australia/Sydney)  
Branch: `feat/narromine-railway-precinct-20261104`  
Status: **Standalone implementation complete — live integration pending** (`src/world/narromine.js` and `package.json` left untouched while PR #309, PR #310, and PR #311 hold active claims).

---

## 1. Coordination & Non-Interference Summary

Before implementation, `origin/main` (`76f04338`), `repository-town/COORDINATION.md`, `repository-town/WORK_CHECKPOINT.md`, and all open pull requests (#289, #309, #310, #311) were audited:

- **PR #309 (`feat/kieraths-live-courtyard-geometry-20261104`)** modifies `src/world/narromine.js`, `src/world/narromine-kieraths*.js`, `tests/narromine-layout.mjs`, and `package.json`.
- **PR #310 (`feat/narromine-building-realism-phase1-20261104`)** modifies `src/world/narromine.js`, `src/world/narromine-facade-profiles.js`, `tests/narromine-facades.mjs`, and `package.json`.
- **PR #311 (`feat/narromine-licensed-photos-20261104`)** modifies `data/narromine-building-inventory.json`, `data/narromine-photo-references.json`, `tools/narromine-inventory.mjs`, and `tools/build.mjs`.
- **No agent had claimed the Narromine Railway Station precinct.**

To guarantee zero merge conflicts with PRs #309, #310, and #311, all work on this branch is strictly isolated to:

- `repository-town/src/world/narromine-railway-evidence.js`
- `repository-town/src/world/narromine-railway-precinct.js`
- `repository-town/tests/narromine-railway-precinct.mjs`
- `repository-town/docs/NARROMINE_RAILWAY_RECONSTRUCTION.md`
- `repository-town/COORDINATION.md`
- `repository-town/WORK_CHECKPOINT.md`

---

## 2. Historical, Statutory & Cadastral Provenance

| Attribute | Value | Evidence Tier | Source |
|---|---|---|---|
| **Official Name** | Narromine Railway Station (opened as *Narramine*, renamed Oct 1889) | `surveyed` | NSWrail.net / Wikipedia / Premier Postal |
| **Heritage Listing** | Narromine Local Environmental Plan (LEP) 2011, Schedule 5 Part 1, **Item No. I11** (Local significance) | `surveyed` | NSW Legislation (`Narromine LEP 2011`) |
| **Cadastral Parcel** | **Lot 4, DP 1012153**, Derribong Avenue, Narromine NSW 2821 | `surveyed` | Narromine LEP 2011 Schedule 5 |
| **Railway Line & Chainage** | Main Western Line, **497.554 km** from Sydney Central (junction with Parkes–Narromine line) | `surveyed` | NSWrail.net / ARTC network data |
| **Line Extension** | 20 October 1882 (Dubbo to Nevertire section) | `surveyed` | Historical record (`NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md`) |
| **Station Opening** | 1 May 1883 | `surveyed` | Wikipedia / NSWrail.net |
| **Brick Station Building** | Mid-1940s replacement brick station building with tiled hipped roof and cantilevered platform verandah | `photo-matched` | NLA Trove / heritage documentation |
| **Passenger Rail Closure** | 20 October 1975 | `surveyed` | Wikipedia / NSWrail.net |
| **Present-Day Operation** | Restored exterior; active **NSW TrainLink** regional road coach stop on `Narromine Station Access` / Derribong Avenue; freight corridor managed by ARTC | `photo-matched` | Transport for NSW / Wikipedia |

---

## 3. Geospatial & LiDAR Measurements

All three mapped railway buildings in the station precinct have surveyed OpenStreetMap footprints (`narromine-osm-data.js`, ODbL 1.0) and NSW Spatial Services airborne LiDAR measurements (`narromine-lidar-data.js`, CC BY 4.0):

| Building ID | Inventory ID | OSM Index | Centre (WGS84) | Centre (World `x, z`) | Heading | Plan Dimensions | LiDAR Survey | Ground (AHD) | Eave (5th pct) | Ridge (98th pct) | Median Roof | LiDAR Points (Density) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `narromine-station-building` | `NR-OSM-0030` | `osm:29` | `-32.2340741, 148.2402156` | `[-4705.5, -716.8]` | `119.8°` | **32.16 m** forecourt wall; **15.49 m** central platform pavilion; **5.01–5.06 m** wing depth; **9.10 m** central depth | 2023 | `239.51 m` | **`3.45 m`** | **`5.85 m`** | `4.67 m` | `468` (`2.09 pts/m²`) |
| `narromine-railway-goods-office` | `NR-OSM-0029` | `osm:28` | `-32.2346107, 148.2409523` | `[-4636.2, -657.1]` | `120.8°` | **16.19 m × 13.84 m** | 2023 | `239.14 m` | **`3.10 m`** | **`3.65 m`** | `3.35 m` | `782` (`3.58 pts/m²`) |
| `narromine-level-crossing-hut` | `NR-OSM-0199` | `osm:198` | `-32.2336019, 148.2396567` | `[-4758.1, -769.3]` | `118.3°` | **11.81 m × 5.24 m** | 2011 | `239.40 m` | **`3.28 m`** | **`3.67 m`** | `3.48 m` | `57` (`0.92 pts/m²`) |

### Stepped 8-Vertex Footprint of the Main Station Building (`osm:29` / `NR-OSM-0030`)

The surveyed OSM polygon captures the exact stepped plan of the brick station building between `Narromine Station Access` (north-west forecourt) and the Main Western running track `RAIL[2]` (south-east platform):

1. `[-4721.9, -720.7]` (`-32.2340390, 148.2400410`) → `[-4694.0, -704.7]` (`-32.2341828, 148.2403377`): **32.16 m** straight forecourt wall facing `Narromine Station Access` / Derribong Avenue.
2. `[-4694.0, -704.7]` → `[-4691.5, -709.1]`: **5.06 m** north-east end wall.
3. `[-4691.5, -709.1]` → `[-4698.7, -713.0]`: **8.19 m** north-east wing platform elevation.
4. `[-4698.7, -713.0]` → `[-4696.4, -716.6]`: **4.27 m** step-out towards the platform.
5. `[-4696.4, -716.6]` → `[-4709.9, -724.2]`: **15.49 m** central projecting pavilion elevation along the platform (`9.10 m` total depth from the forecourt wall).
6. `[-4709.9, -724.2]` → `[-4712.0, -720.9]`: **3.91 m** step-back from the central pavilion.
7. `[-4712.0, -720.9]` → `[-4719.5, -725.1]`: **8.60 m** south-west wing platform elevation.
8. `[-4719.5, -725.1]` → `[-4721.9, -720.7]`: **5.01 m** south-west end wall.

---

## 4. Evidence Classification & Architectural Uncertainty

To maintain strict scientific and historical integrity, every feature in `narromine-railway-evidence.js` and `narromine-railway-precinct.js` is classified into one of three evidence tiers:

### A. `surveyed` (Geometrically & Statutorily Measured)
- 8-vertex stepped station footprint (`osm:29`), 4-vertex eastern goods office footprint (`osm:28`), and 4-vertex Dandaloo Street level-crossing hut (`osm:198`).
- 2023/2011 NSW Spatial Services LiDAR ground elevations, eave heights (`3.45 m`, `3.10 m`, `3.28 m`), and ridge heights (`5.85 m`, `3.65 m`, `3.67 m`).
- `Narromine Station Access` service road polyline (`16` vertices, `4.5 m` width) and `RAIL` track centrelines (`RAIL[2]`–`RAIL[7]`).
- Single side platform configuration on the Main Western line and statutory heritage metadata (Lot 4 DP 1012153, Narromine LEP 2011 Item I11).

### B. `photo-matched` (Documented Architecture & Materials)
- Red-brown face-brick station construction with darker brick plinth, cream rendered lintel/stringcourse trim, and terracotta Marseilles-tiled hipped roof.
- Cantilevered platform awning (`28.0 m × 3.1 m`, eave `3.15 m`) sheltering the platform face of the station building.
- Heritage double-sided `NARROMINE` station nameboards on the platform.
- Active NSW TrainLink regional road coach stop shelter and totem sign on the station forecourt.

### C. `estimated` (Explicitly Documented Approximations & Uncertainties)
- **Window and Door Bay Rhythm:** While the building footprint and heights are surveyed, the exact positions and pane divisions of individual sash windows, waiting-room doors, and chimney pots are estimated from standard mid-20th-century NSW Railways brick country station plans.
- **Platform Length & Coping Profile:** The platform is constrained transversely between the surveyed SE face of `osm:29` and the surveyed `RAIL[2]` track centreline (`4.4 m` main width, `0.92 m` height), but its `94.0 m` longitudinal span and `5.5 m` end ramps are estimated until higher-resolution survey plans or licensed ground-level end-to-end platform photographs are catalogued.
- **Eastern Goods Shed (`osm:28`) & Level-Crossing Hut (`osm:198`) Cladding:** Footprints and LiDAR heights (`3.10–3.65 m` and `3.28–3.67 m`) are surveyed, while corrugated steel / weatherboard wall finishes, sliding freight doors, and loading stage dimensions are estimated.
- **Interior Rooms & Active Passenger Rail:** No walk-in station interior or active passenger train service is fabricated (regular passenger trains ceased on 20 October 1975).

---

## 5. Coordinated Live Integration Instructions

When PR #309 and PR #310 have merged and `src/world/narromine.js` is free of concurrent agent claims, integrate `buildNarromineRailwayPrecinct` in two small steps so that **no duplicate station buildings are created**:

1. **Suppress Generic OSM Extrusions for `osm:28`, `osm:29`, and `osm:198`:**
   In `src/world/narromine-layout.js` (or at the `BUILDINGS` loop in `src/world/narromine.js`), exclude the OSM building indices listed in `NARROMINE_RAILWAY_INTEGRATION_SPEC.suppressedOsmBuildingIndices` (`[28, 29, 198]`):
   ```js
   import { NARROMINE_RAILWAY_INTEGRATION_SPEC } from './narromine-railway-evidence.js';
   // Skip generic OSM box extrusions for buildings modelled in detail by narromine-railway-precinct.js
   ```
2. **Mount `buildNarromineRailwayPrecinct` in `src/world/narromine.js`:**
   Import `buildNarromineRailwayPrecinct` from `./narromine-railway-precinct.js` and call it alongside `buildKieraths`:
   ```js
   buildNarromineRailwayPrecinct({ box, push, strip, flatPoly, plane, boardTexture, colliders, spots });
   ```
3. **Add `node tests/narromine-railway-precinct.mjs` to `test:town` in `package.json`.**

### Live Integration Status (4 November 2026)
- **Status:** Integrated into `src/world/narromine.js` and `src/world/narromine-layout.js` on `feat/narromine-railway-live-integration-20261104`.
- **Duplicate Suppression:** Generic OSM extrusions and AABB colliders for `osm:28`, `osm:29`, and `osm:198` are suppressed via `NARROMINE_RAILWAY_INTEGRATION_SPEC.suppressedOsmBuildingIndices`.
- **Browser & Unit Verification:** Verified with `node tests/narromine-railway-precinct.mjs` and `node tests/narromine-railway-browser.mjs` (desktop `1280×800` and mobile `393×852` physical walks along `Narromine Station Access` and `Platform 1`, zero console/page errors).
