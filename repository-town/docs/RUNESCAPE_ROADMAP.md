# RepoTown skilling roadmap (RuneScape and Skyrim ideas)

RepoTown already has much of what RuneScape is built on: an inventory (the torch), jobs that raise your
grade the more shifts you do, a real economy with shops and wages, a quest journal (the 12 Expedition
Guild relics) and automatic saves. RuneScape's core is "do an activity, earn XP, level up, unlock better
versions", and that fits on top of what is here.

Tick an item only when it is playable in the browser on desktop and Android, saved with the game, and
covered by a test.

## Principles

1. Keep the instant start: a new player is dropped straight into the town with no login or character
   screen. Accounts and character creation live in Settings, for later.
2. XP and levels go into the existing save file from day one, so an optional account later just uploads
   that save and nobody loses progress.
3. Skills connect to the town economy: tools come from local shops, and what you gather can be sold.
4. Build one skill end to end first, then copy the pattern for every new skill.
5. Skilling before combat. RepoTown's charm is a believable country town.

## 1. First slice: woodcutting, firemaking, XP and levels

1. [x] XP and levels: RuneScape-style XP curve (levels 1–99), saved with the game, with a level-up message.
2. [x] Skills panel: a 📊 Skills button showing each skill's level, XP and progress to the next level.
3. [x] Hatchet and tinderbox for sale at Central West Hardware & Timber, and free at any hour from the Woodlot
       tool rack by the sign (one of each, like the starter-tool spawns in Lumbridge), so chopping never waits for a shop.
4. [x] The Woodlot, north of the railway: choppable trees (normal, oak at level 15, willow at level 30).
5. [x] Woodcutting (any tree in town — yard, square and orchard trees — as well as the Woodlot; RuneScape-style
       hatchet swing with wind-up, chop and recoil, a thunk, flying chips and a shuddering tree): chop with a hatchet, get logs in your bag (28-slot bag), and the tree becomes a stump
       that grows back later. Higher levels chop faster.
6. [x] Firemaking: use a tinderbox on logs to light a fire that burns for a while; better logs need a
       higher level, give more XP and burn longer.
7. [x] Sell logs to the timber yard at the hardware store, with money moving from its till.
8. [x] Tests: rules (XP curve, chopping, fires, saving) in Node, plus a real-browser playthrough on
       desktop and Android.

## 2. Next skills, in order

9. [ ] Cooking on a fire you lit (feeds the hunger system).
10. [ ] Fishing at the river or dam, then cooking the catch.
11. [ ] Turn existing jobs into skills: baking, farming and café work earn Cooking and Farming XP
        alongside the wages.
12. [ ] Mining and smithing at the Foundry.
13. [ ] Bag capacity, banking (Community Bank) and noted or stacked goods.

## 3. Skyrim elements

NPC, quest and dialogue work follows the existing [RTD-001–093 roadmap](SKYRIM_NPC_DIALOGUE_IMPLEMENTATION_TODO.md) and its claim protocol; the items below point at it rather than duplicate it.

14. [ ] Quest chains with townspeople, starting from the Expedition Guild relics.
15. [ ] Lockpicking (there is now a locksmith), with legal and illegal uses.
16. [ ] Books to find and read in houses that teach lore or grant small XP boosts.
17. [ ] A "dungeon" under the old mine.
18. [ ] Combat and dragons: much later, if ever.

## 4. Characters and accounts (Settings, optional)

19. [ ] Customise character in Settings: name, look and colours, any time.
20. [ ] Optional account: sign in to keep skills across devices, built on the existing export/import save.
