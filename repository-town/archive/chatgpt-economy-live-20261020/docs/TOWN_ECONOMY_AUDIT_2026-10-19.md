# Repository Town: Deep audit of money, banking and the economy
**Audit date:** 19 October 2026

## Scope and evidence
Audited the public game files: `world/life.js`, `world/townlife.js`, `ui/townpanels.js`, `world/shop-interior.js`, `world/money.js` (new), `ui/economy-panels.js` (new), `main.js`, `engine/save.js`, and the freight / food / Town Hall flow. This document distinguishes changes in the economy feature branch from the previously deployed public game. The game is a fictional single-player browser simulation, not real financial services.

## Root cause: infinite player money
Old `ui/townpanels.js:buy()` checked only shop opening hours and available stock. It reduced inventory, credited the shop till and reported a sale, **without checking or deducting a player account**. This minted a shop balance and gave infinite free buying power. There was no player wallet, inventory accounting, deposit account or bank model in the public game's underlying `world/life.js`.

The word "Bank" had appeared in earlier proposed civic/town plans and branches, but the current public `PLACE_DEFS` has 20 street-8 locations and **no bank building**. The Town Ledger at Town Hall tracked crops, sales counts and shop tills, not proper assets/liabilities or a bank. Do not claim the old bank was functional.

## Phase 1 implemented in feature branch

### Player money and shopping
- **Finite initial balances**: $60 physical cash, $100 everyday bank account, $40 savings. **$200 in total.** These represent starting endowments, not a recurring grant.
- Persistent money button in town HUD; wallet shows all balances, accumulated earned/spent money, groceries owned and receipts.
- Purchase price is taken from the actual product catalogue; check shop opening, stock, and selected payment balance, **then** atomically debit the buyer, credit shop, update inventory and record a receipt.
- A $5 loaf reduces card account by $5 and credits the shop operating funds; cash purchases move banknotes to its register. Payments that cannot be afforded fail without reducing goods. Cash/card preference can be changed from the wallet.
- The player gets a basic inventory of paid-for goods; eating, crafting and spoilage are **not yet** implemented.

### Bank (practical, limited model)
- A **Community Bank teller window inside Town Hall** (G8). This is **not a new standalone bank building**.
- When the Hall teller is open (09:00–17:00), deposit physical cash, withdraw to cash, move everyday funds to savings, and move savings back to everyday.
- Each transaction validates whole dollars and available funds, produces a local record, and preserves total wealth.
- Checking and savings deposits are fully backed in the **simulation's simple custodial bank vault**. Paying a shop by card transfers backing to the merchant's bank operating balance. Bank deposits are liabilities to the player, not new money.
- **Not implemented:** loans, bank capital/investments, reserve ratios, mortgages, interest, fees, ATM, external bank transfers, other customers or regulation. This is NOT a faithful representation of a real Australian authorised deposit-taking institution. Do not pretend savings interest exists.

### Real earned wages and jobs
| Job and location | Required shift | Wage | On-site duties |
| --- | --- | --- | --- |
| Bakery assistant (I8) | 35 town minutes | $24 | Hand hygiene, dough bench, cooling racks |
| Market Garden hand (X8) | 45 town minutes | $30 | Water plants, weed beds, pack produce |
| Rail Depot parcel sorter (R8) | 40 town minutes | $28 | Sort freight, verify manifest, stack parcels |
| General Store shelf stocker (H8) | 35 town minutes | $24 | Expiry checks, restock shelves, stocktake |
| Post Office assistant (O8) | 30 town minutes | $22 | Mail sort, parcel labelling, route preparation |
| Town Hall caretaker (G8) | 35 town minutes | $25 | Clean entrance, file paperwork, lighting check |

- Apply at the actual workplace with a supervisor on duty, while open and solvent.
- At most **two different jobs per town day**; the same job cannot be claimed twice.
- Wages require both a shift timer **while present at that workplace** and **three distinct physical task interactions** separated by town time. Standing still or repeatedly tapping the same object is not enough.
- The town's time-skip command is blocked during an active shift, and work happens at 1× time. Leave a workplace to pause the shift; abandon an unfinished shift without receiving wages.
- Wages are transferred from the actual employer till/operating funds, or funded municipal budget for public jobs, to the player's everyday account. An insolvent employer cannot pay.
- Every claim, bank transfer and purchase is included in the same saved local economy snapshot. The completed-shift markers are saved to stop reload wage duplication.

### Employers, NPCs, wholesale distribution
- **Before:** NPC wages increased wallets without any matching employer debit; private and public payroll was free money. NPC retail purchase deductions already worked.
- **Now:** business operating balances start at **$4,500** per non-public location; a **finite $80,000 municipal fund** begins the simulation. NPC wages debit employer/council balances, or are recorded as unpaid wage liabilities. Government/contract jobs are accounted against the municipal fund.
- Store register cash and business operating accounts are separately recorded. The Ledger shows shop funds, the town's fund, wages paid/unpaid and wholesale invoices.
- **Before:** freight deliveries from farms, mill, bakery and depot transferred stock for free.
- **Now:** a business must afford each wholesale invoice. A simple provisional wholesale rate is 55% of retail, rounded down (minimum $1 for priced goods), and money moves to the producer. Unsold/unpaid cargo is returned to source if the buyer becomes insolvent during the journey. Goods still follow the existing truck routes.
- The game still starts with preexisting goods, NPC wallets and employer cash endowments. That initial seeding is an explicit starting condition, not infinite ongoing money.

### Persistence and safety
- Town savings store new bank/player accounts, employer balances, cash register, gross receipts, completed and unfinished shifts, bank journal and NPC wage-payment day.
- Older saves can load without the new finance fields; one finite starting player wallet is created. Historical free purchases are not retroactively charged.
- All balances are integers; no overdrafts, negative purchase amounts or double claims.
- Local/browser save is not tamper-proof: anyone with developer tools can change values. Authentic multiplayer banking would need server-authoritative accounts, authenticated identities, idempotency and an append-only transaction journal.

## Deep audit: what is STILL unrealistic
| Area | Current limitation | Recommended next stage |
| --- | --- | --- |
| Bank | Fully reserved simple personal accounts only | Independent branch, multiple depositors, loan underwriting, collateral, risk, reserves, interest and repayments |
| Business profitability | Register cash and operating funds, but no full double-entry P&L | Sales revenue, cost of goods sold, wages, rent, utilities, depreciation, taxes and cash-flow reports |
| NPC finances | Cash wallets, work pay and basic groceries | NPC bank accounts, bills, rent/mortgages, savings goals, debt and realistic bankruptcy |
| Council | Finite budget and payroll, no replenishing receipts | Tax/revenue system, service fees, rates, budget vote, procurement, debt and audited public expenditure |
| Goods prices | Static arbitrary Town Dollars, 55% provisional wholesale | Unit-cost schedules, production yield, labour costs, market supply/demand and competitive margins |
| Freight | Supplier invoicing now works; vehicle cost not charged | Fuel, maintenance, freight fees, ownership and truck depreciation |
| Farms | Crop growth without billed land, irrigation, fertilizer or electricity | Input costs, rainfall, water rights, equipment, seasonal yields, equipment failures |
| Production | Recipes use inventory, but no indirect costs or wastage | Machinery use, energy bills, food safety, quality control, spoilage and shortages |
| External trade | Freight train magically adds tea/coffee/parcels | Outside supplier accounts, external settlement and an auditable import bill |
| Jobs | Three task stations + worked time; no detailed performance scoring | Tools, occupational hazards, actual task animations, promotions, training, contracts and overtime |
| Player welfare | Bought groceries accumulated, without consumption or rent | Hunger, housing, food consumption, bills, travel expenses and emergency fund |
| Governance/credit | No loan bank, insolvency procedure or central bank | Credit reporting, collateral, loan defaults, municipal revenue and business restructuring |
| Accounting verification | Local records and transaction tests | Transaction IDs, double-entry ledger, daily reconciliation and full cash/money-supply dashboards |

## Acceptance conditions before calling the town economy realistic
1. A purchase cannot proceed without funds or stock; the money moves **from somebody**.
2. Every wage has a paying employer/council account and happens once per completed job.
3. Every wholesale shipment transfers real inventory and money between two parties.
4. Deposits/withdrawals/transfers cannot change player total money.
5. Save/reload or time-skip cannot duplicate money or work wages.
6. Unpaid salaries remain documented liabilities and cannot be silently created as currency.
7. All changes are playable on Android and desktop without menus blocking controls.
8. Regression tests verify invariants and use genuine browser gameplay before production merge.

**Recommendation:** Stage 1 solves the critical infinite-player-money problem. Stage 2 should be an actual audited town-wide double-entry ledger, operating costs and replenished municipal funding, followed by fuller banking and household financial lives. A truly economically realistic town cannot rely only on shop tills and job buttons.


## Production deployment and test evidence (19 October)
- PR #1 merged as commit `74db678e8a1bd522e2ba17549b9778a57d8ae8ae`.
- GitHub Actions Town Economy Regression passed in feature branch and on merged main; economy test has 60 executable assertions covering transfers, work-task spacing and save/restore.
- GitHub Pages deployment passed for the merged build.
- Actual mobile-sized browser test: new player began with $60 cash, $100 everyday, $40 savings; buying $5 Bakery bread reduced the everyday account to $95 and total wealth from $200 to $195.
- Actual mobile-sized browser bank test: at Town Hall, depositing $10 changed cash $60→$50 and everyday $100→$110; withdrawing $5 changed them to $55 and $105, and total wealth stayed $200.
- Actual browser insufficient-funds test: transferred $100 from everyday to savings then tried a $5 card purchase; purchase failed, shop bread remained eight units, card balance remained zero and total player wealth remained $200.
- Actual browser work test: Bakery offered a 35-town-minute/$24 assistant shift, player clocked in, visited the physical handwashing station, and recorded the first duty. No immediate wage payout; town speed remained 1×.
- Actual browser station sweep: all six workplaces had three reachable duties each; Hall banker and Bakery checkout were accessible.
- **Not yet verified end-to-end in a timed browser session:** collecting the final wage after completing an entire 35–45 town minute shift at 1×; the isolated wage and task accounting tests passed. No full multi-day economic stability test or Android hardware playtest.
