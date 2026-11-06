# Issue #492 visual-regression fixes

**Branch:** `fix/resident-visual-492-20261106` (from `main` after #499).

## Fixed
- **Outfit accumulation** (`resident-figure.js`): every garment mesh is now recorded while an outfit is built, including sleeves attached to arm/elbow bones, legwear on knee bones and headwear on the head. Rebuilding removes all previous garment parts. Test cycles work/home/walk/asleep repeatedly and asserts the mesh count per outfit key never grows.
- **Manual LOD override** (`resident-figure.js`): per-figure LOD has `auto`/`manual` modes. The distance sensor only updates in auto mode; Studio/screenshot/manual `setLod` calls are respected. The showcase test now waits two animation frames, captures real near/far element screenshots and asserts >2% different pixels plus a materially smaller far mesh count. The near screenshot is taken after restoring `lod(0)`, not while still far.
- **Wrong child occupations** (`resident-identity.js`): people under 18 and `role: child` are reported as `student` (or `preschool child`) before workplace kind is considered; adult school staff remain teachers. Browser test asserts every roster resident under 18 is a student.
- **Immutable phenotype** (`resident-identity.js`): appearance RNG is seeded from the stable person id alone, not `id + role + job`. A unit test compares the same id with student/nurse/supermarket/publican metadata and requires identical skin, hair, eyes, face, body and appearance signature while occupation still changes.
- **In-game proof** (`narromine-homes.js`, `narromine-workplaces.js`, `narromine-coles.js`, `main.js`): interiors expose rendered `figureIds` and `figurePositions`. The browser test asserts non-empty, unique expected resident ids and captures close-up screenshots in a Narromine home and Coles.
- **Outdated comparison wording**: the comparison page now labels Quaternius as the default and procedural as the optional Classic style.
- **CI runner/toolchain**: `repository-town-pub-envelope.yml` and `repository-town-pub-physical-p0.yml` pinned to `ubuntu-24.04` so `npx playwright install` is supported (post-office workflows already pinned).

## Evidence
- `resident-identity.mjs`, `resident-figure.mjs`, `npc-appearance.mjs`, `indoor-crowd-identity.mjs`, `abs-demographics.mjs`, `resident-identities.mjs`, `narromine-residents.mjs`, `narromine-homes.mjs`, `narromine-workplaces.mjs`, `narromine-postal-resident.mjs`, `narromine-post-office.mjs`, `shop-visitors.mjs`: PASS.
- `resident-showcase-browser.mjs` (desktop + Pixel 7): PASS, including child occupations and near/far pixel difference.
- `resident-game-browser.mjs` desktop + Pixel 7: PASS, including home/Coles figure ids and close-ups.
- `resident-quaternius-browser.mjs`: PASS (default rigged style, 4 rigged vs 120 procedural meshes).
- `tools/build.mjs`, `tools/check_privacy.mjs`, `pub-2026-audit`: PASS.

## Not claimed
- Complete Chrome woodcutting flake and Vercel rate limits are external/pre-existing; the workflow runner fix is included but CI must confirm.
- Physical low-end laptop/mobile FPS still needs a human measurement.
- Everyday wardrobe/fitted hairstyles remain limited.
