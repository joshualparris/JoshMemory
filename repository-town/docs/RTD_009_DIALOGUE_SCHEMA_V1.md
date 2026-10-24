# RTD-009 — NPC dialogue schema v1 (source + test contract)

**Date:** 24 October 2026 (Australia/Sydney) | **Owner:** RTD-009 | **Acceptance:** RTAC-003 (schema shape only).  
**Source:** [`src/dialogue/schema.js`](../src/dialogue/schema.js)  
**Regression:** `node tests/dialogue-schema.mjs` (included in `npm run test:release` → `npm run build:release`).  
**Canonical source:** `joshualparris/JoshMemory/repository-town/`, not the generated `Parris-Tech-Services/Repository-town` site.

## Scope and lifecycle

Version 1 is a **pure structured-data contract**. It defines the fields needed to author actor-specific, Skyrim-*inspired* dialogue trees without importing DOM, Three.js, WebAudio, remote AI, private repository text, credentials, or live game-state APIs.

The module exports `DIALOGUE_SCHEMA_VERSION = 1`, immutable topic/condition/action ID catalogues, `validateDialogueDefinition(definition, options)` returning `{ok, errors:[{path,code,description}]}`, and `assertDialogueDefinition(definition, options)` which throws a `TypeError` when invalid. Both are **non-mutating** and do **not** run game actions, fetch network resources or perform playback. Every type is a plain JSON object; unknown object properties and callable/accessor injections are rejected.

This is **not** the future RTD-011 DialogueDirector, nor full RTD-012 link/reachability/cycle graph validation. `startNode` and `nextNode` must have well-formed IDs but the validator deliberately does not yet check that a referenced node exists, that all nodes are reachable or that branch cycles are legal. It also does not verify a VoiceBank ZIP, SHA-256 or real recording transcript (RTD-042/043). Do not treat mock test recordings as approved audio.

## Data model and required fields

| Object | Required | Optional / rules |
|---|---|---|
| **DialogueDefinition** | `schemaVersion:1`, `actorKey`, `startNode`, `nodes:[]` | `displayName` for visible UI only; never use display name as identity |
| **Node** | `id`, `topic`, `priority`, `conditions:[]`, `choices:[]` | All fields explicit; zero choices permissible for a terminal authored scene |
| **Choice** | `id`, `label`, `priority`, `conditions:[]`, `response`, `nextNode`, `effects:[]` | `nextNode:null` means exit; positive and negative priorities -100…100 |
| **Condition** | `type` + typed type-specific fields | `not:boolean`, `onUnknown:'deny'` (unknown state MUST NOT enable a choice) |
| **Response** | `kind:'none'` OR `kind:'text'` and `text` OR `kind:'recorded'` and `clip` | No separate fabricated subtitle text is permitted beside the recorded clip |
| **Clip** | `provider:'voicebank-game300'`, `actorKey`, `event`, `clipId`, `transcript` | `sha256` lowercase 64-char hex optional until full RTD-043 manifest verification; provider `fixture` accepted only with explicit `allowFixtureClips:true` in tests |
| **Authorised effect descriptor** | `actionId` and **only** that action's typed fields | A *request*, not execution of world/game state; later game adapter must check conditions, authority and idempotency |

**Namespaced actor key syntax:** `named:rowan`, `worker:27`, `resident:A8`. Syntactic acceptance alone does not prove an actor really exists in the canonical roster: see [RTD-003's actor inventory](NPC_POPULATION_INVENTORY_2026-10-24.json). Name collision between named Rowan and a worker called Rowan must not merge IDs (RTD-010).

**Topics:** `introduction`, `news`, `directions`, `work`, `relationship`, `quest`, `trade`, `help`, `story`, `explore`, `farewell`.

**Read-only condition types:** `flag` (flag + boolean equals), `quest-stage` (questId, eq/gte/lte, numeric stage), `inventory-at-least` (itemId, quantity), `money-at-least` (amount), `location-visited` (placeId), `time-window` (startMinute/endMinute 0–1439; may span midnight), `relationship-at-least` (actorKey, -100…100 threshold), `worker-on-duty` (worker key), `shop-open` (placeId), `npc-near` (actor key and finite 0–100m radius). This is only the **shape** of a predicate; reading real time/jobs/social state is RTD-022.

**Allowlisted effect action IDs:** `quest.accept`, `quest.advance`, `quest.complete`, `dialogue.flag.set`, `repair.offer`, `trade.offer`, `relationship.propose`. Each requires its narrowly typed target fields (e.g. `questId`, `toStage`; `flag` + boolean; `itemId` or `serviceId`; or a valid actor key and bounded nonzero `delta`). An extra `script`, JS callback, arbitrary object or unknown action is rejected. No effect in this module grants an actual reward, charges money, completes a quest, alters relationships or implies success speech. RTD-024–032 must enforce all authorised game mutations.

**Allowed recorded events:** the present Game300 event set `greeting`, `help`, `explore`, `ambient`, `quest`, `choice`, `surprise`, `farewell`, plus future *conditionally earned* `success`/`retry`. Including an event in schema is **not permission to play it without authoritative confirmed result**.

## Illustrative JSON definition — no verified MP3 claimed

This example deliberately uses only authored **text**. It is valid schema data for a named character but not deployed NPC dialogue or a recorded line:

```json
{
  "schemaVersion": 1,
  "actorKey": "named:rowan",
  "displayName": "Rowan",
  "startNode": "intro",
  "nodes": [
    {
      "id": "intro",
      "topic": "introduction",
      "priority": 20,
      "conditions": [{"type": "location-visited", "placeId": "town-square", "not": true, "onUnknown": "deny"}],
      "choices": [
        {
          "id": "ask-directions",
          "label": "Could you give me directions?",
          "priority": 10,
          "conditions": [{"type": "time-window", "startMinute": 420, "endMinute": 1320}],
          "response": {"kind": "text", "text": "This text is a schema example, not an ElevenLabs recording."},
          "nextNode": null,
          "effects": [{"actionId": "dialogue.flag.set", "flag": "asked-rowan-directions", "value": true}]
        }
      ]
    }
  ]
}
```

This `effects` entry is a *descriptor only*. Until the future authorised effect executor is written, no memory flag is set by selecting a choice. Likewise, `onUnknown:'deny'` is a schema policy; real conditional evaluation is not implemented here.

**Recorded response shape** (mock-only; must not ship without verified actual file): `{"kind":"recorded","clip":{"provider":"voicebank-game300","actorKey":"named:rowan","event":"help","clipId":"<verified-manifest-id>","transcript":"<verified-exact-recorded-words>"}}`. A browser must obtain its subtitle from verified VoiceBank data, not from an unreviewed authored substitution. The test fixture instead uses `provider:'fixture'` and must pass `allowFixtureClips:true`; the production default rejects it.

## RTAC-003 verification and future boundaries

`tests/dialogue-schema.mjs` validates representative **named street**, **worker** and **coordinate-house resident** actors; authored nodes, choices, priority, topics, all effect action IDs and typed conditions. It tests malformed versions, unknown fields, invalid IDs, wrong speaker, disallowed fixture provider, bad transcript/hash, non-finite priorities, invalid predicate/condition, attempt to inject arbitrary script or effect, invalid value bounds and accessor-object rejection. Tests assert inputs are immutable and no game state is affected. Future RTD-012 tests will check duplicate IDs, missing `nextNode` links, unreachable nodes and cycles; **those cases intentionally remain OPEN**.

- **RTD-009 acceptance:** schema and negative contract tests committed, registered in `npm run test:release`, release/privacy/CI pass on exact PR head, reviewed branch and merged.
- **RTD-010:** prove actor identity resolves against live population; still open.
- **RTD-011/012:** implement actual deterministic director + graph integrity checks, still open.
- **RTD-022–032:** read simulation facts and execute authorised/idempotent quest/repair/purchase actions, still open.
- **RTD-042–054:** actually verify recorded MP3 metadata and exact actor captions, still open.
- **RTD-089–093:** stage, playtest hosted game, promote, verify mirror release and record evidence, still open.
