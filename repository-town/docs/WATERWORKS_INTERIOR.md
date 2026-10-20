# Water Works J8 — dedicated walkable interior

Date: 20 October 2026 · Repository Town interior improvement · PR #88

## Reference and scope
This is a *fictional but technically informed* small NSW regional water-treatment works.
The layout takes inspiration from published NSW regional water-treatment descriptions
(including plants using membrane filtration and UV disinfection) and common control-room,
water-quality sampling, distribution pumping and maintenance practices. Not all NSW
treatment works use membrane filtration and UV; this is an illustrative technology
selection, not a claim about the actual treatment process of Dubbo or any named plant.

The game's water simulation does not model individual membrane pressures, UV doses,
chemical concentrations or microbiological quality. No real-world safe operation
can be inferred from the visual gauges.

## In-game location and layout
- J8 / `waterworks`: register `src/world/waterworks-interior.js` in
  `src/world/shop-interior.js`. Retain the shared 14×18 m building shell,
  same entrance spawn and safe exit zone.
- Five spatially identified operating areas with a continuous marked pedestrian aisle:
  front-left operations control office; front-right water-quality laboratory;
  rear-left membrane filtration; rear-right enclosed UV disinfection;
  rear pump and maintenance gallery.
- Furnish with monitors/SCADA-style diagrams, a testing sink and sample bottles,
  a bank of pressure vessels, enclosed UV reactors, duty/standby pumps,
  isolation/maintenance cabinets, lighting, piping and visible safety signage.
- Twelve inspectable hotspots. Two open the existing live Town Ledger.
- Entering-room water-status snapshot, when the game supplies the data:
  reservoir stock, supply/demand and supply condition. Values are explicitly
  labelled as **simulated units and snapshot** so stale reading is not mistaken
  for constantly streaming plant telemetry.
- Real operator-critical functions (UV lamp covers, pump switching, isolations)
  are *not* player-operable. This is educational set dressing, not a plant-control UI.

## Walkability and verification
- `node tests/waterworks-interior.mjs`: flood fill against actual colliders
  with 0.35-m player radius, confirms routes from spawn to every interaction,
  staff station, five zones and exit, centre aisle clearance, bounded geometry,
  SCADA/ledger interactions and both zero/full simulated-water snapshots.
- `node tests/shop-interiors.mjs`: delegates to dedicated Water Works assertions.
- Run `npm run test:integration`, `npm run build` and `npm run check:privacy`.
- Browser acceptance still requires physically walking into J8, checking appearance
  and returning to the street on the latest deployed build. CI does not prove
  GitHub Pages/Render is serving the latest commit.

## Coordination
Avoid changing existing Power Station and Rail Depot modules: those interiors were
handled by separate PRs. J8 uses only a new module, one dispatcher registration,
two test changes, package script, this documentation, and the claim in COORDINATION.md.
