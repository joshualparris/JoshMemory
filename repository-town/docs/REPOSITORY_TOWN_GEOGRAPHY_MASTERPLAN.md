# Repository Town geographic and infrastructure masterplan — Oct 2026

**Anchor WGS84:** -32.273600, 148.408400; **candidate footprint:** x = −390…390 m east–west and z = −190…290 m north–south (37.44 ha). It is a **fictional point overlay** west of Minore. **Do not identify a real property as vacant, consented, available or flood-safe.** No cadastral parcel identity or binding utility network map has been verified.

## 1. Location decisions and geometric transform

- Region: **Orana / Central West NSW**, in the wider **Dubbo–Minore–Narromine corridor**, realistic farming hinterland west of Dubbo. **The LGA at this exact selected point has not been verified against the official LGA polygon** even though nearby Minore is documented as within Dubbo Regional Council; do not silently replace the in-game council with a real statutory authority.
- Neighbours: Minore **4.7 km**, Narromine **16.5 km**, Dubbo **18.8 km**, all **straight-line approximations** from published town-centre coordinates. Use routed maps for **driving times**. Nearest watercourse/bank is **not measured**.
- Horizontal transform for game-world map position `(x,z)`: latitude ≈ −32.273600 − z/111195; longitude ≈ 148.408400 + x/(111195 cos(−32.273600°)). This local equirectangular transform is valid for **a small game map** and must not be treated as cadastral accuracy. Game y/elevation presently has **no known AHD datum**.
- Source for parcel proof: NSW SIX Maps imagery, address, cadastre, 2-m contour/DEM and NSW Planning Portal land use layers. No claim of 'empty paddock' is complete until maps and, for real building consideration, landholder and Traditional Owner engagement substantiate it. See S01–S03.
- **Maps:** [OSM candidate point](https://www.openstreetmap.org/?mlat=-32.273600&mlon=148.408400#map=15/-32.273600/148.408400) · [NSW SIX Maps](https://maps.six.nsw.gov.au/) · [planning layers](https://www.planningportal.nsw.gov.au/spatialviewer/).

## 2. Exact climate proxy and rainfall

The closest defensible **published proxy selected for this engineering model** is **Bureau of Meteorology Dubbo Airport AWS #065070**, at about 32.22° S, 148.58° E, station height 284 m. These are **station values**, **NOT measured values at the fictional town point**, whose elevation remains unresolved. Use all-years station data, not extrapolated pseudo-precision.

| BOM climate datum | Verified AWS station statistic |
|---|---:|
| Mean annual rainfall | **587.5 mm** |
| Mean January daily maximum | **33.7 °C** |
| Mean July daily maximum | **15.7 °C** |
| Mean January daily minimum | **18.4 °C** |
| Mean July daily minimum | **3.1 °C** |
| Mean annual daily maximum | **24.8 °C** |

The seasonal cycle requires **summer heat waves, winter cold and frosts, rain variability, hot dry periods, storm runoff and severe drought years**. BOM statistics reflect different years of record per statistic. For realistic 2026 weather, later models should use **station/historical gridded observations** and interpolate by actual game date; no annual average can determine conditions for an individual day. Do not assign zero cloud, fixed rainfall, real-time temperature or evaporation by arbitrary lore. [BOM table S08](https://www.bom.gov.au/climate/averages/tables/cw_065070_All.shtml).

## 3. Electricity: verified upstream chain and chosen simulation design

Essential Energy's **2025 Distribution Annual Planning Report, Dubbo section p50**, supports the real upstream **Transgrid Wellington 330/132 kV** source and **Essential Energy Dubbo 132/66 kV** network. Narromine's zone supply comes from **Narromine South Switching station on the 132 kV Dubbo South–Nyngan corridor**. Which actual **11 or 22 kV feeder** passes the chosen ground is **not documented** by that report, and no physical pole or line route to −32.273600, 148.408400 is asserted. Essential Energy started regional high-voltage corridor investigations in **May 2026** with anticipated build **after approval, around 2028**—not a completed 2026 asset.

**Physically plausible game distribution sequence, not an as-built truth:** Wellington bulk grid → selected existing Dubbo/Narromine zone supply (to be verified) → engineered 22 kV rural feeder at a *hypothetical, permitted* intake → town-side 22/0.4 kV transformers → three-phase 400 V and single-phase 230 V LV mains and individual metered services. Incorporate realistic transformer capacity, voltage drop, load diversity, network phase, protective devices, outages and distributed generation. **Do not fabricate a whole-town connection from the fictional Power Station at H9-N to a surveyed live 66 kV line.**

Existing [RTU-003/005 electrical backbone](RTU_003_005_ELECTRICAL_BACKBONE.md) deliberately models a **synthetic 66/22 kV intake at H9-N** plus 22 kV streets and meters. Preserve its tests/IDs and implement a **separate geographic reconciliation** before changing voltage and topology. H9-N may become a local operations building or backup generation/battery site, but that is a proposed design change, not an implemented game fact. Reference towns for generic detailed implementation remain **Menindee electricity, Orange water and Narromine sewerage**; nearby geographic anchoring does not silently override prior technical research decisions.

## 4. Water, sewer, stormwater and flooding

The **Macquarie–Wambuul River** flows through the wider Dubbo and Narromine region, not demonstrably across this proposed 37-ha polygon. **Distance to the river, creek, cowal, flood height and licensed access to intake are UNKNOWN** until geospatial analysis. Water must not be infinitely pumped directly out of a convenient nearby blue line. Historic rivers, floodplain breakouts and **1950/1955 and recent flood events** highlight risk; roads can be isolated even if the fictional town centre is not inundated.

Possible **candidate** supply pathway only: lawful bulk service from an approved operator or registered bore/entitlement → source-specific treatment to NSW potable standards → tanks, pressure zones/boosting, distribution pipes, fire supply, isolation valves, metering and live water quality. Bore yields, permits and connection presence are not yet known. For sewage: gravity drains, downstream network or on-site engineered plant only when permitted, loads, treatment, energy, effluent disposal, overflow rules and sampling. **Do not route wastewater into stormwater.** Stormwater needs roofs, kerbs, inlet pits, drainage paths, basin storage and legal receiving outfall based on surveyed DEM/topology. Evaluate 1% AEP, rarer-event effects and climate uncertainties using competent flood sources, not a synthetic all-clear.

The Macquarie–Wambuul 2026 water security scheme is **still under investigation**, not a completed new source. Source S13 and Narromine flood review S12. Town's water and sanitation game modules remain partly abstract/under construction.

## 5. Roads, rail, logistics and fuel

- **Road:** Mitchell Highway provides **regional** Dubbo–Narromine access, not an automatically authorised driveway at the exact point. Model a fictional local access street with intersection geometry, speed transition, line of sight, heavy vehicle turning, school/pedestrian access, bridge flood immunity and necessary authority approval. **Do not add a row-9 road:** the existing road at row 8 is the south-side frontage's access.
- **Rail:** regional **Main Western** passes via Dubbo and Narromine. The game's parallel freight line, depot and level crossings are **fictional local modelling** unless a specific real nearby crossing is verified. An in-universe Repo's Halt petition (1887) is **not** a claim of actual ARTC siding ownership, track, points, freight path, station or passenger service. Avoid unsafe invented level crossing licences.
- **Logistics:** farm milk/grain/lamb deliveries originate in a rural agricultural context, but chain distances and truck movements need real roads and fuel deliveries, not straight-line km. The pub LPG remains finite stock; do not claim a household gas reticulation network without a local gas service report.
- **Communications:** fibre/telephone/mobile infrastructure, reception, NBN technology and radio transmitter locations at the exact GPS are **not verified**. Do not use a proxy suburb's service checker as exact evidence.
- **Climate and agriculture:** grain, mixed cropping and grazing are regionally plausible; crop failures must follow rainfall, soil, water entitlement, temperature and seasons, rather than year-round identical outputs.

## 6. Town identity and game compatibility

- Founders **Reginald Arthur Repo** and **Ellen Repo** in **1883**; Reginald **first in-universe mayor 1909–1914**, knighted in invented story **1927**. No new Sir Reginald NPC added to 2026. The **current in-game mayor is Vern**, existing candidates Arlo and Sadie.
- First **fictional permanent settler building:** **Repo's Stores, G8-N, 1883**. Rebuilt to Town Hall 1910; a **town hall heritage exhibit** can tell the story without replacing the existing Town Hall geometry.
- **N8-S pub remains built 1911, opened 1912**; its earlier town history predates the pub. G8-N and N8-S are *lot designation canon*, not actual surveyed NSW addresses.
- Existing **188 houses and 46 other premises** / 234 total assets must keep addresses, north/south frontage, records and existing per-service IDs. The geographic transform is a provenance layer rather than mass coordinate rebase; avoid NPC path, utility-grid, storm lighting and save-file regressions.
- The live seven-game-day civic elections are **accelerated gameplay**, not actual historical NSW council term length. The game's municipal office does not assert real statutory independence in Dubbo Regional Council or Narromine Shire.

## 7. No-guess engineering data acquisition

1. Inspect precise chosen GPS in **SIX Maps aerial photography**, legal cadastre, land ownership/licence, boundary, and the planning GIS. Resolve LGA at exact point.
2. Load surveyed DEM / contours, soils, flood hazard and Aboriginal culture/heritage registers with proper access/protocols. Reject sites with prohibited constraints rather than pretending the map is 'vacant'.
3. Identify actual public access road, pavement and river/creek/cowal; measure road time and river distances **only after route data** is available.
4. Confirm zone substation/feeder and protection **through Essential Energy sources**, not a consumer utility map screenshot.
5. Obtain evidence of water operator/entitlements/treatment and sewage authority. No cartographic proxy is a service connection authorisation.
6. Ensure every named physical line/pole/pump/road/rail crossing has explicit REAL, ASSUMED or FICTIONAL provenance. Publish diagrams/tests and sampled fault scenarios.
7. Then calibrate 2026 season/weather, site flood response, demand and town transport using observed region-specific data with units.

**Linked work:** [Canon history](REPOSITORY_TOWN_HISTORY_1883_2026.md) · [Task IDs](REPOSITORY_TOWN_GEOGRAPHY_TODO.md) · [Machine data](REPOSITORY_TOWN_GEOGRAPHY_HISTORY_CANON.json). This document is deliberately more precise about **what is not verified** than an invented parcel-scale infrastructure plan would be.

### Primary evidence links

- **S01** [NSW mapping cadastre imagery elevation](https://alpha.portal.spatial.nsw.gov.au/client/toolsandviewers)
- **S02** [NSW planning zoning maps](https://www.planningportal.nsw.gov.au/spatialviewer/)
- **S03** [Dubbo Regional Council villages (includes Minore)](https://www.dubbo.nsw.gov.au/Our-Region-Environment/Maps-traffic-and-transport/city-maps)
- **S04** [NSW Macquarie–Wambuul dual river name](https://www.nsw.gov.au/departments-and-agencies/geographical-names-board/news/wambuul)
- **S05** [Macquarie Aboriginal regional context](https://www.bioregionalassessments.gov.au/assessments/11-context-statement-central-west-subregion/1122-human-geography)
- **S06** [ARHS Narromine railway historical study](https://arhsnsw.com.au/wp-content/uploads/2018/08/F-Narromine.pdf)
- **S07** [NSW Heritage Dubbo Railway Precinct](https://apps.environment.nsw.gov.au/dpcheritageapp/ViewHeritageItemDetails.aspx?ID=4806342)
- **S08** [BOM Dubbo Airport AWS 065070](https://www.bom.gov.au/climate/averages/tables/cw_065070_All.shtml)
- **S09** [Essential Energy Distribution Annual Planning Report 2025 (Dubbo p50)](https://dapr.essentialenergy.com.au/DAPR_Essential_Energy_2025.pdf)
- **S10** [Essential Energy 2026 investigations Dubbo–Narromine](https://engage.essentialenergy.com.au/dubbo-and-surrounds-high-voltage/news_feed/site-investigations-narromine-surrounds-and-dubbo-to-mendooran-rd)
- **S11** [Essential Energy historic zone substation loads](https://www.essentialenergy.com.au/our-network/network-projects/zone-substation-reports)
- **S12** [Narromine Council 2026 floodplain review](https://www.narromine.nsw.gov.au/development/flooding)
- **S13** [NSW Macquarie–Wambuul water security investigations](https://www.water.nsw.gov.au/our-work/water-infrastructure/regional-projects/macquarie-wambuul-water-security-project)
- **S14** [Minore OSM place anchor](https://mapcarta.com/16660700)
- **S15** [Narromine OSM place anchor](https://mapcarta.com/Narromine)
- **S16** [Dubbo town centroid and Narromine geodesic reference](https://www.geodatos.net/en/coordinates/australia/narromine)
- **S17** [NSW Narromine historical civic records](https://www.narromine.nsw.gov.au/community/local-history-room)
- **S18** [Heritage NSW 1911 hotel architectural analogue](https://apps.environment.nsw.gov.au/dpcheritageapp/ViewHeritageItemDetails.aspx?ID=1590062)
- **S19** [NSW building code applicability Oct 2026](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code)
- **S20** [NSW SES Narromine flood emergency plan](https://www.ses.nsw.gov.au/sites/default/files/2024-06/Narromine%20LFP%20May%202024%20Endorsed.pdf)
