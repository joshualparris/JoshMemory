# Portfolio system task triage — Repository Town walking route

**Dated inventory:** 2026-10-24. **Coverage:** 233 distinct repositories found using the 188-entry [Repository Town snapshot](https://github.com/joshualparris/JoshMemory/blob/main/docs/repository-town.json) plus fresh GitHub discovery across the connected user/organisation searches (45 outside the original grid). Not a complete census of every unconnected GitHub account.

## Numbered execution steps

The unique child-task register is [PORTFOLIO_TRIAGE_TASK_STEPS_2026-10-25.csv](PORTFOLIO_TRIAGE_TASK_STEPS_2026-10-25.csv), with [step-by-step instructions](PORTFOLIO_TRIAGE_TASK_STEPS_2026-10-25.md). There are eight stable subtasks `TR-###.01` through `TR-###.08` for every review. **Next runnable task: TR-003.01**, not simply a vague instruction to "triage VoiceBank". Parent review IDs and town grid references remain unchanged. The 16 historical child IDs for completed parents TR-001 and TR-002 are reference-only, not retroactive claims of detailed acceptance.

## NEXT REPO FOR AGENT TRIAGE

**`TR-003` / `RT-U032` — restricted, resolve in private registry.** The first two entries are already triaged for agent handoff: `TR-001` (web Whispering Wilds) and `TR-002` (Python Whispering Wilds). That does not mark their underlying coding work complete.

## Two independent references

- **Permanent repository designation:** `RT-K2` (Whispering Wilds web's existing Town address), `RT-H1` (Python adventure), or `RT-U001` through `RT-U045` for newly found/unplaced repositories. The original **188 Town grid addresses are preserved unchanged**. Never reuse an ID. If an unplaced repo gets a future Town address, preserve its `RT-U...` identity and update a separate `town_grid` field only after canonical map approval.
- **Visit order:** `TR-001`, `TR-002`, ... `TR-233`. This is the **2026-10-24 queue version**, not an immutable ID. Record reordering in a new dated queue, never silently recycle an old slot.
- **Progress:** `TRIAGED_DOCS` means accepted triage instructions/checkpoints exist; `NOT_TRIAGED` requires inspection; `ACCESS_RECHECK` means repository access unresolved. None of these denotes code or production implementation success.
- **Prioritisation:** completed Wilds handoffs; then shared audio (VoiceBank), canonical Town and mirror, family/audio apps, high-impact operating projects and developer infrastructure; then heuristic operations/security; platform apps; games; remaining research/archive projects. Within a band the Town grid uses serpentine rows A→Z then Z→A, so same-tier reviews proceed as a local walk. Priority is preliminary and must be re-evaluated against real P0 defects, deployments and branch activity.

## One-repository-at-a-time agent procedure

1. Find the first **untriaged, unclaimed, unblocked** `TR-###` item. `TR-003` is the first candidate; recheck live claims and completion status before touching it.
2. Establish the actual canonical source, exact owner/repo/default branch, active PRs, available tests/CI, deployments and existing checkpoints. A mirror/legacy copy is not automatically canonical; mark `DEFERRED_MIRROR` or `ACCESS_RECHECK` with evidence if needed.
3. Claim its immutable `RT-...` in a durable repo checkpoint; re-fetch concurrent edits to avoid duplicate effort. Do not claim a locked task just by reading the queue.
4. Locate **every** to-do list (including files, issues, review comments, checklists and branch docs). Preserve all existing task numbers; number only unfinished unnumbered items, avoiding collisions. Link to their exact authoritative sources.
5. Produce or improve `TASK_TRIAGE.md`, `AGENTS.md`, `WORK_CHECKPOINT.md` (respecting stronger existing coordination rules). State **exactly one next executable task**, its prerequisites, estimated validation steps, acceptance criteria, and a fallback if blocked. Link the triage from README and existing master tracker.
6. Commit and fetch back the docs. Verify stable numbering, links, source branch and cross-repo task references. Mark `TRIAGED_DOCS` only with a verified commit, not after a proposed plan. Do not conflate triage completion with fixes/builds/deployment being complete.
7. Update central route/checkpoint after each repository. If one is inaccessible, document the error, reserve its designation and move on. Add future discoveries with fresh nonreused `RT-U###`; don't reshuffle permanent designations.
8. Cross-account privacy: the public inventory **redacts private repository names**, even when Town previously listed them. Use the complete restricted registry only when connected permissions allow it. Do not paste private repo names, sensitive code or CI secrets into public records.

## Starting links

- [Whispering Wilds web handoff](https://github.com/Parris-Tech-Services/whispering-wilds/blob/main/TASK_TRIAGE.md)
- [Whispering Wilds Python handoff](https://github.com/joshualparris/Whispering-Wilds/blob/main/TASK_TRIAGE.md)
- [Repository Town address directory](https://github.com/joshualparris/JoshMemory/blob/main/docs/REPOSITORY_TOWN.md)
- **Full CSV**: [Public redacted portfolio registry](PORTFOLIO_TRIAGE_REGISTRY_2026-10-24.csv) — all 233 designations; restricted full source held in `Parris-Tech-Services/OS/docs/portfolio/` for authorised access.

## First 40 stops

| Queue | Repo ID | Repository | Grid | Status |
|---|---|---|---|---|
| TR-001 | RT-K2 | [Parris-Tech-Services/whispering-wilds](https://github.com/Parris-Tech-Services/whispering-wilds) | K2 | TRIAGED_DOCS |
| TR-002 | RT-H1 | [joshualparris/Whispering-Wilds](https://github.com/joshualparris/Whispering-Wilds) | H1 | TRIAGED_DOCS |
| TR-003 | RT-U032 | Restricted repository | Unplaced | NOT_TRIAGED |
| TR-004 | RT-G3 | Restricted repository | G3 | NOT_TRIAGED |
| TR-005 | RT-U034 | [Parris-Tech-Services/Repository-town](https://github.com/Parris-Tech-Services/Repository-town) | Unplaced | NOT_TRIAGED |
| TR-006 | RT-H4 | Restricted repository | H4 | NOT_TRIAGED |
| TR-007 | RT-U030 | [Parris-Tech-Services/GentleMovement](https://github.com/Parris-Tech-Services/GentleMovement) | Unplaced | NOT_TRIAGED |
| TR-008 | RT-K1 | [Parris-Tech-Services/BucklandBlocks](https://github.com/Parris-Tech-Services/BucklandBlocks) | K1 | NOT_TRIAGED |
| TR-009 | RT-U3 | Restricted repository | U3 | NOT_TRIAGED |
| TR-010 | RT-D5 | [Parris-Tech-Services/AppFactory](https://github.com/Parris-Tech-Services/AppFactory) | D5 | NOT_TRIAGED |
| TR-011 | RT-Y2 | [joshualparris/DubboEwaste](https://github.com/joshualparris/DubboEwaste) | Y2 | NOT_TRIAGED |
| TR-012 | RT-V2 | [joshualparris/CircularEconomyDubbo](https://github.com/joshualparris/CircularEconomyDubbo) | V2 | NOT_TRIAGED |
| TR-013 | RT-Q4 | Restricted repository | Q4 | NOT_TRIAGED |
| TR-014 | RT-H7 | Restricted repository | H7 | NOT_TRIAGED |
| TR-015 | RT-X3 | Restricted repository | X3 | NOT_TRIAGED |
| TR-016 | RT-F3 | [joshualparris/JoshHub](https://github.com/joshualparris/JoshHub) | F3 | NOT_TRIAGED |
| TR-017 | RT-N6 | [Parris-Tech-Services/ForgeGrid](https://github.com/Parris-Tech-Services/ForgeGrid) | N6 | NOT_TRIAGED |
| TR-018 | RT-R4 | [Parris-Tech-Services/DadlanControlCentre](https://github.com/Parris-Tech-Services/DadlanControlCentre) | R4 | NOT_TRIAGED |
| TR-019 | RT-Q2 | [Parris-Tech-Services/Health-Data-Manager](https://github.com/Parris-Tech-Services/Health-Data-Manager) | Q2 | NOT_TRIAGED |
| TR-020 | RT-I7 | Restricted repository | I7 | NOT_TRIAGED |
| TR-021 | RT-W6 | [Parris-Tech-Services/LLMAccountability](https://github.com/Parris-Tech-Services/LLMAccountability) | W6 | NOT_TRIAGED |
| TR-022 | RT-Z4 | [Parris-Tech-Services/AgentCheck](https://github.com/Parris-Tech-Services/AgentCheck) | Z4 | NOT_TRIAGED |
| TR-023 | RT-T6 | [Parris-Tech-Services/KaseyaFieldOps](https://github.com/Parris-Tech-Services/KaseyaFieldOps) | T6 | NOT_TRIAGED |
| TR-024 | RT-S5 | [Parris-Tech-Services/DCSCompanion](https://github.com/Parris-Tech-Services/DCSCompanion) | S5 | NOT_TRIAGED |
| TR-025 | RT-T5 | [Parris-Tech-Services/DCSPD](https://github.com/Parris-Tech-Services/DCSPD) | T5 | NOT_TRIAGED |
| TR-026 | RT-V5 | [Parris-Tech-Services/DCSProfessionalDevelopment](https://github.com/Parris-Tech-Services/DCSProfessionalDevelopment) | V5 | NOT_TRIAGED |
| TR-027 | RT-P3 | [Parris-Tech-Services/JoshBooksOnline](https://github.com/Parris-Tech-Services/JoshBooksOnline) | P3 | NOT_TRIAGED |
| TR-028 | RT-Q3 | [Parris-Tech-Services/JoshCards](https://github.com/Parris-Tech-Services/JoshCards) | Q3 | NOT_TRIAGED |
| TR-029 | RT-H3 | [joshualparris/JoshTapApp](https://github.com/joshualparris/JoshTapApp) | H3 | NOT_TRIAGED |
| TR-030 | RT-J2 | [Parris-Tech-Services/WhirringWilderness](https://github.com/Parris-Tech-Services/WhirringWilderness) | J2 | NOT_TRIAGED |
| TR-031 | RT-G1 | [joshualparris/theUndercity](https://github.com/joshualparris/theUndercity) | G1 | NOT_TRIAGED |
| TR-032 | RT-U036 | [parristechservices-prog/AIDungeonMaster](https://github.com/parristechservices-prog/AIDungeonMaster) | Unplaced | NOT_TRIAGED |
| TR-033 | RT-U2 | [joshualparris/Cheappcslaptops](https://github.com/joshualparris/Cheappcslaptops) | U2 | NOT_TRIAGED |
| TR-034 | RT-S2 | Restricted repository | S2 | NOT_TRIAGED |
| TR-035 | RT-R2 | [Parris-Tech-Services/HealthLens](https://github.com/Parris-Tech-Services/HealthLens) | R2 | NOT_TRIAGED |
| TR-036 | RT-O2 | [joshualparris/HealthLens](https://github.com/joshualparris/HealthLens) | O2 | NOT_TRIAGED |
| TR-037 | RT-N2 | Restricted repository | N2 | NOT_TRIAGED |
| TR-038 | RT-M2 | [joshualparris/HealthiestFood](https://github.com/joshualparris/HealthiestFood) | M2 | NOT_TRIAGED |
| TR-039 | RT-C2 | Restricted repository | C2 | NOT_TRIAGED |
| TR-040 | RT-H5 | Restricted repository | H5 | NOT_TRIAGED |

**Note:** The lower-priority queue is largely name/category-based; its urgency is **not yet verified** repository-by-repository. All 233 entries and their exact order are in the CSV, including 69 private records (masked here).
