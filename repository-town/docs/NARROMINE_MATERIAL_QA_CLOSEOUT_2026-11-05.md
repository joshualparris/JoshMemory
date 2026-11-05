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

## Evidence checkpoint — 5 November 2026 (AEDT; NOT a release approval)

**Status: PARTIALLY COMPLETE.** The implementation and material proof-of-concept exist on PR #384; all production acceptance gates below have **not** passed at the latest source commit.

- The original recorded browser suite [41923941338](https://github.com/joshualparris/JoshMemory/actions/runs/41923941338) passed both desktop/Android-size gameplay and the full browser regression at head `aa05c543`.
- After reconciliation with main at `a9b3081d`, core CI [41926694255](https://github.com/joshualparris/JoshMemory/actions/runs/41926694255), mobile driving [41926694498](https://github.com/joshualparris/JoshMemory/actions/runs/41926694498), heritage release [41926694259](https://github.com/joshualparris/JoshMemory/actions/runs/41926694259) and town integration [41926694473](https://github.com/joshualparris/JoshMemory/actions/runs/41926694473) passed. The recorded WebGL suite [41926694515](https://github.com/joshualparris/JoshMemory/actions/runs/41926694515) was not yet wholly finished when this checkpoint was written.
- A previous [material A/B artifact 13368606824](https://github.com/joshualparris/JoshMemory/actions/runs/41923941415/artifacts/13368606824) contains **48 actual software-WebGL screenshots**, 24 Lambert baseline + 24 candidate; all individual capture and daylight checks passed. The candidate image-repeat check nevertheless failed (`poseDelta=0`, `pixelRmse=5.15`, edge correlation `0.9984`; required RMSE <4). This means the **entire visual QA job cannot be called passed**.
- The subsequent [material A/B run 41926694414](https://github.com/joshualparris/JoshMemory/actions/runs/41926694414) also failed the strict image-repeat test, this time on Lambert baseline (`poseDelta=0`, `pixelRmse=5.17`), while its 24 baseline captures, daylight tests, browser errors and geometry tests all passed. That cross-material failure indicates a test reproducibility problem but does **not** prove there is no visual bug.
- PR #384 now moves the deterministic repeat comparison directly after the first view (`tools/narromine-visual-qa/run.mjs`), **retaining** the strict pose, pixel-RMSE and structural-edge thresholds. The material workflow path filter was extended to include that QA script so edits demand new validation. **The changed code itself has no completed fresh A/B run yet**; do not merge on the prior failed screenshot run.
- Visual review of four matched old/new views identified the most perceptible change as concrete joint definition; asphalt/brick/render differences are relatively subtle. Geometry remains simplified. These renders are **SwiftShader software-WebGL**; single-digit software FPS is not hardware-specific ProBook or real-phone performance evidence.
- The supplied Google Drive folder holds 55 historical Street View/game comparison screenshots; reference shots must remain out of public artifacts unless publication rights are independently established. Surface materials alone cannot establish photographically true facades.
- Vercel rejected a PR preview because its account exceeded **100 deployments/day** (`api-deployments-free-per-day`, PR comment). The most recent checked READY production deployment was sourced from `4e1fb3d9`, not the current main or PR #384. **Production is not verified for these fixes.**
- Concurrent changes keep advancing main and coordination files. Always re-read and reconcile with the exact latest main before acceptance; preserve other agents' claims.

## Verified pre-merge release gate (5 November 2026)

All **17 exact-commit GitHub checks** passed for `7b59ed209ebacbed71b814c69a39999ee07e22d2`:

- [Recorded actual WebGL gameplay + complete Chrome browser regression](https://github.com/joshualparris/JoshMemory/actions/runs/41936578921): **PASS**.
- [Focused roof-jump / woodcut real Chromium acceptance](https://github.com/joshualparris/JoshMemory/actions/runs/41936579230): **PASS**. Verified feet exactly 5.25 m on a real static roof collider, and the woodcutting animation visibly traversed 2.14 rad on desktop (31 frames), 2.10 rad mobile (21 frames), with the original >1.2 rad requirement preserved.
- [Material A/B screenshot workflow](https://github.com/joshualparris/JoshMemory/actions/runs/41936578852): **PASS**; 24 Lambert and 24 enhanced renders, all daylight/camera checks. The immediately repeated first-frame tests passed at RMSE 1.37/1.38 (strict threshold <4).
- [CI](https://github.com/joshualparris/JoshMemory/actions/runs/41936578911), [full integration and 5 economy seeds](https://github.com/joshualparris/JoshMemory/actions/runs/41936579082), [mobile driving](https://github.com/joshualparris/JoshMemory/actions/runs/41936578943), [heritage verification](https://github.com/joshualparris/JoshMemory/actions/runs/41936578948): **PASS**.
- Four matched old/new rendered views were visually reviewed. Stronger concrete joints are observable; the remaining brick, asphalt and façade realism does not prove real Narromine materials or photographic geometry. Prior repeat-render failures remain documented above as historical failures, not the current run's status.
- **Not yet released at this checkpoint.** Concurrent agents advanced `main`; this branch must incorporate latest approved base without discarding their work. Then recheck new commit and verify the actual production release. Previous Vercel deployments hit the account's >100/day cap. Do not mark the live site verified on a READY deployment with a different Git SHA.

## Completion gates (current verified evidence)

- [x] Release/build/privacy checks pass for the last fully tested pre-merge source `7b59ed209` (must recheck after merging newer main).
- [x] Focused AudioParam unit contract and actual Chromium shutdown pass.
- [x] Material A/B CI job passes with 48 screenshot captures and no WebGL shader errors.
- [x] An agent inspected the rendered screenshots and recorded visible limits (not just image hashes).
- [ ] PR merges safely after reconciling other agents' commits.
- [ ] Vercel production reports the **exact approved merged source commit** and is READY; deployed game and release fingerprint checked.
- [x] Photographic fidelity gaps remain clearly labelled; do not claim Narromine is 100% realistic.

All other building geometry, street alignment, collision logic and concurrent agent responsibilities are out of scope.
