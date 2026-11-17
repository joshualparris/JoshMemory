# AutoPatch discovery-to-deployment implementation checklist

Prepared: 11 November 2026. Classification: PUBLIC, sanitised design and task backlog.

## Goal and authority

Build a repeatable workflow that identifies vulnerabilities on authorised assets, validates findings in isolation, proposes constrained repairs, and proves that authorised deployments reached the intended running system. Optimise for reduced exploitable risk, not finding counts or merged PR counts.

Extend the existing AutoPatch coordinator, inventory, safety gates, reporting, and maintenance workflow. JoshMemory is an owned source-code target with PR-level CI, not a second fleet coordinator or private evidence store. Reuse the [existing defensive threat model](AUTOPATCH_AI_DEFENSIVE_SECURITY_2026-11.md).

All tasks below are open acceptance requirements, not claims of missing code or proof of implemented functionality. Inspect existing modules and active PRs before assigning implementation work; close a task only with appropriate evidence. This checklist does not authorise deployment, privileged operations, automatic merging, device enrollment, new paid services, or access outside explicit ownership and permission.

Do not publish private inventories, runtime identifiers, credentials, raw scan exports, unreviewed vulnerability details, or operational evidence here. Store those in the approved private system and use public-safe summaries where appropriate.

## Immediate next assignment

- [ ] **APV-001:** Inspect the current AutoPatch implementation, repository instructions, related PRs, CI, and task configuration. Map this backlog to existing modules; do not duplicate active work.
- [ ] **APV-002:** Produce a capability map distinguishing implemented, unit-tested, exercised on a real target, deployed, and independently verified.
- [ ] **APV-003:** Audit scanner classification using cached fixtures and actual adapter code. For a demonstrated defect, write a failing test first, make the minimal correction, and open one focused PR.

Acceptance: a source-linked capability map and a reproducible correctness result. If access blocks the implementation, record the precise blocker rather than creating a replacement coordinator in this repository.

## Milestone A: trustworthy findings and asset matching

- [ ] **APV-A01:** Separate version parsing, lookup execution, advisory assessment, and scan coverage in the result schema.
- [ ] **APV-A02:** Enforce the approved Goal C policy consistently: an empty OSV match is `unknown`, with `no known OSV match` recorded separately, not an assertion of safety.
- [ ] **APV-A03:** Cover single and batch paths: missing `vulns`, empty items, matching/nonmatching advisories, malformed responses, timeouts, and partial advisory-fetch failures.
- [ ] **APV-A04:** Exclude withdrawn advisories from active findings while retaining their audit history.
- [ ] **APV-A05:** Deduplicate aliases transitively. Report package occurrences, distinct package/version pairs, and advisory/root-cause groups separately.
- [ ] **APV-A06:** Establish development/production and direct/transitive classifications, including workspace, mixed, and unknown cases.
- [ ] **APV-A07:** Compare against an authorised, sufficiently complete Dependabot snapshot with time and revision context. Unavailable data is not an empty alert set.
- [ ] **APV-A08:** Use “OSV-detected; comparison unavailable” until independent comparison supports “OSV-only” or “confirmed by both.”
- [ ] **APV-A09:** Map a source revision and artifact digest to an actual authorised deployment and exact runtime version.
- [ ] **APV-A10:** Track stale inventories, unsupported dependency specifications, missing ecosystems, inaccessible assets, and incomplete scans.
- [ ] **APV-A11:** Record severity provenance, fixed-version metadata, compatibility, exposure, and dated KEV/EPSS evidence where available. Missing exploitation evidence is not proof of no exploitation.

Acceptance: realistic classification fixtures pass, one authorised application has a traceable asset-to-artifact-to-finding record, and missing permissions or no findings cannot imply “secure.”

## Milestone B: reproducible dependency repairs

- [ ] **APV-B01:** Reproduce an existing candidate from its recorded source revision and saved patch in a fresh isolated copy.
- [ ] **APV-B02:** Bind baseline and candidate checks to exact lockfile hashes, tool versions, advisory snapshots, commands, and exit codes.
- [ ] **APV-B03:** Review runtime requirements, project commands, and lifecycle scripts before execution.
- [ ] **APV-B04:** Prefer `npm ci --ignore-scripts` and lifecycle-disabled candidate changes. Require approval for necessary exceptions; an explicitly invoked build still executes project code.
- [ ] **APV-B05:** Limit changes to the necessary dependency or parent constraint and resulting lockfile. Review major-version changes and unexpected lockfile churn explicitly.
- [ ] **APV-B06:** Report resolved, remaining, introduced, and unknown findings using identical assessment rules on both sides.
- [ ] **APV-B07:** Reconcile counts without confusing resolved advisories with repaired package occurrences.
- [ ] **APV-B08:** Produce a reviewable patch and rollback instructions without altering the original target checkout.
- [ ] **APV-B09:** Label build-only validation honestly; do not call a production build a test suite or deployed verification.

Acceptance: another operator can reproduce the candidate result from the recorded revision and evidence. Incomplete advisory retrieval prevents unsupported “no regressions” conclusions.

## Milestone C: one AI-assisted source repair

- [ ] **APV-C01:** Select a synthetic or already-disclosed isolated fixture, or explicitly authorised owned-code target.
- [ ] **APV-C02:** Document the threat model, affected path, security property, and disclosure sensitivity.
- [ ] **APV-C03:** Combine deterministic analysis with bounded LLM investigation; validate the finding through a minimal defensive reproduction.
- [ ] **APV-C04:** Establish a meaningful security regression that fails on the baseline and passes on the candidate.
- [ ] **APV-C05:** Prevent unnoticed weakening or replacement of the decisive test by the patching agent.
- [ ] **APV-C06:** Generate the smallest root-cause patch and inspect related bypasses or variants.
- [ ] **APV-C07:** Run applicable functional, security, privacy, and regression checks, plus separate adversarial review.
- [ ] **APV-C08:** Distinguish repair of a known fixture from discovery of a previously unknown vulnerability.

Acceptance: reproducible baseline failure, minimal patch, passing meaningful regression, separate review, and explicit validation limits. Do not ship vulnerable fixtures into application builds.

## Milestone D: trusted evidence and deterministic gates

- [ ] **APV-D01:** Extend the existing versioned evidence schema rather than create a competing receipt format.
- [ ] **APV-D02:** Keep finding, repair, deployment, and verification states separate. Represent unknown, proposed, tested, deployed-unverified, reboot-pending, failed, rolled-back, and verified-fixed without ambiguous promotion.
- [ ] **APV-D03:** Bind evidence to exact source SHA, artifact digest, target, scanner snapshot, environment, and timestamps.
- [ ] **APV-D04:** Generate receipts through protected CI or trusted collectors, not arbitrary agent-authored JSON.
- [ ] **APV-D05:** Verify issuer authority, freshness, target/artifact binding, and tamper evidence; keep attestation credentials outside patch-agent access.
- [ ] **APV-D06:** Protect decisive tests, verifier code, and policy definitions against unreviewed patch changes.
- [ ] **APV-D07:** Reject forged or replayed receipts, stale rescans, mismatched commits, failed checks, missing evidence, and self-approval.
- [ ] **APV-D08:** Use deterministic policy evaluation. A model recommendation cannot override failed gates.

Acceptance: fabricated JSON, another commit's green CI, and self-approved patches cannot reach verified-fixed. Attestation proves provenance within its trust assumptions, not comprehensive test quality.

## Milestone E: authorised deployment and runtime verification

- [ ] **APV-E01:** Enroll one explicitly authorised test application or personally owned test device under a recorded policy.
- [ ] **APV-E02:** Establish a supported update channel, backup/recovery procedure, health baseline, maintenance window, canary scope, and stop conditions.
- [ ] **APV-E03:** Obtain deployment approval and deploy exactly the tested artifact or supported update candidate.
- [ ] **APV-E04:** Collect trusted target-bound evidence of the running version and configuration, not just installed files.
- [ ] **APV-E05:** Rescan after deployment with adequate coverage and a recorded intelligence snapshot.
- [ ] **APV-E06:** Verify service health over a defined observation period and preserve application/save compatibility.
- [ ] **APV-E07:** For kernel updates, compare installed and running kernels; pending reboot remains unresolved until an authorised reboot and verification.
- [ ] **APV-E08:** Exercise rollback in the test environment and record the result.
- [ ] **APV-E09:** Promote to verified-fixed only when all required target-specific evidence passes.

Acceptance: trace one vulnerability from affected target through validated repair, authorised rollout, actual runtime verification, and demonstrated rollback readiness. Merged PRs and successful install commands alone do not satisfy this milestone.

## Milestone F: continuous operation and controlled expansion

- [ ] **APV-F01:** Inspect and extend the existing maintenance task without creating duplicate recurring audits.
- [ ] **APV-F02:** Use resumable jobs with explicit inputs, outputs, checkpoints, leases, concurrency limits, timeouts, and bounded retries.
- [ ] **APV-F03:** Treat source, advisory text, logs, and issues as untrusted data. Restrict credentials, egress, and execution authority.
- [ ] **APV-F04:** Begin with a small coordinator and deterministic checks; add model roles only when measurable benefit justifies complexity.
- [ ] **APV-F05:** Enable automatic merging only under separately approved low-risk rules with conclusive exact-commit checks. Keep deployment authority separate.
- [ ] **APV-F06:** Add canary progression, health-triggered stopping, and tested rollback before broadening rollout.
- [ ] **APV-F07:** Track false positives, coverage unknowns, repair correctness, regressions, rollback rate, time-to-validate, and verified runtime remediation.
- [ ] **APV-F08:** Measure actual tool/model usage and enforce configured resource or spending limits before activating paid integrations.
- [ ] **APV-F09:** Expand ecosystems and device classes individually with environment-specific acceptance tests.
- [ ] **APV-F10:** Distinguish a persisted long-term goal from a configured durable scheduler; report actual execution and failures truthfully.

Acceptance: repeated bounded runs and failure-injection tests demonstrate safe stopping, operator intervention, and no silent escalation of scope.

## Integration architecture

```text
Authorised inventory and artifact identity
    -> deterministic discovery + bounded AI investigation
    -> isolated finding validation
    -> constrained candidate patch
    -> protected regression checks + separate review
    -> deterministic policy gate
    -> authorised canary deployment
    -> trusted runtime observation + post-deployment rescan
    -> health monitoring, rollback, and audit history
```

Discovery, patching, execution, and verification are separate trust boundaries. They do not require a large fleet of LLM agents; a small coordinator can connect existing scanners, CI, supported update channels, and trusted collectors.

Keep secrets out of untrusted PR execution. Preserve branch protections, vendor signatures, administrative safeguards, and worker restrictions. Network reachability never establishes authority to assess or modify a target.

## Research and measurement backlog

- [ ] **APV-R01:** Verify research claims against primary publications before reusing statistics or selecting models.
- [ ] **APV-R02:** Record access restrictions, privacy, licensing, hardware requirements, reproducibility, and measured costs.
- [ ] **APV-R03:** Prefer existing scanners and CI where sufficient; benchmark end-to-end outcomes on controlled fixtures rather than test-pass rates alone.
- [ ] **APV-R04:** Maintain a clear separation between published research, proposed architecture, implemented code, and demonstrated operational outcomes.

This checklist adds no fresh research statistics or vulnerability totals. The existing threat model contains research context; the [merged repository guidance PR](https://github.com/joshualparris/JoshMemory/pull/558) is documentation, and the [proposed bounded worker contract](https://github.com/Parris-Tech-Services/ForgeGrid/pull/32) is not itself an implemented repair engine.

## Completion records

Close tasks with the implementation PR, exact candidate revision, relevant checks, public-safe evidence summary, remaining limitations, and next required approval. Keep sensitive details in the approved private evidence store.

Report each milestone as VERIFIED COMPLETE, PARTIALLY COMPLETE, BLOCKED, or NOT VERIFIED against its stated scope. A tested patch may complete a repair milestone while deployed remediation remains NOT VERIFIED.
