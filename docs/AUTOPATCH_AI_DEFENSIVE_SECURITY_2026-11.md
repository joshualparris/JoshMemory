# AutoPatch AI defensive threat model for JoshMemory / Repository Town
**11 November 2026 — public, design-only, no production scans or new security claims.**

## Why this exists

Autonomous AI can discover security defects and propose repairs, but code proposals and success reports cannot be accepted as proof of safety. University of California, Berkeley's [CyberGym-E2E](https://rdi.berkeley.edu/blog/cybergym-e2e/) evaluates finding vulnerabilities, reproducing a pre-fix crash and ensuring a candidate patch preserves functionality. Google's [PageBreak research](https://blog.google/security/agentic-hacks-real-proofs-inside-googles-pagebreak-project/) stresses that unverified AI reports create significant noise. [OpenAI's Nov 2026 kernel research](https://openai.com/index/a-thousand-fewer-paths-to-root/) illustrates the power and the high cost of frontier campaigns; [Project Glasswing](https://www.anthropic.com/research/glasswing-initial-update) similarly demonstrates why verification and disclosure are bottlenecks.

**Use the existing private AutoPatch research and safety gates from JoshDashboard4 as the coordinator.** This repository's role is an *owned source-code target* with PR-level CI. Do not duplicate fleet inventory or the 4am/5pm schedules here.

## Asset boundaries and high-value risks

| Area | Trust boundary / failure | Evidence-driven defensive test |
|---|---|---|
| Repository Town browser client | Untrusted world data, NPC/player chat, URLs and UI input | Reject unsafe markup/URLs, test escaping, persistence and mobile behaviour |
| Multiplayer/session state | Untrusted player input vs identity/authorisation | Test session boundaries, permissions, tampered messages and rate limiting on local fixtures |
| Saved world and resident data | Save compatibility, migration, player progression | Use disposable snapshots, replay determinism and restore; never change real saves as a vulnerability test |
| Node dependencies nested under games | Transitive packages, outdated lockfiles, npm lifecycle scripts | GitHub Dependabot plus locked \`npm ci\`, build/test and independent rescan |
| GitHub workflow execution | Untrusted PR content vs Actions credentials and protected branches | Minimal read permissions for PR checks; no secrets passed to unreviewed code |
| Content import/discovery | External web content, podcast metadata and downloaded files | Treat data as untrusted, validate schema/path boundaries, prohibit new network target expansion |
| AI reviewer / patch proposer | Model output influenced by untrusted source/issue/log text | Agent has no merge/deploy secrets; separate tests and reviewer must independently verify |

## Current native checks to reuse

- \`.github/workflows/town-integration.yml\`: Repository Town build, privacy, game logic and, for high-risk changes, full browser/mobile/economy acceptance.
- \`.github/workflows/autopatch-nested-npm.yml\`: isolated nested npm install/build tests and project-specific regression checks.
- \`.github/dependabot.yml\`: daily opted-in nested package updates; ordinary version updates minor/patch, but security updates may need a major version.
- \`.github/workflows/town-automerge.yml\`: existing opt-in restrictions for approved Town PRs. **Do not reuse its label for security repair PRs or bypass the existing safety checks.**

PRs #543 and #554 added nested update coverage and safer routine version limits. A PR is not evidence that the dependency vulnerability has been remediated in a deployed app. Check fresh GitHub alerts and lockfile versions; do not reuse historical scan totals as current.

## AI security patch contract

1. **Discover:** Run deterministic SBOM/OSV/Dependabot analysis first. An LLM may explore reachable source paths, but may not claim an unsupported CVE.
2. **Reproduce locally:** Create a *non-production* regression fixture that fails before the patch and passes after, with an immutable hash. No live exploit tooling, scanning third-party hosts or modifying a saved world.
3. **Propose:** Make one small branch/PR per root cause. Pin versions and link a scanner/advisory. Avoid blanket dependency upgrades, migrations or untested major changes.
4. **Independently test:** Run the relevant Town integration pipeline, newly affected nested-package tests, privacy check, and a separate reviewer or rule-based analysis. All CI states must be conclusive and green.
5. **Defer merge/deployment to policy:** Existing protected-branch and human-review controls remain authoritative. Do not claim a fix from a green CI run alone.
6. **Verify:** Confirm the deployed commit and runtime version, app health, save compatibility and fresh vulnerability scan. Record UNKNOWN when a deployment/rescan cannot be read.

A model cannot approve its own fix. Logs, issue bodies, README files, external advisory text and PR diff comments are untrusted input. Never place production credentials, live user saves or private security reports into public PR artifacts.

## First practical experiment

Use one isolated, already-disclosed or synthetic test vulnerability in a disposable Node game fixture. Benchmark two paths **under an explicit cost cap**: deterministic scanner + Dependabot version bump versus LLM-suggested narrowly scoped patch. Both must have a failing-before/passing-after regression and independent review. Compare time, true-positive proof, CI regressions and verified fix cost. **Do not ship the fixture into a game build.**

For research context, see [OpenAI Codex Security](https://help.openai.com/en/articles/20001107-codex-security), [Google OSV-Scanner](https://github.com/google/osv-scanner/blob/main/docs/scan-source.md), and [GitHub's Dependabot security update behaviour](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates).

**Status:** Research and integration policy only. No AI source repair, deployed game update, or independently verified CVE remediation is implied by this document.
