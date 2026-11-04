# Narromine surface materials: follow-up visual verification and audio CI closeout (5 November 2026)

**Owner:** ChatGPT/cloud. **Existing material release:** [PR #337](https://github.com/joshualparris/JoshMemory/pull/337) / merge `51ad6869`.  
**Current follow-up branch:** `fix/narromine-material-qa-audio-ramp-20261105`.

## Why this extra work is needed

The original material implementation uses six UV-free procedural PBR surface roles (asphalt, concrete, brick, render, sheet metal, glass) and a Lambert fallback. The material's colour registry is intentionally **not** a surveyed facade/material identity record; it makes visual textures more plausible but must not be called a photo-accurate restoration.

A later mainline real-WebGL CI run [41918202054](https://github.com/joshualparris/JoshMemory/actions/runs/41918202054) failed for an **unrelated engine-sound browser assertion**, `parking runs the engine down (undefined rpm, 1 stopping frames)`. Browser logs prove start, idle, acceleration and off checks passed and software WebGL exposed only one render frame of the 1.2 s audio clock transition. The previous test-only PR #360 fixed an external Playwright polling race but not this source-level frame-dependent run-down.

## Game-level repair

`src/ui/vehicle-audio.js` now schedules the frequency drop and gain fade on the **WebAudio clock**, independently from the 3D renderer's frame schedule. The stop phase does not overwrite scheduled AudioParam automation on subsequent render frames. `tests/vehicle-audio-rundown.mjs` asserts real WebAudio API scheduling calls using strict AudioParam doubles; `tests/engine-sound-browser.mjs` observes actual Chrome AudioParam frequency and gain ramps and still requires `phase === 'off'`, with no mocked gameplay state.

## Photograph-safe material A/B visual QA

The narrow [GitHub workflow](../../.github/workflows/narromine-material-audit.yml) captures actual Chromium/SwiftShader WebGL screenshots of identical **source geometry, camera coordinates, times, lighting and code SHA**. The baseline temporarily replaces **only** the factory `createNarromineSurfaceMaterial` call with the previous Lambert material during the CI job. That temporary edit is never committed or deployed. Candidate renders use unchanged source.

- Four positions: Narromine Hotel corner, Post Office, Coles/Kierath's Dandaloo frontage, representative ordinary Narromine street.
- Desktop 1280×800 and Android-size 393×852.
- Three solar positions: 08:00, 12:30 and 16:45.
- Expect 24 baseline and 24 candidate captures, each pair location-matched, with screenshot, manifest, frame-time metrics and reviewable artifact.
- After the run, **inspect** the captures for brick mortar visibility, concrete joints, surface roughness, road colour/shading, corrugated highlights, glare, aliasing, flicker and geographic alignment; an image hash alone is **not** a photographic fidelity verdict.
- The comparison photographs [55 annotated Street View/game images](https://drive.google.com/drive/folders/1wgPC3JnTWJIPurRXzbW_5T5DLcn1QXJR?usp=sharing) remain in Drive. **No Google Street View pixels committed**, distributed as a texture, or published in the QA artifact.
- The original photo labels in the old audit have some inconsistent street addresses and material descriptions; do not infer exact colour/brick bond/roof sheet dimensions without measured evidence.

## Completion gates (pending the actual run)

- [ ] Release/build/privacy checks pass for latest proposed source.
- [ ] Focused AudioParam unit contract and real Chromium shutdown both pass.
- [ ] Material A/B CI job passes with 48 screenshot captures and no WebGL shader errors.
- [ ] An agent actually inspects the rendered screenshots (not just their hashes) and records any observed defects.
- [ ] PR merges safely after reconciling other agents' commits.
- [ ] Vercel production reports the **exact approved merged source commit** and is READY; deployed game and release fingerprint checked.
- [ ] Open photographic fidelity gaps remain clearly labelled; do not claim Narromine is 100% realistic.

All other building geometry, street alignment, collision logic and concurrent agent responsibilities are out of scope.
