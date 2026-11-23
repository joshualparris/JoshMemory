# Lantern Point — numbered realism roadmap (23 November 2026)

**Goal:** A fictional Parristan settlement about 16.5 km south of Repository
Town in represented geography, connected by a compressed ~3.2 km in-game road.
Real NSW zoning, ownership and roads are NOT being changed or claimed.

**User screenshot audit:** the first mobile preview displayed an abrupt 90°
rural-road bend, featureless cylinder-and-sphere citizens, flat box houses,
repeated trees and ground without convincing footpaths, shoulders or gardens.

**Road reference:** Austroads Guide to Road Design Part 3 (2026)
https://austroads.gov.au/publications/road-design/agrd03 ; NSW Design of
Roads and Streets
https://standards.transport.nsw.gov.au/_entity/annotation/8a614891-d384-afb8-8f9e-211fcd904ff3 .
These sources discuss horizontal curves, road cross-sections, shoulders,
verges and sight distances. The game's 85 m-radius bends and 40 km/h
advisory are *illustrative game design*, NOT engineered or certified.

Items marked "implemented" mean CODE ON PR #636, not yet a verified release.

1. **LAN-001 — Screenshot and NSW realism baseline.** IMPLEMENTED.
   Document photographed game defects, Repository Town NPC differences,
   and relevant Austroads geometric-road principles.
2. **LAN-002 — Preserve fixed town geography.** IMPLEMENTED.
   Keep Repository Town and Narromine where they are, preserve houses,
   addresses and existing saved games; add Lantern Point to the south.
3. **LAN-003 — Continuous horizontal road alignment.** IMPLEMENTED.
   Replace the square dogleg with two tangent 85 m-radius arcs. Use
   the same centreline for visual asphalt, 2D map and vehicle physics.
   Acceptance: no sharp vertex, driveable centreline, no house clipping.
4. **LAN-004 — Rural road markings and verges.** IMPLEMENTED.
   Add two lanes, gravel shoulders, edge lines and curve centre markings.
   Future: bend warning signs, proper speed-zone response and guardrails
   only where warranted by hazards.
5. **LAN-005 — NSW-inspired roadside vegetation.** IMPLEMENTED.
   More irregular eucalypt-style trees, paddock fencing and verges.
   Future: measured terrain, drainage, wildlife and seasons.
6. **LAN-006 — Repository Town quality human figures.** IMPLEMENTED.
   Share makeDistinctPerson, stable individual appearance, outfits,
   hair/face variation, articulated walking and per-distance LOD.
7. **LAN-007 — Persistent citizen movement.** PARTIAL.
   Read actual Parristan fictional AI citizen IDs/activities; retain
   figures across refreshes, pedestrian-rate movement, street-oriented
   waypoints and basic obstruction avoidance. Full routefinding remains.
8. **LAN-008 — Recognisable village architecture.** IMPLEMENTED.
   Non-identical pitched roofs, doors, windows, verandahs, driveways,
   gardens and an actual open bus shelter instead of cuboids.
9. **LAN-009 — Useful public realm.** IMPLEMENTED.
   Sidewalks, lamps, seating, planted beds and clear map labels.
   Facades are not yet enterable; never imply they are.
10. **LAN-010 — Desktop and mobile automated acceptance.** PENDING.
    Exercise real 3D WebGL, full connected road/collision checks,
    actual phone touch movement, car driving, map/search, and resident
    identity; check uncaught browser errors, building/privacy gates.
11. **LAN-011 — Safe merge and live-production verification.** PENDING.
    Merge PR #636 only once required checks pass; verify main SHA,
    actual deployed commit and browser functionality on the public URL.
12. **LAN-012 — Actual enterable interiors.** FUTURE.
    Full front door transitions, furnished rooms, collision checked
    floors, operating hours and persistent exits.
13. **LAN-013 — Real households and jobs.** FUTURE.
    Family ties, named home addresses, local rosters, staff at shops,
    school runs, shop stock, salaries and neighbourhood friendships.
14. **LAN-014 — Intertown vehicles and bus service.** FUTURE.
    Household-owned cars, actual routes, left-side road behaviour,
    parking, fuel, traffic, freight and plausible bus timetables.
15. **LAN-015 — Pedestrian navmesh and accessibility.** FUTURE.
    Complete obstacle-safe A* routes, kerbs, crossings, accessible
    footpaths and bus-stop boarding, not lines through homes.
16. **LAN-016 — Terrain, weather and credible landmarks.** FUTURE.
    Elevation, drainage, native landscaping, shadows, road wear,
    physical civic facilities, landmarks, realistic day/night lighting.
17. **LAN-017 — Phone performance and long-lived NPCs.** FUTURE.
    Tested frame budget, view streaming, no asset leaks, save/load
    consistency, long-run world simulation and real activity metrics.
18. **LAN-018 — Evidence-grade GIS and preservation.** FUTURE.
    Apply licensed NSW reference data, record fictional versus real
    claims, regression screenshots, and rural-safety audit notes.

## Release gates

- No merge until the dedicated Lantern Point CI, Repository Town
  integration, privacy/build and browser playtests show success on
  the current head SHA.
- Inspect a deployed 3D game (mobile and desktop), not just HTTP 200.
- Preserve the existing production build as rollback.
- Exteriors, routes, traffic and simulated residents remain explicitly
  fictional. "As realistic as possible" is a progression, not a claim
  that future roadmap work has been finished.
