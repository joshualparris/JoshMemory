# P8 Recycling Centre — realistic local collection, reuse and materials recovery

20 October 2026. Replaces the generic three-point shop-counter interior at P8,
the Recycling Centre on the south side of Repository Town High Street.

## Research
- [Sustainability Victoria: Where your recycling goes](https://www.sustainability.vic.gov.au/recycling-and-reducing-waste-at-home/recycling-at-home/where-your-recycling-goes).
  Modern MRFs combine manual pre-sorting and automated magnets, optical separation
  and other systems, then bale paper, cardboard, plastics and metals. Glass normally
  goes through a different material path. Contamination and tanglers are serious
  problems for plant and recycled commodity quality.
- [SafeWork NSW: Waste management and recycling](https://www.safework.nsw.gov.au/your-industry/waste-management-and-recycling).
  Moving plant needs guarded hazards, controlled maintenance, and separated work
  and pedestrian areas.
- [SafeWork NSW: Forklifts](https://www.safework.nsw.gov.au/hazards-a-z/forklifts).
  Pedestrians and vehicles should be separated with barriers, designated access
  paths, induction, and separate loading/unloading access.

These are reference practices, NOT claims of legal compliance, site licencing,
NSW EPA approval, or an engineering design. Equipment is deliberately inert.
A 14 x 18m building cannot contain a real complete industrial MRF; this scene
represents a small local recycling/reuse depot **with guarded explanatory
demonstration equipment**, with large-scale commodity processing offsite.

## Floor plan and work flow
Five spatial areas, each with independently attributed hotspots:

1. **Receival and weigh-in:** sign-in, traffic management diagram, parcel
   floor scale, operator behind a distinct counter, goods acceptance paperwork.
2. **Reuse and repair assessment:** visual triage/repair workbench, tool
   shadowboard, repairable electrical goods, restricted battery/e-waste
   quarantine. No simulated approval to accept risky electrical items.
3. **Pre-sort:** static guarded conveyor demonstration, visual material mix,
   screened contamination/reject bins and marking for safe exclusion.
4. **Sort demonstration:** magnetic ferrous separation, optical recognition
   and non-ferrous educational display; no hands-on hazardous operation.
5. **Storage and dispatch:** strapped commodity bales, baler/compactor
   display, glass containment and outbound logistics with fixed barriers.

A 2.7m unobstructed central visitor spine runs from the door to back-of-room
inspection. Staff stands behind the goods-in counter. The player can return
through the original street door and inspect 16 safe hotspots.

## Simulation truth, not fictional production
Existing TownLife logic collects recyclables from households twice daily;
recyclers convert simulated recyclables to scrap, which freight trucks deliver
to the Foundry. This feature does not modify that economy or award goods for
clicking descriptive hotspots.

`site.stock.recyclables`, `site.stock.scrap` and `site.out.scrap` provide
a labelled **entry-time snapshot**. Bales are drawn as up to twelve small
visible stock units when recycling inventory is high; with zero inventory,
the displays are empty. Three hotspots open the authoritative Town Ledger.
No fabricated environmental audit score or recycling certificate is implied.

## Acceptance
- `node tests/recycling-interior.mjs`: both full/empty stock and dispatcher,
  five named rooms, 16 distinct scene-aware interactions, 3 Ledger controls,
  full route flood-fill with player radius, every hotspot, staff, rear gallery
  and return door, shell/window geometry, stock-display variation.
- `node tests/shop-interiors.mjs`: no return to generic room.
- `npm run test:integration`: existing NPC, traffic, economy, collision,
  save/reload and town-long simulation regression tests.
- `npm run build && npm run check:privacy`: canonical published bundle safety.

Only after checks pass merge to canonical JoshMemory, then publish exact
module and minimal routing to Parris-Tech-Services/Repository-town.
Production Vercel and GitHub Pages versions must be checked separately.
No automated suite substitutes for a genuine rendered, manual browser walkthrough.
