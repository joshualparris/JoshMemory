# DEEP RESEARCH PROMPT — Is Repository Town's expansion actually the best town plan?

Date: 27 October 2026. Target repository: `joshualparris/JoshMemory`, `repository-town/`.

## Mission

Independently audit, challenge, redesign where justified, implement, test and compare the **whole existing and proposed town**, rather than accepting the current 12 parcels and six road reservations as a good solution merely because they were recently committed. Produce a defensible regional-NSW-inspired, walkable, serviceable and realistic virtual settlement, retaining game compatibility. **Do not award a 10/10 score without evidence.**

## Mandatory source-code inventory

Read `src/world/town.js`, `town-planning.js`, `town-expansion.js`, `addresses.js`, `town-origin.js`, `traffic.js`, `traffic-signals.js`, `vehicles.js`, `rail-corridor.js`, `pedestrian-navigation.js`, `exterior-collision.js`, `property.js`, `nsw-property-law.js`, `town-expansion-facades.js`, all relevant tests, and deployment settings. Enumerate actual built lots, site locations, transport network, footpaths, rail crossings, driveways, utilities, existing land uses and collisions from code. Distinguish fictional metres from surveyed real-world dimensions.

## Research against authoritative primary sources

1. NSW Environmental Planning and Assessment Act, LEP Standard Instrument, Dubbo Regional LEP, applicable DCP, subdivision controls, zoning land-use tables, minimum lot sizes and flood/bushfire constraints. **Do not assume fictional R2/R3/E3/E4/RU1 labels automatically establish permissions.**
2. NSW Government regional settlement strategies, housing and infrastructure sequencing, rural land fragmentation and agricultural land-use conflict.
3. Austroads Guides to Road Design (Part 3, 4, 4A, 4B, 6A), traffic management, safe-system and intersection selection. Check current edition and publication date. NSW TfNSW supplements and relevant road-design requirements.
4. NSW Address Policy and User Manual, Geographical Names Board road-naming rules, NSW Spatial Services addressing, road types, uniqueness, number parity and locality names. Do not imply names are officially approved.
5. AS 2890 parking/access where applicable, accessible paths, emergency-vehicle swept paths, waste collection and freight routing. Distinguish legally binding clauses from guidance.
6. NSW floodplain management, stormwater WSUD, catchment-based drainage, heat, vegetation, shade, fire buffers, rail interface and safe crossings.
7. Compare at least three plausible growth strategies: (A) existing edge-strip layout; (B) compact infill plus two small neighbourhoods; (C) peripheral employment belt and agricultural transition; optionally (D) alternative that scores better.

## Spatial and quantitative analysis

- Compute all lot polygons/rectangles, parcel sizes in m² and hectares, adjacency, setbacks, overlap, land-use buffers, frontages, access points and road intersections. Compare nominal 26×46m core lot spacing with actual house footprints; identify any land crossing rail or established buildings.
- Build a road graph: nodes at true junctions, edges with length, class, speed, lanes, footpath, crossing, truck restrictions and planned/built status. Prove every new parcel has legal-style frontage to a public road; detect isolated roads and dead-end routes.
- Assess destinations and 400m/800m pedestrian catchments, schools/parks/healthcare access, realistic walking distances and barriers, not just Euclidean distance.
- Estimate vehicle generation scenarios and test local versus collector intersections, sight distance, queue length, pedestrian crossing exposure and turn geometry. Do not invent traffic counts; use clearly labelled scenarios.
- Compare service access for aged care, schools, nursery, waste depot, workshops, rural supply, farms and emergency response; protect freight from residential rat-running.
- Study compact small lots, ordinary family lots, corner lots, mixed-use, larger institutional lots, industrial lots, market gardens and true broadacre farms. Consider simulation scale and streaming instead of rendering an implausibly small 'farm'.
- Audit address and road naming compatibility with existing `A1-S`, `H:` and `B:` saved-game keys. Design a stable unique parcel ID, named road, number, side-of-road and provisional status model. Never break old saves.
- Assess graphics budget and mobile performance (draw calls, meshes, instancing, culling, collision, navigation), and test mobile Chromium/WebGL where possible.

## Deliverables

1. Evidence table with exact source URLs, publication date, jurisdiction, applicability and confidence.
2. GIS-style machine-readable parcels and road graph, with coordinate convention and land-use legend.
3. Conflict/defect register (severity, evidence, proposed fix, test).
4. Scored alternatives matrix: safety, walkability, road connectivity, land-use compatibility, housing diversity, rural realism, infrastructure cost, performance, backward compatibility. Explicit weights, assumptions and sensitivity tests.
5. Revised structure plan and phased construction plan; exact road alignments and parcel access before building.
6. Implement the preferred plan with working intersections, traffic and pedestrian routing, signage, addresses, appropriate lot scale, and tests. Keep conceptual/unbuilt roads labelled until genuinely navigable.
7. Automated tests for geometry nonoverlap, road connectivity, valid addresses, existing building preservation, rail clearances, and browser driving/walking to each new district.
8. Run builds/tests and verify a deployed playable version. Record failed tests and blockers, not just commits.

## Guardrails

No new emails or external contacts without user's explicit permission. Do not delete or relocate established buildings without evidence and compatibility plan. Do not declare roads driveable if they are only visual strips. No invented compliance, survey, legal lot titles, road names, traffic studies or certifications. Push research, source references, audit and tested code to main as explicitly requested; document unverified aspects clearly.

## Starting hypothesis to falsify

The current six road strips and 12 edge parcels may be spatially disconnected, misaligned with actual town road ends, lacking frontages and undersized for farming. They should be treated as an **unverified concept**, not an optimised plan.
