# Flour Mill S8: researched dedicated interior

## Audit
At main a1c8c58, the mill still used the generic 14 × 18 m counter/shelf fallback. The dedicated bakery, café, butcher and other retail interiors already existed. Selected the mill, preserving the merged household, queue and spoilage systems from PR83.

## References consulted 20 October 2026
- Bühler, Wheat Milling: https://www.buhlergroup.com/global/en/industries/Wheat-and-grain/Wheat.html — cleaning/conditioning, rollers and plansifters informed the equipment sequence.
- Mills Archive Trust, Inside London's Tower Bridge Flour Mills (29 June 2026): https://millsarchive.org/2026/06/29/inside-londons-tower-bridge-flour-mills-a-journey-through-a-victorian-roller-mill/ — enclosed machinery, product transfer and storage/dispatch informed the layout. This is not a reproduction of that seven-storey historical mill.

## Implementation
A compact fictional roller mill retains the working door/window shell. Separate grain and flour pallets; grated intake; cleaner/destoner and conditioning bin; two guarded roller units; plansifter; overhead enclosed ducts; bagging hopper, scale and sealing/sample bench; maintenance cabinet; handwash basin; fire equipment; dispatch desk and sack trolley. A continuous marked inspection aisle and rear walk-around route preserve access. Stock pallets represent real stock/out values when entering; the live ledger gives current quantities. Seven interaction points explain the process or open the real mill ledger. Staff stand behind the dispatch desk with a clear conversation position.

Original geometric assets; no third-party art or source copied. Individual grain cleaning, grading and scale calibration are explanatory fixtures, not new simulated production stages. Existing mill production and logistics remain authoritative. No industrial safety/compliance claim.

## Verification
Node geometry test uses player-radius expanded colliders and flood-fills from the entrance to all seven hotspots, staff position and exit. Tests compare empty/full stock displays, required fixtures, four windows and live-ledger actions. Full town CI required before merge. Cloud-browser WebGL was unavailable in earlier passes; visual playtest is not claimed without a new successful render.
