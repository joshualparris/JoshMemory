# Twenty-agent report intake — permanent ARI identifiers

**Authoritative scope:** Recover unresolved **report details**, not implement unspecified user features. See [single master execution queue](MASTER_20_AGENT_TRIAGE_2026-10-25.md) and its [machine order](MASTER_20_AGENT_EXECUTION_QUEUE_2026-10-25.csv).

Each **ARI-NNN** below is globally unique within this report-consolidation work. ARI is **Agent Report Intake**, deliberately separate from `RTN-`, `RTA-`, `GRA-`, `GRC-`, `TR-`, `GM-` and `SVA-`. No previously allocated IDs change.

- [ ] **ARI-001** Reconcile Agents 2/4's conflicting historical `RTN-001`/`002`/`003` meanings with current canonical `RTN-001..018`. **Code mapping done in master crosswalk**, but leave intake checkbox unchecked pending reviewer signoff and source queue update. Canonical implementation next actions: `RTN-007`, `RTN-008`, `RTN-009` and `RTR-010`. Do not mint duplicate fix tasks.
- [ ] **ARI-005** Agent 5 reports "Blocked", without task identifiers or an actual blocker description. Retrieve scope, original repository and blocked action before assigning coding work.
- [ ] **ARI-007** Agent 7 reports "In progress", without final results. Obtain verified latest state and preserve unverified/unsubmitted work as unknown.
- [ ] **ARI-011** Agent 11 reports "Blocked", without scope or error. Identify original task and blocker.
- [ ] **ARI-012** Agent 12 reports "In progress", without final evidence. Request/resume precise source-backed handoff.
- [ ] **ARI-015** Agent 15 was searching ElevenLabs assets. Obtain final recording inventory with file names, IDs, intended game/activity and actual hashes before creating missing-audio tasks; don't invent recordings.
- [ ] **ARI-019** Agent 19 reports "Work broken" without details. Recover failure trace, repository, branch and smallest reproducible incomplete action.

**Agent 20 exclusion:** The PDF's last substantive item is a personal exercise reminder, not a software/CI task or engineering review. It is deliberately not reproduced in this **public software repository**, and no sensitive health details are copied. An empty Agent 21 heading is not a 21st report.

**Execution:** claim ARI work only when it is the next eligible row in the master queue. Once a useful report arrives, use the *existing* target repo task ID or mint a new repo-local ID **only if the actual requirement is demonstrably new and lacks an ID**. Do not assert a task was fixed merely because its intake report is retrieved.
