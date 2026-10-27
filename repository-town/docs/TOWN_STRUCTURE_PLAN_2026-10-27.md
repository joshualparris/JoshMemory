# Repository Town structure plan — 27 October 2026

## Status and intent

**Conceptual game-world planning, not a statutory rezoning, cadastral survey or engineering certification.** The existing 26-column × 8-row settlement is preserved. This pass reserves varied land parcels around its edges and sketches a perimeter collector system; it does not yet connect the new roads to vehicle pathfinding, establish driveways, or place buildable structures.

## Existing-town audit (source: `src/world/town.js`, `town-expansion.js`, `traffic-signals.js`)

- Existing nominal spacing: 26m east–west, 46m north–south. Approximate house lot area if treated as a full 26 × 46m rectangle: **1,196m²**, not an actual surveyed lot. Streets, sidewalks and frontage margins make that estimate unsuitable as a title area.
- 26 columns × 8 rows; 8 east–west road bands and cross avenues every five columns.
- Expansion services are concentrated along row 7 north frontage, including aged care, vet, rural supply, nursery and community services. This mixes uses that need different servicing and noise buffers.
- Existing crossing `high-street-avenue` is at (52,177) with a 72-second traffic/pedestrian phase; signal justification and pedestrian desire lines have not been demonstrated by traffic counts.
- No demonstrated intersection traffic volumes, turning-path modelling, road reserve cadastral widths, stormwater catchments, grade survey, flood study, emergency access audit, transit demand, pedestrian crash analysis or legal zoning map.

## Planning principles

1. **Structure before subdivision:** identify a centre, residential neighbourhoods, employment lands, recreation, rural fringe, major road links, open-space corridors and infrastructure easements before dividing lots.
2. **Road hierarchy:** local streets provide property access and low-speed walking-friendly movement; collectors distribute traffic; arterials carry through trips. Do not convert every street into a fast through-route.
3. **Intersections:** use priority T-junctions for quiet local streets; consider roundabouts only when volumes, geometry, sight lines and vulnerable-user safety support them. Signals are justified by crossing needs and traffic studies, not decoration.
4. **Proximity and buffers:** walking access to schools, shops, health care and parks; separate truck-generating workshops, depots and industry from quiet residential uses through setbacks, access orientation and landscape buffers.
5. **Variable lot scale:** smaller residential lots and medium density near walkable services, family housing beyond, larger residential and small holdings at the edge, and genuine farmland outside the urban growth boundary.
6. **Water and climate:** reserve natural drainage lines and flood storage before constructing streets or buildings; shade streets, minimise heat island effects, protect waterways and leave space for maintenance.
7. **Staging:** build infrastructure before enabling occupied development. Do not present conceptual vacant land as immediately serviced or developable.
8. **Emergency and universal access:** check swept paths for fire appliances, waste trucks, buses, ambulances and deliveries; accessible walking routes and crossings; no dead ends without turning facilities.
9. **Rail interface:** preserve the existing rail safety envelope and avoid introducing roads that cross tracks without separate railway safety design.

## Proposed districts (illustrative zone labels, not confirmed legal zoning)

| Parcel | Approximate dimensions | Concept | Zone-like descriptor |
|---|---:|---|---|
| W-R1 | 110×86m | Western cottages, future subdivision | R2 |
| W-R2 | 110×102m | Family housing | R2 |
| W-C1 | 110×92m | Community reserve and park | RE1 |
| E-B1 | 110×100m | Service trades and small businesses | E3 |
| E-L1 | 110×128m | Light industry and freight service | E4 |
| E-R1 | 110×92m | Rural transition | RU4 |
| N-C1 | 180×115m | Civic services and utility reservation | SP2 |
| N-R1 | 170×115m | Medium-density homes near centre | R3 |
| N-R2 | 160×115m | Low-density homes | R2 |
| S-R1 | 190×120m | Large-lot homes | R5 |
| S-AG1 | 220×130m | Market gardens and horticulture | RU4 |
| S-AG2 | 220×160m | Grazing and agricultural land | RU1 |

**Important:** A 220×160m reserve is only 3.52 hectares, a small hobby-scale holding rather than a realistic large commercial grazing farm. A true broadacre farm needs a much larger streaming/out-of-core world tile system, and should not be misrepresented by these parcels.

## Proposed roads and intersection priority

- Western Collector, Eastern Collector, Northern Link and Southern Link: visual reservation strips for future connectivity.
- Western and Eastern Access: conceptual local connectors. Existing road geometry, intersection tie-ins and navigation are **not implemented**.
- First study: map all existing road ends and rail crossings, then establish safe perimeter connections and pedestrian crossings.
- Second study: check freight and emergency-vehicle routes from workshops, rail depot, farm supply and aged care.
- Third study: count simulated vehicles, pedestrians and bicycles before considering a new roundabout or signal. No new traffic signal or roundabout is justified by current evidence.

## Road naming

Follow NSW Address Policy and User Manual §6.7: short, pronounceable, unique names with locally relevant geography, history, flora or fauna; avoid duplications and misleading road types; consult relevant Aboriginal communities before adopting Aboriginal-language names. NSW councils name local roads and GNB reviews proposals; the game's names are fictional placeholders, not approved names.

For new roads, use a provisional ID such as `WC-01` until alignments and road function are fixed. Candidate *fictional* themes include Ironbark, Box Gum, Creekside and Orchard; check duplicates before adopting any names. `Collector` and `Link` labels in code are functional descriptions, **not gazetted street names**.

## Sources

- NSW LEP and zoning: https://planning.nsw.gov.au/plans-in-nsw/local-planning-and-zoning/making-and-amending-leps
- Austroads Guide to Road Design: https://austroads.gov.au/safety-and-design/road-design/guide-to-road-design
- Austroads intersections 2026: https://austroads.gov.au/publications/road-design/agrd04
- Austroads signalised/unsignalised intersections 2026: https://austroads.gov.au/publications/road-design/agrd04a
- NSW road naming: https://www.nsw.gov.au/about-nsw/place-naming/roads
- NSW Address Policy: https://www.spatial.nsw.gov.au/__data/assets/pdf_file/0005/232808/NSW_Address_Policy_and_User_Manual_2024.pdf
- Federation Council engineering guidelines (local example, **not Dubbo's applicable standard**): https://www.federationcouncil.nsw.gov.au/files/assets/public/document-library/corporate-documents/plans-amp-strategies/19-10609-engineering-standards-2019-part-2-design-of-roads.pdf

## Implementation and QA limitations

- `src/world/town-planning.js` creates land-use tiles and road strips, not built subdivisions.
- `src/world/town.js` adds them to the world group and returns their metadata.
- Existing centre remains unchanged. New strips are intentionally non-colliding until road connections and access are designed.
- Need production build, mobile frame-time measurement, visibility inspection, tests of parcel overlap, rail clearance, existing vehicle routes and bounds before treating this as finished.
