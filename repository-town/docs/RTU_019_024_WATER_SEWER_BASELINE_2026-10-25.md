# RTU-019 / RTU-022 — Audited baseline: potable water, wastewater and stormwater

**2026-10-25 | source:** `repository-town/src/world/life.js` (main, 25 October 2026); `src/world/power-grid.js`; [234-site RTU-001 electricity coverage](../audit/electricity/coverage.json); [234-site water service inventory](../audit/water/building-service-inventory.json). This is an **audit**, not completion of RTU-019 or RTU-022.

## Verified observed runtime

- Water Works is town place ID `waterworks`, referred to in interior documentation as **J8**; wastewater place `sewage`, interior **L8**.
- `utilitiesHour`: waterworks stock initial **160 fictional units**; water production **25 fictional units per hour** only if waterworks electrical customer is powered and service exists, capped at **250 units**. Water need is `round(9 + (day?3:0) + homes.water)`; available water removed from same stock. Global `civic.supply.waterOk` flips by supply/demand, not property meter status.
- Wastewater collection adds `floor(got * 0.8)` synthetic units to a global stock. If `gridPowered('sewage')` and `this.ok('sewage')`, up to **22 units per hour** are removed and pollution decreases. >**70** backlog causes pollution/news events.
- These numerical units are **NOT litres**, plant capacities, observed Dubbo demand, sewer volume, compliant effluent or water quality. Their conversion requires a declared migration factor only after demand scenarios are redesigned.
- Existing electric graph has separate utility customers `waterworks` and `sewage`, no per-property water/sewer piping, no pressure zones, no recorded invert elevations, no rain/flood hydraulic graph. J8/L8 visual interiors are implemented as scenes but **not process solvers**.
- Existing [234-location power audit](../audit/electricity/coverage.json): 188 houses + 46 sites, of which 99 household demand models and 89 unmodelled lots; zero electrical individual service connections. The [water inventory](../audit/water/building-service-inventory.json) adopts their IDs and positions and **explicitly marks all 234 potable, sanitary, storm and recycled decisions unknown**. Unknown does not mean 'no service' or 'connected'.

## Reference approach and fidelity

NSWutilities uses **Dubbo Regional Council** as a strong, *documentary* combined water/wastewater reference. Council describes Macquarie River and South Dubbo borefield raw sources, John Gilbert WTP, reservoirs and wastewater plant monitoring. A Council notice on **8 September 2026** announced completion of an advanced wastewater treatment facility with *up to 700 ML/year* treatment capacity; at that report date approvals for reuse in dust suppression and concrete batching were **under way**, not established. **No public real-Dubbo pipe network is claimed** in Repository Town. The town is fictional with synthetic pipe geometry and separately recorded source provenance.

Detailed research and algorithms live in NSWutilities:
- [Water simulation architecture](https://github.com/joshualparris/NSWutilities/blob/main/docs/WATER_SIMULATION_ARCHITECTURE.md)
- [Water/electricity parity and source audit](https://github.com/joshualparris/NSWutilities/blob/main/docs/WATER_PARITY_AUDIT_2026-10-25.md)
- [30 numbered NSW-WAT research and implementation tasks](https://github.com/joshualparris/NSWutilities/blob/main/docs/WATER_IMPLEMENTATION_TASKS.md)
- [Deterministic reference model](https://github.com/joshualparris/NSWutilities/blob/main/src/water/water-core.mjs) — fast conservation/reachability **without computed pressure**.
- [Detailed gameplay / plumbing specification](WATER_AND_WASTEWATER_GAMEPLAY_SPEC.md)

## Traceable task alignment (no renumbering)

| Existing Repository Town task | NSW research/model tasks | Acceptance before marking RTU done |
|---|---|---|
| RTU-019 | NSW-WAT-005, -009, -011, -012, -014, -017, -019 | All building decisions, fixtures, treatment/storage, water demand and sources validated |
| RTU-020 | NSW-WAT-006, -007, -013, -014, -015, -016 | Working game routed mains, per-meter delivery, tank balance and pressure caveats |
| RTU-021 | NSW-WAT-023, -024 | Actual visual pipes/valves/meters and selected-property failure inspection |
| RTU-022 | NSW-WAT-005, -011, -012, -018, -019, -020 | Site invert/grades, fixtures, sanitary and storm separation |
| RTU-023 | NSW-WAT-007, -018, -020, -021, -022 | In-game sanitary finite volume, pump failures, surcharging/overflow, treatment destinations |
| RTU-024 | NSW-WAT-023, -024 | Visible sewer network and fault inspector, tested linked water meter/fixtures |
| RTU-029/030 | NSW-WAT-025…030 | Cross-fault, persistence, whole-town acceptance, real hosted playtest |

**Status:** RTU-019 to RTU-024 remain OPEN. Source audit and inventory are prerequisite evidence, NOT evidence that those gameplay tasks have been implemented. The new water reference tests are in a different repository and cannot be substituted for Repository Town integrated tests.
