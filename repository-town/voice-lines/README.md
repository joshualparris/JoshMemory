# Repository Town — proposed ElevenLabs NPC introductions

**PARTIALLY COMPLETE: 210 distinct scripts and proposed voices; zero new MP3 recordings or live gameplay integrations.** This is RTD-047/048/049/078 preparation, not a claim that all NPCs are now audible.

## Coverage

- 22 currently unvoiced named street actors, each assigned a **different** candidate ElevenLabs library voice
- 99 existing simulated workers, each named and given a job-relevant opening line
- 89 unassigned house-resident aliases, each with a name-specific introduction
- 10 already-voiced named actors preserved, with their existing 100 approved Game300 clips

The game's 188 house aliases include 99 houses already occupied by those workers. Do not count these as extra independent people. All 210 new scripts use stable namespaced actor keys (named:..., worker:..., resident:...) and unique clip IDs.

**roster.json** records each script, its actor identity, caption text, candidate voice ID and performance direction. All new entries have recordingStatus scripted_not_generated. Candidate voice IDs were sourced from ElevenLabs library search on 29 October 2026; review their licensing, current availability and permitted uses before generating.

## Test and dry run (no network, no credits)

From the canonical repository-town directory:

    node tests/voice-lines-roster.mjs
    node tools/voice-lines-generate.mjs
    node tools/voice-lines-generate.mjs --kind named_street_actor

The last two commands only show the batch size, number of voice choices and estimated speech characters. They never call ElevenLabs without opt-in flags.

## Paid generation is intentionally blocked until approval

Do NOT generate/spend ElevenLabs credits unless Josh explicitly approves the batch and budget. A paid batch requires all of the following: --generate, --confirm-paid-batch, --approved-budget-chars N, and ELEVENLABS_API_KEY in the local process environment. Never commit the key.

Example only AFTER explicit approval, for a one-actor sample:

    node tools/voice-lines-generate.mjs --kind named_street_actor --limit 1 --generate --confirm-paid-batch --approved-budget-chars 300

That is a *character ceiling*, not a quoted AUD price or guaranteed remaining credit balance. Check the actual provider account quota and charges before approval. Paid output goes to voice-lines/generated directory with a local generated-manifest.json recording the actor, transcript, file SHA-256 and size. Generated audio is only a candidate for human listening and independent caption verification. The generator makes no automatic paid retries and never deploys or auto-maps speech to a different actor.

## Required next release phase

Only after actual generation and review: verify licence/actor/voice quality, exact transcript and SHA256, import approved assets into canonical local audio playback and subtitles, preserve stop/switch and user-gesture controls, test offline and failed recordings honestly (no hidden device TTS), run test and privacy gates, desktop/Android browser interactions and hosted game acceptance. Do not trigger earned quest/success sound without authoritative gameplay state. No new status should be marked as recorded before these steps pass.

Canonical source: joshualparris/JoshMemory/repository-town. The public Parris-Tech-Services/Repository-town repo is a generated mirror, not editable source.
