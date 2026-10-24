# Automated arcade playtesting

Repository Town has **two complementary arcade test methods**. Both use the existing library at `arcade.html`; neither adds AI cost, tracking or controls to the child-facing arcade.

## 1. Built-in Playwright runner (repeatable, no Skyvern account)

From the **canonical** `joshualparris/JoshMemory/repository-town` directory:

```bash
npm ci
npx playwright install chromium
# Test the published site, all exact-title matches (two editions of each):
node tests/arcade-agent-playtest.mjs --url https://repository-town-claude-complete.vercel.app/arcade.html --games "Mysterious Depths,AA Game Adventure"
# Local build, after running the static server:
node tests/arcade-agent-playtest.mjs --url http://localhost:8091/arcade.html --games "Mysterious Depths,AA Game Adventure" --mobile
# Whole catalogue (up to 20 actions each, potentially a long run):
node tests/arcade-agent-playtest.mjs --url http://localhost:8091/arcade.html --games ALL --max-actions 5
```

To build/serve the local version first, use `npm run build` then `node tools/serve.mjs dist/public 8091` in a separate terminal. For a public release, the full privacy and release gates still apply.

For each exact matching card, the runner clicks **Play**, validates the iframe, tries up to 20 safe DOM/keyboard interactions, captures initial/final snapshots and before/after screenshots, checks JavaScript and same-origin HTTP errors, and exits back to the arcade. Duplicate game titles produce separate entries with unique game IDs, not one combined verdict.

**The evidence limitation matters:** generic scripted interactions can observe loading failures and runtime errors, but cannot reliably judge fairness, game feel, whether an ending is actually reached, or the pixels of a canvas game without further review. The JSON correctly leaves `balance_issues` and unobserved UX complaints empty. Inspect the screenshots, exact interaction history and actual game-specific outcome before treating a game as thoroughly playtested.

Output: `test-results/arcade-agent-playtest.json` and `test-results/arcade-evidence/`. A non-zero exit indicates a missing/unplayable game or observed runtime failure. Screenshot names are per game ID, so both JoshHub editions remain distinct.

## 2. Skyvern AI browser-agent workflow (optional external service)

`qa/skyvern-arcade-playtest.workflow.json` is the **Skyvern version 2 workflow definition** based on Josh's supplied recipe. It loops over `game_titles`, uses the `skyvern-3.0` browser agent to search/open/play a game, and extracts `game_title`, `game_id`, `playable`, progress, bugs, UX, balance and a summary. Its default `arcade_url` is production.

Import it in your own Skyvern workflow workspace, review the settings, connect a browser agent and execute there. The file **does not create a Skyvern account, schedule runs, or execute anything simply by being committed**. Browser-agent usage may incur provider charges. No Skyvern keys are committed. Unlike the Playwright runner, the supplied per-title agent currently tests the first edition it selects; inspect `game_id` and run additional editions separately if needed.

## GitHub Actions

Open `Actions → Repository Town Arcade Playtest (manual) → Run workflow` **after the workflow has been merged to the default branch**. Select a staging/production URL and the game titles; optionally choose the mobile viewport. Reports and screenshots are uploaded as workflow artifacts. This workflow runs **only on manual dispatch**, not on every commit, to avoid exhausting the Actions budget. If Actions minutes are unavailable, use the local runner or Skyvern workflow directly.

## Ground-truth acceptance

A QA record is complete only after the actual report, browser logs/screenshots, specific game build/source revision, and playable user flow were checked. Automated findings are **evidence**, not a declaration that an untested game is bug-free. Follow up bugs in the appropriate *source game* repository, rather than editing the generated Repository Town backup. Keep generated build output and the public privacy gate untouched.
