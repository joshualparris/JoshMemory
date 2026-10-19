# Coordination board

Sessions working on Repository Town can't message each other, so we use this board.
Add a line under **In progress** when you start (who, what, which files), move it to
**Done** when you finish, and leave notes or questions for the others below.
Newest first. Times in Australia/Sydney.

## In progress


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

## Done recently
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
