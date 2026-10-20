# L8 Wastewater Works — researched regional sewage treatment facility

Date: 20 October 2026. This replaces Repository Town's generic **Wastewater
Works (L8)** interior, not the Water Works clean-water facility at J8.
Maintainer branch: `feat/wastewater-works-interior-20261020`.

## Real-world research and limitations

- **Dubbo Regional Council** explains that sewage treatment is licensed by
  the NSW EPA, with published monitoring of treated effluent at discharge and
  irrigation locations. Dubbo's treatment system includes inlet works,
  biological processes, chemical processes, biosolids and effluent disinfection.
  https://www.dubbo.nsw.gov.au/Our-Region-Environment/Water-Sewerage-and-Drainage/councils-water-and-sewer-obligation
  https://www.dubbo.nsw.gov.au/ArticleDocuments/444/FINAL%20Updated%2013%2007%202020%20-%20Drought%20Contingency%20and%20Water%20Emergency%20Response%20Plan%202020.pdf.aspx
- **Sydney Water** describes the broad wastewater sequence: screening and grit
  removal, biological aeration and clarification, tertiary processing, and
  disinfection where specified. Biosolids are managed separately from the
  liquid treated-water route; every site uses a different process train.
  https://www.sydneywater.com.au/education/wastewater-recycling/wastewater-treatment.html
  https://www.sydneywater.com.au/water-the-environment/how-we-manage-sydneys-water/wastewater-network/wastewater-treatment-plants.html
- Dubbo has commissioned an **advanced wastewater treatment** project for
  recycled-water applications, but this is not assumed to describe the exact
  equipment inside Repository Town's fictional L8 building.
  https://yoursay.dubbo.nsw.gov.au/advanced-wastewater-treatment-plant

All machinery, screens and gauges in this game are educational stylisations.
**Not a blueprint of Dubbo's STP, not a real treatment plant, not permit data.**
Plant equipment is covered/guarded and dangerous actions aren't playable.

## Layout

A purpose-built five-zone, single-level 14 m × 18 m walk-through:

1. Operations and monitoring: two-screen SCADA-like desk, process schematic,
   fault/alarm log, shift workstation and operator.
2. Sampling and compliance laboratory: contained sink, influent and effluent
   sample bottles, analytical instruments and monitoring information.
3. Preliminary inlet treatment: covered rake/bar screen, screenings equipment,
   grit removal vessels, odour containment and guard railing.
4. Secondary treatment: sealed illustrative aeration basin, blowers, clarifier,
   activated-sludge return and protective railings.
5. Biosolids/disinfection/reuse gallery: enclosed sludge-dewatering equipment,
   solids bin, final filters, disinfectant control cabinet, effluent/reuse
   monitoring and maintenance warnings.

The central 2.7 m marked visitor route never contains colliders. All hotspots,
room boundaries, safe staff stations, windows and the return exit are tested
using a player-sized margin and flood-fill route search.

## Real town data

The L8 monitoring hotspot presents `site.stock.wastewater` (simulated
inventory) plus `life.civic.indicators.pollution` and, when present,
`life.civic.supply.power`. These are read on entry to the room and explicitly
called **snapshots**, not realtime certified effluent data. The live Ledger
is accessible at three operator hotspots.

## Tests and acceptance

- `node tests/wastewater-interior.mjs`: standalone geometry, the full
  dispatcher, five zone identities, all fourteen interactions, scene-awareness,
  real town-data/empty-stock snapshots, all walking routes, staff and exit.
- `node tests/shop-interiors.mjs`: ensures L8 no longer falls back to generic
  shop furnishings.
- `npm run test:integration`: existing collision, residents, economy, multi-day,
  buildings, performance safety checks.
- `npm run build && npm run check:privacy`: verify public build integrity and
  no leaked private repository data.

Run manual browser checks on Android and desktop after deployed: enter
**Wastewater Works at L8 (south High Street, not Water Works J8)**, inspect
all five exhibit zones, use SCADA and monitoring panels, return via door.
No automated test alone proves the production deployment or visual playtest.
