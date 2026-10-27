# Repository Town calendar and weekend simulation — 27 October 2026

## Canonical timeline
- **Day 1 = Monday 26 October 2026** (town's fictional start date, independent of the real device clock).
- Day 6 = Saturday 31 October 2026; Day 7 = Sunday 1 November 2026; Day 8 = Monday 2 November 2026.
- Days 1, 8, 15, etc. are Monday. UTC civil-date arithmetic avoids NSW daylight saving shifts, local timezone changes and persistence drift.
- Source: `src/world/town-calendar.js`; `TownLife.calendar()`, `.dateLabel()`, `.weekday()`.
- The existing numeric day in v1/v2 save files remains the sole calendar position. No destructive save migration is needed.

## Actual behavioural changes
- Workers at schools, TAFE, university, bank, Post Office, council offices, court, solicitor, realty and selected industrial/commercial sites no longer repeat the weekday routine at weekends.
- Existing 171 NPC identities, employment links, household state and physical commutes are preserved. Closed buildings are not magically staffed by a fictitious invisible NPC.
- For real weekend trading, cafés, bakery, pub, General Store, butcher, hardware etc. have shortened opening hours and the two halves of a multi-person roster alternate Saturdays/Sundays.
- Farms, emergency services, power/water treatment, hotel and essential depots retain operational coverage. Livestock sites still require daily husbandry and use available alternate shifts.
- Off-duty residents wake later, take longer weekend breakfasts, browse the Saturday market, spend Sunday morning with household members, cook meals, relax and take local walks. No invented off-site church, train service or newly invented buildings.
- A Sunday-night sleep finishes early enough for Monday morning work and school commutes. Employee payroll remains tied to an actual completed shift.
- `TownLife.open()` and `facilityAccess()` both use the new weekday-aware schedule. Town opening-hours directory lists **today's** hours and clear closed-day status; fixed plaques warn visitors when weekend hours differ.
- In the HUD, a compact date is shown alongside the current clock and Day N. The full date appears in the tooltip, opening-hours directory, event log, test hook and ledger.

## Regression gates
`tests/town-calendar.mjs` validates date arithmetic (including leap year), weekend vs Monday service status, closed school/bank, store/pub weekend trading, split NPC roster, true Saturday/Sunday off-duty activities, the Sunday–Monday sleep transition, saved Day 8 and legacy save restoration. Included in `npm run test:town` and full release build.

The broader multi-week release exposed a one-hour power supply interruption when weekend traffic and delivery patterns changed. Power Station now starts with a larger *finite* fuel buffer, with paid supply shipments given higher physical truck dispatch priority; no fuel is replenished without a legitimate delivery. Full simulation and browser tests are the release gate.

## Scope and future realism
This is a **fictional town roster**, not a legally approved Australian industrial award schedule, a live Dubbo Council service schedule or a real NSW public-holiday/school-term calendar. Future scope: NSW public holidays and school vacations, resident employment contracts/rest-days, more realistic shift relief including 24-hour staffing, event-specific weekend activities and district-specific trading by actual dates. Do not claim regulatory certification.
