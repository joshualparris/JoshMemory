# Repository Town — causally realistic infrastructure

**Design basis:** user-supplied Replit `repository-town-realism-upgrade-pack.zip` (19 October 2026): current-state audit, staged realism roadmap, simulation contract and isolated reference tests. Its sample code is *not* silently pasted over the existing game.

## What realism means

Repository Town is a fictional Australian-style regional town with 188 repository houses and a smaller simulated resident population (38 in the town test fixture). It is **not** a digital twin of Dubbo. The target is a model in which each important outcome has an explicit cause, responsible actor, capacity, location/service area, time, traceable impact and recovery. Exact human behaviour, electrical engineering, water hydraulics, legal processes, weather and economics remain bounded approximations.

The full model cannot be implemented as one safe code change. Keep `src/world/life.js` the single pure-simulation source and `src/world/townlife.js`/UI as readers; proceed by tested vertical slices.

## Baseline corrections

- **Game clock:** 24 simulated hours = 1,440 in-world minutes. At 1×, `SEC_PER_MIN=3` real seconds per town minute = **72 real minutes per town day**, not 24. Speed multipliers are separate. Do not change day length as a side-effect of adding civic systems.
- **Save:** `TownLife.snapshot()` now emits nested `saveVersion:2`, with power feeder state (in `civic`), its event sequence and last 80 power events. The surrounding browser storage wrapper remains `v:1` for backward compatibility. Historical wrapper-v1/simulation-v1 saves restore without being cleared, including the midnight (minute 0) case. Do not silently reset players' towns.
- **Existing model:** farms, mill, bakery, townspeople, businesses, mail, council, power generation and high-street visualisation remain. All existing public/private safeguards and live game controls must be preserved.

## Completed first vertical slice: electricity distribution

Added `src/world/power-grid.js`: ten named directed connections between the power generator, main junction, critical-service bus, commercial bus, west/east residential feeders and their customers. All quantities are **integer fictional power units per simulated hour**. The solver allocates finite power in deterministic customer priority order and exposes each edge's `flow`, `capacity` and `failed` state, together with per-customer `demand`, `served`, `unserved`, `path` and `status`.

The ordering gives the clinic, pumps and wastewater treatment first access, then homes/bakery, then industry. These are declared gameplay policy priorities, **not actual Australian network operating rules**. Demand currently uses a small declared model (16 facility units + variable household units), not real kWh data. The solver conserves generation and enforces per-line capacities but **is not an AC power-flow or electrical-safety solver**. It does not yet model storage, transformer impedance, load shedding, voltage or geographical cables.

`TownLife.utilitiesHour()` still generates solar/thermal electricity and burns fuel, but now routes its generated power via the network. A west feeder fault isolates west homes while the east neighbourhood, clinic, bakery, water pumps and wastewater station remain connected. A waterworks feeder fault prevents pump refilling; a sewage feeder fault prevents treatment and can raise creek pollution. The bakery/mill and foundry use their own customer allocation instead of a single town-wide boolean.

The council training action `faultPowerLine('west-feeder')` creates a discrete recorded fault, and `repairPowerLine` consumes **$90 + 2 spare-part boxes** if available. Both update the canonical grid immediately and append an incident with monotonically increasing ID, town day, minute, actor, location and cause; shortage/restoration messages enter the town's event log. This instant-repair action is a simplified first iteration, **not a model of dispatch, travel, staff, procurement or timed work orders**.

The Town Ledger, Town Hall and Power Station read that one network result: supply by customer, named failed feeders, line flows/limits and council repair controls. A west-feeder *training scenario* is deliberately labelled as simulation. A localised interruption no longer automatically turns off all rendered town lighting; **individual house-window blackout rendering remains future work**.

## Verification

From `repository-town/`:

```bash
npm run test:town
npm run check
npm run build
npm run check:privacy
node tests/e2e.mjs --only W7,X7
```

The first command runs both the original 14-day town simulation and `tests/power-grid.mjs`. The focused tests verify healthy supply, partial generation, edge capacities, west-only isolation, essential service priority, pumping/sewage dependencies, funded repairs, event IDs, deterministic action replay, save/load fault persistence and v1 save migration.

### Work remaining — do not call these finished

1. **Simulation invariants:** fixed logical step and replay log independent of frame rate, save RNG state, guard invariants/atomic operations, integer-subunit financial journal (the existing wider economy still uses floating-point dollars).
2. **Physical utilities:** connect household locations to feeder zones, underground water/sewer/stormwater graphs with flow, storage and leaks, finite repairs with dispatch/road access and route-aware crew status.
3. **Goods and transport:** batch IDs, expiry, conservation through farm → mill → bakery → truck → retailer; staff, vehicles, fuel and traffic constraint in one coherent chain.
4. **People:** NPC position, worksite, health and household demand reconciled against the same simulation state, not separately scripted claims.
5. **Institutions and environment:** genuine staffing and capacity for school/clinic, emergency incidents, waste/recycling and town governance; weather and climate hazards with warnings and response.
6. **Interface and validation:** geolocated utility map overlays, line click-through, 2D accessible fallback, non-destructive export/import, desktop+Android headed tests, performance budgets.

Do not imply that the first electricity graph solves every other civic or economic realism gap. Avoid copying fictitious units into any real engineering guidance.
