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

## Maintenance
Treat this document as a cross-reference for *previously unnumbered* tasks, not a replacement for the original trackers. Do not reuse IDs or implicitly tick off parent/child tasks. Where an original tracker is now stale, reconcile wording and status in a distinct evidence-backed change.
