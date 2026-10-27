# Repository Town — independent spatial and planning research, pass 1
**Research date:** 27 October 2026. **Status:** Evidence-backed desktop/source audit; NOT a statutory assessment, surveyed layout, traffic model or certified design.

## Executive decision

**Reject the current 12-parcel/six-strip concept as a build-ready master plan.** Retain its visual reservations as provisional only. Prefer a *compact infill plus two connected neighbourhoods* strategy, with an employment/service edge and separately streamed rural land. This is a conditional concept selection, not an empirically established optimum. The most urgent next work is geometry/network reconstruction and transport tests, not roundabouts.

## Evidence ledger (authoritative sources, jurisdiction and confidence)

| Source and date | Jurisdiction | Application to game | Confidence / limitation |
|---|---|---|---|
| [Dubbo Regional LEP 2022, Council](https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/Dubbo-Regional-Local-Environmental-Plan-2022), gazetted 25 March 2022 | Dubbo LGA | Legal framework: land zoning, lot size, flood, heritage, biodiversity, groundwater, urban release maps | High for framework; **no parcel-specific GIS overlay performed** |
| [Dubbo LEP Planning Portal maps](https://www.planningportal.nsw.gov.au/publications/environmental-planning-instruments/dubbo-regional-local-environmental-plan-2022) | NSW | Versioned lot-size and zoning mapping | High for map availability; fictional town is not a real cadastral subdivision |
| [Dubbo Council planning proposal](https://www.dubbo.nsw.gov.au/Builders-Developers/Applying-and-Post-Approval/planning-proposal-application) | Dubbo LGA | Rezoning/minimum lot size changes require planning proposal pathway | High; no approval sought |
| [Austroads Guide to Road Design](https://austroads.gov.au/safety-and-design/road-design/guide-to-road-design) | AU/NZ technical guidance | Context-sensitive road hierarchy, drainage, pedestrian and cycling design | High; guidance is not itself an engineering certification |
| [Austroads Part 4A AGRD04A-26](https://austroads.gov.au/publications/road-design/agrd04a), **26 June 2026**, Ed 4.0 | AU/NZ | At-grade intersections, sight distances, turning and islands | High; exact design tables not yet applied to fictional junctions |
| [Austroads Part 4B AGRD04B-25](https://austroads.gov.au/publications/road-design/agrd04b), **12 August 2025**, Ed 3.3 | AU/NZ | Roundabout geometry, pedestrian/cyclist treatment | High; no volume warrants available |
| [NSW Government: addressing](https://www.nsw.gov.au/about-nsw/place-naming/addresses), accessed 27 October 2026 | NSW | Council issues street numbers; address requires number, road, locality | High |
| [NSW Government: road naming](https://www.nsw.gov.au/about-nsw/place-naming/roads), accessed 27 October 2026 | NSW | Council/TfNSW naming authority, GNB policy review | High |
| [NSW Address Policy 2024](https://www.spatial.nsw.gov.au/__data/assets/pdf_file/0005/232808/NSW_Address_Policy_and_User_Manual_2024.pdf) | NSW | Sections 6.2–6.7: numbering, urban/rural addresses and road naming | High; detailed odd/even assignment needs designed road alignment |
| [Austroads Part 6A overview](https://austroads.gov.au/safety-and-design/road-design/guide-to-road-design) | AU/NZ | Walking and cycling paths must be designed as network, not decoration | High for principle, no accessibility measurements performed |

**Unverified and requiring separate primary-source retrieval:** Dubbo DCP current consolidated version and subdivision engineering specification, AS 2890 and AS 1428 licensed clauses, TfNSW supplements, current NSW floodplain manual, bushfire assessment, rail clearance standard, real flood/terrain/soil GIS. No numerical setbacks, widths or legal minimum lot sizes are claimed from these sources.

## Repository inventory and quantitative findings

Files inspected: `town.js`, `town-planning.js`, `town-expansion.js`, `addresses.js`, `town-origin.js`, `traffic.js`, `traffic-signals.js`, `vehicles.js`, `rail-corridor.js`, `pedestrian-navigation.js`, `exterior-collision.js`, `property.js`, `nsw-property-law.js`, `town-expansion-facades.js`. Full all-test and deployment inventory **not yet completed**.

- Existing house coordinate system: 26 columns A–Z × 8 rows; **208 possible house-coordinate slots**, not 208 verified occupied houses. Nominal lot-centre spacing 26m × 46m = 1,196m² per conceptual grid cell. Real frontage/buildable area cannot be inferred from centres alone.
- House positions: x=(column index−12.5)×26, z=(row index−3.5)×46. Thus core house centres range x=−325..325 and z=−161..161.
- Existing street centrelines from `town.js`: z=−145,−99,−53,−7,39,85,131,177; east–west asphalt 9m visual width. Existing north–south avenues: x=(c−13)×26 for c=0,5,10,15,20,25, i.e. x=−338,−208,−78,52,182,312. Note x=52 is the only defined signalised crossing, at z=177.
- Existing `town.js` render-ground extent width=736m, depth=428m, plus an extra 400m plane in each dimension. The visual outskirts overlay uses 1100×950m and a slightly different y-level; test for visual z-fighting, layering and mobile GPU cost.
- `rail-corridor.js` defines track z=132m and six road crossings at the avenue x coordinates. **Critical:** the z=131 street and the z=132 railway are only 1m apart in source geometry. The rail is an explicit game corridor, not certified track clearance. Any new crossing or road redesign must resolve this with real model inspection.
- Proposed parcels: W-R1=9,460m² (0.946ha), W-R2=11,220m² (1.122ha), W-C1=10,120m² (1.012ha), E-B1=11,000m² (1.100ha), E-L1=14,080m² (1.408ha), E-R1=10,120m² (1.012ha), N-C1=20,700m² (2.070ha), N-R1=19,550m² (1.955ha), N-R2=18,400m² (1.840ha), S-R1=22,800m² (2.280ha), S-AG1=28,600m² (2.860ha), S-AG2=35,200m² (3.520ha). These are large **reserve polygons**, not small individual subdivided lots.
- All 12 rectangles are currently represented by tiles; the planned roads are six non-driveable strips. `planned-road-graph.js` and `town-planning-audit.js` expose road-strip connectivity and missing frontage without falsely asserting traffic routing.
- Existing address logic `addresses.js` uses `A1-S` for houses, `A7-N` for north-frontage infill and preserves historical `H:`/`B:` keys. Do not overwrite those with new street names.
- `town-origin.js` explicitly describes the Minore coordinate as **fictional** and the town as an alternate-universe settlement. Do not treat its cited lot-plan, geographic coordinate or RU5 fiction as permission to develop a real parcel.

## Spatial defects and severity

| ID | Severity | Evidence | Required resolution |
|---|---|---|---|
| TP-001 | P0 | North reserves start z=−252.5; north road ends z=−239.5: 13m gap | Realigned roads or dedicated legal-style frontage/access |
| TP-002 | P0 | West/east reserves begin at |x|=371; collectors end at |x|=354.5: 16.5m gap | Correct frontage/access road network |
| TP-003 | P0 | Southern R5 reserve begins z=245; south road ends z=239.5: 5.5m gap | Realign road or parcels |
| TP-004 | P0 | Roads are meshes only; no vehicle route or pedestrian navigation edges | Do not mark roads operational until route integration |
| TP-005 | P0 | Existing road z=131 and rail z=132 are almost coincident | Measure rail-road conflict, safety envelope and crossings |
| TP-006 | P1 | Parcel IDs lack valid street number, road name and verified public access | Separate provisional registry from legal-style addresses |
| TP-007 | P1 | Industrial/business edge near housing, no quantified noise/freight buffer | Reorganise service access and landscaped separation |
| TP-008 | P1 | Largest 'farm' only 3.52ha | Stream distant agricultural landscape rather than call it broadacre |
| TP-009 | P1 | All expansion zones conceptual, no LEP spatial overlay or utility/flood map | Keep unapproved planning-only status |
| TP-010 | P2 | Mobile performance, culling and road renderer layering unmeasured | Real browser frame-time and screenshot audit |
| TP-011 | P2 | No reliable traffic counts or intersection warrants | Test scenarios before signals/roundabouts |

## Alternative structure plans — illustrative multi-criteria analysis

Weights: safety 20%, walkability 15%, connectivity 15%, land-use compatibility 15%, housing choice 10%, rural realism 10%, infrastructure economy 5%, mobile performance 5%, backward compatibility 5%. Scores 1–5 are **expert hypotheses, not measured outcomes**. Weighted results are 0–5, not a compliance grade.

| Criterion (weight) | A: current edge strips | B: compact infill + two neighbourhoods | C: employment belt + rural transition |
|---|---:|---:|---:|
| Safety (20) | 1 | 4 | 3 |
| Walkability (15) | 2 | 5 | 3 |
| Connectivity (15) | 1 | 4 | 3 |
| Land-use compatibility (15) | 2 | 4 | 5 |
| Housing diversity (10) | 2 | 5 | 3 |
| Rural realism (10) | 2 | 3 | 5 |
| Infrastructure economy (5) | 3 | 4 | 2 |
| Mobile performance (5) | 4 | 4 | 3 |
| Backward compatibility (5) | 5 | 5 | 4 |
| **Weighted result** | **1.95** | **4.20** | **3.50** |

Sensitivity: increase rural realism weight from 10% to 25% and decrease walkability from 15% to 0%: B becomes 3.90, C becomes 3.80. The result is close; a combined B+C strategy may outperform both, but requires actual engineering and scenario tests. Do not interpret the score as evidence of statutory compliance.

## Preferred *conditional* concept: B + employment/rural safeguards from C

- **Town centre:** preserve existing buildings, high-street shops, historical pub and saved-game identities. Audit genuine vacant infill, do not assume a blank tile is buildable.
- **North:** connected, compact residential neighbourhood with smaller individual lots near schools/health/community services; include park, accessible walking network and safe routes to the centre. North expansion cannot be designed before verifying existing street/rail layout.
- **West:** family housing, small cottages, green corridor and park. Provide local street access rather than a collector as every driveway's only frontage.
- **East:** small business and light industrial precinct, with a dedicated freight/service route, buffers and no shortcut through quiet housing.
- **South:** low-density transition, horticulture and rural holdings; genuinely large farms should use streaming world tiles, not 220×160m plots.
- **Utilities and climate:** reserve drainage, water/wastewater, power, street trees, shade, emergency access and fire/rail setbacks before granting parcel buildability.

## Proposed implementation sequence

**Stage 0 — audit and safety:** keep roads/addresses marked conceptual; fix false 'road access' claims; record rail conflict; run baseline screenshot/build/traffic tests. **Stage 1 — spatial data:** replace visual rectangles with polygon parcels, boundary/frontage checks, road centreline graph, junctions and intersection IDs. **Stage 2 — connected network:** add local/collector roads connected to the core and pedestrian links, then vehicle routing, give-way rules, turning swept paths and crossing protections. **Stage 3 — addresses:** assign road names only after uniqueness checks; number according to NSW policy; retain legacy IDs. **Stage 4 — development:** subdivide serviced blocks into small/standard/large lots; construct uses with realistic buffers. **Stage 5 — rural tiles:** stream agricultural land with scalable render distance. **Stage 6 — acceptance:** CI geometry/graph/address tests, desktop/mobile Chromium, actual driving/walking, rail checks and live deployment verification.

## Testing and evidence limits

The new code includes `planned-road-graph.js`, `planned-addresses.js`, `town-planning-audit.js`, and `tests/town-planning-audit.mjs`. They expose deficiencies; they **do not fix connectivity**. No full traffic model, accessibility compliance audit, hydrological model, full build or browser QA has passed in this research pass. No official addresses, new signals or roundabouts have been assigned.
