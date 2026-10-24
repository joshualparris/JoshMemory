# Indoor resident / wall-clipping defect — 24 October 2026

**Scope:** Repository Town's in-house 3D animated residents protruding through bedroom/exterior walls and windows in Josh's Android Chrome screenshots (game Day 4, ~12:28–12:32). The screenshots show portions of a blue-clothed human (arms, shoulders, hand and a head) apparently severed by a beige interior wall beside an open window. The player can move near the window; the visual violation is the resident mesh crossing a wall.

## Root cause and targeted correction

- Canonical implementation: `src/world/npcs.js`, `Walker.update()`. Indoor `houseWander()` computed route waypoints with coarse 0.4m sampling and radius 0.35. **It then added every movement step straight to the character position without querying the interior's CollisionWorld**. Even when the planner selected a route near a wall, the articulated arms and body could protrude; a thin wall could fall between successive path samples.
- Correction: the indoor route planner now carries the actual room `CollisionWorld` to the Walker. Each resident move uses `collisionWorld.move(position, dx, dz, 0.52)` with whole-silhouette clearance, the same swept/substepped wall protection used by the player, and the start position is cleared against that larger radius. Zero-progress routes are discarded for replanning after 0.7s instead of continuing to march into geometry.
- Planning line-of-sight checks now sample every 0.15m (including the start and end) with the same 0.52m radius, preventing waypoints routed so close to a window/wall that the model's shoulders, hands, or head break through.
- Other street walkers and unrelated AI/quests were left unchanged; when a Walker has no indoor collision planner its former movement behaviour remains in use. Protected `src/main.js` was not touched (another agent is implementing north/south property addresses).

## Evidence for this source change

**Verified locally in isolated Vercel sandbox** `sbx_ADBwodAoZRAePPMzT1eudOTdtKYF` (2026-10-24, `syd1`, Google Chrome/Playwright against locally built `dist/public`):

- `node tests/npc-appearance.mjs`: **PASS**, including the new solid wall, 1.8m doorway and planner-collision-world regression assertions. The checks are run through the existing `test:release` and full `build:release` gates.
- `node tests/household-homes.mjs`: **PASS**, all **188** houses and **2,256** working household appliances, without geometry failures.
- `npm run build:release`: **PASS** (sandbox command `cmd_92f0bb1b786d44b788bc77ed0377`, exit 0; contains release/privacy/integration/geometry/economy checks).
- Local production-format build opened in actual software-rendered Google Chrome, desktop (1140×740) and emulated Pixel 7 (390×844). Walked through A1's real front door into eight rooms with 39 props and one indoor resident, sampled resident-to-wall overlap **120 times per profile** at radius 0.52. **Both profiles passed: zero resident collider overlaps and zero JS page errors** (sandbox `cmd_9d701ebe439f4fdaa2c56e3829ed`, exit 0).
- Playwright's mobile viewport is *emulation*, not independent hardware/GPU evidence on Josh's Samsung phone.

## Outstanding evidence / regression prevention

1. Confirm GitHub PR passes Town Integration (release, privacy, economy), and Recorded WebGL CI; only then merge onto canonical `main` (not generated Pages site).
2. Verify Vercel production `release.json` reports the source containing this change and that hosted gameplay is ready, with browser smoke to confirm the new runtime is served. A CI success or README/document hash alone does not prove the new game code is deployed.
3. Reproduce the same house/viewport and motion over a prolonged period on an actual Samsung Android browser; the screenshots do not show a precise house coordinate, so an exact-camera before/after re-enactment is still unverified.
4. Remain alert for independent window-camera compositing issues or object-specific penetration outside the resident Walker class. Treat them as separate issues, not automatic proof this correction solved every rendering defect.

**Tracking:** narrow clipping fix and tests may be merged/closed independently; broader visual/physical-device playtest acceptance must stay open until observed.

## Hosted first-frame follow-up (same date)

After the initial fix was deployed as canonical production `fbbb34dab8b8c6eff4bb855b59a94120d8a4cd0c`, live `release.json` and served `/world/npcs.js` matched exactly, but a fresh hosted Chromium run detected **one** A1 indoor resident overlapping the wall at the very first sample (Ada Anderson, sample 0); the ensuing 119 samples in local earlier testing were clear. This was not declared complete. Root cause of this remaining transient: main.js assigns the indoor planner after constructing a Walker, and an interior can render before the first `Walker.update()` performs 0.52m spawn clearance.

**Follow-up corrective PR:** new setter `Walker.plan` calls `freeSpot(..., 0.52)` immediately on planner assignment and synchronises the 3D group before its first render; the existing update-time fallback remains in case other callers supply their planner directly. The `npc-appearance.mjs` release-gated tests now assert immediate clearance **without calling update()**. Node tests and 188-home geometry checks passed in sandbox `sbx_FFGlpanhn5P5zjVfDK46npzs6U1V`. This amendment also requires fresh green CI, an exact new production deployment and a repeat hosted browser verification; testing only the previous production SHA does not close it.
