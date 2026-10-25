# PUB-CODE/RTPUB-002 and RTPUB-024 — one-storey pub envelope
25 October 2026 · Repository Town B:pub · N8-S

**Status:** the game-model mismatch is resolved *at source-design level* once PR tests, merge and hosted playtest pass. **Not a claim of Australian code certification.**

## Authoritative design choice
The Merged Branch is modelled as a **single usable ground floor**, not a partly inaccessible two-storey hotel. The previous second glazing row was illustrative but misleading: there was no upstairs walkable room, stairs, lift, floor slab or second-storey egress. This task **removes the fictitious upper floor rather than inventing inaccessible spaces**. The original construction year, former trading name and past changes are UNKNOWN.

## Dimensional and alignment schedule (game metres)
| Element | Interior | Town facade |
| --- | ---: | ---: |
| Width | 14 m (x=-7 to +7) | 14 m (x=-7 to +7) |
| Depth | 18 m (z=-12 to +6) | 18 m (z=-11 to +7) |
| Local centre | z=-3 | z=-2 |
| Transform | **town local z = interior z + 1** | same centreline and side boundaries |
| Storeys | 1 | 1 |
| Wall and ceiling | 4.6 m wall; ceiling at about 4.7 m | 4.6 m wall, eave 4.85 m |
| Non-habitable pitched roof | no first-floor occupancy | roof highest point 5.95 m |
| Windows | 2 front, 2 side at ground level | corresponding projected openings |
| Front doorway | 2.1 m nominated opening | identical location at x=0, front facade |
| Nominal lot (not title survey) | 26 m pitch × 46 m lot-row pitch | 6 m side-to-side remainder each; front space 16 m and rear 12 m based on local centre |

**Geometry source of truth:** `src/world/pub-envelope.js`. The rendered town facade is built by `buildPubFacade()`; the pub's existing furnished interior asserts identical footprint width/depth and translated front/rear elevations when entered. Ground-floor exterior windows and doorway are now formed as discrete masonry, glazed openings and mullions; the old 14 × 11 × 7 m opaque two-storey cuboid, second glazing band and false high shop sign are removed. Frontage signage is repositioned below the eaves. The historic-style cornice is decorative, **not evidence of age or an additional level**.

## Non-negotiable unresolved compliance evidence
The current nominal lot pitch **is not cadastral surveying**. Existing lawful floorplate, ownership, setbacks, boundaries, neighbouring construction/fire separation, street accessibility and actual external drainage need evidence. The structure, foundations, wall and roof system, wind actions, waterproofing, fire separation and NCC construction type need competent professional design. There is no development or construction certificate. **One storey in a Three.js model does not demonstrate NCC compliance.**

NCC reference date for NSW October 2026: [NSW Government, NCC how to comply](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code) (NCC 2022 Amendment 2 effective; NSW adopts NCC 2025 on 1 May 2027). NCC Volume One covers Class 6 and applicable structure, fire and access provisions.

## Acceptance test
`node --test tests/pub-envelope-002-024.mjs` verifies the generated 3D facade, wall/glass/roof count, a genuine single-floor height, exact frontage translation, kitchen and WC staying within the room shell, nominal lot bounds and expressly **unverified** site and professional sign-offs. Existing town, interior, utility and Android release tests must remain green. Hosting fingerprint and in-game exterior observation are separate acceptance steps.
