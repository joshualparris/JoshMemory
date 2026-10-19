# Town government: implementation and acceptance record (19 October 2026)

This file describes the **implemented** government baseline, not aspirational content.
Merged PR: [#38](https://github.com/joshualparris/JoshMemory/pull/38), main commit c4e2179216b873eada7879ac8836e13a53bb61ff.
Verified source integration before squash: d5b0f7561cef680c7197f4388d5947b6636a8d47.

## What now works
- Three real-resident mayoral candidates: Vern, Arlo and Sadie; an election every seven in-game days. Non-student residents cast recorded deterministic votes according to household and service pressures. The visitor can cast **one vote per entire election**, persisted across reload. The new mayor takes the actual Town Hall mayor job; outgoing mayors return to work.
- Five individually elected and named councillors, distinct from the mayor, each connected to a real NPC household and a portfolio. Errol is the initial general manager, with a Town Hall job and public wages.
- Publicly viewable meetings, quorum, motions, recorded named votes, result, council priority/tax proposals and zoning permits **approved in principle**. A passed 8/10/12% tax motion updates the actual sales tax; priorities are recorded for future decisions.
- A public works request no longer heals a damaged network immediately: an actual worker (existing NPC) is assigned and travels from their town location to inspect for 15 town minutes, the general manager authorises a small delegated job with allocated budget, treasury funds and two spare-parts boxes, then the worker completes another 50 town minutes of repairs. The service improves only on work completion. Failed electricity feeders are restored via the same work-order path, with a permanent power-grid event.
- Accessible Town Hall UI: named council, financial allocations, voting, resolutions, service requests, progress tables, training power fault, deliberation, permit proposals, public register and earlier election tallies.
- Government state (votes, budget, councillors, motions, meeting minutes and job progress) persists in the existing town save and handles old save versions.

## Verified
The integrated latest-main branch deployed successfully to Render:
https://repository-town-government-main-qa.onrender.com/index.html
The same government code was merged to main and the main QA Render site deployed commit c4e2179 successfully:
https://repository-town-main-qa.onrender.com/index.html

Render build gates passed:
- 14-day economic simulation with public works
- capacity-limited grid, feeder events and save/restore
- 33 civic/farm/shop interiors
- 10-area farmhouse with 22 household interactions and 1,726 reachable floor cells
- four-day town vehicle stress, 115,200 ticks, 0 overlaps, 0 deadlocks
- elections/councillor/GM/public-works/permit/saving regressions
- source build for 188 houses and public build private-data scanner
- main QA also passed 76 packed game-shell and Expedition acceptance checks.

**Not yet verified:** an actual headed Android/desktop gameplay session by the owner. Render build and scripted simulation tests are not screenshots, touch testing or full player-driven playtesting.

## Outstanding realism gaps, do not claim done
- NSW-style independent candidate campaigning, political parties, live consultation and conflict-of-interest declarations.
- Actual land parcel registry, zoning-map changes, development applications, inspections and visible permitted 3D construction; the current permits explicitly say **approved in principle**.
- Capital-works tendering, contracts, procurement approvals, contractor selection and independently verified public financial statements.
- Emergency dispatch and mutual-aid arrangements, long-term assets/depreciation, formal delegated authority schedules for large contracts.
- Politically enacted priorities currently live as adopted policy and public minutes. Broader household feedback from every policy, automated councillor agendas, and realistic budgeting/asset life cycles require more simulation and acceptance tests.

Keep governance work on the canonical repo source \`repository-town/src/world/government.js\`, the integrations in \`src/world/life.js\` and \`src/ui/townpanels.js\`. Do not hot-edit the generated public site without an identical source change, and never disable the privacy check. 
