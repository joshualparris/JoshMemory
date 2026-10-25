# RTU-003 / RTU-004 / RTU-005 — Repository Town's per-property electrical backbone

**Date:** 25 October 2026 (Australia/Sydney)  
**Status:** source-derived *synthetic design network* implemented and CI-tested. **Not** a live AC simulation or visually rendered electrical infrastructure.  
**Source data:** [RTU-001 234-site audit](../audit/electricity/coverage.json), [238k text source baseline](RTU_001_ELECTRICAL_AUDIT.md), [street geometry](../src/world/town.js), [existing address rules](../src/world/addresses.js).  
**Primary implementation:** [electrical-backbone.js](../src/world/electrical-backbone.js), [multi-utility contract](../src/world/utility-network-schema.js), [network JSON](../audit/electricity/design-network-v1.json), [source generator](../tools/generate-electrical-backbone.mjs), [fault + integrity tests](../tests/electrical-backbone.mjs).  
**CI:** [RTU-003-005 electrical backbone workflow](../../.github/workflows/rtu-003-005-electric-backbone.yml).

## What each permanent RTU task delivered

- **RTU-003 — building service registry:** 234 source-recognised H:/B: sites; **188 house lots** and **46 other sites**. 233 sites have stable unique `SVC:`, `MTR:`, `SWB:` IDs and a *design_connected* status, position, side of street, selected phase, nominal supply and preliminary connected kVA. **B:square** (Market Square) is an open park, not an enclosed premises: `not_required`, reason documented, with future independent public-lighting circuits under RTU-011/012. **89 existing uninhabited house lots still get wiring:** lack of a worker model never means a building has no electrical service. The existing H:/B: IDs and north/south addresses remain unchanged; no new buildings added.
- **RTU-004 — versioned common network contract:** `schemaVersion:1`, domain `utility`, units, nodes (typed assets, state, positions), edges (from/to, route, length, capacity, isolator state, condition), per-property metering and source trace; pure [common validator](../src/world/utility-network-schema.js) is reusable for water, wastewater and gas. Strictly radial in version 1 (explicit loop rejection), with domain-specific electrical voltage/phase/transformer guards layered on top. Machine tests include a water graph and invalid units, orphan edges, missing ID, duplicate meters and cycles. This does **not** mean the water/sewer/gas hydraulic simulators are already implemented.
- **RTU-005 — complete source-to-service topology design:** fictional external 66 kV supply, zone transformer 66/22 kV, main feeder access via the existing **Power Station at H9-N (B:power)**, street 8 road centre and **east/west 22 kV trunks**, vertical main-road avenue spines, transverse street taps, **22/0.4 kV local transformers**, low-voltage curbside mains, overhead (houses) or underground (civic sites) service cables, meter and switchboard. Seven larger essential/industrial/educational sites are routed through **dedicated transformers** rather than sharing a small-shop transformer.

## Physical routing chosen (actual game-coordinate roads, synthetic electricity)

The game's [town.js](../src/world/town.js) creates 8 east–west street centre lines:
`z=-145,-99,-53,-7,39,85,131,177`. It creates six north–south road-avenue centres at `x=-338,-208,-78,52,182,312`.

At design stage we place:
1. Conceptual **external NSW regional grid** at 66kV — there is *no fictional surveyed line to the game's world boundary*.
2. **Zone transformer/intake in the existing Power Station site**, `B:power` `H9-N` with real scene doorway `(-143,184.5)`. The proposed underground access goes to existing road-8 centre `z=177`. **This is a chosen game-world connection point, NOT proof the existing diesel microgrid is really connected to a Transgrid supply.**
3. Two directional 22kV trunks along road 8; onward radial branches run only along *existing* six north–south road alignments from row 8 to row 1.
4. Each street gets **four street-transformer clusters**, whose 22kV spur follows its row's road centre to a kerb-side 22/0.4kV transformer.
5. A low-voltage main runs along the north verge, with a documented **subsurface road-crossing duct** to supply south-frontage sites in row 9. Each house/sited property gets a separate tap, service, meter and switchboard. No imaginary row-9 or row-11 roads are used.
6. High-demand sites (clinic, waterworks, wastewater works, foundry, soy plant, mill and university) have **dedicated 22kV spur, transformer and switchboard**. Single-phase A/B/C houses alternate by column; shops and dedicated facilities default to three-phase, **explicitly assumed**, not surveyed.
7. Service tap uses the known **lot x coordinate** and the original recorded door position; south-site centres that were never surveyed remain **null** rather than invented. Only the frontage and conceptual meter location are synthetic.

There is no need for the game to know the real Menindee street-level electricity network to draw a *clearly synthetic but physically plausible NSW-like* design. [NSWutilities research](https://github.com/joshualparris/NSWutilities/blob/main/docs/NSW_ELEC_003_VERIFIED_TOPOLOGY.md) verifies regional voltage examples, not this fictional town's installations.

## Design load and ratings — initial **assumptions**, not measured results

- Modelled existing lot: **5 kVA** assumed connected, house single-phase 230V; uses 0.40 coincidence/diversity for indicative transformer sizing.
- General commercial site: **18 kVA** connected (farm **24 kVA**), three-phase 400V. Real peak must be derived from inventory/appliances under RTU-006.
- Larger sites: explicit **45–180 kVA** connected placeholders, matching the intent of large pumps, clinical refrigeration, ovens, motors and other uses. Not an actual electrical survey or nameplate record.
- Transformer: **100, 160, 315, 500, 630 or 1000 kVA** representative catalogue steps; rated >= 120% of initial estimated *coincident* connected loads. Standard sizes and actual equipment models must be source-verified under RTU-008, then recalculated when RTU-006 demand data exists.
- Generic conceptual LV main **400 A** and typical residential service **80 A**, three-phase service **250 A**, with dedicated high-demand circuits **400 A**. Actual cable conductor, voltage drop, protective device settings, fault levels and coordination are **not yet engineered**, and must not be inferred from topology reachability.
- The 66/22kV town intake is provisionally **5 MVA** and 22kV trunk edges **160 A**. Treat as illustrative until a full peak load and protection check under RTU-006/007/008/012/013.
- Game coordinates are used as **approximate route lengths in game metres**. No underground services are surveyed. The design never claims official Essential Energy pole position, substation, trench depth or feeder ownership.

## Tests and evidence

Automated test [electrical-backbone.mjs](../tests/electrical-backbone.mjs) runs:
- All 234 sites accounted for, stable IDs and exact audit-match with 188 H houses + 46 B sites; every intended meter has a **source → 66/22kV → 22kV MV → 22/0.4kV → LV → tap → service → meter → switchboard path**.
- Synthetic 22kV street/avenue paths follow the game's actual existing road centre coordinates; no created row-9 road.
- Every physical edge's endpoints are known, source topology is radial, all IDs unique, route points finite, phase/voltage transitions explicit and no transformer initially exceeds its declared diversified design rating.
- Disconnect incoming line → no site supplied; disconnect pub's service → bakery remains supplied; trip pub's serving transformer → unrelated rows remain supplied; dedicated facility transformer failure → pub unaffected.
- Intentionally corrupt data to verify **orphan endpoints, duplicate edges/meters, wrong source IDs, bad addresses, opened breaker, bad utility units and directed cycles are rejected**.
- All outcomes deterministic when rerun from the same RTU-001 source records.
- Legacy ten-edge power-grid tests and the full Repository Town JS bundle are retained in CI; **this extension does not silently replace the existing game power demand/lighting runtime**.

Run from the repo root:

```bash
node repository-town/tools/generate-electrical-backbone.mjs
node repository-town/tools/generate-electrical-backbone.mjs --check
(cd repository-town && node tests/electrical-backbone.mjs && node tests/power-grid.mjs && npm run build)
```

## Current acceptance / explicit handoff

**Implemented:** RTU-003 physical *design* service registry, RTU-004 schema contract and pure validation, RTU-005 complete source-to-all-service topology and spatial road routes, including high-demand dedicated transformer branches. The source-derived machine-readable design snapshot is committed, testable and versioned.

**Not yet implemented / do not overclaim:**
- **RTU-006** believable time-varying appliance-by-appliance/site loads, occupancy and transformer re-sizing.
- **RTU-007** actual kW/kvar/load flow, voltage drop/losses, overload/load-shed, feeder fault behaviour in **the live game**.
- **RTU-008** actual conductor/transformer/manufacturer variants and protection data.
- **RTU-011** visible substations, poles, sagged wires, LV drops and underground conduit visuals (including collision-safe placement).
- **RTU-012** wiring individual bulbs, ovens, pub refrigerators, air con, computers and water/sewer pumps to the new per-property service.
- **RTU-013/017/018** real source-backed fault restoration, full gameplay/mobile acceptance and public deployment.

**Preferred next steps:** RTU-006 + RTU-007 demand/dispatch and protection-aware simulation, then RTU-011 and RTU-012 3D assets/appliance gating. For human visible playtesting, finish a complete electrical path to **Railway Hotel (B:pub, N8-S)** and neighbouring shops, simulate outages selectively, then extend row-by-row; the present design already provides the required mapping for all addresses.
