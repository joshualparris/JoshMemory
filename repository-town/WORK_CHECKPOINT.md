# Repository Town — WORK CHECKPOINT

Updated 2026-10-24 (Australia/Sydney). Working branch: `feat/town-npc-branching-recordings-20261024`.

## RTD-008 — versioned NPC dialogue acceptance contract (24 October 2026)

**Status: IN PROGRESS.** Canonical main before claiming: `dbe343f6c5f8d2e49def71c0b333685945505003`. Task RTD-008 only reserved in `COORDINATION.md` on main as commit `ca90808273767c100d385b77977a549789d2acfa`; other RTDs remain unclaimed. Branch planned: `docs/town-rtd008-acceptance-contract-20261024`.

- [x] **M1 — Read and claim.** Checked latest canonical main, 93-ID roadmap, RTD-007 ownership rules and open PRs. Source/audio conflicts: PR #164 is still open. Claimed documentation + acceptance test / PR template files only.
- [x] **M2 — Versioned contract.** Published [v1.0.0 34-case machine-readable contract](docs/RTD_DIALOGUE_ACCEPTANCE_V1.json), source commit `fd6178433ee9515e9b9d8632acc05b8060c5f6a0`, and [human acceptance specification](docs/RTD_008_ACCEPTANCE_CRITERIA_V1.md), commit `c8d0f741a5b3399ecbd1c5648d6264b1ecdd2066`. Exact setup/pass/fail/evidence for 34 RTAC IDs; all RTD-009–093 mapped. All cases remain `not_evaluated`, no implementation/production success claimed.
- [x] **M3 — PR traceability + contract regression.** Scoped `.github/PULL_REQUEST_TEMPLATE/repository-town-rtd.md` committed (`dbca7996fe5454066fecb69b6062b722d205ff6f`), Node contract and negative metadata tests in `tests/rtd-acceptance-contract.mjs` (`e21aad9f72e8e3679db915a8b5363c14585018bc`), wired into `npm run test:integration` (`63a0baaf0b46517032b55b5baec2b7a96aab4ba8`) and `.github/workflows/town-integration.yml` numbered-PR metadata gate (`7786cde40ba1af423771de6c6217eb4862effb3b`), `AGENTS.md` updated (`16c73d6cc66ba056b0777b9738acea8546a382eb`). This is a metadata/criteria gate, not gameplay acceptance.
- [ ] **M4 — Merge/handover.** Update roadmap/checkpoint/board, verify sequential IDs 001–093 and only 001–008 checked; source diff/test CI, PR merge then final checkpoint on main with exact SHAs and CI status.

**Boundary:** RTD-008 defines and verifies acceptance *criteria and traceability tooling*, not story engine implementation, recordings, playable NPC memories, full production interactive playtest or a release. Do not tick RTD-009+.

## RTD-007 — coordinated implementation ownership and milestone checkpoints (24 October 2026)

**Status:** VERIFIED COMPLETE (PR #173 merged, both CI workflows green); RTD-007 only was reserved on canonical `main` **before** authoring protocol/roadmap changes. Source baseline `2d91b9e7d321103342755cd16929b1a7077b8c4f`; claim recorded under `COORDINATION.md` at main commit `b2cd82474e3a19c33f9090967169111188be4f26`. Branch planned: `docs/town-rtd007-coordination-checkpoints-20261024`.

- [x] **M1 — Read and claim.** Re-read `AGENTS.md`, latest `COORDINATION.md`, RTD task definitions, checkpoint and open GitHub PRs. No active RTD-007 claim. Existing historical in-progress audio branches and still-open [PR #164](https://github.com/joshualparris/JoshMemory/pull/164) require conflict checks for any later gameplay/audio task.
- [x] **M2 — Author protocol.** [RTD-007 operational protocol](docs/RTD_007_COORDINATION_CHECKPOINT_PROTOCOL_2026-10-24.md) committed on topic branch at `64addcf88a7f39ac160e8b3dd104071ad2803039`. `AGENTS.md` updated with mandatory claim/checkpoint gate at `44f0f1b857758ba384b0cb40a36f42308e5f60a3`. Scope covers atomic ownership, conflicting PRs, milestone/handoff checkpoints, preserving task IDs and truthful production/recorded-audio evidence.
- **Milestone M2 checkpoint:** Protocol + discoverable agent instructions are now in GitHub; all changes are documentation-only. Next: evidence-linked roadmap RTD-007 checkbox, final coordination Done handover and PR CI. RTD-008 remains unclaimed.
- [x] **M3 — Record evidence.** RTD-007 checked with direct protocol/AGENTS/checkpoint links in 93-ID roadmap at `2003c838b76ca8ccb48f49c78a16681bbe30ed9e`; original board claim moved to Done on topic branch at `778a5bebbb14a072f1eca9447473bbe0ba9c150b`. Start checkpoint on main and M2/M3 milestone checkpoints committed. RTD-008 remains unclaimed.
- **Milestone M3 checkpoint:** Completed proof from branch: only docs/agent instructions are modified; no gameplay or VoiceBank files; next prepare PR, verify 93 IDs, run CI and merge after green checks.
- [x] **M4 — Verify/merge.** [PR #173](https://github.com/joshualparris/JoshMemory/pull/173) merged on canonical main as `788158d71eb56a797ccd598e763c910a94a104ff`, tested head `ea181a4ebae6519c2c2be323860d65bd1842e66a`. [Town Integration run 40081851125](https://github.com/joshualparris/JoshMemory/actions/runs/40081851125) **SUCCESS** (release/integration/privacy and 5 economy seeds); [Recorded WebGL run 40081851086](https://github.com/joshualparris/JoshMemory/actions/runs/40081851086) **SUCCESS** (local desktop and mobile browser playtest). Reviewed five changed files, all docs/agent guidance; verified 93 sequential RTD IDs with 001–007 checked and RTD-008 open, `AGENTS` protocol link and COORDINATION Done record. No new gameplay/voice/production deploy or hosted live audio acceptance.

**Boundary:** Coordination/process documentation only. RTD-008 actor/feature acceptance criteria and RTD-009+ gameplay are **not** claimed or implemented here. The next session must inspect current board/PRs, independently claim RTD-008, then checkpoint before changing source. Never turn a historic “in progress” entry into an unsupported active reservation, and never claim hosted production audio on the basis of local Playwright tests.

## RTD-006 production-release and browser/audio baseline — 24 October 2026

- **Final RTD-006 merge evidence:** [Repo Town PR #172](https://github.com/joshualparris/JoshMemory/pull/172) **merged** as `34eaf60455acf2984a8d69ed9b23477c24e70020`. Tested PR head `895e4054ca65dc33f785c67141adeec3b1e88735`. [Integration run 40080661228](https://github.com/joshualparris/JoshMemory/actions/runs/40080661228) **SUCCESS**, [recorded WebGL run 40080661245](https://github.com/joshualparris/JoshMemory/actions/runs/40080661245) **SUCCESS**. These were PR/head tests, not a newly executed interactive hosted-production audio test. The baseline production SHA and hash in the report are *time-of-audit snapshots*; re-inspect live `release.json` before a new release decision.
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
