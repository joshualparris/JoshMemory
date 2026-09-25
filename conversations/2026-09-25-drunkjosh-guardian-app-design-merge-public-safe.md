# Conversation Archive — DrunkJosh / Guardian App Design and Merge

**Conversation began:** 2026-01-06  
**Archived:** 2026-09-25  
**Repo:** `joshualparris/JoshMemory`  
**Archive type:** Public-safe working summary  
**Project:** DrunkJosh / DrunkJosh Guardian / Sober Guardian  
**Reason for repo choice:** This conversation is primarily project-history and design context. No dedicated DrunkJosh repository is currently visible through the connected GitHub account, while JoshMemory already contains a reconstructed DrunkJosh session and a `conversations/` archive.

> Privacy note: The target repository is public. A raw verbatim transcript was not published because the conversation contains personal and family context. This archive preserves the app requirements, prompts, implementation decisions, technical direction, and product evolution while omitting private details that are not necessary to continue the project.

---

## 1. Original idea: “DrunkJosh”

Josh asked for a prompt for an app called **DrunkJosh**.

The initial concept was a calm, protective version of Josh that appears when the user is tired, emotional, overstimulated, or affected by alcohol.

Its job is to protect the user’s:

- future self
- close relationships
- faith and values
- reputation
- finances
- next-day judgement

The core behaviour was:

- be kind, firm, and slow
- use short, simple language
- avoid big plans and deep debates
- never escalate conflict
- delay emotionally charged messages, purchases, posts, promises, and major decisions
- encourage water, food, rest, sleep, grounding, and writing notes instead of acting immediately
- default to the principle: **“Sleep first. Decide later.”**

Suggested copy included lines such as:

- “That can wait till tomorrow.”
- “Future Josh will thank you.”
- “Hydrate. Sit. Breathe.”
- “Write it down, don’t send it.”

Every response should end with **one clear next step**.

---

## 2. Prompt 2: Contain and hand over to Morning Josh

The second concept reframed DrunkJosh as a temporary steward whose job is to:

1. contain damage
2. reduce stimulation
3. hand unresolved thoughts safely to “Morning Josh”

The prime directive was that nothing important should be decided, sent, bought, promised, or fixed while judgement is impaired.

The app should block or discourage:

- emotionally charged messaging
- arguments
- impulsive shopping
- social posting
- over-planning
- late-night “fix everything” behaviour

It should allow:

- “For Tomorrow” notes
- grounding actions
- water / shower / bed
- simple reassurance
- a structured morning handover

The handover format was:

- what felt big
- what should be reviewed later
- a short reassurance

---

## 3. First production build prompt

The initial high-detail build prompt specified a production-quality, mobile-first web app.

### Required screens

- Home
- Check-in
- Flow / plan screen
- For Tomorrow note
- Morning Handover
- Settings
- History
- Emergency / SOS

### Initial technical stack

- Vite
- React
- TypeScript
- React Router in the first specification
- Tailwind CSS
- Zustand preferred for shared state
- localStorage persistence
- no backend required
- no external API calls
- offline-friendly

Later inspection showed the actual implementation used **wouter**, and subsequent prompts explicitly kept wouter rather than migrating routing libraries.

### Home flow options

The app should include large buttons for states or urges such as:

- wanting to message someone
- wanting to buy something
- wanting to post online
- anger
- shame
- temptation
- inability to sleep
- needing to dump thoughts

### Check-in

Before a flow, the app should collect a lightweight check-in:

- impairment slider, 0–10
- current emotion
- current urge
- current time
- whether alcohol was involved
- whether the user is safe

A deterministic risk score from 0–100 should be calculated locally.

Example weighting proposed:

- impairment × 7
- alcohol +15
- angry +15
- tempted +20
- after 10 pm +15
- unsafe +20
- capped at 100

### Rules engine

A deterministic function was requested:

`getPlan(input): { message, nextStep, suggestedActions, severity }`

General rules:

- high risk should produce firmer copy
- message / purchase / post urges should be redirected toward delaying and writing a note
- anger should produce a time-out / no-texting plan
- temptation should produce trigger removal, movement, note-taking, and sleep
- unsafe status should route immediately to emergency help

---

## 4. For Tomorrow notes

The note screen was designed around structured fields:

- What feels big right now?
- What do I want to do?
- Why does it feel urgent?
- What is the smallest wise step for tomorrow?
- Optional draft message, clearly labelled as not for sending tonight

Each note should include:

- timestamp
- flow type
- risk score
- handled / unhandled status

After saving, the user should move toward the Morning Handover.

---

## 5. Morning Handover

The Morning Josh screen should show notes newest-first.

Each note should expose:

- date/time
- risk badge
- flow type
- expandable contents
- mark handled
- edit
- copy/export
- delete

A local, non-AI summary should show:

- note count
- highest risk
- short heuristic summary

Later UI feedback added:

- a better empty state
- “Start a check-in” CTA
- “Write a note anyway” CTA
- an unread / unhandled badge on the Handover navigation item

---

## 6. History and settings

### History

Every completed check-in should create a local session record containing:

- timestamp
- flow type
- risk score
- selected inputs

Filtering should be possible by flow and risk bucket.

### Settings

Settings requirements evolved to include:

- Hard Mode
- after-10pm lockdown prompts
- trusted contacts
- optional passcode
- emergency number
- region
- PWA install prompt preference
- data export
- data import
- reset data

---

## 7. Learning discussion: Zustand and React

Josh asked what Zustand is.

It was explained as a lightweight React state manager that provides a shared store across components without heavy Redux-style boilerplate.

Why Zustand suited DrunkJosh:

- shared state across multiple screens
- selective subscriptions
- small API
- easy localStorage persistence
- clean place for notes, sessions, settings, and lockdown state

A minimal store example was discussed using `create()`, state values, and actions.

Josh then asked what React is.

React was explained as a JavaScript library for building interfaces from reusable components. State changes cause the relevant UI to update.

For DrunkJosh:

- pages are React components
- buttons and cards are reusable components
- state holds sessions / notes / settings
- a router handles screen navigation
- Zustand can own shared state

Josh also asked who created React. The answer identified **Jordan Walke**, who created React while at Facebook.

---

## 8. Phase 2: Lockdown, PWA, tests, deployment

A second detailed Codex / Replit prompt added four major areas.

### A. Lockdown mode

Lockdown could be triggered manually or suggested for high-risk sessions.

Selectable durations:

- 15 minutes
- 30 minutes
- 60 minutes
- 120 minutes

While active:

- settings should be unavailable
- history should be unavailable
- export should be unavailable
- draft-message functionality should be unavailable
- only explicitly safe routes should remain reachable

The Lockdown page should show:

- large remaining-time display
- Water
- Shower
- Bed
- Write a For Tomorrow note
- Emergency / I’m not safe
- the line: **“Nothing important gets decided right now.”**

Lockdown state should persist locally:

- startTime
- durationMinutes
- active
- endedAt

An event log should record interaction events.

### B. Installable PWA

Requested:

- `vite-plugin-pwa`
- manifest
- DrunkJosh app name / short name
- icons
- cached app shell
- offline use
- optional install banner controlled from Settings

### C. Tests

Requested:

- Vitest
- React Testing Library
- risk score tests
- low / medium / high rules-engine tests
- lockdown route-block test
- Playwright or Cypress end-to-end flow:
  - home
  - check-in
  - save note
  - verify handover

### D. Deployment docs

README should cover:

- Replit
- local development
- build / preview
- Vercel deployment
- unit tests
- end-to-end tests
- export / import
- Android PWA install
- iOS PWA install

---

## 9. App review from project files and screenshots

Two DrunkJosh project ZIPs and screenshots were reviewed during the conversation.

The main flow was judged to be strong:

**Home → Check-in → Plan → Note → Morning Handover**

Positive points included:

- consistent dark UI
- large touch targets
- clear Home choices
- prominent Lockdown entry
- simple bottom navigation
- good local-first architecture
- useful structured handover concept

Important problems identified:

1. Emergency calling was set to **911** in one build and needed to default to **000** for Australia.
2. Lockdown could be bypassed by manually navigating to routes such as Settings or Handover.
3. Safety status needed to override all risk-score logic.
4. Timer and grounding interactions were still placeholders using `alert()`.
5. PWA support needed a proper manifest and service worker.
6. Early Lockdown exit used `confirm()` instead of a real press-and-hold or passcode interaction.

---

## 10. Hardening prompt

A detailed hardening prompt was produced for the existing implementation.

### Global Lockdown guard

Create a reusable central route guard.

When Lockdown is active, only safe routes should be allowed, for example:

- /lockdown
- /emergency
- /note
- /flow

All other navigation should redirect to /lockdown using an effect rather than redirecting during render.

### Emergency number

- default to `000`
- read the number from Settings
- make it configurable
- optionally include:
  - Lifeline 13 11 14
  - Beyond Blue 1300 224 636

### Safety override

`!safe` should be checked **before** risk thresholds in the rules engine.

### Timer and grounding

Replace `alert()` with actual UI:

- 20-minute cooldown timer
- pause / cancel
- grounding flow using 5-4-3-2-1 senses

### Hold-to-exit

Replace `confirm()` with:

- genuine 10-second hold interaction
- visible progress
- cancel on early release
- passcode exit when configured

---

## 11. Phase 3: Personalisation, safe templates, insights, polish

The next major development prompt proposed four areas.

### A. Personalisation and onboarding

First launch should collect:

- display name
- timezone
- region
- emergency number
- trusted contacts
- optional accountability contact

Region-specific emergency defaults were proposed.

The app should remain account-free and local-first.

### B. Safe message templates

A Templates feature would help produce calm messages without making immediate sending easy.

Template categories included:

- repair
- accountability check-in
- work-safe message
- family logistics
- boundary without blame

The user can fill structured fields and preview a final message.

Guardrails:

- no auto-send
- high-risk / Lockdown / late-night conditions add a cooldown before copy
- option to save the draft into Handover instead

### C. Offline insights

An Insights screen should derive local summaries from stored sessions and events:

- check-ins over the last 7 days
- highest risk
- most common flow
- time-of-day buckets
- top trigger categories
- Lockdown usage
- most-used Lockdown action
- gentle safe-day streak

No chart library is required; simple CSS bars are enough.

### D. UI polish

- Handover badge
- better empty state
- stronger text contrast
- consistent spacing
- route guard enforcement everywhere
- no remaining alert / confirm placeholders

---

## 12. Claude context pack

Josh asked for a large context prompt so Claude could continue the project with minimal explanation.

The context pack told Claude:

- the app is a protective, harm-reduction style personal tool
- the tone should be calm, short, firm, slightly cheeky, and non-preachy
- friction is intentional
- impulsive actions should be delayed
- the product should favour writing, grounding, hydration, sleep, and next-day review
- no accounts
- no cloud sync
- no automatic messaging
- no external-model API dependency
- keep dependencies light
- prefer small, maintainable, PR-sized changes

Personal details that were included in the original conversational prompt have been intentionally omitted from this public archive.

---

## 13. Two-app comparison

Later in development there were two related applications.

### Drunk-Josh-Guardian

Its strength was the **protective workflow**:

- Home
- Check-in
- rules engine
- Plan
- For Tomorrow note
- Morning Handover
- Lockdown
- Emergency
- History
- Settings

It was the stronger base architecture.

### Sober-Guardian / toolbox app

Its strength was a set of **optional tools**:

- ExTexter
- Reaction Game
- Wisdom
- Sober Up checklist

It had more playful, lightweight interactions.

---

## 14. Merge plan

The recommended merge strategy was:

**Use Drunk-Josh-Guardian as the base and port Sober-Guardian’s tools into it.**

The unified app should contain both:

1. the structured guardian flow
2. a safe optional Tools hub

Proposed routes:

- /tools
- /tools/reaction
- /tools/wisdom
- /tools/sober-up
- /tools/ex-texter

The tools should be converted to local-only behaviour.

### Backend removal

Any server-backed tool behaviour should be replaced with local state:

- local wisdom strings
- local reaction scores
- local drafts
- local events

React Query and server routes should be removed if no longer needed.

### Tool integration

The Flow screen could offer cooldown tools:

- Timer
- Grounding
- Reaction Game
- Wisdom
- Sober Up

At high risk, Lockdown should be emphasised and stimulating tools should be hidden behind extra friction or disabled.

### Unified event log

Tool activity could record:

- tool_opened
- tool_completed
- score_saved
- wisdom_next
- soberup_checked

---

## 15. Later state of the two apps

A later review found that the projects had moved closer together but still had different centres of gravity.

### Drunk-Josh-Guardian remained strongest at

- check-in → plan → handover flow
- risk scoring
- rules engine
- timed Lockdown
- local persistence
- tests

Remaining issues included:

- incorrect emergency number in one branch
- unsafe-state ordering
- old confirm-based Lockdown exit

### Sober-Guardian remained strongest at

- Tools hub
- Reaction Game
- Wisdom
- Sober Up
- Ex-Texter
- Settings-driven emergency number

The final recommendation remained:

- keep Drunk-Josh-Guardian as the backbone
- import Sober-Guardian tools
- use one router
- use one Zustand store
- use one localStorage namespace
- enforce one global Lockdown guard
- default Australian emergency calling to 000
- remove server dependencies
- keep the UI visually consistent

---

## 16. Current consolidated product direction

The intended unified product is a mobile-first, offline-first personal guardian app with two layers.

### Guardian layer

Used when judgement is impaired or emotions are running high:

- check-in
- local risk score
- deterministic plan
- Lockdown
- grounding
- timer
- emergency
- For Tomorrow note
- Morning Handover

### Tools layer

Optional low-stakes support:

- ExTexter
- Wisdom
- Sober Up
- Reaction Game where appropriate

### Product principles

- Friction is a feature.
- Delay irreversible actions.
- Capture thoughts without acting on them.
- Safety overrides scoring.
- Lockdown cannot be bypassed by direct navigation.
- Avoid shame-based copy.
- Keep the app useful offline.
- One next step is better than a long lecture.
- The app is a practical tool, not a therapist.
- Important decisions can wait until judgement is clearer.

---

## 17. Technical direction to preserve

Current preferred architecture:

- Vite
- React
- TypeScript
- wouter
- Tailwind
- Zustand
- Zustand persist / localStorage
- deterministic rules engine
- PWA
- Vitest / React Testing Library
- Playwright or equivalent for minimal end-to-end coverage
- no backend required
- no auth
- no external API calls for core functionality

Recommended data objects:

- CheckIn
- Session
- Note
- Settings
- LockdownState
- Event
- TemplateDraft
- ReactionScore if Reaction Game remains

Recommended local storage namespace:

`guardian:v1:*` or a consistently migrated `drunkjosh:v1:*`

---

## 18. Suggested next implementation checkpoint

When development resumes, inspect the current merged repository before adding more features.

Priority order:

1. Verify which app is now the canonical source.
2. Ensure Emergency defaults to 000.
3. Ensure unsafe status overrides all scoring logic.
4. Verify global Lockdown route protection.
5. Remove any remaining `alert()` / `confirm()` placeholders.
6. Confirm timed Lockdown persists correctly across refreshes.
7. Confirm Handover state persists.
8. Confirm Tools are using local-only data.
9. Run TypeScript checks and unit tests.
10. Run the full mobile flow manually:
   Home → Check-in → Plan → Note → Handover → Lockdown → Emergency → Tools.
11. Only then add further personalisation or insights features.

---

## Final project summary

DrunkJosh started as a humorous prompt for a “wise future-self guardian” and evolved into a serious offline-first React application for creating friction around impulsive decisions.

Its strongest design idea is not the name or the humour. It is the workflow:

**notice state → assess risk → delay action → capture thought → regulate → hand it to tomorrow**

The Sober-Guardian tools add useful variety, but the Guardian workflow should remain the centre of the product.
