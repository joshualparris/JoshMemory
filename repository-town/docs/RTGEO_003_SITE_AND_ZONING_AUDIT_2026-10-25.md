# RTGEO-003 — candidate NSW site cadastre, land zoning, local authority and aerial-data audit

**Audit date:** 25 October 2026. **Game centre (WGS84):** `-32.273600, 148.408400`. **Game footprint:** approximately 780 × 480 m (**37.44 ha**); this is *not* the cadastral parcel's size. **Finding: official geographic identity and zoning verified; NOT cleared for a real town.**

## Canon decision superseding any **game-world relocation/no-go** interpretation

**25 October 2026 — the user has selected an alternate universe where this exact parcel is zoned for Repository Town.** Keep **−32.273600,148.408400**, the town history, and all 234 building/site IDs. The real-world verified GIS result is still **RU1 Primary Production** and is preserved as historical *source evidence*. **In the game universe this town footprint is designated RU5 Village-style.** The real-world physical-town no-go described in the archived audit below **does not apply to the fictional world's zoning** and **must not trigger relocation or block in-game construction**. Neither a real LEP map change nor any actual DA/CC/OC has occurred.

**RTGEO-017 alternative-site search: cancelled as unnecessary. RTGEO-018: optional external imagery reference only.** Continue RTGEO-004–016 for realistic climate, hazards, infrastructure and physical plausibility. [Locked alternate-universe canon](REPOSITORY_TOWN_ALTERNATE_UNIVERSE_ZONING.md).

## Decision

**RTGEO-003: RESEARCH ASSESSMENT COMPLETED — failed real-world town-site suitability gate.**

The fictional town is mapped to a **real rural cadastral lot in Minore**, within **Dubbo Regional Council**, **zoned RU1 Primary Production**. Its current planning designation is **not RU5 Village, a general town-centre zone or an approved urban release**. Treating this location as an available, legally developable 234-premises village would be unsupported; a land-use and potentially rezoning/planning-proposal pathway would need assessment by authorities. **This is not a determination that every individual use in RU1 is prohibited.** For the game, the location may remain as a transparently fictional overlay of an alternative history; do not represent an actual town physically present in 2026.

The property **is not proven vacant, available, abandoned, for sale, unoccupied, flood-safe, biodiversity-clear or approved for construction**. No title search, owner name or permit has been fabricated.

## Verified site facts — source-layer spatial queries

| Finding | Official result | Basis / confidence |
|---|---|---|
| Lot/plan | **Lot 105 / DP835474** | NSW Spatial Services SIX Maps cadastre lot layer `sixmaps/Cadastre/MapServer/0`; lotidstring `105//DP835474`, cadid `108104832` |
| Locality/postcode | **Minore NSW 2830** | SIX Maps Boundaries `MapServer/0`: `suburbname=MINORE`, `postcode=2830` |
| LGA/council | **Dubbo Regional / Dubbo Regional Council** | SIX Maps Boundaries `MapServer/1` |
| Statutory land zoning | **RU1 — Primary Production** | NSW Planning `EPI_Primary_Planning_Layers/MapServer/2`; Dubbo Regional Local Environmental Plan 2022, Map Amendment No 6 |
| Planning dataset currency | **18 September 2026** | Planning feature `CURRENCY_DATE=1789689600000` (Unix milliseconds); subject to later amendments |
| Spatial footprint | **The approximate model rectangle intersects one cadastral parcel, one LGA and one zoning polygon.** | Three *rectangle-intersection* GIS queries, not merely point sampling. Nine separate lot point queries independently returned the same lot |
| Official imagery capture metadata | **Narromine imagery block; starting 6 October 2015; 50 cm nominal resolution** | `public/NSW_Imagery_Dates/MapServer/0`, point metadata matched across centre and four corners |
| Buildings/roads/trees at the selected site | **NOT VISUALLY VERIFIED** | Aerial viewer reached welcome screen, but map canvas and coordinate controls did not load for inspection. Imagery footprints are **not photographs**; 2015 capture date cannot establish 2026 vacancy |
| Title ownership, rights of way and existing lawful use | **NOT VERIFIED** | A public cadastral identifier proves parcel identity, not land ownership or right to build |

### Source trace and reproducibility

- Official [SIX Maps cadastre layer](https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/Cadastre/MapServer/0) — point and rectangle queries at WGS84 EPSG:4326, `geometryType=esriGeometryPoint` / `esriGeometryEnvelope`, spatial relation `esriSpatialRelIntersects`, `where=1=1`, `outFields=*`, `f=json`.
- Official [SIX Maps boundaries service](https://maps.six.nsw.gov.au/arcgis/rest/services/sixmaps/Boundaries/MapServer) — layers 0 (locality) and 1 (LGA).
- Official [NSW Planning zoning layer](https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/2) — query `SYM_CODE`, `LAY_CLASS`, `EPI_NAME`, `AMENDMENT`, `CURRENCY_DATE`. The returned features have `RU1`, `Primary Production`, `Dubbo Regional Local Environmental Plan 2022`, `Map Amendment No 6`.
- Official [NSW imagery date footprints](https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Imagery_Dates/MapServer/0) — block `narromine`, `BlockStartDate=1444089600000`, `Resolution_cm=50`. The NSW [imagery service metadata](https://portal.spatial.nsw.gov.au/client/services?id=c04ce33be7a04a7884f786f5beb20b19) cautions that imagery currency varies with area/resolution and identify-date functionality may differ by viewer.
- Dubbo Regional Council [LEP zoning guidance](https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/Dubbo-Regional-Local-Environmental-Plan-2022), [planning proposal/rezoning process](https://www.dubbo.nsw.gov.au/Builders-Developers/Applying-and-Post-Approval/planning-proposal-application), and [NSW Planning Spatial Viewer](https://www.planningportal.nsw.gov.au/spatialviewer/).
- [GIS query data snapshot](../audit/geography/RTGEO_003_SITE_ASSESSMENT_2026-10-25.json) records sampled locations, queried service URLs, successful polygon counts and explicit unknowns.

**Queries:** At `148.4084,-32.2736` (longitude,latitude in EPSG:4326) the lot service reported **105//DP835474**, boundaries returned **MINORE / 2830** and **DUBBO REGIONAL**, and zoning returned **RU1 Primary Production**. A rectangle covering decimal-degree bbox **148.404252, -32.276208, 148.412548, -32.271891** intersected **one lot, one LGA and one zoning polygon**. The sampled model rectangle is an approximation, not surveyed building boundary. Official query services may be updated or replaced.

**Caution on parcel area:** The cadastre service publishes `shape_Area` and `planlotarea` fields that were not identical in the returned record. Do not claim an officially confirmed real-lot area or boundaries from one field without a deposited plan/area calculation. **37.44 ha** is only the game rectangle.

## RU1 implications for this fictional 234-building model

The game contains **188 house lots and 46 non-house sites** (pub, clinic, university, services, industry, roads and rail). This proposed multi-use urban settlement is **not a typical as-of-right use** on rural Primary Production land. Dubbo Regional LEP 2022 distinguishes RU1 from RU5 Village and other residential/employment zones; the precise legality of a proposed individual building and any rezoning are not determined merely by this spatial layer. A real town development would require a site-specific statutory planning, environmental and infrastructure process and usually landholder participation and zoning assessment. The [Council planning proposal process](https://www.dubbo.nsw.gov.au/Builders-Developers/Applying-and-Post-Approval/planning-proposal-application) specifically describes LEP amendments/re-zoning requests.

This does not require re-writing a fictional Victorian/NSW history, erasing Sir Reginald or moving the game immediately. Keep the existing **fictional timeline** and model coordinates while making the real-land **status explicit: simulation-only / unsuitable to assert physically present**.

## Aerial evidence limitation

The official **imagery-date layer** reports imagery capture beginning **2015-10-06** in this map block. I attempted to inspect the site directly on NSW SIX Maps; it opened the Explorer landing page, but the rendered map was inaccessible before the session ended. Therefore **no high-resolution aerial pixels of the selected parcel were visually examined** and no buildings, cleared trees, farm structures, tracks, rail crossings or agricultural activity may be classified from that failed inspection. **2026 land cover and land occupation remain UNKNOWN.**

A future inspector may open the [official NSW Explorer](https://portal.spatial.nsw.gov.au/explorer/index.html), enter the coordinates, select most recent imagery with capture date, export/inspect the footprint, and record the observed land cover at the relevant time. This is a validation step for physical suitability, **not** grounds to claim legal ownership, absence of Aboriginal heritage or right to build.

## Exact next actions

**RTGEO-003 administrative/zoning assessment is complete**, with the consequence that the site has **failed the 'ready to develop a physical town' gate**. For the **game**, keep the fictional location with explicit RU1/not-cleared tags. For further physical plausibility:

1. **RTGEO-017 — alternative developable-site screening**: if the user wants the real ground to be a credible town-scale site, compare a genuinely documented **RU5 Village or other legally permitted urban site**, road/rail flood constraints and title structure. Do not silently move all canonical addresses from the chosen point.
2. **RTGEO-018 — visual aerial and occupation verification**: obtain a rendered current official aerial image, survey/current title and verify the **2026** site occupation; the 2015 imagery block is not sufficient.
3. **RTGEO-004** cultural/heritage checks and **RTGEO-005** DEM/flood checks remain priority gates.
4. No utilities origin or highway/rail access to this exact lot is verified under **RTGEO-006…009**; these must stay open.

**No NSW real estate transaction, legal approval, land entry, owner identification, zoning change or gameplay deployment was performed in this RTGEO-003 research audit.**
