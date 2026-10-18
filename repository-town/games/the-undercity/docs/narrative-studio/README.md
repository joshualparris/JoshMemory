# The Undercity — Narrative Studio

A **StoryNexus-inspired content process**, not a clone of proprietary StoryNexus code. The existing plain-JS game, content compiler and lore are the starting point. The prompts in the research PDF are planning templates, never authority to replace the working interface or engine wholesale.

## Phase 0 — canonical editorial files
- `bible.md`: playable-world canon and house rules. `secrets.md`: a **40-row editorial hypothesis ledger** with 1–5 reveal depth and six deliberately conflicting witness pairs. These proposals are *not approved facts*.
- `style.md`: sentence craft, voice, forbidden terms, three-pass quality test.
- `agents.md`: specialised prompt cards for pitch, midflight structure, prose, content QA, design QA, mechanical QA, continuity, weekly hunt, monthly balance and batching.

## Phases 1–2 — production of one storylet
1. **Pitch** (<=200 words) → explicit human approval.
2. **Midflight skeleton:** every branch, challenge, progress gate, failure recovery, item effect, next link, reveal depth; placeholder copy → human approval.
3. **Prose:** fill only approved text fields; preserve mechanics and secrets schedule → human approval.
4. **Content QA, Design QA, Mechanical QA, Continuity QA:** independent field-path reports. When any fails, return to the affected stage.
5. **Final human sign-off:** QA statuses all pass, named reviewer, `runtime_integration: verified`. No model may mark its own draft as a shipped build. Test original storylets against existing save compatibility.
6. **Convert the approved packet** to native `content/` source using the existing JSON compiler or authored JS, then run `node scripts/validate-content.mjs`, `npm test`, check the tracker and playtest. The review JSON is *not* read by the live game and is not playable by itself.

## Phase 3 — living world
Update the secrets ledger and bible whenever a canon fact ships. Check the last twenty shipped stories for each new revelation; weekly review all changed NPCs, props, districts and voice. Competing accounts are permitted only when tagged as character misdirection.

## Phase 4 — controlled generation
New batches contain **one to five** pitches under the exemplar-led workflow, superseding historical 20/50-story thresholds for larger batches. Keep individual QA regardless of batch size. Monthly review *all* item sources/sinks, card economy, currency loops, menaces and profession income. Propose changes for humans to approve; do not silently rebalance the game.

## Editor and CI
- Open `tools/cms/index.html` as a local/browser tool to author a structured draft and download a review packet. It never overwrites player saves or GitHub content.
- `npm run studio:validate` validates all packets under `content/narrative-studio/submissions/`, ledger IDs, per-branch contracts and sign-off.
- `npm run studio:report` prints the stage backlog.
- The existing `scripts/validate-content.mjs` and generated-bundle parity are still authoritative for real player content. CI runs both checks.

This does not automate a separate writer's taste or magically implement a large content library. It gives a reproducible gate that future AI tools can use without letting unapproved draft prose go live.
## Existing QBN Studio CMS and Groq Foundry
The [no-code QBN Studio editor](../../tools/cms/index.html) has dropdowns for branches, qualities, outcomes and effects; its exports use `format: qbn-studio-export` with `stories[]`. Copy exported JSON to `content/narrative-studio/submissions/` for the editorial gate; the validator accepts either native editorial packets or this CMS bundle. The [Storylet Foundry](../../tools/storylet-generator.mjs) offers optional Groq-assisted drafting with separate review/publishing commands. **Neither CMS export nor AI generation is automatic player-content publication.** A CMS draft with `approved` status also needs `runtime_integration: verified` and actual tests before the editorial gate calls it shipped. Use the full `npm run release:check` (NeathBound) or `npm test` plus `npm run studio:validate` (Undercity).

## Default small-batch prompts

Use the [exemplar-led workflow](SMALL_BATCH_WORKFLOW.md), [writer prompt](writer-prompt.md) and [separate-context critic](critic-prompt.md) for new batches of no more than five. These add the user's lean editorial approach without replacing the existing CMS, approval flow or runtime validators.
