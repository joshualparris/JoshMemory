# DANDALOO-001.3 — sealed surfaces, verges, kerbs and ramps evidence review (6 November 2026)

**Owner:** DeepSeek (ProBook). **Baseline `main`:** `c540f7d7`. **Status:** evidence review complete; this is a **defect register**, not a rebuild.

## Scope and exclusions

Remaining DANDALOO-001.3 scope only: sealed carriageway surfaces, the hotel forecourt apron, red shop-side paving, gravel verges, kerb/gutter widths, accessible ramps and roadside shoulders along the Dandaloo corridor. **Not rebuilt:** the merged curved kerb returns (#400) and hotel forecourt sealed surface (#401), nor any other agent's road/collision/traffic work. No new aerial tiles were acquired for this pass; evidence is the already-documented dated NSW/OSM/photo record plus source inspection. No deployment, hosted-photo or physical-handset claim is made.

## Method

Source inspection of `src/world/narromine.js` (surface classification, lines 171–211), `src/world/narromine-road-surfaces.js` (disjoint asphalt/footpath/kerb-return geometry) and `src/world/narromine-forecourt-footpaths.js`, cross-checked against documented evidence: OSM export 2026-11-03 (ODbL, `surface` tags, mapped widths), the [Narromine Shire Council 2019 streetscape design](https://www.narromine.nsw.gov.au/__media_downloads/03%20-%20Reports%20of%20Committees%20-%20July%202019.pdf?downloadable=1) (a *proposal*, not as-built), the 2023 40–42 Dandaloo St planning-application photos, the owner's Mapillary/photo comparison (reference only) and the Wikimedia CC BY 3.0 historical Dandaloo photo. Source geometry is verified by the existing `tests/narromine-road-surfaces.mjs` and `tests/narromine-forecourt-footpaths.mjs`.

## Defect register

| ID | Surface | Modelled behaviour (source) | Evidence status | Confidence | Finding / recommended action |
|---|---|---|---|---|---|
| DAND-SURF-001 | Sealed Dandaloo carriageways | Asphalt quads from OSM centrelines; paved/unpaved split by OSM `surface` runs; disjoint, non-coplanar (`narromine.js:171–184, 205`) | OSM ODbL 2026-11-03 mapped widths | High for topology/width, **not** surveyed | Accept as mapped estimate. No change needed; the disjoint-surface test already prevents overlap/flicker. |
| DAND-SURF-002 | Hotel forecourt apron | One sealed surface; generic footpath clipped out (`narromine-forecourt-footpaths.js`, #401) | Merged #401 + owner Mapillary comparison | High (merged, tested) | Verified; do **not** rebuild. |
| DAND-SURF-003 | Curved kerb returns | 9 m-radius fillet at angled junctions, 3 mm under carriageway; edge paint follows 0.6 m in (`narromine-road-surfaces.js:103–149`, #400) | Merged #400 + owner photo at hotel corner | Medium: "usual urban kerb return" size, not measured | Verified as merged; radius is an estimate. Leave as-is unless a dated measured survey supersedes it. |
| DAND-SURF-004 | Red shop-side paving | Red-brick (`0xa4563f`) on the **north side of Derribong Avenue** only; gravel verge on the south (`narromine.js:194–197, 204`) | Owner Mapillary/photo (west from the hotel) | High at that location | Verified photo-match. **No evidence** supports red paving on the Dandaloo shop frontage; its absence is correct, not a defect. |
| DAND-SURF-005 | Gravel / grass verges | Residential and non-central streets get **no generated footpath** (honest default), i.e. a verge by omission (`narromine.js:185–192`) | OSM (few sidewalks mapped) | Medium: default, not per-street survey | **Gap:** no explicit verge geometry or material; a "gravel verge" is not rendered as such. Leave unrendered until per-street aerial/photo evidence exists; do not invent verge materials. |
| DAND-SURF-006 | Unpaved outlying roads | OSM `unpaved` runs become `kind:'track'` with no kerb and no footpath (`narromine.js:171–184`) | OSM ODbL | High: mapped | Verified rule. |
| DAND-SURF-007 | Kerb / gutter widths | No explicit gutter channel or kerb-upstand width; only the kerb-return fillet above | None measured | **Unknown** | **Gap / defect:** the model does not claim kerb or gutter widths. A survey or dated close aerial is required before modelling widths; do not add unverified kerb profiles. |
| DAND-SURF-008 | Accessible / tactile kerb ramps | **Not modelled.** Listed as a future priority in `NARROMINE_DANDALOO_STREETSCAPE_2026-11-04.md` | None object-level | **Absent** | **Gap:** correctly unrendered. Adding ramps requires per-location evidence (council works/survey); do not invent ramp positions at every crossing. |
| DAND-SURF-009 | Roadside shoulders | **Not modelled**; asphalt width is the OSM carriageway width | None measured | **Absent** | **Gap:** leave unrendered pending evidence. |
| DAND-SURF-010 | Pedestrian crossings | OSM footways tagged `crossing` drawn zebra-white (`narromine.js:208–211`) | OSM ODbL | High: mapped crossings only | Verified for mapped crossings; unmarked crossings remain unrendered by design. |

## Summary

Of ten surface classes: **six are verified or correctly evidence-backed** (sealed carriageways, hotel forecourt, kerb returns as an estimate, Derribong red-brick, unpaved tracks, mapped crossings). **Four are honest gaps** — explicit verge material (005), kerb/gutter width (007), tactile ramps (008) and shoulders (009). None of the gaps should be filled by invention; each needs object-level dated evidence. The largest visible remaining gap in the Dandaloo corridor is the absent tactile-ramp/shoulder detail, which the council design proposes but does not prove built at specific coordinates.

## Verification performed

- Source inspection at `main` `c540f7d7` (lines cited above).
- Existing gates still pass: `node tests/narromine-road-surfaces.mjs`, `node tests/narromine-forecourt-footpaths.mjs`, `node tools/build.mjs`, `node tools/check_privacy.mjs`.
- **Not performed:** new aerial-tile acquisition/analysis, physical walking, LOD/geometry changes. This review changes no gameplay source; it records what is evidenced, what is estimated and what remains unrendered.
