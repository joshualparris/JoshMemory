# Master plan D: implementation and evidence register (27 October 2026)

Continues ChatGPT's measured planning investigation (`research/masterplan/README.md`), which
compared four alternatives and conditionally preferred **D**: southern neighbourhoods with a
farm-clear eastern tie-in. That work stopped before integration; this document records what
is now built, how each requirement was verified, and what remains open.

Scope: fictional game town. Nothing here is an approved subdivision, survey, Geographical
Names Board address, traffic study or engineering certification.

## What is built

- `src/world/masterplan-built.js`: renders D from the same geometry the audit measured
  (`masterplan-model.js`), so the audit, 3D town, driving and the map share one source.
  - Roads: **Wattle Street** and **Banksia Street** (east–west), **Kurrajong Road** and
    **Bottlebrush Road** (continuing the x −208 and x 52 avenue lines south from Workshop Way /
    Street 8), **Silo Lane** (x 338 farm-clear tie-in) and **Saleyards Road** (employment
    access). 8 m carriageway in a 20 m reserve, 2 m footpaths, dashed centre lines, junction
    name signs.
  - 52 parcels: 48 residential (16, 20 and 24 m frontages × 35 m = 560/700/840 m²), a
    9,600 m² community campus, a 9,600 m² park and two 2,400 m² employment lots, with survey
    corner posts and numbered letterboxes at the frontage.
- Addresses: sequential numbers from each road's town end, odd on the left and even on the
  right when travelling away from that datum (the urban convention councils apply under the
  NSW Address Policy and User Manual; sources below). Legacy H:/B: keys and `A7-N` plot codes
  are unchanged, so old saves are unaffected.
- `src/ui/town-map.js`: interactive map (🗺️ Map button, **N** key): pinch or wheel zoom about
  the gesture point, drag to pan, tap for an address card, search by name or address,
  "📍 Me" to centre, live player arrow, scale bar. Shows existing streets, every house and
  business with its address, campuses, farm fields, railway, D's roads and parcels, and the
  remaining concept reserves marked "future reserve".
- Driving: `roadAllows` now uses bounded road extents. Previously every street and avenue was
  treated as infinitely long (ChatGPT's defect 2), so cars could leave the map along them.
- World edges moved to x ±540, z −395…470 so the neighbourhood is walkable; the ground plane
  already spans x ±550, z ±475.
- Superseded concept tiles S-R1, S-AG1, S-AG2 and the six unconnected concept road strips are
  no longer drawn; their data and tests remain as the record of alternative A.

## Requirement register

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Selected plan built from audited geometry | Verified | `tests/masterplan-built.mjs`; `tools/audit-masterplan.mjs` reports D: 1 graph component, 0 unfronted, 0 unreachable, 0 road intrusions, 0 building conflicts |
| 2 | Roads connect to the existing network | Verified | One connected component with core roads; all three links start on Street 8 (z 177) |
| 3 | Roads clear of buildings and fields in the running game | Verified | `tests/town-map-browser.mjs`: every plan road probed every metre at 0.45 m radius in Chromium, desktop and Pixel 7 emulation, no collisions |
| 4 | Neighbourhood reachable on foot | Verified | Same test: real keyboard walk down Kurrajong Road past the old z 214 world edge |
| 5 | Roads driveable; core roads bounded | Verified (logic) | `tests/masterplan-built.mjs` road checks; existing `nsw-driving-lease` and `occupations` tests pass. A physical drive in the browser is not yet recorded. |
| 6 | Every parcel addressed once, odd left / even right, ascending from the datum | Verified | `tests/masterplan-built.mjs` |
| 7 | No parcel overlaps another parcel or any road reserve | Verified | `tests/masterplan-built.mjs` |
| 8 | Interactive pinch-zoom map with addresses | Verified | `tests/town-map-browser.mjs`: open by button and N, two-pointer pinch 1.0→2.0 px/m, drag pan, wheel zoom, search, tap card, close; no page errors on desktop or phone |
| 9 | Privacy check on the public build | Verified | `node tools/check_privacy.mjs`: no private data. One Bracken House phrase was reworded earlier for this check. |
| 10 | Full Node suite | Verified at commit time | All `test:release`, `test:integration`, `test:town` steps pass locally |
| 11 | Production deployment verified on desktop and a real phone | **Not done** | Needs the PR merged and the Vercel/Pages deployment checked; a real handset test needs Josh |
| 12 | Single-closure resilience | **Open** | Audit `largestClosureDisconnection` is 26 lots: closing one link segment cuts off that many frontages. A second east–west connection or a loop at the west end would fix it. |
| 13 | Street 7 / railway overlap (ChatGPT defect 1) | **Open, not caused here** | `RAIL_Z` and Street 7 asphalt overlap across the town; needs a dedicated rail realignment task |
| 14 | Utilities, drainage, terrain, swept paths | **Out of scope / blocked** | No utility model exists for the new area; Austroads swept-path tables are paywalled (403 on full PDFs) |
| 15 | Homes built on the residential lots | **Not done** | Lots are vacant and marked "not yet serviced". Adding houses needs owners/residents and economy hooks. |

## Sources (addressing)

- Lithgow City Council, Road Naming and Property Addressing: sequential positive integers,
  odd numbers on the left, even on the right.
  https://www.lithgow.nsw.gov.au/Plan-Build/Planning-your-Property/Road-Naming-and-Property-Addressing
- Snowy Monaro Regional Council, Property Addressing: urban houses numbered sequentially,
  odd left, even right.
  https://www.snowymonaro.nsw.gov.au/Building-and-Planning/Development-Considerations/Property-Addressing
- City of Parramatta, Property Numbering and Display of Property Numbers Policy: numbering
  runs from a defined datum at the start of each road.
  https://www.cityofparramatta.nsw.gov.au/sites/council/files/inline-files/Property%20Numbering%20and%20Display%20of%20Property%20Numbers%20Policy.PDF
- Tweed Shire Council, Addressing (Rural and Urban) Policy: datum definition; rural numbers
  are distance from datum ÷ 10 (used to confirm D's urban lots should be sequential instead).
  https://tweed.nsw.gov.au/files/assets/public/documents/council/council-policies/addressing-rural-and-urban-policy.pdf
- The NSW Addressing User Manual itself (Geographical Names Board, chapter 6) is the
  authoritative text; these council policies apply it. It was not re-read in this pass.

Planning-standard sources (Dubbo DCP, Austroads, TfNSW) are recorded in ChatGPT's
`docs/*_2026-10-27.md` research files and `research/masterplan/README.md`.
