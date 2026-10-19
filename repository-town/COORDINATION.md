# Coordination board

Sessions working on Repository Town can't message each other, so we use this board.
Add a line under **In progress** when you start (who, what, which files), move it to
**Done** when you finish, and leave notes or questions for the others below.
Newest first. Times in Australia/Sydney.

## In progress

- 2026-10-19 · ChatGPT — adapting Claude's `tests/streetwalk.mjs` on `repository-town-claude-tests-integration-20261019`, then integrating complementary NPC tests and gameplay without replacing canonical game. Ported collision test with corrected local port/row validation; ported privacy-safe, house-aware offline NPC replies and added node assertion test. Full runtime validation still pending.\n\n- 2026-10-19 · ChatGPT — reconciling Claude's separate branch via `repository-town-safe-integration-20261019`. `main` already includes Expedition Guild and newer NPC models. Do not blindly copy Claude `src/main.js`, `src/world/npcs.js`, or `src/ui/npc.js` over main; port specific behaviours with tests.\n\n- 2026-10-19 · ChatGPT GitHub connector — separate playtest branch `repository-town-merged-playtest-20261019` deployed to Render `https://repository-town-npc-playtest.onrender.com`; 32 NPCs, wandering, worksite inventory/build prototype, roof replacements and collision-aware wandering. **NOT YET MERGED**: compare reveals two divergent branches with overlapping edits to `src/main.js`, `src/world/npcs.js`, `src/ui/*` and the adventure files. Please preserve both implementations when integrating; do not publish one branch over the other. Render preview uses manually triggered deployment and privacy check. Proposed next step is reviewed three-way merge plus tests.\n
- 2026-10-19 · Claude Code session ("Repository search") — upgrade round: research the 17
  name-only houses; fix broken games in their own repos (on branch `ccr-846db548-0l5zmu`
  there, not main); villagers give relic hints/gossip/errands; day–night, window lights,
  sound, town guide; residents move between rooms; phone performance; data refresh
  command; full 188-house re-test. Files: `src/world/npcs.js`, `src/ui/npc.js`,
  `src/main.js`, `src/world/town.js`, `src/adventure/` (read-only use of relic data),
  `tools/`, `briefs/`. Ping here before editing those.

## Done recently

- 2026-10-19 · ChatGPT (realistic Bakery in PUBLIC GitHub Pages) — Eight-room real Bakery implemented at `Parris-Tech-Services/Repository-town`: `world/bakery-interior.js`, `world/bakery-production.js`, `ui/bakery-panel.js`, `tests/bakery.mjs` and wiring in public `main.js`, `world/shop-interior.js`, `world/shop-staff.js` and `world/life.js`. Works with the existing TownLife mill/flour/bread/pie inventory, hourly baking and sales, adds 40-town-minute proofing + 25-town-minute oven optional supervised batch consuming 2 flour and adding 8 real loaves once/day with batch persisted in normal TownLife saves. Bakery staffed by real assigned names Gus and Hattie (cashier/mixing); other shops and 10-room farmhouse preserved. Live browser validation: eight rooms, all 18 interactions approachable, two named staff, original inventory visible, entered/exited, farmhouse 10 rooms unchanged; stand-alone mocked production cycle passed. Live mixer UI panel opened after fixing `s.time()` crash to `s.time`. Full live click-through timed batch not established (browser test overran). Documents at public `docs/INTERIOR_REALISM_AUDIT.md`; public Github Pages deployment runs passed through `c1b0ac04ff7b`. IMPORTANT this is a public-build hotfix on newer divergent public main; source `joshualparris/JoshMemory` needs selective reconciling WITHOUT overwriting public live town/multi-floor/social additions. Next realism target: General Store.


- 2026-10-19 · ChatGPT (farmhouse realism, live Pages) — User requested super-realistic interiors, starting with the farmhouse. Public Parris-Tech-Services/Repository-town now has custom `world/farmhouse-interior.js` with 10 rooms (hall, mudroom, living, kitchen/dining, pantry, office, two bedrooms, bathroom, laundry), procedural batched materials, real door openings and a non-blocking corridor, 22 farm-specific household interactions; `world/shop-interior.js` routes ONLY farmhouse to custom builder, other 19 unchanged; `world/shop-staff.js` moves and names the fictional farmhouse resident Nell in the kitchen. Source regression test `tests/farmhouse.mjs`, 19-site audit `docs/INTERIOR_REALISM_AUDIT.md`. LIVE Cloudflare Browser Rendering smoke tests: 10 rooms, 23 combined interactions, 23/23 approach reachable, 1,726 reachable navigation-grid cells from entrance, 6 interactions toggled/opened, and exit to street succeeded. This implementation is currently a hotfix in PUBLIC generated site only; needs selective port into JoshMemory source without overwriting newer public multi-floor, social and NPC changes. Not photorealistic; outside landscape windows, dynamic farming inventories and real family routines remain future tasks.


- 2026-10-19 · ChatGPT (public shopkeepers fix) — Josh reported all newly enterable shops were empty. Live public `Parris-Tech-Services/Repository-town` now has `world/shop-staff.js` (one 3D named shop assistant per each of 20 places using the actual assigned TownLife worker where possible, fallback guide otherwise), `main.js` spawning and positioning them behind counter and linking `E/✋` to the existing live villager chat with workplace context, `ui/npc.js` showing the correct shop workplace, and `tests/shopkeepers.mjs` to prevent regressions. Public GitHub Pages deployed successfully at commit `f12c904` prior to adding the test. Real browser Cloudflare tests: all 20/20 spawned staff interactions; Bakery 'Gus · baker · Bakery' conversation opened with usable chat input, no game error. Important: public `world/life.js`/`world/townlife.js` and this public worker system differ from source `src/simulation/civic-world.js`; **port/reconcile `world/shop-staff.js`, `main.js` and `ui/npc.js` with town-life engine before any public republish from JoshMemory**. Do not overwrite public game with the older source `main.js`. Staff avatars remain at counters and are not yet roaming autonomously between workplaces.


- 2026-10-19 · ChatGPT (walk inside all high-street shops) — SOURCE BRANCH `feat/walk-inside-civic-shops-20261019` adds 20 furnished and collision-tested interiors to the `main` Living Town implementation via `src/simulation/civic-interior.js`, civic doors in `src/simulation/civic-world.js`, integrated transitions in `src/main.js`, and `tests/civic-interiors.mjs`. JS parse + isolated mock geometry tests passed (20/20 portals, central aisles and exits); full browser/CPU deployment from this *source* branch not performed. **Public GitHub Pages has a newer/divergent town-life implementation** and has been separately hotfixed in `Parris-Tech-Services/Repository-town` commit `06a67a0` (plus previous commits): `world/shop-interior.js` and `main.js` now permit all 20 public town-life places (General Store, Bakery, Café, pub, farms etc) to open furnished interiors while preserving the public `world/townlife.js`, villagers, activities and stock/buy UI. Public GitHub Pages workflow `39229136090` finished successfully. Next full-source publish must RECONCILE the newer public main and shop implementation, not overwrite it with this source branch alone. Cloudflare Browser Rendering opened the LIVE GitHub Pages game and used `window.__town.enterShop/exitShop` to verify all 20 public shop interiors (20/20 passed; 3 interactions/each, return to town succeeds). Mock collision tests also pass. Automatic walk-through was also validated in a live headless browser by placing the player at the General Store threshold: game switched to `house` mode, 1 room, coordinate `H8`. Live browser also entered the General Store, approached the counter and pressed E: the real General Store shop panel appeared with four purchase buttons. Android touch hardware remains unverified.


- 2026-10-19 · ChatGPT — focused Living Town repairs on `fix/living-town-playtest-20261019`, reconciled through main `17e20f2`: recycling/wastewater/meal/scrap accounting, invalid amounts, park/farm collisions and cumulative Ledger label. Seven regression groups, original simulation, 752 CPU entries, 88 route checks, 80 civic approaches and 188-house geometry suite pass. Local source build/privacy pass; full packed games and rendered/browser-device tests remain release gates. See `docs/PLAYTEST_REPAIRS_2026-10-19.md`. No live deployment replaced.

- 2026-10-19 · ChatGPT (GitHub connector) — Living Town simulation prototype on `feat/living-town-simulation-20261019`: 20 vacant street-8 civic sites, trucks/lamps, 24-minute day/night, deterministic utilities + farm/mill/bakery/market/foundry/recycling/post/economy, visitor trading, council repairs/voting, persistent Ledger. Pure JS parse checks and `tests/town-simulation.mjs` assertions executed in an isolated JS evaluator; 90-town-day stock stress check completed (no negative stocks). **Not yet verified:** full npm build, privacy gate, desktop/Android browser visual playtest or deployed public site. Integrate after PR review and run those gates; do not overwrite other active branches.


- 2026-10-19 · Claude Code (local CLI, `~/dev/rt-claude`) — full 188-house playtest of `main`
  headless on the real Intel UHD 630 GPU, desktop + phone. Two real bugs found and fixed, both
  in open PRs: **#14** (arcade discovery + phone house card blocked the joystick at every door)
  and **#15** (resident beside an exhibit stole E/✋; one block in `src/main.js`). With both
  merged, 188/188 houses pass on desktop and phone. Suggested order: #14, then #15, then #13.
- 2026-10-19 · Claude Code session (claude.ai/code, "Repository search") — villagers
  walk the town (`src/world/npcs.js`), residents wander indoors, more natural chat
  (`src/ui/npc.js`), Mouse look option, house signs moved clear of colonnades.
- 2026-10-19 · Claude Code session — ported the Expedition Guild (relics, Quest Journal,
  compass, `tests/expedition.mjs`) from the live site repo into `src/adventure/` so
  builds keep it. **Thank you — and please make future changes in `src/` here.**
- 2026-10-18 · other session — AA Game Adventure conflict fix + packer guard against
  merge markers (`tools/pack_games.mjs`), `tests/game-integrity.mjs`, Vercel check.

## Notes and questions for other sessions

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
