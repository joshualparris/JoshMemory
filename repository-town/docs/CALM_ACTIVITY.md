# Calm town activity

## Scope
Default to Calm on devices without a stored preference. Settings → Town activity switches to Standard without resetting progress. Preference key: `repository-town.activity.v1`. Storage denial is nonfatal. Existing HUD preferences still win; new HUD preferences start compact on desktop and mobile.

This is a presentation and traffic-admission policy, not a simulation population migration. All residents, jobs, doors, staff, schedules, balances, quests and save formats remain unchanged. A hidden outdoor background resident is not an interaction target. Conversations already in progress retain their speaker.

## Optional interface additions
`createTownLife` takes optional `activity`. `createNarromineTraffic` and `createRepoTownCommuterParking` accept it in the existing options object. `createNarrominePedestrians` accepts a fifth optional options object. All absent-policy callers retain previous behaviour.

`createPopulationView.update` accepts an optional fifth `Set` of resident objects; omitted or null means previous visibility rules. `activity.outdoor` selects at most 14 ordinary outdoor residents within 95 m, separated by at least 3.2 m, with at most three within 12 m of a selected resident. Engaged speakers bypass this budget. Standalone Narromine commute walkers have a separate ten-actor budget. Street NPCs and indoor staff are not removed.

Calm admits a stable approximately 25% of commuter/car identities. Aggregate moving Narromine traffic is limited to 24 and parked cars to 40 in each of the two town parking systems. Existing moving vehicles finish their journeys rather than disappearing on toggle. Parked cars refresh on their existing two/three-second update schedule. This is not a universal 75% FPS improvement claim or a total-world actor cap.

The policy does not alter collision or pedestrian spatial algorithms. Integrate alongside #515/#518 rather than replacing their changes.

## Focus repair
WASD/arrow movement works when a HUD button retains focus. Text inputs and selects still consume keyboard input. Space/Enter keep their native button behaviour, Escape closes panels, and opening a modal still resets game movement.

## Validation
Run `npm run test:activity`, existing pedestrian/parking/spatial tests, and `npm run build:release`. Browser QA must cover desktop and touch-emulated mobile, preference reload, menu return to walking, town map and shop entry/exit. Physical Android performance and long-session traffic testing remain separate release acceptance gates.
