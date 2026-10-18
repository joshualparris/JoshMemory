# Repository Town — 32-NPC expansion

Implemented on branch `repository-town-merged-playtest-20261019` on 19 October 2026.

## New cast (20)

| Resident | Location | Visual species | Quest theme |
|---|---|---|---|
| Bramble | H1 | Walking tree | Tree care |
| Echo | Q3 | Friendly ghost | Ghostly riddle |
| Moss | H7 | Mushroom person | Fungi |
| Byte | J5 | Glitch sprite | Binary |
| Tick | S3 | Clockwork timekeeper | Clocks |
| Nimbus | D6 | Raincloud | Weather |
| Fizz | W1 | Potion slime | Kitchen chemistry |
| Captain Coral | P3 | Sea dragon | Navigation |
| Quill | A4 | Raven | Haiku |
| Orbit | X1 | Alien | Astronomy |
| Thistle | O4 | Fox merchant | Barter puzzle |
| Basil | M6 | Tea witch | Herbal infusion |
| Pebble | G1 | Stone golem | Weathering |
| Zig | L6 | Robot dog | Network ping |
| Pollen | N2 | Bee engineer | Geometry |
| Lumen | T4 | Lantern spirit | Light |
| Vesper | R6 | Night owl | Earth rotation |
| Kestrel | F6 | Sky pirate | Directions |
| Drift | U7 | Astronaut | Space safety |
| Tangle | T2 | Octopus | Multiplication |

Twelve prior residents are unchanged. All 32 use existing occupied town coordinates (verified against `docs/repository-town.json`). The new models are procedural geometry in `src/world/npcs.js`; no external image files, models or repository secrets. All residents retain Groq dialogue via `api/npc-chat.js`.

## New interactive features

- Every new resident has three themed conversation suggestions and a unique 3-choice mini-quest.
- Correct answers award locally saved badges; quests are replayable, fully offline and use no Groq credits.
- 2D lounge at `people.html`: resident search, badges, scrollable 32-resident picker, and jump to selected conversation on mobile.
- NPC server instructions now include each creature's species and quest theme. NPCs may chat about any subject; no secret keys are bundled.

## Testing and deployment status

- **Passed source checks**: 32 unique resident IDs/occupied coordinates, 20 unique species, 20 complete quests, 20 matching model branches.
- **Passed Node checks in sandbox**: JavaScript syntax for NPC data, chat UI, models, API; data-module load; 20 quest structure validations.
- **Passed mocked API checks**: new Moss NPC received a synthetic completion, bad access code rejected, without calling paid Groq.
- `tests/npc-contract.mjs` now checks 32 unique NPCs, their actual coordinates, all species models, and mocked proxy responses; it still needs a full project build to run.
- **Blocked deploy**: Vercel returned HTTP 402 `api-deployments-free-per-day`. No final deployment of the 32-NPC branch has been made. The currently live Vercel site has the **previous twelve-NPC build**.
- Once quota resets, deploy current branch to existing `repository-town-claude-playtest` Vercel project and verify live 3D and mobile gameplay, the 2D lounge, quests, and Groq for a new character.
- Never commit or embed Groq keys; previously pasted Groq keys should be revoked/replaced in encrypted Vercel settings.
