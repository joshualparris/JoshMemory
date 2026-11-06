# Narromine interior realism — evidence first, one business at a time
**6 November 2026.** This is a work register, **not** a claim that all places are done.

## Baseline: what is duplicated
- `src/world/narromine-homes.js`: each generated home starts with the *same* lounge, kitchen, bathroom and laundry template; bedrooms change with household members. The model's household identity/fridge/bed occupants are distinct, but physical room arrangement and furniture patterns are largely repeated. `src/world/interior.js` supports several authored layout types, but the current home generator selects `row`.
- `src/world/narromine-workplaces.js`: `FIT` groups businesses by kind; `SHOP` and `OFFICE` fallbacks are reused. Named business identifiers, staffing, exterior coordinates and building doors do **not** make their interior floor plans unique.
- `src/world/narromine-coles.js` and post office use separately authored interiors. **Neither automatically proves a surveyed current shopfloor.** Narromine Pharmacy is the first named generic-workplace replacement in PR #470.

## Repeatable building workflow
1. **Identity and time:** confirm trading name, exact public entrance address, current date, services, operating hours, and whether the business remains open using primary business/council documents. Never substitute a nearby mapped place or guess a tenancy.
2. **Site evidence:** look for rights-cleared public internal photos, original store catalogue, dated social media posts, publicly disclosed property listings/architectural drawings, and outdoor street photos. Record exact subject/date/licence; photos are *references*, not textures that may be republished automatically.
3. **Evidence tags per object:** `OBSERVED` (photographed and recognisably current), `OFFICIAL` (service/advertisement documented by business), `INFERRED` (conventional credible fixtures, clearly labelled), `UNKNOWN` (no evidence; do not assert real location), `CONTRADICTED` (do not use).
4. **Building-specific spatial plan:** authored layout distinct from the generic room-by-room clone. If no measured plan, render as an *interpretive* space with bounded confidence and accessible, safe walkable routes. Do not insert stockroom doors, medical rooms, emergency exits or private residential spaces as authoritative from inference.
5. **Business operations:** actual published operating hours and categories; researched public services and interactive stations; generated residents are fictional staff, not named real employees. Staff numbers and customer volumes only source-grounded where independently verified.
6. **Physical acceptance:** mapped correct exterior wall/door, approach from clear footpath, transition to proper business ID, unique props and non-overlapping colliders, normal walking and accessibility checks, interactable services, exit to same frontage, persisted save, desktop + phone real WebGL screenshot and zero page errors.
7. **Release:** full `test:town`, 28-day economy invariants, `build:release`, privacy, GitHub CI head SHA, reviewed merge into main, then production sourceCommit equivalence and actual live navigation. A PR or source test isn't a deployment.

## Next named shops to research, one at a time
Possible next targets based on public Narromine Region retail listings, **not confirmed current tenancies or floorplans**:
1. **Soul Food Depot & Gallery** — art displays, gallery walls, produce and cafe; avoid replacing gallery with generic restaurant.
2. **Macquarie Clothing** — school/workwear, accessories and embroidery services; research public interior merchandising photos.
3. **Country Traders Home & Life** — boutique homewares/gifts at Kierath's shopping square; verify exact unit entrance.
4. **Zest by Modern Foodie** — research actual dine-in/takeaway counter, kitchen location only where visible.
5. **Narromine Hardware** — trade department categories and safety-clear aisles; obtain dated photo evidence.
6. **Narromine Cottage Craft** — artisan homewares and local goods; provenance for each observed display.

Source for business descriptions: https://narromineregion.com.au/shopping and https://narromineregion.com.au/__media_downloads/NSC_Shop_Local_Brochure_WEB.pdf?downloadable=1 (the latter may not reflect current operations).

## Private homes must be handled differently
- Do **not** represent a real family as occupants of a known street number, or guess the internals of specific private homes. Current simulation residents are fictional. An exterior footprint does not tell you the inside rooms.
- Build diverse deterministic **fictional** house designs from public Australian era/footprint/roof-style typologies: cottage, bungalow, mid-century, split-level and new-build; bedrooms/bathrooms to household needs; different furniture palettes and bedroom allocations.
- Unique deterministic identity for each house: seed based on stable home ID, not a random new layout on every session. Preserve existing saved home IDs, fridge inventory and occupant schedule.
- Where a permitted real listing floorplan is available, record the plan and current-vs-historical caveat, and only then consider accurately matching spatial layout with owner privacy safeguards.
- Test at scale: each home has beds for residents, fridge/cooktop/washing facilities, non-overlapping rooms, accessible door and exit, no random personal/private addresses exposed, and meaningful architecture diversity rather than superficial recolouring.

## Other realism tasks remain separate
**NR-LIFE-001/002:** Narromine commuters crossing into Repository Town need persistent car identity/physical parking bays on arrival, *not* merely a workplace panel mention; add passenger seats for family/carpool adults where day-plans justify them, verify origin/destination and collision-safe parking.

**Staffing evidence:** the Australian census is aggregated by industry, not a per-shop roster. Keep individual fictional roster counts tagged `ESTIMATE`; business-published team identities or headcounts cannot be silently assigned to simulated employees. Model open hours and shift coverage separately. No scraping of private employee data.

**Not complete:** all houses; all shops; intertown parked commuters; additional passengers; verified individual-business staffing. Each needs separate reviewed, evidenced work.
