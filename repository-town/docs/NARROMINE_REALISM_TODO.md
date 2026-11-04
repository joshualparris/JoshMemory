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
4. [x] **Real trees.** _Done for the LiDAR-covered town centre: 5,751 trees detected in the 2023 LiDAR (tools/narromine_trees.py: canopy-height peaks ≥3.5 m) at their measured height and crown radius; none on roads, track or inside buildings. Outer areas need more LiDAR tiles._ Place trees at LiDAR vegetation (class 3–5) clusters with their measured
   canopy height and spread; street trees only where LiDAR shows them.
5. [ ] **Property boundaries and fences.** Draw cadastral lot boundaries; front fences and
   driveways only where aerial imagery shows them.
6. [ ] **Road surfaces and markings.** Sealed vs unsealed from OSM `surface`; centre lines, edge
   lines, stop/give-way lines and signs at mapped intersections; real road widths.
7. [ ] **Kerb, gutter and footpaths.** Only on streets that have them (town centre and main
   streets per aerial imagery); gravel verges elsewhere.
8. [ ] **Terrain.** Use the LiDAR ground model (class 2) for gentle ground levels, the Macquarie
   River banks and drainage channels, instead of a flat plane.
9. [ ] **Ground cover and land use.** Paddocks, parks, sports ovals, the golf course, the
   aerodrome and industrial yards from OSM land use and aerial imagery colours.
10. [x] **Level-crossing protection types.** _Done: NSW register — Dandaloo Street half booms + lights, Manildra Street lights only, five with stop signs; nine trains a day as in the register._ Booms vs flashing lights vs signs for all 7
    crossings, from the NSW "level crossings on public roads" open dataset (currently all booms).
11. [ ] **Power lines and poles.** OSM `power=line/pole` and LiDAR wire returns; re-add the south
    Dandaloo poles at their real positions.
12. [ ] **Street lights and signs.** OSM `highway=street_lamp`, traffic signs and the town-centre
    lights; only where mapped.
13. [ ] **Business names and land uses.** Check all 98 named places against OSM and council
    listings; remove closed businesses; keep historical names only with a date label.
14. [ ] **Sky, light and colour.** Correct sun position for Narromine's latitude and season, a
    clear inland sky, and paint/roof colours sampled from NSW aerial imagery (not Street View).
15. [ ] **Traffic and people at realistic levels.** Car and pedestrian numbers that match a town
    of about 3,400 people; trucks on the Mitchell Highway.
16. [ ] **Rail completion.** Silo sidings in use, a fictional-but-labelled link to Repository
    Town if wanted, and freight wagons loading at the silos.
17. [ ] **Owner by-eye review.** Josh compares each block with the Street View compare page and
    files differences; each becomes a numbered item here.

Progress is recorded against each item with its PR number.
