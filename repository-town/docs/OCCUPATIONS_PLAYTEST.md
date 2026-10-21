# Occupations: playable controls and acceptance checks

All prices are fictional Town Dollars. This is a game, not vocational or safety training.

## Where to start

Open a workplace counter, choose **Start work a shift here**, then select a job. The job board shows hiring funds and your current pay offer. Private businesses must have enough money in their tills; public jobs use the council treasury. A funded offer can still become wage debt if the employer later runs out of cash.

| Workplace | Jobs and physical stations |
| --- | --- |
| Town Hall | Caretaker: collect equipment, pick up three visible pieces of litter, mop with a warning sign, empty the bin, wait five town minutes and inspect the dry floor. Maintenance apprentice: diagnose the lamp, tap or bakery mixer, obtain supervisor isolation, select real Foundry parts, repair and test. |
| Post Office | Collect a real incoming parcel, match its address to the delivery round, record the scale weight, label it, load the route bag and hand it to the resident postie. Prepared addresses control the actual delivery round. |
| Rail Depot | Sorter: collect finite train freight, choose the labelled destination, weigh it, secure the heavy carton at the base and dispatch on a free depot truck. Stock reaches the business after the truck drives there. |
| Rail Depot | Driver: accept a manifest and load RT-WORK. Find the employer van beside the depot, drive with normal steering and braking, stop and exit near each destination, then open its counter's job screen to unload and obtain a receipt. Return the van to the depot. Employer vans cannot be sold. Depot funds and finite workshop parts cover servicing and registration at loading; insufficient employer funds block loading without charging the worker. |
| Market Garden | Fill the can from the real reservoir, water two rows, pull three weeds into a basket, empty compost, harvest three actual vegetables and pack them into dispatch stock. |
| Chook Shed | Measure one actual grain bag into the feeder, collect two actual egg cartons, then check and pack them into dispatch stock. Wheat-farm trucks replenish feed. |
| Bakery | Wash and sanitise; weigh 2000 game grams; mix/knead; shape eight loaves; proof for 40 town minutes; bake for 25; unload; cool for six; pack. Eight real loaves enter sales stock only after packing. The labelled mixer opens stage-specific controls. |
| General Store | Choose the first-expiring dated receiving batch, carry it to the correct shelf, inspect/quarantine damaged stock and reconcile the visible stocktake. Return unsafe cartons to quarantine; the cage records supplier returns without inventing refunds. |
| Commit Café | Take real queued villagers' tickets. Read items, milk request, table and patience. Select the correct milk jug, prepare each item at its barista/kitchen station, collect the completed tray, deliver to the assigned seated customer, then clear dishes. The full 16-item menu supports bundled orders and a pointer/touch latte-art heart with assisted mode. |

A duty recorded before the five-minute supervision spacing is retained and credited when eligible. Keep working; repeating the physical action is unnecessary. Incorrect choices invite rework without deductions from earned wages.

## Wages and progression

Time accrues at the supervised workplace and while driving an assigned loaded route. After 15 town minutes, the shift screen offers a five-minute paid break. Away time is separately recorded. Early clock-out and midnight produce proportional payslips instead of deleting work. A full shift earns its agreed wage even if some duties need rework; full duties are required for training credit.

Wallet → **Timesheets and payslips** shows paid hours, rate, gross earned, gross received, PAYG, take-home pay, breaks and unpaid employer balance. **Collect available unpaid wages** retries the saved liability oldest first. Repeated collection cannot pay twice. Private wage debts never draw on council money.

Three complete supervised shifts at a workplace earn its town certificate and a 10% higher future offer. Six earn experienced-worker status and 25%. Store/café certificates also unlock fixed-scope contracts. The employer reserves the agreed price in escrow, provides materials with zero worker expenses, checks the real replenishment/service count and pays once at acceptance. Cancellation returns reserved funds without a wage deduction.

## Automated evidence

- `tests/visitor-payroll.mjs`: early/midnight pay, partial debts, cumulative PAYG, save/reload, paid breaks, fair rework, wage progression, contract escrow/acceptance/cancellation, repeated-payment refusal.
- `tests/occupations.mjs`: finite freight, correct post addresses, garden/animal supply chain, cleaning, lamp/tap/mixer repair effects, driven van route and signed receipts, full bread production, FEFO/cold handling/returns, every menu recipe, saved bundled oat order, patience, latte gesture scoring and reachable workstations.
- `tests/workplay.mjs`, `tests/workplay-geometry.mjs`, `tests/work-audio.mjs`: existing stock/orders, actual customer seating, collision/path checks and audio graph/mixer bounds.
- `npm run build:release`: whole-town regression, four-week simulation, public build/privacy and packed-game integrity.

## Still requires human/device acceptance

No listening review or new desktop/real Android visual and touch walkthrough is claimed. The available preview browser was blocked by URL policy earlier in this session. Automated geometry, physics, state and audio-graph checks do not substitute for these checks.

On desktop and a real Android device: walk every listed station, check labels/props and carried items, complete a van route with actual traffic, prepare a bundled order and trace/assist the latte heart, export/import a save while carrying goods and owing wages, leave/re-enter each venue, and listen to all venue/day/night transitions and mixer settings. Keep the combined device/save acceptance and listening checklist rows open until these pass.
