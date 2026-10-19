# Repository Town: Interior realism audit
Date: 19 October 2026

## Design standard
Every interior should demonstrate its actual function, equipment, zoning, staffing, circulation and activity. Repainting identical shelves or labelling a shop counter does not constitute a realistic building. This is a code and gameplay audit, not architectural certification. The game's current visual style remains procedural low-poly.

## Farmhouse at Z8: completed first pass
Previous: one generic shop room, a counter, shelves, three exhibits.

Now: a rural Australian family farmhouse with **10 distinct areas**:
1. Entry passage with runner, family noticeboard, telephone, photos.
2. Boot room and mudroom with gumboots, hats, coats, bench, wash sink, dog gear.
3. Family living room with sofa, rug, bookshelf, heater and reading lamp.
4. Country kitchen and dining with table, chairs, kettle, stove, fridge, sink.
5. Separate walk-in pantry with flour, tea, preserves and tins.
6. Farm office with weather notes, paddock map, invoices, UHF radio and farm diary.
7. Main bedroom with double bed, wardrobe and family photos.
8. Children's bedroom with single bed, school desk, drawings, books and toys.
9. Bathroom with bath, shower, sink, mirror and toilet.
10. Laundry with washer, dryer, trough, basket, linen and ironing board.

There is a covered veranda model at the entry, timber ceilings and rafters, simulated windows with sills, different materials for wet areas, functional corridor/door openings and furniture collision. Repeated static furniture is instanced for phone performance.

Implemented interactions include the kettle, wood heater, kitchen and reading lights, family table, pantry, farm work diary, UHF radio, photos, schoolwork, laundry and wash facilities. The farmhouse NPC is Nell, placed in the kitchen, rather than at an irrelevant shop checkout.

### Verified
- Deployed into the live public game's Farmhouse builder.
- Browser test confirmed 10 rooms, 22 household props and 23 interaction points counting resident Nell.
- All 23 interaction points passed the approach test.
- Flood-fill collision test found 1,726 reachable cells from the entrance and a path to every interaction.
- Tested six interactions including kettle, heater, farm diary, pantry and washer; their panels opened.
- Leaving the farmhouse returned to town.
- Test source: tests/farmhouse.mjs.

### Still missing for a higher realism level
True views of the outdoor landscape through farmhouse windows, weather-driven sunlight and sound, physically opening cupboards and working water, household meal and supply inventories persisted in TownLife, actual daily routines for family members, outdoor rainwater tank, and exterior-to-interior veranda walking continuity. Do not call these implemented.

Australian reference designs:
- Museums of History NSW: https://mhnsw.au/stories/documenting-nsw-homes/europambela/
- Saumarez Homestead: https://www.nationaltrust.org.au/saumarez-homestead-audio-tour/
- Rural Australian Homestead: https://architecturerepublic.com.au/project/rural-australian-homestead/
- Beagle Farm: https://www.cadenceandco.com.au/projects/beagle-farm/

## Bakery at I8: completed custom first pass

**Previous:** a generic one-room shop with a single counter.

**Now:** eight distinct working spaces:
1. Bread and pie sales frontage with trays, labelled bakery products, checkout and till.
2. Accessible central circulation passage separating food production areas.
3. Dough preparation with commercial spiral mixer, weighing and stainless prep benches.
4. Hot line with two commercial deck ovens, landing bench, guards and oven status.
5. Dedicated dough-proofing room with cabinet, racks and time/temperature notices.
6. Cooling and packing with ventilation racks, trays, packing bench and delivery list.
7. Dry flour and ingredient storage with sacks raised off the floor, stock and allergen notices.
8. Wash-up and staff hygiene with deep sink, staff lockers, clean aprons and bins.

**Named workers:** Gus at the sales counter and Hattie at dough preparation, from the existing TownLife worker roster. They have separate chat interactions.

**Connected economy:** bakery equipment panels show live TownLife flour, eggs, milk, meat, vegetables, bread and pie stocks, opening times and assigned workers. The usual hourly automated flour-to-bread production is preserved. Visitors can try **one supervised batch per town day**, using two real flour bags, 40 simulated town minutes of proofing, 25 minutes in the oven, then eight saleable loaves counted in TownLife's bread inventory and baking statistics. The same state is persisted with normal TownLife saves to avoid duplicate collection. A glowing oven indicator reflects supervised baking.

**Validation:** live Github Pages browser showed all eight rooms, 18 reachable interactions (16 equipment activities plus Gus/Hattie), enter and exit working, and farmhouse still showing ten rooms. Mocked production tests verified inventory consumption, time gates, duplicate prevention and resulting loaf count. Regression source: tests/bakery.mjs.

**Still future work:** true steam and thermal physical effects, opening oven doors, animated mixing paddles, dough changing shape by fermentation, NPC movement between workstations that precisely tracks work shifts, actually cooled loaves moving between 3D shelves, full recipe/allergen database and a kitchen food-safety simulation. The game remains stylised low-poly, not photorealistic.

## Other 18 town-life interiors: not yet authentic
These sites still use the common one-room counter/shelf template in world/shop-interior.js. Their underlying town simulation and purchase UIs work, but their geometry is generic.

| Building | Realism work needed |
| --- | --- |
| General Store | Different aisles, checkout, fridge cases, store room, stock delivery |
| Café | Seats, coffee station, wash-up, cooking areas, staff zone and toilets |
| Greengrocer | Produce displays, scales, backroom and chilled storage |
| Butcher | Display fridge, clean cutting benches, cold room and sanitation |
| Pub | Bar, dining room, commercial kitchen, cellar, washrooms |
| Town Hall | Council chamber, mayor office, archive and service desks |
| Market Square | **Open-air plaza** rather than a fake indoor shop; stalls, shaded seating, public noticeboard |
| Post Office | Sorting racks, mailbags, queue, delivery room and service counter |
| School | Classrooms, library, teacher desk, books and toilets |
| Clinic | Reception, waiting, consultation, treatment, medicine storage and hygiene |
| Rail Depot | Dispatch office, freight platform, loading bays, safe vehicle routes |
| Flour Mill | Hoppers, mill, flour-bagging line, dust controls and storage |
| Sheep Station | Shearing shed, pens, shearing boards, wool bales and farm gear |
| Dairy | Milking bays, wash-down, cold storage, animal movement |
| Chook Shed | Nest boxes, feeders, egg sorting, ventilation |
| Orchard | Crate handling, sorting, packing and cool storage |
| Market Garden | Irrigation, potting bench, tools and produce wash |
| Wheat Farm | Silos, conveyors, safety rails, grain scales and machinery |

### Acceptance criteria for each next building
Function-specific floor plan, physical and usable assets, a believable staff workflow, collision-free navigation and exits, interactions tied to the actual economy where supported, save/resume on desktop and Android, and a real browser playtest. Do not overwrite the current public game with older JoshMemory source.

**Suggested next: General Store**, with meaningful aisles, shelves that reflect actual stock, refrigerated food, a stockroom and goods arriving from the town freight system.
