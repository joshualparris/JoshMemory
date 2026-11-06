# DeepSeek Harness — high-output, low-token working rules

Applies to DeepSeek agents working in `JoshMemory`, including the ProBook and Lenovo harnesses. **Goal: finished, independently verified changes per dollar**, not tokens processed or number of tasks claimed. This supplements (never overrides) the root and `repository-town/AGENTS.md`, `docs/PARALLEL_AGENT_COORDINATION.md`, task acceptance criteria, privacy protections, required checks and release rules.

## 1. At task start: read intelligently, once

1. Read the root and applicable directory `AGENTS.md` and the mandatory parallel-agent coordination policy **once per task**. If `CLAUDE.md` duplicates the directory rules, do not ingest both full copies.
2. Run `git fetch --prune origin`, `git status --short --branch`, and `git log -5 --oneline origin/main`. Inspect relevant open PRs and current feature claims. Do not reset, overwrite or force-push someone else's work.
3. `COORDINATION.md` and `WORK_CHECKPOINT.md` are **large append-only histories**. Never `cat` them, paste them whole into a prompt, or reread the whole history every turn. Use `rg -n -i -m 20 'task-ID|module|agent' repository-town/{COORDINATION,WORK_CHECKPOINT}.md` plus a short `tail` for recent activity; look up the exact relevant record. Follow the existing required claim/start-checkpoint procedure. Keep new entries compact and factual.
4. Write down one narrow task: original user outcome, explicit exclusions, owning files, acceptance/playtest, and integration destination. Confirm the feature is not already merged or being built by another agent.

## 2. Minimise context and tool output

- Search filenames first (`rg --files repository-town/src repository-town/tests | rg 'relevant-term'`), then symbols (`rg -n -m 30 'name' relevant/path`). Read only the needed functions and neighbouring lines. Avoid entire-file dumps of `main.js`, `life.js`, generated bundles, JSON datasets, logs, Git histories, or directory trees.
- Before editing, inspect `git diff --name-only` and targeted `git diff -- path`. On repeat iterations send the model only the **changed lines, failing assertion and relevant surrounding code**, not the complete earlier transcript or test log.
- Cap ordinary command output to about 60–100 relevant lines. For noisy tools write a local log outside the repo and show a short tail or filtered error context, **preserving the original exit status**. E.g. `node tests/example.mjs > /tmp/ds-test.log 2>&1; rc=$?; tail -n 60 /tmp/ds-test.log; exit "$rc"`.
- Keep answers to the agent's next tool step short: decision, command, result, next action. Do not repeat the project overview, explain unchanged code, generate speculative design documents, or ask multiple agents to analyse the same issue.
- Never put private or secret material into prompts, scratch logs, commits or public test artifacts.

## 3. Prefer the cheapest adequate model and shortest path to a result

- Use **DeepSeek Flash, High** for file discovery, bounded code changes, unit tests, focused browser checks, PR housekeeping and ordinary debugging. Prefer deterministic shell/Node/Python for counts, comparisons, transformations and mechanical edits.
- Escalate to **Pro** only when a concrete architectural ambiguity, difficult cross-module conflict or repeatedly reproduced failure cannot be resolved with Flash and focused evidence. State the specific question, send only its essential context, get the decision, then return to Flash. Do not run prolonged Pro/Max loops without a demonstrated need.
- Do not cycle repeatedly through the same unsuccessful fix. After two materially distinct failed attempts, inspect the error/assumptions and choose a different diagnostic approach.
- **Soft budget:** aim for roughly 20–40 model/tool iterations per small feature; if metered incremental spend approaches US$0.25 for a small task, check whether progress is genuine. These are review triggers, **not permission to abandon tests, skip safety or claim premature completion**. Usage dashboard totals may mix agents and cached input; never invent per-task cost.
- Do not start a second feature while a first feature remains unmerged or unverified unless blocked by something external and the original checkpoint makes that explicit.

## 4. Test efficiently without cutting corners

1. Before editing, find or add a **reproducible failing test** for the requested behaviour when feasible.
2. During edits, run the **smallest affected tests** and syntax checks. Avoid repeating `npm run test:town`, `test:integration`, `test:browser` or full builds after every one-line change.
3. Once the final candidate is ready, run all **mandated** privacy/build, focused regression, browser/WebGL, PR/CI and cross-feature checks appropriate to that scope; do not disable, weaken or bypass a gate to conserve tokens. Review screenshots and real interaction where required. Mobile emulation is not physical handset testing.
4. If CI fails, inspect **the failing job/step only**, distinguish pre-existing/environmental failures from regressions, fix and rerun the relevant gate. Do not re-run an unchanged failing pipeline in a loop.
5. Test the exact merged commit and intended live deployment when the task requires release. A PR, local pass or Vercel `READY` state alone does not prove playable production behaviour.

## 5. Multi-agent integration and completion evidence

- The ProBook and Lenovo agents must **claim different exact features/files** via the existing coordination mechanism. Use separate topic branches from current `origin/main`, preserve concurrent changes, and never silently replace the modern town with an older file or branch.
- Preserve all explicit user requirements/exclusions. Do not substitute paperwork or a benchmark for a requested gameplay improvement; label measurement-only work as such.
- Make the smallest coherent PR; review differences and tests, merge **only when safe and required checks pass**, and release the claim according to the existing rules. No blind auto-merge, force push or unauthorized production changes.
- Completion report must be short and evidence-based: **user-visible change; PR + merged SHA; test commands/results; live URL + deployed SHA + tested interaction where applicable; remaining failures**. Status must be **VERIFIED COMPLETE**, **PARTIALLY COMPLETE** or **BLOCKED**, based on observed facts. Do not call a coding task finished because its branch or PR exists.

## Reusable one-line task bootstrapping

`Read AGENTS.md and repository-town/AGENTS.md, then follow repository-town/docs/DEEPSEEK_TOKEN_EFFICIENCY.md. Reconcile active ownership claims; finish one narrow user-visible task end-to-end, test, safely merge and verify, with concise tool output and no repeated full-context reads.`

**Scope note:** Repository instructions can guide model behaviour but cannot enforce API token caps, provider caching, model routing, or ensure a harness auto-loads files. The harness launcher/system instructions must actually load this file for full effect.
