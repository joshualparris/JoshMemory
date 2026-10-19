# Cross-repository audit — 2026-10-19 (initial evidence register)

This is an evidence-based *partial* audit, not a certification of all repositories. Repository listing returned 100 accessible repos (37 `joshualparris`, 58 `Parris-Tech-Services`, five other owners). Detailed file trees checked for 12 priority projects; Actions history checked for six. No broad CI disabling or speculative code changes performed.

## Findings

| ID | Repository | Evidence | Classification | Recommended next step |
|---|---|---|---|---|
| HL-01 | `joshualparris/HealthLens` | CI run [36301392407](https://github.com/joshualparris/HealthLens/actions/runs/36301392407), seven of eight latest sampled CI runs failed. Log reports 4 failed assertions, including expecting `Invalid admin token`/`Invalid sync token` while shared auth returns `Invalid credentials`, and two expected 200 responses returned 503. | Confirmed historical CI failure; current status unknown | Reproduce on current main, distinguish test expectations from missing Supabase test mocks. Preserve auth/security behavior; fix tests/implementation only after reproduction. |
| DE-01 | `joshualparris/DubboEwaste` | [39008552748](https://github.com/joshualparris/DubboEwaste/actions/runs/39008552748), documentation inventory check failed: unindexed files including `docs/field-notes/2026-10-14-lenovo-hitachi-laptop10.md`, `docs/usb-inventory/USB-13-QNAP-PRESERVATION-2026-10-14.md`, and dated analytics reports. | Confirmed historical failure | Regenerate/update `docs/DOCUMENTATION-INVENTORY-AND-FRESHNESS-2026-10-09.md` for all tracked documents, verify with `python scripts/check_documentation.py`. Do not suppress the check. |
| TR-01 | `Parris-Tech-Services/Trace` | Web test [39098936538](https://github.com/Parris-Tech-Services/Trace/actions/runs/39098936538) failed `tests/latest-download.test.mjs` APK-link assertion. Current `index.html` now contains `id="latestAndroidDownload"`, the stable APK URL, install advice and archive-backup instructions; later workflow result successful. | Historical failure, possibly fixed | Rerun `npm test`; check release asset actually exists. Do not rewrite passing tests. |
| TR-02 | `Parris-Tech-Services/Trace` | Recent stable APK and Android APK workflow runs included cancelled runs followed by successes. | Efficiency review, not established defect | Inspect concurrency groups and workflow triggers; avoid cancelling necessary signed releases. |
| HF-01 | `joshualparris/HealthiestFood` | Recent browser journey, site verification, and backup site checks succeeded; earlier runs failed. 14 workflow files found. | Audit candidate, not established defect | Review schedules/trigger overlap and test current live sites before disabling any workflow. |
| NB-01 | `Parris-Tech-Services/NeathBound` | Recent GitHub Pages deploys successful; sampled browser and live-site checks succeeded. Seven workflow files. | Audit candidate, not established defect | Review duplicate deployment triggers and keep essential tests and release builds. |
| JM-01 | `joshualparris/JoshMemory` | Recent CI successes after several CI failures. Eight root workflows. | Audit candidate | Finish Repository Town PR #13 validation and Claude PR #9 integration; protect private project metadata. |

## Scope and change policy

1. Validate against *latest main*, not stale CI runs; a failing historical run alone does not justify production code changes.
2. Avoid re-enabling expensive GitHub Actions, deleting tests, weakening privacy controls, or uploading private assets to public sites.
3. For each confirmed active issue: create a small change, run the local tests/build/privacy check, verify deployment, then merge.
4. Subsequent passes: full 100-repo workflow inventory, current workflow schedules, latest CI status, live deployment HTTP checks, and app/browser playtests. Those checks are **not completed** by this register.
