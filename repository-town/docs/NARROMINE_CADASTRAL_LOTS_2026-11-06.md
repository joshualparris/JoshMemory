# NR-LOTS-001 — Narromine public cadastral lot outlines

**Status:** NSW source data imported and source hash verified; build, browser, merge and live release are separate acceptance gates.

## What this adds

- **2,102 source features**, 2,004 usable lot polygon rings (some rural lots lie outside the actual playable town view).
- Public **lot number and plan label only** — no owner, private title, householder or assessment information.
- Stored at **0.1 m** local-coordinate resolution, using the same OSM anchor, map transform and `toWorld` as all of Narromine. Source polygons were simplified with **0.3 m** Douglas–Peucker tolerance.
- Provenance: NSW Spatial Services **NSW_Cadastre MapServer / Lot layer 9**, © State of New South Wales (NSW Spatial Services), **CC BY 4.0**; exported **5 November 2026**.
- Original source code and data were supplied by Josh in `narromine-lot-boundaries-for-chatgpt.zip`, prepared by Claude. Reimported through official ArcGIS public API on the feature branch. **Byte-for-byte SHA-256 match** with supplied data: `290870ea2c3aa5d8292fcd174406598f6465fb6032dbd0bf5048cff5bbd1b75d`.
- Official source endpoint: https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Cadastre/MapServer/9
- The independent `narromine-public-lots.js` dataset's 16 civic/business venue centroids is used as a geographic cross-check; never modified.

## How to see the boundaries

Normally there is **no extra mesh or collision**. Append `?lots=1` to the Repository Town game URL, then travel to Narromine. The thin yellow lines are a **debug/survey overlay only**, clipped to `REGION`. They do not change land ownership, pedestrian access, road layout, collisions, cars, trains or NPC schedules.

Run `node tests/narromine-lots.mjs` to check geometry, clipping and venue alignment. Full `npm run test:town` includes that check. The desktop/emulated-phone WebGL capture script records paired screenshots but cannot by itself prove legal survey-grade positioning.

## Important limitations

A legal lot line **does not mean a fence, hedge, brick wall, driveway, kerb or building physically exists at that location**. Do not produce real-world structures solely from these lines. NSW's Digital Cadastral Database is authoritative for cadastral mapping, not a precise site survey or guaranteed current as-built roadworks. Fences and shopfronts require location-specific photograph, aerial, LiDAR or field evidence and independent geometry review.

Regeneration: `node tools/narromine-lots.mjs --fetch` (public NSW ArcGIS, paginated) or `node tools/narromine-lots.mjs lots-1.geojson lots-2.geojson lots-3.geojson` from locally sourced NSW files. This is a generated asset: do not hand-edit `src/world/narromine-lots-data.js`.

**Next stage (not implemented by NR-LOTS-001):** join mapped buildings to their relevant parcel IDs, identify wrongly placed guessed buildings, then test/evidence corrections without moving the original authoritative geometry or fabricating fences.
