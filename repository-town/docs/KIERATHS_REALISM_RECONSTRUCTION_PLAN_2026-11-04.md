# Kierath's Shopping Square — evidence-first 3D reconstruction
Date: 4 November 2026 (Australia/Sydney)
Owner: JoshMemory / Repository Town
Status: PHASE 1 IN PROGRESS; NOT SURVEY-ACCURATE

## Goal and constraints
Recreate **the actual walkable Three.js scene**, not a generated illustration. Preserve world georeferencing, player access from Dandaloo Street and rear car park, neighbouring Coles and Post Office, and existing saves. No invented exact dimensions or current tenants.

## Six phases
1. **Registered site plan:** align the supplied commercial tenancy diagram with the existing NSW cadastral lot outlines and aerial roof/footprint tracing. Distinguish site boundary from tenancy boundary; establish verified relative adjacency and tagged approximate coordinates for ten units, entrance(s), circulation, kiosk and rear parking. Produce machine-readable evidence and repeatable GIS checks. Do not treat the unscaled plan as a survey.
2. **Elevation and roof survey:** evaluate 2023 Macquarie Floodplain South LiDAR ground/roof points, projected in GDA2020 MGA Zone 55, check CRS transforms and point classifications; use documented accuracy, mark missing observations. The existing `narromine-lidar-data.js` applies to other buildings, NOT automatically the arcade's individual tenancies.
3. **Architectural geometry:** replace duplicated generic massing with independently modelled red brick walls, entry recesses, window proportions, pitched roofing, posts, fascia, awnings and genuinely open paths. Model rear arched canopy and street kiosk independently, with collision/door clearances.
4. **Materials/detail:** procedural/tiled brick and paving, mortar, glazing, weathered corrugated sheet metal, cladding, signs and shop-specific openings. Distinguish historic evidence from modern occupancy. No commercial photos copied into repository as textures without rights.
5. **Physical daylight:** use georeferenced coordinates and Australia/Sydney local time, proper solar azimuth/altitude and scene orientation, cast shadows from building/awning/roof/post geometry, ensure efficient mobile rendering.
6. **Measured verification/deployment:** matching-camera reference captures for street frontage, courtyard, rear canopy and enclosed interior; tests for topology, intersections and player movement desktop/mobile; privacy/production checks; PR merge to main and deployment verification.

## Baseline: code inspected on main, 4 Nov
- `src/world/narromine-kieraths-data.js`: local x east / z south anchored near 82 Dandaloo at latitude -32.2325, longitude 148.2392; approximately ten tenancies, centreline, round kiosk and rear arch.
- `src/world/narromine-kieraths.js`: repeated extruded quads and constant colours create the corridor-like appearance. Rendered *in the live game*, not a detached asset.
- `src/world/narromine-buildings-data.js`: traced polygons `dandaloo-76`, `dandaloo-82`, and `narromine-post-office`, including cadastral boundaries and aerial massing; distinct 82 Dandaloo/Coles and Post Office volumes.
- `tests/narromine-layout.mjs` already checks the lot containment and walkable centreline but does **not** prove the plan's registration or real shop dimensions.
- The separate `docs/NARROMINE_KIERATHS_SHOPPING_SQUARE_2026-11-03.md` records previous evidence and caveats.

## Phase 1 — authoritative facts vs unverified coordinates
**Documented spatial relationships (high confidence):**
- Dandaloo Street is the street frontage. Nymagee Street is beyond the Post Office.
- Coles' M01 tenancy is labelled 2,157 m² in the supplied commercial diagram. This is a *tenancy area*, NOT the full 82 Dandaloo cadastral lot.
- The arcade occupies the 76 Dandaloo Street side beside Coles, with ten numbered units, an offset/L-shaped pedestrian space, a round kiosk near Dandaloo, and a through-route to rear parking.
- The Post Office is separate, on its own cadastral lot; preserve its entrance and the arcade's distinct frontage.
- The **rear** entrance has the arched steel shelter and historical Liquorland shutter; the **street-facing** entrance as shown in May 2023 Street View is lower, angular corrugated awning, adjacent to brick boutique/Coles signage. Do not interchange these two entrance structures.

**Location evidence already in versioned files (NSW aerial/cadastre, 0.126 m/pixel tracing):**
- 76 Dandaloo property: polygon `dandaloo-76.boundary` (NSW cadastre).
- 82 Dandaloo/Coles: polygon `dandaloo-82.boundary`, with north/south supermarket halls and Dandaloo frontage.
- 74 Dandaloo Post Office: `narromine-post-office.boundary`, with separately traced building parts.
- The historical 76 Dandaloo aerial massing is retained in `originalAerialMassing`; those three polygons are **not valid verified tenancy outlines** and must not fill the open courtyard.
- Historic Google Street View supplied by Josh: June 2022, May 2023; several older photographs have uncertain dates. Use as visual evidence only. The plan's unit numbers have no supported exact door points.

**Not yet established (must not claim survey accuracy):**
- Control-point / affine homography registration of the commercial *diagram* to actual orthophoto coordinates. The diagram has no scale/known pixel coordinates in source-controlled form.
- Individual shop wall polygons, doorway positions, kiosk dimensions, rear arch spans and exact courtyard bend.
- Roofline/heights for each tenanted arcade structure and small variations in floor elevation.
- Modern tenant/sign occupancy.

## Concrete Phase 1 implementation contract
1. Preserve native geographic coordinates as WGS84 latitude/longitude; expose named boundary/control anchors with provenance. Do not roundtrip through screenshots.
2. Use the existing `geoToWorld` projection consistently: local x east, z south. Encode topology separately from metric coordinates and explicit uncertainty for every estimated entity.
3. Create repeatable assertions covering the named three cadastre parcels, their separation, ten tenancy identifiers, pedestrian route clearance and street-to-rear direction. All new claims must have tested coordinates and evidence.
4. Only replace guessed shop polygons after two or more independent shared control points can register the plan to the aerial, with a documented reprojection/residual check. Otherwise retain 'estimated' tags, publish the audit, and do not force false precision.
5. Deliver a before/after geospatial overlay and a screenshot from the **running game**, then visual comparison against the supplied photographs; follow with architectural phase when layouts are grounded.

## Phase 1 quality gate
- No duplicate Coles/shop or Post Office geometry; no courtyard-blocking wall; correct relationship of both entrances and the street.
- Each landmark identifies source class: cadastral boundary, aerial trace, supplied schematic, supplied photo, or estimate.
- Tests run locally and in CI before claims of completion. Passing prior navigation tests is **not** proof of geometric accuracy.

## Phase 1 supplementary evidence, 4 Nov 2026

The **user-supplied 619 x 459 tenancy diagram** was inspected more closely. Its page orientation differs from map coordinates: diagram bottom = Dandaloo (geographic east side), top = rear parking (west), right = Post Office/Nymagee (geographic north). An explicit pixel-to-WGS84 bilinear fit is now encoded in `src/world/narromine-kieraths-schematic.js`, anchored approximately to four vertices of the pre-existing `dandaloo-76.boundary`.

**Crucial distinction:** eight units (1–5 and 8–10) have visible individual grey/pink outlines in the screenshot, while **6–7 appears marked in the large blue Coles/major-tenancy polygon**, not as two separate retail shopfronts. The diagram does NOT support modelling ten physically separate buildings. The current live `KIERATHS_SHOPS` still does so and MUST be revised in Phase 1/3 only after confirming footprint/door orientations.

The new GIS overlay publishes `schematic-unit-1` through `schematic-unit-10` with `6–7` combined, separate from the old live geometry. Digitised vertex locations are approximate from the screenshot, with pixel accuracy on the order of several screenshot pixels, not a cadastral survey. Registration is **provisional**: its ties associate schematic boundaries with lot corners, not independently surveyed same-point image controls; RMS residual is not measurable from present evidence. Do not promote these polygons to `traced-boundary` or label them precise.

Public imagery verification source: NSW Spatial Services NSW Imagery Basemap, map service https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Imagery_Theme/MapServer ; imagery epoch varies by location/zoom. Underlying cadastral polygons are from the existing repo aerial/cadastre tracing. No separate imagery tiles are redistributed here.

**Current implementation gate:** GeoJSON exporter and tests verify deterministic coordinates, WGS84 axis order and evidence labels. This is a data registration / topology correction; the 3D geometry, player collisions and user-facing scene have NOT been updated, and they must not be reported as fixed until screenshot-matched acceptance succeeds.
