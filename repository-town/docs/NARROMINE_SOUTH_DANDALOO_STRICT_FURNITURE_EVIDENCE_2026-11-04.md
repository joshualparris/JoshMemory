# South Dandaloo Street — real-location street furniture evidence rule

**Scope:** Narromine NSW, Dandaloo Street single-carriageway stretch past Narromine Hotel between the Burraway split and Terangion Street. **Feature:** `NR-HOTEL-TREE-SIGHTLINE-001`, PR #364. **Date:** 4 November 2026.

## User acceptance standard

Every rendered tree, streetlamp, utility pole, planter, sculpture or traffic sign must correspond to **a real observed feature at the particular mapped location**. Approximate dimensions, leaf shapes, colour or minor offsets may be used **only when the object itself is evidenced there** and the uncertainty remains clear. A real road centreline alone does not establish the locations of individual objects.

Where evidence is missing, **render nothing** rather than filling the scene using appealing but invented 22-, 44- or 40-m intervals. This means some unrecorded real objects may temporarily be absent; that is preferable to claiming an invented object exists.

## Grounded inputs and limits

- **OpenStreetMap**, exported 3 November 2026, supplies Dandaloo Street centreline and nominal 9-m secondary carriageway width. These do not prove footpath kerb survey tolerances or individual lamp/tree positions.
- **NSW Spatial Services cadastral/aerial imagery** establishes the building envelope and Dandaloo-facing hotel verandah geometry; 2023 **LiDAR** informs roof elevation, **not** a complete ground-truth inventory of street trees or poles.
- User's 4 November 2026 real-versus-game screenshots show uninterrupted sightlines at the hotel corner and multiple oversized trees in the game at those positions. Google Street View is a *human visual reference* here; its images are not copied into the repo, used as textures or redistributed.
- In the hotel-specific detailed builder, **two former street-side candidates** were listed in the hotel notes (`ts = [21.5, 33.8]`). A real WebGL desktop/Android recheck found the nearer `s=21.5` tree blocking hotel windows, with no independently fixed base location. That candidate is now hidden pending proper geolocation. The farther **northern-end `s=33.8` tree** remains as an approximate model for a photo-referenced real tree, alongside **four aerial-located rear trees**.
- The **North divided-carriageway median** currently has a separate planting scheme based on prior local streetscape comparisons. It is deliberately not changed by this southern-hotels sightline fix; individual object geolocation and dates there still require an evidence register before a survey-grade claim.

## Removed, retained, unverified

| Object class | Previously generated | Strict result | Reason |
| --- | ---: | ---: | --- |
| South Dandaloo street trees | 38 | **0 generated** | Every 22-m repeat was a synthetic coordinate, not individually observed |
| South swan-neck lamps | 8 | **0 generated** | Alternating 44-m locations were synthetic |
| South utility poles and overhead wires | 10+ | **0 generated** | 40-m interval and sagging inter-pole cables had no individual survey |
| South road kerb fragments | 164 | **164 retained** | Aligned to mapped street, not a standalone furniture object; road width remains nominal |
| Hotel's site-specific street trees | 2 candidates | **1 retained** | Northern-end photo-referenced tree remains; unverified inner-frontage `s=21.5` omitted |
| Hotel's aerial-traced rear trees | 4 | **4 retained** | Local aerial photo positions |
| Northern divided-road medians | 35 fragments | **35 unchanged** | Outside strict South branch, needs further object-level audit |

## Evidence required before reinstating any item

Capture `featureId`, object type, WGS84 coordinate (latitude, longitude), photo/map/LiDAR URL or owner-licensed image reference, capture date, viewing direction, degree of confidence, source licence or use conditions, and whether the object is currently extant. Convert WGS84 to Repository Town with `geoToWorld` in `narromine-layout.js` — do not hard-code unrelated local metre offsets. For a lamp or pole, verify its base, not merely a wire in the sky. If a sign or tree is occluded, leave its position unverified rather than infer an exact location.

## Regression and browser acceptance

`node tests/narromine-dandaloo-streetscape.mjs` and `node tests/narromine-hotel-tree-sightlines.mjs` enforce no unsupported generated southern props, retained colliders/kerbs/median and hotel-owned trees. `node tests/narromine-hotel-tree-browser.mjs` captures matched hotel-corner, main frontage and northern frontage from real Chromium/WebGL at 1280×800 desktop and 393×852 Android-sized viewport (screenshots under `test-results/narromine-hotel-trees/`). CI must build, pass privacy/integration and create screenshots before merge and deployment can be called verified.

This does **not** claim an exhaustive truth-matched Narromine tree inventory. It prevents one clear source of invented vegetation and utilities until each location is documented.
