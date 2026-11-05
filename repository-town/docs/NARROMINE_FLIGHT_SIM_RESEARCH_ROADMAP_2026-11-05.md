# Narromine / Repository Town flight simulator — comparative research & implementation roadmap

**Created:** 5 November 2026 (Australia/Sydney)  
**Status:** RESEARCHED BACKLOG ONLY — 0/68 below implemented by this PR  
**Baseline:** JoshMemory `main` `df1ed966eb23b5ae3e43ca77de015ba8e2ebae5c`, merged airport PR #415 and mobile take-off recovery PR #450.  
**Owner/coordination:** NR-FSIM-ROADMAP-001, documentation-only branch. No new systems or live deploy claimed.

## What has actually been implemented already

As observed in current repository source: two fictional boardable trainer/sport planes; an approximate YNRM two-runway plus gliding-strip model; an optional assisted runway-11 ground reset; simple pitch/bank/throttle arcade dynamics and runway-only take-off; chase/cockpit cameras, small flight HUD, Android press-and-hold buttons, simulated landing/stall and a visible flight corridor over both towns. `src/world/flight-dynamics.js`, `player-flight.js` and `narromine-airfield-data.js` are the authoritative current code. No simulated fuel depletion, aerodynamic AoA, taxi brakes, live weather, aviation career, controller-driven flight plan or real instrument suite was found in these modules. Some existing town map/time/AI systems may be reusable; do not duplicate them. The current runway coordinates and many non-critical airfield details are approximated, **not surveyed**.

## What to learn from other simulators

| Game | Observed official strengths | Best-fit adaptation here |
| --- | --- | --- |
| [Microsoft Flight Simulator 2024](https://www.flightsimulator.com/microsoft-flight-simulator-2024/) | Preflight checks, aircraft systems, realistic landscapes, VFR flight planner, missions and career path | Walkaround, scenic flying and fictional local missions |
| [X-Plane 12](https://www.x-plane.com/) / [flight model report](https://developer.x-plane.com/article/x-plane-12-flight-model-report/) | Lift/drag/flight-model validation, weather, failures, instrument learning, replay | Lightweight aerodynamics with deterministic tests rather than pretending this is certified |
| [Infinite Flight](https://infiniteflight.com/features) | Mobile-friendly flying, autopilot, global map, logbook, replays, flight planning and guided learning | Phone HUD, touch usability, logbook and waypoint navigation |
| [GeoFS](https://www.geo-fs.com/) | Accessible browser simulation, weather, satellite/GIS navigation, multiplayer, instruments, gliding | Browser performance, VFR map and soaring |
| [Aerofly FS](https://www.aerofly.com/features/overview/) / [copilot](https://www.aerofly.com/tutorials/copilot/) | Copilot assists, landing rewind, time-skip, air traffic, missions, detailed cockpit and lighting | Recovery, assisted flight, local AI traffic, landing lessons |
| [FlightGear](https://www.flightgear.org/about/features/) | Open systems, configurable aircraft, weather, schedules, multiplayer and extensions | Data-driven architecture and scripted local flight traffic |

**Practical rule:** do not clone these games or their licensed meshes, maps, aircraft brands, voice lines, charts or copyrighted code. Learn general interaction/physics concepts and implement original assets/code; obey asset licences and costs. A future feature can be inspired by multiple simulators.

## Sequencing / implementation contract

- **P0 first:** mobile control/ground/runway/first-flight reliability; stop and test before realistic weather and missions. **P1 next:** better physics and YNRM operations/navigation. **P2:** environment, sound, reasons to fly. **P3:** complex systems, multiplayer and extensibility.
- Every ID below is **unstarted** in this roadmap. New owners should claim 1–3 non-overlapping IDs on canonical `COORDINATION.md`, use a narrow PR and preserve current model/airfield integrations and any other agents' work.
- Definition of Done per ID: maintain source/asset provenance; deterministic Node tests for model/data; scoped playable desktop and Android Chromium or actual-device tests; release build and privacy passes; verify merged main plus hosted source SHA, where relevant. A passing unit test does **not** equal playable production.
- Avoid any changes to production or backup while drafting this plan; the release pipeline is subject to Vercel deployment quota and privacy safeguards. Do not create costs, premium APIs or network features without explicit approval.
- YNRM is represented as a real aerodrome inside a **fictional game simulation**. Do not invent actual controller services or live aerodrome traffic; distinguish CTAF-style game calls from an ATC tower, and verify contemporary Airservices publications before making operational accuracy claims. The [Airservices 2026 chart index](https://www.airservicesaustralia.com/aip/current/dap/dap_03SEP2026.htm) lists YNRM aerodrome/approach charts.

## Milestone A — First flight that feels right on a phone
- [ ] **NR-FSIM-001 · P0: Instrument the actual phases of flight.** Introduce explicit parked/taxi/take-off roll/airborne/approach/landing/stopped/recovering states; transitions logged; no contradictory AGL/ground indication.
- [ ] **NR-FSIM-002 · P0: Responsive throttle, reverse and brakes.** Use an adjustable throttle control with an independent wheel-brake button; parked aircraft cannot accelerate without pilot input; stopping from fast taxi is bounded and tested.
- [ ] **NR-FSIM-003 · P0: Separate taxi steering from airborne roll.** Rudder/nosewheel steering remains controllable at low speed while bank input controls flight; prove both in the game and in Android touch tests.
- [ ] **NR-FSIM-004 · P0: Touchable simultaneous pitch, roll and throttle.** Provide a thumb-friendly two-axis flight stick plus throttle with multi-touch support; verify simultaneous inputs on real Chromium Android emulation without gesture stealing.
- [ ] **NR-FSIM-005 · P0: Mobile safe-area flight layout.** Support portrait/landscape, cutouts, keyboard/joystick overlays and collapsed HUD; no flight button covered by map, chat or touch joystick at 360–412px.
- [ ] **NR-FSIM-006 · P0: Guided take-off lesson.** Add an optional illustrated taxi → line-up → throttle → rotation → climb tutorial with live speed/attitude feedback and non-blocking recovery from errors.
- [ ] **NR-FSIM-007 · P0: Clear assisted-versus-realistic modes.** Offer casual assist vs more demanding flight options (not false certified training); mode persists through flight and changes only selected assists.
- [ ] **NR-FSIM-008 · P0: Full basic flight instruments.** Add IAS, GPS/ground speed distinction, attitude horizon, altimeter (AGL vs AMSL), VSI, heading and vertical speed; units toggled and values tested.
- [ ] **NR-FSIM-009 · P0: Stall, overspeed and ground warnings.** Give accessible visual/audio cues, including explicit wrong-surface/off-runway and insufficient take-off-speed messages without treating every high speed as airborne.
- [ ] **NR-FSIM-010 · P0: Predictable controls and pause.** Add throttle calibration, sensitivity and invert pitch plus pause/resume; background-tab and long-frame recovery cannot jump aircraft through terrain.
- [ ] **NR-FSIM-011 · P0: Save and resume at safe points.** Persist a stopped/on-ground aircraft and selected settings with save migration; preserve the existing intentional prohibition on silently resuming mid-air.
- [ ] **NR-FSIM-012 · P0: First-flight full browser gate.** Script real browser cold start → walk → board → taxi → take-off → fly to Repo Town → approach → land → brake → exit on desktop and portrait/landscape Android.

## Milestone B — Flight physics, not just moving a model
- [ ] **NR-FSIM-013 · P1: True attitude and control axes.** Track pitch, bank, yaw and angular rates separately; no instant direction reversal; controls produce predictable inertial response.
- [ ] **NR-FSIM-014 · P1: Lift, drag and angle of attack.** Use a documented simplified aerodynamic model with per-aircraft lift/drag/critical-AoA curves and bounded integrator, benchmarked against plausible trainer behaviour.
- [ ] **NR-FSIM-015 · P1: Physical stalls and recoveries.** A stall causes sinking/buffet and reduced authority, with recoverable nose-down/throttle action; unit tests cover entry and recovery without NaN.
- [ ] **NR-FSIM-016 · P1: Coordinated rudder and turn behaviour.** Support rudder, crosswind correction, yaw/slip indicator and optional auto-coordination; distinct from bank steering at taxi speeds.
- [ ] **NR-FSIM-017 · P1: Trim for level cruise.** Pitch trim offsets sustained control pressure; test stable cruise across bounded speeds without permanent nose-button hold.
- [ ] **NR-FSIM-018 · P1: Flaps and aircraft-specific speed limits.** Add deployable flaps with appropriate lift/drag/stall-speed changes, labelled positions and warnings if extended too fast.
- [ ] **NR-FSIM-019 · P1: Ground effect and flare.** Provide short-lived extra lift near the runway and a controlled flare; compare touchdowns with/without flare at testable speeds.
- [ ] **NR-FSIM-020 · P1: Wheel contact, drag and runway friction.** Handle actual gear contact and friction on asphalt/grass/gravel, independent brakes and directional ground steering; no 245 km/h off-runway taxi without clear consequences.
- [ ] **NR-FSIM-021 · P1: Terrain and building contact.** Use altitude above local ground and actual sampled collision envelopes; landings on ground and wings hitting structures have coherent outcomes, no clipping through rooftops.
- [ ] **NR-FSIM-022 · P1: Fuel, payload, weight and centre of gravity.** Model finite fuel burn and passenger/cargo loading affecting acceleration, climb and range, in an optional simplified mode; values persist safely.
- [ ] **NR-FSIM-023 · P1: Engine and propeller response.** Add start/stop, idle, RPM and throttle lag with matching animation and sound; engine-out flight glides rather than freezing the actor.
- [ ] **NR-FSIM-024 · P1: Flight-model regression harness.** Record deterministic take-off distance, climb, turn, stall, crosswind landing and frame-rate-invariance trajectories per aircraft with tolerances.

## Milestone C — YNRM aerodrome, navigation and traffic
- [ ] **NR-FSIM-025 · P1: Choose both ends of both paved runways.** Support simulated use of runway 11, 29, 04 and 22 from evidence-grounded runway ends; prevent start-position/heading mismatch.
- [ ] **NR-FSIM-026 · P1: Taxiway-connected ground navigation.** Join surveyed/OSM-supported apron, taxi routes and runway access points; do not invent taxi links through hangars or paddocks.
- [ ] **NR-FSIM-027 · P1: Explicit hold-short and runway occupancy.** Model runway crossing/entry clearances in the *game*, with stop markers and traffic separation; avoid claiming a real tower controls YNRM.
- [ ] **NR-FSIM-028 · P1: CTAF-style self-announcement.** Add optional local traffic call/acknowledgement gameplay, clearly fictional and not a real communication service; use current source-verified YNRM procedures only.
- [ ] **NR-FSIM-029 · P1: Circuit practice.** Draw and assess crosswind, downwind, base, final and go-around routes; support left/right circuits only where aerodrome evidence supports them.
- [ ] **NR-FSIM-030 · P1: Local GA and glider traffic.** Schedule small fictional aircraft and gliders with runway/strip conflict avoidance; no overlapping departures/landings or invented live callsigns.
- [ ] **NR-FSIM-031 · P1: Gliders and soaring strips.** Add tow or winch start, energy management, thermals and soaring challenge on the already modelled glider areas, without assuming simultaneous ops are allowed.
- [ ] **NR-FSIM-032 · P1: Aircraft-centred VFR map.** Provide readable aircraft position, heading, runway diagrams, user waypoint and distance; differentiate the game's fictional map from real aviation charts.
- [ ] **NR-FSIM-033 · P1: Narromine–Repository Town flight planner.** Allow a two-way flight plan with estimated distance, direction, mission markers and return-to-airfield route, with map/terrain consistently loaded.
- [ ] **NR-FSIM-034 · P1: GPS-style route guidance.** Waypoint bearing, distance, ETA and optional heading bug; no auto-magical arrivals or teleport except clearly labelled assist.
- [ ] **NR-FSIM-035 · P1: Landing pattern and visual guidance.** Add runway alignment and approach-path indicators in the HUD; only add physical PAPI/VASI beacons if verified to exist at YNRM.
- [ ] **NR-FSIM-036 · P1: Ground servicing and aviation-world interactions.** Implement hangar parking, fuel/service UI, aircraft preflight points and meaningful walkable interaction with existing museum/club without duplicate buildings.

## Milestone D — The sky, sound and the world
- [ ] **NR-FSIM-037 · P2: Configurable regional weather.** Presets for calm, windy, gusty, hot/cold and low-visibility flying; wind has actual airspeed/groundspeed and drift consequences.
- [ ] **NR-FSIM-038 · P2: Real-weather mode as an opt-in enhancement.** Use licensed, timestamped weather data with caching and unavailable/stale fallback; label nearest station and never imply airport-specific METAR exists without proof.
- [ ] **NR-FSIM-039 · P2: Cloud layers, fog and visibility.** Provide a mobile-friendly cloud/visibility system with realistic separation from terrain and instrument readability; scalable graphics tiers.
- [ ] **NR-FSIM-040 · P2: Convective lift and turbulence.** Thermals and gusts should interact with glider/wing behaviour and vary with season/time; gradual, bounded dynamics and reproducible seeds.
- [ ] **NR-FSIM-041 · P2: Sun, twilight and night flying.** Respect game latitude/time and adjust sky, shadows, instrument visibility and navigation cues; no abrupt scene transitions.
- [ ] **NR-FSIM-042 · P2: Evidence-backed runway/aircraft lighting.** Add aircraft navigation/strobe/landing lights and only lights supported by current aerodrome information; visually verify night circuits.
- [ ] **NR-FSIM-043 · P2: Spatial aircraft audio.** Engine RPM, prop wash, wind buffeting, rolling tyres, flap/gear cues and cockpit/exterior attenuation with mobile mute/accessibility controls.
- [ ] **NR-FSIM-044 · P2: Better camera and view controls.** Chase, cockpit, wing, free-look, fly-by and landing replay camera with bounded FOV; no camera occlusion by panels/plane.
- [ ] **NR-FSIM-045 · P2: Terrain, buildings and horizon LOD.** Stream/render Narromine to fictional town without pop-in, floating terrain, duplicated buildings or excessive rural stand-ins; keep sourced geography provenance.
- [ ] **NR-FSIM-046 · P2: Performance and battery budgets.** Define measurable mobile frame-time, memory, download and LOD targets; run emulated Android and a low-power real device when available; no paid external assets by default.

## Milestone E — Things worth flying for
- [ ] **NR-FSIM-047 · P2: Flight school progression.** Optional lesson ladder: ground controls, straight/level, turns, circuits, crosswind, solo and navigation, with teachable feedback and repeatable scoring.
- [ ] **NR-FSIM-048 · P2: Scenic discovery/photo flights.** Landmark routes over Narromine and fictional Repo Town; screenshot goals use game-rendered views, not copyrighted street imagery.
- [ ] **NR-FSIM-049 · P2: Local passenger sightseeing.** Fictional passengers board, enjoy a circuit and pay a game fare; safety/performance scores and no real operators implied.
- [ ] **NR-FSIM-050 · P2: Cargo/courier air runs.** Connect existing fictional shops, farms, warehouses and airfield with finite goods, loading limits, invoices and one delivery receipt.
- [ ] **NR-FSIM-051 · P2: Agricultural aerial jobs.** Fictional crop-survey and optional spray/scatter gameplay only on identified in-game fields; clear environmental and legal distinction from actual farm operations.
- [ ] **NR-FSIM-052 · P2: Search-and-rescue discovery.** Fictional missing-hiker or remote-stock scenarios with visual search, map clue and ground-team handoff; avoid depicting real ongoing emergencies.
- [ ] **NR-FSIM-053 · P2: Medevac and community service missions.** Clearly fictional dispatch, patient transport and timed routes linked to existing town hospital services; no medical simulation claims.
- [ ] **NR-FSIM-054 · P2: Landing challenges and awards.** Score approach stability, centreline, touchdown zone, flare and safe stop; allow casual success with configurable assists.
- [ ] **NR-FSIM-055 · P2: Pilot logbook and replay.** Track each aircraft's game time, take-offs, landings, route, weather preset and hard landings; filter and review locally without uploading precise user location.
- [ ] **NR-FSIM-056 · P2: In-game flight events and economy integration.** Create weekly flight-school, airshow and tourism events with reservations/NPC schedules and game currency; preserve existing jobs and economy tests.

## Milestone F — Advanced features after foundations
- [ ] **NR-FSIM-057 · P3: Assistive copilot and basic autopilot.** Heading, altitude and wings-level hold plus optional assisted circuit/landing, with override, disengage indications and bounded failure handling.
- [ ] **NR-FSIM-058 · P3: Interactive switch-based cockpit.** Click/tap basic instruments, starter, fuel selector, avionics and lighting from both seating and cockpit camera; preserve accessible non-cockpit equivalent.
- [ ] **NR-FSIM-059 · P3: Cold-and-dark optional start.** Provide safe gamified preflight walkaround, checklist, electrical/engine start, taxi and shutdown; one-click quick-start stays available.
- [ ] **NR-FSIM-060 · P3: Replay, rewind and landing retry.** Deterministic local state ring buffer for last minutes of flight, instant landing retry, pause and free camera; no unbounded memory growth.
- [ ] **NR-FSIM-061 · P3: Selectable aircraft faults.** Engine-out, pitot failure, instrument blackout and stuck-flap scenarios only in optional training mode; recovery routes/tests, no random griefing in casual mode.
- [ ] **NR-FSIM-062 · P3: User-configured aircraft profiles.** Configurable sensitivity, performance, liveries and assist presets in local profile without importing third-party copyrighted aircraft/assets by default.
- [ ] **NR-FSIM-063 · P3: External controllers and accessibility.** Support keyboard, Bluetooth gamepad/HOTAS where browser APIs permit, remapping, handedness, colour-blind cues and screen-reader-labelled controls.
- [ ] **NR-FSIM-064 · P3: Ghost flights and optional multiplayer.** Start with privacy-safe local ghost replays; consider online shared flights only with moderation, network reliability, abuse/security and explicit user consent.
- [ ] **NR-FSIM-065 · P3: Replayable AI traffic and ground operations.** Path-following aircraft at YNRM, tug/fuel vehicle and passenger services must observe runway occupancy and never collide with players; traffic density slider.
- [ ] **NR-FSIM-066 · P3: Debug physics and integration dashboard.** Developer-only telemetry for runway contact, pitch command, wind, lift/drag, ground clearance, collision and frame time; no private tokens/paths in public build.
- [ ] **NR-FSIM-067 · P3: Source/licensing/evidence audit.** Tag every real aerodrome structure, runway marker, chart and terrain asset by source/date/licence/confidence; clearly flag invented gameplay details.
- [ ] **NR-FSIM-068 · P3: Release-proof flight acceptance.** Require deterministic model tests, privacy/build, real phone and desktop browser footage, staging hosted screenshot, main merge and exact public release.json/source SHA verification.

## Recommended first implementation slices (ordered)

1. **NR-FSIM-001, 002, 004, 005, 006:** make runway and phone input states intelligible, add brakes and a tutorial; record an actual new-player mobile take-off/land.
2. **NR-FSIM-008, 013, 014, 016, 024:** add trustworthy instruments and simplified aerodynamic/terrain dynamics without breaking the current flight path.
3. **NR-FSIM-025, 026, 029, 032:** both ends of the runways, taxi route, circuit, two-town flight plan.
4. **NR-FSIM-037, 043, 047, 049, 055:** weather presets, camera, lessons, courier jobs and logbook for a compelling activity loop.
5. **Only later:** autopilot, failures and multiplayer (P3), with user consent and performance/billing review.

## Acceptance scenarios that should not be silently skipped

- Fresh player on small Android screen takes off and lands without a keyboard, including multi-touch nose + throttle, and sees why an off-runway take-off is invalid; no excessive 245 km/h taxi trap.
- Two aircraft types rotate at plausible speed, lose lift when stalled, can recover and can brake to a stop; consistent behaviour at 20/30/60 FPS.
- Player flies over Narromine and back to Repository Town without aircraft disappearing, terrain gaps, clipped world geometry or invalid coordinates.
- YNRM runway 11/29 and 04/22 plus grass strips are distinguished from taxiways and private/apron areas; no invented tower operations.
- A weather scenario demonstrably changes handling, navigation instruments are coherent, and a scripted mission can be completed and recorded.
- Actual deployed SHA, source files and screenshots match the reviewed/merged implementation; document any Vercel rate limit or blocked preview honestly.

## Research references

1. Microsoft Flight Simulator 2024 features and career: https://www.flightsimulator.com/microsoft-flight-simulator-2024/ and https://www.flightsimulator.com/guide/new-flight-simmer-guide/
2. X-Plane 12: https://www.x-plane.com/ and https://developer.x-plane.com/article/x-plane-12-flight-model-report/
3. Infinite Flight: https://infiniteflight.com/features
4. GeoFS: https://www.geo-fs.com/ and https://vfrenglish.geo-fs.com/pages/mobile.php
5. Aerofly FS: https://www.aerofly.com/features/overview/ and https://www.aerofly.com/tutorials/copilot/
6. FlightGear: https://www.flightgear.org/about/features/
7. Narromine operational chart provenance entrypoint: https://www.airservicesaustralia.com/aip/current/dap/dap_03SEP2026.htm

These are source-documented *feature inspirations*, not a claim that their commercial or open-source implementation can legally or technically be copied.
