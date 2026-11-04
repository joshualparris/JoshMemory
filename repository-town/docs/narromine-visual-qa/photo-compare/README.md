# Narromine Real-World Photo Matching & Live Coordinate-Synced Street View Workspace

This subsystem extends the Narromine Visual QA system (`tools/narromine-visual-qa/`) into an interactive side-by-side photographic & live Google Street View comparison workspace with **exact bidirectional coordinate synchronization**, **transparent per-call Google Maps API cost tracking**, and an **evidence-grounded Architectural Discrepancy Register**.

---

## 1. Exact Bidirectional Coordinate Projection (`geo-sync.mjs`)

Repository Town's Narromine environment is anchored to the OpenStreetMap export origin in [`src/world/narromine-layout.js`](../../../src/world/narromine-layout.js):
- **Anchor (`NARROMINE_GEO_ANCHOR`):** `lat = -32.2404574`, `lon = 148.2597315`
- **World Offset (`NARROMINE_WORLD_OFFSET`):** `x = -2870 m`, `z = -7 m`
- **Earth Radius:** `6,371,008.8 m` (`cos(anchor.lat) ≈ 0.845818566`)

### Conversion Formulas
- **WGS84 `(lat, lon)` → Repository Town `(x, z)`:**
  - `x = -2870 + (lon - 148.2597315) * (π / 180) * 6371008.8 * cos(-32.2404574°)`
  - `z = -7 - (lat - (-32.2404574)) * (π / 180) * 6371008.8`
- **Repository Town `(x, z)` → WGS84 `(lat, lon)`:**
  - `lat = -32.2404574 - (z - (-7)) / ((π / 180) * 6371008.8)`
  - `lon = 148.2597315 + (x - (-2870)) / ((π / 180) * 6371008.8 * cos(-32.2404574°))`
- **Compass Heading (`0° = N, 90° = E, 180° = S, 270° = W`) ↔ Game `yaw` (radians):**
  - `yaw = -(headingDeg * π / 180)`
  - `headingDeg = ((-yaw * 180 / π) % 360 + 360) % 360`

---

## 2. Google Maps Street View API Per-Call Cost Transparency

Every time a Google Maps API call is made in the workspace, the sticky top bar flashes an immediate alert banner and records the call in the **API Call-by-Call Cost Ledger**:

| Operation | Google Maps Platform SKU | Official Billed SKU Cost | Worst-Case Per-Jump Estimate |
| --- | --- | --- | --- |
| `maps_js_script_load` | Maps JS Bootstrap Script | `$0.0000 USD` (`$0.0000 AUD`) | `$0.0000 USD` (`$0.0000 AUD`) |
| `streetview_panorama_instantiate` | Dynamic Street View (`$14.00 / 1,000`) | **`$0.0140 USD` (`~$0.0215 AUD`)** | **`$0.0140 USD` (`~$0.0215 AUD`)** |
| `streetview_set_position` / `pano_changed` | Dynamic Street View Position Update | `$0.0000 USD` (in-session) | **`$0.0140 USD` (`~$0.0215 AUD`)** |
| `streetview_set_pov` | Client-Side Panorama Orientation | `$0.0000 USD` | `$0.0000 USD` |
| **External Google Maps Tab Button** | Standard Browser Link (`https://www.google.com/maps/@?api=1&map_action=pano...`) | **`$0.0000 USD` (FREE)** | **`$0.0000 USD` (FREE)** |

- **Manual Click-to-Call Default:** Moving the camera in Repository Town or dragging sliders updates the 3D game for **$0.0000 USD** and only calls the paid Google Street View API when you click **`⚡ Sync Street View API Now (+$0.0140 USD)`** (or if you explicitly enable the debounced **`Auto-Sync Street View`** checkbox).
- **Hard Session Budget Guard:** Defaults to `$0.50 USD` per session and blocks further paid calls if reached until raised by the user.
- **No Committed Secrets & No Google Pixel Extraction:** API keys are entered in volatile browser memory only (never committed to git), and side-by-side PNG exports intentionally exclude Google Street View pixels in compliance with Google Maps Platform Terms of Service.

---

## 3. Commands on Fedora Linux

```bash
cd repository-town

# 1. Build public/private bundles and verify privacy
node tools/build.mjs && node tools/check_privacy.mjs

# 2. Generate HUD-clean captures across all 8 priority Narromine locations + workspace report
node tools/narromine-visual-qa/photo-compare/run-photo-compare.mjs

# 3. Start the live same-origin comparison server (serves game + workspace at port 8096)
node tools/narromine-visual-qa/photo-compare/server.mjs --port 8096

# 4. Run automated unit & Playwright browser verification suite
node tests/narromine-visual-qa/photo-compare/photo-compare.mjs
```
