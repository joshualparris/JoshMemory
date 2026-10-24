# RTD-005 — NPC dialogue implementation, PR and audio acceptance reconciliation

**Audit date:** 24 October 2026 (Australia/Sydney)  
**Task:** [RTD-005](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md) — compare merged PR #166, currently shipped source, the NPC choice UI, the Town checkpoint and linked audio task trackers, without duplicating or reverting existing work.  
**Scope:** Existing GitHub source, pull requests, CI evidence and checklists. **No new recordings, gameplay changes, production promotion or fresh production audio playtest are asserted by this audit.**  
**Editable source:** [`JoshMemory/repository-town`](https://github.com/joshualparris/JoshMemory/tree/main/repository-town), NOT the generated [Repository-town mirror](https://github.com/Parris-Tech-Services/Repository-town).  
**Related:** [RTD-003 cast/identity inventory](RTD_003_NPC_CAST_INVENTORY_2026-10-24.md) and [RTD-004 module/state audit](RTD_004_DIALOGUE_SYSTEM_AUDIT_2026-10-24.md).

## 1. PR/branch reconciliation — use *actual GitHub state*

| Workstream | Current GitHub status | Files and proven implementation | What NOT to infer |
|---|---|---|---|
| [#165 — contextual Game300 greeting/help cues](https://github.com/joshualparris/JoshMemory/pull/165) | **Merged 2026-10-24 02:50 UTC**, branch `feat/town-context-game300-20261024`, head `e70c8434b63c4b2f474ae24432b2bf26ec53bb41` | `src/ui/npc-chat.js`, `src/ui/voicebank.js`, `src/npc.css`, `tests/npc-context-cues.mjs`, `tests/voicebank.mjs`: optional greeting and help cues with actual recording text distinct from generated NPC text | Older audio tracker still says "merge #165" is pending; that step is **stale**, but the **overall audio task 007 remains open** |
| [#166 — choice-driven recorded conversation](https://github.com/joshualparris/JoshMemory/pull/166) | **Merged 2026-10-24 07:26 UTC**, branch `feat/town-npc-branching-recordings-20261024`, head `d56279e0101c6068248ed4aab155322eea1f134a` | New `src/ui/recorded-dialogue.js`, wired `npc-chat.js` and `voicebank.js`, responsive `npc.css`, `tests/recorded-dialogue.mjs`, `tests/recorded-dialogue-browser.mjs`, `tests/npc-viewport.mjs`; runner runs browser test | It does **not** implement actor-specific quest conditions, real transaction effects, retained branch stages or all 22 unvoiced actors |
| [#164 — 20 additional Town recording files](https://github.com/joshualparris/JoshMemory/pull/164) | **Still OPEN / not merged** as checked during RTD-005 | Proposed `src/audio/town/VO041.mp3`–`VO060.mp3`, alterations in `voicebank.js`, `recorded-dialogue.js` and `npc-chat.js`, new tests; likely relevant to later casting/content | **DO NOT merge blindly**: overlaps #165/#166 files and carries a different local audio approach. Confirm source, speakers, scripts, licence, captions/hashes and expected behaviours before cherry-picking |
| [#169 — RTD-003](https://github.com/joshualparris/JoshMemory/pull/169) | Merged, CI passed | Current factual cast counts **32 named street actors, 99 TownLife workers, 188 house-resident slots**, plus stable namespaces and regression | Outdated references to just 38 workers refer to original preserved IDs, not full current roster |

**Conflict resolution policy:** Canonical current `main` is the source of truth, not stale feature branch snapshots. Preserve the reviewed #166 player-choice engine and #165 opt-in greeting/help cue. Review #164's 20 proposed MP3s *individually* in a new integration PR; do not overwrite canonical `voicebank.js`/`npc-chat.js`/`recorded-dialogue.js` with its old versions. There is no reason to regenerate already verified Game300 sound.

## 2. Actual source implementation — preserve these features

| Feature | Source interface / evidence | Verified scope | Remaining gap / RTD owner |
|---|---|---|---|
| Authored choices | `RECORDED_DIALOGUE_BRANCHES` and `makeTownRecordedConversation` in `src/ui/recorded-dialogue.js` | Shared authored stages `start`, `topics`, `advice`, `explore`, `stories`, `goodbye`; 8 safe event types; Next, Back, Farewell, Stop and Replay controls | Actor-specific content, conditions and saved topic stages: RTD-009–021, 033–041, 068–080 |
| Eligible recorded cast | `hasTownRecordedEvent` in `src/ui/voicebank.js` | Game300 known actors: Rowan, Pip, Circuit, Wren, Sol, Sage, Spark, Lyra, Nova, Kit; absent event/actor has no disguised substitute | 22 unvoiced named street NPCs and 99 workers are separate future audio/scaling concerns: RTD-050, 078–080 |
| Actor-accurate recorded speech | `playTownRecordedEvent` → VoiceBank `playGame300('repo_town',npcId,event)` | Recorded caption comes from real Game300 clip text; cancellation revision protects stale callbacks; only explicit selection plays audio | Comprehensive clip→speaker/actor/hash audit, errors, all events and actual game consequences: RTD-042–055, 081–084 |
| Greeting/help context | `makeTownContextCue` returns recordings only for explicit `greeting` or `help`, not arbitrary generated reply audio | Separate opt-in cue beneath relevant NPC bubble, with actual recording caption | Full game-event context, narrative matching and live production: RTD-022–032, 045–048, 068–080 |
| AI free chat | `npc-chat.js` Cloudflare endpoint and on-device grounded room replies | AI text separate from prerecorded lines; recent chat within tab `Map`; no hidden ElevenLabs claim | State read-only adapters, privacy, NPC memory and constrained effects: RTD-022–041, 065–067 |
| Offline named challenge badges | `npc-chat.js` localStorage badges | 20 quizzes among the named cast (per RTD-003 inventory) | NOT actual multi-stage quests; integrate real results before using `success` event clips: RTD-023–032 |
| Older gallery | `makeTownRecordedLines` in `voicebank.js` | The ten event types remain available for opt-in preview including `success`/`retry` **labelled as a gallery** | Not evidence they triggered contextually; project wants suitable lines in earned gameplay only (audio 007/008) |
| House/worker dialogue and NPC yarns | `src/ui/npc.js`, `src/ui/yarns.js` and `src/world/yarn-dialogue.js` | Separate interfaces and town simulation social encounters; generic Listen may be **explicitly labelled device voice** | Never count named-cast branch UI as already integrated into 99 workers or 188 aliases: RTD-010, 034, 065–080 |

**Browser proof already held:** [PR #166 recorded-dialogue browser test](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/tests/recorded-dialogue-browser.mjs) checks ten actors with real ZIP/MP3 WebAudio source starts, exact captions, stop and replay across desktop and Pixel 7-size simulated viewports; unvoiced Ember cannot borrow a recorded character's voice. The saved [PR #166 CI evidence](https://github.com/joshualparris/JoshMemory/actions/runs/40073596040) passed the recorded browser acceptance. This **2D lounge shares its modal with 3D**, but does *not* prove every authored branch in actual 3D walk-to-chat-to-shop gameplay or a manually used Samsung handset. The subsequent integration and WebGL check for [PR #169](https://github.com/joshualparris/JoshMemory/pull/169) passed, but that was an inventory test, not a new production audio release certification.

**Existing controls/behaviour MUST be retained:** Mobile keyboard focus not hiding recorded choices (fixed in #166), opt-in initiation, exact caption separate from AI bubble, no paid speech generation at runtime, no unearned completion clip in scripted branch graph, cancel on NPC switch/close, honest missing recording. Validate further failure modes under their separate audio tasks; do not tick unrelated acceptance work on the strength of this source inspection.

## 3. Audio tracker crosswalk — never double-count

The [Town audio tracker (generated-mirror repository)](https://github.com/Parris-Tech-Services/Repository-town/blob/main/AUDIO_INTEGRATION_TODO.md) and [VoiceBank master 001–048](https://github.com/Parris-Tech-Services/ParrisVoiceBank/blob/main/AUDIO_INTEGRATION_MASTER_TODO.md) use the **same global numbers**. Their 17 Town-relevant numbers below are *not 17 extra RTD tasks*. This reconciliation is a status crosswalk, not new acceptance evidence. Preserve source tracker checkboxes pending genuine testing.

| Audio ID | Verified global status | Corresponding RTD scope | Practical interpretation / remaining requirement |
|---|---|---|---|
| **006** | **Checked: complete** | RTD-042–046, 081–084 | 100 Game300 lines proved playable for ten voices by previous independent live audio evidence; does not imply contextual quest/dialogue integration |
| 007 | **Open** | RTD-013–020, 045–048, 068–080, 085–090 | #165 cue and #166 shared recorded choices are merged. **Obsolete subtask:** “merge #165”. **Still needed:** event-specific placement, conflict review of #164, actual canonical live conversation QA |
| 008 | **Open** | RTD-022–032, 047, 082 | #166 intentionally omits `success`/`retry` from authored choices; must gate clips via completed authoritative quest/repair/purchase action and negative tests |
| 009 | **Open** | RTD-042–049, 082 | Source and sampled browser actor/subtitle proof exists, not a complete reconciled manifest and all clips tested in each contextual place |
| 010 | **Open** | RTD-018, 051, 059–061, 081–085 | #166 has stop/replay and some browser tests; full 3D NPC switch, repeat-tap and async interruption stress suite remains |
| 011 | **Open** | RTD-063–068, 085, 088 | Actual walking, interiors, objects, ambient audio and sound-stop journeys remain unverified end-to-end |
| 012 | **Open** | RTD-051–054, 056–062, 083–087 | Desktop/mobile-size checks partially exist; offline, CORS/ZIP failures, throttling, screen orientation and handset gaps remain |
| 013 | **Open** | RTD-089–092 (especially RTD-091) | Canonical deployed Vercel commit, live interaction, voice and mirror fingerprint not independently verified for this release |
| 040 | **Open** | RTD-042–053, 082 | Audio loudness, clipping, pauses, pronunciation and voice-quality review for 100+ lines remains |
| 041 | **Open** | RTD-042–049, 082–084 | Complete caption/text/hash integrity matrix, URLs, corrupt files, misrouted speaker regressions remain |
| 042 | **Open** | RTD-050–054, 059–061, 081–085 | One-player source logic exists; broader overlap, rapid taps, ambience precedence and screen-reader review remain |
| 043 | **Open** | RTD-052, 053, 084 | Measure and control startup/ZIP download/performance on slower mobile data |
| 044 | **Open** | RTD-049, 054, 083–084 | Offline/CORS/retry/paid-network-absence across failure modes remain |
| 045 | **Open** | RTD-056–062, 086 | Keyboard, focus, reduced motion, labels and long captions need complete independent accessibility acceptance |
| 046 | **Open** | RTD-085–093 | Cross-project end-to-end CI, desktop/mobile journeys and production smoke evidence matrix remains |
| 047 | **Open** | RTD-033–041, 087 | Save/restore, offline and settings must not regress unrelated gameplay |
| 048 | **Open** | RTD-042–048, 055, 093 | Central VoiceBank clip/trigger/destination/proof register remains to be closed in its owning repo |

**Audio counting:** 1/17 Town-relevant parent audio tasks complete (**006**). Sixteen remain open, consistent with both Town and VoiceBank global master parent checkboxes. Some subtasks have partial proof, which is **not** permission to mark a global parent task complete.

## 4. Recorded dialogue structure and future handover

**Source current state**: The six-stage shared graph does **not** decide who is employed, whether a repair succeeded, where someone is located, whether an item is owned, or what quest has advanced. It is a prerecorded *conversation preview/interaction*, not a Skyrim-style quest dialogue director. Until dedicated authoritative adapters exist, don't attach reward/repair result clips merely because someone chose “Give me a challenge”.

**Safest implementation sequence:**
1. **RTD-006:** Record **current** `main` SHA and inspect actual live Vercel `release.json`/audio/browser baseline; do not carry forward stale deployments from a merged PR.
2. **RTD-007/008:** Coordinate ownership and write acceptance criteria that target real gameplay, not only 2D preview.
3. **RTD-009–021:** Extend/compose **existing** recorded UI through pure data/schema/graph logic, instead of replacing it.
4. **RTD-022–041:** Read facts from real Expedition/social/TownLife and use authorised, idempotent quest effects, opt-in memory and safe export migration.
5. **RTD-042–055:** Validate full cast/clip transcripts/hashes; use Game300 and #164-approved additions only when voice and script can be proven exactly. No regenerating already owned assets.
6. **RTD-068–080:** Rowan, Kit, Pip pilot before other cast and household expansion.
7. **RTD-081–093:** Fully test interactions, offline/mobile/audio, release only approved SHA, verify canonical Vercel and generated mirror.

### Overlap/external tracker maintenance

- Preserve audio **006 checked** and **007–013/040–048 unchecked**. The mirror's open “merge PR #165” subtask is stale: #165 *did* merge on 24 October 2026; the resulting **task 007 remains open** pending final live proof. Update the *audio tracker owner* rather than hand-edit the generated Pages repository.
- `WORK_CHECKPOINT.md` older `RT-08` bundles **merge** (already done for #166) plus **verified production deployment** (still unconfirmed); keep it unchecked and explain split evidence.
- `WORK_CHECKPOINT.md` older `RT-09` includes casting + new MP3 generation for remaining NPCs; inventory only is covered by RTD-003; leave actual casting and generation unchecked.
- `COORDINATION.md` contains historical “INTEGRATING PR #166” entries; these are **historical** and should be annotated as merged, not mistaken for active ownership.
- Preserve the [source population inventory](NPC_POPULATION_INVENTORY_2026-10-24.json): Rowan the street character is not automatically the worker also named Rowan, and the 188 house aliases are not independently full-day simulated actors.

## RTD-005 completion evidence and limitations

Audited GitHub PR metadata and patches for #165, #166 and still-open #164, source modules `src/ui/recorded-dialogue.js`, `npc-chat.js`, `voicebank.js`, relevant CSS/tests, prior `WORK_CHECKPOINT.md`, generated-mirror Town task tracker and VoiceBank master 001–048. Wrote this explicit status/dependency crosswalk to avoid duplicated and reverted work. **No implementation task 006–093, no global audio task and no deployment acceptance is newly completed by this documentation-only reconciliation.**

**Task RTD-005 is complete when this document and the corrected roadmap/checkpoint are merged into canonical main.** Working doc branch: `docs/town-rtd005-audio-branch-reconciliation-20261024`.
