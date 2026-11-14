# FaithHub values alignment & portfolio simplification verification (14 November 2026)

Scope: `VAL-001`, `VAL-002`, `VAL-003`, and safe empty-placeholder archival under `VAL-019` / `VAL-021`.

## 1. Applied pre-task gate (`VALUES_PRETASK_GATE.md`)

- **Real-life value protected:** Unhurried Christian spiritual formation, genuine Sabbath rest without productivity pressure, and consent boundaries around family and community prayer notes.
- **Possible displacement:** Removed default progress-bar and rhythm-count cues inside `Parris-Tech-Services/FaithHub`; added zero-storage stillness flows so quiet rest never requires maintaining an app streak or log.
- **Existing system checked:** Audited all 13 root static HTML surfaces, 10 ESM modules, and the secondary React companion in `Parris-Tech-Services/FaithHub` rather than creating a new project.
- **Smallest useful action:** Default `FaithHub` to Presence-over-performance mode (`VAL-001`), add zero-storage Sabbath stillness and unlogged rest flows (`VAL-002`), reconcile storage/export/consent boundaries (`VAL-003`), and archive only verified empty placeholder repositories (`VAL-019` / `VAL-021`).
- **Stop condition:** 100% pass across `FaithHub` Node regression tests, clean Vite build, live GitHub Pages SHA match, and `JoshMemory` validator/privacy pass.
- **Human outcome:** Deeper faithfulness, more presence, reduced performance burden, and clearer privacy/consent protection.
- **Evidence required:** Unit/VM regression suite, Vite build, live GitHub Pages deployment SHA check, and GitHub REST archival confirmation.
- **Decision:** `build` (targeted simplification and boundary hardening in existing `Parris-Tech-Services/FaithHub` + archival of 3 empty placeholder repositories).

## 2. Verified `Parris-Tech-Services/FaithHub` delivery (`VAL-001`, `VAL-002`, `VAL-003`)

- **Commit SHA (`main`):** [`f3b942932362e4ec86fa7fb90f176b5cc38e4a2d`](https://github.com/Parris-Tech-Services/FaithHub/commit/f3b942932362e4ec86fa7fb90f176b5cc38e4a2d)
- **Live GitHub Pages verification:** `https://parris-tech-services.github.io/FaithHub/` verified serving `<meta name="faithhub-deploy-sha" content="f3b942932362e4ec86fa7fb90f176b5cc38e4a2d">`.
- **CI & witnessed acceptance runs:**
  - `Deploy FaithHub to GitHub Pages`: run `43554964272` (`success`)
  - `Live FaithHub Pages browser acceptance`: run `43555002075` (`success`, real Chromium mobile + desktop against live GitHub Pages bound to `f3b942932362e4ec86fa7fb90f176b5cc38e4a2d`)
  - `AgentWitness actual FaithHub acceptance`: run `43554964263` (`success`, 64/64 Node tests, Chromium Psalms journey, and Vite production build)
- **Delivered changes:**
  - **`VAL-001`:** Enabled **Presence over performance** by default in `index.html` and `src/App.jsx` (`preferences.presenceMode !== false`), hiding `#meterWrap` and completion fraction pills unless explicitly opted into in Appearance/Settings.
  - **`VAL-002`:** Added **Unlogged Stillness & Sabbath Sanctuary** flows (`Sit in open silence`, 1/3/5-minute quiet pauses, and Scripture stillness anchors) in `index.html` and `src/App.jsx` with strictly zero `localStorage` writes (verified by VM spy assertions in `scripts/values-formation.test.mjs`), and tucked Sabbath checkboxes behind an optional disclosure.
  - **`VAL-003`:** Published [`docs/privacy-consent-audit-2026-11-14.md`](https://github.com/Parris-Tech-Services/FaithHub/blob/f3b942932362e4ec86fa7fb90f176b5cc38e4a2d/docs/privacy-consent-audit-2026-11-14.md); reconciled 2 unindexed `faithhub-*` `localStorage` keys (`faithhub-cornerstone-journal-v1`, `faithhub-cornerstone-drive-private-v1`) and Cornerstone/Drive podcast ID restore validation in `assets/backup-centre.mjs` (14 audited storage types total, guarded by repo-wide key scanning in `scripts/backup-centre.test.mjs`); and added Family & community consent guidance, a shared-screen veil toggle, and a confirmed clear control.

## 3. Safe empty-placeholder repository archival (`VAL-019` / `VAL-021`)

Inspected all 13 candidate stub repositories before taking action. Only the **3** repositories whose own `README.md` explicitly identified them as empty/deprecated placeholders recommended for archive were archived via the GitHub API on `2026-11-14T03:51:19Z–20Z`:

1. `Parris-Tech-Services/AnchorFlow` (`archived=true`, 1 commit, placeholder `README.md` only)
2. `Parris-Tech-Services/JoshChess` (`archived=true`, 1 commit, deprecated placeholder `README.md` only)
3. `Parris-Tech-Services/skills` (`archived=true`, 2 commits, placeholder `README.md` + `podcasttodo.md` superseded by `Parris-Tech-Services/FaithHub`)

The remaining 10 small/backup repositories (`alfie`, `migration`, `troubleshoot`, `Prompt-Linker`, `NextJS-Expert`, `openclaw-workspace`, `openclaw-workspace-private`, `demo-repository`, `a`, `newfileqqqwertuhvgjkk.py`) were verified to hold real code, archives, or workspace state and were intentionally left active.
