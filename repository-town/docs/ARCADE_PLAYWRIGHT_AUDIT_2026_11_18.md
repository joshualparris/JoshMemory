# Repository Town — all-games Playwright audit (18 November 2026)

## Scope and evidence

- **79 registered catalogue entries**, including alternate editions. This is *not* 79 unique gameplay concepts.
- Initial **live-production** audit: **158 browser checks** (79 desktop + 79 mobile), 104 smoke-passed; 54 flagged. Each platform found the same 27 game IDs with an observed error.
- Initial **checked-out packed-source** audit: **158 browser checks**, 133 smoke-passed (66 desktop + 67 mobile), 25 flagged.
- Three independent **standalone games** (Patch Tuesday, Throughput, Iron & Logic) also passed their browser smoke tests.
- Live run: https://github.com/joshualparris/JoshMemory/actions/runs/44187311338
- Local run: https://github.com/joshualparris/JoshMemory/actions/runs/44188646376
- The runner records page load, HTTP responses, uncaught JavaScript errors, a few basic inputs, and screenshots. `SMOKE_PASS` **does not mean** campaign completion, game balance, correct touch controls, or long-session stability.

### What the initial production failures meant

The 27 affected IDs per viewport break into **two separate classes**:

1. **18 direct game URLs returned HTTP 404**, because the public build copies only games linked from publishable public house cabinets, while the source catalogue contains more entries. These must **not** all be published blindly: visibility and original project permission must be checked first.
2. **9 publicly reachable game pages returned missing resource errors**: JoshHub global header imports / home panorama probes, two Tile RPG map issues, a missing optional Sylvie phonics bundle, and absent audio in Whispering Wilds or The Midnight Line.

The initial 18 unpublished IDs were: `sleepy`, `pld-wilds-sail-west`, `ptshub-dnd-rpg-dungeon`, `ptshub-classic-dnd-text`, `ptshub-amodule-dnd`, `sylvie-app`, `ptshub-newgame`, `adventure-text`, `ptshub-aa-game-adventure`, `ptshub-neverwinter-tales`, `pld-neverwinter-tales`, `ptshub-wilds-main`, `forbidden-quests`, `sword-chronicles`, `pld-nexus-descent`, `ptshub-mysterious-depths`, `pld-wilds-2`, `ptshub-infinite-office`. Their **source copies were still tested locally**; a production 404 is not automatically a gameplay code defect.

## Implemented repairs

1. **Tile RPG**: Added a valid 32×18 tutorial map from existing JoshHub map layout, converted to the game's expected schema; fixed root-absolute map loading in both `hub-amodule-dnd` and `ptshub-amodule-dnd`. Browser regression verified both versions open into an interactive canvas and accept movement. Original source repositories are also repaired.
2. **Tile Game**: The original small map was already present. Fixed the inaccurate startup/error guard: `gameInitialized` now becomes true when the map actually loads, preventing an erroneous "Game failed to initialize" warning.
3. **Sylvie Phonics**: Added an empty, valid optional bundle to the source and arcade copy. It preserves the built-in phonics activities without requesting an absent file; contains no user or child data.
4. **JoshHub embedded games**: Removed source-site-only global header script/style requests from the copied arcade editions. Their native JoshHub sites retain their own header. The packer now applies this conversion on future repacks.
5. **Home Panos**: Keeps an existing generic panorama placeholder in the public arcade without sending 404-producing HEAD requests for personal home-photo URLs. The native source remains unchanged.
6. Added Playwright regression scripts for the corrected game variants, plus local and live sharded full-catalogue test workflows. The live runner can distinguish **UNPUBLISHED** entries from broken public pages.

Verified CI: [Tile RPG world launch](https://github.com/joshualparris/JoshMemory/actions/runs/44189546805) and [asset / startup repairs](https://github.com/joshualparris/JoshMemory/actions/runs/44190178407).

Source repairs merged:
- [joshualparris/JoshHub PR #13](https://github.com/joshualparris/JoshHub/pull/13)
- [Parris-Tech-Services/JoshHub PR #14](https://github.com/Parris-Tech-Services/JoshHub/pull/14)
- [joshualparris/SylviePhonetics PR #2](https://github.com/joshualparris/SylviePhonetics/pull/2)

## Still outstanding

- **Whispering Wilds (PyScript edition):** five referenced `sfx/*.ogg` audio assets do not exist in its source repository. Game UI can load, but these effects do not play.
- **The Midnight Line:** three `/audio/ambient_*.mp3` references have no files in the source repository. Restore properly licensed originals or implement deliberate audio fallbacks; do not hide the errors by claiming playback works.
- **Bramblewick local `index.wasm` 404:** this is a raw-checkout serving limitation; the release build restores the compressed `.wasm.gz` file. Verify release-built WebGL rather than counting it as source gameplay failure. Initial live-production check passed.
- **Sleepy Stories:** one desktop local smoke run saw a 404 that did not reproduce on mobile. Inspect the exact request before making a code change.
- **Unpublished entries:** check public eligibility before adding to the hosted arcade, and never expose private game builds just to make a raw URL turn 200.
- **Game-specific full playthroughs:** controls, endings, achievements, difficulty and long-session behaviour remain to be tested beyond these smoke checks.

## Re-run

```bash
cd repository-town
npm ci
npx playwright install chromium
# Check each packed edition from a local HTTP server:
python3 -m http.server 8733
# In another shell:
node tests/all-games-audit.mjs --origin http://127.0.0.1:8733 --shard 0/8
# Check only genuinely published live games (all eight shards):
node tests/all-games-audit.mjs --origin https://repository-town-claude-complete.vercel.app --shard 0/8 --published-only
# Targeted repaired-game checks (with the local server running):
node tests/tile-rpg-browser.mjs
node tests/arcade-repair-browser.mjs
```

The `.github/workflows/all-games-local-playwright.yml` and `.github/workflows/all-games-playwright-audit.yml` also support manual dispatch and preserve the diagnostics in Actions logs, while the public-audit workflow uploads screenshots from the hosted public site only. The local workflow deliberately **does not upload screenshots** of non-public games.
