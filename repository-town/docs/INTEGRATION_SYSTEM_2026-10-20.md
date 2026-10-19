# Repository Town: safe modular integration system (20 October 2026)

## Authority and scope
Canonical source: `joshualparris/JoshMemory/repository-town/src/`. Generated public site: `Parris-Tech-Services/Repository-town` via the existing publisher. Never overwrite main with a stale feature branch or copy `src/main.js` wholesale.

The 19 October realism audit was based on an older main commit. Its unique work was transplanted onto the current main as small changes; new council campaigns, published farmhouse, truck traffic, power grid and 87 multi-floor buildings were retained. The old audit branch stays untouched as provenance.

## Module ownership, for agents working simultaneously
| Boundary | Files | Owner concerns |
|---|---|---|
| Character identity | `src/ui/villager-profiles.js`, `npc-data.js` | Names, roles, moods and interests; **no rendering** |
| Truth and perception | `src/ui/npc-location.js`, `scene-awareness.js` | Verified whereabouts, nearby objects, no fabricated locations |
| Conversations | `src/ui/npc.js`, `npc-chat.js`, `npc-prompt.js` | UI, offline answers, AI payload and prompting; keep API secrets server-only |
| Simulation | `src/world/life.js`, `government.js`, `public-forum.js`, `power-grid.js` | Clock, wallets, votes, materials, jobs and events |
| Physical world | `src/world/townlife.js`, `npcs.js`, `floor-plans.js`, `multifloor.js` | World geometry, routes, interiors and collision |
| Integration | `src/main.js`, `tools/build.mjs` | Imports, game loop, public/private build; designated integrator only |

Before editing shared files, check `COORDINATION.md`. Prefer adding a new module with one public interface rather than creating overlapping patches in the large game loop or simulation.

## Automatic protection
1. Make an appropriately named feature branch from **current main**. Never push directly to `main`.
2. Open a PR that explains changed modules, impacted NPCs and tests. Draft PRs skip the expensive Town safety gate.
3. `Repository Town Integration` runs Node 22, all offline NPC contracts, realistic town/economy/politics/traffic tests, the public/private build, privacy check, packed game integrity. It cancels obsolete runs for the same PR.
4. The general Python/Docker `CI` ignores **town-only** changes; mixed changes still run it. That saves GitHub Actions minutes without disabling Repository Town checks.
5. If **all** checks are complete and green, the branch is mergeable, and an owner has applied the `town-automerge-approved` label, the `Repository Town Opt-in Merge` workflow can squash merge the PR. It never merges drafts, forks, external-file changes, conflicts or stale SHAs. No label means **manual merge only**.
6. Publishing is a distinct gate: run `tools/publish_pages.sh`, verify GitHub Pages has deployed the exact commit, and smoke-test mobile/desktop before declaring the release successful.

## Branch audit, no automatic deletion
Choose Actions > **Repository Town Branch Report** > Run workflow to produce a read-only summary of all town-related branches. Or locally, after `gh auth login`:

```bash
GITHUB_REPOSITORY=joshualparris/JoshMemory node repository-town/tools/integration-report.mjs
```

Interpret `ahead=0` as already contained; **diverged** means review changes, not force merge. A previously cherry-picked feature may be functionally present despite a divergent commit graph. Do not delete branches or merge them solely to eliminate the "ahead" count.

## Special cases
- `feat/town-snapshot-integrity-20261019` / PR #33 was an **open draft** at system setup: keep it separate until its migration and save compatibility are verified. Older branches for government, farmhouse and multi-floor contain substantial features already present on current main, so do not overwrite newer equivalents.
- Integration and deployment are deliberately separate: protected main `→` generated public site; never let an auto-merge job deploy a leaked private repo to a public site.
- Real Android keyboard, walking, interacting, collision and long-term AI behaviour still require browser/device playtests; unit/build checks do not prove them.
