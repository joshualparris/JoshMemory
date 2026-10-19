# Multi-floor interiors: V7 and W7

Date: 19 October 2026
Development branch: feat/tall-building-floors-current-20261019

## Implemented

V7 and W7 now each have three distinct interior floors. These are actual 3D interior meshes at elevations 0, 3.8 and 7.6 metres. Each storey has an independent room layout, furniture, interactables, lighting, collision-world data and stair/lift access. The other 186 houses are unchanged.

| Floor | V7 private house | W7 SwordCoast lighthouse |
| --- | --- | --- |
| 1 | Existing exhibits plus attached stair/lift lobby | Original Harbour Room/Podcast Gallery plus lobby |
| 2 | Family landing, bedrooms, reading study | Navigator landing, chart room, mariners lounge |
| 3 | Attic landing, creative workshop, sky lookout | Keeper landing, lantern chamber, sea observatory |

The V7 upper-floor descriptions remain generic and do not expose any private repository files, identifiers or URLs.

## Controls

1. Enter V7 or W7 from the street; walk through the connected interior rooms to the stairwell/lift lobby.
2. Face the spiral stairs and press E or the phone's ✋ button to move one floor up or down.
3. Face the lift and press E/✋, then select Floor 1, 2 or 3.
4. The HUD displays your current floor. The minimap and usable exhibits update with the selected storey.
5. On the upper storeys, walking back through the front landing doorway moves you down one floor. Only the ground-floor entrance leads outside.
6. Use the original Unstuck control if trapped.

The spiral stairs are rendered as real geometry and can be interacted with, but the current player collision engine is two-dimensional. Pressing Use performs an immediate floor transition rather than step-by-step physical stair climbing. The lift uses a floor-selection panel rather than an animated elevator journey. These limitations are intentional until a full height-aware collision system exists.

## Architecture

- Source of truth: repository-town/src/; do not hand-edit the generated Pages repository.
- floor-plans.js contains public-safe authored room layouts and information exhibits.
- multifloor.js creates the additional lobby, geometry, floor-specific interactables, vertical groups and landing coordinates.
- main.js swaps the active storey, changes collision world, shows floor indicator and manages lift selection.
- engine/player.js offsets camera height on upper storeys.
- Non-featured houses retain their existing buildInterior flow.
- Unused storeys are not attached to the scene, saving rendering work on phones.
- No API keys, network requests, login or private project metadata are added.

## Test plan

Run from repository-town/ with Node and existing npm dependencies:

    node tests/multifloor.mjs
    node tools/build.mjs
    node tools/check_privacy.mjs
    node tests/e2e.mjs --only V7,W7

Then on desktop and real Android: walk from Ground→2→3 and back on the stairs; ride the lift to every level; use all upper-floor exhibit interactions; inspect collision, minimap, labels, floor badge and the upper landing door; leave and re-enter both buildings; verify no memory leaks or duplicate objects. Run the broader suite before public publishing.

Status: source code is committed on a feature branch. Tests and builds have not been executed in this GitHub connector environment. Publishing should only follow local validation and privacy checks.

## Release instructions

Follow repository-town/AGENTS.md and coordination notes. Merge the source topic branch after tests and review, then build dist/public and use tools/publish_pages.sh to update the Pages repository. Never publish only a manual hotfix to public output.
