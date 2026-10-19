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

## Release record (19 October 2026)

- Source implementation merged: [JoshMemory PR #30](https://github.com/joshualparris/JoshMemory/pull/30), commit `14838688e321b66d50fa6425243423f10eff8103`.
- Mirrored to generated public Pages source without removing the more recent public NPC, arcade, town shop or simulation changes. Public game commit: [2a19860](https://github.com/Parris-Tech-Services/Repository-town/commit/2a19860bf70d5fb8a0160e901ca11c35839fe3c7).
- Pages deployment completed successfully: [Actions run 39232948450](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/39232948450).
- Public play URL: https://parris-tech-services.github.io/Repository-town/
- Validated **the actual published V7 and W7 house data** against the published Three.js/Builder/props/interior/multifloor modules: both generate three floors with the expected unique rooms and stair/lift interactables without a geometry-construction error.
- Confirmed JavaScript syntax for the published floor modules, game loop and player code, and a focused in-memory contract test.
- Not independently verified: external HTTP content served by Pages (DNS was unavailable in the testing container), full Node build/privacy gate, headed Chromium and real Android end-to-end gameplay. Pages workflow success confirms publishing, not interactive correctness. Fix any issues found before adding multi-floor support to more buildings.

## Expansion: all architectural multi-storey buildings (19 October 2026)

The first release only enabled V7 and W7. Josh discovered a real missing case at **X7 Transfer**, another lighthouse. The implementation now derives the floor count from the *existing exterior style*, not just two hardcoded coordinates.

- **Three floors**: lighthouse, tower, clocktower, castle, pagoda and windmill.
- **Two floors**: townhouse, modern, terrace, mansion, treehouse, observatory, library, shopfront, gatehouse and factory.
- **Single floor**: the other architectural styles, including cottages, cabins, caves and single-storey garages.
- On the currently published 188-house inventory, these rules select **87 buildings**. This is the number tested from that inventory, not a permanent hardcoded total.
- V7 and W7 keep their authored layouts. **X7** has a custom transfer dispatch/control and rescue-logistics second floor, plus a beacon lookout and preservation room third floor.
- Other tall buildings get architectural themes. Towers have archives and a lookout; clocktowers have gear rooms and a bell chamber; castles have a residence and battlements. Smaller multi-level houses have family/study or mezzanine spaces. Each upper floor contains its own interactive exhibit.
- The new floor plans use only generic public-safe objects and descriptions for private houses. They never pull private repository URLs, descriptions or source text into public content.
- A blue *Stairs & lift* wayfinding sign is added just inside the entrance, as well as the actual spiral stair and lift structures in a dedicated connected stairwell.
- An always-visible **🛗 Floors** button beneath the town clock opens the lift floor chooser directly on phones and desktops, avoiding a long search through existing rooms. The foyer sign is also interactable with E/✋.

### Regression coverage

Run `node tests/multifloor.mjs` to check all 16 eligible exterior types, private-safe themed props, X7-specific upper floors, navigation links, and the mobile Floors button. The existing V7/W7 tests remain.

The geometry test in the GitHub connector loaded the currently published 188-house inventory, evaluated the actual Three.js and room-generation modules, and successfully built **all 87 eligible buildings**, checking correct level counts plus lift, upward and downward stair targets: **87 passed, 0 failed**. This is a geometry/logic smoke test, not a substitute for real mobile WebGL navigation.

Players can use the live game link once the Pages deployment for this change succeeds. Staircases use E/✋ transitions rather than continuous physics; the existing engine still has 2D collision per storey.

