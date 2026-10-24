# Repository Town — next actions: stable IDs and exact triage order

**Updated:** 25 October 2026 (Australia/Sydney)  
**Canonical editable source:** `joshualparris/JoshMemory/repository-town` · **Read before coding:** [AGENTS](../AGENTS.md) · [COORDINATION](../COORDINATION.md) · [WORK_CHECKPOINT](../WORK_CHECKPOINT.md)  
**What this covers:** The four actions specified in the 25 October Repository Town status response: (1) production dialogue-fix verification, (2) dismissal of a real nearby-NPC yarn on Android, (3) complete dialogue/audio overlay conflicts (`TASK-034`), and (4) complete arcade acceptance (`TASK-040`).

## ID authority and no-renumber rule

**DO NOT RENUMBER EXISTING TASKS.** These are already permanent source IDs, not newly invented tasks:

- [Global tracker](../../docs/OUTSTANDING_WORK_2026-10-24.md): **TASK-034** (dialogue overlays and mixer), **TASK-040** (arcade acceptance), and release **TASK-045**.
- [Previously unnumbered tasks, now assigned](UNNUMBERED_TODO_IDS_2026-10-24.md): `AUDIO-010.xx`, `AUDIO-013.xx`, `AUDIO-042.xx`, `AUDIO-045.xx`, `RTA-001..007`, `RTR-009/015`. Existing numbered `RT-08` and parent `AUDIO-006..013` remain unchanged.
- [Skyrim dialogue roadmap](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md): `RTD-050`, `RTD-057..060`, `RTD-084..089` retain their own original IDs and broader feature scope.
- **Only two exact acceptance gaps lacked sufficiently specific permanent IDs:** `RTM-001` and `RTM-002` (*Repository Town Mobile*, newly registered under [stable-ID registry](UNNUMBERED_TODO_IDS_2026-10-24.md)). Neither supersedes `AUDIO-012.04`, `AUDIO-045.03`, `RTD-058` or `RT-08`.

The numbered **visit order** below is a triage position, **not another task ID**. Every row points to precisely one stable ID in its authoritative tracker. Broad global parents remain open until every relevant acceptance criterion is evidenced; never count the same work as multiple newly completed tasks.

## Which task should a new agent start with?

**NEXT: position 01 / `AUDIO-013.02`** — independently identify the canonical production Vercel alias and currently deployed SHA (not the most recent GitHub commit or old QA site). Check [COORDINATION](../COORDINATION.md) for a live claim before editing. This is a read-only verification and must be repeated at execution time; previous Vercel API observation reported READY at `42c4e0c688f84e6537267bb11e07b4c8ba2cd5e0` but the QA-tested Pages build was `2743a8f182d69038fee841c19f96f2313a40ff60`. No equivalence should be inferred. If 01 already has current definitive evidence, record its proof and proceed to 02; do not redo it gratuitously.

**Execution rules:** First read today's canonical `main` and active PRs, claim only the smallest unowned task/paths in `COORDINATION.md` before runtime edits, commit M1 checkpoint, use a feature branch, run proportionate tests and required release/privacy gate, and commit M2/final checkpoint. If blocked by a provider, move through approved alternatives per [HOSTING](HOSTING.md), preserving saved games, source fingerprint and public backup. Report *green CI*, *production READY*, *live browser interactions* and *physical Android* as separate evidence levels.

## Ordered one-agent execution queue

| Order | Stable ID (original tracker) | Parent/phase | Exact work and unambiguous acceptance proof | Current evidence / status |
|---:|---|---|---|---|
| 01 | **AUDIO-013.02** | Production · P0 | Read current production alias, deployment ID, source commit and READY/failed state; record a timestamped source of truth | Earlier API observation: Vercel READY `42c4e0c`; refresh before closing |
| 02 | **AUDIO-013.04** | Production · P0 | Compare the **actually deployed** build's `release.json.sourceCommit` and content hash against the precisely **tested** source; note intentional changes or require re-test of delta | QA Pages source `2743a8f`; production different — compare, not assumed passed |
| 03 | **AUDIO-013.03** | Production · P0 | On canonical *live* URL verify 3D Town, NPC dialogue, close action, recorded audio/stop, mobile controls, real asset/CSP/CORS loads; attach browser trace and SHA | QA Pages desktop and 390×844 passed; **canonical Vercel live interactions not yet evidenced** |
| 04 | **RTM-001** | Actual yarn dismiss · P0 · new | At a **real naturally occurring nearby NPC-NPC yarn** on the live tested build, explicitly opt in to auto captions, capture toast, tap its **X**, prove immediate disappearance and no same-event redisplay, then prove later *different* yarn still appears when enabled | Unit/mock-DOM harness passed; **real encounter not tested** |
| 05 | **AUDIO-045.03** | Mobile clarity · P0 | Measure minimum hit targets, clipping/overlap, long captions, touch prompt and Ask AI overlay at 390×844 and landscape on an instrumented browser; screenshots of before/after | QA 390×844 Settings bounds passed; live yarn-to-prompt overlap remains unverified |
| 06 | **RTM-002** | Real Android · P0 · new | On a physical Android handset in portrait and landscape verify HUD + / close, auto-caption switch off/on across refresh, nearby X, joystick/action + Ask AI clearance, manual NPC chat and no save loss; attach device/browser/version evidence. If unavailable, explicitly mark *device test blocked*, not green | Actual physical handset not tested; emulator acceptance available |
| 07 | **AUDIO-010.01** | Dialogue/mixer · P1 · TASK-034 | Automate open-close-reopen, actor switching, ten rapid taps, replay, stop in desktop and narrow Playwright; no stale UI or duplicate captions | Broader task remains open |
| 08 | **AUDIO-010.02** | Dialogue/mixer · P1 | Cancel active voice reliably on modal dismissal, walking away and switching actors; real recording changes state cleanly | Open |
| 09 | **AUDIO-010.03** | Dialogue/mixer · P1 | Negative test for stale async promises, wrong button reactivation, duplicate concurrent WebAudio sources | Open |
| 10 | **AUDIO-042.02** | Dialogue/mixer · P1 | Stress simultaneous/rapid Yarns, NPC choices, Ask AI and ambience; prove no overlapping voices, hung player or forced UI overlays | Open |
| 11 | **RTD-050** | Dialogue system · P1 | Fix confirmed cross-engine one-at-a-time playback, pause/stop/replay, cancellation and modal transitions without affecting recorded provenance | Broader dialogue feature open |
| 12 | **RTD-060** | Dialogue system · P1 | Guard active voice/caption ownership across NPC switching, dismissal and promises; stale response must not revive dialog | Open |
| 13 | **AUDIO-010.04** | Evidence · P1 | Commit focused browser regression and preserve trace, audio-source evidence and screenshots for 07–12 | Open |
| 14 | **RTR-009** | Gate · P1 | Run full `npm run build:release`, privacy/integrity, simulation and NPC/arcade browser regressions against the exact reviewed source | QA Pages gate succeeded at `2743a8f`; rerun after additional fixes |
| 15 | **RTR-015** | Publish · P1 | After acceptance, deploy *only approved* commit, compare canonical production / staging / approved backup fingerprints and protect existing saved-progress migration; never hand-edit generated backup | Existing QA and mirror are deliberately different release roles; parent open |
| 16 | **RTA-001** | Arcade · P2 · TASK-040 | Run the existing manual GitHub Actions arcade playtester for the **current** deployed candidate; archive report | Tool merged in PR #171; complete live workflow report absent |
| 17 | **RTA-002** | Arcade · P2 | Run **every exact game edition** listed in current released arcade (including both editions of AA Game Adventure and Mysterious Depths); measure catalogue/release count and failed opens | TinyFish covered only one edition of each; master parent open |
| 18 | **RTA-003** | Arcade · P2 | Review per-edition screenshots, console/HTTP errors, input interactions and actual accessible controls; log only observed defects | Partial focused TinyFish results |
| 19 | **RTA-004** | Arcade · P2 | Verify game-specific advancement/endings, UX clarity and balance, rather than treating 20 generic keypresses as success | One Mysterious Depths ending reached; AA progress unverified |
| 20 | **RTA-005** | Arcade · P2 | Repair demonstrated issues in their **canonical game source** then regenerate Town packed copies and verify game identity/hash; preserve old saves | JoshHub guidance improvements committed; repack/release not fully evidenced |
| 21 | **RTA-006** | Arcade · P2 | Play desktop + Android-sized arcade, enter/exit each edition, confirm movement/controls and Town input/saves survive | Open |
| 22 | **RTA-007** | Arcade · P2 | Re-test **released** candidate, link exact Town/game SHA, screenshots, report and deployed URL; close `TASK-040` only with full scope evidence | Open |

### Other related existing IDs (not new or silently re-ordered)

`RT-08` is the older combined public recorded-NPC acceptance. `RTD-056..059` cover responsive dialogue UI and voice controls; `RTD-084..087` cover actor end-to-end browser/release tests; `RTD-089..093` cover staging/promotion/mirrors/evidence. `AUDIO-012.04` already covers an optional physical Android listen/stop check (different from **RTM-001** yarn X / **RTM-002** physical overlay experience). Link evidence across them **without creating duplicate tasks, assuming completion or altering old checkbox states**.

## Verified foundations — not permission to tick broad tasks

- [Mobile controls PR #184](https://github.com/joshualparris/JoshMemory/pull/184) merged. The popup X and opt-out preference exist in code. QA Pages at [isolated URL](https://parris-tech-services.github.io/Repository-town-playtest/qa/mobile-dialogue-20261024/) published `2743a8f` after full build/privacy gates in [run 40090579941](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40090579941).
- [390×844 browser run 40091978098](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40091978098) passed settings, close/reopen/persistence and presence of manual controls; **did not demonstrate a naturally occurring yarn X press or physical Android**.
- The old QA mirror's hostname is an independent saved-progress origin from Vercel but shares origin with its *retired playtest homepage*: use a clean test profile, preserve export/import and do not copy old saves implicitly.
- [Arcade TinyFish evidence](../qa/reports/2026-10-24-tinyfish-arcade.md): JoshHub Mysterious Depths reached an ending; AA controls did not show confirmed movement; both *second editions* and rest of catalogue remain untested. Never claim an empty/partial report establishes playability.

## Triage status and handover

**No acceptance checkboxes were newly marked complete by this numbering-only documentation change.** Existing `AUDIO`, `RTA`, `RTD`, `RTR`, `TASK` IDs keep their original wording and status, while newly created `RTM` subtasks are checked off only when their *own* proof is attached. Update this queue with a one-line evidence pointer/status upon each actual completion, then proceed to the next open row. When a row is blocked, record who/what/why and move to the next independent unclaimed task rather than stopping work.

