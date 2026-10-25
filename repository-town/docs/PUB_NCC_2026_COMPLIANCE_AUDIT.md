# The Merged Branch (B:pub; N8-S) — NSW October 2026 building-code and hospitality audit

**Prepared:** 25 October 2026 · **status:** source-code and published-rule gap audit · **decision:** **NOT CERTIFIABLE AS MODELLED** — numerous unrepresented systems and incompatible scene dimensions. **Not** an assertion of formal noncompliance by an actual physical pub, a building safety certificate, a completed hosted playtest or engineering approval. **No runtime/model edits made by this audit.** Existing pub interior/test coverage is attractive for a game but not a code-compliance evidence package.

## Applicable date, class and legal distinctions

NSW's applicable current construction code **as at 25 October 2026 is NCC 2022 Amendment 2**, which commenced **29 July 2025**. **NCC 2025 is planned to commence in NSW on 1 May 2027**, not in October 2026; applying it as mandatory now would be inaccurate. The NCC is performance-based, with NSW variations and potentially older law governing unaltered existing work. Exact requirements depend on design approval, location, actual uses, mix of classes, area, occupant count, height and whether new work is proposed. **No certificate/approved floor plan or fire safety schedule was in the audited game files.** Source S01 and S15.

Provisionally classify an ordinary public bar/bistro as **Class 6 under NSW A6G7**. If accommodation were added, higher-capacity public assemblies/gaming/entertainment expanded or another use introduced, the building class and related requirements must be **re-assessed**. In particular the separate Railway Hotel at I8 must not be mistaken for the N8-S pub. Source S02. The NSW Food Act 2003 and Food Regulation 2025, national Food Standards 3.2.2, 3.2.2A, 3.2.3 and a hotel liquor licence (if that is the selected licence) are additional to NCC building requirements. Council food registration and trade-waste approval are distinct.

**2026 fire maintenance:** NSW requires essential fire safety measures to be routinely serviced under **AS 1851-2012 from 13 February 2026**, or the relevant performance solution; exact covered measures are listed in each building's fire safety schedule. Annual Fire Safety Statements and competent inspections are not represented. This is not a universal requirement for sprinklers at every pub. Source S03.

## What was actually inspected

| Evidence | Observed finding |
|---|---|
| [`life.js`](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/src/world/life.js#L111) | N8-S `pub` (`B:pub`) The Merged Branch; trading hours simulated 11:00–23:00; purchases/restocking for pub food/drinks |
| [`shop-interior.js`](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/src/world/shop-interior.js#L111) | Real `pub` room uses `buildPubInterior` rather than generic scene |
| [`pub-interior.js`](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/src/world/pub-interior.js) | Bar counter, taps, six bar stools, three bistro tables with four seats each, lounge, fireplace, pool/darts, screens, back-bar fridge and drawn cold-room door |
| [`interior-kit.js`](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/src/world/interior-kit.js#L8) | Shared single room shell **14 m × 18 m**, 4.7 m high ceiling; only one front portal and `doors: []`; basic blockers/hotspots, not an NCC floor plan |
| [`townlife.js`](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/src/world/townlife.js#L169) | Pub external model about **14 m × 11 m**, ~7 m tall, with two tiers of windows; apparent upper façade floor has no pub upstairs in interior |
| [`shop-interiors.mjs`](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/tests/shop-interiors.mjs) | Current test checks furnished mesh count, one room, front aisle and interactable clearance. No measured capacity, toilet, kitchen, exit distribution, AS1428, food safety or fire-system test |
| [`coverage.json`](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/audit/electricity/coverage.json) | Electricity RTU-001 snapshot: `B:pub`, `N8-S`; interior six lights respond to power; **physicalServiceId=null, meterId=null** and no distinct building electric demand |

**Crucial geometry inconsistency:** the visual exterior depth (11 m) and the walkable interior depth (18 m) are not comparable as a certifiable single architectural plan. The apparent second row of glazing externally cannot be assumed to provide an actual upstairs storey, escape path or habitable room. No measured level/access/fire compartment metadata or permit drawings exist in the selected files.

**Crucial service inconsistency:** a menu claims a kitchen exists, but no actual kitchen room or associated cooking, utensils/handwashing/hot-water/waste drainage equipment is constructed by the pub-specific generator. Likewise, the cooling room is a **drawn door**, not an accessible cold-store room. These statements describe the model's implemented features, not a real building's installed equipment.

## Findings by code and operating domain

Interpret status: **not-modelled** = no such feature represented in the audited pub-specific generator/common kit; **geometry-conflict** = two models disagree; **partially-represented** = decorative or generic feature lacks functional evidence; **unverified** = the audit does not contain sufficient actual measured plans, approvals, or performance calculations. A failed or unknown evidence check **must not be labelled a definitive breach**.

| Stable task ID | Priority | Audit area | Source-supported observation | Status |
|---|---|---|---|---|
| RTPUB-001 | P0 | Classification, use, approval and building age | site is named pub, has bar and dining; no classified floor plan, approved use, DA/CC/OC or prior approval date in audited scene | **unverified** |
| RTPUB-002 | P0 | Exterior-to-interior dimensions and storeys | townlife.js pub facade 14 m wide × 11 m deep × ~7 m high with two glazing bands, vs interior-kit 14 m × 18 m single walkable room/4.7 m ceiling | **geometry-conflict** |
| RTPUB-003 | P0 | Occupant capacity and seating/loads | three four-seat bistro tables, six bar stools and sofa/chairs; no occupancy certificate, staff/dynamic-crowd capacity | **unverified** |
| RTPUB-004 | P0 | Egress route, door swing and exit count | interior-kit has a front exitZone width 2.1 m and doors:[]; no rear fire exit; pub has central aisle furniture collision | **not-modelled** |
| RTPUB-005 | P0 | Emergency lighting and exit signs | ordinary point/hemisphere and decorative wall lighting visible; no tested exit sign, emergency luminaire, power failure or escape-route contrast model | **not-modelled** |
| RTPUB-006 | P0 | Essential fire safety measures | pub scene has fireplace and room lighting but no identified alarm/smoke detection, portable extinguishers, hose reels, sprinklers (if required), fire blanket or appropriate kitchen suppression | **not-modelled** |
| RTPUB-007 | P0 | Fireplace, heat, flue and combustible finishes | open-looking decorative fireplace at side wall x≈−6.55 with nearby lounge furnishings; flue, hearth, clearances and combustion air unknown | **partially-represented** |
| RTPUB-008 | P0 | Fire safety schedule and maintenance AS 1851 | no building-specific fire safety schedule, routine inspection history, essential measures or annual fire safety statement evidence in gameplay files | **unverified** |
| RTPUB-009 | P0 | Accessible arrival, entrance and circulation | the kit provides a centre door gap and walkable spawn; threshold ramp, step-free path from footpath, turn space, AS 1428.1 clearances and tactile signs not assessed | **unverified** |
| RTPUB-010 | P0 | Accessible WC and ambulant fixtures | pub-interior.js creates one room and no WC, washbasin or accessible stall | **not-modelled** |
| RTPUB-011 | P0 | Public and staff sanitary fixture provision | no pub toilet cubicles, basins, urinals or separated patron/staff amenities in source | **not-modelled** |
| RTPUB-012 | P0 | Hot/cold water, waste drainage and backflow | no visible pub meter, handwash outlet, water heater, grease-waste pipe, traps, sewer lateral or backflow asset; town water is still aggregate | **not-modelled** |
| RTPUB-013 | P0 | Actual enclosed commercial kitchen | menu interaction claims meals prepared with a kitchen, but pub scene has no cooking room, ovens, cooking benches or doors to kitchen; menu-only | **not-modelled** |
| RTPUB-014 | P0 | Food preparation, warewashing and separation | no dedicated produce washing/food prep sinks, dishwashing/sanitising line, clean/dirty separation or documented temperature-safe benching | **not-modelled** |
| RTPUB-015 | P0 | Dedicated food handler wash stations | no kitchen/bar handwashing sink with warm running potable water, soap and single-use drying fixture | **not-modelled** |
| RTPUB-016 | P0 | Refrigeration and food cold chain | visual fridge and a slab labelled cold-room door; no walkable cool-room volume, thermometer, food storage zones, temperature logs or explicit pub power feed | **partially-represented** |
| RTPUB-017 | P0 | Kitchen exhaust and general ventilation | no hoods, exhaust ducts, roof termination, make-up air, kitchen ventilation interlock; decorative ceiling fans are not ventilation verification | **not-modelled** |
| RTPUB-018 | P0 | Trade waste, fat/oil/grease controls | no greasy waste drainage, grease arrestor, consent/permit or separate collection pathway | **not-modelled** |
| RTPUB-019 | P1 | Food refuse, recyclables, pest exclusion and cleaning | pub scene has menu and bar decoration but no sealed waste store, food/chemical segregation, pest barriers or cleaners' sink | **not-modelled** |
| RTPUB-020 | P1 | Site rainfall, drainage, roof and stormwater | pub exterior shell exists; no roof gutters/downpipes/site stormwater or surface drainage routing identified by this audit | **unverified** |
| RTPUB-021 | P0 | Site-specific electrical circuits/switchboard/RCD | RTU-001 B:pub reports physicalServiceId:null, meterId:null, no distinct customer demand; interior lights callback power-aware only | **not-modelled** |
| RTPUB-022 | P0 | Cooking fuel/LPG/natural gas eligibility and safety | no selected cooking technology, gas regulators, fuel supply, ventilation appliance metadata or shutoff; cannot presume town reticulation | **unverified** |
| RTPUB-023 | P1 | Structural footing, loads, wind and roof | exterior uses box meshes; no structure/design engineering, slab/footings, roof anchorage, imposed loads, NSW wind/climate or fire resistance documentation | **unverified** |
| RTPUB-024 | P0 | Fire compartmentation and upper-floor access | external upper glazing implies further level but interior has no first floor, stairs, lift, fire-separation/cool-room compliance analysis | **unverified** |
| RTPUB-025 | P1 | Indoor acoustic, odour and environmental impacts | pub, fireplace, lounge and patron activity in game; no calculated plant noise, exhaust or adjacent-premise noise controls | **unverified** |
| RTPUB-026 | P1 | Energy efficiency and insulation | visual ceiling, fans, cooler but no measured thermal envelope or NCC Section J equipment/controls/energy demand | **unverified** |
| RTPUB-027 | P1 | Emergency access, evacuation and staff procedure | no pub-specific evacuation plan, staff alarm action, evacuation muster/signage or fire-and-rescue access route in scene | **not-modelled** |
| RTPUB-028 | P0 | Hotel liquor licence conditions, free water, food availability | bar and meals menu are represented and fictional open hours 11:00–23:00; no documented licence/licensee display, free-water interaction or hours/conditions evidence | **partially-represented** |
| RTPUB-029 | P0 | Responsible service, minors and designated areas | hotspot prose says 'publican serves responsibly' but no age check, RSA workflow, refusal service or minors-authorised floor zones | **not-modelled** |
| RTPUB-030 | P1 | TAB/Keno signage and gaming boundary | TAB/Keno screen is decorative; no gaming machine meshes (not the same as a TAB/Keno screen), authorisations or responsible gaming controls | **partially-represented** |
| RTPUB-031 | P0 | Food registration, Food Regulation 2025 and FSS | lamb/pie/veg menu and supply economics exist; no Council food registration, Food Safety Supervisor, food handler training or evidence of safe food controls | **not-modelled** |
| RTPUB-032 | P1 | Allergen information, traceability and food handling logs | menu gives general dishes but no ingredient allergen disclosures, storage traceability, raw/cooked separation or temperature evidence | **not-modelled** |
| RTPUB-033 | P1 | Separate water/sewer/fire/public utility dependencies | pub lights have power callback but electrical asset registry lacks physical service, and water/sewer systems are aggregate game stocks | **partially-represented** |
| RTPUB-034 | P0 | Measured acceptance, access and legal-review gate | existing shop interior tests assert one room, colliders and reachable hotspots, not structural/egress/toilet/food/fire or legal certification | **unverified** |

## Highest-consequence gaps to resolve first

1. **Building/use evidence and geometry:** Class 6 basis, any upstairs, approved occupancy, real external/internal dimensions and surveyed exits must be internally consistent. Determine whether upper glazing is just architectural style or an occupied first floor.
2. **Egress and fire:** One front portal and decorative ceiling lights are not fire-evacuation design. Determine if the actual proposed occupancy/storey arrangement requires additional exits, escape routes, door hardware, emergency lighting/exit signs, alarms, fire control/mitigation and maintenance records. Do **not** assume a second exit is legally mandatory solely from this audit; model constraints are not a fire engineer's conclusion.
3. **Toilets and universal access:** Provide appropriate patron/staff and accessible/ambulant facilities and a measured accessible path, subject to the actual NCC Class 6 calculations and applicable access standard. Current single-room model has no toilets at all.
4. **Working pub kitchen:** Show a physically separate preparation/cooking/storage/wash-up area, clean/dirty segregation, dedicated warm-water handwashing station, refrigeration monitoring, food safety and cleaning controls, kitchen exhaust and safe cook-line operation where applicable. NSW Food Authority points to Code 3.2.3 and AS 4674:2004 for design and fitout. Sources S04–S06.
5. **Real utilities:** Link handwashing, cisterns, hot water, cooking, lighting, ventilation, refrigeration and cold room, bar water/taps and sanitary/drainage/grease controls to **individual** game power/water/sewer nodes. Existing RTU per-building utility work is not yet done.
6. **Operational permissions:** Hotel-type liquor licensing includes free water while liquor is served, food, displayed licensee/licence name, approved minors areas and RSA. Merely having 'responsible' written into the beer tap description does not implement these systems. Council says retail food premises including bars/hotels must register. If discharging liquid trade waste, Dubbo requires written approval. Sources S07–S09, S11, S14.

**Do not invent numeric design thresholds.** Toilet numbers, accessible fixtures, number and spacing of exits, egress travel distance, ventilation airflows, fire protection details, Section J parameters and grease treatment capacity depend on occupancy and actual equipment/building design. Obtain plans and apply the specific *current adopted* NCC provisions before treating dimensions as compliant.

## Permanent tasks and test boundary

[34 numbered follow-up items RTPUB-001–034](PUB_NCC_2026_TODO.md) are **new** and ordered by code and safety significance; none were previously assigned. The machine-readable record [audit/pub/2026-10-25-code-matrix.json](../audit/pub/2026-10-25-code-matrix.json) includes the current source Git blob SHAs, regulatory links and all statuses. A new automated audit **freshness** check refuses to treat this audit as current if the cited pub scenes change; it is **not** an automated code compliance assessment.

**Not inspected:** actual current public deployment via browser/mobile, real floor/patron count, certified architectural/site plans, material ratings, structural engineering, accessibility consultant report, local DA/CC/OC/CDC, licensed water/electrical/gas/trade-waste installation records, live liquor licence, food inspection, audited emergency/fire routine service records, and any third-party code-compliance determination. Those are explicitly unverified and cannot be inferred from a game source tree.

## Dated authoritative sources

- **S01** — NSW Building Commission: [How to comply with NCC: NSW current edition 2022 Amendment 2, 29 July 2025; 2025 deferred to May 2027](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code)
- **S02** — ABCB: [NCC 2022 Volume One NSW Class 6, Parts B/C/D/E/F/G/J; building classification applies by use](https://ncc.abcb.gov.au/editions/ncc-2022/adopted/volume-one)
- **S03** — NSW Building Commission: [AS 1851-2012 inspection/testing from 13 February 2026 and FSS/AFSS obligations](https://www.nsw.gov.au/departments-and-agencies/building-commission/industry-changes/as1851-2012/responsibilities-of-building-owners-under-as-1851-2012)
- **S04** — NSW Food Authority: [Cafes, restaurants and retail outlets: 3.2.3, AS 4674, premises and inspection](https://www.foodauthority.nsw.gov.au/retail/cafes-restaurants-and-retail-outlets)
- **S05** — NSW Food Authority: [Hand-washing requirements: dedicated warm potable handwash and adjoining WCs](https://www.foodauthority.nsw.gov.au/help/hand-washing-food-businesses)
- **S06** — NSW Food Authority: [Standard 3.2.2A: supervisor, food handler training, showing food safe](https://www.foodauthority.nsw.gov.au/retail/standard-322a-food-safety-management-tools/standard-322a-frequently-asked-questions)
- **S07** — NSW Government Liquor & Gaming: [Hotel licence: free water/food, posted hotel licence/licensee, minors restrictions, training and trading hours](https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-types/hotel)
- **S08** — Dubbo Regional Council: [Retail food businesses including bars and hotels must register with Council; planning and inspection](https://www.dubbo.nsw.gov.au/Business-Investors/Business-Responsibilities/food-business-responsibilities)
- **S09** — Dubbo Regional Council: [Liquid trade waste must have written Section 68 approval](https://www.dubbo.nsw.gov.au/business-investors/business-responsibilities/trade-waste)
- **S10** — NSW Building Commission: [Plumbing Code of Australia NCC Volume Three applies to NSW plumbing/drainage](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code)
- **S11** — NSW Government Liquor & Gaming: [Underage drinking: venue authorisations and age controls](https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-responsibilities/underage-drinking)
- **S12** — NSW Government Liquor & Gaming: [Gaming machine layout, separation and restricted access if gambling machines are added](https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/gaming/gaming-machines/location)
- **S13** — NSW Food Authority: [Food Regulation 2025 commenced 1 September 2025](https://www.foodauthority.nsw.gov.au/about-us/legislation/food-regulation-2025)
- **S14** — NSW Government: [Liquor Plan of Management: free water, ID checks, RSA and service conditions](https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/resources/liquor-plan-of-management)
- **S15** — NSW Government: [NCC 2025 adoption in NSW deferred to May 2027](https://www.nsw.gov.au/ministerial-releases/nsw-to-adopt-new-national-construction-code-may-2027)

The exact proprietary Australian Standards texts are **not** reproduced. NSW publishes applicable NCC and official guidance but the necessary detailed design path can also be a compliant performance solution. A qualified NSW building certifier, fire specialist, access consultant and relevant licensed trade practitioners would have to assess a real building.
