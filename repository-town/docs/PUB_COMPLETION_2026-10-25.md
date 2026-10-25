# Pub completion: modelled systems and independent approval hold points

PUBLIC engineering/gameplay evidence, 25 October 2026. Resumes PR #208 against main e9fc9e4. Namespace **PUB-CODE** retains RTPUB-001–034; the older PUB-UTIL numbering remains independent.

## Physical implementation

The 14 × 18 m single-storey envelope is retained. Interior now contains the public bar/bistro, enclosed kitchen, accessible-design WC, separate ambulant-design WC and an actual walk-in cold room. Both WC doors and the food-room doors are animated; the main WC has a user-controlled privacy latch. Fixed fixture collision footprints and a 0.6 m-radius route test replace decorative-only assertions. A corridor baffle that obstructed the rear route was removed. Lowered service counter, rails, assistance point, lever handles and soap/towel fixtures are represented. AS 1428.1 exact dimensions and a qualified access review remain hold points; a game path test is not an accessibility certificate.

The rear opening now has a real exit transition to the rear service landing, with a continuous side route to the street. Exterior and interior rear openings align through the shared +1 m coordinate transform. Front, rear, kitchen and WC emergency luminaires use finite battery autonomy. External routes are verified against game collision geometry, not surveyed gradients or lawful adjoining property rights.

The kitchen has dedicated handwashing, preparation, dishwashing, covered clean-storage and a separate cleaner sink/chemical cupboard; waste storage and grease access move outside food areas. A walk-in chiller has persistent temperature exposure and quarantine. Cold re-cooling does not itself declare food safe. The venue conservatively quarantines stock after two accumulated hours above 5 °C rather than trying to certify a serve-immediately exception under the two-hour/four-hour rule. Actual food-specific validation remains necessary before any real food-safety claim.

Roof gutters/downpipes, exhaust termination, hot-water cylinder, LPG cylinder pair/regulator boundary, grease-arrestor access, lidded bins, perimeter support representations and accessible-route paving are present. Structural elements are schematic: no beam, footing, wind, fire-resistance or roof-load certification is invented. The hearth is explicitly a decorative electric display, not an unflued solid-fuel appliance.

## Working operations

Typed source-to-fixture service graphs separate potable supply, sanitary sewage, kitchen trade waste, storm drainage, gas, electricity and internet. WC and second-WC cisterns are independent. Branch isolation prevents the affected operation before resource/payment changes and leaves unrelated services available. Stored cistern water remains usable when mains supply stops. Roof runoff cannot enter the sanitary ledger; blocked storm drainage retains and overflows finite volume, then drains after restoration. Network overlays follow named synthetic equipment ports and are labelled schematic x-ray views.

The existing per-building electrical pilot is retained. Cooking requires mains, water, hot water, safe refrigeration, LPG, extraction, working trade waste and food-safe operating conditions. RCD trip, gas leak, alarm, missing cleaning/hygiene supplies, pests, supervisor/training scenario and component faults affect service. Emergency drills isolate LPG, stop service, refuse entry and send pub occupants to a modelled assembly point. Emergency controls remain accessible from the pub's public Town Ledger panel for recovery after evacuation.

Player alcohol orders require an adult-ID scenario, no intoxication flag, free potable water and a fictional enabled licence scenario. Actual NSW licences, venue-specific authorisations and RSA competency records are not fabricated. Allergen information identifies wheat/milk/egg risk and supplier uncertainty; no dietary guarantee is asserted. Occupancy uses actual NPC patrons, a 24-patron gameplay admission cap, and diversion/fallback meals when full; this is not an approved capacity or NCC fixture schedule.

A bounded persistent event/inspection history records functional simulation outcomes and faults. Every record explicitly distinguishes a simulation inspection from a real approval. No generated permit numbers, fabricated licensed-trade sign-offs, DA, CC, OC or annual fire safety statement are introduced.

## Evidence and outstanding formal standards

Primary-source baseline checked: NSW government current NCC page (NCC 2022 Amendment 2), NSW fire-maintenance reforms from 13 February 2026, NSW Food Authority retail food temperature guidance, and Liquor & Gaming NSW patron/free-water and intoxication duties. Existing source register and classification evidence remain authoritative.

- https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code
- https://www.nsw.gov.au/departments-and-agencies/building-commission/industry-changes/reforms-to-building-fire-safety-regulation
- https://www.foodauthority.nsw.gov.au/retail/cafes-restaurants-and-retail-outlets
- https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-responsibilities/patron-rights
- https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-responsibilities/management-of-intoxicated-patrons-on-licensed-premises

**All 34 full code-assessment tasks retain their actual status.** Modelled work does not establish property rights, construction type, fire compartmentation, required hydrants/hose reels/sprinklers, fire-system/lux design, approved occupancy/fixture counts, AS 1428 compliance, exhaust/make-up-air sizing, plumbing/backflow/trade-waste approval, licensed electrical/gas installation, structural loading, noise/Section J assessment, liquor licence, food-business notification or competent inspections. Those remain explicit hold points in PUB_NCC_2026_TODO.md; no honest simulation can generate those independent real-world decisions.

## Reproducible checks

`node tests/pub-completion.mjs`; `node tests/pub-utilities.mjs`; `node --test tests/pub-physical-p0.mjs tests/pub-envelope-002-024.mjs`; `node tests/shop-interiors.mjs`; `node tests/pub-compliance-browser.mjs` against an actual local or hosted release. Browser checks use desktop and emulated Android, exercise both WCs/cold-room/kitchen/operating faults and keyboard rear egress, and sample the entire 1.2 m external return path against town colliders. Physical handset and qualified professional review remain separate.

Full release validation is in progress. A pre-existing expanded-town affordability failure was reproduced on unchanged main. Shared household billing now debits once per home, splitting contributions; finite opening government allocations and grant reserve preserve the original 38-person per-resident funding for the 171-person roster. Means-tested finite hardship support runs morning/evening and includes students/pensioners, checking savings. Existing saves retain their balances. The original 14-day affordability assertion now passes unchanged; finite-account conservation remains tested. A second unchanged-main release failure allowed civic representatives to bypass an opt-out preference; the minimal correction honours that existing preference and passes the original public-politics regression. No dialogue content or unrelated roadmap completion is claimed. No live publication or all-standards completion is claimed until exact source/fingerprint, tests and hosted results are recorded here.
