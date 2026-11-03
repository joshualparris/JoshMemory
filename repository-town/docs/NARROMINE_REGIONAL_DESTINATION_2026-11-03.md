# Narromine NSW — researched, driveable regional destination for Repository Town
**Research snapshot:** 3 November 2026 · **Scope:** Town + Narromine Shire, clearly separated · **Status:** Source research and playable *representative* region on a feature branch; local/browser/host acceptance separately tracked.

## Executive decision
Build Narromine as the first **physically driveable regional destination** west of the unchanged fictional Repo Town near Minore, not an independent minigame or teleport-only panel. Reuse the player-owned cars, fuel, vehicle dynamics, collision world, camera, existing save keys and the town clock. Give Narromine its own sensible road, centre, aviation precinct, parkland, riverside/wetlands scenery, agricultural approach and historically grounded discovery opportunities.

**Be explicit about the fiction:** real Narromine is about 30 minutes west of Dubbo; the established fictional Repo Town anchor is at WGS84 (-32.273600, 148.408400), about 16.5 km straight-line from real Narromine. Neither the precise road connection nor Narromine's cartographic grid has been surveyed here. The initial 1.3 km in-game regional link is a *compressed traversal* for responsive browser gameplay, not a depiction of a full 16.5+ km highway journey, a real bridge, a licensed driveway or a local council street plan. Existing 188 original houses, 195 developed country homes and all town addresses/canon remain in place.

## Verified real-world research findings

### 1. People, boundaries and demography — do not mix these numbers
2021 ABS QuickStats (latest full Census dataset at the research date; do not claim 2026 results):
| Geography | ABS identifier | 2021 persons | Median age | Median weekly household income | Median weekly rent |
|---|---|---:|---:|---:|---:|
| Urban Centre and Locality (settlement) | UCL115111 | **3,507** | 39 | $1,159 | $250 |
| Suburb/Locality | SAL12920 | **4,608** | 39 | $1,306 | $250 |
| Narromine Shire LGA | LGA15850 | **6,360** | 41 | $1,308 | $240 |
These are **different geographic boundaries** and must remain separately labelled in tourist notices, future NPC lore, population/economy systems and documentation. Sources: [UCL](https://www.abs.gov.au/census/find-census-data/quickstats/2021/UCL115111), [SAL](https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL12920), [LGA](https://www.abs.gov.au/census/find-census-data/quickstats/2021/LGA15850). Council secondary reports sometimes use different populations/geographies; ABS boundary-specific 2021 QuickStats take precedence for this snapshot.

### 2. Country, culture and the historical town
Narromine sits on **Wiradjuri Country**, with a living Aboriginal community and a Narromine Local Aboriginal Land Council Keeping Place at **56 Dandaloo Street**; guided visits require appropriate booking. Respect First Nations ownership and permissions. The game uses only an exterior, a general welcome, public information and a link: do not reproduce scarred trees, artefacts, language, ceremonies or sacred places without community consent. The **Wungunja Cultural Centre is in Trangie**, not in Narromine township. Sources: [local visitor guide](https://narromineregion.com.au/things-to-see-and-do), [Narromine region](https://narromineregion.com.au/visit), [council local history](https://narromine.nsw.gov.au/community/local-history-room).

The railway and agricultural production shaped the settlement. Narromine's rail link, village layout and first railway station date to the early **1880s**; nineteenth-century rail, wheat and land settlement history merits individual interpretive exhibits, with conflicting dates cross-checked against local history archives before NPC narration. Narromine's Municipal Council formed in **1898**; do not conflate it with the modern Narromine Shire Council or Repo Town's fictional mayor. [Council local history room](https://narromine.nsw.gov.au/community/local-history-room) holds rate books, maps, newspapers, cemetery lists and Aboriginal/local histories. [NSW rail historical study](https://arhsnsw.com.au/wp-content/uploads/2018/08/F-Narromine.pdf) is further reading; do not turn the scenic siding into an unprotected active crossing.

### 3. Geographic environment, weather and flood safety
The town is in the Macquarie Valley beside the **Macquarie–Wambuul River**, within a landscape of cropping, stock, watercourses and floodplain habitats. The river, Narromine Wetlands, fishing and birdlife support a distinct setting from the dense Repo Town streets. Seasonal summer heat, winter cold/frost and variable rainfall are regional context rather than a measured game weather feed. The region has serious, location-dependent flood risk: **parts of Narromine township are flood liable** and the council consulted residents about an updated Floodplain Risk Management Study and Plan in **July 2026**. The study includes riverine and local stormwater flooding. [Council flood page](https://www.narromine.nsw.gov.au/development/flooding), [2026 consultation](https://www.narromine.nsw.gov.au/council/community-consultation-1), [NSW SES](https://www.ses.nsw.gov.au/local-information/narromine).

**Engineering decision:** water in stage one is cosmetic only. It must not be represented as an authoritative flood extent, true river alignment, safe drivable ford or pedestrian evacuation route. Build the game's flood/closure layer only after importing official terrain and hazard geometry.

### 4. Aviation — primary visitor attraction
Flying at Narromine began around **1919**, with an aero club founded in **1929**. The aerodrome has a rich recreational and gliding history and served military flying training during World War II, particularly **No. 5 Elementary Flying Training School** and Tiger Moths. **Narromine Aviation Museum** is at Tom Perry Drive and has an aviation collection. [NSW Government museum profile](https://www.nsw.gov.au/visiting-and-exploring-nsw/locations-and-attractions/narromine-aviation-museum), [Museum historical background](https://narromineaviationmuseum.org.au/visitor-information/). Avoid copying flight operational procedures, live flight positions or exact airside access rules. Stage one models an exterior museum, hangar and a *non-driveable scenic runway*; future gliding missions need safe simulation-only mechanics.

### 5. Commerce, farming, mines and freight
Narromine Shire's economic base includes broadacre grains, cotton, livestock, irrigated agriculture, farm services, transport/logistics, health, education, tourism and mining around **Tomingley**. Business viability and commodity outputs are sensitive to weather, water prices and regional demand. [Council agricultural overview](https://www.narromine.nsw.gov.au/business/welcome-to-narromine-shire), [Agriculture profile](https://www.narromine.nsw.gov.au/business/agriculture-profile), [Economic Development Strategy consultation](https://yoursay.narromine.nsw.gov.au/have-your-say-economic-development-strategy). Design candidate loops: produce deliveries, farming supplies, wheat to rail freight, roadside mechanic, market, visitor spending; no fabricated real shop owners or prices.

**Inland Rail status:** Parkes–Narromine section was completed in **2020** and operates with freight trains. Narromine–Narrabri is approved but **not a completed 2026 railway**: the wider northern corridor was being preserved for future delivery and detailed design/site investigations continued. [Inland Rail status](https://inlandrail.com.au/progress/), [Parkes–Narromine](https://inlandrail.com.au/where-we-go/projects/parkes-to-narromine/), [Narromine–Narrabri](https://inlandrail.com.au/where-we-go/projects/narromine-to-narrabri/). Keep these states distinct in all in-game signage and jobs.

### 6. Education, healthcare and raising a family
Council lists **Narromine Public School, Narromine High School, St Augustine's Parish School, Narromine Christian School**, plus school options in Trangie and daily coach services to Dubbo for education choices. Not every provider necessarily offers every grade; check each site's current enrolment and availability before future gameplay. [Council education](https://www.narromine.nsw.gov.au/community/education).

**Narromine Health Service** is a real healthcare facility at **128 Cathundril Street**, with a 24-hour emergency department and a range of inpatient, renal dialysis, child/family, Aboriginal health and visiting clinician services. The statewide service entry should be considered current until formally updated, but it does not guarantee any particular specialist or wait time. [NSW Health](https://www.nsw.gov.au/departments-and-agencies/nsw-health/service-directory/narromine-health-service), [Western NSW LHD community](https://www.nsw.gov.au/departments-and-agencies/wnswlhd/careers/our-communities/narromine). The game includes a health-service exterior and truthful interpretive panel, **not** a simulated real emergency dispatch service.

### 7. Community, tourism, sport and everyday life
Recognisable features: **Dandaloo Street**, Narromine Library at **31 Dandaloo Street**, Local History Room at **31–33 Dandaloo Street**, Keeping Place at **56 Dandaloo Street**, historic S-truck wagon, railway history, aviation museum, gliding, Narromine Wetlands, Tom Perry Park and **Glenn McGrath** cricket connection, cafés, heritage hotels, sport, swimming and fishing. 2026's town events included the Narromine Dolly Parton Festival on **10 October 2026**; do not imply it runs every day. [Council/visitor listings](https://narromineregion.com.au/things-to-see-and-do), [Narromine region](https://narromineregion.com.au/narromine).

Respect active businesses: do not use real trading names, faces, trademarks or prices without verifying their current existence and rights. A compact, generically named high street gives the right spatial feel before individual verified shops become interactive.

### 8. Planning, utilities, policy and future
Narromine Shire Council is responsible for substantial rural roads, local amenities, water, wastewater, environmental planning and the aerodrome. Its [2026–27 and 2026–36 integrated planning documents](https://www.narromine.nsw.gov.au/council/integrated-planning-and-reporting) cover water security, road upgrades, sewer renewals and longer-term assets. The **new Narromine Water Treatment Plant** was at design/early-works stage, not an existing finished permanent plant: NSW Water explained a 2020 temporary treatment system, deep bore iron/manganese and the permanent plant design in December 2025. [NSW Water](https://www.water.nsw.gov.au/news/narromine-water-treatment-project-works). The **Craigie Lea industrial estate** and housing initiatives are development/planning themes; budget allocations are not proof that each project has been completed.

Other domains needing original data before realistic simulation: current housing prices/rents, vacancy, trade openings, crime rates (BOCSAR), flood model/polygon, licensed water allocation, exact power supply feeder, network blackspots, climate normals (BOM station), school enrolment, tourism expenditure, employment by SA2/LGA, volunteer capacity, traffic count, street/parcel geocodes, historical buildings, emergency response, bridge access, pollution and long-term demographic forecasts. These should remain **research gaps**, not filled with AI invention.

## Initial actual playable geography (source of truth)
**Game axes:** x decreases west, z increases south. Distances are abstracted.

| Segment | Game bounds | Function | Status |
|---|---|---|---|
| Western Repo Town Wattle Street edge | (-1330, 277) | Previously existing driveable road end | Existing, preserved |
| Continuous rural regional approach | x -1330…-2636, z 271…283 | Road, verge, paddocks, trees and grain handling scene | Added; deliberate compressed travel |
| Representational Dandaloo Street | x -2635…-2625, z 105…491 | Narromine town main N–S street | Added; not a surveyed street geometry |
| Two town side streets | z 158…168 and 385…395 | Basic intersection and vehicle navigation | Added |
| Aviation precinct access | x -2580…-2570 then east z 478…488 | Reach museum / aerodrome scene | Added; NOT flight-side vehicle permission |
| Walk-up points of interest | 11 sourced markers, off vehicle action | Info panel, museum, library, Keeping Place, wetlands, park, hospital, shops, grain and rail | Added; informational exteriors only |

**Route in gameplay:** Drive west on Wattle Street → continue straight beyond the former west edge onto the regional corridor → pass farmland and grain silos → arrive in Narromine at the Dandaloo Street crossroads → turn north/south for township, or follow southern and aerodrome access for the museum. Park to interact via **E** or phone **✋**. The same player car, fuel, wear, speed and save location apply throughout. No screen-space travel menu, 2D-only atlas, instant jump or new save namespace required.

**Core safeguards:** Extend collision boundary to the west rather than removing it entirely; maintain collision with new facades; region scenes live under the existing town group and disappear correctly indoors; keep all existing site IDs, addresses, physics and parking rules. The small footprint and merged scenery aim to be mobile-friendly. No real-time external APIs, copied aerial imagery or restricted cultural displays.

### Tests and acceptance matrix
- [x] New town data model and historical/ABS distinction.
- [x] Continuous road geometry from existing Wattle junction through Narromine, with a regression test registered in `npm run test:town`.
- [x] Procedural, low-poly representative landmarks and a scenic aviation precinct.
- [x] On-foot sourced landmark panels; arrival message.
- [x] Existing player-driving road classification extended and original collision boundary relocated.
- [ ] **Node syntax/build:** execute every modified module and `npm run build:release` on the exact source SHA.
- [ ] **Privacy:** run `node tools/check_privacy.mjs` against the built public site.
- [ ] **Browser:** own/enter a car, traverse from Repo Town to Narromine without obstruction, park, use an attraction, return to Repo Town.
- [ ] **Android/mobile:** tap/steer/park/landmark panel works; no HUD or WebGL memory regression.
- [ ] **Save:** reload while at Narromine and while parked; vehicle/position persisted and no stuck spawn.
- [ ] **Hosted:** verify staging/production deployment commit and fingerprint, then test both routes there.
No unchecked gate may be reported as verified.

## Roadmap for a genuinely accurate, living Narromine
1. **Authoritative spatial import:** source OpenStreetMap streets, geolocate business/public assets against NSW cadastral and GNB layers; keep all private homes outside playable interiors; validate direction/orientation, road surfaces and limits. Only then decide whether to replace the 1.3km compression with a time-scaled 16.5+km road. Never label the synthetic crossroads as an approved Mitchell Highway intersection.
2. **Local transport:** route-correct real-world signs, speed zones, highway intersections, direction-of-travel rules, realistic parking, road shoulder collision, restricted rail crossings, buses, freight traffic, fuel and timed day/night travel. Distinguish real travel time from game-clock speed.
3. **Cultural/history authenticity:** seek community review of Aboriginal material and exhibits, use approved public accounts and photographs, verify places and history against Library/NLA/State records.
4. **Service interiors and simulation:** library/Local History Room, museum galleries, real service types, grocery and hospitality, sporting venues, schools, medical clinic, staff/public transport; avoid inventing medical emergencies or real identities.
5. **Economy/quests:** wheat and cotton freight, farm servicing, gliding and museum tours (fictional mechanics), cricket and sport, visitor weekends, festivals on appropriate calendar dates, part-time jobs and purchases with finite stock.
6. **Environment:** BoM-derived weather and seasonality, river and wetland ecology, Council/SES flood modelling and road closure when verified. No unofficial flood hazard claims.
7. **Neighbouring destinations:** Trangie and Tomingley next, then Dubbo, with explicit road junctions and scale discipline so all regions remain reachable in the same world.
8. **QA:** continuous real driving, pedestrian safety, WebGL memory and draw calls, mobile steer/zoom, parcel boundaries, audio culling, autosave/restore and release consistency across hosts.

## Provenance and reliability notes
Sources above are publicly accessible primary government, official tourism and historical/sector sources as of research date. Historical railway details and precise topography remain lower confidence until individual archival and spatial validation. Council project status is distinguished from approval and construction. Regional in-game scene is intentionally fictional in scale, building placement and route shape. No changes to the accepted original Repository Town land parcel or alternate-universe zoning premise.
