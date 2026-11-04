# Narromine NSW Spatial Services GIS — recovered evidence, NOT yet rendered
**Status: DATA PRESERVED / RENDER INTEGRATION NOT VERIFIED** · 4 November 2026

This work salvages source-grounded geographic data from the conflicted [PR #289](https://github.com/joshualparris/JoshMemory/pull/289) without importing its old edits to `narromine-layout.js`, `narromine.js`, driving or collision systems. That old PR failed integration and an unrelated browser gate, so it is **not safe to squash-merge wholesale** over today's Narromine game.

## Recovered sources and source precision
| Recovered file | Evidence | What it DOES NOT establish |
| --- | --- | --- |
| `src/world/narromine-geodata.js` | 432 NSW Spatial Services RoadCentreline objects, 1,741 constituent centreline segments, extracted 3 November 2026, GDA2020 EPSG:7844 | Road widths, kerbs, lanes, centre island dimensions, street trees, junction markings, asphalt materials or pathfinding/collision |
| `src/world/narromine-public-geocodes.js` | 16 publicly named business/service property-address points, 5 explicitly unresolved names | 2026 current occupancies, precise door position, operating hours, private resident identities, floor plans |
| `src/world/narromine-public-lots.js` | 16 government cadastral parcel polygons, keyed by the same public venue identifiers | Building footprints, partition walls, entrance positions, site boundaries verified on the ground |
| `data/narromine-authenticity-reference-2026-11-03.json` | Historic dated Council road-name register, public business-directory and heritage research carried forward unmodified for provenance | Proof that all directory listings and heritage records are current in November 2026 |

The road dataset was generated from the NSW Spatial Services [GDA2020 RoadCentreline layer](https://beta.portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme_A/MapServer/1), and public addresses/lots from Spatial Services addressing/cadastral layers on 3 November 2026. NSW Spatial Services' [Web Services](https://www.spatial.nsw.gov.au/products_and_services/web_services) and [Copyright](https://www.spatial.nsw.gov.au/copyright) pages describe Creative Commons attribution reuse. Credit **© State of New South Wales (Spatial Services), CC BY 4.0**, link the source, record retrieval dates and state that geometry was converted/simplified for gameplay. The licence must be verified for every additional third-party source before adding its imagery or data.

Retain OSM attribution (© OpenStreetMap contributors; ODbL) and keep it separate from government material. Aerial photographs and Google Street View pixels have **not** been copied into these recovered data files.

## Relationship to current Repository Town
**No change to the playable town in this salvage step.** Existing `narromine-layout.js`/OSM spatial transform, the merged Kierath's courtyard (#309), the actual Railway/Courthouse scenes, and Dandaloo physical streetscape (#336) continue operating unchanged.

The recovered `narromine-geodata.js` local coordinate origin is historical source working space, **not a license to substitute its x/z values directly into game geometry**. Before rendering, translate GDA2020 coordinates through the CURRENT authoritative `geoToWorld` (or a tested common transform), validate anchors and distances against NSW aerial control points, then compare the result to current OSM buildings, the roundabout/median alignment and pedestrian routes. Do not accidentally draw a second road on top of an existing one: that would cause flicker/z-fighting. For public sites, a property point is not a storefront or a doorway. Keep unlocated addresses explicitly unresolved.

## Implementation follow-up — scoped, testable, evidence-first
1. Compare each source road centreline against today's `STREETS` and rendered meshes; produce per-segment changed/added/replaced table and offset/error statistics (not just counts).
2. Agree a road/kerb/surface contract with the owner of #336. Do NOT repaint double geometry or change the claimed Dandaloo median without integration review.
3. Migrate ONE street block at a time, beginning with observed Dandaloo intersections; preserve highway transition, collision, entrances, pedestrian links and navigation.
4. Use cadastral parcels, LiDAR and dated photographs to align physical building volumes; only then add verified shopfront/signage/materials, preserving explicit uncertainty.
5. Run geometry, privacy, release, desktop + mobile WebGL walk/drive tests, matched before/after screenshots, shadows and speed checks; confirm the actual deployed commit.

## Data acceptance and gaps
Run `node tests/narromine-nsw-evidence.mjs`. This validates basic schema, IDs, coordinate roundtrips, source data quantities and public-site relationships; it is **not proof of current road survey accuracy, geographic alignment, visual photorealism or live deployment**. The original #289 runtime scene integration is intentionally NOT salvaged. If a newer official source or survey conflicts, retain provenance, update source snapshots and record the discrepancy before altering the game.
