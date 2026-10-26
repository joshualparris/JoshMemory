# RTBUILD-070 · O5-N Repository Visitor Information
Research and simulated building delivery · 26 October 2026

## Provenance and accuracy boundary
O5-N is a fictional regional NSW tourist information centre at a fixed 12m by 9m infill address. Design inspiration comes from publicly available exterior and internal photos of Dubbo Visitor Information Centre (green corrugated pitched roof, pale walls, covered porch, accessible travel assistance and map/brochure/gift displays). This is NOT a measured facsimile: no verified as-built floor plan, proprietary fittings plan or survey is available.

## Source-led research
1. Dubbo Region council tourism site: https://dubboregion.com.au/visit/contact-our-visitor-information-centres — tourist maps, local routes, accommodation and ticket enquiries, local produce, Wi-Fi, public toilets, seating, charging, family-friendly facilities. The real centre operates separate weekend and weekday hours. Those real hours must not overwrite the fictional town economy.
2. NSW Government listing: https://www.nsw.gov.au/visiting-and-exploring-nsw/locations-and-attractions/dubbo-visitor-information-centre — coach and RV parking, souvenirs, public toilets and accessibility needs. Parking and playground deliberately not fabricated on the constrained in-game lot.
3. NSW Holidays and photographs: https://www.visitnsw.com/destinations/country-nsw/dubbo-area/dubbo/visitor-information-centres/dubbo-visitor-information-centre — publicly visible verandah pillars, low pale walls, green pitched roof, brick-red approach, glass entrance, white souvenir fixtures and exposed trusses.
4. Destination NSW visitor centre accreditation: https://www.destinationnsw.com.au/destination-nsw-business-support/accredited-visitor-information-centres — the AVIC information trademark is accreditation-specific; the fictional building does not claim accreditation or use its protected logo.
5. Destination NSW brochures: https://www.destinationnsw.com.au/destination-nsw-business-support/nsw-first-program/guide-to-offline-marketing — visible brochure titles, uncluttered displays and category organisation informed the printed guide racks.

## Implemented
- Exterior: 12 m x 9 m pale-sand weatherboard-style building, green corrugated pitched roof and ridge, verandah, posts, 2.6 m central glazed portal, broad windows, entrance paving, plant beds, bench, water point and lighting.
- Interior: tile hall with matching unblocked front door; visitor advice counter with seated-service section, display monitor, maps and paper guides; ordered brochure racks; visible souvenir display; bench; itinerary corner; water/charging point; illustrative accessible toilet with 1.3 m doorway and grab-bar/basin fixtures.
- Gameplay: seven accessible hotspots (advice, map, brochures, local gifts, itinerary, amenities and rest); live civic-ledger counter action and existing worker roster; preservation of the site's original visitor hours; exits return to the existing front street instead of the rear wall.
- Performance: colour/material reuse and cached geometry, no injected video streams, no external booking/ticket backend.

## Test evidence and limitations
The new dedicated visitor-information.mjs test checks footprint, canopy, roof, glazing, the central passage, player-radius collision flood-fill to every information hotspot, toilet door opening and front exit; town-expansion.mjs invokes the test in the release gate. Browser exit-facing.mjs includes walking out the door and manual exit for O5-N.

This low-poly fictional rendering is not a verified NCC or AS 1428 design, nor an actual Dubbo VIC layout. Real dimensions, compliance, fire systems, gradients, signage, emergency egress, plumbing, glare, toilet turning, glass safety and accessibility need professional investigation. No real booking/ticket/service operation is represented.
