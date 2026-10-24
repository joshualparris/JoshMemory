# MASTER TRIAGE — 20 agent reports, one execution order

**Date:** 25 October 2026 (AEDT)  
**Source:** User-supplied 20-page report PDF and live checked source trackers on GitHub.  
**Authority:** This file is the **cross-project priority entry point**, not a replacement for each repository's canonical checklist or an authorisation to change production.

## The precise next task

> **Rank 00001 — DCSC-GR-001:** Investigate possible API credential exposure in the DCSCompanion browser-side bundle and deployment configuration. This is **a reported risk, NOT a confirmed breach**. Verify the claim using authorised source/build inspection, protect any sensitive values, prevent further unsafe publication and document the result before lower-impact work. If already claimed or access-blocked, record the blocker and advance to the earliest **unclaimed, unblocked** task, beginning at rank 00002.

**Do not jump to `RTN-002`, `RTD-010`, `GM-031.01`, `TR-003.01` or `AUDIO-013.02` as the single portfolio-wide first task.** Those were correct next pointers *within their own workstreams*, not global risk ranking. Their stable IDs remain unchanged.

## Canonical machine-readable order

[**MASTER 20-agent execution queue — 2,663 unique IDs, full ordered CSV**](MASTER_20_AGENT_EXECUTION_QUEUE_2026-10-25.csv)

**Rows 00001–02640** form the actionable/blocked queue, including **45 provider-access blocked Greptile reviews, two physical-device gates and report-intake blockers**. A blocked row retains its priority and an explicit blocker, but must not halt an unrelated eligible task. **Rows 02641–02663** are historical or already-reviewed **reference only**, not a command to repeat work. The `execution_rank` is the definitive cross-portfolio sequence and is different from the permanent `task_id`. Each permanent ID occurs **exactly once**. It is deliberately a *serial sorting rule*, not a claim that one agent can physically execute 2,640 tasks in one session.

Scope totals: 1,864 named `TR-xxx.yy` review subtasks (1,848 open; 16 reference-only), 208 `GRA-xxx` Greptile repo-review IDs (201 queued/provider-blocked; seven prior review/reference), 84 open `RTD-` dialogue tasks, 288 open `SVA-` SylvieApp subtasks, 35 open `GM-` GentleMovement subtasks, and the other distinct P0/P1 production, safety, crowd, lighting, audio and coordination IDs. **These are task/checklist counts, not unique bug counts or proven coding completions.** Review and implementation IDs for the same repository have distinct purposes.

### The first 70 execution positions

| Global rank | Permanent ID | Priority | Next action | Evidence state |
|---:|---|---|---|---|
| 00001 | `DCSC-GR-001` | P0 | Investigate possible client-side API credential and public build inclusion; confirm risk, rotate or revoke affected secret on | BLOCKED_INVESTIGATION |
| 00002 | `DCSC-GR-002` | P0 | Review public DCSCompanion project visibility and school-related knowledge-base authorisation; remove inappropriate public co | BLOCKED_INVESTIGATION |
| 00003 | `DLC-GR-002` | P0 | Investigate potential workplace network details exposure; verify actual rendering and clean exposure without reproducing priv | OPEN |
| 00004 | `GRC-001` | P0 | Route and verify DadLAN network information concern, parent coordination of DLC-GR-002. | OPEN |
| 00005 | `KFO-GR-011` | P0 | Fix possible Kaseya progress/review ID collision; test backward-compatible stored state. | OPEN |
| 00006 | `GRC-002` | P0 | Track Kaseya progress-data repair and Greptile evidence for KFO-GR-011. | OPEN |
| 00007 | `KFO-GR-012` | P1 | Reproduce and repair failing Kaseya browser test or affected feature, then obtain green CI. | OPEN |
| 00008 | `GRC-003` | P1 | Coordinate Kaseya browser regression repair and verify KFO-GR-012. | OPEN |
| 00009 | `RTG-002` | P1 | Restore correct emergency crew availability in Town simulation; focused scenarios. | OPEN |
| 00010 | `RTG-003` | P1 | Correct simulated dispatch/response timing; deterministic tests. | OPEN |
| 00011 | `RTG-004` | P1 | Make earlier investigations accessible through saved state or case selection. | OPEN |
| 00012 | `GRC-004` | P1 | Reconcile source/mirror and verify Repository Town emergency fixes RTG-002/003/004. | OPEN |
| 00013 | `RTN-007` | P0 | Resolve PR #186 conflicts while preserving parallel NPC/lighting/audio work. | OPEN |
| 00014 | `RTN-009` | P1 | Prevent player-initiated NPC overlaps in queues/doors/shops/houses. | OPEN |
| 00015 | `RTN-008` | P1 | Finish unique visual identity across named and household NPC cast. | OPEN |
| 00016 | `RTN-010` | P1 | Playtest crowded pub, shops, rooms and mobile performance/FPS. | OPEN |
| 00017 | `RTN-011` | P0 | Retest reconciled crowd changes with complete release/privacy/collision/browser suites. | OPEN |
| 00018 | `RTN-012` | P0 | Merge verified crowd fixes into canonical main after required checks. | OPEN |
| 00019 | `AUDIO-013.02` | P0 | Identify canonical live release alias, SHA and READY state, not merely PR status. | OPEN |
| 00020 | `AUDIO-013.04` | P0 | Compare live release fingerprint with exact tested source SHA/asset evidence. | OPEN |
| 00021 | `AUDIO-013.03` | P0 | Test actual hosted NPC audio/mobile assets/CORS and dialogue interactions. | OPEN |
| 00022 | `RTM-001` | P1 | In live 3D encounter, opt-in nearby yarns, press X; ensure current event stays dismissed, future ones work. | OPEN |
| 00023 | `AUDIO-045.03` | P1 | Verify mobile touch target/long-caption overflow/Ask AI and interaction prompts at phone sizes. | OPEN |
| 00024 | `RTQ-001` | P1 | Full uninterrupted mobile gameplay acceptance including save/reload, address, NPC, toggle, FPS. | OPEN |
| 00025 | `RTM-002` | P2 | On physical Android verify dialogue HUD, X, preferences, overlay, manual NPC and saved-game safety. | DEVICE_REQUIRED |
| 00026 | `RLT-011` | P1 | Verify pushed lighting branch/source/index and open/advance scoped PR without overwriting main. | OPEN |
| 00027 | `RLT-012` | P1 | Review, pass required checks and merge lighting PR. | OPEN |
| 00028 | `RLT-013` | P1 | Deploy approved lighting release via healthy approved provider. | OPEN |
| 00029 | `RLT-014` | P1 | Verify live lighting source SHA, release fingerprint and assets. | OPEN |
| 00030 | `RLT-015` | P1 | Hosted desktop/mobile night lighting walkthrough for streets, interiors, signs and windows. | OPEN |
| 00031 | `RLT-016` | P1 | Record final lighting release evidence in task/checkpoint/coordination docs. | OPEN |
| 00032 | `RLT-017` | P2 | Physical Android night lighting and sustained FPS, if device available. | DEVICE_REQUIRED |
| 00033 | `RLT-018` | P2 | Verify blackout/restoration through real gameplay, not just circuit unit tests. | OPEN |
| 00034 | `RLT-019` | P3 | Expand lighting audit to remaining actual interiors and share exact coverage. | OPEN |
| 00035 | `AUDIO-010.01` | P1 | Automate open/close/reopen, NPC switch, ten rapid taps, replay and stop in Playwright on desktop and mobile-sized Chrome. | OPEN |
| 00036 | `AUDIO-010.02` | P1 | Confirm playback cancels on modal dismissal, leaving an NPC and switching residents. | OPEN |
| 00037 | `AUDIO-010.03` | P1 | Check no stale promise re-enables the wrong button or starts duplicate WebAudio sources. | OPEN |
| 00038 | `AUDIO-042.02` | P1 | Add a repeat-tap/switch/close stress test that detects overlapping voices or hanging player state. | OPEN |
| 00039 | `AUDIO-010.04` | P1 | Attach browser logs and preserve source/e2e tests as regression protection. | OPEN |
| 00040 | `RTR-009` | P1 | Run release build, privacy gate and existing Town simulation/NPC/game/arcade browser suites against reviewed source. | OPEN |
| 00041 | `RTR-015` | P1 | Publish only the sanitised approved release and verify Vercel, staging and mirror source/content fingerprints. | OPEN |
| 00042 | `AUDIO-013.01` | P1 | Identify canonical Town source as 'joshualparris/JoshMemory/repository-town', not the similarly named mirror. | OPEN |
| 00043 | `RTD-010` | P1 | Use stable actor keys across named creatures, workers, households and house residents; names alone are not identifiers. | OPEN |
| 00044 | `RTD-011` | P1 | Implement pure deterministic DialogueDirector separate from DOM, Three.js, voice playback and remote AI. | OPEN |
| 00045 | `RTD-012` | P1 | Validate missing next nodes, duplicate IDs, unreachable nodes, dead ends, illegal cycles and actors at test/build time. | OPEN |
| 00046 | `RTD-021` | P1 | Add pure Node contract tests and structured fixtures for the dialogue schema and state machine. | OPEN |
| 00047 | `RTD-080` | P1 | Add schema and graph unit tests covering every condition, actor, branch link and fallback path. | OPEN |
| 00048 | `RTD-013` | P2 | Implement topic categories: introductions, news, directions, work, relationships, quests, trade, help, farewell. | OPEN |
| 00049 | `RTD-015` | P2 | Filter available player options by positive and negative predicates, with explicit unknown-state behaviour. | OPEN |
| 00050 | `RTD-016` | P2 | Add dialogue priority and optional/repeatable/cooldown topics to prevent repetitive greetings. | OPEN |
| 00051 | `RTD-014` | P2 | Implement per-NPC greetings for first meeting, repeat encounters and conditional return visits. | OPEN |
| 00052 | `RTD-017` | P2 | Support topic history, nested choices, back/change subject, replay, goodbye and early dismissal. | OPEN |
| 00053 | `RTD-018` | P2 | Cancel stale branches on NPC switch, walk-away, modal close, screen navigation or re-entry. | OPEN |
| 00054 | `RTD-019` | P2 | Support safe dynamic captions with substitutions; NEVER claim recorded audio speaks substituted words it doesn't. | OPEN |
| 00055 | `RTD-020` | P2 | Make offline authored dialogue fully functional even without optional AI. | OPEN |
| 00056 | `RTD-056` | P2 | Design responsive NPC portrait/name/title, subtitle panel, choice list, actor voice source and clear exit/back controls. | OPEN |
| 00057 | `RTD-057` | P2 | Support touchscreen, desktop mouse and keyboard arrows/numbers/Enter/Escape with predictable focus. | OPEN |
| 00058 | `RTD-058` | P2 | Make scene choices readable on Android portrait/landscape and while visual viewport/keyboard changes. | OPEN |
| 00059 | `RTD-059` | P2 | Add explicit Hear/Stop/Replay/Retry status and don't play audio automatically before a user gesture. | OPEN |
| 00060 | `RTD-060` | P2 | Stop correct active voice on NPC switch/dismissal and prevent stale promises resurrecting old captions. | OPEN |
| 00061 | `RTD-062` | P2 | Pause or block game inputs appropriately while in focused dialogue; restore them on close. | OPEN |
| 00062 | `RTD-022` | P2 | Expose read-only predicates for time, NPC location, known places, visits, inventory, money, skill/quest stage, jobs and relat | OPEN |
| 00063 | `RTD-023` | P2 | Connect existing Expedition Guild quest journal and optional named-NPC challenges to topic eligibility. | OPEN |
| 00064 | `RTD-024` | P2 | Use allowlisted typed game action IDs; no arbitrary code evaluation or LLM-triggered write operations. | OPEN |
| 00065 | `RTD-025` | P2 | Commit quest accept/advance/complete/reward only against authoritative game state. | OPEN |
| 00066 | `RTD-031` | P2 | Make effects idempotent across replay, double clicks, reloads and slow network responses. | OPEN |
| 00067 | `RTD-032` | P2 | Add negative tests proving failed transactions cannot trigger success captions or success recordings. | OPEN |
| 00068 | `RTD-026` | P2 | Make voice success/retry/failure events reflect actual completed actions and distinct outcomes. | OPEN |
| 00069 | `RTD-027` | P2 | Wire purchases, repairs and paid work through existing transactions; prevent fabricated/duplicate outcomes. | OPEN |
| 00070 | `RTD-028` | P2 | Add negative branches for closed shops, unavailable tools, missing items, insufficient funds and cancelled tasks. | OPEN |

## Workstream spans in the exact queue

These spans are **inclusive** and occasionally interleaved at dependency gates; consult the CSV rank as the final tie-breaker.

| Priority stage | CSV ranks | Purpose / authoritative source |
|---|---|---|
| Security, integrity and emergency-simulation investigation | 00001–00012 | `DCSC-GR-001/002`, `DLC-GR-002`, Kaseya `KFO-GR-011/012`, `RTG-002..004` and GRC coordination; do not imply confirmed data exposure |
| Crowd source reconciliation, collisions, tested candidate | 00013–00018 | `RTN-007` first, then `RTN-009/008/010/011/012`; [canonical RTN 18-task tracker](../repository-town/docs/RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md) |
| Production dialogue, mobile actual yarn X and settings | 00019–00025 | `AUDIO-013.02/04/03`, `RTM-001`, `AUDIO-045.03`, `RTQ-001`, physical `RTM-002`; [Agent 1's scoped queue](../repository-town/docs/NEXT_ACTION_TRIAGE.md) |
| Lighting release and mobile/night regression | 00026–00034 | `RLT-011..019`. `RLT-008..010` already source/test checked; [live stable-ID registry](../repository-town/docs/UNNUMBERED_TODO_IDS_2026-10-24.md) |
| Voice/mixer safety and production release gates | 00035–00042 | Existing `AUDIO-010`, `AUDIO-042`, `RTR-009/015` IDs |
| Deterministic NPC dialogue foundation, authentic voices, quests, AI boundary, full release | 00043–00126 | All **84** open `RTD-010..093` in [RTD dependency ranking](../repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md), with `RTD-010/011/012/021/080` first |
| Remaining Town crowd, audio, arcade, release, plots and fictional council follow-through | 00127–00223 | Source [Town stable-ID register](../repository-town/docs/UNNUMBERED_TODO_IDS_2026-10-24.md); `RTA-001..007`, `RTP-001/002`, `RTC`, `RTR`, `RTL` |
| GentleMovement precise recorded-audio and real-time session acceptance | 00224–00258 | All **35** open `GM-` subtasks; start `GM-031.01`; [VoiceBank index](https://github.com/Parris-Tech-Services/ParrisVoiceBank/blob/main/docs/GENTLE_MOVEMENT_AUDIO_TASK_INDEX.md) |
| SylvieApp original recordings, autoplay, narration coverage, mobile/offline acceptance | 00259–00546 | **288** unchecked `SVA-` detailed tasks; [SylvieApp own checklist](https://github.com/Parris-Tech-Services/SylvieApp/blob/main/docs/SYLVIE_FULL_AUDIO_INTEGRATION_CHECKLIST_2026-10-24.md). Earlier key Cloudflare browser checks passed but full clip-by-clip/audio-listening coverage remains unverified |
| Remaining provider findings / coordinating audit work / BucklandBlocks | 00547–00572 | 14 reported Greptile P2 findings, outstanding `GRC` orchestration, `BKG-002..005`; [RepoClean audit](https://github.com/Parris-Tech-Services/RepoClean/blob/antigravity-push/docs/GREPTILE_PORTFOLIO_REVIEW_QUEUE_2026-10-24.md) |
| SylvieApp broader global parents and missing-report intake | 00573–00591 | `TASK-001..012` umbrella acceptance; `ARI-001/005/007/011/012/015/019` report reconciliation |
| Remaining Greptile repo-review and portfolio-wide review jobs | 00592–02640 | **201 queued/blocked GRA** jobs + **1,848 open TR** steps, in original ID order, without exposing private repository names |
| Historical / previously-reviewed reference IDs — **do not execute again** | 02641–02663 | Seven previous Greptile review IDs (finding repairs still separately open) and the first 16 historical `TR-` review-step references |

The priority order is **risk first, dependency second, stable source sequence third**. A P1 or P2 item can legitimately appear in front of a different programme's P0-scoped item when the latter has an uncompleted prerequisite or is a distinct roadmap rather than a currently exploitable production problem. The CSV records the exact serial rank. Do not interpret it as task severity certification.

## Canonical ID reconciliation — Agent 2 vs Agent 4

The two agents reused `RTN-001/002/003` for incompatible meanings. **That ambiguity is corrected in the central [Town ID register](../repository-town/docs/UNNUMBERED_TODO_IDS_2026-10-24.md):**

| Agent 2's former label | Intended scope | Authoritative execution IDs |
|---|---|---|
| `RTN-001` (former Agent 2 meaning) | Unique NPC appearance | `RTN-001` is the source-level foundation; unfinished extension **`RTN-008`** |
| `RTN-002` (former Agent 2 meaning) | Body merging, queue/crowd collisions | Existing `RTN-003/004`, unfinished **`RTN-009/010`** |
| `RTN-003` (former Agent 2 meaning) | Indoor wall/furniture/door clipping | **`RTN-009`** and `RTR-010` house/entry acceptance |

The [canonical 18-task RTN implementation tracker](../repository-town/docs/RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md) wins for current status: `RTN-001..006` checked at **source/testing only**, `RTN-007..018` open. Agent 2's PDF terminology is retained as historical evidence, **not new independent task rows**. Separate `RTQ-001`, `RTP-001/002` remain unique permanent IDs.

Other overlaps: Agents **13 and 14** independently submitted the same `RTD-` roadmap; their recommendations count **once**. Agent 1's `RTD-050/060` are within the single 84-item RTD scope; parent `TASK-034/040/045` are **umbrella acceptance**, not additional bugs. `TR-` repo triage and `GRA-` Greptile PR reviews remain separate workflows, not duplicate repair tickets. Greptile coordination `GRC-` and source finding `DLC-GR/KFO-GR/RTG-` are separate coordination vs fix responsibilities.

## Agent reports — disposition for all 20 slots

| Agent | Verified/reported contribution | Master queue treatment |
|---|---|---|
| 1 | 22 audio/mobile/arcade follow-ups; 2 new RTM IDs; merged PR #191 | Reused existing per-task IDs; live acceptance remains open |
| 2 | 10 reported NPC/mobile/plot tasks; PR #195 reported merged | Corrected conflicting RTN aliases; `RTQ-001`, `RTP-001/002` preserved |
| 3 | 19 lighting IDs; PDF said unable to push | **Newer GitHub registry supersedes PDF:** RLT-008..010 source/test checked; RLT-011 next |
| 4 | Canonical 18 RTN crowd IDs, first six source-tested, PR #186 conflict | `RTN-007` next; source pass != live deployment |
| 5 | Blocked, no substantive task detail supplied | `ARI-005` request scoped handoff; no invented feature |
| 6 | 84 open RTD tasks ordered after nine checked; merged PR #192 | 84 precise existing IDs, starting RTD-010 |
| 7 | In progress, no finished deliverable supplied | `ARI-007` awaiting final verified handoff |
| 8 | 233 repository triage parents / 1,864 TR subtasks | 1,848 open; 16 historical reference; private identities remain redacted |
| 9 | 6 reported P1 and 14 reported P2 Greptile findings; GRC 12; Buckland BKG 5 | Reused finding IDs, programme IDs, four open BKG IDs; review does not mean fix |
| 10 | 55 GentleMovement subtasks, 20 checked, 35 open | All 35 open `GM-` queue IDs; starts GM-031.01 |
| 11 | Blocked, no details | `ARI-011` blocked handoff recovery |
| 12 | In progress, no final details | `ARI-012` follow-up |
| 13 | NPC ElevenLabs integration order, RTD IDs | Mapped to canonical RTD IDs, no duplicates |
| 14 | Identical RTD voice integration order | Deduplicated against 13 |
| 15 | Looking for ElevenLabs recordings, no completed manifest | `ARI-015`: obtain and reconcile actual asset evidence |
| 16 | Limited successful SylvieApp autoplay/welcome/breathing controls at reported Cloudflare build `f582da1` | Existing unchecked `SVA-` tasks remain; browser state not proof of every MP3 audio signal |
| 17 | DCSCompanion: P1 possible client-key/visibility risks; P2 networking-cards findings | `DCSC-GR-001/002` investigative first; `003/004` P2; no confirmed breach claimed |
| 18 | SylvieApp recording-error/autoplay concerns; three URLs reachable but audio unverified then | Same Sylvie SVA IDs; later Agent 16 reports narrower passing controls, no global sound signoff |
| 19 | Work broken, no traceable deliverable | `ARI-019` request exact blocker and source |
| 20 | Reminder and personal physiotherapy guidance, not an engineering audit | **Excluded from public software repository**; no sensitive personal health content copied |

Agent 21 is an **empty trailing heading** in the attachment, not a submitted report and not an additional verified task.

## Agent-report follow-up IDs minted during consolidation

[Permanent ARI report-intake task register](MASTER_AGENT_REPORT_INTAKE_IDS_2026-10-25.md).

`ARI-001` records the RTN-label reconciliation, and `ARI-005`, `ARI-007`, `ARI-011`, `ARI-012`, `ARI-015`, `ARI-019` are **unique source-report recovery IDs**. They do **not** authorise imagined coding tasks or mark incomplete agent work finished. Existing source IDs were preserved and no previously checked task was reset.

## Action contract for the next coding agent

1. Read **row 00001**, and before claiming it check latest actual `main`, current issue/PR, `COORDINATION.md`, `WORK_CHECKPOINT.md`, source privacy policy, and owner claims. It is an **investigation**, not proof of a live secret.
2. If blocked by missing access/device/owner, document the precise status and continue to the first eligible row in **ascending `execution_rank`**. Never quietly skip it or treat a provider quota as a source defect. Choose one non-overlapping owner/file scope at a time.
3. Write a durable M1 checkpoint **before editing**, make branch-scoped changes, run source + relevant negative tests, then release/privacy gate if publishing. A PR created or code pushed is not a passing browser test, confirmed fix, or deployed website.
4. For public games/apps: verify *actual* live URL, release fingerprint, assets, mobile layout and saved progress; use approved hosting failover if needed, without silently replacing approved production/backup origins.
5. Record each executed task's ID, tested commit, CI run, browser/device evidence, provider blockers and resulting status **in its canonical repository**; update the master CSV only after the canonical source checkbox/evidence has changed. Use a single task ID once and retain references to its programme parent.
6. Physical-device and unconnected-provider tasks are explicit external gates: do not claim a green handset or provider-run merely because an emulated browser or public site works.

**Risk-specific rule:** Public documentation must not expose the actual suspected API key, workplace-network details, school data, private repo names or account credentials. Some agent reports have not completed; preserve **unknown** rather than create speculative bug descriptions.

## Source links / historical snapshot caveat

- [Portfolio 1,864-step source](PORTFOLIO_TRIAGE_TASK_STEPS_2026-10-25.csv) and [portfolio checkpoint](PORTFOLIO_TRIAGE_CHECKPOINT.md)
- [Greptile GRA/GRC source](https://github.com/Parris-Tech-Services/RepoClean/blob/antigravity-push/docs/GREPTILE_PORTFOLIO_REVIEW_QUEUE_2026-10-24.md)
- [GentleMovement 55-item source](https://github.com/Parris-Tech-Services/ParrisVoiceBank/blob/main/docs/GENTLE_MOVEMENT_AUDIO_TASK_INDEX.md)
- [SylvieApp 300-task source](https://github.com/Parris-Tech-Services/SylvieApp/blob/main/docs/SYLVIE_FULL_AUDIO_INTEGRATION_CHECKLIST_2026-10-24.md)
- [Town dialogue 84-open task order](../repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md)
- [Town crowd source](../repository-town/docs/RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md)
- [Town numbered child tasks and Agent 2 alias fix](../repository-town/docs/UNNUMBERED_TODO_IDS_2026-10-24.md)
- [Previous Agent 1's scoped list](../repository-town/docs/NEXT_ACTION_TRIAGE.md)
- [Master project parents](OUTSTANDING_WORK_2026-10-24.md)

This is a **dated triage snapshot**: verify current access, PR status and deployment at execution time. No fixes, deployments, re-recordings, provider connections, physical-device tests or run outcomes were produced by this documentation-only consolidation. Do not claim that every reported agent item was independently validated, especially where an agent was blocked or unfinished.
