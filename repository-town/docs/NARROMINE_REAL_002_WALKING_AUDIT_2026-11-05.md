# NR-REAL-002 — Narromine physical walking and visual QA

**Date:** 5 November 2026 (AEDT)
**Status:** PARTIALLY COMPLETE — first evidence-producing browser harness; live results await CI.
**Original owner:** Antigravity ThinkPad, branch feat/narromine-real-002-walking-audit-20261105 at b0b2f2d2.
**Continuation:** ChatGPT cloud, isolated branch feat/narromine-real-002-walk-qa-continuation-20261105 from main 8a8f7680.

## Recovered work

Agy's terminal transcript ends at quota exhaustion while running an OSM layout check and editing two local files. Only COORDINATION.md and WORK_CHECKPOINT.md were pushed to its feature branch. The latest local ThinkPad modifications are not available on GitHub, so this continuation uses the published, working landmark test contracts.

## Browser test design

The new test at tests/narromine-real-002-walking-audit-browser.mjs opens the real game in Chromium with WebGL. It uses the game's walkTo API, waits for observed player positions and records movement distances, mode, rejection reason, errors, game-only screenshots and detailed JSON. **No destination is teleported into place to claim a successful walk.**

| ID | Segment | Waypoint provenance |
| --- | --- | --- |
| NR-WALK-001 | St Mary's Anglican Church | Existing entrance/outside contract |
| NR-WALK-002 | Royal Hotel verandah | Existing cadastral/LiDAR building local frame |
| NR-WALK-003 | Railway Station forecourt | Previously exercised railway walk test |
| NR-WALK-004 | Narromine Hotel vicinity | Mapped OSM point plus estimated nearby clear path |
| NR-WALK-005 | Narromine Post Office | Existing public entrance/outside contract |
| NR-WALK-006 | Kierath's passage, both entrances | Georeferenced KIERATHS_ROUTE |
| NR-WALK-007 | NW Dandaloo commercial strip | Previously exercised mapped footpath |
| NR-WALK-008 | Civic former courthouse | Previously exercised 35 Burraway St walking path |
| NR-WALK-009 | Mapped residential street | OSM residential road centreline, not verified footpath |
| NR-WALK-010 | Aviation Museum visitor hangar | Existing aviation browser walk test |

Tests run at desktop Chromium 1280×800 and Android-like Chromium 393×852. **This is twenty local segment attempts, NOT one continuous foot journey between the ten sites.** The player is placed at the beginning of each segment and must actually navigate within it. Any failed route is a documented defect/uncertainty, not evidence of success.

## First run — 20 attempts on Chromium WebGL

[GitHub Actions run 41925513396](https://github.com/joshualparris/JoshMemory/actions/runs/41925513396) **PASSED build, geometry, privacy, Chromium execution and report generation** at branch SHA 8165a26b2. The uploaded artifact contains audit.json and 20 game-only screenshots.

- Desktop Chromium 1280×800: **9 of 10** local routes physically walked.
- Android-size Chromium 393×852: **9 of 10** local routes physically walked.
- **St Mary's NR-WALK-001 false alarm on both:** the test sampled narromineVisible immediately after place while scene streaming had not updated, even though screenshots show a rendered Anglican church, fencing, road and trees. Status is TEST HARNESS TIMING, **not** an independently verified blocked church entrance. First correction: wait for visibility in a later game frame before classifying.
- Kierath's Dandaloo-to-rear through-walk completed **11 of 11 waypoint legs per viewport**. The last screenshot faced an empty adjoining lane rather than the arcade; this is a camera-evidence problem, corrected by a final in-place rotation and a separate supplementary screenshot.
- Coles public approach was NOT directly walked in this first run. Correction: add a second independently staged local subroute (not false continuous traversal) to the actual Coles public entrance outside position.
- No runtime/gameplay defect was independently demonstrated by this first run. A recognised heritage silhouette is not yet photographic proof; avoid closing the whole Narromine visual-realism work.

The next run must include St Mary's visibility retry, the separate Coles walk and photographic evidence camera correction **on latest main**, with no claim of a full continuous inter-site journey.

## Real-world comparison

Josh's privately held [55 comparison views](https://drive.google.com/drive/folders/1wgPC3JnTWJIPurRXzbW_5T5DLcn1QXJR) provide photo context for hotel and main-street views. No Google Street View pixels, API keys or paid calls enter the code or its public screenshots. Pixel comparisons need actual panorama position, capture date, camera height, heading and FOV calibration. Rendered game-only screenshots alone do not prove photorealistic accuracy.

## Coordination boundaries

Keep PR #371 road barriers, #377 north furniture, #366 hotel tree, #363 mobile driving HUD, #376 freight crossing, #358 frontage evidence and #384 audio/material QA under their current separate owners. All changes here are additive audit/browser test files and documentation, with no game world or runtime changes.

## Acceptance and next repair

Run Node syntax, existing geometry regressions, production build, privacy check and real WebGL Chromium browser tests. Preserve test-results/narromine-real-002/audit.json and screenshots as GitHub Actions artifacts. Inspect the results, identify the highest-impact reproducible **unclaimed** defect, and make a separate feature claim before any gameplay repair. If findings overlap an active PR, provide reproducible evidence to its owner instead.

**Not yet verified:** Screenshot review, report's actual pass count, full continuous-town physical traversal, physical Android device playtest, hosted production browser comparison and any new gameplay fix. Do not call this task VERIFIED COMPLETE until the evidence supports it.
