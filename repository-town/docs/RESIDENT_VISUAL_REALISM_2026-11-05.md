# Resident visual realism — visual identity, detailed figures, clothing and animation

**Date:** 5–6 November 2026 · **Branch:** `feat/resident-realism-vertical-slice-20261105`
**Scope:** visual-only. Claude/other agents own NPC schedules, needs, households, commuting,
shopping and workplace behaviour; this branch does not modify those simulation files.

## What was built

### 1. Persistent identity (`src/world/resident-identity.js`)
One immutable id (plus the person's known age/gender/job) produces one deterministic identity:
face shape, jaw/chin/nose/lips, eyes, brows, skin tone and undertone, hair colour/style/texture,
body build and height, age effects (child head/body proportions, senior greys and wrinkles),
clothing palette, accessories (glasses, facial hair, hat, bag, lanyard, hearing aid), gait and
voice. The same record is used everywhere a person appears, so they keep their face and body
from home to work to the shops. No real addresses, rosters or private facts are added.

### 2. Detailed jointed figures (`src/world/resident-figure.js`)
A shared-primitive human with a real face (eyes, lids, brows, nose, lips, ears, freckles,
wrinkles, glasses, beards), weighted hairstyles, an age/body-proportioned torso and limbs, and
activity clothing. It keeps the exact joint contract of `npcs.js` (`legs`, `knees`, `arms`,
`elbows`, `head`, `phase`) so every existing walker, seat, interaction and collision path keeps
working. Natural poses: walking (stride, knees, arm swing, head), turning, sitting, sleeping,
eating, carrying, working and talking; idle breathing, blinking and glances.

### 3. Activity, job, weather and time clothing
Clothing layers swap per context: pyjamas for sleep, a towel after washing, work uniforms
(Coles red polo, nurse scrubs, school shirt/tie, police navy, tradie hi-vis, hospitality apron,
post-office red, office shirt/blazer), raincoat + umbrella in rain, jumpers/coats at night or in
cool weather, shorts for exercise. Outfit changes rebuild only when the context key changes.

### 4. Level of detail
Four tiers: full face/micro detail (near), simplified face (mid), simple eyes (far face), and a
seven-mesh street proxy (far). The Repository Town villager and population renderers choose the
tier by distance, keeping the busy streets cheap while people near the player stay detailed.

### 5. Playable showcase (`src/residents.html` + `src/residents-showcase.js` + `src/resident-showcase.css`)
A standalone studio (no simulation import) with 16 identities: choose a person, switch between
8 animations, 5 clothing contexts and 3 LOD levels, and show a 12-person crowd. It retries WebGL
context creation with permissive flags and falls back to 16 inline-SVG 2D portraits (with a clear
message) when WebGL/GPU is unavailable, instead of hanging on "Building residents…".

## Integration
- `src/world/npc-wardrobe.js` — `makeDistinctPerson` now delegates to the detailed figure;
  `appearanceFor` and the identity/scale contracts are preserved.
- `src/world/npcs.js` — `pose()` dispatches to the detailed figure's pose controller.
- `src/world/townlife.js` and `src/world/population-view.js` — distance-based LOD only.
- `src/world/narromine-homes.js`, `narromine-workplaces.js`, `narromine-coles.js` — resident
  figures use the identity/outfit system (visual only; schedules and occupancy logic unchanged).

## Verification
- `node tests/resident-identity.mjs` — determinism, 500/500 distinct signatures, 10 skin tones,
  12 hairstyles, 6 builds, activity outfits, no invented facts.
- `node tests/resident-figure.mjs` — 36 identities, bounds/joint contract, finite poses for every
  activity, sit/sleep/carry/work/eat props, LOD 145→7 meshes, persistent signatures.
- `node tests/resident-showcase-browser.mjs` — desktop 1280×800 + Pixel 7 393×852 in real Chrome:
  16 identities, all animations, clothing contexts, LOD and crowd; zero page errors; screenshots
  under `test-results/resident-visual/`.
- `node tests/resident-game-browser.mjs` — real Chrome, full game: Repository Town villagers,
  a Narromine household and Coles Narromine render the detailed figures; zero page errors;
  screenshots under `test-results/resident-game/`.
- `node tools/build.mjs` and `node tools/check_privacy.mjs` pass.
- Regression batch green: `npc-appearance`, `indoor-crowd-identity`, `abs-demographics`,
  `resident-identities`, `narromine-residents`, `narromine-homes`, `narromine-workplaces`,
  `narromine-postal-resident`.

## Honest remaining work (not claimed)
- No new rigged GLB assets were added; faces are procedural on top of the existing jointed
  figure, and the licensed GLB styles (`resident-models.js`) are unchanged.
- The procedural face is still stylised, not The Sims 4 fidelity.
- Behaviour (needs, schedules, commuting, shopping, household/worldplace logic) is intentionally
  out of scope for this branch and owned by other agents.
- Mobile was verified via emulated Pixel 7 viewport, not a physical handset.
- GitHub PR/deploy status is separate from this source work (see `COORDINATION.md`).
