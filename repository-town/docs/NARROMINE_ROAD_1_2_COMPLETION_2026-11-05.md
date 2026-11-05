# DANDALOO-001 / 1.2 — Collision inspection, evidence and physical passage

**Date:** 5 November 2026. **State:** DANDALOO-001.2 dedicated WebGL acceptance **VERIFIED**, awaiting PR merge and backlog reconciliation. No new collision geometry changes; photo/real-world survey is not verified.

## Proven causes; do not remove actual roadside objects

- [PR #403](https://github.com/joshualparris/JoshMemory/pull/403) merged an actual lower-confidence **Microsoft footprint source** conflict correction. Real Chromium desktop and Pixel 7 emulation [before](https://github.com/joshualparris/JoshMemory/actions/runs/41945501957) / [after](https://github.com/joshualparris/JoshMemory/actions/runs/41946311497): **239 → 52** road-offset contact samples. 94 uncertain imported footprints withheld for ground-truth review; 2,131 retained. This does **not** mean 94 actual houses are absent.
- [PR #409 WebGL audit](https://github.com/joshualparris/JoshMemory/actions/runs/41950596852) proves desktop/Pixel7 parity: all **52** samples extend beyond the width of mapped 4.5m service lanes; **zero** are on centreline or fully within the mapped modelled carriageway. **Zero Dandaloo Street contacts**. The test includes collision probe radius; do not conflate sample point on the asphalt with full vehicle body inside asphalt.
- Claude/Fedora manually inspected **all 52** residual contacts in the [#398 discussion](https://github.com/joshualparris/JoshMemory/issues/398): 18 contacts at St Mary's modelled wall, 8 at two detailed sheds, 24 mapped exact-polygon OSM building contacts, 2 LiDAR trunks. These are roadside items. No false-positive oversize bounding box remained to remove. The person who last owns this finding explicitly made **no additional collider edit**.
- The [NR-REAL-002 20/20 local on-foot WebGL audit](NARROMINE_REAL_002_WALKING_AUDIT_2026-11-05.md) covers Royal Hotel, Narromine Hotel, Post Office, Kierath/Coles, NW Dandaloo, Burraway courthouse, railway precinct, plus other areas, on desktop and Android-sized Chromium. **These are 10 separately staged local walks per viewport**, not a continuous whole-town journey or real Android handset.

## This acceptance slice — physically driven car, not map sample

The focused `tests/narromine-1-2-car-passage-browser.mjs` independently verifies a registered **sedan** using the actual driving controls and `stepVehicle` with held W. Targets:

1. Dandaloo Street at Royal Hotel
2. Dandaloo Street at Narromine Hotel
3. Dandaloo Street at Narromine Post Office
4. Dandaloo Street at Coles/Kierath's
5. Burraway Street near the former courthouse
6. Dandaloo railway level crossing (reference 717)

It discovers a source-aligned segment at a real modelled road, rejects unsafe or non-drivable staging locations using the real `probeStatic` radius 1.12m, stages the car **only before each local journey**, and then drives actual physics forward in the browser. It records starting/ending coordinates, odometry/step poses, whether the body touches static solids or leaves the modelled road, nearest crossing position, source SHA, WebGL screenshots and browser errors. It refuses to drive a closed boom. Crossings remain modelled barriers; no test code changes their real gate logic.

This does **not** prove every Dandaloo intersection end-to-end, every turn, legal rail compliance, the actual 2026 kerb survey, or real phone device safety. Any failing site is reported as `GAP`, not hidden by teleporting the destination. Test may expose an unrelated route/traffic defect without implying false building colliders.

[Workflow](../../.github/workflows/narromine-road-1-2-passage.yml) builds source, runs privacy/footprint regressions, executes software-WebGL Chromium at desktop and Pixel 7 emulation, and uploads complete image/JSON evidence. Review screenshot quality and the exact source SHA before marking this acceptance.

## Decision and following road tasks

- [x] Actual false-positive footprint **source conflicts** conservatively corrected in #403, with before/after counts.
- [x] All 52 remaining static samples classified as legitimate off-carriageway contact, based on current model provenance; no unsupported collider deletion.
- [x] 20/20 independently staged physical pedestrian legs in existing NR-REAL-002 evidence.
- [x] **12/12 real sedan drives PASSED**, two browser configurations, six named sites, including the open Dandaloo rail crossing. [GitHub Actions run 41967170136](https://github.com/joshualparris/JoshMemory/actions/runs/41967170136), [JSON and 12 screenshots artifact 13387594060](https://github.com/joshualparris/JoshMemory/actions/runs/41967170136/artifacts/13387594060). Browser checkout was Actions synthetic merge SHA `da845651f39cf4a4dc510f1a48bc56a1d4706c55`, candidate branch head `0b92ffb342568128b1c272d7537525dcc70e3caa`.
- [ ] Visual check of physical roads, parking/kerbs/ramps/paint and true-to-life public accessibility still needs dated source imagery and owner judgement.
- [ ] Exact published production/backup source SHA cannot be claimed until verified separately.

Close **only subtask 1.2** once the new physical-driving acceptance passes; DANDALOO-001/1.3+ and 1.6 remain open.

## Confirmed acceptance run — 41967170136

**Result: 12/12 success (6 desktop, 6 Pixel 7 Chromium emulation).** Each accepted test actually held `W` and called the in-game swept-substep `stepVehicle(1/30)` simulation. Real game car collision and dynamic actors remained active. The six accepted desktop distances were 10.17, 10.17, 10.17, 10.17, 10.17 and 18.08 metres; the mobile-sized runs yielded five 10.17–10.26 m drives and an 18.08 m crossing. **All 12 accepted drives: 0 off-road frames, 0 static-collision frames, 0 JavaScript page errors.** Screenshots are game-only frame captures **after parking**, not road-survey photo overlays or proof that the car drove between sites.

The first phone-sized Burraway road-staging point was legitimately occupied by a dynamic actor: `probeStatic=false`, `probeWithMoving=true`, and the real vehicle refused to enter. The test recorded that rejected attempt and staged an independently validated second local candidate on the same road; this drove 10.17 m and parked properly. No pedestrian, parking, or building collisions were disabled or faked. In the previous run, a first-choice Burraway car stopped after 4.12 m and a first-choice Coles staging point was occupied; those remain preserved in [run 41966538702](https://github.com/joshualparris/JoshMemory/actions/runs/41966538702) as honest evidence of *dynamic* occupancy, not an invisible static wall. The test now records every rejected candidate in `report.json` and does not count any bypassed dynamic obstruction as an accepted drive.

The Dandaloo crossing, NSW inventory ref **717**, was open during each accepted 18.08 m car traversal. This is *not* a test that driving into a closed boom succeeds; existing independent [freight/crossing browser test](../../tests/narromine-freight-crossings-browser.mjs) verifies boom collision while a train approaches. A 10m local straight drive does not validate turning radii, parking bay geometry, continuous town-wide access or real-life traffic safety.

**Collision comparison ledger:** 239 pre-source-filter raw offset hits → 52 after the corrected Microsoft source filter; all 52 residual samples on seven 4.5m OSM service-road verges, 0 centred or full-vehicle-body-within mapped carriageway; car input-driven acceptance 12/12 at named public locations. Source conflicts require later 2026 ground-truth geospatial/photographic validation; no real building or tree is asserted absent merely because a filter withheld uncertain Microsoft data.
