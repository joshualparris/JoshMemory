# Repo Town multiplayer v1 (presence) + v2 (resilience) + v3 (social layer)

This feature adds live account-based **player presence** to the existing static three.js game using a separate Cloudflare Worker and two SQLite-backed Durable Objects. It does not migrate or expose local saves/private repository data.

## Working scope
- Each person registers a unique username and password (minimum 12 characters); one session token is held in browser sessionStorage, separate from game save keys.
- The shared server authenticates WebSocket clients, assigns server-controlled player IDs and names, and broadcasts player coordinates/headings. The game draws a coloured name-tagged avatar when another signed-in player is within 90 metres and in the same area, including matching interiors.
- The server uses WebSocket hibernation, SQLite persistence for accounts and sessions, origin allowlisting, bounded messages and rate-limited position updates.
- **Not shared yet:** NPCs, traffic, cars, economic state, inventory, items, physics, buildings, quests, ownership, chat or saves. This is multiplayer presence, not a synchronised MMO game world. Nobody else can take items or modify your save.
- The sign-in panel is optional; without a server connection the regular offline town works.

## Two-computer acceptance
1. On computer A, open the newly released Repository Town, select **👥 Multiplayer**, register a unique username/password, confirm Online 1.
2. On computer B (same URL), register a different username/password, confirm Online 2 in both games.
3. Place both players outside in Repository Town. Their name-labelled 3D avatars should appear and move in response to one another within a second. Move farther than 90 metres or enter a different building; avatar disappears. Enter the same building; avatar appears.
4. Close B, refresh A, sign out A, then sign back in; no duplicate ghost avatars, and existing local save unchanged.
5. Invalid password, invalid token, blocked origin, oversized WebSocket messages, and bogus positions are rejected.

## Source and hosting
- `deploy/multiplayer-worker.js`: server implementation. `deploy/multiplayer-worker-metadata.json`: v1 SQLite Durable Object migration and bindings.
- Public server: https://repo-town-multiplayer.parris-neathaustralia.workers.dev/health
- Client: `src/multiplayer/client.js` + `src/multiplayer/style.css`, imported by the canonical `src/main.js`; static hosts do not need WebSocket support.
- Never publish `dist/private`, publish backend secrets, reuse clients' Supabase projects, or replace the existing NPC Chat Worker.
- To deploy backend, upload code + metadata via the Cloudflare Workers script API to `repo-town-multiplayer`; for future code-only updates preserve migration tag v1. Static deployments still require the standard `npm run build:release` and privacy gate.
- If registrations are abused, disable registrations at the Worker and investigate IP throttling or an invite-only model; do not publish a universal admin password. Account reset/email recovery is not yet implemented.

## Cost boundary
Designed to fit Cloudflare Workers/Durable Objects Free allowances; frequent socket messages still use quotas, and excess requests on free plans fail rather than silently increasing a free-plan bill. Monitor limits before expanding beyond a small group.

## Multiplayer resilience v2 (8 November 2026)

This is a hardening increment, NOT an MMO conversion:
- **Session protection:** sign-out revokes the active WebSocket immediately; each active WebSocket also checks its session periodically. Auth throttles are stored in SQLite so application hibernation/restart cannot reset the limit.
- **Automatic recovery:** the browser sends heartbeat pings and confirms pongs, detects half-open connections and reconnects with capped exponential backoff and random jitter. Network/foreground changes resume retrying. Offline single-player remains available.
- **Ghost player cleanup:** the hibernating room Durable Object sweeps connections every 30 seconds; unauthenticated sockets time out after 15 seconds and inactive signed-in sockets after 75 seconds. Close/error removes nearby avatars.
- **Nearby interest management:** each player receives position updates only for other players within 115 metres of their location in the same area. New joins and moving out of range have symmetric events. This reduces unnecessary messages and protects slower devices; the renderer itself uses 90 metres.
- **Readiness and monitoring:** \`/health\` is a lightweight edge check; \`/ready\` verifies both Durable Objects and reports an aggregate current player count/capacity without player names. The existing GitHub workflow runs a daily two-account synthetic test and tests PRs against a separate staging Worker.
- **Preservation:** existing account IDs, SQLite databases, guest progress, live Worker script name, the v1 migration tag and the existing web hosting remain unchanged.

The current max remains **80 WebSocket connections in one global room**. This is an application cap, not a tested 80-player performance benchmark. Cloudflare Workers Free/Durable Objects request and compute quotas can interrupt service even below this cap. See [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) for the plan's current limits; incoming WebSocket messages are metered at an effective 20:1 ratio for compute request billing. This is **not** a 24/7 uptime SLA.

### World-class multiplayer requires separate follow-on systems

1. **Server-authoritative world state:** synchronise NPC jobs/routines, clock, vehicles, interaction collisions, building doors and civic services. Clients become viewers/input controllers rather than independent town simulators.
2. **Persistent player data:** server-owned inventories, quest progression, housing, bank/money and character metadata, versioned schema, backup/export and account recovery. Migrate current local saves only with explicit user action and validation.
3. **Zoning and capacity:** world instances, spatial ownership/sharding, position handover, load/admission queues, regional routing, reconnect resume and realistic capacity tests. Consider one Durable Object per area, not a single global room.
4. **Security and child safety:** authoritative movement/action validation, rate caps, transaction atomicity, anti-cheat, reporting/moderation and privacy defaults (especially before open chat is enabled).
5. **Operational resilience:** repeatable staging/rollback, load/soak benchmarks (10/30/80 concurrent players), alerts, latency/packet-loss measures, failure injection, backups and defined uptime and recovery targets.

Acceptance for claiming parity with established online games would require a sustained measured load target, monitored real-world uptime, independent shared simulation, account recovery, data-restoration rehearsal and user-visible cross-device progression. Those are **not yet delivered**.

## Social layer v3 (8 November 2026)

Protocol 3 adds the social features players expect from RuneScape/Minecraft/Roblox-style town play, on top of the v2 resilience worker. The client feature-detects `/health` `protocol >= 3` and silently stays presence-only against an older deployed worker, so the game and worker can be deployed in either order.

- **Chat:** press **T** (or **/** for commands) to open the chat dock. Channels are **Local** (same area, within 70 m — distance-filtered server-side) and **Global** (everyone). Speech bubbles float above speakers' avatars for six seconds; the log keeps the last 60 lines. `/g text` and `/l text` force a channel.
- **Whispers:** `/w name message` (also `/whisper`, `/tell`) delivers only to that player, with a delivery receipt for the sender and an offline notice when the name is not connected.
- **Emotes:** `/wave`, `/dance`, `/point`, `/cheer`, `/sit`, `/bow` play procedural animations on the sender's remote avatar for everyone nearby (1.5 s cooldown).
- **Roster:** the multiplayer panel lists every connected player name; the server broadcasts roster updates on join/leave.
- **Avatars:** remote players are now articulated figures (torso, head, pivoting arms and legs) with a speed-driven walk cycle, replacing the v1 capsule.
- **Safety:** chat is collapsed/truncated to 200 characters, profanity-masked server-side, rate-limited to 6 messages per 10 s per socket (`chaterr` notice on excess), emote allowlisted, and everything remains origin-allowlisted and account-gated. History replays the last 25 global messages to joiners (memory only, cleared by hibernation).
- **Still not shared:** NPCs, traffic, economy, inventory, quests, saves. Chat is social presence, not a synchronised world.

### Deploy order and acceptance
1. Merge the client; the published game keeps working against the current protocol 2 worker (chat stays hidden).
2. Upload the updated `deploy/multiplayer-worker.js` to `repo-town-multiplayer` (and staging) via the Cloudflare script API, preserving migration tag v1. `/health` then reports `protocol:3`.
3. Two computers: both see the roster, T-chat reaches the other player within a second, bubbles appear over avatars, `/wave` animates, `/w` delivers privately, and a player 200 m away receives Global but not Local chat.
4. `node tests/multiplayer-worker-protocol.mjs` (offline, in `npm run test:multiplayer` and the release gate) plus `node --experimental-websocket tests/multiplayer-live.mjs` and `node tests/multiplayer-browser.mjs` verify the same against the deployed worker and real browsers.
