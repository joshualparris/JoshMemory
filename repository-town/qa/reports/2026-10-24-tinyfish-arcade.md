# Repository Town TinyFish arcade playtest — 24 October 2026

Status: **PARTIALLY VERIFIED**. This is observed browser evidence, not a complete multi-edition, mobile, balance or release acceptance run.

## Run provenance
- Combined first run: https://agent.tinyfish.ai/runs/bd49eb95-ae1a-47ce-b620-cd4212baa270 — arcade loaded, 59 displayed games; per-game results unexpectedly empty. Do not use this run as game-level acceptance proof.
- Mysterious Depths focused run: https://agent.tinyfish.ai/runs/346fd7c4-3272-421f-8eec-9a483ff0e2eb
- AA Game Adventure focused run: https://agent.tinyfish.ai/runs/2398588b-77de-4f46-bd78-ecfbe290fe84
- Tested live URL: https://repository-town-claude-complete.vercel.app/arcade.html
- Source catalogue at `data/games.json` has **77 entries**, including two editions of each requested title. Live arcade displayed **59** game cards, not necessarily a count of the same catalogue entries; compare source and production release before treating as missing games.

## Mysterious Depths — F3 JoshHub edition
**Game ID:** `hub-mysterious-depths` (reported live iframe path `/games/hub-mysterious-depths/index.html`).

**VERIFIED PLAYABLE:** loaded and story choices progressed.
1. "Reach out in the darkness" advanced from waking in darkness to a vibrating metal/stone environment, offering three choices.
2. "Investigate the metal surface" advanced to markings and two choices.
3. "Follow the curve upward" advanced to revelation of a derelict spaceship/mine, and an ending choice.
4. "Reach for the galaxies" produced a `Reached Ending` screen and `Play Again`. Exit to library worked.

**Observed UX issue:** four locked achievements displayed as `????` without explaining how achievements are earned. Source `public/games/mysterious-depths/game_Version2.js` explicitly uses `????` for locked achievements, so this is intentional mystery styling but lacks initial context. **Source UX improvement committed** to `joshualparris/JoshHub` at `492e1b8`: brief achievement explanation while retaining hidden labels. **Not packed/deployed/playtested after change.**

**Unconfirmed observation:** agent transcribed a scene ending with "It feels both ancient", but source includes a complete longer sentence ("...and technological. The wall curves upward and downward."). Do not claim definite truncation or overwrite story. Needs screenshot/layout review at narrow widths.

**Still open:** alternate branches, other edition `ptshub-mysterious-depths`, settings, achievements unlocks, Android touch, replay, deployed fix.

## AA Game Adventure — first card/edition, source edition unverified
**Observed:** game launched inside arcade iframe, overlay and Back to library worked. Reported canvas with Items: 0 and Day 0 0:00 (at one point 0:01), some changing blocks, player sprite near bottom-left. Arrow keys, WASD, space, clicks and canvas focusing attempts yielded **no verified player movement/collection**, despite extensive tries. No visible objectives or control instructions; player and item-state feedback were unclear. The test agent could not extract the exact iframe src and claimed a single edition, which conflicts with the two source catalogue entries; **do not assume its edition identification is authoritative**.

**Root cause not yet proven:** likely mix of canvas/iframe keyboard focus and game mechanics. Source `joshualparris/JoshHub/public/games/aa-game-adventure/index.html` lacked instructions; the Parris-Tech-Services edition already displays "Controls: arrow keys to move. Objective: explore and collect letters." **Source fix committed** at `774f0b6`: visible instructions plus an accessible Focus game controls button/canvas pointer-focus affordance. **Not repacked/deployed/playtested after change.** This fixes discoverability in source; does not prove movement works.

**Unconfirmed:** allegedly moving blocks, fish outside main canvas, time not progressing, and zero game state change. Need camera/game engine tracing and real keyboard event evidence before filing definitive gameplay bugs. Cannot conclude balance quality when control path is uncertain.

**Still open:** actual game iframe ID/source edition, targeted nested-iframe keyboard acceptance, source gameplay tests, collection assertion, progress/ending, alternate `ptshub-aa-game-adventure` edition, mobile input, production repack/deploy.

## Project-level follow-up
1. Repack both updated JoshHub game editions into canonical `JoshMemory/repository-town/games/<id>` using `tools/pack_games.mjs` and execute `tests/games.mjs --only ...`.
2. Run manual Playwright arcade QA workflow on both exact-title editions at desktop and mobile; capture screenshots, JS console, iframe URL and interactions.
3. Diagnose AA input handling/focus separately from game logic. Build an input-driven test that asserts player position/items genuinely change, not merely that browser key calls return success.
4. Review Mysterious Depths story overflow at narrow widths and achievement text accessibility; verify another branch and ending.
5. Run full release/privacy gate and deploy, then confirm production `release.json` SHA/content fingerprint matches merged commit and backup. At last check Vercel automatic builds were rate-limited.
6. Keep `TASK-040` open until broad arcade acceptance is actually complete.

No gameplay code changes were made in canonical Repository Town by these findings. Source game enhancements belong to `joshualparris/JoshHub`, with source-first repack/release following separately.

## Source follow-up after report
- AA floating-help layout correction: `joshualparris/JoshHub` commit `0c3724ec` replaces the ordinary-flow help strip with a fixed floating panel, preserving the bundled CSS's `#game-canvas { height: 100vh; width: 100vw }` and `body { overflow: hidden }`. Inline focus script passed V8 parse and readback confirmed the fixed overlay and keyboard focus affordance. Still needs a real browser and packed-release test.
- Mysterious Depths game source achievement explanation at `492e1b8c` confirmed present on readback. These are source edits only, not deployed.
