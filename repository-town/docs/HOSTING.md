# Repository Town hosting and release policy

## One source and three roles

| Role | Target | Policy |
|---|---|---|
| Source | `joshualparris/JoshMemory`, `repository-town/`, `main` | Feature branches and reviewed PRs; never edit generated sites |
| Production | `repository-town-claude-complete.vercel.app` | Git main; `npm run build:release` must succeed before a release becomes live |
| Staging | `repository-town-main-qa.onrender.com` | One shared QA target; retain manual deployment until its settings are verified |
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
