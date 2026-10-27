# Country dossiers: researched houses and historical households

Josh asked for each estate home to be as specific and realistic as possible, inside and out, with
residents from that country. Countries are done one at a time, nearest to Dubbo first:
Australia, New Zealand, Papua New Guinea, Indonesia, Fiji, then onwards.

## Rules
- Residents are long-dead historical figures and their families, from published biographies
  only. No living people and no recently deceased people with living close family.
- Where sources disagree (birth years, addresses), the dossier says so in game.
- The house is a typical home of that country and period, not the residents' actual house,
  unless sources establish the actual house.
- Details that are general to the era (food, clothes, fittings) are labelled "typical of the era".
- Every dossier lists its sources; they are shown in each resident's panel.

## Code
- `src/world/country-dossiers.js`: one entry per country: plan (rooms, internal walls with
  doorways, fixtures), exterior colours and extras, residents, sources, caveats.
- `src/world/country-interiors.js` uses a dossier when one exists; other countries keep the
  generic plan. `country-homes.js` applies dossier exterior colours, chimney and rainwater tank.
- `tests/country-dossiers.mjs`: every room reachable on foot from the front door, every fixture
  inside its room and approachable, residents documented, sources listed.

## Done
| # | Country | House | Household | Era |
|---|---|---|---|---|
| 1 | Australia | Federation weatherboard cottage: central hall, parlour, bedroom, rear kitchen, lean-to wash-house; corrugated iron roof, brick chimney, rainwater tank | Henry Lawson, Bertha Lawson, Jim and baby Bertha | Sydney, early 1900 |
| 2 | New Zealand | Kauri bay villa after Kate Sheppard's own house (83 Clyde Road, Christchurch): hall through the middle, parlour with bay window, bedroom, dining room of the 1893 petition, kitchen with coal range; macrocarpa hedge and gates, two chimneys | Kate, Walter and Douglas Sheppard | Christchurch, 1893 |

## Not yet
Residents stand in their rooms and can be met; they do not yet walk a daily routine through
town. Their day is described in their panel. Upper storeys stay inaccessible.
