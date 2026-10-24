# Repository Town hosting and release policy

## One source and three roles

| Role | Target | Policy |
|---|---|---|
| Source | `joshualparris/JoshMemory`, `repository-town/`, `main` | Feature branches and reviewed PRs; never edit generated sites |
| Production | `repository-town-claude-complete.vercel.app` | Git main; `npm run build:release` must succeed before a release becomes live |
| Staging | `repository-town-claude-playtest.vercel.app` | One existing Vercel QA project; deploy an exact candidate commit manually before promotion |
| Backup | `parris-tech-services.github.io/Repository-town/` | Mirror the commit and content fingerprint of the live approved production release |
| NPC AI | `repository-town-no-code-ai.parris-neathaustralia.workers.dev` | Shared Worker, existing secret and rate limits; no duplicate AI deployment per playtest |

The dedicated source-repository move is deferred until after consolidation. No new permanent
hosting service is needed for a feature. Use feature branches, local tests and expiring previews.

## Release

1. Fetch current main; reconcile only genuinely missing behaviour. Run `npm run build:release`.
2. Playtest desktop and emulated Android. Verify movement, interactions, saved games and NPCs.
3. Stage the exact integration commit on the shared QA host when that host can be configured.
4. Merge the reviewed integration PR. Vercel builds main with the same release gate.
5. Compare production and backup `release.json`: both `sourceCommit` and `contentHash` must match.
   The backup sync job checks production every six hours, and also supports manual dispatch.
   It does not publish an unverified branch head merely because it is newer.
6. Record any failed host operation; a local build is not a successful remote deployment.

Builds stamp a deterministic manifest without timestamps or host-specific values. The manifest
hashes every public output file. `node tools/verify-release.mjs dist/public` detects mutations.
The backup must stop if its generated fingerprint differs from production.

## Preserve and retire

The pre-consolidation source, Pages and Pages-playtest repositories have the branch
`archive/pre-consolidation-20261021`. Render deployment commits have individual archive refs
listed in `deploy/consolidation-inventory.json`. Preserve these branches and original feature
branches. Git graph divergence alone does not mean a feature is missing.

The generated site's `backup-unified/`, `windows-playtest/` and `playtest-bank-bakery/`
contain obsolete snapshots; their historical content remains reachable through the archive.
Replace their entry pages with a handover page. Keep root Pages as the working backup.
Unused live-only modules remain in the archive; do not revive the incompatible legacy money model.

Old hosts should first serve a handover page linking to production and save export. Avoid an
unconditional cross-origin redirect: browser storage belongs to each origin, so silently moving
a player can make their progress appear lost. Do not delete a service until preservation and
handover have been verified. No historic deployment records need to be purged.

## Saved progress

The version link opens `release.html`. Download progress on the old origin, open the main
site's version page, and import the file. Close other game tabs before importing. Import takes
a backup first, validates a bounded allowlist, and rolls back failed writes where storage permits.
API keys, PINs, chats and unrelated origin storage are excluded. Saves remain on the device.

## Rollback

Use an already-tested Vercel production deployment and its matching source commit. The backup
sync follows that production release instead of assuming main should always win. For a retired
Pages copy, restore files from its archive branch through a normal reviewed commit. Never force
push shared main or replace the canonical gameplay files from an old snapshot.

## Render quota fallback — 21 October 2026
The Render dashboard confirmed its build pipeline allowance is exhausted for the billing period. No paid limit was raised. The existing Vercel Playtest project is the sole shared staging target; Render snapshots are archived and may be suspended without deleting history. A suspended origin can be temporarily resumed if a visitor needs its saved progress. Staging candidates are explicitly deployed by commit; automatic source-branch builds are disabled for retired projects.

## Hosting fallback procedure — 24 October 2026

**Never treat Vercel quota as the end of the deployment task.** Prefer the already connected and non-destructive alternative with enough capacity. Status only becomes *deployed* when the exact built source SHA and live URLs/assets have been checked, and becomes *accepted* only after live browser/mobile tests.

For Repository Town, preserve user data by keeping each hostname/origin distinct; never unilaterally move the existing production alias, overwrite saved progress, replace the verified Parris-Tech-Services backup, increase spending limits, or revive retired archive hosts. Use these in order:

1. **Existing Vercel production** when build/release is permitted. If its status targets `upgradeToPro=build-rate-limit`, immediately use next options rather than repeatedly retrying.
2. **Existing Render main QA** (`srv-dbam28dg1s2s73cke0m0`, `https://repository-town-main-qa.onrender.com`), linked to canonical main and auto-deploy off. Explicit trigger only on user-directed deployment; inspect Render build events. Build pipeline minutes were exhausted on 24 October 2026 (deploy `dep-dbe9cgnavr4c73a52qeg`), so do not repeat blindly.
3. **Independent GitHub Pages alternate** (`joshualparris/repository-town`, `https://joshualparris.github.io/repository-town/`). Its workflow `.github/workflows/town-pages-alt.yml` checks out `JoshMemory/main`, runs complete `npm run build:release`, verifies SHA/private-data gate, and publishes through official Pages actions. It neither changes canonical source nor modifies the approved `Parris-Tech-Services/Repository-town` fingerprinted backup. Confirm Github Pages is enabled for Actions; review run results and mobile browser behaviour. First run `40090213978` initiated on 24 October 2026; terminal status must be inspected.
4. **Cloudflare Pages** as a Git-connected fallback once the user's Pages Git integration is healthy. At 24 October 2026 it rejected project creation with `8000011` Git-installation 401 despite Pages Write scope, requiring account reauthorization; do not pretend deployment succeeded or retry indefinitely.
5. **Approved GitHub Pages mirror** remains version-locked to the existing Vercel-approved production fingerprint and is not an unreviewed fallback target. **Neon** provides PostgreSQL, not static hosting; it cannot publish Town's WebGL build by itself.

On a deployment failure: capture exact provider failure and source commit, move to the next *eligible* alternative, run build/integrity/privacy checks, verify `release.json` SHA and representative production assets, then run desktop and narrow Android touch acceptance, including settings/dismiss and saved-game handover. Record successful URL plus evidence in `WORK_CHECKPOINT.md`.

**No source or build output should be labelled live without a verified host response.** Do not send the user to an unverified QA URL as if its deployment succeeded.

### Verified GitHub Pages QA escape hatch (24 October 2026)

The initial standalone `joshualparris/repository-town` Pages workflow **passed all release/private-data checks but could not publish** because Pages was not enabled for that empty repository. Rather than stop there, the verified game build was published in an *isolated subpath* of the already-enabled `Parris-Tech-Services/Repository-town-playtest` site:

- **QA only:** https://parris-tech-services.github.io/Repository-town-playtest/qa/mobile-dialogue-20261024/
- **Canonical source SHA:** `2743a8f182d69038fee841c19f96f2313a40ff60`.
- **Release fingerprint:** `32914d94b39a14f00fd193d04d2baa9ef652993d8b9708c42da3b9870dea74ca`.
- **Full release/privacy build and publication:** [Actions run 40090579941](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40090579941), success.
- **Live desktop checks:** [TinyFish 2eda6d34](https://agent.tinyfish.ai/runs/2eda6d34-42fa-430d-b457-87b3a158c949), verified 3D loading and saved auto-caption toggle.
- **Live 390×844 Chromium checks:** [Actions run 40091978098](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40091978098), success; uploaded screenshot and JSON artifact `town-mobile-dialogue-browser-acceptance`.
- **Remaining:** real NPC-encounter X button and physical Android gesture checks (code-level DOM acceptance passed, but no real encounter played). Do not claim those verified.

The existing retired handover homepage remains byte-identical. **Important:** subpaths on the same hostname share browser origin/localStorage. Use a clean browser/incognito window before trying this QA version to avoid impacting saves belonging to the old playtest origin. It is not an automatic save migration. Production Vercel and the verified public backup remain separate, unchanged release roles.
