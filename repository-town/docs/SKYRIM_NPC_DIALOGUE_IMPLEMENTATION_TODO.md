# Repository Town — Skyrim-inspired NPC dialogue roadmap and numbered TODO

**Status:** Research/plan only; no new feature is considered finished by publishing this document.  
**Date:** 24 October 2026 (Australia/Sydney)  
**Canonical source:** [JoshMemory/repository-town](https://github.com/joshualparris/JoshMemory/tree/main/repository-town)  
**Generated backup — never hand-edit:** [Parris-Tech-Services/Repository-town](https://github.com/Parris-Tech-Services/Repository-town)  
**Relevant merged starting point:** [PR #166 — recorded NPC branching](https://github.com/joshualparris/JoshMemory/pull/166)  
**Coordination:** [WORK_CHECKPOINT.md](../WORK_CHECKPOINT.md) · [COORDINATION.md](../COORDINATION.md) · [Existing Town audio TODO](https://github.com/Parris-Tech-Services/Repository-town/blob/main/AUDIO_INTEGRATION_TODO.md) · [VoiceBank Game300](https://github.com/Parris-Tech-Services/ParrisVoiceBank/blob/main/src/game300.js)

## Target experience

Skyrim-*inspired* actor-specific dialogue branches, priorities, availability conditions, quest stages, player choice consequences, contextual greetings, voice types, ambient NPC-to-NPC scenes, NPC schedules and persistent memory. Use our own characters/recordings, not Bethesda's proprietary dialogue, voices or assets. Keep the experience story-driven and use optional AI only for unexpected free questions.

**Verified existing foundations to preserve:** 32 named street NPCs; 100 Game300 recordings for ten voiced characters (Rowan, Pip, Circuit, Wren, Sol, Sage, Spark, Lyra, Nova, Kit); basic recorded choice branches, some offline NPC challenges, social yarns and living town simulation, plus an existing optional Cloudflare AI path. These do **not** establish Skyrim-level conditional branching, complete story content, deployment or end-to-end 3D playtesting.

**Rules:** The authoritative simulation—not LLM text or a recording—determines quest, repairs, money and inventory. Exact ElevenLabs captions must come from a verified matching clip; never mislabel device TTS or replay generic success for unearned achievements. Preserve mobile performance, offline play and private-repository redaction. Update checkboxes only with committed passing evidence (SHA, tests and actual live playtest for release items). IDs are stable across future chats and PRs.

## Numbered implementation tasks

### Phase 1: Research and architecture

- [x] **RTD-001** Research Skyrim's Creation Kit patterns: topics, TopicInfo, branches, conditions, quest stages, scenes, voice types and NPC schedules; use inspiration, not Bethesda assets.
- [x] **RTD-002** Confirm canonical JoshMemory/repository-town source and generated Parris-Tech-Services/Repository-town mirror; follow AGENTS, COORDINATION and hosting policy.
- [ ] **RTD-003** Inventory all 32 named NPCs, 38 Living Town workers and 188 house-resident slots; distinguish persistent identities from generated resident slots.
- [ ] **RTD-004** Audit existing recorded-dialogue.js, npc-chat.js, npc.js, voicebank.js, town-life yarns, game state and save mechanisms.
- [ ] **RTD-005** Reconcile merged PR #166, its existing choice UI, current checkpoint and audio acceptance tracker; avoid duplicated or reverted work.
- [ ] **RTD-006** Record current main commit, actual deployed release fingerprint, browser/audio test baseline and known limitations.
- [ ] **RTD-007** Reserve ownership on the COORDINATION board before implementation and update WORK_CHECKPOINT after each milestone.
- [ ] **RTD-008** Define the versioned game-specific acceptance checklist and retain RTD task IDs in all implementation PRs.

### Phase 2: Dialogue director and trees

- [ ] **RTD-009** Specify schema for actor, node, player-choice label, priority, conditions, response clip/transcript, next node and authorised effects.
- [ ] **RTD-010** Use stable actor keys across named creatures, workers, households and house residents; names alone are not identifiers.
- [ ] **RTD-011** Implement pure deterministic DialogueDirector separate from DOM, Three.js, voice playback and remote AI.
- [ ] **RTD-012** Validate missing next nodes, duplicate IDs, unreachable nodes, dead ends, illegal cycles and actors at test/build time.
- [ ] **RTD-013** Implement topic categories: introductions, news, directions, work, relationships, quests, trade, help, farewell.
- [ ] **RTD-014** Implement per-NPC greetings for first meeting, repeat encounters and conditional return visits.
- [ ] **RTD-015** Filter available player options by positive and negative predicates, with explicit unknown-state behaviour.
- [ ] **RTD-016** Add dialogue priority and optional/repeatable/cooldown topics to prevent repetitive greetings.
- [ ] **RTD-017** Support topic history, nested choices, back/change subject, replay, goodbye and early dismissal.
- [ ] **RTD-018** Cancel stale branches on NPC switch, walk-away, modal close, screen navigation or re-entry.
- [ ] **RTD-019** Support safe dynamic captions with substitutions; NEVER claim recorded audio speaks substituted words it doesn't.
- [ ] **RTD-020** Make offline authored dialogue fully functional even without optional AI.
- [ ] **RTD-021** Add pure Node contract tests and structured fixtures for the dialogue schema and state machine.

### Phase 3: Authoritative world and quest actions

- [ ] **RTD-022** Expose read-only predicates for time, NPC location, known places, visits, inventory, money, skill/quest stage, jobs and relationships.
- [ ] **RTD-023** Connect existing Expedition Guild quest journal and optional named-NPC challenges to topic eligibility.
- [ ] **RTD-024** Use allowlisted typed game action IDs; no arbitrary code evaluation or LLM-triggered write operations.
- [ ] **RTD-025** Commit quest accept/advance/complete/reward only against authoritative game state.
- [ ] **RTD-026** Make voice success/retry/failure events reflect actual completed actions and distinct outcomes.
- [ ] **RTD-027** Wire purchases, repairs and paid work through existing transactions; prevent fabricated/duplicate outcomes.
- [ ] **RTD-028** Add negative branches for closed shops, unavailable tools, missing items, insufficient funds and cancelled tasks.
- [ ] **RTD-029** Keep hints and directions accurate against actual map coordinates, access rules and opening hours.
- [ ] **RTD-030** Separate witnessed NPC events, fictional backstory, rumours and unverified guesses.
- [ ] **RTD-031** Make effects idempotent across replay, double clicks, reloads and slow network responses.
- [ ] **RTD-032** Add negative tests proving failed transactions cannot trigger success captions or success recordings.

### Phase 4: Memory and social continuity

- [ ] **RTD-033** Design per-actor remembered introductions, player topics, promises, favours, relationship changes and confirmed witnessed events.
- [ ] **RTD-034** Connect existing social-trust model and conversations, avoiding duplicate or conflicting resident records.
- [ ] **RTD-035** Condition return dialogue on observed saved visits and quest progress, never invented memories.
- [ ] **RTD-036** Persist schema-versioned dialogue flags within the canonical save/export/import system.
- [ ] **RTD-037** Keep private raw AI chats, secrets and sensitive transcripts out of public exports.
- [ ] **RTD-038** Provide local-only retention, reset and optional consent controls for richer episodic memory.
- [ ] **RTD-039** Migrate old saves and map/remove obsolete NPC/quest node IDs safely.
- [ ] **RTD-040** Test reload, export/import, partial saves and repeat reward protection.
- [ ] **RTD-041** Test deterministic replay across world seeds and time changes.

### Phase 5: ElevenLabs voices and audio integrity

- [ ] **RTD-042** Export clip-to-actor-to-event manifest for the existing 100 Game300 recordings, ten unique voiced residents and exact VoiceBank ZIP metadata.
- [ ] **RTD-043** Verify clip IDs, SHA-256, actual transcription, sound duration, public URL and voice assignment before attaching to graph nodes.
- [ ] **RTD-044** Map greeting, help, exploration, ambient, choice, challenge and farewell clips only where actual words fit story context.
- [ ] **RTD-045** Gate existing success/retry files behind real quest/repair/result states; generic AI messages must never trigger them.
- [ ] **RTD-046** Preserve original clips and distinct character voices; document backup locations in GitHub/VoiceBank and Google Drive.
- [ ] **RTD-047** Create a per-character *missing recorded lines* manifest based on implemented branch scripts and scene needs.
- [ ] **RTD-048** Prepare a simple bulk ElevenLabs Google Colab generator with one-run Drive saving and verifiable manifest ingestion, requiring owner-approved voice use.
- [ ] **RTD-049** Expand unique suitable cast voices for 22 currently unvoiced named NPCs without mislabelling generic TTS or borrowing another actor's speech.
- [ ] **RTD-050** Centralise one-at-a-time speaking, replay, stop, pause, cancellation and modal transitions across chat, recorded dialogue and yarns.
- [ ] **RTD-051** Use exact per-recording subtitles and honestly label recordings unavailable rather than silently substitute device speech.
- [ ] **RTD-052** Lazy-load packs on interaction and manage cached ZIP/MP3 memory and mobile data consumption.
- [ ] **RTD-053** Support voice, ambience, music and effects volume without overlapping or muting essential speech unexpectedly.
- [ ] **RTD-054** Validate 404/CORS/invalid archive/audio-context suspension/offline behaviour and ensure no unintended paid ElevenLabs API requests.
- [ ] **RTD-055** Cross-link existing audio tracker items 006–013 and 040–048 without double-counting verified tasks.

### Phase 6: Skyrim-style interface and AI boundary

- [ ] **RTD-056** Design responsive NPC portrait/name/title, subtitle panel, choice list, actor voice source and clear exit/back controls.
- [ ] **RTD-057** Support touchscreen, desktop mouse and keyboard arrows/numbers/Enter/Escape with predictable focus.
- [ ] **RTD-058** Make scene choices readable on Android portrait/landscape and while visual viewport/keyboard changes.
- [ ] **RTD-059** Add explicit Hear/Stop/Replay/Retry status and don't play audio automatically before a user gesture.
- [ ] **RTD-060** Stop correct active voice on NPC switch/dismissal and prevent stale promises resurrecting old captions.
- [ ] **RTD-061** Optionally add NPC eye contact, turning, face/mouth cue and subtle gestures with reduced-motion alternative.
- [ ] **RTD-062** Pause or block game inputs appropriately while in focused dialogue; restore them on close.
- [ ] **RTD-063** Separate authored recorded story conversation from 'Ask anything' Cloudflare AI conversation.
- [ ] **RTD-064** Ground AI answers in live simulation/scene state; prohibit model messages from changing quests, money or inventory.
- [ ] **RTD-065** Preserve honest offline AI replies and never impersonate prerecorded speakers for arbitrary generated lines.
- [ ] **RTD-066** Provide a searchable/compact journal of known topics and dialogue facts, without leaking private repository content.

### Phase 7: Living town and character rollout

- [ ] **RTD-067** Link current NPC routine, work, position, time and real nearby objects to conversation conditions.
- [ ] **RTD-068** Surface confirmed worker schedules, open/closed shops and real social yarns without fabricated events.
- [ ] **RTD-069** Connect Rowan pilot: greeting, map/tour, visiting a real landmark, return greeting, farewell and saved progress.
- [ ] **RTD-070** Assign verified Rowan ElevenLabs clips to exact lines; script/record genuinely missing variants.
- [ ] **RTD-071** Connect Kit pilot: repair offer, tools/items, actual start/finish/failure, follow-up and correct reward handling.
- [ ] **RTD-072** Assign Kit's real voice clips and verify false-success prevention during failed/cancelled repairs.
- [ ] **RTD-073** Connect Pip pilot: dice challenge, actual roll, choice-dependent results, replay and return memory.
- [ ] **RTD-074** Assign Pip's actor clips and avoid describing a dice result not produced by the game.
- [ ] **RTD-075** Playtest Rowan, Kit and Pip as full walk-up multi-visit conversations in the actual 3D world.
- [ ] **RTD-076** Expand story trees for the other seven voiced actors: Circuit, Wren, Sol, Sage, Spark, Lyra and Nova.
- [ ] **RTD-077** Author trees for remaining 22 named characters, then approve distinct voices and generate/import verified missing lines.
- [ ] **RTD-078** Define optional expansion to workers/house residents without claiming those roles already have bespoke recordings.
- [ ] **RTD-079** Add NPC-NPC overheard encounters as optional truthful topic unlocks with original saved speaker lines.

### Phase 8: Automated tests, release, deployment and evidence

- [ ] **RTD-080** Add schema and graph unit tests covering every condition, actor, branch link and fallback path.
- [ ] **RTD-081** Test authorised effects, unavailable options, cancelled actions, rapid taps and quest reward idempotency.
- [ ] **RTD-082** Test exact clip/actor/manifest caption/hash mapping and zero hidden device-TTS substitutions.
- [ ] **RTD-083** Test offline, corrupt MP3/ZIP, CORS errors, 404s, slow bandwidth and interrupted audio.
- [ ] **RTD-084** Playwright desktop/Android: approach, open, choose, play, replay, stop, cancel, swap actor and return.
- [ ] **RTD-085** Verify accessibility, keyboard navigation, screen-reader status, touch hit targets and reduced-motion behaviour.
- [ ] **RTD-086** Verify gameplay/world movement, entrances, sleep, town events and save/load remain intact.
- [ ] **RTD-087** Run focused voice/NPC tests, npm run build:release, privacy gate and relevant whole-town regressions.
- [ ] **RTD-088** Review and reconcile active feature branches before merging to shared main; do not overwrite unrelated changes.
- [ ] **RTD-089** Deploy approved integration commit to existing staging host and test actual WebAudio/captions/end-to-end quest consequences.
- [ ] **RTD-090** Promote only tested commit to canonical Vercel production and verify sourceCommit/contentHash against live release.json.
- [ ] **RTD-091** Verify public backup mirror shows same approved release fingerprint; never hand-edit generated mirror.
- [ ] **RTD-092** Commit tests, screenshots/logs, clip manifest, resolved checkboxes, coordination and checkpoint evidence.
- [ ] **RTD-093** Leave any unimplemented, unfunded, inaccessible or unplaytested acceptance items clearly unchecked.

## Example graph contract — illustrative, not a verified recording transcript

```json
{
  "id": "kit.repair.offer",
  "actor": "kit",
  "choice": "Can you help me repair something?",
  "conditions": [{"fact": "repairJob.available", "equals": true}],
  "response": {"clipId": "RT-KIT-HELP", "caption": "from-verified-manifest"},
  "next": "kit.repair.options",
  "effects": []
}
```

Do not publish that illustrative voice mapping until the actual clip words are inspected. Any dynamic text that does not match prerecorded speech must remain clearly separate.

## Acceptance gates

1. **Engine:** All authored graphs load, show only eligible choices and cannot mutate game state except through typed authorised effects. Conditions and save migrations pass tests.
2. **Pilot:** Rowan, Kit and Pip complete full real-world encounters and return visits. All branches work on desktop and Android-sized browsers, audio is genuine/caption-accurate, quests and purchases are truthfully grounded, saves restore correctly.
3. **Scale:** Remaining seven voiced residents have appropriate story trees; 22 additional named residents have distinct approved scripts and voice plans. Voice files only ship when verified/backed up.
4. **Release:** Full `npm run build:release` and privacy gate pass; record verified deployed source SHA, real WebAudio playtest and canonical/backup release fingerprint alignment.

## Ownership, evidence and handover

**Suggested source modules:** Extend `src/ui/recorded-dialogue.js`, `src/ui/npc-chat.js`, `src/ui/npc.js`, `src/ui/voicebank.js`; add pure dialogue state/condition/effects modules under `src/dialogue/`; integrate `src/world/life.js`, existing `src/ui/social.js`, Expedition Guild and canonical save functions without duplicating their state; extend `tests/recorded-dialogue.mjs`, `tests/voicebank.mjs` plus new dialogue/browser tests.

**Tracked research evidence:** RTD-001 and RTD-002 completed as source/design research only. **All other RTD tasks open until implementation evidence is attached.** The merged PR #166 is a foundation, not acceptance of conditional story, quest or rollout tasks.

**Next implementation:** Recheck current main/COORDINATION and PR #166 → start RTD-003 inventory → keep WORK_CHECKPOINT updated throughout → prioritise Rowan, Kit and Pip pilot before other cast → run complete release and live checks before checking deployed items.
