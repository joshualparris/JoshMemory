# RTD-006 — Canonical production release and recorded-NPC browser/audio baseline

**Audit:** 24 October 2026 (Australia/Sydney); observation around 08:48–09:01 UTC.  
**Task:** RTD-006 — record latest `main`, real deployed release fingerprint, current browser/audio test baseline and known limitations.  
**Status:** **Release-source audit COMPLETE**, not a gameplay change, deployment, promotion, new voice generation or successful public-hosted end-to-end interactive test.  
**Editable source:** `joshualparris/JoshMemory/repository-town/` only; generated `Parris-Tech-Services/Repository-town` mirror is not edited.

## 1. GitHub and Vercel source-of-truth comparison

| Evidence | Observed |
|---|---|
| **GitHub main at start of RTD-006 audit** | `588f2b9bb3655d7fe2e1da500fef4f6ed4dd697a` (captured before coordination claim) |
| **GitHub main when RTD-006 was claimed** | `e87e3eb4ca6def7a53c19998f41f5c84d65813b5` (the preceding main plus the RTD-006 coordination claim) |
| **Current production alias** | [https://repository-town-claude-complete.vercel.app/](https://repository-town-claude-complete.vercel.app/) |
| **Vercel project** | `repository-town-claude-complete`, ID `prj_Ojr0Zh1ng3Zf6Y3l9RoQ6CqEvAsJ` |
| **Production deployment** | `dpl_BUJvawLJX9Bvk87P7b7uKu1U4RJp` — [Vercel inspector](https://vercel.com/joshualparris-projects/repository-town-claude-complete/BUJvawLJX9Bvk87P7b7uKu1U4RJp) |
| **Deployment source commit** | `9e3853156838f21c5a7c17cb63ce3bd4d827f93c` (RTD-005 PR #170 merge) |
| **Deployment state, target** | `READY`, production; `aliasError=null`, canonical alias present in deployment response |
| **Deployment initiated** | 2026-10-24 08:48:50.113 UTC |
| **Deployment ready** | 2026-10-24 08:52:54.516 UTC |
| **Live `/release.json`** | **HTTP 200**, `application/json`, `cache-control: no-store` |
| **Live manifest `sourceCommit`** | `9e3853156838f21c5a7c17cb63ce3bd4d827f93c` — **matches Vercel deployment metadata exactly** |
| **Live manifest `contentHash`** | `afc7f0a2562b0823daf9d73dced3842dda27093325352a098ed2c24bac3de637` |
| **Live manifest file entries** | **1,133** |
| **Vercel build log integrity** | `Verified 1133 files for source 9e3853156838f21c5a7c17cb63ce3bd4d827f93c` from repository `tools/verify-release.mjs` |
| **Source/release difference** | At start, `main` was **16 commits ahead** of deployed `9e38531`. GitHub compare showed changes to test/QA/workflow and documentation only; **no `repository-town/src/` changes** in that comparison. Subsequently updating the board and these docs adds documentation commits, so the head SHA may advance again. |
| **Staging release** | [`repository-town-claude-playtest.vercel.app/release.json`](https://repository-town-claude-playtest.vercel.app/release.json) responded HTTP 200 with source `6b81498565910c0ab2eec4270fb33af4616158a9`, contentHash `360caa575e578bebc94c30e25f5d3dc51aa9039f9ff825e972c239d9c9ff587e`; **staging is independently older/different, not evidence of production parity**. |

**Interpretation:** GitHub main has advanced beyond the production deployment. The specific start-of-audit diff was QA/workflow/docs only, so no game runtime change was detected from *that comparison*. Do not claim current main and Vercel are the same commit. The published release manifest, actual deployment metadata and Vercel source SHA do agree.

## 2. Production HTTP asset verification (read-only live fetch)

The connected Vercel authenticated URL fetch returned actual status, content type and served body from the canonical production host. This bypasses restrictions of a generic web crawler; it does **not** simulate clicking/playing in a browser.

| Asset (canonical production) | HTTP | Verified payload |
|---|---:|---|
| [`/`](https://repository-town-claude-complete.vercel.app/) | 200 | `text/html`, title `Repository Town 3D`; game HUD/NPC links present |
| [`/release.json`](https://repository-town-claude-complete.vercel.app/release.json) | 200 | Source SHA/hash and 1,133-file manifest parsed |
| [`/people.html`](https://repository-town-claude-complete.vercel.app/people.html) | 200 | 2D character lounge HTML |
| [`/ui/recorded-dialogue.js`](https://repository-town-claude-complete.vercel.app/ui/recorded-dialogue.js) | 200 | JS containing `RECORDED_DIALOGUE_BRANCHES` and the original recorded-choice view |
| [`/ui/npc-chat.js`](https://repository-town-claude-complete.vercel.app/ui/npc-chat.js) | 200 | JS imports `makeTownRecordedConversation` and `stopTownVoice` |
| [`/ui/voicebank.js`](https://repository-town-claude-complete.vercel.app/ui/voicebank.js) | 200 | JS includes original VoiceBank origin, Game300 loader and cancellation |
| [`/npc.css`](https://repository-town-claude-complete.vercel.app/npc.css) | 200 | Published responsive NPC styles |
| [`/ui/yarns.js`](https://repository-town-claude-complete.vercel.app/ui/yarns.js) | 200 | NPC yarn audio UI JS |
| [VoiceBank `/src/game300.js`](https://parris-voicebank.vercel.app/src/game300.js) | 200 | Original shared Game300 JS module fetchable; **not** a full ZIP/decoded MP3 audit |

The source path `/src/ui/voicebank.js` and `/npc.html` correctly returned 404: these are **not published game asset paths**. The public path is `/ui/voicebank.js` and the NPC Lounge is `/people.html`. A 404 for the wrong path is not a defect in production.

### Release integrity details

`tools/verify-release.mjs` reads the release file manifest, recomputes SHA-256 per bundled file and SHA-256 of the serialized full map to validate `contentHash`; Vercel build logs showed it passed for 1,133 files. The live manifest's important asset SHA-256 values:

| Asset | SHA-256 in live `release.json` |
|---|---|
| `ui/recorded-dialogue.js` | `0822552c84da290cfd7d92ef58c1145ee855ec7c22e397ddf95b4ac4d8c2c388` |
| `ui/npc-chat.js` | `b0117d03e5e4241e4a4e511cd92bfbb63a174b3afc5f3272c62389b0884046b7` |
| `ui/voicebank.js` | `4d4ae85f5d55830b1cfaf7a8197434490bab9b3c6bf9ceabf5a7682ff1f11562` |
| `people.html` | `1207b7f7b735411f1b33df4e9cf8ebe97a08a546aa4ce61686eb0ff2898d1677` |
| `npc.css` | `4aea3cd0d3c5f37205c828c9f6d593a5767a5dca6aa24641a4e25735210d3659` |

These are *manifest values* and build-verified at deployment, **not a separate SHA-256 calculation from every live HTTP body** during this audit.

## 3. Browser and ElevenLabs audio test baseline

| Evidence | Source run and result | What it actually proves |
|---|---|---|
| [Town Integration run 40079153284](https://github.com/joshualparris/JoshMemory/actions/runs/40079153284) | **SUCCESS** on [RTD-005 PR #170](https://github.com/joshualparris/JoshMemory/pull/170) tested head `3b00f3024a79054855756f897b0fbe5974a8fb30` | `npm run build:release`-equivalent release/privacy/integration/geometry/game integrity safety job plus **five** 28-day economy simulation seeds (1, 42, 8675309, 20261019, 20261021). It was a CI checkout, not the public production host. |
| [Recorded WebGL run 40079153300](https://github.com/joshualparris/JoshMemory/actions/runs/40079153300) | **SUCCESS** on same tested head | Actual built local website served for Playwright. Logs show `tests/recorded-dialogue-browser.mjs` **PASS**: ten Game300 actors across desktop **1280×800** and Pixel-7-style mobile **390×844**, each with actual decoded WebAudio `BufferSource.start`, captions, replay, stop. `paidRequests:0`, `pageErrors:[]`. The separate `tests/webgl-playtest.mjs` passed desktop/mobile Three.js world interactions. |
| [PR #166 recorded-browser run 40073596040](https://github.com/joshualparris/JoshMemory/actions/runs/40073596040) | **SUCCESS** (previous implementation head) | Historic desktop/mobile preview proof for same shared NPC modal and original voice source. |
| [RTD-003 Integration run 40077642675](https://github.com/joshualparris/JoshMemory/actions/runs/40077642675) | **SUCCESS** | Canonical source actor counts and stability of 32/99/188 NPC inventory, saved state, privacy and economy logic |
| Vercel production build logs, release `9e38531` | `build:release`, privacy, integration and `tools/verify-release.mjs` produced **READY** deployment; 1,133 file check passed | Server-side build integrity and published source fingerprint, not independent browser user-gesture playback |

**Crucial CI caveat:** The recorded WebGL CI run's extra step literally named **“Play real hosted production game in Chromium and Pixel 7 emulation” was SKIPPED**. The *local built-site* tests passed, and live production file availability passed **separately**. Do not conflate them as a passing **production-hosted click-through and audio** test.

## 4. Known gaps after RTD-006

1. **Source commit drift:** GitHub main is ahead of active production. From the inspected diff the additions were docs/QA/CI only; re-check before another deployment, and do not mislabel the newer main SHA as live.
2. **Hosted production interactive audio:** full real player click against the canonical published URL was not exercised by this session or by the skipped hosted-browser step; voice pack asset access and live JavaScript HTTP 200 don't guarantee actual user playback.
3. **Audio recordings coverage:** 100 Game300 files for ten cast speakers were previously validated in VoiceBank; missing 22 named cast members remain unapproved/unvoiced, as do worker/house actors not specifically cast. Open #164 with `VO041`–`VO060` MP3s must be individually reconciled before merging.
4. **Authentic storyline/quests:** six-stage shared player-choice dialogue is not a full Skyrim quest-state graph or persisted NPC memory. No arbitrary LLM response should pretend to be a recorded clip; `success`/`retry` may appear in gallery but are not authoritative earned gameplay triggers.
5. **Negative and device tests:** failed repairs, purchases, CORS/ZIP corrupt, offline transitions, rapid switches and interruptions, real Samsung handset and end-to-end walking→chat→interior→transaction remain separately pending.
6. **Staging differs from production:** staging `sourceCommit` above is different; don't assume QA results observed on one host certify the other.
7. **Backup fingerprint:** not checked against the deployed Vercel `contentHash` during this RTD-006 baseline; that is an independent release task (RTD-092).
8. **Vercel's optional security/access:** protected preview deployments may require authentication. Canonical production responded 200 through connected Vercel's signed/read-only fetch. This audit did not modify access settings.

## 5. Handover

- Mark **RTD-006** checked as **release baseline captured, not deploy/live-playtest complete**.
- Leave **RTD-007/008 and every gameplay, voice-casting, transaction and production acceptance checkbox open** until independent evidence.
- Reserve RTD-007 ownership in `COORDINATION.md` when someone takes it; use this report's exact links, SHAs and limitations to write actionable next implementation acceptance criteria.
- Before final release, explicitly compare the **live `release.json` sourceCommit/contentHash**, the intended tested build SHA, canonical Vercel alias, production voice click test and generated backup; don't rely on “green CI” alone.

**Evidence sources:** connected Vercel `get_project`, `get_deployment`, `list_deployments`, `list_deployment_aliases`, `list_deployment_events`, `web_fetch_vercel_url`, GitHub branch/compare, recorded WebGL CI job logs, tracked release/code files. No paid ElevenLabs call, Vercel build/deploy or source gameplay change was initiated by RTD-006.
