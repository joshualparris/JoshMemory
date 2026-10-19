# Repository Town: how to improve it (19 Oct 2026)

Source reviewed: branch `repository-town-merged-playtest-20261019` (JoshMemory/repository-town), head 6f76ded.

## Where it stands
- 188 houses, 57 packed games (42 static, 10 vite, 5 python), 32 NPCs, worksite sim.
- Testing is wide but only checks that nothing crashes. Nobody has checked whether it's fun.
- No real phone, real GPU or live Groq reply has been tested. The 32-NPC build is not deployed (Vercel 402 quota). Pages has the Claude build.

## 1. Add a reason to play (biggest win)
Right now there's a lot to see but no goal tying it together. NPC quests are one 3-choice trivia question each.
- Town Passport: stamps for houses visited, arcade games played, NPC quests done. Make progress visible ("47/188 houses").
- Chain the quests: NPC A sends you to NPC B's house to fetch an item from an exhibit. This uses the houses and the worksite sim you already have.
- Rewards that change the world: badges unlock a cosmetic, a new street, a secret house or a resident moving in.
- Make quests 3–5 steps long, and use the house's own exhibits rather than general trivia.

## 2. Make the good games easy to find
- 57 games are spread across 188 houses. Add an Arcade district or map pins, plus a "Featured / Josh's picks" list.
- Let players rate games with a thumbs up or down, saved locally, so the best ones rise to the top.
- Recently played and resume on the main HUD.

## 3. Fix the broken or missing games (cheap, concrete)
- Aetheria: change the `ui/Button` import to `button.tsx` so it builds on Linux.
- JoshHub classic-dnd-text (game.js:528) and Dark Realms (game.js:1294): syntax errors.
- JoshHub tile-game: missing src/map.json.
- AA Game Adventure: leftover merge text is still in JoshHub's source.
- Python games replay every command from the start, so they get slower the longer you play. Snapshot state or cap it.

## 4. Phone performance
- The real Android target is untested. Use instanced or merged geometry for repeated props, distance culling for interiors and NPCs, and a "low quality" toggle.
- Measure FPS on your actual phone before adding more content.

## 5. Process
- Two agents (Claude + ChatGPT) committed to the same branch today. Pick one owner per branch, or one branch per agent with merges.
- Deploy the NPC build to GitHub Pages (Groq will need the Vercel function, or deploy when quota resets).
- Do a 15-minute human playtest and note where you got bored or lost. That will teach you more than another automated sweep.

## Suggested order
1. Deploy and phone playtest. 2. Fix the broken games. 3. Passport and chained quests. 4. Arcade discovery. 5. Performance.
