# Narromine Visual QA & Screenshot Comparison System

This module provides an independent, repeatable visual testing and screenshot comparison pipeline for Narromine's 3D environment in Repository Town (`repository-town/`). It is designed to help agents verify visual realism across Narromine's landmarks, retail frontages, pedestrian arcades, and residential streets **without modifying gameplay, camera, or building geometry files**.

---

## Scope & Ownership Boundaries

All files for this system live strictly within isolated paths:

- `tools/narromine-visual-qa/locations.mjs` — Deterministic camera poses, target look-at coordinates, compass headings, viewports (`desktop` and `mobile`), and lighting presets (`morning`, `midday`, `late-afternoon`), plus read-only licensed reference lookup from `data/narromine-photo-references.json`.
- `tools/narromine-visual-qa/compare.mjs` — Pure Node PNG decoder/encoder, luminance & Sobel structural signature analysis, daylight progression verifier, and baseline comparison classifier distinguishing genuine rendering regressions from expected time, lighting, or weather differences.
- `tools/narromine-visual-qa/report.mjs` — Labelled PNG contact-sheet renderer (`contact-sheet.png`) and standalone HTML review report generator (`report.html`).
- `tools/narromine-visual-qa/run.mjs` — CLI and programmatic runner that serves `dist/public`, drives Playwright/WebGL across Desktop and Mobile viewports, records separated performance diagnostics, verifies camera reproducibility, and writes all QA artifacts to `test-results/narromine-visual-qa/` (git-ignored).
- `tests/narromine-visual-qa/visual-qa.mjs` — Automated verification test suite covering deterministic location geometry, collider clearance, PNG analysis & baseline comparison classification, and end-to-end Playwright/WebGL screenshot & report generation.

Untouched files:
- `src/world/narromine.js`
- `src/world/narromine-buildings-data.js`
- `src/world/narromine-kieraths.js`
- `src/world/narromine-layout.js`
- `src/main.js`
- `package.json`

---

## Captured Locations (Deterministic Camera Poses)

| # | Location ID | Location Title | Camera `(x, z)` | Target `(x, z)` | Yaw (rad) | Compass |
|---|---|---|---|---|---|---|
| 1 | `royal-hotel-dandaloo` | Royal Hotel — Dandaloo Street | `(-4825.50, -545.00)` | `(-4804.40, -542.00)` | `-1.712030` | `98.09° (E)` |
| 2 | `narromine-hotel-corner` | Narromine Hotel — street-facing corner | `(-4795.00, -692.00)` | `(-4820.50, -712.50)` | `0.893669` | `308.8° (NW)` |
| 3 | `post-office-entrance` | Post Office — front entrance | `(-4783.50, -960.50)` | `(-4791.22, -947.50)` | `2.605710` | `210.7° (SW)` |
| 4 | `coles-kieraths-dandaloo` | Coles and Kierath's Dandaloo frontage | `(-4764.50, -898.00)` | `(-4794.00, -892.00)` | `1.771449` | `258.5° (W)` |
| 5 | `kieraths-arcade-courtyard` | Kierath's arcade — pedestrian courtyard | `(-4806.50, -916.60)` | `(-4828.00, -922.00)` | `1.324724` | `284.1° (W)` |
| 6 | `ordinary-narromine-street` | A representative ordinary Narromine street (Nymagee St) | `(-4902.00, -977.50)` | `(-4945.00, -984.00)` | `1.420769` | `278.6° (W)` |

Each location is captured across:
- **Viewports:**
  - `desktop`: `1280×800` (`deviceScaleFactor: 1`, `isMobile: false`)
  - `mobile`: `393×852` (`deviceScaleFactor: 1`, `isMobile: true`, `hasTouch: true`)
- **Lighting Times:**
  - `morning`: `08:00` (`minute = 480`, `weather = clear`)
  - `midday`: `12:30` (`minute = 750`, `weather = clear`)
  - `late-afternoon`: `16:45` (`minute = 1005`, `weather = clear`)

---

## Commands to Run on Fedora Linux

### 1. Run Full Visual QA Capture (36 Screenshots + Contact Sheet + Manifest + HTML Report)

```bash
cd repository-town
node tools/narromine-visual-qa/run.mjs
```

Optional CLI flags:
- `--out-dir <path>` — Output directory (defaults to `test-results/narromine-visual-qa`, which is excluded from Git and production builds).
- `--url <http://...>` — Connect to an already-running server instead of starting an ephemeral local static server for `dist/public`.
- `--build` — Force a fresh `node tools/build.mjs` before capturing.
- `--baseline <dir-or-manifest.json>` — Compare captured screenshots against an earlier baseline run and write `comparison.json` + `diffs/*.png`.
- `--locations <ids>` — Comma-separated subset of location IDs or numbers (e.g. `1,3` or `royal-hotel-dandaloo,post-office-entrance`).
- `--viewports <desktop,mobile>` — Comma-separated viewport filter.
- `--times <morning,midday,late-afternoon>` — Comma-separated lighting filter.

### 2. Compare Two Existing Runs Without Re-capturing

```bash
cd repository-town
node tools/narromine-visual-qa/run.mjs --compare-only \
  --baseline test-results/narromine-visual-qa-baseline \
  --candidate test-results/narromine-visual-qa
```

### 3. Run Automated Verification Tests

```bash
cd repository-town
node tests/narromine-visual-qa/visual-qa.mjs
```

---

## Generated Outputs

Inside `test-results/narromine-visual-qa/`:
- `screenshots/<locationId>__<viewport>__<lighting>.png` — Individual deterministic PNG captures (`36` files in a full run).
- `contact-sheet.png` — High-resolution labelled contact sheet showing all 6 locations across Desktop/Mobile and Morning/Midday/Late-Afternoon with coordinates and WebGL metrics.
- `manifest.json` — Machine-readable JSON manifest containing commit SHA, branch, camera coordinates, compass direction, time, viewport, separated desktop/mobile performance stats (FPS, frame-time `min/p50/p95/p99/max`, WebGL draw calls, triangle counts), daylight progression checks, camera reproducibility proof, and diagnostic checks.
- `report.html` — Self-contained HTML visual review report for inspecting each location, performance table, daylight progression, and optional baseline comparison.
- `comparison.json` & `diffs/*.png` — Generated when `--baseline` is supplied.

---

## Photographic Reference Policy

Per `data/narromine-photo-references.json`, only verified, appropriately licensed/permissioned ground-level photographs may be linked. When no reviewed licensed record exists for a location, `referencePhoto` is explicitly left `null` in `manifest.json` and marked empty in `report.html` — reference imagery is **never** fabricated.
