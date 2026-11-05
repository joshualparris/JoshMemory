# NR-AIR-FLIGHT-001 — Narromine Aerodrome and pilotable aircraft

## Scope, evidence and fidelity

Preserve the already modelled Narromine Aviation Museum, Aero Club, exhibition hangar interiors, gliding clubhouse, hangars, memorial, Wright Flyer, Sabre, and aircraft exhibits built 4 November. References:
- src/world/narromine-aviation-evidence.js
- src/world/narromine-aviation-precinct.js
- docs/NARROMINE_AVIATION_RECONSTRUCTION.md

This independent extension adds the following:
1. YNRM sealed runways **11/29 (1,521 × 30 m)** and **04/22 (1,100 × 30 m)**, with numerals, threshold bars, edges and centre markings.
2. Three distinct grass soaring-strip surfaces and interpreted markers.
3. Apron, taxiway and two marked aircraft parking bays.
4. Two individually boardable fictional light-aircraft types: high-wing trainer and low-wing sport plane. Neither is purported to be an actual currently parked aircraft or registration.
5. Throttle, runway-only takeoff, pitch, roll/bank, stalls, climb, descent, landing, cockpit and chase camera with speed/altitude/heading instruments.
6. On-foot keyboard and phone touch interaction, search destination **Narromine Aerodrome · YNRM**, and eastbound flight over Narromine and fictional Repository Town.
7. Ordinary ground-position save preserved; airborne state intentionally not persisted.

**Accuracy limits:** The Airservices YNRM Runway Distance Supplement identifies runway 04’s displaced threshold at 87 m and runway 29’s displaced threshold at 258 m; these are reflected in the game threshold markings. Published runway lengths/bearings are from Australian AIP (Airservices ERSA). Exact runway threshold locations, taxiway alignments, apron dimensions, grass textures and landing approach cues are **approximated**, not surveyed. Neither model is a real aircraft or certified flight simulator; never use it for actual aviation/navigation. Source pointers: Airservices ERSA YNRM; Narromine Shire aerodrome information; existing OSM and NSW heritage evidence registry. No Google Street View key, imagery or private user data is committed.

## Controls

Travel with the search to Narromine Aerodrome · YNRM. Walk to the parked plane and press E or ✋ to board.

| Action | PC | Phone |
|---|---|---|
| Increase/decrease power | W / S | Hold Throttle + / − |
| Taxi steer / airborne bank | A / D | Hold ◀ Bank / Bank ▶ |
| Pitch up/down | Arrow ↑ / ↓ | Hold ↑ Nose / ↓ Nose |
| Assisted runway 11 lineup when stopped | R | ↗ Line up 11 |
| Toggle chase/cockpit | V | 🎥 View |
| Exit when stopped on ground | E | 🚶 Exit |

Begin in the trainer, press R to line up, hold W to accelerate and apply gentle Arrow ↑ after approximately **100 km/h** (game physics). Landing requires returning to the ground and slowing below 2 m/s.

## Acceptance and outstanding fidelity

- Independent geometry does not overwrite original museum, roads, rail, collision, interiors, saves or other agents’ claims.
- Deterministic flight tests: node tests/narromine-flight.mjs; check actual frame integration and run build/privacy.
- Real Chromium and emulated phone: board, taxi, runway takeoff, flight toward fictional Repository Town, land, exit; verify camera range and zero console/page errors.
- Review GitHub CI, reconcile latest main without force-push, merge safely, publish and verify actual sourceCommit.
- Further fidelity work: site-survey or licensed imagery runway threshold georeferencing, apron taxiway joins, interior pilot club/lounge details, real terrain elevation at flight altitude, airport winds/traffic/ATC, aircraft-specific aerodynamic characteristics. Do not claim these unimplemented.
