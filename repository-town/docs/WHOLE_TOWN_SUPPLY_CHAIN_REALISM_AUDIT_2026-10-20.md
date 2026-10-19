# Whole-town realism audit: animals, trades, shops, pub and brewery
**Date:** 20 October 2026 (Australia/Sydney)  
**Reference branch:** \`main\`, inspected commit \`12a9ca0a39f924dcf23b448b0bbd40dc9fba657f\`.  
**Scope:** source-level audit, *not implemented changes*. Inspect actual state updates rather than relying on visual models or prose.  
**Goal:** a fictional rural NSW town where every service has workers, inputs, travel, timing, money, capacity, rules, and tangible consequences. Preserve all existing gameplay and privacy tests.  

## Executive verdict

The game has a working **partial** local food/electricity/waste/rail economy and some staffed civic work. Yet core everyday industries are only implied. Where jobs are absent, buildings can still display generic scenes; where buildings are drawn, no operational stock or business necessarily exists. It is **not** accurate to say veterinary medicine, construction, building supplies, brewing or alcoholic sales are simulated.

| Question | Current audited state | Status |
| --- | --- | --- |
| Sick animal? | Sheep/cattle/chook paddocks exist as purely visual instanced herds. No persistent individual or herd health, illness, vet call or treatment. | MISSING |
| Where is the vet? | Human Clinic at Q8, staffed nurse, but **no veterinarian job/site** and no veterinary medical inventory/visits. | MISSING |
| Builder of vet clinic? | Foundry & Workshop at R8 makes \`parts\` from scrap, and mayor's council can approve a zoning permit **in principle**, but there is no builder, construction company, building progress or finished new building. | MISSING |
| Where are building supplies sold? | General Store at H8 is for groceries. The foundry sends 2 spare-parts boxes to Town Hall. No hardware/trade merchant, timber, concrete, bricks, nails, roofing, or material deliveries. | MISSING |
| Does the town have a pub? | **Yes: The Merged Branch, N8.** It is shown as a public house, opens 11:00–23:00, has a publican, accepts meal business, and adult-aged residents *could* socialise there in concept. Current code does not track patrons' ages or prove paid drinks. | PARTIAL |
| Can builders go there after work? | Generic non-working residents sometimes travel there after 19:00 for an idle "yarn"; no builder occupation exists and a "pub visit" doesn't decrement beer or charge for it. | PARTIAL |
| Is beer brewed? | Not at all. "Pulling beers" is text in \`workActivity\`; beer is absent from \`GOODS\`, inventory, farm outputs, import, delivery routes and pub purchase logic. No malting, brewery, fermentation or licensed supply. | MISSING |
| Is existing food realistic? | Farms, mill, bakery and trucks do produce/move/consume actual inventories. But livestock output disregards livestock condition/count, lamb appears directly from a sheep paddock, and café/pub meals can be made by consuming *any one* of several possible inputs instead of a recipe. | PARTIAL |
| Does the town have places to sleep? | 188 home designs now get usable beds, I8 Railway Hotel has 4 paid guest rooms, and player/villager hunger/fatigue persist. New businesses need employees, capacity and wages rather than unattended magic service. | IMPLEMENTED BASELINE |

**Source references:**
- \`src/world/life.js\`: \`GOODS\`, \`PLACE_DEFS\`, \`JOBS\` (~lines 33–113); farms (~463–478); foundry/recycling (~388–407); truck \`pickJob\` (~713–755); village social routine (~810–836); meal use (~940–952).
- \`src/world/townlife.js\`: farm visual herd configuration (~261–304) and the existing pub model (~97–106).
- \`src/world/government.js\`: zoning permits and delegated work orders (~173–292).
- \`src/world/needs.js\`: player hunger, sleep and hotel room finance.
- \`src/ui/townpanels.js\`: current business descriptions and action menus.
- \`src/world/shop-interior.js\`: named buildings may still show the generic civic/shop single-room fallback.

## A. Animal-to-veterinary system: end-to-end missing

**Observed implementation:** the renderer procedurally places a fixed number of sheep (12), cows (7) and chickens (16) in instanced herds. They wander graphically but have no unique persistent animal records. \`everyHour()\` pays out \`lamb\`, \`milk\`, or \`eggs\` whenever appropriate workers are at farms; only a generic growth / worker count drives output. There is no herd consumption of food/water, pregnancy, reproduction, routine veterinary care, animal transport, mortalities, quarantine, disposal, slaughterhouse or abattoir, food-quality control, and no animal-disease effect on production.

**Design:** new \`world/livestock.js\`, keyed by \`farmId\`, \`animalId\`, with persistent \`species, age, sex, health, hunger, thirst, stress, isolation, veterinaryCaseId, vaccination, lastCareDay, production, location\`. This state **drives** rendering, farming and animal output; never create a second unconnected animal count. Need appropriate species-specific production: eggs from laying hens; milk from lactating dairy cattle with realistic feeding/milking; sheep yield wool and lamb only from real stock-and-processing flows (shearing a sheep does *not* create a meat cut).

**Path for a sick animal:**
1. Daily animal husbandry on the actual farm, with feed/water and welfare checks by on-duty workers.
2. Farmer observes reduced appetite/activity, lameness or other game-safe fictional symptoms; creates timestamped case.
3. Case triage: isolate the affected animal where appropriate, require a clean pen and inform a local/on-call vet. Suspected notifiable/emergency conditions have a *distinct* biosecurity-reporting workflow and should not be treated as ordinary mild illness.
4. If no resident vet is economically justified, request a mobile rural veterinary service from the **external regional network**. If a local clinic exists, route a genuinely assigned vet from their home/workplace to farm. Only staffed veterinary visits can assess the case.
5. Veterinary supplies are priced, delivered and consumed by documented inventory; treatment is charged to farmer/co-operative, or a defined public budget for qualifying emergency responses.
6. Treatment/resolution requires time; potential outcomes include rest, routine follow-up, recovery, loss or escalation. Recovery changes production; no instant restoration by clicking.
7. Vet records, herd movement/biosecurity restrictions, environmental/waste consequences and costs persist in saves and the Town Ledger.

**Scale caveat:** a town with 38 simulated residents may reasonably rely on a *regional travelling rural vet* rather than a profitable fully staffed 24/7 surgery. A locally constructed mixed veterinary practice can be a progression project, justified when farm/nearby-town demand supports it. This is more realistic than building every specialty shop on the next empty lot.

Relevant NSW material: https://www.nsw.gov.au/regional-and-primary-industries/livestock/health-diseases and https://www.dpird.nsw.gov.au/dpi/biosecurity/report-a-pest-or-disease . Emergency disease suspicion can trigger reporting/local veterinary advice; game scenarios should distinguish this from common minor cases.

## B. Building, trades and the material economy: missing

**Observed:** \`src/world/government.js\` creates council motions and **approved in principle** zoning permits, but does not start a building job. \`JOBS\` has a foundry worker, power/water operators, and some public maintenance workers; it has no licensed builder, apprentice, bricklayer, carpenter, electrician, plumber, roofer, architect/designer, building supplier clerk, certifier or construction supervisor. Foundry uses metal/scrap to produce \`parts\`, routed to Town Hall, not general-purpose building materials.

**Design:** new \`world/construction.js\`, \`world/materials.js\`, and a modest hardware/trade shop. For rural scale, start with a local hardware merchant handling hand tools/consumables, plus a **regional building-products wholesaler** delivering bulk timber, bricks and cement by rail/truck. No automatic inventory creation in hardware. The proposed vet clinic must be built via an actual order chain:

\`land parcel owner → project brief → funds / quote → development pathway (where required) → builder's contract & work schedule → bill of quantities → supplier purchase orders → freight delivery → secure stockpile → foundation/slab → framing → roof → services → safety/inspections → completion → commissioned building with working employees\`.

**Minimum in-game goods:** \`timber, concrete, bricks, roofTiles, metal, glass, doors, windows, plumbing, wiring, nails, fasteners, tools\`. Distinguish bulk material units, lead times, stockout effects and reuse from the recycling/foundry chain. Electricity, water, travel distance, workforce skill, fatigue, job-site safety, wages, supplier invoices, consumption and rework all matter.

**Approvals:** an ordinary approved council *motion* is **not** a construction certificate. In NSW, the actual approval path depends on exempt/complying development and project type; construction certificates and independent certification/occupation checks may apply. Map these as **simplified fictional game stages**, not legal advice. Sources: https://www.nsw.gov.au/housing-and-construction/building-or-renovating-a-home/preparing/approvals and https://www.service.nsw.gov.au/transaction/apply-for-a-construction-certificate .

**Visible site stages:** safety fencing and excavation → material stacks → foundations → timber/steel frame → exterior cladding → windows → internal fit-out → inspection → open-for-business sign. Workers must physically show up and progress must stop without material, suitable weather, safety state, or wages. Preserve door and truck collision safeguards.

## C. Pub, employee social life and beer: mostly missing

**Observed:** N8 **The Merged Branch** is real. It has a building, publican (11:00–23:00), realistic-looking meals in its menu, and occasionally evening social visits. But \`workActivity\` says the publican is "pulling beers" when no beer exists in \`GOODS\`. Town pub sales are **meals only**. The purchase path selects any one of \`lamb/veg/pie\` rather than tying a recipe to what the customer actually orders. A \`kind:'idle'\` social visit does not buy a round.

**First safe and convincing correction:** add \`beerKeg\` and \`beerServe\` to actual inventory and sales, starting with wholesale delivery from a **regional licensed supplier** via Rail Depot. The beer must be stock-funded (pub till/credit), unloaded and stored before anyone can buy it. Add paid drink and alcohol-free orders, seats, sober staff, closing/clean-up duties, age checks for eligible drinkers, and preferences such as nondrinker, occasional drinker, pub-food-only or avoids pubs. Do not treat 'student' job as a reliable age model: establish explicit age eligibility. No one should be forced to drink. If there is a safety gameplay mechanic, drinking must not confer magical positive benefits and patrons who drink should not drive.

**Real production chain for an optional local brewery:**
\`barley crop → malted barley (malting) → grain milling → mash with water → lautering → boil with hops → cool → yeast & controlled fermentation → conditioning → quality/sanitation checks → kegging → cold storage → delivery to pub → served beer → glass washing, wastewater and used-grain disposal/reuse\`.

Australian Brewers Association explains beer from **malted barley, hops, yeast and water**: https://www.brewers.org.au/making-beer/ . Existing \`grain\` is generic wheat-farm stock and should **not** be renamed to barley without matching the farm, mill and bakery supply contracts. Brewers need distinct equipment, skills, appropriate licensing, food/cleaning water, electricity and real elapsed fermentation periods. A batch cannot be brewed between breakfast and lunch. Fermentation and maturation persist over multiple in-game days. Failed power, dirty equipment, poor water quality or ingredient shortages should stop/downgrade batches.

NSW distinguishes pub/bar premises licences from a producer/wholesaler's licence. Pub premises also have requirements such as water and food availability; brewery production/wholesale permissions need to be designed separately rather than assuming a pub licence permits brewing. See https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-types/hotel and https://www.liquorandgaming.nsw.gov.au/operating-a-business/liquor-licences/liquor-licence-types/producer-wholesaler-licence .

**Builder finishes Friday shift example:** named adult builder completes a real worksite shift, receives a wage, visits pub if personally inclined, decides on beer/nonalcoholic beverage/meal, pub checks availability and operating rules, worker pays from own wallet, staff serves, till and stock update, social relationships update, then worker travels safely home and sleeps. Other workers may go straight home, visit family, play sport or go elsewhere. The pub's existence should not mean everyone drinks.

## D. The rest of the town: system-by-system realism

| Area | Implemented foundation | Unproven / missing next links |
|---|---|---|
| Food production | Real farms, mill, baking, workers, trucks and shop stock | Real herd count/health, feed inputs, food hygiene, cold chain, expiry, per-recipe ingredient requirements, abattoir and butcher processing. |
| Energy | Supply from fuel and weather-linked solar, feeders, outages and downstream dependencies | Metering, real generators / maintenance schedules, utility labour safety, reliable bills and emergency redundancy. |
| Water/sewer | Reservoir, consumption demand, sewage volume and creek pollution | Potability testing, leaks, water billing, household impacts, farm watering and brewery wastewater load. |
| Recycling | Bins collected, scrap recovered, foundry fabricates spare parts | Legal waste categories, material grading, recycling market, construction reuse and costs. |
| Transport | Three trucks, actual delivery routes, off-road parking and collision tests | Loading-bay access for new businesses, freight prices, manifests, refrigerated cargo, fuel for each truck, vehicle service/registration. |
| Household | Player/38 villagers have hunger and fatigue, beds and paid accommodation | Needs should affect actual work performance and leave; age, dependants, affordability and meals by nutritional content. |
| Construction | Town government can table preliminary zoning permit | Actual parcel ownership, approvals, contractors, parts, construction site work, inspection and completed visible new building. |
| Healthcare | Clinic, nurse and resident health indicator | Specific human illnesses/treatment, medical stock, emergency response, pharmacy, dentistry and regional referrals. |
| Animal welfare | Sheep/cattle/chicken visual herds | Individuals, feed/water/disease, quarantine, veterinary care, animal production authenticity and movement history. |
| Retail/hardware | General Store groceries; foundry produces council parts | Commercial hardware stock, procurement, building materials, supplier credit and lead times. |
| Hospitality | Commit Café, N8 pub, I8 Railway Hotel | Hotel staffing/occupancy and wages, pub drinks and wholesale stock, sanitary food service, licences and genuinely paid work/leisure. |
| Government | Mayor, councillors, minutes, routine service work orders and budgets | Land records, contracts, external permits and officials, realistic inspection authority and funds for capital works. |
| Labour/education | Named job roster and physical workplace travel | Builders/vets/brewers/merchants, apprentice qualifications, worker training, wages, leave, safety and hiring as firms grow. |
| Trade | Rail Depot imports some fuel/ore/coffee/tea and trucking routes | Imports/exports ledger, availability, procurement contracts, freight cost, storage and regional dependencies. |

## E. Recommended implementation order: make a living economy, not a museum

**Milestone 1 — Real inventory edges, real pub drinks (minimal, high impact).**
- Extend goods, supply routes, supplier payments and pub service. No infinite products.
- Initial beer comes from an off-map wholesaler with recorded charges and delivery; a brewery is *not* needed to justify the existence of a small-town pub.
- All pub transactions decrement available products, enforce eligibility and record payment; nonalcoholic alternative is stocked.
- Verify café and pub meals actually consume their stated recipes or offer a documented substitute.
- Existing 28-day economy and public privacy gates stay green.

**Milestone 2 — Animal state + regional mobile vet.**
- Persistent cows/sheep/chickens linked 1:1 to visible rendered animals, realistic species outputs, welfare and disease case state.
- Trained farmer inspection; contracted visiting vet; supplier-sourced medical stock; event/cost/production feedback; protected escalation for serious symptoms.
- Animal nutrition/feed and watering tied into drought/weather and transport.
- Save/load cases without duplication.

**Milestone 3 — Hardware trade merchant + real construction.**
- Allocate a suitable safe, walkable vacant parcel with logistics access and zoning; avoid placing a vet beside sewage, landfill or intense foundry traffic.
- Appoint actual clerks, qualified tradespeople, builder crews and independent certifier roles, with shifts/home, wages and contract ownership.
- Supplier catalogue and delivery manifests for physical building goods.
- Build an actual vet clinic only when regional demand/financing meets a plausible threshold. Otherwise keep the regional mobile-vet contract.
- Finish construction with inspection and staffing, not a modal changing the shop name.

**Milestone 4 — Brewery with a real supply contract.**
- Decide whether the town can support a small microbrewery vs continuing to buy regional kegged beer.
- Establish barley/hops/yeast/malt input without breaking wheat/flour/bread.
- Multi-day production, quality and sanitation, refrigeration, keg deposits, licensed producer/wholesale and freight transport.
- Brewhouse/warehouse/bar graphics and interactive equipment reflecting current actual batch state.

**Milestone 5 — Extend dependencies town-wide.**
- Business births and insolvencies, external regional economy, real skill development, safety inspections, vehicle upkeep, environmental limits, service standards and demographic/household lifecycle.
- Use an explicit dependency graph so changing one upstream quantity or illness actually changes downstream stock, time and earnings.

## F. Non-negotiable acceptance tests (executable specifications)

**Livestock & veterinary**
1. An observed cow illness opens a real case; a specific named animal becomes symptomatic, without changing unrelated animals.
2. Farm yield decreases or pauses appropriately; there is no new milk/egg/meat created by staff with an empty or ineligible herd.
3. A vet is not teleported; an available on-call vet receives a case, travels, takes time, uses inventory and charges the correct payer.
4. No treatment is possible without a qualified service provider or supplies; the animal's case and history survive save/reload.
5. Serious/possibly notifiable illness uses a distinct stop-and-escalate biosecurity workflow; quarantined animals do not silently enter the food chain.

**Construction and materials**
6. A vet clinic's build starts only after funds/appropriate approvals, design and contractor availability.
7. Hardware inventory falls on real delivery to the builder, and stockouts halt the relevant site stage.
8. Required materials cannot be created by completing a work animation; bill of quantities matches consumed units.
9. Project incurs real wages, supplier spending, time and weather/safety delays.
10. When a building opens, a matching real rendered 3D building, door, collision-free interior, staff and inventory exist; inspect then occupy.
11. Cancelled projects refund only legitimate unspent funds/materials, not every past expense.

**Pub and brewing**
12. A pub with no beer inventory cannot pour beer, even when the publican is on duty.
13. Buying a drink decreases kegs/servings, wallet and keg volume; pub till/tax/supplier accounts reconcile.
14. Non-drinking residents and minors are never automatically served alcohol; safe alternatives available.
15. Pubs cannot sell beer during unlicensed/closed hours or without staff; license restrictions modeled at an appropriate game abstraction level.
16. Beer shipments require a legitimate supplier, procurement, loading, travel, payment and receipt.
17. For local brews, each recipe's exact input amounts and active worker/equipment are needed; fermentation proceeds over multiple game days.
18. Unsanitary/underpowered brewing delays or rejects a batch; the pub never magically gets beer before kegs are finished.
19. The supply trail is inspectable from farm and brewery to truck and pub, with batch and financial records.

**System integrity**
20. Run 28–90 simulated days with no negative stock, funds minted by failed transactions, duplicate permits or work orders, orphan NPCs, inaccessible entrances or unresolved 3D collisions.
21. Preserve the existing farmhouse, 188 bed-equipped households, paid Railway Hotel, councillor elections, traffic and privacy tests.
22. Validate a genuine browser playtest (especially Android) for animal display, vet visits, construction in progress, brewery interaction and pub service. Test reports aren't visual proof.
23. Every new major building gets a non-generic authored interior, interactable objects and truthful conversations based on source-of-truth NPC/location/inventory data.

## Architecture / ownership

- Canonical simulation source: \`repository-town/src/world/life.js\` should only orchestrate; add isolated \`livestock.js\`, \`regional-services.js\`, \`materials.js\`, \`construction.js\`, \`beverages.js\` and \`brewing.js\`, each with explicit tick/snapshot/restore contracts. No separate fake NPC or economy ledger.
- Renderer \`townlife.js\` reads real state; doesn't create independent visual herds disconnected from simulation. New \`vet-interior.js\`, \`hardware-interior.js\`, \`brewery-interior.js\` only as businesses actually unlock. The high street is already heavily occupied; allocate land intentionally.
- Player UI \`townpanels.js\` shows transparent supplier inventory, public planning and invoices; NPC dialogue uses actual business and employee data.
- Add unit and multi-day integration tests under \`tests/\`; wire to \`npm run test:town\`. CI must preserve \`npm run build\` and \`npm run check:privacy\`.
- **Small-town principle:** realism means importing many things and using regional professional services. Building a vet, hardware warehouse, brewery, hospital, abattoir and airport on every spare lot would be *less* realistic than a coherent rural regional service network.

## Provenance and limits

This is a **source audit** of GitHub main; no code, buildings, items, vets or brew systems were added in this PR. No Android visual playtest was run. Some other branches may be in motion; reconcile against main before any feature PR. Public/legal URLs below describe real NSW/Australian context; gameplay should simplify them while preserving causal constraints:

- [NSW livestock health and reporting](https://www.nsw.gov.au/regional-and-primary-industries/livestock/health-diseases)
- [NSW DPI animal disease reporting](https://www.dpird.nsw.gov.au/dpi/biosecurity/report-a-pest-or-disease)
- [NSW on-farm biosecurity planning](https://www.nsw.gov.au/regional-and-primary-industries/biosecurity/on-farm-biosecurity-planning)
- [NSW building approvals](https://www.nsw.gov.au/housing-and-construction/building-or-renovating-a-home/preparing/approvals)
- [NSW construction certificates](https://www.service.nsw.gov.au/transaction/apply-for-a-construction-certificate)
- [Brewers Association: Making Beer](https://www.brewers.org.au/making-beer/)
- [NSW hotel liquor licence](https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-types/hotel)
- [NSW producer/wholesaler licence](https://www.liquorandgaming.nsw.gov.au/operating-a-business/liquor-licences/liquor-licence-types/producer-wholesaler-licence)
