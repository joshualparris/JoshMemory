# Repository Town: 195-dwelling development due-diligence and build status
**27 October 2026 · stage D2 · conditional game geometry only — no statutory approvals**

## Executive finding
The expanded Wattle/Banksia/Grevillea/Acacia estate is **one connected in-game network** with 195 procedurally differentiated country-inspired houses on 195 residential parcels. The simple game checks show adjoining road frontages, no in-game overlap with road reserves and building footprints within individual lots. **This is not an approved NSW subdivision and no individual building has passed formal NCC/BASIX certification.** Official Dubbo lot size/zoning/hazard overlays and local engineering standards have **not** been mapped to a real cadastral site.

### Definitive as-built code sources
- `src/world/masterplan-model.js`: authoritative coordinate list for 195 lots and eight proposed road centreline definitions.
- `src/world/masterplan-built.js`: in-game roads, building footprints, numbering and 3D scene.
- `src/world/country-homes.js`: one architecture *cue* per country, 195 unique envelope descriptions; neither countrywide generalisations nor 195 archival architectural reproductions.
- `src/world/country-interiors.js`: compact **ground-floor** kitchen/living, bathroom/laundry and bedroom; stairs, storey changes and real service supply are not implemented.
- `src/world/masterplan-compliance.js`: dynamic per-lot screening and non-certification; run `node tests/masterplan-compliance.mjs` and `node tests/country-interiors.mjs`.
- `tools/audit-masterplan.mjs`: traffic scenarios now use `plan.assumedDwellings` rather than hard-coded 48. **Older generated alternative-D.json and comparison.json remain historical 48-home artefacts until regenerated; never cite them as 195-home metrics.**

## Measurable design programme
| Item | Current code | Interpretation |
|---|---:|---|
| Homes | 195 | 48 original + 147 on 3 western rows |
| Parcels | 199 | 195 dwellings + campus, park, 2 employment |
| Residential land | 136,500 m² | 16 × 560 + 163 × 700 + 16 × 840 |
| Community campus | 9,600 m² | Use unapproved |
| Open space | 9,600 m² | Concept only, landscape plan absent |
| Employment land | 4,800 m² | 2 × 2,400 m²; zoning unverified |
| Total proposed parcel area | 160,500 m² | Excludes roads and other reserves |
| Proposed street width | 8 m carriageway in 20 m nominal reservation | **No Council acceptance or fire vehicle swept path** |
| Proposed street paths | 2 m per side | Gradients and DDA continuity not measured |
| Front setback in-game | 6 m from lot line | Not independently compared to Dubbo DCP for legal parcel |
| Dwellings with rendered upper levels | Some | Upper-floor stairs, structure, second exits not implemented or certified |
| Proposed streets | 8 | Wattle, Banksia, Grevillea, Acacia, Kurrajong, Bottlebrush, Silo, Saleyards |

### Traffic: stale 48-home estimate repaired
All numbers below are a **transparent sensitivity calculation**, **not** a trip-generation forecast:
- Low: `195×0.4+50=128` peak-hour trips across the development and assumed nonresidential users.
- Mid: `195×0.8+50=206` peak-hour trips.
- High: `195×1.2+50=284` peak-hour trips.
- An equal split among three entrances would imply **42.67, 68.67 or 94.67** trips per entrance; this is an illustrative assumption and cannot replace intersection turning counts, heavy vehicle analysis, school peak overlays or 95th-percentile queue modelling.
- Road closure tests explicitly report lots fronting a removed road. A connected centreline graph is **not** proof of emergency resilience or access to each driveway under closures.

## Actual Dubbo/NSW approval constraints — evidence required
1. **Land**: no actual cadastral lot, title, planning certificate, mapped zoning, minimum subdivision lot size, easements or legal site polygon is established. Fictional 560/700/840 m² lots are *not* approved automatically. Council's LEP land-zoning and lot-size maps govern a real site.
2. **DCP and neighbourhood design**: assess lot orientation and variation, park distribution and equitable access, active transport, privacy, visual amenity, setbacks, vehicle parking, landscaping and bins. Existence of a 6 m setback in code does not determine compliance.
3. **Traffic and civil design**: obtain Council's current engineering standards (Council says standards must be requested); run updated Austroads geometric/grade design, swept paths for emergency and waste collection vehicles, intersections/sight distances, pavement and parking checks.
4. **Water and sewer**: proposed roads have no detailed reticulation, backflow, capacity modelling, manholes/inverts, hydrants, emergency storage, outfall or connections to a legally established network. Every modelled parcel remains tagged `unserviced-design` and `buildable:false`.
5. **Stormwater**: no topographic survey, design rainfall/ARR catchments, pit and pipe hydraulics, flood-routing, legal discharge point, water sensitive urban design or downstream consequences assessed. Stormwater is a BLOCKER, not a minor visual omission.
6. **Electricity and telecommunications**: no actual transformer loading, HV/LV sizing, streetlight illumination model, provider connection approval, communications pit/duct or easement plan for the expanded estate. Game lighting and power simulation elsewhere do not prove 195 lots can be served.
7. **Climate and hazards**: flood planning, bushfire-prone land, soil bearing/groundwater/salinity, heritage and biodiversity must be screened against mapped real site evidence before design approval.
8. **Homes**: Class 1a assumptions only; actual classification depends on final use and occupancy. NCC **2022 Amendment 2** is currently adopted in NSW. Structure, bushfire protection where applicable, weatherproofing, wet areas, stairs, guards, fire/smoke, egress, termite protection, energy and plumbing all need professionally prepared evidence. No CAD plans, specifications or certifications exist.
9. **BASIX/NatHERS**: no dwelling has a BASIX certificate, whole-of-home energy/water schedule or thermal simulation. Representative wall colours and stylistic window models are not a substitute for glazed-area/orientation testing.
10. **Traditional materials**: pitched thatch, stilted homes, domes, narrow terraces, towers and courtyards must be adapted to Australian structure, termite, moisture, bushfire, fire separation and accessibility needs. Distinct-looking 3D geometry is not evidence of a real house typology's performance.

### Reviewed authoritative sources, as of 27 October 2026
- Dubbo Regional Council, [LEP 2022](https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/Dubbo-Regional-Local-Environmental-Plan-2022): zoning, lot size, flood, biodiversity, other spatial maps.
- Dubbo Regional Council, [Development Control Plan](https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/development-control-plan): Dubbo 2013 DCP with subsequent applicable amendments and precinct provisions.
- Dubbo Regional Council, [Engineering standards and drawings](https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/engineering-standards-drawings): notes redesign in progress and requests for full standards via DRC&ME; no engineer sign-off obtained.
- NSW Government, [NCC compliance](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code): NSW NCC 2022 Amendment 2 in force since 29 July 2025; transition planned 1 May 2027.
- NSW Planning, [BASIX residential sustainability](https://www.planning.nsw.gov.au/the-planning-system/buildings/sustainable-buildings-sepp/sustainability-standards-residential-development-basix).
- [Austroads Guide to Road Design](https://austroads.gov.au/safety-and-design/road-design/guide-to-road-design): current 2026 road geometry/design parts; Part 5A 2024 covers road-surface drainage.

## Release/quality acceptance criteria
Game tests can honestly assert:
- [x] 195 one-to-one country keys and 199 parcels in source.
- [x] Characterful geometric façades located in residential lots with frontage.
- [x] Connected road graph and no modelled parcel-reserve overlaps.
- [x] 195 country-home interior floor plans generated with fixture-fit and entry/exit smoke checks; **production browser verification remains separately required**.
- [x] Traffic sensitivity calculation references actual dwelling count in the audit tool.
- [x] Tests prohibit describing any lot/building as legally approved or fully serviced.
- [ ] Every exterior door and interior visitor route manually walked on desktop and physical Android handset.
- [ ] Upper storeys modelled with genuinely safe usable stairs and exits.
- [ ] Road drainage and culverts with surveyed grade/destination.
- [ ] Per-lot reticulated civil/electrical designs and provider capacity approvals.
- [ ] Surveyed, map-checked LEP/DCP feasibility and formal building safety reports.
- [ ] Professionally certified statutory approval (only relevant to an actual site, not the fictional world).

**Decision: GAME-CONCEPT geometry can be accepted, but `PLANNING APPROVAL = NO`, `BUILDING CODE COMPLIANCE = UNVERIFIED`, `SERVICE APPROVAL = NO`.**
