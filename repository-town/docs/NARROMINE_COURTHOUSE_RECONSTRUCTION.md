# Narromine Courthouse, Police & Civic Precinct Reconstruction (`Section 17, DP 758759`)

## 1. Executive Summary & Building Identification Disambiguation

Before modelling the Narromine Courthouse precinct, a critical geographic and address discrepancy in earlier planning notes had to be resolved:
- Earlier reports referred to **Narromine Courthouse** at **47 Merilba Street**, whereas `COORDINATION.md` listed a **"Court House Museum (37 Burraway St)"**.
- Using the **Narromine Local Environmental Plan (LEP) 2011 Schedule 5**, **NSW Spatial Services Cadastral Parcels (`Section 17, DP 758759`)**, **NSW G-NAF Geocoded Address Points**, **NSW Spatial Services Six Maps Aerial Orthophotography (`~12 cm/px`)**, and **2011 NSW Spatial Services Airborne LiDAR**, we established the exact identity, cadastral lot, and coordinates of every building on the Burraway–Merilba block:

| Street Address | Cadastral Parcel | Statutory Heritage Listing | True Building Identity & Function | World Centre `[x, z]` | Prior OSM / Game State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **35 Burraway Street** | `Lot 6, Section 17, DP 758759` | **Narromine LEP 2011 Item `I5` — *"Courthouse (former)"*** (Local significance) | **1898 Former Narromine Courthouse & Rear Lock-up:** Original single-storey timber/weatherboard courthouse designed under NSW Government Architect Walter Liberty Vernon (`c. 1898`), with a corrugated galvanised hipped roof (`14.95 m × 7.35 m`), front Burraway Street skillion verandah (`2.55 m` deep), and detached historic square hipped-roof rear lock-up (`7.22 m × 5.25 m`). Historically operated as a local museum after court sittings moved to Merilba Street, and subsequently leased by Narromine Shire Council to the Narromine Car Club as clubrooms. | `[-4585.8, -777.8]` (G-NAF `[-4579.03, -774.51]`) | **Missing** from `OSM.buildings` (previously empty lot) |
| **37 Burraway Street** | `Lot 2 & Lot 12, Section 17, DP 758759` | None | **Hub n Spoke (`HubnSpoke`):** Narromine Shire Council's community co-working and business incubator building — a distinctive **circular radial-roofed building (`16.8 m` core diameter) built around a central open circular atrium oculus (`4.7 m` diameter)** with curved fan-shaped outer wings (`26.4 m` span). *(Previously conflated with 35 Burraway Street in `COORDINATION.md` because 35 Burraway Street was unmapped in OSM.)* | `[-4559.8, -769.7]` (G-NAF `[-4552.16, -786.46]`, OSM POI `[-4561.0, -767.3]`) | **Missing** from `OSM.buildings` (only an unrendered OSM point POI existed) |
| **47 Merilba Street** | `Lot 10, Section 17, DP 758759` | None | **Narromine Courthouse (Operational NSW Local Court):** Modern single-storey T-shaped institutional buff-brick courthouse (`26.0 m × 11.45 m` main spine + `9.25 m × 9.15 m` eastern courtroom wing) fronting Merilba Street, featuring a covered western colonnade entry portico, raised central courtroom clerestory monitor (`5.75 m` height), and north-east registry/security annex (`6.4 m × 7.5 m`). | `[-4590.5, -833.5]` (G-NAF `[-4587.11, -832.30]`, OSM POI `[-4604.1, -829.1]`) | **Missing** from `OSM.buildings` (only an OSM point POI existed) |
| **49 Merilba Street** *(corner Burraway & Merilba Sts)* | `Lot 5, Section 17, DP 758759` | None | **Narromine Police Station & Lock-up Residence (`osm:174` / `NR-OSM-0175`):** L-shaped heritage police station and residence wrapping around the west and north of `Lot 6` (`35 Burraway Street`), with **surveyed 2011 NSW Spatial Services LiDAR heights** (`239.40 m AHD` ground, `3.16 m` eave, `6.39 m` ridge, `4.08 m` median roof, `275` points) plus a northern police vehicle garage (`[-4597.6, -815.4]`). | `[-4598.7, -791.5]` (G-NAF `[-4585.93, -799.60]`, OSM POI `[-4608.9, -789.5]`) | Rendered only as a flat generic beige box (`osm:174`) |
| **23–29 Burraway Street** *(adjacent context)* | `Lot 16, DP 186682` | **Narromine LEP 2011 Item `I4` — *"Courthouse Hotel"*** | **The Court House Hotel (`osm:172` / `NR-OSM-0173`):** Two-storey 1889 hotel on the opposite (western) corner of Burraway & Merilba Streets. | `[-4638.5, -790.0]` | Already modelled in the main streetscape (untouched by this module) |

---

## 2. Authoritative Evidence & Provenance Classification

Every geometric and architectural parameter in `src/world/narromine-courthouse-evidence.js` and `src/world/narromine-courthouse-precinct.js` is classified into one of three provenance tiers:

### 2.1 `surveyed` (Authoritative Government Cadastre, G-NAF, LiDAR & OSM)
- **NSW Spatial Services Land Parcel & Property Theme (`Section 17, DP 758759`):**
  - Surveyed polygon rings in WGS84 and Repository Town world coordinates for:
    - `Lot 6, Section 17, DP 758759` (`35 Burraway Street` — Former Courthouse, LEP Item `I5`)
    - `Lot 5, Section 17, DP 758759` (`49 Merilba Street` — Narromine Police Station, L-shaped lot wrapping around Lot 6)
    - `Lot 10, Section 17, DP 758759` (`47 Merilba Street` — Operational Narromine Local Court)
    - `Lot 2, Section 17, DP 758759` (`37 Burraway Street` — Hub n Spoke)
- **NSW Spatial Services G-NAF Geocoded Addressing Theme:**
  - Surveyed address points for `35 Burraway Street` (`148.241560, -32.233555`), `37 Burraway Street` (`148.241846, -32.233448`), `47 Merilba Street` (`148.241474, -32.233035`), and `49 Merilba Street` (`148.241487, -32.233329`).
- **NSW Spatial Services 2011 Airborne LiDAR (`osm:174` / `NR-OSM-0175`):**
  - Ground elevation `239.40 m AHD`, eave proxy `3.16 m`, ridge proxy `6.39 m`, median roof height `4.08 m` across `275` LiDAR returns (`0.59 pts/m²`).
- **OpenStreetMap (`osm:174`):**
  - 6-vertex L-shaped footprint for Narromine Police Station (`[-4603.4, -807.6]` to `[-4581.4, -794.5]`).

### 2.2 `photo-matched` (NSW Spatial Services Georeferenced Aerial Orthophotography)
- Georeferenced from the official **NSW Spatial Services Six Maps Orthophoto** (`bbox 148.2410,-32.23405,148.2423,-32.23275`, `~0.12 m/px` resolution) against the surveyed cadastral lot boundaries:
  - **35 Burraway Street (`Lot 6`):** Rectangular hipped-roof courthouse footprint (`14.95 m × 7.35 m`, oriented at `120.5°` parallel to the Lot 6 side boundaries), front Burraway Street verandah (`2.55 m` deep), and detached rear hipped-roof lock-up outbuilding (`7.22 m × 5.25 m`).
  - **47 Merilba Street (`Lot 10`):** T-shaped Local Court footprint (`26.0 m × 11.45 m` north–south spine + `9.25 m × 9.15 m` eastern courtroom wing), western Merilba Street covered portico (`16.6 m × 3.3 m`), raised central courtroom clerestory monitor (`9.4 m × 5.7 m`), and north-east annex (`6.4 m × 7.5 m`).
  - **37 Burraway Street (`Lot 2`):** Circular radial roof (`16.8 m` core diameter), central open circular courtyard oculus (`4.7 m` inner diameter), and two curved fan-shaped outer wing roofs (`26.4 m` outer diameter) on the west and south sectors.

### 2.3 `estimated` (Street-Level Elevation Details & Unsurveyed Heights)
- Because `35 Burraway Street`, `47 Merilba Street`, and `37 Burraway Street` were absent from `OSM.buildings`, the 2011 per-OSM-polygon LiDAR table did not include separate height tuples for those three structures. Their eave and ridge heights (`3.35 m / 5.45 m` for the 1898 Former Courthouse; `3.65 m / 4.55 m` plus `5.75 m` clerestory monitor for the Local Court; `3.40 m / 4.85 m` for Hub n Spoke) are **estimated** using the surveyed `3.16 m` eave / `6.39 m` ridge LiDAR envelope of the immediately adjoining Police Station (`osm:174`) and shadow lengths in the NSW Spatial Services orthophoto.
- Window mullions, sill heights, door panelling, and brick plinth heights are **estimated** from standard late-Victorian NSW Government Architect country courthouse construction (`35 Burraway Street`) and late-20th-century NSW Department of Public Works regional courthouse design (`47 Merilba Street`). No walkable interiors are invented.

---

## 3. Standalone Module Architecture & Performance

- **`src/world/narromine-courthouse-evidence.js`:**
  - Exports `NARROMINE_COURTHOUSE_DISAMBIGUATION`, `NARROMINE_COURTHOUSE_CADASTRAL_LOTS`, `NARROMINE_COURTHOUSE_BUILDINGS`, `NARROMINE_COURTHOUSE_ACCESS`, `NARROMINE_COURTHOUSE_INTEGRATION_SPEC`, `NARROMINE_COURTHOUSE_PRECINCT_GEOJSON`, `worldToGeo`, and `geoToWorld`.
- **`src/world/narromine-courthouse-precinct.js`:**
  - Exports `buildNarromineCourthousePrecinct(ctx = {})`.
  - Uses an inline `mergeGeometries` helper (compatible with browser native `<script type="importmap">` without external addon specifiers).
  - Batches all precinct geometry by material into **16 meshes** in standalone mode (`~2,200` vertices total), or pushes directly into `narromine.js`'s shared material buckets when called with `{ push, box, flatPoly, plane, boardTexture, colliders, spots }`.
  - Generates **19 sliced axis-aligned bounding-box (AABB) colliders** that closely follow the 30° rotated Burraway Street buildings and 8.6° Merilba Street buildings while keeping `Burraway Street`, `Merilba Street`, and all pedestrian forecourts 100% unobstructed.

---

## 4. Coordinated Live-World Integration Specification

To avoid conflicts with other active agents modifying `src/world/narromine.js` and `src/world/narromine-layout.js`, this PR keeps all changes isolated in new files. When `src/world/narromine.js` is free for integration:

1. **Import `buildNarromineCourthousePrecinct` and `NARROMINE_COURTHOUSE_INTEGRATION_SPEC` in `src/world/narromine.js`:**
   ```js
   import { buildNarromineCourthousePrecinct } from './narromine-courthouse-precinct.js';
   import { NARROMINE_COURTHOUSE_INTEGRATION_SPEC } from './narromine-courthouse-evidence.js';
   ```
2. **Add `174` (`osm:174` / `NR-OSM-0175`) to the suppressed generic OSM building set in `src/world/narromine.js`:**
   ```js
   const SUPPRESSED_GENERIC_OSM_INDICES = new Set([
     ...NARROMINE_RAILWAY_INTEGRATION_SPEC.suppressedOsmBuildingIndices,
     ...NARROMINE_COURTHOUSE_INTEGRATION_SPEC.suppressedOsmBuildingIndices,
   ]);
   ```
3. **Invoke `buildNarromineCourthousePrecinct` inside `buildNarromine()`:**
   ```js
   buildNarromineCourthousePrecinct({
     push,
     box,
     flatPoly,
     plane,
     boardTexture,
     colliders,
     spots,
   });
   ```
4. **Update `PLACES` / `FACTS` in `src/world/narromine-layout.js`:**
   - Keep `'Narromine Courthouse'` at `47 Merilba Street` (`[-4604.1, -829.1]`) and `'Narromine Police'` at `49 Merilba Street` (`[-4608.9, -789.5]`).
   - Add `'Former Narromine Courthouse (1898)'` at `35 Burraway Street` (`[-4590.5, -766.5]`).
   - Update `'HubnSpoke'` (`[-4561.0, -767.3]`) fact description to reference `37 Burraway Street` (`Lot 2, Section 17, DP 758759`).
