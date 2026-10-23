# GitHub Pages drift preservation — 23 October 2026

The generated backup `Parris-Tech-Services/Repository-town` received [Pages PR #35](https://github.com/Parris-Tech-Services/Repository-town/pull/35), merge commit `9e425ab2370661f7bd0c817a621de182ee38b464`, after its last matching `release.json` build (commit `392dccb1724765be0bd070991449f7f5886388ff`).

This is not permission to take arbitrary backup edits into production. The canonical source is `joshualparris/JoshMemory/repository-town/src`; current source has moved on. The nine exact site-side blobs below are preserved in the backup's immutable Git history. Seven have verbatim archive copies in this directory, and the remaining two have permanent Git blob IDs, URLs and historical commit references. Unknown or modified blobs are rejected by the sync tool, as are release fingerprint mismatches. Backup mirroring must still pass full source build, privacy, simulator and browser checks, and compare production fingerprints.

| Historical site path | Git blob SHA-1 | Canonical archive |
|---|---|---|
| tests/entrance-zones.mjs | fefadbaa51a36bd2ce6415e78f6843ac9e429cc5 | present |
| world/civic-entrance.js | 2d2a4b353aea11feeb7f73e3099735e801489c03 | present |
| world/house-entrance.js | e705091ff71d57b0f5991af40523d38432511fc2 | present |
| ui/townpanels.js | 08663f79cc6caecaec8c18f0a0b2e91445c1fb53 | present |
| ui/waste-depot-panel.js | b7836e92f74d138ea3531994eb922838d3683737 | immutable Git blob |
| world/facility-access.js | fc315272a9b6b1a94f11aad62306d11d7b4c5673 | immutable Git blob |
| world/shop-attendance.js | c26388c3c5c52c2b232631da0adc9e45a49793ae | present |
| world/shop-staff.js | fd5a10f3d36f7dbe82d321409ab68cdf8c0b463e | present |
| world/town.js | 679c9cbc650e6519ab27db9a2ec5b1f4a3411a60 | present |

The blob objects are retrievable under `https://github.com/Parris-Tech-Services/Repository-town/blob/9e425ab2370661f7bd0c817a621de182ee38b464/<path>`. All nine blob SHAs were compared to the currently tracked backup and PR #35 changed-file list. Snapshot files were read back and blob SHA verified. Do not remove archival copies or rewrite the historical commit.

The previous source fix PR #160 archived three previously unmanifested files. This follow-up covers **all nine** site-side paths changed by PR #35, confirmed by comparing the mirror's verified release commit with current `main`.
