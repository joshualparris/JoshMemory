# ChatGPT economy — verbatim snapshot of the live site (20 Oct 2026)

Taken from Parris-Tech-Services/repository-town (GitHub Pages) at commit 2d97065. That economy
(finite wallets, TownMoney/TownFinance, PAYG tax, rent and utilities, loans and interest, bakery
production panel) was only ever pushed to the site repo, never to this source repo. Stored here so
it is not lost. It is NOT wired into the build: it conflicts with the economy on main (council
treasury, sales tax, bank, simulation-soak) and needs a deliberate merge. Key new files:
world/money.js, world/finance.js, world/bakery-production.js, ui/economy-panels.js, ui/bakery-panel.js.
Tests: tests/economy.mjs, tests/economy-realism.mjs. Docs: docs/TOWN_ECONOMY_*.md.
