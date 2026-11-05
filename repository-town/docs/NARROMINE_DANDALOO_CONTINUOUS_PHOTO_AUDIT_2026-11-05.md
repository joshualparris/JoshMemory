# DANDALOO-001.6 — uninterrupted west-side walk and five photographic poses

**Status (5 Nov 2026):** newly implemented independent acceptance test. **Unverified until real desktop/phone Chromium CI, artifact inspection and hosted SHA checks complete.** Whole-town 10-area continuous walking and survey-grade kerb/ramp geometry are outside this narrow test.

## The difference from previous acceptance

PR #411 / NR-REAL-002 previously verified 20/20 **short, individually staged** local walking legs, with teleportation between the ten sites. This new test begins with **one** permitted staging placement per viewport, then moves approximately 0.5 km through the Dandaloo central street corridor using the **actual** game `walkTo` navigation and measured on-screen player positions. No intermediate `place`, HUD teleport, world-coordinate mutation or collision-bypass is permitted. The test records actual movements, point-to-point residuals, frame-to-frame maximum jumps, page errors and screenshots. Any blocked leg fails CI and remains a defect, not a forged success.

- Route: west-side *estimated* 5.8 m offset from the existing mapped OSM western Dandaloo carriageway, joining northern split carriageway, the merge and the southern railway-crossing approach. Road centrelines are not a 2026 pedestrian-footpath survey; the route is an engineering test hypothesis. Any field mismatch must be recorded rather than remapped to a convenient unobserved path.
- Acceptance: `audit.json` must show two uninterrupted journeys (1280×800 desktop and 412×915 emulated Android), each with the *same* geographically connected waypoints and **zero mid-walk teleports**. Test fails if walking is rejected, stops before a waypoint, changes into an interior, records a suspicious render-frame jump, or produces JS page errors.
- One independent second page per viewport takes five matched **geocoded game-only** photo poses. The posed captures are explicitly teleported camera viewpoints, **never** credited as physical movement.
- A simulated 412×915 touchscreen browser is **not** a real handset, and actual world photo dates/metadata need independent verification before PHOTO-01 is checked.

## Real-world evidence and non-assumptions

1. Council / GHD 2024 PAMP, issue 21: uneven Dandaloo walking surface and non-compliant ramp; issue 22: west Dandaloo/Nymagee crossing continuity gap in the 2024 survey. **Not proof these were still unchanged after works.** https://www.narromine.nsw.gov.au/Pedestrian%20Access%20and%20Mobility%20Plan%20%28PAMP%29_Redacted.pdf?downloadable=1
2. Council [April 2025 report](https://www.narromine.nsw.gov.au/08.%20Reports%20to%20Council%20-%20Infrastructure%20and%20Engineering%20Services%20-%20April%202025.pdf?downloadable=1) says Dandaloo rail approach asphalt and concrete footpath works were scheduled; **May 2025 progress report** confirms asphalt mill-and-fill completed at the rail approaches, plus sunken main-street paver repairs. These reports alone do not validate lane paint in 2026. https://www.narromine.nsw.gov.au/07.%20Reports%20to%20Council%20-%20Infastructure%20and%20Engineering%20Services%20-%20May%202025.pdf?downloadable=1
3. [June 2025 engineering report](https://www.narromine.nsw.gov.au/07.%20Reports%20to%20Council%20-%20Infastructure%20and%20Engineering%20Services%20-%20June%202025.pdf?downloadable=1): east Dandaloo concrete path *completed*, west under construction, culvert discovered damaged, new link to north edge of Coles access lane; **not proof west completed then**.
4. [6 August 2025 notice](https://www.narromine.nsw.gov.au/__media_downloads/council_column/2025.08.06%20Council%20Column.pdf?downloadable=1): access lane closed for additional footpath work. This is not an as-built ramp/kerb certificate.
5. Archived **55 owner-supplied comparisons**, screen captured **4 November 2026**. Screens show real-world Street View side-by-side with an *older model*; the Street View panorama capture year, field of view, licence and height are **not yet verified**. No third-party/owner photo pixels or access links included in this public test.

## Five private-reference discrepancy hypotheses — verify again at latest pinned SHA

| View | Geolocation / looking | Old comparison observation | Acceptance at new source (not presumed fixed) |
|---|---|---|---|
| #01 | -32.234269, 148.238730; 9° | Real Narromine Hotel two-storey verandah posts, ornate lace and adjacent brick structures were more elaborate than old flat massing | Check after Hotel custom model and exact forecourt clipping #443; no unrelated building changes without proof |
| #14 | -32.233452, 148.239363; 306° | Real overhead pedestrian railway truss, ramps and crossing structures absent in old image | Recheck current #414 bridge; review as-built west/east concrete approach and rail fencing |
| #28 | -32.232258, 148.239487; 306° | Two-storey red-brick corner frontage, mixed angled street parking and trees; old approximation lacked fenestration detail | Recheck #347 / current NW block before new façade work |
| #42 | -32.231093, 148.239683; 306° | Tall ribbed light façade, glass window bays and distinct entrance canopy; old rectangular façade simplified | Check entrance ground surface, door/awning and ramp individually; do not invent accessible grade |
| #55 | -32.230733, 148.239745; 157° | Real palm, clipped hedge, green grass median and pale curved white paint; old game was blank broad median | Recheck current median objects and paint against dated imagery; no fixed-spacing synthetic foliage |

**Metadata boundary:** The game images produced by this test can be uploaded as CI artefacts. The privately sourced Street View comparison captures are read-only references and must **not** be added to public repo, screenshots of the built game or commercial image texture atlases.

## Next gate

Review the uploaded game screenshots at five poses against their archived source reference, mark each feature `observed`, `dated/historic`, `approximate` or `unverified` in #424, then claim **only confirmed, unowned mismatches** as narrow feature repairs. Preserve other agents' road traffic, roof, frontage, railway and airport branches. Full corridor 2026 photogrammetry, all pedestrian ramps and uninterrupted walking across all ten distant Narromine audit locations remain open unless independently demonstrated.
