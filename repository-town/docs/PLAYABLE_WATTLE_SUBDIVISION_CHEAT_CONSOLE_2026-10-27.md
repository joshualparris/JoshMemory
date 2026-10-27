# Playable Wattle/Banksia subdivision and hidden game debug console

Date: 27 October 2026. The user's planning-map screenshots show a wider *concept map* with a highlighted **2 Wattle Street, 16 × 35m, 560m²**, marked vacant and not serviced. That interface alone does not imply actual streets in the 3D runtime.

## This release's precisely bounded gameplay scope

- Adds a **first playable portion** of the proposed south/west neighbourhood to the 3D scene, modelled at a fictionally located western extension of the established street-8 road. It includes a ~200m west approach, the **Kurrajong Road** and **Bottlebrush Road** connections, **Wattle Street** and **Banksia Street**, with junctions registered in the same `roadAllows()` used by owned cars.
- Shows **12 numbered, vacant, 16 × 35m / 560m² planning parcels** in two rows, with no false completed homes, services or lawful land title claims. The live mini-map shows a separate local subdivision view when visiting.
- Relocates the world collider perimeter to encompass the first neighbourhood; crucially this *removes* the former solid west/south world walls that would otherwise block walking/driving onto the new streets.
- Adds developer controls to teleport to a clear Wattle Street point, create a real vehicle registration recognised by `createPlayerDriving`, enter the hatchback, add fictional funds, and claim any existing in-game deed or one of the 12 new parcels. Claims preserve existing tenant/occupier and protected-land flags but override ordinary in-game settlement and delete that deed's game mortgage.
- Only a **fictional game debug** convenience. Password `CHEAT123` is embedded in client code and is **not genuine authentication**. Control access by Ctrl+Shift+9 on keyboard or five quick taps of the Repository Town HUD heading on mobile; the console is locked until the player enters that password, and locks on every page reload.
- All changes are saved with the existing town-life local save; no email, automation, server privilege, real property or bank changes.

## Explicit non-claims and outstanding masterplan work

This is **not the entirety of the much larger new map** shown in the screenshots. It intentionally does not construct or service every subdivision, town collector road, future housing block, northern release zone, existing residential title migration, traffic light or childcare campus. It is one *connected live playtest area* to validate real navigation and the cheat console before a wider release.

Not a legally surveyed subdivision. The user's map marking parcels 'not yet serviced' is preserved. NSW planning, easements, drainage, zoning, setbacks, intersections and engineering remain research/design subjects, not completed approvals.

## Acceptance

1. Existing 188 house and 118 site/address identities remain unchanged.
2. Road connector is continuous between existing street 8 and the western Wattle/Banksia grid.
3. World collision boundary no longer blocks the road link; vehicle code forbids driving across residential pads.
4. The 12 parcel identities persist when a title is claimed and the game save is reloaded; the first is precisely '2 Wattle Street'.
5. Hidden combo + password works on desktop and Android-sized Chromium; wrong password denied.
6. Summoned hatchback is real 3D vehicle, registered to the player, fuelled, roadworthy, and moves using actual game input rather than a mere drawn icon.
7. Full release/privacy, recorded browser acceptance, production deploy ID and commit must be reported before making live claims.
