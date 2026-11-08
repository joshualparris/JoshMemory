# Repo Town multiplayer v1

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
