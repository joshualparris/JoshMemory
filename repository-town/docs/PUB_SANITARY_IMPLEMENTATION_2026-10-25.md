# Pub sanitary privacy and utilities — implementation checkpoint

Status: PARTIALLY COMPLETE against the full 34-item standards roadmap. The user's request authorises remodelling and publication. No code-compliance certification is claimed.

## Implemented

- WC: a 1.4 m doorway with animated opaque leaf, lever representation, enclosing partitions, internal screen and washable floor representation. Door uses existing player-proximity animation; no privacy lock is claimed.
- Kitchen: separate collidable food-room partitions, 1.5 m animated door, dedicated handwash basin moved clear of entrance, dishwasher and dirty/clean rack sign, soap/towel fixtures and lidded waste/recycling bins.
- Front EXIT representation, smoke detector, extinguisher and blanket representations; emergency-light scenario has its own finite 90-minute runtime, separate from communications UPS. Equipment does not prove fire schedule compliance.
- Free potable water uses 0.25 L per action; isolation refuses without phantom flow.
- Extraction failure interlocks cooking. Warm cold-room exposure persists: 120 minutes above 5 °C quarantines stock. Recooling cannot clear it. Disposal clears perishable and prepared menu stock; normal supply/production must replenish. This conservative simplification is not a full food safety programme.
- Existing electricity, potable water, sewer, LPG, hot water, communications UPS, waste and trade-waste pilot actions retained. Shared industry grid allocation remains; full metered physical network work belongs to the electrical/water/sewer roadmaps.

## Verification

Focused Node acceptance includes flood-filled walking routes to fixtures, door metadata/visibility screens, service isolation, stock/water accounting, extraction interlock, independent emergency lighting, cold-stock quarantine and save migration. Full release and desktop/emulated Android browser checks are in progress. Physical handset testing and real certified design remain unverified.

## Remaining, in dependency order

1. PUB-CODE/RTPUB-002/003/024: reconcile external 14 × 11 m with internal 14 × 18 m and intended single storey; determine enforceable occupant capacity.
2. PUB-CODE/RTPUB-009–011: dimensionally review route/door/fittings and design accessible/ambulant amenities and fixture counts for that capacity. Current WC is NOT claimed accessible.
3. PUB-CODE/RTPUB-004–008/027: calculated egress, final discharge, fire schedule, battery/lighting distribution, detection, response and inspections.
4. PUB-CODE/RTPUB-012/018/020/021/022/026/033: real protected asset-port service networks, conservatively coupled upstream stocks/flows, grease consent scenario, stormwater, circuits and sourced LPG/electric cooking choice.
5. PUB-CODE/RTPUB-013–019/025/028–032: complete food workflow/cold chain/chemical segregation, noise, licensing/RSA and supplier/allergen controls.
6. PUB-CODE/RTPUB-023/034: structural assumptions and interdisciplinary independent review, actual desktop/Android walk and all acceptance evidence. Never close based on decorations or test pass alone.

Current NSW baseline was rechecked against https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code on 25 October 2026: NCC 2022 Amendment 2; NCC 2025 adoption is scheduled for 1 May 2027.
