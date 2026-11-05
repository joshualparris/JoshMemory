# Narromine central Dandaloo Street — unresolved frontage survey register

**4 November 2026 • issue [#332](https://github.com/joshualparris/JoshMemory/issues/332) • feature claim `NR-GAP-REGISTER-001`**

This is a concrete inventory and evidence gate **not a claim that every building is now photorealistic**. Source of truth: `data/narromine-mainstreet-evidence-gaps.json`, generated from `data/narromine-building-inventory.json`; tested for off-by-one ID safety.

## Exactly three remaining generic mapped shells identified by the audit

| Stable ID | Zero-based OSM index | Centre WGS84 (lat,lon) | 2023 LiDAR eave/ridge proxy | Verified status |
|---|---:|---|---|---|
| **NR-OSM-0165** | 164 | -32.2321415, 148.2398683 | 3.72 / 4.56 m | Mapped geometry only, no modelled verified frontage |
| **NR-OSM-0168** | 167 | -32.2327119, 148.2397664 | 3.19 / 5.53 m | Mapped geometry only, no modelled verified frontage |
| **NR-OSM-0169** | 168 | -32.2327822, 148.2399179 | 3.36 / 5.57 m | Mapped geometry only, no modelled verified frontage |

**Off-by-one warning:** `NR-OSM-0165` means array index **164**, not 165. The latter is a *different* polygon. Verified through current inventory before implementation. LiDAR eave and ridge figures are **percentile proxies** from 2023, not measured architectural heights. OSM outlines are mapped polygons, not a land-title survey.

For each building, the machine-readable register separately tags **footprint = mapped-OSM**, **height = 2023-LiDAR-envelope**, and **roof shape, materials, colour, storeys, windows, doors, awning, signage, camera/viewpoint = unverified**. It records the required next survey/photo input and explicit lack of an image reuse licence. No current business tenant or real home occupancy is asserted.

## Existing integrated sites — do not reconstruct a second time

- North-West Dandaloo block [#347](https://github.com/joshualparris/JoshMemory/pull/347): detailed builder for `osm:179,180,183,184,185`, plus Baptist Church, Battlers Mate and Aqua West. Footprints and LiDAR proxies from source; window and fascia interpretations are *photo-matched estimates*, not surveyed.
- Physiotherapy [#352](https://github.com/joshualparris/JoshMemory/pull/352): `osm:186`, corrected mapped facing edge, estimated curved/stepped parapet, glazing and canopy.
- [Dandaloo streetscape #336](https://github.com/joshualparris/JoshMemory/pull/336) and [southward extension #348](https://github.com/joshualparris/JoshMemory/pull/348) cover planting, kerbs, road markings and lamps. These are **not** frontage evidence.
- [Royal Hotel #340](https://github.com/joshualparris/JoshMemory/pull/340) and existing Narromine Hotel/Post Office geometry are separate owner claims.

## Exact steps before modelling the three gaps

1. Photograph each entire façade front-on **and** from both ends of the footpath (permission-cleared, no private occupants), with capture date, exact WGS84 camera location, compass heading, camera height and approximate field of view. For roof geometry, a rights-cleared oblique aerial view or survey is necessary. Google Street View screenshots remain *review only*, and zero pixels are included here.
2. Match the photos to the three **stable IDs**, using current OSM boundary/NSW cadastre and known LiDAR envelopes. Confirm actual road-facing polygon edge, not only a building centroid.
3. Measure physical or image-calibrated door/window/awning/roof edge geometry; record **attribute-by-attribute evidence tier** and current-vs-historical tenant dates. Use reasonable uncertainty intervals, no centimetre-accurate unsupported heights.
4. Model and test each building in its own evidence-driven module with **one** mapped collision shell (never duplicate generic frontage). Visual QA on desktop 1280×800 and Android 393×852, calibrated midday/dusk views, walking/traffic and no z-fighting.
5. Attach before/after *game-only* screenshots and owner-verified observation notes to #332. Do not close until frontage coverage is demonstrably 100% for the selected ~100m block and live release SHA is verified.

## What this release contributes

- Builds an immutable review queue of the **correct three polygons** from current source; **does not** fabricate facades to make a visual metric green.
- `node tests/narromine-mainstreet-evidence-gaps.mjs` verifies the stable names, zero-based indices, footprint centre/fingerprint and LiDAR envelope against the canonical inventory; preserves unverified status and checks that no existing NW/Physio custom builder is counted as missing.
- Does not modify `narromine.js`, road surfaces, Coles, player controls, image assets, render batches or collision meshes.
- Evidence sources: project OSM export 3 Nov 2026 (ODbL), NSW 2023 airborne LiDAR (CC BY 4.0), existing procedural builder provenance. No redistributable facade image for these three was established; all rooftop or material assumptions remain unverified.
