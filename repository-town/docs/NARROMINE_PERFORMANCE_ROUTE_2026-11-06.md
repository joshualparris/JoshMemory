# Narromine performance route — desktop and Android emulation (NR-REAL-023)

Status: **measurement only.** No game source, rendering, LOD, collision or geometry was changed, and no photographic fidelity is implied. This record accompanies checklist item 23 ("Measure performance along the entire route").

## What it measures

`tools/narromine-visual-qa/perf-route.mjs` walks the already-merged, deterministic `NARROMINE_QA_LOCATIONS` poses — the six priority Narromine viewpoints (Royal Hotel, Narromine Hotel, Post Office, Coles & Kierath's, Kierath's arcade courtyard and an ordinary street) — and at each stop records:

- real `requestAnimationFrame` frame times, summarised as average fps, 1% low, p95, worst frame and the count of >50 ms hitches (via the shared `src/ui/perf-meter.js` `frameStats`);
- draw calls, triangles and render pixel ratio from the live renderer (`window.__town.state()`);
- the GPU string exposed by `window.__town.perf()`;
- viewport size, device pixel ratio, mobile/touch flag and the browser user agent.

It writes `test-results/narromine-perf/perf-route.json` and `perf-route.csv`, and prints a PASS summary that requires every stop to have actually rendered Narromine geometry (`triangles ≥ 1000`, `draw calls ≥ 5`) and a positive frame-time metric. A stop that fails to render fails the run rather than silently reporting zero.

## How to run

```bash
cd repository-town
npm run build
node tools/narromine-visual-qa/perf-route.mjs                     # desktop + Android emulation, 8 stops
node tools/narromine-visual-qa/perf-route.mjs --sample-frames 60  # more frames per stop
node tools/narromine-visual-qa/perf-route.mjs --stops royal-hotel-dandaloo,post-office-entrance
node tools/narromine-visual-qa/perf-route.mjs --viewports desktop
```

The `Narromine Performance Route (desktop + Android emulation)` workflow runs the same command on `ubuntu-24.04` and uploads the JSON/CSV artifact.

## Reference run (2026-11-06, local software WebGL)

A full local run produced 12 stop-measurements (6 stops × desktop + Android emulation), all reporting rendered Narromine geometry. Mean per stop: desktop ~251 draw calls / ~1.24M triangles; Android emulation ~129 draw calls / ~1.06M triangles. Average fps was ~1.5 (desktop) and ~3.0 (Android) **because this machine and the CI job use software SwiftShader**, so treat fps as a relative cost signal, not a device frame rate. The draw-call and triangle counts are the useful cross-stop comparison; the CI workflow uploads the exact `perf-route.json`/`.csv` artifact for the authoritative run.

## Method and honesty

- Poses are the **already-merged** visual-QA camera positions (`tools/narromine-visual-qa/locations.mjs`), not invented viewpoints. Lighting is midday, clear weather, matching the visual-QA baseline.
- The town simulation clock is frozen for each stop so the cost of the scene at that viewpoint is reproducible; this is **not** a moving-traffic load test.
- Desktop is 1280×800; mobile is a 412×915 Chromium emulation with touch — **emulation is not a physical handset**, and CI runs software SwiftShader rather than a phone GPU, so absolute fps is not a device benchmark.
- No LOD or culling was added or changed. If the data later justifies LOD, it must be a separate, claimed change that preserves nearby silhouettes and interactive/collision geometry.

## Relationship to other work

This is performance-only and **independent of PR #448** (the uninterrupted Dandaloo walking audit). It reuses the merged QA poses rather than #448's unmerged files, so the two do not conflict. The existing `tools/narromine-visual-qa/run.mjs` capture suite remains the visual/comparison tool; this route record is the dedicated frame-cost measurement.
