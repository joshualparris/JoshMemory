# Arcade: stop repeated AI prototypes

The arcade currently registers 77 games sourced from many repositories. Duplicate titles are **suspects**, not proof that two games have identical mechanics.

## New game rule (enforced in CI)

Before registering any new game ID in `data/games.json`:

1. Play or inspect three existing games with the closest core loops. Do not rely on the titles or visual themes.
2. Record `genre`, `playerActions` (array), `coreLoop`, `objective`, `progression`, `failureState`, `distinctiveMechanics` (array), `comparison` (array of `existing-game-id: concrete mechanical difference`), and `playtestEvidence` (reproducible inputs and observed outcomes) in `data/gameplay-profiles.json`.
3. Prefer improving an existing game if the only changes are setting, graphics, enemy types or upgrade names.
4. Build and playtest a complete repeatable game loop, including failure/retry and at least one progression milestone, **before** treating it as finished.
5. Run `node tools/audit_game_originality.mjs --report` from `repository-town`. The command writes `GAME_ORIGINALITY_AUDIT.md`; commit reviewed reports if desired.

The gate checks the above required fields and catches exact duplicate declared mechanics. **It cannot automatically prove originality, quality or fun.** Those need game-specific code inspection and human or browser playtesting.

## Existing backlog

The 77 existing IDs are grandfathered in `data/game-originality-baseline.json` to avoid blocking all unrelated development. They are **not** reviewed/approved as unique. The baseline should remain fixed; never append new IDs to evade the check.

First assess repeated titles: AA Game Adventure; Tile RPG; D&D RPG Dungeon; ORGSCAPE; Mysterious Depths; Neverwinter; Dark Realms; Serenity; Multi-Layer Zoom Game. Then review Whispering Wilds editions, StarHaven editions, and similarly themed survival/RPG prototypes. Record actual mechanics before merging or removing anything.

For each pair, decide **same game edition**, **mechanically similar**, or **distinct**. For similar games, pick a canonical version based on working controls, content depth, saves, tests and accessibility; migrate worthwhile mechanics into that edition. Preserve originals and player data until replacements are verified.
