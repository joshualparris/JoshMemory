# Repository Town

**Fictional NSW location:** [−32.273600, 148.408400](https://www.openstreetmap.org/?mlat=-32.2736&mlon=148.4084#map=15/-32.2736/148.4084) west of Minore in the Dubbo–Narromine corridor. **1883 founding:** Repo's Stores on the future G8-N Town Hall site; Reginald Arthur Repo (later the fictional Sir Reginald) was the first in-universe mayor in 1909. [Full 1883–2026 history](docs/REPOSITORY_TOWN_HISTORY_1883_2026.md) · [real-world geography and 16-utility context](docs/REPOSITORY_TOWN_GEOGRAPHY_MASTERPLAN.md) · [numbered integration work](docs/REPOSITORY_TOWN_GEOGRAPHY_TODO.md). This is not a surveyed, verified vacant or council-approved property.

### RTGEO-003 real-ground planning check (25 October 2026)

NSW Spatial Services/NSW Planning GIS identifies the fictional anchor as **Lot 105 DP835474, Minore NSW 2830, Dubbo Regional Council**, zoned **RU1 Primary Production**. This is **not cleared for physical town development**; the owner, land vacancy and current aerial occupancy remain unverified. [Read the exact cadastre/zoning audit](docs/RTGEO_003_SITE_AND_ZONING_AUDIT_2026-10-25.md). The game's fictional 1883 founding, pub history and existing 234 building IDs stay unchanged. Site-alternative and current-imagery checks are [RTGEO-017/018](docs/REPOSITORY_TOWN_GEOGRAPHY_TODO.md).

## Repository Town founded in 1883

Walk into Town Hall (G8-N) and inspect the founding and geographic records. The 1883 shop is a *historic predecessor* of Town Hall, not an extra current building; live mayor Vern and all existing addresses remain unchanged.



A walkable 3D town of all 188 repositories in Josh's inventory (`docs/repository-town.json`).
Every house is designed from its own repository: a written brief records the evidence that was
inspected, the exterior, the floor plan, the furnishings and the exhibits you can use.

## Physical N/S address registry and map

The [readable physical plot atlas](src/address-map.html) uses the real game house inventory, town buildings, railway and farm fields. In a deployed build open `/address-map.html` or tap **Plot map**. Its 26 columns and 11 planning bands show **both** `N` and `S` for every column (e.g. `Z7-S` UpskillApp, `Z8-N` railway, `Z8-S` Farmhouse, `Z9-N` Macquarie Locksmith & Keys). Rows 9–11 are not asserted to be built streets. See [full physical land audit](docs/DIRECTIONAL_ADDRESS_AUDIT_2026-10-24.md). Legacy property keys and repository address links remain supported.

## Scoped follow-up triage: mobile dialogue, production and arcade

[**Start here: 22-item numbered acceptance queue**](docs/NEXT_ACTION_TRIAGE.md) — authoritative existing IDs, next task for this scoped queue `AUDIO-013.02`, scoped live-production dialogue fix, real ambient yarn X/mobile handset tests, audio-overlap regression and complete arcade game playtests. The two genuinely missing unique IDs `RTM-001/002` are defined in the [stable ID registry](docs/UNNUMBERED_TODO_IDS_2026-10-24.md). Parent `TASK-034`/`TASK-040` stay open until accepted. Check [COORDINATION](COORDINATION.md) before claiming work; never renumber existing tasks.

 ## NPC dialogue development roadmap

See the [93-task Skyrim-inspired NPC dialogue checklist](docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md) for character-specific branching, conditions, quest effects, per-NPC memory, ElevenLabs recording/caption reconciliation, accessibility, browser playtests and production release gates. Existing recorded dialogue remains the starting point; implementation tasks are not marked complete without evidence.

For the *next task after RTD-009* and a dependency-ranked crosswalk of **all 84 open RTD-010–093 items**, use [RTD follow-up triage](docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md). It preserves existing task identifiers and maps broader `TASK-032`–`TASK-045` parent work without duplicate tickets. **RTD-010 is the first suggested unclaimed implementation task**; check current coordination before claiming it.

See also the [stable ID index for previously unnumbered open Town tasks](docs/UNNUMBERED_TODO_IDS_2026-10-24.md).

**NPC individuality/crowd-fix triage:** [RTN-001–018 — per-task status, merge-conflict and alternative-host release plan](docs/RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md). **Next unfinished: RTN-007**; staged code is not yet live.

## Multi-floor tall buildings

Tall architectural exteriors now have two or three enterable floors, including V7 Private House, W7 SwordCoast and X7 Transfer lighthouses. A visible Floors control and stair/lift signs make upper levels easy to find. Floors 2 and 3 have different rooms and usable exhibits. See [the implementation and playtest guide](docs/MULTI_FLOOR_INTERIORS_2026-10-19.md). Source: `src/world/floor-plans.js` and `src/world/multifloor.js`. Focused test: `node tests/multifloor.mjs`.

## Layout

| Path | What it is |
|---|---|
| `briefs/row-1.json … row-8.json` | One design brief per repository (the master inventory of designs). |
| `src/` | The game: `engine/` (input, player, collision, save), `world/` (props, exteriors, interiors, town), `ui/`. |
| `vendor/` | Pinned three.js 0.160.1 build, so the game has no CDN dependency. |
| `tools/build.mjs` | Validates every brief, then writes `dist/public` (sanitised) and `dist/private` (full detail). |
| `tools/check.mjs` | Brief validation and the uniqueness gate. |
| `tools/check_privacy.mjs` | Fails if anything from a private repository appears in `dist/public`. |
| `tools/repo_data.py` | Turns `private/evidence.json` into `data/repo-data.json`: README, files, docs, live URLs and latest commit per repo, for the in-game archive. |
| `tools/harvest_evidence.py` | Re-reads local clones into `private/evidence.json` (git-ignored: it holds README text of private repos). |
| `tests/e2e.mjs` | Browser acceptance run on desktop and emulated Android. |
| `ACCEPTANCE.md` | 188-row checklist generated by `tools/acceptance.mjs` from briefs + test results. |

## Commands

```bash
npm install                 # three + playwright (set PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 if browsers exist)
npm run check               # validate briefs and uniqueness
npm run build               # dist/public and dist/private
npm run check:privacy       # leak check of dist/public
node tools/serve.mjs dist/private 8091 &
npm run test:e2e            # walk into every house, desktop + mobile
node tools/acceptance.mjs   # regenerate ACCEPTANCE.md
```

## Uniqueness gate

`tools/check.mjs` refuses a build when a brief has fewer than 2 rooms, 8 props, 4 repository-specific
labels or 2 interactions, when two houses share an exterior signature (style, features, colours) or an
interior signature (layout, room count, prop multiset), or when two houses' prop vocabularies overlap by
more than 80%. Houses share a library of ~150 procedural props and 34 architectural styles; what makes
each house its own is the brief — which pieces, where, labelled how, and what they do.

## Repository Archive and toys

`toHouse` (tools/lib.mjs) appends a generated **Repository Archive** room to every house, after the
designed rooms and excluded from the uniqueness gate. Its nine exhibits are a computer (source), a
bookshelf (README rendered in-game), a terminal (file browser), a globe (live site or issues), a notice
board (latest commit), a card catalogue (docs), a lucky-dip chest (random file), a crystal ball (random
README line) and a dice tray (d4–d100, advantage). The behaviours live in `src/ui/archive.js` and load
`repo-data.json` on first use. The room attaches to the first free wall that leaves every designed prop
room to fit (`attachRoom` in src/world/interior.js).

Plain furniture that suits play also becomes a toy, built from the house's own content: card tables deal
its exhibits, map tables spin its rooms, radios play a per-house tune, arcade cabinets keep a best score
(`addToys`, up to six per house).

## Automated arcade playtesting

[Arcade Playtest QA](qa/README.md) adds an opt-in Skyvern browser-agent recipe and a Playwright runner for recorded observations. It can test all matching editions of AA Game Adventure and Mysterious Depths (or the whole catalogue), save before/after screenshots, report real runtime errors and preserve unanswered UX/balance questions for review. The GitHub Action is manual only; no player-facing telemetry or paid AI is required.

## Playable games

`data/games.json` lists every repository game that runs in a browser (59 so far). `tools/pack_games.mjs`
packs each into `games/<id>/` from local clones, and the house gets an Arcade with one cabinet per game:
✋ then ▶ Play opens it full-screen over the paused town, and "✕ Back to town" returns.

- **static**: the game folder is copied, then made to run from a folder and from `file://`. Module
  scripts are bundled inline, network widgets are stripped, and `tools/game_runtime.js` is injected
  first. The runtime serves the game's text files to `fetch`/XHR, stubs `PortalAdapter`, and guards
  `history`. Games marked `inlineImages` get their images as data URIs so WebGL can use them.
- **vite**: built from source in a scratch copy (`npm ci`, `vite build --base ./`), then packed as
  static. `hashRouter` swaps React Router's BrowserRouter for HashRouter in that copy only.
- **python**: terminal adventures run in Brython (`games/_python`, offline) behind
  `tools/python_terminal.html`. `input()` cannot block in a browser, so every command replays the
  game from the start with the same random seed, which also makes saving automatic. Data files are
  packed in and `open`/`pathlib` read them.

```
GAME_SOURCES=/home/user,<clone dir> node tools/pack_games.mjs [--only id,id]
node tests/games.mjs [--only id,id] [--shots dir]   # loads every game from file://
```

Games marked `online` load libraries from a CDN and need a connection. Repositories that are not
playable yet are listed in the `note` field of `data/games.json`, each with the reason.

## Privacy

`dist/public` is the only deployable build. Private repositories keep their architecture and
owner-approved repository name, but lose their summary, room names, labels and exhibit text; their
exhibits become generic toggles. The leak check scans the built files for private slugs, URLs and every
free-text string written in a private brief (strings a public brief or public README also uses are
ignored). The public archive only carries public repositories, with private slugs and names in their
READMEs redacted.

## Deployment and saved progress

Canonical source: `main`, `repository-town/`. See [hosting and release policy](docs/HOSTING.md).

- Main game: https://repository-town-claude-complete.vercel.app/
- Staging: https://repository-town-claude-playtest.vercel.app/
- Backup: https://parris-tech-services.github.io/Repository-town/

Run `npm run build:release` before publishing. Every host uses **only** `dist/public`.
`release.json` identifies the exact source commit and SHA-256 fingerprint of all deployed files.
`release.html` displays that version and transfers allowlisted saved progress between origins.
Never deploy `dist/private`, standalone private releases or raw evidence.

NPC chat uses the shared Cloudflare endpoint in `deploy/hosting.json`; Groq credentials and
rate limits stay on that Worker. The older Vercel PIN-gated API is retained for compatibility,
but the public game does not require a PIN. Scripted replies remain available offline.

## Adventure Guild exploration mode

Twelve discoverable glowing relics are situated outside public houses, each with a puzzle and collectible reward. Open the Quest Journal with J, earn Compass and Lens milestones, visit houses for badges, and claim the final Guild Vault crown. Local-first: progress is in the user's browser storage and no AI calls are made for quests. See `src/adventure/`. Run `node tests/expedition.mjs` to validate. The Guild Chest starts near M4.

## Realism upgrade — causal power network

The first stage of the Replit-guided realism upgrade adds a ten-line electricity distribution graph, with capacity-limited supply for the clinic, water pumps, wastewater plant, businesses and two neighbourhood feeders. Unlike the earlier single-town percentage, a failed feeder identifies the **specific customers affected**. The Town Ledger and Town Hall show delivered/required units, line capacity and a training scenario with a funded council repair. Water pumping, wastewater treatment and food production use their individual electrical connections.

Use `npm run test:town` for both the existing 14-day town regression and the new fault, network conservation and save-migration tests. Technical limits and the rest of the roadmap are documented in [docs/REALISM_INFRASTRUCTURE_2026-10-19.md](docs/REALISM_INFRASTRUCTURE_2026-10-19.md). This is a deterministic fictional capacity model, **not an electrical engineering model or a completed town digital twin**.

## Living Town prototype (in review)

The civic simulation is grounded in a single, deterministic, offline-first model:
a **72-real-minute town day at 1× speed** (24 simulated hours; 3 real seconds per town minute), 20 reserved empty street-8 lots with civic
buildings, a Town Ledger, community bank, mayoral voting, the post office,
basic industry, agriculture, retail supply chains, power, treated water,
sewage, refuse collection and recycling. Visitor Town Credits and town state
are stored in your browser (no account required). A service failure affects
production; the council can spend funds and spare parts to fix it.

Open **🏛️ Town Ledger** from the HUD. You can check the current mayor and
public budget, trace bread from farm to shop, buy goods, deposit/withdraw
credits, vote, post a letter, sort recyclables and simulate/repair a water
main fault. Use it on Android without needing to type access codes.

Test the pure simulation from the repository-town directory:

```bash
node tests/town-simulation.mjs
```

**Scope note:** the first release is a systems prototype. Although the
NPC schedules are visible in the Ledger, existing 3D NPC pathfinding, interior
civic buildings, exact cargo truck routes and true utility pipe/cable
networks are **not yet wired into it**. The town log is deterministic and
the delivery truck models are currently decorative. See
[docs/LIVING_TOWN_MASTERPLAN.md](docs/LIVING_TOWN_MASTERPLAN.md) for the
complete buildout and scenario acceptance checks. Continue to run the
normal build, privacy check and desktop/Android browser suites before public
deployment.

## Lighting task triage

[Central lighting tasks RLT-001–019](docs/UNNUMBERED_TODO_IDS_2026-10-24.md#lighting-tasks-and-release-triage): current **RLT-011** to finish browser publication and open the PR; browser write access, reconciliation and local validation (RLT-008–010) are verified. Then review/merge, deploy and verify. RLT-001–007 retain their original audit IDs and local-only verification status.

## Whole-portfolio master agent queue

For tasks collected from all twenty agents, use [the portfolio master triage](../docs/MASTER_20_AGENT_TRIAGE_2026-10-25.md) and [globally ordered register](../docs/MASTER_20_AGENT_EXECUTION_QUEUE_2026-10-25.csv). The local NPC dialogue, collisions and mobile QA queues remain authoritative within their scope. The updated global queue begins with **SylvieApp `SVA-008`**, and DCS-only work is deferred; it **does not renumber** Town's original IDs or claim new runtime work complete.

## Electrical baseline audit — RTU-001

[Completed source/runtime audit](docs/RTU_001_ELECTRICAL_AUDIT.md): all 234 registered locations, per-property coverage CSV, deterministic probes and confirmed demand/lighting/save gaps. Reproduce with `node tools/audit-electricity.mjs --check`. RTU-001's baseline alone added no gameplay, but [RTU-003/004/005](docs/RTU_003_005_ELECTRICAL_BACKBONE.md) now provides the 234-site designed utility network. A subsequent [16-property live-game electrical pilot](docs/RTU_006_013_PUB_ELECTRICAL_PILOT.md) implements independent meters, 3D wiring, selectable rooftop solar/battery, hotel/pub/shop/household outages, realistic illustrative load profiles and responsive appliances. **⚡ Grid** is the in-game inspector. [Isolated playable QA site](https://parris-tech-services.github.io/Repository-town-playtest/qa/electric-grid-20261025/) has distinct browser storage, and is NOT production. RTU-006/007/011/012/013 remain OPEN for full-town expansion; RTU-002 research remains separate. See [whole-town utility plan](docs/UTILITIES_MASTERPLAN_2026-10-25.md).

## Utility system IDs and sewerage research

[RT-SYS-001–016 system register](docs/UTILITY_SYSTEM_REGISTER.md) covers utilities and supporting services, preserving all prior task IDs. Electricity research: dedicated ChatGPT session; water: Manus; sewerage/plumbing: this research strand. [Sewerage research](docs/SEWERAGE_RESEARCH_2026-10-25.md) selects Narromine provisionally, traces toilets through treatment and specifies water/power contracts. [RTSW-001–028 queue](docs/SEWERAGE_TASKS.md): research 001/002 complete; implementation starts RTSW-003; RTU-022–024 remain open. [Primary sources](docs/SEWERAGE_SOURCES.md). No new sewer gameplay deployed.

## One-building connected utilities pilot

[Merged Branch pub audit, evidence, model assumptions and RTPUB-001–008 roadmap](docs/PUB_UTILITIES_PILOT.md). Runtime belongs to JoshMemory/repository-town; research copies do not imply a live release or complete town network.

## Stormwater roadmap cross-repository handover (25 October)

The parent [RTU utilities masterplan](docs/UTILITIES_MASTERPLAN_2026-10-25.md) now links the 30-task [RT-SYS-004 / RTSM stormwater roadmap](https://github.com/joshualparris/NSWutilities/blob/main/docs/STORMWATER_TASKS.md) and [16-system roadmap audit](https://github.com/joshualparris/NSWutilities/blob/main/docs/UTILITY_ROADMAP_AUDIT_2026-10-25.md). Tasks are defined canonically in NSWutilities so different AI agents do not create competing identifiers. RTSM-003 is the first unclaimed implementation starting point; no stormwater gameplay is claimed as shipped.

## NSW October 2026 pub building-code audit

The Merged Branch (`B:pub`, `N8-S`) was assessed against **NSW NCC 2022 Amendment 2** and 2026 food, liquor, plumbing, fire/accessibility and operational evidence on 25 October 2026. [Full source-based audit](docs/PUB_NCC_2026_COMPLIANCE_AUDIT.md), [34 permanent follow-up tasks RTPUB-001–034](docs/PUB_NCC_2026_TODO.md), [machine-readable audited observations](audit/pub/2026-10-25-code-matrix.json). **Not certifiable as modelled:** missing dedicated kitchen, toilets, assessed egress/accessible route/fire measures, utility services and external/internal shell consistency. This is a *fictional game implementation audit*, not a real building compliance certificate or live playtest. Do not mark work complete until acceptance evidence exists; the static CI only validates source freshness.

[Direct lunchtime pub QA launcher](https://parris-tech-services.github.io/Repository-town-playtest/qa-tests/pub-utilities.html) and [remaining RTPUB-008.01–008.16 physical utility implementation](https://github.com/joshualparris/NSWutilities/blob/main/docs/PUB_UTILITIES_NEXT_IMPLEMENTATION.md). This is an isolated QA release, not the quota-blocked Vercel production alias.

### RTPUB-001 completed as classification research (25 Oct 2026)

[NSW Class 6/approval and building-age evidence](docs/PUB_RTPUB_001_CLASSIFICATION_2026.md) is complete for the **fictional** The Merged Branch at N8-S. This does **not** claim code compliance or real DA/CC/OC. Task references now qualify the collision between **PUB-CODE/RTPUB-001–034** and pre-existing **PUB-UTIL/RTPUB-001–008** without renumbering. Updated [audit](docs/PUB_NCC_2026_COMPLIANCE_AUDIT.md) accounts for the separately merged [pub utilities pilot](docs/PUB_UTILITIES_PILOT.md); code tasks 002–034 remain open.

## The Merged Branch — established 1911

The fictional N8-S pub was **built in 1911**, opened **1912** as the *Branch Line Hotel*, and took the name *The Merged Branch* in **2019**. [History, NSW-era comparators and regulatory limitations](docs/PUB_FICTIONAL_HISTORY_1911.md). There is now an **EST. 1911** plaque with a game interaction and period-inspired brick façade. This does not invent permits, heritage listing or completed accessible/fire/kitchen code approval. [RTPUB audit and outstanding work](docs/PUB_NCC_2026_TODO.md).
