# Rail Depot R8 interior

Replaces the generic service-counter room with an original compact freight-house layout.

## Research
Accessed 20 October 2026:
- Mecalux, Warehouse layout design: https://www.mecalux.com/warehouse-manual/warehouse-design/warehouse-layout — separate reception, storage, picking/packing and dispatch; clear circulation and support space near operations.
- Dexion Australia, Warehouse: https://www.dexion.com.au/warehouse/ — receiving-to-dispatch handling and packing equipment such as scales and label printers.

These operational principles informed a fictional small rail depot, rather than a replica or a certified industrial design. All meshes are original primitives using the shared interior kit.

## Layout and behaviour
- Entrance and marked pedestrian spine remain clear; dispatch office and waiting bench at the front left.
- Coffee and tea on labelled racks; separate receiving and outbound staging behind them.
- Packing bench with scale, wrapping roll and tape; closed goods shutter and parked hand pallet truck.
- Staff corner with table, benches, lockers, kitchenette, sink and bin; fire point near the exit.
- Existing depot ledger remains the live interaction. Seven scene-aware points expose the layout.
- Cartons show a capped sample of actual depot.out coffee, tea and parcel stock at entry. Counts explicitly describe that snapshot; reopen the ledger for current totals. Fuel and ore are not placed among indoor dry goods.
- The original simulation handles freight. Weighing, printing, wrapping, washing, lockers and the shutter are modelled fixtures, not new simulated jobs or animated mechanisms.
- Dedicated clerk position and visitor point use the existing staff-presence system.

## Verification
- tests/depot-interior.mjs flood-fills the floor at a 0.35m player radius, checking every interaction, clerk position and exit with full/empty/missing stock.
- Checks mesh bounds (including shared shell sill lips/threshold), finite geometry, central aisle, four windows and empty stock displays.
- tests/shop-interiors.mjs dispatch assertion and test:town include the new interior.
- PR records the mandatory integration/build/privacy/game-integrity results and deployment commit.
- Browser WebGL is unavailable in this session; source geometry checks are not a visual or real-device playtest.
