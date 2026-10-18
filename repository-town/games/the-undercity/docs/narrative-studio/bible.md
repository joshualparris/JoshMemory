# The Undercity — Living Project Bible

**Canon boundary:** Based on the existing browser story and canonical `content/` scripts. `secrets.md` contains proposed interpretations, **not** automatic facts. Existing IDs, protagonist choices and saved progress win over a generic model prompt.

## Premise
Far below the surface, the Undercity persists beneath a sealed stone sky. Lamplight, moss and collective work sustain districts that official records occasionally insist are empty. Residents learn what survives by asking people, not the Council's archives.

You awaken in the suspended Bell-Cage prison without a credible account of your offence. At Lantern Court a clockmaker's impossible appointment offers a way forward: follow absent hours, missing streets and documents that still bear the impressions of erased names.

Four personal ambitions pull at that common history. The Moth King's debts, the river's unfinished testament, a stolen childhood behind glass and the Council's final furnace each ask who gets to remember, and who bears the cost of giving a city the truth.

## Ten tonal laws
1. Second person, present tense. 2. Place human work beside one impossible fact. 3. A concrete objective before portent. 4. Dark humour stays dry. 5. No undeserved player praise. 6. Both success and failure change the world. 7. Distinguish rumour from proof. 8. Never flatten disputed people into monsters. 9. Reveal late-game truths on schedule. 10. Close every chapter with a cost, promise or obligation.

## Four stats
- **Observation:** evidence, details, archives.
- **Guile:** disguise, stealth, forbidden routes.
- **Persuasion:** crowds, bargaining, shared decisions.
- **Resolve:** endurance, protection, confrontation.
New `challenge.stat` values must use these exact IDs.

## Menaces and consequences
- Suspicion → Watch House, with a persistent capped legal Record.
- Notoriety → Tribunal, where reputational harm is contested.
- Wounds → Ward, treatment and recovery.
- Delirium → Pale Rooms, dreams and disorientation.
Every new penalty story needs a zero-action arrival and recoverable way out. Respect the shipped engine's level-8 thresholds.

## Character dispositions
Nine active character quirks govern roleplaying and opposing consequences; source of truth is `content/world.js` and `src/game/rules.js`. Do not create a parallel quirk system from a prompt.

## Five current faction anchors
- Wardens: a sworn public protection order.
- Ledger: civil records and evidence.
- Hands: work, trade and smuggling routes.
- Choir: art, gardening and public memory.
- Dawn: reformers against entrenched authority.
Use their existing internal IDs when writing effects.

## Twelve location anchors
Bell-Cage, Lantern Court, Inkward, Siltway Quays, Glass Arcade, Sootworks, Moss Choir, Forgotten Stairs, Listening Edge, Watch House, Tribunal and Pale Rooms. These are twelve *writer landmarks*, not exhaustive map metadata. The live `PLACES` object establishes real routes.

## Central mystery
The city is governed by a Council that sealed the sky and alters the public record of its people. The exact motives and agents are subjects for the actual quest outcomes; this bible does not invent a single secret resolution.

## Twenty vocabulary anchors
Bell-Cage (hanging prison); Lantern Court (public meeting ground); Siltway (river); Inkward (archive district); Glass Arcade (memory market); Sootworks (factory quarter); Moss Choir (living garden faction); Listening Edge (outer boundary); Forgotten Stairs (gated passage); Moth King (ambition figure); handless clock (missing-hours evidence); Wardens (protectors); Ledger (archive faction); Hands (working faction); Dawn (reform faction); Pennies (currency); Leads (investigation progress); Resolve (stat); Guile (stat); The Record (legal consequence).

## Forbidden borrowings
New player-facing content may not use setting-specific proper nouns from the inspiration title, its text, lore, characters or art. Exclude: **Mr Eaten, the Unterzee, the Echo Bazaar, Hallowmas, Neathmas, Exceptional Friend, StoryNexus**. Technical studies may mention them in documentation, not published fiction.

## Revision protocol
All new revelations need source story ID, reveal depth, unreliable-witness status, affected characters and a human editorial decision. Preserve the characters' consent and existing save state.