# DANDALOO-001 / 1.1 — Narromine 239-contact reproduction (5 November 2026)

**Owner:** ChatGPT cloud, GitHub Actions. **Issue:** [#398](https://github.com/joshualparris/JoshMemory/issues/398). **Status:** CLAIMED / test-run evidence pending. **Pinned underlying main SHA:** `11bbf2c53164c5e21a24ed9b8173e07b90148dfc`.

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
- [ ] GitHub Actions run completed with full JSON/CSV/screenshots at exact source SHA.
- [ ] Review by-road totals, attribution gaps, surface-vs-centreline split and rail-proximity counts.
- [ ] PR merged safely without changes to scene/collision behaviour.
- [ ] Mark **1.1** complete only after the real-browser evidence has been inspected and preserved.

The next step **1.2** is a separate implementation claim for confirmed false positives and requires before/after remeasurement.
