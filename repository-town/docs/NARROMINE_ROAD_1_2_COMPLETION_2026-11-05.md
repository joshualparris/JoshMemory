# DANDALOO-001 / 1.2 — Collision inspection, evidence and physical passage

**Date:** 5 November 2026. **State:** Acceptance in progress: existing static-collision correction and walking evidence verified; the six-location car-driving evidence needs a real WebGL workflow result.

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
- [ ] Six named actual car drives on both browsers, the 12 screenshots, and current SHA check **pending**.
- [ ] Visual check of physical roads, parking/kerbs/ramps/paint and true-to-life public accessibility still needs dated source imagery and owner judgement.
- [ ] Exact published production/backup source SHA cannot be claimed until verified separately.

Close **only subtask 1.2** once the new physical-driving acceptance passes; DANDALOO-001/1.3+ and 1.6 remain open.
