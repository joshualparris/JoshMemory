# Open-source port 01 — IsoCity-inspired High Street traffic signals

Date: 20 October 2026
Source of inspiration: https://github.com/amilich/isometric-city
Source licence: MIT, copyright 2025 amilich
Licence: https://github.com/amilich/isometric-city/blob/main/LICENSE

## Scope and licence
IsoCity is an MIT-licensed TypeScript/Canvas city builder whose vehicles respect traffic lights.
Repository Town is Three.js, so this is a **fresh JavaScript adaptation of that feature concept**,
not a copy of IsoCity source, assets, traffic logic, or rendering code. Credit and source links
are retained for provenance. If literal source is ported later, retain its MIT copyright and licence.

## Implemented pilot
- One signalised zebra crossing on High Street at (52,177), at an avenue.
- Painted crossing bars and stop lines are visual geometry without collision boxes.
- Two three-aspect traffic signal models update from the same deterministic town clock as traffic.
- 72-real-second cycle at 1x: green 42s, amber 6s, all-red 2s, walk 18s, clearance 4s.
- Trucks heading east or west stop before their crossing approach on amber/red and resume on green.
- Trucks already beyond the stop line finish clearing the junction; parked or off-street trucks unaffected.
- Tests cover both approaches, stopping/restarting, repeatability and rendering hooks.

## Limits
- The town currently has three delivery trucks; this does not invent civilian car traffic.
- Pedestrian signal is displayed by the crossing phase, **but actual pedestrian walking/routing through
  the zebra and player compliance are not yet signal-gated**. Do not describe it as pedestrian-AI
  compliance until that is implemented and tested.
- Only one junction is covered. Existing other streets operate unchanged.
- No claim of measured GPU performance or physical-browser acceptance based only on CI.

## To test
Run `node tests/traffic-signals.mjs` and `npm run test:integration`.
In the deployed town, visit x 52, z 177 on High Street. Watch for a full signal cycle
and an east- or westbound delivery truck stopping outside the striped crossing.
Check that the lamps and stop behaviour remain synchronised after reload.
