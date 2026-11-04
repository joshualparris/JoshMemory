# Narromine shared surface realism — Phase 1 (4 November 2026)

**Owner:** ChatGPT, material appearance only. **Branch:** `feat/narromine-material-realism-20261104`.

## Why this implementation

The renderer in `src/world/narromine.js` batches buildings and road geometry by colour and 300-metre tile. Its `mergeGeos()` intentionally retains *position and normal*, but no texture UV coordinates. Simply adding tiled image maps would require a broad rewrite, duplication of meshes or broken UVs.

`src/world/narromine-surface-materials.js` instead attaches compact **world-space, meter-scaled surface treatment** to the existing batched meshes using Three.js `MeshStandardMaterial.onBeforeCompile`. The same geometry is used. No new meshes, draw calls, collisions, image downloads, memory-heavy texture atlases or dependencies are introduced.

## Treatments and limits

| Surface | Appearance | Evidence boundary |
|---|---|---|
| Asphalt | Subtle coarse/fine mottling; matte PBR | Does **not** place painted lane markings or potholes |
| Concrete footpaths | Gentle aggregate variation; anti-aliased ~1.65 m slab joints | Joint intervals are **estimated**, not surveyed |
| Red brick | Running-bond-inspired courses and mortar shading | Brick size/pattern is **estimated**; not a photographically measured facade |
| Painted render | Low-amplitude multi-scale variation and matte roughness | Retains existing building-specific colour data |
| Sheet-metal roofs | Subtle anti-aliased corrugation-style highlight and semi-metallic roughness | Sheet/rib direction and spacing are **estimated**; geometry/roof pitch unchanged |
| Glass | Low-roughness PBR finish | Without an environment map this is **not** ray-traced glass/reflections |
| Other colours | Keep original Lambert material | Safe fallback for features not confidently categorised |

Source-colour classification is explicit; arbitrary colours are **never** guessed as brick, glass or roofing. Existing builders, heights, map alignment, geospatial clipping, road and footpath meshes, interactions, sun angles and vegetation remain unchanged.

Reference source: [Narromine visual comparison folder](https://drive.google.com/drive/folders/1wgPC3JnTWJIPurRXzbW_5T5DLcn1QXJR?usp=sharing), previously summarised as 55 side-by-side comparisons. Original reference photographs were **not** copied to the repository; this pass does not claim precise photographic matching.

## Verification checklist

- [x] Material-builder code committed to feature branch.
- [x] Regression assertions authored: colours, PBR roles, source-colour preservation, world-space shader injection, AA derivative use, no required image maps, unmapped fallback. Imported by `tests/narromine-layout.mjs`.
- [ ] Execute `node tests/narromine-layout.mjs`.
- [ ] Execute `node tools/build.mjs` and `node tools/check_privacy.mjs`.
- [ ] Run desktop/mobile Chromium visual QA at hotel, Post Office, Kierath's frontage, ordinary shops and roadway.
- [ ] Compare before and after screenshots and inspect under morning/midday/late afternoon lighting.
- [ ] Check WebGL shader compilation on real desktop/mobile devices, before merging.
- [ ] Check draw calls, material count, frame times and shader artefacts.
- [ ] Merge PR and independently verify production `release.json`.

**Do not call this photographically verified or production-complete until the outstanding checks pass.**

## Integration guidance

Future agents can add or remove known colour classifications in `COLOURS`, preserving source-specific colours rather than spreading unrelated material assignments through multiple landmark builders. If realistic photo-based material textures are later available with a known reuse licence, evaluate them separately against draw-call, bandwidth, geometry UV and mobile-performance budgets.

Shared policy: [Parallel Agent Coordination Rules](PARALLEL_AGENT_COORDINATION.md).
