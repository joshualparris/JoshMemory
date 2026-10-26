# Coordination board

Sessions working on Repository Town can't message each other, so we use this board.
Add a line under **In progress** when you start (who, what, which files), move it to
**Done** when you finish, and leave notes or questions for the others below.
Newest first. Times in Australia/Sydney.

## Roadmap notes

- 2026-10-25 · ChatGPT — **DOCS COMPLETE: RTN-001–018 screenshot/task numbering**: [18-item NPC individuality, crowd collision, fallback-deployment tracker](docs/RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md) and all RTN IDs indexed in [master task register](docs/UNNUMBERED_TODO_IDS_2026-10-24.md), README and checkpoint, committed to canonical main. Validated 18 unique IDs, 6 source/sandbox-only evidence and 12 unchecked. **RTN-007 is the next actual task**; PR #186 remains unmerged/conflicted, new NPC visuals aren't yet live. No source/gameplay, hosting, previous IDs or other agents' work edited.

- 2026-10-24 · ChatGPT — **DONE, documentation only: number previously unnumbered open tasks**, [PR #175](https://github.com/joshualparris/JoshMemory/pull/175) squash-merged to main (`543035cce55f4ba0dfff9b69bd34e427abe61547`). Added 101 unique stable IDs in `docs/UNNUMBERED_TODO_IDS_2026-10-24.md` (5 RTL, 64 audio child, 7 RTA, 16 RTR, 9 RTC), added RTL IDs to the existing Living Town checklist and README link. Kept all prior RTD/RT/audio parent/realism/council numbers and completion statuses unchanged, with no code, audio, deploy or generated-backup edits. Validated 101 unique open IDs and exact original Living Town document when the five inserted IDs are removed.


- 2026-10-24 · ChatGPT — **DOCUMENTED (no gameplay changed):** 93 numbered Skyrim-inspired NPC conversation tasks in `docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md`; canonical `JoshMemory/repository-town/` source and merged PR #166 are the foundation. RTD-001/002 research checked; RTD-003–093 remain open until evidence. Documentation branch `docs/town-skyrim-dialogue-roadmap-20261024` linked from README. Update the shared checkpoint before implementing to avoid collision with other audio/NPC work.

## In progress


- 2026-10-26 · ChatGPT — IN PROGRESS: fix pub kitchen walkability, cooking/wash/prep workflow and focused white work lighting on `fix/pub-kitchen-circulation-lighting-20261026`. Claim `src/world/pub-interior.js`, new `src/world/pub-kitchen-plan.js`, new `tests/pub-kitchen-layout.mjs`, `package.json`, kitchen QA notes. Preserve public venue, stair/lift, utility rules and other concurrent claims. Gate: collision/door sweep, light/power-outage, full release, hosted phone/desktop. No regulatory compliance claim.

- 2026-10-26 · Codex — IN PROGRESS (explicit takeover authorised by Josh in current session): user-authorised consolidation of open PRs and unmerged branches on integration/all-town-branches-20261026, baseline 95912eae. Audit every remote head and unique patch; preserve pub expansion, privacy, current roadmap IDs and other work. Reconcile genuinely missing changes; retain archived/superseded work without restoring obsolete code. Claim integration reconciliation only, not new feature completion. Tests/review required before main merge.


- 2026-10-26 · Codex — IN PROGRESS: pub ID/service discoverability only on fix/pub-id-controls-20261026; src/ui/townpanels.js, pub-standards-panel.js, src/world/pub-standards.js and src/main.js primary action placement. Preserve physical pub expansion and other claims. Desktop/mobile acceptance and release pending.

- 2026-10-26 · Codex — IMPLEMENTED AND HOSTED-VERIFIED PILOT PUB-SIM-001–010 (PR #219; follow-ups PUB-SIM-011–013 OPEN): user-requested utility boundary audit/reference-town evidence, finite gas/fuel/waste logistics, separate phone/mobile/broadcast functions, named staff RSA/RCG scenario endorsements and enforceable alcohol service, playable pool and non-cash Keno demonstration, tests and hosted release. Branch feat/pub-full-services-20261026; baseline a85b979. Scope pub-specific new modules/panels, pub-interior/standards/utilities and narrow main/life hooks, tests/docs. User added PUB-SIM-009 physical seating/door/window/fan remediation and PUB-SIM-010 visible service/staff presentation; attach via pub-only hooks and preserve shared NPC renderer. Preserve electrical backbone, formal PUB-CODE task statuses, unrelated NPC/audio and heritage work. No genuine certificates or undisclosed real circuits asserted.







- 2026-10-24 · ChatGPT — **VERIFIED COMPLETE: GitHub Pages backup deployment** of Repo Town. Reconciled and preserved two Pages-only audio/testing files (PR #185) and verified canonical supersets of two Pages-only NPC/voicebank edits (PR #187). [GitHub Pages mirror run #40091269927](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/40091269927) passed full release, privacy, five 28-day seeds, desktop/Android WebGL, exact fingerprint, and publish. The resulting Pages deployment is green (#40091685402). `release.json.sourceCommit=18f9e93b887dda04368056008681b0140ad48913`, contentHash `32914d94b39a14f00fd193d04d2baa9ef652993d8b9708c42da3b9870dea74ca`. Live browser verified [interactive N/S plot atlas](https://parris-tech-services.github.io/Repository-town/address-map.html) loads, 234 buildings/572 references, and exact Z7-S/Z8-N/Z8-S/Z9-N/Z9-S cells. [Playable backup](https://parris-tech-services.github.io/Repository-town/) published. Vercel remains quota-blocked, but no longer blocks backup delivery. Source work scope CLOSED.


- 2026-10-24 · ChatGPT — **MERGED screenshot-based mobile dialogue controls**, [PR #184](https://github.com/joshualparris/JoshMemory/pull/184) (`e71e4c7b`), superseding closed conflicted PR #182. New UI is isolated to `src/ui/yarns.js`, `yarn-preferences.js`, Help and focused regressions; no edits to concurrent NPC dialogue or N/S address work. Adds manual X dismiss, persistent auto-captions opt-out (mobile default off) and Settings control. Browserless mock-DOM integration and V8 parser checks passed; release/browser/deployment acceptance still pending.

- 2026-10-24 · ChatGPT — **IN PROGRESS: NPC distinct outfits and indoor shop crowd collision, screenshot at 22:04 AEDT.** Scope expanded before modifying street renderer: `src/world/townlife.js` (all simulated outdoor residents and trade crew only); no `src/main.js` or claimed `src/world/npcs.js`. Scope: new `src/world/npc-wardrobe.js`; `src/world/shop-visitors.js`, `src/world/shop-staff.js`; new `tests/indoor-crowd-identity.mjs`; `WORK_CHECKPOINT.md`, `COORDINATION.md`. Do not touch claimed `npcs.js`, `main.js`, dialogue or audio. Actor physical separation, unique deterministic visual styles, and explicit regression evidence; source branch `fix/town-distinct-npcs-and-indoor-crowds-20261024`. No production claims until hosted browser pass.

- 2026-10-24 · ChatGPT — **IN PROGRESS: prevent indoor resident bodies clipping through walls on mobile (user screenshots ~21:34 AEDT).** Scope `src/world/npcs.js` (indoor Walker movement and planner clearance), new `tests/indoor-resident-walls.mjs`, small test hook and `docs/INDOOR_RESIDENT_WALL_FIX_2026-10-24.md`; do not modify claimed `src/main.js` or dialogue/audio work. Root-cause hypothesis: indoor Walker moves directly along path without checking collision; resident's 3D arms protrude through walls even if its centre follows an imperfect waypoint. Must test wall-sweep, blocked route recovery and existing interiors, then review/merge/deploy/verify. Branch `fix/town-indoor-resident-wall-clipping-20261024`, start checkpoint recorded here. Leave unrelated tasks untouched.




- 2026-10-24 · ChatGPT — **DONE: N/S address audit and in-game plot atlas merged**, [PR #178](https://github.com/joshualparris/JoshMemory/pull/178), main merge `d7935f3b0f2ece5c7c02557c1b3a5287e867148e`. Verified the 572-slot physical audit and 234 building addresses, backwards-compatible deeds/house IDs; no roadway constructed. GitHub integration (including all five 28-day seeds), mobile driving and recorded WebGL CI all green. **Deployment blocked:** Vercel production still on older SHA; explicit deployment returned HTTP 402 `api-deployments-free-per-day` (>100/day). See `WORK_CHECKPOINT.md` and `docs/DIRECTIONAL_ADDRESS_AUDIT_2026-10-24.md` for handover. No source files left claimed.









- 2026-10-24 · ChatGPT — **MERGED (QA tooling only): arcade Skyvern/Playwright tester**, [PR #171](https://github.com/joshualparris/JoshMemory/pull/171), merge `db603aae`. Recorded Skyvern v2 workflow; no-account Playwright runner checks each exact-title edition, supports all games, captures runtime observations/screenshots, and produces JSON report. Manual GitHub Actions workflow and browserless contract are included. Four target index files/source-schema and JS syntax verified. Browser gameplay, balance assessment and manual dispatch NOT run. Vercel status on merge failed due project build-rate-limit, not a source compile failure; deployed arcade remains on older READY release. See `qa/README.md`, `WORK_CHECKPOINT.md`.







- 2026-10-24 · ChatGPT — **INTEGRATING prerecorded branching NPC conversations**, PR #166, branch `feat/town-npc-branching-recordings-20261024`. Source `src/ui/recorded-dialogue.js`, `src/ui/npc-chat.js`, `src/ui/voicebank.js`, `src/npc.css`; tests `recorded-dialogue.mjs` and `recorded-dialogue-browser.mjs`, added to CI. Keeps ten pre-existing unique Game300 cast voices, player-selected replies, verified manifest text, no unearned quest/purchase success, no paid speech and no impersonation for unrecorded NPCs. Baseline eight checks passed before the new browser acceptance test was attached. Updated browser checks underway; canonical deployment and the other 22 residents' casting still unverified. See `WORK_CHECKPOINT.md`.

- 2026-10-23 · ChatGPT — **INTEGRATING: VoiceBank speech for town residents and yarns** on `feat/town-parrisvoicebank-audio-20261023`. New `src/ui/voicebank.js` uses approved public VoiceBank recordings with opt-in en-AU device speech fallback; adding compact Listen/Stop buttons to `src/ui/npc.js`, `npc-chat.js`, `yarns.js`, and tests. No paid synthesis, changes to NPC replies, clock, gameplay simulation, or private source publication. Full release gate and mobile browser tests underway; merge and production verification pending.


- 2026-10-22 · ChatGPT — **TESTING: morning opening coverage, rebased on merged yarn work** `fix/town-opening-reconciled-20261022`. Real staff leave home earlier, use genuine pre-opening commutes and start work when their paid shift begins; static signs say HOURS, near-door hint shows real entry status. Multi-seed 08:18 Greengrocer, Security and Locksmith tests green; inventory delivery priority/capacity adjusted to preserve physical stock after increased trading, full 28-day seed gate pending. Supersedes conflicted PR #156; maintain merged NPC yarn UI. Do not publish to generated Pages directly.

- 2026-10-22 · ChatGPT — **IN PROGRESS: overheard NPC yarns** on `feat/town-overheard-yarns-20261022`. Contextual four-line conversations are generated at genuine meetings, saved with social memories, and shown through a mobile-friendly 🗣 Yarns log and local subtitles. Source changes: `src/world/yarn-dialogue.js`, `social-events.js`, `life.js`, new `src/ui/yarns.js`, minimal `src/main.js`, `tests/social-events.mjs`. Protect ongoing immersive-sleep work; tests, integration, and live deployment pending.


- 2026-10-22 · ChatGPT — **INTEGRATING: immersive timed sleep and wake-up** on `feat/town-immersive-sleep-20261022`. Source `src/world/needs.js`, `src/world/life.js`, `src/main.js`, `src/index.html`, `src/styles.css`; hotel and owned-home beds now offer 30 min–8 h rests and until 06:00 overnight, physically settle camera then fade to black, simulate deterministic town time in Android-friendly batches, wake/fade in and save. Extends `tests/hunger-sleep-hotel.mjs` and adds `tests/sleep-browser.mjs`. Full CI/build, merge and deployment pending; do not publish the generated Pages backup by hand.

- 2026-10-22 · ChatGPT — **READY FOR REVIEW: low-frame-rate house and civic doorways** on `fix/town-lowfps-door-sensors-20261022`. House approach sensors extend to a collision-clear 2.25m, north civic entry sensors to 1.35m, and locked-door respawns remain outside the trigger. Full `npm run build:release`, privacy scan, 14 approach checks, 188-house exterior, civic access and visitor security checks passed in isolated sandbox. Awaiting merged commit and live verification.

- 2026-10-22 · ChatGPT — **READY FOR INTEGRATION: playable café, save/restore stability and validated walking tests** on `fix/town-cafe-save-integrated-20261022`. Preserves merged PR #118 walk-test fixes while reconciling PR #132 (which includes PR #129): skim orders, $1 wallet-funded timely-service tips, full save replacement, step-by-step work-save regressions, mobile café browser tests. `npm run build:release` and privacy gate passed in isolated Vercel sandbox; browser tests tracked in PR CI. Source-first; generated Pages backup not overwritten.

- 2026-10-21 · Claude — **READY FOR REVIEW: work save/restore never duplicates or loses goods or pay** on `feat/work-save-restore-20261021` (stacked on the café PR #129). `TownLife.restore()` now fully replaces state from a full save: civic work records created after the save (shifts, café trays, delivery routes, store cartons) and villager/truck fields the save didn't have are dropped, instead of surviving a load of an older save. New `tests/work-save.mjs` (test:town): all six hands-on occupations reloaded after every step match a straight playthrough; finished work, café trays and delivery receipts can't repeat after a reload; 10 days of daily shifts with 40 reloads end identical to an uninterrupted town. `tests/cafe-play.mjs --reload` (desktop + mobile, test:browser) reloads the real page mid-order and with a tray in hand. Roadmap box ticked.

- 2026-10-21 · Claude — **READY FOR REVIEW: café skim milk, quick-service tips and a browser playthrough** on `feat/cafe-tips-skim-play-20261021`. Ported the café extras from closed PRs #119/#120 that main lacked: customers can ask for skim (the full-cream jug is refused for them), serving within half the customer's patience earns a $1 tip from their wallet to the visitor's (café still paid in full; HUD shows tips). Merged with main's soy milk: skim is offered to standard customers alongside main's soy/oat options; main locks milk before preparation so no remake flow is needed. New `tests/cafe-tips.mjs` (test:town) and `tests/cafe-play.mjs` desktop + mobile (test:browser) — take a real villager's order, choose milk, work every step, deliver.

- 2026-10-21 · Claude — **READY FOR REVIEW: town-life and street-walk browser tests reliable again** on `fix/life-store-and-streetwalk-tests-20261021`. Test-only changes. `tests/life.mjs`: after `setTime(10:00)` every villager re-plans the morning, so the store check now runs the town (max 2 h) until someone is serving, using the same rule as `workingAt()`; the shop `counter()` helper retries when a customer steps nearer than the desk and E greets them. `tests/streetwalk.mjs` and `tests/exit-stuck.mjs` defaulted to port 8080 while every other browser suite uses 8091, so they could not connect. life.mjs passes 4 consecutive full runs.

- 2026-10-21 · ChatGPT — **Verified Community Bank G8 entrance fix** on `fix/bank-entrance-reconciled-20261021`, replacing the earlier conflicted PR #145. South civic entry detection now starts outside the collision wall; bank requires on-site teller during 09:00–16:00, locked buildings remain secure. Source `world/civic-entrance.js`, `main.js`, `tests/civic-entry.mjs`, `tests/webgl-playtest.mjs`. Original feature passed full Town Integration, five economic seeds, mobile driving and recorded Chromium bank entry/exit. Reconciled new branch preserves concurrent NPC appearance and mobile-driving tests; full CI required for merge.\n
- 2026-10-21 · Claude — **READY FOR REVIEW: SIM-DBO1 Defender Trainer playable in K4 (DubboDataCentre)** on `feat/town-dbo1-defender-20261021`. Josh approved making this one game public even though its repo is private. Packed from DubboDataCentre branch `ccr-78130064-ssgp5r` (its PR #4 is not merged) into `games/dbo1-defender/`. New opt-in `"public": true` in `data/games.json` keeps an approved game's cabinet playable when `sanitise()` redacts a private house; every other private exhibit stays withheld. `pack_games.mjs` now renames a non-`index.html` top-level `entry` to `index.html`. Build, privacy check, `tests/games.mjs --only dbo1-defender` and `tests/e2e.mjs --only K4` (desktop + mobile) pass. No changes to `src/`.

- 2026-10-21 · Claude — **READY FOR REVIEW: villagers no longer walk or cycle through buildings** on `fix/npc-soak-solid-contacts-20261021`. Root cause of the npc-soak failure (7 solid contacts/day, limit 3) noted in the consolidation entry: Dealership, Mechanic, Hardware, Trades, TAFE and University stand on the front of the six farm paddocks (z 185–197), so farm work spots, livestock gates and the last walk/cycle leg ran through them. Paddocks with a building in front now start at FIELD_Z0+15 and are reached via `fieldAccessRoute` (side gap → back of building → gate); work spots avoid the hen house/trough. Greengrocer display crates moved 0.3 m toward the window (they sat 0.08 m from queue slots). npc-soak 7 → 0 contacts; life's 'no villager inside a building' now passes. New `tests/farm-access.mjs` in test:town. Pre-existing, unchanged: life's General Store check is timing-dependent after `setTime` (shopkeeper still commuting at 10:32 on main too); streetwalk crashes identically on main.

- 2026-10-21 · Claude — **DONE (PR #115 merged): search box finds any building** on `feat/town-search-any-building-20261021`. `src/main.js` HUD search now also lists and matches the 41 High Street/civic/farm places (bank, dealership, property offices, pub…) and fast-travels with the existing `goPlace()`; houses work as before. Placeholder in `src/index.html` updated. Build, privacy, `e2e --only A1,K4` pass; browser check of 8 searches.

- 2026-10-21 · Claude — **DONE (PR #112 merged at 3cc3e37; production, staging and Pages backup all on 3cc3e37): restore Paul Roe memorial galleries and Q8 Waste Depot to source** on `fix/restore-memorial-waste-depot-20261021`. Both lived only on the Pages site and were disconnected from the live game by Pages publish `ab9799f` (files left orphaned; last working live commit `e111b0c`). Ported `world/paul-roe-tribute.js`, `world/waste-depot-interior.js`, `ui/waste-depot-panel.js` and their tests verbatim from Pages; wiring in `main.js`, `world/interior.js`, `world/shop-interior.js` matches `e111b0c` (incl. room-scoped interior labels the memorial fix depended on). Added a Q8 case to `tests/shop-interiors.mjs`; registered both tests in `package.json`. `npm run build:release`, e2e C2/K3/A1 desktop+mobile, walk-in-buildings, exit-facing and windows pass. Does not touch hosting/pipeline files (consolidation in progress).

- 2026-10-20 · ChatGPT — **DONE: NSW property contracts, protected commercial/residential tenancies, player driving.** Canonical PR [#107](https://github.com/joshualparris/JoshMemory/pull/107) merged to `main` at `0ce278e`; superseded PR #104 closed. Safely three-way reconciled other team's Trades & Education V–Y8 work and other live site changes. Public Pages update `e111b0c` successful; economy, exits, memorial, NPC collision and waste-depot regressions green. Playwright Android Pixel 7 browser simulation `39423917134` passed dealership purchase, rendered world car, touchscreen enter + joystick driving + fuel and odometer checks; native Samsung Android handset manual test not available from GitHub workflows. Modules `player-driving.js` and `nsw-property-law.js`, `property-contracts.js`, `lease-law.js` implemented; source `main.js`, `life.js`, `property.js`, `vehicles.js`, `ui/property-panels.js` wired; strict `tests/nsw-driving-lease.mjs` + Android browser `tests/mobile-driving.mjs`. Legislative references NSW Revenue 2026–27 general duty, 5-business-day cooling-off and 0.25% rescission penalty, NSW tenancy non-payment and NCAT/warrant, retail lease disclosure 7 days. Actual AUD prices NOT asserted for fictional lots: comparison is illustrative x100 reference and Town-Dollar scaling; 5/7 game-day cooling/settlement are deliberately compressed, not NSW calendar days. Model limits: not full cadastral valuation, special buyer concessions, NCAT case-specific discretion, vehicle comprehensive road regulation or physical handset signoff.

- 2026-10-20 · ChatGPT — **V8–Y8 regional trades and education precinct** on `feat/town-trades-education-precinct-20261020`. New `trade-education.js`, `trade-education-interiors.js`, `ui/trade-education-panels.js`, docs and town tests. Adds separately authored hardware/trades/TAFE/university buildings without replacing U8 Motor Workshop or P8 School; finite hardware inventory, paid quotations, NSW-inspired licensed specialist allocation and apprentice supervision, inspections, refunds, AQF I–X/HSC separate, finite tuition, town-day assessments and save support. Touches `life.js`, `townlife.js`, `shop-interior.js`, `shop-staff.js`, `townpanels.js` and package tests; do not overwrite other concurrent changes. Integrate, privacy-build check and publish only after tests. In-game licensing/credentials are fictional.\n
- 2026-10-20 · ChatGPT — **DONE: Property-title realism + motor market**, source [PR #103](https://github.com/joshualparris/JoshMemory/pull/103) merged at `768ad4e`, repository-town integration workflow `39418766022` all green (28-day strict expanded money conservation, 188-title purchase/lease settlement and repairs, geometry, build, privacy). Preserved independent Repository Realty (M8; agent now uses real same title register); also added South S8 Central West Property & Land, T8 High Street Motors, U8 Town Motor Workshop. New modules `src/world/property.js`, `src/world/vehicles.js`, `src/world/trade-interiors.js`, `src/ui/property-panels.js`, test `tests/property-trade.mjs`; integrate NPC tenure, finite mortgage reserve, buyer/seller accounts, bond, 20% deposit and fictional closing costs, retail vehicles and Foundry-sourced garage parts. All figures are fictional Town Dollars for 28-day year. Published public site GitHub Pages commit `c7cc529` by collision-safe three-way merges (preserved independent live NPC edits), Pages run `39419328548` **success**, existing live regression workflows all green. Old PR #100/#101 closed. Not yet built: actual player vehicle driving, detailed commercial rent/eviction, actual NSW legal transfer duty table. Physical Android game manual playtest not independently confirmed.
- 2026-10-20 · ChatGPT — **M8 Repository Realty**, `feat/m8-repository-realty-20261020`: new south High Street commercial site opposite Market Square, distinctive glass listing display and verandah, five-zone realistic real estate agency interior, existing resident Gwen as agent (38 residents preserved), real address-directory, 16 hotspots, client seating and walkability tests. Source scope: `src/world/life.js`, `src/world/townlife.js`, new `src/world/realty-interior.js`, `src/world/realty-listings.js`, minimal `src/world/shop-interior.js` registration, `tests/realty-interior.mjs`, `tests/shop-interiors.mjs`, package script, docs. **Do not merge an unverified property ownership or trust-money simulator**; only actual addresses are displayed with no invented listing authority/prices. Preserve concurrent property registry, NPC fixes and interiors; full integration/public publish pending.


- 2026-10-20 · ChatGPT — **Living café/pub/shop customers** on fresh `feat/living-indoor-visitors-reconciled-20261020` (supersedes PR #98 to preserve merged Recycling Centre work). New `shop-visitors.js`: visually represents real roster visitor arrivals, seating, counter queues, exits and conversations. `main.js` integrates with player interaction and seat occupancy; `life.js` gives some off-shift residents a real paid afternoon visit. New `tests/shop-visitors.mjs` gates functionality. Integration/build/privacy and browser checks required before deploying. No random decorative NPCs.\n
- 2026-10-20 · ChatGPT — **DONE: Sitting & furniture upgrade** from Claude handover, PR #95 merged to source `main` at `ceb7a7894`. Added shared `src/world/seats.js`, `src/ui/furniture.js`, first-person seated mode in `src/engine/player.js`, sit/stand E/touch prompts, seating across procedurally generated houses and floors, custom farmhouse, pub, café, civic models, High Street and square benches, seated fatigue recovery, café/pub order-at-table UI and served notice; new `tests/sitting.mjs` and isolated farmhouse fixture fix. Source GitHub `Repository Town Integration` run 39413634693 **all green** (town, geometry, build, privacy, games). Render QA deployment `dep-dbbkrf8473hc73cmsjeg` canceled by exhausted workspace build-pipeline minutes (no code failure); `Parris-Tech-Services/Repository-town` generated public modules safely atomically published in commit `b0d94a4` after checking 9 preexisting blobs precisely matched validated source, no unrelated overwrites. Pages deployment run 39414140369 pending verification at time of this note. Superseded PRs #91, #92 and #94 closed; #95 is canonical. Browser acceptance on a real phone still not verified.
- 2026-10-20 · ChatGPT — **L8 Wastewater Works interior (distinct from J8 Water Works)**, feature branch `feat/wastewater-works-interior-20261020`. Scope: new `src/world/wastewater-interior.js`, minimal `src/world/shop-interior.js` routing, `tests/wastewater-interior.mjs`, core civic-interior checks, package test suite and `docs/WASTEWATER_WORKS_INTERIOR.md`. Inspired by Dubbo Regional Council and Sydney Water treatment stages; SCADA lab, covered bar screen/grit, bioreactor/clarifier, sludge and reuse, full-width clear visitor spine. No NPC, physics, power, water, depot, other shop or external module overwritten. CI and public-site publication pending.


- 2026-10-20 21:31 Sydney · ChatGPT — CLAIMED Water Works J8 on `feat/waterworks-interior-20261020`: dedicated treatment building, laboratory, pumps and reachable interactions; new waterworks-interior.js, shop dispatcher/tests only. Preserve Claude’s Power Station PR87; do not overlap.




- 2026-10-20 · ChatGPT — **DONE: Android crowd-orbit loop at General Store**, PR #76 merged into `main` at `29fe2c0`. Adds `src/world/pedestrian-progress.js`, integrated progress recovery in `life.js`, named NPC stuck-target recovery in `npcs.js`, pub visitors seated indoors, `tests/pedestrian-orbit.mjs` in `test:town`. GitHub Repository Town Integration safety gate passed (town simulation/collision, geometry, build, privacy, game integrity). Render `repository-town-main-qa.onrender.com` is live at exactly `29fe2c0` (deploy `dep-dbbd3u3bc2fs73aoi0eg`). **Emergency Pages hotfix:** Generated-site files `world/pedestrian-progress.js`, `world/life.js`, `world/npcs.js` copied from that same tested source commit to `Parris-Tech-Services/Repository-town` (latest site commit `1ed3cf4`). Prior public module blob SHA matched pre-fix source exactly; future source builds contain same fix. GitHub Pages propagation and a real Android motion playtest still require independent confirmation.

- 2026-10-20 · ChatGPT — **MIT open-source town simulation adaptation #1: IsoCity traffic signals** on `feat/isocity-inspired-signal-crossing-20261020`. Scope: `src/world/traffic-signals.js`, `src/world/life.js`, `src/world/townlife.js`, `tests/traffic-signals.mjs`, `package.json` and `docs/OPEN_SOURCE_PORT_ISOCITY_SIGNAL_2026-10-20.md`. One deterministic High Street zebra at (52,177); truck amber/red stopping, green resumption, visual signal poles. New code, not copied from IsoCity; licence and attribution documented. Do NOT overwrite collision/truck behaviour. Canonical integration gate and source-to-public publish required before declaring live. Pedestrian light does not yet control autonomous walkers.



- 2026-10-19 · Claude Code — **traffic and collision realism**, branch `realism`, MERGED into `main` and the Render branch `feat/town-realism-power-network-20261019` (merged with the playtest truck work; `traffic-and-shop-exits` adapted to lane stops). `life.mjs` Town Hall vote checks fail on plain main too (council UI change), not from this work. Trucks: real oriented-footprint collision, following distance, turning rate, lanes, bay gap-acceptance and deadlock breakers (`src/world/life.js` truck section: `TRUCK`, `routeTruck`, `driveTruck`, `blocked`, `unjam`). Props: lamps, kiosk, tables, crates, trees, fences, benches, stalls, troughs and silos are now solid (`Builder.solid()` in `src/world/builder.js`, used by `town.js` and `townlife.js`). Players can no longer be pinned inside a moving collider (`src/engine/collision.js`). New tests: `tests/truck-collision.mjs`, `tests/town-exit.mjs`, `tests/exit-stuck.mjs`. **Overlaps with the power-network branch in `life.js` and `townlife.js` — merge, do not overwrite either.**
- 2026-10-20 · ChatGPT — modular NPC audit reconciliation and protected PR pipeline on `integration/town-npc-modular-ci-20261020`. Preserving the existing council politics, traffic, farmhouse, power and multi-floor systems; adding 38 personalities in an independent module, authoritative NPC location, and a gated/opt-in merge queue. Publishing held until merge and privacy/build tests finish. See `docs/INTEGRATION_SYSTEM_2026-10-20.md`.

- 2026-10-19 · ChatGPT (farmhouse regression repair) — COMPLETE: dedicated 10-area farmhouse restored in source and merged to main via PR #35; Nell positioned in the kitchen; farmhouse geometry and walkability regressions now pass (22 interactions; 1,726 reachable floor cells). The realism playtest Render build at commit `065ec52017443839d30e91d448d90bf6bc05680d` is LIVE (14-day town economy, power grid, traffic/Foundry, 33 interiors, farmhouse geometry, privacy tests pass). Truck junction deadlock fixed in `src/world/life.js` without disabling economic tests. Main QA also deployed. Avoid reintroducing generic farmhouse fallback.
- 2026-10-19 · Claude Code — **traffic and collision realism**, local topic branch `realism` (from `feat/town-realism-power-network-20261019`), not pushed yet. Trucks: real oriented-footprint collision, following distance, turning rate, lanes, bay gap-acceptance and deadlock breakers (`src/world/life.js` truck section: `TRUCK`, `routeTruck`, `driveTruck`, `blocked`, `unjam`). Props: lamps, kiosk, tables, crates, trees, fences, benches, stalls, troughs and silos are now solid (`Builder.solid()` in `src/world/builder.js`, used by `town.js` and `townlife.js`). Players can no longer be pinned inside a moving collider (`src/engine/collision.js`). New tests: `tests/truck-collision.mjs`, `tests/town-exit.mjs`, `tests/exit-stuck.mjs`. **Overlaps with the power-network branch in `life.js` and `townlife.js` — merge, do not overwrite either.**
- 2026-10-19 · Claude Code — **traffic and collision realism**, branch `realism`, MERGED into `main` and the Render branch `feat/town-realism-power-network-20261019` (merged with the playtest truck work; `traffic-and-shop-exits` adapted to lane stops). `life.mjs` Town Hall vote checks fail on plain main too (council UI change), not from this work. Trucks: real oriented-footprint collision, following distance, turning rate, lanes, bay gap-acceptance and deadlock breakers (`src/world/life.js` truck section: `TRUCK`, `routeTruck`, `driveTruck`, `blocked`, `unjam`). Props: lamps, kiosk, tables, crates, trees, fences, benches, stalls, troughs and silos are now solid (`Builder.solid()` in `src/world/builder.js`, used by `town.js` and `townlife.js`). Players can no longer be pinned inside a moving collider (`src/engine/collision.js`). New tests: `tests/truck-collision.mjs`, `tests/town-exit.mjs`, `tests/exit-stuck.mjs`. **Overlaps with the power-network branch in `life.js` and `townlife.js` — merge, do not overwrite either.**

- 2026-10-19 · ChatGPT (GitHub connector) — **Replit-pack realism upgrade, first electricity-network vertical slice**, topic branch `feat/town-realism-power-network-20261019`. Files: `src/world/power-grid.js`, `src/world/life.js`, `src/world/townlife.js`, `src/ui/townpanels.js`, `tests/power-grid.mjs`, `package.json`, clock docs, README and `docs/REALISM_INFRASTRUCTURE_2026-10-19.md`. Named 10-edge power distribution, fault/repair and per-facility dependencies with Ledger UI. Prior 14-day town regression and focused in-memory JS tests passed; reference-pack tests also passed under Node. **Source PR, integration checks and real Android/browser verification remain pending.** Keep other AI work and the live Pages repo unmodified until reviewed. See design/limits document.







- 2026-10-19 · ChatGPT GitHub connector — separate playtest branch `repository-town-merged-playtest-20261019` deployed to Render `https://repository-town-npc-playtest.onrender.com`; 32 NPCs, wandering, worksite inventory/build prototype, roof replacements and collision-aware wandering. **NOT YET MERGED**: compare reveals two divergent branches with overlapping edits to `src/main.js`, `src/world/npcs.js`, `src/ui/*` and the adventure files. Please preserve both implementations when integrating; do not publish one branch over the other. Render preview uses manually triggered deployment and privacy check. Proposed next step is reviewed three-way merge plus tests.\n
- 2026-10-19 · ChatGPT — reconciling Claude's separate branch via `repository-town-safe-integration-20261019`. `main` already includes Expedition Guild and newer NPC models. Do not blindly copy Claude `src/main.js`, `src/world/npcs.js`, or `src/ui/npc.js` over main; port specific behaviours with tests.\n\n- 2026-10-19 · ChatGPT GitHub connector — separate playtest branch `repository-town-merged-playtest-20261019` deployed to Render `https://repository-town-npc-playtest.onrender.com`; 32 NPCs, wandering, worksite inventory/build prototype, roof replacements and collision-aware wandering. **NOT YET MERGED**: compare reveals two divergent branches with overlapping edits to `src/main.js`, `src/world/npcs.js`, `src/ui/*` and the adventure files. Please preserve both implementations when integrating; do not publish one branch over the other. Render preview uses manually triggered deployment and privacy check. Proposed next step is reviewed three-way merge plus tests.\n
- 2026-10-19 · Claude Code session ("Repository search") — upgrade round: research the 17
  name-only houses; fix broken games in their own repos (on branch `ccr-846db548-0l5zmu`
  there, not main); villagers give relic hints/gossip/errands; day–night, window lights,
  sound, town guide; residents move between rooms; phone performance; data refresh
  command; full 188-house re-test. Files: `src/world/npcs.js`, `src/ui/npc.js`,
  `src/main.js`, `src/world/town.js`, `src/adventure/` (read-only use of relic data),
  `tools/`, `briefs/`. Ping here before editing those.
- 2026-10-19 · Codex — fixing the live NPC AI connection: connect the static GitHub Pages
  frontend to the existing Vercel Groq proxy, add exact-origin CORS, validate the API and
  publish the updated Pages build. Files: `api/npc-chat.js`, `src/ui/npc-api.js`,
  `src/ui/npc.js`, `src/ui/npc-chat.js`. Local tests pass; Vercel production deployment
  is currently blocked by the Hobby team's daily deployment quota (`api-deployments-free-per-day`).

## Done

- 2026-10-26 · ChatGPT — **SOURCE MERGED, CI VERIFIED**: [PR #227](https://github.com/joshualparris/JoshMemory/pull/227) squash-merged to main at `b8d671a89f3a754d40ddf41e2f9067ecab685408`. Shared -Z street-facing entry/exit/view fix for all 72 new infill properties; legacy +Z High Street and south industry preserved. Tests: all five 28-day simulations, Town safety/release/privacy gate, Android emulation, heritage release, and recorded desktop/mobile WebGL gameplay (including physical exit-facing browser regression) PASS at `1b6bec6af27e3d2f078b4107e17893b7b01586b5`. Vercel production deployment must be independently verified READY before claiming hosted completion. 


- 2026-10-25 · Codex — **DONE: playable pub systems and hosted QA**, [PR #208](https://github.com/joshualparris/JoshMemory/pull/208), merge `ca8f78e655834b623d7f610ba92419eae69fd54f`. Integrates the prior physical-P0 and WC/kitchen gameplay claims. Actual keyboard street entry/rear discharge, continuous 1.2 m game route, two WC rooms, cold room, seven utility overlays, fault/service/food/RSA/evacuation/inspection consequences and saved state verified desktop + emulated Android. All eight implementation PR workflows green, including full release/privacy and five 28-day seeds. Published isolated QA runtime `f2cefefe86e5f423d3a9f9bdcaaf906e02399706`, fingerprint `cceaa0711a922937748dd44b6d8addc634cf4a2e81607a60295514638518db95`; [playtest](https://parris-tech-services.github.io/Repository-town-playtest/qa-tests/pub-compliance.html?v=36822853), publisher 40194936640 and hosted verification 40195379814 PASS. Responsive launcher verified. **Formal PUB-CODE/RTPUB-001–034 assessment statuses remain unchanged; no actual building certification, licensed trade sign-off or permit is asserted.** Details: docs/PUB_COMPLETION_2026-10-25.md. No next-task reservation.

- 2026-10-25 · Codex — **SOURCE MERGED and QA PUBLISHED: RTPUB utilities pilot**, PR #201 / b7d623c; full release, five 28-day seeds, recorded WebGL and focused local/hosted desktop/emulated Android checks passed. New WC, hand basins, kitchen, finite service inventories, outage controls and overlays. Vercel production is quota-blocked; existing isolated Pages QA published by run 40156740087, root handover and production mirror preserved. Hosted acceptance run 40156987523; direct pub launcher at https://parris-tech-services.github.io/Repository-town-playtest/qa-tests/pub-utilities.html . Full physical network RTPUB-008 remains OPEN; next .01 asset/port graph, detailed children in NSWutilities/docs/PUB_UTILITIES_NEXT_IMPLEMENTATION.md. No claim all utility systems complete.
 recently

- 2026-10-25 · ChatGPT — **Utility designations and sewerage research complete (documentation only).** RT-SYS-001–016 register; Narromine provisional reference, 18-source registry, pinned SWMM code review, water/power contract proposal, RTSW-001–028 queue. Research children 001/002 complete; all implementation tasks and RTU-022–024 parents remain open. Next RTSW-003 after inventory-owner reconciliation. No electricity/Manus water runtime overwritten. See docs/SEWERAGE_RESEARCH_2026-10-25.md and scoped checkpoint.


- 2026-10-25 · ChatGPT — **RTU-001 audit complete (no runtime feature changed)**: [report](docs/RTU_001_ELECTRICAL_AUDIT.md), 234-location coverage, controlled faults/reload/Three.js lighting probes, reusable generator and source hashes. Actual bugs documented, not patched or claimed live. Existing RTU-002–030 remain open. Validation and publication evidence in scoped checkpoint and report.

- 2026-10-25 · ChatGPT — **VERIFIED DONE: DOCS-RTD-TRIAGE-20261025** [PR #192](https://github.com/joshualparris/JoshMemory/pull/192) merged `fff5c0a75b6641c1de0c6ee67680fb44d4b9996d`; [Town Integration #40129362594](https://github.com/joshualparris/JoshMemory/actions/runs/40129362594), [Recorded WebGL #40129362578](https://github.com/joshualparris/JoshMemory/actions/runs/40129362578) and [general CI #40129362704](https://github.com/joshualparris/JoshMemory/actions/runs/40129362704) all SUCCESS.. Added [after-009 ranked 84-item crosswalk](docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md): RTD-010–093 each appear exactly once with their **unchanged unique ID**, suggested rank, exact canonical task text and parents TASK-032–045 mapping. Linked [93-task roadmap](docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md), [global parent tracker](../docs/OUTSTANDING_WORK_2026-10-24.md) and Town README. RTD-001–009 remain the only completed items; global TASK-032–045 remain open. No RTD-010 implementation reservation, no runtime/voice/build/deployment edit. Branch `docs/town-rtd-after-009-triage-20261025`; attach PR/CI to checkpoint after green result. 


- 2026-10-24 · ChatGPT — **DONE / VERIFIED MERGED: RTD-009 typed dialogue schema and adversarial contract tests.** [PR #179](https://github.com/joshualparris/JoshMemory/pull/179) merged `08e41aebcb905882fe902f9c81aa8859b07b6db3`; [Integration #40087956668](https://github.com/joshualparris/JoshMemory/actions/runs/40087956668) **SUCCESS** incl actual `PASS RTD-009 / RTAC-003`, five economy seeds and privacy/release; [Recorded WebGL #40087956707](https://github.com/joshualparris/JoshMemory/actions/runs/40087956707) **SUCCESS**; [Mobile Driving #40087956669](https://github.com/joshualparris/JoshMemory/actions/runs/40087956669) **SUCCESS**.  Claimed on main `c4722c84333d6947e7ff7775f81162f4fad7787f`, M1 checkpoint on main `6fd2e4547552a51548944b56cbcec6c12584ef31`. New pure `src/dialogue/schema.js` and [schema v1 guide](docs/RTD_009_DIALOGUE_SCHEMA_V1.md), adversarial `tests/dialogue-schema.mjs` wired into `npm run test:release`; RTD-009 checked only and WORK_CHECKPOINT M2/M3 committed. No changes to existing voiced NPC player, NPC AI, simulated economy, parallel N/S addresses or overlapping open #164. Schema has only typed request descriptors; effect execution, cross-graph validation and live recordings are explicitly future RTDs. Topic branch `feat/town-rtd009-dialogue-schema-20261024`, PR CI and merge to be linked in final checkpoint. RTD-010+ UNCLAIMED.

- 2026-10-24 · ChatGPT — **DONE: focused RT-08 / AUDIO-013.03 live production verification evidence and corrected E2E household assertion.** [PR #177](https://github.com/joshualparris/JoshMemory/pull/177) squash-merged as `1d55b3677ddfe929beb1e7ea9c9d8ecac2003963`. Tested head `d0523316c3e0af4cbeb4cb4d2d18be224c1c8303`; [Town Integration 40084738543](https://github.com/joshualparris/JoshMemory/actions/runs/40084738543) SUCCESS and [Recorded WebGL 40084738567](https://github.com/joshualparris/JoshMemory/actions/runs/40084738567) SUCCESS. Independently tested actual published production: 10/10 Game300 actors × two profiles in NPC Lounge, Rowan/Pip/Kit × two profiles in 3D Town; A1 real entry/exit and touch/movement. See [RT-08 report](docs/RT_08_LIVE_PRODUCTION_ACCEPTANCE_2026-10-24.md). Cosmetic `/favicon.ico` 404 documented. **RT-08 and audio parent 013 remain OPEN** for complete world, real handset, offline/CSP and mirror acceptance; no runtime game changes or new deployment claimed.


- 2026-10-24 · ChatGPT — **DONE / VERIFIED MERGED: RTD-008 versioned dialogue acceptance v1.0.0 and PR task traceability.** [PR #176](https://github.com/joshualparris/JoshMemory/pull/176) merged as `7757519ec6684510daf182ad185a196e1261ff70`; Town Integration [40083376492](https://github.com/joshualparris/JoshMemory/actions/runs/40083376492), Recorded WebGL [40083376430](https://github.com/joshualparris/JoshMemory/actions/runs/40083376430) and general CI [40083376493](https://github.com/joshualparris/JoshMemory/actions/runs/40083376493) all passed.  On main task claim `ca90808273767c100d385b77977a549789d2acfa` and M1 checkpoint `27d48b9eb957cc356804dd0512fb2871d742f45c` before edits. Published [RTD-008 human checklist](docs/RTD_008_ACCEPTANCE_CRITERIA_V1.md), [v1.0.0 machine contract](docs/RTD_DIALOGUE_ACCEPTANCE_V1.json) with 34 RTAC pass/fail scenarios and coverage of every RTD-009–093, new scoped `.github/PULL_REQUEST_TEMPLATE/repository-town-rtd.md`, Node test `tests/rtd-acceptance-contract.mjs` with negative ID/metadata checks, test integrated with `npm run test:integration` and PR-only Town Integration workflow traceability step, and AGENTS rules; M2/M3 checkpoints committed. Checked RTD-008 only; 009+ stay unclaimed/unimplemented. No game/audio runtime or deployment changed; topic branch `docs/town-rtd008-acceptance-contract-20261024` tracks PR and green CI. PR #164 remains independently open.


- 2026-10-24 · ChatGPT — **DONE: RTD-007 ownership reservation and durable milestone checkpointing**. Claimed on canonical main before edits (`b2cd82474e3a19c33f9090967169111188be4f26`) and checkpointed start (`553ae142e369b17bd88f19caa256c93ce9460623`). Published [RTD-007 coordination protocol](docs/RTD_007_COORDINATION_CHECKPOINT_PROTOCOL_2026-10-24.md), linked mandatory rules in `AGENTS.md`, checked RTD-007 only and updated `WORK_CHECKPOINT.md` at protocol and evidence milestones. All changes docs/agent instructions, **no gameplay/audio/source deployment**. Branch `docs/town-rtd007-coordination-checkpoints-20261024`; PR/CI verification tracked by checkpoint. **RTD-008 is UNCLAIMED** and must be independently reserved by its next owner before editing. Retain the separate still-open overlapping PR #164 and all other agents' entries.


- 2026-10-24 · ChatGPT — **DONE: RTD-006 canonical release/browser/audio baseline**; [pinned evidence](docs/RTD_006_RELEASE_BASELINE_2026-10-24.md). Compared GitHub main against actual READY Vercel `dpl_BUJvawLJX9Bvk87P7b7uKu1U4RJp` source `9e38531`, live `/release.json` SHA256 `afc7f0a2562b0823daf9d73dced3842dda27093325352a098ed2c24bac3de637`, verified 1,133 built files, production homepage+NPC JS HTTP 200, VoiceBank Game300 JS HTTP 200, staging mismatch and successful desktop/mobile recorded WebGL CI (runs 40079153284, 40079153300). IMPORTANT: real hosted-production browser step was SKIPPED, no deployed manual voice click claimed. Updated checkpoint, checked RTD-006 only; documentation-only branch `docs/town-rtd006-live-release-baseline-20261024`; no deployment or gameplay changes.


- 2026-10-24 · ChatGPT — **DONE: RTD-005 PR #165/#166 and Town/VoiceBank audio acceptance reconciliation.** Source [RTD-005 evidence matrix](docs/RTD_005_DIALOGUE_AUDIO_RECONCILIATION_2026-10-24.md). Correctly identifies #165/#166 merged, #164 still open with 20 potentially conflicting clips, current shared six-stage recorded choice UI, ten Game300 voices, 17 global Town audio acceptance tasks with 006 checked and 16 open. Updated 93-item roadmap (RTD-001–005 checked) and WORK_CHECKPOINT, no gameplay or generated-mirror changes. Next RTD-006 current canonical deployment fingerprint/baseline. PR branch `docs/town-rtd005-audio-branch-reconciliation-20261024`.


- 2026-10-24 · ChatGPT — **DONE: RTD-003 after Replit usage exhausted**; published [full cast/worker/house inventory](docs/RTD_003_NPC_CAST_INVENTORY_2026-10-24.md) and [machine-readable 319-key snapshot](docs/NPC_POPULATION_INVENTORY_2026-10-24.json). Corrected stale worker count: current **99** in TownLife, including original 38 stable IDs, with 32 named street characters and 188 unique house aliases. Added `tests/npc-population-inventory.mjs` to CI integration gate, marked RTD-003 only complete and updated WORK_CHECKPOINT. No runtime behaviour or VoiceBank changes, no generated backup edits. Branch `docs/town-rtd003-cast-inventory-20261024`.


- 2026-10-24 · ChatGPT — **DONE: RTD-004 read-only canonical NPC/audio/yarns/game-state/save audit**; [full evidence](docs/RTD_004_DIALOGUE_SYSTEM_AUDIT_2026-10-24.md). Inventoried actual modules and storage/transfer owners; checked RTD-004 only in 93-item roadmap and updated WORK_CHECKPOINT. Reused merged PR #166 as foundation, did not touch any gameplay source, audio assets or Replit's possible RTD-003 inventory. No runtime/playtest/deploy claims. PR branch `docs/town-rtd004-source-audit-20261024`.


- 2026-10-23 · ChatGPT — **SOURCE FIX COMPLETE, RELEASE RECHECK REQUIRED: full nine-file Pages PR #35 drift** on `fix/town-backup-drift-pr35-20261023`. Mirror workflow 39902923390 attempt 2 passed release build, simulator and desktop/mobile Chromium, but stopped safely on `ui/townpanels.js`. Verified all 9 drift paths from compare `392dccb...main`; exact historical blob SHAs are locked in sync guard, with seven full archive copies and two preserved by immutable Git commit/blob. Unknown/mutated files remain blocked. Rerun workflow, compare exact production/Pages `release.json` before declaring deployment.

- 2026-10-23 · ChatGPT — **IMPLEMENTED, local integration verified: legacy Pages backup reconciliation** (`fix/town-backup-reconcile-20261023`, PR #160). Archived three exact public legacy files under `audit/legacy-pages-drift-2026-10-23/`; `tools/sync-backup.mjs` now permits only exact archived copies while rejecting all other unexplained drift. Seven Node/git fixture scenarios passed locally. **Production/Pages publication still pending** GitHub Actions and matching `release.json` fingerprints; do not claim it deployed.
- 2026-10-20 · ChatGPT — **Dot / Vercel AI Cloudflare CORS fixed and deployed**. Root cause: `deploy/cloudflare-ai-worker.js` restricted `Origin` to GitHub Pages, returning 403 for `repository-town-claude-complete.vercel.app`, causing NPC offline fallback. Canonical [PR #90](https://github.com/joshualparris/JoshMemory/pull/90) merged (`81b80ec3`), full Town Integration gate green including `tests/worker-cors.mjs` simulated OPTIONS/POST, evil-origin denial, builds and privacy. Cloudflare Worker `repository-town-no-code-ai` updated using content-only API; verified deployed version `82d940d7-51cd-4341-8400-4e3186cc12c7`, `GROQ_API_KEY`, `IP_LIMIT`, and `GLOBAL_LIMIT` preserved. New allowlist includes verified Claude Complete Vercel origins and prior Pages/Worker origins with per-request CORS. **A real Groq response on the Android device has not yet been independently verified**; if still offline, check provider quota/key validity and worker invocation logs next.\n
- 2026-10-20 · Claude Code — **Power Station interior: a remote-town hybrid diesel–solar–battery station**, branch `ccr-846db548-0l5zmu`. Note: I also built a railway-station Rail Depot but dropped it unmerged, because ChatGPT's claimed freight-house depot (#86) landed first.
  - New `src/world/power-interior.js`, modelled on Lord Howe Island's microgrid (three 300 kW diesel sets, solar, battery, microgrid controller) and Horizon Power's remote towns. It has five rooms:
    - **Control room:** SCADA desk facing a network mimic panel whose lamps follow the live `powerGrid` feeders (red closed, green open or faulted, amber idle); logbook, permit-to-work board and emergency stop.
    - **Switchroom:** a breaker cubicle per `POWER_EDGES` feeder with live lamps, synchronising panel with synchroscope, rubber mat and arc-flash cabinet.
    - **Battery and inverter room:** battery racks, solar inverters, microgrid controller, AC and gas-suppression cylinders.
    - **Engine hall:** three generating sets that show as running according to the live diesel output; radiators, exhaust stacks, gantry crane, a fuel day tank whose gauge follows `power.stock.fuel`, transfer pump and drums.
    - **Corridor** joining the control room to the engine hall.
  - 16 usable things, and the SCADA desk opens the live power panel.
  - `buildCivicInterior(site, makeLabel, life = null)` now takes the town as an optional third argument (passed from `main.js`), so an interior can show live state.
  - Tests: `tests/shop-interiors.mjs` has a shared walkability helper for fire and power, and checks that the mimic panel, generators and day tank follow the live state. `tests/fire-station.mjs` is now `tests/walk-in-buildings.mjs` (fire and power, in `test:browser`).

- 2026-10-20 · Claude Code — **Fire & Rescue station interior**, branch `ccr-846db548-0l5zmu`. It was the one High Street building still falling through to the generic room (no `FITTINGS` entry). New `src/world/fire-interior.js`, researched from recent Fire and Rescue NSW station builds and refits (Ulladulla, Wentworth Falls, Kingscliff, Cessnock) and IAFF "clean firefighter" zoning guidance:
  - **Engine bay:** a twin bay behind the two street roller doors, with the personnel door between them. Bay A has the Class 2 pumper (crew cab, roller-shutter lockers, rear pump panel, hose reels, roof ladders, light bar) on its exhaust-extraction hose and shore power. Bay B has the hazmat trailer, a hose-drying rack, a workbench, extinguishers and the fire danger rating arc sign. There are yellow walkway lines, floor drains, the station-alerting beacon, a first-aid kit and an AED.
  - **Dirty zone:** the PPE and decontamination room (open lockers of gold turnout gear with helmets, the officer's white; washer-extractor, drying cabinet, decon shower, hose-off sink) and the BA room (sets on charge with status lights, compressor and fill cabinet, test bench).
  - **Clean zone:** the watchroom (turnout printer, CAD screen, radio console, pager charging rack, district hydrant map, station board) and the mess and training room (kitchen, urn, fridge, table, training screen, honour board).
  - 19 usable things across 5 rooms. The firefighter on shift now wears navy station wear (`shop-staff.js`).
  - The station board opens the live station panel, which now shows today's **fire danger rating** using the Australian Fire Danger Rating System levels. `fireDanger()` in `household.js` derives it from the season, a per-day warm/cool spell and the weather; windy no longer cools the forecast, because hot inland days come with hot winds.
  - Tests: a fire block in `tests/shop-interiors.mjs` (walkable floor, every hotspot reachable and clear) and `tests/fire-station.mjs` in `test:browser` (walk in, use all 19 items, board shows the rating, walk out).

- 2026-10-20 · Claude Code — **villagers actually live at home; shop queues, prep times, spoilage**, branch `ccr-846db548-0l5zmu`.
  - `src/world/household.js` (new, one owner for home state):
    - Each villager has a larder of dated food batches in the pantry, fridge and freezer. Food spoils; a warm summer pantry spoils faster. A fridge without power for four hours loses its chilled food; a freezer thaws after a day. Meat comes out of the freezer to thaw.
    - Appliances, seasons and outdoor temperature drive reverse-cycle heating and cooling and lights.
    - Power and water are metered and feed the town's hourly demand, replacing the flat home load. A weekly power and water bill arrives by email and is paid at the home computer.
    - Tenure: renters pay the council, buyers repay a Community Bank home loan, retirees own outright. This replaces the flat `npcRent`/`npcPower`.
    - A weekly budget set at the computer steers eating out (soft: nobody skips a meal over it), and each household has an inbox (payslips, bills, notices).
    - Chores: dishes, laundry, mowing, watering, letterbox, showers, TV.
  - `src/world/counter-queue.js` (new): first-come-first-served counter lines served by the staff actually on duty, order-taking time and kitchen prep time with backlog, ticketed café and menu orders for the visitor.
  - `src/world/cold-chain.js` (new): daily perishable losses at shops, and high-street cold rooms that fail after four hours without power.
  - Villager homes (`interior.js`, `props.js`, `main.js`, `townpanels.js`): a kitchen, bathroom and laundry, and living room with 12 usable appliances showing that household's real state. Back yards get a shed and mower, rotary clothesline, vegie patch, sprinkler, AC unit, letterbox and meter box (`townlife.js`).
  - Also fixed:
    - Market Square stroll targets could land on a lamp post (`life.js` `jitter`).
    - Lunchtime grocery runs for people who finish after the shops' staff leave.
    - Evening fallback now checks the shop is staffed, not just open.
  - Tests: `tests/household.mjs` and `tests/household-homes.mjs` (all 188 houses fit a household) are added to `test:town`; `tests/household-browser.mjs` is added to `test:browser`. `cafe-orders.mjs` is updated for tickets.

- 2026-10-20 · Replit — **Explorer's Log**, PR [#81](https://github.com/joshualparris/JoshMemory/pull/81) is open; the Repository Town Integration safety gate passed. Adds the live house-discovery counter, progress panel, next-house shortcut, and focused tests using existing local-save data. **Not merged or deployed.**

- 2026-10-20 · Claude Code — **high-street realism pass**, branch `ccr-846db548-0l5zmu`. Walked the shop street and fixed what looked fake: every shop and civic building now has a painted name board (`src/world/shop-signs.js`, one canvas atlas and one mesh; the clinic's red cross is painted on its sign), glazed shop doors with brass handles and OPEN/CLOSED cards that follow each shop's real hours (faintly lit so they read at night), paved forecourts in place of the grass strip between footpath and shopfronts (the depot's truck bays are left clear), kerbs along both sides of the road, benches and bins between shops, and gate signs for the farms (`src/world/townlife.js`). Benches, bins and sign posts are solid; npc-soak, people, life, shop-e2e, shop-crowd, streetwalk, `test:integration` and the Vercel build command all pass. Not done: shop window displays, parked cars and street trees (they would sit in NPC and truck lanes).
- 2026-10-20 · ChatGPT — **Bicycle and shop crowd fix merged and deployed.** Canonical [PR #64](https://github.com/joshualparris/JoshMemory/pull/64) integrates bakery indoor-worker/customer arrivals; canonical [PR #66](https://github.com/joshualparris/JoshMemory/pull/66), merge `0b4d375`, fixes oriented bicycle wheel clearance, safe road-edge cycling routes and dismounts, floating wheels and pedalling animation. Superseded conflicting PR #65 closed. Public [PR #11](https://github.com/Parris-Tech-Services/Repository-town/pull/11), merge `5e18e78`, deployed with [Pages workflow green](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/39346536096). Public collision and economy regressions pass; all four affected runtime file blobs match canonical. The user's six-second video showed bicycles intersecting lamp posts and pavement pedestrians; browser/device visual retest remains unverified.\n- 2026-10-20 · ChatGPT — **Bakery/high-street pedestrian crowd fix merged and published to Pages source.** Canonical PR [#64](https://github.com/joshualparris/JoshMemory/pull/64) merged at `63e9b0d8`; full Town safety gate green (NPC/economy, geometry, build, privacy, games). Public Pages PR [#10](https://github.com/Parris-Tech-Services/Repository-town/pull/10) merged at `9ef5ff12`; economy, exits and NPC collision/passing regressions green. `world/life.js` in Pages is byte-identical to canonical source: indoor shop staff/customers no longer linger on footpaths, separated storefront waiting slots, pedestrian collision map enforced; published `main.js` bicycle collision radii match. Awaiting direct browser/ProBook FPS and video repeat confirmation.\n- 2026-10-20 · ChatGPT — **NPC spacing and anticipatory passing LIVE**. Canonical [PR #58](https://github.com/joshualparris/JoshMemory/pull/58) merged as `f4956e5`, after full integration, 14-day town economy, build and privacy checks passed. Public Pages [PR #7](https://github.com/Parris-Tech-Services/Repository-town/pull/7) merged as `0ba7ae6`. Previously the live game lacked `world/pedestrian-spacing.js` and its wiring in `main.js` and `life.js`; those three files now match source exactly. Added anticipatory sidestepping to make oncoming cyclists and pedestrians pass, and checks for forward progress, lane/sidewalk safety, walls, mixed named/ordinary crowds and economic regressions. Browser/device visual retest is still required; do not confuse these collision improvements with an exhaustive world-scale pathfinding implementation.
- 2026-10-20 · ChatGPT — **Wall-safe 3D labels MERGED & DEPLOYED**. Canonical source [PR #55](https://github.com/joshualparris/JoshMemory/pull/55), merge `bee01f1`; public build [PR #6](https://github.com/Parris-Tech-Services/Repository-town/pull/6), merge `0b34584` and successful GitHub Pages deployment [run 39339869436](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/39339869436). Removed forced depthTest=false on interior labels, kept whole billboards within room boundaries, capped sign width and moved bank/Town Hall exterior labels forward of porticos. `tests/labels-geometry.mjs` runs in mandatory `test:town`; full source integration, build and privacy checks passed. All five public runtime file blob SHAs match source. Hands-on Android visual confirmation remains pending.
- 2026-10-20 · ChatGPT — **building exits now face away from doorways**. Public hotfix [site PR #3](https://github.com/Parris-Tech-Services/Repository-town/pull/3) merged and Pages deployment succeeded; canonical source [PR #49](https://github.com/joshualparris/JoshMemory/pull/49) merged as `20397c2` after the entire Town safety gate passed. North-side shop exits now face +z (yaw π), south-side Foundry/farm exits face -z (yaw 0); collision/re-entry protections retained. New regression tests in `src/tests/building-exits.mjs` are included in `npm run test:town`, and the obsolete Foundry yaw expectation was corrected in `tests/traffic-and-shop-exits.mjs`. Real device playthrough still to confirm visual feel.\n- 2026-10-20 · ChatGPT (food, hunger, rest and hotel) — MERGED in PR #43 (`e79c06ea9f961ec0977fdc60ee72b44ab952a045`). `src/world/needs.js` adds persisted player hunger/fatigue, food consumption and paid hotel sleeping; villagers gain fatigue while awake and recover it during actual at-home sleeping. `src/world/interior.js` ensures **188/188** household designs have sleepable beds (184 added via attached bedroom). `src/world/hotel-interior.js` and `src/world/townlife.js` place the south I8 Railway Hotel with four different bedrooms. Hotel bookings cost $24 from real wallet, save and survive reload; sleeps advance regular town ticks. UI `src/main.js`, `src/ui/townpanels.js`, `src/index.html`, `src/styles.css` shows persistent hunger/fatigue and hotel rest interactions. Acceptance `tests/hunger-sleep-hotel.mjs` plus 28-day economy, four-day traffic, privacy and 188 entrance checks passed on Render. **Preserve the existing farmhouse, council, collision and political life modules.** Mobile hands-on QA still pending.

- 2026-10-20 · ChatGPT (global doorway/yard collision fix) — **MERGED** via PR #42, main commit `671ca6cbc4f325ee5408c76ec677bb9b949bb66a`. New `src/world/exterior-collision.js` carves actual passable gaps in solid building AABBs, places exterior props/vehicles in collision-free slots, reserves door access and street footpaths; wired through `src/world/town.js` and `src/world/exterior.js`. Tested **188 real house entrances, E7 NextJS-Expert blue van, 683 yard objects (zero overlaps, zero omitted), 188 reachable exits to street (zero failures), 28-day economy and transport simulation, farmhouse, councillors, and public-data privacy scan**. Integrated against newer main before merge; don't reinstate single solid building collider or allow yard objects to sit across door aprons. Test `npm run test:town` includes `tests/exterior-collisions.mjs` and `tests/town-exit.mjs`.


- 2026-10-19 · ChatGPT (government upgrade) — **MERGED to main** via PR #38, commit `c4e2179216b873eada7879ac8836e13a53bb61ff`. New canonical `src/world/government.js` adds resident elections, five named real-NPC councillors and GM, persisted meeting votes, public budgets and crew-based repaired infrastructure with actual NPC travel, material costs, inspections, completion and feeder-event history. `src/world/life.js`, `src/ui/townpanels.js`, `tests/government.mjs` integrated without overwriting latest truck collision/house fixes. Verified full economy/power/government/civic/farmhouse tests, 4-day traffic stress **zero overlaps and deadlocks**, public privacy scanner, Render main QA is live. See `docs/GOVERNMENT_IMPLEMENTATION_STATUS_2026-10-19.md` for evidence and outstanding planning/procurement/construction realism. **Do not reintroduce instant council repairs or random fake ballots.**


- 2026-10-19 · ChatGPT connector — **X7 / 87 tall buildings stair-and-lift upgrade MERGED & DEPLOYED**. Source PR [#32](https://github.com/joshualparris/JoshMemory/pull/32), merge `725bff72`. Public Pages commit [`42b82e9`](https://github.com/Parris-Tech-Services/Repository-town/commit/42b82e9cc356816724eed728dd1f27e92d920893), [successful deployment 39235581217](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/39235581217). 16 styles/87 buildings get architectural upper floors and interactive lifts/stairs. X7 has special transfer and beacon levels; a foyer sign and visible tap-to-open floor selector fix discovery. Static JS checks and 87/87 actual-house geometry builds passed. **Real Android walkthrough still needed**. Do not overwrite these source-first changes in future publishing.

- 2026-10-19 · ChatGPT — fixed Living Town NPC present-location awareness on the public-site source (`ui/npc-location.js`, `ui/npc.js`, `ui/townpanels.js`). Arlo's home H1 and Market Garden work location are separately grounded in simulation data; direct questions use deterministic answers. Cloudflare live AI prompt now combines current-location rules with the existing social/personality rules; worker secret and rate limits retained. Regression test `tests/npc-location.mjs` passes. Added the pure location helper, prompt source and ported test to canonical JoshMemory; full Living Town source reconciliation remains separate (do not overwrite current `src/main.js`).

- 2026-10-19 · ChatGPT GitHub connector — **V7/W7 three-storey interiors MERGED and Pages PUBLISHED**. Source PR [#30](https://github.com/joshualparris/JoshMemory/pull/30) merged at `14838688`; public site updated at `2a19860`, with successful Pages deployment run `39232948450`. Unique floors 2/3, spiral stair E/✋ transitions, floor-selectable lifts, height-adjusted camera and floor badge. Public geometry-construction tests of V7 and W7 passed, as did static syntax and contract checks. **Not yet verified:** real-device Android/desktop gameplay, full Town build and privacy CI. See `docs/MULTI_FLOOR_INTERIORS_2026-10-19.md`. Keep future changes mirrored source-first; DO NOT blindly overwrite new Pages work.


- 2026-10-19 · ChatGPT — unified `integration/town-unified-20261019`: richer single-source TownLife and Claude branches #9/#16/#17/#18 reconciled onto latest `main`; Vercel quota exceeded; Cloudflare Pages Git integration unavailable. Full Github Actions Playwright run 39229344740 succeeded: build 188 houses, public privacy, 14 stable days, NPC/utility/merchant/driver checks, desktop/mobile A1/F3/H1/M5/Y5, arcade and 76/76 packed game loads. Temporary QA workflow removed. Exact unified build not yet deployed; preserve published-only NPC location fixes until separately ported and verified.

- 2026-10-19 · ChatGPT — repaired live NPC whereabouts in published Repository-town `ui/npc.js` and `ui/townpanels.js`. Villagers now send an observed `currentLocation` separate from home/work, answer location questions without guessing, and display where they stand in chat. Cloudflare `repository-town-no-code-ai` prompt updated in place with existing key/rate-limit bindings retained; canonical shared helper now at `src/ui/npc-location.js` and deployed prompt at `deploy/npc-prompt.js`. Run `node tests/npc-location.mjs`. **Integration note:** canonical `src/main.js` uses different NPC architecture, so do not overwrite the published `ui/npc.js` without porting this world-state wiring to the Living Town integration.

- 2026-10-19 · Claude Code session ("Repository search") — **merged every town branch** into
  the integration branch, one at a time with tests: `main`, #18 (contains #17, #11's NPC work,
  #13, keyboard fix), #16 scene awareness, label occlusion, #13 CI smoke, #11, merged-playtest,
  #19 living town. **#19's simulator is folded into `src/world/life.js`** so there is one
  economy: power (solar by weather + fuel), water, wastewater, rubbish/recycling, foundry,
  imports/exports, treasury with sales tax, rates, grants and business rates, wages paid from
  real tills, bank, mayoral elections, council repairs, visitor bag (buy, sell back, eat),
  letters. Its civic sites sit on the south side of street 8 (G, H, J, L, N, P, Q, R) facing the
  high street; `src/simulation/*` is retired. Test: `tests/town-simulation.mjs` (Node).

- 2026-10-19 · Claude Code session ("Repository search") — **ported the live site's direct
  commits into `src/`** (site repo `a201b9d`…`5ee6c7f`): Cloudflare AI chat proxy (`ui/npc.js`,
  `ui/npc-chat.js`, `ui/npc-prompt.js`, `ui/npc-data.js`), 32 named street characters and
  worksites (`world/npcs.js` `placeTownNPCs`/`animateNPCs`), social sim (`ui/social.js`, now
  sharing `VILLAGER_NAMES` with `world/life.js`), toys, HUD collapse, mouse capture, Smooth
  mode, label occlusion, arcade/NPC lounge pages. One owner per job: sky/day–night, window
  glow and lamps stay in `townlife.js`/`town.js` (the T key and time button now jump the
  town clock); sound is `ui/ambience.js` (footsteps/door/relic folded in, `ui/sound.js`
  retired); the guide kiosk opens the town-life guide panel and Rowan is its chat; residents
  use `houseWander` (meals) with the room tracking from the site. **Not ported: the commit
  that showed private repository names on the public site** — the build stays sanitised
  until Josh confirms; ask him before changing `tools/lib.mjs` `sanitise`.

- 2026-10-19 · Claude Code session ("Repository search") — **town simulator**: `src/world/life.js`
  (clock: 72-minute days; farms → trucks → mill/bakery/shops → villagers buy, cook, eat; 32
  villagers with jobs, wallets, pantries and meals; freight train; postie and parcels),
  `src/world/townlife.js` (high street and farms on the empty lots G8–Z8, fields, livestock,
  tractor, windmill, trucks that brake for you, bikes, day–night sky, stars, lit windows and
  street lamps), `src/ui/townpanels.js` (shop counters, farms, Town Ledger, Wren the Town
  Guide near the start, gossip and relic hints for chat), `src/ui/ambience.js` (sound),
  residents walk between rooms and cook at mealtimes (`npcs.js` `houseWander`). The old
  `townRoutes` villagers are gone. Test: `tests/life.mjs`. Sim state saves under
  `repository-town.life.v1`. **Row 8 lots G–Z are now taken by town buildings.**

- 2026-10-19 · Claude Code (local CLI, worktree `~/dev/rt-claude`, branch
  `town-label-occlusion-20261019`) — **interior labels no longer clip into walls and doors**
  (Josh's L5 screenshot). Interior label sprites now draw without depth test and are hidden by
  a cheap line-of-sight check against walls, lintels and closed doors (`labelVisible()` in
  `src/world/interior.js`, used in `src/main.js`'s house loop); wall-prop labels sit 0.6 m out
  from the wall. Town house signs are unchanged (still depth-tested). Known, pre-existing:
  labels of side-by-side wall props can overlap each other.
  **Hot-fixed onto the live site** (`Parris-Tech-Services/Repository-town` commit `a201b9d`)
  as a patch to `main.js` and `world/interior.js` only, because the live site is ahead of
  `main` (villager personalities, social simulation, house names pushed straight there on
  2026-10-19 16:4x and not yet in `src/`). Whoever ports those into `src/` should keep this
  label change, and nobody should publish a plain `main` build over the site until then.
- 2026-10-19 · ChatGPT (GitHub connector) — Living Town simulation prototype on `feat/living-town-simulation-20261019`: 20 vacant street-8 civic sites, trucks/lamps, 24-minute day/night, deterministic utilities + farm/mill/bakery/market/foundry/recycling/post/economy, visitor trading, council repairs/voting, persistent Ledger. Pure JS parse checks and `tests/town-simulation.mjs` assertions executed in an isolated JS evaluator; 90-town-day stock stress check completed (no negative stocks). **Not yet verified:** full npm build, privacy gate, desktop/Android browser visual playtest or deployed public site. Integrate after PR review and run those gates; do not overwrite other active branches.
- 2026-10-19 · Claude Code (local CLI, `~/dev/rt-claude`) — full 188-house playtest of `main`
  headless on the real Intel UHD 630 GPU, desktop + phone. Two real bugs found and fixed, both
  in open PRs: **#14** (arcade discovery + phone house card blocked the joystick at every door)
  and **#15** (resident beside an exhibit stole E/✋; one block in `src/main.js`). With both
  merged, 188/188 houses pass on desktop and phone. Suggested order: #14, then #15, then #13.
- 2026-10-19 · ChatGPT — scene-grounded local resident replies in separate `fix/town-npc-scene-awareness-20261019` branch, based on PR #11; edits `src/ui/scene-awareness.js`, `src/world/interior.js`, `src/main.js`, `src/ui/npc.js`, `src/ui/npc-prompt.js`, tests. No changes to PR #11 or production yet.
- 2026-10-19 · Claude Code (local CLI on Josh's PC, worktree `~/dev/rt-claude`, branch
  `town-claude-playtest-20261019`) — **desktop playtest on a real GPU** (Intel UHD 630,
  headed Chromium) of `main` and integration branches, with findings posted below; and
  **arcade library discovery** (`src/arcade.html/js/css` only: featured picks, ratings,
  recently played). Not touching `main.js`, `npcs.js`, `npc*.js`, `adventure/`, `tools/`,
  `briefs/` or `data/games.json`. Note: Codex (`codex --yolo`) is now working in
  `~/dev/rt-improve` on branch `repository-town-improvements-20261019`; that branch and
  PR joshualparris/JoshMemory#11 are Codex's to finish, I've stepped back from them.
  Game-repo fixes already open as PRs: JoshHub#9 (classic-dnd-text, tile-game map),
  Parris-Tech-Services/Aetheria#1 (Linux build, static mode).
- 2026-10-19 · ChatGPT — adapting Claude's `tests/streetwalk.mjs` on `repository-town-claude-tests-integration-20261019`, then integrating complementary NPC tests and gameplay without replacing canonical game. Ported collision test with corrected local port/row validation; ported privacy-safe, house-aware offline NPC replies and added node assertion test. Full runtime validation still pending.
- 2026-10-19 · ChatGPT — reconciling Claude's separate branch via `repository-town-safe-integration-20261019`. `main` already includes Expedition Guild and newer NPC models. Do not blindly copy Claude `src/main.js`, `src/world/npcs.js`, or `src/ui/npc.js` over main; port specific behaviours with tests.
- 2026-10-19 · ChatGPT GitHub connector — separate playtest branch `repository-town-merged-playtest-20261019` deployed to Render `https://repository-town-npc-playtest.onrender.com`; 32 NPCs, wandering, worksite inventory/build prototype, roof replacements and collision-aware wandering.
- 2026-10-19 · ChatGPT (code-free NPC AI) — Cloudflare Worker `repository-town-no-code-ai.parris-neathaustralia.workers.dev` replaces the Vercel AI backend for the *public game*. No player access codes. Worker code in `deploy/cloudflare-ai-worker.js`, uploads `src/ui/npc-data.js` and `src/ui/npc-prompt.js` as modules, and holds existing Groq key as an encrypted Worker secret. Rate-limit bindings IP_LIMIT (5/min/client per edge) and GLOBAL_LIMIT (4/min/edge); daily best-effort isolate cap. GitHub Pages public build hotfixed: `ui/npc-chat.js`, `ui/npc.js`, `index.html`, `people.html`; source changes in PR #18. Existing Vercel backend remains untouched and code-gated but is no longer used by the public site. Important: public `ui/npc.js` has extra social gameplay imports absent from this branch's `src/ui/npc.js`; preserve live functionality in eventual source reconciliation. Local mocked Worker tests pass, live Groq response not independently verified.
- 2026-10-19 · ChatGPT (GitHub Pages live-AI bridge) — Updated both `src/ui/npc-chat.js` and `src/ui/npc.js` to send PIN-protected AI requests to Cloudflare Worker `repository-town-ai-bridge.parris-neathaustralia.workers.dev/api/npc-chat` from static GitHub Pages. Worker source is `deploy/pages-npc-proxy.js`; it allows the exact Pages origin, supports CORS preflight, rate-limits attempts best-effort, strips cookies/Origin and forwards the existing `x-npc-code` to Vercel where GROQ_API_KEY and TOWN_NPC_PIN remain server-side. Enabled Worker on workers.dev. Vercel `repository-town-claude-playtest` SSO set to `preview` (production endpoint accessible, still requires PIN). Matching public hotfixes applied to `Parris-Tech-Services/Repository-town` generated `ui/npc-chat.js` and `ui/npc.js` (plus prior `npc.css`). Backend `api/npc-chat.js` CORS change committed to hosting branch but **NOT DEPLOYED**: Vercel 402 daily deployment cap, so the Cloudflare bridge targets the existing published backend. Backend isolated-handler mock tests passed for allowed origin, preflight, bad PIN and good PIN; real remote Groq response **not verified**. Preserve this bridge and source changes during next build/publish. Source PR #17.
## Done recently

- 2026-10-19 · Codex — added a local-first village social simulation: seeded friend, enemy and
  neutral relationships; gossip and friendship UI; persistent player trust; relationship changes
  from praise, insults and completed errands; and social context for live AI prompts. Tests,
  build, privacy and 188-house validation passed. Published at Pages commit `e26fbfb`; workflow
  `39206698049` completed successfully.
- 2026-10-19 · Codex — expanded all 24 street villagers with distinct offline and live-AI
  personalities, including Sadie as a curious book-and-building collector. Added the NPC
  personality contract test; build, privacy and house checks passed. Published to
  `Parris-Tech-Services/Repository-town` at `5d1f749`; Pages run `39206341200` succeeded.
- 2026-10-19 · Codex — with Josh's explicit approval, public house labels and search now show
  private repository names while private URLs, READMEs, summaries, room names and exhibit text
  remain redacted. Published to `Parris-Tech-Services/Repository-town` at `fe44bef`; Pages run
  `39206068937` completed successfully. Restored `src/tests/expedition.mjs` so the live acceptance
  test is preserved by future generated publishes.
- 2026-10-19 · Antigravity (`~/dev/rt-improve`, branch `repository-town-improvements-20261019`) — finished Claude's upgrade round and reconciled all active branches (`origin/main`, `origin/ccr-846db548-0l5zmu`, `origin/fix/npc-chat-android-keyboard-20261019`, `origin/repository-town-claude-tests-integration-20261019`, `origin/town-claude-playtest-20261019`):
  - Researched & redesigned all 17 previously unreachable houses (`A1`, `D1`, `E1`, `C2`, `D2`, `N2`, `T2`, `W2`, `X2`, `Z2`, `A3`, `B3`, `D3`, `E3`, `I3`, `M3`, `R6`) from their real GitHub repositories (`188/188` readable in `data/repo-data.json`, `0` unreachable) and added `tools/refresh_data.mjs`.
  - Fixed & packed 8 additional playable games (total **65/65** packed games passing `tests/games.mjs`): `aetheria`, `hub-classic-dnd-text`, `hub-newgame` (Dark Realms), `hub-tile-game`, `hub-aa-game-adventure`, `bramblewick` (Godot 4.4.1 web export; `games/bramblewick/index.wasm.gz` tracked in Git and auto-decompressed by `tools/build.mjs`), `rothfuss-kkc-adventure` (browser SQLite shim for `/api/init` & `/api/command`), `serenity-keep-flying`, and `multi-layer-zoom-game`, plus fixed `hub-boundary-road` (`three@0.105.2` + inline SVG fallback) and `pld-wilds-sail-west` (`<script type="py">`).
  - Switched `src/ui/npc.js` and `src/ui/npc-chat.js` to the server-side `/api/npc-chat` proxy (`api/npc-chat.js`, gated by `x-npc-code` from `sessionStorage.getItem('town-npc-code')`) and purged any legacy `repository-town.groq-keys` from `localStorage`.
  - Connected villagers & indoor residents to Expedition Guild relic hints, same-street neighbour gossip, and small errands (`src/ui/npc.js`, `src/adventure/expedition.js`), added multi-room indoor doorway traversal (`roomWander`), day/dusk/night atmosphere + window/lamp lights + procedural WebAudio (`src/ui/sound.js`) + Town Guide kiosk, and phone distance culling (`#btn-perf`).
  - Applied mobile `visualViewport` & compact typing mode (`npc-typing` / `chat-typing`) across both `#npc-chat` (`src/ui/npc-chat.js`, `src/npc.css`) and `#panel .chat` (`src/ui/npc.js`, `src/styles.css`), scoping `#panel.chat-typing` to `@media (max-width: 700px)` and deferring blur cleanup so desktop `#panel-close` clicks never miss due to synchronous layout shifts.
- 2026-10-19 · ChatGPT (mobile NPC keyboard repair) — `src/ui/npc-chat.js`, `src/npc.css`, `tests/npc-viewport.mjs`; isolated chat/visualViewport and lounge compact-mode changes. See PR for review and mobile-device confirmation.
- 2026-10-19 · ChatGPT (mobile NPC keyboard repair) — `src/ui/npc-chat.js`, `src/npc.css`, `tests/npc-viewport.mjs`; isolated chat/visualViewport and lounge compact-mode changes. See branch `fix/npc-chat-android-keyboard-20261019` for review and mobile-device confirmation.
- 2026-10-19 · Claude Code session (claude.ai/code, "Repository search") — villagers
  walk the town (`src/world/npcs.js`), residents wander indoors, more natural chat
  (`src/ui/npc.js`), Mouse look option, house signs moved clear of colonnades.
- 2026-10-19 · Claude Code session — ported the Expedition Guild (relics, Quest Journal,
  compass, `tests/expedition.mjs`) from the live site repo into `src/adventure/` so
  builds keep it. **Thank you — and please make future changes in `src/` here.**
- 2026-10-18 · other session — AA Game Adventure conflict fix + packer guard against
  merge markers (`tools/pack_games.mjs`), `tests/game-integrity.mjs`, Vercel check.

## Notes and questions for other sessions

- **Vercel production deploys and commit authors.** The town's Vercel project
  (`repository-town-claude-complete`, production from `main`) is on a Hobby team. While JoshMemory was
  private, Vercel blocked any production build whose latest `main` commit came from an account outside
  the team. Merges through the `joshuaparris-max` GitHub connector (PRs #78's `c9b8d4b`, #83, #85, #87)
  were blocked; merges by `joshualparris` deployed. Josh made the repository public on 2026-10-20, and
  Hobby allows other authors on public repositories. If production stops updating after a merge, check the
  Vercel deployment list for "Blocked" before assuming the build failed.

- **Playtest findings 2026-10-19 (Claude CLI, real GPU, headless):**
  - FPS: ~55–60 at spawn on the Intel UHD 630, 164 draw calls, ~89k triangles. Phone emulation also ~60.
  - **Phones (fixed in #14):** the house card sits over the left-thumb joystick right at the
    door, so touches hit the card and players stop short. 0/188 phone door entries worked on `main`.
  - **Residents (fixed in #15):** inside a house a resident within 1.9 m won E/✋ over a closer,
    faced exhibit, and on phones the chat then covered ✋ for every exhibit after it. 15 houses
    were affected (G1 K1 Q1 R1 E2 R2 W2 X2 Q3 S4 W4 C5 V6 E7 T7). Owners of `main.js`: the fix is
    small; please keep the "face the resident to talk" behaviour if you change that block.
  - **Tests:** adventure exhibits prefix panel titles with emoji; `tests/e2e.mjs` now ignores
    leading symbols (in #14). Under SwiftShader e2e is too slow and gives false failures; use
    headless Chromium with `--use-gl=angle --use-angle=gl --ignore-gpu-blocklist` on a real GPU.
- To the session that built the Expedition Guild: it now lives in
  `repository-town/src/adventure/` and in this branch. If you change it again, please
  edit it here and publish from a build, so neither of us overwrites the other.
- Open ideas nobody has claimed yet: villagers offering relic hints; a town guide near
  the spawn; real-device testing notes from Josh.

## 2026-10-19 — merge sweep onto main (Claude, branch ccr-846db548-0l5zmu)
- Merged into `main` (bdd1047), each with build, privacy check and test suites: walk-in shops and
  multi-floor houses, farmhouse restoration, power network/traffic, realism truck model, elected
  council, government audit. Fixed: south-side shop exit, walk-out after changing floors (exit-zone
  cooldown overshoot), e2e treating stairs/lift as exhibits, shop-e2e expecting a counter in the farmhouse.
- **Publishing is blocked:** the site repo `Parris-Tech-Services/Repository-town` has a finite-money
  economy merged straight into the generated output (its PR #1: `world/money.js`, `ui/economy-panels.js`,
  `world/bakery-interior.js`, `world/bakery-production.js`, `ui/bakery-panel.js`, ~30 commits), built
  on an older build without the civic wallet/bank in `life.js`. It must be ported into `src/` and
  reconciled with `life.civic.player` (one money owner) before `publish_pages.sh` will run.
- Known intermittent: `life.mjs` "no villager inside a building" can catch a villager brushing a
  newly solid lamp or bench (about 1 run in 5); villager paths don't avoid the realism props yet.
- Login-gated private layer: plan and prompt in `docs/SUPABASE_PRIVATE_LAYER_PROMPT.md` (needs a
  new Supabase project; the free plan's two active slots are in use).

## 2026-10-20 — simulation playtest and fixes (Claude, branch ccr-846db548-0l5zmu)
- New `tests/simulation-soak.mjs` (in `npm run test:town`): 28 simulated days, 38 checks: every shop
  counter, sold-out/closed/broke refusals, sales tax, bank, money conservation to the dollar (grant,
  outside income, exports, imports, repair bills), elections, council motions, work orders, feeder
  fault and repair, a fuel crisis and its power → water/wastewater cascade, meals, deliveries, mood,
  and job cover through six changes of mayor. `--seed n` for other towns.
- Fixed: pies baked without limit (150+ unsold) and burned the town's veg; bread capped at 30 and
  gone by mid-afternoon; General Store showed only 4 of its 6 goods; electing a worker as mayor left
  their job empty (Arlo the only gardener → no veg; Sadie a driver → fewer deliveries) — the council
  clerk now stands in; the council never maintained services unless the visitor complained — the
  General Manager now lodges work orders (priority service kept above 80%, others above 60%);
  elections returned identical results every week — leanings shift per election and the mayor
  answers for the town's mood and their own priority; egg/veg shortfall and unbounded fruit/flour piles.

## 2026-10-20 — windows onto the living town (Claude, branch ccr-846db548-0l5zmu)
- Every building has real windows: house rooms on every storey (2,833 across 188 houses and 111 upper
  floors, placed in outside wall the furniture leaves free), shop display and side windows, farmhouse glass.
- Indoors, `src/main.js renderFrame` draws the town first from the matching spot in the street
  (`src/world/windows.js townView`), then the rooms on top, so the street shows through windows and the
  open front door — only when one is in view. `townLife.update({ view })` keeps villagers, trucks,
  weather and sky moving around that spot. Civic buildings are now one mesh each (hidden from inside).
- `tests/windows.mjs`: windows on every X7 floor, villagers moving outside while you're in, day/night
  through the glass, Bakery windows. The Bakery and Bank interiors share the windowed shell (`interior-kit.js highStreetShell`). Screenshots in `docs/screenshots/window-*.png`.
## 2026-10-20 — Community Bank interior (Claude, branch feat/bank-interior-20261020)
- `src/world/bank-interior.js`: researched banking hall — roped queue lane, three-window teller counter
  with acrylic screens (one staffed, two closed), glass loans office, two advice desks, waiting lounge,
  two ATMs, round vault door, safe-deposit wall, back office. Six hotspots (`bank:counter` opens the
  ledger panel). Teller stands behind the counter via `interior.staff` (shop-staff.js honours it).
- New `src/world/interior-kit.js`: shared 14×18 m shell + helpers (`createKit`, `ROOM`) for the next
  dedicated shop interiors (café, pub, post office…). The bakery was not migrated to it.
- `tests/shop-interiors.mjs` has a bank branch (hotspots clear of colliders, staff behind counter, 2 rope colliders).

## 2026-10-20 — bank loans, interest and journal on main's economy (Claude, branch feat/economy-loans-bills-20261020)
- ChatGPT's live-site economy was never in source; verbatim copy kept on branch `archive/chatgpt-economy-live-20261020` (not built).
  It is a different money model (TownMoney/TownFinance) and was NOT merged. Josh chose to keep main's economy and port features.
- Ported so far: Community Bank credit (`src/world/credit.js`): $1,500 lending pool, loans $100/$200/$400 after the visitor has
  earned money, one loan at a time, 1%/day simple interest (2% overdue, 14-day term), repay (interest first), bank journal.
  Panel buttons in `ui/townpanels.js`; `tests/credit.mjs` in `npm run test:town`; soak money total now includes the pool.
- Also ported (same branch family): `src/world/finance.js` — finite Commonwealth ($40k) and NSW ($25k) treasuries, daily grants to council
  from them (replacing the old free $900), 10% PAYG on wages, NSW pays school/clinic payroll, wage arrears, villager rate arrears,
  visitor rent $8 + power $2 per day from day 2 (arrears block loans; `life.payBills()`), business utilities $3/day, a bounded journal,
  `ui/economy-panels.js` Town accounts (Town Ledger and bank counter), bakery supervised batch (`bakery-production.js`,
  `ui/bakery-panel.js`, hotspot `bakery:kitchen`). Soak money total counts the treasuries and the lending pool. `tests/finance.mjs`.
- Also ported: paid job board and wallet (`src/world/jobs.js`, `ui/economy-panels.js`, HUD "💳 Wallet"): six shifts, done inside the
  workplace with staff on duty (`life.playerAt` is set by main.js), duties five minutes apart, till then council pays, 10% PAYG,
  two shifts a day, receipts, `tests/jobs.mjs`. "Work a shift here" is on each workplace counter panel.
- Deliberately NOT ported: ChatGPT's cash-vs-card toggle and its three-account player model (main keeps wallet + savings), 3D work
  stations (duties are panel buttons), and its player energy/food (main already has hunger and sleep in needs.js).
- The verbatim original stays on branch `archive/chatgpt-economy-live-20261020`.

## 2026-10-20 — Claude: economy rebalancing and researched Store, Café and Pub interiors
- `finance.js`: grants are now needs-based (Commonwealth/NSW top the council up to a $6,000 reserve; GST top-up federal→state), villager households pay rent/power ($10/day) with capped `housingArrears`, PAYG is 15%. Long soak: council ~$6.5k, NSW ~$15k, villager savings no longer grow without bound.
- New dedicated interiors built on `interior-kit.js`: `store-interior.js` (stock-driven shelves, gondolas, chillers, produce table, full-width counter), `cafe-interior.js` (espresso counter, pastry cabinet, tables, bench), `pub-interior.js` (bar, taps, bistro, lounge, pool). Dispatched in `shop-interior.js`; `tests/shop-interiors.mjs` has a branch for them (hotspots clear, staff behind counter).
- Verified: `npm run test:town`, `tests/shop-e2e.mjs`, `tests/exit-stuck.mjs --shops` for store/cafe/pub.
- Exits: the civic exit-direction fix landed in #49 (`shop-exit.js`, `src/tests/building-exits.mjs`);
  `tests/exit-facing.mjs` (in `test:town`) checks it end to end in the browser — walking out and the
  Exit button — for a north and a south building and a house. `tests/life.mjs` closes a display panel
  opened near a shop's door before using the counter (new General Store layout).
- 2026-10-20 · Claude — ported `feat/town-snapshot-integrity-20261019` onto main's save format (not a textual merge): `TownLife.snapshot()` now adds `seed`, `rngState` and an optional `sim` block (villager positions/routes/needs, trucks, parcels, events, stats) on top of the existing `saveVersion:2` tuples; `restore()` validates first, returns true/false and changes nothing on a bad or future save; `townlife.js` keeps a rejected save in storage instead of overwriting it. Old saves without `sim` still load. Test: determinism check in `tests/town-simulation.mjs`.

- 2026-10-20 · Claude — doors keep the player's facing: `enter`/`enterShop`/`leave` in `src/main.js` take `keepFacing` (used by the walk-through door sensors), so backing out of a building no longer spins the view 180°. Buttons/teleports still face outward. South-side shops add a half turn (`doorTurn`). Test: `node tests/door-facing.mjs` (needs the static server on :8091).

- 2026-10-20 · Claude — researched interiors for the Post Office (`post-interior.js`), Clinic (`clinic-interior.js`) and Town Hall (`hall-interior.js`: public counter, council meeting room with dais and gallery, ballot box). Same kit, test branch and staff behaviour as the bank/store/café/pub. Note: the earlier door-facing commit briefly broke `src/tests/building-exits.mjs` (a source-text check on the house exit line); fixed by keeping `player.place(…,Math.PI)` and applying `keepFacing` after it.

## 2026-10-20 — NPC playtest and fixes (Claude, branch ccr-846db548-0l5zmu)
- New `tests/npc-soak.mjs` (browser, in `npm run test:browser`): a full simulated day in the real
  collision world, every villager every 10 town minutes, plus all 32 street characters.
- Fixed: villagers froze for good beside a street character who stepped up next to them (e.g. Spark
  on the footpath): the A* detour treated every step away as "too close" (`pedestrian-navigation.js`;
  regression in `tests/pedestrian-navigation.mjs`). Also on main before this.
- Fixed: villagers walked through buildings and yards (~8 a day on main): avenue walking lanes moved
  to the kerb edge, keeping left (±3.6 m); fixed obstacles on a route (sheds, bins, lamps) now get the
  same bounded A* detour; avenue-side lots keep yard objects off the avenue kerb (`town.js
  yardLimitsFor`, checked in `tests/exterior-collisions.mjs`). A few brief contacts a day remain with
  the goods-display crates where shoppers queue at shop fronts.
- `tests/people.mjs` follows #60's design: nearby villagers keep going; opening a chat stops them.
- Browser tests are not in `test:town`: the CI gate has no Chromium (the gate failed on PR #68).
- 2026-10-20 · Claude — real furniture models: KayKit "Furniture Bits" (CC0, Kay Lousberg) in `src/assets/furniture/` with `vendor/GLTFLoader.js`. `src/world/furniture.js` loads them in the browser (non-blocking from `main.js`), bakes the colour atlas into vertex colours and exposes `modelGeometry`; `Builder.model()` merges them into a house's single mesh and `kit.model()` places them in civic interiors. House props `bed`, `sofa`, `chair`, `table`, `cabinet` and the café, pub, clinic and hall chairs/sofas now use models, each falling back to the old box furniture when models are not loaded (Node tests never load them). Test: `node tests/furniture.mjs`. More models can be added to `FURNITURE` and used with `b.model(name, x, y, z, ry, {w,h,d})`.

## Decor pass (Claude, 2026-10-20)
- Houses: rugs (4 KayKit variants), standing lamp, cactus plants, decorated shelves now use the CC0 models in `props.js`; box fallbacks kept (node tests/mock builders have no `b.model`).
- Interiors: framed pictures on walls via `interior.js` (5 frame models, box fallback); pub/café/clinic/hall/post got frames, lamps and cacti. Hotspots/colliders unchanged.
- The Wheat Farm's second silo stood on the easternmost avenue (x 312) and blocked it end-to-end
  (`tests/streetwalk.mjs`); both silos now stand behind the shed.
## Greengrocer, butcher, school/library and farm sheds (Claude, 2026-10-20)
- New dedicated interiors on the kit: `grocer-interior.js`, `butcher-interior.js`, `school-interior.js`, `farm-interior.js` (one builder, six variants: sheep, dairy, coop, orchard, garden, silo). Dispatch is in `shop-interior.js`; `tests/shop-interiors.mjs` covers them (>250 objects, staff behind counter, hotspots clear of colliders).
- Each keeps one `civic-ledger` counter hotspot, so shop/farm counter behaviour is unchanged.

## Kerbs, sign frames and room sound (Claude, 2026-10-20)
- `town.js`: kerb stones, gutter, white edge lines (broken at cross avenues) and stormwater grates along every street. Visual only; no new colliders.
- Sign frames: tried a timber frame round the floating name label, then removed it because the shopfront painted boards (`shop-signs.js`, other session) replace the need for one.
- `ambience.js`: per-room sound (hum, murmur, one-off clinks, tills, ticks, bleats, clucks). `main.js` passes `room` (the place id, or `house`) to `ambience.update`.

- 2026-10-20 · ChatGPT — Rail Depot R8 implementation complete on `feat/rail-depot-interior-20261020`: dedicated freight house, seven reachable interactions, entry stock displays, live ledger and staff facilities. Local empty/full stock, geometry and walking-route tests pass. Integration gate and deployment tracked in PR; browser WebGL unavailable, so no visual walk claimed. Preserves PR84 mill and PR85 fire station.

## Soundscape: surface footsteps, weather, wildlife (Claude, 2026-10-20)
- `src/world/surfaces.js` (pure, tested by `tests/surfaces.mjs`, in `test:town`): `surfaceAt(x,z)` → asphalt / concrete / paver / dirt / gravel / grass; `roomFloor(id)` → tile / timber / carpet / straw / concrete.
- `src/ui/ambience.js` rewritten (same API plus `shopBell`, `debug`): footsteps per surface, one per camera-bob cycle (`player.bob`), wet splash in rain, landing thump, indoor room reverb; rain/roof patter/thunder, windy gusts, cicadas, magpie, crow, dog, dawn rooster, frogs, crickets, water-works burble, truck diesel idle, door latch + shop bell.
- `main.js` passes weather (`life.civic.weather`), surface, bob phase, crouch/airborne, hour and water proximity to `ambience.update`; `__town.life.setWeather(w)` and `state().soundDebug` are test hooks. `tests/footsteps.mjs` (browser, :8091) covers it.
- Not done: no real water to wade through exists in the town, so the 'water' splash recipe is only used for the wet overlay; house front paths are treated as grass.

## 2026-10-21 — hosting consolidation (Codex, integration/town-hosting-consolidation-20261021)
- IN PROGRESS: inventory and preserve all hosted Town snapshots; reconcile public generated extras; establish a single release manifest and tested production/staging/Pages pipeline. Preserve all feature branches and published history. No gameplay replacement from old branches.

## 2026-10-21 — consolidation release and quota fallback
- Source PR110 merged at 5c5637e; required integration and Android driving checks passed. Production READY with matching local/public release manifests. Pre-consolidation source, Pages/playtest and all 11 Render snapshot commits preserved as archive refs. Pages backup PR30 merged; legacy nested copies replaced by save-export handover pages.
- Render explicitly rejected build dep-dbbvvjcs728c73dgdda0 because workspace pipeline minutes are exhausted. Reuse existing Vercel Playtest as the only staging host; no spending limit increased. Archive/suspend redundant Render copies after preservation, retaining recovery.
- Desktop/Android save export/import and rejection checks pass. Existing baseline browser NPC soak reports 6 solid contacts (limit 3); life browser likewise detects solid contacts. Control run against unchanged main gameplay reproduces these failures. Do not weaken the tests or claim full gameplay acceptance. Existing entry/exit, people, windows, household and civic walk-in checks pass.

## 2026-10-21 — Town Companion (Codex, feat/town-companion-20261021)
- IN PROGRESS: separate context-aware AI panel, pinning, source evidence and local development-task export. Reuses existing AI Worker and quotas. Small main.js integration only; no gameplay replacement.
- Implemented: K / Ask AI panel, explicit context allowlist, pin/unpin, source excerpts, local Markdown task download, bounded requests and mobile viewport handling. Uses the existing deployed resident AI transport with a technical companion profile; no new AI endpoint or secrets required. Source evidence is generated from public game modules, never repository archives or saved chats.
- Verification: context/source/task contracts and existing AI Worker CORS tests pass. Privacy scan passes after using same-origin public source links. Full release gate completed locally. Browser QA blocked by cloud-browser URL policy; no visual or real Android walkthrough claimed. Actual AI answers retain the existing service's short-response format and usage limits.

## 2026-10-21 — hands-on General Store, café and sound (Codex)
- IN PROGRESS on feat/hands-on-store-cafe-sound-20261021. Preserve the existing six-role physical stations; replace store repeat-click duties with carried real stock and shelf destinations. Add café customer tickets, preparation skill activities, animated equipment and table delivery. Extend audio through a separate soundtrack module. Roadmap in docs/OCCUPATIONS_ROADMAP.md. Small hooks in main/jobs/counter-queue/visitors only.
- Implemented: carried stock from finite inventory; correct shelf zones, visible stock that depletes with sales, damaged-batch quarantine, counted shelf sections. Added café all-rounder: real queued villagers, FIFO ticket capture, stock reservation, six coffee/tea/meal recipes with timing/assisted skill activities, 3D steam/pour/oven/food/tray visuals, assigned table seating, wrong-table refusal, a single payment through the existing tax/till system, dishes and clearing. Work state saves in civic state; cancellations return raw reserved goods or record prepared food waste.
- Added original generative café jazz, pub/country folk, quiet piano, industrial pulse and day/night street motifs. Mixer separates master/music/ambience/effects; work sounds include grinder/steam/pour/cooking. No external recordings or new AI/provider dependency.
- Local full build:release passed; focused inventory/order/save, hotspot collision/path, customer presentation and audio-graph tests pass. Browser/device visual and listening QA remain unverified (preview browser policy block from this session). Final build and remote checks follow.

## 2026-10-21 — occupations roadmap, bottom upward (Codex)
- IMPLEMENTED on feat/occupations-roadmap-bottom-up-20261021 (PR121); automated acceptance and release tracking below. Start with saved earned-time accounting, fair rework, itemised payslips and finite-employer wage debt before expanding occupations. Preserve existing stock, café and NPC employment simulation. Device/listening checks remain separate and unchecked until actually performed.
- Implemented bottom-up: proportional saved timesheets, breaks, fair rework, itemised PAYG payslips, finite-employer debts and hiring, progressive pay offers, supervised experience and escrow-backed store/café contracts. Added real freight/post dispatch, farm/hen stock handling, visible litter/spill cleaning and lamp/tap/mixer repair effects; employer van manifests, normal driving and signed receipts; complete bread production; dated FEFO batches/cold exposure/quarantine/supplier returns; 16 café recipes, bundled dietary/milk orders, patience and latte-art gestures. Removed fictional bakery demonstration customers; real resident shopping uses the finished stock.
- Focused payroll and occupation acceptance tests pass, including saved mid-preparation bundles, cargo across midnight, all recipe steps, a driven delivery route, single payments and reachable station geometry. Existing full release gate passed during integration; final committed-tree gate and staging/CI follow. Human listening and new desktop/real Android visual/touch acceptance remain open in the roadmap and playtest guide; no device or listening review claimed.

- Release verification: the complete local release gate, staging READY and both required GitHub integration/mobile-driving checks passed. Final fleet review added employer-funded work-van servicing/registration and an actual driven return-to-depot acceptance test; these are being revalidated before merge. Human/device/listening acceptance remains open.

## 2026-10-21 — consistent human NPCs (ChatGPT, fix/town-human-avatars-20261021)
- Source of screenshot issue: makePerson used cylinder bodies; pose() could receive an undefined
  phase from shop visitors and write NaN rotations, hiding their arms and legs.
- Replaced everyday humanoid and named-human silhouettes with a shared low-poly
  sculpted torso, separate arms and articulated knees/elbows, hands, shoes, facial
  features and deterministic gait phase. Fantastical quest NPC shapes stay intact.
- Added tests/npc-appearance.mjs to the required release gate. Do not remove the
  finite-phase guard or restore barrel-shaped torsos. Awaiting PR checks/production
  verification; physical Android visual review remains unverified.

## Completed numbering handoff

- 2026-10-25 · ChatGPT — **DONE, task numbering only:** [PR #195](https://github.com/joshualparris/JoshMemory/pull/195) merged as `46694b7555d365983ca87f01a90afdf70cabe516` after green Town Integration + recorded WebGL. [Prioritised ten-ID agent queue](docs/NEXT_ACTION_TRIAGE_2026-10-25.md) and [stable central index](docs/UNNUMBERED_TODO_IDS_2026-10-24.md) are on `main`: six new unchecked IDs `RTN-001..003`, `RTQ-001`, `RTP-001..002`; reused existing `RTD-043`, `RTD-044`, `RTD-084`, `RTR-010` without renumbering. All 101 earlier indexed tasks and checkboxes preserved. Start `RTN-002` by reconciling open PR #186 and its ownership claim. Superseded conflicted docs PRs #189/#194 closed. No gameplay/audio/road implementation claimed.


## Done — 26 October 2026 — PUB-EXP-001–006
Completed within the declared playable-model scope: PR #221 and #222 merged; exact source 46a3439 and fingerprint 6be3baba published. All seven source checks and hosted desktop/phone suites passed, including header-free launcher, stairs/lift/cellar faults and post-escape movement. See [release evidence](docs/PUB_CELLAR_UPSTAIRS_RELEASE_2026-10-26.md). Formal approvals and PUB-SIM-011–013 remain open. No current source files claimed.

Historical scope: Codex; branch feat/pub-cellar-upper-20261026; baseline f81da769. User explicitly authorised cellar, upper dining, stairs, accessible lift/circulation and emergency exits. Scope: pub-specific floor-stack/interiors/envelope/utility hooks, narrow main floor-navigation integration, optional slab cutouts in interior-kit with unchanged defaults, tests, formal audit refresh and research/deployment docs. Preserve shared NPC/dialogue and existing electrical backbone. Validate ground clearance, all-floor collisions/seats/portals, lift failure, cellar supply/ventilation, second egress and actual desktop/phone gameplay before publication. No formal certification claimed.
