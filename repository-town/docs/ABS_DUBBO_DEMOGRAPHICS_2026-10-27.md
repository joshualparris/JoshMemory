# Dubbo Census baseline and Repo Town population

Research and implementation date: 27 October 2026. Public aggregate data and fictional residents only.

## Source and geography

Primary: [ABS 2021 Census QuickStats, Dubbo UCL112006](https://www.abs.gov.au/census/find-census-data/quickstats/2021/UCL112006). Do not mix the urban centre with Dubbo suburb, postcode, electoral district or Dubbo Regional LGA. The simulation uses a **2021 demographic benchmark**, not a measured 2026 population. The earlier phrase “latest completed Census” was imprecise: availability of published results is the relevant distinction.

Verified headline figures: 38,783 residents; median age 35; 16,221 all private dwellings; 9,770 families; average 2.5 people per household; 1.9 children in families with children. Sex counts 18,604 male and 20,184 female are privacy-perturbed and do not sum to the headline population. Age-band counts also differ slightly. Each table is independently normalised before largest-remainder allocation.

The occupied/unoccupied dwelling table excludes visitor-only and non-classifiable households: 14,014 occupied, 994 unoccupied. It is incorrect to divide population by 16,221 and expect the published 2.5 household size. Family composition uses **families**, household composition uses **households**, marital status uses **people aged 15+**. Family “children” can be adults. Census sex categories are not a complete gender-identity model.

## Implemented scale and constraints

188 existing home slots × 2.5 gives 470 fictional residents. All 171 established economic actors retain IDs, names, homes, jobs, earnings, savings and spouses. The additional 299 residents are a separate population register, not 299 invented paid workers. Named fantasy/quest characters and generic archive guides are excluded from the resident census; they are not counted twice.

| Metric | Implemented |
|---|---:|
| Residents | 470 |
| Under 18 | 117 |
| Age 65+ | 78 |
| Median age | 35 |
| Male / female | 225 / 245 |
| Family / lone / group households | 128 / 53 / 7 |
| Couple without / with children | 49 / 51 |
| One-parent / other families | 26 / 2 |

All 18 five-year age bins match largest-remainder targets. Exact ages within bins are deterministic fiction; the open-ended 85+ bin is represented by ages 85–89. Marriage years constrain established partners to have been adults when married. Minors have adult guardian IDs and plausible age separation. Some families have adult offspring or other relatives; no claim is made that every independently published marginal or joint distribution is exactly reproduced. Established couples remain together; new partners distinguish registered marriage from de facto relationships. Registered marital targets have integer/pair constraints.

## Gameplay integration

Town Ledger displays the resident population, economic roster, age comparison and complete household register separately. Figures use age-scaled height and child head proportions, no child facial hair, and grey senior hair. Existing street/shop staff use the same age-aware renderer. New resident figures are lazily created, distance culled and capped at 48 simultaneously visible additional figures.

Children of school age follow Monday–Friday school journeys and return home; weekend routines omit school. Under-fives remain home. Older residents and other household members have afternoon home/outdoor routines. Movement uses the existing footpath router, rail gate protection, collision sweep and local detours. Save files carry additional residents' journey state; old saves create the new register without replacing financial state.

## Explicit limits and further work

- This is a calibrated fictional population, not actual Dubbo residents or a complete demographic microsimulation. Existing 188 game home slots include archive/exhibition architecture; no claim is made that their rooms/bed counts are Census-compliant housing. The model does not rebuild these interiors.
- New residents do not yet consume the economy's food, pay household bills, earn wages or have the existing workers' conversational memory. Report the 171-person economic roster separately. Do not claim full dependant economics.
- School holidays, actual school capacity, escorted school runs, infancy animation, aging/births/deaths, full family dialogue and shared childcare are not implemented. School-age travel currently follows the normal pedestrian route.
- ABS QuickStats does not supply a Dubbo pet-ownership rate, computer-use rate or retirement proportion. These fields remain null rather than inventing ABS-backed cats, dogs, computer habits or equating “not in labour force” with retirement. Some new older residents' retirement labels are fictional roles.
- Labour-force, tenure and vehicle aggregates are preserved as reference data; existing job/financial/vehicle systems are not overwritten to force those marginals. Age does not determine skin colour, culture, disability or ability.
- Real handset performance and human visual judgement remain separate from automated desktop/mobile-emulation acceptance.

## Validation

`node tests/abs-demographics.mjs` checks apportionment, complete population/household counts, guardian constraints, preserved marriages/jobs, weekdays/weekends, age-aware meshes, old saves and in-progress journey restoration. Full release/privacy and hosted browser results are recorded in `ABS_DEMOGRAPHICS_CHECKPOINT.md` when obtained; source implementation alone is not deployed verification.
