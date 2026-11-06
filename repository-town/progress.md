Original prompt: Make the simulation less crowded, less traffic, easier and more fun to play; playtest newest Narromine build.

- Baseline inspected in Chromium and canonical source located in JoshMemory/repository-town.
- Existing main already contains spatial crowd repair; this change adds a reversible activity preference, not a replacement collision system.
- Main flow inventory is outside the deployment folder in workspace/narromine.FLOWS.md.
- Implemented Calm/Standard activity policy, stable quarter identity sampling, local crowd budget, lower moving/parked traffic admission, compact default HUD, and focused-button WASD repair.
- PASS new activity/input regressions; existing pedestrian spatial/collision, commute walkers and parking regressions; desktop menu, movement and legitimately staffed shop entry/exit; touch-emulated 375×812 movement and persisted save/settings.
- Phone expanded-HUD QA found an existing horizontally clipped collapse button; dedicated title row fixes it. Actual source stylesheet was tested in-browser; button fully inside HUD (x194–232 within x10–240), collapse works.
- PASS build, privacy scan and release fingerprint on implementation d87fac50. Full release suite running separately.
- Required game client captured screenshot and structured state (Calm, 14 visible outdoor residents); one console resource 404 was captured, no page exception. Separate fresh-context network audit found no failed game asset responses.
- Perplexity preview deployment was attempted and blocked by unsupported existing save/Pointer Lock APIs plus bundled arcade APIs. Preserve saves and existing games; no bypass or degraded preview. GitHub draft PR #519 contains the change; normal staging publication needs owner approval.
- COMPLETE local release gate: `npm run build:release` exit 0; privacy clean and all 1,518 release files verified for final gameplay commit ec5ba105. Source/CSS complete; handover-only documentation follows. Remote CI still pending; Vercel automatic build rate-limited. No live deployment or merge.
- Owner approved separate QA publication. Published only `qa/calm-town-20261106/` in site commit 2918e8b; Pages run 42196105081 succeeded. Hosted release metadata and seven critical file hashes match ec5ba105.
- HOSTED PASS desktop and fresh touch-emulated phone: load, Calm default, mode switches, HUD collapse, menus, movement after menus, CDP joystick, search, save and preference reload. Initial desktop CDN 503s resolved before retry; final desktop and first fresh phone load are clean. Physical handset/FPS and production promotion remain out of scope.
