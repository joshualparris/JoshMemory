# 26 October 2026 — PR238 full CI stale address-name repair

Town's current PLACE_DEFS A7-N name is The Old Shire Library after intentional local-brand renaming; directional-addresses.mjs was still hard-coded to Sir Reginald Repo Public Library. Corrected test label to the actual current named site without changing location, footprint, generated addresses or commerce. Post Office 3D behavior unaffected. Exact-head checks must rerun.

# 26 October 2026 — Post Office rendered desktop/Pixel 7 Playwright acceptance added

New `tests/post-office-browser.mjs` records a real 3D screenshot and asserts a physically staffed visit, postal interactions, exit returning to street and no page errors on desktop and Pixel 7. The recorded WebGL GitHub workflow now runs this focused test against its own candidate build after generic game play. This is a test requirement only; no claim of executed pass until exact SHA CI finishes.

# 26 October 2026 — PR235 test-driven repairs

Original PR CI exposed `ReferenceError: blocker is not defined` in Post Office queue creation; fixed missing destructuring from createKit. It also exposed a separate upstream 2026 rail relocation: `RAIL_Z` moved to 132 to clear row-8/pub escapes but `tests/rail-corridor.mjs` still asserted 144 and wrongly expected legacy street-7 lamps to remain lit inside a 5.5m exclusion. Updated only the stale test to assert 132, protected row-8 rear boundary and active suppression of those lamps. Did NOT change the railway model, tracks, signalling or certificates. Full CI restart pending.

# 26 October 2026 — PR235 post model reconciled with O5 visitor centre, rail clearance, dental work

Rebased post-only source/test/docs on latest main f638f05de092c47f6cbc10e188e2be4b04d5c200 via a two-parent integration commit, preserving all new visitor-information, rail and dental commits. Post office controlled queue, low shelf, PO boxes, behind-counter sorting, 6 new info hotspots, non-colliding street detailing. Updated only townlife.js and shop-interior.js Git source provenance and appended documented audit explanation, not legal approval. Full exact-SHA CI (including 0.32m radius physical walk), privacy, browser and live deployment MUST pass before declaring complete.

# 26 October 2026 — commerce consolidation merged-tree candidate

Preserves latest main d5637c6ef04b782106fca7c63d036d18159a3c3b with bus/pharmacy/front entrances, pub and fast-travel fixes. Recovers original missing General Store invoices/temperature probes/supplier credits, finite state treasury startup capital, council wage float repayments and three regression suites from PRs #126–128. Ten of eleven checks on previous equivalent commerce candidate passed; Android job still running at tree construction. This commit is not VERIFIED until its own CI and the public deployment match. Pub audit source hashes synchronised for 27 tracked sources.

# 26 October 2026 — physical pub utilities worker fixture

Full release next caught the same old fictitious-staff test issue in tests/pub-utilities.mjs. Set forced on-duty worker coordinates to the actual pub entrance in test setup. Do not weaken the actual physical staffing check; source game remains unchanged. Full CI recheck pending.

# 26 October 2026 — PR223 CI regression correction and pub source re-audit

CI initially failed pub venue ordering because the test fabricated an on-shift employee with no physical site coordinates; the fixture now positions the actual staff member at the pub front before the service transaction. The production attendance check remains physically enforced. Publication-specific pub code audit correctly caught the amended townlife.js source blob; inspected the changed renderer integration and verified the pub facade still invokes unchanged buildPubFacade, and refreshed only that SHA with explicit non-certifying provenance. No audit assertion bypassed and formal code approvals remain open. Old failure: pub-venue.mjs and source hashes; new CI/browser/mobile release acceptance still pending.

# 26 October 2026 — reconcile position-based staffed service (PR #159)

Applied 10 exact-match source/test patches from conflicted PR #159 to consolidation branch integration/all-town-branches-20261026 at 1de0fd2dc8. Maintains physical-front/distance and paddock attendance checks with legacy ID call compatibility, without transplanting an obsolete main.js or old release content. 10 files, all patch hunks uniquely matched; remote CI/release still unverified. Preserve the current pub model and other claimed scope. Next run tests, continue remaining safe ports.

# 26 October 2026 — consolidation PR #186 scoped recovery checkpoint

From 48ae318ba9 on integration/all-town-branches-20261026, brought only the seven source/test identities-and-crowd files from conflicted PR #186 forward using exact-matching patch hunks against the current source (not an old full-file overwrite). Added one regression suite entry. Preserved all recent pub/upstairs/cellar/electrical, town expansion, privacy and saved-game changes. API-level patch application was conflict-free; build:release, privacy, browser, mobile and CI **not yet run/verified for this candidate**. Keep PR #186 open until exact-SHA CI and merge validation; do not assume remote publication. Next verify CI; reconcile remaining PRs individually.

# Consolidation takeover — 26 October 2026

Josh explicitly authorised this session to take over the existing consolidation claim. Baseline 9865eab4. All 15 currently open PRs conflict with main. Audit actual missing patches; preserve archived snapshots and current pub release. No merges claimed until verified.

# Branch/PR consolidation started — 26 October 2026

User authorised merging all branches/PRs. Baseline 95912eae; topic integration/all-town-branches-20261026. Inventory: 246 remote branch heads and 15 open source PRs; NSWutilities 3 heads/no open PRs. Fetch full history before ancestry/patch audit (initial checkout shallow). Preserve current pub release and all concurrent claims; inspect draft/superseded work before reconciling. No consolidation complete yet. Next: classify actual unique patches, reconcile in isolated worktree, full tests and reviewed merge.

# PUB-EXP release closed — 26 October 2026

PR #221 and #222 merged (final merge aaf4533d976ca12f3f73e80e5d54164ed5dee34b). Runtime 46a3439e5204d856768e61842fa439a0d9b2c200; fingerprint 6be3babae426edb93c44438833bd66bff6a3c7803e57d55435f0c26eae0e3dc0. All seven source workflows passed. Publisher 40261155778 and actual hosted verification 40261957076 passed desktop/phone compliance, venue, expansion, ID and header-free launcher tests. Ground 19 seats, upper 32/office, cellar services, lift/stairs/refuge/second exit. Window board cleared and regression-tested; final local phone screenshot inspected. Optional TinyFish run did not start (wallet), no pass claimed. [release evidence](docs/PUB_CELLAR_UPSTAIRS_RELEASE_2026-10-26.md). PUB-EXP-001–006 complete within declared game scope; PUB-SIM-011–013 and real professional approvals remain open. Preserve isolated QA hosting and unrelated work. No source files left claimed.

# Pub expansion source milestone — 26 October 2026
PUB-EXP-001–005 implemented for tests: 19+32 seats, office, cellar, actual shaft cutouts, two above-ground facade storeys, internal dogleg stairs and powered passenger lift, separate yard escape, finite wine/beverage gas, CO2/extraction interlocks, chiller and pumped sanitary tank. Node routes (1.2m vertical/escape), conservation, fault, migration and snapshot tests PASS; existing utilities, interiors, seating, lighting and grid tests PASS. Corrected old assertions that intentionally required a single storey and minimum20 ground seats. Browser/full-release/hosted acceptance remain PENDING. Next rebuild, exercise actual stairs/lift/power-failure/escape on desktop/phone, inspect screenshots and resolve defects before release.

# Pub cellar and upstairs start — 26 October 2026
PUBLIC game design. PUB-EXP-001–006, owner Codex, branch feat/pub-cellar-upper-20261026, baseline f81da769. Build a spatially aligned three-level pub (cellar, ground, upper dining) using existing per-floor collision scenes, realistic stair core, powered accessible lift, second escape route and scoped utility state. Move seating upstairs to decongest ground; retain conservative patron cap until assessed. Read existing architecture and prior evidence; implementation not started. Next implement source modules then collision/negative/gameplay tests, reviewed merge and verified isolated QA publication.

# Pub pilot published and verified — 26 October 2026
PR #219 merged e69ca6f; runtime4718823, fingerprint def06d2a86accb99f164d77306e11115a500f02b8fe9a5025e5a3f43539184d2. All seven source checks, publisher attempt2 and hosted acceptance40238413993 PASS. Actual hosted desktop/phone pool, Keno, alcohol ordering, pouring/dishes and header-free fullscreen automatic entry PASS. See docs/PUB_SIMULATION_RELEASE_2026-10-26.md. PUB-SIM-011–013 and all formal approval hold points remain OPEN; no physical handset or real certification claimed.

# Pub deeper systems milestone — 26 October 2026
PUB-SIM-001–008 source underway: independent VoIP/mobile/radio/TV/fuel graph and fault states; finite LPG delivery and natural-gas conversion; named worker fictional RSA/RCG expiry gates; beer purchase/consumption and standard-drink accounting; physics pool; scheduled no-cash Keno. Focused negative/persistence tests PASS. User added physical-remediation scope: 39 actual usable seats, window-safe wall TV, removed rear doorway dado, proper hinged panic bar, sink-safe kitchen/cold-room door swings and powered spinning fans implemented; source reachability/45-interior tests PASS. Physical service animation / staff uniforms, extended geometry tests, reference registry, full release and hosted new runtime remain incomplete. Header UI fully removed in host commit d22c4b9, manifest URL corrected in 3e91605; automatic-entry desktop/phone verification running, not yet claimed accepted. Next finish scoped presentation module, verify door sweeps/seats and browser before final upload.

# Pub service depth start — 26 October 2026
PUBLIC game engineering. Owner Codex; branch feat/pub-full-services-20261026, baseline a85b979. PUB-SIM-001–008: utility reference/evidence audit, distinct communications, finite gas/fuel/waste flows, named staff qualification gates, playable pool and no-cash Keno, negative/save/browser tests and hosted release. Current baseline has seven schematic networks and alcohol purchasing, but no proof of complete town-level utilities, realistic playable pool or Keno, staff competency records or formal compliance. Separate fictional operating records from real endorsements. Steering: hide existing launcher header immediately after entry/resume; host-only fix committed separately, live verification pending. Next implement small pure modules and integrate only through pub hooks.

# Pub gameplay release VERIFIED COMPLETE — 25 October 2026
PUBLIC game engineering evidence. Owner Codex; PR #208 merged `ca8f78e655834b623d7f610ba92419eae69fd54f` from tested head `fc6afb11b16b139a0dad6dd95cbc02eb46c982a6`. All eight PR workflows green. Canonical merged runtime/build tools/package match published QA runtime `f2cefefe86e5f423d3a9f9bdcaaf906e02399706` byte-for-byte; later head changes only corrected browser-test setup/checkpoint. Public fingerprint `cceaa0711a922937748dd44b6d8addc634cf4a2e81607a60295514638518db95`.

Hosted publisher [40194936640](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40194936640) and real hosted desktop/phone walkthrough [40195379814](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40195379814) PASS. Responsive [launcher](https://parris-tech-services.github.io/Repository-town-playtest/qa-tests/pub-compliance.html?v=36822853) Enter pub verified on both profiles; iframe fits viewport, all phone touch controls visible. Root retired handover and approved production mirror preserved. QA is isolated; canonical Vercel production not promoted during the quota-blocked release.

Checks include full build:release/privacy/integrity, five 28-day seeds, source audit, heritage preservation, mobile driving, recorded WebGL, independent plumbing/utility branch faults, finite waste/oil/grease ledgers, food/RSA/emergency conditions, two WC rooms, cold-room/kitchen access, real keyboard front/rear transitions and .6 m-radius complete street-to-front-door return route. Physical handset and qualified design review are not claimed. Formal PUB-CODE task assessment and independent legal approvals remain open exactly as registered; gameplay completion does not close them. No unresolved gameplay regression is known from these checks. Next work requires a new scoped claim; none reserved.

# Pub published candidate / final harness checkpoint — 25 October 2026
Published isolated QA from runtime f2cefefe86e5f423d3a9f9bdcaaf906e02399706: publisher run 40194936640 PASS full release/privacy and actual street-entry/rear-egress/fixtures desktop + phone. Hosted verification 40195379814 running. Runtime files identical to local reviewed candidate; no further gameplay edits. Remaining PR browser failures were probes: mobile retained focus on HUD toggle before bank WASD; legacy pub probe stood beside service plant. Restore canvas focus with real click, close panels through their visible control and start movement in the clear aisle, retaining all assertions. Focused bank phone entry and legacy pub suite now PASS desktop/phone. Next: upload test-only correction, wait CI, merge PR208, verify launcher and record final source/fingerprint/board completion.

# Pub final route/CI checkpoint — 25 October 2026
Full build:release completed locally with privacy, memorial and integrity PASS; isolated publisher full-release gate and desktop/phone browser PASS at 705a7b6. Final route extension exposed 0.1 m radius overlap with generic facade proxy; pub-only collider now has a genuine clear front portal. Actual keyboard street entry, both WCs/kitchen/cold room, drills, rear exit and full street-to-door .6 m radius probe PASS desktop + phone on final local geometry. External service plant collision and cold-room bins corrected. WebGL mobile harness now expands the intentionally collapsed HUD before asserting launcher visibility, then collapses for joystick; this corrects test setup without changing UI or dropping assertions. Next: exact remote candidate full CI, update isolated publisher SHA, hosted verification, reviewed merge and record source fingerprint.

# Pub final candidate — 25 October 2026
Full integration/28-day soak, geometry and privacy stages PASS. Final memorial guard failed on pre-existing resident&&!base.memorial whitespace; restored expected spacing only, then memorial/integrity/release verification PASS. Final focused graph tests now cover per-edge isolation, seven nonempty exclusive overlays and conserved oil/grease collection. No further feature expansion planned. Next: commit/source audit, upload candidate, exact-SHA full CI/browser and isolated hosted QA.

# Pub release regression checkpoint — 25 October 2026
Source uploaded to protected PR208 cc7e6e9; full release reached public-politics test. Its opt-out failure reproduced unchanged at e9fc9e4: civic-role branch bypassed avoids preference. Minimal fix preserves that preference before role selection; focused test passes. No new dialogue content/RTD completion claimed. Added actual detector/manual callpoint/panic hardware representations and corrected in-game rear-route descriptions; browser screenshots from earlier physical pass remain historical. Full release rerun pending, then exact-SHA build and desktop/phone hosted QA.

# Pub playable systems milestone — 25 October 2026
Desktop + emulated Android browser checks PASS: both WCs, cold room, kitchen, operational faults, actual keyboard rear discharge and 1.2 m external route. Conservative two-hour warm-food quarantine; seven schematic network overlays. Focused PUB-CODE geometry/service, finance and household tests pass. Expanded-roster finance baseline fixed with one debit per shared home, population-scaled finite opening government allocation/reserve and morning/evening means-tested support (including students/pensioners). 14-day town test now PASS without weakening assertions. Full release and hosted publication pending. Next build:release, source audit and protected PR208 upload. No formal certification claimed.

# PR208 completion milestone — 25 October 2026
Reconciled main envelope/heritage/NPC fixes. Added second WC, walk-in cold room, widened circulation, real rear world exit/side route, four emergency luminaires, independently faultable typed service graphs, operations/RSA/inspection controls and persistent safety state. Focused geometry/service tests pass. Full release baseline economic failure reproduced; investigating shared-home billing. Browser boot syntax regression corrected; current desktop/Android tests being rerun. No legal or live certification claim.

# Pub completion resume — 25 October 2026
Owner Codex; resume/pub-code-completion; remote PR #208 f6e41d9, latest main e9fc9e4. Reconciled conflicts retaining main pub-envelope and heritage/NPC fixes and P0 access/egress changes. No completion claims. Next: functional rear discharge, continuous access geometry, utility graph/service and safety operations; validate focused/full suites and publish exact tested build.

# PUB-CODE top-five P0 physical redesign — 25 October 2026

Owner ChatGPT; branch feat/pub-code-physical-top-five-20261025; main baseline e3824be. User authorised large structural pub remodel and tests. New design-stage changes: 14 × 18 m one-storey pub shell, revised signage, rear wall opening/door/aisle, 24+3 occupancy management scenario, sanitary fixtures/accessible circulation and extra rear emergency lighting. Preserve pre-existing electrical pilot and utilities. Permanent task IDs PUB-CODE/RTPUB-002/003/004/009/010 remain OPEN pending actual regulatory checks. Source and route tests, full CI and hosted exact SHA required. Real external rear discharge, legal approved capacity, AS1428 access, actual building/fire/food licences and all original permits remain UNVERIFIED.
# PUB-CODE/RTPUB-002 and RTPUB-024 design milestone — 25 October 2026

Focused branch `feat/rtpub-002-024-single-storey-envelope-20261025` changes only building envelope/stores, accompanying tests/docs and audit source fingerprints. Source module `src/world/pub-envelope.js` defines 14×18 m, 1 storey and +1 m interior→facade translation. `townlife.js` front/side windows, opaque walls, door and roof now agree with `pub-interior.js` envelope contract. Explicit construction-year UNKNOWN. Required full tests: Node source/mesh tests, existing sanitary/utility tests, pub audit, town safety, Android-sized game playtest, published SHA and actual hosted smoke; certification remains OPEN. Concurrent `feat/pub-code-physical-top-five-20261025` PR #208 contains overlapping site work — integrate via source-specific review, never overwrite its distinct tasks.

# Pub rescue integration — 25 October 2026

Reconciles tested PR #204 sanitary/privacy/kitchen changes with the newer main pub-history commit, without fabricating original construction age. Date and opening year must remain UNKNOWN. The remaining 33 NCC/food/fire/utility tasks remain OPEN. New CI, reviewed merge and hosted fingerprint must pass before release claims. No actual building-code certification is claimed.

# Utilities/sewerage research — 25 October 2026

Owner: ChatGPT Work sewerage research; scope docs only. Baseline main b59ea0b; coordination claim ba683dd. New RT-SYS-001–016 register and RTSW-001–028 queue preserve RTU parents. Electricity research assigned to dedicated ChatGPT session; water assigned to Manus. Narromine provisional reference from 2026 PIRMP and 2025 performance report, compared with Uralla/Bundarra/Bermagui; installed reuse hardware is not treated as operational (report inactive since 2017). Eighteen-source registry, explicit review limits, Caroma/Vinidex examples, pinned EPA SWMM source review and proposed cistern-to-treatment architecture. No runtime code, new live feature or another researcher’s files changed. RTSW-001/002 research complete only; next RTSW-003 after ownership/inventory reconciliation; RTU-022–024 open. Publish same register/research/tasks in NSWutilities and reviewed central PR; record validation and source IDs.

# RTU-001 electrical audit — 25 October 2026

Owner: ChatGPT. Runtime baseline main `19a13fe`; remote coordination claim `474868e`. Scoped work: `tools/audit-electricity.mjs`, `audit/electricity/{coverage.json,buildings.csv,validation.txt}`, `docs/RTU_001_ELECTRICAL_AUDIT.md`, plan status and README/coordination/checkpoint. No runtime changes. Every 188 house/46 site location audited; 99 modelled households, 89 unmodelled house lots, 10 edges/7 customers/0 physical services. Ten controlled probes expose demand suppression, split mismatch, missing-ID fallback, refrigeration timer reload loss and lighting mapping gaps. 38 civic callbacks work directly; eight custom interiors lack them. Source/Node/Three.js audit only, not hosted gameplay. Evidence and exact commands in report/log. Next: RTU-002 primary-source comparison, then RTU-003 operational service registry. Publish through reviewed PR #199 and mirror audit evidence to NSWutilities.

# Lighting release — browser source publication verified, PR next

RLT-008 restored authenticated write capability through GitHub UI without credential extraction. Remote feature branch fix/town-lighting-audit-20261024 at main ee432c0 now has all reviewed runtime files, tests, central RLT-001–019 tracker, audit evidence and release logs. Commits include f87f42b (renderer), 750446c (tests), d97f66d (central task index), 9675181/eb4adce (before/after evidence), 9abfadb (release log/review notes). Public Git fetch verified all five runtime files byte-for-byte. CLI/connector failures do not block this browser path.

RLT-009 observed main reconciliation at f2053e1 and RLT-010 full release/privacy gate PASS (774 files, 1116 markers, 1140 manifest files). Lighting runtime unchanged since e72a654, whose 38 desktop/emulated Android scenarios passed. No main.js/NPC/audio edits. Latest main may advance through parallel documentation; reconcile at PR review before merging without overwriting other agents.

Current RLT-011: open the PR after final checkpoint upload, verify remote branch diff. Then RLT-012 reviewed merge, RLT-013 eligible-host deploy and RLT-014/015 exact hosted fingerprint plus browser/Android checks. No hosted lighting success claimed yet. RLT-017–019 remain separate unverified acceptance. Explicit publication approval persists; do not ask again.

# Lighting browser publication — 25 October 2026

User requested another route; GitHub browser is authenticated as repository owner. Created remote branch fix/town-lighting-audit-20261024 from ee432c0 through normal UI. Reconciled current main locally; no runtime conflicts; latest tracker and other agents preserved. Scoped browser uploads will replace only lighting-owned changed files. Git/connector authentication remains unavailable; browser can write. Next: upload source/tests/docs/evidence, verify exact remote file hashes, review and merge PR, deploy eligible existing host and run live desktop/mobile lighting audit. Publication approval remains valid.

# RLT-008 retry — 25 October 2026

User explicitly selected @GitHub and requested another attempt. Retried connected get_repo and get_user_login: both return Unknown tool. Retried authorised topic-branch push: fatal could not read Username for https://github.com, No such device or address. No new remote write/PR/merge/deployment completed. RLT-008 remains BLOCKED; publication approval is unchanged. Lighting source and central task IDs remain locally committed; do not request the same approval again.

# Lighting task numbering — 25 October 2026

Documentation-only update on `fix/town-lighting-audit-20261024`. Central index `docs/UNNUMBERED_TODO_IDS_2026-10-24.md#lighting-tasks-and-release-triage` now preserves RLT-001–007 and defines new unique RLT-008–019 with priorities, dependencies and concrete acceptance. START RLT-008 (GitHub write access); deliver RLT-009–016 in order; keep RLT-017–019 device/outage/coverage evidence separate. Existing RTR/RTD/RT/audio identifiers and statuses unchanged. Existing central index bytes preserved; checked 19 unique definitions and earlier tracker prefix.

Latest fetched main is de547a1; application source last reconciled/tested at e72a654, so RLT-009 remains open. Current task is numbering, not another runtime release. No new publication approval needed. GitHub publication remains blocked by unavailable authenticated write access. Central index changes are local until RLT-011; do not report them as pushed. Next: RLT-008.

# Lighting release — approved, verified locally, GitHub authentication blocked

User approval: YES, push/review/merge/deploy explicitly approved. No further permission request is needed for this scope.

Reconciled canonical main `a64b979` into `fix/town-lighting-audit-20261024`; merge candidate `e72a65408bdba2f77e33beb227cd689bc2d3c305`. Preserved newer yarn settings, both test additions, hosting fallback policy and concurrent NPC claims. Inspected the final diff; no gameplay merge conflicts. Self-review recorded in `audit/lighting/PR_BODY.md`.

VERIFIED: full `npm run build:release`, privacy scan (774 files, 1116 private markers), 1139-file release fingerprint; reran all 38 Chromium desktop/emulated Android lighting scenarios on reconciled candidate, zero runtime/shader errors, zero blocked locations. Final content hash `d0e66d250b6d43ad7b89045dbd925b05a8a7e4abeab1e922b0bc5d4c63959d61`. Selected screenshots and metadata updated; logs retained.

BLOCKED TECHNICALLY: approved git push failed `fatal: could not read Username for https://github.com: No such device or address`; GitHub get_repo/create_pull_request return `Unknown tool`. Plugin inspection confirms GitHub installed/enabled, connector app-specific setting Allow all actions; this is not a remaining permission/approval problem. No available authenticated GitHub write path. Did not search for credentials or change app permissions. No remote branch, PR, remote main merge or deployment success claimed.

NEXT: restore the connected GitHub service or an authenticated Git session; no token should be pasted into chat. Then fetch latest main, reconcile new work, push this branch, review/merge, deploy exact approved candidate using existing hosting policy and verify live SHA/hash plus desktop/mobile lighting. A binary Git patch is available in the shared workspace as `repo-town-lighting.patch` for recovery.

# Lighting publication approved — integration underway

User explicitly approved push, review/merge and deploy. Current branch `fix/town-lighting-audit-20261024` reconciles main `a64b979`; preserves yarn settings and hosting fallbacks. No gameplay conflicts; combine both new test commands and coordination claims. Prior publication blocker is resolved. Next: release checks, push, review and merge; verify live release and Android/desktop lighting.

# Lighting audit — verified locally; publication blocked

Owner: Codex. Branch `fix/town-lighting-audit-20261024`. Baseline `7d369b7`. Tested runtime candidate `51dc315ba762db576f8f4e9fa29b8db27c391926`; later evidence/checkpoint commits have no runtime changes. Scope: `lighting.js`, `town.js`, `townlife.js`, `interior-kit.js`, `shop-signs.js`, lighting tests and release-test script. No main.js, NPC, dialogue or audio edits.

Implemented independent university/TAFE/hardware/trades lights, visible neutral panels/warm pendants, bounded downward street lights (4 desktop/2 touch; excluded in daytime), painted-sign wash, trading/24h/household schedules, and shared-shell blackout support. Fixed the original always-true residential OR bedtime conditions. All 45 civic interior builds have actual local lights.

VERIFIED: full `npm run build:release`, privacy (773 files / 1116 private markers), release manifest (1138 files); final Chromium desktop/emulated-Android run: 38 scenarios, 16 interior movement checks, 16 walked street segments, zero blocked locations after genuine staffing retries, zero page/shader errors. Evidence and exact hash in `docs/LIGHTING_AUDIT_2026-10-24.md` and `audit/lighting/after/metadata.json`. Selected before/after images and full release log retained. Rejected the initial eight-light prototype for software performance and upward ceiling halos; final build uses lower budgets and downward emitters.

BLOCKED: automatic approval review rejected `git push -u origin fix/town-lighting-audit-20261024`, stating publication was not authorised. Did not retry or route around it. GitHub connectors separately returned Unknown tool. All commits/evidence remain local; no PR, merge, staging, production or backup success claimed. Native handset and full 188-house on-foot coverage unverified.

NEXT: user approval for push/review/merge/deploy; fetch and reconcile latest main and concurrent claims, push exact tested change with this checkpoint, review and test reconciled candidate, deploy and verify hosted fingerprints/playback/rendering. Keep scope reserved pending publication. Public engineering content only.


# Repository Town — WORK CHECKPOINT

## VERIFIED COMPLETE — outstanding-task ID assignment (25 October 2026)

Docs-only triage [PR #195](https://github.com/joshualparris/JoshMemory/pull/195) merged to canonical `main` as `46694b7555d365983ca87f01a90afdf70cabe516`. [Ten-item ranked next-action queue](docs/NEXT_ACTION_TRIAGE_2026-10-25.md) is discoverable from the [existing stable ID index](docs/UNNUMBERED_TODO_IDS_2026-10-24.md). This superseded closed/conflicted documentation PRs #189 and #194.

- [x] All five previously reported unfinished areas mapped to **ten unique existing/new task IDs**; first executable task **RTN-002**: collision and merging; reconcile [open PR #186](https://github.com/joshualparris/JoshMemory/pull/186) and other active claims before editing.
- [x] Added exactly six unchecked stable IDs: `RTN-001`, `RTN-002`, `RTN-003`, `RTQ-001`, `RTP-001`, `RTP-002`.
- [x] Reused **unchanged** existing `RTD-043`, `RTD-044`, `RTD-084`, `RTR-010`; all 101 prior stable-index definitions keep their original identifiers/check statuses.
- [x] Current `main` read-back verified ten task rows, six unchecked unique ID definitions and central index link; PR safety/integration and recorded WebGL CI passed.
- [ ] Every implementation, audio clip integration, NPC fix, actual land/road work and mobile acceptance remains OPEN pending its own evidence — numbering is not completion.

Scope of the numbering change is only two project docs plus this handover/coordination closeout. Do not automatically claim or modify another agent's active source files.

## RTN-001–018 — NPC uniqueness/collision task triage (25 October 2026)

**VERIFIED COMPLETE — documentation numbering only.** Canonical `main` contains the [RTN-001–018 worklist](docs/RTN_NPC_CROWD_FALLBACK_TRIAGE_2026-10-25.md) and identical ID/status entries in [the central tracker](docs/UNNUMBERED_TODO_IDS_2026-10-24.md), with a README link. ID audit: **18 unique, 6 checked for code/sandbox evidence only, 12 unfinished; RTN-007 is next**. No existing identifiers were renumbered.

**Separate unfinished implementation:** [PR #186](https://github.com/joshualparris/JoshMemory/pull/186) is conflict-blocked, unmerged, and **not deployed**; source-level `npm run build:release` passed in an isolated sandbox at `ac0b8a106252b32c0f515f90044f3b4fcadf6049`. Live independent/approved Pages releases remain older. Do not confuse this documentation milestone with a fix, hosted release, or Android acceptance.

**Next action:** RTN-007: reconcile PR #186 against latest `main` without reverting parallel work; then continue RTN-008–018 in the documented priority order, using an eligible fallback host and exact release manifest checks.

## DOCS-RTD-TRIAGE-20261025 — after-RTD-009 work ID crosswalk

**VERIFIED COMPLETE (documentation crosswalk only, merged PR #192 and three CI workflows green).** Canonical main at start: `de547a1e0fa026e1c2470ead4cd840b6fa7cbf7e`. Claimed scope `DOCS-RTD-TRIAGE-20261025` on canonical `COORDINATION.md` at commit `a63981cf1022cc7cf1b4a62985fda5e4ed1ade47`, prior to edits. Topic branch `docs/town-rtd-after-009-triage-20261025`; no RTD-010 implementation reservation.

- [x] M1 Read canonical 93-item RTD list, global `docs/OUTSTANDING_WORK_2026-10-24.md`, AGENTS, pending PRs and checkpoint; all RTD-001–009 checked; 010–093 open. No new IDs needed for the exact follow-up categories from the RTD-009 report.
- [x] M2 Authored [full 84-item ranked crosswalk](docs/RTD_NEXT_TASK_TRIAGE_2026-10-25.md) and master parent mappings, new document committed `2253dafa09e1850702751b2ab5de2253413ff00d`. First implementation RTD-010, then 011, 012. All identifiers reused, not renumbered.
- [x] M3 Linked into [93-ID canonical roadmap](docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md) (`8e082b490ce26c04d2d5eb4fbca5c9be77fe8570`), [global TASK-032–045 master](../docs/OUTSTANDING_WORK_2026-10-24.md) (`2c61846750e4f0690d60ce03b88ad38cbbc61341`), and [Town README](README.md) (`a7dd2cc48deac249ece677534a66fffed910b634`). Verified triage rank 1–84 contiguous, unique pending RTD-010–093 one each, master TASK-032–045 unchanged and open, RTD-001–009 remain the only checked items.
- [x] M4 [PR #192](https://github.com/joshualparris/JoshMemory/pull/192) **MERGED** into canonical main as `fff5c0a75b6641c1de0c6ee67680fb44d4b9996d`, tested head `efbdc490e11e88b5b67fac412e15788a456a1558`. All green: [Town Integration #40129362594](https://github.com/joshualparris/JoshMemory/actions/runs/40129362594) (release/privacy gate + five 28-day simulations), [Recorded WebGL #40129362578](https://github.com/joshualparris/JoshMemory/actions/runs/40129362578) and [general CI #40129362704](https://github.com/joshualparris/JoshMemory/actions/runs/40129362704). Verified docs-only, zero changed task IDs or checkbox statuses; **RTD-010 unclaimed** for next agent.

**Boundary:** Documentation navigation only; no claim that gameplay, recordings, testing or deployment advanced. No change to actual RTD completion totals expected. Separate open PR #164 and #186 require refresh before modifying their code.

## VERIFIED COMPLETE — GitHub Pages live backup and N/S plot atlas (24 October 2026)

**LIVE:** https://parris-tech-services.github.io/Repository-town/
**LIVE MAP:** https://parris-tech-services.github.io/Repository-town/address-map.html
**Verified source:** `18f9e93b887dda04368056008681b0140ad48913` (approved `main` ancestor), release.json content hash `32914d94b39a14f00fd193d04d2baa9ef652993d8b9708c42da3b9870dea74ca`. GitHub Pages mirror run [40091269927](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/40091269927) **success**, platform Pages build [40091685402](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/40091685402) **success**, live browser atlas verification [TinyFish run b3522645](https://agent.tinyfish.ai/runs/b3522645-f1c1-41e5-92b4-c6c8c2120989) **success**.

- [x] Build release, privacy, five 28-day simulation seeds and desktop/Android WebGL all passed in Pages publisher.
- [x] Historical Pages-only `AUDIO_INTEGRATION_TODO.md` and `tests/game300-live-playback.cjs` preserved byte-for-byte with Git SHA pins.
- [x] Historical `ui/npc-chat.js` and `ui/voicebank.js` checked against canonical source; no old behaviour discarded. Pure line-preservation checks and negative regressions in CI.
- [x] Current backup repository release.json matches exact tested source; `address-map.html` and `ui/address-map.js` exist in release manifest and checked-in build.
- [x] Hosted browser directly loaded live map with 26 A–Z columns, 11 paired N/S row bands, 234 occupied building sites, 572 planning references; clicked Z7-S UpskillApp, Z8-N railway, Z8-S Farmhouse, Z9-N Macquarie Locksmith & Keys, and Z9-S unbuilt/unsurveyed. No missing content or errors observed.

Vercel was rejected with 402 deployment quota; GitHub Pages is independently usable. No Cloudflare/Render setup was needed. The prior checkpoint notes below describe blockers **that are now resolved**. Further physical land clearance surveys (rear yards, utilities, road-9 construction) remain unimplemented and should not be confused with this successful map publication.

## Pages mirror code-continuity reconciliation — 24 October 2026

**In progress:** follow-up to [PR #185](https://github.com/joshualparris/JoshMemory/pull/185). Run [40090217593](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/40090217593) passed full public release, five 28-day seeds, desktop/Android WebGL and preserved the two pinned Pages-only docs/tests. Publishing correctly blocked at historical `ui/npc-chat.js` drift (not in the nine original legacy-sha exceptions).
Full Git tree comparison with last released backup commit `89c59d5047cb904394628dac6825c78340b73224` shows **exactly five** changes: the workflow itself, two preserved extra files, and two modified game files `ui/npc-chat.js` (blob `6cb4f2f33784c66d0778b376e56b5ca27e90037e`) / `ui/voicebank.js` (blob `43071c3418d22811c4d6a9a78a090001d9110ec2`). Compared current source: voicebank older 272/272 lines present in order; NPC-chat older 251/252 lines present; its only replaced line is the safer recorded-dialogue focus guard. After replacing that one historic line, 252/252 lines are preserved in order. No code is being dropped.
Branch `fix/town-pages-safe-drift-upgrade-20261024` adds pure `tools/pages-drift-guard.mjs`, regression `tests/pages-drift-guard.mjs`, and changes `tools/sync-backup.mjs` to allow **only** those exact pinned Git blobs when canonical public build retains every historical line in order, with the one named focus upgrade; all other drift continues failing closed. Runs regression in `npm run test:town`. Next PR checks -> merge -> trigger scoped backup workflow -> verify exact release and public map. No generated site files edited by hand.

## Pages mirror preservation / recovery — 24 October 2026

**Status: FIX IN BRANCH, re-release pending.** Vercel API quota 402 blocks production. Existing Pages backup Parris-Tech-Services/Repository-town triggered by workflow-file-only push (commit dace6e4a8b0c182d7af25da62c44c354b31d032e), [run 40089081725](https://github.com/Parris-Tech-Services/Repository-town/actions/runs/40089081725). Source 7d369b760034e404f40e289252091ad03fd87500 passed public release, all five 28-day seeds and recorded desktop/Android WebGL checks. Sync then correctly refused to drop unmanifested AUDIO_INTEGRATION_TODO.md.

Exact tree-vs-manifest audit finds **two** out-of-manifest Pages-only files: AUDIO_INTEGRATION_TODO.md (Git blob 2076f4a5c26728bedcbd2a8cc82b1656c4417aff) and tests/game300-live-playback.cjs (Git blob 086a3ec1c2d85b031fecdbef077e471b71d8e203). Topic branch fix/town-pages-preserve-historic-assets-20261024 modifies only tools/sync-backup.mjs to verify and preserve these exact objects across backup builds; unknown files or altered blobs still fail; any collision with canonical output stops the sync. Never modify generated site content or bypass privacy/build gates.

Next: green PR CI, merge, retrigger Pages workflow via scoped workflow-file push, verify backup release.json.sourceCommit and Pages build, then browser-check address-map.html and homepage. Record any remaining blocker.

## Directional N/S town land-address audit — started 24 October 2026

Owner: ChatGPT. Topic branch `feat/town-directional-addresses-20261024`; canonical coordination claim `6d17dd60e0c205e3cbe426a75d509889ad5d2799` on `main`.

- [x] Read town physical code (`src/world/town.js`, `life.js`, `townlife.js`), inventory and property system; photographed in-game Z7-S UpskillApp, Workshop Way rail and row 9 edge supplied by Josh.
- [x] Confirmed existing inventory's 20 missing coordinates G8–Z8 are **all occupied** in the physical game (shops/farms); a separate full-width business frontage occupies future `A9-N`–`Z9-N`. The railway occupies the `8-N` corridor; future row-9 roadway is not implemented.
- [x] Implemented `src/world/addresses.js`: 572 unique N/S planning plots; confirmed 234 existing built sites, all rail references and farm fields; no unsupported vacant claims.
- [x] Added address labels to all houses, TownLife businesses, property deeds, building card, search, shop panels and readable in-game plot atlas; preserves legacy keys and migrates saved deed labels. Regression added to `npm run test:town`.
- [x] Created `docs/DIRECTIONAL_ADDRESS_AUDIT_2026-10-24.md` and map. [x] PR CI/release privacy/merge verified. [ ] Production deployment/browser map smoke blocked by Vercel 402 quota.

**VERIFIED SOURCE / MERGED, PRODUCTION DEPLOYMENT BLOCKED.** PR [#178](https://github.com/joshualparris/JoshMemory/pull/178) squash-merged to `main` as `d7935f3b0f2ece5c7c02557c1b3a5287e867148e` with all tested PR checks green: [Town Integration 40087828705](https://github.com/joshualparris/JoshMemory/actions/runs/40087828705), [Recorded WebGL 40087828709](https://github.com/joshualparris/JoshMemory/actions/runs/40087828709), [Mobile Driving 40087828730](https://github.com/joshualparris/JoshMemory/actions/runs/40087828730). Full release build/privacy/geometry and all five 28-day economy seeds passed, plus address/legacy save/deed regression. Live Vercel production is **not** at merge SHA; POST deployment rejected HTTP 402 `api-deployments-free-per-day` (>100 deployments/day). No production release or new atlas page has been verified; next step is redeploy *this exact merged source when the provider quota permits*, then browser-verify `/address-map.html`, house/address searches and real handset map. Never imply older READY Vercel is current.

Do not mistake "Vacant" in title card (occupant) for an empty building lot. Do not claim undeveloped ground is buildable without footprint/yard/collision survey.


Updated 2026-10-24 (Australia/Sydney). Working branch: `feat/town-npc-branching-recordings-20261024`.

## RTD-009 — versioned actor/node/choice dialogue schema (24 October 2026)

**Status: VERIFIED COMPLETE, merged PR #179 with three passing CI workflows; task RTD-009 exclusively.** Source main at reservation `6d17dd60e0c205e3cbe426a75d509889ad5d2799`; board claim committed on main `c4722c84333d6947e7ff7775f81162f4fad7787f` before modifying source. Topic branch `feat/town-rtd009-dialogue-schema-20261024`.

- [x] **M1 — Read/claim/checkpoint.** Reviewed `AGENTS.md`, current `COORDINATION.md`, `WORK_CHECKPOINT.md`, RTD-008 acceptance RTAC-003, `src/ui/recorded-dialogue.js`, tests and open PRs. PR #164 conflicts with voice UI and remains open; separate directional N/S address work owns `src/main.js`, `src/world/addresses.js`, `src/world/property.js`. RTD-009 uses new isolated `src/dialogue/schema.js`; preserve existing Game300.
- [x] **M2 — Versioned schema and docs.** New pure `src/dialogue/schema.js` committed as `efbeaecd91d5229465473f17e994a4616cbae002`; human [schema v1](docs/RTD_009_DIALOGUE_SCHEMA_V1.md) committed as `bee7c983d811129f256a4e07b5a033cfa7fc614f`. Actor/node/choice, read-only typed conditions, exact transcript clip descriptor, next node, allowlisted action requests. Existing recorded player not changed; no effect execution, network or AI.
- [x] **M3 — Contract tests.** New `tests/dialogue-schema.mjs` committed as `9e1de1f1f7998def27b933e591a366afc1edf4fc`; tests named/worker/house identities, sample safe data, strict shape, malicious/unknown action, actor/voice mismatch, unknown facts denying choices, immutable input and only fixture audio with explicit test flag. Registered under `npm run test:release` at `97c5c0978172e1ca973f4ad418eab749b12ec6c2`. Actual CI result pending M4.
- [x] **M4 — Review/merge.** [RTD-009 PR #179](https://github.com/joshualparris/JoshMemory/pull/179) **MERGED** as `08e41aebcb905882fe902f9c81aa8859b07b6db3`; tested PR head `ac2be9b3de76f9e4f737ec33225ba9e3dab5cb9d`. [Town Integration #40087956668](https://github.com/joshualparris/JoshMemory/actions/runs/40087956668) **SUCCESS**: CI logs explicitly show `PASS RTD-009 / RTAC-003`, metadata crosswalk, full release/privacy/geometry gate and all five 28-day economy seeds. [Recorded WebGL #40087956707](https://github.com/joshualparris/JoshMemory/actions/runs/40087956707) **SUCCESS** and [Mobile Driving #40087956669](https://github.com/joshualparris/JoshMemory/actions/runs/40087956669) **SUCCESS**. Two careful conflict-free branch merges preserved the concurrent directional-coordinate and resident-wall work. Only RTD-001–009 checked, with RTD-010+ open. No live dialogue director, actual quest effects, VoiceBank MP3 integration, new hosted-playback signoff or production deploy claimed.

**Implementation boundary:** Defining/validating schema is RTD-009 only. Does *not* deliver DialogueDirector (RTD-011), complete reachability/cycle graph checks (RTD-012), live casting/audio integration, quest/payment execution or production playback acceptance. Existing `recorded-dialogue.js` remains unchanged.

## RT-08 / AUDIO-013.03 — live production browser evidence (24 October 2026)

**MERGE AND CI VERIFIED:** [PR #177](https://github.com/joshualparris/JoshMemory/pull/177) squash-merged as `1d55b3677ddfe929beb1e7ea9c9d8ecac2003963`, tested head `d0523316c3e0af4cbeb4cb4d2d18be224c1c8303`. [Town Integration 40084738543](https://github.com/joshualparris/JoshMemory/actions/runs/40084738543) SUCCESS (safety gate and five economy seeds), [Recorded WebGL 40084738567](https://github.com/joshualparris/JoshMemory/actions/runs/40084738567) SUCCESS (local software-rendered WebGL; hosted production stage skipped, separately tested in actual production Chromium). **Only QA/docs modified. RT-08/audio parent 013 deliberately remain OPEN** until full acceptance.

**PARTIALLY VERIFIED, OPEN parent tasks.** [Evidence report](docs/RT_08_LIVE_PRODUCTION_ACCEPTANCE_2026-10-24.md): the actual public Vercel release `34eaf60455acf2984a8d69ed9b23477c24e70020` (hash `afc7f0a2562b0823daf9d73dced3842dda27093325352a098ed2c24bac3de637`) was exercised with desktop/Pixel 7 Chromium. All ten Game300 actors passed real WebAudio/caption/stop/replay checks in the hosted NPC Lounge (20/20), Rowan/Pip/Kit passed in the real 3D Town NPC modal on both viewports (6/6), and A1 house entry/exit, movement, interactions and touch controls were tested. The 12 legacy E2E household-panel failures were false positives caused by personalised panel headings (e.g. “Lena's fridge”); a narrowly scoped E2E assertion correction is included in the QA PR. The browser's remaining 404 is precisely `/favicon.ico`, documented as non-blocking warning. **Do not claim all 188 houses, actual handset subjective audio, full CSP, offline failures or mirror parity passed.** No game/voice source or production deployment touched. RT-08 and AUDIO parent 013 stay unchecked.

## RTD-008 — versioned NPC dialogue acceptance contract (24 October 2026)

**Status: VERIFIED COMPLETE (merged PR #176; three CI workflows green).** Canonical main before claiming: `dbe343f6c5f8d2e49def71c0b333685945505003`. Task RTD-008 only reserved in `COORDINATION.md` on main as commit `ca90808273767c100d385b77977a549789d2acfa`; other RTDs remain unclaimed. Branch planned: `docs/town-rtd008-acceptance-contract-20261024`.

- [x] **M1 — Read and claim.** Checked latest canonical main, 93-ID roadmap, RTD-007 ownership rules and open PRs. Source/audio conflicts: PR #164 is still open. Claimed documentation + acceptance test / PR template files only.
- [x] **M2 — Versioned contract.** Published [v1.0.0 34-case machine-readable contract](docs/RTD_DIALOGUE_ACCEPTANCE_V1.json), source commit `fd6178433ee9515e9b9d8632acc05b8060c5f6a0`, and [human acceptance specification](docs/RTD_008_ACCEPTANCE_CRITERIA_V1.md), commit `c8d0f741a5b3399ecbd1c5648d6264b1ecdd2066`. Exact setup/pass/fail/evidence for 34 RTAC IDs; all RTD-009–093 mapped. All cases remain `not_evaluated`, no implementation/production success claimed.
- [x] **M3 — PR traceability + contract regression.** Scoped `.github/PULL_REQUEST_TEMPLATE/repository-town-rtd.md` committed (`dbca7996fe5454066fecb69b6062b722d205ff6f`), Node contract and negative metadata tests in `tests/rtd-acceptance-contract.mjs` (`e21aad9f72e8e3679db915a8b5363c14585018bc`), wired into `npm run test:integration` (`63a0baaf0b46517032b55b5baec2b7a96aab4ba8`) and `.github/workflows/town-integration.yml` numbered-PR metadata gate (`7786cde40ba1af423771de6c6217eb4862effb3b`), `AGENTS.md` updated (`16c73d6cc66ba056b0777b9738acea8546a382eb`). This is a metadata/criteria gate, not gameplay acceptance.
- [x] **M4 — Merge/handover.** [PR #176](https://github.com/joshualparris/JoshMemory/pull/176) **MERGED** as `7757519ec6684510daf182ad185a196e1261ff70` after successful [Repository Town Integration #40083376492](https://github.com/joshualparris/JoshMemory/actions/runs/40083376492) (including new `RTD-008` PR metadata gate and acceptance contract self-tests, full release/privacy/geometry and all 5 economy seeds), [Recorded WebGL #40083376430](https://github.com/joshualparris/JoshMemory/actions/runs/40083376430) and [general CI #40083376493](https://github.com/joshualparris/JoshMemory/actions/runs/40083376493). Exact tested PR head `98f8fc670927c1de331dddd0befc4451ae437348`. Verified only RTD-001–008 checked, RTD-009 still open. Final acceptance doc completion tracked on main at `870c6c0045b831846f53c3a2d5d2857e120fb4e3`. No app runtime/voice changes and no hosted production audio playback claimed.

**Boundary:** RTD-008 defines and verifies acceptance *criteria and traceability tooling*, not story engine implementation, recordings, playable NPC memories, full production interactive playtest or a release. Do not tick RTD-009+.

## RTD-007 — coordinated implementation ownership and milestone checkpoints (24 October 2026)

**Status:** VERIFIED COMPLETE (PR #173 merged, both CI workflows green); RTD-007 only was reserved on canonical `main` **before** authoring protocol/roadmap changes. Source baseline `2d91b9e7d321103342755cd16929b1a7077b8c4f`; claim recorded under `COORDINATION.md` at main commit `b2cd82474e3a19c33f9090967169111188be4f26`. Branch planned: `docs/town-rtd007-coordination-checkpoints-20261024`.

- [x] **M1 — Read and claim.** Re-read `AGENTS.md`, latest `COORDINATION.md`, RTD task definitions, checkpoint and open GitHub PRs. No active RTD-007 claim. Existing historical in-progress audio branches and still-open [PR #164](https://github.com/joshualparris/JoshMemory/pull/164) require conflict checks for any later gameplay/audio task.
- [x] **M2 — Author protocol.** [RTD-007 operational protocol](docs/RTD_007_COORDINATION_CHECKPOINT_PROTOCOL_2026-10-24.md) committed on topic branch at `64addcf88a7f39ac160e8b3dd104071ad2803039`. `AGENTS.md` updated with mandatory claim/checkpoint gate at `44f0f1b857758ba384b0cb40a36f42308e5f60a3`. Scope covers atomic ownership, conflicting PRs, milestone/handoff checkpoints, preserving task IDs and truthful production/recorded-audio evidence.
- **Milestone M2 checkpoint:** Protocol + discoverable agent instructions are now in GitHub; all changes are documentation-only. Next: evidence-linked roadmap RTD-007 checkbox, final coordination Done handover and PR CI. RTD-008 remains unclaimed.
- [x] **M3 — Record evidence.** RTD-007 checked with direct protocol/AGENTS/checkpoint links in 93-ID roadmap at `2003c838b76ca8ccb48f49c78a16681bbe30ed9e`; original board claim moved to Done on topic branch at `778a5bebbb14a072f1eca9447473bbe0ba9c150b`. Start checkpoint on main and M2/M3 milestone checkpoints committed. RTD-008 remains unclaimed.
- **Milestone M3 checkpoint:** Completed proof from branch: only docs/agent instructions are modified; no gameplay or VoiceBank files; next prepare PR, verify 93 IDs, run CI and merge after green checks.
- [x] **M4 — Verify/merge.** [PR #173](https://github.com/joshualparris/JoshMemory/pull/173) merged on canonical main as `788158d71eb56a797ccd598e763c910a94a104ff`, tested head `ea181a4ebae6519c2c2be323860d65bd1842e66a`. [Town Integration run 40081851125](https://github.com/joshualparris/JoshMemory/actions/runs/40081851125) **SUCCESS** (release/integration/privacy and 5 economy seeds); [Recorded WebGL run 40081851086](https://github.com/joshualparris/JoshMemory/actions/runs/40081851086) **SUCCESS** (local desktop and mobile browser playtest). Reviewed five changed files, all docs/agent guidance; verified 93 sequential RTD IDs with 001–007 checked and RTD-008 open, `AGENTS` protocol link and COORDINATION Done record. No new gameplay/voice/production deploy or hosted live audio acceptance.

**Boundary:** Coordination/process documentation only. RTD-008 actor/feature acceptance criteria and RTD-009+ gameplay are **not** claimed or implemented here. The next session must inspect current board/PRs, independently claim RTD-008, then checkpoint before changing source. Never turn a historic “in progress” entry into an unsupported active reservation, and never claim hosted production audio on the basis of local Playwright tests.

## RTD-006 production-release and browser/audio baseline — 24 October 2026

- **Final RTD-006 merge evidence:** [Repo Town PR #172](https://github.com/joshualparris/JoshMemory/pull/172) **merged** as `34eaf60455acf2984a8d69ed9b23477c24e70020`. Tested PR head `895e4054ca65dc33f785c67141adeec3b1e88735`. [Integration run 40080661228](https://github.com/joshualparris/JoshMemory/actions/runs/40080661228) **SUCCESS**, [recorded WebGL run 40080661245](https://github.com/joshualparris/JoshMemory/actions/runs/40080661245) **SUCCESS**. These were PR/head tests, not a newly executed interactive hosted-production audio test. The baseline production SHA and hash in the report are *time-of-audit snapshots*; re-inspect live `release.json` before a new release decision.
- **RTD-006 VERIFIED SOURCE AUDIT COMPLETE, docs only.** Read [RTD-006 Vercel/CI release baseline](docs/RTD_006_RELEASE_BASELINE_2026-10-24.md); read-only Vercel + GitHub inspection; no source/gameplay changes, audio generation, redeploy or production promotion.
- **Current GitHub main at start of audit:** `588f2b9bb3655d7fe2e1da500fef4f6ed4dd697a` (16 commits ahead of production; compared file changes were QA/tests/workflows and docs, not `repository-town/src/`). Current source may advance after coordination/merge; do not imply all main commits are deployed.
- **Real canonical Vercel production deployment:** `dpl_BUJvawLJX9Bvk87P7b7uKu1U4RJp`, READY, alias `https://repository-town-claude-complete.vercel.app/`. Actual deployed source `9e3853156838f21c5a7c17cb63ce3bd4d827f93c`; live `release.json` HTTP 200 sourceCommit exact match. ContentHash `afc7f0a2562b0823daf9d73dced3842dda27093325352a098ed2c24bac3de637`. Vercel release verifier logged **1,133 SHA-256 file checks passed**.
- **Live HTTP 200 verified:** `/`, `/release.json`, `/people.html`, `/ui/recorded-dialogue.js`, `/ui/npc-chat.js`, `/ui/voicebank.js`, `/ui/yarns.js`, `/npc.css`; separately VoiceBank `/src/game300.js` served HTTP 200. Staging released different source `6b81498565910c0ab2eec4270fb33af4616158a9`.
- **CI browser/audio baseline:** [Integration run 40079153284](https://github.com/joshualparris/JoshMemory/actions/runs/40079153284) success (release/privacy and five 28-day economic seeds); [Recorded WebGL run 40079153300](https://github.com/joshualparris/JoshMemory/actions/runs/40079153300) success, locally served real recorded Game300 on desktop/mobile 10 actors, exact captions, stop/replay, paidRequests 0, pageErrors 0, 3D WebGL smoke.
- **Explicitly NOT proven:** separate actual **hosted-production Chromium/Pixel 7 step was skipped**; HTTP JS fetch is not live deployed browser/audio gesture or real Samsung handset test. Full walk→NPC→interior→repair/quest audio, ZIP failure/offline, production backup fingerprint and 22 missing cast voices remain OPEN.
- **Handover:** RTD-001–006 checked. Next RTD-007 coordination reservation/checkpoint, then RTD-008 acceptance plan; avoid broad production rollout without a separate deploy request and release gate.

## RTD-005 merged dialogue and audio acceptance reconciliation — 24 October 2026

- **RTD-005 VERIFIED COMPLETE and merged:** [PR #170](https://github.com/joshualparris/JoshMemory/pull/170), source merge commit `9e3853156838f21c5a7c17cb63ce3bd4d827f93c`. The [Repository Town Integration workflow](https://github.com/joshualparris/JoshMemory/actions/runs/40079153284) and [Recorded WebGL Playtest workflow](https://github.com/joshualparris/JoshMemory/actions/runs/40079153300) both passed at tested head `3b00f3024a79054855756f897b0fbe5974a8fb30`.
- **RTD-005 COMPLETED, documentation-only**: [PR/audio ownership reconciliation](docs/RTD_005_DIALOGUE_AUDIO_RECONCILIATION_2026-10-24.md). Existing shared recorded dialogue and truthful speaker captions preserved; no runtime code, files or live deployments changed.
- **GitHub facts confirmed:** PR [#165](https://github.com/joshualparris/JoshMemory/pull/165) (truthful Game300 greeting/help cues) and [#166](https://github.com/joshualparris/JoshMemory/pull/166) (shared choice dialogue, desktop/mobile browser tests) are **merged**. PR [#164](https://github.com/joshualparris/JoshMemory/pull/164) proposing 20 extra `VO041`–`VO060` clips is **open**, and overlaps the very same dialogue and voice source files. Review/port only verified source/caption/audio changes; do not blindly merge its older branch.
- **17 global Town audio acceptance IDs 006–013, 040–048:** parent 006 verified checked (100 clips / ten cast); the other 16 are OPEN. The old audio-track subtask “merge #165” is obsolete, **not** proof that its parent 007 is complete. Full 3D/transaction/offline/production acceptance remains open.
- **Older `RT-08`:** GitHub **merge** of #166 is complete; independent canonical **production release fingerprint and real deployed audio** remain to be proven, so older combined checkbox stays OPEN. Older `RT-09`: RTD-003 inventoried the cast, but the missing 22 named NPC voices have not been generated/approved; keep open.
- **RTD-006 next:** pin current main SHA and compare actual live production/staging release fingerprints with tested browser/audio evidence; keep separate from inferred PR/CI success.
- **No duplicate work:** preserve current `recorded-dialogue.js`, `npc-chat.js`, `voicebank.js`, CSS, ten known Game300 voices, exactly captioned WebAudio, `stopTownVoice` cancellation and #166 mobile focus fix.

## Follow-on Skyrim-inspired dialogue roadmap (24 October 2026)
- Numbered 93-item roadmap: `docs/SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md` (RTD-001–093).
- Tasks RTD-001–006 are completed with design/source audit, identity/PR/audio reconciliation and RTD-006 read-only Vercel/CI release baseline; RTD-007–093 remain OPEN.
- The earlier recorded-branch PR #166 is merged, but its initial tree does not close the conditional quest, game-memory, cast expansion or full production-playtesting requirements of this roadmap.
- **Resume:** inspect current main and `COORDINATION.md` first, then RTD-007 coordination/RTD-008 acceptance checks, reusing the RTD-006 live release baseline; build Rowan/Kit/Pip pilot and check off only proven results.

## RTD-004 pinned source audit — 24 October 2026

- **RTD-004 COMPLETE (source audit only)**: `docs/RTD_004_DIALOGUE_SYSTEM_AUDIT_2026-10-24.md` documents the canonical dialogue flows, Game300/VoiceBank engine, the NPC-to-NPC event path, Expedition Guild and all relevant local/save transfer state keys and privacy boundaries. Source snapshot `69a12eea14fa706c605943f98e300f1f263377d2`.
- RTD-001–004 are checked in the 93-task roadmap; RTD-003 was completed by ChatGPT after Replit usage was exhausted, including source-backed JSON and actual TownLife parity test.
- **Do not reinterpret RTD-004 as a gameplay or deployment acceptance test.** No application source, recordings, CI runtime or deployed production was changed for this audit. All story, save integration and actual WebAudio acceptance tasks remain open.
- **Next safe handover:** RTD-003/004 verified complete on main; proceed with RTD-007 (coordination checkpoint reservation) and RTD-008 acceptance checklist; reuse RTD-006 release baseline while protecting concurrent NPC code.
- Working audit PR branch: `docs/town-rtd004-source-audit-20261024`; see the linked audit for detailed integration seams.

## RTD-003 population inventory takeover — 24 October 2026

- **Verified merged commit:** `03272c88fc84351a6915d7cf8fed880c770d85aa` in main, [PR #169](https://github.com/joshualparris/JoshMemory/pull/169). Exact tested PR head `a5680c78eb60c429ec7037fa8136c392f01b9a2b`.
- **CI success:** [Repository Town Integration run 40077642675](https://github.com/joshualparris/JoshMemory/actions/runs/40077642675) (includes actual TownLife inventory regression, release/privacy/build and five economy seeds); [Recorded WebGL desktop/Android run 40077642686](https://github.com/joshualparris/JoshMemory/actions/runs/40077642686). First CI attempt failed because Errol becomes general manager at government initialization; source snapshot corrected, subsequent run fully green.


- **RTD-003 COMPLETE and merged (PR #169; release + WebGL CI green):** `docs/RTD_003_NPC_CAST_INVENTORY_2026-10-24.md` and complete machine-readable `docs/NPC_POPULATION_INVENTORY_2026-10-24.json`; `tests/npc-population-inventory.mjs` added to `npm run test:integration`.
- **Current figures confirmed from source:** 32 named street actors (10 Game300 voiced, 20 quizzes); **99** simulated Living Town workers, not only the historical 38. Original worker IDs 0–37 and home assignments stay stable. Workers comprise 61 baseline jobs + 30 relief jobs + 8 security/locksmith jobs; 99 named workers occupy 99 of 188 repository houses.
- **188 resident aliases are coordinate-keyed labels, not 188 extra full-life NPCs.** Grid has 208 possible coordinates, 20 lacking a project (G8–Z8). Avoid conflating `named:rowan`, a simulated worker also named Rowan, and any similarly named house resident. Namespaced identity IDs and exact mapping are in the JSON snapshot.
- **Execution evidence:** sourced from canonical NPCS, VoiceBank voice set, `TownLife` jobs/names/home allocation, project inventory and resident-name function; parity test instantiates real `TownLife` and checks 32/99/188 namespaced identities. No gameplay, voice, deployment or manual handset changes.
- Replit exhausted its usage; task transferred explicitly by the user. This session does not overwrite Replit code or change the generated backup. RTD-004 previous audit unchanged.
- **Next:** RTD-007 reserve next dialogue implementation work; use RTD-006 release baseline and separate owner-specific conversation branches for Rowan, Kit and Pip.

## Scope and source of truth
- Canonical editable repo: `joshualparris/JoshMemory/repository-town/src/`, not the generated `Parris-Tech-Services/Repository-town` mirror.
- Base main SHA: `6b18994b16cd763ebbac3ab8f3169bc0c20cc619`.
- Resume goal: natural player-choice NPC conversations with accurate prerecorded ElevenLabs speech, subtitles, stop/replay, personality consistency, and in-game browser playtests.
- Prior independent live playback evidence: 100 Game300 recordings/10 residents in `tests/game300-live-playback.cjs`, but this does NOT establish full branching conversation gameplay.
- Never claim recorded chat words match arbitrary generated NPC replies; no fake completed quest/purchase/repair lines. Existing gallery and opt-in devices remain unchanged unless reviewed.

## Numbered completion tasks
- [x] RT-01 Locate canonical writable source and inspect integration rules; verify the mirror is generated.
- [x] RT-02 Read existing sound integrations, 100-clip task tracker and prior testing limitations.
- [x] RT-03 Read actual Game300 captions/actor mapping and Town NPC hooks; identify safe conversational options.
- [x] RT-04 Build a reusable deterministic branching dialogue UI, with individually captioned prerecorded replies, back/exit and stop/replay.
- [x] RT-05 Wire choices into existing NPCs in genuine Town conversations without making false state claims.
- [x] RT-06 Add regression coverage for actor/caption/source match, dialogue state, rapid taps, dismissals, mobile size, errors and no autogenerated speech.
- [x] RT-07 Run tests, privacy/build gates, fix failures; record exact passing commands/CI SHA.
- [ ] RT-08 Merge reviewed change and confirm canonical deployment SHA/URL and audible production playback on desktop and mobile.
- [ ] RT-09 Inventory uncovered NPCs, identify appropriate new voice lines, generate only approved gaps, back up exact MP3 and captions to VoiceBank and Drive.

## Current evidence / next action
- This checkpoint is a handover, not a success statement.
- The Work session shown in screenshots made local patches, but without a pushed commit they cannot be assumed present. GitHub main remains authoritative.
- Next: inspect Game300 metadata and resident chat, implement modest non-invasive branching layer, then test.

## Verified PR evidence (2026-10-24)
- Branch source SHA: `2f7e4d2e4c16b393e3749efaed0d041186310b55` (last application change; documentation updates after this SHA).
- PR: https://github.com/joshualparris/JoshMemory/pull/166
- All eight checks passed at the application SHA: five 28-day economy seeds, Town safety gate (release build + privacy), Android emulation, desktop/mobile software-WebGL gameplay.
- In specific Chromium browser test `tests/recorded-dialogue-browser.mjs`, all ten actors were selected and their *actual* VoiceBank MP3 played in desktop and Pixel 7-size contexts, with exact actor-specific caption, stop/replay, 0 runtime paid ElevenLabs calls, 0 page errors. Logs: https://github.com/joshualparris/JoshMemory/actions/runs/40073596040/job/120812163000.
- First run discovered a real bug: desktop auto-focus hid the voice choices. Fixed `npc-chat.js` plus `tests/npc-viewport.mjs` and re-ran the full suite green.
- The new test covers the 2D lounge which reuses the same NPC modal as 3D Town; broad 3D WebGL gameplay also passed. It does **not** constitute manual testing on Josh's Samsung handset, or final deployed audio verification; mark RT-08 open until checked.
- No recordings regenerated or paid for. The existing 100 Game300 Town tracks remain backed by VoiceBank and Drive's GameDialogue300-OneClick (catalogue, ledger, pack folders).

## Remaining unvoiced original cast (22 of 32 NPCs)
Ember, Captain Vale, Bramble, Echo, Moss, Byte, Tick, Nimbus, Fizz, Captain Coral, Quill, Orbit, Thistle, Basil, Pebble, Zig, Pollen, Lumen, Vesper, Kestrel, Drift, Tangle.

All 22 are **UNRECORDED** in the approved Game300 Town pack. Do not play another speaker's lines for them or treat a proposed casting as recorded audio. Future work: individual voice auditions and consistency selection; author their safe branching scripts; generate/approve original MP3s with cost consent, SHA-256 and captions; save originals + manifests to Google Drive and VoiceBank GitHub; wire in native Town; regression/browser/deploy verify. Keep task RT-09 open until backed-up assets actually exist.

## Arcade automated playtesting — 24 October 2026

**Scope:** user supplied Skyvern v2 workflow titled *Playtest the Vibe-Coded Game* for Mysterious Depths and AA Game Adventure. This work is isolated from RTD NPC/audio development and existing game source.

- Canonical `src/arcade.html` exposes `#filter`, `#cards article`, `#game`, `#game-frame`, `#game-exit`; Playwright harness targets those real selectors.
- Catalogue `data/games.json` currently contains 77 entries. Both requested titles occur twice (JoshHub and Parris-Tech-Services editions) and all four `games/<id>/index.html` source files were confirmed present.
- Wrote `tests/arcade-agent-playtest.mjs` (browser Playwright, 20 actions max, --games ALL support, independent duplicate editions, before/after screenshots, runtime error and same-origin HTTP evidence, JSON report).
- Wrote `qa/skyvern-arcade-playtest.workflow.json` using Skyvern 3.0 navigation/extraction blocks and existing two workflow parameters. This is a definition only, not an authenticated Skyvern run.
- Added `tests/arcade-qa-contract.mjs`, `qa/README.md`, and opt-in manual `.github/workflows/repository-town-arcade-playtest.yml` with report/screenshot artifacts; linked QA docs from README.
- **Verification:** V8 syntax parse of the runner passed; Skyvern JSON parsed and required blocks/parameters confirmed. Browserless source checks found both requested titles and all four packed entrypoints. Full Node test and actual browser run **not yet verified**: local container has no GitHub DNS, web fetch of live Vercel arcade failed; GitHub workflow_dispatch is unavailable via connected GitHub actions. GitHub PR/CI and manual dispatch required.
- No new runtime game/deployment changes, no game bugs or balance findings fabricated. The browser report must be run before claiming actual gameplay coverage.

**Next:** open and merge reviewed PR once checks pass; then run the new manual GitHub Action for desktop and mobile and review its artifacts. Resolve any real observed bugs in the appropriate source game repository, not generated backup.

### QA integration completion and deployment evidence
- **MERGED CODE**: PR #171 `https://github.com/joshualparris/JoshMemory/pull/171` into canonical main at commit `db603aae0a27031fe256c2b1644f20822886c0ec`. Verified all five new QA files exist on default branch and runner source parses with the V8 JavaScript grammar check; Skyvern JSON parses as v2 navigation + extraction workflow.
- **Production**: Vercel latest known READY alias `repository-town-claude-complete.vercel.app` currently points to deployment `dpl_BhgxnKM45JfLxq6gdPTVtbBpWwpy` from prior source `03272c88`. GitHub combined Vercel status for QA merge reports failure at `https://vercel.com/joshualparris-projects?upgradeToPro=build-rate-limit`, an external **build-rate-limit**, not a newly demonstrated source compile error.
- **TEST RUN PENDING**: The new manual GitHub workflow has not been dispatched and no JSON/screenshot run results exist from it yet. Static checks only; no game-level bugs, UX or balance assertions made.
- **Exact next**: dispatch `Repository Town Arcade Playtest (manual)` twice (desktop/mobile), inspect evidence for both editions of each title, then log verified findings and address defects in the respective source game repository. Do not treat a 77-entry catalogue count as 77 verified playthroughs.

## TinyFish live arcade QA — 24 October 2026
- **Live browser evidence:** arcade loads and shows 59 game cards in production, but 77 entries are listed in current source inventory; counts are not automatically comparable. Combined TinyFish run `bd49eb95` supplied no per-game details, so not used as acceptance.
- **Mysterious Depths (hub edition)** focused run `346fd7c4`: four observed story choices advanced to actual Reached Ending and Back to library worked. UX: four locked achievements show `????` without context. Source narrative has complete sentence; truncated browser excerpt unproven. JoshHub source clarification commit `492e1b8c` not yet repacked/deployed.
- **AA Game Adventure** focused run `2398588b`: game opened and exited, agent tried arrows/WASD/space/canvas focus but did not verify item collection or movement; input focus uncertain. Source JoshHub HTML lacked any visible controls; added arrow-key/letter goal plus Focus controls button `774f0b6`, then fixed flow layout to a floating overlay `0c3724e` so the existing full-screen canvas remains 100vh. Script grammar/invariants passed via readback; no real QA after changes.
- **Detailed evidence:** `qa/reports/2026-10-24-tinyfish-arcade.md` links the three TinyFish runs and scoped findings. Not an entire arcade nor duplicate-edition acceptance pass.
- **Next:** repack the affected game(s), run `node tests/games.mjs --only hub-aa-game-adventure,hub-mysterious-depths` and targeted arcade Playwright input test, release/privacy gate, deploy exact build when Vercel rate limit permits, verify live keyboard interaction and final source fingerprint. TASK-040 remains OPEN.

## Screenshot fix — mobile automatic NPC dialogue clutter, 24 October 2026

Android screenshot showed Kip's automatic yarn caption covering the "tap to talk" interaction prompt. The actual source is `src/ui/yarns.js` 15-second nearby NPC yarn caption, not the player-initiated NPC chat dialog.

Superseding clean branch: `fix/town-mobile-yarn-controls-reconciled-20261024` (original PR #182 conflicted after concurrent main updates).

- Added immediate caption ✕ dismiss with per-event suppression and accessible labels.
- Added **Dialogue settings** to the HUD (expand + first on phone), with a persisted **Automatically show nearby conversations** checkbox. Default OFF for new touch/narrow displays, ON for desktop; explicit saved choice overrides defaults. If storage fails, current-session preference still applies.
- Settings hides automatic captions without affecting deliberate Yarns, NPCs or Ask AI, and participates in the same Escape/back + HUD overlay blocking.
- Explicit `[hidden]` CSS and compact mobile caption position above touch controls when enabled.
- Regression files `tests/yarn-preferences.mjs` and `tests/yarn-ui.mjs`, appended to the release test script without discarding concurrent suite changes.
- **Verified so far:** V8 parser checks, in-memory helper assertions and actual mounted UI test through a DOM stand-in passed. Node full release and device/browser acceptance not yet run, so do not claim deployed completion.

Next: PR checks/merge, full build:release/privacy, verify actual phone-sized interaction and deployed release source hash.

### Mobile dialogue merge / release status
- Clean [PR #184](https://github.com/joshualparris/JoshMemory/pull/184) **merged** as `e71e4c7b06bc33c0b6685b2c186a7370376eec44`; older conflicted PR #182 was closed.
- Confirmed source-level JS syntax, saved preference logic and browserless actual mounted-UI behaviour. Focused tests are included in `npm run test:release` on main. Full Node release/privacy suite and touch-device visual acceptance have not returned verified green results.
- GitHub combined status for merged SHA: **Vercel failure, target `upgradeToPro=build-rate-limit`**. Current production alias deployment `dpl_D13Yg9xZHFyJ36pu1yp4mRS5K8cF` was READY for older commit `4db4ef85fa581cf88af51dc1f208aed61190815b`, not the new merge. Do **not** tell users the fix is live until production `release.json` and manual browser controls are reverified.

## Host failover execution — 24 October 2026

Prompt: User explicitly requires acting on Render/GitHub Pages/Cloudflare alternatives instead of stopping at Vercel quota.

- Cloudflare account `1e819d2e840f44b43e70d299e4f54d01` had no Town Pages project; attempted `repository-town-fallback` connected to canonical `joshualparris/JoshMemory` with full-release build, but API returned 401 `8000011` Pages Git installation rejected. No project or deployment was reported created.
- Existing Render static site `repository-town-main-qa` `srv-dbam28dg1s2s73cke0m0` was active, pinned to canonical main with manual deploy; deployment `dep-dbe9cgnavr4c73a52qeg` attempted and failed immediately at 2026-10-24 11:28 UTC because workspace build pipeline minutes exhausted (verified Render events/logs).
- Created independent alternate Pages workflow in `joshualparris/repository-town` `9e1a67315efbc233eafae4ac4349f0cf8f2354a2`; [GitHub run #40090213978](https://github.com/joshualparris/repository-town/actions/runs/40090213978) **full release/privacy build PASSED and release SHA/mobile-dialogue asset validation PASSED**, but `actions/configure-pages@v5` failed because that placeholder repo does not have a Pages site enabled. Official action cannot self-enable with normal GITHUB_TOKEN (requires PAT/app admin permission); its URL is **not deployed**.
- Identified retired but existing Pages playtest `Parris-Tech-Services/Repository-town-playtest`, public root verified with TinyFish and saved-progress export intact. Added isolated QA workflow `4a021b539864183bb55f2554893c1a3ece38be09`, GitHub [run #40090579941](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40090579941). It builds canonical main with full gate and **publishes ONLY to `qa/mobile-dialogue-20261024/` after passing**, preserving root handover, approved mirror and old browser saves. As of checkpoint authoring, run in progress; exact terminal outcome and Pages HTTP status must be checked.
- Candidate URL only once verified: `https://parris-tech-services.github.io/Repository-town-playtest/qa/mobile-dialogue-20261024/`. This preview shares origin with the retired playtest (not Vercel/approved backup), so test it with a clean/incognito browser profile and preserve any old site saves via export. It is **not a production alias migration**.

**Do not call this fixed/deployed until run finishes, QA route returns a real 200, release.json source hash matches, and mobile dialogue/settings work in browser.** Preserve other agents' tasks while documenting results.

## Verified alternate host: GitHub Pages mobile dialogue QA — 24 October 2026

**DEPLOYED AND BROWSER VERIFIED** in an isolated subdirectory: https://parris-tech-services.github.io/Repository-town-playtest/qa/mobile-dialogue-20261024/

- QA publication in `Parris-Tech-Services/Repository-town-playtest`: [run 40090579941](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40090579941) **success**. Canonical `JoshMemory` release source `2743a8f182d69038fee841c19f96f2313a40ff60`, `release.json` content hash `32914d94b39a14f00fd193d04d2baa9ef652993d8b9708c42da3b9870dea74ca`. Full build:release + privacy + integrity passed before publish.
- Existing retired playtest root `index.html` unchanged (source SHA `7cf4a484`). This is a **separate URL path but the same Pages hostname/browser origin** as the retired handover. TEST ONLY with an incognito/new browser profile to avoid any shared `localStorage` save-key collision. Do not switch the default production alias or suggest old saves automatically carry across domains.
- [TinyFish desktop live acceptance](https://agent.tinyfish.ai/runs/2eda6d34-42fa-430d-b457-87b3a158c949) verified full 3D town, HUD controls, dialogue-settings checkbox, toggle off, `Preference saved` and persistence on reopening; tested 1920×1080 only.
- Added `qa-tests/mobile-dialogue-acceptance.mjs` and `.github/workflows/verify-town-mobile-dialogue.yml` to QA source. [Actual headless Chromium 390×844 live test 40091978098](https://github.com/Parris-Tech-Services/Repository-town-playtest/actions/runs/40091978098) **SUCCESS** (job 120866351291). Logs: `PASS: published GitHub Pages mobile dialogue QA; 390x844; release 2743a8f`. Checks: collapsed mobile HUD expands; Settings opens; mobile default auto-caption off; toggling persists localStorage; X closes and reopen works; off survives page reload; NPCs/Yarns/touch controls remain mounted; settings bounds fit viewport and no uncaught JS errors. Screenshot/JSON artifact `town-mobile-dialogue-browser-acceptance` ID `12559546335` uploaded, 186078 bytes.
- The actual *nearby-yarn dismiss X* was verified in the component DOM harness `tests/yarn-ui.mjs` and the required release gate; it was **not exercised by waiting for a real NPC encounter in live browser**, and a physical Android handset was not accessed. Those acceptance dimensions remain open; do not overclaim.

**Provider fallback evidence:** Vercel rate limit; Render `repository-town-main-qa` deploy `dep-dbe9cgnavr4c73a52qeg` failed for exhausted build minutes; Cloudflare Pages Git project creation 401 account integration; first standalone Pages project full build passed but Pages-site configuration absent; existing Pages handover subpath succeeded after full release gate. Policy also added to root `AGENTS.md` to require checking alternate hosts next time.

Next: if promoting this code to **production**, preserve and verify save-export/reimport and each host's approved release hash. Do not equate a QA path with official production. Live physical Android UX and real yarn-toast close remain recommended checks.

## Stable-ID next-action triage (25 October 2026)

**Numbering/coordination task only, no gameplay or release modified.** Created [22-position canonical next-action queue](docs/NEXT_ACTION_TRIAGE.md) and cross-linked the existing master tracker `docs/OUTSTANDING_WORK_2026-10-24.md`, canonical README and [stable ID registry](docs/UNNUMBERED_TODO_IDS_2026-10-24.md). Did **not** edit existing `TASK-034`, `TASK-040`, `RTD`, `RTA`, `RTR` or `AUDIO` IDs/checkboxes. The only new stable task IDs are `RTM-001` (real nearby NPC yarn X acceptance) and `RTM-002` (physical Android dialogue/HUD overlap, preferences, saved-game safety).

**Precisely where a new agent starts:** queue **01 / AUDIO-013.02**, live production Vercel alias/SHA, followed by `AUDIO-013.04` release fingerprint parity and `AUDIO-013.03` actual live NPC/audio tests. Previously observed Vercel READY source `42c4e0c` differs from Pages QA-tested `2743a8f`; these are not assumed equivalent. Claim only current unowned ID; check actual current provider state, preserve other agents' claims. Then `RTM-001`, mobile layout and physical Android `RTM-002`; afterwards TASK-034 dialogue/audio regressions; finish TASK-040 via the existing RTA-001..007 queue.

**No implementation or QA acceptance task was closed by this numbering work.** Runtime implementation, CI and device playtest must be tracked independently with commit/test/release evidence. The old work checkpoint's dated "next" sections are historical; follow the linked queue for this exact scoped request.

### Next-action ID triage — merged final evidence (25 October 2026)
- [PR #191](https://github.com/joshualparris/JoshMemory/pull/191) **MERGED** into `main` as `2d630d17d001e26540b4249431d2765827e51aa3`. Original conflicting PR #188 was closed; its scope was safely replayed on fresh main without replacing parallel `DOCS-RTD-TRIAGE-20261025` work.
- Canonical [scoped action index](docs/NEXT_ACTION_TRIAGE.md) verified on **merged main**: 22 sequential triage positions, **22 unique IDs**, first `AUDIO-013.02`, last `RTA-007`, zero missing registered IDs. Two newly allocated permanent `RTM-001/002` in [stable registry](docs/UNNUMBERED_TODO_IDS_2026-10-24.md); original RTD/AUDIO/RTR/RTA/TASK IDs and checkboxes unmodified.
- Both root central `docs/OUTSTANDING_WORK_2026-10-24.md` and Town README link this scoped QA queue. Separate after-RTD-009 implementation triage remains independent, so the scoped starting step must **not** override global RTD-010 ownership.
- This work is **documentation/numbering only**. No new runtime implementation, production deployment or physical Android test claimed; the broader TASK-034/TASK-040 acceptance remains open.


## Pub utilities start — 2026-10-25
RTPUB-001–008; owner Codex; branch feat/pub-utilities-20261025; baseline 59139c4. Audit decorative pub, implement fictional connected building systems with explicit assumptions, regression and browser verification. No completion claims yet.


### RTPUB milestone — source implementation
Finite fixture/energy/fuel/waste model, service panel, exclusive schematic overlays, pub kitchen/WC geometry and real hot-order/NPC dinner dependencies implemented. Focused pub, power-grid, shop transactions, high-street, 45-interior, seating and initial build/privacy checks passed. First release run found 19 seats vs required 20; corrected with bar-end stool and verified sitting test. Full gate re-running; browser in progress; no deployment claim. Next: finish browser/release evidence, review and merge only if green.

### RTPUB browser milestone
Local Chromium desktop and emulated Android passed all fixture approaches/actions, overlay selection, breaker/UPS/upstream outage scenarios, movement and zero page errors; eight screenshots generated. Existing minimum-seating regression corrected. Reconciled concurrent main 38f4f54 README additions without replacing stormwater work. Full release gate still running; no live claim.

### RTPUB release milestone
Full npm run build:release passed on reconciled candidate b858dac; privacy scanned 776 files/1116 markers, 77 game shells intact, 1141-file manifest verified. Desktop/emulated-phone WebGL passed; screenshots public-safe. Paid hot-order atomic refusal/success test passed. Hosted exact-SHA publication still pending; RTPUB-007/008 remain open.

## RTPUB source closure and hosted QA handoff — 2026-10-25
PR #201 merged b7d623c. All three PR workflows passed including five 28-day seeds. Local full release/privacy/integrity passed. Vercel preview source 97994daa READY; exact utility source files fetched/compared and actual hosted desktop/emulated Android pub interactions passed through managed network proxy. Vercel production build 402 quota, preview promotion 422; production alias unchanged. Existing Pages QA workflow 40156740087 passed full release and pub WebGL tests and published pinned b7d623c under qa/pub-utilities-20261025. Hosted acceptance run 40156987523 tests that real URL; lunchtime entry launcher qa-tests/pub-utilities.html advances real staff routines and enters pub. Original handover and approved backup mirror preserved. TinyFish confirmed rendering but could not control canvas; not counted as interior playtest. RTPUB-008.01–008.16 remain open in NSWutilities/docs/PUB_UTILITIES_NEXT_IMPLEMENTATION.md; start .01 and respect specialist task ownership. Physical handset, certified/fully calibrated utility network and Vercel production completion not claimed.

## PUB-SIM checkpoint — 26 October 2026
PR219; 39 registered seats inside existing envelope, sampled clear door swings, window-plane screens, rear dado gap and door-attached panic hardware, powered/coasting fans, pub uniforms and successful-service props. Added finite beer/glassware/plates and supplier reservations, independent communications, alternative converted gas scenario, onsite simulated RSA/RCG gates, playable pool and free scheduled Keno. Full release/privacy/integrity gate passed source74b7ea8, fingerprint de935092a63f231e0bf5ace165ff8fb8b80c687f0dcf9237ddd0e16222fbc89b. Local desktop/emulated-phone compliance gameplay passed. Hosted headerless automatic-entry wrapper verified at source3e91605e on desktop/phone. New venue UI test and exact final hosted release remain in progress; no final production or real compliance claim. Research/remaining tasks: docs/PUB_SIMULATION_2026-10-26.md, PUB-SIM-011–013 OPEN.

### PUB-SIM interface acceptance
Desktop and emulated-phone venue gameplay passed: pool shot, adult gate, scheduled three-minute Keno ticket/result and real menu alcohol purchase, zero page errors. Phone software WebGL replay exceeded the initial 30-second test deadline; 90-second bounded acceptance passes without changing simulation rules. Added failure diagnostics and reproducible hosted launcher test. Final remote publication still pending.

### PUB-SIM phone replay regression
Final repeated phone run caught a real intermittent first-frame timestamp race: requestAnimationFrame timestamp can precede the event handler's performance.now(), yielding index -1 and undefined balls. Clamped replay index to zero; authoritative physics/save result was already correct. Re-running exact final phone/browser and publication gates. Earlier single-pass phone success is not counted as proof this race was absent.

### PUB-SIM rendered service geometry
Exact fe22 full release/privacy/integrity and desktop/phone venue gameplay passed. Visual carried-dish review revealed the lowered counter lacked a collision footprint; added it and sampled the rerouted staff path at quarter-minute intervals against furniture. Corrected glasses to sit above bar/table tops and dishes on trays; filling now changes liquid inside a constant glass instead of scaling the whole glass. Door sweeps, clear 1.2m route, 39 seats and serving-route tests pass. Releasing this final geometry correction rather than claiming the earlier image was clipping-free.

### PUB-EXP browser milestone
Full local build:release/privacy/integrity passed candidate a6a1242. Desktop actual stair ascent, 32-seat upper floor, sitting/standing, lift isolation refusal, stair return, timed lift descent to cellar, finite wine transfer, hand basin, leak alarm and safe exit/refused re-entry, blackout stair/refuge and separate yard egress exercised successfully. Final assertion corrected to respect probeStatic's null-for-no-collision API. Upgraded upper furniture from blocking placeholder cubes to legs/seats/backs and open wine shelving, clear lighting around shafts. Final source candidate full checks/browser/hosted still pending. Existing eight-second generic browser navigation deadlines extended to 30s with polling to accommodate measured software WebGL timing; keyboard exit assertion retained.

## 2026-10-26 — pub ID and service control discoverability
- PR #220: direct character-18+ confirmation and Pub service controls above pub information; visible ID status, no-upload explanation and Back to pub menu. Confirmation is idempotent; other service gates preserved.
- Public build/privacy scan and pub completion simulation passed. Desktop (1280×900) and phone emulation (390×844) browser acceptance passed: confirmation visible without scrolling, confirmed state, controls and return-to-menu, no page errors.
- Full CI, merge and hosted publication/verification pending. Browser test: `node tests/pub-id-browser.mjs` (TOWN_URL defaults localhost:8097).

### PUB-EXP live-loop regression
Final 407 browser exercised all expansion actions, then caught an actual generic frame lifecycle defect: E on an escape portal calls leave(), clearing inside, before the same frame reads inside.dynamics. Added an interior-existence guard after Use so town rendering/saving/input continue; browser now also asserts post-escape movement. Preserved ID controls pass desktop/phone, and the full revised rear route passes real town-collider sampling. Re-run final expansion acceptance on corrected source; do not treat 407 as accepted.

### PUB-EXP final live visual clearance
Expansion source0c passed all seven workflows, publisher and live desktop/phone expansion including cancelled lift and both exits. Visual inspection of the actual stair-landing screenshot found the relocated ground menu board intersected a side-window opening; moved it to the clear rear-left wall. Shifted one upper wall picture off the window edge too. Added actual Three.js bounding-box regression for TV/menu/pictures versus the side-window span. Gameplay/route tests pass. Supplemental source/hosted verification remains pending; do not label the window issue fixed before the new live view is checked.
