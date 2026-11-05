# Narromine residents, cars and daily routines

Step 1 of making Narromine's people real (owner request, 5 Nov 2026): every car on a Narromine side street
belongs to a resident and is going somewhere.

## Sources
- **ABS 2021 Census QuickStats, Narromine UCL115111** (https://www.abs.gov.au/census/find-census-data/quickstats/2021/UCL115111):
  3,507 people, median age 39, age bands, 835 family / 396 lone / 35 group households, family types,
  vehicles per dwelling (none 81, one 502, two 442, three or more 221), labour force (807 full-time,
  394 part-time, 100 away, 80 unemployed), travel to work (70% car as driver), top industries.
- **Homes**: Microsoft Global ML Building Footprints (ODbL) of house size (70–420 m²) within 40 m of a named
  street and away from mapped businesses. 1,171 qualify against 1,266 occupied dwellings, so the population is
  scaled to 92% (3,244 people).
- **Workplaces**: the 98 OpenStreetMap places. Staff numbers are estimates per kind, set to the census industry
  counts where given (schools 90, hospital 55, council 48, Coles 37, social assistance).
  Remaining workers drive out of town: farms (west), Dubbo and Repository Town (east), grain receival/rail yard.

## Privacy
Everyone is fictional with generated names. Homes are real buildings, so households carry a street name only,
never a house number, and no person is presented as living at a real address.

## What runs
- `narromine-population.js`: people, households, cars, schools, jobs and each person's day plan
  (sleep, wake, breakfast, commute, work or school, Coles shopping, dinner, evening, sleep; shifts for 24-hour
  workplaces; fewer commutes at weekends).
- `narromine-commute.js`: turns plans into car trips on the real streets (shortest paths), tracks where each
  car is parked (driveway, kerbside at the destination, or away out of town).
- `narromine-traffic.js`: draws residents' cars near the player along their routes, parked cars within 300 m,
  and Mitchell Highway through traffic (half the counted highway volume).

## Not yet
House interiors with fridge/bed/bathroom for Narromine homes, groceries moving from Coles into fridges,
fitted-out workplace interiors, passengers and school drop-offs, and Repository Town residents commuting to Narromine.
