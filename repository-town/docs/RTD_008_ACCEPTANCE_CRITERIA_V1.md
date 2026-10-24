# RTD-008 — Versioned NPC dialogue acceptance criteria and RTD PR traceability

**Version:** `1.0.0` | **Owner:** RTD-008 | **State:** criteria published, **NOT gameplay certified** | **Date:** 24 October 2026 (Australia/Sydney)

**Machine-readable contract:** [RTD_DIALOGUE_ACCEPTANCE_V1.json](RTD_DIALOGUE_ACCEPTANCE_V1.json)  
**Current task tracker:** [RTD-001–093 numbered roadmap](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md)  
**Coordination rule:** [RTD-007 claim/checkpoint protocol](RTD_007_COORDINATION_CHECKPOINT_PROTOCOL_2026-10-24.md)  
**Implementation PR template:** [repository-town-rtd.md](https://github.com/joshualparris/JoshMemory/blob/main/.github/PULL_REQUEST_TEMPLATE/repository-town-rtd.md) — select this template in GitHub for every new RTD implementation PR.

## What RTD-008 means

This is the definition of **observable, reproducible acceptance** for Repository Town's future Skyrim-inspired NPC dialogue system. It contains **34 test scenarios**, all individually named `RTAC-001`–`RTAC-034`, covering **every implementation task RTD-009–093**, plus earlier planning/coordination references. Every case has stable RTD references, setup, explicit pass/fail criteria, required evidence, evidence layer, and initial `not_evaluated` status.

**RTD-008 itself can finish when the contract, PR template, validator, checkpoint and repo tests are committed and green.** That says **nothing** about whether RTD-009–093 is implemented. In particular, all 34 cases are initially `not_evaluated`; publishing acceptance criteria is not proof of future implementations.

For each implementation PR, record its exact **RTD-NNN ID in the PR title and body**, link the specific `RTAC-NNN` cases it attempts, attach the concrete test commands, results and tested commit SHA, and link the durable `WORK_CHECKPOINT.md`. Unpassed cases must be described as **unverified, blocked or partially accepted** without checking unrelated roadmap items. The [scoped template](https://github.com/joshualparris/JoshMemory/tree/main/.github/PULL_REQUEST_TEMPLATE) contains required headings; the integration CI validates the explicit RTD claims it sees.

### Evidence levels are independent

| Evidence gate | What counts | What it does **not** establish |
|---|---|---|
| `review` | Canonical source/PR diff, current ownership and checkpoint links | Code execution or live game |
| `unit` | Repeatable Node model/graph/quest/save tests with fixtures, no remote calls | UI accessibility or audio on a real device |
| `ci` | Green required release, privacy, economic-simulation and target-specific checks on exact tested SHA | Automatic Vercel production release or hosted user click |
| `browser-local` | Locally served 2D/3D Playwright, actual WebAudio starts, screenshots, steps, screenshots/video/error trace | Live production player voice gesture |
| `browser-hosted` | Browser actually interacts with staging/production URL, exact deployed SHA, actor MP3 and earned game event | Hardware handset/backup parity unless also tested |
| `deployment` | READY deployment, live `release.json` SHA-256/sourceCommit, tested host and generated mirror comparison | Recorded voice sound quality if never played |

**Current RTD-006 baseline is only evidence of specific tests at that time.** The hosted-production Chromium/Pixel7 step was skipped, even though 10 original actor clips played in local Chromium. Never infer real production playback from HTTP 200 or a green local check.

## Acceptance case index (v1.0.0)

| Case ID | Scenario / behavior | Stable task IDs covered | Primary gate |
|---|---|---|---|
| RTAC-001 | Task ownership and stable references | RTD-001, RTD-002, RTD-005, RTD-006, RTD-007, RTD-008, RTD-088, RTD-092, RTD-093 | review |
| RTAC-002 | Actor identity isolation | RTD-003, RTD-010, RTD-033, RTD-034, RTD-078 | unit |
| RTAC-003 | Graph schema integrity | RTD-009, RTD-011, RTD-012, RTD-021, RTD-080 | unit |
| RTAC-004 | Topic groups and priority | RTD-013, RTD-015, RTD-016, RTD-017 | unit |
| RTAC-005 | Greeting by encounter history | RTD-014, RTD-033, RTD-035 | unit |
| RTAC-006 | Branch cancellation and rapid transitions | RTD-018, RTD-050, RTD-060, RTD-081 | browser-local |
| RTAC-007 | Recorded substitutions truthfulness | RTD-019, RTD-043, RTD-044, RTD-051, RTD-082 | browser-local |
| RTAC-008 | Offline authored and AI separation | RTD-020, RTD-063, RTD-064, RTD-065 | browser-local |
| RTAC-009 | Read-only world fact adapter | RTD-022, RTD-029, RTD-030, RTD-067, RTD-068 | unit |
| RTAC-010 | Quest availability | RTD-023, RTD-024, RTD-025 | unit |
| RTAC-011 | Repair success versus failure | RTD-026, RTD-027, RTD-028, RTD-032, RTD-071, RTD-072 | browser-local |
| RTAC-012 | Transaction idempotence | RTD-025, RTD-027, RTD-031, RTD-040, RTD-081 | unit |
| RTAC-013 | Remembered social events | RTD-033, RTD-034, RTD-035, RTD-041, RTD-079 | unit |
| RTAC-014 | Versioned save and migration | RTD-036, RTD-039, RTD-040, RTD-047 | unit |
| RTAC-015 | Memory privacy and consent | RTD-037, RTD-038, RTD-066, RTD-092 | browser-local |
| RTAC-016 | Approved voice manifest integrity | RTD-042, RTD-043, RTD-046, RTD-082 | unit |
| RTAC-017 | Semantic clip triggers | RTD-044, RTD-045, RTD-051, RTD-055 | browser-local |
| RTAC-018 | Missing voice generation plan | RTD-047, RTD-048, RTD-049, RTD-077, RTD-078 | review |
| RTAC-019 | Single playback authority and volume | RTD-050, RTD-052, RTD-053, RTD-059, RTD-060 | browser-local |
| RTAC-020 | Missing/broken media graceful fallback | RTD-051, RTD-052, RTD-054, RTD-083 | browser-local |
| RTAC-021 | Accessible conversation UI | RTD-056, RTD-057, RTD-058, RTD-059, RTD-061, RTD-062, RTD-085 | browser-local |
| RTAC-022 | Optional AI grounding | RTD-063, RTD-064, RTD-065, RTD-066, RTD-067 | browser-local |
| RTAC-023 | Rowan pilot full arc | RTD-069, RTD-070, RTD-075 | browser-local |
| RTAC-024 | Kit pilot full repair arc | RTD-071, RTD-072, RTD-075 | browser-local |
| RTAC-025 | Pip pilot full dice arc | RTD-073, RTD-074, RTD-075 | browser-local |
| RTAC-026 | Expansion to seven other voiced characters | RTD-076, RTD-080 | browser-local |
| RTAC-027 | Unvoiced cast, workers and NPC yarns | RTD-077, RTD-078, RTD-079 | browser-local |
| RTAC-028 | Deterministic negative-and-stress tests | RTD-080, RTD-081, RTD-082, RTD-083 | unit |
| RTAC-029 | Complete desktop and Android browser journeys | RTD-075, RTD-084, RTD-085, RTD-086 | browser-local |
| RTAC-030 | Whole-town regression and privacy gate | RTD-086, RTD-087, RTD-088 | ci |
| RTAC-031 | Staging hosted WebAudio validation | RTD-083, RTD-084, RTD-089 | browser-hosted |
| RTAC-032 | Canonical production approval | RTD-089, RTD-090 | browser-hosted |
| RTAC-033 | Backup release parity | RTD-090, RTD-091 | deployment |
| RTAC-034 | Evidence archive and open-item honesty | RTD-088, RTD-092, RTD-093 | review |

Each scenario's **setup**, **expectedPass**, **prohibitedFailure** and **requiredEvidence** is in the JSON—not hidden in this index. The contract may grow in a new revision, but never silently renumber RTD IDs or reuse RTAC IDs for unrelated behavior. Record migrations and new version in a reviewed PR.

## Concrete story acceptance journeys

The following are *future tests to implement*, not claims already satisfied:

- **Rowan, RTAC-023:** fresh visitor walks to Rowan in the actual 3D town, chooses a voiced map/tour topic, visits the real landmark, returns and gets the correct recorded return greeting after reload; no invented visit evidence.
- **Kit, RTAC-024:** request a repair without tools, with insufficient funds, cancelled, failed, and successfully completed. Only a genuinely committed successful repair can trigger success MP3/caption and an exact-once reward.
- **Pip, RTAC-025:** choose dice challenge and generate a real deterministic roll; Pip's prerecorded audio cannot claim a result different from the recorded game state; reload/replay never rerolls or grants rewards twice.
- **Game300, RTAC-016/017/019/020:** immutable speaker IDs and original ElevenLabs recordings; transcript and SHA-256 match, no private or invalid clip, one active voice across NPC/yarn switching, honest 404/CORS/offline handling, never paid runtime synthesis without approval.
- **Continuity, RTAC-013/014/015:** witnesses versus rumours, stable actors (including street Rowan and worker Rowan), versioned save with migration, explicit local-memory consent and private AI chat excluded from public exports.
- **Accessibility, RTAC-021/029:** usable choices and Hear/Stop/Replay/Back on mouse, keyboard and Android-style touch; readable in portrait/landscape, screen reader and reduced-motion support, no stuck avatar after closing a dialogue.
- **Promotion, RTAC-031/032/033:** staging real hosted browser + audio + quest state before promoting the tested commit; canonical production release manifest exact hash; generated Pages mirror independently verified, without editing generated artifacts manually.

## Contract semantics and non-negotiable protections

1. Actual social, town, expedition, repairs, inventory and money models—not a language model or sound file—authorise actions. Apply allowlisted, idempotent state transactions only.
2. No two roles merge by display name: `named:<id>`, `worker:<id>` and `resident:<coordinate>` are distinct, and workers count 99 (38 original IDs retained), houses 188.
3. An approved ElevenLabs MP3 only represents **its own speaker and exact transcript**; device fallback must be visible and opt-in, with no invented voice or fake actor captions. Existing VoiceBank audio parents 006–013/040–048 are separate tasks.
4. Privacy is a release blocker. No secrets, private repo URLs/text, or raw AI chat should enter public builds/exports. Preserve the existing save-transfer allowlist.
5. Every PR must explicitly state what it **did not** test; locally played clips, a green build, a READY deployment, real hosted interaction and a real Samsung handset are **different statuses**.
6. Run `node tests/rtd-acceptance-contract.mjs` with changes and `npm run build:release` for implementation. GitHub's Town Integration workflow also checks PR traceability for RTD-numbered PRs, while RTD-007 ensures ownership and checkpoints.

## Future implementation PR proof template

Use the [scoped GitHub template](https://github.com/joshualparris/JoshMemory/blob/main/.github/PULL_REQUEST_TEMPLATE/repository-town-rtd.md) and its exact headings. Example (not an assertion of completion):

```text
Title: feat(town): RTD-009 dialogue graph schema

RTD task IDs: RTD-009
Acceptance case IDs: RTAC-003
Evidence: node tests/dialogue-schema.mjs PASS on <tested SHA>
Checkpoint: repository-town/WORK_CHECKPOINT.md
Incomplete or blocked: RTAC-003 browser cases not applicable; RTD-011 director integration still open
```

The validator verifies IDs, cross-references, relevant case coverage and required traceability fields. It **does not** infer real gameplay, MP3 integrity or production acceptance from PR prose.

## RTD-008 completion checklist

- [x] RTD-008 claimed on canonical board with exact paths before work; start checkpoint committed on main.
- [x] Versioned `RTD_DIALOGUE_ACCEPTANCE_V1.json` authored with 34 stable RTAC cases, explicit pass/fail and evidence layers.
- [x] Scoped GitHub RTD implementation PR template, `tests/rtd-acceptance-contract.mjs` validator with negative metadata examples, and required Town Integration CI metadata gate.
- [ ] Reviewed/merged PR with appropriate actual CI evidence; final M4 checkpoint and board handover.
