# Resident model upgrade — Quaternius rigged candidates (review)

**Date:** 6 November 2026 · **Branch:** `feat/resident-quaternius-20261106`
**Scope:** visual/model layer only. Schedules, needs, households, commuting, shopping and
workplace behaviour remain owned by other agents and are untouched.

## Sources (CC0)

- **Quaternius Universal Base Characters [Standard]**
  - `Superhero_Male_FullBody.gltf` / `.bin`
  - `Superhero_Female_FullBody.gltf` / `.bin`
  - body/hair/eye base-colour textures, downscaled from 2048 px to 512 px
- **Quaternius Universal Animation Library [Standard]**
  - `UAL1_Standard.glb`, trimmed to 12 clips and resampled: Idle, Idle Talking, Walk, Jog,
    Sitting Enter/Exit/Idle, Driving, Interact, PickUp, Fixing Kneeling, Crouch Idle.
- Licence: CC0 1.0 Universal (Quaternius). See the asset README/licence files in
  `src/assets/people/quaternius/`.
- Normal/roughness maps were deliberately omitted to keep the download at ~7 MB; that is an
  explicit quality/bandwidth trade-off, not a claim of full material fidelity.

## What was built

- `src/world/resident-quaternius.js` — loads the two base bodies and the trimmed animation
  library, clones a body per identity, maps gender, height/build, hair and eye colours, chooses
  the light/dark body texture from a stable identity bit, attaches a simple torso shirt to the
  chest bone, and drives the animation mixer. Returns a small controller with `setState`,
  `update`, `setLod` and `dispose`.
- `src/world/resident-models.js` — new **Quaternius rigged · new** style in
  Settings → Resident style. It is **experimental and not the default**; the procedural figure
  remains the default until the comparison is reviewed. Distance LOD still applies (rigged
  model near, procedural figure far).
- `src/resident-compare.html` / `resident-compare.js` / `resident-compare.css` — side-by-side
  browser comparison of the same persistent identity: procedural on the left, Quaternius on the
  right, with idle/walk/talk/sit animation controls, identity switching, live draw-call and
  triangle counts, and a measured FPS readout. Includes a WebGL-unavailable fallback message.
- `tests/resident-quaternius-browser.mjs` — real Chrome acceptance for both the comparison page
  and the in-game style.

## Verified

- `node tests/resident-quaternius-browser.mjs` (real Chrome, 1280×800 + in-game 1100×700):
  - comparison page: procedural 127 meshes vs rigged **4** meshes;
  - 116 draw calls / 28,730 triangles in the comparison scene;
  - all four animations change the rigged state; all 8 identities rebuild without errors;
  - in-game `quaternius` style loads, `wearing > 0` near the player, zero page errors;
  - screenshots in `test-results/resident-quaternius/`.
- `node tools/build.mjs` and `node tools/check_privacy.mjs` pass.

## Honest limitations / remaining work

- The Universal Base Characters are a **textured superhero body**, not an everyday-wardrobe
  system. This slice adds one torso shirt overlay and chooses light/dark body textures; it does
  **not** yet provide the full varied everyday clothing requested.
- Hairstyle variation is currently tint/hide of the base hair mesh, not a library of fitted
  hairstyles; the rigged hairstyle GLTFs are not yet attached.
- Faces are Quaternius' low-poly sculpts, not scanned or MakeHuman-quality faces.
- MakeHuman assets were downloaded and inspected but not integrated in this slice. The next
  evaluation step is a MakeHuman/MPFB export (nude base + separate clothes/hair) if the
  Quaternius body/wardrobe gap cannot be closed cleanly.
- The **default has not been switched**. The comparison page exists precisely so the owner can
  judge before a default change.
- Headless Chrome can throttle `requestAnimationFrame`; the FPS readout is indicative only.
  Physical laptop/mobile performance still needs a human measurement.
- No deployment claim: this branch is source + local browser evidence only.
