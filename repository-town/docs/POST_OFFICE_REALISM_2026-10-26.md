# Repository Town Post Office: regional NSW realism pass

**Research date:** 26 October 2026. **Town location:** fictional alternate-universe Repository Town, not an identified or surveyed real post office. **Source:** `src/world/post-interior.js`, `src/world/post-office-facade.js`, isolated `BUILD.post` in `townlife.js`.

## Evidence and design choices

1. Australia Post's *2024–25 Annual Report*, "Delighting our customers & communities", describes modern parcel reception, counter collection, lodgement hatch, writing/packing bench and a more efficient larger staff back-of-house. See https://www.transparency.gov.au/publications/infrastructure-transport-regional-development-and-communications/australian_postal_corporation/australian-postal-corporation-annual-report-2024-25/business-review/delighting-our-customers-%26-communities . This is a reference for service zoning, not a scale drawing or evidence that Repo Post Office uses an Australia Post Parcel concept store.
2. Australia Post, *PO Boxes and Locked Bags*: https://auspost.com.au/business/receiving/po-boxes-and-locked-bags . PO box size/access, private correspondence, and large-parcel collection arrangements vary by outlet. Some participating boxes provide 24/7 access, but the game makes **no** promise of 24-hour parcel or PO box collection. Exterior numbered doors are a visual interpretation only.
3. Current federal *Disability (Access to Premises — Buildings) Standards 2010*: https://www.legislation.gov.au/F2010L00668/2024-11-23/2024-11-23/text/original/epub/OEBPS/document_1/document_1.html . Public entrances and accessways should allow equitable movement; certain accessible-doorways have at least 850 mm clear opening. The simulation's 2.1 m approximate front gap is not certified as a built access door. No gradient, reach, luminance, door force or tactile standards have been professionally measured.
4. Typical country branch photographic precedents: Nimbin NSW, 43 Cullen Street listing (timber sorting counter, clerical sorting bays); Corryong VIC post office interior (scales, protective screen, service counter, retail shelving). These are general typological references, not a claim that Repo Town reproduces either specific building. https://www.realcommercial.com.au/sold/property-43-cullen-street-nimbin-nsw-2480-504434268 and https://www.seekbusiness.com.au/business-listing/corryong-licensed-post-office-spdb2315/673661 .

## Explicit model changes

- **Exterior:** 11 × 9 m preserved building footprint, red fascia/weather canopy, contrasting cream piers, 20 individually modelled PO-box-style doors, a secondary parcel hatch and collection-times panel, while retaining the existing exterior street letter box. Nothing decorative adds a blocking collider or changes the entry zone. The sign follows the town's shared signage renderer.
- **Customer interior:** shared 14 × 18 m shell, entry mat, low-profile contrasting floor guidance, a customer queue with individual stanchions and two rails, named send/collect stations, parcel scales, POS and tracking scanner, lowered form-writing/presentation shelf, packing bench and cards.
- **Secure staff zone:** continuous barrier between counter ends and side walls; staff stands on the counter's private side, letters/parcels/returns sorting and dispatch shelves remain back-of-house, along with cage/trolley/safe.
- **Gameplay interactions:** 6 new physically approachable information points for queues, collection, postage guides, a lowered shelf, letterbox and tracking enquiry. The original postal counter still opens the real civic ledger. No real payments, tracking lookup, real ID validation, 24-hour access, or governmental licences are fabricated.

## Acceptance and limitations

The focused Node scene-geometry test validates that a 0.32 m radius player can access all 10 existing/new hotspots from the front entrance without crossing the secure staff counter; it verifies preserved doorway and frontage no-collider constraints. Run `node tests/post-office-realism.mjs` then the full `npm run build:release`, privacy scan, and CI. Run an actual desktop and handset walkthrough on the published exact-SHA build before claiming production acceptance.

**Not certified:** public accessibility compliance, fire egress and fire safety assessment, postal operator licensing, precise real-world PO box quantity, material specifications, official sign/brand use, or courier handling procedures. The modeled country post office is fictional.
