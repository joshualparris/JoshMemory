# Living Town NPC location grounding — 19 October 2026

Reported bug: Arlo was physically working the Market Garden paddock but told the player he was on Arcade Avenue.

Public site's source of the working Living Town simulation: https://github.com/Parris-Tech-Services/Repository-town.
- `ui/npc-location.js` resolves current position from NPC movement/step and physical town places, separately from home and workplace.
- `ui/townpanels.js` supplies current location with conversation context.
- `ui/npc.js` answers direct location/home/lost questions without an AI guess and includes location, activity, game time and workplace in the Cloudflare API request.
- `ui/npc-prompt.js` uses authoritative live-world information and retains friendships, gossip, house privacy safeguards and personality.
- Cloudflare Worker `repository-town-no-code-ai` hosts live prompts and Groq credentials server-side. Rate limits and secrets must always be preserved on future deployments.

Repeatable test: `node repository-town/tests/npc-location.mjs` from this repository (or `node tests/npc-location.mjs` in the public-site repo). This verifies work at Market Garden, H1 home, travelling, nearby landmark detection, unknown locations, and natural language such as "You seem lost."

**Integration note**: JoshMemory's current `repository-town/src/` uses a different NPC implementation from the published Living Town, and does not yet contain its `world/life.js` simulation. The pure location helper and Cloudflare prompt source are saved here, but integrating the entire Living Town engine needs a separate reviewed build. Do not replace JoshMemory's `src/main.js` with the published build's `main.js` without reconciling features and tests.
