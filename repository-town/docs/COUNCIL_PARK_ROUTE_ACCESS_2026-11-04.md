# Repository Town Council — 195-home route-based park access screening

**Council audit #157 • 4 November 2026 • `RTC-PARK-ROUTES-001`**

The 22 October report computed the distance from each proposed home to the eastern park as **a straight line**. This underestimates travel where homes are separated by streets, intersections or reservations. The separately-scoped `src/world/council-park-routes.js` now computes deterministic **shortest road-centreline distances** instead, with an explicitly estimated approach segment from home door to street centreline and an estimated crossing of the park's road reservation. The model uses the exact road graph, road junctions, proposed home positions, site parcels and lot-frontage functions already used for Repository Town's world geometry.

## Reproducible method

1. Source roads: `CORE_ROADS + PLAN_ROADS` from `masterplan-model.js` / `masterplan-built.js`. These include **proposed**, not built, roads. Each road is an axis-aligned centreline (fictional metres).
2. Start point: `PLAN_HOMES` `(x, frontZ)` for **195** planned homes. Each home's assigned parcel and street must exist and have a positive `frontage` in the planned graph; otherwise the route is marked unreachable, **not invented**.
3. Goal: **one currently modelled park parcel**, using its mapped `roadId`/frontage and the closest road-centreline access point; an **assumed** half reserve width reaches the edge of the park boundary. This is **not an accessible crossing survey**.
4. Split road segments at all mapped junctions and these access points using `graph(roads, extras)`. Run `distances(graph, goalNode)` (Dijkstra implementation already in the project), then add each home's distance to its road access and park reserve offset. Round to 0.01 game metres.
5. Report for each of 195 homes: stable fictional parcel ID, road, modelled frontage/route validity, centreline distance, approach distance, illustrative total distance, and Euclidean lower bound to the *same* park road point. Summary: connected components, reachable vs unreachable, count beyond 400 **proposed metres**, P50/P90, maximum. None of these imply 400 m walking-time compliance in the real world.
6. Missing park access road fails closed with **zero reachable** rather than producing a fictitious alternate entrance. Test catches missing/corrupt parcel joins, disconnected network, zero/negative segments or a road route shorter than its straight-line lower bound.

## Clear limits

- **No footpath network geometry:** walking along a carriageway centreline is merely an optimistic **routing proxy**, not a safe pedestrian path or road crossing. This cannot test kerb ramps, gradient, pedestrian signals, lighting, traffic delay, wheelchair turning space or footpath gaps.
- **No GIS/legal validity:** estate is fictional, map units are fictional metres, parcels are not surveyed/titled, park entrances are not surveyed, and no consent, LEP, DCP, NCC, engineer or council approval has been issued.
- **No fabricated park equity outcome:** a 400 m threshold is a descriptive screening benchmark, not a statutory limit. The source test requires that western homes still show a deficit, rather than pretending the new routes fix equity.
- **No infinite grants:** this audit does not change `finance.js`, Town Dollars, council voting, physical construction, actual NSW money or public spending.
- **No private resident records:** houses use deterministic fictional parcel IDs, not real identities or addresses.

## Run and next acceptance

`node tests/council-park-routes.mjs` verifies 195 unique homes, source graph connectivity, bounded P50/P90, positive distances, geometric lower bound and missing park frontage fail-closed. After accepting this isolated module, integrate into the `test:town` release gate without deleting the current Narromine #358 evidence tests. It can be recomputed when roads or parcels change.

**To truly resolve #157**: survey actual footpath and kerb geometry, legal land/zoning/ownership, crossings and gradient, then compute *walking network* distances and compare with real traffic counts, accessibility specialists and community consultation. Until then this is a better proposed-road routing instrument, **not an independent engineering certification**.
