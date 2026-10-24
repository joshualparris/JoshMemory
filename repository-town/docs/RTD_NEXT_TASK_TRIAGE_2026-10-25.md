# Repository Town — numbered follow-up triage after RTD-009

**Updated:** 25 October 2026 (Australia/Sydney)  
**Canonical source:** [RTD-001–093 numbered checklist](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md)  
**Parent project tracker:** [JoshMemory numbered outstanding work](../../docs/OUTSTANDING_WORK_2026-10-24.md)  
**Scope of this document:** Navigation and priority only. **No RTD IDs or statuses have been changed.**  
**Current verified roadmap status at audit:** RTD-001–009 checked; RTD-010–093 open (84 tasks).  
**Next agent to start:** **RTD-010**. First read [RTD-007 owner/checkpoint instructions](RTD_007_COORDINATION_CHECKPOINT_PROTOCOL_2026-10-24.md), check real open PRs and claim that exact task on `COORDINATION.md`. Do not claim implementation merely because this ranking is published.

## Exact answer: which existing numbers cover the unfinished work mentioned after RTD-009?

| Previously mentioned item | Pre-existing unique RTD identifiers | First actionable item |
|---|---|---|
| NPC identities across 32 named characters, 99 simulated workers and 188 resident slots | **RTD-010** (implement namespaced stable keys; inventory RTD-003 is already checked); related actor-memory safety RTD-033–035 and RTD-078 | RTD-010 |
| Deterministic dialogue director and graph correctness | **RTD-011**, **RTD-012**, **RTD-021**, **RTD-080** (depends on completed schema RTD-009) | RTD-011 after 010 |
| Player choices, context, topic priorities and mobile-safe flow | **RTD-013–020**, **RTD-056–062**, **RTD-084–085** | RTD-013 once director/graph work is safe |
| Real quests, payments, repairs, negative outcomes and truthful results | **RTD-022–032**, **RTD-069**, **RTD-071**, **RTD-073**, **RTD-081** | RTD-022 |
| Per-NPC memories, persistence, save compatibility and privacy | **RTD-033–041**, **RTD-066**, **RTD-079** | RTD-033 |
| Original ElevenLabs clip mapping, 22 missing voices, distinct cast, reliable audio | **RTD-042–055**, **RTD-070**, **RTD-072**, **RTD-074**, **RTD-076–078**, **RTD-082–083** | RTD-042 |
| Real character-specific Rowan/Kit/Pip encounters with 3D walk-up and repeat visits | **RTD-069–075**; seeded context RTD-067–068; full desktop/Android journeys RTD-084–086 | RTD-067 before pilots |
| Optional AI separation and clean conversation UI | **RTD-056–066**, plus audio cancellation RTD-018/050 and guardrails RTD-024/064 | RTD-056 |
| End-to-end testing, release, hosting, fingerprint parity and incomplete evidence | **RTD-080–093** (especially 084–093). Existing production QA evidence is not automatically acceptance for future quest/memory features. | RTD-080 early; RTD-087–093 at release |

**All these items already have unique identifiers.** The priority order below is an **execution order**, not a new numbering system; the permanent primary keys remain `RTD-NNN`. Do not renumber RTD or TASK identifiers. Some test/release tasks intentionally run during earlier stages rather than only at the end (especially RTD-080–083, RTD-087–088).

## Suggested execution order for all 84 outstanding RTD items

### 1. Identity, deterministic director and graph integrity (P0)

**Exit condition:** Distinct actor keys and typed graph compile and reject malformed/unsafe conditions; tests are repeatable without browser/network.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 1 | **RTD-010** | Use stable actor keys across named creatures, workers, households and house residents; names alone are not identifiers. | Open |
| 2 | **RTD-011** | Implement pure deterministic DialogueDirector separate from DOM, Three.js, voice playback and remote AI. | Open |
| 3 | **RTD-012** | Validate missing next nodes, duplicate IDs, unreachable nodes, dead ends, illegal cycles and actors at test/build time. | Open |
| 4 | **RTD-021** | Add pure Node contract tests and structured fixtures for the dialogue schema and state machine. | Open |
| 5 | **RTD-080** | Add schema and graph unit tests covering every condition, actor, branch link and fallback path. | Open |

### 2. Conversation behaviour and accessible player controls (P1)

**Exit condition:** The current NPC is selectable on desktop/mobile, availability is true, replay/exit/cancellation work, and offline authored dialogue remains usable.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 6 | **RTD-013** | Implement topic categories: introductions, news, directions, work, relationships, quests, trade, help, farewell. | Open |
| 7 | **RTD-015** | Filter available player options by positive and negative predicates, with explicit unknown-state behaviour. | Open |
| 8 | **RTD-016** | Add dialogue priority and optional/repeatable/cooldown topics to prevent repetitive greetings. | Open |
| 9 | **RTD-014** | Implement per-NPC greetings for first meeting, repeat encounters and conditional return visits. | Open |
| 10 | **RTD-017** | Support topic history, nested choices, back/change subject, replay, goodbye and early dismissal. | Open |
| 11 | **RTD-018** | Cancel stale branches on NPC switch, walk-away, modal close, screen navigation or re-entry. | Open |
| 12 | **RTD-019** | Support safe dynamic captions with substitutions; NEVER claim recorded audio speaks substituted words it doesn't. | Open |
| 13 | **RTD-020** | Make offline authored dialogue fully functional even without optional AI. | Open |
| 14 | **RTD-056** | Design responsive NPC portrait/name/title, subtitle panel, choice list, actor voice source and clear exit/back controls. | Open |
| 15 | **RTD-057** | Support touchscreen, desktop mouse and keyboard arrows/numbers/Enter/Escape with predictable focus. | Open |
| 16 | **RTD-058** | Make scene choices readable on Android portrait/landscape and while visual viewport/keyboard changes. | Open |
| 17 | **RTD-059** | Add explicit Hear/Stop/Replay/Retry status and don't play audio automatically before a user gesture. | Open |
| 18 | **RTD-060** | Stop correct active voice on NPC switch/dismissal and prevent stale promises resurrecting old captions. | Open |
| 19 | **RTD-062** | Pause or block game inputs appropriately while in focused dialogue; restore them on close. | Open |

### 3. Authoritative world, quests, repairs, commerce and negative outcomes (P1)

**Exit condition:** Typed allowlisted actions alone change verified game state; failure/cancellation and replay never manufacture a success, reward or transaction.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 20 | **RTD-022** | Expose read-only predicates for time, NPC location, known places, visits, inventory, money, skill/quest stage, jobs and relationships. | Open |
| 21 | **RTD-023** | Connect existing Expedition Guild quest journal and optional named-NPC challenges to topic eligibility. | Open |
| 22 | **RTD-024** | Use allowlisted typed game action IDs; no arbitrary code evaluation or LLM-triggered write operations. | Open |
| 23 | **RTD-025** | Commit quest accept/advance/complete/reward only against authoritative game state. | Open |
| 24 | **RTD-031** | Make effects idempotent across replay, double clicks, reloads and slow network responses. | Open |
| 25 | **RTD-032** | Add negative tests proving failed transactions cannot trigger success captions or success recordings. | Open |
| 26 | **RTD-026** | Make voice success/retry/failure events reflect actual completed actions and distinct outcomes. | Open |
| 27 | **RTD-027** | Wire purchases, repairs and paid work through existing transactions; prevent fabricated/duplicate outcomes. | Open |
| 28 | **RTD-028** | Add negative branches for closed shops, unavailable tools, missing items, insufficient funds and cancelled tasks. | Open |
| 29 | **RTD-029** | Keep hints and directions accurate against actual map coordinates, access rules and opening hours. | Open |
| 30 | **RTD-030** | Separate witnessed NPC events, fictional backstory, rumours and unverified guesses. | Open |
| 31 | **RTD-081** | Test authorised effects, unavailable options, cancelled actions, rapid taps and quest reward idempotency. | Open |

### 4. Per-actor memory, save migration and privacy (P1)

**Exit condition:** Stable NPC-specific continuity survives reload/export/import, excludes private AI text, and never duplicates rewards or memories.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 32 | **RTD-033** | Design per-actor remembered introductions, player topics, promises, favours, relationship changes and confirmed witnessed events. | Open |
| 33 | **RTD-034** | Connect existing social-trust model and conversations, avoiding duplicate or conflicting resident records. | Open |
| 34 | **RTD-035** | Condition return dialogue on observed saved visits and quest progress, never invented memories. | Open |
| 35 | **RTD-036** | Persist schema-versioned dialogue flags within the canonical save/export/import system. | Open |
| 36 | **RTD-037** | Keep private raw AI chats, secrets and sensitive transcripts out of public exports. | Open |
| 37 | **RTD-038** | Provide local-only retention, reset and optional consent controls for richer episodic memory. | Open |
| 38 | **RTD-039** | Migrate old saves and map/remove obsolete NPC/quest node IDs safely. | Open |
| 39 | **RTD-040** | Test reload, export/import, partial saves and repeat reward protection. | Open |
| 40 | **RTD-041** | Test deterministic replay across world seeds and time changes. | Open |

### 5. Authentic ElevenLabs voice manifest, playback and fault recovery (P1)

**Exit condition:** Approved speaker/clip/hash/words are aligned; no borrowed or unearned lines, paid synthesis, overlapping audio or failure-mode crashes.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 41 | **RTD-042** | Export clip-to-actor-to-event manifest for the existing 100 Game300 recordings, ten unique voiced residents and exact VoiceBank ZIP metadata. | Open |
| 42 | **RTD-043** | Verify clip IDs, SHA-256, actual transcription, sound duration, public URL and voice assignment before attaching to graph nodes. | Open |
| 43 | **RTD-044** | Map greeting, help, exploration, ambient, choice, challenge and farewell clips only where actual words fit story context. | Open |
| 44 | **RTD-045** | Gate existing success/retry files behind real quest/repair/result states; generic AI messages must never trigger them. | Open |
| 45 | **RTD-046** | Preserve original clips and distinct character voices; document backup locations in GitHub/VoiceBank and Google Drive. | Open |
| 46 | **RTD-047** | Create a per-character *missing recorded lines* manifest based on implemented branch scripts and scene needs. | Open |
| 47 | **RTD-055** | Cross-link existing audio tracker items 006–013 and 040–048 without double-counting verified tasks. | Open |
| 48 | **RTD-050** | Centralise one-at-a-time speaking, replay, stop, pause, cancellation and modal transitions across chat, recorded dialogue and yarns. | Open |
| 49 | **RTD-051** | Use exact per-recording subtitles and honestly label recordings unavailable rather than silently substitute device speech. | Open |
| 50 | **RTD-052** | Lazy-load packs on interaction and manage cached ZIP/MP3 memory and mobile data consumption. | Open |
| 51 | **RTD-053** | Support voice, ambience, music and effects volume without overlapping or muting essential speech unexpectedly. | Open |
| 52 | **RTD-054** | Validate 404/CORS/invalid archive/audio-context suspension/offline behaviour and ensure no unintended paid ElevenLabs API requests. | Open |
| 53 | **RTD-082** | Test exact clip/actor/manifest caption/hash mapping and zero hidden device-TTS substitutions. | Open |
| 54 | **RTD-083** | Test offline, corrupt MP3/ZIP, CORS errors, 404s, slow bandwidth and interrupted audio. | Open |

### 6. Living NPC context, character pilots, new scripts and cast expansion (P2)

**Exit condition:** Rowan, Kit and Pip complete genuine return visits and outcomes; other cast and new/recorded lines are added only after individual voice/script approval.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 55 | **RTD-067** | Link current NPC routine, work, position, time and real nearby objects to conversation conditions. | Open |
| 56 | **RTD-068** | Surface confirmed worker schedules, open/closed shops and real social yarns without fabricated events. | Open |
| 57 | **RTD-069** | Connect Rowan pilot: greeting, map/tour, visiting a real landmark, return greeting, farewell and saved progress. | Open |
| 58 | **RTD-070** | Assign verified Rowan ElevenLabs clips to exact lines; script/record genuinely missing variants. | Open |
| 59 | **RTD-071** | Connect Kit pilot: repair offer, tools/items, actual start/finish/failure, follow-up and correct reward handling. | Open |
| 60 | **RTD-072** | Assign Kit's real voice clips and verify false-success prevention during failed/cancelled repairs. | Open |
| 61 | **RTD-073** | Connect Pip pilot: dice challenge, actual roll, choice-dependent results, replay and return memory. | Open |
| 62 | **RTD-074** | Assign Pip's actor clips and avoid describing a dice result not produced by the game. | Open |
| 63 | **RTD-075** | Playtest Rowan, Kit and Pip as full walk-up multi-visit conversations in the actual 3D world. | Open |
| 64 | **RTD-079** | Add NPC-NPC overheard encounters as optional truthful topic unlocks with original saved speaker lines. | Open |
| 65 | **RTD-076** | Expand story trees for the other seven voiced actors: Circuit, Wren, Sol, Sage, Spark, Lyra and Nova. | Open |
| 66 | **RTD-048** | Prepare a simple bulk ElevenLabs Google Colab generator with one-run Drive saving and verifiable manifest ingestion, requiring owner-approved voice use. | Open |
| 67 | **RTD-049** | Expand unique suitable cast voices for 22 currently unvoiced named NPCs without mislabelling generic TTS or borrowing another actor's speech. | Open |
| 68 | **RTD-077** | Author trees for remaining 22 named characters, then approve distinct voices and generate/import verified missing lines. | Open |
| 69 | **RTD-078** | Define optional expansion to workers/house residents without claiming those roles already have bespoke recordings. | Open |

### 7. Remaining actor presentation, optional AI and information journal (P2)

**Exit condition:** Authored gameplay remains independent from grounded opt-in AI; reduced-motion scenes and searchable facts have no secret or private-data leaks.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 70 | **RTD-061** | Optionally add NPC eye contact, turning, face/mouth cue and subtle gestures with reduced-motion alternative. | Open |
| 71 | **RTD-063** | Separate authored recorded story conversation from 'Ask anything' Cloudflare AI conversation. | Open |
| 72 | **RTD-064** | Ground AI answers in live simulation/scene state; prohibit model messages from changing quests, money or inventory. | Open |
| 73 | **RTD-065** | Preserve honest offline AI replies and never impersonate prerecorded speakers for arbitrary generated lines. | Open |
| 74 | **RTD-066** | Provide a searchable/compact journal of known topics and dialogue facts, without leaking private repository content. | Open |

### 8. Full interactive acceptance and release across actual hosts (P3)

**Exit condition:** Real browser/3D/audio playtests pass, integration/privacy gate succeeds, staging/production release SHA and generated Pages fingerprint match; unverified items stay open.

| Triage rank (not an ID) | Stable existing task ID | Exact canonical roadmap task | Status |
|---:|---|---|---|
| 75 | **RTD-084** | Playwright desktop/Android: approach, open, choose, play, replay, stop, cancel, swap actor and return. | Open |
| 76 | **RTD-085** | Verify accessibility, keyboard navigation, screen-reader status, touch hit targets and reduced-motion behaviour. | Open |
| 77 | **RTD-086** | Verify gameplay/world movement, entrances, sleep, town events and save/load remain intact. | Open |
| 78 | **RTD-087** | Run focused voice/NPC tests, npm run build:release, privacy gate and relevant whole-town regressions. | Open |
| 79 | **RTD-088** | Review and reconcile active feature branches before merging to shared main; do not overwrite unrelated changes. | Open |
| 80 | **RTD-089** | Deploy approved integration commit to existing staging host and test actual WebAudio/captions/end-to-end quest consequences. | Open |
| 81 | **RTD-090** | Promote only tested commit to canonical Vercel production and verify sourceCommit/contentHash against live release.json. | Open |
| 82 | **RTD-091** | Verify public backup mirror shows same approved release fingerprint; never hand-edit generated mirror. | Open |
| 83 | **RTD-092** | Commit tests, screenshots/logs, clip manifest, resolved checkboxes, coordination and checkpoint evidence. | Open |
| 84 | **RTD-093** | Leave any unimplemented, unfunded, inaccessible or unplaytested acceptance items clearly unchecked. | Open |


## Existing top-level TASK parents: no duplicate identifiers

The global parent tracker contains broader `TASK-032`–`TASK-045` designations. They are **not duplicates** of individual `RTD-NNN` subtasks; retain both IDs and only close a parent after its entire scope is independently accepted.

| Existing top-level task | Mapping to the dialogue roadmap | Completion caution |
|---|---|---|
| **TASK-032** NPC dialogue and contextual triggers | RTD-010–023, RTD-029–030, RTD-067–068, RTD-079–080 | Earlier RTD-003/004 audits checked, but contextual dialogue work open |
| **TASK-033** Remaining ElevenLabs NPC voice assets | RTD-042–055, RTD-070/072/074, RTD-076–078, RTD-082–083 | Approved files ≠ fully integrated with correct outcomes |
| **TASK-034** Overlay and audio mixer collisions | RTD-017–020, RTD-050, RTD-053, RTD-056–062, RTD-084–085 | Merged mobile UI fix does not close every collision/audio acceptance |
| **TASK-035** Quest, shop, trade, NPC end-to-end flow | RTD-023–032, RTD-069–075, RTD-081, RTD-084–086 | Test actual state transitions including failures and repeat rewards |
| **TASK-036** NPC navigation and pathfinding | Related dialogue encounter tests RTD-067, RTD-075, RTD-084, RTD-086 | The broader pathfinding task remains `TASK-036`, not a new RTD |
| **TASK-037/038/039/040** FPS, house interactions, traffic, arcade | These remain global task IDs; not inherently new dialogue RTD work | Keep the original unique TASK numbers and independent acceptance |
| **TASK-041/042** Economy/trades and civic acceptance | Related RTD-027/028, RTD-075/081/086 | Broader systems remain under original TASK parent IDs |
| **TASK-043** Simulation and save migration | RTD-036/039–041, RTD-081/086–087 | Full deterministic world and older saves also remain within TASK-043 |
| **TASK-044** Windows runner CI | Existing original ID TASK-044 only | Do not duplicate as RTD item |
| **TASK-045** Release/version verification | RTD-087–093, particularly RTD-089–091 | Success requires actual tested origin/fingerprint, not a docs-only PR |

## Safe handover instructions

1. Fetch latest `main` and actual `COORDINATION.md` (historical claims can be stale). Next **RTD-010**, unless another current agent has already reserved it.
2. Before any source change, claim only your specific ID, expected paths and exclusions; create a work checkpoint. In particular, review the status of the still-open recorded-audio [PR #164](https://github.com/joshualparris/JoshMemory/pull/164) and concurrent NPC individuality [PR #186](https://github.com/joshualparris/JoshMemory/pull/186) before editing their files.
3. Keep status/checkboxes authoritative in the [original numbered roadmap](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md) and [global TASK master](../../docs/OUTSTANDING_WORK_2026-10-24.md). Do not create shadow checkboxes in the ranking document.
4. Each numbered implementation PR names `RTD-NNN`, matching `RTAC-NNN` acceptance cases, the exact tested SHA, passing/failing evidence, checkpoint and uncovered limitations. Confirm real hosted playtests separately from locally served browser/WebAudio checks.

**Triage review outcome:** 84 ordered rows, 84 distinct existing unfinished RTD identifiers, zero new IDs needed, zero task checkboxes changed. No code, recordings or deployment changes performed.
