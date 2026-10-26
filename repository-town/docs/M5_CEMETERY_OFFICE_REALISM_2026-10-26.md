# RTBUILD-068 — M5-N Repository Cemetery Memorial Office
26 October 2026 · Site-inspired, fictional game architecture

## Design basis
M5-N is an existing fictional 12 m × 9 m north-facing road plot next to the N5-N bus interchange. The old exterior was a generic two-window brick shop and the interior a generic shop desk. The new building is a **single-storey country NSW cemetery administration and family enquiries office**, not an unrealistic chapel or whole cemetery forced into a commercial lot.

There is no verified site survey, as-built plan, cemetery capacity, consecration history or consent record for this fictional facility. Its dimensions, furniture, windows and memorial are design choices, not certified real-world measurements. No names, dates, religious motifs, interments or actual graves have been invented.

## Primary sources (accessed 26 October 2026)
- Dubbo Regional Council, Cemeteries / Memorial Mapper: https://www.dubbo.nsw.gov.au/Community-Groups/Community-Services/cemeteries — records enquiries, New Dubbo and Wellington Lawn Cemeteries and the Council's Memorial Mapper. Public records search is not the same as disclosure of protected operator records.
- Cemeteries & Crematoria NSW, Industry Regulation: https://cemeteries.nsw.gov.au/industry-regulation — Cemeteries and Crematoria Act 2013, Regulation 2022, and the operator licensing/interment industry scheme.
- NSW interment rights guidance: https://www.cemeteries.nsw.gov.au/industry-regulation/interment-rights — operator's written order for interment, interment rights and authorisation for headstones/memorials, reasonable religious and cultural practices.
- NSW Government functional records authority FA428: https://www.nsw.gov.au/nsw-government/recordkeeping/records-retention-and-disposal-authorities/cemeteries-and-crematoria-operations-fa428 — retained interment rights, grave section maps, memorial approvals and operator records. No such personal data are shipped to the browser.
- Cemetery Industry Scheme conditions v2.6 current from 1 July 2026: https://cemeteries.nsw.gov.au/industry-regulation/interment-industry-scheme — applies subject to individual effective dates; consumer contracts and maintenance guidance.
- Lismore Memorial Gardens reservations office (regional service front): https://www.miragenews.com/new-cemeteries-office-offers-more-for-community-654488/ — modest public administration frontage and clear reception signage.
- Litchfield Council's Thorak Regional Cemetery photo gallery: https://www.litchfield.nt.gov.au/services-projects/thorak-regional-cemetery — timber public reception counter, simple chair, plant and cemetery layout map as authentic visual precedents.

## New exterior
- Sandy-red brickwork and cream window surrounds, low corrugated green-grey pitched metal roof and gutters.
- A covered front verandah with slender posts, 2.5 m glazed double-front entry, two broad picture windows, brick entry path, warm porch lights, planted beds and a small waiting bench.
- Anonymous sample memorial plaque in a small display garden. **No burial plots** are fabricated onto the 12×9 m site. A real interment landscape needs separately planned and approved land.

## Interior spatial programme (local +Z towards the street)
- Public welcome/reception (including seated-height assistance), short waiting benches, non-identifying memorial-section map and brochures, sample plaque styles, water station and flowers.
- Rear-left private family consultation room with real 1.4 m open doorway, paired comfortable chairs and a small table, for conversations about cultural preferences, rights and respectful remembrance.
- Rear-right staff records room with real 1.25 m opening, locked-style filing cabinet meshes, secure workstation and non-sensitive information point. No actual records, people, legal documents or confidential IDs appear in game data.
- Eight interactive points: reception opens existing Town Ledger; map, anonymous design samples, flowers, consultation, register policy, interment-rights guidance and maintenance all give grounded explanations.
- Actual central clear entrance and colliders allow walking through the rooms and back out the front. Scene windows and lighting support visual orientation and evening visibility. Original fictional visitor hours and existing cemetery officer roster preserved.

## Safety and privacy limits
This is a game environment, not an NCC, AS 1428, cemetery, WHS or fire egress compliance certificate. Professional survey, site accessibility appraisal, roof/fire/structural design, evacuation, funeral procession routes, drainage, record-privacy, engineering, operator licence and cemetery site/plot approval are unverified. No real funeral bookings, interment-right transfers or burial orders occur in game.

## Acceptance
- Dedicated tests/cemetery-office.mjs validates footprint, glazing, garden, three accessible rooms using player-radius flood fill, every info station, front door and denied-entry bounce, no real record output.
- Town-wide tests/town-expansion.mjs imports the dedicated test in the mandatory release gate.
- Recorded WebGL tests/exit-facing.mjs enters, inspects, physically walks out and uses manual exit from M5-N on real rendered game builds.
- Branch and deployment fingerprints must be checked independently; passing Node tests or a merge alone is not evidence the production public host is live.
