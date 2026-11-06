Original prompt: Make the simulation less crowded, less traffic, easier and more fun to play; playtest newest Narromine build.

## Active request: 7 November 2026
Make generic building interiors and exteriors more realistic. User explicitly says not to edit any handcrafted buildings. Dedicated/evidence-backed builders are protected; work only on fallback-generated building types and fictional-town generic facade details.

- Generic-only implementation milestone: nine opt-in civic interiors/facades plus nine workplace category profiles; additive salon/laundry/clothing/rural-supply/office fixtures. Actual dispatch excludes every existing FIT template and named evidence.
- PASS fixture geometry footprint, central aisle/exit, staff/use clearance, pairwise placement, category/exclusion checks and 48 protected geometry signatures. The same snapshot fixture also passes against independently extracted source baseline `66561b06`; it was not refreshed for the implementation.
- PASS existing Narromine workplaces and indoor-life suites. Initial build passes. Browser QA and full release gate remain pending; no new building release is published.
- Browser correction: new workplace fixtures were centred on a wall line, clipping salon mirrors/counters. Added opt-in `spec.insetWallProps` only to new generic plans; no change to default/bespoke allocator. PASS new actual fixture footprint-in-room checks, all 48 protection snapshots, 77 workplace and indoor-life tests after correction.
- Local Chromium desktop: eight generic layouts and salon exterior inspected, actual keyboard movement across rear passage, service panel and exit; phone 375×812 emulation: laundry rendered, joystick movement and exit, settings open/close, no overflow or page errors. Phone is emulation, not physical hardware.
- Perplexity iframe preview remains blocked by the existing game's saves/Pointer Lock/packed arcade APIs. Do not remove persistence or bypass host restrictions. New building code is not published.

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
