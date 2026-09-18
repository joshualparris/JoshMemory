# Coding continuity log — 18 September 2026

Purpose: give a fresh coding agent enough context to continue recent work without repeating audits, rediscovering already-diagnosed failures, or treating stale CI snapshots as current truth.

This is a point-in-time handoff, not code truth. Always verify live repository state, branch/HEAD, CI and deployment status before changing anything.

## Standing coding continuity rule

After substantive coding work, record enough durable context for the next agent to resume safely. At minimum capture: repository, branch/HEAD where useful, what changed, why, evidence/tests/CI, blockers, unresolved next action, and explicit "do not redo" guidance when prior work already settled something.

Prefer repo-local documentation for repo-specific facts and JoshMemory for cross-repo continuity. Never claim a fix is complete from code inspection alone; verify the relevant behaviour and CI/deployment evidence.

## Beautiful Code Standard work

Josh defined a portfolio-wide Beautiful Code Standard. Its central rule is: correct first, clear second, simple always, measure what helps, prove what matters, leave the code better than you found it.

Important hierarchy:
1. Principles
2. Gates
3. Ratchets
4. Signals
5. Outcomes

Metrics such as CRAP, cyclomatic complexity, coverage, duplication and mutation score are evidence/signals/ratchets, not definitions of good code and not universal absolute gates. Do not worsen code to improve a score.

A repo-specific audit was added to `joshualparris/last-light` (product/repo concept: crap4all) at `audit/BEAUTIFUL_CODE_STANDARD_AUDIT.md`.

Portfolio audit work then added `audit/BEAUTIFUL_CODE_STANDARD_AUDIT.md` to 61 repositories. These were intentionally repo-specific rather than boilerplate and were weighted by repo tier and consequence. Recurrent findings across the portfolio:

- behavioural proof often lags behind CRAP/quality tooling; user-flow smoke tests should outrank metric dashboards;
- generated/IDE/build artefacts, backup ZIPs, `.bak` files and prompt dumps recur as unnecessary repository clutter;
- several predecessor/duplicate repos should likely be archived rather than all maintained indefinitely;
- some public repos contain school/business/personal documents and need deliberate privacy/repository-boundary review;
- large files are investigation signals, not automatic refactor mandates;
- remote-management/data-sensitive tools need safe failure handling and truthfulness more than cosmetic metric optimisation.

Notable repo findings already established:

- `DCSPD`: relatively strong CI/build/smoke/accessibility baseline; main architectural concern is keeping executable app truth distinct from a large document/research archive.
- `JoshHub`: relatively strong alignment with clean install, formatting, lint, tests, build and architecture/truthfulness checks.
- `DadlanControlCentre`: fleet truth must outrank CRAP/metric optimisation.
- `HealthLens`: health/data truthfulness and privacy matter more than generic complexity scores.
- `JoshTapApp`: real instrumentation tests exist, but CI had been skipping them.
- `breach-command`: integration/domain tests exist; priority is making them normal CI evidence rather than inventing more metrics.
- `ResearchAtlas`: data/privacy consequences matter.
- `Ideas` vs `Ideas2`, older Elodin/AshFallen/JoshDashboard variants: likely canonical/predecessor cleanup candidates.
- `ParrisTechServicesApp`: public repo contained business/ASIC/ABN documents; repository-boundary/privacy concern.
- `kkc-adventure`: large ZIPs, `__pycache__`, duplicate documents and research/book PDFs in Git; repository-boundary cleanup concern.
- `energyquest`: large Unity/binary footprint including roughly 98 MB ZIP; evaluate binary/source boundary rather than metric score.
- `newfileqqqwertuhvgjkk.py`: essentially IDE/project artefact with no meaningful Python source despite name; likely experimental/cleanup candidate.
- `Whispering-Wilds`: comparatively strong CI/Dependabot/security docs/tests.
- `ForgeGrid`: direct push of the audit to `main` was correctly blocked by required status checks. Do not bypass that. Its audit should be proposed via branch/PR and allowed to pass required checks.

Do not repeat the same portfolio inventory/audit from scratch unless asked to refresh it. First inspect existing `audit/BEAUTIFUL_CODE_STANDARD_AUDIT.md` files and only re-audit where live code materially changed or the user explicitly requests a refresh.

## crap4all / `joshualparris/last-light`

Product/package is `crap4all`; repository was still named `joshualparris/last-light` when last checked. Repo rename to `crap4all` remains desirable if platform capability permits.

Latest previously inspected main before later work:
- commit `5e079983ff32a0e5ef9a111c2dd16bac516f8efd`
- message `docs: record measured mutation baseline ratchet`
- CI run 41 was green.

Key audit findings already established:

1. `src/crap4all/core.py::_analyze_file()` catches broad `Exception` and returns `[]`, silently omitting analyser failures while files can still be counted as scanned. This violates the standard's reality/failure-visibility rules. Fix should fail explicitly or report a partial/unavailable analysis state.
2. Coverage model internally distinguishes measured/uncovered/ambiguous/unavailable, but terminal/HTML presentation can still show unknown/unavailable coverage numerically as `0.0%`. Missing evidence should remain visibly unknown unless an explicit policy says to treat it as zero.
3. Coverage matching on main still had a risky same-basename fallback when last inspected; PR #2 claimed to remove it.
4. `QUALITY_MODEL.md` had an older three-layer model and should be aligned to Principles → Gates → Ratchets → Signals → Outcomes.
5. CI treated CRAP <30, CC <=15 and duplication as hard gates, which conflicts with Josh's newer standard. These should normally be ratchets/signals unless there is a specific repo reason to hard-gate them.
6. Add package-build/installed-CLI smoke, secret scanning and human review checklist as higher-value release evidence.
7. Roadmap is very large. Treat roadmap entries as possibilities, not commitments; YAGNI applies.

Open PR state previously established:
- PR #2 `Rebuild reviewed crap4all 0.2.0 fixes on latest main`, branch `review-fixes-v2`, head then `2088206552d3177ca01339b2a75ac8f8e344ae75`, CI success on its then-base but base was older than later main. Rebase/rebuild on current main before merge.
- PR #1 likely superseded by #2.

Do not re-report those findings as new discoveries without checking whether they were already fixed.

## CI repair work from the red-repo list

Original user-provided failing list included:
- `joshualparris/DCSPD`
- `joshualparris/HealthLens`
- `joshualparris/NebulaDice-Browser`
- `joshualparris/openclaw`
- `joshualparris/WorkApp`
- `joshuaparris-max/Arena`
- `joshuaparris-max/CanonRPG`
- `joshuaparris-max/carl`
- `joshuaparrisdadlan-stack/WhirringWilderness`

Important: that table became stale during the investigation. Always check latest HEAD/latest run rather than treating those old red runs as current.

### `joshuaparris-max/carl`

Exact CI failure was diagnosed.

Workflow matrix contained:

```yaml
python-version: [3.10, 3.11, 3.12]
```

YAML interpreted unquoted `3.10` as numeric `3.1`. GitHub Actions therefore created a `Run tests (3.1)` job and failed during `actions/setup-python`; Python 3.11 and 3.12 jobs passed.

Smallest correct fix:

```yaml
python-version: ['3.10', '3.11', '3.12']
```

Updating `actions/setup-python` from v4 to a current major was also considered reasonable while touching the workflow, but the quoted matrix is the actual bug fix.

The connected GitHub integration for `joshuaparris-max/carl` had `pull: true`, `push: false`. A direct write was attempted and GitHub returned `403 Resource not accessible by integration`. Main was still `74a2147fe8c2a9212d78bfe70e6a66afd3a0c4f4` at that point.

Do not waste time re-diagnosing Carl: the root cause is known. Next action is simply apply the quoted-version patch once write access to `joshuaparris-max` is available, then verify the replacement CI run is green.

### Repos from that list with write access

The connected GitHub installation showed push/admin access for these `joshualparris` repos:
- `DCSPD`
- `HealthLens`
- `NebulaDice-Browser`
- `openclaw`
- `WorkApp`

No push access was available for `joshuaparris-max/carl` or `joshuaparrisdadlan-stack/WhirringWilderness` at the time checked.

### Latest statuses observed during the 18 Sep check

These superseded the older red table:

- `HealthLens`: latest CI run observed was green, on commit `44de54adde3a051152adda8abbb549c0a60f918c` (`Generate Health Connect fixture during browser smoke test`).
- `NebulaDice-Browser`: latest Pages deployment observed was green, on commit `821574e597a517291b58b91be593601ebb1f61e6` (`Fix GitHub Pages deployment via gh-pages branch`).
- `WorkApp`: latest Pages deployment observed was green, on commit `ee3fff1fdde5c894b656ed3354419e2be09ca111` (`Remove one-off lockfile repair workflow`).
- `openclaw`: current checked head was `187bfe845847227b8aaf4d1bcac52299002163cf` (`Document post-sync fork baseline`). The checks inspected on that head were success/skipped; no current failing check was established. The old red CI entry from the user's table was therefore stale.
- `DCSPD`: connected repo permissions included push/admin. During the final refresh, main had advanced to `f95da0e205730ae2ad445ae8fc1bef2b832a3be4` (`Use current npm for dependency security repair`). Main CI run `35277769767` was still pending at the instant checked. A separate helper workflow `Fix dependency audit findings` run `35277769769` was failing. Therefore DCSPD was the only repo from the original list that still visibly had something red while also being writable at that instant. Re-check current state before acting, because CI was still moving.

Do not state that DCSPD main CI is failing unless the current run actually finishes red; at the recorded moment it was pending. The red helper workflow is distinct from the main CI.

## GitHub access / account boundary lesson

Do not assume all repositories across Josh's GitHub accounts are writable through one connection. The connected integration had full write/admin for many `joshualparris/*` repos but only read access for at least some `joshuaparris-max/*` and `joshuaparrisdadlan-stack/*` repos.

Before promising to fix a repo on another owner account, check `permissions.push`. If false, diagnose fully and prepare the exact patch, but do not claim it was applied.

## Evidence discipline for future coding agents

Before saying a repo is fixed/green/done:

1. verify live HEAD;
2. inspect the relevant latest workflow run, not a historical one;
3. confirm the failing step/root cause;
4. make the smallest coherent change;
5. verify tests/build/smoke/security checks appropriate to the repo;
6. confirm the new workflow/deployment result;
7. record the handoff if work is non-trivial or blocked.

A historical red X is not proof the current HEAD is red. A green deployment is not proof the app works. A metric improvement is not proof the code is better.


## Josh OS bootstrap — `joshuaparris-max/AshFallen`

Josh asked for an empty repository to become the beginning of a standalone graphical desktop operating system and to push directly to `main`. `joshuaparris-max/AshFallen` was empty and writable (`push: true`, `admin: false`), so it was repurposed as Josh OS. The repository itself was not renamed because the current GitHub connection does not expose/administer repository rename.

Verified current main HEAD at handoff: `422e9c92385587cca7683e4f3ecfd4210021118b`.

Implemented:
- x86-64 freestanding C kernel using Limine v12.9.0 for boot handoff;
- hybrid BIOS/UEFI ISO build named `JoshOS-0.1-x86_64.iso`;
- graphical framebuffer desktop with gradient background, top bar, system panel, styled terminal window and dock;
- built-in 5x7 bitmap font;
- PS/2 polling keyboard input;
- graphical shell commands: `help`, `about`, `mem`, `clear`, `echo`, `reboot`;
- Limine memory-map query;
- COM1 serial diagnostics;
- `JOSHOS_BOOT_OK` serial marker for an automated QEMU boot smoke test;
- architecture documentation and roadmap;
- GitHub Actions build that creates the ISO, boots it in QEMU, verifies the boot marker, records a checksum and uploads the ISO artifact.

Final verified GitHub Actions run: `35329186622`, conclusion `success`. Build ISO, QEMU boot smoke test, checksum and artifact upload all passed.

Artifact:
- name: `JoshOS-0.1-x86_64`
- artifact ID: `10540412344`
- size: 1,504,434 bytes
- digest: `sha256:f0de15d7e3de4462344739709d535624bd1767636ee7f2db90ca41687a5c16f0`

Important limitations:
- the current desktop/window is direct framebuffer rendering, not yet a compositor/window manager;
- keyboard support is currently PS/2/QEMU-oriented; no USB HID stack yet;
- no interrupt-driven input/timer, allocator/paging/heap, mouse, processes/userspace, filesystem, networking, audio or GPU acceleration yet;
- Limine is bootloader only; there is no Linux kernel underneath Josh OS.

Next major technical milestone: IDT/exceptions + timer + physical page allocator + virtual memory + heap, then mouse support and a real movable/resizable window manager.

A build issue was already found and fixed: `-no-pie` under Clang combined with `-Werror` caused a link failure. It was removed, and final CI is green. Do not re-diagnose historical intermediate red runs from the file-by-file repository assembly as current failures.
