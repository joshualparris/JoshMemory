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

## Homes (step 2)
Every resident household's house can be entered by walking up to its street-facing front door
(`narromine-homes.js`). Each has a lounge (with who is home and what they are doing), kitchen (fridge, pantry,
stove, sink), bathroom, laundry and a bed for everyone: couples share a double bed, children up to two to a room.
The fridge shows what the household has: restocked on its last Coles trip, used up per person per day since.

## Not yet
Coles stock and deliveries feeding household shops, visible resident figures in homes and streets,
fitted-out workplace interiors, passengers and school drop-offs, and Repository Town residents commuting to Narromine.

## Steps 3–6 (5 Nov 2026)
- **Workplaces**: all 78 mapped workplaces open to an interior fitted out for the work (classrooms, wards, bars,
  counters, workshops) with the residents on shift at their stations; schools show pupils in class. 24-hour
  workplaces run a night shift. Doors are checked against solid geometry at load.
- **Coles**: staffed by residents on shift, with residents shopping; stock falls as households shop and is
  refilled by a 5 am refrigerated truck and an 11 am bread-and-milk van that drive in from the east.
- **School run**: one parent per household drives primary-school children to their school at 8:25 (and picks
  them up at 2:50 if not working); other children walk.
- **Walking**: residents without a car leg walk beside the road; about 1,100 walks a weekday.
- **Between the towns**: 58 Narromine residents work at named Repository Town workplaces (shown in those
  workplaces' panels while on shift) and drive out on the Mitchell Highway; 30 Repository Town residents (living
  in Repository Town lots) hold Narromine jobs and drive in from the east each shift.

## Unique interiors and evidence-based staffing (5 Nov 2026)
- **Homes**: no two are the same. Rooms are sized from the house's traced floor area and shape (growing only
  as much as furniture needs), the layout suits its proportions, and walls, floors, ceiling height and doors
  vary. Furniture follows who lives there: a cot per baby (a nursery for two or more), toys for young children,
  a desk and computer for teenagers, a clock and radio for retirees, a study for some, a shed for tradies and
  farm workers, and hobby items (guitar, piano, fish tank, weights, record player and so on) for some.
- **Workplaces**: no two are the same. Sized from the building and crew, a workstation per worker on a typical
  shift, their own colours, and the business name on the front room. Hair and beauty salons have mirrors and
  chairs. Workplaces no longer get a spare bedroom (an old interior-builder default).
- **Staff numbers**: census counts for schools, hospital, council, Coles and social assistance; otherwise from
  the building's floor area at employment-density rates (Homes England / HCA Employment Density Guide, 2015),
  kept within the usual range for the kind. Where the mapped outline covers several shops in a row, typical
  staffing is used. Narromine station (an unstaffed coach stop since 1975) and the fire station (retained,
  on-call crew) have no daily shift. Each workplace records where its number comes from (`staffBasis`).
