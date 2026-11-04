# JoshMemory — Whole-repository outstanding work and priority register

**Audit date:** 5 November 2026 (AEDT). **Source baseline:** JoshMemory main at audit start; generated in a dedicated audit branch.
**Status:** DOCUMENTARY INVENTORY. An OPEN task in a dated tracker is NOT proof the defect still exists; verify current source and deployments before implementation.

## Scope and what is actually numbered

- Tracked repository files seen: **2,396**; text files scanned: **1,836**.
- Explicit unfinished items found in tracked text files (before existing-ID reconciliation): **862**.
- Canonical *source-reported* outstanding entries from legacy and newer registers: **2,778** (existing IDs preserved).
- **313 NEW permanent JMU IDs** assigned to distinct formerly unnumbered explicit checkboxes, work headings, task-status rows or code comments.
- Total uniquely keyed source-reported records in generated CSV: **3,091**. GitHub open issues and PRs are separate numbered tracks; they may overlap these tasks.
- Existing task IDs were not renamed, renumbered or marked complete. Generated tasks retain source file and line references.

**Coverage limits:** This scans the current JoshMemory checkout, not live source trees in the 233+ other repositories referenced by the old portfolio registry. Code comments and decades-old plans are *review candidates*, not independently verified current defects. Unmarked ideas in prose, private connector-only records and untracked files cannot be guaranteed complete. The legacy master is a 25 Oct snapshot; dependency and priority changes after that date are not silently inferred.

## First action — current blocking work, not new feature count

The following is the **repo-local triage order**, not a change to the permanent ID order in the 25 Oct cross-portfolio master. Start with an unclaimed task and verify the symptom before editing.

| Order | Priority | Existing reference | Action / why now |
|---:|:---:|---|---|
| 1 | P0 | [PR #371](https://github.com/joshualparris/JoshMemory/pull/371) | Fix proven invisible road/farm collision barriers; verify actual driving lanes and preserve valid fences. |
| 2 | P0 | [NR-REAL-018](repository-town/docs/NARROMINE_REALISM_CHECKLIST_2026-11-05.md) | Audit collision volumes against actual road and building polygons; keep player/vehicle routes usable. |
| 3 | P0 | RTN-007, RTN-009, RTN-011 | Reconfirm historical crowd/NPC collision and release blockers against current main; close or correct stale status before duplicate code. |
| 4 | P1 | [PR #363](https://github.com/joshualparris/JoshMemory/pull/363) | Phone driving HUD/compass controls must not overlap, hiding navigation. |
| 5 | P1 | [NR-REAL-002](repository-town/docs/NARROMINE_REALISM_CHECKLIST_2026-11-05.md) | Complete actual Narromine walking/interactive WebGL playtest; a source audit is not a walk. |
| 6 | P1 | [PR #377](https://github.com/joshualparris/JoshMemory/pull/377) | Remove unsupported north Dandaloo furniture *locations* without removing observed real trees/lamps. |
| 7 | P1 | [PR #366](https://github.com/joshualparris/JoshMemory/pull/366) | Correct unsupported hotel façade-blocking tree; review photographic provenance. |
| 8 | P1 | [Issue #332](https://github.com/joshualparris/JoshMemory/issues/332), [PR #358](https://github.com/joshualparris/JoshMemory/pull/358) | Finish the 55-view main-street building evidence register and corrected façades, one building at a time. |
| 9 | P1 | [Issue #355](https://github.com/joshualparris/JoshMemory/issues/355) | Audit Coles' real public entrance and interior evidence; avoid presenting fictional plan as true. |
| 10 | P1 | [NR-REAL-003/004/005](repository-town/docs/NARROMINE_REALISM_CHECKLIST_2026-11-05.md) | Replace unsupported building stand-ins and reconcile geospatial transforms/footprint evidence before mass architecture. |
| 11 | P1 | [RTGEO-005/007](repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_TODO.md) | Distinguish real flooding, water supply and ground data from fictional-world planning. |
| 12 | P2 | [PR #376](https://github.com/joshualparris/JoshMemory/pull/376) | Complete rail-yard playability and evidence-based crossing behaviour after road/navigation safety. |
| 13 | P2 | [PR #359](https://github.com/joshualparris/JoshMemory/pull/359), [Issue #157](https://github.com/joshualparris/JoshMemory/issues/157) | Finish the fictional 195-home park access / council planning evidence without claiming legal approvals. |

### Cross-portfolio priority retained (historical as of 25 Oct)

- The [existing 2,663-ID cross-portfolio master](MASTER_20_AGENT_TRIAGE_2026-10-25.md) places SylvieApp recorded-audio tasks **SVA-008** and **SVA-012** first at Josh's previous request; retain those IDs and priority *for that separate project*. Its 2,640 actionable/blocked rows do not equate to 2,640 confirmed code defects.
- Do not shift restricted/private repository names into this public register. Live external repository statuses need their own connector or repo verification.

## Current GitHub open issue/PR queue (snapshot)

| Type | Number | Priority | Work |
|---|---:|:---:|---|
| ISSUE | [381](https://github.com/joshualparris/JoshMemory/issues/381) | P2 | AUD-REPO-001 — audit and prioritise all unfinished JoshMemory work without renumbering existing IDs |
| ISSUE | [355](https://github.com/joshualparris/JoshMemory/issues/355) | P1 | Narromine Coles — verify true interior layout and improve merged interpretive model |
| ISSUE | [332](https://github.com/joshualparris/JoshMemory/issues/332) | P1 | Narromine main-street fidelity pilot: photo-match the Mitchell Highway shopping strip |
| ISSUE | [157](https://github.com/joshualparris/JoshMemory/issues/157) | P2 | Repository Town Council — Independent urban audit and ten-year plan (22 Oct 2026) |
| PR | [377](https://github.com/joshualparris/JoshMemory/pull/377) | P1 | Narromine realism checklist + NR-REAL-001 north furniture evidence correction |
| PR | [376](https://github.com/joshualparris/JoshMemory/pull/376) | P2 | feat(town): independent playable freight yard shunting and Narromine crossing evidence |
| PR | [371](https://github.com/joshualparris/JoshMemory/pull/371) | P0 | Fix invisible car wall: keep dairy/farm fences out of Repository Town avenues |
| PR | [366](https://github.com/joshualparris/JoshMemory/pull/366) | P1 | Narromine Hotel: remove one unsupported façade-blocking tree after street cleanup |
| PR | [363](https://github.com/joshualparris/JoshMemory/pull/363) | P1 | Driving HUD: keep compass and lane controls clear on short phones |
| PR | [359](https://github.com/joshualparris/JoshMemory/pull/359) | P2 | Council #157: quantify 195-home proposed road routes to park, with limits |
| PR | [358](https://github.com/joshualparris/JoshMemory/pull/358) | P1 | Narromine #332: auditable exact frontage IDs and LiDAR/photography evidence gaps |

## Newly numbered unfinished work — review register

These are task IDs, **not** claims of independently verified unresolved bugs. Do not renumber on subsequent scans.

| Priority | Permanent ID | Status/evidence | Extracted source action | Source |
|:---:|---|---|---|---|
| P1 | JMU-00030 | SOURCE_REPORTED_OPEN | Surveyed, map-checked LEP/DCP feasibility and formal building safety reports. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/195_HOME_DUBBO_PLANNING_CODE_AUDIT_2026-10-27.md#L71) |
| P1 | JMU-00035 | REVIEW_SOURCE_STATUS | Phone performance | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/IMPROVEMENT_PLAN_2026-10-19.md#L29) |
| P1 | JMU-00039 | SOURCE_REPORTED_OPEN | Run desktop/mobile Chromium visual QA at hotel, Post Office, Kierath's frontage, ordinary shops and roadway. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_MATERIAL_REALISM_2026-11-04.md#L33) |
| P1 | JMU-00041 | SOURCE_REPORTED_OPEN | Check WebGL shader compilation on real desktop/mobile devices, before merging. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_MATERIAL_REALISM_2026-11-04.md#L35) |
| P1 | JMU-00044 | SOURCE_REPORTED_OPEN | Real trees.** Place trees at LiDAR vegetation (class 3–5) clusters with their measured canopy height and spread; street trees only where LiDAR shows them. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L25) |
| P1 | JMU-00051 | SOURCE_REPORTED_OPEN | Street lights and signs.** OSM `highway=street_lamp`, traffic signs and the town-centre lights; only where mapped. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L41) |
| P1 | JMU-00053 | SOURCE_REPORTED_OPEN | Sky, light and colour.** Correct sun position for Narromine's latitude and season, a clear inland sky, and paint/roof colours sampled from NSW aerial imagery (not Str… | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L45) |
| P1 | JMU-00055 | SOURCE_REPORTED_OPEN | Rail completion.** Silo sidings in use, a fictional-but-labelled link to Repository Town if wanted, and freight wagons loading at the silos. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L49) |
| P1 | JMU-00070 | REVIEW_SOURCE_STATUS | Roads, rail, logistics and fuel | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md#L54) |
| P1 | JMU-00100 | SOURCE_REPORTED_OPEN | Combat.** Needs Josh's decision. It would sit outside the town's everyday life: for example, a fenced training ground or a quest dungeon, not villagers on the high st… | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L85) |
| P1 | JMU-00132 | SOURCE_REPORTED_OPEN | Keep gameplay/strategy controls primary. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L12) |
| P1 | JMU-00134 | SOURCE_REPORTED_OPEN | Add mobile/a11y and audio-conflict/persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L14) |
| P1 | JMU-00139 | REVIEW_SOURCE_STATUS | Rendering, UI, audio, and assets | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/buckland-blocks-demo/OPEN_SOURCE_VOXEL_INTEGRATION_PLAN.md#L77) |
| P1 | JMU-00174 | REVIEW_SOURCE_STATUS | Dialogue and Narrative | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L405) |
| P1 | JMU-00254 | SOURCE_REPORTED_OPEN | Hide/pause whenever narration, TTS, music or important game audio is active. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L11) |
| P1 | JMU-00256 | SOURCE_REPORTED_OPEN | Keep gameplay primary. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L13) |
| P1 | JMU-00257 | SOURCE_REPORTED_OPEN | Add mobile/a11y and audio-conflict/persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L14) |
| P1 | JMU-00268 | SOURCE_REPORTED_OPEN | Hide/pause the dock in any safety-critical, child-only or competing-audio context. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L12) |
| P1 | JMU-00270 | SOURCE_REPORTED_OPEN | Add mobile/a11y behaviour and tests for topic switching, persistence and bad entries. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L14) |
| P1 | JMU-00275 | SOURCE_REPORTED_OPEN | Hide/pause whenever game narration, TTS or other audio is active. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L11) |
| P1 | JMU-00278 | SOURCE_REPORTED_OPEN | Add mobile/a11y and audio-conflict/persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L14) |
| P1 | JMU-00285 | SOURCE_REPORTED_OPEN | Keep gameplay primary. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L13) |
| P1 | JMU-00286 | SOURCE_REPORTED_OPEN | Add mobile/a11y and audio-conflict/persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L14) |
| P1 | JMU-00293 | SOURCE_REPORTED_OPEN | faction standing changes tone/access rather than acting as hidden morality; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L450) |
| P1 | JMU-00306 | SOURCE_REPORTED_OPEN | Keep gameplay primary. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L13) |
| P1 | JMU-00307 | SOURCE_REPORTED_OPEN | Add mobile/a11y and audio-conflict/persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L14) |
| P1 | JMU-00324 | SOURCE_REPORTED_OPEN | Replace external video embeds with local audio content | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/QA-Recommendations.md#L46) |
| P1 | JMU-00325 | SOURCE_REPORTED_OPEN | Add lights-out fade and audio-only mode | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/QA-Recommendations.md#L47) |
| P1 | JMU-00328 | SOURCE_REPORTED_OPEN | Improve mobile tap targets and offline fallback | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/QA-Recommendations.md#L50) |
| P1 | JMU-00329 | SOURCE_REPORTED_OPEN | Curate a parent-reviewed Spotify/audio bank appropriate for bedtime. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L7) |
| P1 | JMU-00330 | SOURCE_REPORTED_OPEN | Add a simple collapsed **🌙 Bedtime audio** control that matches the existing curated-shelf model. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L8) |
| P1 | JMU-00335 | SOURCE_REPORTED_OPEN | Never play podcast audio at the same time as a bedtime video/story. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L13) |
| P1 | JMU-00336 | SOURCE_REPORTED_OPEN | Add parent-mode, audio-conflict, a11y and persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L14) |
| P1 | JMU-00343 | SOURCE_REPORTED_OPEN | Keep gameplay primary. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L13) |
| P1 | JMU-00344 | SOURCE_REPORTED_OPEN | Add mobile/a11y and audio-conflict/persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L14) |
| P1 | JMU-00353 | REVIEW_SOURCE_STATUS | Add Audio-First Interaction Pattern | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L64) |
| P1 | JMU-00374 | SOURCE_REPORTED_OPEN | Curate a parent-reviewed bank of literacy/phonics audio or suitable Spotify episodes. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L7) |
| P1 | JMU-00376 | SOURCE_REPORTED_OPEN | Add a simple **🎧 Listen to another reading/phonics audio** control only for approved items. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L9) |
| P1 | JMU-00380 | SOURCE_REPORTED_OPEN | Avoid competing audio during phonics exercises/read-aloud activities. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L13) |
| P1 | JMU-00381 | SOURCE_REPORTED_OPEN | Add parent-control, audio-conflict, a11y and persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L14) |
| P1 | JMU-00386 | SOURCE_REPORTED_OPEN | Add audio playback of the clue in sound-only form (`b-b-b`) and optional text. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L11) |
| P1 | JMU-00408 | SOURCE_REPORTED_OPEN | Apply it to word reading, word building, and sentence reading modes. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L45) |
| P1 | JMU-00412 | SOURCE_REPORTED_OPEN | Add audio prompts and a same-ending-sound explanation. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L52) |
| P1 | JMU-00440 | SOURCE_REPORTED_OPEN | Keep the five-step decision flow primary and never let audio imply the app has decided for the user. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/waypoint/podcasttodo.md#L12) |
| P1 | JMU-00441 | SOURCE_REPORTED_OPEN | Add mobile/a11y and selection/persistence tests. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/waypoint/podcasttodo.md#L13) |
| P2 | JMU-00009 | REVIEW_SOURCE_STATUS | Add `resume_work` | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L27) |
| P2 | JMU-00010 | REVIEW_SOURCE_STATUS | Add a machine-readable project registry | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L63) |
| P2 | JMU-00011 | REVIEW_SOURCE_STATUS | Add current-work leases | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L99) |
| P2 | JMU-00012 | REVIEW_SOURCE_STATUS | Separate `LIVE`, `CURRENT MEMORY`, `HISTORICAL`, and `DISCREPANCY` | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L131) |
| P2 | JMU-00013 | REVIEW_SOURCE_STATUS | Add live GitHub/deployment checks to resume | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L161) |
| P2 | JMU-00014 | REVIEW_SOURCE_STATUS | PR associated with current branch; | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L171) |
| P2 | JMU-00015 | REVIEW_SOURCE_STATUS | Automatically include relevant portfolio context | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L182) |
| P2 | JMU-00016 | REVIEW_SOURCE_STATUS | Strengthen automatic handoffs | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L203) |
| P2 | JMU-00017 | REVIEW_SOURCE_STATUS | Make `do_not_redo` first-class | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L224) |
| P2 | JMU-00018 | REVIEW_SOURCE_STATUS | Add tiny `RESUME.md` bootstrap files to major repos | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L244) |
| P2 | JMU-00019 | REVIEW_SOURCE_STATUS | Add a resume-quality test suite | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/FRESH_AGENT_RESUME_ROADMAP.md#L267) |
| P2 | JMU-00020 | REVIEW_SOURCE_STATUS | Current-work leases | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/OPEN_SOURCE_MEMORY_BORROWING_PLAN.md#L14) |
| P2 | JMU-00021 | REVIEW_SOURCE_STATUS | Trust separate from factual status | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/OPEN_SOURCE_MEMORY_BORROWING_PLAN.md#L20) |
| P2 | JMU-00022 | REVIEW_SOURCE_STATUS | Append-only work journal | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/OPEN_SOURCE_MEMORY_BORROWING_PLAN.md#L33) |
| P2 | JMU-00023 | REVIEW_SOURCE_STATUS | Resume brief | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/OPEN_SOURCE_MEMORY_BORROWING_PLAN.md#L39) |
| P2 | JMU-00024 | REVIEW_SOURCE_STATUS | Preserve JoshMemory's authority model | [source](https://github.com/joshualparris/JoshMemory/blob/main/docs/OPEN_SOURCE_MEMORY_BORROWING_PLAN.md#L50) |
| P2 | JMU-00025 | REVIEW_SOURCE_STATUS | Concept only, landscape plan absent | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/195_HOME_DUBBO_PLANNING_CODE_AUDIT_2026-10-27.md#L22) |
| P2 | JMU-00026 | SOURCE_REPORTED_OPEN | Every exterior door and interior visitor route manually walked on desktop and physical Android handset. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/195_HOME_DUBBO_PLANNING_CODE_AUDIT_2026-10-27.md#L67) |
| P2 | JMU-00027 | SOURCE_REPORTED_OPEN | Upper storeys modelled with genuinely safe usable stairs and exits. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/195_HOME_DUBBO_PLANNING_CODE_AUDIT_2026-10-27.md#L68) |
| P2 | JMU-00028 | SOURCE_REPORTED_OPEN | Road drainage and culverts with surveyed grade/destination. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/195_HOME_DUBBO_PLANNING_CODE_AUDIT_2026-10-27.md#L69) |
| P2 | JMU-00029 | SOURCE_REPORTED_OPEN | Per-lot reticulated civil/electrical designs and provider capacity approvals. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/195_HOME_DUBBO_PLANNING_CODE_AUDIT_2026-10-27.md#L70) |
| P2 | JMU-00031 | SOURCE_REPORTED_OPEN | Professionally certified statutory approval (only relevant to an actual site, not the fictional world). | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/195_HOME_DUBBO_PLANNING_CODE_AUDIT_2026-10-27.md#L72) |
| P2 | JMU-00032 | REVIEW_SOURCE_STATUS | Add a reason to play (biggest win) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/IMPROVEMENT_PLAN_2026-10-19.md#L10) |
| P2 | JMU-00033 | REVIEW_SOURCE_STATUS | Make the good games easy to find | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/IMPROVEMENT_PLAN_2026-10-19.md#L17) |
| P2 | JMU-00034 | REVIEW_SOURCE_STATUS | Fix the broken or missing games (cheap, concrete) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/IMPROVEMENT_PLAN_2026-10-19.md#L22) |
| P2 | JMU-00036 | REVIEW_SOURCE_STATUS | Process | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/IMPROVEMENT_PLAN_2026-10-19.md#L33) |
| P2 | JMU-00037 | SOURCE_REPORTED_OPEN | Execute `node tests/narromine-layout.mjs`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_MATERIAL_REALISM_2026-11-04.md#L31) |
| P2 | JMU-00038 | SOURCE_REPORTED_OPEN | Execute `node tools/build.mjs` and `node tools/check_privacy.mjs`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_MATERIAL_REALISM_2026-11-04.md#L32) |
| P2 | JMU-00040 | SOURCE_REPORTED_OPEN | Compare before and after screenshots and inspect under morning/midday/late afternoon lighting. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_MATERIAL_REALISM_2026-11-04.md#L34) |
| P2 | JMU-00042 | SOURCE_REPORTED_OPEN | Check draw calls, material count, frame times and shader artefacts. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_MATERIAL_REALISM_2026-11-04.md#L36) |
| P2 | JMU-00043 | SOURCE_REPORTED_OPEN | Merge PR and independently verify production `release.json`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_MATERIAL_REALISM_2026-11-04.md#L37) |
| P2 | JMU-00045 | SOURCE_REPORTED_OPEN | Property boundaries and fences.** Draw cadastral lot boundaries; front fences and driveways only where aerial imagery shows them. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L27) |
| P2 | JMU-00046 | SOURCE_REPORTED_OPEN | Road surfaces and markings.** Sealed vs unsealed from OSM `surface`; centre lines, edge lines, stop/give-way lines and signs at mapped intersections; real road widths. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L29) |
| P2 | JMU-00047 | SOURCE_REPORTED_OPEN | Kerb, gutter and footpaths.** Only on streets that have them (town centre and main streets per aerial imagery); gravel verges elsewhere. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L31) |
| P2 | JMU-00048 | SOURCE_REPORTED_OPEN | Terrain.** Use the LiDAR ground model (class 2) for gentle ground levels, the Macquarie River banks and drainage channels, instead of a flat plane. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L33) |
| P2 | JMU-00049 | SOURCE_REPORTED_OPEN | Ground cover and land use.** Paddocks, parks, sports ovals, the golf course, the aerodrome and industrial yards from OSM land use and aerial imagery colours. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L35) |
| P2 | JMU-00050 | SOURCE_REPORTED_OPEN | Power lines and poles.** OSM `power=line/pole` and LiDAR wire returns; re-add the south Dandaloo poles at their real positions. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L39) |
| P2 | JMU-00052 | SOURCE_REPORTED_OPEN | Business names and land uses.** Check all 98 named places against OSM and council listings; remove closed businesses; keep historical names only with a date label. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L43) |
| P2 | JMU-00054 | SOURCE_REPORTED_OPEN | Traffic and people at realistic levels.** Car and pedestrian numbers that match a town of about 3,400 people; trucks on the Mitchell Highway. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L47) |
| P2 | JMU-00056 | SOURCE_REPORTED_OPEN | Owner by-eye review.** Josh compares each block with the Street View compare page and files differences; each becomes a numbered item here. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_REALISM_TODO.md#L51) |
| P2 | JMU-00057 | REVIEW_SOURCE_STATUS | Why Narromine, and where it sits | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L7) |
| P2 | JMU-00058 | REVIEW_SOURCE_STATUS | Population (2021 Census, ABS — use these, not commercial profiles) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L17) |
| P2 | JMU-00059 | REVIEW_SOURCE_STATUS | Country and First Nations | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L34) |
| P2 | JMU-00060 | REVIEW_SOURCE_STATUS | History timeline (for in-game plaques and the museum) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L46) |
| P2 | JMU-00061 | REVIEW_SOURCE_STATUS | Places to build (the first playable town) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L68) |
| P2 | JMU-00062 | REVIEW_SOURCE_STATUS | Economy and land (drives farms, trucks and jobs) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L83) |
| P2 | JMU-00063 | REVIEW_SOURCE_STATUS | People rule | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L93) |
| P2 | JMU-00064 | REVIEW_SOURCE_STATUS | How to make Narromine drivable — the plan | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L101) |
| P2 | JMU-00065 | REVIEW_SOURCE_STATUS | question: should Trangie and Tomingley follow later in the same way? | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/NARROMINE_RESEARCH_AND_PLAN_2026-11-03.md#L156) |
| P2 | JMU-00066 | REVIEW_SOURCE_STATUS | Location decisions and geometric transform | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md#L11) |
| P2 | JMU-00067 | REVIEW_SOURCE_STATUS | Exact climate proxy and rainfall | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md#L23) |
| P2 | JMU-00068 | REVIEW_SOURCE_STATUS | Electricity: verified upstream chain and chosen simulation design | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md#L38) |
| P2 | JMU-00069 | REVIEW_SOURCE_STATUS | Water, sewer, stormwater and flooding | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md#L46) |
| P2 | JMU-00071 | REVIEW_SOURCE_STATUS | Town identity and game compatibility | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md#L62) |
| P2 | JMU-00072 | REVIEW_SOURCE_STATUS | No-guess engineering data acquisition | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md#L70) |
| P2 | JMU-00073 | REVIEW_SOURCE_STATUS | Identity, deterministic director and graph integrity (P0) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L28) |
| P2 | JMU-00074 | REVIEW_SOURCE_STATUS | Conversation behaviour and accessible player controls (P1) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L40) |
| P2 | JMU-00075 | REVIEW_SOURCE_STATUS | Authoritative world, quests, repairs, commerce and negative outcomes (P1) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L61) |
| P2 | JMU-00076 | REVIEW_SOURCE_STATUS | Per-actor memory, save migration and privacy (P1) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L80) |
| P2 | JMU-00077 | REVIEW_SOURCE_STATUS | Authentic ElevenLabs voice manifest, playback and fault recovery (P1) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L96) |
| P2 | JMU-00078 | REVIEW_SOURCE_STATUS | Living NPC context, character pilots, new scripts and cast expansion (P2) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L117) |
| P2 | JMU-00079 | REVIEW_SOURCE_STATUS | Remaining actor presentation, optional AI and information journal (P2) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L139) |
| P2 | JMU-00080 | REVIEW_SOURCE_STATUS | Full interactive acceptance and release across actual hosts (P3) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md#L151) |
| P2 | JMU-00081 | REVIEW_SOURCE_STATUS | First slice: woodcutting, firemaking, XP and levels | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L21) |
| P2 | JMU-00082 | REVIEW_SOURCE_STATUS | Next skills, in order | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L37) |
| P2 | JMU-00083 | SOURCE_REPORTED_OPEN | Cooking on a fire you lit (feeds the hunger system). | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L39) |
| P2 | JMU-00084 | SOURCE_REPORTED_OPEN | Fishing at the river or dam, then cooking the catch. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L40) |
| P2 | JMU-00085 | SOURCE_REPORTED_OPEN | Turn existing jobs into skills: baking, farming and café work earn Cooking and Farming XP alongside the wages. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L41) |
| P2 | JMU-00086 | SOURCE_REPORTED_OPEN | Mining and smithing at the Foundry. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L43) |
| P2 | JMU-00087 | SOURCE_REPORTED_OPEN | Bag capacity, banking (Community Bank) and noted or stacked goods. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L44) |
| P2 | JMU-00088 | REVIEW_SOURCE_STATUS | Skyrim elements | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L46) |
| P2 | JMU-00089 | SOURCE_REPORTED_OPEN | Quest chains with townspeople, starting from the Expedition Guild relics. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L50) |
| P2 | JMU-00090 | SOURCE_REPORTED_OPEN | Lockpicking (there is now a locksmith), with legal and illegal uses. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L51) |
| P2 | JMU-00091 | SOURCE_REPORTED_OPEN | Books to find and read in houses that teach lore or grant small XP boosts. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L52) |
| P2 | JMU-00092 | SOURCE_REPORTED_OPEN | A "dungeon" under the old mine. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L53) |
| P2 | JMU-00093 | SOURCE_REPORTED_OPEN | Combat and dragons: much later, if ever. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L54) |
| P2 | JMU-00094 | REVIEW_SOURCE_STATUS | Characters and accounts (Settings, optional) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L56) |
| P2 | JMU-00095 | SOURCE_REPORTED_OPEN | Customise character in Settings: name, look and colours, any time. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L58) |
| P2 | JMU-00096 | SOURCE_REPORTED_OPEN | Optional account: sign in to keep skills across devices, built on the existing export/import save. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L59) |
| P2 | JMU-00097 | REVIEW_SOURCE_STATUS | Engine, RuneScape-style (Josh's seven steps, 28 Oct 2026) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L61) |
| P2 | JMU-00098 | SOURCE_REPORTED_OPEN | Items and inventory.** Already partly built (item types, 28-slot bag, drop/pick up, equip). Next: one numbered item list and a 4 × 7 grid bag that looks like RuneScape's. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L80) |
| P2 | JMU-00099 | SOURCE_REPORTED_OPEN | Skilling framework.** One action state machine (target → level check → per-tick roll → item + XP → respawn) that woodcutting and firemaking move onto; then mining, fi… | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L82) |
| P2 | JMU-00101 | SOURCE_REPORTED_OPEN | Multiplayer, trading, banks.** The bank exists (savings, ATM). Real multiplayer needs a server and accounts (Vercel functions + a database), which belongs with sectio… | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L87) |
| P2 | JMU-00102 | SOURCE_REPORTED_OPEN | Quests.** The Expedition Guild and the RTD quests already track progress in the save. A short "first day in town" tutorial quest would exercise every system above. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/docs/RUNESCAPE_ROADMAP.md#L89) |
| P2 | JMU-00127 | SOURCE_REPORTED_OPEN | Curate about 25 Spotify episodes relevant to tactical strategy and game design. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L7) |
| P2 | JMU-00128 | SOURCE_REPORTED_OPEN | Add a collapsed bottom dock: **🎧 Listen to a different strategy/game-design podcast**. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L8) |
| P2 | JMU-00129 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist recent choices and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L9) |
| P2 | JMU-00130 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L10) |
| P2 | JMU-00131 | SOURCE_REPORTED_OPEN | Hide/pause whenever game music, narration or important sound cues are active. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L11) |
| P2 | JMU-00133 | SOURCE_REPORTED_OPEN | Keep episode data separate from game logic. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/breach-command/podcasttodo.md#L13) |
| P2 | JMU-00135 | REVIEW_SOURCE_STATUS | Provenance and compliance | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/buckland-blocks-demo/OPEN_SOURCE_VOXEL_INTEGRATION_PLAN.md#L48) |
| P2 | JMU-00136 | REVIEW_SOURCE_STATUS | Native voxel engine improvements | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/buckland-blocks-demo/OPEN_SOURCE_VOXEL_INTEGRATION_PLAN.md#L56) |
| P2 | JMU-00137 | REVIEW_SOURCE_STATUS | Survival and simulation | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/buckland-blocks-demo/OPEN_SOURCE_VOXEL_INTEGRATION_PLAN.md#L63) |
| P2 | JMU-00138 | REVIEW_SOURCE_STATUS | Inventory, crafting, and content data | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/buckland-blocks-demo/OPEN_SOURCE_VOXEL_INTEGRATION_PLAN.md#L70) |
| P2 | JMU-00140 | REVIEW_SOURCE_STATUS | Multiplayer and distribution boundary | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/buckland-blocks-demo/OPEN_SOURCE_VOXEL_INTEGRATION_PLAN.md#L84) |
| P2 | JMU-00165 | REVIEW_SOURCE_STATUS | Character System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L179) |
| P2 | JMU-00166 | REVIEW_SOURCE_STATUS | Party and Companion AI | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L222) |
| P2 | JMU-00167 | REVIEW_SOURCE_STATUS | Dungeon Floor System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L247) |
| P2 | JMU-00168 | REVIEW_SOURCE_STATUS | System AI and Announcements | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L268) |
| P2 | JMU-00169 | REVIEW_SOURCE_STATUS | Combat | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L290) |
| P2 | JMU-00170 | REVIEW_SOURCE_STATUS | Loot and Inventory | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L320) |
| P2 | JMU-00171 | REVIEW_SOURCE_STATUS | Quest System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L344) |
| P2 | JMU-00172 | REVIEW_SOURCE_STATUS | Class, Race, and Progression | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L369) |
| P2 | JMU-00173 | REVIEW_SOURCE_STATUS | Viewer, Sponsor, and Show Mechanics | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L384) |
| P2 | JMU-00175 | REVIEW_SOURCE_STATUS | UI | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L446) |
| P2 | JMU-00176 | REVIEW_SOURCE_STATUS | Save System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L469) |
| P2 | JMU-00177 | REVIEW_SOURCE_STATUS | grassland-style biome. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/carl/Dungeon_Crawler_Carl_Game_Build_Plan.md#L862) |
| P2 | JMU-00250 | SOURCE_REPORTED_OPEN | Curate about 25 Spotify episodes across RPG/fantasy topics. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L7) |
| P2 | JMU-00251 | SOURCE_REPORTED_OPEN | Add a collapsed bottom dock: **🎧 Listen to a different RPG/fantasy podcast**. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L8) |
| P2 | JMU-00252 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist recent choices and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L9) |
| P2 | JMU-00253 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L10) |
| P2 | JMU-00255 | SOURCE_REPORTED_OPEN | Tag episodes by quests, encounters, story craft, DM advice and worldbuilding. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/forbidden-quests/podcasttodo.md#L12) |
| P2 | JMU-00258 | REVIEW_SOURCE_STATUS | Quest System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/hub-newgame/GAME_IMPROVEMENTS.md#L3) |
| P2 | JMU-00259 | REVIEW_SOURCE_STATUS | Equipment System (Weapons & Armor) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/hub-newgame/GAME_IMPROVEMENTS.md#L19) |
| P2 | JMU-00260 | REVIEW_SOURCE_STATUS | Magic/Spell System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/hub-newgame/GAME_IMPROVEMENTS.md#L35) |
| P2 | JMU-00261 | REVIEW_SOURCE_STATUS | Mini-Map & Exploration System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/hub-newgame/GAME_IMPROVEMENTS.md#L52) |
| P2 | JMU-00262 | REVIEW_SOURCE_STATUS | Save/Load System & Progression Persistence | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/hub-newgame/GAME_IMPROVEMENTS.md#L68) |
| P2 | JMU-00263 | SOURCE_REPORTED_OPEN | Add the reusable **Josh Podcast Dock** as a global bottom component. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L7) |
| P2 | JMU-00264 | SOURCE_REPORTED_OPEN | Support topic keys so each section can request its own curated episode bank. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L8) |
| P2 | JMU-00265 | SOURCE_REPORTED_OPEN | Seed mature topics with about 25 Spotify episodes each. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L9) |
| P2 | JMU-00266 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist current/recent selections and avoid repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L10) |
| P2 | JMU-00267 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L11) |
| P2 | JMU-00269 | SOURCE_REPORTED_OPEN | Keep topic/episode data separate from UI code and easy to refresh. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/joshplatform/podcasttodo.md#L13) |
| P2 | JMU-00271 | SOURCE_REPORTED_OPEN | Curate about 25 legitimate Spotify discussion/analysis episodes; do not use pirated audiobook sources. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L7) |
| P2 | JMU-00272 | SOURCE_REPORTED_OPEN | Add a collapsed bottom dock: **📖 Listen to a different Kingkiller/fantasy podcast**. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L8) |
| P2 | JMU-00273 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist recent choices and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L9) |
| P2 | JMU-00274 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L10) |
| P2 | JMU-00276 | SOURCE_REPORTED_OPEN | Tag episodes by lore, character analysis, worldbuilding, writing craft and fantasy literature. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L12) |
| P2 | JMU-00277 | SOURCE_REPORTED_OPEN | Keep game/adventure interactions primary. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/kkc-adventure/podcasttodo.md#L13) |
| P2 | JMU-00279 | SOURCE_REPORTED_OPEN | Curate about 25 Spotify episodes relevant to narrative/fantasy game craft. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L7) |
| P2 | JMU-00280 | SOURCE_REPORTED_OPEN | Add a collapsed bottom dock: **🏮 Listen to a different storytelling/game podcast**. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L8) |
| P2 | JMU-00281 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist recent choices and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L9) |
| P2 | JMU-00282 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L10) |
| P2 | JMU-00283 | SOURCE_REPORTED_OPEN | Hide/pause whenever narration, TTS, music or important sound cues are active. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L11) |
| P2 | JMU-00284 | SOURCE_REPORTED_OPEN | Tag episodes by story craft, interactive fiction, worldbuilding and game design. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/podcasttodo.md#L12) |
| P2 | JMU-00287 | SOURCE_REPORTED_OPEN | the campaign uses day windows rather than a single forced quest order; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L444) |
| P2 | JMU-00288 | SOURCE_REPORTED_OPEN | the mid-campaign revelation can be delivered through more than one plausible route; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L445) |
| P2 | JMU-00289 | SOURCE_REPORTED_OPEN | the Moonmere chart strengthens evidence but its absence does not break the campaign; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L446) |
| P2 | JMU-00290 | SOURCE_REPORTED_OPEN | low renown produces reduced influence rather than a contentless failure screen; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L447) |
| P2 | JMU-00291 | SOURCE_REPORTED_OPEN | the final hard choice is between trade-offs, not obvious good/evil options; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L448) |
| P2 | JMU-00292 | SOURCE_REPORTED_OPEN | all six current questlines can contribute a named ending callback; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L449) |
| P2 | JMU-00294 | SOURCE_REPORTED_OPEN | party relationships/personal arcs can alter epilogue tone; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L451) |
| P2 | JMU-00295 | SOURCE_REPORTED_OPEN | the Common Road remains costly and imperfect; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L452) |
| P2 | JMU-00296 | SOURCE_REPORTED_OPEN | the Fractured March still honours local successes/failures; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L453) |
| P2 | JMU-00297 | SOURCE_REPORTED_OPEN | the ending references what the player actually did rather than inventing closure; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L454) |
| P2 | JMU-00298 | SOURCE_REPORTED_OPEN | no player-facing text uses the internal term “world flag”; | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L455) |
| P2 | JMU-00299 | SOURCE_REPORTED_OPEN | exact faction names follow `docs/TERMINOLOGY.md`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/lantern-road/story/campaign/ENDING-MATRIX.md#L456) |
| P2 | JMU-00300 | SOURCE_REPORTED_OPEN | Curate about 25 Spotify episodes relevant to the game's design/genre. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L7) |
| P2 | JMU-00301 | SOURCE_REPORTED_OPEN | Add a collapsed bottom dock: **🎧 Listen to a different narrative-game podcast**. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L8) |
| P2 | JMU-00302 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist recent choices and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L9) |
| P2 | JMU-00303 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L10) |
| P2 | JMU-00304 | SOURCE_REPORTED_OPEN | Hide/pause whenever game music, narration, TTS or important sound cues are active. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L11) |
| P2 | JMU-00305 | SOURCE_REPORTED_OPEN | Tag episodes by narrative design, interactive fiction, story craft and indie development. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/midnight-line/podcasttodo.md#L12) |
| P2 | JMU-00308 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | This prevents the assignment of defaultValue to regular | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L3233) |
| P2 | JMU-00309 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | Remove Update flag from before mutation phase by re-landing Visibility | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L6355) |
| P2 | JMU-00310 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | Disabled elements should not respond to mouse events | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L9428) |
| P2 | JMU-00311 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | ideally, we'd eventually add all events from | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L9483) |
| P2 | JMU-00312 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | Only ignore them on controlled tags. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L10344) |
| P2 | JMU-00313 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | Distinguish by namespace here -- for <title>, including it here | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L10551) |
| P2 | JMU-00314 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | Delete this argument when we remove the legacy root API. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L11833) |
| P2 | JMU-00315 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | In some cases, we'll end up checking if context has changed twice, | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L16467) |
| P2 | JMU-00316 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | When we delete legacy mode, we should make this error argument | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L17829) |
| P2 | JMU-00317 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | Remove this dead flag | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L20119) |
| P2 | JMU-00318 | NEEDS_REVIEW_NOT_VERIFIED_OPEN | Remove outdated deferRenderPhaseUpdateToNextBatch experiment. We | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/multi-layer-zoom-game/index.html#L21100) |
| P2 | JMU-00319 | REVIEW_SOURCE_STATUS | Quest System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/ptshub-newgame/GAME_IMPROVEMENTS.md#L3) |
| P2 | JMU-00320 | REVIEW_SOURCE_STATUS | Equipment System (Weapons & Armor) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/ptshub-newgame/GAME_IMPROVEMENTS.md#L19) |
| P2 | JMU-00321 | REVIEW_SOURCE_STATUS | Magic/Spell System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/ptshub-newgame/GAME_IMPROVEMENTS.md#L35) |
| P2 | JMU-00322 | REVIEW_SOURCE_STATUS | Mini-Map & Exploration System | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/ptshub-newgame/GAME_IMPROVEMENTS.md#L52) |
| P2 | JMU-00323 | REVIEW_SOURCE_STATUS | Save/Load System & Progression Persistence | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/ptshub-newgame/GAME_IMPROVEMENTS.md#L68) |
| P2 | JMU-00326 | SOURCE_REPORTED_OPEN | Add session timer and offline bedtime transition | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/QA-Recommendations.md#L48) |
| P2 | JMU-00327 | SOURCE_REPORTED_OPEN | Add parent gate and bedtime warning | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/QA-Recommendations.md#L49) |
| P2 | JMU-00331 | SOURCE_REPORTED_OPEN | One tap may choose/load another approved item; persist favourites/recent selections and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L9) |
| P2 | JMU-00332 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L10) |
| P2 | JMU-00333 | SOURCE_REPORTED_OPEN | Do not expose unrestricted podcast discovery or external recommendation feeds in Kid/Sylvie mode. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L11) |
| P2 | JMU-00334 | SOURCE_REPORTED_OPEN | Keep bedtime UI low-stimulation and allow the control to be hidden entirely. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sleepy/podcasttodo.md#L12) |
| P2 | JMU-00337 | SOURCE_REPORTED_OPEN | Curate about 25 Spotify episodes relevant to the game's themes and design. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L7) |
| P2 | JMU-00338 | SOURCE_REPORTED_OPEN | Add a collapsed bottom dock: **🚀 Listen to a different sci-fi/fantasy podcast**. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L8) |
| P2 | JMU-00339 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist recent choices and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L9) |
| P2 | JMU-00340 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L10) |
| P2 | JMU-00341 | SOURCE_REPORTED_OPEN | Hide/pause whenever game music, narration, TTS or important sound cues are active. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L11) |
| P2 | JMU-00342 | SOURCE_REPORTED_OPEN | Tag episodes by sci-fi, worldbuilding, story craft and game design. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/starhaven/podcasttodo.md#L12) |
| P2 | JMU-00345 | SOURCE_REPORTED_OPEN | Add scaffolded hints and error coaching | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/QA-Recommendations.md#L51) |
| P2 | JMU-00346 | SOURCE_REPORTED_OPEN | Add session timer and closing ritual | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/QA-Recommendations.md#L52) |
| P2 | JMU-00347 | SOURCE_REPORTED_OPEN | Add movement/breathing breaks | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/QA-Recommendations.md#L53) |
| P2 | JMU-00348 | SOURCE_REPORTED_OPEN | Separate sound tasks from letter tasks | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/QA-Recommendations.md#L54) |
| P2 | JMU-00349 | SOURCE_REPORTED_OPEN | Add visible parent prompts | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/QA-Recommendations.md#L55) |
| P2 | JMU-00350 | REVIEW_SOURCE_STATUS | Make the Learning Sequence Explicit | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L24) |
| P2 | JMU-00351 | REVIEW_SOURCE_STATUS | Add a "Sylvie's Name" Anchor | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L42) |
| P2 | JMU-00352 | REVIEW_SOURCE_STATUS | Review Decodable Word Lists | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L52) |
| P2 | JMU-00354 | REVIEW_SOURCE_STATUS | Standardize Scaffolded Feedback | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L78) |
| P2 | JMU-00355 | REVIEW_SOURCE_STATUS | Add Australian Voice Guidance | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L94) |
| P2 | JMU-00356 | REVIEW_SOURCE_STATUS | Add Session Timing Rules | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L105) |
| P2 | JMU-00357 | REVIEW_SOURCE_STATUS | Add Co-Play Prompts | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L119) |
| P2 | JMU-00358 | REVIEW_SOURCE_STATUS | Add Physical Sound Hunts | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L127) |
| P2 | JMU-00359 | REVIEW_SOURCE_STATUS | Strengthen Parent/Educator Notes | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L138) |
| P2 | JMU-00360 | REVIEW_SOURCE_STATUS | Add Therapist Review Workflow | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L154) |
| P2 | JMU-00361 | REVIEW_SOURCE_STATUS | Keep Cultural and Regional Context Safe | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L166) |
| P2 | JMU-00362 | REVIEW_SOURCE_STATUS | Add Research QA Checklist | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L177) |
| P2 | JMU-00363 | REVIEW_SOURCE_STATUS | Add Gentle Progress Indicators | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/ResearchImplementationRoadmap.md#L188) |
| P2 | JMU-00364 | REVIEW_SOURCE_STATUS | Phoneme “sound boxes” game (fixes Outcome 5 literacy depth) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L9) |
| P2 | JMU-00365 | REVIEW_SOURCE_STATUS | Light numeracy strand — repeating patterns + sort-by-one-attribute (Outcome 4 / 5 “pattern systems”) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L28) |
| P2 | JMU-00366 | REVIEW_SOURCE_STATUS | Wellbeing micro-break interstitial (Outcome 3) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L44) |
| P2 | JMU-00367 | REVIEW_SOURCE_STATUS | Early-years context picker — state names + programme labels (Partnerships / vocabulary alignment) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L60) |
| P2 | JMU-00368 | REVIEW_SOURCE_STATUS | Adult-only EYLF outcome tags on games (Transparency + educator conversations) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L75) |
| P2 | JMU-00369 | REVIEW_SOURCE_STATUS | Session handover recap — clipboard + print (Continuity / Partnerships) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L90) |
| P2 | JMU-00370 | REVIEW_SOURCE_STATUS | Accessibility & equity knobs (Framework principles — equity, wellbeing, ICT safe use hints) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L105) |
| P2 | JMU-00371 | REVIEW_SOURCE_STATUS | Coach content pack — growth mindset + co-play scaffolds (Outcome 1 / Outcome 4) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L120) |
| P2 | JMU-00372 | REVIEW_SOURCE_STATUS | Content externalisation hook (Respect for diversity — **process**, not placeholder culture) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L135) |
| P2 | JMU-00373 | REVIEW_SOURCE_STATUS | Extend blending scaffolding coverage (Outcome 5 — auditory discrimination & blending parity) | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/docs/eylf-implementation-tasks.md#L150) |
| P2 | JMU-00375 | SOURCE_REPORTED_OPEN | Put discovery/management behind a parent surface; child-facing use should be simple and bounded. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L8) |
| P2 | JMU-00377 | SOURCE_REPORTED_OPEN | Persist approved choices/recent items locally and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L10) |
| P2 | JMU-00378 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L11) |
| P2 | JMU-00379 | SOURCE_REPORTED_OPEN | Never allow external feed/search browsing from the child experience. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/podcasttodo.md#L12) |
| P2 | JMU-00382 | SOURCE_REPORTED_OPEN | Add a new game mode called `I Spy Sound`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L7) |
| P2 | JMU-00383 | SOURCE_REPORTED_OPEN | Create prompts like `I spy something that begins with /b/`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L8) |
| P2 | JMU-00384 | SOURCE_REPORTED_OPEN | Show image or letter choices that begin with several sounds. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L9) |
| P2 | JMU-00385 | SOURCE_REPORTED_OPEN | Add logic to select a random target sound, then filter choices so only one correct option matches that initial sound. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L10) |
| P2 | JMU-00387 | SOURCE_REPORTED_OPEN | Track success and give positive feedback when the child taps the right object. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L12) |
| P2 | JMU-00388 | SOURCE_REPORTED_OPEN | Add a tracing activity screen with a letter outline. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L16) |
| P2 | JMU-00389 | SOURCE_REPORTED_OPEN | Render each letter as a large touch/cursor trace path. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L17) |
| P2 | JMU-00390 | SOURCE_REPORTED_OPEN | Add stroke detection or trace progress when the user drags along the path. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L18) |
| P2 | JMU-00391 | SOURCE_REPORTED_OPEN | Play the letter sound as the child traces. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L19) |
| P2 | JMU-00392 | SOURCE_REPORTED_OPEN | Add alternative sand, cream, or paint styles using a visual overlay and tactile-looking animation. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L20) |
| P2 | JMU-00393 | SOURCE_REPORTED_OPEN | Provide a done button and reinforcement message when tracing is complete. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L21) |
| P2 | JMU-00394 | SOURCE_REPORTED_OPEN | Add a scavenger hunt mode with an initial sound target like `/s/`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L25) |
| P2 | JMU-00395 | SOURCE_REPORTED_OPEN | Show a set of household object pictures or names. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L26) |
| P2 | JMU-00396 | SOURCE_REPORTED_OPEN | Ask the child to pick every item that starts with the target sound. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L27) |
| P2 | JMU-00397 | SOURCE_REPORTED_OPEN | Add a find-more screen with multiple rounds and a counter of found items. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L28) |
| P2 | JMU-00398 | SOURCE_REPORTED_OPEN | Optionally offer a real-world mode that uses pictures of spoon, sock, sun, etc. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L29) |
| P2 | JMU-00399 | SOURCE_REPORTED_OPEN | Add a draggable block-based builder for CVC words. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L33) |
| P2 | JMU-00400 | SOURCE_REPORTED_OPEN | Display letter blocks that the child can drag into a row. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L34) |
| P2 | JMU-00401 | SOURCE_REPORTED_OPEN | When blocks are placed into order, speak each sound separately then blend them together. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L35) |
| P2 | JMU-00402 | SOURCE_REPORTED_OPEN | Add a slide-together animation to show the blocks joining into a word. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L36) |
| P2 | JMU-00403 | SOURCE_REPORTED_OPEN | Offer target words from the existing phonics list and gradually increase complexity. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L37) |
| P2 | JMU-00404 | SOURCE_REPORTED_OPEN | Add a robot voice toggle/button in blending or reading games. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L41) |
| P2 | JMU-00405 | SOURCE_REPORTED_OPEN | When activated, speak words in segmented form: `d - o - g` then blended: `dog`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L42) |
| P2 | JMU-00406 | SOURCE_REPORTED_OPEN | Use the same `SpeechSynthesisUtterance` path, but with short gaps between phonemes. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L43) |
| P2 | JMU-00407 | SOURCE_REPORTED_OPEN | Add a label or icon so adults know this is a blending support mode. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L44) |
| P2 | JMU-00409 | SOURCE_REPORTED_OPEN | Add a rhyming match mode that shows word pairs. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L49) |
| P2 | JMU-00410 | SOURCE_REPORTED_OPEN | Present one word and several choices; ask `Which word rhymes with cat?`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L50) |
| P2 | JMU-00411 | SOURCE_REPORTED_OPEN | Use a grid or card flip interface for matching pairs. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L51) |
| P2 | JMU-00413 | SOURCE_REPORTED_OPEN | Track correct rhymes and optionally introduce simple rhyme families like `-at`, `-og`, `-ip`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L53) |
| P2 | JMU-00414 | SOURCE_REPORTED_OPEN | Add a song/chant mode for letter sounds. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L57) |
| P2 | JMU-00415 | SOURCE_REPORTED_OPEN | Build short vocal loops like `What does the /s/ say? /s/ /s/ /s/`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L58) |
| P2 | JMU-00416 | SOURCE_REPORTED_OPEN | Display a letter and animate bouncing sound icons while the app sings. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L59) |
| P2 | JMU-00417 | SOURCE_REPORTED_OPEN | Add repeat and next-sound controls so the child can listen to sets of letters. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L60) |
| P2 | JMU-00418 | SOURCE_REPORTED_OPEN | Include a sing-with-me prompt to reinforce auditory memory. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L61) |
| P2 | JMU-00419 | SOURCE_REPORTED_OPEN | Add a game where letters appear on the floor or tiles. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L65) |
| P2 | JMU-00420 | SOURCE_REPORTED_OPEN | Prompt the child with a sound: `Jump on the letter that says /m/`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L66) |
| P2 | JMU-00421 | SOURCE_REPORTED_OPEN | Make the answer selection visual and active, such as big tiles or buttons arranged like stepping stones. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L67) |
| P2 | JMU-00422 | SOURCE_REPORTED_OPEN | Add keyboard shortcuts or touch zones for jumping. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L68) |
| P2 | JMU-00423 | SOURCE_REPORTED_OPEN | Provide an animated jump response and congratulatory feedback. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L69) |
| P2 | JMU-00424 | SOURCE_REPORTED_OPEN | Add a phoneme segmentation activity. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L73) |
| P2 | JMU-00425 | SOURCE_REPORTED_OPEN | Show a word and empty boxes for each sound. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L74) |
| P2 | JMU-00426 | SOURCE_REPORTED_OPEN | Provide draggable counters or dots. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L75) |
| P2 | JMU-00427 | SOURCE_REPORTED_OPEN | Ask the child to move one counter into each box while saying each sound. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L76) |
| P2 | JMU-00428 | SOURCE_REPORTED_OPEN | After placement, speak each sound again and blend into the whole word. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L77) |
| P2 | JMU-00429 | SOURCE_REPORTED_OPEN | Use simple CVC words first, then longer words as difficulty increases. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L78) |
| P2 | JMU-00430 | SOURCE_REPORTED_OPEN | Add a mode that uses familiar logos, food labels, and signs. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L82) |
| P2 | JMU-00431 | SOURCE_REPORTED_OPEN | Show real-world word graphics and ask `What sound does this start with?`. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L83) |
| P2 | JMU-00432 | SOURCE_REPORTED_OPEN | Build a mini gallery of simple labels with obvious initial sounds. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L84) |
| P2 | JMU-00433 | SOURCE_REPORTED_OPEN | Add a spot-the-sound prompt rather than focusing on letter names. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L85) |
| P2 | JMU-00434 | SOURCE_REPORTED_OPEN | Reinforce that letters represent sounds in everyday print. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/sylvie-phonetics/suggestions.md#L86) |
| P2 | JMU-00435 | SOURCE_REPORTED_OPEN | Curate about 25 high-quality Spotify episodes on decision-making and values. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/waypoint/podcasttodo.md#L7) |
| P2 | JMU-00436 | SOURCE_REPORTED_OPEN | Add a collapsed bottom dock: **🧭 Listen to a different decision podcast**. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/waypoint/podcasttodo.md#L8) |
| P2 | JMU-00437 | SOURCE_REPORTED_OPEN | One tap selects/loads another episode; persist recent choices and avoid immediate repeats. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/waypoint/podcasttodo.md#L9) |
| P2 | JMU-00438 | SOURCE_REPORTED_OPEN | Use Spotify embed/deep links without assuming autoplay. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/waypoint/podcasttodo.md#L10) |
| P2 | JMU-00439 | SOURCE_REPORTED_OPEN | Tag episodes by uncertainty, values, habits, courage, reversible decisions and reflection. | [source](https://github.com/joshualparris/JoshMemory/blob/main/repository-town/games/waypoint/podcasttodo.md#L11) |

## Audit counts and ownership

| Priority | Source-reported count |
|---|---:|
| P0 | 27 |
| P1 | 150 |
| P2 | 816 |
| P3 | 2,098 |
| REF | 0 |

### Counts by extraction family

| Source family | Count |
|---|---:|
| legacy_master_2026_10_25 | 2,663 |
| markdown_checkbox | 241 |
| numbered_action_heading | 100 |
| status_table | 47 |
| json_status | 26 |
| code_comment | 11 |
| status_bullet | 3 |

## Reconciliation / next review actions

1. Verify high-priority tasks on **latest** main, production SHA and real desktop/Android-sized gameplay. If already fixed, update the **canonical original tracker**, not only this mirror.
2. Check and reconcile any reused IDs that refer to different subtasks in historic sources; never infer that two different prefixes mean the same task.
3. Assign claims by **feature**, not geographic monopoly, under [Repository Town parallel-agent rules](repository-town/docs/PARALLEL_AGENT_COORDINATION.md). Do not overwrite other agents' branches.
4. Review the generated JMU candidates and remove false positives only with a recorded reason. Keep allocated IDs in the ID map as reserved, even after closure, to prevent reuse.
5. Refresh the GitHub snapshot and the underlying canonical portfolio/task sources before making future changes. The generated CSV is a **triage index**, not a replacement for source-of-truth ownership, statuses or completion evidence.

Generated by tools/audit_open_tasks.py, with reproducible inputs and stable cross-run ID allocation.
