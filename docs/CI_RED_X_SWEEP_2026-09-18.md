# GitHub red-X cleanup session — 18 September 2026

Purpose: durable handoff of the fleet-wide GitHub Actions cleanup work so a fresh coding agent does not repeat diagnosis or report stale CI state as current truth.

This is a point-in-time log. Always verify the live default-branch HEAD and current workflow runs before changing a repository, because several CI runs were still moving during this session.

## Work completed / progressed

### `joshualparris/NebulaDice-Browser`

- Repaired the GitHub Pages deployment failure.
- The Pages deployment was subsequently observed green.
- Latest successful state observed during the session was commit `821574e597a517291b58b91be593601ebb1f61e6` (`Fix GitHub Pages deployment via gh-pages branch`).

### `joshuaparris-max/CanonRPG`

- Repaired the failing CI/deployment path so the project could build and preserve the site artifact without depending on unavailable GitHub Pages configuration.
- The relevant workflow was subsequently observed green.
- Treat the old red-X report for CanonRPG as stale; verify current HEAD before doing more work.

### `joshualparris/DCSPD`

This repo required several repair passes.

Work performed:

- Repaired the stale npm lockfile path that had been contributing to CI failures.
- Upgraded direct dependencies used in the security repair, including Next.js / eslint-config-next / pdfjs-dist / Vitest.
- Updated PDF.js usage for the newer API. In `src/components/ebook/PdfReader.tsx`, `getDocument(pdfUrl)` was changed to the object form `getDocument({ url: pdfUrl })` required by the newer `pdfjs-dist` type/API surface.
- Ran `npm audit fix`; the repair workflow reached `found 0 vulnerabilities`.
- Verified TypeScript passed.
- Verified the unit suite passed: **31 test files / 80 tests**.
- Verified the Next.js production build completed successfully.
- The one-off dependency repair workflow initially failed for workflow-maintenance reasons rather than app correctness:
  - first because `npm update` hit an npm internal `edgesOut` error;
  - then because `npm@latest` required a newer Node engine than the workflow's Node 22.13.0;
  - then because postinstall-generated changes made `git pull --rebase` refuse to run with a dirty working tree.
- Those workflow-maintenance issues were corrected. The final repair workflow run `35278110690` completed **successfully**, committed the dependency changes as `4525ba723132078c98c1fab109ec36cf9fb2c6b3` (`Update dependencies for security audit`), and the temporary repair workflow was then removed in commit `128e0eba58b30efff242204e0e7b578f220216a2`.
- At the last check in this session, the normal `CI` run on `128e0eba...` was still in progress. Its lint/typecheck/unit-test/dependency-audit/production-build stages had all passed, and the Playwright job had successfully built and was running Playwright tests. Do **not** claim final green until the latest normal CI run is rechecked.

### `joshualparris/WorkApp`

- Repaired the stale npm lockfile path and retriggered the normal deployment/CI flow.
- Latest Pages deployment observed during this cleanup was green on commit `ee3fff1fdde5c894b656ed3354419e2be09ca111` (`Remove one-off lockfile repair workflow`).

### `joshualparris/HealthLens`

- Investigated the browser/E2E failure around a missing `synthetic_export.zip` fixture.
- Reworked the Playwright test so it generates a deterministic synthetic Health Connect SQLite ZIP fixture itself instead of relying on that absent checked-in artifact.
- Latest CI observed during the session was green on commit `44de54adde3a051152adda8abbb549c0a60f918c` (`Generate Health Connect fixture during browser smoke test`).

### `joshualparris/openclaw`

- A documentation-only commit was used to establish a post-upstream-sync comparison baseline without changing Control UI assets.
- Checked head during the session: `187bfe845847227b8aaf4d1bcac52299002163cf` (`Document post-sync fork baseline`).
- Checks inspected on that head were success/skipped; the old red CI entry from the earlier fleet table was stale at that point.

## Diagnosed but not yet safely committed in that portion of the sweep

### `joshuaparris-max/Arena`

- Investigated the failing CI / engine behaviour.
- Identified a repeated-heal failure-event problem and prepared the intended code correction.
- During the earlier portion of this session the repository was not available through the write path being used, so the change was not claimed as committed.
- Re-check the current GitHub App installation/repository permissions before assuming this is still blocked; account-level connector availability changed/was being investigated later in the session.

### `joshuaparris-max/carl`

- Root cause already diagnosed: the workflow matrix used unquoted YAML values such as `3.10`, which YAML interprets numerically as `3.1`.
- That caused an invalid Python 3.1 setup job while Python 3.11 and 3.12 passed.
- Correct fix is to quote the versions, e.g. `python-version: ['3.10', '3.11', '3.12']`.
- Do not re-diagnose this from scratch. Re-check current write access, apply the quoted-version patch if still absent, then verify the replacement CI run.

### `joshuaparrisdadlan-stack/WhirringWilderness`

- Investigated the GitHub Pages failure and prepared a workflow repair direction.
- During the earlier part of the session the DadLAN connector view being used did not expose this repo as writable, so no safe commit was claimed.
- Re-check current installation/repository access before assuming this remains blocked.

## GitHub connector / permissions lesson

All four GitHub account installations were present when checked:

- `joshualparris`
- `joshuaparris-max`
- `joshuaparrisdadlan-stack`
- `parristechservices-prog`

However, installation existence does **not** by itself mean every repository is exposed with the same permissions in the active connector path. During this cleanup, some repositories could be inspected publicly while writes were unavailable or repository lists appeared incomplete. Always check repo-level `permissions.push` / installation visibility before promising a direct fix.

Later in the session, the installed repository listing for `joshuaparris-max` did show push permission on the repositories returned in that page, so older blanket statements such as “the max account is read-only” should not be treated as permanent truth. Verify the specific target repo live.

## Do-not-repeat guidance

- Do not treat the original red-X table as current truth. It was already stale for multiple repositories during this session.
- Do not re-diagnose `carl`'s Python matrix bug; the `3.10` → `3.1` YAML parsing issue is known.
- Do not add another permanent dependency-repair workflow to DCSPD. The one-off workflow served its purpose and was removed.
- For DCSPD, re-check the latest normal CI first. The code/test/build/security repair itself had passed; only final normal Playwright completion remained unverified at the last check.
- A green deployment badge is not enough by itself: verify build/test/smoke behaviour appropriate to the repository.

## Status at handoff

Confirmed green during this sweep: NebulaDice-Browser, CanonRPG, HealthLens, WorkApp; openclaw had no current failure established on the checked head.

DCSPD had reached a much healthier state: dependency audit at zero vulnerabilities, TypeScript green, 80 unit tests green, production build green, and the normal CI was still finishing Playwright at last observation.

Arena, carl and DadLAN WhirringWilderness still needed a fresh permission/status check before their prepared fixes could be safely committed and verified.