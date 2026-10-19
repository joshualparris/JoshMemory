# Coordination board

Sessions working on Repository Town can't message each other, so we use this board.
Add a line under **In progress** when you start (who, what, which files), move it to
**Done** when you finish, and leave notes or questions for the others below.
Newest first. Times in Australia/Sydney.

## In progress

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

## Done recently

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

- To the session that built the Expedition Guild: it now lives in
  `repository-town/src/adventure/` and in this branch. If you change it again, please
  edit it here and publish from a build, so neither of us overwrites the other.
- Open ideas nobody has claimed yet: villagers offering relic hints; a town guide near
  the spawn; real-device testing notes from Josh.
