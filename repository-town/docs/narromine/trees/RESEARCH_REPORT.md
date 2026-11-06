# Narromine NSW — individual-tree inventory and species survey investigation
**As at:** 2026-11-05 · **Purpose:** Repository Town historically/geographically faithful tree modelling · **Research status:** documented public sources reviewed, individual species-to-coordinate linkage **unverified**.

## Executive conclusion

1. **Does an authoritative species-labelled point inventory exist?** An individually georeferenced, publicly accessible Narromine *township* street/park tree register was **not located** in the public sources checked. Council's tree policy requires tree inspections; its asset plan names **Intramaps and QGIS**, but neither publication confirms that a public `species + individual GPS` layer exists. **Only Council can confirm internal records, extent, export and currency.** [S01] [S02] [S03]
2. **What is genuinely documented?** (a) In the **aerodrome's smaller study area**, an ecologist counted **7 `Eucalyptus populnea` (Poplar Box), 3 `Brachychiton populneus` (Kurrajong) and 6 dead stags** during the 9 Feb 2022 survey. It was a 28-ha study area within the ~295-ha aerodrome subject area, **not all airport trees**. [S05] (b) Council's 13 Aug 2025 business paper records an **April 2024 count of 35 Kurrajong** (20 western cemetery avenue, 15 eastern avenue). It says there was **no 2025/26 replacement budget** and describes two possible future replacement approaches. This is **not** a 2026 tree-by-tree inventory. [S04] (c) The NSW War Memorials Register records **Kurrajong to Manchurian Pear** replacement on southern Dandaloo in **2018**, with northern Dandaloo Kurrajongs previously removed in 1934–35. [S06]
3. **What exists as a spatial starting layer?** The already checked-in game has **3,096** auto-extracted 2023 LiDAR-derived canopy candidates from Spatial Services MacquarieFloodplainSouth tiles **6166432 / 6166433**. These have game x/z and estimated canopy height/crown radius **but no species**. They are not necessarily exact trunks, separate surviving individuals, nor an authoritative survey of today's planting. [R01] [R02] [R03]
4. **How many current trees have both defensible individual species and a usable individual geographic point from this research?** **0 verified individual matches so far.** This is a measurement of linked data acquired in this investigation, **not** a claim no identifiable trees exist. The aerodrome 10 and cemetery 35 records are **group/area-specific historical observations without per-tree GPS**, and the 3,096 candidates have **position and shape but no species**.
5. **Best next step within this research-only scope:** Cross-reference the existing 3,096 canopy candidates with already-public dated photographs and retain botanical uncertainty. Internal asset-record availability remains unknown. [S03]

## Research method, evidence hierarchy and limits

Primary records reviewed: NSW War Memorials Register, Narromine Council policies and August 2025 engineering business paper, 2019 Narromine streetscape *design* attachment, 2020 Council Natural Areas Plan of Management, a dated 2022 ecologist's aerodrome field survey on NSW Planning Portal, NSW BioNet/API docs, NSW SEED vegetation products, NSW Landcare site description and 2023 planning/photographic context.

- **A: individual taxon AND actual matched trunk/point.** None in this snapshot.
- **B: independently verified species via dated photos in the same position.** None fully joined to a trunk in this snapshot.
- **Site-confirmed/group-survey:** robust taxon and location **at site or avenue level**, with numbers when explicitly provided; **never distribute** across arbitrary crowns.
- **Plan-only:** an architect or Council proposed a species; *not proof of installation*.
- **Landscape ecological indication:** PCT or indicative fauna/flora; *not a tree census*.
- **Remote canopy candidate:** probable tree canopy observed in 2023 LiDAR; *no botanical identification*.

### Strongest direct public site records

| Site / geography | Actual observation or Council report | Count | Date | Confidence and limitation |
| --- | --- | ---: | --- | --- |
| Narromine Aerodrome, surveyed **28-ha** study area | `Eucalyptus populnea` Poplar Box | 7 | 9 Feb 2022 | Ecologist field-identified; not individual GPS in accessible summary; **not whole aerodrome**. [S05] |
| Same aerodrome study area | `Brachychiton populneus` Kurrajong | 3 | 9 Feb 2022 | Ecologist field-identified; one reported hollow. [S05] |
| Same aerodrome study area | Dead trees (stags), taxon unrecorded | 6 | 9 Feb 2022 | Not a living species count; do not assign a species. [S05] |
| Wider aerodrome subject area | `Geijera parviflora` Wilga (one) and `Eucalyptus melanophloia` Silver-leaved Ironbark (a few) described in surrounding subject area | No defensible total | 2022 | Not included in 7+3 study count; not individually mapped. [S05] |
| Narromine Cemetery | `Brachychiton populneus` Kurrajongs in west/east avenues | 35 (20 west/15 east) | Council's **April 2024 count**, reported Aug 2025 | Later removal/condition unknown; do not assert all 35 remain living November 2026. [S04] |
| Narromine Cemetery, northern boundary | Manchurian Pear existing/continuing planting discussed in Council resolutions | No count | 2024–25 | Boundary presence reported, individual locations and cultivar unknown. [S04] |
| Dandaloo Street **south of railway** | 2018 Kurrajongs removed, replanted with Manchurian Pear | No count | 2018 (plaque unveiled 2020) | Strong historic project/species evidence, NOT per-tree positions or survival to 2026. [S06] |
| High Park River Reserve | PCT 36 River Red Gum riverine floodplain community; `Eucalyptus camaldulensis` subsp. `camaldulensis`, `Acacia stenophylla`, `A. salicina` listed **indicatively** | None | Council Natural Areas PoM 2020 | Ecological composition / model suitability, **not a verified species list for particular trunks**. [S08] |
| Narromine Wetlands | Planting of *native species* around developed wetland ponds | No identified taxa | NSW Landcare project | Useful location history, **no exact species in project summary**. [S15] |

The aerodrome field survey additionally lists **four vegetation integrity plots** plus 13 rapid assessment sites. Three field-observed named tree taxa (`E. populnea`, `B. populneus`, `Geijera`) are directly reported, with `E. melanophloia` in surrounding area. Surveyed vegetation was highly modified and the assessment explicitly said the *survey area* no longer conforms to a native PCT; do not paint the runway or hangar clearances as continuous pristine woodland. [S05]

### Dandaloo Street: design vs built reality

The NSW War Memorials Register says Dandaloo's Kurrajong memorial avenue began in **1917**, the northern trees were cleared in **1934–35**, and a further southern avenue replacement with Manchurian Pear occurred in **2018**. [S06]

An independently located Council **2019 design-development** document (Moir Landscape Architecture, project 1636, drawing LA-101) gives a Dandaloo Street **South** legend with **`Pyrus ussuriensis` (Manchurian Pear), `Acer negundo` 'Sensation' (maple), `Quercus palustris` (pin oak) and `Phoenix canariensis` (Canary Island Date Palm)**. The design plan uses the spelling 'Pyrus usseriensis' in one extracted legend, with correct `ussuriensis` elsewhere. **These are proposed design palette symbols, not evidence that each tree was planted or is alive today.** The same 2019 PDF contains a **different Trangie plan** listing `Ficus microcarpa`, `Jacaranda` and `Brachychiton`; **do not move those Trangie taxa into Narromine**. [S07]

A 2023 planning statement for **42 Dandaloo Street** describes a divided roadway with mature palms and evergreen street trees and central hedges. This verifies a *photographed visual planting character* for that scene/date but is not a botanical tree survey. [S09]

See [DANDALOO.md](DANDALOO.md) for segment-by-segment chronology and proposed verification method.

### Broader vegetation — no automatic street-tree species assignment

- Council's High Park River Reserve carries a **PCT 36** interpretation with indicative riparian `Eucalyptus camaldulensis` and small `Acacia` species. [S08]
- The NSW State Vegetation Type Map is a map of **plant communities**, not stems. The 2026 NSW Open Data catalogue also surfaces the older `narromine00` (VIS 1635) woody-vegetation file and `narromine80` (VIS 1608) historic woodland file; **2026 catalogue updates do not indicate 2026 field-survey dates**. [S11] [S12] [S13]
- BioNet's **Systematic Flora Survey** stores plot/rapid-survey evidence; BioNet web services provide sightings and vegetation classification via OData, with access restrictions for some fields. No Narromine plot records were extracted and matched tree-by-tree in this run. [S10]
- A 2020 report discusses peppercorn tree distress in the Narromine district; this is district-level evidence for peppercorn trees, not street-specific planting, and a reported cause was not established. [S16]
- The 2022 aerodrome ecological assessment notes a possible nearby landscape `Poplar Box` PCT, **but does not assign that PCT to its heavily modified survey site**. [S05]

### Council: published inventory and GIS evidence

The published tree policy covers public roadside management and inspections, while the asset strategy names **Intramaps and QGIS**. Neither proves a downloadable point inventory. Internal layers, export availability and currency remain unknown. Only already-public records are in scope; no contact or correspondence is authorised. [S02] [S03] [S17]

### GIS searches: false positives prevented

A web-search result titled **"Existing Trees" ArcGIS FeatureServer** had plausible fields `Genus`, `Species`, `DBH`, `TreeID`, etc. However its extent is **EPSG:28356 x≈309,988–323,177, y≈6,253,377–6,262,823**; this converts to approximately **150.946–151.091°E, 33.84–33.76°S**, i.e. metropolitan Sydney, **not Narromine (~148.24°E)**. Explicitly **REJECTED**; do not download/import this into RepoTown just because the generic dataset name matches. [S18]

### Imagery and street-level validation

Known contextual sources: Wikimedia Commons' Dandaloo Street 2017 image, 2023 Dandaloo environmental statement photos, Council 2019 proposed plan, user's dated 2026 compare images already referenced by the game, and available Mapillary/Street View providers. Do not treat a 2017 pre-2018 southern tree as a 2026 tree. Source, date, photo position, camera heading, tree **base** visibility and licence all need recording. **Live systematic Mapillary/Google pano coverage has not been queried/validated for every street in this research pass**, so this report makes no claim about percentage coverage or exact species identified from those services. [S07] [S09] [S14]

Additional low-cost field survey priority: Dandaloo railway crossing to Council/shops (both sides, current planting), cemetery western and eastern avenues (35 historic stems), cemetery north boundary Manchurian Pears, aerodrome survey-site 10 live individuals and 6 dead trunks, High Park floodplain and wetlands by trail.

## LiDAR-derived GIS baseline

Existing pipeline: `tools/narromine_trees.py` builds 1 m canopy-height grid from classified LAS/LAZ returns (class 5 high vegetation minus class 2 ground), detects local maxima at least 3.5 m tall, estimates crowns then `tools/narromine-trees.mjs` filters road/building, near-hotel, photo-placed and close-peak conflicts. Export comes from `src/world/narromine-trees-data.js`, **not** from external GPS points newly measured here.

| 2023 candidate metric | Min | 10th percentile | Median | 90th percentile | Max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Estimated canopy height (m) | 3.5 | 4.2 | 7.9 | 15.9 | 34.9 |
| Estimated crown radius (m) | 1.8 | 2.0 | 3.2 | 4.9 | 8.5 |

**3,096** surviving algorithmic candidates; 3,096 unique stored x/z rounded positions (no identical stored XY). *This is not a count of 3,096 known and living species-labelled stems.* Some detections could be multiple crown peaks, retained non-tree structures or sites removed after 2023; some genuine trees could have been excluded. The input generation claims 2023 NSW Spatial Services data; we have not independently inspected raw .laz acquisition metadata in this run. [R01] [R02]

New [GeoJSON](lidar-candidates-2023.geojson) and [CSV](lidar-candidates-2023.csv) preserve the game positions, heights and radii, converting to WGS84 using the **exact inverse of the game's own 2026-11-03 OSM anchor projection**. They are **approximate canopy peak positions**, not field-surveyed GPS trunk points. Their **scientific_name is null**, evidence D and survival unverified. [R03]

## Concrete answers and remaining work

- **Township-wide authoritative street-tree point+species register:** not found publicly / **internal Council status unknown**.
- **Historic counted live trees:** 10 in the *specific 2022 aerodrome study area*, 35 at Narromine Cemetery in **April 2024** (not current full-town totals), plus historic Dandaloo documented replacement without number.
- **Site-level named taxon evidence:** Kurrajong, Poplar Box, Wilga, Silver-leaved Ironbark, Manchurian Pear; riparian indicative River Red Gum and two `Acacia` species; additional planned but unverified Dandaloo maple, pin oak and palm; wetland natives of unknown exact taxon. See CSV for scoped source/type.
- **Verified species+GPS pairs as of this research:** **0**. The machine-readable `verified-individual-trees.geojson` intentionally has no features.
- **Positional-only 2023 aerial candidate dataset:** **3,096** exported in two usable open GIS formats, ready for joins *after* independently verified species IDs.
- **Biggest limitations:** Council data access, surveys/maps with no individual coordinates, imagery timestamps and camera/trunk matching, split crowns and LiDAR-versus-real-tree differences, specialist taxonomy, historic-versus-current planting.
- **No live gameplay changes** were made by this research branch.

**References:** [SOURCES.md](SOURCES.md) links all external source documents; repo references [R01–R03] identify current code/data and provenance.
