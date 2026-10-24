# RTD-004 — NPC dialogue, speech, town yarns, game state and save audit

**Date:** 24 October 2026, Australia/Sydney.  
**Status:** **SOURCE AUDIT COMPLETE**; no runtime change, 3D playtest, new recording, full release or deployment is claimed.  
**Canonical repository:** `joshualparris/JoshMemory/repository-town/` on `main`.  
**Source baseline:** [main commit `69a12ee`](https://github.com/joshualparris/JoshMemory/commit/69a12eea14fa706c605943f98e300f1f263377d2).  
**Task:** [RTD-004](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md); deliberately does **not** cover Replit's possible RTD-003 population inventory or satisfy RTD-005 PR reconciliation.  
**Method:** Read the full listed modules from the GitHub canonical repository and inspect relevant integration/save functions. All statements below are code-level findings, not live-behaviour assertions.

## 1. Current execution paths

### A. Player interacts with one of 32 named roaming characters
`src/main.js` imports `mountNPCChat` and `placeTownNPCs`. An actual nearby NPC interaction calls `npcChat.show(nearNPC.npc,null)` (near the interaction loop), while the NPC roster can also call `show`. [Source: main.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/main.js).

`src/ui/npc-chat.js` uses `NPCS`/`getNPC`, `makeTownRecordedConversation`, `makeTownListenButton` and `makeTownContextCue`. Opening a character stops earlier audio and cancels an earlier AI request; the same modal offers predefined suggestion prompts, optional offline quiz challenges, recorded dialogue and a separate freeform chat form. [Source: npc-chat.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/npc-chat.js).

**Recorded branch:** `src/ui/recorded-dialogue.js` exports `RECORDED_DIALOGUE_BRANCHES`, `RECORDED_DIALOGUE_EVENTS` and `makeTownRecordedConversation`. Current shared stages are `start`, `topics`, `advice`, `explore`, `stories`, `goodbye`; each choice has `label`, optional `event` and `next`. The same graph is shown to all eligible voiced actors; `makeTownRecordedConversation` returns `null` for actors without an approved `greeting`. State variables (`stage`, `last`, `token`, `ready`, `closed`, `playing`) are local to the mounted component. [Source: recorded-dialogue.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/recorded-dialogue.js).

**Freeform:** Questions first check real nearby room objects with `answerSceneQuestion`; other requests POST recent text history to the existing Cloudflare NPC chat endpoint with abort handling and an offline fallback. The freeform answer is *not* automatically the content of the prerecorded event sound; contextual `greeting` and `help` buttons offer a separate clip, and the exact Rowan welcome has its own approved voice pack. Freeform chat history is kept in a per-tab `Map` keyed by actor and house context. [Source: npc-chat.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/npc-chat.js).

**Offline quizzes:** The named NPC challenge/badge mechanism lives in `npc-chat.js`, and badge IDs are stored in `repository-town:npc-badges:v1`; it is separate from the generic recorded dialogue graph and the Expedition Guild's relic logic.

### B. House residents and walking workers use another dialogue UI
`src/main.js` opens `npcBehaviour` from `src/ui/npc.js` for house residents and villagers. `npc.js` builds room, house, town, social, NPC location and nearby-scene facts, then uses grounded answers, an existing AI proxy or scripted replies. Its message history is a separate localStorage object `repository-town.npc-chats`; its player-social interactions go through `src/ui/social.js`. This UI currently uses `toggleTownVoice` for a general Listen button, not the named-cast choice graph. [Source: npc.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/npc.js).

**Design implication:** Named characters, simulation villagers and generated house residents do not yet share a single dialogue state/controller or identity policy. Do **not** remove the more detailed villager/house grounded answers while introducing a shared director.

### C. NPC-to-NPC town conversations
`src/world/life.js` records confirmed work/visit/venue encounters via `recordSocialEvent` (among other simulation operations). `src/world/social-events.js` stores a bounded `social` structure with relationships, encounter memories and last encounters; `makeYarn` in `src/world/yarn-dialogue.js` creates deterministic offline four-line exchanges selected from templates by participants, place/event kind and time. `src/ui/yarns.js` displays recorded event lines from `life.social.events` with speaker labels and optional listening. [Sources: life.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/world/life.js), [social-events.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/world/social-events.js), [yarn-dialogue.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/world/yarn-dialogue.js), [yarns.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/yarns.js).

**Important distinction:** Simulation-recorded event + author-generated text does not mean an actual ElevenLabs file exists for that exact text. This system is an excellent factual feed for unlocking later player dialogue, but it cannot be assumed prerecorded.

## 2. Voice sources and transport

| Source | Actual implementation | Constraint |
|---|---|---|
| Specific Rowan welcome | `voicebank.js` uses `/packs/town-rowan/manifest.json` through VoiceBank browser loader | Exact verified text only; no disguised device speech |
| Game300 named cast | Dynamic import of `https://parris-voicebank.vercel.app/src/game300.js`; `playTownRecordedEvent('repo_town',actor,event)` | 10 approved named actors and event names; actor/event presence is not equivalent to a specific quest transcript |
| General Listen button | `toggleTownVoice` tests exact recording coverage; otherwise uses visibly labelled en-AU device speech | Never describe arbitrary AI text as genuine ElevenLabs audio |
| NPC yarn Listen | `ui/yarns.js` uses the shared `makeTownListenButton` | Actual unrecorded conversation lines may use device speech |
| Audio cancellation | `stopTownVoice` stops current recording/player and system speech, increments revision; `playTownRecordedEvent` guards late captions/end callbacks | Reuse this authority instead of adding an independent engine |

Sources: [voicebank.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/voicebank.js), [recorded-dialogue.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/recorded-dialogue.js), [VoiceBank Game300 player](https://github.com/Parris-Tech-Services/ParrisVoiceBank/blob/main/src/game300.js).

**Limit to verify later:** The current recorded-graph buttons depend on an imported player module becoming ready; readiness is distinct from a successful ZIP download, decode, caption match or actual click-driven audio. That full behaviour belongs to the playtest tasks, not this source inventory.

## 3. Existing state ownership and persistence — DO NOT CONFLATE

| State owner | Where / key | Currently persisted? | Dialogue integration note |
|---|---|---|---|
| Player position/view | `src/engine/save.js`: `repository-town.save.v2` | Yes; localStorage and transfer allowlist | Not the owner of NPC memories |
| Living town simulated jobs, villagers, money, social events | `src/world/townlife.js` wraps `TownLife.snapshot()/restore()` under `repository-town.life.v1` | Yes; versioned save and restore | Use as authoritative source for time, actual work, money, factual resident encounters |
| Expedition Guild relics, visits | `src/adventure/data.js` / `expedition.js`: `repository-town.expedition.v1` | Yes; progress key | Only the expedition action should award/advance relics |
| Local-first relationships/player trust | `src/ui/social.js`: `repository-town.social.v1` | Yes; separately versioned | Not the same object as `TownLife.social`; reconcile deliberately |
| Errands | `src/ui/npc.js`: `repository-town.errands.v1` | Yes; transfer allowlist | Use verified completion before reward/success line |
| Named NPC quiz badges | `src/ui/npc-chat.js`: `repository-town:npc-badges:v1` | Yes; transfer allowlist | Quiz outcome != recorded graph state |
| Named NPC freeform text conversation | `src/ui/npc-chat.js`: in-memory `Map` | Only current tab/session | Does not survive reload; no consent to export raw text |
| House/worker freeform chat text | `src/ui/npc.js`: `repository-town.npc-chats` | Locally yes, but intentionally **not** exported | Privacy safeguard; do not add blindly to transfer |
| Recorded dialogue choice stage | `src/ui/recorded-dialogue.js`: component-local `stage` | No | Reopens at `start`, not a remembered quest stage |
| Simulated encounter logs/relationship memories | `TownLife.social` restored by `restoreSocialState` | Yes, in life snapshot | Event provenance can drive truthful topic unlocks |

Relevant code: [engine/save.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/engine/save.js), [townlife.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/world/townlife.js), [life.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/world/life.js), [social-events.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/world/social-events.js), [ui/social.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/social.js), [npc-chat.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/npc-chat.js), [npc.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/ui/npc.js), [adventure/expedition.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/adventure/expedition.js), [save-transfer.js](https://github.com/joshualparris/JoshMemory/blob/69a12eea14fa706c605943f98e300f1f263377d2/repository-town/src/engine/save-transfer.js).

`src/engine/save-transfer.js` uses an explicit export/import `SAVE_KEYS` allowlist. It includes player, life, expedition, social, errands, badges and preferences, and excludes raw chat text and other unrelated storage. Any future dialogue-memory key requires deliberate schema validation, privacy review, import/export migration and size limits; don't silently change this allowlist.

## 4. Findings / recommended integration seams (not implemented)

| Audit finding | Priority / existing task IDs | Safe next action |
|---|---|---|
| One shared six-stage recorded graph for all eligible actors; no per-actor world conditions, side effects or topic priorities | P1 · RTD-009, 011–017, 022–025 | Build a pure actor-keyed data-driven director, preserving current graph as compatible baseline |
| Recorded branch stage is temporary; NPC quizzes and Guild progress persist separately | P1 · RTD-033–041 | Store only necessary versioned *gameplay* flags with migration, not raw freeform chat |
| Town social `life.social` and local `ui/social.js` are separate state stores | P1 · RTD-034, 066+ | Make a read-only fact adapter first, then define ownership for changes to avoid double bookkeeping |
| Recorded event names are broad but game-state actions require precise outcomes | P0 · RTD-024–032, 045–048 | Attach completed-success audio only after committed authoritative gameplay transaction |
| Named/house/villager chat interfaces have different identity, history, grounding and audio paths | P1 · RTD-010, 057–067 | Unify the *dialogue orchestration interface* rather than replacing location-grounded answers |
| Yarn text is a simulation event, not automatically a matching recorded clip | P1 · RTD-066+ | Use verified event provenance for player topic eligibility; generate voice only for explicitly approved authored replies |
| Save-transfer deliberately excludes text chat | P0 · RTD-036–040, 093 | Preserve privacy boundary and verify new keys before exporting |
| Shared WebAudio module and cancellation logic already present, browser-tested in prior PR #166 | Preserve · RTD-042–055 | Reuse existing `stopTownVoice` and clip captions; don't add a parallel sound player |
| Need to distinguish script existence, clip reachability, real decoding, live deployment and actual gameplay consequence | P1 · RTD-081–093 | Use distinct evidence gates in test/CI and actual production checks |

## 5. Tests already present / tests NOT performed by this audit

Relevant committed test files include `tests/recorded-dialogue.mjs`, `tests/recorded-dialogue-browser.mjs`, `tests/voicebank.mjs`, `tests/npc-context-cues.mjs`, `tests/npc.mjs`, `tests/npc-scene-awareness.mjs`, `tests/npc-house-dialogue.mjs`, `tests/social-events.mjs`, `tests/social.mjs`, `tests/expedition.mjs`, `tests/npc-soak.mjs`, `tests/town-simulation.mjs` and `tests/work-save.mjs`. Package scripts already include `test:release` and `build:release`, which contain actual test/build/privacy gates. Prior merged [PR #166](https://github.com/joshualparris/JoshMemory/pull/166) carries separate browser/audio test evidence.

This RTD-004 task was a **read-only source audit** and documentation update: no local runtime, automated suite, private handset or deployed speech was run in this task. Those implementation acceptance requirements remain open. Its documentation can be safely reviewed/merged without changing runtime behaviour.

## 6. Handover

- **RTD-003**: left untouched and unchecked. Josh reported Replit *may* be doing the actor inventory; ownership was not independently verified in Replit, so do not take over without checking.
- **RTD-004**: this pinned source audit is the evidence. It can be checked complete after committed publication.
- **RTD-005**: next safe non-overlapping work is reconciling PR #166 and the current audio tracker against the audit. That is a separate task, not silently included here.
- **Implementation after coordination:** design a read-only fact adapter and per-actor graph contract; gate effects on real simulation mutations; preserve exact caption/clip and exported-save privacy boundaries.
- The generated `Parris-Tech-Services/Repository-town` mirror must not be directly edited.

**Audit acceptance:** Full intended source paths inspected; actual call flows and state keys documented; safe extension seams named; risks separated from observed proof; no source modifications, voice generation or deployment claimed.
