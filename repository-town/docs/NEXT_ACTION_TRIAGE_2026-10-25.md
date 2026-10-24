# Repo Town — next-action triage and stable task IDs

**As-of:** 25 October 2026 (AEDT). **Scope:** the five unfinished areas in the 24 October status report, broken into actionable, individually referenceable jobs. **Canonical source:** `joshualparris/JoshMemory/repository-town/`. This is a documentation and prioritisation pass, **not** a claim that fixes have been implemented.

## Agent entrypoint — the next useful task

**Start with `RTN-002` (P1): NPC/player crowd collision and service-position clearance.** Read the current coordination board and [PR #186](https://github.com/joshualparris/JoshMemory/pull/186) before writing code. PR #186 is **open and not currently mergeable** at inspection (head `dbe4fbeb9c8c590a7c32378f4a476f4bf56459cf`); first compare it to current `main`, its live owner claims and CI, then fix/reconcile rather than duplicate or overwrite the work. If that precise file scope is actively claimed, advance the first **unclaimed, unblocked** task below. Never use a documentation-only status or successful unit test as proof of a live fix.

## Priority queue (each row points to exactly one stable work-item ID)

| Triage order | Priority | Unique task ID | Scope and concrete next action | Current evidence/status |
|---:|:---:|---|---|---|
| 1 | **P1** | **RTN-002** (NEW) | Fix outdoor/indoor NPC, queue and player overlaps. Reconcile #186, ensure full-body clearance, discrete spawn and service positions, blocked-route retries, no merged actors. | **Open** — candidate [PR #186](https://github.com/joshualparris/JoshMemory/pull/186); do not claim merged/live. |
| 2 | **P1** | **RTN-003** (NEW) | Fix **indoor resident** movement through walls, corners and furnishings independently of retail crowd positions; reconcile any active `src/world/npcs.js` ownership. | **Open** — separate wall-clipping claim in `COORDINATION.md`; not covered by #186's declared exclusions. |
| 3 | **P1** | **RTN-001** (NEW) | Give each visible named worker, trade worker, shop visitor and staff member a stable, distinct appearance; preserve identity across entry/re-entry and saves; verify no unexpected identical casts. | **Open** — included in #186 candidate, excluding separate house residents/fantasy cast. |
| 4 | **P1** | **RTD-043** (EXISTING) | Audit identity, transcripts/captions, speaker mapping, hashes, file integrity and URLs for the 20 additional VO041–VO060 clips plus relevant existing Game300 clips. Resolve #164 against main; do not regenerate approved recordings. | **Open** — [PR #164](https://github.com/joshualparris/JoshMemory/pull/164) unmerged. Also existing `AUDIO-009.01`–`.04`, `RTD-042`. |
| 5 | **P1** | **RTD-044** (EXISTING) | Put approved clips into **correct actual NPC conversations/events** with player choice, valid context and no falsely earned success. Review #164 against already merged recorded dialogue. | **Open** — use existing `AUDIO-007.01`–`.04`, `RTD-075`, `RTD-077` where relevant. |
| 6 | **P1** | **RTD-084** (EXISTING) | End-to-end production/staging dialogue test: walk up, open, choose, listen/replay, swap actor, stop/close, retry and walk away on desktop + Android-sized viewports; verify ElevenLabs recording is genuinely playing. | **Open** — also `AUDIO-010.01`–`.04`, `AUDIO-011.01`–`.04`, `AUDIO-013.03`, `RT-08`, `RTD-085` and `RTD-089`. |
| 7 | **P1** | **RTR-010** (EXISTING) | Prove physical 188-house entry/exit, touch joystick, objects, NPC obstruction and **building navigation** in the actual published game; fix reproducible failures and recheck. | **Open** — existing `RTD-086`, `RTL-005` apply; do not invent a duplicate task. |
| 8 | **P1** | **RTQ-001** (NEW) | Complete one **extended current-release mobile gameplay session** (movement, building navigation, dialogue pop-up opt-out/X, recorded audio interruption, save/reload, returning to world) with phone-sized browser and manual-device caveat. | **Open** — distinct full-session evidence missing; includes existing `RTD-058`, `RTD-085`, `RTD-086`, `RTL-005` acceptance, not substitutes for them. |
| 9 | **P2** | **RTP-001** (NEW) | Survey every *candidate* N/S parcel's **real world-space footprint, landscaping, backyard, utility/rail corridor, entrance, path and collisions**. Mark genuinely buildable vs occupied/reserved/unknown in the atlas, with evidence. | **Open** — [current 572-slot land audit](DIRECTIONAL_ADDRESS_AUDIT_2026-10-24.md) only classifies built vs unverified; a blank reference is **not** proven vacant. |
| 10 | **P2** | **RTP-002** (NEW) | Survey the **unbuilt row-9 road/tree line** and bordering farms; design road access, protected crops, utilities, junctions, traffic/navmesh and environmental trade-offs. Propose implementation *only after* the constraints and decision are documented. | **Open** — row 9 is not a built road; existing `RTL-003`, `RTC-001`, `RTC-008` are related, not duplicates. |

**IDs newly minted here:** `RTN-001`, `RTN-002`, `RTN-003`, `RTQ-001`, `RTP-001`, `RTP-002` (**six**). **IDs reused without renumbering or status changes:** `RTD-043`, `RTD-044`, `RTD-084`, `RTR-010`. The numbers in the first column are **execution order only**, not new task identifiers, and may be re-prioritised without changing task IDs.

## Five original status-report work areas → concrete IDs

1. **P1 NPC uniqueness and collision:** `RTN-002`, `RTN-003`, `RTN-001`; candidate PR #186, separate wall movement claim.
2. **P1 ElevenLabs audio integration:** `RTD-043`, `RTD-044`, `RTD-084`; existing audio parent `007`, `009`, `010`, `011`, `013` and child IDs under `UNNUMBERED_TODO_IDS_2026-10-24.md`, open PR #164. No fresh IDs for overlapping audio work.
3. **P2 physical plot vacancy survey:** `RTP-001` (new). The 572-address atlas is an inventory, not a collision/land-title survey.
4. **P2 row-9 development planning:** `RTP-002` (new). Existing simulated crops/trees/rail are preserved; no authorisation to build or clear land.
5. **P1 mobile dialogue/building/long-session acceptance:** `RTD-084`, `RTR-010` and `RTQ-001`. For dialogue controls use existing `RTD-085`/ `RTD-058`; for broad simulation use existing `RTD-086`/`RTL-005`.

## Individual acceptance and next executable step

**RTN-002 — crowd collision:** Reproduce screenshot-style overlaps on small viewport in pub, cafe, shop and street; compute actor bounding radius/full-height collision and safe stand/queue locations, verify route recovery rather than tunnelling; run #186's new 500-frame test, whole-town safety gate and hosted gameplay; close only with exact deployed SHA and screenshots. Do not alter `src/world/npcs.js` if another agent owns it.

**RTN-003 — indoor wall clearance:** Reproduce resident body clipping through walls/doors in real interior scenes; collision-sweep body extents and doorway clearance, repair paths/fallbacks without trapping actors; unit geometry plus real 3D desktop/Android scenes. This is **not** verified by visitor-crowd tests.

**RTN-001 — NPC distinct visuals:** Inventory currently duplicated faces/outfits for named actors and simulated workers; use deterministic identity-seeded hair, headwear, body and outfit combinations without reducing 3D performance; compare screenshots, check persistence across sessions and accessibility. Scope only entities actually visually changed, not blanket claims about 188 house aliases.

**RTD-043 / RTD-044 — recordings:** Audit actual MP3 audio and transcript against actor and triggering condition before integrating; reconcile #164 without overwriting merged #166 voice UI; run offline/interrupt tests; secure real production replay evidence, not only compilation or file presence.

**RTD-084 — real dialogue:** Test multiple different voiced NPCs with authored choices and actual decoded audio in the walkable game; no auto-play, speech overlap, stuck controls or wrong speaker/caption; compare production `release.json` fingerprint and store logs/video or screenshot artifacts.

**RTR-010 — walking/buildings:** Cross representative houses and both street frontages; exercise touch controls, door/exit consistency and collision. Existing broad 188-house evidence requirement remains **unchecked** until all requested acceptance passes.

**RTQ-001 — continuous mobile session:** Use one uninterrupted 20–30 minute simulated Android-size session (plus real handset if available): walk, search a north/south address, enter/exit, converse, interrupt/close, change auto-dialogue preference, save/reload and resume, then note layout/FPS/browser console/interaction anomalies. A browser-emulated run is not real hardware proof.

**RTP-001 — vacancy:** Calculate plot polygons and building footprints, road setbacks, backyard/objects, track exclusion and farm cropping; mark `vacant_verified`, `occupied`, `reserved` or `unverified`, with tests that **never** label `Z8-N` or farm fields buildable. `Z7-N` and `Z9-S` remain unverified until measured.

**RTP-002 — row 9:** Inspect actual tree line, farms/fields and southern map edge; record proposed road alignment, intersections, accessibility, ecology, utilities, blockers and reversible implementation sequence. **No construction or felling is implied** by task assignment.

## Handoff protocol

For each task: read `AGENTS.md`, `COORDINATION.md`, `WORK_CHECKPOINT.md`, and its original tracker first; if a PR/owner already exists, reconcile it rather than start a competing feature branch. Reserve one exact ID/file scope, commit a start checkpoint, implement and test, run release/privacy/browser acceptance, merge a reviewed PR, verify published fingerprints/browser reality, then mark **that** ID complete with evidence. Do **not** tick a parent based only on a subtask, and never edit generated GitHub Pages contents directly.

Source of numbering rules: [stable existing ID index](UNNUMBERED_TODO_IDS_2026-10-24.md), [93 dialogue tasks](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md), [audio tracker on generated Pages backup](https://github.com/Parris-Tech-Services/Repository-town/blob/main/AUDIO_INTEGRATION_TODO.md), [WORK_CHECKPOINT](../WORK_CHECKPOINT.md).
