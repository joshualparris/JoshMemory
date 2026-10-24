# Repository Town — WORK CHECKPOINT

Updated 2026-10-24 (Australia/Sydney). Working branch: `feat/town-npc-branching-recordings-20261024`.

## RTD-006 production-release and browser/audio baseline — 24 October 2026

- **RTD-006 VERIFIED SOURCE AUDIT COMPLETE, docs only.** Read [RTD-006 Vercel/CI release baseline](docs/RTD_006_RELEASE_BASELINE_2026-10-24.md); read-only Vercel + GitHub inspection; no source/gameplay changes, audio generation, redeploy or production promotion.
- **Current GitHub main at start of audit:** `588f2b9bb3655d7fe2e1da500fef4f6ed4dd697a` (16 commits ahead of production; compared file changes were QA/tests/workflows and docs, not `repository-town/src/`). Current source may advance after coordination/merge; do not imply all main commits are deployed.
- **Real canonical Vercel production deployment:** `dpl_BUJvawLJX9Bvk87P7b7uKu1U4RJp`, READY, alias `https://repository-town-claude-complete.vercel.app/`. Actual deployed source `9e3853156838f21c5a7c17cb63ce3bd4d827f93c`; live `release.json` HTTP 200 sourceCommit exact match. ContentHash `afc7f0a2562b0823daf9d73dced3842dda27093325352a098ed2c24bac3de637`. Vercel release verifier logged **1,133 SHA-256 file checks passed**.
- **Live HTTP 200 verified:** `/`, `/release.json`, `/people.html`, `/ui/recorded-dialogue.js`, `/ui/npc-chat.js`, `/ui/voicebank.js`, `/ui/yarns.js`, `/npc.css`; separately VoiceBank `/src/game300.js` served HTTP 200. Staging released different source `6b81498565910c0ab2eec4270fb33af4616158a9`.
- **CI browser/audio baseline:** [Integration run 40079153284](https://github.com/joshualparris/JoshMemory/actions/runs/40079153284) success (release/privacy and five 28-day economic seeds); [Recorded WebGL run 40079153300](https://github.com/joshualparris/JoshMemory/actions/runs/40079153300) success, locally served real recorded Game300 on desktop/mobile 10 actors, exact captions, stop/replay, paidRequests 0, pageErrors 0, 3D WebGL smoke.
- **Explicitly NOT proven:** separate actual **hosted-production Chromium/Pixel 7 step was skipped**; HTTP JS fetch is not live deployed browser/audio gesture or real Samsung handset test. Full walk→NPC→interior→repair/quest audio, ZIP failure/offline, production backup fingerprint and 22 missing cast voices remain OPEN.
- **Handover:** RTD-001–006 checked. Next RTD-007 coordination reservation/checkpoint, then RTD-008 acceptance plan; avoid broad production rollout without a separate deploy request and release gate.

## RTD-005 merged dialogue and audio acceptance reconciliation — 24 October 2026

- **RTD-005 VERIFIED COMPLETE and merged:** [PR #170](https://github.com/joshualparris/JoshMemory/pull/170), source merge commit `9e3853156838f21c5a7c17cb63ce3bd4d827f93c`. The [Repository Town Integration workflow](https://github.com/joshualparris/JoshMemory/actions/runs/40079153284) and [Recorded WebGL Playtest workflow](https://github.com/joshualparris/JoshMemory/actions/runs/40079153300) both passed at tested head `3b00f3024a79054855756f897b0fbe5974a8fb30`.
- **RTD-005 COMPLETED, documentation-only**: [PR/audio ownership reconciliation](docs/RTD_005_DIALOGUE_AUDIO_RECONCILIATION_2026-10-24.md). Existing shared recorded dialogue and truthful speaker captions preserved; no runtime code, files or live deployments changed.
- **GitHub facts confirmed:** PR [#165](https://github.com/joshualparris/JoshMemory/pull/165) (truthful Game300 greeting/help cues) and [#166](https://github.com/joshualparris/JoshMemory/pull/166) (shared choice dialogue, desktop/mobile browser tests) are **merged**. PR [#164](https://github.com/joshualparris/JoshMemory/pull/164) proposing 20 extra `VO041`–`VO060` clips is **open**, and overlaps the very same dialogue and voice source files. Review/port only verified source/caption/audio changes; do not blindly merge its older branch.
- **17 global Town audio acceptance IDs 006–013, 040–048:** parent 006 verified checked (100 clips / ten cast); the other 16 are OPEN. The old audio-track subtask “merge #165” is obsolete, **not** proof that its parent 007 is complete. Full 3D/transaction/offline/production acceptance remains open.
- **Older `RT-08`:** GitHub **merge** of #166 is complete; independent canonical **production release fingerprint and real deployed audio** remain to be proven, so older combined checkbox stays OPEN. Older `RT-09`: RTD-003 inventoried the cast, but the missing 22 named NPC voices have not been generated/approved; keep open.
- **RTD-006 next:** pin current main SHA and compare actual live production/staging release fingerprints with tested browser/audio evidence; keep separate from inferred PR/CI success.
- **No duplicate work:** preserve current `recorded-dialogue.js`, `npc-chat.js`, `voicebank.js`, CSS, ten known Game300 voices, exactly captioned WebAudio, `stopTownVoice` cancellation and #166 mobile focus fix.

## Follow-on Skyrim-inspired dialogue roadmap (24 October 2026)
- Numbered 93-item roadmap: `docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md` (RTD-001–093).
- Tasks RTD-001–006 are completed with design/source audit, identity/PR/audio reconciliation and RTD-006 read-only Vercel/CI release baseline; RTD-007–093 remain OPEN.
- The earlier recorded-branch PR #166 is merged, but its initial tree does not close the conditional quest, game-memory, cast expansion or full production-playtesting requirements of this roadmap.
- **Resume:** inspect current main and `COORDINATION.md` first, then RTD-007 coordination/RTD-008 acceptance checks, reusing the RTD-006 live release baseline; build Rowan/Kit/Pip pilot and check off only proven results.

## RTD-004 pinned source audit — 24 October 2026

- **RTD-004 COMPLETE (source audit only)**: `docs/RTD_004_DIALOGUE_SYSTEM_AUDIT_2026-10-24.md` documents the canonical dialogue flows, Game300/VoiceBank engine, the NPC-to-NPC event path, Expedition Guild and all relevant local/save transfer state keys and privacy boundaries. Source snapshot `69a12eea14fa706c605943f98e300f1f263377d2`.
- RTD-001–004 are checked in the 93-task roadmap; RTD-003 was completed by ChatGPT after Replit usage was exhausted, including source-backed JSON and actual TownLife parity test.
- **Do not reinterpret RTD-004 as a gameplay or deployment acceptance test.** No application source, recordings, CI runtime or deployed production was changed for this audit. All story, save integration and actual WebAudio acceptance tasks remain open.
- **Next safe handover:** RTD-003/004 verified complete on main; proceed with RTD-007 (coordination checkpoint reservation) and RTD-008 acceptance checklist; reuse RTD-006 release baseline while protecting concurrent NPC code.
- Working audit PR branch: `docs/town-rtd004-source-audit-20261024`; see the linked audit for detailed integration seams.

## RTD-003 population inventory takeover — 24 October 2026

- **Verified merged commit:** `03272c88fc84351a6915d7cf8fed880c770d85aa` in main, [PR #169](https://github.com/joshualparris/JoshMemory/pull/169). Exact tested PR head `a5680c78eb60c429ec7037fa8136c392f01b9a2b`.
- **CI success:** [Repository Town Integration run 40077642675](https://github.com/joshualparris/JoshMemory/actions/runs/40077642675) (includes actual TownLife inventory regression, release/privacy/build and five economy seeds); [Recorded WebGL desktop/Android run 40077642686](https://github.com/joshualparris/JoshMemory/actions/runs/40077642686). First CI attempt failed because Errol becomes general manager at government initialization; source snapshot corrected, subsequent run fully green.


- **RTD-003 COMPLETE and merged (PR #169; release + WebGL CI green):** `docs/RTD_003_NPC_CAST_INVENTORY_2026-10-24.md` and complete machine-readable `docs/NPC_POPULATION_INVENTORY_2026-10-24.json`; `tests/npc-population-inventory.mjs` added to `npm run test:integration`.
- **Current figures confirmed from source:** 32 named street actors (10 Game300 voiced, 20 quizzes); **99** simulated Living Town workers, not only the historical 38. Original worker IDs 0–37 and home assignments stay stable. Workers comprise 61 baseline jobs + 30 relief jobs + 8 security/locksmith jobs; 99 named workers occupy 99 of 188 repository houses.
- **188 resident aliases are coordinate-keyed labels, not 188 extra full-life NPCs.** Grid has 208 possible coordinates, 20 lacking a project (G8–Z8). Avoid conflating `named:rowan`, a simulated worker also named Rowan, and any similarly named house resident. Namespaced identity IDs and exact mapping are in the JSON snapshot.
- **Execution evidence:** sourced from canonical NPCS, VoiceBank voice set, `TownLife` jobs/names/home allocation, project inventory and resident-name function; parity test instantiates real `TownLife` and checks 32/99/188 namespaced identities. No gameplay, voice, deployment or manual handset changes.
- Replit exhausted its usage; task transferred explicitly by the user. This session does not overwrite Replit code or change the generated backup. RTD-004 previous audit unchanged.
- **Next:** RTD-007 reserve next dialogue implementation work; use RTD-006 release baseline and separate owner-specific conversation branches for Rowan, Kit and Pip.

## Scope and source of truth
- Canonical editable repo: `joshualparris/JoshMemory/repository-town/src/`, not the generated `Parris-Tech-Services/Repository-town` mirror.
- Base main SHA: `6b18994b16cd763ebbac3ab8f3169bc0c20cc619`.
- Resume goal: natural player-choice NPC conversations with accurate prerecorded ElevenLabs speech, subtitles, stop/replay, personality consistency, and in-game browser playtests.
- Prior independent live playback evidence: 100 Game300 recordings/10 residents in `tests/game300-live-playback.cjs`, but this does NOT establish full branching conversation gameplay.
- Never claim recorded chat words match arbitrary generated NPC replies; no fake completed quest/purchase/repair lines. Existing gallery and opt-in devices remain unchanged unless reviewed.

## Numbered completion tasks
- [x] RT-01 Locate canonical writable source and inspect integration rules; verify the mirror is generated.
- [x] RT-02 Read existing sound integrations, 100-clip task tracker and prior testing limitations.
- [x] RT-03 Read actual Game300 captions/actor mapping and Town NPC hooks; identify safe conversational options.
- [x] RT-04 Build a reusable deterministic branching dialogue UI, with individually captioned prerecorded replies, back/exit and stop/replay.
- [x] RT-05 Wire choices into existing NPCs in genuine Town conversations without making false state claims.
- [x] RT-06 Add regression coverage for actor/caption/source match, dialogue state, rapid taps, dismissals, mobile size, errors and no autogenerated speech.
- [x] RT-07 Run tests, privacy/build gates, fix failures; record exact passing commands/CI SHA.
- [ ] RT-08 Merge reviewed change and confirm canonical deployment SHA/URL and audible production playback on desktop and mobile.
- [ ] RT-09 Inventory uncovered NPCs, identify appropriate new voice lines, generate only approved gaps, back up exact MP3 and captions to VoiceBank and Drive.

## Current evidence / next action
- This checkpoint is a handover, not a success statement.
- The Work session shown in screenshots made local patches, but without a pushed commit they cannot be assumed present. GitHub main remains authoritative.
- Next: inspect Game300 metadata and resident chat, implement modest non-invasive branching layer, then test.

## Verified PR evidence (2026-10-24)
- Branch source SHA: `2f7e4d2e4c16b393e3749efaed0d041186310b55` (last application change; documentation updates after this SHA).
- PR: https://github.com/joshualparris/JoshMemory/pull/166
- All eight checks passed at the application SHA: five 28-day economy seeds, Town safety gate (release build + privacy), Android emulation, desktop/mobile software-WebGL gameplay.
- In specific Chromium browser test `tests/recorded-dialogue-browser.mjs`, all ten actors were selected and their *actual* VoiceBank MP3 played in desktop and Pixel 7-size contexts, with exact actor-specific caption, stop/replay, 0 runtime paid ElevenLabs calls, 0 page errors. Logs: https://github.com/joshualparris/JoshMemory/actions/runs/40073596040/job/120812163000.
- First run discovered a real bug: desktop auto-focus hid the voice choices. Fixed `npc-chat.js` plus `tests/npc-viewport.mjs` and re-ran the full suite green.
- The new test covers the 2D lounge which reuses the same NPC modal as 3D Town; broad 3D WebGL gameplay also passed. It does **not** constitute manual testing on Josh's Samsung handset, or final deployed audio verification; mark RT-08 open until checked.
- No recordings regenerated or paid for. The existing 100 Game300 Town tracks remain backed by VoiceBank and Drive's GameDialogue300-OneClick (catalogue, ledger, pack folders).

## Remaining unvoiced original cast (22 of 32 NPCs)
Ember, Captain Vale, Bramble, Echo, Moss, Byte, Tick, Nimbus, Fizz, Captain Coral, Quill, Orbit, Thistle, Basil, Pebble, Zig, Pollen, Lumen, Vesper, Kestrel, Drift, Tangle.

All 22 are **UNRECORDED** in the approved Game300 Town pack. Do not play another speaker's lines for them or treat a proposed casting as recorded audio. Future work: individual voice auditions and consistency selection; author their safe branching scripts; generate/approve original MP3s with cost consent, SHA-256 and captions; save originals + manifests to Google Drive and VoiceBank GitHub; wire in native Town; regression/browser/deploy verify. Keep task RT-09 open until backed-up assets actually exist.

## Arcade automated playtesting — 24 October 2026

**Scope:** user supplied Skyvern v2 workflow titled *Playtest the Vibe-Coded Game* for Mysterious Depths and AA Game Adventure. This work is isolated from RTD NPC/audio development and existing game source.

- Canonical `src/arcade.html` exposes `#filter`, `#cards article`, `#game`, `#game-frame`, `#game-exit`; Playwright harness targets those real selectors.
- Catalogue `data/games.json` currently contains 77 entries. Both requested titles occur twice (JoshHub and Parris-Tech-Services editions) and all four `games/<id>/index.html` source files were confirmed present.
- Wrote `tests/arcade-agent-playtest.mjs` (browser Playwright, 20 actions max, --games ALL support, independent duplicate editions, before/after screenshots, runtime error and same-origin HTTP evidence, JSON report).
- Wrote `qa/skyvern-arcade-playtest.workflow.json` using Skyvern 3.0 navigation/extraction blocks and existing two workflow parameters. This is a definition only, not an authenticated Skyvern run.
- Added `tests/arcade-qa-contract.mjs`, `qa/README.md`, and opt-in manual `.github/workflows/repository-town-arcade-playtest.yml` with report/screenshot artifacts; linked QA docs from README.
- **Verification:** V8 syntax parse of the runner passed; Skyvern JSON parsed and required blocks/parameters confirmed. Browserless source checks found both requested titles and all four packed entrypoints. Full Node test and actual browser run **not yet verified**: local container has no GitHub DNS, web fetch of live Vercel arcade failed; GitHub workflow_dispatch is unavailable via connected GitHub actions. GitHub PR/CI and manual dispatch required.
- No new runtime game/deployment changes, no game bugs or balance findings fabricated. The browser report must be run before claiming actual gameplay coverage.

**Next:** open and merge reviewed PR once checks pass; then run the new manual GitHub Action for desktop and mobile and review its artifacts. Resolve any real observed bugs in the appropriate source game repository, not generated backup.

### QA integration completion and deployment evidence
- **MERGED CODE**: PR #171 `https://github.com/joshualparris/JoshMemory/pull/171` into canonical main at commit `db603aae0a27031fe256c2b1644f20822886c0ec`. Verified all five new QA files exist on default branch and runner source parses with the V8 JavaScript grammar check; Skyvern JSON parses as v2 navigation + extraction workflow.
- **Production**: Vercel latest known READY alias `repository-town-claude-complete.vercel.app` currently points to deployment `dpl_BhgxnKM45JfLxq6gdPTVtbBpWwpy` from prior source `03272c88`. GitHub combined Vercel status for QA merge reports failure at `https://vercel.com/joshualparris-projects?upgradeToPro=build-rate-limit`, an external **build-rate-limit**, not a newly demonstrated source compile error.
- **TEST RUN PENDING**: The new manual GitHub workflow has not been dispatched and no JSON/screenshot run results exist from it yet. Static checks only; no game-level bugs, UX or balance assertions made.
- **Exact next**: dispatch `Repository Town Arcade Playtest (manual)` twice (desktop/mobile), inspect evidence for both editions of each title, then log verified findings and address defects in the respective source game repository. Do not treat a 77-entry catalogue count as 77 verified playthroughs.
