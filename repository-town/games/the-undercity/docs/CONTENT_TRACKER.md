# The Undercity — content tracker

Generated from the game source. To refresh: `node scripts/content-tracker.mjs`. To verify: `node scripts/content-tracker.mjs --check`.

## Totals

- Storylets: **352**
- Choices: **854**
- Opportunity cards: **18**
- Professions: **34**
- Equipment slots: **20**
- Districts (including penalty hubs): **16**

## All storylets

| Story ID | Title | Location(s) | Type | Choices | Gate | Source | Next ID |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| aftermath_remember | A city of returned names | court | district | 1 | conditional | index.html |  |
| aftermath_silence | The council of quiet mornings | court | district | 2 | conditional | index.html |  |
| ambition1 | The clockmaker's impossible appointment | court | city ambition | 1 | conditional | index.html |  |
| ambition2 | The page that survived the fire | ink | city ambition | 2 | conditional | index.html |  |
| ambition3 | The door built for an absent hour | stairs | city ambition | 2 | conditional | index.html |  |
| ambition4 | A city that remembers | edge | city ambition | 2 | conditional | index.html |  |
| choir_exhibition | A painting of tomorrow | choir | district | 2 | always | index.html |  |
| choir_petals | The gardener of borrowed voices | choir | district | 2 | always | index.html |  |
| choose-personal-ambition | A question no clerk can answer | court | district | 4 | conditional | content/ambitions.js |  |
| court_bread | The baker's invisible queue | court | district | 2 | always | index.html |  |
| court_market | The lamp-lighter's bargain | court | district | 2 | always | index.html |  |
| court_news | A proclamation with no author | court | district | 2 | always | index.html |  |
| district-choir-0 | A seed that sings backwards | choir | encounter | 2 | always | content/world.js |  |
| district-choir-1 | The botanist's apology | choir | encounter | 2 | always | content/world.js |  |
| district-court-0 | The council's broken promise | court | encounter | 2 | always | content/world.js |  |
| district-court-1 | The keeper of the empty bench | court | encounter | 2 | always | content/world.js |  |
| district-edge-0 | A voice that says 'not yet' | edge | encounter | 2 | always | content/world.js |  |
| district-ink-0 | The library's second shadow | ink | encounter | 2 | always | content/world.js |  |
| district-ink-1 | A receipt for one vanished hour | ink | encounter | 2 | always | content/world.js |  |
| district-market-0 | The shop of deliberate mistakes | market | encounter | 2 | always | content/world.js |  |
| district-market-1 | The invisible customer | market | encounter | 2 | always | content/world.js |  |
| district-quays-0 | The silent swimmer | quays | encounter | 2 | always | content/world.js |  |
| district-quays-1 | The river's locked box | quays | encounter | 2 | always | content/world.js |  |
| district-soot-0 | A machine that knows your birthday | soot | encounter | 2 | always | content/world.js |  |
| district-soot-1 | The apprentices' third shift | soot | encounter | 2 | always | content/world.js |  |
| district-stairs-0 | The stair's last witness | stairs | encounter | 2 | always | content/world.js |  |
| edge_lantern | The last lamplight | edge | district | 2 | always | index.html |  |
| edge_voice | The dark between two words | edge | district | 2 | always | index.html |  |
| exception-lantern-wedding-0 | The Wedding of Thirteen Lamps — 1/3: An invitation that does not name the couple | court | exceptional | 2 | conditional | content/world.js |  |
| exception-lantern-wedding-1 | The Wedding of Thirteen Lamps — 2/3: A dowry of broken hours | market | exceptional | 2 | conditional | content/world.js |  |
| exception-lantern-wedding-2 | The Wedding of Thirteen Lamps — 3/3: The vow no clerk may witness | choir | exceptional | 2 | conditional | content/world.js |  |
| exception-starless-concert-0 | A Concert Without Stars — 1/3: A melody beneath the moss | choir | exceptional | 2 | conditional | content/world.js |  |
| exception-starless-concert-1 | A Concert Without Stars — 2/3: The acoustics of the Forgotten Stairs | stairs | exceptional | 2 | conditional | content/world.js |  |
| exception-starless-concert-2 | A Concert Without Stars — 3/3: The audience beyond the light | edge | exceptional | 2 | conditional | content/world.js |  |
| exception-water-audit-0 | The Audit of the Unending Rain — 1/3: A tax on rain that never falls | quays | exceptional | 2 | conditional | content/world.js |  |
| exception-water-audit-1 | The Audit of the Unending Rain — 2/3: An accountant in the margins | ink | exceptional | 2 | conditional | content/world.js |  |
| exception-water-audit-2 | The Audit of the Unending Rain — 3/3: The furnace that eats receipts | soot | exceptional | 2 | conditional | content/world.js |  |
| ink_catalogue | The catalogue of absent books | ink | district | 2 | always | index.html |  |
| ink_footnote | A footnote that watches you | ink | district | 2 | always | index.html |  |
| ink_work | A night among the ledgers | ink | district | 2 | always | index.html |  |
| market_clock | The shop with no clocks | market | district | 2 | always | index.html |  |
| market_trade | The merchant of better mistakes | market | district | 3 | always | index.html |  |
| name-guile-1 | Making Your Name 1/7: The parcel with no sender | quays | making-name | 2 | conditional | content/ambitions.js |  |
| name-guile-2 | Making Your Name 2/7: A stall selling alibis | market | making-name | 2 | conditional | content/ambitions.js |  |
| name-guile-3 | Making Your Name 3/7: The invisible consignment | quays | making-name | 2 | conditional | content/ambitions.js |  |
| name-guile-4 | Making Your Name 4/7: A factory with a back door | soot | making-name | 2 | conditional | content/ambitions.js |  |
| name-guile-5 | Making Your Name 5/7: The exchange of an empty envelope | market | making-name | 2 | conditional | content/ambitions.js |  |
| name-guile-6 | Making Your Name 6/7: The road that crosses itself | stairs | making-name | 2 | conditional | content/ambitions.js |  |
| name-guile-7 | Making Your Name 7/7: The final delivery | court | making-name | 2 | conditional | content/ambitions.js |  |
| name-observation-1 | Making Your Name 1/7: An index of missing vowels | ink | making-name | 2 | conditional | content/ambitions.js |  |
| name-observation-2 | Making Your Name 2/7: The ink that cannot dry | ink | making-name | 2 | conditional | content/ambitions.js |  |
| name-observation-3 | Making Your Name 3/7: A census of uncounted doors | court | making-name | 2 | conditional | content/ambitions.js |  |
| name-observation-4 | Making Your Name 4/7: A footnote at war | ink | making-name | 2 | conditional | content/ambitions.js |  |
| name-observation-5 | Making Your Name 5/7: The map under the stairs | stairs | making-name | 2 | conditional | content/ambitions.js |  |
| name-observation-6 | Making Your Name 6/7: The witness behind the books | ink | making-name | 2 | conditional | content/ambitions.js |  |
| name-observation-7 | Making Your Name 7/7: A name in permanent ink | court | making-name | 2 | conditional | content/ambitions.js |  |
| name-persuasion-1 | Making Your Name 1/7: A song with an empty verse | choir | making-name | 2 | conditional | content/ambitions.js |  |
| name-persuasion-2 | Making Your Name 2/7: A bargain in borrowed voices | market | making-name | 2 | conditional | content/ambitions.js |  |
| name-persuasion-3 | Making Your Name 3/7: The silent debate | court | making-name | 2 | conditional | content/ambitions.js |  |
| name-persuasion-4 | Making Your Name 4/7: The flower that accuses | choir | making-name | 2 | conditional | content/ambitions.js |  |
| name-persuasion-5 | Making Your Name 5/7: The audience of blank pages | ink | making-name | 2 | conditional | content/ambitions.js |  |
| name-persuasion-6 | Making Your Name 6/7: An offer from the glass stage | market | making-name | 2 | conditional | content/ambitions.js |  |
| name-persuasion-7 | Making Your Name 7/7: The chorus of the living | court | making-name | 2 | conditional | content/ambitions.js |  |
| name-resolve-1 | Making Your Name 1/7: A roof that moves | soot | making-name | 2 | conditional | content/ambitions.js |  |
| name-resolve-2 | Making Your Name 2/7: A bell in the flooded watch | quays | making-name | 2 | conditional | content/ambitions.js |  |
| name-resolve-3 | Making Your Name 3/7: A furnace that demands names | soot | making-name | 2 | conditional | content/ambitions.js |  |
| name-resolve-4 | Making Your Name 4/7: The thirteenth landing | stairs | making-name | 2 | conditional | content/ambitions.js |  |
| name-resolve-5 | Making Your Name 5/7: The garden under siege | choir | making-name | 2 | conditional | content/ambitions.js |  |
| name-resolve-6 | Making Your Name 6/7: The dark beyond the rail | edge | making-name | 2 | conditional | content/ambitions.js |  |
| name-resolve-7 | Making Your Name 7/7: The night's last watch | court | making-name | 2 | conditional | content/ambitions.js |  |
| path-ember-1 | 1. An invitation written in ash | court | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-10 | 10. The Midnight Fuel Census | soot | ambition | 3 | conditional | content/late-ambitions.js | path-ember-11 |
| path-ember-11 | 11. A Furnaceworker's Testimony | market | ambition | 3 | conditional | content/late-ambitions.js | path-ember-12 |
| path-ember-12 | 12. The Lanternmaker's Daughter | ink | ambition | 3 | conditional | content/late-ambitions.js | path-ember-13 |
| path-ember-13 | 13. The Foundry's Last Union Meeting | choir | ambition | 3 | conditional | content/late-ambitions.js | path-ember-14 |
| path-ember-14 | 14. A Contract Written in Heat | quays | ambition | 3 | conditional | content/late-ambitions.js | path-ember-15 |
| path-ember-15 | 15. The Market of Counterfeit Sunrises | court | ambition | 3 | conditional | content/late-ambitions.js | path-ember-16 |
| path-ember-16 | 16. The Moss Choir's Experiment | stairs | ambition | 3 | conditional | content/late-ambitions.js | path-ember-17 |
| path-ember-17 | 17. The Inspector's Red Seal | court | ambition | 3 | conditional | content/late-ambitions.js | path-ember-18 |
| path-ember-18 | 18. An Appointment with the Ash Minister | soot | ambition | 3 | conditional | content/late-ambitions.js | path-ember-19 |
| path-ember-19 | 19. The Oldest Maintenance Manual | market | ambition | 3 | conditional | content/late-ambitions.js | path-ember-20 |
| path-ember-2 | 2. The wages of warmth | soot | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-20 | 20. A Street Without Night | ink | ambition | 3 | conditional | content/late-ambitions.js | path-ember-21 |
| path-ember-21 | 21. The Crew Below the Floor | choir | ambition | 3 | conditional | content/late-ambitions.js | path-ember-22 |
| path-ember-22 | 22. A Quiet Strike | quays | ambition | 3 | conditional | content/late-ambitions.js | path-ember-23 |
| path-ember-23 | 23. The Bank That Owns the Flame | court | ambition | 3 | conditional | content/late-ambitions.js | path-ember-24 |
| path-ember-24 | 24. A Charter Read in Public | stairs | ambition | 3 | conditional | content/late-ambitions.js | path-ember-25 |
| path-ember-25 | 25. The False Emergency | court | ambition | 3 | conditional | content/late-ambitions.js | path-ember-26 |
| path-ember-26 | 26. The Demonstration at Lantern Court | soot | ambition | 3 | conditional | content/late-ambitions.js | path-ember-27 |
| path-ember-27 | 27. The Council's Counteroffer | market | ambition | 3 | conditional | content/late-ambitions.js | path-ember-28 |
| path-ember-28 | 28. The Engineer Who Stayed | ink | ambition | 3 | conditional | content/late-ambitions.js | path-ember-29 |
| path-ember-29 | 29. The Night of Open Workshops | choir | ambition | 3 | conditional | content/late-ambitions.js | path-ember-30 |
| path-ember-3 | 3. A fire sold as daylight | market | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-30 | 30. A Vote About the Sky | quays | ambition | 3 | conditional | content/late-ambitions.js | path-ember-31 |
| path-ember-31 | 31. The Last Furnace Shift | court | ambition | 3 | conditional | content/late-ambitions.js | path-ember-32 |
| path-ember-32 | 32. When the Engine Falls Silent | edge | ambition | 4 | conditional | content/late-ambitions.js |  |
| path-ember-4 | 4. The Council's red ledger | ink | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-5 | 5. Flowers grown without consent | choir | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-6 | 6. The cold bargemen | quays | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-7 | 7. The chamber above the stairs | stairs | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-8 | 8. When the furnace goes quiet | edge | ambition | 2 | conditional | content/ambitions.js |  |
| path-ember-9 | 9. A Ledger of Unlit Houses | court | ambition | 3 | conditional | content/late-ambitions.js | path-ember-10 |
| path-mirror-1 | 1. The wrong photograph | court | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-10 | 10. The House of Two Front Doors | ink | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-11 |
| path-mirror-11 | 11. The Clockwork Nurse | market | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-12 |
| path-mirror-12 | 12. The Market of Borrowed Faces | choir | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-13 |
| path-mirror-13 | 13. The School That Closed Yesterday | quays | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-14 |
| path-mirror-14 | 14. A Blue Ribbon at the Quays | soot | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-15 |
| path-mirror-15 | 15. The Glassmaker's Accident | stairs | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-16 |
| path-mirror-16 | 16. The Shadow Without Its Owner | court | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-17 |
| path-mirror-17 | 17. The Portrait Tribunal | court | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-18 |
| path-mirror-18 | 18. A Letter from the Nursery | ink | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-19 |
| path-mirror-19 | 19. The Archive of Faces | market | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-20 |
| path-mirror-2 | 2. Glass that remembers | market | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-20 | 20. The Man Who Paid for a Copy | choir | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-21 |
| path-mirror-21 | 21. The Moth-eaten Certificate | quays | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-22 |
| path-mirror-22 | 22. The Greenhouse Reflection | soot | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-23 |
| path-mirror-23 | 23. The Borrowed Birthday | stairs | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-24 |
| path-mirror-24 | 24. A False Rescue | court | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-25 |
| path-mirror-25 | 25. The Other Girl | court | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-26 |
| path-mirror-26 | 26. The Workshop of Quiet Copies | ink | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-27 |
| path-mirror-27 | 27. An Unsent Apology | market | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-28 |
| path-mirror-28 | 28. The Key in a Mother's Voice | choir | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-29 |
| path-mirror-29 | 29. The Choir of Witnesses | quays | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-30 |
| path-mirror-3 | 3. The nursery of borrowed voices | choir | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-30 | 30. A Chamber Without Reflections | soot | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-31 |
| path-mirror-31 | 31. The Choice of Two Lives | stairs | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-32 |
| path-mirror-32 | 32. The Glass Door Opens | edge | ambition | 4 | conditional | content/late-ambitions.js |  |
| path-mirror-4 | 4. An index of first memories | ink | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-5 | 5. Cargo marked fragile | quays | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-6 | 6. The furnace of lost faces | soot | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-7 | 7. The twelfth reflection | stairs | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-8 | 8. A face you must choose | edge | ambition | 2 | conditional | content/ambitions.js |  |
| path-mirror-9 | 9. An Unclaimed Photograph | court | ambition | 3 | conditional | content/late-ambitions.js | path-mirror-10 |
| path-moth-1 | 1. A crown of scorched wings | court | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-10 | The Missing Clause | ink | ambition | 3 | conditional | content/moth.generated.js | path-moth-11 |
| path-moth-11 | The Foreman's Empty Chair | soot | ambition | 3 | conditional | content/moth.generated.js | path-moth-12 |
| path-moth-12 | Barges of Unpaid Light | quays | ambition | 3 | conditional | content/moth.generated.js | path-moth-13 |
| path-moth-13 | The Woman Who Sells Apologies | market | ambition | 3 | conditional | content/moth.generated.js | path-moth-14 |
| path-moth-14 | The Seven Lamps of the Nursery | choir | ambition | 3 | conditional | content/moth.generated.js | path-moth-15 |
| path-moth-15 | The Bailiff of the Thirteenth Landing | stairs | ambition | 3 | conditional | content/moth.generated.js | path-moth-16 |
| path-moth-16 | The Crown That Hears the Wrong Voice | edge | ambition | 3 | conditional | content/moth.generated.js | path-moth-17 |
| path-moth-17 | A Petition of Ordinary People | court | ambition | 3 | conditional | content/moth.generated.js | path-moth-18 |
| path-moth-18 | The Archive of Unkept Names | ink | ambition | 3 | conditional | content/moth.generated.js | path-moth-19 |
| path-moth-19 | The Last Boat to Candle Reach | quays | ambition | 3 | conditional | content/moth.generated.js | path-moth-20 |
| path-moth-2 | 2. The foundry's third furnace | soot | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-20 | An Audit of Fire and Hunger | soot | ambition | 3 | conditional | content/moth.generated.js | path-moth-21 |
| path-moth-21 | The Counterfeit Crown | market | ambition | 3 | conditional | content/moth.generated.js | path-moth-22 |
| path-moth-22 | The Lullaby in Seven Tongues | choir | ambition | 3 | conditional | content/moth.generated.js | path-moth-23 |
| path-moth-23 | Trial on the Missing Step | stairs | ambition | 3 | conditional | content/moth.generated.js | path-moth-24 |
| path-moth-24 | The Wardens at the Door | court | ambition | 3 | conditional | content/moth.generated.js | path-moth-25 |
| path-moth-25 | The Debt That Crosses Water | quays | ambition | 3 | conditional | content/moth.generated.js | path-moth-26 |
| path-moth-26 | The Architect's Testimony | ink | ambition | 3 | conditional | content/moth.generated.js | path-moth-27 |
| path-moth-27 | The Pilot Flame | soot | ambition | 3 | conditional | content/moth.generated.js | path-moth-28 |
| path-moth-28 | The Choir of All the Streets | choir | ambition | 3 | conditional | content/moth.generated.js | path-moth-29 |
| path-moth-29 | The Price of a Royal Seal | market | ambition | 3 | conditional | content/moth.generated.js | path-moth-30 |
| path-moth-3 | 3. A barge loaded with dark | quays | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-30 | A Crown Returned to Its Promise | stairs | ambition | 3 | conditional | content/moth.generated.js | path-moth-31 |
| path-moth-31 | The Terms of Dawnless Mercy | edge | ambition | 3 | conditional | content/moth.generated.js | path-moth-32 |
| path-moth-32 | A New Oath in the Lamplight | court | ambition | 3 | conditional | content/moth.generated.js |  |
| path-moth-4 | 4. The oldest mention | ink | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-5 | 5. The shop of discarded vows | market | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-6 | 6. A garden of luminous eggs | choir | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-7 | 7. The staircase of discarded crowns | stairs | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-8 | 8. A sovereign without a throne | edge | ambition | 2 | conditional | content/ambitions.js |  |
| path-moth-9 | The Addresses Beneath the Lamp | court | ambition | 3 | conditional | content/moth.generated.js | path-moth-10 |
| path-tide-1 | 1. The drowned solicitor | court | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-10 | 10. The Night Ferryman's Ledger | quays | ambition | 3 | conditional | content/late-ambitions.js | path-tide-11 |
| path-tide-11 | 11. The Tax Paid in Silence | ink | ambition | 3 | conditional | content/late-ambitions.js | path-tide-12 |
| path-tide-12 | 12. The Quayside Witness | market | ambition | 3 | conditional | content/late-ambitions.js | path-tide-13 |
| path-tide-13 | 13. The Court of Wet Ink | soot | ambition | 3 | conditional | content/late-ambitions.js | path-tide-14 |
| path-tide-14 | 14. The Canal of Vanishing Names | choir | ambition | 3 | conditional | content/late-ambitions.js | path-tide-15 |
| path-tide-15 | 15. The Choir's Tide Hymn | quays | ambition | 3 | conditional | content/late-ambitions.js | path-tide-16 |
| path-tide-16 | 16. The Hollow Harbour | stairs | ambition | 3 | conditional | content/late-ambitions.js | path-tide-17 |
| path-tide-17 | 17. The Keeper of Watermarks | court | ambition | 3 | conditional | content/late-ambitions.js | path-tide-18 |
| path-tide-18 | 18. A Hostile Appraisal | quays | ambition | 3 | conditional | content/late-ambitions.js | path-tide-19 |
| path-tide-19 | 19. The Ferry That Waited | ink | ambition | 3 | conditional | content/late-ambitions.js | path-tide-20 |
| path-tide-2 | 2. A ferry without an oarsman | quays | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-20 | 20. The Foundry's Hidden Levy | market | ambition | 3 | conditional | content/late-ambitions.js | path-tide-21 |
| path-tide-21 | 21. A Map Written in Rain | soot | ambition | 3 | conditional | content/late-ambitions.js | path-tide-22 |
| path-tide-22 | 22. A Witness in Exile | choir | ambition | 3 | conditional | content/late-ambitions.js | path-tide-23 |
| path-tide-23 | 23. The Bridge Without Tolls | quays | ambition | 3 | conditional | content/late-ambitions.js | path-tide-24 |
| path-tide-24 | 24. The Beneficiaries Assemble | stairs | ambition | 3 | conditional | content/late-ambitions.js | path-tide-25 |
| path-tide-25 | 25. The Crown of River Salt | court | ambition | 3 | conditional | content/late-ambitions.js | path-tide-26 |
| path-tide-26 | 26. The Advocate's Confession | quays | ambition | 3 | conditional | content/late-ambitions.js | path-tide-27 |
| path-tide-27 | 27. A Town Beneath the Weir | ink | ambition | 3 | conditional | content/late-ambitions.js | path-tide-28 |
| path-tide-28 | 28. The River's Missing Clause | market | ambition | 3 | conditional | content/late-ambitions.js | path-tide-29 |
| path-tide-29 | 29. The Price of Restitution | soot | ambition | 3 | conditional | content/late-ambitions.js | path-tide-30 |
| path-tide-3 | 3. The filed impossibility | ink | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-30 | 30. The Hearing Before Dawn | choir | ambition | 3 | conditional | content/late-ambitions.js | path-tide-31 |
| path-tide-31 | 31. A Passage for the Living | quays | ambition | 3 | conditional | content/late-ambitions.js | path-tide-32 |
| path-tide-32 | 32. The Testament Read Aloud | edge | ambition | 4 | conditional | content/late-ambitions.js |  |
| path-tide-4 | 4. Auction of absent land | market | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-5 | 5. The flood tax | soot | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-6 | 6. The songs of a dry sea | choir | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-7 | 7. A stair under the current | stairs | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-8 | 8. The will's last beneficiary | edge | ambition | 2 | conditional | content/ambitions.js |  |
| path-tide-9 | 9. The Second Shore Petition | court | ambition | 3 | conditional | content/late-ambitions.js | path-tide-10 |
| penalty-arrival-delirium | The Pale Rooms: Arrival | the_pale_rooms | penalty-arrival | 1 | AUTOFIRE | content/penalties.js |  |
| penalty-arrival-notoriety | The Unspoken Tribunal: Arrival | the_tribunal | penalty-arrival | 1 | AUTOFIRE | content/penalties.js |  |
| penalty-arrival-suspicion | The Watch House: Arrival | the_watch_house | penalty-arrival | 1 | AUTOFIRE | content/penalties.js |  |
| penalty-arrival-wounds | The Quiet Ward: Arrival | the_ward | penalty-arrival | 1 | AUTOFIRE | content/penalties.js |  |
| penalty-recovery-delirium-0 | Describe your dreams to the nurse | the_pale_rooms | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-delirium-1 | Purchase the quiet-room treatment | the_pale_rooms | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-delirium-2 | Practice the slow count of the lamps | the_pale_rooms | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-notoriety-0 | Deliver a quiet apology | the_tribunal | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-notoriety-1 | Hire a skilled advocate | the_tribunal | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-notoriety-2 | Publish a carefully documented correction | the_tribunal | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-suspicion-0 | Submit your evidence to the night clerk | the_watch_house | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-suspicion-1 | Pay the appointed solicitor | the_watch_house | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-suspicion-2 | Perform a shift for the Watch | the_watch_house | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-wounds-0 | Accept ordinary treatment | the_ward | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-wounds-1 | Pay for the restorative moss draught | the_ward | penalty-recovery | 1 | always | content/penalties.js |  |
| penalty-recovery-wounds-2 | Rest and follow the nurse's instructions | the_ward | penalty-recovery | 1 | always | content/penalties.js |  |
| profession-promotion-architect-of-consent | A promotion offered: Architect of Consent | court | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-city-luminary | A promotion offered: City Luminary | court | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-dispatchmaster | A promotion offered: Dispatchmaster of the Silent Roads | quays | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-engine-provost | A promotion offered: Engine Provost | soot | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-envoy-of-the-twelve | A promotion offered: Envoy of the Twelve | market | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-first-witness | A promotion offered: First Witness | ink | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-grand-light-warden | A promotion offered: Grand Light Warden | court | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-high-chorister | A promotion offered: High Chorister | choir | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-keeper-of-black-archives | A promotion offered: Keeper of the Black Archives | ink | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-keeper-of-the-charter | A promotion offered: Keeper of the Charter | court | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-master-of-crossings | A promotion offered: Master of Crossings | quays | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-shield-of-the-edge | A promotion offered: Shield of the Edge | edge | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-treaty-bearer | A promotion offered: Treaty Bearer | market | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-voice-of-the-choir | A promotion offered: Voice of the Choir | choir | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-warden-of-the-engine | A promotion offered: Warden of the Engine | soot | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-promotion-watch-commandant | A promotion offered: Watch Commandant | stairs | profession-promotion | 2 | conditional | content/callings.js |  |
| profession-work-architect-of-consent | A specialist shift: Architect of Consent | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-cavern-sentinel | At work: Cavern Sentinel | stairs | profession | 2 | conditional | content/callings.js |  |
| profession-work-charter-keeper | At work: Charter Keeper | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-chief-archivist | At work: Chief Archivist | ink | profession | 2 | conditional | content/callings.js |  |
| profession-work-choir-gardener | At work: Choir Gardener | choir | profession | 2 | conditional | content/callings.js |  |
| profession-work-city-luminary | A specialist shift: City Luminary | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-court-mediator | At work: Court Mediator | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-dispatchmaster | A specialist shift: Dispatchmaster of the Silent Roads | quays | profession | 2 | conditional | content/callings.js |  |
| profession-work-engine-provost | A specialist shift: Engine Provost | soot | profession | 2 | conditional | content/callings.js |  |
| profession-work-envoy-of-the-twelve | A specialist shift: Envoy of the Twelve | market | profession | 2 | conditional | content/callings.js |  |
| profession-work-first-witness | A specialist shift: First Witness | ink | profession | 2 | conditional | content/callings.js |  |
| profession-work-furnace-minder | At work: Furnace Minder | soot | profession | 2 | conditional | content/callings.js |  |
| profession-work-furnace-surveyor | At work: Furnace Surveyor | soot | profession | 2 | conditional | content/callings.js |  |
| profession-work-glass-appraiser | At work: Glass Appraiser | market | profession | 2 | conditional | content/callings.js |  |
| profession-work-grand-light-warden | A specialist shift: Grand Light Warden | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-harbour-runner | At work: Harbour Runner | quays | profession | 2 | conditional | content/callings.js |  |
| profession-work-high-chorister | A specialist shift: High Chorister | choir | profession | 2 | conditional | content/callings.js |  |
| profession-work-keeper-of-black-archives | A specialist shift: Keeper of the Black Archives | ink | profession | 2 | conditional | content/callings.js |  |
| profession-work-keeper-of-the-charter | A specialist shift: Keeper of the Charter | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-lamp-tender | At work: Lamp Tender | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-light-warden | At work: Light Warden | court | profession | 2 | conditional | content/callings.js |  |
| profession-work-margin-clerk | At work: Margin Clerk | ink | profession | 2 | conditional | content/callings.js |  |
| profession-work-master-chorister | At work: Master Chorister | choir | profession | 2 | conditional | content/callings.js |  |
| profession-work-master-of-crossings | A specialist shift: Master of Crossings | quays | profession | 2 | conditional | content/callings.js |  |
| profession-work-night-courier | At work: Night Courier | quays | profession | 2 | conditional | content/callings.js |  |
| profession-work-roof-patroller | At work: Roof Patroller | soot | profession | 2 | conditional | content/callings.js |  |
| profession-work-shield-of-the-edge | A specialist shift: Shield of the Edge | edge | profession | 2 | conditional | content/callings.js |  |
| profession-work-street-poet | At work: Street Poet | choir | profession | 2 | conditional | content/callings.js |  |
| profession-work-treaty-bearer | A specialist shift: Treaty Bearer | market | profession | 2 | conditional | content/callings.js |  |
| profession-work-veil-diplomat | At work: Veil Diplomat | market | profession | 2 | conditional | content/callings.js |  |
| profession-work-voice-of-the-choir | A specialist shift: Voice of the Choir | choir | profession | 2 | conditional | content/callings.js |  |
| profession-work-warden-of-the-engine | A specialist shift: Warden of the Engine | soot | profession | 2 | conditional | content/callings.js |  |
| profession-work-watch-commandant | A specialist shift: Watch Commandant | stairs | profession | 2 | conditional | content/callings.js |  |
| profession-work-whisper-broker | At work: Whisper Broker | market | profession | 2 | conditional | content/callings.js |  |
| quay_boat | The boat that came back empty | quays | district | 2 | always | index.html |  |
| quay_fisher | The fisherman who catches questions | quays | district | 2 | always | index.html |  |
| quay_patrol | Lanterns along the Siltway | quays | district | 2 | always | index.html |  |
| quirk-cautious | The rope across the dark | edge | quirk | 2 | always | content/world.js |  |
| quirk-curious | The note inside the wall | stairs | quirk | 2 | always | content/world.js |  |
| quirk-generous | Seedlings for strangers | choir | quirk | 2 | always | content/world.js |  |
| quirk-honest | A mistake in the records | ink | quirk | 2 | always | content/world.js |  |
| quirk-merciful | The petitioner and the thief | court | quirk | 2 | always | content/world.js |  |
| quirk-proud | An honour offered with strings | court | quirk | 2 | always | content/world.js |  |
| quirk-ruthless | A furnace with one free seat | soot | quirk | 2 | always | content/world.js |  |
| quirk-steadfast | The vigil at low water | quays | quirk | 2 | always | content/world.js |  |
| quirk-subtle | The sealed display case | market | quirk | 2 | always | content/world.js |  |
| season-ashvigil | The Ash Vigil | soot | seasonal | 2 | conditional | content/world.js |  |
| season-bellfast | The Bellfast | court | seasonal | 2 | conditional | content/world.js |  |
| season-floodcall | The Floodcall | quays | seasonal | 2 | conditional | content/world.js |  |
| season-long-lamplight | The Long Lamplight | court | seasonal | 2 | conditional | content/world.js |  |
| season-mosswake | The Mosswake | choir | seasonal | 2 | conditional | content/world.js |  |
| season-thirteenth-feast | The Feast of the Thirteenth Hour | market | seasonal | 2 | conditional | content/world.js |  |
| side-ember-10 | Companion inquiry: The coal that is not coal | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-11 | Companion inquiry: A union behind iron doors | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-12 | Companion inquiry: A switch that requires two hands | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-13 | Companion inquiry: The inspector's lost report | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-14 | Companion inquiry: The choir of exhaust pipes | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-15 | Companion inquiry: A demonstration of the burden | court | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-16 | Companion inquiry: The engineer who refused | edge | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-17 | Companion inquiry: A ledger written in heat | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-18 | Companion inquiry: The apprentices' testimony | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-19 | Companion inquiry: The weight of a false sky | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-20 | Companion inquiry: The private offer | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-21 | Companion inquiry: A strike at sunrise | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-22 | Companion inquiry: The hidden reservoir | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-23 | Companion inquiry: The councillor's daughter | court | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-24 | Companion inquiry: A repaired valve | edge | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-25 | Companion inquiry: The argument over ownership | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-26 | Companion inquiry: The day of the blackout | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-27 | Companion inquiry: A charter with witnesses | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-28 | Companion inquiry: The old machinery sleeps | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-29 | Companion inquiry: A new public flame | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-30 | Companion inquiry: The council's last fire | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-ember-9 | Companion inquiry: The night shift's confession | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-10 | Companion inquiry: A school without pupils | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-11 | Companion inquiry: The optician who never blinks | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-12 | Companion inquiry: A portrait painted backwards | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-13 | Companion inquiry: The seamstress of identities | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-14 | Companion inquiry: A lullaby behind a wall | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-15 | Companion inquiry: The first counterfeit self | court | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-16 | Companion inquiry: An honest broker's condition | edge | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-17 | Companion inquiry: The stolen birthday | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-18 | Companion inquiry: A letter with two signatures | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-19 | Companion inquiry: The chamber of unclaimed years | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-20 | Companion inquiry: The inspector's private collection | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-21 | Companion inquiry: A city of second chances | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-22 | Companion inquiry: The witness who is not a child | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-23 | Companion inquiry: The first public reunion | court | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-24 | Companion inquiry: A bargain about consent | edge | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-25 | Companion inquiry: An exchange of true names | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-26 | Companion inquiry: The mirror council | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-27 | Companion inquiry: The glassworker's proof | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-28 | Companion inquiry: The nursery opens | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-29 | Companion inquiry: An ending without erasure | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-30 | Companion inquiry: The key to the second reflection | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-mirror-9 | Companion inquiry: The catalogue of borrowed faces | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-10 | Companion inquiry: The ferryman's unsigned oath | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-11 | Companion inquiry: A cadastral map in salt | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-12 | Companion inquiry: Rent paid to water | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-13 | Companion inquiry: The lock that opens downstream | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-14 | Companion inquiry: An injunction sung at dusk | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-15 | Companion inquiry: The drowned surveyor | edge | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-16 | Companion inquiry: The ledger of dry land | court | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-17 | Companion inquiry: A crossing at low bell | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-18 | Companion inquiry: The widow of a lost street | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-19 | Companion inquiry: The measure of a current | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-20 | Companion inquiry: An island made of promises | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-21 | Companion inquiry: The missing solicitor | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-22 | Companion inquiry: Two incompatible claims | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-23 | Companion inquiry: The public hearing | edge | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-24 | Companion inquiry: The flood that was ordered | court | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-25 | Companion inquiry: A debt without a debtor | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-26 | Companion inquiry: The names along the quay | ink | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-27 | Companion inquiry: The heir who refuses | market | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-28 | Companion inquiry: The last legal tide | soot | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-29 | Companion inquiry: A settlement that can be lived in | choir | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-30 | Companion inquiry: The quiet bell of the Siltway | stairs | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| side-tide-9 | Companion inquiry: An inheritance with wet edges | quays | ambition-support | 3 | conditional | content/second-acts.generated.js |  |
| soot_organise | The union of forgotten workers | soot | district | 2 | always | index.html |  |
| soot_shift | The furnace that runs cold | soot | district | 2 | always | index.html |  |
| stairs_echowell | The well of swallowed names | stairs | district | 2 | always | index.html |  |
| stairs_keepers | The keeper of the missing step | stairs | district | 2 | always | index.html |  |

## Opportunity cards

| Card ID | Title | Locality | Weight | Source |
| --- | --- | --- | ---: | --- |
| card_bell | The bell that refuses to ring | court, ink, stairs | 3 | index.html |
| card_courier | A courier without a face | court, quays, ink | 3 | index.html |
| card_market | A magnificent forgery | market, court | 3 | index.html |
| card_moss | A voice in the moss | choir, market | 4 | index.html |
| card_poet | The poet who rents out endings | choir, court | 2 | index.html |
| card_smuggler | A purse stitched shut | quays, market | 3 | index.html |
| card_warden | The rooftop oath | soot, stairs | 2 | index.html |
| card_worm | The honest worm | soot, stairs | 2 | index.html |
| card-expanded-0 | A moth in a paper crown | any | 2 | content/world.js |
| card-expanded-1 | A letter addressed to the city | any | 2 | content/world.js |
| card-expanded-2 | The market's lost receipt | any | 2 | content/world.js |
| card-expanded-3 | A song heard from a drain | any | 2 | content/world.js |
| card-expanded-4 | The shadow seller | any | 2 | content/world.js |
| card-expanded-5 | The gardener's sealed seed | any | 2 | content/world.js |
| card-expanded-6 | A warning written in chalk | any | 2 | content/world.js |
| card-expanded-7 | A creature made of lost buttons | any | 2 | content/world.js |
| card-expanded-8 | A silent mechanical lark | any | 2 | content/world.js |
| card-expanded-9 | The thirteenth candle | any | 2 | content/world.js |

## Professions

| ID | Name | Tier | Reputation | Weekly pennies | Item |
| --- | --- | ---: | --- | ---: | --- |
| choir-gardener | Choir Gardener | 1 | persuasion | 8 | singing-pot |
| court-mediator | Court Mediator | 1 | persuasion | 9 | civic-ribbon |
| furnace-minder | Furnace Minder | 1 | resolve | 9 | ember-tool |
| glass-appraiser | Glass Appraiser | 1 | observation | 9 | glass-rule |
| harbour-runner | Harbour Runner | 1 | guile | 10 | runner-boots |
| lamp-tender | Lamp Tender | 1 | resolve | 9 | silver-flame |
| margin-clerk | Margin Clerk | 1 | observation | 8 | margin-pen |
| roof-patroller | Roof Patroller | 1 | resolve | 10 | roof-whistle |
| street-poet | Street Poet | 1 | persuasion | 8 | songbook |
| whisper-broker | Whisper Broker | 1 | guile | 11 | coded-card |
| cavern-sentinel | Cavern Sentinel | 2 | resolve | 23 | sentinel-badge |
| charter-keeper | Charter Keeper | 2 | guile | 24 | new-charter |
| chief-archivist | Chief Archivist | 2 | observation | 21 | sealed-index |
| furnace-surveyor | Furnace Surveyor | 2 | observation | 21 | surveyor-lens |
| light-warden | Light Warden | 2 | resolve | 22 | silver-oath |
| master-chorister | Master Chorister | 2 | persuasion | 22 | harmonic-stone |
| night-courier | Night Courier | 2 | guile | 23 | shadow-route |
| veil-diplomat | Veil Diplomat | 2 | persuasion | 24 | silver-invitation |
| dispatchmaster | Dispatchmaster of the Silent Roads | 3 | guile | 39 | sealed-dispatch |
| engine-provost | Engine Provost | 3 | observation | 37 | furnace-license |
| grand-light-warden | Grand Light Warden | 3 | resolve | 38 | crown-of-beacons |
| high-chorister | High Chorister | 3 | persuasion | 38 | chorister-adornment |
| keeper-of-black-archives | Keeper of the Black Archives | 3 | observation | 37 | archive-coat |
| keeper-of-the-charter | Keeper of the Charter | 3 | guile | 40 | charter-club |
| treaty-bearer | Treaty Bearer | 3 | persuasion | 39 | diplomatic-luggage |
| watch-commandant | Watch Commandant | 3 | resolve | 38 | commandant-boon |
| architect-of-consent | Architect of Consent | 4 | guile | 70 | civic-home |
| city-luminary | City Luminary | 4 | resolve | 66 | perpetual-lamp |
| envoy-of-the-twelve | Envoy of the Twelve | 4 | persuasion | 67 | envoy-hat |
| first-witness | First Witness | 4 | observation | 64 | witness-treasure |
| master-of-crossings | Master of Crossings | 4 | guile | 68 | river-ship |
| shield-of-the-edge | Shield of the Edge | 4 | resolve | 69 | edge-crew |
| voice-of-the-choir | Voice of the Choir | 4 | persuasion | 65 | choir-companion |
| warden-of-the-engine | Warden of the Engine | 4 | observation | 67 | engine-airship |

The tracker lists authored content rather than asserting every branch has been human-playtested. JSON currently owns the late Moth ambition; earlier narrative modules still use JavaScript predicates and will be migrated incrementally.
