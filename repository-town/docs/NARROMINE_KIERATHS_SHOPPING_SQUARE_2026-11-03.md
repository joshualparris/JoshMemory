# Narromine — Kierath’s Shopping Square evidence handover

> **Status note (5 Nov 2026):** PR #289 (the NSW GIS proposal described below as open) was closed unmerged on 4 Nov 2026. Kierath's live arcade was merged in PR #309 and Coles was made walkable in #354. The rest is the original 3 Nov record.
Date: 3 November 2026 (Australia/Sydney)
Status: IMPLEMENTED IN FEATURE BRANCH — cadastral/path geometry and visual browser acceptance **PENDING CI/PRODUCTION VERIFICATION**

## Why this file exists
Claude's `claude/narromine` branch was compared with `main` after the Claude Code session reached its usage limit. At 08:13 UTC on 3 November, the branch was **zero commits ahead** of main (one merge commit behind). The latest Claude change, the Post Office street-photo rebuild, was already merged as PR #293 at 08:06 UTC. This file captures the *subsequent visual research* supplied by Josh so it is not mistaken for an unpushed code commit.

## Supplied reference evidence
Josh supplied a screenshot of a commercial property plan from realcommercial.com.au; photographs of the paved arcade, rear/car-park entrance, Coles front and roof from above, Coles/Kierath's canopy junction, Dandaloo streetscape/landscaping, and a photo of the Coles interior. These are **visual references supplied within the conversation, not assets committed to this repository**. Their original capture dates vary / are unverified; one Google contribution is marked four years old. Do not treat photographed tenants or signs as guaranteed current in 2026.

## Grounded site relationships from the supplied plan
- **Dandaloo Street** borders the shopping centre's street-facing side. **Nymagee Street** is the side street beyond the Post Office.
- The main **Coles supermarket** is the large blue tenancy on the plan, labelled **M01 (2,157 m² on the supplied plan)**. This number is *leased shop area*, **not** a measurement of its containing cadastral property lot. Do not confuse it with the ≈3,810 m² lot used by the existing 3D `dandaloo-82` model.
- The small-tenancy arcade named **Kierath's Shopping Square** lies alongside the Coles block toward the Post Office. It has an **open-air paved courtyard** arranged as an L/offset passage, with a way through from Dandaloo Street to a **rear car park**.
- The plan numbers approximately **ten small tenancies (1–10)** around the arcade and shows a **small round kiosk** near the Dandaloo Street end. The plan image does **not** justify invented tenancy names or exact door positions.
- The Post Office is a **separate building**, not an extension of Coles.
- At the **rear car-park entrance**, the supplied photographs show a wide arched steel canopy with the name **“KIERATH'S SHOPPING SQUARE”**, a paved forecourt, and a **Liquorland** roller-door frontage next to the canopy (historical signage; verify present occupancy before using it as a current business).
- Photos show **red brick lower walls**, **grey upper cladding**, **white fascia/gable ends**, a pitched **grey corrugated roof**, and the **Coles** wordmark on the supermarket gable. The aerial shows multiple roof planes, plant/equipment and a car park, not a single flat-roofed box.
- Josh reports that the Coles block sits behind the older **Kierath, Nelson & Co.** Dandaloo Street shopfront/parapet. The historic facade lettering still needs a direct visual check before a precise mesh/sign is added.

## What already exists on main
- `src/world/narromine-buildings-data.js` already has `dandaloo-82` with two Coles hall quads, one generic **Dandaloo Street shops** quad, an awning, and asphalt car park, and `dandaloo-76` as a separate generic shop/rear store/shed block.
- `src/world/narromine.js` has generic quad buildings, wall features, verandahs and props.
- PR #290 (Post Office aerial geometry), #291 (Coles/church block), #292 (early PO facades), and #293 (street-photo-corrected PO) are already **merged** into `main`. PR #289, the independent NSW GIS proposal, was **open and unmergeable** at capture time; **do not force-merge or overwrite the newer Claude building work**.

## Geometry and fidelity acceptance before claiming complete
1. Register each entrance, courtyard boundary and shop footprint in local coordinates **only after aligning the plan to the NSW cadastral/aerial base**. Keep Dandaloo, Nymagee and the Post Office in their actual orientation, not merely the rotated orientation of the screenshot.
2. Replace any generic building mass that physically fills the **open-air courtyard**. Ground paving must be open to the sky and accessible from both ends. Model the offset/L connection rather than carving an unsupported dead-end alley.
3. Preserve the supermarket footprint, roof-gable hierarchy and rear loading/car-park access; model the distinctive arched **Kierath's Shopping Square** canopy and visible storefront windows without pretending to know actual tenant names.
4. Add geometry and navigation tests: no building/road or courtyard/tenancy overlap; player can walk from Dandaloo into the arcade and out toward the car park; all named features are inside their mapped property or explicitly marked as estimates.
5. Run `node tests/narromine-layout.mjs`, `node tests/narromine-browser.mjs`, `npm run check:privacy`, and full release checks, then inspect real browser captures, including mobile, before saying the 3D scene is accurate or deployed.
6. **Heights remain approximate.** The intended independent measurement is the NSW ELVIS `MACQUARIE FLOODPLAIN SOUTH 202308` LiDAR **LAS/LAZ point cloud**, where available; aerial shadows and a shop-site-plan do not produce survey-quality roof heights.

**Source/limitations:** Supplied property-plan screenshot and scene photographs; independently existing NSW cadastral/OSM mapping noted in the project's prior Narromine research. No copied commercial photos, logos or plan pixels are checked in. This document is a provenance/handover note, **not a claim of working arcade geometry**.

## Implementation started 3 November 2026

- `src/world/narromine-kieraths-data.js`: ten numbered shop units, a walkable offset Dandaloo-to-car-park centreline, front circular kiosk, rear arched canopy and parking footprint, in metres anchored at -32.2325, 148.2392. Units are **not** inferred tenant names. All interior wall positions, facade heights, shop depths, kiosk size and details beyond the photograph remain approximate.
- `src/world/narromine-kieraths.js`: real live Three.js extruded independent red-brick shops, glazed shopfronts and grey metal roofs; individual awnings, paving and surface joints, round kiosk, open steel canopy skin and ribs, rear parking, Coles rear sign and rooftop plant. Draw calls are still batched into existing material/tile buckets. Structural canopy poles and shop slices have compact collision boxes, while the pedestrian passage itself has none.
- `src/world/narromine-buildings-data.js`: the older three generic solid volumes in `dandaloo-76` were in the arcade's pedestrian passage. Original outlines are retained as `originalAerialMassing` provenance but no longer used as filled building geometry. Existing Post Office unchanged. Coles halls now use coloured brick and pitched white-gable roof planes; 82 Dandaloo street frontage gets heritage-style glazing, while its surveyed quad footprint remains intact.
- `src/world/narromine.js`: gable geometry plus the above arcade builder are invoked in **the actual game scene**, not a separate viewer.
- `tests/narromine-layout.mjs`: tests ten units, cadastral containment, absence of a duplicate old building, walkable route clearance, car park, kiosk clearance and rear arch.
- `tests/narromine-kieraths-browser.mjs` and `.github/workflows/town-narromine-kieraths.yml`: intended desktop/mobile Chromium walk-through with screenshots and existing highway checks. **No passing results are asserted until the jobs report success.**

### Deliberate uncertainty and remaining work

The plan is schematic; it proves adjacency and unit count, not the position of every door or the building's true height. This implementation follows the cadastral position, aligns its corridor to the long axis of 76 Dandaloo and preserves the front/back exits. Individual bay sizes and appearances should be revised against measured architectural drawings or permissioned survey data. The photographed historic Coles/Liquorland signage and equipment is not evidence of 2026 tenant occupancy, so no assumed tenancies have been labelled as current. PR #289's unrelated large-area NSW GIS road changes are **not** automatically merged into this building-focused work, pending a conflict-safe separate review.

- The visually documented historic **Liquorland** shutter (grey ribbed roller door and old red/yellow sign) is recreated at the rear canopy's right side in the 3D scene, with a narrow physical collider and no claim that Liquorland is still a tenant. Its relative dimensions are estimated from the supplied rear photo.
