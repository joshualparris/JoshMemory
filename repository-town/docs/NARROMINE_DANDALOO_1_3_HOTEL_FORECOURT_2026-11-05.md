# DANDALOO-001.3 — hotel forecourt paving boundary (5 November 2026)

**Status:** Scoped correction / not full item 1.3. This fixes an existing geometric rendering flaw at the Narromine Hotel only. The whole Dandaloo corridor's paving, kerbs, ramps, gutters and verges still require measured photo/reference checks.

## Ground truth / uncertainty

- The Narromine Hotel's corner forecourt is an existing detailed polygon in `narromine-hotel.js`, with a continuous sealed apron observed in the owner's previously supplied Mapillary comparison. Prior [#401](https://github.com/joshualparris/JoshMemory/pull/401) removed the conspicuous footpath/kerb but used a **centroid-only** skip for the generic footpath pieces. Partial overlaps could remain, and whole fragments could be removed unnecessarily.
- [Narromine Shire Council / GHD Pedestrian Access and Mobility Plan, 14 August 2024](https://www.narromine.nsw.gov.au/Pedestrian%20Access%20and%20Mobility%20Plan%20%28PAMP%29_Redacted.pdf?downloadable=1), table 3.7 IDs **21** and **22**, reports uneven Dandaloo paving and an inaccessible kerb-ramp condition, and a missing pedestrian connection at the west Dandaloo/Nymagee corner. Appendix prioritisation proposes levelling/kerb-ramp upgrades and a new refuge. **These are observations and proposed works in 2024, not proof of completion or unchanged condition in 2026. Do not auto-add assumed compliant ramps or a crossing.**
- The separately dated [39 Dandaloo Street commercial photo](https://www.commercialrealestate.com.au/property/39-dandaloo-street-narromine-nsw-2821-2018019186) shows a green central reservation and discrete paved edge, but does **not** measure carriageway, verge or ramp widths. The [Royal Hotel photographic listing](https://www.realcommercial.com.au/sold/property-123-dandaloo-street-narromine-nsw-2821-503636578) shows its own concrete verandah ground; do not copy a guessed red paving treatment from one building to another.
- Photograph/view sources are used for comparison only, not game textures or redistributed assets; no Google credentials or proprietary imagery committed.

## Implemented interface

- New `narromine-forecourt-footpaths.js` ear-decomposes the **existing** 7-vertex forecourt into 5 CCW triangles, then uses `subtractConvex` already proven in `narromine-road-surfaces.js` to remove only surface polygon area actually inside it.
- Generic path fragments outside the forecourt retain their existing material, kind and road model; no changes to hotel model, parking, road markings, asphalt, crossings, kerbs, colliders or movement rules.
- Deterministic tests cover concave and reversed-winding polygons, overlapping/non-overlapping paths, area conservation, material preservation and clipping against the full mapped road surface set. Unlike a centroid test, exact overlap is independently checked for every retained surface.
- **Evidence still needed before full 1.3:** dated legal imagery for each side and segment, audited ramps/paving elevations and physical desktop/mobile WebGL walking & driving close-up; compare source SHA and released SHA and never declare survey-grade accuracy from these geometric tests.
