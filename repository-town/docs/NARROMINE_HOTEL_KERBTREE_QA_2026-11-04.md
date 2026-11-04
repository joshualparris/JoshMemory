# Narromine Hotel Dandaloo kerb tree — location-gated QA

**Evidence scope:** Narromine Hotel, 116 Dandaloo Street, Lot 13 DP519453, mapped by NSW cadastre and the Dandaloo Street frontage. No third-party photos distributed.

**Background:** The game's South Dandaloo tree rows were generated at regularly spaced positions, not observed sites. Another agent's merged PR #365 removes those and analogous unsurveyed north trees, lamps, poles and parking markings. This small follow-on fixes a separate tree in the hotel's site-specific renderer.

**Actual Playwright/WebGL evidence:** Run [41808970795](https://github.com/joshualparris/JoshMemory/actions/runs/41808970795) rendered three frontages at 1280x800 and 393x852. In both the north-front images, the hotel-owned simulated tree at local hotel `s=21.5,w=-5.1` blocked multiple hotel windows. Its stem location was **not independently grounded** by an object base visible at that exact position in the user's supplied Street View comparisons. The hotel builder originally included two trees with local `s=21.5,33.8`, but the note merely referenced a range of historical comparison frames rather than documenting a separate tree for each point.

**Fix:** Do not invent a trunk at `s=21.5`. Keep only the northern-end, photo-referenced `s=33.8` tree, with approximate crown size. Retain all four aerial-traced rear trees, exact hotel geometry, verandah, poles, signs and street collider. No edits to any adjacent hotel or the already merged street-plan and north-median changes.

**Rule:** Approximate canopy dimensions are acceptable when a *real tree at this specific location* is shown by dated evidence. A photo of a tree somewhere along a road cannot justify another invented trunk a few metres away. Further precision requires a geolocated street-level trunk photo/NSW aerial tree crown centroid and observation date. If `s=33.8` itself is later contradicted, correct or remove that candidate on evidence.

**Acceptance:** `node tests/narromine-hotel-observed-kerbtrees.mjs` checks current North/South strict furniture plan, the preserved northern tree and four aerial hotel trees. `node tests/narromine-hotel-tree-browser.mjs` captures 3 hotel views across desktop and Android sized Chromium with real Three.js WebGL and no browser errors. CI must pass release/integration/privacy, screenshot review and deployed fingerprint before VERIFIED COMPLETE.
