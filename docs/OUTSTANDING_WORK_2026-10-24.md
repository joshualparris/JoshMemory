> **PORTFOLIO MASTER EXECUTION ENTRY POINT (25 Oct):** [20-agent risk/dependency triage](MASTER_20_AGENT_TRIAGE_2026-10-25.md) · [complete 2,663-row ordered task register](MASTER_20_AGENT_EXECUTION_QUEUE_2026-10-25.csv) · [unresolved report intake IDs](MASTER_AGENT_REPORT_INTAKE_IDS_2026-10-25.md). Start at rank **00001 / SVA-008** (SylvieApp clip integrity), then **00002 / SVA-012** (shared playback); DCS-only items are now deferred to **02576–02640** by user priority. Original DCS privacy/security risk labels remain on their source tasks and must be referred to authorised maintainers if confirmed. This index supersedes any contradictory *cross-project* first-step recommendations while preserving all permanent source IDs and completed states. No source repair/QA/deployment completed by numbering alone.

# Numbered outstanding work — 2026-10-24

Status: **OPEN / not independently verified**. Historical reports are not proof of current state. Mark done only with commit, test, deployment and playtest evidence as relevant.

- [ ] **TASK-032** Audit Repository Town NPC dialogue inventory and contextual triggers
- [ ] **TASK-033** Integrate remaining ElevenLabs NPC voice assets
- [ ] **TASK-034** Prevent dialogue overlays and mixer collisions
- [ ] **TASK-035** Playtest quest, shop, trade and NPC conversation flow
- [ ] **TASK-036** Test NPC navigation and pathfinding across map
- [ ] **TASK-037** Benchmark gameplay FPS on target HP ProBook
- [ ] **TASK-038** Verify 17 house and interior interactions
- [ ] **TASK-039** Test driving, crossings and traffic lights
- [ ] **TASK-040** Complete arcade asset/interaction acceptance
- [ ] **TASK-041** Test purchases, stock, queues, preparation and spoilage
- [ ] **TASK-042** Finish emergency, justice, housing, trades and education acceptance
- [ ] **TASK-043** Run deterministic multi-seed simulation and save/load migration
- [ ] **TASK-044** Fix CI with appropriate Windows self-hosted runner
- [ ] **TASK-045** Build release and verify deployed playable version

## Repository Town NPC dialogue: crosswalk to all existing RTD IDs (25 October 2026)

The exact follow-up tasks raised after RTD-009 already carry permanent identifiers in [the 93-task Repository Town dialogue roadmap](../repository-town/docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md). **No re-numbering or new duplicate IDs were needed.** The [dependency-prioritised list ranks every one of the 84 outstanding RTD-010–093 tasks](../repository-town/docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md), gives their exact task descriptions, and explicitly maps these broader master parents.

| Existing master task | Existing RTD subtasks relevant to it | Recommended first actionable ID |
|---|---|---|
| **TASK-032** NPC dialogue/context triggers | RTD-010–023, RTD-029–030, RTD-067–068, RTD-079–080 | **RTD-010** (identity) then 011/012 (director/graph) |
| **TASK-033** remaining ElevenLabs recordings | RTD-042–055, 070/072/074, 076–078, 082–083 | **RTD-042** clip manifest |
| **TASK-034** dialogue overlays and audio overlap | RTD-017–020, 050/053, 056–062, 084–085 | **RTD-017** behaviour; RTD-050 playback |
| **TASK-035** quests/shops/trades/NPC flow | RTD-023–032, 069–075, 081, 084–086 | **RTD-023** quest eligibility |
| **TASK-036** NPC pathfinding | RTD-067/075/084/086 concern interactions, while movement remains separately tracked by TASK-036 | **TASK-036** |
| **TASK-037–042** FPS, buildings, traffic, arcade, economy and civic systems | Keep their own existing unique TASK identifiers; crossovers with RTD-027/028/075/081/086 don't replace them | Original TASK number |
| **TASK-043** deterministic simulation/save | RTD-036/039–041, 081, 086–087 | **RTD-036** dialogue save flags |
| **TASK-044** Windows CI runners | Separate existing TASK-044 (not an NPC story implementation ID) | **TASK-044** |
| **TASK-045** release verification | RTD-087–093 | **RTD-087** full integration checks |

**Triage order:** RTD-010 → 011 → 012 → 021/080 graph tests → 013–020 dialogue decisions → authoritative quest actions 022–032 → memory 033–041 → genuine audio 042–055 → character pilots 067–079 → release acceptance 080–093. UI RTD-056–066, early negative tests and PR reviews are interleaved with their affected features.

**Status as audited:** RTD-001–009 were already checked; RTD-010–093 open. Every `TASK-NNN` parent remains unchanged and open until its *full* original scope is accepted. Existing active work and PRs must be checked independently before selecting a task.

## Completion evidence
For every item record commit/PR, automated test result, deployed URL or build, interactive test outcome, and any remaining blocker. Do not mark tasks complete based on proposed changes alone.

## TASK-040 implementation note — 24 October 2026
Arcade test infrastructure committed and merged: [PR #171](https://github.com/joshualparris/JoshMemory/pull/171). Canonical files: `repository-town/tests/arcade-agent-playtest.mjs` and `repository-town/qa/skyvern-arcade-playtest.workflow.json`; manual GitHub Action collects JSON/screenshot artifacts. **TASK-040 stays open** until an actual complete arcade session has been executed and results reviewed. GitHub status on the merge indicates Vercel build-rate-limit; older production alias is READY.

## TASK-040 TinyFish QA evidence
Live focused browser reports in [repository-town/qa/reports/2026-10-24-tinyfish-arcade.md](repository-town/qa/reports/2026-10-24-tinyfish-arcade.md). Mysterious Depths hub edition reached one ending; AA Game Adventure opened but no keyboard progress demonstrated. JoshHub source guidance fixes are committed but unreleased. **Do not tick TASK-040**: broader two-edition + gameplay/release verification remains open.

## TASK-034 mobile dialogue follow-up — 24 October 2026
Source fix in [PR #184](https://github.com/joshualparris/JoshMemory/pull/184) merged; NPC yarn toast dismiss X and persistent auto-caption off switch (new touch devices default off). Focused mock-DOM behaviour test passed in an isolated V8 execution and is added to `npm run test:release`. **TASK-034 remains open** for full overlay/audio acceptance and deployment/real phone verification. Vercel status on merge: build-rate-limit.

## Next-action triage order (25 October 2026)

**Canonical agent entry point:** [Repository Town next actions — 22 ordered, existing unique task IDs](../repository-town/docs/NEXT_ACTION_TRIAGE.md). Starting point **AUDIO-013.02**; the list reuses existing `AUDIO`, `RTR`, `RTD` and `RTA` identifiers and introduces only `RTM-001/002` for previously unnumbered *real-yarn dismissal* and *physical Android overlay* acceptance. Their authoritative definitions are in [stable ID registry](../repository-town/docs/UNNUMBERED_TODO_IDS_2026-10-24.md).

Parent `TASK-034` = dialogue overlays/mixer and Android yarn acceptance; parent `TASK-040` = arcade QA. **Do not renumber, replace or tick either parent on the strength of documentation.** Source-level fix, QA Pages build, Vercel READY and live acceptance are separate evidence gates. Exact cross-links, per-ID acceptance and sequential order are in the triage document. 
