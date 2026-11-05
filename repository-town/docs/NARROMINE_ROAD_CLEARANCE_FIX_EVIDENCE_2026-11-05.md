# Narromine road-driving envelope: change and evidence, 5 November 2026

Task [#398](https://github.com/joshualparris/JoshMemory/issues/398) · [PR #403](https://github.com/joshualparris/JoshMemory/pull/403) · [street-by-street programme](NARROMINE_STREET_BY_STREET_REALISM_BACKLOG_2026-11-05.md)

## Browser-measured result on one pinned source revision

| Desktop Chromium / Pixel 7 emulation | Before (PR head `1bbda906`) | After (PR head `d5d13d41`) |
| --- | ---: | ---: |
| Repository Town core/planned road contacts | 0 / 0 | 0 / 0 |
| Narromine mapped-lane static contacts | 239 | **52** |
| Microsoft ML footprint-origin contacts | 187 | **0** |
| OSM building-origin contacts | 24 | 24 |
| Unclassified other static-origin contacts | 28 | 28 |

- Before: [GitHub desktop+Android audit 41945501957](https://github.com/joshualparris/JoshMemory/actions/runs/41945501957).
- After: [GitHub desktop+Android audit 41946311497](https://github.com/joshualparris/JoshMemory/actions/runs/41946311497).
- Both runs passed actual software-WebGL Chromium with screenshots and source-grouped road-hit JSON artifacts. **187 fewer sample collisions** is not necessarily 187 deleted buildings; one building can account for multiple sample hits.
- The browser samples each modelled street at lateral offsets 0 and ±1.6 m and uses a 1.12 m circular vehicle probe. **This is not a certified 2026 street survey** or proof all roads are driveable end-to-end. The surviving 52 represent separately traceable source conflicts, not warnings waived.

## Root cause and conservative model policy

The imported Microsoft footprint rectangles are rendered as rotated Three.js boxes and already had a true `rect.poly` in `narromine-layout.js`. Their original **road-source conflict filter**, however, only checked roughly 1.1 m around road centreline point samples and let many estimated structures occupy the *rendered* playable lane. The corrected filter uses a narrow 3.1 m envelope (±1.6 lane probe + 1.12 body radius + sampling allowance). It withholds a conflicting **unverified Microsoft building stand-in** rather than leaving a visible but impassable structure in the road.

`FOOTPRINT_ROAD_CONFLICTS` retains the coordinates, extent, yaw and reason of each source-conflict omission for site-by-site review. The actual number of omitted source records is emitted by the deterministic Node test and **must not be inferred from the 187 contacts**.

Existing OSM buildings and custom landmark solids, railway barriers, lanes, Dandaloo median/paint, property access, landscaping and the physically traced street centrelines are unchanged. In particular, the fix **does not claim a real structure is absent**, does not move it into a fabricated location, and never disables global collision.

## Dandaloo field-evidence constraints for next slice

1. [2019 Narromine Council streetscape designs](https://www.narromine.nsw.gov.au/__media_downloads/03%20-%20Reports%20of%20Committees%20-%20July%202019.pdf?downloadable=1) show proposed medians, parking, streetlighting, kerbs and footpath treatments, **not guaranteed as-built positions**.
2. [August 2024 Council pedestrian access and mobility plan](https://www.narromine.nsw.gov.au/Pedestrian%20Access%20and%20Mobility%20Plan%20%28PAMP%29_Redacted.pdf?downloadable=1) recorded issue 21 (uneven Dandaloo Street footpath / kerb ramps) and issue 22 (missing Nymagee Street west-side crossing) **at its 2024 survey date**, not confirmed in 2026.
3. [Council notice, 9 April 2025](https://www.narromine.nsw.gov.au/__media_downloads/council_column/2025.04.09%20Council%20Column.pdf?downloadable=1) announced works from 8 April 2025 to improve approaches to the Dandaloo rail crossing; it is **not a 2026 completion certificate**.
4. [Historic 2017 Wikimedia CC BY 3.0 streetscape photo](https://commons.wikimedia.org/wiki/File:Narromine_Dandaloo_Street_002.JPG) shows period appearance. Current paint, footpath, curb, median plants and signs need dated field comparisons; don't reuse unlicensed imagery as game textures.

## Outstanding acceptance (do not close #398 or DANDALOO-001 yet)

- [x] Evidence-based minimum-lane source filter implemented, audit coordinates retained.
- [x] Before/after **real desktop/Pixel 7-emulation WebGL** road counts and screenshot artifacts preserved; mapped contacts 239→52 on both.
- [ ] Verify deterministic Node regression `node tests/narromine-footprint-lane-clearance.mjs` and `node tests/narromine-collision-footprints.mjs` through full safety-gated CI; count actual withheld source records.
- [ ] Inspect 52 residual collision samples by unique place and provenance: 24 OSM-building contacts and 28 other. Verify road classification, legitimate walls/fences/rail equipment and exact locations against public spatial sources or on-site photography *before* changing geometry.
- [ ] Reconcile the entire Dandaloo corridor's curved white markings, paved red footpaths, gravel verges, kerb ramps, road widths and junctions. #400/#401 are already merged; preserve them.
- [ ] Coordinate, do not duplicate [#388's independently owned 10-area physical-walking audit](https://github.com/joshualparris/JoshMemory/pull/388); verify actual walk, collision and screenshot evidence.
- [ ] Run full release/privacy/integration + browser/mobile CI, review current-main differences, merge on green and verify production/backup source SHA separately. Vercel production may be rate-limited.
