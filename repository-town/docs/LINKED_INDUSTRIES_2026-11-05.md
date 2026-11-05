# Linked industries (rebuilt 5 Nov 2026)

Rebuilt on current main from the unmerged branch `feat/town-realism-linked-industries-20261020`.
It uses businesses that already exist instead of adding competing ones, and adds no residents.

- **Farm animals**: 12 sheep (Sheep Station), 7 cows (Dairy), 16 hens (Chook Shed), each with health,
  feed and water. Only healthy, fed, watered animals count towards lamb, milk and egg output.
- **Feed**: sheep and cattle graze; after five rainless days they need bought stock feed from Regional
  Stockfeed & Produce. Hens eat the Chook Shed's own wheat, topped up with feed. Farms short of cash
  buy on account and settle at 17:00; the store's regional supplier gives trade credit.
- **Vet**: Repository Veterinary Surgery treats sick, isolated animals during staffed hours with a finite
  veterinary kit, billing the farm $34.
- **Building**: Town Trades & Maintenance builds a farm cooperative workshop extension in four stages,
  buying cement, timber, fixings and steel from Central West Hardware & Timber.
- **Beer**: the town has no brewery, so when The Merged Branch's supplier stock falls below 150 L, four
  50 L kegs arrive by rail from a fictional Dubbo brewery, invoiced to the pub.
- Every outside purchase is recorded in `civic.industries.imports`, so the soak test's money check balances.

Limits: prices and quantities are game values, not market data; the vet does not walk to farms
(treatment is logged as a visiting-vet call so the surgery stays staffed for its advertised hours).

Tests: `tests/linked-industries.mjs`; `tests/simulation-soak.mjs` (28 days: money conserved, town content, shops stocked).
