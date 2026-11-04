# Coles Narromine — verified service facts, explicitly unverified floorplan

Date checked: **4 November 2026 AEDT**. Scope: issue [#355](https://github.com/joshualparris/JoshMemory/issues/355), narrow claim `NR-COLES-ACCESS-001`. The model remains *interpretive*, not an as-built plan or official Coles service.

## Verified public facts (store-level, not fixture-level)

| Attribute | Public evidence | Confidence | Gameplay use |
|---|---|---|---|
| Store | Coles Narromine, Dandaloo St, Narromine NSW 2821 | Store-authoritative | Game store identification |
| Regular hours | Mon–Sat 06:00–21:00; Sunday 07:00–21:00 | Store-authoritative as of 4 Nov 2026; may change | `colesOpen`, holiday result *unknown* |
| Customer accessibility | Carry-to-car service | Store-authoritative; subject to operational changes | Informational shop-interior notice only |
| Speciality trolleys | Coles lists speciality trolleys; **check store for availability** | Store-authoritative as general service, not a particular trolley in stock | Informational notice; no physical trolley or guarantee |
| Quiet Hour (sound) | Mon–Fri 10:30–11:30 | Coles national/NSW Quiet Hour list explicitly names **Narromine** | `colesQuietHour` data and info; no claim of controlled real Coles sound |
| Quiet Hour (lighting) | Tuesdays 10:30–11:30 | Coles NSW list Narromine row, special reduced light/sound column | `colesQuietHour`; no claim that real lighting stays fixed each week |
| Holiday schedules | Not verified for a specific holiday | **Unknown** | Returns `null`; **never** assumes a normal holiday opening or Quiet Hour |

Sources (facts only, no downloaded media assets or scraping services):
- [Coles Narromine official store directory](https://www.coles.com.au/find-stores/coles/nsw/narromine-5755)
- [Coles official Quiet Hour, NSW store list](https://www.coles.com.au/about/accessibility-and-inclusion/quiet-hour) — Narromine / Dandaloo St row
- [Coles at Kierath's Shopping Square](https://sites.google.com/view/kierathsshoppingsquare/store-info/shops-in-kieraths-shopping-square/coles) — corroborates site/entry and wheelchair access; not a surveyed interior.
- [Narromine Region shopping directory](https://narromineregion.com.au/shopping) lists 22:00 Mon–Sat and conflicts with Coles' own current 21:00 closing; **defer to Coles official** for game time logic until the store confirms otherwise.

## Not verified — do NOT upgrade evidence tier

The existing `narromine-coles.js` **40 × 52 m (2,080 m²)** room, entrance orientation, service receiving, seven aisle dimensions/numbering, shelf placements, checkout count, labels, stocks/prices and staffing are created for gameplay. There is no freely usable as-built floorplan, indoor scan, store planogram or permissioned interior photograph in the reviewed sources. An apparent retailer category is not proof of where a physical department stands.

Door positions are based on Kierath's shopping-square site transform; actual accessible doorway, sliding door operation, grade and circulation turning area require a site survey or owner-provided permissioned photographs before being called verified. Leave Kierath's exterior and collision meshes owned by other agents untouched.

The customer-service information point is placed inside the existing synthetic lobby, contains **zero new solid colliders**, and does not collect or transmit personal data. The `colesQuietHour(day, minute)` helper is data-only and does not change audio, shader lighting, customer behaviour, saved game or store transactions.

## Tests and remaining acceptance

Focused: `node tests/narromine-postal-resident.mjs` asserts the published weekday/Tues Quiet Hour, Saturday/Sunday and holiday uncertainty, Coles room's seven accessible interaction points, accessible lobby signage, reachable checkout, entry and saved exit pose, deterministic postal-worker schedule over 450 calendar days, and avoidance of actual residential identity. Release: `npm run build:release`, `node tools/verify-release.mjs dist/public`, real Chromium desktop + Android-sized `narromine-post-office-browser.mjs`, then source SHA/fingerprint on live preview.

**Further evidence needed to close #355:** permission-cleared as-built plan or labelled photos taken with consent, physical measurements of entrance and aisles, fixture/roof measurement reconciliation against current render, daytime/dusk unobstructed screenshots and user review. Do not mark measured-photo fidelity VERIFIED COMPLETE until that evidence is obtained.
