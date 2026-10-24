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

## Completion evidence
For every item record commit/PR, automated test result, deployed URL or build, interactive test outcome, and any remaining blocker. Do not mark tasks complete based on proposed changes alone.

## TASK-040 implementation note — 24 October 2026
Arcade test infrastructure committed and merged: [PR #171](https://github.com/joshualparris/JoshMemory/pull/171). Canonical files: `repository-town/tests/arcade-agent-playtest.mjs` and `repository-town/qa/skyvern-arcade-playtest.workflow.json`; manual GitHub Action collects JSON/screenshot artifacts. **TASK-040 stays open** until an actual complete arcade session has been executed and results reviewed. GitHub status on the merge indicates Vercel build-rate-limit; older production alias is READY.

## TASK-040 TinyFish QA evidence
Live focused browser reports in [repository-town/qa/reports/2026-10-24-tinyfish-arcade.md](repository-town/qa/reports/2026-10-24-tinyfish-arcade.md). Mysterious Depths hub edition reached one ending; AA Game Adventure opened but no keyboard progress demonstrated. JoshHub source guidance fixes are committed but unreleased. **Do not tick TASK-040**: broader two-edition + gameplay/release verification remains open.
