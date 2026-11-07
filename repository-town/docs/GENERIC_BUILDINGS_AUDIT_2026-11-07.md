# Remaining generic buildings: audit and improvements

7 November 2026. Source baseline: `f5502d24`; follow-on work on the existing generic-only branch and draft PR #521. This report distinguishes a more believable game fit-out from a measured or fully researched recreation. No second-pass build has been published.

## Findings and scope

- **Fictional expansion interiors:** 50 remaining placeholder office shells replaced. The other 22 sites retain 13 dedicated interiors and nine first-pass improvements. None of the 72 expansion interiors retains the old office-stock placeholder.
- **Fictional expansion exteriors:** 39 additional generic facades detailed. Existing ID-specific and park/nursery/fuel/carwash/sports facade builders take precedence and remain unchanged, including where their interior was generic.
- **Legacy High Street:** 3 live generic interiors replaced: both security offices and the locksmith. Their exteriors are preserved. 0 live legacy office placeholders remain; inactive/outdoor legacy routes are listed separately below.
- **Mapped Narromine workplaces:** 22 additional locations receive category-specific rooms instead of untyped shop/office/workshop fallbacks. Across 77 indexed walk-ins, 0 untyped fallbacks remain. Existing FIT and evidence-backed rooms stay unchanged.
- **Country homes:** 193 shared fallback interiors receive distinct wet-area tile, living/bedroom finishes, ceiling fittings, splashbacks, skirting and doorway trim. Room plans, fixtures and access stay unchanged. Both researched interiors and all 195 authored country exteriors are preserved.
- **Handcrafted protection:** the original 48 geometry signatures are unchanged. Additional frozen fixtures verify 142 existing business components and 197 country components (195 exteriors plus two researched interiors). The original 145-entry business fixture is retained without regeneration: three explicitly named shared-office replacements are excluded from equality comparison and asserted to have changed. These counts overlap with the original fixture and must not be added as unique buildings.

## Fictional fallback inventory

| ID | Location | Interior improvement | Exterior |
|---|---|---|---|
| `publicamenities` | Creative Court Public Toilets & Playground | Public amenities | Existing dedicated/style design preserved |
| `physio` | Ironbark Physio | Physiotherapy and rehabilitation | Generic finish, bay frames and matching display/privacy detail |
| `podiatry` | Creative Court Podiatry | Podiatry and foot care | Generic finish, bay frames and matching display/privacy detail |
| `optometry` | Clearview Optometrists | Optical dispensing | Generic finish, bay frames and matching display/privacy detail |
| `counselling` | Repository Counselling & Wellbeing | Private counselling | Generic finish, bay frames and matching display/privacy detail |
| `gym` | The Yard Fitness | Exercise studio | Existing dedicated/style design preserved |
| `youthcentre` | Creative Court Youth Hub | Community activity hall | Generic finish, bay frames and matching display/privacy detail |
| `communitynurse` | Community Nursing & Home Care | Community nursing clinic | Generic finish, bay frames and matching display/privacy detail |
| `disabilitysupport` | Repository Disability Support | Accessible support centre | Generic finish, bay frames and matching display/privacy detail |
| `sports` | Creative Court Sports Pavilion | Sports changing and equipment | Existing dedicated/style design preserved |
| `vet` | Repository Veterinary Surgery | Animal care | Generic finish, bay frames and matching display/privacy detail |
| `ruralrepair` | Country Equipment Repairs | Repairs and parts | Generic finish, bay frames and matching display/privacy detail |
| `officesupplies` | Repo Office & Print | Print and office supplies | Generic finish, bay frames and matching display/privacy detail |
| `childcare` | Creative Court Early Learning | Early learning | Generic finish, bay frames and matching display/privacy detail |
| `fuelstop` | Western Approach Fuel & Convenience | Convenience store | Existing dedicated/style design preserved |
| `tyres` | Western Tyre & Battery | Repairs and parts | Generic finish, bay frames and matching display/privacy detail |
| `carwash` | Western Wash Bays | Wash-bay equipment | Existing dedicated/style design preserved |
| `florist` | Wambuul Flowers | Florist and garden supplies | Existing dedicated/style design preserved |
| `takeaway` | High Street Fish & Chips | Takeaway kitchen | Generic finish, bay frames and matching display/privacy detail |
| `newsagent` | Repository News & Lotto | Newsagency | Generic finish, bay frames and matching display/privacy detail |
| `giftshop` | Repository Gifts & Home | Gifts and jewellery | Generic finish, bay frames and matching display/privacy detail |
| `photography` | Creative Photography & Framing | Photography and framing | Generic finish, bay frames and matching display/privacy detail |
| `accountant` | Repo Accounting & Bookkeeping | Professional consultation | Generic finish, bay frames and matching display/privacy detail |
| `insurance` | Central West Insurance Brokers | Professional consultation | Generic finish, bay frames and matching display/privacy detail |
| `cleaning` | Central West Cleaning Services | Field-service depot | Generic finish, bay frames and matching display/privacy detail |
| `pestcontrol` | Repository Pest Management | Field-service depot | Generic finish, bay frames and matching display/privacy detail |
| `courier` | Western Courier & Parcels | Parcels and storage | Generic finish, bay frames and matching display/privacy detail |
| `storage` | Repository Secure Storage | Parcels and storage | Generic finish, bay frames and matching display/privacy detail |
| `furniture` | Country Furniture & Bedding | Furniture showroom | Generic finish, bay frames and matching display/privacy detail |
| `bikeshop` | Creative Cycles | Repairs and parts | Generic finish, bay frames and matching display/privacy detail |
| `farmcontractor` | Macquarie Farm Contracting | Field-service depot | Generic finish, bay frames and matching display/privacy detail |
| `stockagent` | Western Livestock & Property Agency | Professional consultation | Generic finish, bay frames and matching display/privacy detail |
| `machinery` | Macquarie Agricultural Machinery | Repairs and parts | Generic finish, bay frames and matching display/privacy detail |
| `funeral` | Repository Funeral Services | Memorial consultation | Generic finish, bay frames and matching display/privacy detail |
| `freight` | Regional Freight Forwarders | Parcels and storage | Generic finish, bay frames and matching display/privacy detail |
| `sewing` | Creative Court Alterations | Alterations studio | Generic finish, bay frames and matching display/privacy detail |
| `mensshed` | Repository Men's Shed | Repairs and parts | Generic finish, bay frames and matching display/privacy detail |
| `repaircafe` | Repository Repair Café | Repairs and parts | Generic finish, bay frames and matching display/privacy detail |
| `communitygarden` | Creative Court Community Garden | Florist and garden supplies | Existing dedicated/style design preserved |
| `museum` | Repository Heritage Museum | Museum gallery | Generic finish, bay frames and matching display/privacy detail |
| `church` | Repository Community Church | Community chapel | Generic finish, bay frames and matching display/privacy detail |
| `skatepark` | Repository Skate Plaza | Sports changing and equipment | Existing dedicated/style design preserved |
| `tennis` | Repository Tennis Practice Courts | Sports changing and equipment | Existing dedicated/style design preserved |
| `netball` | Repository Netball Training | Sports changing and equipment | Existing dedicated/style design preserved |
| `pool` | Repository Learn-to-Swim Centre | Learn-to-swim teaching pool | Generic finish, bay frames and matching display/privacy detail |
| `sportsclub` | Repository Sporting Club | Sporting club lounge | Existing dedicated/style design preserved |
| `caravanpark` | Western Caravan Park Reception | Visitor and park reception | Generic finish, bay frames and matching display/privacy detail |
| `showground` | Repository Showground Office | Showground administration | Generic finish, bay frames and matching display/privacy detail |
| `theatre` | Repository Community Theatre | Community performance hall | Generic finish, bay frames and matching display/privacy detail |
| `scouts` | Repository Youth & Scouts Hall | Community activity hall | Generic finish, bay frames and matching display/privacy detail |

The new health/animal-care/counselling/memorial layouts have physical privacy screens; public amenities have two actual cubicles. The teaching pool is a small non-swimmable gameplay model, not an Olympic pool or a new swimming mechanic. Activity/court interiors are support rooms, not recreations of the outdoor sports area. Existing civic services remain available at the counter.

## Legacy High Street routes

| ID | Status | Interior |
|---|---|---|
| `square` | outdoor-not-an-indoor-destination | Preserved inactive/outdoor fallback, not a playable indoor destination |
| `town-hall` | inactive-legacy-id | Preserved inactive/outdoor fallback, not a playable indoor destination |
| `market` | inactive-legacy-id | Preserved inactive/outdoor fallback, not a playable indoor destination |
| `factory` | inactive-legacy-id | Preserved inactive/outdoor fallback, not a playable indoor destination |
| `farm` | inactive-legacy-id | Preserved inactive/outdoor fallback, not a playable indoor destination |
| `park` | inactive-legacy-id | Preserved inactive/outdoor fallback, not a playable indoor destination |
| `council` | inactive-legacy-id | Preserved inactive/outdoor fallback, not a playable indoor destination |
| `securityhq` | live-indoor | Security operations |
| `securityoffice` | live-indoor | Security operations |
| `locksmith` | live-indoor | Key-cutting and lock repairs |

## Narromine fallback inventory

All rows below are interpretive interiors, not surveyed floor plans. No real-location exterior geometry was changed. New profiles keep one public reception station; additional crew stations go into the working room instead of duplicating reception counters. Staff counts and earlier templates are unchanged.

| Location | Kind | New category |
|---|---|---|
| Chill-Rite (shared entrance) | `hvac` | Field-service depot |
| Narromine Tourist Park | `camp_site` | Visitor and park reception |
| Narromine Aviation Museum (shared entrance) | `museum` | Museum gallery |
| HubnSpoke | `coworking` | Tutoring and shared work |
| Narromine Courthouse | `courthouse` | Court reception and hearing room |
| Narromine Animal Shelter | `animal_shelter` | Animal care |
| Narromine Chiropractic (shared entrance) | `alternative` | Wellbeing consultation |
| B2B Abilities (shared entrance) | `social_facility` | Accessible support centre |
| Narromine Tobacco House (shared entrance) | `tobacco` | Specialist retail |
| Smokemart (shared entrance) | `tobacco` | Specialist retail |
| Narromine Mens Shed (shared entrance) | `community_centre` | Repairs and parts |
| Narromine Physiotherapy (shared entrance) | `physiotherapist` | Physiotherapy and rehabilitation |
| The Abbey | `guest_house` | Visitor and park reception |
| All Occassions (shared entrance) | `jewelry` | Gifts and jewellery |
| Photographer (shared entrance) | `photographer` | Photography and framing |
| Central West Tutoring (shared entrance) | `educational_institution` | Tutoring and shared work |
| Bottlemart (shared entrance) | `alcohol` | Packaged beverages |
| Narromine Car Wash | `car_wash` | Wash-bay equipment |
| Mahindra Narromine | `car` | Vehicle sales and service |
| Narromine Golf Club | `golf_course` | Sporting club lounge |
| Narromine RV Centre | `caravan` | Vehicle sales and service |
| Narromine Gliding Club | `aerodrome` | Flying club briefing |

## Wider generator audit and remaining limits

- **Narromine homes:** 1171 occupied home entries use household-specific lounge/kitchen, bathroom, laundry and age-specific bedrooms. These are not the business placeholder and were not changed. They remain procedural and unmeasured; the count is not a claim that every home has unique architecture.
- **Narromine exterior generators:** 2131 fill-house records, 212 box-building records, 8 fill-shop records and 18 frontage records were inventoried. These collections overlap and are not unique-building totals. Estimated shopfront and residential-facade generators remain interpretive; they need address-specific evidence before further real-location additions.
- **Repository houses:** the 188 authored repository briefs and their 34 exterior-style system remain untouched. Packed arcade games are separate applications, not town building fallbacks.
- **Country-house limits:** the 193 fallback plans still share a compact three-room organisation. Better finishes do not make them country-specific surveyed architecture. Upper floors drawn outside remain inaccessible, as before; the dedicated researched dossiers are the route for deeper historical accuracy.
- **Gameplay limits:** decorative equipment does not introduce new clinical treatment, childcare, animal-care, vehicle-washing or workshop gameplay. The existing ledger/workstation actions are retained. No compliance certification, physical-phone performance, production merge or live acceptance is claimed.

## Shared-door limitation found during playtesting

The current inherited door index has 15 shared primary-door groups involving 43 workplace records. These are not unique physical building counts. Walking into the shared Photographer/Land Council/Butchery/Martin Schute Bell entrance selected Land Council, the first record, rather than Photographer. The new Photographer interior can be built and inspected directly, but this does not prove it is independently reachable by walking. This pass does not move surveyed/inferred entrances or change handcrafted tenants. A shared-entrance tenant selector is a separate gameplay follow-up; no claim of universal doorway accessibility is made.

- Chill-Rite; Macquarie Clothing; Narromine Mens Shed
- Narromine Aviation Museum; Narromine Aero Club
- Macquarie Regional Library; B2B Abilities; Verto; Joblink Plus
- Narromine Hotel; Mirror Hair Lounge; BellaDonna
- Narromine Shire Offices Customer Service and Payments; Regional Australia Bank
- Imperial Hotel; Rain Agribusiness; All Occassions; Classic Catch Cafe; Rosie & Toots Vintage & Art; Hairdresser
- Narromine RSL Club; Narromine USMC
- The Court House Hotel; Central West Tutoring; Bottlemart
- Vinnies; Zest; LJ Hooker
- JBs's Bakery; Narromine Tobacco House; Beauty
- Narromine Chiropractic; BEST Employment
- AG n VET Services; Darling Irrigation
- Country Traders - Home and Life; Smokemart
- Narromine Physiotherapy; Narromine Battlers Mate
- Narromine Local Aboriginal Land Council; Monaghan's Butchery; Martin Schute Bell; Photographer

## Verification

Automated gates check fixture geometry extents, pairwise placement, centre-aisle/exit clearance, staff/service positions, workplace fixture containment, dispatch exclusions, placeholder coverage and frozen components. Browser QA must additionally inspect actual 3D results and keyboard/touch entry, service and exit, saved state and existing UI flows. Local release/privacy/integrity gates and any hosted acceptance are separate records in WORK_CHECKPOINT and progress.md.

## Reproduce

`node tools/audit-generic-buildings.mjs` emits the complete component inventory as JSON. Add `--markdown` for this report. Run `npm run test:generic-buildings` for protection and coverage, and `npm run build:release` before an approved publication.

