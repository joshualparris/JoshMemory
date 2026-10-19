# Living Town playtest repairs — 19 October 2026

Base: main `7861e02`, reconciled with `17e20f2` (audio and Android keyboard changes preserved).
Scope: deterministic civic simulation, two missing civic colliders, Ledger wording and regression tests.

## Fixed
- Recyclables counted once when processed, rather than again when visitors sort them.
- Wastewater gauge updated after treatment to match remaining stock.
- Households buy only complete meals they can afford; unavailable ingredients and insufficient cash no longer consume unpaid/unusable food.
- Manufacturing consumes two scrap per part, preserving odd leftovers and limiting output to four parts per shift.
- Invalid bank, trading and sorting quantities rejected without mutating state.
- Park tree trunk and farm shed now block movement; front interaction areas remain accessible.
- Cumulative Ledger totals labelled as totals since founding.

Existing saves remain version 1. Historical over-counted recycling totals cannot be reconstructed; the correction applies to future processing. Existing accumulated factory scrap is consumed gradually by the normal production limit.

## Executed evidence
- Seven focused regression groups failed before the fixes and passed afterward, including 90 simulated days and save/restore equality.
- Original town simulation suite passed.
- CPU movement audit: 752 entrance cases (188 houses × walk/run × 20/60 Hz), 88 street/avenue traversals and 80 civic approaches passed.
- CPU interior geometry/interaction suite: 188 houses, 843 rooms, 2,627 exhibit approach checks and 193 replayable toy checks; no failures. Game cabinet geometry was included, not embedded game execution.
- NPC scene-awareness, house dialogue, mocked API and no-PIN/Android source contract suites passed.
- Standard build and privacy scanner passed on staged local source (188 houses). The full repository archive data was included.

## Verification limits
- Local staging contains only 95 of 871 canonical packed-game files. The build omits unavailable games via its existing loader; the result is NOT a complete release artifact and must not replace the live site.
- Cloud browser WebGL is disabled; local Chromium installation failed. CPU checks exercise real Player/CollisionWorld code but do not verify rendering, actual browser input, touch gestures or device performance.
- No paid workflow was manually dispatched. No live deployment was replaced.
- Before publishing, run the full build/privacy gate and browser/device checks from a complete checkout.
