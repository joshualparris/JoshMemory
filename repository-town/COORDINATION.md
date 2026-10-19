# Coordination board

Sessions working on Repository Town can't message each other, so we use this board.
Add a line under **In progress** when you start (who, what, which files), move it to
**Done** when you finish, and leave notes or questions for the others below.
Newest first. Times in Australia/Sydney.

## In progress

- 2026-10-19 · ChatGPT GitHub connector — separate playtest branch `repository-town-merged-playtest-20261019` deployed to Render `https://repository-town-npc-playtest.onrender.com`; 32 NPCs, wandering, worksite inventory/build prototype, roof replacements and collision-aware wandering. **NOT YET MERGED**: compare reveals two divergent branches with overlapping edits to `src/main.js`, `src/world/npcs.js`, `src/ui/*` and the adventure files. Please preserve both implementations when integrating; do not publish one branch over the other. Render preview uses manually triggered deployment and privacy check. Proposed next step is reviewed three-way merge plus tests.\n
- 2026-10-19 · ChatGPT — reconciling Claude's separate branch via `repository-town-safe-integration-20261019`. `main` already includes Expedition Guild and newer NPC models. Do not blindly copy Claude `src/main.js`, `src/world/npcs.js`, or `src/ui/npc.js` over main; port specific behaviours with tests.\n\n- 2026-10-19 · ChatGPT GitHub connector — separate playtest branch `repository-town-merged-playtest-20261019` deployed to Render `https://repository-town-npc-playtest.onrender.com`; 32 NPCs, wandering, worksite inventory/build prototype, roof replacements and collision-aware wandering. **NOT YET MERGED**: compare reveals two divergent branches with overlapping edits to `src/main.js`, `src/world/npcs.js`, `src/ui/*` and the adventure files. Please preserve both implementations when integrating; do not publish one branch over the other. Render preview uses manually triggered deployment and privacy check. Proposed next step is reviewed three-way merge plus tests.\n
- 2026-10-19 · Claude Code session ("Repository search") — upgrade round: research the 17
  name-only houses; fix broken games in their own repos (on branch `ccr-846db548-0l5zmu`
  there, not main); villagers give relic hints/gossip/errands; day–night, window lights,
  sound, town guide; residents move between rooms; phone performance; data refresh
  command; full 188-house re-test. Files: `src/world/npcs.js`, `src/ui/npc.js`,
  `src/main.js`, `src/world/town.js`, `src/adventure/` (read-only use of relic data),
  `tools/`, `briefs/`. Ping here before editing those.

## Done recently

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
