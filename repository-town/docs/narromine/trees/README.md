# Narromine tree surveys, species and accurate 3D reconstruction
**Research snapshot:** 5 November 2026 · **Task:** NR-TREE-SURVEY-RESEARCH-001 · **Scope:** Narromine NSW, not all Shire towns.

## Verified research result

**No publicly downloadable, individually georeferenced *and species-labelled* Narromine township tree register was found in the reviewed Council, NSW environment, planning and public GIS sources.** This does not prove Council has no internal register. Internal records remain unverified; this task is limited to already-public research.

We **do** have direct historical/tree-count evidence: a 2022 field assessment of the aerodrome *study area* counted **7 Poplar Box, 3 Kurrajong and 6 dead stags**, and a Council report confirms **35 cemetery Kurrajongs in April 2024** (20 west avenue, 15 east). A 2018 programme replaced the **southern Dandaloo memorial Kurrajongs** with **Manchurian Pear**, while a 2019 Dandaloo *design plan* additionally lists maple, oak and palm **as designs, not verified present trees**. See [full report](RESEARCH_REPORT.md) and [Dandaloo audit](DANDALOO.md).

Existing game asset: **3,096** candidate canopy peaks/trees from 2023 NSW Spatial Services LiDAR. These are **not botanical identifications** or assured individual trunk locations. Height p10 / median / p90 = **4.2 / 7.9 / 15.9 metres**, canopy radius **2.0 / 3.2 / 4.9 metres**. Their 2026 survival and precise stem positions have not been verified.

## Files in this folder

| File | What it supplies | Safety-of-inference boundary |
| --- | --- | --- |
| [RESEARCH_REPORT.md](RESEARCH_REPORT.md) | Source-by-source deep research and definitive open questions | Dates, study areas and evidence type kept separate |
| [DANDALOO.md](DANDALOO.md) | Historical/2019 design vs 2023 observed main-street planting | Plan symbols are **not** automatically as-built |
| [SOURCES.md](SOURCES.md) | Primary source register with URLs, scope and access | Rejects unrelated GIS inventories |
| [species-catalogue.csv](species-catalogue.csv) | Taxon list with actual site evidence, historic/planned/indicative flags | A location record is not an individual match |
| [site-evidence.json](site-evidence.json) | Machine-readable group/site records and counts | Do **not** assign to every LiDAR candidate |
| [lidar-candidates-2023.geojson](lidar-candidates-2023.geojson) | 3,096 coordinate-converted canopy *candidates*, height and radius | Species null; WGS84 precision is not positional accuracy |
| [lidar-candidates-2023.csv](lidar-candidates-2023.csv) | Same 3,096 records with game x/z coordinates | No unverified species assigned |
| [verified-individual-trees.geojson](verified-individual-trees.geojson) | *Only* individually evidenced, species-labelled tree points | Currently empty: **0** verified species + trunk coordinate pairs from public sources |
| [IMPORT_PLAN.md](IMPORT_PLAN.md) | Field/photo verification, join rules and realistic 3D implementation | Read-only recommendation: no live trees replaced |
| [verify.mjs](verify.mjs) | Standalone Node provenance/coordinate and false-identification regression test | Run `node repository-town/docs/narromine/trees/verify.mjs`; CI on PR and main |

## Minimum evidence rule

- **A individual:** identifiable individual tree, reliable taxon **and** georeferenced trunk/point tied by a common source/identifier.
- **B individual:** independently photo corroborated at exact location and botanically defensible, with uncertainty.
- **C:** site-level or partial genus inference; do not call it a verified species.
- **D:** location/shape-only LiDAR canopy, photo tree without identifying characteristics, planted proposal or regional potential.
- A *surveyed site species count* can be strong botanical evidence **without** having individually georeferenced coordinates. Keep the species evidence alongside a site, not on guessed trunks.

## Engineering boundary

**Do not modify** `src/world/narromine.js`, `src/world/narromine-trees-data.js`, the existing 3D tree models, road/landmark scene, or another agent's TREE-REAL-001 files merely because this folder has new species names. This folder is evidence and optional GIS import material, not a confirmed as-built placement map.

Coordinates: EPSG:4326 WGS84 `[longitude,latitude]` in GeoJSON; conversion is the exact inverse of RepoTown's `geoToWorld` equirectangular transform with 2026-11-03 OSM anchor, *not* independently certified GPS. 2023 LiDAR crowns may include canopy maxima, duplicate crowns, missed trees and changes since capture.

**Priority:** Cross-reference the 2023 LiDAR candidates with already-public, dated georeferenced trunk-level photographs, retaining botanical and positional uncertainty. Council contact and correspondence are excluded from this task.

## Exclusion regression

PR #458 included an unwanted correspondence artifact despite passing the GIS tests. The original research-only exclusion now runs before the data checks in `verify.mjs`. `node --test repository-town/docs/narromine/trees/exclusions.test.mjs` replays its filename and status metadata without recreating correspondence. The guard detects those concrete markers, including a renamed artifact; it is not a general semantic verifier.
