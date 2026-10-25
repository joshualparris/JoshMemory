# Whole-town utilities implementation plan
PUBLIC project engineering plan. 25 October 2026. Canonical source: JoshMemory/repository-town.
Status: RTU-001 source/runtime audit complete; no new utility runtime deployed. See [audit evidence](RTU_001_ELECTRICAL_AUDIT.md).
Execution order is the numbered order below; IDs are permanent. Next: RTU-002, then RTU-003.
Preserve existing power-grid tests, economy, saves, lighting circuits and other agents' claims.

## Baseline audit (RTU-001 completed)
Inspected src/world/power-grid.js and utility wiring in life.js at 19a13fe.
Electricity: ten directed edges; seven aggregate customers (clinic, waterworks, sewage, bakery, industry, west/east homes). Integer fictional units, not kW/kWh. Capacity/fault accounting exists; every individual building is NOT connected.
Water/sewer have stock/production dependencies in life.js; a physical pipe graph, per-property water balance, pressure and sewer gradients require separate verification.
Gas has no audited distribution model. Do not infer piped natural gas availability from electricity fuel stocks.
Lighting already has power-aware circuits; these must use the eventual building service connection rather than a global percentage.
The completed RTU-001 audit now covers all 234 registered locations, controlled fault/save probes and lighting scene inspection; see [report and evidence](RTU_001_ELECTRICAL_AUDIT.md). New utility implementation and hosted gameplay verification remain open.

## Research and design decisions
Cities: Skylines II distinguishes electricity and water infrastructure and treatment; borrow readable service overlays and bottlenecks, not automatic fictional connections.
Factorio's fluids redesign explicitly trades local fluid physics for connected segments. Use deterministic graph simulation for browser performance but preserve capacities, storage, dependencies and explicit isolation.
NSW-inspired electricity: external NEM supply -> town zone substation -> chosen medium-voltage feeders -> distribution transformers -> low-voltage mains -> individual service cable/meter/switchboard. Final voltage, transformer sizing and routing are engineering assumptions to validate, not a claim about Dubbo's actual network.
Coal/gas/hydro/wind/utility solar belong in a documented external supply scenario unless terrain and infrastructure justify a local plant. Imports have a declared scenario mix, not fabricated live AEMO values; electrons are not traced by fuel to a house.
Power in kW, energy in kWh, transformer ratings in kVA, interval in simulated hours; document power factor/loss approximations. Aggregate buildings downstream while preserving individual connections.
Rooftop PV depends on roof area, azimuth/tilt, irradiance/weather, inverter clipping and export limit. No PV at night. Grid-following solar must disconnect during outages unless a validated island-capable battery/inverter supplies isolated local loads.
Batteries conserve stored energy with charge/discharge limits, efficiency, reserve and no simultaneous charge/discharge. Never silently energise a dead street from a house.
Equipment catalogue separates verified datasheet fields, illustrative installation assumptions and unverified products. Initial candidates: Trina Vertex S+ TSM-NEG9R.28 (up to 450 W family); Tesla Powerwall 3 Australian variant; Prysmian Australian LV cable families. Pin exact variants, dimensions and ratings before rendering/sizing. Do not assign manufacturer branding to generic poles or invented equipment.
Water: source -> raw storage/pumps -> treatment -> clear-water storage -> pressure zones -> meters/buildings; track litres, flow, elevation/pressure approximation and quality.
Sewer: per-building discharge -> gravity mains/manholes -> lift stations where required -> treatment -> reuse/discharge; wastewater is not potable water. Track capacity, blockage/overflow and pump outages.
Gas: choose documented fictional town reticulation or LPG deliveries per property. Include regulator capacity, flow/energy units, stock, shutoff and appliance dependencies. No invented requirement to pipe gas to all buildings.

## Ordered tasks and acceptance
Each task is open unless explicitly checked with evidence. Reserve file paths on COORDINATION before code changes.
- [x] RTU-001 Audit full current runtime, all building sources, utility consumers, saves, overlays and existing tests; publish reproducible coverage/gaps. COMPLETE: [234-location source/runtime audit](RTU_001_ELECTRICAL_AUDIT.md), generator and validation evidence.
- [ ] RTU-002 Finish sourced comparison of at least three simulation games and NSW electricity/water/sewer/gas practices; annotate deliberate simplifications and exact equipment datasheets.
- [ ] RTU-003 Generate authoritative building service registry from actual house/civic/farm inventories, stable IDs and coordinates; every building has connected/not-required/off-grid status with reason. Gate missing/duplicate/orphan IDs.
- [ ] RTU-004 Specify versioned common network schema: nodes, routed edges, capacities, units, assets, conditions, isolation, service meters; pure validator and invalid fixtures.
- [ ] RTU-005 Choose and document town intake location and external generation scenario, MV voltage/feeder routes, transformers and LV circuits; prove every required building has a path. No hydro without hydrology.
- [ ] RTU-006 Replace grouped demand with per-building time/use/occupancy profiles and declared peak/diversity assumptions; preserve legacy adapter until migration verified.
- [ ] RTU-007 Implement deterministic electrical dispatch, imports/export, edge/transformer limits, losses and unmet demand; reconcile energy each timestep. Document simplified voltage-drop model.
- [ ] RTU-008 Add exact sourced equipment catalogue: modules/inverters/batteries, conductors, transformers, switchgear/meters; retain source URLs, variant, units and uncertainty. Ratings must match installation assumptions.
- [ ] RTU-009 Place PV only on suitable roofs; implement weather/orientation generation, inverter/export constraints and daylight tests.
- [ ] RTU-010 Implement battery storage, reserve, losses, islanding/anti-islanding and restore tests with conserved energy.
- [ ] RTU-011 Render substation, poles/crossarms/insulators, sagged overhead spans or routed underground cables, transformers, property service drops/meters, rooftop panels and battery cabinets; no lines through rooms, road obstacles or duplicate streetlights.
- [ ] RTU-012 Connect each building's lights, pumps, production, fridges and relevant appliances to its actual supplied service; distinguish essential backup circuits.
- [ ] RTU-013 Implement feeder faults, protective isolation, overload response, repairs and restoration without generating money/energy; unaffected circuits stay supplied.
- [ ] RTU-014 Add Utilities toggle with mutually exclusive Electricity/Water/Sewer/Gas/Off views; dim unrelated geometry, reveal selected underground network, show legends/direction/capacity/status and selected property path.
- [ ] RTU-015 Add electrical inspector: current demand/generation/import/export, transformer loading, battery SOC, source assumptions and outage causes; colourblind-safe labels and mobile controls.
- [ ] RTU-016 Migrate old saves deterministically; preserve funds, inventory, property, energy state and schema version; corrupt data fails safely.
- [ ] RTU-017 Run electricity acceptance: every building, night/dawn/cloud, peak load, blackout, PV islanding, storage depletion, partial feeder repair, 28-day conservation and reload equivalence.
- [ ] RTU-018 Publish tested public electricity release through existing pipeline; build/privacy gate, exact source SHA/fingerprint, hosted desktop/Android overlay and actual appliance outage checks. Only then mark electricity complete.
- [ ] RTU-019 Audit water source/treatment/storage assumptions and assign every building water demand/meter; research NSW-specific treatment and pressure references.
- [ ] RTU-020 Implement routed water graph, tanks/pumps/pressure zones, mass balance, leaks, isolation and power dependency with potable-quality state.
- [ ] RTU-021 Render water assets/meters/valves and wire Water overlay/inspector; verify per-property outage and restoration.
- [ ] RTU-022 Audit elevations and wastewater generation; design gravity sewer/manholes, lift stations, treatment and stormwater separation.
- [ ] RTU-023 Implement sewer mass balance, storage, treatment limits, blockages/overflow and powered lift stations; no wastewater disappearing.
- [ ] RTU-024 Render wastewater assets and Sewer overlay/inspector; per-building discharge and cross-utility fault tests.
- [ ] RTU-025 Research regional gas/LPG applicability and equipment; explicitly choose connected customers and non-gas properties.
- [ ] RTU-026 Implement chosen gas/LPG source, regulators, pipes or finite delivery stocks, demand/shutoff and electrical dependencies; conserve mass/energy.
- [ ] RTU-027 Render gas assets and Gas overlay/inspector; verify leakage/fault abstraction and individual appliance effects.
- [ ] RTU-028 Add playable maintenance inspections/jobs using real network faults and finite parts/pay, accessible explanations and saved consequences; coordinate existing quest owners.
- [ ] RTU-029 Integrate all utilities with economy and town ledger; cross-fault scenarios (electricity -> pumping -> water/sewer), recovery and performance budgets.
- [ ] RTU-030 Final whole-town inventory reconciliation, desktop/mobile playtest, privacy/save/regression gates and live release evidence; record remaining simplifications.

## Sources reviewed / next research
- https://www.paradoxinteractive.com/games/cities-skylines-ii/features/electricity-water
- https://factorio.com/blog/post/fff-416
- https://factorio.com/blog/post/fff-260
- https://www.aemo.com.au/energy-systems/electricity/national-electricity-market-nem/about-the-national-electricity-market-nem
- https://www.aemc.gov.au/energy-system/electricity/electricity-system
- https://www.essentialenergy.com.au/-/media/Project/EssentialEnergy/Website/Files/Partners/DA-guide.pdf
- https://www.evoenergy.com.au/-/media/Project/Evoenergy/EVO/Documents/Manuals/PO07132-Overhead-Line-Distribution-Design-Manual.pdf (ACT comparator, not NSW authority)
- https://static.trinasolar.com/sites/default/files/230531_Datasheet_Vertex%20S%2B_NEG9R.28_EN_2023_B_web.pdf
- https://energylibrary.tesla.com/docs/Public/EnergyStorage/Powerwall/3/InstallManual/BackupGateway/2/en-au/GUID-168E141F-1B5E-4582-8115-32C1E63E344A.html
- https://australia.prysmian.com/sites/australia.prysmian.com/files/media/documents/TechCG_2015-AU-v4_LOWRES.pdf
Research is preliminary, not the full three-game/all-utility audit. Task RTU-002 closes that gap before sizing implementation.

## Handover
Next concrete action: RTU-002 primary-source and open-code comparison, then RTU-003 operational per-building service registry using the RTU-001 audit. No runtime files modified here; no deployment required for documentation. Existing RTD/RTN/RLT IDs remain unchanged.

