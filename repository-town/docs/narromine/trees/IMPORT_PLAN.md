# Evidence-first Narromine tree mapping and 3D implementation specification

**Status:** recommendation and schema only. **No changes to playable game** in this research branch. Existing TREE-REAL-001 modelling agent owns appearance/LOD work; coordinate with it rather than altering those files.

## 0. What can and cannot be concluded

**Available immediately:** 3,096 automatically detected 2023 NSW Spatial Services canopy peak candidates (`[x,z,height,crownRadius]`) and their GeoJSON/CSV representation. Positional layout and dimensions are **derived, not independent ground-verified tree trunks**. **No species is yet attached to an individual LiDAR point** by validated same-tree evidence.

**Available at site scope:** 2022 aerodrome 7 Poplar Box/3 Kurrajong, 2024 cemetery count of 35 Kurrajong, 2018 Dandaloo southern pear planting, 2019 Dandaloo *proposed* species palette. **None** gives a current 2026 individual georeferenced species+trunk match.

Do not distribute 7 aerodrome Poplar Box or 35 cemetery Kurrajongs over the nearest random LiDAR peaks; historical site counts are not exact present tree locations.

## 1. Data layers and fields

1. **Raw/working geometry (immutable provenance):** `src/world/narromine-trees-data.js`, the 2023 LiDAR generated source. Survey year 2023, source class 5 vegetation and class 2 ground, footprint filters and canopy radius derivation; exact raw flight acquisition time not independently checked.
2. **GIS viewing export:** [`lidar-candidates-2023.geojson`](lidar-candidates-2023.geojson) and [CSV](lidar-candidates-2023.csv). Each `NAR-L23-00001` is a stable identifier **only for the current ordered array**; regeneration could reorder points. Keep game `x/z` in CSV; GeoJSON `coordinates=[lon,lat]` EPSG:4326. Properties `scientific_name:null`, `evidence_level:D`.
3. **Survey groups and chronology:** [`site-evidence.json`](site-evidence.json). Counts, sites, survey time and record kind; never auto-migrate to individual trees.
4. **Individually verified observations:** [`verified-individual-trees.geojson`](verified-individual-trees.geojson). Currently **0** features; adding a feature requires a source and true species/trunk tie, not just nearest spatial candidate.
5. **Join table (proposed, not yet populated):** `candidate_id,observation_id,reviewer,reviewed_at,species_taxon_id,position_uncertainty_m,match_distance_m,match_method,source_image_ids,photo_dates,survey_date,existence_status,evidence_level`.

### Stable identity policy

LiDAR array indexes may change if the upstream algorithm reruns. For long-term tree identity use **original tile + nearest-point spatial grouping + raw year + persistent Council asset ID where available**. Never use array index alone across generated versions; version the source export and provide a crosswalk.

### Coordinate transform (exactly mirrors current game)

Existing `narromine-layout.js` uses `OSM.anchor={lat:-32.2404574,lon:148.2597315}`, `EARTH=6371008.8`, `HIGHWAY.x0=-2870`, `HIGHWAY_Z=-7`, `cos(anchorLat)`, game **x east, z south**.

For known `x,z` in the existing game:
```js
const RAD = Math.PI / 180, EARTH = 6371008.8;
const anchor = { lat: -32.2404574, lon: 148.2597315 };
const lat = anchor.lat - (z - (-7)) / (RAD * EARTH);
const lon = anchor.lon + (x - (-2870)) / (RAD * EARTH * Math.cos(anchor.lat * RAD));
// GeoJSON coordinates: [longitude, latitude], never [latitude,longitude].
```
This export reverses the game's *approximate* local equirectangular projection. It is not an independent survey; do not interpret seven decimal places as 1 cm measured accuracy. Original LiDAR preprocessing was EPSG:7855 (GDA2020 / MGA Zone 55); original reprojection and registration error should be checked with ground control before placing collision-critical trunks.

## 2. Evidence matching and species confidence

Use a review-based matching process, never automatic species filling.

1. Use already-public authoritative point/tree ID and taxon records, where available, with coordinate CRS, survey date and current status. Map historical removals/plantings as separate observations. No Council contact is in scope.
2. **Check photo/field evidence:** documented year/month or image capture timestamp; camera lat/lon and compass bearing alone are **not** a trunk position; require visible base, independent angle/triangulation, reference landmarks, and original source IDs.
3. **Convert coordinates into same datum**; inspect surveyed CRS and model transform against NSW cadastral control/road edges. Correct a global offset, do not silently push individual crowns metres to the kerb.
4. **Pair GPS trunk point to LiDAR canopy candidate** only when a reasonable crown/offset overlap and no contradictory tree exists. Canopy peak is offset from trunk in leaning/overhanging trees; nearest-neighbour alone can mispair adjacent trees. Review dense clusters and split maxima.
5. **Evidence ratings:**
   - `A`: official measured/identified per-tree asset with stable location or expert-verified field ID, current enough for target-year as-built claim.
   - `B`: two consistent dated independent pictures, visible trunk/leaf/bark characteristics, plausible corresponding canopy and reviewed taxon.
   - `C`: genus/ornamental family strongly suggested but missing diagnostic detail or uncertain position; display generic matched shape, keep scientific name null or genus only.
   - `D`: LiDAR shape-only, seasonal photo without diagnostic botanical features, 2019 plan not confirmed built, or regional vegetation-class indication.
6. **Temporal claims:** show `historical_removed`, `historically_planted`, `observed_2022`, `observed_2024`, `unknown_2026`, `verified_current` separately. Never render 2025 *proposals* as completed.

## 3. Field/photo audit sequence

**Priorities:**
- P0 Dandaloo southern 2018 replacement pears (which survived/changed?) and north-side medians; central 2019 design tree-symbol comparison.
- P0 cemetery: western 20 and eastern 15 historical Kurrajong trees, northern Manchurian Pear boundary, any 2025/26 replacement.
- P1 aerodrome: identify the **2022 28-ha study area** boundaries, not simply drop 10 tree labels across the whole airfield; note six dead stags.
- P1 Narromine Hotel frontages: avoid restoring unsupported trunks removed after 2026 photo QA; review earlier hotel/kerbtree evidence.
- P1 High Park river and wetlands: PCT36 indicative species versus direct observed individuals; riparian species may differ by topographic elevation.
- P2 residential and rural roads, other parks; date-stamp coverage gaps and building-occluded trunks.

**Street panorama coverage audit:** Mapillary image/time/geometry queries and legally accessed Street View metadata; retain only permissible metadata/source links or appropriately licensed photographs. Record `capture_date, panorama_id, camera_lat/lon, heading, visible_tree_base, trunk_point_accuracy, image_provider, source_url, attribution`. No known 2026 tree position should be fabricated by interpolating plan symbols.

## 4. Species model crosswalk (only after ID is evidenced)

| Species / evidence | Visual model features | Variation and season | Site evidence, not per-tree |
| --- | --- | --- | --- |
| Kurrajong (`Brachychiton populneus`) | Broad, rounded-to-irregular crown, sometimes thick trunk, small leathery often lobed leaves; flowering unobtrusive cream/red | Evergreen. Hollow-bearing older stems important at cemetery/aerodrome | Actual 2022/2024 group counts and historical Dandaloo |
| Poplar Box (`Eucalyptus populnea`) | Native eucalypt with box bark, broad poplar-like foliage/crown, sparse irregular branches | Evergreen, some old limbs and stag habitat | Seven field-confirmed in specific aerodrome study |
| Manchurian Pear (`Pyrus ussuriensis`) | Medium broad-conical deciduous branching, white blossom in spring and red autumn foliage | Full/leafless seasonal LOD; a 2018 planted specimen is not necessarily fully mature | Historic Dandaloo south replacement and cemetery northern border |
| Silver-leaved Ironbark (`Eucalyptus melanophloia`) | Rough dark ironbark trunk, small grey/silver leaves, irregular woodland branching | Evergreen | Ecologist reports *some* in wider aerodrome subject |
| Wilga (`Geijera parviflora`) | Small twisted trunk, drooping lanceolate fine foliage | Evergreen | One mentioned in broader aerodrome subject |
| River Red Gum (`E. camaldulensis`) | Spreading tall branches, smooth mottled peeling bark, sparse open crown | Evergreen, riparian floodplain | **PCT indicative only** at High Park |
| Cooba and River Cooba (`Acacia salicina`, `A. stenophylla`) | Small-medium wispy, fine drooping leaves, multi-leader variation | Evergreen | **PCT indicative only**, not 2026 site stems |
| Maple, pin oak, Canary palm | True botanical silhouette/crown, not all one generic gum; species-specific leaves and palm pinnate geometry | Deciduous maple/oak; evergreen palm | **2019 proposed design only**, do not instantiate on plan alone |
| Water Gum (`Tristaniopsis laurina`) | Small-medium dense glossy evergreen broadleaf, multi-leader common | Evergreen | **2025 proposed** cemetery replacement, not confirmed planted |

**Geometry/LOD for existing TREE-REAL-001 work:** Preserve physically measured trunk collision and existing excluded landmark objects; varied meshes by height/crown radius, close-up asymmetric branches and correct bark, mid-distance simplified clustered crowns, far crowns billboard/impostor, deterministic variation keyed by stable tree ID, modest leaf wind at close range only, backface/alpha overdraw guarded, desktop/mobile budget separate. Culling/instancing cannot change collision, woodcutting interactions or NPC paths. New species model match overrides should only affect visuals of a **verified individual**.

## 5. Integration without modifying original sources yet

If authoritative data becomes publicly available:
- Store original raw source in an evidence-only location with its declared reuse rights.
- Convert into `observations.geojson` using input CRS and capture dates; validate point bbox Narromine and stable IDs.
- Create an explicit `tree-species-matches.json` keyed by **source asset ID**, matched game tree/candidate ID, spatial uncertainty, photo/record refs, and evidence A/B/C/D.
- Add tests for geographic bounds, duplicate tree IDs, invalid scientific names, **no species label without evidence IDs**, conflict/time-status rules, number of observed true stems vs LiDAR maxima and no new street obstructions.
- Build a branch on latest main, coordinate with TREE-REAL-001, inspect game screenshots from verified locations, verify phone and desktop, then merge/deploy with exact build SHA.
- Never change the 3,096 candidate input or the 2023 original LiDAR file merely to make a species match fit.

## 6. Explicit blockers to stronger 2026 conclusions

1. Council asset/inspection table, Dandaloo as-built planting locations and current cemetery replacement status not yet supplied.
2. Only dated **site/area** census, no individual plant field GPS in the reviewed documents.
3. Image provider coverage and actual botanical identification unresolved; no claim of systematic Mapillary/Street View coverage.
4. LiDAR point is *canopy apex*, not guaranteed stem; crowns are a 2023 snapshot.
5. Plant/community map labels are habitat associations, not urban planted-tree identifications.
6. Current 2026 physical device, botanical expert checks and ongoing future updates remain separate from this research deliverable.

**Acceptance for research:** valid candidate GeoJSON/CSV counts, correct coordinate order and bbox; no invented per-tree taxa; sourced evidence kind/date/counts, documentation explicitly distinguishing planned from built and existing photos from old plan symbols. Live gameplay unchanged.
