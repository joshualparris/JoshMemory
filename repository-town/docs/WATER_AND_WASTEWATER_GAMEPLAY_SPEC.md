# Repository Town: executable design for the water and sewer journey

**Target:** same evidence, per-building detail, deterministic faults and realistic visible behaviour as the electricity programme. All physical routes and pipe counts proposed below are **fictional fixtures**, not actual Dubbo asset geography. The present runtime still uses hourly stock units.

## Game model interactions

**Raw water:** fictional river intake/bores -> strainer/raw pumps -> treatment line at Water Works **J8** -> clearwater storage -> pressure-zone distribution. Actual Dubbo analogue: Macquarie River, borefield, John Gilbert WTP and service reservoirs (see Council references in baseline audit). Keep raw-water availability/capacity and treatment throughput separate, with energy and waste streams.

**Potable distribution:** model routed mains and metres, isolation valves, zone/service pressures only when validated via EPANET fixture; near-term show water available/blocked/unknown. Gravity reservoirs can serve houses without electricity while stored water lasts. Powered high-lift/booster pumps require power-grid asset links. Each metre has explicit demand, delivered volume, unresolved connection flags and outage event. No street level hidden connections automatically assumed.

**Inside every modelled building:** stop valve -> water meter/backflow device where applicable -> branch supply -> cold taps/fixtures; hot water heating uses electricity or chosen gas/LPG and **does not create water**. Washing machine/bath/shower/sink consume finite volume. Toilets have **cistern storage** and refill rate: flush discharges the current flush volume to the sanitary network and cistern refills according to remaining service flow and pressure state. During main failure, a full cistern may flush once, but a dry cistern cannot continue indefinitely. A clogged toilet is not equivalent to a city-wide failed treatment plant. Vent/trap models must avoid fictional open sewage vents into interiors; basements/pump-assisted fixtures are separate.

**Sanitary drainage:** fixtures → traps/vents → building drain → boundary connection → gravity sewer lateral → manholes → sewer main → catchment/outfall/lift station where invert grade is insufficient → rising main → **L8 Wastewater Works**. Toilets, showers, basins, laundry contribute with distinct return fractions; gardens/irrigation ordinarily *do not* contribute to sanitary flows. A blocked segment backs up only its upstream catchment; unaffected gravity drains still work. Sewer service gravity works in a power failure unless a pumping requirement exists. Sewage pump outage: wet well fills, surcharge/overflow must appear as **tracked volumes**, then needs safe game restoration.

**Treatment L8:** inlet screens/grit -> documented fictional biological/clarifier stages -> disinfection if site process requires -> monitored environmental discharge; biosolids separately managed. New advanced recycled-water train is optional and **separate from potable**. The actual Dubbo plant completed 8 Sep 2026 was described as capable of up to 700 ML/year but approval for initial non-potable end uses still in progress; game may represent a separately authorised **fictional** use, never assert actual approved connection.

**Rain/stormwater:** roof gutters and street pits → drains/culverts → detention/creek/floodplain. Use `rainfallMm × effectiveM2` litres before runoff fraction; sanitary I&I occurs only where a defect/illicit connection is specifically modelled. No invented NSW combined sewer or potable cross-connection.

## Common type/interface contract

Each asset `{id, layer, worldX, worldZ, groundElevationM?, invertElevationM?, kind, status, provenance:{class,source,date}}`. Each building `{buildingId, waterMeterId?, sewerLateralId?, stormConnectionId?, serviceDecision, demandProfileId?, fixtures?, occupancy?, pressureState:"not-solved"|...}`; no null meter silently treated connected. Water simulation tick must receive immutable electric state before pumps update, then deliver water, generate individual sewer flows, route through sanitary model and publish snapshot. Use separate graphs/ledgers for raw, nominal-potable, sanitary, recycled and storm. Pure API and deterministic save/load versions required.

**Units:** water volume litres, flow litres/hour, rain mm, area m², sewer invert grade m/m, hydraulic head m, electric power kW and energy kWh. Never reinterpret `life.js` unitless stock `25/250/22` as real litres or licensed flow.

## Scene/UI acceptance

- J8 shows different intake status, pumps, current tank levels, filter/treatment status and real source of power. L8 shows flow through headworks, wet well, treatment and discharge destination; no recycled-water pipe feeding houses without a separate authorised game network.
- Utilities overlay `Water` reveals *only* potable mains/valves/pumps/metres; `Sewer` reveals separate gravity drain/lift stations/treatment; `Storm` later reveals distinct pits/gutters/culverts; `Off` hides all. Do not place render meshes through building interiors or across walkable doors; both physical and sim asset IDs match.
- Household UI shows requested vs delivered service, cistern volume/refill, shower status, sanitary outlet and why something stopped. Accessible explanatory text rather than only colour changes; mobile camera tests.
- Simulated boil-water/contamination notices may appear only as authority-driven quest/event flags, not generated from simplistic chlorine proxies or used as actual health advice.

## Actual acceptance scenarios for implementers

1. Waterworks electricity goes out, full elevated tank still supplies gravity-fed houses until depleted; no phantom refill.
2. Town water main bursts, isolate valve: affected services lose water, parallel supply/unaffected zone keep working. Leak litres logged.
3. A toilet with a full cistern flushes once during water outage and does not refill without delivered water; waste must travel along open sewer path.
4. L8 loses electric supply: gravity sewage still reaches wet well, which fills; when full overflow is logged, never silently deleted.
5. Block sewer lateral: only upstream customers experience backup; downstream unaffected. Repair restores with finite crew/material cost.
6. Intense rainfall increases storm drain load; sewer only gets explicit I&I; neighbouring dry homes unaffected by invented wastewater.
7. Reuse pipe fails permission gate and cannot carry potable water; no cross-connected networks.
8. Every one of 234 world asset candidates classified; private/unserved/not-required can be legitimate, unknown must be flagged and not silently connected.
9. Deterministic 24-hour water/sewer energy and mass ledgers, save/reload mid-pump fault and day/night demands.
10. CI + actual deployed hosted desktop/Android walk-through, inspect J8, L8, household cistern, live meters and overlay. **No acceptance without screenshots/logs and source SHA.**

## Safety/engineering disclaimer

This is a computer-game design. EPANET is appropriate for independent *water hydraulic* benchmarks and SWMM for sewer/stormwater. The fast reference engine in NSWutilities deliberately calculates only reachable routes and conserved volumes, **not** water safety, pollutant compliance, sewer hydraulic grade or pressure. Any real plumbing must follow applicable NSW code, be undertaken by qualified professionals, and must never use this game spec as construction guidance.

## Primary sources
- https://www.dubbo.nsw.gov.au/Our-Region-Environment/Water-Sewerage-and-Drainage/councils-water-and-sewer-obligation
- https://www.dubbo.nsw.gov.au/news-and-media/news-and-resources/council-news/2026/water-security-a-reality-with-completion-of-advanced-wastewater-treatment-plant
- https://www.health.nsw.gov.au/environment/water/Pages/water-utilities.aspx
- https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/plumbers-and-drainers/standards-and-notes
- https://www.epa.gov/water-research/epanet
- https://www.epa.gov/water-research/storm-water-management-model-swmm

## Coordinated sewer ownership

The detailed [RTSW research](https://github.com/joshualparris/NSWutilities/blob/main/docs/SEWERAGE_RESEARCH_2026-10-25.md) and [RTSW queue](https://github.com/joshualparris/NSWutilities/blob/main/docs/SEWERAGE_TASKS.md) **supersede this brief for sewer-engine implementation detail**. RTSW uses Narromine as the focused sanitary treatment reference; the present document uses Dubbo for the source-to-tap and municipal utility context. Assign RTU-022–024 implementation only once, via RTSW ownership and COORDINATION. The NSW-WAT synthetic aggregate `sewageGeneratedL` must be switched off when real fixture-event driven sewer ledger arrives. No phantom double sanitary flow from the legacy `floor(got*0.8)`.
