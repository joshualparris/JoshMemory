# Repository Town — instructions for every agent (Claude, Codex, ChatGPT, Copilot …)

Several AI sessions work on Repository Town at the same time for Josh. They cannot
message each other, so **this file and `COORDINATION.md` are how we talk**. Read both
before changing anything, and update `COORDINATION.md` when you start and finish work.

## Numbered RTD dialogue work — claim and checkpoint gate

Before any Skyrim-inspired NPC/dialogue, town social, quest or recorded audio implementation, consult [RTD-007 coordination and checkpoint protocol](docs/RTD_007_COORDINATION_CHECKPOINT_PROTOCOL_2026-10-24.md) and the [RTD-001–093 roadmap](docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md).

1. Read latest `main`, this file, `COORDINATION.md`, `WORK_CHECKPOINT.md` and all relevant open PRs. **Reserve exact RTD IDs and file paths on the coordination board in canonical GitHub before editing**; use content-SHA protection and do not overwrite another agent's claim. Old "in progress" lines can be historical — inspect the real PR status.
2. **Commit a start checkpoint before implementation**, then update and commit checkpoints after each meaningful milestone, before changing projects/interruption, and about every 10–15 minutes during prolonged active work. Record owner, branch, baseline/commit SHA, touched files, tests/evidence, incomplete items, blockers and exact resumption step.
3. Change only unclaimed scope on a topic branch. Only mark RTD IDs completed when evidence meets that individual acceptance. Review/test a PR before merging, confirm `main`, and **move your completed board claim to Done**. Do not pre-claim the next task for a future session.
4. Browser-audio asset availability, local browser playback, actual hosted-production playback, game-state consequences, mobile handset checks and deployed fingerprint are **different** acceptance levels. Never equate them or bypass privacy checks. Do not edit generated site repos.

## One source of truth

| What | Where |
|---|---|
| Source code (edit here) | `JoshMemory` repo, branch `main` (use a reviewed integration branch for simultaneous changes), folder `repository-town/src/` |
| Build + checks | `repository-town/tools/` (`build.mjs`, `check_privacy.mjs`, `pack_games.mjs`) |
| Packed games | `repository-town/games/` (made by `tools/pack_games.mjs`, from each game's own repo) |
| Production game | https://repository-town-claude-complete.vercel.app/ |
| Shared staging | https://repository-town-claude-playtest.vercel.app/ |
| Generated backup | `Parris-Tech-Services/Repository-town` → https://parris-tech-services.github.io/Repository-town/ |

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
   - `node tests/life.mjs` — town life: a full day's routine and supply chain, trucks
     braking, day/night, the guide, shop counters, Town Ledger, gossip and relic hints,
     residents going to the kitchen at dinner, sound.
   - `node tests/people.mjs` — villagers walk, stop, chat; residents move about.
   - `node tests/npc.mjs` — resident chat, Groq key handling (Groq stubbed).
   - `node tests/npc-soak.mjs` — a whole simulated day: no villager stuck, inside a building or
     on top of another; sleep and work routines; street characters clear.
   - `npm run test:browser` — the browser suites CI doesn't run (it has no Chromium): exits,
     windows, NPC soak, people, life.
   - `node tests/games.mjs` — every packed game loads from file://.
   - `node tests/streetwalk.mjs` — walk every street and avenue on foot.
   - `src/tests/expedition.mjs` — Expedition Guild relics (run from `dist/public`).
5. Commit with a clear message to a topic branch; merge to `main` after tests and review.
6. Publish with `tools/publish_pages.sh <site-repo-checkout> "message"`. It rebuilds, runs the
   privacy check, keeps the site repo's own files, and refuses to publish if the live site has
   files that are not in the build (someone's hand edits — port them into `src/` first).

## Rules that protect Josh

- **Privacy:** the public site may contain owner-approved private repository names, but never
  their repository slugs, URLs, READMEs or private text. `tools/check_privacy.mjs` enforces it;
  never bypass it. The offline zip (`release/Repository-Town.html`) remains Josh's private copy
  with full details.
- **No secrets in code, repos, or browser storage.** Groq API keys live only on the server (`GROQ_API_KEY` in `api/npc-chat.js`, gated by `TOWN_NPC_PIN` / `x-npc-code`). Never commit keys or store raw `gsk_...` keys in `localStorage`.
- Keep GitHub Actions usage minimal (Josh asked); test locally.
- Do not edit other game repositories to make the town work; record the problem instead
  (see `data/games.json` → `note`).

## Map of the code

- `src/main.js` — game loop, town/house modes, panels, test hook `window.__town`.
- `src/world/` — `town.js` streets, lots, lamps and night windows, `exterior.js` 34 house
  styles, `interior.js` rooms and props, `props.js` ~150 props, `npcs.js` people figures and
  the residents' room-to-room planner, `life.js` the town simulation (clock, farms, mill,
  bakery, shops, trucks, train, 32 villagers' days — pure logic, no three.js),
  `townlife.js` draws it (high street and farms on G8–Z8, fields, animals, vehicles, sky).
- `src/ui/townpanels.js` shop/farm counters, Town Ledger, guide, gossip and relic hints;
  `src/ui/ambience.js` synthesised ambient sound.
- `src/ui/` — `interactions.js` exhibit behaviours, `archive.js` README/files/docs,
  `npc.js` resident chat (Groq + offline replies).
- `src/adventure/` — Expedition Guild: 12 relics, puzzles, Quest Journal, compass.
- `briefs/` — the 188 house designs; `tools/lib.mjs` turns them into houses.

## Oct 2026 protected integration workflow

See [docs/INTEGRATION_SYSTEM_2026-10-20.md](docs/INTEGRATION_SYSTEM_2026-10-20.md). NPC off-duty personalities now live in `src/ui/villager-profiles.js`. Never overwrite `main` using an older PR's `main.js` or `life.js`; bring only genuinely missing changes across and rely on the mandatory Town safety gate. Town auto-merge requires the explicit `town-automerge-approved` label and every check green.

## Consolidated hosting
Read `docs/HOSTING.md` and `deploy/hosting.json`. Use `npm run build:release` before publishing. Every public host must expose the same approved `release.json` commit and content fingerprint. No new permanent per-feature services. Preserve snapshots before retirement; offer save export on the old origin.
