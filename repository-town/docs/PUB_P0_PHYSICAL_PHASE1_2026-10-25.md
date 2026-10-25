# PUB-CODE P0 physical works — phase 1, 25 October 2026

**Status: PROVISIONAL SIMULATION CHANGES ONLY. Not 100% NCC-, food-, fire-, liquor- or disability-law compliant.**

## Five highest-impact structural packages implemented in a branch

| Package | Existing permanent IDs | Source/model changes | Still required for real compliance |
| --- | --- | --- | --- |
| 1. Building envelope and storeys | PUB-CODE/RTPUB-002, -024 | Replace 14 × 11 m two-level-appearing pub facade with single-storey 14 × 18 m body and roof, preserving shopfront frontage; add explicit physical model | Confirm rear lot/deed footprint, site setbacks/adjacencies, building height, structural type, fire separation, weatherproofing, constructed floor/roof systems |
| 2. Occupant design basis | PUB-CODE/RTPUB-003, -011 | Document **24 patron + 3 staff** deliberately conservative *game scenario* and bounded manual admissions counter on pub utility panel | Legal maximum occupancy, seat/layout schedule, gender/ambulant/toilet fixture table and possible accessible capacity from a qualified NCC assessment; NPC presence is not linked to scenario counter |
| 3. Alternative egress | PUB-CODE/RTPUB-004, -027 | Create a **2.1 m modelled rear opening** in a pub-only rear shell, animated door, move back-bar shelves from opening, rear EXIT sign and dedicated path metadata | Confirm whether 2 exits are required, actual safe route distances and hardware, exterior discharge on suitable open space, rear adjoining lot access, fire walls, street orientation, smoke separation and evacuation; rear door is **NOT** a verified final game exit/discharge |
| 4. Continuous access route | PUB-CODE/RTPUB-009 | Preserve front entrance and centre aisle, move sanitary privacy baffle away from interior turning area, add inspectable access/egress explanatory hotspots and path assertions | Actual street thresholds, gradient/ramp, manoeuvring dimensions, door handles, AS 1428.1 clearance and accessible customer services, independent access consultant |
| 5. WC + emergency interface | PUB-CODE/RTPUB-010, -005, -006 | Reposition WC pan, basin and wall rail, keep wide privacy door and washable floor; add rear independent emergency luminaire and sign, model shared finite backup | **No** certified accessible toilet layout, exact grab-rail AS1428 placement, ambulant WC, fixture count, hot water/backflow/plumbing design, emergency lighting lux/distribution, required smoke/fire measures or fire-safety schedule |

**Safety boundary:** A rear exit should not be considered operational until it discharges outside safely. The game currently has a front-door-only world transition; the rear construction is a collision-open model/egress proposal, *not* a certified external evacuation route. Do not train users to rely on it as an actual evacuation plan.

## Technical scope and tests

- Core design metadata: `src/world/pub-physical-plan-2026.js` (model vs approvals separately).
- Assets: `pub-interior.js`, `townlife.js`, pub-only opening option in `interior-kit.js`, admissions scenario in pub utilities and UI.
- Focused regression: `node --test tests/pub-physical-p0.mjs`; existing `node tests/pub-utilities.mjs`; full release/QA before merging.
- No assumed 1911 date; construction age remains **UNKNOWN**.
- All PUB-CODE/RTPUB-002–034 remain OPEN until their complete requirements and acceptance are independently verified. Do not use a screenshot, 3D graphic, modelled width or test pass to claim legal certification.

## Sources/requirements considered (current NSW October 2026)

1. [NSW Government — How to comply with NCC](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code) — NCC 2022 Amendment 2 current, applicable certificates and new building work.
2. [ABCB NCC 2022 Volume One](https://ncc.abcb.gov.au/sites/default/files/resources/2025/ncc2022-volume-one.pdf) — relevant Volume One D2 escape/travel, D4 access and F4 sanitary provisions; exact deemed-to-satisfy design remains to be derived.
3. [NSW Food Authority — cafes, restaurants and retail outlets](https://www.foodauthority.nsw.gov.au/retail/cafes-restaurants-and-retail-outlets) — food premises design and Food Standards Code 3.2.3, plus AS 4674 as applicable.
4. [NSW Government — AS1851-2012 fire system maintenance](https://www.nsw.gov.au/departments-and-agencies/building-commission/industry-changes/as1851-2012/responsibilities-of-building-owners-under-as-1851-2012) — essential measures need a schedule and assessed maintenance from 13 February 2026; do not label decorative detectors as compliant.
5. [FSANZ Standard 3.2.3](https://www.legislation.gov.au/F2008B00577/latest) — food-area facilities, smooth/hygienic surfaces, sanitation and separation.

## Next dependencies, not closed
Obtain site/lot envelope and accessible entrance dimensions; complete real external rear discharge and collision/navigation world transition; make an exact fixture/equipment schedule; design detection, fire compartments, ventilation and egress through qualified engineering; connect potable, sanitary, trade waste, electrical and potential LPG individual assets; test and audit the complete hosted building on desktop/Android. Council approvals and liquor/food licences remain unsupported and must not be invented.
