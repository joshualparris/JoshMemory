# Narromine: research dossier and plan to make it drivable from Repository Town

Status: research and design only (no game code yet). Branch `claude/narromine`.
Every fact below carries its source. Where sources disagree the disagreement is recorded, not
resolved; check the primary source (ABS, council, AWM, Trove) before putting a number on screen.

## 1. Why Narromine, and where it sits

- Narromine is about **40 km (≈30 min) west of Dubbo along the A32 Mitchell Highway**, which
  largely follows the Macquarie River ([australiatravelquestions](https://australiatravelquestions.com/?p=41997),
  [Wikivoyage](https://en.wikivoyage.org/wiki/Narromine)).
- The Dubbo–Narromine stretch was recently widened with overtaking lanes in a $32 million
  safety upgrade ([Western Plains App](https://westernplainsapp.com.au/NewsStory/travel-between-dubbo-and-narromine-gets-safer/67246cf40e3bfa002e445e6b)).
- Repository Town is a Dubbo-flavoured town (Dubbo radio, NSW signs, Central West farms), so a
  drive west to Narromine is the natural first "other town".

## 2. Population (2021 Census, ABS — use these, not commercial profiles)

| Area | People | Median age | Aboriginal and/or Torres Strait Islander |
|---|---|---|---|
| Narromine town (locality) | 4,608 | 39 | 895 (Indigenous Location; median age 23) |
| Narromine Shire (LGA) | 6,458 | 41 | 1,300 (median age 24); ≈20% of the shire |

Sources: [ABS SAL](https://abs.gov.au/census/find-census-data/quickstats/2021/SAL12920),
[ABS LGA](https://abs.gov.au/census/find-census-data/quickstats/2021/LGA15850),
[ABS ILOC](https://www.abs.gov.au/census/find-census-data/quickstats/2021/ILOC10100401).
A commercial profile gives 24.7% Indigenous for the "suburb"; it uses a different boundary and
should not be used ([gdp.com.au](https://gdp.com.au/suburb/narromine-nsw)).

Game implication: a town of ~4,600 is roughly 40% of the residents the game simulates per
neighbourhood today; Narromine should feel smaller and quieter than Repo Town, with a young
Aboriginal community (median age 23) visible in schools, sport and the street.

## 3. Country and First Nations

- Wiradjuri Country. The name comes from a pastoral run whose name is a Wiradjuri word; sources
  differ on meaning: *ngarru-mayiny* "honey people" ([Wikipedia](https://en.wikipedia.org/wiki/Narromine)),
  "place of many lizards" or "place of honey" ([Aussietowns](https://aussietowns.com.au/?p=11175)).
  Show both meanings and say they differ.
- The land lay within **Wangaibon** territory; in December 2021 NSW restored the name **Wambuul**
  ("winding river") for the Macquarie River ([Wikipedia](https://en.wikipedia.org/wiki/Narromine)).
- Rule for the game: First Nations content comes only from Aboriginal-authored or
  community-endorsed public sources; no sacred or sensitive sites; no invented Aboriginal
  characters or stories. Before shipping any of it, ask Narromine Local Aboriginal Land Council
  or Wiradjuri language groups for guidance (outward contact: Josh's decision, not the agent's).

## 4. History timeline (for in-game plaques and the museum)

| Year | Event | Source |
|---|---|---|
| Jun 1818 | John Oxley passes the site, first European to do so | [Wikipedia](https://en.wikipedia.org/wiki/Narromine) |
| 20 Oct 1882 | Main West railway extended Dubbo→Nevertire; the town begins at the platforms | [Wikipedia](https://en.wikipedia.org/wiki/Narromine) |
| 1883 | Township gazetted; station opens 1 May 1883 | [Wikipedia station](https://en.wikipedia.org/wiki/Narromine_railway_station) |
| 1889 | Court House Hotel (David Fitch), Burraway/Merilba Sts | [Aussietowns](https://aussietowns.com.au/?p=11175) |
| 1889 or 1900 | Post office spelling "Narramine" → "Narromine" (sources differ) | [Wikipedia](https://en.wikipedia.org/wiki/Narromine) |
| 1890 | Royal Hotel, Dandaloo St — Cobb & Co stop | [Aussietowns](https://aussietowns.com.au/?p=11175) |
| 1901 | Narromine Hotel (built as the Federal), Dandaloo St, iron-lace veranda | [Aussietowns](https://aussietowns.com.au/?p=11175) |
| 1920s–30s | Famous aviators visit; Australia's oldest regional aero club forms; Kingsford Smith, Nancy-Bird Walton, later Chuck Yeager | [Visit NSW](https://www.visitnsw.com/destinations/country-nsw/dubbo-area/narromine/attractions/narromine-aviation-museum), [Wikipedia](https://en.wikipedia.org/wiki/Narromine) |
| 27 Mar 1926 | Biggest flood since 1893; river 50 ft (15 m); town cut off | [Wikipedia](https://en.wikipedia.org/wiki/Narromine) |
| Jun/Jul 1940–Jul 1944 | RAAF No. 5 Elementary Flying Training School: Tiger Moths; ≈2,800 graduates (sources give 2,800–2,850 of 3,734) | [Wikipedia 5 EFTS](https://en.wikipedia.org/wiki/No._5_Elementary_Flying_Training_School_RAAF), [AWM Places of Pride](https://placesofpride.awm.gov.au/stories/narromine-world-war-ii-raaf) |
| 1942–44 | No. 8 Operational Training Unit also at the aerodrome | [ozatwar](https://mail.ozatwar.com/airfields/narromineairfield.htm) |
| ~25 years | Qantas alternate airport for Sydney (Mascot) | [Science Week](https://www.scienceweek.net.au/discovery-centre/narromine-aviation-museum/) |
| Aug 1990 | Record Macquarie River flood at Narromine, 15.93 m | [Wikipedia](https://en.wikipedia.org/wiki/Narromine) |
| 2002 | Narromine Aviation Museum opens, volunteer-built, shared with aero and gliding clubs | [Science Week](https://www.scienceweek.net.au/discovery-centre/narromine-aviation-museum/) |
| 2026 | Draft Economic Development Strategy 2026–2030 on exhibition (24 Jun 2026) | [Council](https://yoursay.narromine.nsw.gov.au/have-your-say-economic-development-strategy) |

Banjo Paterson's "The City of Dreadful Thirst" mentions the town ([Wikipedia](https://en.wikipedia.org/wiki/Narromine)).

## 5. Places to build (the first playable town)

| Place | Real detail | Game role |
|---|---|---|
| **Dandaloo Street** | Main street: Royal Hotel (1890), Narromine Hotel (1901), Soldiers' Wall memorial, cafés | Arrival point; shops, pub interiors |
| **Burraway Street civic block** | Old Court House = town museum, between the visitor information centre and the police station | Museum + visitor centre |
| **Narromine Aerodrome** | Aviation Museum (Sabre A94-915, Merlin Mk 25, Corben Super Ace, flying Wright Flyer replica), WWII RAAF memorial wall with 33 plaques, aero and gliding clubs, weekend glider joy flights, Tourist Park 50 m away | Headline attraction: museum to fill, glider flight minigame |
| **Rotary Park on the Macquarie (Wambuul)** | Riverside picnics, kayaking, fishing | Calm river walk |
| **Tom Perry Park** | Glenn McGrath statue (his link to the town not confirmed in our sources) | Sport oval; check the link before writing any plaque |
| **Railway station** | The town's origin (1882–83) | Station platform, freight sidings |

Sources: [Aussietowns](https://aussietowns.com.au/?p=11175), [Visit NSW](https://www.visitnsw.com/destinations/country-nsw/dubbo-area/narromine/attractions),
[Wikivoyage](https://en.wikivoyage.org/wiki/Narromine), [Wikipedia](https://en.wikipedia.org/wiki/Narromine).
Museum hours differ between listings (closed Tuesdays vs open Wed–Mon); check before using.

## 6. Economy and land (drives farms, trucks and jobs)

- Crops: wheat, barley, oats, canola, soy, lucerne, dryland and irrigated cotton; stone fruit and
  citrus. Irrigation by flood, pivot and linear, from bores, river and on-farm storage; Burrendong
  Dam underpins it ([Wikipedia](https://en.wikipedia.org/wiki/Narromine), [The Land](https://www.theland.com.au/story/6863008/cows-give-way-to-crops/), [FarmBuy listing](https://farmbuy.com/570-dulla-dulla-road-narromine-nsw-2821-353243)).
- Mining: Alkane's Tomingley gold operation in the shire; extension to 2032 (San Antonio, Roswell);
  ~18,400 oz and $62.3 m revenue in the Sept-2024 quarter ([NSW Planning](https://www.planningportal.nsw.gov.au/major-projects/projects/tomingley-gold-extension-project-0), [ASX](https://announcements.asx.com.au/asxpdf/20240624/pdf/064vq97y0xlm8g.pdf)).
  "200 local jobs" appears only on a low-quality site; do not use.
- Floods: the town has flood-liable parts; formal studies exist ([Narromine Flood Study](https://data.gov.au/data/dataset/nsw-fdp-narromine-flood-study-report/resource/54c8a5c2-7bc6-4474-ab39-15dc0fe7db52), [Narromine–Oxley floodplain study](https://data.gov.au/data/dataset/51658338-0aa1-4fdc-8853-f468ed12558c)).

## 7. People rule

Same rule as the market stallholders: **no living private people**. Named characters only where
they are long-dead and well documented (Trove, ADB/Obituaries Australia, AWM). Living public
figures (e.g. a sportsperson with a statue) appear only as the statue/plaque with verified facts,
never as talking NPCs. Narromine residents in the game are otherwise fictional, unnamed by real
family names taken from local records.

## 8. How to make Narromine drivable — the plan

### Scale
Real distance 40 km. At game speed that is 20+ minutes of empty highway. Compress the drive to
**about 2.5 km of road (≈90 s at 100 km/h)** with signs saying the real 40 km, and fade/fast-travel
option for impatient players. Narromine itself is built near real scale.

### World placement
- Put Narromine in its **own coordinate region far to the west** (for example centred at
  x = −6000) so it never overlaps Repo Town lots and float precision stays fine.
- The **Mitchell Highway** leaves Repo Town's western edge as a new driveable road strip. Today
  `roadAllows()` in `src/world/player-driving.js` (via `onPlannedOrCoreRoad`) bounds driving to
  the town's drawn roads, so the highway must be added as a real road record, not just a mesh.
- **Streaming:** build Narromine's meshes only when the player is within ~600 m of it, and drop
  Repo Town's distant detail while there (the same near/far pattern the resident models use), so
  phones do not hold both towns in memory.

### Highway content (cheap, high impact)
NSW signage (reuse `road-signs.js`: 100 km/h, "Narromine 40", "Trangie 70"), paddocks of wheat
and cotton, irrigation pivots, the river line of red gums on the left, the railway alongside, a
truck or two, overtaking lanes matching the 2024 upgrade, and the car radio continuing from Dubbo.

### Simulation
Narromine gets its own small `TownLife`-style schedule (a few dozen residents, shops with real
opening hours, trains on the Main West line) but shares the clock, weather and the player's
wallet. Keep it deterministic like Repo Town so saves restore exactly.

### Phases (one PR each, browser-tested)
1. **Highway + arrival.** Driveable Mitchell Highway west, signs, paddocks, river, a
   "Welcome to Narromine" sign, and Dandaloo Street facades (Royal Hotel, Narromine Hotel,
   Soldiers' Wall). Search/teleport "Narromine". Test: drive from Repo Town to Dandaloo St
   without leaving the road check; no page errors; phone frame time.
2. **Aerodrome + Aviation Museum.** Hangars, the museum interior with the verified exhibits,
   the RAAF memorial wall, a fillable "museum collection" quest.
3. **Glider flight.** Weekend glider joy-flight minigame from the aerodrome.
4. **River and civic block.** Rotary Park walk, Court House museum, visitor centre, station.
5. **Residents and life.** Small resident roster, shop hours, trains, farm trucks, flood
   history as an optional weather event (1926/1990 plaques).
6. **First Nations content** only after guidance from local Aboriginal organisations.

### Open questions for Josh
- Compressed drive (~90 s) or a longer, more realistic one?
- Should Trangie and Tomingley follow later in the same way?
- Is it OK to contact Narromine Shire's Local History Room or the Local Aboriginal Land Council
  for material and guidance? (Not done; needs your say.)
