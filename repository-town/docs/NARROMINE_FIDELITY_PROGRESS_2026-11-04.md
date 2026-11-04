# Narromine photorealism programme — implementation checkpoint
Date: 4 November 2026 · Owner: JoshMemory / repository-town
Status: **Phase 1 inventory and offline progress map IMPLEMENTED in feature branch; remaining phases IN PROGRESS or BLOCKED by evidence**.
Do not mark the whole town as photorealistic or visually verified.

## Completed, reproducible in the branch
- `data/narromine-building-inventory.json`: all **219 currently exported OSM building footprints** and **8 hand-detailed building sites** (227 source register records, **not** 227 independent standing structures). OSM indices `0–218` retained for bridging existing LiDAR keys. Stable `NR-OSM-####` IDs are reused by footprint fingerprint across regenerated exports; `NR-SITE-<existing-ID>` keeps each detailed landmark's identity.
- Coverage metadata: source bbox, a four-by-four density review grid, overlapping detailed-site relations, missing-prior-ID log, provenance and uncertainty. The entire real town is **not** covered by the current OSM export. Blank grid cells are **review candidates**, not proof of absent buildings.
- 83 OSM outlines with LiDAR heights and 33 detailed-object height records, correctly split **27 building parts + 6 verandahs**. LiDAR p5 and p98 are *quantiles of classified building returns*, not surveyed roof-break or eave lines. Data from 2011/2023 can predate alterations.
- All public-safe records carry known geometry, storeys and roof descriptions only where actually represented, colours/signs when present in already-committed data, and explicit missing façade/material/photo evidence. None is labelled visually verified.
- `data/narromine-photo-references.json`: empty, explicitly licensed-evidence catalogue with sample schema. Source photographs mentioned in historic notes have **not** been imported or assumed licensed.
- `src/narromine-progress.html`: interactive map using offline source road geometry plus building polygons. Search, filtering, zoom, source/audit details and inspectable record IDs. Public build copies the JSON beside the map.
- `tools/narromine-inventory.mjs`: reproducible generator; `--check` detects stale data. `tests/narromine-inventory.mjs` verifies baseline coverage, counts, ID uniqueness, provenance, missing photo claims and source consistency. Added to `test:town`; `build.mjs` checks and copies canonical output.

## Phase-by-phase acceptance and open work
| Phase | Status | Next evidence-based acceptance |
| --- | --- | --- |
| 1 — Building register/map | Implemented, pending GitHub CI and public browser verification | Verify interactive selection on desktop/mobile; audit further real buildings beyond OSM scope |
| 2 — Reference collection | Catalogue schema implemented; **two 2017 CC BY 3.0 archival metadata records (one building-linked); no current-building validation** | Obtain original/permissioned photo views with author, capture date, licence and viewpoint; review heritage dates |
| 3 — Unique façades and architectural tiers | Existing 8 detailed sites, mapped extrusion for most others; no new verified façades this branch | Build source-controlled per-building geometry/roof details only when evidence exists; test texture rights and LOD |
| 4 — Street-by-street fidelity | Coles/Kierath's/Post Office/Royal/Narromine Hotel/Church models already present; not newly certified | Begin with Dandaloo, shop-by-shop reference comparison; then civic/residential/industrial precincts |
| 5 — Sun/weather/materials | Existing `src/world/sun-shadows.js` adaptive lighting preserved, unmodified | Validate local solar direction, seasonal shadow lengths, mobile frame cost and material colour management against references |
| 6 — Visual QA | Data schema and coverage tests added; visual comparison not conducted | Licensed view manifests, controlled game screenshots and human acceptance; do not auto-mark photo similarity as truth |
| 7 — Release | Feature branch, tests wired | Run existing integration/browser/privacy checks, merge on green CI, deploy and inspect hosted game; explicitly record remaining unverified work |

## Survey gap priorities
1. **Dandaloo Street:** compare every mapped frontage with cadastral/aerial building alignment. Measure roof setbacks, verandah columns, door locations and sign era. Keep ten numbered Kierath's tenancies anonymous until verified; the corridor and rear car park must remain traversable.
2. **St Mary's / 86 Dandaloo:** maintain distinct identity; avoid conflating one church with the other. Earlier records incorrectly assumed both were Anglican.
3. **Homes:** many are procedural filler rather than surveyed. Do not assign owners, private interior details or house numbers.
4. **Coverage:** current OSM export bbox is `-32.25,-32.218 latitude / 148.22,148.262 longitude`. Review airport, outer blocks and streets before claiming all Narromine is present.
5. **Photo rights:** Google Street View is contextual browsing only, not a bulk asset or derivative 3D source. Use NSW CC BY 4.0 data and photos with explicit reuse rights; record third-party attribution.

## Run and audit
From `repository-town/`:
```sh
node tools/narromine-inventory.mjs --check
node tests/narromine-inventory.mjs
node tests/narromine-layout.mjs
npm run build
npm run check:privacy
npm run serve
```
Then open `/narromine-progress.html`. Browser screenshot and production deployment are still separate verification steps.

**What this does not claim:** all Narromine buildings mapped; photo-realism; surveyed heights; legally approved third-party photos; correct unknown private façades; all browser tests passed; or deployed `main`.

## Phase 2 pilot — source licence audit (4 November 2026)

**First two real archive entries, linked by source file rather than scraping imagery:**

- [Royal Hotel at Narromine, 28 November 2017](https://commons.wikimedia.org/wiki/File:Narromine_Royal_Hotel_001.JPG) — photo by **Mattinbgn**, CC BY 3.0 Unported, camera -32.235436 / 148.238908. Linked to `NR-SITE-royal-hotel` by the source description; no heading or exact camera height invented.
- [Dandaloo Street streetscape, 28 November 2017](https://commons.wikimedia.org/wiki/File:Narromine_Dandaloo_Street_002.JPG) — photo by **Mattinbgn**, CC BY 3.0 Unported, camera -32.232833 / 148.239319. Contextual record intentionally **not** attached to individual building IDs until someone reviews the visible façades.

Licence: https://creativecommons.org/licenses/by/3.0/ — appropriate credit, licence URL and indication of modifications are mandatory for reused assets. We link to the original Commons file descriptions, do not copy photos into the game, and never assume 2017 imagery proves a 2026 tenant, sign or shopfront. The register's `visualQa.status` stays `not-reviewed` even with a linked photo. Metadata verification is not a visual/architectural validation.

The online survey map now displays archive references and their licence/capture date for the selected building. `tools/narromine-inventory.mjs --check` deterministically links only named references to existing stable IDs. Remaining source coverage and all visual approvals are open.
