# DANDALOO-001 / 1.1 — Narromine 239-contact reproduction (5 November 2026)

**Owner:** ChatGPT cloud, GitHub Actions. **Issue:** [#398](https://github.com/joshualparris/JoshMemory/issues/398). **Status:** DONE (1.1 evidence gate passed and test merged in #406; #398 closed 5 Nov 2026). **Pinned underlying main SHA:** `11bbf2c53164c5e21a24ed9b8173e07b90148dfc`.

## Purpose

Reproduce the **historically observed 239 Narromine mapped-road centreline and ±1.6m offset static-collider contacts** from [PR #371](https://github.com/joshualparris/JoshMemory/pull/371) without changing any geometry, road layout, collision handling or traffic rules. Historical 239 is **not** asserted as the new count; capture the precise current result at this branch's commit SHA.

Distinct ownership: NR-ROAD-COLLIDER-ROTATION-001 is implementing the actual building collision narrowphase in a separate branch. Agy ThinkPad owns NR-REAL-002 walking audit (#388). This task owns the **read-only metric and provenance**, not either of those fixes.

## Reproducible real-browser invocation

GitHub Actions workflow: [narromine-road-contact-evidence.yml](../../.github/workflows/narromine-road-contact-evidence.yml) (repo-relative path is `.github/workflows/narromine-road-contact-evidence.yml`). The job checks out the exact SHA, builds Repository Town, checks privacy, installs Chromium, serves the generated game on port 8091 and runs one script in two browser contexts:

- Desktop Chromium **1280 × 800**.
- Chromium configured with Playwright **Pixel 7** mobile emulation (viewport/user-agent/touch). This is **not** a physical phone or a physical device FPS measurement.

Equivalent local commands from `repository-town/`:

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --no-audit --no-fund
npm run build
npm run check:privacy
npx playwright install chromium
node tools/serve.mjs dist/public 8091 &
TOWN_URL=http://127.0.0.1:8091/ node tests/narromine-road-contact-evidence-browser.mjs
```

### Measurement contract

Identical to the existing `tests/road-drive-collisions-browser.mjs`: for each `CORE_ROADS`, `PLAN_ROADS`, and `STREETS` polyline segment, sample every approximately 3m, at centreline and ±1.6m. Only count samples for which **the actual running game** returns `__town.onRoad(x,z)`. Probe `__town.probeStatic(x,z,1.12)` so vehicle radius is consistent and moving pedestrians/trucks are excluded. Static contact means **game collider touched**, not proven that a physical car cannot drive a surveyed lane.

Additional read-only classification uses:

- Exact collider bounding coordinates and optional polygon, with source candidates cross-matched to current `BUILDINGS` (OSM ID), Microsoft traced footprints (index, not resident identity), POI estimated shop footprints, detailed site components, mapped poles/towers, LiDAR-derived tree trunks and game boundaries.
- Each contact's sample origin (centreline vs offset), mapped road, road type, position, radius and **render-derived road-surface polygon membership**. The latter reproduces `buildDisjointRoadSurfaces` with the existing gravel-track split and curved kerb fillets, but is *still modelled geometry*, not surveyed asphalt.
- `railProximity` flag to protect road/rail interface interpretation; a candidate cannot be called a false positive based only on a broad AABB.
- Multiple collider candidates are **ambiguous**. Unmatched colliders are explicitly **unattributed**, not guessed. `sourceConfidence` measures **model source identification**, not real-world geospatial accuracy.

### Outputs

The always-uploaded 30-day `narromine-239-road-contact-evidence` GitHub Actions artifact contains:

```text
desktop.json            complete individual contact objects + summary
desktop.csv             every desktop road contact
desktop-startup.png     genuine Chromium WebGL startup frame
desktop-road-1..5.png   diagnostic teleported game eye-height frames at top road-contact locations
pixel7.json             same for emulated mobile browser
pixel7.csv
pixel7-startup.png
pixel7-road-1..5.png
summary.json            browser/device count and source SHA comparison
```

These site screenshots use diagnostic camera placement only; **they do not prove a continuous physical drive or pedestrian walk**. A separate genuine input-driven test remains part of DANDALOO-001/1.2 and 1.6.

### Safety and interpretation

**Do not delete, disable or narrow a building wall, tree trunk, public-space fence or railway gate solely from this count.** Matching a collider to a real-ish dataset identifies the **game source**, not the object's surveyed boundary. OSM centreline road width is indicative; the rendered road union is an in-game approximation. Real obstruction classification requires comparing each flagged geometry against licensed imagery, measured boundaries and actual vehicle passage. Treat a mapped sample on a road/rail intersection especially carefully.

The test asserts all Repository Town **core** and **planned** road lanes are clear (known corrected farm-fence regression), but **does not assert 239 or a made-up lower Narromine threshold**. It requires deterministic desktop vs Pixel 7 emulated static results and no WebGL JavaScript errors. The JSON/CSV records remain available even on assertion failure. No production deployment is part of 1.1.

## Acceptance ledger

- [x] Feature-specific branch and coordination claim without overlapping owners.
- [x] New read-only data-producing browser test and scoped CI workflow.
- [x] GitHub Actions run completed with full JSON/CSV/screenshots at exact source SHA. _(run 41947000018 at `314a8b28`, artifacts preserved; see #398.)_
- [x] Review by-road totals, attribution gaps, surface-vs-centreline split and rail-proximity counts. _(Reviewed on #398; the post-#403 residual 52 were then classified object by object on 5 Nov.)_
- [x] PR merged safely without changes to scene/collision behaviour. _(#406, test-only.)_
- [x] Mark **1.1** complete only after the real-browser evidence has been inspected and preserved. _(1.1 is ticked in the street-by-street backlog.)_

The next step **1.2** is a separate implementation claim for confirmed false positives and requires before/after remeasurement.

## Verified 5 November 2026 browser results

**Latest complete successful run:** [41947000018](https://github.com/joshualparris/JoshMemory/actions/runs/41947000018), pinned workflow/test SHA `314a8b28554902c145506130850d0593b61efb1c`; [full JSON/CSV + 12 screenshots, GitHub artifact 13379676468](https://github.com/joshualparris/JoshMemory/actions/runs/41947000018/artifacts/13379676468). A previous run [41946906075](https://github.com/joshualparris/JoshMemory/actions/runs/41946906075) at SHA `f7ed4b3bc490354ae8cce822abe3773076debbf6` independently succeeded with identical counts. Both builds passed Node syntax, game build, privacy scan, real Chromium WebGL and desktop/Pixel7 sample parity.

| Source classification (model attribution only) | Static contacts |
| --- | ---: |
| Microsoft traced footprint polygons | 187 |
| Mapped OSM building polygons | 24 |
| Detailed site parts (including works shed) | 8 |
| LiDAR-derived model tree trunk | 1 |
| Unattributed axis-aligned static colliders | 19 |
| **Total mapped Narromine road contacts** | **239** |
| Repository Town core / planned mapped roads | **0 / 0** |

- **Desktop 239; Pixel 7 Playwright Chromium emulation 239**; exact individual static contact signatures match. A physical Pixel 7 was **not** tested.
- **Every one** of the 239 contacts is at the **±1.6 m lane-offset probe**; sampled mapped street **centrelines themselves had zero contacts**. This distinction matters: a centreline may be clear while its modelled lane edges touch a 1.12m-radius vehicle.
- **237** touches are inside renderer-derived **paved** road polygons, **2** inside renderer-derived **unsealed track** polygons; none were outside a renderer-derived carriageway in this model. These polygons are *not surveyed asphalt boundaries*.
- **219** collision responses had polygon narrowphase; **20** lacked polygon narrowphase (19 presently unattributed, 1 LiDAR tree trunk). The 219 polygon contacts show this is **not simply 239 oversized AABB corners**.
- The affected road records have **unnamed OSM ways** in the source: IDs such as `narromine-49:` retain their stable index but have no defensible street name. Do not invent names or claim that 239 were all on Dandaloo Street. The most affected IDs: `49` (29), `117` (23), `57` (20), `183` (17), `58` (15), `107` (15). Refer to the coordinates in the CSV for actual placement.
- All 19 unattributed model contacts remain under investigation. Eighteen form a sequence of narrow axis-aligned colliders along `narromine-49:` near x −4937..−4929, z −244..−297; one is near x −5214.75, z −1141.25. No ground-truth classification, collision bypass, or railway-gate removal is justified.
- **0** contacts fall within the audit's 9m proximity flag of mapped railway lines. That does **not** prove crossing safety or gate function.
- Desktop and mobile frame captures contain actual rendered game scenery, but camera repositioning is diagnostic teleportation **not** a physical drive or walking-route acceptance test.

**Implication for 1.2 owner:** the prevailing 219 polygon-aware building contacts require road/footprint alignment and clearance evidence; a box-to-polygon fix alone cannot be counted as resolving these. Preserve real walls and rail-gate physics. Re-run the same 3m / ±1.6m / r=1.12m probes before and after any change, then separately test vehicle traversal through named Dandaloo/Burraway intersections.

**1.1 evidence gate PASSED at the pinned source SHA**; this is a measurement-only finding. The independent corrective issue #398 was open at the time; it closed on 5 Nov 2026 when #403 merged, and the residual 52 contacts were then classified as real roadside objects.
