# Coding continuity catch-up: 19 September–7 October 2026

Reconciled: 7 October 2026 (Australia/Sydney)

## Why this exists

The 18 September 2026 migration remains a valid historical checkpoint, but substantial coding work happened after it. This catch-up prevents JoshMemory from implying that the portfolio stopped on 18 September.

Live Git/GitHub/CI/deployment evidence always outranks this summary. Raw personal transcripts, secrets, health/family/finance material and unrelated private data are excluded.

## Portfolio scale correction

Later audits described the coding estate as roughly **194 repositories across six GitHub identities**. Treat that as a dated discovery snapshot, not a permanent exact total. Preserve aliases and historical identities, but do not collapse distinct repositories without live evidence.

## DubboEwaste / AssetFlow

Project family: `DubboEwaste` / AssetFlow / `EwasteApp`.

Completed/pushed work recovered after 18 September includes:

- Supabase-backed AssetFlow P0: customers, jobs, lots, locations, assets, QR identifiers, chain-of-custody events, testing, disposition, certificates/PDFs, dashboard/navigation and RLS.
- Expanded ITAD product/software specification and P0–P3 backlog.
- Production Documents library with editable categorised docs, versioning/RLS and `/documents` routes.
- Editable job details with immutable job code; bidirectional job↔lot links; Create Lot job preselection.
- CRUD for defect templates, workflow rules and workstations; save-spinner repair.
- Single and multi-label printing with product names on labels.
- Phone-camera QR scanner plus manual scan/search.
- Barcode/device-intelligence fallbacks using Open Products Facts → UPCitemdb → Wikidata, later expanded with sources such as Icecat, Google Android, Lenovo, FCC, PCI/USB and LVFS.
- Search/catalogue improvements, aliases, verified ThinkPad T61 handling and photo-thumbnail/gallery support.
- Submit/loading/idempotency protection to reduce duplicate jobs.
- Admin-only deletion for empty/test jobs; real operational jobs preserve audit history rather than being silently erased.
- NIST SP 800-88 Rev.2-oriented sanitisation workflow improvements: QUEUED defaults, evidence/tool/method/verification gates, hashed evidence, capability/preflight checks and DESTROYED evidence.
- Facility-zone, shed-readiness, ITAD field-guide, Australian industry/market and compliance research.
- ITAD Feature Benchmark: 25 product profiles and 201 proposed features across 15 domains. This is roadmap/benchmark documentation, not proof all 201 features are implemented.
- Render backup verified at `https://assetflow-backup.onrender.com`, tracking `main` and using the same Supabase backend.
- Vercel repeatedly hit deployment/build-rate limits; source completion must not be confused with Vercel production availability during those windows.

Evidence correction: several early deep-research documents lacked citations or overstated vendor-specific claims. Treat those as drafts/backlog unless independently sourced. The NSW second-hand-dealer/licensing boundary remained unresolved in the recovered evidence.

## Lantern Road

Canonical family: `Parris-Tech-Services/lantern-road`.

Completed/pushed:

- Premium-indie gap analysis.
- Fixed silent/weak feedback for Scavenge, Rest, Rumours and broader site actions.
- Salvage popup and one-time exhaustion handling.
- Fixed inn Rest advancing time by about 30 hours.
- Meaningful feedback handling expanded across 17 UI action types and 21 site actions.
- PWA/service-worker revisions progressed through multiple versions.
- Completed/merged tasks included LR-0044/45/46/47, LR-0071, LR-0076, LR-0088, LR-0100 and LR-0102.
- Design direction moved toward a much larger Forbidden Lands-style hex map, not the earlier small-map feel.
- Agent model clarified: Steward/Agent 1 = project lead, technical lead, program integrator and lead game designer; Agent 7/Director = design guardian by exception, not an approval bureaucracy.

Incomplete/gated:
- LR-0091 had authored/committed material but branch/PR creation failed; runtime integration still needed.
- LR-0005 remained gated by LR-0011 save-versioning and LR-0013 Playwright/regression work.
- A service-worker app-shell issue involving `save-system.js` was identified; verify live HEAD before repeating it.

## Paul Roe memorial / private archive

Repositories: `joshualparris/Paul-Roe` plus a private archive repo.

Completed/deployed:
- Public memorial fact-check/rewrite with sourced milestones, mobile overflow fixes and curated source links.
- Public/private boundary tightened: 80/80 sensitive files copied/verified into the private archive; public archive paths removed while public site content was preserved.
- Vercel production `https://remembering-paul-roe.vercel.app` repeatedly verified READY after later changes.
- Added funeral Order of Service PDF and Vimeo/Zoom celebration links.
- Updated Paul + Phil Sullivan image/captioning.
- Revised Kyle Horton documentary card copy to match surrounding memorial cards.
- Private analytics archive backfilled with daily CSV/JSON, rollups/snapshots and automatic morning workflow.

Boundary: Paul-Roe has project-specific privacy/archive rules and must not be generically privacy-scrubbed.

## Familytree / AIGenealogy

Repositories: `Parris-Tech-Services/Familytree` and `Parris-Tech-Services/AIGenealogy`.

Completed/merged/deployed:
- GEDCOM workbench tooling, citation-maturity classes, dynamic discovery queue, dry-run edit scaffolding, synthetic fixtures, docs and CI integration.
- PR #11 merged to Familytree `main` at `04ad336866daf604363f53f5064a691200302f3c`; 6/6 local tests passed.
- Retired GitHub Pages failure cleaned up; Vercel confirmed canonical and READY with HTTP 200.
- Added private-portal payload guards, `.gitignore` rules, validators/tests and privacy-filtered deployment remediation.
- Obsolete Pages deployment records removed; privacy probes for private paths returned 404.

Constraint: Dan's AIGenealogy remains branch+PR only; do not directly change its `main`.

## Cheappcslaptops

Repository: `joshualparris/Cheappcslaptops`.

Completed/pushed/deployed:
- Bargain/refurbished-PC research site with filters, search, specs, warnings, dates and sources.
- GitHub Pages setup initially blocked, later fixed and verified live.
- Dubbo refurbished-laptop market research and practical resale/refurb strategy.
- Dated snapshot with 25 fixed-price complete systems under $100 delivered, plus validation/research workflows.
- Fleet valuation dataset/UI; one snapshot covered 22 machines and distinguished complete-system vs part-out value.
- Auction-watch view, URL-shareable filters/detail panels, evidence-backed valuations, refurb-profit calculator, validators, evidence-URL checks, smoke tests, JS syntax CI and SEO/canonical/robots/sitemap work.
- Multiple DadLAN/laptop troubleshooting and Windows-update conversations archived with private details redacted.
- 45-video repair watchlist and refurb/resell business concept.
- Deal Hunter v1: `scripts/deal_hunter.py`, config, scheduled GitHub Action every 6 hours and docs. External search remained blocked until the Brave Search API secret is configured.

## carGame

Repository: `topsecretcheese-del/carGame`.

Completed/pushed:
- Existing browser builder includes engine/drivetrain/chassis design, 3D viewer, simulation and garage/localStorage.
- Added race mode: 5 AI cars, 3 laps, HUD, keyboard/touch, off-track slowdown and design-derived performance.
- Fixed sideways orientation and carried custom builder styling into racing: headlights, grille, hood, wheels/rims, spoiler, stripes/colours, tint, roof and body kits.
- GitHub Pages target: `https://topsecretcheese-del.github.io/carGame/`.
- Deployment was queued at one checkpoint; verify current Pages state before claiming production status.

## UpskillApp

Current canonical repo: `Parris-Tech-Services/UpskillApp`.
Production: `https://upskillapp.vercel.app`.

Do not treat the older `joshualparris/UpskillApp` as canonical.

Historical completed functionality includes source tracking, JSON backup/restore, persisted pathway/checklist state, archive/delete, explainable scoring, lawful Adzuna proxy/search, refactored components/hooks/libs, WorkApp analysis history, Today Mode and mobile/accessibility improvements. Later podcast-source/deployment work also landed.

## JoshOS / AshFallen

Canonical existing repo: `joshuaparris-max/AshFallen`.

Completed 2026 work includes a bootable x86-64 Josh OS prototype with graphical desktop/terminal, keyboard commands, BIOS/UEFI ISO, Limine and QEMU CI boot proof. Later docs clarified a dual-track direction: Linux-backed product/desktop track plus independent native-kernel track. Preserve the distinction between browser/UI prototype and native kernel.

## JoshHub late-September work

- Added Top 10 Games showcase.
- Work landed across more than one JoshHub repository identity.
- Public Vercel remained wired to an older read-only repo/branch at one checkpoint, so pushed code did not automatically mean the public deployment moved.

## Dewey converter for LibraryThing

Repository: `joshualparris/dewey-converter-for-librarything`.

Status at last evidence: **planned/incomplete**.

Goal: free modern browser-first replacement for the old workflow, including LibraryThing import, batch/cached Open Library lookup, review and export for re-import. README/app-shell work started, but interruption left live repo state, end-to-end import, lookup, export and deployment unverified. Do not mark complete until those are tested.

## Windows Doctor / Internet troubleshooting consolidation

The recovered corpus contains extensive Windows/ProBook/JParrisDesktop troubleshooting, but the current request to consolidate all historical network/DNS troubleshooting into the existing Windows Doctor-style app is newer than the 18 September migration.

Status: **active planned/in-progress product work**, not completed.

The eventual tool should preserve DNS, adapter reset, Winsock/TCP-IP, proxy/VPN/security-software interactions, service checks, gateway/DHCP tests, browser-independent connectivity checks and prior ProBook/JParrisDesktop incidents, without falsely claiming a command was run when it was not.

## JoshMemory itself

### 7 October CI repair

The current CI failure was privacy-scanner false positives, not failing application tests:
- hard-coded-credential regex could span Python source lines;
- three redaction tests intentionally contained realistic fake `sk-proj-...` literals.

Repair:
- credential regex tightened so it cannot span source-code lines;
- tests changed to construct fake secret-shaped values at runtime.

On the final head, privacy checks, shell validation, tests and Docker build were passing/finishing across Python 3.11–3.13.

### Continuity correction

“Migration complete as of 18 September 2026” means the recoverable corpus available at that checkpoint was migrated. It must not be read as “all later coding work is automatically present”.

## Other post-18 September evidence

- Familytree, Paul-Roe, Lantern Road and UpskillApp had live deployment evidence in later portfolio audits.
- TextGame, JoshCards, Arena, drifter, AstraDndGame and schism received CI/deployment preparation work; builds passed, while some Pages publication remained blocked by integration permissions.
- FedoraCrashDoctor later had evidence of 368 tests plus 6 subtests passing.
- JoshHub later passed TypeScript, Vitest (2 tests) and a production webpack build producing 116 static pages in one validation snapshot.
- Podcast-player work continued across several apps; preserve the prior rule favouring local/self-contained playback over a fragile shared remote launcher.

## Completeness rule from 7 October onward

JoshMemory should be understood as:
1. a migrated historical corpus through 18 September;
2. an incremental continuity log after 18 September;
3. a discovery index across a large multi-account repository estate.

Literal “every coding action ever” cannot be proven from summaries alone. A genuinely exhaustive proof requires complete ChatGPT/Codex exports plus live repository/history inventory across every GitHub identity and any local-only repos. Until that reconciliation exists, use the wording **recovered and reconciled through available evidence**, not **mathematically exhaustive**.

Do not restart the old migration from scratch. Append dated catch-ups, structured facts and handoffs, and resolve uncertain states from live evidence.
