# Narromine realism to-do list (walk-through audit, 4 Nov 2026)

Owner direction: make Narromine true to life in every way. Approximate placement of something that
really exists is fine; guesses are not. Sources, in order of preference: NSW Spatial Services
(building footprints, cadastre, aerial imagery, 2023 airborne LiDAR; CC BY 4.0), OpenStreetMap
(ODbL), ARTC/Transport for NSW open data, council documents. Google Street View is for Josh's
by-eye comparison in `narromine-compare.html` only: Google's terms do not allow its imagery to be
stored, analysed or turned into geometry, so no Street View pixels feed this list.

How this was audited: a scripted walk of the live build (Dandaloo Street north/south, Burraway
Street, the station, residential streets, the silo crossing, the highway entry, back streets) plus a
count of where every building comes from. At the start: 212 mapped OSM buildings, 10 detailed
landmark sites, 8 stand-in shops and **2,665 invented stand-in houses**.

## Checklist (highest impact first)

1. [x] **Real building footprints for every building.** _Done 4 Nov 2026: 2,212 traced footprints (Microsoft Global ML Building Footprints, ODbL) replace all 2,665 invented houses; heights from its estimates (1,985 measured); 13 dropped where a mapped road runs through them. Remaining: the 8 named stand-in shops._ Replace the 2,665 invented stand-in houses
   (and 8 stand-in shops) with NSW Spatial Services building footprints: real position, outline and
   orientation for every house, shed and shop. Heights from 2023 LiDAR where measured.
2. [x] **LiDAR heights and roof form for all footprints.** _Done: 1,265 footprints measured from the 2023/2011 tiles on hand (eave p5, ridge p98); the rest use the footprint dataset's height. Outer areas need more LiDAR tiles._ Run `tools/narromine_lidar.py` over the
   new footprints: wall and ridge heights, flat vs pitched roofs, verandahs.
3. [x] **Grain silos and receival site.** _Partly done: the four round concrete silos by the station yard (OSM man_made=silo) are cylinders at their LiDAR heights (20.8 m wall, 23.4 m top); the three OSM grain bunkers are low tarped stacks. Bunker heights need a LiDAR tile covering them._ Model the GrainCorp/Agrigrain silos and bunkers at the
   Silo Access Road crossing from footprints and LiDAR heights (currently missing; the tallest
   landmark in town).
4. [x] **Real trees.** _Done for the LiDAR-covered town centre: 3,096 trees (after removing duplicate peaks and pole-like detections, and none in front of the Narromine Hotel per the owner comparison) detected in the 2023 LiDAR (tools/narromine_trees.py: canopy-height peaks ≥3.5 m) at their measured height and crown radius; none on roads, track or inside buildings. Outer areas need more LiDAR tiles._ Place trees at LiDAR vegetation (class 3–5) clusters with their measured
   canopy height and spread; street trees only where LiDAR shows them.
5. [ ] **Property boundaries and fences.** Draw cadastral lot boundaries; front fences and
   driveways only where aerial imagery shows them.
6. [x] **Road surfaces and markings.** _5 Nov 2026: white edge lines, broken centre lines and edge lines curving round kerb returns on the main roads (owner photo at the hotel). Earlier, from OSM tags: 26 street runs on unpaved ways drawn as gravel tracks; Australian broken centre lines (3 m line, 9 m gap) only on the 15 ways tagged with 2+ lanes. OSM maps no stop lines or road signs beyond give-way._ Sealed vs unsealed from OSM `surface`; centre lines, edge
   lines, stop/give-way lines and signs at mapped intersections; real road widths.
7. [x] **Kerb, gutter and footpaths.** _5 Nov 2026: curved kerb returns at every junction; footpaths only on main roads and town-centre streets (residential streets get verges); Derribong Ave by the hotel has its one-sided red-brick path (owner photo); no footpath across the hotel forecourt; 31 OSM footways drawn. Earlier: unpaved roads no longer get generated footpaths or kerbs. Sealed-street footpaths still follow the road class rule; checking them against aerial imagery remains._ Only on streets that have them (town centre and main
   streets per aerial imagery); gravel verges elsewhere.
8. [ ] **Terrain.** Use the LiDAR ground model (class 2) for gentle ground levels, the Macquarie
   River banks and drainage channels, instead of a flat plane.
9. [ ] **Ground cover and land use.** Paddocks, parks, sports ovals, the golf course, the
   aerodrome and industrial yards from OSM land use and aerial imagery colours.
10. [x] **Level-crossing protection types.** _Done: NSW register — Dandaloo Street half booms + lights, Manildra Street lights only, five with stop signs; nine trains a day as in the register._ Booms vs flashing lights vs signs for all 7
    crossings, from the NSW "level crossings on public roads" open dataset (currently all booms).
11. [x] **Power lines and poles.** _Done from OSM: 33 timber poles on the 22 kV line, 17 lattice towers on the two 132 kV lines, sagging three-wire conductors. Heights are typical values (not mapped). South Dandaloo poles still need LiDAR wire returns or OSM mapping._ OSM `power=line/pole` and LiDAR wire returns; re-add the south
    Dandaloo poles at their real positions.
12. [x] **Street lights and signs.** _Done for what OSM maps: 34 give-way signs at the kerb facing approaching traffic and 9 bus stops. OSM maps no street lamps or stop signs here, so none are invented._ OSM `highway=street_lamp`, traffic signs and the town-centre
    lights; only where mapped.
13. [ ] **Business names and land uses.** Check all 98 named places against OSM and council
    listings; remove closed businesses; keep historical names only with a date label.
14. [x] **Sky, light and colour.** _Sun position, dawn and dusk were already computed for Narromine's latitude and date; fog now opens to 220–650 m in Narromine for the clear inland air. Paint/roof colours from aerial imagery remain._ Correct sun position for Narromine's latitude and season, a
    clear inland sky, and paint/roof colours sampled from NSW aerial imagery (not Street View).
15. [ ] **Traffic and people at realistic levels.** Car and pedestrian numbers that match a town
    of about 3,400 people; trucks on the Mitchell Highway.
16. [ ] **Rail completion.** Silo sidings in use, a fictional-but-labelled link to Repository
    Town if wanted, and freight wagons loading at the silos.
17. [ ] **Owner by-eye review.** Josh compares each block with the Street View compare page and
    files differences; each becomes a numbered item here.

Progress is recorded against each item with its PR number.

## Owner comparison fixes (Mapillary / Street View, 4–5 Nov 2026)

- [x] No trees in front of the Narromine Hotel (PR #393).
- [x] Arrival point no longer inside the Royal Hotel model (PR #399).
- [x] Curved kerbs at junctions (PR #400), hotel forecourt one sealed surface (PR #401).
- [x] Main-road line marking with curved corner lines (PR #402).
- [x] Derribong Avenue one-sided red-brick footpath; residential verges (PR #404).

## Still open, and what each needs

- **3 (bunkers), 4 and 2 outside the town centre:** more NSW LiDAR tiles (only 6166432/6166433 are on hand).
- **5 Fences and lot lines:** NSW cadastre is reachable; fences need aerial imagery or Mapillary review.
- **8 Terrain:** LiDAR ground model, same tile limit as above.
- **9 Land use:** OSM land-use areas are drawn; paddock/oval colours from aerial imagery still to check.
- **13 Business names:** needs a dated check against current council/business listings.
- **15 Traffic levels, 16 rail extras, 17 owner review:** not started.
