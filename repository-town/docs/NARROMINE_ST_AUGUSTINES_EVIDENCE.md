# St Augustine's Catholic Church — Narromine exterior reconstruction

**Site:** 20 Dandaloo Street, Narromine NSW 2821  
**Model:** \`src/world/narromine-st-augustines.js\`  
**Claim:** One building, OSM #10 only. No other Narromine church or street assets touched.

## Independent evidence and values

| Feature | Evidence | Confidence |
| --- | --- | --- |
| Building identity and street address | Diocese of Wilcannia–Forbes, Church Histories and Churches Australia | High |
| Existing horizontal outline (12 surveyed OSM vertices) | \`src/world/narromine-osm-data.js\` building index \`10\` (\`St. Augustines\`), used with canonical \`OFFSET\` from \`narromine-layout.js\` | High as mapped outline, not a cadastral survey |
| Roof geometry from real elevation data | \`src/world/narromine-lidar-data.js\`, \`osm:10\`: **2023**, ground **239.21 m AHD**, eaves (p5) **4.65 m**, ridge (p98) **10.54 m**, 804 points, ~2.38 pts/m² | High for sampled 2023 roof envelope, moderate for each individual gable |
| Architecture and opening | Designed by Peter Joseph Gannon, built of local red brick by Wallace and McGee in **1933**, Inter-war Romanesque; opened 16 July 1933 after 1932 cyclone destroyed former church | High |
| Original plan | Described as cruciform: 60×28 ft nave mass (**18.29×8.53 m**) and 48×22 ft transepts (**14.63×6.71 m**), semi-glazed terracotta tiles from Wunderlich; high front gable and a **7ft 2in (2.18 m)** Celtic cross | Medium for modern extant shape; historical written dimensions not survey-certified today |
| Historic gable vs 2023 height | 1933 account claims gable **50 ft (15.24 m)** whereas current OSM building LiDAR reports roof ridge p98 **10.54 m** | **Unresolved conflict**; current model follows LiDAR roof for contemporary exterior and adds the documented cross as a distinct element |
| Door, windows, buttresses and decorative masonry | Romanesque proportions and published exterior images; not individual surveyed fenestration placements | **Provisional artistic approximation**; do not describe as exactly verified |

## Sources and provenance

- NSW Spatial Services 2023 airborne LiDAR, CC BY 4.0 (c) State of New South Wales, via ELVIS/Geoscience Australia. See \`narromine-lidar-data.js\` for tile IDs, classification, footprint statistics and survey method.
- OpenStreetMap building footprint, © OpenStreetMap contributors, ODbL 1.0. See \`narromine-osm-data.js\` and the OSM provenance notes in \`narromine-layout.js\`.
- Catholic Diocese of Wilcannia–Forbes, Narromine parish: https://www.wf.catholic.org.au/parishes-2/narromine/
- Churches Australia, *St Augustine's Catholic Church*: https://www.churchesaustralia.org/list-of-churches/locations/new-south-wales/all-towns/directory/3250-st-augustine%27s-catholic-church
- Australian Christian Church Histories: https://www.churchhistories.net.au/church-catalog/narromine-nsw-st-augustines-catholic
- Country Towns, *St Augustine’s Catholic Church, Narromine, NSW, 1933*, historical description and photo (photo dated June 24 2018; published January 5 2022): https://www.flickr.com/photos/193535084@N07/51801465595/

**Licensing:** This project uses written architectural facts, mapped points and its own procedural geometry. No Flickr/Churches Australia photographs or derivative photographic textures are shipped, downloaded to the game, or embedded in public assets.

## Model construction

- Exact original mapped outline extruded into individual red-brick walls, replacing **only** \`BUILDINGS[10]\` (generic extrusion suppressed in \`narromine.js\`).
- Gable/tiled roof surfaces with narrow terracotta course detailing and an independent transept roof, constrained to the present-day LiDAR height envelope.
- Recessed entry and round-arched front, simple stone trim, a niche indicated near the upper front gable and a small procedural Celtic cross 2.18 m tall.
- Side arched windows with separate glazing, jambs and sills; external buttresses.
- Collision solids sliced along the outline (not one large AABB). No street or footpath collision outside the site added intentionally.
- Existing batching and spatial culling preserved via the town's \`push(colour, geometry)\` API; does not create separate runtime animation or image requests.

## Remaining work and uncertainty

This is a **major improvement over a generic LiDAR-height box**, but **not yet a centimetre-accurate photogrammetric model**. Verify the 2018 photos against a matching camera pose and determine:
- Whether the historical gable measurement includes a vertical parapet/bell cross not captured in the current 2023 LiDAR percentile.
- Actual window counts, depths, west wings, masonry pattern and doorway setback (details are approximate).
- Roof hip/gable intersections, transept positions and any contemporary additions seen in newer street-level views.

Do not alter neighbouring Dandaloo Street kerbs, parking or vegetation claimed by PR #333, or other agents' models. This church may be refined independently against new permissioned reference photographs.

## Acceptance evidence

\`node tests/narromine-st-augustines.mjs\` verifies mapped footprint, measured LiDAR envelope, finite triangle geometry, cross height, constrained collider footprint and narrow one-building OSM suppression, including rollback of supplied geometry in tests.

\`node tools/build.mjs\` + \`node tools/check_privacy.mjs\` remain mandatory. A passing Node test establishes geometry/integration invariants, **not** photographic fidelity or gameplay visual verification. Real browser screenshots should be compared against permitted photographs at street-level views before claiming full realism.
