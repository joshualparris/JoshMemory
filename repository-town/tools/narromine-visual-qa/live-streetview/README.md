# Narromine live Street View vs Repository Town (local visual QA)

This **local or separately deployable**, side-by-side comparison viewer displays an official Google
Street View JavaScript panorama next to the already-built Repository Town game. No Google
images, tiles, pixels or snapshots are stored or exported.

## Prerequisites and run

Run on Fedora, in the repository's `repository-town/` directory:

```bash
npm ci
node tools/build.mjs
node tools/narromine-visual-qa/live-streetview/server.mjs
```

Open **http://127.0.0.1:8092/_streetview/** on the Fedora computer. The local server binds
only to `127.0.0.1`. It serves `dist/public` at `/` and the comparison page at
`/_streetview/`. Game code and models remain untouched.

In Google Cloud, use the **streetviewNarromine** project (`streetviewnarromine`):

1. Enable the **Maps JavaScript API** and link billing.
2. Create a **browser-restricted** API key (do **not** create an unrestricted server key).
3. Restrict HTTP referrers to `http://127.0.0.1:8092/*` (add `http://localhost:8092/*`
   only if you also use that host).
4. Restrict allowed API usage to **Maps JavaScript API**. No Street View Static API is required.
5. Use Google Cloud quotas/budgets to help control spend; Cloud Billing budget alerts are
   **not hard spending limits**.
6. Paste the browser key into the local comparison page, not into GitHub, ChatGPT or files.

**The tool makes no Google API request until you click Connect and approve the explicit
pricing confirmation.** The key is cleared from the text input after connection; it is
not stored or exported by this tool. Browser API keys are inherently visible to browser
developer tools and Google's request URL: security depends on strict referrer/API
restrictions.

## Usage, billing and exact-cost limitation

Published *global* pricing, checked 4 November 2026:

| SKU | Free usage | First paid tier |
|---|---|---|
| Dynamic Street View | 5,000 panorama-load events/month | US$14/1,000 = US$0.014 per successful load |
| Maps JavaScript API SDK loading without creating a Map or panorama | No separate panorama load | US$0 additional panorama event |
| Move, rotate or zoom *inside the same viewer* | No new panorama load | US$0 additional panorama event |

Sources:
- https://developers.google.com/maps/billing-and-pricing/pricing
- https://developers.google.com/maps/faq
- https://developers.google.com/maps/billing-and-pricing/sku-details

On explicit consent, the page loads Maps JavaScript API, imports the Street View library
and checks for real Google-collected panorama coverage at **75 m**, **200 m** and **500 m**
using `StreetViewService.getPanorama()` as needed. **Google explicitly states that
StreetViewService is not billed**; the viewer logs each metadata query at US$0.000.
Only if a real panorama ID is found does it construct **exactly one**
`StreetViewPanorama` object. It reuses that object when
moving to another landmark, thereby avoiding a new panorama instantiation per selection.

The UI logs the SDK load, import, each free availability lookup and its result, panorama creation and user-initiated viewer operations. A failed lookup shows a visible 500m coverage message instead of an empty viewer, and does not create a billable panorama.
The ledger persists **locally in this browser**, with no API key. It displays the
**published first-paid-tier potential cost in USD** for each billable event and cumulative
amount for loads observed in this browser.

**No client-side program can know the exact amount actually charged to the account per
API call**, because the remaining free cap, total cross-project monthly usage, negotiated
pricing, discounts, taxes and Google Cloud billing postings are not available to this
viewer. If the free cap applies, a successful panorama load costs US$0. Google Cloud
billing reports can be delayed; local ledger counts aren't a billing invoice.
Do not claim the displayed first-tier gross estimate is an exact settled charge.

The SDK may make internal network calls for imagery and data that the user-facing code
doesn't individually enumerate. Google's *billable Dynamic Street View load events*
are tied to panorama construction, not every internal HTTP request or camera rotation.

## Compare, annotate and export

1. Choose a landmark: Royal Hotel, Narromine Hotel, Post Office,
   Coles/Kierath's, Kierath's courtyard or Nymagee Street.
2. Connect the live Street View viewer (first and only panorama construction that
   this page performs for the current page session).
3. Move/rotate Street View using Google-provided controls with Google attribution
   visible. Choose **Match game to Street View heading** or **Match game to current
   panorama location** to set the camera in the existing game iframe. The latter
   refuses to teleport outside the mapped Narromine extent.
4. Hide the game HUD for uncluttered comparison (local iframe only), change game
   lighting as required, then add a note describing architectural differences.
5. Export notes/metadata and a local usage ledger as JSON. No Google imagery or
   API credential is included. The optional **game-only** PNG button captures
   the game's WebGL canvas and may be unavailable if the browser discards frames.

Street View panoramas can be missing, years apart from other evidence, or originate
from a nearby road rather than an exact surveyed camera position. Panorama metadata
and Google imagery should not be treated as survey-grade measurements. Corroborate
building dimensions and architectural correction specs with LiDAR, cadastre and
permissioned original photographs. This tool does not alter game building geometry,
photo catalogues, or other agents' landmark modules.

## Verification

```bash
node --check tools/narromine-visual-qa/live-streetview/app.js
node --check tools/narromine-visual-qa/live-streetview/server.mjs
node --check tools/narromine-visual-qa/live-streetview/presets.mjs
node tests/narromine-live-streetview.mjs
node tools/check_privacy.mjs
```

The Playwright test mocks Google's SDK to ensure **zero real Google API calls**. It
asserts that the page starts with no network requests to Google, then that one
consented simulated panorama creation is logged at its first-tier price, that a second
landmark doesn't instantiate a second panorama, and that notes/export omit the key.

Actual Google authentication, account billing, real panorama availability and display
must additionally be verified on Fedora with the user's browser-restricted key.

## Online Vercel deployment (separate from the family game's production project)

The deployable version uses the **same** comparison UI, but serves a static JSON
copy of the six camera presets in the built public bundle. The normal local
server continues to work without any change to existing gameplay or photos.

A dedicated Vercel project connects to `joshualparris/JoshMemory` with:

- Project root: repository root (leave the Vercel Root Directory unset), avoiding conflict with the family game's `repository-town/vercel.json`
- Install command: `cd repository-town && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --no-audit --no-fund`
- Build command: `cd repository-town && node tools/build.mjs && node tools/narromine-visual-qa/live-streetview/build-online.mjs`
- Output directory: `repository-town/dist/public`
- Framework: Other (static)
- Public comparison route: `/_streetview/index.html`
- Game route: `/` (same origin, so game camera matching works)

The static copy is intentionally **not** added to the main Repository Town
Vercel site's build command. The separate online project does not alter that
production configuration.

For online use, create a browser key **restricted to that dedicated project's
actual production hostname**, and restrict API usage to the Maps JavaScript API.
Never use an unrestricted key or put the browser key in source, Vercel's
public HTML, or documentation. Google Cloud API keys used client-side can be
inspected in browser network requests; allowed-host restrictions are essential.
The user enters the restricted key into the browser's form after opening the
online page and approves a cost disclosure before the first panorama loads.

**Security:** Any previously shared API key should be rotated and restricted
before using it online. Google Cloud billing budgets and alerts are not hard
spend caps. Set appropriate API quotas and review Cloud Billing's actual SKU
usage; the UI's cost ledger is only a first-tier estimate for this browser.


## Duplicate Google SDK and module-loader failure

For the online comparison's one-time Google connection, use Google's
**direct async script loader with `libraries=streetView` and an explicit
`callback`**, rather than using `script.onload` as an API-ready signal
and then importing `streetView`. The callback only fires after Google
has initialised its requested library. The app keeps a page-lifetime
Promise for the single SDK load, including any failure, so retrying
a missing panorama reuses the already-loaded API and a failed SDK load
requires a browser refresh instead of inserting a second script.

This addresses the Chrome errors:
- `You have included the Google Maps JavaScript API multiple times on this page`
- `Loader.provide not called by module 'streetview'`
- `Loader.provide not called by module 'util'`

The in-game view runs in its own same-origin iframe; its console messages
can appear in the same DevTools console even though it is a separate
JavaScript realm. Use the Console's frame selector to identify which
document produced an error.

Google source: https://developers.google.com/maps/documentation/javascript/load-maps-js-api

An actual authenticated Google panorama still needs a restricted key
entered by the user; CI intercepts the SDK request and does not make paid
Google API calls.
