# Repository Town: measured planning investigation

Research date: 27 October 2026. Work in progress, not a completed planning or production acceptance claim.

## Current evidence

Baseline canonical source: `449f9a45ee20624bfb6b2dd7e5ec586abd89338d`.

The full 14,043,579-byte Dubbo DCP was downloaded and its subdivision, street, industrial and rural-interface sections read. The previous failure to fetch it was a research-browser size limit, not proof that the document was unavailable. The Minore strategy and Council standard drawings were subsequently retrieved with curl after urllib returned 403. Some Austroads and TfNSW full PDFs still return 403; their public catalogue pages are not substituted for their tables.

The audit enumerates 306 existing buildings, 14 core road centrelines, all junctions, seven agricultural fields, 12 legacy planning reserves and four explicit alternatives. Runtime geometry capture measures conservative visual bounds for all 306 buildings. Generated source inventory hashes are not claims to have semantically reviewed every file.

## Alternatives and the decision so far

A preserves the failed twelve-reserve/six-strip baseline. B designs two northern neighbourhood blocks. C reflects that same programme south: 48 residential lots (560, 700 and 840 square metres), two 2,400-square-metre employment lots, a 9,600-square-metre community campus and equally sized park. D repairs C's farm-clipping east tie-in by moving it from x312 to x338.

B and C/D have equal development programmes; A does not and cannot be ranked as an equivalent serviced development. Graph calculations split actual junctions and access points. Centre travel distances use network paths, not radial circles. All designs are unserviced; no occupancy, official subdivision or utility adequacy is asserted.

The initial model found zero 400m centre catchments for B and 45/52 for C. Actual renderer audit found B's western side of the central access intersects H:O1's visual extent, and C's eastern access clips the silo field. D has no road/visual-building or road/field overlap in the 306-building capture. This is a conditional preference for D, not a declaration of a global optimum. Full vehicle swept paths, terrain and drainage remain separate acceptance items.

## Reproduce

From `repository-town/`:

```sh
npm ci --ignore-scripts
npm run build
node tools/audit-masterplan.mjs
node tools/serve.mjs dist/public 8091
node tests/masterplan-browser.mjs
```

The browser runner needs Playwright Chromium. It records errors, actual building geometry, metre-spaced road collision probes and desktop/emulated-phone performance. A first attempt failed with `ERR_CONNECTION_REFUSED`; the local server was restarted and the rerun is in progress. No failed attempt is counted as a pass.

## Files

- `existing-town.json`: per-building source geometry and all existing route distances; original 46 non-expansion civic shells explicitly marked until reconciled with runtime capture.
- `alternative-A/B/C/D.json`: complete coordinates, split graph, parcel frontage, address proposals, closure scenarios and metrics.
- `comparison.json`: derived metrics, illustrative demand/cost sensitivities.
- `source-inventory.json`: hashed audit input inventory.
- `../../src/world/masterplan-model.js`: reproducible design and graph functions.

## Known high-priority defects

1. Street 7 asphalt and the railway envelope overlap across the town. Their centres differ by only 1m; the entire 7m-wide game rail envelope overlaps asphalt. Existing gate tests do not establish safe segregation.
2. Player driving previously permits infinitely extended strips because its road check does not bound road endpoints.
3. The original reservations have no proper reserve-boundary frontage (physical overlap is not frontage) and three road intrusions. Their centreline graph plus the core has four components, unlike the earlier strip-overlap graph's three components excluding the core.
4. A single full-road closure can remove frontage to multiple proposed lots even when the wider loop stays connected. Network redundancy is not the same as every property's access remaining open.

No emails, third-party contact, paid standards purchase or scheduled task has been initiated.
