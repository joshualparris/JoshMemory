# Cross-project security programme — 120-task index

**16 November 2026. Documentation and scope only; not a claim that assets were scanned or secured.**

The user's unified, individually numbered security checklist is held in the **private canonical AutoPatch AI implementation repository**, [JoshDashboard4 / security/autopatch-ai/SECURITY_PROGRAMME.md](https://github.com/joshualparris/JoshDashboard4/blob/main/security/autopatch-ai/SECURITY_PROGRAMME.md). The machine-readable status register and receipt gates are kept there to avoid broadcasting sensitive asset status in this public repository.

| Numbered IDs | Area | Count |
|---|---|---:|
| SEC-001–SEC-010 | GitHub repositories and code | 10 |
| SEC-011–SEC-020 | Websites and web applications | 10 |
| SEC-021–SEC-030 | Cloud hosting and databases | 10 |
| SEC-031–SEC-041 | Personal and authorised endpoint devices | 11 |
| SEC-042–SEC-051 | Games, launchers and multiplayer | 10 |
| SEC-052–SEC-060 | Accounts, identity and privileged access | 9 |
| SEC-061–SEC-071 | Payments, shops and sales | 11 |
| SEC-072–SEC-079 | Email and domains | 8 |
| SEC-080–SEC-088 | Networks and infrastructure | 9 |
| SEC-089–SEC-098 | Backups, recovery and privacy | 10 |
| SEC-099–SEC-112 | Continuous monitoring and automatic repair | 14 |
| SEC-113–SEC-120 | Employer and client environments | 8 |
| **Total** | **12 areas** | **120** |

## JoshMemory responsibilities

- Reuse existing Town/game/privacy/integration workflows and [defensive security threat model](AUTOPATCH_AI_DEFENSIVE_SECURITY_2026-11.md); do not create a second AutoPatch or unified dashboard.
- Reference individual SEC task IDs in issue/PR evidence as appropriate, without copying confidential findings, contact details, tokens, internal client assets or private scan output into this public repo.
- A code patch or passing CI is not a production fix. A declared verified outcome needs independent deployment/runtime evidence and a post-fix check.
- Treat agent/tool output as untrusted. Continue the existing tests and protected-branch review rules.
- Only assets owned or explicitly authorised for that operation may be changed; client/work access alone is not global authorisation. Client reports must remain separate from personal data.
- Actions affecting saves, worlds, multiplayer accounts or production operations need rollback or a disposable recovery copy and explicit approvals where required.

**Live status:** consult the private canonical register rather than these index counts. No production device patching or client changes are performed by this document.
