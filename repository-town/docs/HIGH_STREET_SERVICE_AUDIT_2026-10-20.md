# High Street service realism audit — 20 October 2026

Source inspected: c9b8d4b20c3a852e67692c02e9e9e8fb8bda3f50. Scope: shop-street service presence, opening status and ordering UI. This is not a completed visual walk-through: the live GitHub Pages page reported `Error creating WebGL context` in the available browser.

## Fixed
- Counter characters were cloned from the roster even while the named worker travelled, slept or performed a council assignment elsewhere. Counter rendering and conversation hotspots now follow actual work attendance and update without re-entering the building. Relief-worker identity follows the real simulation record. Only established named hosts (Nell and Market Guide) appear without a work roster.
- Closed shops offered Buy, Order and Sell back actions. Trading controls now follow opening hours; menus remain readable for planning a later visit.
- Sold-out cafe items had active-looking Order buttons. They remain listed as sold out but are not offered as orders.
- A worker dispatched elsewhere could be described as here now. Presence requires the matching actual workplace, not just a work activity.
- Till cash was labelled takings so far, although that balance also changes through wages and supplies. It is now Cash in till, including a zero balance.

## Evidence and limits
`node tests/high-street-service.mjs` passes against the real counter model/Walker and actual panel-builder code with deterministic dependency fixtures. Covers travel, arrival, dispatch, departure, relief staff, ghost prompts, explicit hosts, closed/open trading, sold-out menus and till labels. Full existing Town safety gate remains required before merge; graphical phone/desktop validation remains unverified.

## Outstanding realism
This pass does not claim a full town simulation: pedestrian behaviour, stock deliveries and production, staffed transaction enforcement, exterior opening signs, room layouts, crossings and window views require their respective current tests and visual acceptance. Earlier experimental pedestrian PR #46 is not included; it failed long-run town checks and must not replace newer main movement code.
