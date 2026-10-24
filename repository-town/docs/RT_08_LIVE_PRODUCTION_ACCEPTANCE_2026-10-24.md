# RT-08 / AUDIO-013.03 — actual production NPC audio, 3D movement and mobile acceptance

**Audit date:** 24 October 2026 (Australia/Sydney).  
**Canonical site:** https://repository-town-claude-complete.vercel.app/  
**Production Vercel deployment:** `dpl_Fnd6XnMXNhnuKZdaGN8BhPGcRnX7`, state READY.  
**Source commit in Vercel metadata and live `release.json`:** `34eaf60455acf2984a8d69ed9b23477c24e70020` (exact match).  
**Live content hash:** `afc7f0a2562b0823daf9d73dced3842dda27093325352a098ed2c24bac3de637`.

## Test environments and provenance

1. **External live graphical browser:** [TinyFish session](https://agent.tinyfish.ai/runs/87c5a677-a690-450d-939a-c7838b757b4c), completed. Loaded the public 3D game, walked through the adventure/NPC interaction menus, pressed E to open Rowan's Town Guide conversation and confirmed the recorded-choice UI. Its browser could **not** measure recorded playback or exercise in-canvas house movement/mobile viewport; do not use its UI presence as audio proof.
2. **Real Chromium against the hosted release:** An ephemeral Vercel sandbox `sbx_drrJwceKW7SPT8HnwuQzE9BaZeBQ` running installed Google Chrome + Playwright on the production origin, not locally served game code. Network allowed, browser loaded the actual production site and VoiceBank assets. Sandbox lifespan 15 minutes; command IDs below allow provenance but logs may expire with session.
3. **Canonical `tests/recorded-dialogue-browser.mjs`** against `TOWN_PLAYTEST_URL=https://repository-town-claude-complete.vercel.app/`, with only Chromium executable path supplied by the environment. Command `cmd_f2cb8dcb9e444028973f7ae96eaf`, exit 0. **20 of 20 actor/device cases passed:** ten distinct actors (Rowan, Pip, Circuit, Wren, Sol, Sage, Spark, Lyra, Nova, Kit) each in desktop and emulated Pixel 7 viewport. Actual WebAudio `AudioBufferSourceNode.start()` calls were instrumented and observed after clicks, with character-specific exact text, stop, replay, no page exceptions and **zero paid ElevenLabs API requests**.
4. **Actual 3D game recorded conversations** against production root, separate runtime script `rt08-town-dialogue.cjs`, command `cmd_e0f28e074e7d40ed997a9c8e011e`, exit 0: Rowan, Pip and Kit, each desktop and Pixel 7 viewport, in the live 3D Town NPC modal. All six flows opened correct actor, clicked 'Hello there', started actual WebAudio twice, presented actor-specific caption, stopped and replayed. Zero JavaScript page errors and zero paid speech requests.

## House and movement

- Canonical `tests/e2e.mjs --url https://repository-town-claude-complete.vercel.app/ --only A1` exercised **real in-browser movement and touch controls**: house A1 entered and exited by walking on desktop and emulated mobile, **eight rooms**, 39 props, 27 interactive exhibits, reachable prompts, on-screen touch controls.
- Desktop mechanics: run, crouch, jump, collision and autosave were all true. Mobile touch UI present; software-rendered FPS sampled about 22.3 (not a hardware performance benchmark).
- First browser run `cmd_e5d109cf26fc41a3b3484deb9fb1` flagged 12 household panels on both profiles because legacy E2E expected titles starting with the bare exhibit label. This was a **test assertion mismatch**, not verified broken interactions.
- Independent direct production action `cmd_ea015bbb86cc404abf6f79a34adf` opened A1 fridge panel, confirming the real title **“Lena's fridge”**, household inventory/temperature text and a visible modal. Personalised titles do not start with “Fridge”.
- Rerun with the corrected semantic household panel assertion `cmd_e563ea7bc704462e8ff1c858f5b6`: **A1✓ desktop, A1✓ mobile, zero failing house checks**, but process exit 1 remained due to one unrelated browser-console 404.
- Request diagnostics `cmd_51bb670fd0124ae8bbf2dc1ce357` identified that lone error precisely as an automatically requested **`/favicon.ico` HTTP 404**. This is a cosmetic missing static asset, not a failed executable game resource. The E2E runner now preserves a visible warning for this exact request while retaining hard failures for every other console error.

## Verified scope versus remaining acceptance

**Proven:** canonical published source SHA and manifest agree; 10/10 voiced actors' actual audio source starts on desktop and emulated mobile in the standalone Town Lounge; three named actors play in the actual 3D Town modal on both profiles; real A1 house entry/exit and movement; no paid speech calls or JS page errors in recorded-conversation runs.

**Not proven:** subjective audible output from physical speakers/headphones, native Samsung hardware, comprehensive in-world walk-up to every one of the ten residents, all 188 houses and every civic location, poor-network/offline/ZIP failure recovery, shop/repair/quest consequences, entire mobile landscape/keyboard accessibility matrix, complete CSP header review, production-versus-backup release fingerprint equality, and overall full-game acceptance. None of these may be inferred from a test passing in the 2D Lounge.

**Disposition:** RT-08 and broad audio parent 013 remain **OPEN** pending their entire acceptance contract. AUDIO-013.03 remains open for the still-unchecked CSP and other exhaustive live asset checks. Do not mark those parent tasks complete solely based on this focused proof. No application code or production deployment was modified. Fix the optional favicon separately before insisting on zero console warnings.

## Reproducible checks

The published site is tested directly rather than assuming the application source branch is deployed:

```bash
TOWN_PLAYTEST_URL=https://repository-town-claude-complete.vercel.app/ node tests/recorded-dialogue-browser.mjs
node tests/e2e.mjs --url https://repository-town-claude-complete.vercel.app/ --only A1 --out test-results/rt08-a1.json
```

Use a Chromium/Playwright environment with WebGL software rendering available. In the isolated Vercel sandbox, the default Playwright Chromium launcher was redirected to installed Google Chrome; no game code was modified. The exact environment run was completed before this document was authored; this documentation commit does **not** imply re-running its commands. The E2E house check and recorded-dialogue test were independent, and only the narrow A1 case was executed from the 188-house matrix. An explicit `favicon.ico` warning remains until the static asset is supplied.

## Follow-up

- Extend production 3D NPC walk-up/visit test beyond the three demonstrated characters; test actor switching and walking away mid-playback, offline/poor network and accessibility.
- Test physical Android handset if hardware-specific acceptance is required.
- Verify Vercel production, staging and GitHub Pages mirror fingerprint and formally sign off the full RT-08 contract.
