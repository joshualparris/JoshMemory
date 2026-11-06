# Narromine Mapillary sign-placement safety audit — 6 November 2026

**Status: partial; source-only geometric safety correction, NOT certified 2026 photo-matched sign positions.**  See the numbered Narromine realism backlog and Dandaloo Street PHOTO-01..06 [issue #424](https://github.com/joshualparris/JoshMemory/issues/424).

## What is known
- The committed data contains **312** historical Mapillary feature detections, of which **245** are sign/traffic-signal types and the remainder are benches, markings, cabinets, hydrants etc.
- Mapillary locations come from *automatically triangulated feature coordinates* in historical street-level photographs (some as old as 2016, most through 2025-02-25); their exact pole positions, direction, active status and 2026 existence are NOT field-surveyed. They are not to be treated as ground-truth GPS for statutory signage.
- A signed perpendicular projection to the already snapped road centreline and width flags **44** possible sign or traffic-light posts on or within a **0.35 m guard band** of the nominal carriageway, including four KEEP LEFT detections which may legitimately belong on traffic islands. This is a different geometric test from Claude's original **45 carriageway observations**; that difference is due to the projection/guard definition, **not a verified correction**.
- Existing renderer already makes these Mapillary objects non-collidable. The problem reported by Josh was visible posts apparently standing in the road, not hidden vehicle physics walls.

## Implemented safety behaviour
- Normal gameplay **withholds the 44 questionable visual objects** pending ground-truth comparison. It does not fabricate a convenient 2026 sign location or a replacement signpost on a guessed verge. Keep-left island candidates are withheld *only until their true median refuge geometry can be checked*. All 201 unflagged sign-like source observations continue to render.
- Source data and Mapillary feature IDs, observation dates, original X/Z positions, road headings/widths and all non-sign feature objects remain **unchanged**. Inferred road/traffic law, OSM road tags, painting, lane use, traffic signal logic and collision are **not changed**.
- Use **`?mapillarySigns=raw`** in an isolated visual comparison to render every original triangulated pin, even if projected onto the carriageway; **this is a QA-only view**, not evidence of an actual obstruction. Missing signs should not be described as physically absent in Narromine.
- Regression `tests/narromine-mapillary-sign-lane.mjs` proves exact 245/44/201 count, opt-in raw geometry difference, preservation of 312 original source records, zero changes to road marking/furniture detections, and 4 unresolved median signs. NSW regulatory sign-vector source and face tests remain unchanged.

## To reach real-world sign fidelity (not yet done)
1. For each flagged feature ID in exported `SIGN_LANE_REVIEW`, use **licensed, dated image evidence** through the **existing token-protected** `/api/mapillary` proxy and compare against a newer vantage point. Do not put the Mapillary token into source or query strings. Proxy queries must stay in Narromine and must respect CC BY-SA / photographer attribution. This agent could not independently authenticate all 44 image captures.
2. Verify actual sign post, nearby kerb, median/refuge island and road centreline for each observation, including STOP/GIVE WAY and speed signs, before placing it. Test whether a sign is at a different side road intersection rather than snap it to an unrelated main-road shoulder.
3. Store individual confidence, public source/observation date, permitted image URL, placement and verified geometry separately. Add it to runtime only where photo confirmation supports location and ownership; preserve historical raw feature for audit.
4. Re-run desktop + phone-sized Chromium street-level comparisons, real car and walk tests, road-sign audit and latest published source SHA before claiming visual completion. An image showing a road sign from 2019 does not prove its presence in November 2026.

**No uploaded photos, credentials, or copied Mapillary copyrighted image pixels are committed.**
