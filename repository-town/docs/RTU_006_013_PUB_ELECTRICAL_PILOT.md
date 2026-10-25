# Railway Hotel-style electricity pilot — RTU-006/007/011/012/013/015

**25 October 2026.** Active physical-grid *gameplay pilot* for **The Merged Branch (B:pub, N8-S)**, nearby shops and row-7 houses. This is NOT a claim that every building's consumption and electrical protection have been fully modelled, or that the fictional town is connected to actual Menindee/Dubbo power infrastructure.

## What is actually implemented

- **16 actual game-property service IDs**, from the previously published [full 234-site synthetic RTU-003/004/005 network](../audit/electricity/design-network-v1.json): B:pub, **B:hotel (the actual Railway Hotel at I9-N)**, B:post, B:school, B:butcher, B:greengrocer, B:bakery, B:cafe, B:store and **seven real northside house lots H:K7–H:Q7**.
- **Real design topology reused without new arbitrary shortcuts**: 4 source-connected 22kV/LV transformers, 68 directed physical design edges, 69 graph nodes; taps and service meters uniquely matched to RTU-005.
- **Deterministic demand curves** per property type/clock/weather: pub refrigeration and dining/kitchen peaks, bakery early production, shops, school, variable household evening loads. kW demand and kWh meters are *estimated engineering analogues*, not consumption measurements.
- **Selectable pub electric equipment**: mains-only, mains + 6kW rooftop solar, or mains + 12kW rooftop solar and a 13.5kWh/5kW battery-inverter. Roof PV is zero at night and does not create a live street island. Battery is a limited single-property *essential circuits* backup, with conserved SOC/kWh, not a whole-kitchen or district generator.
- **Local faults affecting the real pub utilities model**: trip the pub service and its entire kitchen fails while independent businesses remain powered; trip a transformer and only its downstream commercial or residential group loses mains. Trip the common intake and all pilot sites lose mains. Restore each breaker independently.
- **Visible wiring**: exterior house service-drop conductors and poles plus an optional **underground X-RAY overlay**, registered curbside transformer cabinets, meter boxes that change colour according to supply and outage, and individual illuminated shop windows/house windows. These are design visualisations; their exact conductor geometry, sag, trench/switch room details remain non-surveyed.
- **In-game UI**: always-available **⚡ Grid** button; physical inspector with 16 demand/meter records, demand/import/generation/unserved/loss estimates, transformer details, equipment controls, outage toggles and reset; also linked from pub utility meter interactable.
- **Save persistence**: pilot faults, selected equipment, energy totals and state of charge stored within existing `life.civic` snapshot, validation rejects malformed values. Legacy seven-group grid and saves remain compatible.
- **Tests**: [pure deterministic tests](../tests/electrical-pilot.mjs), existing [full 234-property source network tests](../tests/electrical-backbone.mjs), legacy grid/public lighting/pub tests, and [real Chromium desktop + narrow viewport playtest](../tests/electrical-pilot-browser.mjs) with [CI screenshots](https://github.com/joshualparris/JoshMemory/actions/workflows/rtu-006-013-pub-grid.yml) when completed.

### What happens if you play at the pub

1. Visit **The Merged Branch** (`B:pub` / N8-S) and use its utility cabinet, or click the fixed **⚡ Grid** control on the right of the game view.
2. Turn on **Show wiring overlay** to see the existing row-8 22 kV conceptual underground alignment, LV transformer supplies, every pilot meter and above-ground house service conductors.
3. Trip **pub service**. Its whole-bistro mains lighting and kitchen go out. The Post Office, bakery and independent house circuits remain live.
4. Restore the pub. Trip **pub/post/school transformer**. All three commercial services go off; bakery/general shops remain on.
5. Trip **northside houses transformer**. Only the northern group (N7–Q7) goes off; houses K7–M7 remain on.
6. Install solar + battery (explicit *demonstration* equipment) and trip pub service. Essential backed loads work until the battery discharges; kitchen still cannot run. Advance time to see depletion and kWh meter changes.
7. Reset the pilot to restore normal supply. Check the visual windows and meter indicator.

**Important:** The pub within the game is named **The Merged Branch**. The separate **Railway Hotel** at I9-N is **also individually connected**, with its own meter and breaker. The two businesses are not the same physical site.

## Explicitly unfinished for the entire town

- **RTU-006**: credible property-level profiles for the remaining 218 source-registered sites, with measured appliances, demand coincidence and seasonal validation.
- **RTU-007/012**: migrate *all* operational game consumers from the legacy ten-edge/seven-aggregate model to physically correct service paths, voltage/phase and signed P/Q powerflow; stop using fallback whole-town positive-power flags for excluded non-pilot sites.
- **RTU-008/011**: source-verified equipment variants, realistic conductor and protection specification, poles at surveyed collision-safe positions, overhead sag and underground sections/traffic clearance for the *entire town*.
- **RTU-009/010/013**: full property-by-property rooftop PV + battery/inverter controls, outage protection coordination, repair orders and operational islanding/switching procedures.
- **RTU-017/018**: broad whole-town night/dawn/nightfall, long-term energy conservation, mobile playtest and approved production release.
- Actual service location/phase, real 230/400V imbalance, impedances and trip curves are unknown and require research. The pilot uses simplified aggregate resistive-loss estimates and conservative no-backfeed rules, **not an engineering-certified AC loadflow**.

## Source and test commands

```bash
cd repository-town
npm ci
node tests/electrical-pilot.mjs
node tests/electrical-backbone.mjs
node tests/lighting.mjs
node tests/power-grid.mjs
node tests/pub-utilities.mjs
npm run build
npm run check:privacy
```

View the numerical baseline in [PILOT_NETWORK](../src/world/electrical-pilot-data.js) and its simulation in [electrical-pilot.js](../src/world/electrical-pilot.js). Avoid adding arbitrary game roads (rows 9–11 are NOT constructed streets). The reference [NSWutilities regional case](https://github.com/joshualparris/NSWutilities/blob/main/docs/NSW_ELEC_003_VERIFIED_TOPOLOGY.md) informed voltage conventions, not site-specific live infrastructure.

**Acceptance note:** Code merging and deterministic tests are not themselves proof that the new feature is in production. The specific public/preview URL and SHA must be separately checked before marking RTU-018 done.
