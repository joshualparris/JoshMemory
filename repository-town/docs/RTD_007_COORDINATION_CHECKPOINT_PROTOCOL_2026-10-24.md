# RTD-007 — Repository Town dialogue ownership and checkpoint protocol

**Status:** Adopted in this RTD-007 coordination task (24 October 2026, Australia/Sydney).  
**Scope:** Repository Town's [93 stable RTD task IDs](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md), existing Town [AGENTS.md](../AGENTS.md), [COORDINATION.md](../COORDINATION.md), and [WORK_CHECKPOINT.md](../WORK_CHECKPOINT.md). This is an **operational workflow**, not a dialogue feature or a production audio certificate.  
**Canonical editable source:** `joshualparris/JoshMemory/repository-town/` at current `main`; **do not** edit the generated `Parris-Tech-Services/Repository-town` mirror.

## 1. Acquire one named RTD task before doing implementation

1. Fetch **current** GitHub `main`, then read `repository-town/AGENTS.md`, `COORDINATION.md`, `WORK_CHECKPOINT.md`, the exact RTD checklist line and any linked acceptance reports. Also inspect open PR heads and existing claims for the **same files**. A prior chat or an older `main` copy is *not* current evidence.
2. Choose the **smallest unclaimed numbered task or explicitly non-overlapping subtask**. Before editing a runtime file, add a clearly labelled **CLAIMED/IN PROGRESS** entry at the top of `COORDINATION.md` **on canonical main**, recording the owner (agent/session), exact RTD IDs, branch, anticipated files, baseline SHA, conflict exclusions, and proof needed. Re-fetch the board before writing and use GitHub content SHA protection; on a concurrent update, reread and reconcile, **never overwrite** the other session.
3. **Claim only work you can actually start in this session**. Do not reserve RTD-008 or the remainder of 009–093 indefinitely. In a takeover, cite the user's explicit transfer and inspect open partial branches/PRs before reimplementing.
4. If another agent owns a specific file or RTD ID, either coordinate through a non-overlapping branch/paths or choose another numbered task. Don't merge a stale branch into the same NPC, voice or life engine blindly. Compare actual PR metadata: historical “INTEGRATING” entries do not prove the PR is still open.
5. Create a **unique topic branch from the refreshed main**. Preserve the shared `main` history: do not force-push, reset, squash others' work into your own branch, or write to a generated/public backup directly.

**Active conflict examples at protocol creation:** Previously merged [#165](https://github.com/joshualparris/JoshMemory/pull/165) and [#166](https://github.com/joshualparris/JoshMemory/pull/166) are already part of canon. [#164](https://github.com/joshualparris/JoshMemory/pull/164) was open and proposes 20 MP3s plus modifications to `src/ui/npc-chat.js`, `recorded-dialogue.js` and `voicebank.js`; compare and port approved clips, not its old copies wholesale. The RTD-003 worker roster is 99, not the historical 38. Refresh these facts before starting a later task.

### Copy-ready coordination record

```text
- YYYY-MM-DD · <agent/session> — CLAIMED RTD-NNN <specific scope>.
  Baseline main: <full SHA>; branch: <topic branch>.
  Expected paths: <actual paths>. Exclusions/overlap: <other agents / PRs>.
  Acceptance evidence: <commands, specific browser, audio and release proof>.
  Checkpoint: repository-town/WORK_CHECKPOINT.md (M1 start committed).
  Owner status: In progress (or BLOCKED with a concrete reason).
```

A task is not complete merely because its record is present. Use the roadmap checkbox only after reviewable evidence has been committed.

## 2. Durable checkpoint sequence (same session)

Update `WORK_CHECKPOINT.md` and commit the changes:
- **M1: Immediately at start**, after the board claim and before edits. Record exact numbered scope, baseline SHA, branch, accepted previous code, ownership, expected files, tests and current limits.
- **M2: After each meaningful milestone**, e.g. inventory/schema, source implementation, tests, audio mapping, release candidate and live verification. Note paths and commits; do not check tasks for unverified behaviour.
- **M3: On interruption or handoff**, including before switching projects and roughly every 10–15 minutes during long active sessions. Record exact current status `VERIFIED COMPLETE`, `PARTIALLY COMPLETE` or `BLOCKED`, pending code locations, errors, next command/action and whether GitHub persisted work.
- **M4: Before/after PR review and merge**, update evidence links, exact CI runs/test conclusions and merge SHA; move only the *finished* claim from board **In progress** to **Done**, retaining unrelated agents' entries.

**Required checkpoint fields:**
| Field | Example / meaning |
|---|---|
| Task and branch | `RTD-009`, `feat/town-rtd009-graph-schema-...` |
| Source baseline and branch head | Exact Git commit SHAs, no approximate “latest” |
| Owner and file scope | Actor schema/engine only; exclude another agent's `voicebank.js` |
| Milestone checklist | Mark only completed work, retaining every stable RTD ID |
| Evidence | Command, result/exit status, CI run/job links, browser platform, actual audio source and caption match |
| Hosting | Actual `/release.json` sourceCommit/contentHash, deploy ID/READY and tested live origin when relevant |
| Unfinished work | Open tasks, known broken tests, blockers and precise next action |

Do **not** falsely state work is asynchronous or will be completed later. Future chats resume from GitHub records and do not depend on the current chat.

## 3. Test, privacy and release evidence must stay separate

| Claim | Minimum credible evidence |
|---|---|
| Docs/inventory completed | Actual source read, reviewed diff, stable RTD numbering, committed file/PR |
| NPC graph functionality | Deterministic schema/condition/effect unit tests, regression against `src/ui/recorded-dialogue.js` |
| Real player choice and voice | Browser actually clicks a choice, real approved MP3 WebAudio starts, exact recording transcript caption, stop/replay, missing voice and mobile tests |
| In-game quest/repair/payment success | Mutated, authoritative and saved gameplay state; negative tests for failure, cancellation and repeated triggers |
| Release ready | `npm run build:release`, privacy, simulation, relevant desktop/mobile WebGL and audio CI all green for tested **SHA** |
| Production accepted | **Separate** live hosted click-through test, matching deployment SHA and `release.json` fingerprint, actual recording decode/playback and appropriate handset/offline observations |
| Backup parity | Checked independently against generated mirror and correct release manifest/content hash |

The [RTD-006 production audit](RTD_006_RELEASE_BASELINE_2026-10-24.md) confirmed a real READY Vercel release and correctly identified a **skipped** hosted-production browser step. That skipped step is **not** green. Do not close other RTD or VoiceBank audio acceptance checkboxes because a build passed or MP3s exist. No paid ElevenLabs generation without explicit approved batch/budget, and never commit credentials/private source.

## 4. Merge, close and hand over

1. Review the actual diff against **latest** main; update your branch safely if main changed, without overwriting concurrent authors. Run required checks appropriate to the modified code and record exact results.
2. Open a PR with `RTD-NNN` in its title/body, the actual touched paths, explicit exclusions, tests and links to the checkpoint. Only merge when required quality gates pass, with no unresolved overlap.
3. Confirm the requested files exist on `main`, the roadmap still has exactly **93 sequential tasks**, only genuinely completed IDs checked, and `WORK_CHECKPOINT.md` links the merged SHA/CI evidence. Move the claim to **Done** and state the next available **unclaimed** ID.
4. Do **not** hold the next numbered task on behalf of a future agent. Future owner checks main/board and reserves it in their own session.
5. For public release tasks, additionally verify current deployed fingerprint, actual audio trigger, backups and the live route; do not assume merging a PR automatically promotes to production.

## RTD-007 specific verified actions

- Claimed RTD-007 in canonical `COORDINATION.md` **before** implementation; first claim commit `b2cd82474e3a19c33f9090967169111188be4f26`.
- Wrote the **start checkpoint** on canonical main at `553ae142e369b17bd88f19caa256c93ce9460623` before branching.
- Scoped RTD-007 to these documentation/agent-instruction files; **RTD-008 not implemented or reserved**.
- This protocol formalises later task ownership and milestone checkpointing. RTD-007 can be checked only after the roadmap, board and final checkpoint are merged and verified on main.
