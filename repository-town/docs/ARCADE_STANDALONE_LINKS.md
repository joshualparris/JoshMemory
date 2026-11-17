# Play Patch Tuesday and Throughput

Both are original single-file browser games, hosted as public, separately deployed Vercel projects. These links load **playable games**, not GitHub source viewers:

| Game | Play now | Source directory |
|---|---|---|
| Patch Tuesday | https://patch-tuesday-game.vercel.app/ | `repository-town/game-src/patch-tuesday/` |
| Throughput | https://throughput-factory-game.vercel.app/ | `repository-town/game-src/throughput/` |

Automated live browser smoke test: `.github/workflows/standalone-arcade-live.yml`, using `.github/scripts/standalone-arcade-smoke.cjs`. This tests an HTTP 200, page title, rendering canvas, gameplay start, lack of uncaught JS errors, Patch Tuesday pause/resume, and Throughput save/continue after reload.

The packed arcade copies remain under `repository-town/games/<id>/`, where the Repository Town packer expects them. The source copies are self-contained HTML games that work on standalone static hosting.

Do not replace these play URLs with `github.com/.../blob/...` URLs, which only display code.
