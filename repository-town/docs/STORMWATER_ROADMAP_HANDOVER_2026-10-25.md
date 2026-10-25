# RT-SYS-004 stormwater numbered tasks — Repository Town handover

**Status 25 Oct 2026: roadmap committed in NSWutilities, no stormwater simulation runtime deployed.** This is a pointer to the canonical child task queue so independent AI agents can safely claim and resume work.

- [Master canonical RTSM-001–030 queue](https://github.com/joshualparris/NSWutilities/blob/main/docs/STORMWATER_TASKS.md)
- [Machine-readable task/dependency JSON](https://github.com/joshualparris/NSWutilities/blob/main/docs/STORMWATER_TASKS.json)
- [Stormwater NSW research](https://github.com/joshualparris/NSWutilities/blob/main/docs/STORMWATER_RESEARCH_2026-10-25.md)
- [Engineering architecture and 22 acceptance tests](https://github.com/joshualparris/NSWutilities/blob/main/docs/STORMWATER_ARCHITECTURE.md)
- [Public source links](https://github.com/joshualparris/NSWutilities/blob/main/docs/STORMWATER_SOURCES.md)
- [16-system coverage and what's next](https://github.com/joshualparris/NSWutilities/blob/main/docs/UTILITY_ROADMAP_AUDIT_2026-10-25.md)

**First task:** RTSM-003, enumerate gutter/downpipe/street drains and roof/yard runoff for all 234 existing world location candidates from the RTU-001 registry. Record actual object IDs, coordinates, roof/road areas, connectivity evidence, and unknowns. Avoid claiming service connections from decorative world grates. RTSM-004 and RTSM-007 are parallel unclaimed research work.

**Boundary:** Stormwater drains, surface overland flooding and riverine inundation are not potable pipes or sanitary sewers. Existing RTU-022/029/030 are parent cross-system tasks and remain open; RTSW-001–028 remain dedicated to sanitary sewerage. Check [COORDINATION](../COORDINATION.md) to reserve source paths before runtime changes.

Dubbo's council-wide stormwater statistics are useful reference evidence, not evidence of the game's underground pipe network. Formal single stormwater reference town remains unselected. Neither public flood-map reuse rights nor a SWMM-calibrated flood model are claimed. 
