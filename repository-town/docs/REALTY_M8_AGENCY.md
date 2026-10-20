# M8 Repository Realty — dedicated Australian regional estate agency

20 October 2026 · Canonical source implementation · `feat/m8-repository-realty-20261020`

## Placement
- **New dedicated commercial premises at M8, south High Street**, across from
  Market Square (M8 north). The south-side M lot was previously unoccupied.
- Single-level 14m-wide storefront with timber verandah, glazing, two
  property-card windows, door, display panel, street-address sign, and
  step-free entry. It is not a renamed existing farm, bank or shop.
- `src/world/life.js`: site `realty` is open 9:00–17:00. Named agent Piper
  works there 09:00–17:00. The company starts with a **finite $650 of
  private opening capital** for its first wages; no invented sales revenue
  or infinite-money real estate fees.
- `src/world/townlife.js`: unique `BUILD.realty` exterior footprint and
  south-facing signs. `src/world/shop-interior.js` dispatches the dedicated
  `src/world/realty-interior.js`.

## Researched design
A modest regional NSW agency needs the public client zone, an observable
street property display, private consultation space and back-of-house
records/control facilities. See NSW primary guidance:
- [NSW Fair Trading: property agency licence](https://www.fairtrading.nsw.gov.au/housing-and-property/property-professionals/licensing-certification-and-qualification/Licence-types-and-classes/corporation-licence)
- [NSW Government: real estate agent licence](https://www.nsw.gov.au/business-and-economy/licences-and-credentials/becoming-a-property-agent/real-estate-agent-licence)
- [NSW Government: licensee in charge](https://www.nsw.gov.au/housing-and-construction/property-professionals/supervising-an-agency/licensee-charge)
- [NSW Fair Trading: displaying licensee information](https://www.fairtrading.nsw.gov.au/media-releases-news-updates/notices/changes-to-supervision-guidelines-and-cpd-2024/raising-professional-standards-event)

The design models:
1. **Reception + waiting:** service desk, brochures, monitor, visitor
   seating, bell and reception workstation.
2. **Property display gallery:** illuminated-style listing frames and a
   live local address-directory drawn from actual `TownLife.homes`, with
   explicitly unverified sale/rental status.
3. **Sales workstations:** two agent desks, computer screens, client chairs,
   local inspection calendar and photo wall.
4. **Private client meeting:** conference table and chairs, confidentiality
   glass partition and contract discussion.
5. **Property management + records:** key-control board, lockable document
   cabinets, manager computer, staff kitchenette and safety panel.

16 distinct scene-aware inspectable hotspots, of which the town ledger is
accessible from one. Sitting uses the existing shared seat system.

## Truthfulness and compliance boundaries
An NSW agency selling/leasing/managing property should be supervised by a
properly licensed Class 1 licensee in charge. The office advertises neither
an invented licence number nor any claim of actual registered legal status.

**No property is offered for sale or rent without recorded owner authority.**
`src/world/realty-listings.js` draws a real 9-address preview from existing
repository houses and marks all addresses **not listed**. It does not fabricate
owners, price quotes, sale history, title transfers, rental agreements, bonds
or trust money. The user can inspect the directory and consult the simulated
agent, but cannot fraudulently 'purchase' or 'rent' buildings by clicking an
unbacked decorative display.

When the separate property ownership/vehicle work is safely merged and tested,
wire the agency panel to the authoritative title register. Only then introduce
signed listing authority, sale contracts, settlement, finite account debits,
lease occupancy, bond handling and ownership changes. The model should never
misrepresent this initial release as having completed those systems.

## Tests
- `node tests/realty-interior.mjs` verifies M8 actually exists and has an
  employee, hours, capital, property-directory fidelity, no false listings,
  5 distinct zones, 16 hotspots, client seating, full-size pedestrian
  collision flood fill, staff and return street exit.
- `node tests/shop-interiors.mjs` ensures no fall back to a generic shop.
- `npm run test:integration` runs the larger NPC, physics, building,
  economy, geometry, build and privacy checks.
- Verify generated public static deployment separately after source merge.

Browser acceptance still requires independent rendered playtest on Chrome
desktop and Android, from Market Square to the **south-side M8** front door,
including agent desk, private consultation and return street exit.
