# JoshMemory coding-history migration backlog

Last reconciled: 18 September 2026 (Australia/Sydney)

## Purpose

Track migration of Josh's recoverable software-engineering and technical history into durable JoshMemory continuity. This backlog intentionally excludes health, family, finance, faith, travel and other non-coding personal memory.

Status values:

- `MIGRATED` — compact durable cloud fact/handoff exists.
- `PARTIAL` — some important context exists, but significant detail remains only in old local history/chats/files.
- `QUEUED` — known useful technical history still needs migration.
- `INTENTIONALLY_EXCLUDED` — should not be persisted in coding memory (for example secrets or raw private transcripts).
- `STALE_HISTORY` — preserve only as dated/superseded historical evidence.

## Portfolio / continuity

| Area | Status | Notes |
| --- | --- | --- |
| 2026 portfolio master handoff | MIGRATED | `docs/CODING_2026_MASTER_HANDOFF.md` plus `JoshCoding2026` handoff. |
| Fresh-agent resume roadmap | MIGRATED | `docs/FRESH_AGENT_RESUME_ROADMAP.md`. |
| Engineering principles / metrics model | MIGRATED | Principles > gates > ratchets > signals > outcomes; correctness first. |
| Project search index | PARTIAL | Broad names migrated; canonical alias registry still needs first-class implementation. |
| Old local JoshMemory corpus counts/evolution | PARTIAL | Broad counts migrated; detailed source/session/evidence history remains local. |
| Historical ChatGPT/Codex raw transcripts | INTENTIONALLY_EXCLUDED | Keep as source material/local corpus; do not dump raw private transcripts into GitHub cloud storage. |
| Secrets/tokens/cookies | INTENTIONALLY_EXCLUDED | Never persist. |

## JoshMemory itself

| Area | Status | Notes |
| --- | --- | --- |
| GitHub cloud architecture | MIGRATED | Private `JoshDashboard4/joshmemory-cloud/v1`; append-only JSON. |
| Fedora/Windows installation paths and migration history | QUEUED | Paths, local SQLite, `.venv`, MCP config, migration specifics. |
| Antigravity/Codex/Claude integration chronology | QUEUED | Separate actually-working integrations from planned/blocked ones. |
| No-paid-OpenAI-API / existing-subscription constraint | QUEUED | Persist as tooling/workflow preference, not credential detail. |
| `resume_work` one-call startup | QUEUED | Roadmap P0. |
| Canonical project/alias registry | QUEUED | Roadmap P0. |
| Current-work leases | QUEUED | Roadmap P0. |
| Resume regression tests | QUEUED | Roadmap P3. |

## DadLAN / fleet / machines

| Area | Status | Notes |
| --- | --- | --- |
| DadLAN architecture boundaries | MIGRATED | Control Centre integrates Action1/MeshCentral/SMB/ForgeGrid/etc. |
| Detailed 12-machine inventory | QUEUED | Machine IDs, roles, OS/hardware, current capabilities. |
| SSD/RAM upgrade history | QUEUED | Includes #9 final worthwhile SSD, #10 intentionally HDD, #11 8 GB. |
| Action1 role and security boundary | PARTIAL | General role migrated; endpoint/status history pending. |
| Action1 endpoint snapshots | QUEUED | Preserve as dated history only. |
| AVANCE-WS7 hardware baseline | QUEUED | HP ProDesk 400 G6 Mini, i5-10500T, 24 GB, Fedora/KDE/Wayland. |
| AVANCE stability investigation | QUEUED | MemTest/Btrfs/NVMe/OOM/i915/KWin history with uncertainty preserved. |
| Employer-machine boundary | QUEUED | Do not casually alter employer AVANCE machine configuration. |
| LANCommander rollout | QUEUED | JParrisDesktop server, Fedora client, Laptop04/05 rollout constraints. |
| Printer/DNS/SSD-clone troubleshooting | QUEUED | Machine-specific support history; useful only where it affects repeat fixes. |

## ForgeGrid / distributed execution

| Area | Status | Notes |
| --- | --- | --- |
| ForgeGrid architectural boundary | MIGRATED | Model thinks -> coordinator decides -> ForgeGrid executes -> evidence returns. |
| ForgeGrid deep incident history | PARTIAL | Major themes migrated; branch/worktree/machine incidents remain. |
| Current 17 Sep fleet state | QUEUED | Supersede six-worker snapshot with all 12 workers on 0.8.3 / `77a07222a435`, smoke jobs passed. |
| Scheduling philosophy | QUEUED | Optimize wall-clock to independently reviewed change, not utilisation; useful parallelism only. |
| `postJobUpdate` ACK/retry gap mission | QUEUED | Preserve as historical task and verification requirement. |
| ProBook worker update/rollback history | QUEUED | Includes dirty-work preservation and elevation requirements. |
| 100-job exactly-once / worker-failure recovery | QUEUED | Historical unresolved reliability items; verify current state. |

## Verification / accountability stack

| Area | Status | Notes |
| --- | --- | --- |
| AgentCheck / AgentWitness / LLMAccountability boundaries | MIGRATED | Do not self-award SATISFIED; direct evidence wins. |
| AgentWitness repo alias (`AgentCheck`) | QUEUED | Two local clones/branches of same canonical repo; avoid inventing nonexistent `joshualparris/AgentWitness`. |
| AgentWitness `aw_dir` / `w_dir` repair history | QUEUED | Crash and transcript-sync fixes plus regression verification. |
| LLMAccountability ACL/isolation history | QUEUED | Preserve blocked/verified states with dates. |
| LLMAccountability dummy digest issue | QUEUED | V2 `sha256:dummy` note from 4 Sep; verify whether fixed. |
| AgentCouncil role | PARTIAL | Thin review/orchestration layer; do not duplicate evidence systems. |
| JoshSupervisor checkpoints/mission supervision | PARTIAL | Architecture noted; detailed milestones pending. |

## Local LLM / Ollama

| Area | Status | Notes |
| --- | --- | --- |
| JParrisDesktop production gateway architecture | MIGRATED | Advisory/read-only, schema validated, fail-closed. |
| Full local UI/tool capability history | QUEUED | Filesystem, zip, SQLite devices DB, LAN scan, memory.json, clipboard, volume, grounding tests. |
| Reliability/performance snapshots | PARTIAL | 17/17 and warm speed migrated; 20/20 reliability and model-store details pending. |
| Controlled web lookup/mobile roadmap | QUEUED | Historical next-work context. |

## Repo/project-specific work

| Project / stream | Status | Notes |
| --- | --- | --- |
| CRAP4All | PARTIAL | Core architecture/quality philosophy migrated; full roadmap and audit dataset pending. |
| Beautiful Code portfolio rollout | PARTIAL | Global model migrated; per-repo changes/results pending. |
| JoshHub | PARTIAL | Portfolio/deployment-QA lessons migrated; exact evolution/status-board history pending. |
| Podcast rollout | PARTIAL | Architecture/lessons migrated; app-by-app dated states pending. |
| HealthLens / JoshHealth | PARTIAL | Core server-side/CI context migrated; ingestion/Android/auth chronology pending. |
| DCSPD / DCS / DCSPrep | PARTIAL | Broad security/podcast/CI context migrated; detailed chronology pending. |
| AppFactory | PARTIAL | Broad deployment lesson migrated; historical branch/deployment issues pending. |
| ParrisBudgetApp | PARTIAL | Destructive Prisma lesson migrated; detailed commit/history pending. |
| FedoraCrashDoctor | PARTIAL | Broad stage history migrated; versions/verification/stability details pending. |
| ChatGPTBrowser | PARTIAL | Retrieval/FTS5 work noted; detailed history pending. |
| RagTime | PARTIAL | Security/integrity notes present; detailed chronology pending. |
| KaseyaFieldOps | PARTIAL | QuickReference/error lesson noted; branches/ticket scenarios pending. |
| AgentBridge | PARTIAL | 401 rule noted; detailed relay/identity history pending. |
| Eleven-Realms | PARTIAL | Initial scaffold state migrated; subsequent work pending. |
| Whispering Wilds / WhirringWilderness | PARTIAL | Pages/permissions state migrated; older game UI/TUI/E2E history pending. |
| NebulaDice-Browser | MIGRATED | Current Pages repair status recorded as dated snapshot; deeper history optional. |
| WorkApp | PARTIAL | Current Pages repair plus podcast work; deeper chronology pending. |
| CanonRPG | PARTIAL | Pages-unavailable repair recorded; deeper chronology pending. |
| openclaw | PARTIAL | Fork/CI state summarised; fork-sync/local-change history pending. |
| Arena | PARTIAL | Permission/status context only; project history pending. |
| carl | PARTIAL | Python `3.10` YAML issue noted; broader CI history pending. |
| ColdFluApp | QUEUED | July research/workbench/child-safety/launch work, Vercel previews, recurring quality-gates failures. |
| JoshTapApp / NfcAudioPlayer | QUEUED | Early coding-history family. |
| AIDungeonMaster / GroqChat / Campaign Copilot | QUEUED | Historical AI/app lineage and security work. |
| cornerstone-lifeboat / Transfer | QUEUED | Canonical alias and domain-migration history. |
| IncreaseHRV / `joshuaparris-max/hrv` | QUEUED | Canonical alias + project history. |
| ChatGPTBrowser / `joshuaparris-max/ChatGPT-History-Browser` | QUEUED | Canonical alias. |
| llm-gladiator-arena-app / `joshuaparris-max/llm` | QUEUED | Canonical alias. |
| August app inventory ([REDACTED_PERSON]App, [REDACTED_PERSON]App, Sleepy, Money, Books, Research, etc.) | QUEUED | Preserve project identities/relationships and only high-value durable history. |

## Workflow / safety preferences

| Rule | Status | Notes |
| --- | --- | --- |
| Live evidence outranks memory | MIGRATED | Core authority model. |
| No destructive reset/clean/force-push of dirty work | QUEUED | Preserve unrelated dirty repos/worktrees. |
| Verify commit/remotes/secrets independently | PARTIAL | General verification rule migrated; explicit workflow constraint pending. |
| Optimise wall-clock time to independently reviewed change | QUEUED | Do not maximise machine utilisation for its own sake. |
| Keep Josh as final push/merge/deploy approver where required by workflow | QUEUED | Preserve exact historical constraint and reconcile with later direct-write authorisations. |
| Avoid unnecessary paid APIs | QUEUED | Prefer existing subscriptions/local models where appropriate; never bypass auth. |
| Human escalation only for credentials/destructive/physical/genuinely ambiguous decisions | QUEUED | Good autonomous-agent boundary. |

## Migration policy

1. Prefer compact project facts and structured handoffs over transcript dumps.
2. Preserve dates and supersession when status changed.
3. Use canonical repository identity where known.
4. Mark machine/CI/deployment snapshots `HISTORICAL` unless they are deliberately refreshed.
5. Do not infer that a historical blocker still exists; verify live.
6. Do not persist secrets, credentials or sensitive non-coding personal information.
7. After each migration batch, update this backlog from `QUEUED/PARTIAL` to `MIGRATED/PARTIAL` as appropriate.
