# IRON & LOGIC — Factory Automation

**A complete, six-contract, browser-based factory game.** This is a new genre in JoshMemory's game collection: resource extraction, physical conveyor logistics, manufacturing, research, power budgeting and factory optimisation. Everything runs locally in the browser; no accounts or external APIs are needed.

## Play

Open the Vercel public playtest URL after deployment, or locally run:

```sh
cd factory-flow
python -m http.server 8000
```

Visit http://localhost:8000. Direct file:// opening may block ES modules in Chrome.

You start with a working iron extraction → conveyor → smelter → shipping chain. All equipment operates automatically while unpaused. Click **How to play** to learn the controls.

## Six contracts

1. **First Light:** ship 12 iron plates.
2. **Copper Current:** build a copper line and ship 12 copper plates.
3. **Precision Engineering:** replace a section of your iron line with a gear press; ship 10 gears.
4. **The Logic Age:** feed iron AND copper plates into a circuit bench; ship 8 circuits.
5. **The Research Race:** feed gears and circuits into a lab; ship 6 research packs.
6. **Industrial Mastery:** scale to 15 further research packs; enter freeplay on victory.

## Controls

- **Click empty square** with a selected construction tool to build.
- **Click occupied square** to inspect.
- **Right-click machine/belt** to rotate its output direction.
- **1–8:** select a machine; **R:** rotate build orientation; **Delete:** choose dismantle (50% refund).
- **Z:** undo last build/rotation; **Space:** pause/resume.
- **Pause / 1×, 2×, 4×:** simulation control.
- **Export / Import:** portable JSON save, alongside browser autosave.
- Works with mouse and touchscreen (use build direction control before placement on touch devices; right-click rotation is desktop only).

## Actual machine recipes

- Drill + ore deposit: ore every 5 simulation ticks.
- Smelter + iron/copper ore: corresponding plate in 5 ticks.
- Gear press: 2 iron plates → 1 gear in 8 ticks.
- Circuit bench: 1 iron plate + 1 copper plate → 1 circuit in 9 ticks.
- Research lab: 1 gear + 1 circuit → 1 research pack in 12 ticks.
- Solar array: 16 power. Machines require power to operate.
- Conveyors carry one item at a time. Alternators alternate forward and right exits.
- Right-side green docks accept and sell all items. Only items matching the current contract progress its objective.

## Engineering / reproducibility

- Pure deterministic simulation in \`core.mjs\`, independent of DOM, network or build frameworks.
- \`app.mjs\` is the responsive game UI; \`style.css\` is self-contained.
- \`test.mjs\` builds a complete six-stage factory, including two-input manufacturing and a research lab, and **must achieve victory**.
- Run \`node test.mjs\` or \`npm test\`. GitHub Actions runs this test for changes.
- Browser localStorage stores the game after every construction change and every 25 simulation ticks.

## Honest boundaries

This is a complete **single-player factory campaign** with freeplay, not a replica of Factorio's enormous scale. The game has no enemy combat, multiplayer, research trees beyond the six contract unlocks, or soundtrack. Those could be deliberate later expansions—but new mechanics should be prioritised over decorative reskins.
