# Chronicles of the Sword Coast

A modular browser RPG rebuilt from a truncated legacy snapshot.  
**Repository:** [github.com/joshuaparris/SwordChronicles](https://github.com/joshuaparris/SwordChronicles)

## Run locally
1. Open a terminal in this folder.
2. Start a local server:
   - `python -m http.server 8765`
3. Open `http://127.0.0.1:8765/index.html` in a browser.

## Deploy (public web link)

The game is **static files at the repo root** (`index.html`, `src/`, `styles/`, `assets/`). There is no build step.

### Vercel (typical)

1. Sign in at [vercel.com](https://vercel.com) and choose **Add New… → Project**.
2. **Import** [github.com/joshuaparris/SwordChronicles](https://github.com/joshuaparris/SwordChronicles) (or your fork). Use the repo that contains this full tree, not an empty README-only repo.
3. Settings: **Framework Preset** → **Other**. Leave **Root Directory**, **Build Command**, and **Output Directory** all **empty**.
4. Deploy. Your play link will look like `https://<project-name>.vercel.app/` (Vercel may also assign a `*.vercel.app` preview URL).

If you see **404 NOT_FOUND**, the connected project is still not this codebase—open the deployment **Source** tab and confirm `index.html` is listed at the top level.

### Netlify

**Add new site → Import an existing project** from the same GitHub repo. Set **publish directory** to `.` (or leave default if Netlify detects a static root). Deploy; you get a `*.netlify.app` URL.

### GitHub Pages (optional)

Enable **Pages** in the repo **Settings → Pages**, source **Deploy from branch** `main` and folder **`/` (root)** if available, or use a static workflow. Paths in this project are relative (`./styles/…`), so a project Pages URL like `https://<user>.github.io/SwordChronicles/` works once `index.html` is served from that path.

## Project structure
- `index.html`: app shell and UI containers.
- `styles/main.css`: core styling (recovered + patch updates).
- `src/main.js`: gameplay loop, UI actions, dialogue, encounters, crafting, boss flow.
- `src/core/*`: dice, save/load, state helpers.
- `src/data/*`: races, classes, spells, items, recipes, NPCs, locations, quests.
- `src/ui/render.js`: screen rendering and sidebar/action panel rendering.
- `legacy/DNDGAME_snapshot_truncated.html`: preserved legacy extraction.
- `PLAN.md`: phased roadmap.
- `BUGS.md`: source integrity issues from the legacy snapshot.

## Save data
- Save key: `chronicles_sword_coast_save`
- Schema version: `1`
- Save payload includes `version`, `savedAt`, and serialized `state`.

## Content authoring
Add or edit content in `src/data/*`:
- New NPCs: `src/data/npcs.js`
- New locations/encounters/boss tuning: `src/data/locations.js`
- New quests: `src/data/quests.js`
- New items/shop entries: `src/data/items.js`
- New crafting recipes: `src/data/recipes.js`
- New spells/classes/races: corresponding data files

## Current gameplay coverage
- Title screen, new game, load game, help prompt
- Character creation
- Exploration and travel
- NPC interactions
- Turn-based combat with attacks, spells, potion, flee
- Side quest and main quest progression
- Crafting Warded Key
- Final boss fight and victory ending state
- Death/recovery path

## Known limitations
- No automated browser test harness yet.
- Encounter and dialogue depth is intentionally compact for this checkpoint.
- Balance tuning is baseline only and may need iteration.
