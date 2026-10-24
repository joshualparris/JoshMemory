# Lighting audit — 24 October 2026

Status: VERIFIED LOCALLY; publication/deployment BLOCKED pending approval. Not live. Public engineering record only.

## Reference behaviour

- Real streets: shield luminaires and aim light down onto walking/driving surfaces; moderate warm colour, useful coverage, gradual falloff and overlapping coverage rather than bright floating bulbs and black pavement. [DarkSky and Illuminating Engineering Society principles](https://darksky.org/resources/guides-and-how-tos/lighting-principles/), [NSW Dark Sky Planning Guideline](https://www.planning.nsw.gov.au/sites/default/files/2023-06/dark-sky-planning-guideline-2023.pdf), [FHWA lighting application](https://highways.dot.gov/safety/other/visibility/fhwa-lighting-handbook-august-2012/7-lighting-application).
- Signs: painted signs reflect external illumination; LED lightboxes illuminate the sign from behind. Do not make every painted facade neon. Preserve lettering contrast and use a restrained wash from visible fittings. [UK government Energy Technology List: backlit signs](https://etl.energysecurity.gov.uk/products/lighting/white-led-lighting-modules-backlit-illuminated-signs).
- Interiors: direct overhead task light plus reflected ambient fill; brighter neutral teaching/working spaces, warmer hospitality spaces. Indoor electric lighting must not disappear when the sun sets. [Australian Government lighting guide](https://www.energy.gov.au/business/equipment-guides/lighting), [Business Queensland retail guidance](https://www.business.qld.gov.au/industries/manufacturing-retail/retail-wholesale/retail-displays).
- Games: emissive materials make the surface itself visible; the direct-light model requires actual lights to illuminate adjacent geometry. Reuse a bounded set of local lights instead of one real light per pole. [Three.js materials](https://threejs.org/docs/pages/MeshStandardMaterial.html), [lights manual](https://threejs.org/manual/pages/lights.html), [SpotLight](https://threejs.org/docs/pages/SpotLight.html). Three.js light intensity in this build is calibrated visually, not a certified real-world lux calculation.

## Findings and changes

| ID | Finding | Change | Verification |
|---|---|---|---|
| RLT-001 | All streetlamp heads were emissive geometry only; no road, footpath or people illumination | Four reused warm downward SpotLights (two on touch devices) at real pole heads; shielded housings, soft beam edge and finite distance; smooth dusk transition | Node spatial/budget/day/night/blackout test; rendered street comparisons |
| RLT-002 | University, TAFE, hardware and trades had no interior light at all | Shared interior-kit safety net installs hemisphere bounce only if absent, plus four visible overhead fixtures and direct sources | Actual builds of all 45 civic interiors; desktop/mobile university and other interiors at 19:00 |
| RLT-003 | Painted shop signs became almost unreadable at night | Visible hooded fittings and low-cost baked downward atlas wash, preserving paint/lettering contrast | Existing south-facing sign contract; storefront screenshots and runtime check |
| RLT-004 | One shared glass material lit every shop all night, regardless of hours | Per-building glazing material and trading/preparation schedules; essential services/hotels remain lit | Overnight/closing schedule regression and storefront views |
| RLT-005 | Shared-shell electrical circuits were not independently controlled | Local lights remain on while occupied; circuit switches off for total supply loss, or existing critical/industrial feeder loss where mapped | Node circuit off/restore test; no claimed real outage gameplay acceptance |
| RLT-007 | Residential window bedtime conditions used OR, making them true all night | Correct early/late/night-owl schedules; normal households now turn out their lights at bedtime | Explicit 19:00, 23:00, 00:30 and 02:00 cohort regression |
| RLT-006 | Source needed repeatable visual coverage beyond screenshots supplied by user | Browser route captures noon, 19:30 and midnight streets; eight interiors at 19:00; front signs and window views in desktop and Android-size contexts | `tests/lighting-browser.mjs`, before/after reports |

## Scope and limits

Canonical source is JoshMemory/repository-town. No NPC, dialogue, audio, main.js, saved progress schema, game clock or generated backup edited. Preserve simultaneous NPC identity/collision work.

The cloud UI browser fails with `Error creating WebGL context`; a separately launched local Chromium with SwiftShader renders the actual game. Tests enter via the existing game hooks, move with W, look out through real windows and use real facility access checks. This is selected-route testing, not a continuous on-foot traverse of every street or every one of the 188 repository houses. TAFE/pub may initially deny entry because workers are commuting; the runner advances the simulation and retries without bypassing access.

Visual realism is adapted to the existing low-poly mobile renderer. At most four actual outdoor lights (two on touch devices) are selected near the player; distant lamp heads remain emissive. No expensive per-lamp shadow maps, global illumination, true window light transmission, bloom, eye-adaptation or physically measured photometry is claimed. The sign wash approximates external lighting in an atlas. Shared-shell interior electric circuits have blackout support; this does not establish all bespoke interiors have complete per-feeder blackout handling. An initial eight-light prototype reduced software-rendered FPS substantially and was rejected; the final budget is four/two, with all real street lights excluded from the daytime shader. Handset performance is unverified; software rendering FPS is not phone GPU performance.

## Publication blocker

The automatic approval reviewer rejected the first GitHub branch push, stating that publishing to GitHub was not authorised by the current request. Do not route around the rejection through another tool. Finish local implementation/tests and present the concrete reviewed change for approval before attempting publication. GitHub connector calls also return `Unknown tool`; that is a separate unavailable-tool error.

## Reproduce

```
npm ci --ignore-scripts
npx playwright install chromium
node tests/lighting.mjs
npm run build:release
node tests/lighting-browser.mjs
```

The browser runner starts/stops its own local server and writes `audit/lighting/after/` (use `--before` with an unmodified baseline build). Entry retry failures are reported as blocked locations, never counted as tested interiors. Before/after comparison must use the same viewport and game time.

## Final verification evidence

- Tested candidate source: `51dc315ba762db576f8f4e9fa29b8db27c391926` (includes final household schedule fixes). Subsequent checkpoint/evidence commits make no runtime changes.
- `npm run build:release`: PASS, including all release/integration/town checks, 188-house geometry, privacy scan (773 files/1116 private markers), packed-game integrity and 1138-file release verification. Log: `audit/lighting/release-checks.log`.
- `node tests/lighting-browser.mjs`: PASS in Chromium 141.0.7390.37 with SwiftShader, desktop and emulated Android. 38 recorded scenarios; 16 actual indoor movement checks (8 interiors × 2), 16 footpath movement checks (8 streets × 2), six day/dusk/midnight street views, six additional shopfront captures and 16 window-view captures. Zero runtime/shader errors; zero blocked locations after legitimate staffing retries.
- Final public content hash: `ebff6bec7c4d752265ac35b935502e66cade7a8ab2c6e32a8e99200369f10eb3`. `audit/lighting/after/metadata.json` records exact source/fingerprint and `report.json` records individual scenarios. Baseline captures show badge `c24c684` before application changes.
- Selected before/after screenshots are retained under `audit/lighting/`; the runner reproduces the entire screenshot set. University 19:00 image region mean pixel luminance increased from approximately 32 to 114 (desktop), and 31 to 116 (mobile). These are screenshot brightness measurements, NOT lux measurements.
- Initial missing-staff responses occurred after deliberately jumping the test clock; advancing the real simulation allowed entry. This is not proof of an ordinary-play staffing defect.
- No push, PR, merge, staging release, production deployment, backup synchronisation or native handset acceptance was completed. Automatic approval review explicitly rejected the branch push; do not treat local success as production success.

## Resume

1. Obtain approval to push this exact public engineering change to `joshualparris/JoshMemory`, review/merge and deploy Repo Town.
2. Fetch latest main, reconcile simultaneous NPC work without overwriting it, and push the topic branch. Update canonical coordination and checkpoint.
3. Review and run release checks on the reconciled source, stage and deploy the exact approved source using the existing hosting policy.
4. Verify hosted production/backup release fingerprints and repeat critical night views/playtesting on the hosted release; only then mark publication complete.

## Approved publication attempt and integrated verification

User explicitly approved push, review/merge and deployment. Merged current canonical main `a64b979` locally into candidate `e72a65408bdba2f77e33beb227cd689bc2d3c305`, preserving yarn settings, current tests and hosting fallbacks. Repeated the complete release gate: PASS; privacy scan 774 files / 1116 private markers; 1139 release files verified. Repeated all 38 desktop/emulated-Android browser scenarios: PASS, zero blocked locations and zero runtime/shader errors. Final content fingerprint `d0e66d250b6d43ad7b89045dbd925b05a8a7e4abeab1e922b0bc5d4c63959d61`.

The old approval blocker is RESOLVED. Publication is now blocked by unavailable authentication: HTTPS git push cannot read Username; connected GitHub read/write calls return Unknown tool. GitHub plugin is enabled/installed and its app setting is Allow all actions. No permission setting was changed. No authenticated alternative GitHub write capability is exposed. Restore GitHub access before retrying; do not ask the user to authorise the same publication again or to share a token in chat. No PR, remote main merge or deployment was performed. The existing Vercel/Pages/Render alternatives cannot repair missing canonical GitHub write access.

## Central task IDs and next action

[Central lighting triage](UNNUMBERED_TODO_IDS_2026-10-24.md#lighting-tasks-and-release-triage) preserves RLT-001–007 and adds RLT-008–019. Start RLT-008; execute RLT-009–016 in dependency order. RLT-017–019 separately track real-handset performance, gameplay outages and remaining interior coverage. Existing broader RTR task IDs are unchanged. Local numbering is complete; publishing it to canonical GitHub is still open under RLT-011.

## Browser fallback progress — 25 October 2026

Authenticated GitHub UI successfully created the scoped lighting branch and committed setup (6c4fa98), five renderer files (f87f42b) and regression tests (750446c). Public git fetch verified byte-for-byte equality of the five runtime files. Current main ee432c0 reconciled at f2053e1; full release/privacy gate passed (774 files, 1116 private markers, 1140 manifest files). No runtime changes relative to the e72a654 38-scenario browser candidate. RLT-008–010 are complete for this candidate. RLT-011 publication/PR is in progress; main merge/deployment/live acceptance remain open. Older authentication-blocked sections are historical.
