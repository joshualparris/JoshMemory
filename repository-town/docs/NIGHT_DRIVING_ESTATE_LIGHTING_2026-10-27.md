# Repository Town: Night-driving and estate street lighting — 27 October 2026

## Fault reproduction
User playtest (Android, 19:02 Day 5) showed no headlight illumination from the active vehicle, and no visible street-light poles on the new western estate roads. The original `buildTown` street-light mesh and local spotlights only covered the 8 legacy streets, while `buildMasterplan` only drew road/parcel/house surfaces. The car model had two static pale headlight blocks but no functional beam, no runtime sunset state and no steering-linked light target.

## Implemented
- The 195-house master plan now generates **277 physical roadside pole and luminaire positions** from all eight `PLAN_ROADS` including long Wattle and Banksia extensions, Grevillea, Acacia, Kurrajong, Bottlebrush, Silo and Saleyards.
- Spacing is 38 m per staggered side with a minimum 11 m clearance check for intersecting roads, and poles sit behind the 2 m footpaths at 6.95 m from the road centreline. Pole bases collide with pedestrians. Pole geometry is merged; heads share one emissive mesh.
- One bounded, player-centred light pool serves *both* town and estate: four dynamic roadway spotlights on coarse/mobile pointers or six on desktop. Lamps have a shielded downward roadward target, no shadow maps, and visible head emission at dusk and night. Light sources move to the nearest poles as the player/car moves, not to arbitrary unstated positions.
- The active car now mounts two actual `THREE.SpotLight` low-beam emitters just ahead of the bumper. Both beam targets are car-local, follow wheel heading, illuminate the road ahead over a nominal maximum 62 m and switch on via the same daylight curve as the street lamps. When the driver gets out, the beams and emissive lenses switch off. Headlights work independently of the town power grid.
- The existing test-harness reports `window.__town.driveHeadlights()` and `window.__town.estateLights()`; Android browser regression checks night/day switching and the new estate lamp count.
- Fixed an independent release-blocking coolant integrator bug: quantising each simulation frame to 0.1°C stopped the engine warming at 81.8°C; internal precision now converges towards the intended thermostat set point while the instrument rounds the display.

## Verification contract
Run `node tests/night-estate-lighting.mjs` for fixture placement, all 8 roads, front beam direction, yaw tracking, dusk/day, parked lights and power outage; this also runs inside `npm run test:town`, `npm run test:integration`, `npm run build:release`.
Run `node tests/mobile-driving.mjs` in a real local WebGL + Playwright Chromium launch for touch controls, vehicle purchase, a live headlight switch and estate map data.
Static 27 October audit found **277 fixtures on eight roads** and **zero detected fixture conflicts with the eight road centreline junction tests**. This is a game-world geometry check only.
**The change is not complete until a current deployment passes the release pipeline and is checked on Android at nighttime.** Vercel deployment cap, exhausted Render build minutes and queued GitHub Actions may block release, even when code is pushed.

## Explicit limitations
- Lamp intensity/range are artistic approximations, not real lux measurements or certified AS/NZS 1158 road-lighting design. A proper road lighting design requires pole schedule, power supply and measured photometric compliance.
- Car headlights are aimed geometric cones illuminating the modelled road; light scattering in air, beam levelling, high-beam switching, instrument stalk controls, ADR photometric testing and other roadworthy requirements are not claimed.
- Estate power distribution and all statutory Dubbo planning/civil approvals remain **unverified**. The game may render lit lamps without a surveyed substation or operating utility network.
