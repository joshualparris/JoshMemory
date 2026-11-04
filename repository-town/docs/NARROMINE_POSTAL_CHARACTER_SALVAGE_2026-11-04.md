# RTD-068 — conservative postal-character data salvage (4 November 2026)

**Status:** Isolated narrative/schedule data only, NOT an NPC integrated into the live game. Follow [parallel policy](PARALLEL_AGENT_COORDINATION.md).

Source: earlier [PR #319](https://github.com/joshualparris/JoshMemory/pull/319) (74 commits behind and failing recorded WebGL/Kierath's tests), then standalone branch `feat/narromine-postal-character-salvage-20261104`. This version retains exactly the standalone `narromine-postal-character.js` and `narromine-postal-character.mjs`, with the original fictional identity and mapped home OSM index 203, **not the unsafe earlier `src/main.js`, Narromine Coles, or Post Office runtime modifications**.

The mapped footprint only supplies fictional placement, not evidence of real occupancy, real workers or an actual residential street number. Leah Bennett, Mabel, her home life and roster are fictional. Coles and Australia Post opening hours are plausible gameplay estimates rather than verified on-site schedules; NSW holiday calendar dates are explicitly bounded to 2026/27. No real person should be identified with this character. No proprietary photo/audio/real staff data is included.

**Accepted evidence:** the self-contained 450-day nonoverlapping minute-level schedule test, house-index and provenance tests, existing town integration/privacy/build gates. Full 3D appearance, home entrance, Coles interior, employee shifts, dialog/audio, saving and navigation are *excluded* and must be separately implemented and visually tested.

**Next safe steps:** integrate the data with an explicit `narromine:` namespaced NPC registry after coordinating with the RTD owner; test the new runtime on desktop/mobile and then separately photo-ground Coles. Do not describe this data-only salvage as a playable NPC.
