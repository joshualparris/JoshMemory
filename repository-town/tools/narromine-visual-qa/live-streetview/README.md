# Narromine live Street View vs Repository Town (local visual QA)

This **development-only**, local, side-by-side comparison viewer displays an official Google
Street View JavaScript panorama next to the already-built Repository Town game. No Google
images, tiles, pixels or snapshots are stored or exported.

## Prerequisites and run

Run on Fedora, in the repository's \`repository-town/\` directory:

\`\`\`bash
npm ci
node tools/build.mjs
node tools/narromine-visual-qa/live-streetview/server.mjs
\`\`\`

Open **http://127.0.0.1:8092/_streetview/** on the Fedora computer. The local server binds
only to \`127.0.0.1\`. It serves \`dist/public\` at \`/\` and the comparison page at
\`/_streetview/\`. Game code and models remain untouched.

In Google Cloud, use the **streetviewNarromine** project (\`streetviewnarromine\`):

1. Enable the **Maps JavaScript API** and link billing.
2. Create a **browser-restricted** API key (do **not** create an unrestricted server key).
3. Restrict HTTP referrers to \`http://127.0.0.1:8092/*\` (add \`http://localhost:8092/*\`
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
and constructs **exactly one** \`StreetViewPanorama\` object. It reuses that object when
moving to another landmark, thereby avoiding a new panorama instantiation per selection.

The UI logs the SDK load, import, panorama creation and user-initiated viewer operations.
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

\`\`\`bash
node --check tools/narromine-visual-qa/live-streetview/app.js
node --check tools/narromine-visual-qa/live-streetview/server.mjs
node --check tools/narromine-visual-qa/live-streetview/presets.mjs
node tests/narromine-live-streetview.mjs
node tools/check_privacy.mjs
\`\`\`

The Playwright test mocks Google's SDK to ensure **zero real Google API calls**. It
asserts that the page starts with no network requests to Google, then that one
consented simulated panorama creation is logged at its first-tier price, that a second
landmark doesn't instantiate a second panorama, and that notes/export omit the key.

Actual Google authentication, account billing, panorama availability and display
must additionally be verified on Fedora with the user's browser-restricted key.
