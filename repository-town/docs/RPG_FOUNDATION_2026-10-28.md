# RPG foundation: persistent world items

Public engineering notes. User requested early RuneScape-inspired foundations before adding skills, preserving RepoTown's immediate entry into play.

## Historical basis and scope

RuneScape's precursor, DeviousMUD (1998–99), was a small graphical multiplayer prototype. Andrew Gower described it as a tech test with barely any content in his 3 September 2009 developer Q&A. Surviving sources do not prove the first individual feature he programmed. Engine-first is our engineering interpretation, not a claimed exact historical development order.

References: [DeviousMUD sources and chronology](https://runescape.wiki/w/DeviousMUD), [preserved developer Q&A](https://wiki.darkan.org/Update%3ABlog_-_Q%26A%3A_Andrew_Gower%27s_Answers).

RepoTown already has rendering, movement, collision, locations, simulation, inventory and guest saving. This milestone strengthens those existing systems using the torch, rather than adding a second engine or speculative networking.

## Invariants

- Item definitions live in `world/inventory.js`; inventory instances retain stable IDs, including existing saved IDs. New generated IDs use a persisted sequence and check both owners for collisions.
- An item belongs either to the player's bag or to a saved ground location. Transfers run synchronously, validate the current owner again, and leave state unchanged on refusal. Replayed UI actions cannot duplicate or delete the item.
- Pickup requires the same location/floor, vertical and horizontal reach, and an injected geometry check. Runtime collision sampling rejects obstructed routes. Drop requires clear supported ground. Placement metadata cannot overwrite item identity/type.
- Ground objects have stable building/floor keys, including individual country parcels. Rendering reconciles from saved state and never grants items. Local floor coordinates remain local when the floor mesh is elevated.
- Equipment, ground items and starter-claim state save together in the existing `repository-town.life.v1` envelope. Existing backup/restore already includes that envelope. No additional browser keys, account requirement or credential storage.
- Picking up, dropping, holding, putting away and toggling the torch save immediately. A refused browser write reports that progress is only in memory; it does not pretend persistence succeeded.

## Playable acceptance

Torch beside the Town Guide → Use → Bag → switch on/off → Drop → visible ground object → reload → Use → same item back in Bag. Desktop keyboard and emulated-phone touch use the real controls. Interior drop, leave, re-enter and pickup also tested. Unit tests cover old saves, identity conservation, stale actions, wrong floors, blocked/out-of-range actions, rendering and export/import.

Scripts: `node tests/item-foundation.mjs`; `node tests/item-foundation-browser.mjs` against the built public server. Included in release and browser suites respectively.

## Next foundations

1. Build cancellable timed actions on top of validated ownership transfers, with movement/location interruption and completion revalidation.
2. Add one finite resource node and a tool using those rules. Then add XP/levels and the woodcutting/firemaking loop.
3. Optional character identity/customisation and later account linking remain Settings features. Preserve existing guest progress when linking.
4. Multiplayer requires a separate authoritative server/persistence design and explicit acceptance. This local item foundation is not a multiplayer implementation or anti-cheat boundary.

Skill systems, accounts, combat, quests, new NPC dialogue and multiplayer are not implemented by this milestone. The previous whole-town sweep remains incomplete outside its recorded accepted sections. No hosted deployment is implied by local acceptance.
