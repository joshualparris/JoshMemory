# Repository Town — stable IDs for previously unnumbered unfinished tasks

Updated 24 October 2026 (Australia/Sydney). **Numbering only — no completion claims, implemented features or changes to task meaning.**

## Numbering rules and authority
- **Preserve existing IDs unchanged:** Skyrim dialogue `RTD-001`–`RTD-093`; existing checkpoint `RT-01`–`RT-09`; audio parent numbers `006`–`013`, `040`–`048`; realism plan's original steps `1`–`6`; existing house coordinates and council resolution numbers.
- Prefixes below are new stable identifiers for previously unnumbered tasks only: `RTL` = Living Town, `AUDIO-PPP.SS` = existing audio parent PPP's unfinished subtask SS, `RTA` = Arcade QA, `RTR` = branch/whole-town release reconciliation, `RTC` = council audit implementation follow-through.
- The canonical editable source is [JoshMemory/repository-town](../README.md). The [audio parent checklist](https://github.com/Parris-Tech-Services/Repository-town/blob/main/AUDIO_INTEGRATION_TODO.md) is in the generated backup: **do not directly edit that generated repository**. Child IDs here mirror its unchecked subtask text at the inspected version (blob `2076f4a5c26728bedcbd2a8cc82b1656c4417aff`); retain their original parent IDs and checkbox state. Parent/child statuses can diverge until the central tracker is reconciled.
- Every new item below remains **unchecked**. Existing work may partially address an item, but do not mark it done without its own acceptance evidence. Historical instructions about merging already-merged PRs require reassessment, not another merge.

## Living Town — unfinished items
Source: [Living Town masterplan](LIVING_TOWN_MASTERPLAN.md). These same five IDs are added directly beside its original unchecked items.

- [ ] **RTL-001** A pathfinding NPC that *physically* performs each scheduled job
- [ ] **RTL-002** Interior walk-in civic facilities and shops
- [ ] **RTL-003** Actual pipes/cables/road network topology and vehicle cargo visuals
- [ ] **RTL-004** Real household-level ledgers, balanced company accounts, inventories
- [ ] **RTL-005** Browser GPU/mobile playtests and public publish (pending integration review)

## Audio — 64 unfinished unnumbered child tasks of existing parent IDs
Source: [original audio acceptance tracker](https://github.com/Parris-Tech-Services/Repository-town/blob/main/AUDIO_INTEGRATION_TODO.md). All original **006–013 and 040–048** parent IDs remain unchanged.

- [ ] **AUDIO-007.01** [AI] Review latest PR diff for mobile overflow, cancel/re-entry, speech overlap, XSS and correct caption text.
- [ ] **AUDIO-007.02** [AI] Use a single release, not repeated deployments: first prefer the current Vercel Hobby daily quota resetting (no purchase); consider Cloudflare Pages only after an independent compatibility/privacy/asset review.
- [ ] **AUDIO-007.03** [AI] Merge PR #165 when production release is feasible; re-test actual NPC conversations, switching, mute and recorded speech on the final public URL.
- [ ] **AUDIO-007.04** [AI] Attach tested production commit/URL, browser trace and regression results, then tick task 007.
- [ ] **AUDIO-008.01** [AI] Inventory all Game300 phrases that imply achievements, repairs, purchases, travel or completed quests.
- [ ] **AUDIO-008.02** [AI] Map achievement-related audio only to authoritative game-state transitions, not keyword guesses in chat.
- [ ] **AUDIO-008.03** [AI] Add negative tests for failed purchases, missing inventory, cancelled quests and random AI replies.
- [ ] **AUDIO-008.04** [AI] Playtest each verified event before allowing its recorded success line in production.
- [ ] **AUDIO-009.01** [AI] Export clip→speaker→event→text→SHA-256 manifest for all ten Town residents.
- [ ] **AUDIO-009.02** [AI] Compare Town NPC IDs to VoiceBank voice IDs; flag every mismatched or duplicate speaker/caption.
- [ ] **AUDIO-009.03** [AI] Assert caption equals recording transcript and the actual decoded asset is the advertised character.
- [ ] **AUDIO-009.04** [AI] Test gallery and contextual chat on production with at least one full pass per speaker.
- [ ] **AUDIO-010.01** [AI] Automate open/close/reopen, NPC switch, ten rapid taps, replay and stop in Playwright on desktop and mobile-sized Chrome.
- [ ] **AUDIO-010.02** [AI] Confirm playback cancels on modal dismissal, leaving an NPC and switching residents.
- [ ] **AUDIO-010.03** [AI] Check no stale promise re-enables the wrong button or starts duplicate WebAudio sources.
- [ ] **AUDIO-010.04** [AI] Attach browser logs and preserve source/e2e tests as regression protection.
- [ ] **AUDIO-011.01** [AI] Use canonical live Town, not the audio module alone, for walk→chat→walk→building→object paths.
- [ ] **AUDIO-011.02** [AI] Verify pressing Listen does not trap pointer/keyboard movement, impair WebGL or trigger while a modal is gone.
- [ ] **AUDIO-011.03** [AI] Test route transitions, buildings with residents, and simultaneous ambient/game effects.
- [ ] **AUDIO-011.04** [AI] Capture browser test evidence and repair any obstruction or audio leakage.
- [ ] **AUDIO-012.01** [AI] Test desktop Chromium and Android emulation in narrow/landscape viewports, including touch controls and network throttling/offline.
- [ ] **AUDIO-012.02** [AI] Simulate ZIP 404, CORS rejection, broken MP3, slow CDN and context suspension.
- [ ] **AUDIO-012.03** [AI] Show honest 'recording unavailable' state, retry and control recovery without covert device TTS.
- [ ] **AUDIO-012.04** [YOU, optional final acceptance] Try a brief real Android listen/stop only if device-only bugs remain after automated testing.
- [ ] **AUDIO-013.01** [AI] Identify canonical Town source as `joshualparris/JoshMemory/repository-town`, not the similarly named mirror.
- [ ] **AUDIO-013.02** [AI] Confirm canonical production Vercel deployment SHA and alias, and keep publication errors distinct from mirror status.
- [ ] **AUDIO-013.03** [AI] Validate release assets, CSP/CORS, mobile page, and live NPC audio at the canonical URL.
- [ ] **AUDIO-013.04** [AI] Compare tested source SHA with deployed SHA after PR #165 lands; save proof before closing.
- [ ] **AUDIO-040.01** [AI] Measure loudness, peak, duration and leading/trailing silence for every approved clip using open-source tools.
- [ ] **AUDIO-040.02** [AI] Flag speaker changes, clipped audio, pronunciation errors and long pauses for listening review.
- [ ] **AUDIO-040.03** [AI] Apply non-destructive free gain/trim normalisation only with before/after hashes and source preserved.
- [ ] **AUDIO-040.04** [AI] Test representative character clips in the actual app/game playback mix.
- [ ] **AUDIO-041.01** [AI] Generate a canonical ID→speaker→caption→URL→SHA-256 matrix with no duplicates.
- [ ] **AUDIO-041.02** [AI] Validate all manifest references and content type/length, and audit caption versus text metadata.
- [ ] **AUDIO-041.03** [AI] Test fail-fast behaviour for swapped voice files, 404, CORS and corrupt ZIP; store report.
- [ ] **AUDIO-041.04** [AI] Do not close until all required clips in the specified scope pass.
- [ ] **AUDIO-042.01** [AI] Enumerate distinct media engines per app and document precedence, pause and stop rules.
- [ ] **AUDIO-042.02** [AI] Add a repeat-tap/switch/close stress test that detects overlapping voices or hanging player state.
- [ ] **AUDIO-042.03** [AI] Verify no autoplay without user gesture and stop when leaving game/dialogue.
- [ ] **AUDIO-042.04** [AI] Confirm screen-reader announcements remain clear when an audio error occurs.
- [ ] **AUDIO-043.01** [AI] Record startup/network bytes and lazy-load timing on a throttled simulated mobile connection.
- [ ] **AUDIO-043.02** [AI] Ensure packs download on explicit interaction, cache selectively and respect audio settings.
- [ ] **AUDIO-043.03** [AI] Verify bundles do not fetch all 300 clips on every page load or exhaust storage.
- [ ] **AUDIO-043.04** [AI] Add performance budgets and compare measurements after optimisation.
- [ ] **AUDIO-044.01** [AI] Simulate offline, rate limits, 404, timeout, CORS denial and decode failure for every playback API.
- [ ] **AUDIO-044.02** [AI] Assert graceful retry/disabled control with accurate voice source label.
- [ ] **AUDIO-044.03** [AI] Log outbound request domains and prove no unplanned ElevenLabs/paid API calls.
- [ ] **AUDIO-044.04** [AI] Preserve working offline alternatives only where approved, with no disguised device TTS.
- [ ] **AUDIO-045.01** [AI] Run automated accessibility assertions for labels, focus, aria-pressed/status and heading structure.
- [ ] **AUDIO-045.02** [AI] Test keyboard-only controls and switch to reduced-motion mode where relevant.
- [ ] **AUDIO-045.03** [AI] Inspect mobile hit targets and long translated/recorded captions for overflow.
- [ ] **AUDIO-045.04** [AI] Retest screen-reader relevant semantics after fixes.
- [ ] **AUDIO-046.01** [AI] Record per-app build, unit, integration, browser and deployed smoke commands in a single evidence matrix.
- [ ] **AUDIO-046.02** [AI] Run lowest-cost tests first, then real browser journeys (Chrome mobile/desktop) without generating speech.
- [ ] **AUDIO-046.03** [AI] Gate deployment on the relevant tests; attach SHA, exit logs, network/audio proof and URL.
- [ ] **AUDIO-046.04** [AI] Distinguish an independent test from GitHub Actions execution and never claim CI green when runner was blocked.
- [ ] **AUDIO-047.01** [AI] Snapshot test saves/progress before audio features and verify backwards-compatible restores.
- [ ] **AUDIO-047.02** [AI] Test offline startup and cached/missing audio without breaking gameplay, exercise tracking or school-safe app features.
- [ ] **AUDIO-047.03** [AI] Check changing voice settings does not change game data, achievements or scores.
- [ ] **AUDIO-047.04** [AI] Perform a production upgrade/reload regression on each affected app.
- [ ] **AUDIO-048.01** [AI] Consolidate all accessible audio manifests into one versioned inventory with ID, source, speaker, text, hash, game, trigger and deployed URL.
- [ ] **AUDIO-048.02** [AI] Link QA evidence (CI/build/browser/devices), confidence level, review status and unresolved blockers per clip.
- [ ] **AUDIO-048.03** [AI] Publish a machine-readable CSV/JSON and human audit in VoiceBank with source references.
- [ ] **AUDIO-048.04** [AI] Reconcile all 48 task checkboxes from actual proof; leave missing/private/inaccessible items explicitly OPEN.

## Arcade automated and manual playtesting
Source: [Arcade QA instructions](../qa/README.md), [work checkpoint](../WORK_CHECKPOINT.md). PR #171 merged; its workflow execution and game-by-game playtesting were not established by that merge.

- [ ] **RTA-001** Run the merged manual Arcade Playtest GitHub Action on the current deployed/staging release (PR #171 is already merged).
- [ ] **RTA-002** Playtest every game edition in the current arcade catalogue, including both editions of Mysterious Depths and AA Game Adventure.
- [ ] **RTA-003** Review actual screenshots, browser logs, play actions, loading failures and user-facing controls for each tested game.
- [ ] **RTA-004** Assess game-specific progression, confusing UX and balancing beyond generic automated clicks; record evidence and unknowns.
- [ ] **RTA-005** Fix confirmed game bugs in their canonical source repositories and refresh packaged copies through the approved release process.
- [ ] **RTA-006** Verify the arcade is playable on desktop and Android viewports and that returning to Town works without lost input or progress.
- [ ] **RTA-007** Retest production after publication and attach exact commit, source game revision, report and screenshots.

## Existing branch reconciliation and release acceptance
Source: [GitHub issue #26](https://github.com/joshualparris/JoshMemory/issues/26). Recheck branch dispositions before acting; old issue body may describe already-superseded work.

- [ ] **RTR-001** Audit long-lived Claude simulation branch / PR #9; mark unique work merged, selectively ported, superseded or blocked.
- [ ] **RTR-002** Audit improvements PR #11 for genuinely missing world/NPC/game/asset changes before any port.
- [ ] **RTR-003** Audit PR #16 for remaining Godot WASM restore/build corrections after scene-awareness selective port.
- [ ] **RTR-004** Verify PR #17 PIN bridge is fully superseded and preserves no unique wanted behaviour.
- [ ] **RTR-005** Audit PR #18 legacy NPC UI for unique work not present in merged PIN-free service.
- [ ] **RTR-006** Audit `repository-town-merged-playtest-20261019` for unique outstanding changes.
- [ ] **RTR-007** Audit `fix/npc-chat-android-keyboard-20261019` for unique outstanding changes.
- [ ] **RTR-008** Audit `town-label-occlusion-20261019` for unique outstanding changes.
- [ ] **RTR-009** Run release build, privacy gate and existing Town simulation/NPC/game/arcade browser suites against reviewed source.
- [ ] **RTR-010** Prove 188-house entry/exit, objects, mobile joystick and collision acceptance on the actual game.
- [ ] **RTR-011** Prove civic economy, utility failures, delivery/stock conservation and persistence across save/load.
- [ ] **RTR-012** Prove NPC room grounding, live AI/offline boundaries, Android chat keyboard and privacy.
- [ ] **RTR-013** Verify lighting, ambience, wall-aware labels and accessibility on desktop and Android.
- [ ] **RTR-014** Compare tested canonical source with any live-only hotfixes, and preserve unique behaviour.
- [ ] **RTR-015** Publish only the sanitised approved release and verify Vercel, staging and mirror source/content fingerprints.
- [ ] **RTR-016** Record merge SHAs, checks, browser evidence and disposition for every reviewed branch.

## Fictional Council audit follow-through
Source: [GitHub issue #157](https://github.com/joshualparris/JoshMemory/issues/157). These are evidence-gathering and proposed implementation tasks, **not approved construction, measured outcomes, or real grants**. The issue's original numbered six council resolutions remain unchanged.

- [ ] **RTC-001** Measure actual per-house transport access, route times, crosswalk waits, queues and accessible pedestrian routes.
- [ ] **RTC-002** Measure emergency dispatch, turnout, route travel, overlap capacity and response-time distribution.
- [ ] **RTC-003** Measure power feeder supply/unserved units, outages and multiple-fault restoration.
- [ ] **RTC-004** Measure water, wastewater, flooding and material-recovery flows with traceable sources.
- [ ] **RTC-005** Measure staffing, household affordability, service equity and auditable council finance.
- [ ] **RTC-006** Demonstrate causal effects and trade-offs, including disruption, displaced congestion and recurring maintenance.
- [ ] **RTC-007** Carry out years 1–2 baseline surveys, safety/accessibility checks, public consultation and audited finite grant ledger.
- [ ] **RTC-008** Investigate years 3–5 targeted water/sewer/power, walking/cycling, land-use and industrial compatibility investments with tested demand.
- [ ] **RTC-009** Evaluate years 6–10 resilient energy, park/shade equity, community programmes and demand-evidenced transport with whole-of-life funding.

## Mobile dialogue — newly identified exact Android acceptance gaps (RTM)

Source: [ordered next-action triage](NEXT_ACTION_TRIAGE.md), user-provided Android screenshot of Kip's conversation obstructing Town's interaction prompt, and [verified QA release checkpoint](../WORK_CHECKPOINT.md). These were **not already separate, precisely scoped tasks** in the tracker. IDs `RTM-001` and `RTM-002` are permanent; do not use them again.

- [ ] **RTM-001** [AI + browser evidence] Exercise the real ambient NPC-to-NPC yarn toast in a live deployed 3D scene: opt in to automatic captions, wait for an actual nearby yarn, tap **X** and prove that exact event stays dismissed while a later different yarn can appear. Record actual release SHA, screenshot/video and input trace; distinguish from the already-passing mock-DOM button test.
- [ ] **RTM-002** [DEVICE acceptance] Verify on a **physical Android phone** in portrait/landscape that the HUD +, Dialogue settings, persistent automatic-conversation toggle, real yarn X, Yarns/NPC/Ask AI access and joystick/action controls are usable without overlapping or corrupting saves. Attach phone/browser/version and before/after evidence; if no physical device is available, leave open with blocker. Android-sized Playwright passing does not qualify.

These are **additional narrowly defined outcomes**, cross-linked to wider `TASK-034`, `AUDIO-012.04`, `AUDIO-045.03` and `RTD-057/058`. They do not replace or close those original tasks.

## Screenshot-based NPC uniqueness, collision and alternative-host release (RTN IDs)

The 24 October mobile screenshots exposed duplicated-looking residents and visible body merging in a crowded pub. These are **new, uniquely numbered scoped tasks**, distinct from broad existing `RTR-009/010/015`, `RTL-005`, `RTD-010` and `RT-08`. Full acceptance and handoff details: [RTN-001–018 priority tracker](RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md). **Next action: RTN-007**. Checked items below were committed/tested on an *unmerged* candidate; **none proves a hosted fix**.

- [x] **RTN-001** Deterministic visual individuality for simulated street residents and trade crew (source only).
- [x] **RTN-002** Stable indoor shop-worker and visitor wardrobe identity (source only).
- [x] **RTN-003** Separate shop spawning, queue positions and reserved standing space (source only).
- [x] **RTN-004** NPC-to-NPC walking separation, dynamic obstacles, rerouting (source only).
- [x] **RTN-005** Continuous body-sweep furniture collision + café-corner regression (source only).
- [x] **RTN-006** Dense-crowd regression and complete sandbox release build on `ac0b8a1` (not deployed).
- [ ] **RTN-007** **FIRST:** Resolve conflicting [PR #186](https://github.com/joshualparris/JoshMemory/pull/186) with latest canonical `main`.
- [ ] **RTN-008** Distinct identities for remaining 32 named NPCs and 188 in-home slots; preserve voice/dialogue IDs.
- [ ] **RTN-009** Player-initiated NPC collision/merging and narrow-space navigation.
- [ ] **RTN-010** Crowded venue, camera, visual readability and mobile performance audit.
- [ ] **RTN-011** Test reconciled SHA with full release/CI/privacy/integration and desktop/mobile browser checks.
- [ ] **RTN-012** Review and merge conflict-free tested candidate into canonical source.
- [ ] **RTN-013** Check eligible non-Vercel capacity (Render QA, separate Pages, Cloudflare); do not treat Neon as WebGL hosting.
- [ ] **RTN-014** Build/publish merged source on independent `joshualparris/repository-town` GitHub Pages.
- [ ] **RTN-015** If Pages unavailable, verify approved Render/Cloudflare static-host alternate (or document not required).
- [ ] **RTN-016** Verify live `release.json` source/content fingerprint, assets, privacy and separate-origin save safety.
- [ ] **RTN-017** Hosted pub/café/shop/university desktop + Android/mobile player/people walkthrough.
- [ ] **RTN-018** Publish exact evidence and update checkpoint/coordination; only then close screenshot request.

## Already numbered elsewhere — deliberately not renumbered
- [93-item Skyrim NPC checklist](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md) — retains `RTD-001`–`RTD-093`.
- [Nine-item earlier NPC checkpoint](../WORK_CHECKPOINT.md) — retains `RT-01`–`RT-09`.
- [Infrastructure realism work remaining](REALISM_INFRASTRUCTURE_2026-10-19.md) — retains its existing numbered steps 1–6.
- [House acceptance matrix](../ACCEPTANCE.md) — 188 coordinate-keyed house records, not numbered TODO bullets.
- [Council audit issue #157](https://github.com/joshualparris/JoshMemory/issues/157) — six existing numbered policy resolutions preserved.

## 25 October — Agent 2 screenshot findings: canonical RTN crosswalk and three distinct new tasks

**Consolidation correction (25 October):** Two agents independently assigned `RTN-001`, `RTN-002`, `RTN-003` to **different requirements**, resulting in duplicate contradictory checked/unchecked meanings in an earlier version of this register. Preserve the detailed [canonical 18-task RTN tracker](RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md), with `RTN-001..006` source-level checked, `RTN-007..018` open. Agent 2's *historical labels* below are **aliases only, not separate runnable IDs**:

| Agent 2 report label (historical; do not assign) | What Agent 2 requested | Canonical task(s) to execute |
|---|---|---|
| `RTN-001` (Agent 2) | Unique NPC appearances | `RTN-001` (existing outdoor foundation), **`RTN-008`** (remaining full cast) |
| `RTN-002` (Agent 2) | NPC crowd merging/collision | `RTN-003/004` source foundation, **`RTN-009`** player collision, `RTN-010` visual phone audit |
| `RTN-003` (Agent 2) | Indoor wall/door/furniture clipping | **`RTN-009`** and `RTR-010` building/collision acceptance |

These were already encompassed by canonical tasks; **no additional implementation IDs** are minted. Agent 2's original [queue](NEXT_ACTION_TRIAGE_2026-10-25.md) remains historical input and is superseded for conflicting RTN meanings by the [20-agent master execution queue](../../docs/MASTER_20_AGENT_TRIAGE_2026-10-25.md). Do not mark canonical tasks complete because their names resemble one another.

The other **three genuinely distinct permanent IDs** from Agent 2 remain unfinished:

- [ ] **RTQ-001** One uninterrupted current-release mobile gameplay acceptance session including address navigation, NPC dialogue, auto-popup toggle, stop/dismiss, save/reload, FPS and logging.
- [ ] **RTP-001** Spatially survey candidate N/S land slots, clearances, yards, utility/rail corridors and active fields; identify *proven* vacant sites only.
- [ ] **RTP-002** Study the tree-lined, unbuilt row-9 road alignment and farm/rail boundaries before any design approval or construction.

No `RTD-043/044/084`, `RTR-010` or audio IDs were renumbered.

## Maintenance
Treat this document as a cross-reference for *previously unnumbered* tasks, not a replacement for the original trackers. Do not reuse IDs or implicitly tick off parent/child tasks. Where an original tracker is now stale, reconcile wording and status in a distinct evidence-backed change.


## Lighting tasks and release triage

Added 25 October 2026. Scope: the lighting status report and its remaining publication/acceptance work. **Current action: RLT-011**, finish the browser publication and PR, then execute RLT-012 through RLT-016 in order. RLT-008–010 are complete for the current candidate. RLT-017–019 are subsequent targeted acceptance/coverage work; do not silently claim those verified. P0 unblocks publication, P1 delivers and verifies the release, P2 extends device/outage/coverage evidence.

The existing **RLT-001–007** audit IDs are retained unchanged and are now indexed centrally. New **RLT-008–019** identify previously unnumbered work. These are lighting-specific acceptance records beneath the existing broader **RTR-009**, **RTR-013**, **RTR-015** and **RTR-016** tasks; none of those existing IDs or checkbox states are replaced. The lighting release does not claim audio task RT-08/AUDIO-013.03 complete.

### Implemented and verified locally — release acceptance still open

Evidence: [lighting audit](LIGHTING_AUDIT_2026-10-24.md), [browser metadata](../audit/lighting/after/metadata.json), [release checks](../audit/lighting/release-checks.log). Runtime candidate e72a654 passed the release/privacy gate and 38 desktop/emulated-Android scenarios; later main has not yet been reconciled. These statuses do not assert GitHub publication or deployment.

| Existing ID | Exact scope | Status |
|---|---|---|
| RLT-001 | Streetlamps illuminate roads, footpaths and people | VERIFIED LOCALLY; hosted acceptance open |
| RLT-002 | University, TAFE, hardware and trades interior lighting | VERIFIED LOCALLY; hosted acceptance open |
| RLT-003 | Readable illuminated painted shop signs | VERIFIED LOCALLY; hosted acceptance open |
| RLT-004 | Shop window lighting follows trading hours | VERIFIED LOCALLY; hosted acceptance open |
| RLT-005 | Independent shared-shell lighting circuits and blackout controls | VERIFIED LOCALLY; hosted acceptance open |
| RLT-006 | Repeatable desktop and emulated-Android lighting audit | VERIFIED LOCALLY; hosted acceptance open |
| RLT-007 | Correct early/late/night-owl household bedtime schedules | VERIFIED LOCALLY; hosted acceptance open |

### Remaining tasks — logical execution order

**Browser fallback is working:** GitHub UI created the remote lighting branch and committed checkpoint/package, all five source files and both regression tests. CLI/connector authentication remains unavailable, but RLT-008 is satisfied by verified browser writes. Current action is RLT-011 (complete remaining files and PR); merge and hosted acceptance are still open.

| Order | Unique ID | Priority | Exact task | Depends on | Acceptance |
|---|---|---|---|---|---|
| 1 | RLT-008 | P0 | [x] Restore authenticated GitHub write access | None | PASS: browser created the scoped branch and source commits f87f42b / 750446c; public Git fetch verifies the five runtime files byte-for-byte. No credentials extracted or changed. CLI/connector outage remains separately recorded. |
| 2 | RLT-009 | P1 | [x] Fetch latest main and reconcile the lighting branch | RLT-008 | PASS: reconciled latest observed main ee432c0 into local f2053e1; preserved concurrent NPC/yarn/triage/hosting files. Recheck main before merging if it advances. |
| 3 | RLT-010 | P1 | [x] Validate the reconciled release candidate | RLT-009 | PASS: f2053e1 full release gate, privacy (774 files/1116 markers) and 1140-file manifest. Runtime lighting files unchanged from e72a654, whose 38 desktop/emulated-Android browser scenarios passed. Hosted acceptance remains RLT-015. |
| 4 | RLT-011 | P1 | [ ] Push lighting source, central task index, checkpoint and open the PR | RLT-010 | Remote branch/PR exists in joshualparris/JoshMemory; verify published files include RLT-001–019. Do not edit the generated backup by hand. |
| 5 | RLT-012 | P1 | [ ] Review and merge the lighting PR | RLT-011 | Review scoped diff, preserve concurrent changes, pass required checks and verify merge commit on main. Revalidate changes introduced by reconciliation. |
| 6 | RLT-013 | P1 | [ ] Deploy the approved lighting release | RLT-012 | Follow current docs/HOSTING.md and verify a successful deployment of the lighting commit. Use an eligible existing fallback if Vercel is blocked; an older working Town host does not complete this task. |
| 7 | RLT-014 | P1 | [ ] Verify hosted version, fingerprint and assets | RLT-013 | Read live release.json, match sourceCommit/contentHash to approved build and check representative JS/assets. Check each intended host separately; record mismatches. |
| 8 | RLT-015 | P1 | [ ] Run the actual hosted desktop/mobile lighting walkthrough | RLT-014 | Check daytime/dusk/midnight streets, eight built street segments, university/other audited interiors, shop signs/windows, movement and window rendering. Capture runtime errors, screenshots and exact URL/SHA. Local tests do not complete this task. |
| 9 | RLT-016 | P1 | [ ] Close the lighting release with evidence in central docs | RLT-015 | Update this index, audit, WORK_CHECKPOINT and coordination with merged SHA, tested live URL/hash, results and remaining limits; push and verify the updates. No blanket completion of RTR/audio/NPC parents. |
| 10 | RLT-017 | P2; device-dependent | [ ] Check real Android handset performance and night visibility | RLT-015 | Record actual hardware/browser, touch usability, sustained FPS and readable night views. Emulation is insufficient. If no handset is available, leave unverified; do not invent a release approval requirement. |
| 11 | RLT-018 | P2 | [ ] Verify blackout and restoration through actual gameplay | RLT-015 | Exercise total power loss and a mapped feeder loss in shared-shell interiors; check fixtures/glow, unaffected circuits and restoration. Node circuit tests alone are not live outage acceptance. |
| 12 | RLT-019 | P2; audit extension | [ ] Extend visual lighting coverage to unvisited interiors | RLT-015 | Inventory remaining civic rooms and repository-house interiors, record which were actually visited at night and file concrete defects. Current eight-interior route and geometry tests do not prove every corner was inspected. |

Authoritative next action: **RLT-011 — finish publishing the scoped files and open the PR**. Browser write access and current candidate validation are verified. Keep task IDs stable if priority changes; change the Order column rather than renumbering IDs. This section is being published to the canonical GitHub lighting branch as part of RLT-011; main merge and deployment remain separate acceptance steps.
## Recorded NPC conversations — exact request cross-reference (25 October 2026)

This section maps Josh's request for natural, Skyrim-inspired prerecorded ElevenLabs conversations, player dialogue choices, all NPCs, missing-line generation, dual permanent storage and complete playtesting to **existing** IDs. It adds **zero new IDs**, changes **no existing number or checkbox**, and makes **no new implementation or deployment claim**. Rank is dependency order within this request, not a replacement for the Town-wide priority queue. Status remains authoritative in the [RTD roadmap](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md); consult current coordination/PRs before claiming work.

**First prerequisite: RTD-010**, unless already completed with evidence or actively owned; then take the first unclaimed, unblocked item below. Preserve the already merged recorded-choice implementation rather than replacing it from an old branch.

| Order | Existing unique task IDs | Exact requested outcome / next action |
| ---: | --- | --- |
| 1 | RTD-010 | Separate persistent identities for 32 named actors, 99 workers and 188 house slots; never assign voices by display name alone. |
| 2 | RTD-042, RTD-043 | Inventory existing recordings, reconcile proposed imports/current source, and verify clip, actor, transcript, voice, hash and playable asset before generating duplicates. |
| 3 | RTD-011, RTD-012, RTD-013 | Implement deterministic, validated dialogue trees and topic choices, preserving the existing recorded-choice UI and authoritative world state. |
| 4 | RTD-014, RTD-017, RTD-018 | Natural greetings/return visits and nested choices, back/change subject, replay, goodbye, early dismissal and safe actor switching. |
| 5 | RTD-047, RTD-049 | Write missing per-character lines from actual branches and cast consistent, suitable, diverse ElevenLabs voices for the 22 named characters without existing Game300 voices. |
| 6 | RTD-048, RTD-077 | Generate/import missing dialogue for those 22 characters; use the explicitly authorised ElevenLabs connector or the simple Colab route. Produce only intended takes, journal generation results and do not regenerate an uncertain billed request blindly. No paid synthesis at gameplay runtime. |
| 7 | RTD-046, RTD-077, RTD-092 | **Dual-storage acceptance:** preserve original recordings and save every newly generated MP3, exact transcript, actor/voice ID, generation reference, file size and SHA-256 to both Google Drive and canonical GitHub/VoiceBank. Verify both copies and record their links before classifying a take as durably saved. Temporary signed media URLs alone do not qualify. This is an explicit acceptance detail for existing IDs, not a new duplicate task. |
| 8 | RTD-078 | Cover workers and house residents as well as named street characters. Josh's request includes all NPCs; this expansion is requested, not permission to describe currently unvoiced roles as complete. Record per-actor implemented, missing and intentionally shared voice coverage honestly. |
| 9 | RTD-044, RTD-045, RTD-050, RTD-051 | Attach exact recordings only to fitting branches/events; speech follows the player's conversation interaction, respects sound preferences, shows matching subtitles, and supports one foreground speaker, Stop and replay. Never announce unearned quest/repair/trade success or silently substitute device TTS. |
| 10 | RTD-052, RTD-053, RTD-054 | Lazy loading, mobile memory/data and audio mixing; verified recovery from missing/corrupt media, offline/CORS failures and audio-context suspension. |
| 11 | RTD-075, RTD-084, RTD-085, RTD-086 | Playtest Rowan/Kit/Pip pilots, then every implemented actor and reachable branch in the actual 3D world: approach, choose, real decode/playback, caption, replay, stop/close, switch/walk away, failure/retry, movement and save/reload on desktop and Android-sized viewports. Report physical-handset acceptance separately. |
| 12 | RTD-087, RTD-088, RTD-089, RTD-090, RTD-091, RTD-092, RTD-093 | Run focused/full release and privacy gates; review/reconcile/merge, stage and verify actual playback, publish the tested release through approved hosting, verify production and backup fingerprints, and save evidence/checkpoints. Keep every unverified result open. |

Parent cross-reference: **TASK-032** dialogue/context; **TASK-033** recordings; **TASK-034** overlay/mixer controls; **TASK-035** real quest/trade outcomes; **TASK-045** verified release. Existing detailed audio children remain under **AUDIO-009**, **AUDIO-010**, **AUDIO-011**, **AUDIO-012**, **AUDIO-013**, **AUDIO-040–048** above.

The [complete RTD execution queue](RTD_NEXT_TASK_TRIAGE_2026-10-25.md) retains the remaining prerequisites and original IDs; this request cross-reference does not close them or bypass the current claim/checkpoint/review protocol.
