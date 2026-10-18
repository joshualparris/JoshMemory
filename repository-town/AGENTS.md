# Repository Town — instructions for every agent (Claude, Codex, ChatGPT, Copilot …)

Several AI sessions work on Repository Town at the same time for Josh. They cannot
message each other, so **this file and `COORDINATION.md` are how we talk**. Read both
before changing anything, and update `COORDINATION.md` when you start and finish work.

## One source of truth

| What | Where |
|---|---|
| Source code (edit here) | `JoshMemory` repo, branch `ccr-846db548-0l5zmu`, folder `repository-town/src/` |
| Build + checks | `repository-town/tools/` (`build.mjs`, `check_privacy.mjs`, `pack_games.mjs`) |
| Packed games | `repository-town/games/` (made by `tools/pack_games.mjs`, from each game's own repo) |
| Live playtest site | `Parris-Tech-Services/Repository-town` → https://parris-tech-services.github.io/Repository-town/ |

The site repo holds **generated build output** (`dist/public`). Do not edit it by hand:
the next publish replaces it from `src/`, and hand edits there are lost unless someone
ports them back. If you must hot-fix the live site, make the same change in `src/` in the
same sitting and say so in `COORDINATION.md`.

## Workflow

1. `git fetch` and merge the latest branch before starting (never rebase or force-push
   shared branches; other sessions push to them too).
2. Edit `repository-town/src/` (and `tools/`, `tests/`, `data/` as needed).
3. `node tools/build.mjs && node tools/check_privacy.mjs` — the privacy check must pass.
4. Test what you touched; the suites (Playwright, Chromium at `/opt/pw-browsers` where
   available):
   - `node tests/e2e.mjs --only A1,M5` — walk into houses, use every exhibit, walk out
     (desktop + emulated phone).
   - `node tests/people.mjs` — villagers walk, stop, chat; residents wander.
   - `node tests/npc.mjs` — resident chat, Groq key handling (Groq stubbed).
   - `node tests/games.mjs` — every packed game loads from file://.
   - `node tests/streetwalk.mjs` — walk every street and avenue on foot.
   - `src/tests/expedition.mjs` — Expedition Guild relics (run from `dist/public`).
5. Commit with a clear message, push to `ccr-846db548-0l5zmu`.
6. Publish: copy `dist/public/` over the site repo's files (keep its `README.md`,
   `AGENTS.md`, `.nojekyll`), commit, push `main`. If the push is rejected, someone else
   published: fetch, port their changes into `src/`, rebuild, publish again.

## Rules that protect Josh

- **Privacy:** the public site and its repo never contain private repository names, URLs,
  READMEs or text. `tools/check_privacy.mjs` enforces it; never bypass it. The offline zip
  (`release/Repository-Town.html`) is Josh's private copy with real names.
- **No secrets in code or repos.** Groq API keys live only in each player's browser
  (`localStorage`, via the chat panel or a `#groq=` link). Never commit keys.
- Keep GitHub Actions usage minimal (Josh asked); test locally.
- Do not edit other game repositories to make the town work; record the problem instead
  (see `data/games.json` → `note`).

## Map of the code

- `src/main.js` — game loop, town/house modes, panels, test hook `window.__town`.
- `src/world/` — `town.js` streets and lots, `exterior.js` 34 house styles, `interior.js`
  rooms and props, `props.js` ~150 props, `npcs.js` villagers and residents.
- `src/ui/` — `interactions.js` exhibit behaviours, `archive.js` README/files/docs,
  `npc.js` resident chat (Groq + offline replies).
- `src/adventure/` — Expedition Guild: 12 relics, puzzles, Quest Journal, compass.
- `briefs/` — the 188 house designs; `tools/lib.mjs` turns them into houses.
