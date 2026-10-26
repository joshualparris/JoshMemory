# Railway corridor safety and realism audit — 26 October 2026

**Status: modelled safety improvements only. NOT 100% code-compliant or independently certified.** Repo Town is a fictional computer game, not an accredited rail operator or a real engineering design. Standards are used as design references, without asserting an actual AS 7633 structure gauge or surveyed NSW approvals.

## User-visible incident and root cause

Phone screenshots: sleepers and running rails pass directly through a road-light pole and the street-7 southern footpath. Source reproduction: `life.js` previously defined `RAIL_Z=136`; street 7 road centre is 131 and south streetlamp poles are at 137. The rail bed occupied approximately z134.3–137.7, overlapping a paved footpath and the lamp base. Merely deleting the lamp would leave the railway on the footpath.

## Implemented in this candidate

- Realigned the common simulated + rendered rail axis to z144, between the street-7 road edge and row-8 building backs; retained the Rail Depot timetable and town address references.
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
