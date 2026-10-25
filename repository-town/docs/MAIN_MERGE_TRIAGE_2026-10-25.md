# Main-branch merge audit — 25 October 2026

**Canonical source:** `joshualparris/JoshMemory` `main` for `repository-town/`.  
**Scope:** all currently open Repository Town/JoshMemory PRs and branch inventory. No claim that every branch should be merged; some are historical snapshots, staging branches, draft or superseded work. **Do not force merge, rewrite main, delete unmerged branches, or skip checks.**

## Already merged and verified

- [#202](https://github.com/joshualparris/JoshMemory/pull/202) — RTU-003/004/005 design of source-to-service electrical backbone.
- [#203](https://github.com/joshualparris/JoshMemory/pull/203) — playable 16-property pilot with Railway Hotel and Merged Branch, individual faults and metering.
- [#209](https://github.com/joshualparris/JoshMemory/pull/209) — mobile **⚡ Grid** and **Ask AI** moved into the + menu.
- [#210](https://github.com/joshualparris/JoshMemory/pull/210), [#211](https://github.com/joshualparris/JoshMemory/pull/211), [#212](https://github.com/joshualparris/JoshMemory/pull/212) — unique roster names, historical 99-worker snapshot checks and unchanged home assignments.
- Earlier source-specific branches are **not** automatically unmerged just because their remote branch ref still exists; check comparison with current main before making a fresh PR.
- Independent cross-repository consolidation in this session merged **29 safe PRs** into each repository's existing default branch, including personal and Parris-Tech-Services repos. Those merges do **not** imply an organization-wide full CI certification.

## Current open PRs (live status can change)

| PR | Work | Snapshot decision |
|---|---|---|
| [#216](https://github.com/joshualparris/JoshMemory/pull/216) | Pub facade 14×18m aligned to walkable room | **BLOCKED**: pub envelope geometry + Town safety gate failing; visual gameplay run pending at time of audit |
| [#208](https://github.com/joshualparris/JoshMemory/pull/208) | PUB-CODE P0 access, egress, WC, occupancy and safety design | **BLOCKED**: pub P0 / Town safety / 3D game checks failing; incomplete design-stage assumptions; MUST NOT represent NSW NCC approval |
| [#186](https://github.com/joshualparris/JoshMemory/pull/186) | NPC visual variety + crowd-collision system | **CONFLICTING** with main; reconcile against latest entity / shop code before testing |
| [#164](https://github.com/joshualparris/JoshMemory/pull/164) | Twenty ElevenLabs recorded dialogue files | **DRAFT and CONFLICTING**; reconcile audio/IDs with newer voice integrations |
| [#159](https://github.com/joshualparris/JoshMemory/pull/159) | Port Pages-only shop staffing logic | **CONFLICTING**; compare current shopService/attendance first |
| [#153](https://github.com/joshualparris/JoshMemory/pull/153) | Roster, meal and playtest recovery | **CONFLICTING**; compare current 188-worker roster and save compatibility |
| [#128](https://github.com/joshualparris/JoshMemory/pull/128) | Employer wage float | **CONFLICTING**; reconcile against current economy |
| [#127](https://github.com/joshualparris/JoshMemory/pull/127) | Business establishment grants | **CONFLICTING**; verify money creation and double funding |
| [#126](https://github.com/joshualparris/JoshMemory/pull/126) | Store invoices, probe, credits | **CONFLICTING**; review cold-chain ledger compatibility |
| [#125](https://github.com/joshualparris/JoshMemory/pull/125) | Earlier floating Ask AI button fix | **CONFLICTING / LIKELY SUPERSEDED by #209**; do not restore floating mobile launcher |
| [#123](https://github.com/joshualparris/JoshMemory/pull/123) | Café reconciliation | **CONFLICTING** with newer occupation and café simulation |
| [#82](https://github.com/joshualparris/JoshMemory/pull/82) | Render QA deploy-hook | **CONFLICTING**; check actual secured Render hook and required permissions |
| [#63](https://github.com/joshualparris/JoshMemory/pull/63) | Adaptive pixel ratio | **CONFLICTING / LIKELY ALREADY IMPLEMENTED** by current `main.js`; do not overwrite existing adaptive controls |
| [#52](https://github.com/joshualparris/JoshMemory/pull/52) | Crowd personal-space reconciliation | **DRAFT and CONFLICTING**; may overlap #186 |
| [#48](https://github.com/joshualparris/JoshMemory/pull/48) | Farm, vet, trade, brewery, pub industry | **CONFLICTING**; broader economy and gameplay acceptance needed |
| [#8](https://github.com/joshualparris/JoshMemory/pull/8) | Branch scoring date regression | **CONFLICTING**; isolate test-only behavior |
| [#6](https://github.com/joshualparris/JoshMemory/pull/6) | GitHub-backed test-store isolation | **CONFLICTING**; regression and privacy gates needed |

Latest full list: [open PRs](https://github.com/joshualparris/JoshMemory/pulls?q=is%3Apr+is%3Aopen).

## Branch inventory and safe merge rules

- Snapshot of `joshualparris/JoshMemory` branch API: **242 remote branches**, including **13 `archive/` branches** and **24 `docs/` branches**, plus `main`. A branch's continued existence is *not* proof it has unmerged work.
- **Never merge `archive/` or superseded integration branches automatically.** Archives intentionally preserve historical test baselines. Compare branch vs current `main`; when there is no unique code, leave it as history or archive it after separate retention review.
- For each live, uniquely valuable, non-draft branch: identify file overlap and source ownership; rebase / resolve conflicts on a separate branch; test its intended behavior against current `main`, including mobile playtest and save compatibility where relevant; use PR checks; only then merge with expected head SHA.
- Keep the active pub-safety P0 and pub-facade PRs separate while their test gates are red. No use of branch-protection bypass or forced pushes.
- Branch cleanup/deletion is **separate from integration** and should preserve references required by saved-game, audit, or release reports. No branches were deleted as part of this consolidation.
- There are many more open PRs outside JoshMemory; those require repository-local acceptance and permission checks. A global merge-everything request does not make failed checks green or resolve merge conflicts by itself.

**Next agent action:** Fix the failing pub #216 geometry and #208 safety/browser checks without asserting regulatory compliance; resolve and test each other open PR against current main, starting with those that affect physical reality, then adjacent gameplay and purely stale branches. Refresh this file after each accepted PR and retain the old branch until its commits are verifiably reachable from main.
