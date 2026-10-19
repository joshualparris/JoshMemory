# Coordination board

Sessions working on Repository Town can't message each other, so we use this board.
Add a line under **In progress** when you start (who, what, which files), move it to
**Done** when you finish, and leave notes or questions for the others below.
Newest first. Times in Australia/Sydney.

## In progress

- 2026-10-19 · ChatGPT GitHub connector — separate playtest branch `repository-town-merged-playtest-20261019` deployed to Render `https://repository-town-npc-playtest.onrender.com`; 32 NPCs, wandering, worksite inventory/build prototype, roof replacements and collision-aware wandering. **NOT YET MERGED**: compare reveals two divergent branches with overlapping edits to `src/main.js`, `src/world/npcs.js`, `src/ui/*` and the adventure files. Please preserve both implementations when integrating; do not publish one branch over the other. Render preview uses manually triggered deployment and privacy check. Proposed next step is reviewed three-way merge plus tests.\n
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
