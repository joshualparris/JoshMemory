# The Undercity — specification coverage and phase-two implementation audit

Date: **15 October 2026**. Scope: the uploaded 64-page Undercity RPG design document and subsequent eight-system phase-two instructions. This report differentiates **working implementations**, **partial implementation** and **not yet verified**. It is not a claim to have reproduced any proprietary game.

## Current verified inventory

The [generated full content tracker](CONTENT_TRACKER.md) enumerates:

- **352 playable storylets** in the authored source (including penalty-hub stories).
- **854 choice branches** and **18 opportunity cards**.
- **34 professions** (10 Tier 1, eight each Tier 2, 3 and 4).
- **20 enumerated equipment slots**, each with at least one purchasable item; 20 general Bazaar goods.
- Four ambitions: **each has 32 chapters** (eight original plus 24 late-act chapters). The new Moth chapters are versioned JSON; the three other main late arcs are versioned JSON in `content/storylets/ambitions/late-main.v1.json` (compiled to `content/late-ambitions.js`), and 66 optional companion investigations are versioned JSON in `content/storylets/ambitions/second-acts.v1.json`.
- Four seven-stage Making Your Name arcs; 20 destinies; nine quirks; three exceptional stories; six seasonal events.

Counts represent authored data and test-reachable engine integration, **not** an assertion of a complete human playthrough of every branch.

## Phase-two requirements

| Requirement | Status | Verified implementation | Further work |
| --- | --- | --- | --- |
| 1. Ambition depth | **Complete for numerical chapter target; partial for story depth** | All four ambitions have 32 connected stages. Moth chapters 9–32 use versioned `content/storylets/ambitions/moth.json`; Tide, Mirror and Ember have 24 further chapters each in versioned `content/storylets/ambitions/late-main.v1.json`. Their choices include distinct chapter actions, stat/relation consequences and coalition endings gated by accumulated evidence and witnesses. | Deepen character-specific dialogue and long-lasting NPC relationships. Late main arcs are now JSON-authored. Continue improving NPC consistency and the depth of divergent consequences. |
| 2. Quality taxonomy | **Implemented registry; partial full migration** | `content/world.js` declares 14 category definitions: primary ability, menace, quirk, affiliation, status, circumstance, accomplishment, route, living story, dream, metaquality, item, story and once-only marker. `src/game/rules.js` supports additive or pyramidal semantics. | Migrate every legacy story flag and counter into typed qualities; make schema the only rules source. |
| 2. Four Menace hubs | **Implemented** | Suspicion → Watch House, Notoriety → Tribunal, Wounds → Ward and Delirium → Pale Rooms. Arrival is automatic at level eight and costs zero actions. Each hub offers three recoveries, with different action and penny requirements. The Record increments once per arrest, to seven. | More multi-stage hub content, persistent NPC recognition and specialised menace challenges. |
| 3. Card rules | **Implemented and tested** | High-urgency cards bypass the normal weighted lottery, including zero-weight cards; unlock multiplicity multiplies draw weight; hand capped at six, timer resets/pauses when full. Automated seeded distribution test for 1:3 weighting. | Wider statistical and edge-case validation against reference observations; not proof that proprietary internals are identical. |
| 4. Content pipeline | **Partial structured migration, functioning validation** | Deterministic JSON compilation (`scripts/build-content.mjs`, `scripts/build-second-acts.mjs` and `scripts/build-late-main.mjs`), cross-reference and quality/item validator (`scripts/validate-content.mjs`), and generator (`scripts/content-tracker.mjs`). CI and Vercel build configured to validate prior to serving new code. | Convert the remaining JavaScript-authored stories into versioned JSON, add an author/editor GUI, schema evolution rules and tracked review workflow. |
| 5. Tier 3–4 professions | **Implemented** | Eight promotions at Tier 3 and eight at Tier 4, gated by previous office and Making Your Name reputation. Each has its own work story, wage and equipment. Promotion requires an in-world challenge, not an unlocked shortcut button. | Unique professional politics and long quests, more income variants, rebalancing after playtesting. |
| 6. Equipment/shop | **Implemented basic economy** | At least one item in each of 20 slots; goods have meaningful additive stat bonuses, costs and resale prices. Buy/sell works with pennies; unequipping occurs automatically when selling the last copy. | Crafting, markets in different districts, trade routes, detailed price balance. |
| 7. Living Stories | **Implemented baseline general scheduler** | `living_stories` array saved per character, each event with `trigger_quality`, `delay_hours`, `message`, `storylet_id`, and `trigger_time`. `tickLivingStories()` resolves triggers at load and during play, adds Messages, and provides countdowns. Four events are currently authored. | Author additional temporal storylines and complex chained triggers, test long-term event migration. |
| 8. Accessibility | **Partially implemented** | Semantic navigation, skip-to-content link, screen-readable names/status, keyboard-driven native buttons, reduced-motion CSS, persistent reading size, colorblind patterned indicators. Responsive breakpoints exist. | Automated Chromium 390px and 1280px smoke plus axe-core WCAG A/AA checks passed. Manual NVDA/VoiceOver/TalkBack and real-device accessibility checks remain. |
| 8. Social | **Not implemented (optional)** | Local saves and story acquaintances are supported, but there is no real cross-player messaging. | If desired, offer exportable letters or local NPC social scenes without pretending messages can reach another user without a service. |

## Authoring workflow

```bash
node scripts/build-content.mjs
node scripts/validate-content.mjs
node scripts/content-tracker.mjs
node --test tests/*.test.mjs
```

The checked-in browser bundle and content tracker can be verified without modifying them:

```bash
node scripts/build-content.mjs --check
node scripts/validate-content.mjs
node scripts/content-tracker.mjs --check
node --test tests/*.test.mjs
```

CI in `.github/workflows/ci.yml` and `test.yml` runs this validation on every push. The connected Vercel project build command is also configured to run the three source and tracker checks before producing a deployment; verify the status of the resulting deployment for each release.

## Findings and remaining limitations

1. **Ambition length is no longer the bottleneck.** All four arcs now have 32 stages, but the Tide, Mirror and Ember late-act choices share a programmatic branch structure. Rewrite the most important dialogue, NPC scenes and divergent consequences so each arc feels distinct and consequential rather than merely meeting a chapter count.
2. **Taxonomy is now explicit, but historical state remains mixed.** Core qualities, inventory, CP, menaces and affiliations are mediated through the rules engine. Some legacy flags, progression counters and seasonal conditions still use ordinary save properties for compatibility.
3. **A JSON compiler is not yet a full CMS.** The authoring file is structured and validated; other content modules still contain in-code `when` functions. The editor and migration tools are not complete.
4. **A menu choice is not necessarily a separate materially different story arc.** Branches change qualities and outcomes but many currently converge. Deep character-level consequences, NPC memory and location changes need further authored work.
5. **The economy is functional, not balanced.** Penalties, wages, item prices and bonuses have automated tests but need longitudinal playtesting. Paid currencies or monetisation have not been implemented.
6. **Accessibility claims are deliberately limited.** Automated assertions verify UI semantics and saved preferences, not actual assistive technology effectiveness.
7. **Saves are browser-local.** There is no account, server sync or cross-player delivery. JSON export/import is available before clearing browser storage.

## Test acceptance and deployment

- Node smoke tests cover onboarding, city navigation, the full-length Moth chain, old-save migrations, four menace hubs, progression, shop and equipment, timed letters and accessibility preferences.
- Card tests cover high-urgency bypass (including zero weight), illegal cards and a reproducible 20,000-draw probability sample.
- Content validator rejects missing story locations, duplicate IDs, unknown items or challenge qualities, broken `next_storylet` links, invalid JSON simple-chain gates and unsupported item slots.
- Generated tracker lists every authored storylet, its location, number of choices, content source and links.
- Latest tested playtest: **https://undercity-playtest.parris-neathaustralia.workers.dev/**, HTTP-verified through GitHub Actions. The Vercel site **https://the-undercity.vercel.app** lags due to its Free-plan deployment limit. Browser saves do not cross between these domains without JSON export/import.

**Current status: expanded, playable, and tested phase-two game. It does not yet fulfil every part of the original 64-page specification.**
