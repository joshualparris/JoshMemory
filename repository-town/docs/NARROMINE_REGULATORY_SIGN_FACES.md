# Narromine observed regulatory sign faces — 5 November 2026

Task NR-SIGN-FACES-001, Codex/Fedora. Source baseline `7b5369f1`; feature branch `fix/narromine-observed-sign-faces-20261105`.

The existing renderer displayed STOP as an unlettered red octagon, GIVE WAY as a solid red cone, KEEP LEFT as a blank panel and NO ENTRY as a solid red rectangle. This correction gives the **existing 19 Mapillary-derived observations** recognisable original vector faces: 2 STOP, 11 GIVE WAY, 4 KEEP LEFT and 2 NO ENTRY. It changes no observation records, world anchors, headings, source counts, roads, colliders, business geometry or private data.

## Evidence and limits

Official NSW visual references inspected 5 November 2026:

- [Stop and give way signs and lines](https://www.nsw.gov.au/driving-boating-and-transport/driving-nsw/roads-safety-and-rules/stopping-giving-way-turning/stop-give-way-signs-lines): red octagonal STOP with white text/border, downward red-bordered white GIVE WAY triangle.
- [Keep left or right](https://www.nsw.gov.au/driving-boating-and-transport/driving-nsw/roads-safety-and-rules/road-lanes-lines-markings/keep-left-right-slip-median-lanes): white regulatory panel, KEEP LEFT instruction and diagonal down-left black arrow.
- [Indicating and turning: No entry](https://www.nsw.gov.au/driving-boating-and-transport/driving-nsw/roads-safety-and-rules/stopping-giving-way-turning/indicating-and-turning): NSW NO ENTRY panel with red disk/white horizontal bar.

All canvas artwork is original code; no Street View, Mapillary or NSW website pixels are copied into game assets. Individual observation IDs/dates and coordinates remain in the existing `narromine-mapillary-data.js` (generated from historical Mapillary feature detections; dates span several years). This change does **not** establish that the signs remain present today, independently validate their automatic classification, relocate them, measure their physical sizes or certify road-sign compliance. Generic sans-serif lettering and dimensions remain visual approximations. Warnings/directions with unknown symbols or destinations remain unchanged rather than inventing instructions.

A single shared 1024×1024 atlas batches all corrected faces. Thin panels have separate plain-metal rear faces, so instructions are not mirrored on the backs. Panels sit just ahead of the existing support radius: initial browser review exposed poles obscuring the arrow, and the corrected regression requires panel clearance. The NO ENTRY disk accounts for the rectangular panel's aspect ratio.

## Verification

- `node tests/narromine-regulatory-signs.mjs`: original source counts, finite geometry, correct silhouette, atlas cells, plain backs, pole clearance and existing world-builder integration.
- `CHROME_PATH=/usr/bin/google-chrome node tests/narromine-regulatory-signs-browser.mjs`: actual source world-builder rendering in Chromium WebGL on desktop and Pixel 7 **emulation**; eight close-up fronts and two reverse-side screenshots; atlas semantic colour checks and zero page errors. Optional CHROME_PATH uses an existing installed Chrome without downloading a second browser.
- Evidence in ignored `test-results/narromine-regulatory-signs/`: screenshots plus manifest with source observation IDs, dates, coordinates and camera yaw. This is component/world-builder visual evidence, not walking, a photographic alignment test or a physical Android-device run.
- Release/build/privacy results and publication status are recorded in WORK_CHECKPOINT.md. Source/CI/production must be reported separately.

## Remaining realism blockers

The three raw main-street shells `NR-OSM-0165`, `0168`, `0169` still lack geolocated facade/roof evidence, per `NARROMINE_FRONTAGE_GAP_SURVEY_2026-11-04.md`. Windows, doors, awnings, tenants and roof profiles cannot responsibly be modelled from OSM outlines and LiDAR percentile heights alone. Need dated front/oblique reference views with camera location, height, heading/FOV and permission to derive geometry; source images need not be published. Accurate ground terrain needs aligned ground-class LiDAR/DEM and vertical control, not roof-return height percentiles. These are input-data gaps, not reasons to fabricate geometry.

## Result at tested runtime source `7dea15d1`

All constituent release checks completed successfully; the parent shell ended with signal 15 (143) at the final manifest step, which was rerun explicitly and passed for all 1,440 public files. Existing full-game Narromine driving/arrival/interaction/search regression passed. Baseline source `7b5369f1` was rendered at identical observation positions, camera poses and lighting: the old GIVE WAY face was a blank **upward** red triangle; the candidate is downward, white-centred, red-bordered and lettered. Reviewed matching desktop/mobile-sized captures in ignored `test-results/narromine-regulatory-signs-baseline/` and `test-results/narromine-regulatory-signs/`.

PR #419 remains unmerged. The explicit staging deployment request for this source failed with HTTP 402 `api-deployments-free-per-day` (>100 deployments/day, retry in 24 hours). No local Vercel CLI is installed. Production/staging/backup readbacks were `31ae780a` / `6ab007a1` / `9bcb364a`, respectively. The feature is not verified live. No billing/plan change, quota bypass, or alternate host was created.
