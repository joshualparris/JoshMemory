# ABS Dubbo demographic benchmark — safely retained from PR #254

Status: **Research/reference only. Not implemented in the live town.** Reconciled 28 October 2026 from `feat/abs-dubbo-demographics-20261027`; the earlier PR #254 implementation was based on an outdated game core and is **not safe to merge wholesale** into today's `main`.

## Source and geographic consistency

[ABS 2021 Census QuickStats — Dubbo UCL112006](https://www.abs.gov.au/census/find-census-data/quickstats/2021/UCL112006). This is the Dubbo **Urban Centre and Locality**, not the significant urban area, LGA, suburb or postcode. Census cell counts are privacy-perturbed; do not force independent totals to add up precisely.

| Measure (2021 UCL) | ABS figure |
|---|---:|
| People | 38,783 |
| Median age | 35 |
| Families | 9,770 |
| All private dwellings | 16,221 |
| Average people per household | 2.5 |
| Children per family with children | 1.9 |
| Male / female (perturbed counts) | 18,604 / 20,184 |
| Occupied / unoccupied private dwellings (table-specific) | 14,014 / 994 |
| Family / lone / group households | 9,525 / 3,970 / 523 |

The 18 five-year age-band counts (0–4 through 85+) from the ABS QuickStats are:
`[2983,2759,2618,2184,2333,3357,3153,2623,2102,2057,2079,2052,2079,1744,1548,1237,975,896]`.
Family household and family-type tables have different denominators; children in families may be adults. Census sex-category counts are not a gender-identity model.

## Candidate scaled model — NOT deployed

The old PR proposed scaling 188 home slots × 2.5 to a fictional 470-person population: 117 under 18; 78 aged 65+; 225 male / 245 female; 128 family, 53 lone and 7 group households. The implementation preserved the then-existing 171 economic actors and represented 299 additional people separately, with approximate age-aware avatars and school-day routines.

This is **not currently part of the published game**. Do not claim the live town has 470 NPCs, fully realistic dependants, population-accurate household composition, or new children until a new main-based implementation passes current roster/economy/visual/mobile/save tests. The original prototype is retained at [PR #254](https://github.com/joshualparris/JoshMemory/pull/254) and commit `35e96e639dbb104a1d68a30b0513e4505f48d634` for historical study, not merge.

## Acceptance requirements before future population implementation

1. Preserve existing worker IDs, schedules, payroll, spouse relationships, home assignments and old-save restoration. Compare against current main, not PR #254's October 27 baseline.
2. Keep population register and financially simulated economic actors separate; introduce dependency costs only with conservation tests.
3. Validate children have age-appropriate height/appearance, plausible households/guardians, no invented ethnicity or disability assumptions, and safe routes.
4. Cap resident rendering by actual FPS and mobile visibility budgets. New NPCs must not block player entrances, staff desks, emergency routes or existing dialogue.
5. Test weekdays/weekends and holidays honestly; avoid inventing ABS-backed pet ownership, retirement, computer-use or family microdata. ABS 2021 statistics are a benchmark, not observed 2026 town conditions.
6. Pass full current release, integration, privacy, economy, WebGL and deployed-host tests without disabling existing gates.

Source verification: ABS QuickStats UCL112006 checked on 28 October 2026. This is research preservation rather than a claim of implemented gameplay.
