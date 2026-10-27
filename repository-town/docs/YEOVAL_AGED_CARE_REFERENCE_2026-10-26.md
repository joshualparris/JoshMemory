# Yeoval Aged Care — public-reference 3D reconstruction (26 October 2026)

**Real facility:** Yeoval Aged Care, 3–7 Lord Street, Yeoval NSW 2868. **Use:** approximate architectural game model in Repository Town, not a verified building information model. No resident details, restricted staff records, emergency routing, or security floor plan should be inferred.

## Grounded geometry and appearance

1. User-supplied Google Maps aerial screenshot (October 2026) shows the site bounded by Lord Street to its north, with a long northern block and a shorter parallel southern block, a covered connection in the middle, west parking/access and cylindrical tanks by the eastern side. The screenshot scale indicates about 20m per 50ft marker. It is **not** a survey; the dimensions below are provisional measurements estimated visually.
2. User-supplied June 2026 Google Street View shows a brick, single-storey building, pale pitched corrugated roof, projecting covered north entrance with a gable, supporting posts, a glazed entrance and UPA signage. The photo is evidence for the frontage, not the building's hidden rooms.
3. Public facility-era photograph published approximately nine years previously depicts a north-oriented covered entry and front parking/landscaping but may not represent the renovated site in 2026.
4. Model estimates: northern block approximately 79×19m, connector ~7×7m, southern block ~43×18m offset 11m west, plus a possibly separate western outbuilding. Estimated from the screenshot's 20m horizontal scale bar of roughly 130px (approximately 6.5px/metre), not a georeferenced survey. **These are construction placeholders, not exact dimensions.** Actual roof profiles, support spacing, number of windows, car bays, tank locations and site boundaries must be remeasured against georeferenced imagery or a supplied architectural plan.

## Grounded operations, interior and history

- UPA Yeoval Aged Care's public information: residential nursing care, single and shared bedrooms, meals, resident services and co-located community health/home-care services. Source: https://www.upa.org.au/locations/yeoval-aged-care/
- QPS Benchmarking's UPA Yeoval renovations description says two buildings were joined, rooms reconstructed, and the dining area substantially revamped. This strongly supports showing distinct connected wings and an accessible internal connector. Source: https://qpsbenchmarking.com.au/upa-yeoval-nursing-home/
- Independent aged-care listings describe residential aged care and public services; bed numbers and names vary by source/date, so the model deliberately does **not** assert an exact current bed count.
- Shared dining, sitting areas, reception, handrails, care beds, bedside call buttons and accessible passage are physically plausible typologies. **Exact positions, resident room count, ensuite layouts, care-station positions, medical storage, security systems and emergency exits are NOT verified and must remain labelled illustrative.**

## Implementation mapping

- `src/world/yeoval-campus.js`: original low-poly building shell, northern entrance, approximate wings, external scenery, on-foot clear entry.
- `src/world/yeoval-interior.js`: walkable interpretive layout with linked corridors, residential bays, communal dining, visitors' reception, furniture and labelled source/uncertainty exhibits.
- `src/main.js`: independent enter/leave logic with exterior exit on the northern front, never a rear wall.
- `tests/yeoval-campus.mjs`: footprint/entrance/circulation geometry regression.
- Site local +Z faces the real Lord Street frontage, rotated 180 degrees on town ground so visitors approach in town-world –Z. Campus is **outside** the existing 8×26 lot core, north of row A.

## Work needed before saying '100% accurate'

Georeferenced parcel polygon, latest orthophoto with known coordinates, laser/photogrammetry or verified plans, room-by-room public access details, measured roof pitches/façade elevations, validated collision/clearance paths, accessible ramp gradient and toilet geometry, independent web/mobile live playtest. A public recreation should never model sensitive resident-specific information or imply it can serve for clinical or evacuation use.
