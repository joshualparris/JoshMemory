# Repository Town — playable fictional yard shunting (RT-RAIL-YARD-OPS-001)

Feature branch: `feat/repo-town-yard-shunting-20261104` · 4 November 2026

## Scope and geography

Repository Town's existing protected **main line remains at z = −196**, with its 06:40 timetable, six road crossings, road-user stop logic, fault state and depot freight imports unchanged. This new scene is an **independent dead-end siding** at z = −209, x = 82–170, clear of crossings and the woodlot. It has its own rendered 1,435 mm-gauge rails, sleepers, end stops, locomotive, two wagons and depot loading platform. There is **no physically connected turnout**; parked/staged wagons must not be represented as dispatched onto the main line.

## How to play

Walk north of the main-line rail fence via a protected avenue crossing, then approach the original yard shunter's cab. Press E / touch ✋ to board. W/S or the touch joystick controls forward/reverse low-speed traction; opposing traction first applies a service brake. Hold Space to brake. Q couples at close stationary alignment, or uncouples a previously connected wagon. R loads four *actual* parcels from the Rail Depot, but only if an empty coupled wagon is positioned alongside the platform (x ≈ 117) and there is sufficient real depot stock. R can later mark a loaded wagon staged when it is stopped towards the east end (wagon x ≥ 147). These actions have separate visible phone buttons. E steps down only when stopped. The yard uses a **fictional 8 km/h speed limit** and simulates braking, buffer stops and collision with detached wagons.

State is saved separately to browser localStorage under `repository-town-yard-shunting-v1`, with bounds checking on reload. Goods quantities remain in the existing town simulation. The separate storage transactions are not an atomic save of the town's main economic database.

## Safety and accuracy boundaries

- This is a playable simulation, **not** Australian rail operating rules or verified vehicle braking dynamics.
- No player dispatch authority, main-line signals, turnout motor or interlocked train controller is implemented. A staged wagon **stays in the siding** until a later phase adds those systems and tests.
- No updates to Narromine's real-world OSM scene or its seven currently assumption-driven crossing booms.
- The main-line and yard operate independently. Extending the rail network must first handle route locking, conflicting train movements, road crossings, passenger/road-user safety and save/load without duplicate freight.

## Verification contract

Run `node tests/town-rail-shunting.mjs`, full `npm run test:release`, build/privacy tests and real Chromium/Android WebGL playtests: find shunter, board, move, brake, couple, load finite parcels, stage, unboard, reload, examine both train positions, and exercise open/closed level crossings with trucks and pedestrians. Only merge and claim live after verifying candidate commit on production/staging and actual content fingerprint.
