# Railway corridor safety and realism audit — 26 October 2026

**Status: modelled safety improvements only. NOT 100% code-compliant or independently certified.** Repo Town is a fictional computer game, not an accredited rail operator or a real engineering design. Standards are used as design references, without asserting an actual AS 7633 structure gauge or surveyed NSW approvals.

## User-visible incident and root cause

Phone screenshots: sleepers and running rails pass directly through a road-light pole and the street-7 southern footpath. Source reproduction: `life.js` previously defined `RAIL_Z=136`; street 7 road centre is 131 and south streetlamp poles are at 137. The rail bed occupied approximately z134.3–137.7, overlapping a paved footpath and the lamp base. Merely deleting the lamp would leave the railway on the footpath.

## Implemented in this candidate

- Realigned the simulated and rendered rail axis to z=-196 in a northern reservation beyond row A. The intermediate z144 alignment (after z136) was superseded when a concurrent pub escape stair was found at z≈144.5 and nominal row-8 lot boundaries reached z138. At z=-196 the nearest row-1 rear lot boundary is z=-184, leaving 8.5 m from the modelled structure-outline edge to those plots.
- Extracted `rail-corridor.js` as a single source of truth (1,435 mm gauge; 3.5 m game-envelope half-width). Neither that numeric envelope nor the 5.5 m streetlight placement margin is a certified AS 7633 dimension.
- Rebuilt the visual cross-section in the right layer order: ballast, sleepers, running rails. Six avenues have infill panels below the rail tops, leaving visually readable flangeways.
- Added independently updated paired warning lamps and articulated booms at the six at-grade avenue crossings. Gates obey the moving train's actual modelled position and approximate 54 m trailing wagons rather than a separate clock animation; gates open while the train is stationary at the depot.
- Rejected streetlight fixtures in the track buffer and suppressed far-rear row-8 yard equipment if its physical footprint intrudes.
- Regression tests `tests/rail-corridor.mjs` are attached to the mandatory `test:release` gate.

## Remaining safety holds — not claimed as complete

| Priority | Open item | Required acceptance |
|---|---|---|
| P0 | Actual clearance of all rendered houses, 3D vehicles, trains, signs and overhead arms | Mesh-level swept-volume and dynamic collision survey over each train movement, including row-8 rear houses; independent calibrated kinematic/structure gauge |
| P0 | Grade crossings are presently **visual/timetable-controlled**, not an interlocked railway signalling system | Actual occupancy detection, train braking / fail-safe control, road traffic and pedestrian stop enforcement, credible barriers/fencing |
| P0 | Real level crossing road geometry and sightlines | Road authority interface; road approach grades and storage; swept vehicle turning paths; sight triangles; warning advance times; active/passive risk classification |
| P0 | No continuous corridor trespass protection / walking path | Fencing or barriers preserving fully navigable footpaths and accessible pedestrian crossings; no trapping NPCs or player |
| P1 | Station platform and depot | Measured platform edge gap, disabled access, protected waiting area, lighting, wayfinding, signalling and buffer stops |
| P1 | Track engineering | Track class and speed, formation, drainage, turnouts, rail fasteners, rail joints, ballast, maintenance access and inspections |
| P1 | Lighting/night safety | AS/NZS 1158-based simulated photometry, glare and crossing conspicuity; power fail and fallback operation |
| P1 | Continuous verification | Local Node, Playwright desktop/phone, hosted WebGL playthrough, exact release source SHA/fingerprint, preservation of saved-game history |

## References, with scope

- **AS 7633:2026 Railway Infrastructure — Clearances** (current, published 19 Feb 2026): https://www.ariso.org.au/products/as-7633-2026-railway-infrastructure-clearances/
- **AS 7658 Level Crossings — Rail Industry Requirements**: https://www.ariso.org.au/products/as-7658-level-crossings-rail-industry-requirements/
- **ATSB review**, includes AS 1742.7:2016 signs, approach storage and sightline issues, and AS/NZS 1158 lighting risk assessment: https://www.atsb.gov.au/investigations/rs-2021-001
- **ONRSR**, rail safety audits and inspections: https://www.onrsr.com.au/operator-essentials/audits-inspections-compliance-measures
- **AS 7630 Track Classification**: https://www.ariso.org.au/products/as-7630-track-classification/

The full normative texts and site-specific measured geometry have not been certified here. These are planning controls in a game; never cite this document as evidence of engineering approval.

## Integration and release check

PR #228 carries the rail changes through a normal reviewed branch. A first CI run exposed a depot-before-initialisation crash; this has been corrected, and the pub audit file has been reconciled with concurrent approved pub edits without changing their compliance status. The branch has merged the GitHub-tested synthetic merge tree to preserve concurrent source work. All safety, WebGL/mobile and publish checks are mandatory before any 'live fixed' claim. Deliberately retain the P0 signalling, trespass and professional approvals as open tasks.

## Operational safety follow-up — 26 October 2026 (PR safety-controller branch)

**Simulated controls implemented and required to pass release tests:**

1. Measured static collision footprints against the model's explicit 3.5 m half-width rail reservation, with actual city/house meshes, row-8 rear-yard objects, and depot clearances exercised by `tests/rail-geometry.mjs`. Fence posts stay outside the reserved running envelope. This does **not** establish a certified kinematic envelope under AS 7507/AS 7633.
2. Fenced BOTH edges of the railway. Public access remains through the six legitimate existing avenue crossings, not through gaps between them; crossing openings stay walkable when booms are raised.
3. Single deterministic protection controller gives advance red warning, lowering then down booms, and only afterwards a modelled train-proceed state; red lights use the same protection state as truck brakes and walker/cyclist movement. The warning duration is at least 3 simulated minutes before the modelled danger point, above the 20-second baseline described by ATSB. This is not a measured site commissioning test.
4. A road vehicle cannot *enter* a closed crossing: truck collision uses its 3.5 m half-length so its front bumper stops ahead of the boom. Pedestrians and cyclists stop on the approach. Road users already committed are permitted to leave the hazard zone rather than becoming trapped.
5. Player physics uses dynamic boom barriers while road warnings apply; deliberate crossing users who were between booms when the warning began can escape, and visible rolling stock gets a separate moving collision footprint.
6. A modelled crossing equipment/detection/power fault forces every boom down with red warnings, holds the locomotive for the rest of the service day, and prevents an immediate post-repair train jump. A train held over a crossing keeps it protected after the fault clears.
7. The separate North Rail Freight Terminal's loading/service apron sits behind a continuous line-side fence with its nearest edge 4.4 m from the running track centre. Platform has a visible caution line. It is *freight loading only*, not an accessible passenger boarding platform.

**Real-world regulatory/engineering hold, still OPEN:** AS 7633:2026 needs rolling stock kinematic and contingency outlines, surveyed infrastructure and approved site-specific clearance. AS 7658:2020 and AS 1742.7 require actual engineered warning/signalling hardware, validated train detection, power monitoring, lifecycle maintenance, road-rail authority interfaces and controlled safety assurance. ONRSR accreditation/interface agreements and road-authority approval, sightlines, grade/drainage, AS/NZS 1158 photometry, disabled pedestrian access and full fail-safe third-party verification are not possible from this game's synthetic coordinates. **No Australian rail safety certification or approval has been issued, and this simulated line must never be represented as safe for physical construction or operation.**

Further references:
- ATSB, [Level crossing collision and warning-time analysis](https://www.atsb.gov.au/investigations/ro-2021-003)
- ARISO, [AS 7705 active crossing monitoring](https://www.ariso.org.au/products/as-77052019-level-crossing-monitoring-systems/)
- ONRSR, [rail-road interface agreements](https://www.onrsr.com.au/industry-information/level-crossing-safety)

**Acceptance:** `node tests/rail-corridor.mjs`, `node tests/rail-operations.mjs`, `node tests/rail-geometry.mjs`, `npm run build:release`, recorded desktop + Android WebGL acceptance, and actual production release commit verification. Do not mark complete from a code commit alone.

## Mandatory alignment reconciliation — final northern corridor candidate

A separate change to `main` placed the railway at z132 to avoid the R8 pub's real external dogleg escape stairs. That would place it within the *actual street-7 carriageway* (centre z131). An intermediate rail centre z144 also cannot be assumed safe: R8 nominal lot rear boundaries extend to z138, and the pub's outdoor stair, supports and landing extend approximately to world z144.5. Neither straight-line position can pass a physical model-compliant clearance audit.

The replacement in this candidate is **z=-196**, north of row A. The rear boundary of row-1 nominal plots is -184; conservative structure-outline north/east/z envelope is [-199.5,-192.5], giving at least 8.5 metres of separation to those plots. It is also remote from all eight built street carriageways. Existing six long north-south avenues already extend across the land parcel and cross this northern railway. Gate hardware, continuous side fencing, stop-line protection and train positions all derive from that same shared axis.

The railway now has its own *North Rail Freight Terminal* near the rail, while the existing R8 Rail Depot address is treated as its road-dispatch warehouse (not physically rail-adjacent). The onward warehouse-to-terminal shuttle is not fully simulated; this remains open realism work. The north freight apron cannot be treated as a passenger platform or proof of accessible public embarkation.

Do not restore the old z132/z144 rail axes during unrelated building merges.
