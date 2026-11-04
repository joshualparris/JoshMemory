# Narromine Physiotherapy, Dandaloo Street — façade pilot (4 November 2026)

**Scope:** a *single road-facing surface* of mapped OSM building `osm:186` / inventory `NR-OSM-0187`. Related [main-street pilot #332](https://github.com/joshualparris/JoshMemory/issues/332) and [parallel agent rules](PARALLEL_AGENT_COORDINATION.md). This work does **not** claim the whole street, road, kerbs, trees or adjoining business blocks.

## Evidence and coordinate binding

- OpenStreetMap export `src/world/narromine-osm-data.js` dated **3 Nov 2026**, building index 186. Street-facing edge is polygon vertices **1→2**, from world `(-4760.2,-1091.9)` to `(-4761.7,-1080.1)`, length ~11.9 m. The map point `Narrmine Physiotherapy` (name corrected in layout) lies within this footprint near `(-4766.7,-1086.5)`.
- NSW Spatial Services Macquarie Floodplain South **2023** LiDAR `NARROMINE_LIDAR.heights['osm:186']`: ground AHD 239.05 m, low building-class percentile 3.78 m, high building-class percentile **8.07 m**, median roof proxy 6.57 m. The high percentile is an *envelope proxy*, not an architectural survey of the parapet apex. Never claim centimetre-accurate upper parapet.
- Owner's comparison `45Screenshot_20261104_153539.png` in private [55-image Drive collection](https://drive.google.com/drive/folders/1wgPC3JnTWJIPurRXzbW_5T5DLcn1QXJR?usp=sharing). On-screen coordinate `(-32.230824,148.239729)`, game view near `(-4751.3,-1078.2)`, shows a white symmetrical curved/stepped parapet, narrow raised side pilasters, green/blue awning signboard, glazing below and two thin outer awning supports. **Screenshot shows Google Street View imagery; do not commit, publish, rasterise as game texture or redistribute Google's panorama pixels.** Panorama capture month/year is not confirmed; visible tenant/sign is a historical snapshot, not evidence of current operation.

| Attribute | Evidence tier | Implementation / limitation |
| --- | --- | --- |
| Footprint, oriented frontage | mapped-OSM | Existing `BUILDINGS` polygon and collider kept, no extra footprint |
| Vertical roof envelope | LiDAR proxy 2023 | Retains extruded base, white render, ornamental parapet top near 8 m |
| Curved top, squat side towers | Photo-interpreted | Parametric quadratic profile; exact widths/heights estimated |
| Window mullions and door | Photo-interpreted | Cosmetic only; no fabricated walkable interior |
| Blue/green canopy and support posts | Photo-interpreted | Approximate shade/depth, decorative with no colliders |
| Narromine Physiotherapy fascia | Historical panorama + mapped OSM point | Name shown in game; sign/date not independently verified current |
| Neighbour buildings, angled parking, median trees | Outside this claim | Agent #333 and separate building owners |

## No-duplicate renderer integration

The existing mapped OSM extruded footprint stays; only the building-body colour for `osm:186` is changed to white. The `FRONTAGES` generic storefront renderer skips `osm:186` so there is **one** local main-street frontage; the specialist `buildNarrominePhysiotherapyFacade` pushes small geometry into the existing 300 m tile/material buckets. A cosmetic sign is generated on the fly using local canvas, *not a Google texture*. Road geometry, navigation, colliders and unrelated buildings unchanged.

## Acceptance gates

1. `node tests/narromine-mainstreet-physio.mjs`: mapped edge, LiDAR height, expected silhouette, mesh bounding volume, exactly one cosmetic sign, and no new colliders.
2. `npm run build && npm run check:privacy`.
3. `node tests/narromine-mainstreet-physio-browser.mjs`: real Chromium/WebGL desktop 1280×800 + Android-like 393×852, deterministic view near screenshot #45, screenshot artifacts.
4. Inspect captured screenshots for visual regressions before merging. Other agents may modify `src/world/narromine.js`; reconcile their intent when bringing latest `main` forward, especially Dandaloo streetscape PR #333.
5. Verify CI and production deployment commit SHA before reporting full completion.

**Remaining work:** Actual measured shop architectural drawings, current dated shop signage and material scans are unavailable. The photographed parapet is meaningfully more characteristic than the old tan box but **not yet surveyed or photorealistic**. Continue with adjoining parcels only as separate feature claims.
