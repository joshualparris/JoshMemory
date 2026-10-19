# Repository Town: comprehensive NPC realism audit

**Date:** 19 October 2026  
**Scope:** Canonical `joshualparris/JoshMemory` Repository Town, snapshot `0654be65`; deployed `Parris-Tech-Services/Repository-town` used only to verify published differences.  
**Inventory:** [NPC_REALISM_INVENTORY_2026-10-19.csv](NPC_REALISM_INVENTORY_2026-10-19.csv)  
**Audit branch:** `audit/repository-town-npc-realism-20261019`.

## How this was audited

Inspected `src/world/life.js`, `townlife.js`, `npcs.js`, `interior.js`, `src/ui/npc.js`, `npc-chat.js`, `npc-data.js`, `npc-prompt.js`, `npc-location.js`, `social.js`, `townpanels.js`, `tools/lib.mjs`, and existing `tests/life.mjs`, `people.mjs`, `npc-location.mjs`, `npc-personality.mjs`, `social.mjs` and scene-awareness tests.

Evidence is source-level and test-contract-level unless otherwise stated. This is **not** a claim that 258 characters were individually conversed with on Android, witnessed over many real-time days, or rated by real users. Character improvement suggestions are design proposals, **not existing features**.

### Cast and identity coverage

| Simulation population | Count | Existing capabilities | Important caveat |
|---|---:|---|---|
| Named street and fantasy characters | 32 | Unique name, prompt persona and lot; 20 have distinct procedural shapes plus 3 suggested prompts and optional quizzes | Appear near assigned lots, without a full town-clock home/work/social schedule |
| Living Town workers and villagers | 38 | Individual job, starting shift, home, activity, travel route, hunger/pantry/wallet, shopping, meals and basic dialogue | Only 24/38 had bespoke off-duty personalities at audit start; remaining 14 repaired on the audit branch |
| Repository house-resident slots | 188 | Generated archive resident; local indoor wandering and room-aware dialogue; visitable house | Just 26 generated first names are reused 7–8 times each; these are **not** 188 uniquely authored people |
| **Total slots across systems** | **258** | | **Counts are distinct role systems, not a verified census of persistent independent people** |

## Qualitative realism assessment

| Domain | Present strengths | Remaining deficit | Priority |
|---|---|---|---|
| Identity | 32 named character archetypes and 38 named town workers | Recycled house first names; some archetypes have roles not visibly practised | **P1** |
| Place awareness | Indoor room-object lookup; Arlo world-state resolver; real work/house data | Canonical source previously lacked location wiring found on live site; unobserved NPC assertions possible | **P0** (wiring repaired on audit branch) |
| Daily routine | 38 villagers have shifts, routes, money, meals, shopping and sleep; 72-minute day at normal speed | The 32 named cast is not governed by the same day planner; indoor residents only have simplified meal/night patterns | **P1** |
| Navigation and collisions | Paths, door-to-door travel, furniture avoidance, player interactions | Named characters walk inside very small lot radius; their animation update is skipped outside culling distance | **P1** |
| Activities and objects | 20 fantasy NPC local quests, toys and interaction panels | Most NPC conversations do not make corresponding physical world-state changes | **P1** |
| Social relationships | Seeded friendships/grudges, local trust score and visitor-message/errand effects | Seeded relationships can be presented as personal history without an observed social event; few NPC-NPC meetings | **P1** |
| Memory | Named NPC chat during tab session; some resident chats local; villagers' meal logs and social events | Named chat largely ephemeral; no reliable, privacy-controlled episodic memory of an individual visitor or observable life events | **P1** |
| Shopkeeping | Real goods, stock, pricing, deliveries and trade panels | Staff spoken claims, physical presence and shop transactions are not all one actor-driven event | **P1** |
| Character visual/audio expression | Unique low-poly creatures, walkers, turning, simple body motion and ambient sound | Limited gestures, eye contact, facial expression, contextual carrying/using objects and voice variation | **P2** |
| AI truthfulness | Server-side Groq proxy, offline fallback, grounded location/room replies, privacy checks | Free-form generative replies still need claim-grounding tests; sim facts not always available to all chat channels | **P1** |
| Identity and privacy | Private project export boundary and no raw API key sent to browser | Game persona should answer truthfully about being simulated if directly asked; long-term memory needs consent/controls | **P1** |

### Verified architectural inconsistencies

1. **Canonical/live drift:** The public site's `ui/npc.js` and `ui/townpanels.js` already used the live location resolver, but canonical `src/ui/npc.js` and `src/ui/townpanels.js` were missing these connections. The audit branch connects `locateVillager(life,v)` into the town context, passes current place/activity/time/workplace through the resident AI payload, and gives direct whereabouts answers from game state. It also updates canonical `src/ui/npc-prompt.js`. This is a source repair, **not proof of a new deployed build**.
2. **Personality coverage:** Existing `VILLAGER_PROFILES` covered Mabel–Zara (24 people). Bluey, Clem, Dulcie, Errol, Fern, Gwen, Harlan, Ida, Archie, Bonnie, Cooper, Daisy, Elsie and Frankie inherited the same fallback. Audit branch adds 14 distinct off-duty identities that don't replace their actual jobs.
3. **Generated resident identity reuse:** `residentName(coordinate)` indexes 26 first names. With 188 house coordinates, a name is reused 7 or 8 times. Each house does have a coordinate-specific chat key, but repeated displayed names can make occupants seem interchangeable.
4. **Named actor culling:** `animateNPCs` sets `group.visible=dist<maxDist` and immediately `continue`s when invisible. This skips the named character's animation/task update while out of rendering range, unlike the 38 town workers updated by the simulation. Culling should stop drawing, not simulation time.
5. **Limited NPC work life:** `placeTownNPCs` anchors each of the 32 near its assigned lot and `animateNPCs` chooses a tiny wandering offset. Roughly a quarter receive a small local construction/gathering site by a seed check. These do not amount to believable commuting, town-scale friendships or recurring personal schedules.
6. **Relationships as assigned backstory:** `initialScore` starts ties from a hash, and `socialGossip` may speak of old grudges based on that number. Although fictional history is a valid storytelling technique, realistic simulation would distinguish *established backstory* from *events the player witnessed*.
7. **Dialogue and physical actions diverge:** Shop counter functionality and the supply chain are built, but talking to a character is not always the same as ordering a real staffed transaction. The model can describe objects not actively changing.
8. **Continuity varies by actor:** Living Town stores selected meal/financial/civic state; `src/ui/npc-chat.js` keeps named-character histories in an in-memory map; `src/ui/npc.js` stores the last 20 messages locally. These are different memory models.

## All 32 named characters: individual realism work

The first 12 are humanoid/character archetypes without the 20 creatures' optional 3-choice quest and authored suggestion list. This is a content coverage gap, not necessarily a malfunction.

| Character | Assigned lot | Theme/role | Most meaningful next improvement |
|---|---|---|---|
| Rowan | M4 | Town Guide | Give accurate live shop hours  local events and directions from the player's actual position |
| Pip | M5 | Dice Goblin | Remember previous rolls and base responses on real dice results rather than invented rolls |
| Circuit | Y2 | Robot Mechanic | Work on actual repair objects  show tools and acknowledge real machine states |
| Wren | B2 | Wildlife Ranger | Discuss current verified zoo exhibits and react to conservation displays |
| Sol | M2 | Travelling Chef | Prepare meals using real available stock and recipe quantities |
| Sage | A2 | Library Sage | Recommend documents from the actual bookshelf instead of fictional holdings |
| Spark | L4 | Radio Inventor | Operate real radio props and reflect measured signals rather than guessed frequencies |
| Lyra | J7 | Street Musician | Play and react to audio instruments and remember the visitor's last tune |
| Nova | C7 | Star Navigator | Ground sky observations in the current game's sky and clock |
| Kit | V2 | Repair Café Volunteer | Guide real step-by-step repairs and reflect available tools and parts |
| Ember | F5 | Arena Champion | Link victories and challenges to actual arena interactions |
| Captain Vale | Z1 | Space Captain | Give ship or exploration dialogue tied to an actual object  not an imagined voyage |
| Bramble | H1 | Walking Tree | React to nearby trees  seasons and the visitor's ecological choices |
| Echo | Q3 | Friendly Ghost | Appear at appropriate hours and react to actual haunted objects  not unseen props |
| Moss | H7 | Mushroom Keeper | React to rain and actual mushrooms or soil around the resident |
| Byte | J5 | Glitch Sprite | Tie glitches to verified game events and retain player puzzle outcomes |
| Tick | S3 | Clockwork Timekeeper | Follow the true game clock and announce accurate scheduled activities |
| Nimbus | D6 | Raincloud Poet | Reflect current town weather and rainfall rather than making invented forecasts |
| Fizz | W1 | Potion Slime | Show potion experiments changing objects when quests are completed |
| Captain Coral | P3 | Sea Dragon | Visit water-themed areas with realistic swimming or resting loops |
| Quill | A4 | Talking Raven | Use real accessible book titles and respond to the player's chosen words |
| Orbit | X1 | Curious Alien | React to genuine planets/observatory props and avoid invented astronomy discoveries |
| Thistle | O4 | Fox Merchant | Maintain a real inventory and consistent quoted barter prices |
| Basil | M6 | Tea Witch | Use real herbs and stove props rather than impossible supplies |
| Pebble | G1 | Stone Golem | Interact with rocks and building materials already placed |
| Zig | L6 | Robot Dog | Offer a real fetch interaction and move around reachable objects |
| Pollen | N2 | Bee Engineer | Move between visible flowers and respond to weather/daylight |
| Lumen | T4 | Lantern Spirit | Control real lantern light and react to the night cycle |
| Vesper | R6 | Night Owl | Sleep in daytime and become active near dusk  matched to world clock |
| Kestrel | F6 | Sky Pirate | Follow a bounded sky route and interact with actual ship/platform assets |
| Drift | U7 | Sleepy Astronaut | Rest/recharge on a timed cycle linked to available props |
| Tangle | T2 | Octopus Puzzle Master | Offer stateful physical puzzles with remembered outcomes |

## All 38 simulated villagers: verified job and distinctive interests

**Job/workplace are actual simulation assignments.** Personal interests are authored characterization (the final 14 newly added on the audit branch). Do not confuse a character's hobby with their paid work.

| Villager | Simulation job and workplace ID | Off-duty interest |
|---|---|---|
| Mabel | farmer at silo | seedlings and shared gardens |
| Arlo | farmer at garden | tinkering and mechanisms |
| Bea | farmer at orchard | birds and trees |
| Cas | dairy hand at dairy | turning errands into adventures |
| Dot | poultry keeper at coop | maps and overlooked patterns |
| Ezra | shearer at sheep | old stories and archives |
| Flo | miller at mill | recipes and friendly welcomes |
| Gus | baker at bakery | repairs and useful tools |
| Hattie | baker at bakery | tea and well-timed pauses |
| Ivo | barista at cafe | riddles and logic |
| June | cook at cafe | night walks and moon phases |
| Kip | grocer at greengrocer | shortcuts and messages |
| Lou | shopkeeper at store | melodies and found sounds |
| Merv | butcher at butcher | clear explanations and suspicious shortcuts |
| Nora | publican at pub | tidy spaces and helping neighbours |
| Ollie | postie at post | games and unnecessary high scores |
| Peg | truck driver at depot | repair and reuse |
| Rafe | truck driver at depot | constellations and clear nights |
| Sadie | truck driver at depot | book stacks and unusual rooms |
| Theo | teacher at school | good questions and changing viewpoints |
| Una | nurse at clinic | local plants and habitat |
| Vern | mayor at hall | neighbourly news and unusual sightings |
| Win | station master at depot | clouds  wind and changing light |
| Zara | programmer at home | bringing people together and making plans |
| Bluey | programmer at home | small programming tools and helping neighbours debug them |
| Clem | retired at square | local birds  old paths and morning walks |
| Dulcie | student at school | learning at school and sketching science ideas |
| Errol | student at school | school projects  fitness and figuring out puzzles |
| Fern | artist at square | colour  murals and the light in Market Square |
| Gwen | retired at square | gardening  neighbourly help and long memories |
| Harlan | farmer at silo | wheat  soil and keeping farm machinery running |
| Ida | grocer at greengrocer | seasonal produce  recipes and fair prices |
| Archie | power operator at power | solar panels  electrical safety and power demand |
| Bonnie | water operator at waterworks | water conservation  rainfall and keeping taps running |
| Cooper | recycler at recycling | sorting materials  fixing broken things and reducing waste |
| Daisy | firefighter at fire | fire prevention  community safety and training drills |
| Elsie | bank teller at bank | savings  the town budget and helping people plan |
| Frankie | foundry worker at foundry | foundry safety  tools and durable handmade objects |

## All 188 house residents: coverage and realism

The archive template in `tools/lib.mjs` adds an `act.do='npc'` actor to each generated house. The house-resident slot is tied to a specific coordinate and can wander its interior, but the same 26 short first names repeat across the 188 slots. The [inventory CSV](NPC_REALISM_INVENTORY_2026-10-19.csv) lists all 188 individual coordinates and currently displayed resident names; it deliberately excludes private repository URLs, READMEs and descriptions.

**A credible next version would give every house resident** a stable, distinct identity and privacy-safe bio; a household and preferred room; sleeping and meal routines; a few object-specific chores; who they actually know; home/visitor recognition with opt-in persistence; and the ability to answer questions only from observable house contents. No made-up job, kinship or memory should be shown as if generated by real gameplay.

## Ordered engineering backlog

1. **P0 – Canonical-source parity and truthful place claims.** Reconcile audit branch with newest `main`; run `npc-location`, `npc-realism-audit`, `npc-scene-awareness`, game build and public privacy scan; deploy generated build once, not by editing public files manually. Acceptance: Arlo at the Market Garden correctly distinguishes current location from H1 home and stays correct after refresh/new build; en route is not "at the garden".
2. **P1 – 258 stable identities.** Preserve unique display names within the 188 house slots, distinguish story biography from game-observed events, tie actor records to immutable IDs. Acceptance: no accidental duplicate display identities where separate households are meant; new saves migrate without losing chat/quest progress.
3. **P1 – Unified town-clock schedules.** Give 32 named characters and indoor residents age-appropriate/character-appropriate sleep/work/rest/leisure plans (fantasy creature equivalents where appropriate). Advance simulation outside draw distance. Acceptance: absent actors are not frozen, missed shifts don't repeat, schedules match real clock and location.
4. **P1 – Event-backed memory and relationship changes.** Add bounded, inspectable local event records: met the visitor, last discussed topic, trade, favour, observed party/meal or witnessed encounter. NPC dialogue must identify observed facts vs hearsay, and offer a clear "clear memories" control.
5. **P1 – Shop/staff/world-object synchronization.** Live merchants quote stock and prices from the same data as their counter, hand over real inventory, and don't claim to have an object they can't access. NPC tools, quests and work actions update actual world state.
6. **P1 – Navigation, context and proximity.** Character paths travel between reachable doors, lots and meaningful waypoints, avoid collision and respect occupied spaces. NPCs only identify objects currently placed, with no wall-penetrating perception or invented direction.
7. **P2 – Character-specific gestures/voices.** Add purposeful hand/tool interactions, posture, context-sensitive greetings, ambience-dependent activity, and nonverbal reactions while retaining Android performance.
8. **P2 – Optional jobs/side quests for first 12 named NPCs.** Match bespoke NPC identity to credible work, meaningful goals and visible outcome; don't add filler quests just to increase a counter.

## Playtest acceptance matrix

| Scenario | Minimum verification |
|---|---|
| Current place | Arlo at garden, at home, en route and near an unnamed street; no guessed street name |
| Every named character | 32×: identity, current lot, one relevant interaction, one free-form question, no unrelated made-up world claims |
| Every town villager | 38×: job, shift, meal, wallet, actual place, out-of-range progression and physical interaction |
| Every house resident | 188×: unique actor ID, valid room, meaningful object description, reachable route, no furniture clipping, private-room privacy |
| Social continuity | Two named villagers exchange a real event; only then claim that event; reload preserves allowed memory |
| Shop realism | Buy last available item; employee and counter agree about remaining stock; service closes at the advertised hour |
| Clock and weather | Dawn, workday, closing, night and severe weather; no day-only behaviour at night |
| Network fallback | Groq reachable, rate-limited, offline; local location/room answers still reliable |
| Performance | Android physical keyboard, NPC panel sizing, NPC culling, no excessive animation or AI cost |

Run `node tests/npc-realism-audit.mjs`, `node tests/npc-personality.mjs`, `node tests/npc-location.mjs`, `node tests/npc-scene-awareness.mjs`, `node tests/life.mjs` and `node tools/build.mjs && node tools/check_privacy.mjs` before releasing. Some tests are graphical or require a local server; a static code audit cannot stand in for their results.

**Publication gate:** Audit-branch changes are not asserted to be deployed or merged. Preserve Cloudflare secret bindings/rate limits and private source restrictions. If another agent changed `main`, review and reconcile rather than overwriting it.
