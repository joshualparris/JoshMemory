# Living Repository Town — whole-of-town simulation masterplan
Updated: 19 October 2026 (Australia/Sydney). Source: JoshMemory/repository-town.

## Vision
Repository Town is not just 188 repository houses. It is a **living small town** where
characters, employers, civic services, businesses, ecosystems and logistics share
one simulation clock and one consistent set of resources and financial ledgers.

A building with no purpose is scenery, not a simulated service. The user should be
able to follow any resource (water, electricity, groceries, mail, rubbish, money)
from source through transport, use, maintenance, and eventual reuse or disposal.

**Design contract:** every implemented service has an owner, physical location,
workers, operating hours, input stocks, capacity, outputs, customers, costs,
failure modes, measurable outcomes and actions the player can take.

## Implementation reality / safety
The first slice exists on branch feat/living-town-simulation-20261019:
- [x] Offline 24-hour simulated town day (72 real minutes at 1×, speed adjustable), clock, daytime lighting
- [x] 20 vacant Street 8 parcels reserved for visibly labelled civic/industrial places
- [x] Budgeted mayoral elections, council treasury, taxes, repair requests
- [x] Town Credits visitor wallet + bank deposits/withdrawals; household commerce
- [x] Farm > mill > bakery > freight > market > meals stock-flow prototype
- [x] Power/fuel, treated water, wastewater, rubbish, recycling, foundry inputs/exports
- [x] Post letters with delivery windows, incidents and repair costs
- [x] Interactive Ledger and an event log; save/load state in localStorage
- [x] Pure-module regression checks for non-negative inventory and deterministic replay
- [ ] A pathfinding NPC that *physically* performs each scheduled job
- [ ] Interior walk-in civic facilities and shops
- [ ] Actual pipes/cables/road network topology and vehicle cargo visuals
- [ ] Real household-level ledgers, balanced company accounts, inventories
- [ ] Browser GPU/mobile playtests and public publish (pending integration review)

The prototype uses abstract integer units. They are gameplay values, **not**
real-world engineering measurements. It is single-player and local-first. A
failed service should be legible and repairable, not randomly cruel. NPC chat
must never invent readings not in the state, leak private GitHub data, or commit
API credentials. Do not re-enable access-code requirements without consent.

## Shared simulation entities
- Clock: absolute in-world minute, day, day/night, calendar, week, season, weather.
- Map: world coordinates, roads/paths, lots, addresses, zoning, buildings.
- People: identity, home, employer/job, family/relationships, skills, schedule,
  needs, money, inventory, health, happiness, mobility and memories.
- Institutions: mayor, council, departments, elections, policies, budgets,
  tax rates, land-use plans, licensing and approvals.
- Companies: ownership, bank account, staff shifts, prices, suppliers, customers,
  stock, machines, work orders, profit/loss and solvency.
- Material flows: item type, quantity, location, quality, batch, source,
  destination, transport vehicle, disposal or recovery route.
- Utility graphs: generator/pump/substation/pipe/sewer/plant node capacities,
  demand, maintenance state, outage and restoration work order.
- Environment: water/air/soil pollution, weather exposure, habitats, biodiversity.
- Events: timestamped cause, change, responsible agents, geographic impact,
  player-visible explanation and testable result.
- Ledger: person/business/council balanced debits and credits in Town Credits.

## Department / facility coverage
Each row is a candidate subsystem, not a claim it has been implemented.

| Domain | Facilities, objects and roles | Connected game systems |
|---|---|---|
| Government | Town hall, mayor, councillors, elections, council chambers, planning committee, works department, community consultation | budgets, rates, licences, bylaws, maintenance |
| Law & order | police, courts, ranger, bylaw enforcement, lost property, legal aid, prisons only if gameplay warrants | safety, permits, incidents, rights |
| Treasury & banks | accounts, ATM, credit union, cash registers, loans, savings, interest, taxes, payroll, public bonds, insurance | currency, jobs, budgets, businesses |
| Property | real estate office, property register, rental housing, mortgages, deeds, rates, apartments, retirement units, public housing | income, land, occupancy, zoning |
| Power | solar arrays, batteries, generators, turbines, poles, transformers, substations, control room, smart meters | fuel, weather, outages, electric loads |
| Water | river/reservoir, intake, filtration, treatment, tanks, mains, pumps, pressure, water meters, leaks, drought planning | energy, sanitation, agriculture, health |
| Wastewater | toilets, drains, sewers, pumping stations, sewage treatment, discharge, reuse water, sludge | electricity, water, public health, pollution |
| Stormwater | gutters, catch basins, culverts, detention ponds, levees, flood maps | rain, roads, flooding, emergencies |
| Waste | kerbside collection, bins, truck rounds, transfer station, landfill, tipping fees, street cleaning | homes, businesses, environment, transport |
| Recycling | MRF sorting, glass/metal/plastic/paper, repair café, e-waste, reuse shop, salvage yard, composting | markets, factories, material quality, safety |
| Agriculture | wheat, vegetables, orchards, dairy, poultry, beekeeping, greenhouses, irrigation, silos | land, water, seasons, workers, processing |
| Food processing | mill, dairy, butcher, bakery, cannery, cold store, abattoir only if needed for economy | ingredients, refrigeration, food safety |
| Retail & hospitality | supermarket, greengrocer, general store, café, restaurant, pub, motel, market stalls | stock, prices, food, customers, trading hours |
| Heavy industry | mine/quarry, foundry, refinery, cement works, sawmill, factory, machine shop, warehouse | ores, fuel, electricity, water, transport, waste |
| Construction | builder's yard, earthmovers, cranes, timber mill, brickworks, concrete batching, plumbers, electricians, inspectors | sites, materials, finance, permits, repairs |
| Transport | roads, footpaths, crossings, public transport, bus depot, car parking, bikes, taxi, fuel station, depot, rail freight | people, vehicles, travel time, deliveries |
| Shipping & postal | post office, street letterboxes, addresses, sorting, courier warehouse, parcels, missed delivery notices | trucks, residents, trading, opening hours |
| Telecommunications | fibre, telephone exchange, mobile towers, broadband, radio station, community notices | power, outages, business, emergency dispatch |
| Healthcare | GP, clinic, pharmacy, dentists, pathology, ambulance, hospital, public health inspectors, aged care | staffing, illness, medication, ambulance time |
| Emergency services | fire station, volunteers, SES, police dispatch, flood evacuation, rescue vehicles, hydrants, shelters | hazards, roads, water, weather, hospitals |
| Education | school, kindergarten, library, trades college, apprenticeship, adult training, teacher schedules | children, jobs, qualifications, literacy |
| Community | churches and other faith spaces, parks, playgrounds, sports field, pool, cinema, theatre, community hall, festivals | belonging, schedules, happiness |
| Parks & ecology | park rangers, arborists, reserves, river, wetlands, wildlife rescue, tree planting, erosion control | pollution, weather, health, conservation |
| Tourism & culture | visitor centre, museum, archive, historic buildings, accommodation, festivals, guided tours | visitors, economy, recreation |
| IT and administration | municipal computers, data centre, IT helpdesk, cyber incidents, backup service, public records | digital outages, service continuity, privacy |
| Media | newspaper, radio/TV, town noticeboard, events calendar, election debates | gossip, evidence, civic decisions |
| Death & life events | births, birthdays, weddings, funerals, cemetery, migration, ageing (optional and respectful) | housing, services, community demographics |

## Town jobs and NPC routines
Every adult resident is assigned a home, employer, shift, worksite and believable
route. Children attend school and carers have non-standard schedules.
A possible routine:
- 06:00–08:00 wake, wash, breakfast, school drop-off
- 08:00–12:00 commute, work, deliveries and maintenance
- 12:00–13:00 lunches and social interactions
- 13:00–17:00 work, shopping, collections, pickups
- 17:00–21:00 travel home, cook, café/pub/park/visits
- 21:00–06:00 wind down, sleep; essential workers run night shifts

Lives should differ by personality, mobility, job, age and needs. No universal
routine. Grounded NPC conversation queries must read the *actual* ledger:
"Where's the postie?", "Who is mayor?", "Are we short on bread?", "Why did the
lights go out?", "What did you have for lunch?", "How's the town budget?",
"What can I see next to you?". Reports refer to recorded events or say unknown.
Real physical movement should be implemented separately from the schedule model.

## Economic flow
1. Farm workers grow food with land, tools and water.
2. Mill consumes wheat and power to make flour.
3. Baker consumes flour, labour, power and water to make bread.
4. Depot loads a vehicle; a driver consumes fuel and travel time.
5. Market receives goods, sets prices, sells only actual inventory.
6. Household pays with earned money, uses food, creates waste.
7. Council receives taxes, pays employees and buys repairs.
8. Recovery operators separate materials; factories take useful inputs.
9. Bank holds deposits and handles payments. Avoid creating or deleting TC
   invisibly; imports/exports are explicit external flows.
10. Scarcity raises prices (later), debt affects businesses (later),
    council priorities create visible trade-offs.

Future economy layers: supply contracts, stock expiry, price elasticity,
staff shortages, competition, tourism, rent, mortgage, insolvency, credit,
wealth disparity, subsidies, welfare, interest and trade with neighbouring towns.

## Physical network simulation — target
Represent real nodes and edges (pipes, power lines, roads, sewer trunks,
broadband ducts) instead of a single service health percentage.
- Each edge has capacity, condition, direction where relevant and fault status.
- Solve flows deterministically at fixed time steps to avoid frame-rate effects.
- Compute demand at each home, shop and worksite.
- Route crews to the site and consume spare parts, labour hours, fuel and funds.
- Show the exact affected network section on the minimap.
- Make recovery progress and outage ETA visible without fabricating real times.
- Couple water supply to pumps/power, sanitation to sewage, industry to energy
  and transport to fuel and available roads.

## Waste hierarchy
Prevention > reuse > repair > refurbishment > recycling > energy recovery
(if supported) > safe disposal. Track e-waste separately: batteries and
hazardous fractions must follow safe flows; no "instant recycling" fantasy.
Factories should only receive materials actually recovered and processed.

## Player agency
- Visit the town hall, run for mayor, campaign or vote; approve spending.
- Work shifts as an apprentice, delivery driver, baker, farmer, postie,
  garbage collector, electrician, mechanic, firefighter, ranger.
- Buy and sell real goods, save TC, receive pay, rent premises or own a shop.
- Collect litter, sort recyclables, repair appliances at the Repair Café.
- Track shortages, deliver parcels, fix leaks and restore services.
- Purchase improvements for parks, solar, buses, hospitals or schools.
- Follow one household's shopping trip or one loaf of bread end-to-end.
- Use a town map with clickable utility layers, zoning, trucks and public sites.
- Pause, speed up, slow down, save, export and restart a *new* town without
  overwriting the existing save. Maintain normal walking/gameplay controls.

## Example cascading situations / acceptance scenarios
1. Break a water main -> no treatment/pumping in affected district -> homes
   lose clean water -> bakery stops -> shelves empty -> complaints -> council
   work order -> staffed and funded repair -> water restored.
2. Station loses fuel -> blackouts -> cold stores stop -> food spoils -> trade
   reroutes -> fire/rescue and clinics use emergency power if funded.
3. Rainstorm -> storm drains overload -> roads close -> late mail, missed
   deliveries, rescue crews, flood warnings; clear as water recedes.
4. Farm crop failure -> mill and bakery shortage -> market price rises ->
   alternatives, imports or assistance -> recovery after next harvest.
5. Workers strike or fall ill -> reduced services and throughput until staff
   availability changes; residents react via real recorded events.
6. Rubbish collection stops -> bins overflow -> litter and pests -> health,
   reputation, costs -> recycling/recovery crews restore service.
7. Foundry increases production -> jobs and exports rise, but fuel demand,
   emissions, water use and road wear increase; voters respond.
8. Council overspends -> infrastructure deteriorates -> services decline;
   voters can alter priorities without magic repair.
9. Out-of-stock shop never allows negative inventory.
10. Treasury, bank, business and household transfers conserve TC aside
    from explicit imports/exports/taxes and money creation rules.
11. Postal delivery requires an addressed letter, sorting window, postie
    and available road, and can be tracked by the sender.
12. A resident can point to the real nearby bakery and report their own
    last recorded meal rather than an invented one.
13. Save/reload mid-delivery gives the same stock, vehicle and clock state.
14. Mobile browser renders at stable frame-rate; pause/ledger keeps joystick
    usable and does not block the return/exit path.
15. Public build leaks no private repository name, slug, URL, README or key.

## Phased delivery / don't conflate planned with done
### Slice A — first integration (this branch)
Shared state, ledger, one-day schedule model, facilities on unused lots, basic
economy, resources, service flags, deterministic events, persistence. Tests:
town-simulation.mjs plus existing build/privacy gate and mobile E2E **still to run**.

### Slice B — truly embodied systems
Link each of the 32 existing NPCs to the model, route villagers from houses
to jobs and shops, truck routes with cargo and warehouse transactions, open
civic buildings, parcel boxes, interactive building doors and furnishings.
Re-run 188-house and phone tests (do not regress doors/arcades).

### Slice C — networks and zoning
Power/water/sewer graph, streets/road closures, building ownership, capacity
and breakdowns, work orders/repair crews, education/hospital/emergency flows,
weather/flooding and notices.

### Slice D — deep economy and community
Company accounts, supply contracts, real payroll, pricing, loans, taxes,
elections and policies, festivals, recreation, wildlife, housing and growth,
long-term balancing; scenario editor.

### Slice E — robust simulation and playtest
Deterministic replay tests, step-by-step source-of-truth panel, accessible
offline 2D mode, save migrations/export, full desktop+Android walkthrough,
performance budget, private-data leak checks and deployment verification.

## Technical guardrails
- Source of truth: JoshMemory/repository-town/src, not hand-edited published site.
- Every mutation is through deterministic actions with named outcomes.
- Cap event logs, game-step loops, object count and GPU draw calls.
- Time should pause under any embedded arcade game to avoid resource loss.
- Public/private sanitisation applies to every new module; no repository slugs
  appear in hard-coded simulation content.
- Prefer localStorage for game progress with versioning and graceful fallback.
- No secrets, paid AI requests, access codes or required cloud accounts for
  basic simulation; AI dialogue must be optional and honest.
- Maintain coordination board and integrate only after reviewing other PRs.
- Tested does not mean visually playtested; always distinguish the two.
