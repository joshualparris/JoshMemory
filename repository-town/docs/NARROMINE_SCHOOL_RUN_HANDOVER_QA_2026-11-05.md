# Narromine school-run recovery — verified QA and remaining release gates (5 November 2026)

This is an auditable handover, not proof that every pending Repository Town issue is finished.

## Code incorporated
- #461: 3,244 **simulated** citizens, 1,171 eligible homes, 1,926 owned cars; 1,203 workers. Do not associate fictional names with real household addresses.
- #462–#464: enterable homes, Coles with scheduled workers and shoppers, and 78 furnished workplace interiors.
- #465, main commit `6af8bd4a`: school-run pickup/drop-off schedule, visible roadside walking NPCs, two daily Coles deliveries, oriented vehicle-footprint collision checks, zero-overlap parked-bay allocator, and reset of completed trip IDs when the simulated day advances. Original school-run branch preserved.
- #467: moving pedestrian models use monotonic actual frame elapsed time, rather than physics-clamped `dt`; cap long hidden-tab pauses. Regression covers Tuesday-to-next-Tuesday travel and avoids timing false negatives from lengthy screenshot capture.

## Evidence (GitHub Actions)
- [Real desktop and emulated phone Chromium acceptance, run 42029494578](https://github.com/joshualparris/JoshMemory/actions/runs/42029494578): success on #467 source commit `36cf40d7`, GLB instanced cars loaded, moving cars on both platforms, **23 moving sidewalk figures observed** each, no page JavaScript errors. Software-rendered speed samples: desktop 0.78–0.92 m/s at ~1.74 FPS; phone 1.02–1.20 m/s at ~3.88 FPS. These figures are bounded observations, **not** a hardware performance guarantee or a claim that 1.3 m/s was consistently achieved.
- Same workflow verified 1,097 scheduled weekday walks, 173 parked high-school-area vehicles with **zero oriented-rectangle overlaps**, 3,078 weekday trips, 1,031 Saturday trips, and the following-week trip-ID regression.
- Release-source build and privacy guard both passed in the browser workflow (no private repository markers in generated public build).
- Five 28-day economy seeds passed in #467 draft Integration run `42029494699`. **Town safety gate was skipped while draft**; it must run after a non-draft synchronize push, not be mistaken for success.
- Prior [desktop browser regression failure 42029006070](https://github.com/joshualparris/JoshMemory/actions/runs/42029006070) was a real low-frame-rate movement defect (0.31–0.37 m/s), resolved in #467. Do not suppress the WebGL test.

## Remaining before a production-complete claim
1. Let the non-draft **Town safety gate** run on the exact candidate SHA; check all required desktop/mobile browser, privacy, geometry, economy and source checks before merging #467.
2. Verify main commit and deployed production **exact SHA** independently; Vercel project `repository-town-claude-complete` was still serving `c788e73e` when checked, despite new main code. Do not equate GitHub merge with deployment or assume the GitHub Pages mirror is synchronised.
3. Open PRs #432 (2012 aerial roof colour/form vs newer LiDAR trees and roof collisions), #436 (old traffic safety changes), #440 (old WebGL source markers), #445/#435/#442/#457 (mutually overlapping industry/household models), #448 (Dandaloo continuous walking), #449 (draft rail loop), #441 (cadastral overlay), #460 (older overlapping traffic). Rebase and selectively integrate only unique features; never blindly merge an entire stale branch.
4. The older linked-industry candidate #457 **fails actual 28-day economy acceptance** on seeds 20261021 and 8675309 with happiness 38 and 39; cannot merge until the economy is fixed. The Chromium install failure there was an independent ubuntu-latest/Playwright 1.56.1 incompatibility.
5. Public school pedestrian evidence is a simulated street graph/roadside approximation, not verified continuous real-world accessible footpaths or a legally attributable timetable for any real person.

## Verification classification
- **Verified complete:** already merged citizen-home-workplace features and #465 source; #467 Chromium physical browser and focused Node/QA at `36cf40d7`.
- **Pending/blocked:** exact-head non-draft full safety gate, #467 safe merge, Vercel/Pages SHA parity, outstanding older PR reconciliations and any real-world per-lot/footpath facts.
