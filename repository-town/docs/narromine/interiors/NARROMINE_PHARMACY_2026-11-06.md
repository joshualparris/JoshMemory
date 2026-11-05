# Narromine Pharmacy — evidence-first shop interior (6 November 2026)

**Building:** Narromine Pharmacy, **53 Dandaloo Street, Narromine NSW 2821**. This is the first individually researched, authored shop interior, **not** a template for every pharmacy.

## Evidence and confidence

| Feature | Evidence | Confidence / depiction |
|---|---|---|
| Current business identity, address, weekday, Saturday and Sunday hours, weekday 1–2 pm lunch closure | [Pharmacy contact and opening hours](https://www.narrominepharmacy.com.au/contact) | **Verified on business-owned website**; actual hours can change, particularly holidays |
| Prescription and pharmacist medicine review, repeat reminders | [Prescriptions](https://www.narrominepharmacy.com.au/services/prescriptions) | **Verified service**; no real clinical advice or transactions in game |
| Vaccinations | [Pharmacy vaccinations](https://www.narrominepharmacy.com.au/services/general-health-services/vaccinations) | **Verified service**, simulated consultation zone location unknown |
| Sleep studies, CPAP sales/hire and maintenance | [Sleep Apnoea](https://www.narrominepharmacy.com.au/services/sleep-apnoea) | **Verified service**, room positioning inferred |
| Robotic dispensing and robot-assisted packing of pharmacist-checked dose aids | [About us](https://www.narrominepharmacy.com.au/about), [Dose Administration Aid](https://www.narrominepharmacy.com.au/services/prescriptions/dose-administration-aid) | **Verified business equipment/service**, robot type, exact placement and floor plan unverified |
| Giftware, health/personal care and eyewear display types | [Pharmacy shop](https://www.narrominepharmacy.com.au/shop), [publicly published merchandising photo](https://www.onthenose.com.au/narromine-pharmacy) | Products verified by shop site; **undated** interior photo suggests bright frontage, timber-look flooring, freestanding eyewear display stands and glazed accessory cabinets. Layout not known to be current |
| Exact wall positions, measurements, eyewear stand locations, stock shelving, privacy/dispensing partitions, staff roster | **No internal measured plan or current site survey** | **Unverified**: deliberately presented as an interpretive 4-zone layout; not an architecturally faithful, accessible certified or regulatory pharmacy plan |
| Staff count | Pharmacy's [About](https://www.narrominepharmacy.com.au/about) identifies several people in its public team, while the game's employment generator uses a nominal **six fictional staff** for the pharmacy kind | **Do not equate** these to real people, their roster or current headcount; fictional NPCs retain pseudonymous household identities |

## Implementation

- Exact name/kind gate in `src/world/narromine-workplaces.js` selects `src/world/narromine-pharmacy-interior.js`. All other businesses retain their own current layouts; no existing place coordinates/door mappings/footprints are changed.
- The general retail zone has original low-draw-call timber-look floor geometry, two stylised rotating eyewear display stands, a glass case, a real-world services information hotspot and prescription/giftware stations.
- Three explicitly *interpretive* adjacent zones represent vaccinations, dispensary + medicine-pack checking, and sleep/CPAP support. Their location, size and contents are not asserted from a real floor plan.
- Public retail opening follows published Mon–Fri 9–1 and 2–5:30, Sat 9–12, closed Sunday; simulations display **no customer-facing staff during closure**. Fictional generated work plans are not verified real rosters.
- No copyrighted photos, medication product graphics, trademarks, patient data, real staff NPC names, or private interiors have been copied into the game.

## Acceptance and limits

Run `node tests/narromine-pharmacy.mjs`, `node tests/narromine-workplaces.mjs`, `npm run build:release`, privacy check and a real desktop/mobile entry/exit screenshot before claiming a finished deployed experience. Check `main` commit SHA against live production `release.json` separately.

**Still to research:** owner's permission for current internal photos or a measured sketch; exact entrance/aisle/room layout and service counter placements, accessibility, and current stock. Avoid guessing them. Other shops and households remain largely template-based pending separate building-by-building evidence; do not mark them completed.

**No named-person claims:** The shop's publicly listed individuals were used only as evidence that public team information exists, never as simulated staff identities.
