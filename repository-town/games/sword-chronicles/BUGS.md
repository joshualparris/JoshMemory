# BUGS / GAPS

## Status

The "source integrity blockers" and "recovery strategy" that previously
filled this file are **done**. The runtime was rebuilt as 18 ES modules
under `src/` (`core/`, `data/`, `ui/`), `saveGame`/`loadGame` exist in
`src/core/storage.js`, and `DNDGAME.txt` is retained only as a layout
reference. Do not plan from the old contents.

## Open

1. No CI — `npm test` must be run by hand.
2. `test_chronicles.mjs` covers load, DOM contract, New Game, and data
   integrity only. Combat, saving/loading, quests, and progression are
   untested.
3. No state schema version on save data, so an old save loaded by a newer
   build fails in undefined ways.
4. `legacy/` and `DNDGAME.txt` are unreferenced by the running game.

## Verified working

- `npm test` — 5 passing (see above for coverage limits)
- Game boots in browser via `index.html` (`<script type="module">`)
