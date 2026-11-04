// Generates the interactive Narromine Real-World Photo Matching & Live Coordinate-Synced
// Street View Comparison Workspace HTML (works both offline with embedded/local captures
// and live alongside Repository Town + Google Maps Street View API with per-call cost tracking).
import fs from 'node:fs';
import path from 'node:path';
import { STREET_VIEW_API_PRICING } from './geo-sync.mjs';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Converts a local image file into a base64 data URI if it exists and is under maxBytes,
 * or returns a relative path so offline HTML reports display genuine local reference photos.
 */
function resolveImageSrc(absPath, relFallback, embedBase64 = true, maxBytes = 2_500_000) {
  if (!absPath || !fs.existsSync(absPath)) return relFallback || null;
  if (!embedBase64) return relFallback;
  try {
    const stat = fs.statSync(absPath);
    if (stat.size > maxBytes) return relFallback;
    const ext = path.extname(absPath).toLowerCase();
    const mime =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
        ? 'image/webp'
        : 'image/png';
    const b64 = fs.readFileSync(absPath).toString('base64');
    return `data:${mime};base64,${b64}`;
  } catch {
    return relFallback;
  }
}

export function generatePhotoCompareWorkspaceHtml({
  manifest,
  locations,
  provenance,
  backlog,
  outDir,
  liveGameUrl = '../index.html',
  embedLocalReferences = true,
}) {
  // Prepare location payload with resolved screenshot paths and local reference photos
  const enrichedLocations = locations.map((loc) => {
    const locCaptures = (manifest?.captures || []).filter((c) => c.locationId === loc.id);
    const desktopMidday =
      locCaptures.find((c) => c.viewport === 'desktop' && c.lighting === 'midday') ||
      locCaptures.find((c) => c.viewport === 'desktop') ||
      locCaptures[0] ||
      null;

    const provRecords = (provenance?.records || []).filter((r) => r.locationId === loc.id);
    const localVerifiedRecord = provRecords.find((r) => r.localExists && r.resolvedLocalPath);

    let localRefDataUri = null;
    if (localVerifiedRecord && localVerifiedRecord.resolvedLocalPath) {
      const relFromOut = outDir
        ? path.relative(outDir, localVerifiedRecord.resolvedLocalPath).split(path.sep).join('/')
        : localVerifiedRecord.relativePath;
      localRefDataUri = resolveImageSrc(
        localVerifiedRecord.resolvedLocalPath,
        relFromOut,
        embedLocalReferences
      );
    }

    const capturesByKey = {};
    for (const c of locCaptures) {
      capturesByKey[`${c.viewport}__${c.lighting}`] = {
        id: c.id,
        viewport: c.viewport,
        lighting: c.lighting,
        timeLabel: c.timeLabel,
        relativePath: c.image?.relativePath || `screenshots/${c.id}.png`,
        camera: c.camera,
        metrics: c.metrics,
      };
    }

    const locDiscrepancies = (backlog?.discrepancies || []).filter((d) => d.locationId === loc.id);

    return {
      ...loc,
      defaultScreenshot: desktopMidday
        ? desktopMidday.image?.relativePath || `screenshots/${desktopMidday.id}.png`
        : null,
      capturesByKey,
      provenanceRecords: provRecords,
      localReferencePhoto: localVerifiedRecord
        ? {
            id: localVerifiedRecord.id,
            filename: localVerifiedRecord.originalFilename,
            captureDate: localVerifiedRecord.captureDate,
            source: localVerifiedRecord.source,
            licence: localVerifiedRecord.licenceOrPermission,
            viewType: localVerifiedRecord.viewType,
            matchingConfidence: localVerifiedRecord.matchingConfidence,
            src: localRefDataUri,
          }
        : null,
      discrepancies: locDiscrepancies,
    };
  });

  const payloadJson = JSON.stringify({
    generatedAt: manifest?.generatedAt || new Date().toISOString(),
    git: manifest?.git || { commitSha: 'unknown', shortSha: 'unknown', branch: 'unknown' },
    pricing: STREET_VIEW_API_PRICING,
    liveGameUrl,
    locations: enrichedLocations,
    provenanceSummary: provenance?.summary || {},
    provenanceRecords: provenance?.records || [],
    backlogSummary: backlog?.summaryCounts || {},
    highestPriorityBuilding: backlog?.highestPriorityBuilding || null,
    discrepancies: backlog?.discrepancies || [],
  }).replace(/</g, '\\u003c');

  const highest = backlog?.highestPriorityBuilding;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Narromine Real-World Photo Matching &amp; Live Coordinate-Synced Street View Workspace</title>
  <style>
    :root {
      --bg: #0b1017;
      --panel: #131b26;
      --panel-alt: #182332;
      --border: #28374d;
      --text: #e7eef8;
      --muted: #98abc4;
      --accent: #38bdf8;
      --accent-strong: #0284c7;
      --pass: #22c55e;
      --warn: #f59e0b;
      --fail: #ef4444;
      --cost-bg: #2a1805;
      --cost-border: #f59e0b;
      --cost-flash: #dc2626;
    }
    * { box-sizing: border-box; }
    html {
      scroll-padding-top: 150px;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
    }
    /* ── Sticky API Call & Cost Meter Top Bar ── */
    .api-cost-topbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: linear-gradient(90deg, #1b1307 0%, #271907 50%, #17202e 100%);
      border-bottom: 2px solid var(--cost-border);
      padding: 0.55rem 1rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.65rem;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55);
    }
    @media (max-width: 768px) {
      .api-cost-topbar {
        position: relative;
      }
    }
    .api-cost-topbar.flash-active {
      background: linear-gradient(90deg, #5c0f0f 0%, #7f1d1d 50%, #3b1307 100%);
      border-bottom-color: #f87171;
    }
    .cost-ledger-pills {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    .cost-pill {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(245, 158, 11, 0.5);
      border-radius: 6px;
      padding: 0.25rem 0.6rem;
      font-size: 0.8rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      color: #fde68a;
    }
    .cost-pill strong {
      color: #ffffff;
    }
    .cost-pill.zero-cost {
      border-color: rgba(34, 197, 94, 0.55);
      color: #bbf7d0;
    }
    .api-call-live-banner {
      width: 100%;
      background: #451a03;
      border: 1px solid #f59e0b;
      color: #fef3c7;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .api-call-live-banner.called {
      background: #7f1d1d;
      border-color: #fca5a5;
      color: #ffffff;
      animation: pulseCall 0.55s ease-out;
    }
    @keyframes pulseCall {
      0% { transform: scale(1.01); background: #dc2626; }
      100% { transform: scale(1); background: #7f1d1d; }
    }
    .container {
      max-width: 1680px;
      margin: 0 auto;
      padding: 1rem 1.25rem 3rem;
    }
    header.workspace-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }
    h1 {
      margin: 0 0 0.25rem 0;
      font-size: 1.45rem;
    }
    h2 {
      margin: 0 0 0.65rem 0;
      font-size: 1.12rem;
    }
    .subtitle {
      color: var(--muted);
      font-size: 0.88rem;
    }
    .btn {
      background: var(--panel-alt);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.4rem 0.75rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      text-decoration: none;
    }
    .btn:hover {
      border-color: var(--accent);
      background: #1e2d42;
    }
    .btn-primary {
      background: var(--accent-strong);
      border-color: var(--accent);
      color: #fff;
    }
    .btn-cost {
      background: #9a3412;
      border-color: #f97316;
      color: #ffedd5;
    }
    .btn-cost:hover {
      background: #c2410c;
    }
    .btn-free {
      background: #14532d;
      border-color: #22c55e;
      color: #dcfce7;
    }
    /* ── Location Selector Bar ── */
    .location-tabs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
      gap: 0.45rem;
      margin-bottom: 1rem;
    }
    .loc-tab {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem 0.65rem;
      text-align: left;
      color: var(--text);
      cursor: pointer;
      transition: all 0.12s ease;
    }
    .loc-tab:hover {
      border-color: var(--accent);
    }
    .loc-tab.active {
      background: #162c46;
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .loc-tab-title {
      font-weight: 700;
      font-size: 0.83rem;
      display: block;
    }
    .loc-tab-sub {
      font-size: 0.73rem;
      color: var(--muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    /* ── Workspace Grid ── */
    .workspace-main {
      display: grid;
      grid-template-columns: 1fr 370px;
      gap: 1rem;
      align-items: start;
    }
    .workspace-main > * {
      min-width: 0;
    }
    @media (max-width: 1200px) {
      .workspace-main {
        grid-template-columns: 1fr;
      }
    }
    .viewer-card, .control-card, .section-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.9rem;
      margin-bottom: 1rem;
    }
    .viewer-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border);
    }
    .mode-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
    }
    .mode-btn.active {
      background: var(--accent-strong);
      border-color: var(--accent);
      color: #fff;
    }
    /* ── Dual Side-by-Side Comparison Stage ── */
    .comparison-stage {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      position: relative;
    }
    .comparison-stage.single-stage {
      grid-template-columns: 1fr;
    }
    @media (max-width: 900px) {
      .comparison-stage {
        grid-template-columns: 1fr;
      }
    }
    .pane-box {
      background: #06090e;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .pane-header {
      background: var(--panel-alt);
      padding: 0.45rem 0.75rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .pane-viewport {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      min-height: 360px;
      overflow: hidden;
      background: #05080c;
      user-select: none;
    }
    .zoom-pan-layer {
      width: 100%;
      height: 100%;
      position: relative;
      transform-origin: center center;
    }
    .pane-viewport img,
    .pane-viewport iframe,
    .pane-viewport canvas {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      border: 0;
    }
    .streetview-Mount {
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
      display: none;
    }
    .streetview-Mount.active {
      display: block;
    }
    .missing-photo-notice {
      padding: 1.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 0.65rem;
      background: radial-gradient(circle at top left, #172336, #090d14);
      color: var(--text);
      font-size: 0.85rem;
    }
    .crosshair-reticle {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 25;
    }
    .crosshair-reticle::before {
      content: "";
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      background: rgba(56, 189, 248, 0.45);
    }
    .crosshair-reticle::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(56, 189, 248, 0.45);
    }
    /* ── Overlay Curtain & Difference Stage ── */
    .overlay-stage-wrap {
      display: none;
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      min-height: 440px;
      background: #05080c;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .overlay-stage-wrap.active {
      display: block;
    }
    .overlay-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    /* ── Draggable Alignment Anchors SVG ── */
    .anchors-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 30;
      pointer-events: none;
    }
    .anchors-svg.interactive {
      pointer-events: auto;
    }
    /* ── Controls & Sliders ── */
    .control-group {
      margin-bottom: 0.75rem;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid rgba(40, 55, 77, 0.6);
    }
    .control-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.78rem;
      margin-bottom: 0.2rem;
    }
    .control-row code {
      color: var(--accent);
      font-weight: 700;
    }
    input[type="range"] {
      width: 100%;
      accent-color: var(--accent);
    }
    input[type="text"], input[type="password"], input[type="number"], select, textarea {
      width: 100%;
      background: #0b111a;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.38rem 0.55rem;
      font-size: 0.82rem;
    }
    /* ── Comparison Metadata Table (Real vs Repository Town) ── */
    table.compare-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
      margin-top: 0.6rem;
    }
    table.compare-table th, table.compare-table td {
      padding: 0.5rem 0.65rem;
      border: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    table.compare-table th {
      background: var(--panel-alt);
      color: var(--accent);
      text-transform: uppercase;
      font-size: 0.74rem;
      letter-spacing: 0.04em;
    }
    .badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .badge-verified { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; }
    .badge-likely { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid #f59e0b; }
    .badge-insufficient { background: rgba(56, 189, 248, 0.15); color: #bae6fd; border: 1px solid #38bdf8; }
    .badge-local { background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid #22c55e; }
    .badge-missing { background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid #f59e0b; }
  </style>
</head>
<body>
  <!-- ── PERSISTENT GOOGLE MAPS API CALL & EXACT COST METER ── -->
  <div class="api-cost-topbar" id="api-cost-topbar">
    <div class="cost-ledger-pills">
      <span class="cost-pill zero-cost" id="cost-pill-status">🛡️ API Guard: MANUAL CLICK-TO-CALL</span>
      <span class="cost-pill">API Calls Made: <strong id="cost-total-calls">0</strong></span>
      <span class="cost-pill">Billed Panorama Loads ($0.014 USD): <strong id="cost-pano-loads">0</strong></span>
      <span class="cost-pill">Exact Billed Cost: <strong id="cost-billed-usd">$0.0000 USD</strong> (<strong id="cost-billed-aud">$0.0000 AUD</strong>)</span>
      <span class="cost-pill">Worst-Case Est ($0.014/jump): <strong id="cost-worst-usd">$0.0000 USD</strong> (<strong id="cost-worst-aud">$0.0000 AUD</strong>)</span>
      <span class="cost-pill">Session Budget Cap: <strong id="cost-cap-label">$0.50 USD</strong></span>
    </div>
    <div style="display:flex;gap:0.45rem;align-items:center;flex-wrap:wrap;">
      <button class="btn btn-cost" id="btn-manual-sync-sv" title="Trigger an explicit Google Street View API sync at the current coordinates">
        ⚡ Sync Street View API Now (+$0.0140 USD / ~$0.0215 AUD)
      </button>
      <a class="btn btn-free" id="btn-external-gmaps-free" href="#" target="_blank" rel="noopener noreferrer" title="Open exact synced coordinates in standard Google Maps tab for $0.00 API cost">
        🌐 Open Synced Google Maps Tab ($0.00 FREE)
      </a>
      <button class="btn" id="btn-toggle-cost-log">📋 API Cost Log (0)</button>
    </div>
    <div class="api-call-live-banner" id="api-call-live-banner">
      <span id="api-call-banner-text">
        ✅ ZERO GOOGLE API CALLS MADE THIS SESSION ($0.0000 USD / $0.0000 AUD). Moving in Repository Town or adjusting sliders is 100% free ($0.00) until you click "Sync Street View API Now" or enable Auto-Sync.
      </span>
      <span id="api-call-banner-time" style="font-size:0.75rem;opacity:0.85;">Ready</span>
    </div>
  </div>

  <div class="container">
    <!-- ── Expandable API Call & Cost Audit Log Drawer ── -->
    <div class="section-card" id="api-cost-log-drawer" style="display:none;border-color:#f59e0b;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <h2 style="margin:0;color:#fde68a;">⚡ Google Maps Street View API Call-by-Call Cost Ledger</h2>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <label style="font-size:0.8rem;">Session Cap (USD):
            <input type="number" id="input-budget-cap" value="0.50" step="0.05" min="0.05" style="width:85px;display:inline-block;" />
          </label>
          <button class="btn" id="btn-export-cost-log">⬇ Export Cost Audit JSON</button>
        </div>
      </div>
      <p class="subtitle" style="margin-top:0;">
        Official Google Maps Platform pricing: <strong>Dynamic Street View SKU = $14.00 USD per 1,000 panorama instantiations ($0.0140 USD / ~$0.0215 AUD per load)</strong>.
        Both the official single-instance SKU cost and the worst-case per-position-jump cost ($0.0140 USD per coordinate jump) are logged below for every call.
      </p>
      <div style="overflow-x:auto;">
        <table class="compare-table" id="api-cost-log-table">
          <thead>
            <tr>
              <th>Call #</th>
              <th>Timestamp</th>
              <th>API Method / Operation</th>
              <th>Synced Coordinates (Lat, Lon ↔ Game X, Z)</th>
              <th>Heading / Pitch / FOV</th>
              <th>Official SKU Cost</th>
              <th>Worst-Case Cost</th>
              <th>Cumulative Total</th>
            </tr>
          </thead>
          <tbody id="api-cost-log-tbody">
            <tr><td colspan="8" style="color:var(--muted);">No Google Maps API calls made yet ($0.0000 USD).</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <header class="workspace-header">
      <div>
        <h1>Narromine Real-World Photo Matching &amp; Coordinate-Synced Street View Workspace</h1>
        <div class="subtitle">
          Commit <code>${escapeHtml(manifest?.commitSha || 'HEAD')}</code> on <code>${escapeHtml(
    manifest?.branch || 'feat/narromine-photo-matching-20261104'
  )}</code> ·
          Exact WGS84 ↔ Repository Town Coordinate Projection (<code>anchor -32.2404574, 148.2597315 → offset -2870, -7</code>) ·
          Highest-Priority Building: <strong>${escapeHtml(
            highest ? `${highest.buildingName} (${highest.address})` : 'Royal Hotel (123 Dandaloo Street)'
          )}</strong>
        </div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <label class="btn" style="cursor:pointer;">
          📂 Load Local Photo (e.g. 102255.014.jpg)
          <input type="file" id="input-local-photo-file" accept="image/*" style="display:none;" />
        </label>
        <button class="btn btn-primary" id="btn-export-side-by-side">📸 Download Side-by-Side PNG</button>
        <button class="btn" id="btn-export-discrepancies">📋 Export Discrepancy Register JSON</button>
      </div>
    </header>

    <!-- ── 8 Priority Narromine Location Tabs ── -->
    <div class="location-tabs" id="location-tabs"></div>

    <div class="workspace-main">
      <!-- ── LEFT COLUMN: Dual Side-by-Side / Overlay / Difference Viewer + Comparison Table ── -->
      <div>
        <div class="viewer-card">
          <div class="viewer-toolbar">
            <div class="mode-group">
              <span style="font-size:0.78rem;color:var(--muted);font-weight:700;">VIEW MODE:</span>
              <button class="btn mode-btn active" data-viewmode="side-by-side">A. Side-by-Side</button>
              <button class="btn mode-btn" data-viewmode="overlay">B. Overlay &amp; Wipe Slider</button>
              <button class="btn mode-btn" data-viewmode="difference">E. Structural Edge Diff</button>
            </div>
            <div class="mode-group">
              <span style="font-size:0.78rem;color:var(--muted);font-weight:700;">LEFT SOURCE:</span>
              <select id="select-left-source" style="width:auto;">
                <option value="local-ref">Verified Local Photo / NSW CC-BY Orthophoto</option>
                <option value="live-streetview">Live Google Street View API (Synced)</option>
                <option value="user-file">Loaded Local File from Disk</option>
              </select>
              <span style="font-size:0.78rem;color:var(--muted);font-weight:700;">RIGHT SOURCE:</span>
              <select id="select-right-source" style="width:auto;">
                <option value="qa-screenshot">HUD-Clean QA Screenshot (1280×800)</option>
                <option value="live-game">Live Interactive 3D Repository Town (Iframe)</option>
              </select>
            </div>
          </div>

          <!-- ── A. SIDE-BY-SIDE STAGE ── -->
          <div class="comparison-stage" id="stage-side-by-side">
            <!-- Left Pane: Real Narromine -->
            <div class="pane-box">
              <div class="pane-header">
                <span>REAL NARROMINE — <span id="left-pane-subtitle">Verified Reference</span></span>
                <span id="left-pane-coord-badge" style="font-family:monospace;font-size:0.74rem;color:var(--accent);"></span>
              </div>
              <div class="pane-viewport" id="left-viewport">
                <div class="zoom-pan-layer" id="left-zoom-layer">
                  <img id="left-ref-img" alt="Real Narromine Reference" style="display:none;" />
                  <div class="streetview-Mount" id="streetview-mount"></div>
                  <div class="missing-photo-notice" id="left-missing-notice" style="display:none;"></div>
                </div>
                <div class="crosshair-reticle" id="left-reticle"></div>
                <svg class="anchors-svg" id="left-anchors-svg" viewBox="0 0 1000 625" preserveAspectRatio="none"></svg>
              </div>
            </div>

            <!-- Right Pane: Repository Town -->
            <div class="pane-box">
              <div class="pane-header">
                <span>REPOSITORY TOWN — <span id="right-pane-subtitle">HUD-Clean 3D Capture</span></span>
                <span id="right-pane-coord-badge" style="font-family:monospace;font-size:0.74rem;color:var(--pass);"></span>
              </div>
              <div class="pane-viewport" id="right-viewport">
                <div class="zoom-pan-layer" id="right-zoom-layer">
                  <img id="right-game-img" alt="Repository Town In-Game Capture" />
                  <iframe id="right-game-iframe" title="Live Repository Town 3D View" style="display:none;"></iframe>
                </div>
                <div class="crosshair-reticle" id="right-reticle"></div>
                <svg class="anchors-svg" id="right-anchors-svg" viewBox="0 0 1000 625" preserveAspectRatio="none"></svg>
              </div>
            </div>
          </div>

          <!-- ── B. OVERLAY & WIPE SLIDER STAGE ── -->
          <div class="overlay-stage-wrap" id="stage-overlay">
            <img class="overlay-layer" id="overlay-base-img" alt="Repository Town Base" />
            <img class="overlay-layer" id="overlay-top-img" alt="Real Narromine Overlay" />
            <div id="overlay-wipe-line" style="position:absolute;top:0;bottom:0;left:50%;width:3px;background:var(--accent);z-index:20;pointer-events:none;"></div>
            <div class="crosshair-reticle"></div>
          </div>

          <!-- ── E. REGISTERED STRUCTURAL EDGE-DIFFERENCE STAGE ── -->
          <div class="overlay-stage-wrap" id="stage-difference">
            <canvas id="diff-canvas" width="1280" height="800" style="width:100%;height:100%;object-fit:contain;"></canvas>
          </div>

          <!-- ── Synchronized Overlay / Zoom / Pan Quick Bar ── -->
          <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;padding-top:0.6rem;border-top:1px solid var(--border);font-size:0.8rem;">
            <label>Wipe Split: <input type="range" id="slider-wipe" min="0" max="100" value="50" style="width:110px;vertical-align:middle;" /> <code id="val-wipe">50%</code></label>
            <label>Overlay Opacity: <input type="range" id="slider-opacity" min="0" max="100" value="65" style="width:110px;vertical-align:middle;" /> <code id="val-opacity">65%</code></label>
            <label>Sync Zoom: <input type="range" id="slider-zoom" min="100" max="400" value="100" style="width:110px;vertical-align:middle;" /> <code id="val-zoom">100%</code></label>
            <label><input type="checkbox" id="chk-show-reticle" checked /> Crosshairs</label>
            <label><input type="checkbox" id="chk-show-anchors" checked /> Alignment Anchors</label>
            <button class="btn" id="btn-reset-zoom">Reset Zoom/Pan</button>
          </div>
        </div>

        <!-- ── REAL NARROMINE vs REPOSITORY TOWN SIDE-BY-SIDE EVIDENCE TABLE (Section 2) ── -->
        <div class="section-card">
          <h2 id="comparison-table-heading">Side-by-Side Architectural &amp; Camera Comparison</h2>
          <div style="overflow-x:auto;">
            <table class="compare-table">
              <thead>
                <tr>
                  <th style="width:18%;">Dimension</th>
                  <th style="width:41%;">REAL NARROMINE (Authoritative Evidence)</th>
                  <th style="width:41%;">REPOSITORY TOWN (Current Reconstruction)</th>
                </tr>
              </thead>
              <tbody id="comparison-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── RIGHT COLUMN: Camera Matching Controls, Google Street View Key & Provenance ── -->
      <div>
        <!-- Live Street View API Connection Card -->
        <div class="control-card" style="border-color:rgba(245, 158, 11, 0.55);">
          <h2>🔑 Live Google Street View API &amp; Cost Guard</h2>
          <div class="control-group">
            <div class="control-row">
              <span>Google Maps JS API Key (session memory only):</span>
            </div>
            <div style="display:flex;gap:0.35rem;margin-top:0.25rem;">
              <input type="password" id="input-gmaps-key" placeholder="Paste AIza... Street View API key" autocomplete="off" />
              <button class="btn btn-cost" id="btn-connect-sv">Connect</button>
            </div>
            <div style="font-size:0.74rem;color:var(--muted);margin-top:0.35rem;">
              Key is kept in volatile page memory only (never committed to git). Every API call flashes the top cost banner with exact USD &amp; AUD cost.
            </div>
            <div style="margin-top:0.45rem;display:flex;flex-direction:column;gap:0.3rem;font-size:0.78rem;">
              <label><input type="checkbox" id="chk-auto-sync-sv" /> Auto-Sync Street View when moving camera (800ms debounce, $0.014 USD worst-case/jump)</label>
              <label><input type="checkbox" id="chk-car-height-preset" /> Use Street View Car Roof Camera Height (2.45m instead of 1.65m pedestrian)</label>
            </div>
          </div>

          <h2>🎯 C. Synchronized Camera Matching Controls</h2>
          <div class="control-group">
            <div class="control-row"><span>Game World X (m East):</span><code id="lbl-cam-x">-4820.50</code></div>
            <input type="range" id="slider-cam-x" min="-5000" max="-4650" step="0.25" value="-4820.5" />

            <div class="control-row"><span>Game World Z (m South):</span><code id="lbl-cam-z">-543.00</code></div>
            <input type="range" id="slider-cam-z" min="-1050" max="-240" step="0.25" value="-543.0" />

            <div class="control-row"><span>Synced WGS84 Latitude:</span><code id="lbl-cam-lat">-32.2356370</code></div>
            <div class="control-row"><span>Synced WGS84 Longitude:</span><code id="lbl-cam-lon">148.2389928</code></div>
          </div>

          <div class="control-group">
            <div class="control-row"><span>Camera Eye Height (m):</span><code id="lbl-cam-eye">1.65 m</code></div>
            <input type="range" id="slider-cam-eye" min="1.0" max="15.0" step="0.05" value="1.65" />

            <div class="control-row"><span>Compass Heading / Yaw:</span><code id="lbl-cam-heading">88.3° (E)</code></div>
            <input type="range" id="slider-cam-heading" min="0" max="360" step="0.5" value="88.3" />

            <div class="control-row"><span>Camera Pitch (deg):</span><code id="lbl-cam-pitch">+2.3°</code></div>
            <input type="range" id="slider-cam-pitch" min="-60" max="60" step="0.5" value="2.3" />

            <div class="control-row"><span>Field of View (FOV):</span><code id="lbl-cam-fov">72.0°</code></div>
            <input type="range" id="slider-cam-fov" min="25" max="110" step="0.5" value="72" />
          </div>

          <div class="control-group">
            <div class="control-row"><span>QA Capture Viewport &amp; Lighting:</span></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin-top:0.25rem;">
              <select id="select-qa-viewport">
                <option value="desktop">Desktop (1280×800)</option>
                <option value="mobile">Mobile (393×852)</option>
              </select>
              <select id="select-qa-lighting">
                <option value="morning">Morning (08:00)</option>
                <option value="midday" selected>Midday (12:30)</option>
                <option value="late-afternoon">Late Afternoon (16:45)</option>
              </select>
            </div>
            <div style="margin-top:0.45rem;">
              <label style="font-size:0.78rem;"><input type="checkbox" id="chk-hide-game-hud" checked /> Hide Game HUD Overlays in Live 3D View</label>
            </div>
          </div>

          <div class="control-group" style="border-bottom:none;margin-bottom:0;padding-bottom:0;">
            <div class="control-row"><span>Ref Photo Alignment Offset X / Y (px):</span><code id="lbl-align-xy">0, 0 (100%)</code></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.35rem;">
              <input type="range" id="slider-align-x" min="-200" max="200" value="0" title="Horizontal photo alignment shift" />
              <input type="range" id="slider-align-y" min="-200" max="200" value="0" title="Vertical photo alignment shift" />
              <input type="range" id="slider-align-scale" min="50" max="200" value="100" title="Reference photo scale %" />
            </div>
            <div style="display:flex;gap:0.4rem;margin-top:0.55rem;">
              <button class="btn" id="btn-reset-pose" style="flex:1;">↺ Reset Canonical Pose</button>
              <button class="btn btn-primary" id="btn-copy-pose-json" style="flex:1;">📋 Copy Pose JSON</button>
            </div>
          </div>
        </div>

        <!-- Photograph Provenance Card for Current Location -->
        <div class="control-card">
          <h2>📷 Photograph Provenance &amp; Availability</h2>
          <div id="location-provenance-box" style="font-size:0.8rem;"></div>
        </div>
      </div>
    </div>

    <!-- ── ARCHITECTURAL DISCREPANCY REGISTER & ANNOTATION FORM (Section 7) ── -->
    <div class="section-card">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
        <div>
          <h2 style="margin:0;">📐 Architectural Discrepancy Register &amp; Prioritised Fidelity Backlog</h2>
          <div class="subtitle">
            Findings categorised strictly as <strong>Verified mismatch</strong>, <strong>Likely mismatch</strong>, or <strong>Insufficient evidence</strong>.
            Highest-priority building: <strong>${escapeHtml(
              highest ? `${highest.buildingName} (${highest.buildingId} · Impact ${highest.maxVisualImpactScore}/10)` : 'Royal Hotel'
            )}</strong>
          </div>
        </div>
        <div style="display:flex;gap:0.45rem;align-items:center;">
          <select id="filter-discrepancy-loc" style="width:auto;">
            <option value="all">Show All 8 Locations</option>
            <option value="current">Filter to Active Location Only</option>
          </select>
        </div>
      </div>

      <div style="overflow-x:auto;">
        <table class="compare-table" id="discrepancy-table">
          <thead>
            <tr>
              <th>ID / Severity</th>
              <th>Building &amp; Location</th>
              <th>Category &amp; Classification</th>
              <th>Observed Architectural Discrepancy</th>
              <th>Evidence &amp; Uncertainty</th>
              <th>Suggested Correction Spec</th>
              <th>Responsible Modules &amp; Agent Ownership</th>
            </tr>
          </thead>
          <tbody id="discrepancy-tbody"></tbody>
        </table>
      </div>

      <!-- Add Annotation Form -->
      <details style="margin-top:1rem;background:var(--panel-alt);padding:0.75rem 1rem;border-radius:8px;border:1px solid var(--border);">
        <summary style="cursor:pointer;font-weight:700;font-size:0.86rem;color:var(--accent);">
          ➕ Record New Architectural Discrepancy Annotation at Current Camera Pose
        </summary>
        <form id="form-add-discrepancy" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.65rem;margin-top:0.75rem;">
          <div>
            <label style="font-size:0.76rem;">Building ID</label>
            <input type="text" id="disc-building-id" required placeholder="e.g. NR-SITE-royal-hotel" />
          </div>
          <div>
            <label style="font-size:0.76rem;">Category</label>
            <select id="disc-category">
              <option value="roof">Roof pitch / orientation / ridge</option>
              <option value="footprint-height">Building width / height / footprint</option>
              <option value="windows">Windows (position / count / size)</option>
              <option value="doors-entrances">Doors &amp; entrances</option>
              <option value="verandahs-columns-awnings">Verandahs / columns / awnings</option>
              <option value="materials-colours">Brickwork / render / colours</option>
              <option value="signage-lettering">Building signage &amp; lettering</option>
              <option value="streetscape-kerbs">Footpaths / kerbs / streetscape</option>
              <option value="landscaping">Landscaping &amp; permanent vegetation</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.76rem;">Classification</label>
            <select id="disc-classification">
              <option value="Verified mismatch">Verified mismatch</option>
              <option value="Likely mismatch">Likely mismatch</option>
              <option value="Insufficient evidence">Insufficient evidence</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.76rem;">Severity &amp; Impact (1–10)</label>
            <select id="disc-severity">
              <option value="CRITICAL|10">CRITICAL (10/10)</option>
              <option value="HIGH|8" selected>HIGH (8/10)</option>
              <option value="MEDIUM|6">MEDIUM (6/10)</option>
              <option value="LOW|3">LOW (3/10)</option>
            </select>
          </div>
          <div style="grid-column:1 / -1;">
            <label style="font-size:0.76rem;">Observed Architectural Discrepancy</label>
            <textarea id="disc-observed" rows="2" required placeholder="Describe exact difference between real photograph/Street View and Repository Town..."></textarea>
          </div>
          <div style="grid-column:1 / -1;">
            <label style="font-size:0.76rem;">Suggested Correction &amp; Evidence Note</label>
            <textarea id="disc-correction" rows="2" required placeholder="Specify exact height, bay count, colour hex, or roof pitch adjustment..."></textarea>
          </div>
          <div style="grid-column:1 / -1;display:flex;justify-content:flex-end;">
            <button type="submit" class="btn btn-primary">Save Discrepancy to Register</button>
          </div>
        </form>
      </details>
    </div>
  </div>

  <script id="workspace-data" type="application/json">${payloadJson}</script>
  <script>
  (() => {
    const DATA = JSON.parse(document.getElementById('workspace-data').textContent);
    const ANCHOR_LAT = -32.2404574, ANCHOR_LON = 148.2597315;
    const OFFSET_X = -2870, OFFSET_Z = -7;
    const RAD = Math.PI / 180, EARTH = 6371008.8, COS_ANCHOR = Math.cos(ANCHOR_LAT * RAD);
    const AUD_RATE = DATA.pricing?.currencyRateAudPerUsd || 1.535;

    function geoToWorld(lat, lon) {
      return {
        x: Number((OFFSET_X + (lon - ANCHOR_LON) * RAD * EARTH * COS_ANCHOR).toFixed(3)),
        z: Number((OFFSET_Z - (lat - ANCHOR_LAT) * RAD * EARTH).toFixed(3)),
      };
    }
    function worldToGeo(x, z) {
      return {
        lat: Number((ANCHOR_LAT - (z - OFFSET_Z) / (RAD * EARTH)).toFixed(7)),
        lon: Number((ANCHOR_LON + (x - OFFSET_X) / (RAD * EARTH * COS_ANCHOR)).toFixed(7)),
      };
    }
    function headingToYaw(deg) {
      const norm = ((Number(deg) % 360) + 360) % 360;
      return (-norm * Math.PI) / 180;
    }
    function yawToHeading(yaw) {
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      return (((Math.atan2(fx, -fz) * 180) / Math.PI) % 360 + 360) % 360;
    }
    function cardinalFromHeading(deg) {
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
    }
    function buildExternalGmapsUrl(pose) {
      const p = new URLSearchParams({
        api: '1',
        map_action: 'pano',
        viewpoint: pose.lat.toFixed(7) + ',' + pose.lon.toFixed(7),
        heading: pose.headingDeg.toFixed(2),
        pitch: pose.pitchDeg.toFixed(2),
        fov: pose.fovDeg.toFixed(1),
      });
      return 'https://www.google.com/maps/@?' + p.toString();
    }

    // ── Live API Cost Ledger State ──
    const costState = {
      budgetCapUsd: 0.50,
      totalCalls: 0,
      panoLoads: 0,
      billedUsd: 0,
      worstUsd: 0,
      calls: [],
    };

    function recordApiCall(opKey, reason, poseSnapshot) {
      const ops = DATA.pricing?.operations || {};
      const spec = ops[opKey] || {
        operation: opKey,
        label: opKey,
        billedUsd: 0.014,
        conservativeUsd: 0.014,
      };
      const billedDelta = Number(spec.billedUsd || 0);
      const worstDelta = Number(spec.conservativeUsd || 0);

      if (worstDelta > 0 && costState.worstUsd + worstDelta > costState.budgetCapUsd + 1e-6) {
        const banner = document.getElementById('api-call-live-banner');
        const bannerText = document.getElementById('api-call-banner-text');
        banner.classList.add('called');
        bannerText.textContent =
          '⛔ API CALL BLOCKED BY SESSION BUDGET GUARD: ' +
          spec.label +
          ' (+$' + worstDelta.toFixed(4) + ' USD) would exceed cap of $' +
          costState.budgetCapUsd.toFixed(2) + ' USD. Increase cap in API Cost Log if needed.';
        return { blocked: true };
      }

      costState.totalCalls += 1;
      if (opKey === 'streetview_panorama_instantiate') costState.panoLoads += 1;
      costState.billedUsd = Number((costState.billedUsd + billedDelta).toFixed(4));
      costState.worstUsd = Number((costState.worstUsd + worstDelta).toFixed(4));

      const billedAud = Number((costState.billedUsd * AUD_RATE).toFixed(4));
      const worstAud = Number((costState.worstUsd * AUD_RATE).toFixed(4));
      const callWorstAud = Number((worstDelta * AUD_RATE).toFixed(4));

      const entry = {
        callNumber: costState.totalCalls,
        timestamp: new Date().toISOString(),
        operation: opKey,
        label: spec.label,
        reason,
        lat: poseSnapshot.lat,
        lon: poseSnapshot.lon,
        x: poseSnapshot.x,
        z: poseSnapshot.z,
        headingDeg: poseSnapshot.headingDeg,
        pitchDeg: poseSnapshot.pitchDeg,
        fovDeg: poseSnapshot.fovDeg,
        billedUsd: billedDelta,
        worstUsd: worstDelta,
        cumulativeBilledUsd: costState.billedUsd,
        cumulativeWorstUsd: costState.worstUsd,
      };
      costState.calls.unshift(entry);

      // Update Top Bar UI immediately
      document.getElementById('cost-total-calls').textContent = String(costState.totalCalls);
      document.getElementById('cost-pano-loads').textContent = String(costState.panoLoads);
      document.getElementById('cost-billed-usd').textContent = '$' + costState.billedUsd.toFixed(4) + ' USD';
      document.getElementById('cost-billed-aud').textContent = '$' + billedAud.toFixed(4) + ' AUD';
      document.getElementById('cost-worst-usd').textContent = '$' + costState.worstUsd.toFixed(4) + ' USD';
      document.getElementById('cost-worst-aud').textContent = '$' + worstAud.toFixed(4) + ' AUD';
      document.getElementById('btn-toggle-cost-log').textContent = '📋 API Cost Log (' + costState.totalCalls + ')';

      const topbar = document.getElementById('api-cost-topbar');
      const banner = document.getElementById('api-call-live-banner');
      const bannerText = document.getElementById('api-call-banner-text');
      const bannerTime = document.getElementById('api-call-banner-time');

      topbar.classList.add('flash-active');
      banner.classList.remove('called');
      void banner.offsetWidth; // trigger reflow for animation
      banner.classList.add('called');

      bannerText.textContent =
        '⚡ GOOGLE API CALL #' + entry.callNumber + ' MADE: ' + spec.label +
        ' @ (' + poseSnapshot.lat.toFixed(6) + ', ' + poseSnapshot.lon.toFixed(6) + ') · ' +
        'THIS CALL COST: $' + billedDelta.toFixed(4) + ' USD SKU ($' + worstDelta.toFixed(4) + ' USD / ~$' + callWorstAud.toFixed(4) + ' AUD worst-case) · ' +
        'SESSION TOTAL: $' + costState.billedUsd.toFixed(4) + ' USD billed ($' + costState.worstUsd.toFixed(4) + ' USD / ~$' + worstAud.toFixed(4) + ' AUD worst-case)';
      bannerTime.textContent = new Date().toLocaleTimeString();

      setTimeout(() => topbar.classList.remove('flash-active'), 1400);
      renderCostTable();
      return { blocked: false, entry };
    }

    function renderCostTable() {
      const tbody = document.getElementById('api-cost-log-tbody');
      if (!costState.calls.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="color:var(--muted);">No Google Maps API calls made yet ($0.0000 USD).</td></tr>';
        return;
      }
      tbody.innerHTML = costState.calls.map((c) => (
        '<tr>' +
          '<td><strong>#' + c.callNumber + '</strong></td>' +
          '<td><code>' + c.timestamp.slice(11, 23) + '</code></td>' +
          '<td>' + c.label + ' <span style="color:var(--muted);">(' + c.reason + ')</span></td>' +
          '<td><code>' + c.lat.toFixed(6) + ', ' + c.lon.toFixed(6) + '</code><br/><span style="color:var(--muted);">Game (' + c.x.toFixed(1) + ', ' + c.z.toFixed(1) + ')</span></td>' +
          '<td><code>' + c.headingDeg.toFixed(1) + '° / ' + c.pitchDeg.toFixed(1) + '° / ' + c.fovDeg.toFixed(0) + '°</code></td>' +
          '<td style="color:#fde68a;"><strong>$' + c.billedUsd.toFixed(4) + ' USD</strong></td>' +
          '<td style="color:#fca5a5;"><strong>$' + c.worstUsd.toFixed(4) + ' USD</strong> (~$' + (c.worstUsd * AUD_RATE).toFixed(4) + ' AUD)</td>' +
          '<td><strong>$' + c.cumulativeBilledUsd.toFixed(4) + ' USD</strong> (worst $' + c.cumulativeWorstUsd.toFixed(4) + ')</td>' +
        '</tr>'
      )).join('');
    }

    // ── Active Workspace State ──
    let currentLocIndex = 0;
    let viewMode = 'side-by-side';
    let leftSource = 'local-ref';
    let rightSource = 'qa-screenshot';
    let userUploadedDataUrl = null;
    let userUploadedName = null;
    let discrepancies = [...DATA.discrepancies];

    const pose = {
      x: -4820.5,
      z: -543.0,
      lat: -32.235637,
      lon: 148.238993,
      eyeHeightM: 1.65,
      headingDeg: 88.3,
      pitchDeg: 2.3,
      fovDeg: 72.0,
      alignX: 0,
      alignY: 0,
      alignScale: 100,
      zoom: 100,
    };

    // Alignment Anchors (normalized 0..1000 x 0..625 coordinates)
    const anchors = [
      { id: 'roof', label: 'Roof Ridge / Parapet', y: 185, color: '#38bdf8' },
      { id: 'verandah', label: 'Verandah Beam / Awning', y: 315, color: '#f59e0b' },
      { id: 'sill', label: 'Ground Window Sill', y: 430, color: '#22c55e' },
      { id: 'kerb', label: 'Footpath Kerb Line', y: 515, color: '#e879f9' },
    ];

    function renderAnchors() {
      const show = document.getElementById('chk-show-anchors').checked;
      for (const svgId of ['left-anchors-svg', 'right-anchors-svg']) {
        const svg = document.getElementById(svgId);
        if (!show) {
          svg.innerHTML = '';
          continue;
        }
        svg.innerHTML = anchors.map((a) => (
          '<g>' +
            '<line x1="40" y1="' + a.y + '" x2="960" y2="' + a.y + '" stroke="' + a.color + '" stroke-width="1.5" stroke-dasharray="6,4" />' +
            '<rect x="45" y="' + (a.y - 18) + '" width="155" height="16" rx="3" fill="rgba(11,16,23,0.85)" stroke="' + a.color + '" stroke-width="1" />' +
            '<text x="51" y="' + (a.y - 6) + '" fill="' + a.color + '" font-size="10" font-family="monospace" font-weight="bold">' + a.label + '</text>' +
          '</g>'
        )).join('');
      }
    }

    // ── Google Street View Live Integration ──
    let svPanorama = null;
    let svScriptLoaded = false;
    let svSuppressEvents = false;
    let svAutoSyncTimer = null;

    async function ensureStreetViewLoadedAndSynced(reason = 'manual-sync-button') {
      const keyInput = document.getElementById('input-gmaps-key');
      const urlKey = new URLSearchParams(location.search).get('gmapsKey');
      const apiKey = (keyInput.value || urlKey || '').trim();
      const mount = document.getElementById('streetview-mount');
      const notice = document.getElementById('left-missing-notice');

      if (!apiKey) {
        leftSource = 'live-streetview';
        document.getElementById('select-left-source').value = 'live-streetview';
        mount.classList.remove('active');
        document.getElementById('left-ref-img').style.display = 'none';
        notice.style.display = 'flex';
        notice.innerHTML =
          '<strong style="color:#fcd34d;font-size:0.95rem;">🔑 Google Street View API Key Ready to Connect</strong>' +
          '<div>Paste your Google Maps Street View API key into the <strong>Live Google Street View API &amp; Cost Guard</strong> box on the right and click <strong>Connect</strong>, or click <strong>🌐 Open Synced Google Maps Tab ($0.00 FREE)</strong> in the top bar to view the exact synced coordinates (<code>' +
          pose.lat.toFixed(6) + ', ' + pose.lon.toFixed(6) + ' · heading ' + pose.headingDeg.toFixed(1) + '°</code>) in a standard browser tab at zero cost.</div>';
        return;
      }

      if (!svScriptLoaded && !window.google?.maps?.StreetViewPanorama) {
        recordApiCall('maps_js_script_load', reason, pose);
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey);
          s.async = true;
          s.onload = resolve;
          s.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API script'));
          document.head.appendChild(s);
        });
        svScriptLoaded = true;
      }

      leftSource = 'live-streetview';
      document.getElementById('select-left-source').value = 'live-streetview';
      document.getElementById('left-ref-img').style.display = 'none';
      notice.style.display = 'none';
      mount.classList.add('active');

      const zoom = Math.max(0, Math.log2(180 / Math.max(20, Math.min(115, pose.fovDeg))));

      if (!svPanorama) {
        const res = recordApiCall('streetview_panorama_instantiate', reason, pose);
        if (res.blocked) return;
        svPanorama = new window.google.maps.StreetViewPanorama(mount, {
          position: { lat: pose.lat, lng: pose.lon },
          pov: { heading: pose.headingDeg, pitch: pose.pitchDeg },
          zoom,
          addressControl: true,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          motionTracking: false,
        });

        svPanorama.addListener('position_changed', () => {
          if (svSuppressEvents) return;
          const p = svPanorama.getPosition();
          if (!p) return;
          const newLat = p.lat(), newLon = p.lng();
          if (Math.hypot(newLat - pose.lat, newLon - pose.lon) < 1e-6) return;
          const w = geoToWorld(newLat, newLon);
          pose.lat = newLat;
          pose.lon = newLon;
          pose.x = w.x;
          pose.z = w.z;
          recordApiCall('streetview_pano_changed', 'user-moved-in-streetview', pose);
          updateControlsFromPose(false);
          syncLiveGameIframe();
        });

        svPanorama.addListener('pov_changed', () => {
          if (svSuppressEvents) return;
          const pov = svPanorama.getPov();
          if (!pov) return;
          const h = (((pov.heading % 360) + 360) % 360);
          const pt = Math.max(-60, Math.min(60, pov.pitch || 0));
          if (Math.abs(h - pose.headingDeg) < 0.2 && Math.abs(pt - pose.pitchDeg) < 0.2) return;
          pose.headingDeg = Number(h.toFixed(2));
          pose.pitchDeg = Number(pt.toFixed(2));
          updateControlsFromPose(false);
          syncLiveGameIframe();
        });
      } else {
        const prevPos = svPanorama.getPosition();
        const moved =
          !prevPos ||
          Math.hypot(prevPos.lat() - pose.lat, prevPos.lng() - pose.lon) > 1e-5;
        const opKey = moved ? 'streetview_set_position' : 'streetview_set_pov';
        const res = recordApiCall(opKey, reason, pose);
        if (res.blocked) return;
        svSuppressEvents = true;
        if (moved) svPanorama.setPosition({ lat: pose.lat, lng: pose.lon });
        svPanorama.setPov({ heading: pose.headingDeg, pitch: pose.pitchDeg });
        svPanorama.setZoom(zoom);
        setTimeout(() => { svSuppressEvents = false; }, 120);
      }
    }

    // ── Sync with Live 3D Repository Town Iframe ──
    function syncLiveGameIframe() {
      const iframe = document.getElementById('right-game-iframe');
      if (rightSource !== 'live-game' || !iframe.contentWindow) return;
      const win = iframe.contentWindow;
      const t = win.__town;
      if (!t) return;
      const yawRad = headingToYaw(pose.headingDeg);
      const pitchRad = (pose.pitchDeg * Math.PI) / 180;
      const hideHud = document.getElementById('chk-hide-game-hud').checked;

      try {
        if (!win.__qaRenderHookInstalled) {
          win.eval(\`
            import('./vendor/three.module.min.js').then((THREE) => {
              if (window.__qaRenderHookInstalled) return;
              const origRender = THREE.WebGLRenderer.prototype.render;
              THREE.WebGLRenderer.prototype.render = function(scene, camera, ...rest) {
                window.__qaCamera = camera;
                const ov = window.__qaCameraOverride;
                if (ov && camera && camera.isPerspectiveCamera) {
                  if (Number.isFinite(ov.eyeHeightM)) camera.position.y = ov.eyeHeightM;
                  if (Number.isFinite(ov.pitchRad)) {
                    camera.rotation.set(ov.pitchRad, camera.rotation.y, 0, 'YXZ');
                  }
                  if (Number.isFinite(ov.fovDeg) && Math.abs(camera.fov - ov.fovDeg) > 1e-3) {
                    camera.fov = ov.fovDeg;
                    camera.updateProjectionMatrix();
                  }
                }
                return origRender.call(this, scene, camera, ...rest);
              };
              window.__qaRenderHookInstalled = true;
            }).catch(() => {});
          \`);
        }
        win.__qaCameraOverride = {
          pitchRad,
          eyeHeightM: pose.eyeHeightM,
          fovDeg: pose.fovDeg,
        };
        t.closePanel?.();
        t.life.speed(0);
        const lightId = document.getElementById('select-qa-lighting').value;
        const minuteMap = { morning: 480, midday: 750, 'late-afternoon': 1005 };
        t.life.setTime(minuteMap[lightId] || 750);
        t.place(pose.x, pose.z, yawRad);

        for (const el of win.document.querySelectorAll('body > *:not(#scene)')) {
          el.style.visibility = hideHud ? 'hidden' : '';
        }
      } catch {}
    }

    // Poll live game iframe if user walks inside it with WASD/mouse
    setInterval(() => {
      if (rightSource !== 'live-game') return;
      const iframe = document.getElementById('right-game-iframe');
      const win = iframe?.contentWindow;
      const t = win?.__town;
      if (!t) return;
      try {
        const st = t.state();
        if (!st?.pos) return;
        const dx = Math.abs(st.pos.x - pose.x);
        const dz = Math.abs(st.pos.z - pose.z);
        const h = yawToHeading(st.yaw);
        const dh = Math.abs(h - pose.headingDeg);
        if (dx > 0.15 || dz > 0.15 || (dh > 1.0 && dh < 359.0)) {
          pose.x = Number(st.pos.x.toFixed(2));
          pose.z = Number(st.pos.z.toFixed(2));
          const g = worldToGeo(pose.x, pose.z);
          pose.lat = g.lat;
          pose.lon = g.lon;
          pose.headingDeg = Number(h.toFixed(1));
          updateControlsFromPose(true);
        }
      } catch {}
    }, 350);

    // ── Structural Edge Difference Renderer (Section 4.E) ──
    function renderStructuralDifference() {
      const canvas = document.getElementById('diff-canvas');
      const ctx = canvas.getContext('2d');
      const leftImg = document.getElementById('left-ref-img');
      const rightImg = document.getElementById('right-game-img');
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = '#070b11';
      ctx.fillRect(0, 0, w, h);

      if (!rightImg.complete || !rightImg.naturalWidth) return;

      const offR = document.createElement('canvas');
      offR.width = w; offR.height = h;
      const ctxR = offR.getContext('2d');
      ctxR.drawImage(rightImg, 0, 0, w, h);
      const dataR = ctxR.getImageData(0, 0, w, h).data;

      let dataL = null;
      if (leftImg.style.display !== 'none' && leftImg.complete && leftImg.naturalWidth) {
        const offL = document.createElement('canvas');
        offL.width = w; offL.height = h;
        const ctxL = offL.getContext('2d');
        ctxL.drawImage(leftImg, 0, 0, w, h);
        dataL = ctxL.getImageData(0, 0, w, h).data;
      }

      const out = ctx.createImageData(w, h);
      const dst = out.data;

      // Compute horizontal + vertical Sobel edge magnitude inside the architectural facade band
      // (y = 12%..78%), masking upper sky and lower road shadow zones to avoid false positives.
      const luma = (buf, idx) => 0.299 * buf[idx] + 0.587 * buf[idx + 1] + 0.114 * buf[idx + 2];

      for (let y = 1; y < h - 1; y++) {
        const inFacadeBand = y >= h * 0.12 && y <= h * 0.80;
        for (let x = 1; x < w - 1; x++) {
          const i = (y * w + x) * 4;
          const gxR = Math.abs(luma(dataR, i + 4) - luma(dataR, i - 4));
          const gyR = Math.abs(luma(dataR, i + w * 4) - luma(dataR, i - w * 4));
          const edgeR = Math.min(255, (gxR + gyR) * 2.2);

          let edgeL = 0;
          if (dataL) {
            const gxL = Math.abs(luma(dataL, i + 4) - luma(dataL, i - 4));
            const gyL = Math.abs(luma(dataL, i + w * 4) - luma(dataL, i - w * 4));
            edgeL = Math.min(255, (gxL + gyL) * 2.2);
          }

          if (!inFacadeBand) {
            dst[i] = Math.round(dataR[i] * 0.25);
            dst[i + 1] = Math.round(dataR[i + 1] * 0.25);
            dst[i + 2] = Math.round(dataR[i + 2] * 0.25);
            dst[i + 3] = 255;
          } else if (dataL) {
            // Cyan = Repository Town structural edge, Magenta = Reference Photo structural edge
            dst[i] = Math.min(255, Math.round(dataR[i] * 0.2 + edgeL));
            dst[i + 1] = Math.min(255, Math.round(dataR[i + 1] * 0.2 + edgeR));
            dst[i + 2] = Math.min(255, Math.round(dataR[i + 2] * 0.2 + Math.max(edgeL, edgeR)));
            dst[i + 3] = 255;
          } else {
            // Game structural wireframe highlight when comparing against live Street View
            dst[i] = Math.round(dataR[i] * 0.3);
            dst[i + 1] = Math.min(255, Math.round(dataR[i + 1] * 0.3 + edgeR));
            dst[i + 2] = Math.min(255, Math.round(dataR[i + 2] * 0.3 + edgeR));
            dst[i + 3] = 255;
          }
        }
      }
      ctx.putImageData(out, 0, 0);
      ctx.fillStyle = 'rgba(11, 16, 23, 0.85)';
      ctx.fillRect(16, 16, 680, 34);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(
        'STRUCTURAL EDGE REGISTER (Cyan = Repository Town edges, Magenta = Reference edges; Sky/Road masked)',
        26,
        38
      );
    }

    function selectLocation(index) {
      currentLocIndex = index;
      const loc = DATA.locations[index];
      if (!loc) return;

      const useCar = document.getElementById('chk-car-height-preset').checked;
      const cam = useCar ? loc.streetViewCarCamera : loc.camera;
      pose.x = cam.x;
      pose.z = cam.z;
      pose.lat = cam.lat;
      pose.lon = cam.lon;
      pose.eyeHeightM = cam.eyeHeightM;
      pose.headingDeg = cam.headingDeg;
      pose.pitchDeg = cam.pitchDeg;
      pose.fovDeg = cam.fovDeg;
      pose.alignX = 0;
      pose.alignY = 0;
      pose.alignScale = 100;

      document.getElementById('disc-building-id').value = loc.buildingIds[0] || 'NR-SITE-unknown';

      document.querySelectorAll('.loc-tab').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
      });

      updateControlsFromPose(true);
      renderLocationView();
      renderDiscrepancyTable();
    }

    function updateControlsFromPose(triggerAutoSv = false) {
      const card = cardinalFromHeading(pose.headingDeg);
      document.getElementById('slider-cam-x').value = String(pose.x);
      document.getElementById('slider-cam-z').value = String(pose.z);
      document.getElementById('slider-cam-eye').value = String(pose.eyeHeightM);
      document.getElementById('slider-cam-heading').value = String(pose.headingDeg);
      document.getElementById('slider-cam-pitch').value = String(pose.pitchDeg);
      document.getElementById('slider-cam-fov').value = String(pose.fovDeg);

      document.getElementById('lbl-cam-x').textContent = pose.x.toFixed(2) + ' m';
      document.getElementById('lbl-cam-z').textContent = pose.z.toFixed(2) + ' m';
      document.getElementById('lbl-cam-lat').textContent = pose.lat.toFixed(7);
      document.getElementById('lbl-cam-lon').textContent = pose.lon.toFixed(7);
      document.getElementById('lbl-cam-eye').textContent = pose.eyeHeightM.toFixed(2) + ' m';
      document.getElementById('lbl-cam-heading').textContent = pose.headingDeg.toFixed(1) + '° (' + card + ')';
      document.getElementById('lbl-cam-pitch').textContent = (pose.pitchDeg >= 0 ? '+' : '') + pose.pitchDeg.toFixed(1) + '°';
      document.getElementById('lbl-cam-fov').textContent = pose.fovDeg.toFixed(1) + '°';

      document.getElementById('left-pane-coord-badge').textContent =
        pose.lat.toFixed(6) + ', ' + pose.lon.toFixed(6) + ' · ' + pose.headingDeg.toFixed(1) + '° ' + card;
      document.getElementById('right-pane-coord-badge').textContent =
        'x=' + pose.x.toFixed(1) + ', z=' + pose.z.toFixed(1) + ', y=' + pose.eyeHeightM.toFixed(2) + 'm · ' + pose.headingDeg.toFixed(1) + '° ' + card;

      const extUrl = buildExternalGmapsUrl(pose);
      document.getElementById('btn-external-gmaps-free').href = extUrl;

      syncLiveGameIframe();

      if (triggerAutoSv && document.getElementById('chk-auto-sync-sv').checked && leftSource === 'live-streetview') {
        clearTimeout(svAutoSyncTimer);
        svAutoSyncTimer = setTimeout(() => {
          ensureStreetViewLoadedAndSynced('auto-sync-debounced');
        }, 800);
      }
    }

    function renderLocationView() {
      const loc = DATA.locations[currentLocIndex];
      if (!loc) return;

      const vpId = document.getElementById('select-qa-viewport').value;
      const lightId = document.getElementById('select-qa-lighting').value;
      const capKey = vpId + '__' + lightId;
      const cap = loc.capturesByKey[capKey] || loc.capturesByKey['desktop__midday'] || Object.values(loc.capturesByKey)[0];
      const rightImg = document.getElementById('right-game-img');
      const rightIframe = document.getElementById('right-game-iframe');

      if (rightSource === 'live-game') {
        rightImg.style.display = 'none';
        rightIframe.style.display = 'block';
        if (!rightIframe.src) {
          rightIframe.src = DATA.liveGameUrl;
          rightIframe.onload = () => setTimeout(syncLiveGameIframe, 1200);
        } else {
          syncLiveGameIframe();
        }
        document.getElementById('right-pane-subtitle').textContent = 'Live 3D WebGL Engine (Synced)';
      } else {
        rightIframe.style.display = 'none';
        rightImg.style.display = 'block';
        if (cap?.relativePath) {
          rightImg.src = cap.relativePath;
          document.getElementById('overlay-base-img').src = cap.relativePath;
        }
        document.getElementById('right-pane-subtitle').textContent =
          'HUD-Clean Capture (' + vpId + ' · ' + lightId + ')';
      }

      // Left pane rendering
      const leftImg = document.getElementById('left-ref-img');
      const svMount = document.getElementById('streetview-mount');
      const notice = document.getElementById('left-missing-notice');

      if (leftSource === 'live-streetview') {
        leftImg.style.display = 'none';
        document.getElementById('left-pane-subtitle').textContent = 'Official Google Maps Street View (Live API)';
        ensureStreetViewLoadedAndSynced('location-switch');
      } else if (leftSource === 'user-file' && userUploadedDataUrl) {
        svMount.classList.remove('active');
        notice.style.display = 'none';
        leftImg.style.display = 'block';
        leftImg.src = userUploadedDataUrl;
        document.getElementById('overlay-top-img').src = userUploadedDataUrl;
        document.getElementById('left-pane-subtitle').textContent = 'Local Photo: ' + userUploadedName;
      } else if (loc.localReferencePhoto && loc.localReferencePhoto.src) {
        svMount.classList.remove('active');
        notice.style.display = 'none';
        leftImg.style.display = 'block';
        leftImg.src = loc.localReferencePhoto.src;
        document.getElementById('overlay-top-img').src = loc.localReferencePhoto.src;
        document.getElementById('left-pane-subtitle').textContent =
          loc.localReferencePhoto.filename + ' (' + loc.localReferencePhoto.licence + ')';
      } else {
        svMount.classList.remove('active');
        leftImg.style.display = 'none';
        notice.style.display = 'flex';
        const extUrl = buildExternalGmapsUrl(pose);
        const commonsRec = (loc.provenanceRecords || []).find((r) => r.sourceUrl);
        notice.innerHTML =
          '<span class="badge badge-missing">NO LOCAL STREET-LEVEL PHOTO FILE ON FEDORA DISK</span>' +
          '<div style="font-weight:700;font-size:0.95rem;">' + loc.title + ' (' + loc.street + ')</div>' +
          '<div style="color:var(--muted);">' +
            'Checked local Fedora directories, <code>docs/narromine/</code>, and <code>data/narromine-photo-references.json</code>. ' +
            'No fabricated image is shown. Choose a live or external reference below:' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.35rem;">' +
            '<a class="btn btn-free" href="' + extUrl + '" target="_blank" rel="noopener noreferrer">🌐 Open Exact Synced Street View Tab ($0.00 FREE)</a>' +
            '<button class="btn btn-cost" type="button" id="btn-inline-sv">⚡ Connect Live Street View Here ($0.014 USD)</button>' +
            (commonsRec
              ? '<a class="btn" href="' + commonsRec.sourceUrl + '" target="_blank" rel="noopener noreferrer">📷 View Wikimedia Commons Photo (' + commonsRec.originalFilename + ')</a>'
              : '') +
          '</div>';
        setTimeout(() => {
          const b = document.getElementById('btn-inline-sv');
          if (b) b.onclick = () => ensureStreetViewLoadedAndSynced('inline-connect-button');
        }, 0);
      }

      rightImg.onload = () => {
        if (viewMode === 'difference') renderStructuralDifference();
      };

      // Update Provenance Box
      const provBox = document.getElementById('location-provenance-box');
      if (!loc.provenanceRecords?.length) {
        provBox.innerHTML =
          '<p style="color:var(--muted);margin:0;">No pre-catalogued local photographs for this location. Use Live Street View sync (<code>' +
          pose.lat.toFixed(6) + ', ' + pose.lon.toFixed(6) +
          '</code>) or load a local photograph from disk.</p>';
      } else {
        provBox.innerHTML = loc.provenanceRecords.map((r) => (
          '<div style="padding:0.5rem 0;border-bottom:1px solid var(--border);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.35rem;">' +
              '<strong>' + r.originalFilename + '</strong>' +
              '<span class="badge ' + (r.localExists ? 'badge-local' : 'badge-missing') + '">' + r.availabilityStatus + '</span>' +
            '</div>' +
            '<div style="color:var(--muted);margin-top:0.2rem;">' +
              'Date: ' + r.captureDate + ' · Source: ' + r.source + '<br/>' +
              'Permission: ' + r.licenceOrPermission + '<br/>' +
              'Confidence: ' + r.matchingConfidence +
            '</div>' +
          '</div>'
        )).join('');
      }

      // Update Side-by-Side Comparison Table (Section 2)
      document.getElementById('comparison-table-heading').textContent =
        loc.title + ' — Real Narromine vs Repository Town Comparison';
      document.getElementById('comparison-table-body').innerHTML =
        '<tr>' +
          '<td><strong>Original Photograph / Reference</strong></td>' +
          '<td>' +
            (loc.localReferencePhoto
              ? '<strong>' + loc.localReferencePhoto.filename + '</strong> (' + loc.localReferencePhoto.licence + ', ' + loc.localReferencePhoto.captureDate + ')'
              : 'Live Google Street View panorama at <code>' + pose.lat.toFixed(6) + ', ' + pose.lon.toFixed(6) + '</code> (no local street-level JPG on Fedora disk)') +
          '</td>' +
          '<td>Matching HUD-clean WebGL capture <code>' + (cap?.relativePath || 'live 3D render') + '</code> at commit <code>' + DATA.git.shortSha + '</code></td>' +
        '</tr>' +
        '<tr>' +
          '<td><strong>Architectural Details</strong></td>' +
          '<td><ul style="margin:0;padding-left:1.1rem;">' + loc.architecturalFocus.map((f) => '<li>' + f + '</li>').join('') + '</ul></td>' +
          '<td>' +
            'Building IDs: <code>' + (loc.buildingIds.join(', ') || 'streetscape') + '</code><br/>' +
            'Responsible modules: <code>' + loc.responsibleFiles.join(', ') + '</code><br/>' +
            'Active agent coordination: ' + (loc.activeAgentClaims.join('; ') || 'Unclaimed') +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td><strong>Camera Location &amp; Direction</strong></td>' +
          '<td>' +
            'WGS84: <code>' + pose.lat.toFixed(7) + ', ' + pose.lon.toFixed(7) + '</code><br/>' +
            'Compass Heading: <code>' + pose.headingDeg.toFixed(2) + '° (' + cardinalFromHeading(pose.headingDeg) + ')</code> · Pitch: <code>' + pose.pitchDeg.toFixed(2) + '°</code><br/>' +
            'Confidence: ' + loc.cameraConfidence + '<br/>' +
            '<span style="color:var(--muted);">' + loc.focalLengthNote + '</span>' +
          '</td>' +
          '<td>' +
            'Repository Town World: <code>x = ' + pose.x.toFixed(2) + ' m, z = ' + pose.z.toFixed(2) + ' m, eye = ' + pose.eyeHeightM.toFixed(2) + ' m</code><br/>' +
            'Yaw: <code>' + headingToYaw(pose.headingDeg).toFixed(4) + ' rad</code> · Pitch: <code>' + ((pose.pitchDeg * Math.PI) / 180).toFixed(4) + ' rad</code> · FOV: <code>' + pose.fovDeg.toFixed(1) + '°</code>' +
          '</td>' +
        '</tr>';
    }

    function renderDiscrepancyTable() {
      const filterMode = document.getElementById('filter-discrepancy-loc').value;
      const activeLoc = DATA.locations[currentLocIndex];
      const list = filterMode === 'current' && activeLoc
        ? discrepancies.filter((d) => d.locationId === activeLoc.id)
        : discrepancies;

      const tbody = document.getElementById('discrepancy-tbody');
      tbody.innerHTML = list.map((d) => {
        const clsBadge =
          d.classification === 'Verified mismatch'
            ? 'badge-verified'
            : d.classification === 'Likely mismatch'
            ? 'badge-likely'
            : 'badge-insufficient';
        return (
          '<tr>' +
            '<td><strong>' + d.id + '</strong><br/><span class="badge ' + clsBadge + '">' + d.severity + ' (' + d.visualImpactScore + '/10)</span></td>' +
            '<td><strong>' + d.buildingName + '</strong><br/><code>' + d.buildingId + '</code><br/><span style="color:var(--muted);">' + d.address + '</span></td>' +
            '<td><code>' + d.category + '</code><br/><span class="badge ' + clsBadge + '" style="margin-top:0.25rem;">' + d.classification + '</span></td>' +
            '<td>' + d.observedDiscrepancy + '</td>' +
            '<td>' + d.evidenceAndUncertainty + '<br/><span style="color:var(--muted);font-size:0.74rem;">Ref: ' + d.realPhotoRef + ' ↔ ' + d.inGameScreenshotRef + '</span></td>' +
            '<td>' + d.suggestedCorrection + '</td>' +
            '<td><code>' + (d.responsibleFiles || []).join(', ') + '</code><br/><span style="color:' + (d.claimedByOtherAgent ? '#fcd34d' : '#86efac') + ';font-size:0.75rem;">' +
              (d.claimedByOtherAgent ? '⚠️ Claimed: ' : '✅ ') + (d.agentClaimRef || '') +
            '</span></td>' +
          '</tr>'
        );
      }).join('');
    }

    // ── Build Location Tabs ──
    const tabsEl = document.getElementById('location-tabs');
    tabsEl.innerHTML = DATA.locations.map((loc, idx) => (
      '<button class="loc-tab' + (idx === 0 ? ' active' : '') + '" data-idx="' + idx + '">' +
        '<span class="loc-tab-title">' + loc.shortLabel + '</span>' +
        '<span class="loc-tab-sub">' + loc.camera.lat.toFixed(5) + ', ' + loc.camera.lon.toFixed(5) + ' · ' + loc.camera.headingDeg.toFixed(0) + '° ' + loc.camera.cardinal + '</span>' +
      '</button>'
    )).join('');
    tabsEl.querySelectorAll('.loc-tab').forEach((btn) => {
      btn.addEventListener('click', () => selectLocation(Number(btn.dataset.idx)));
    });

    // ── View Mode Switching ──
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewMode = btn.dataset.viewmode;
        document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b === btn));
        document.getElementById('stage-side-by-side').style.display = viewMode === 'side-by-side' ? 'grid' : 'none';
        document.getElementById('stage-overlay').classList.toggle('active', viewMode === 'overlay');
        document.getElementById('stage-difference').classList.toggle('active', viewMode === 'difference');
        if (viewMode === 'difference') renderStructuralDifference();
      });
    });

    // ── Source Selectors ──
    document.getElementById('select-left-source').addEventListener('change', (e) => {
      leftSource = e.target.value;
      renderLocationView();
    });
    document.getElementById('select-right-source').addEventListener('change', (e) => {
      rightSource = e.target.value;
      renderLocationView();
    });
    document.getElementById('select-qa-viewport').addEventListener('change', renderLocationView);
    document.getElementById('select-qa-lighting').addEventListener('change', () => {
      renderLocationView();
      syncLiveGameIframe();
    });
    document.getElementById('chk-hide-game-hud').addEventListener('change', syncLiveGameIframe);
    document.getElementById('chk-car-height-preset').addEventListener('change', () => selectLocation(currentLocIndex));

    // ── Camera Sliders (Sync Game X/Z <-> Real Lat/Lon) ──
    for (const id of ['slider-cam-x', 'slider-cam-z', 'slider-cam-eye', 'slider-cam-heading', 'slider-cam-pitch', 'slider-cam-fov']) {
      document.getElementById(id).addEventListener('input', () => {
        pose.x = Number(document.getElementById('slider-cam-x').value);
        pose.z = Number(document.getElementById('slider-cam-z').value);
        const g = worldToGeo(pose.x, pose.z);
        pose.lat = g.lat;
        pose.lon = g.lon;
        pose.eyeHeightM = Number(document.getElementById('slider-cam-eye').value);
        pose.headingDeg = Number(document.getElementById('slider-cam-heading').value);
        pose.pitchDeg = Number(document.getElementById('slider-cam-pitch').value);
        pose.fovDeg = Number(document.getElementById('slider-cam-fov').value);
        updateControlsFromPose(true);
      });
    }

    // ── Overlay Wipe, Opacity, Zoom & Alignment Controls ──
    document.getElementById('slider-wipe').addEventListener('input', (e) => {
      const pct = Number(e.target.value);
      document.getElementById('val-wipe').textContent = pct + '%';
      document.getElementById('overlay-top-img').style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      document.getElementById('overlay-wipe-line').style.left = pct + '%';
    });
    document.getElementById('slider-opacity').addEventListener('input', (e) => {
      const pct = Number(e.target.value);
      document.getElementById('val-opacity').textContent = pct + '%';
      document.getElementById('overlay-top-img').style.opacity = String(pct / 100);
    });
    document.getElementById('slider-zoom').addEventListener('input', (e) => {
      pose.zoom = Number(e.target.value);
      document.getElementById('val-zoom').textContent = pose.zoom + '%';
      const scale = pose.zoom / 100;
      document.getElementById('left-zoom-layer').style.transform =
        'translate(' + pose.alignX + 'px, ' + pose.alignY + 'px) scale(' + (scale * (pose.alignScale / 100)) + ')';
      document.getElementById('right-zoom-layer').style.transform = 'scale(' + scale + ')';
    });
    for (const id of ['slider-align-x', 'slider-align-y', 'slider-align-scale']) {
      document.getElementById(id).addEventListener('input', () => {
        pose.alignX = Number(document.getElementById('slider-align-x').value);
        pose.alignY = Number(document.getElementById('slider-align-y').value);
        pose.alignScale = Number(document.getElementById('slider-align-scale').value);
        document.getElementById('lbl-align-xy').textContent =
          pose.alignX + ', ' + pose.alignY + ' (' + pose.alignScale + '%)';
        const scale = (pose.zoom / 100) * (pose.alignScale / 100);
        document.getElementById('left-zoom-layer').style.transform =
          'translate(' + pose.alignX + 'px, ' + pose.alignY + 'px) scale(' + scale + ')';
      });
    }
    document.getElementById('btn-reset-zoom').addEventListener('click', () => {
      pose.zoom = 100; pose.alignX = 0; pose.alignY = 0; pose.alignScale = 100;
      document.getElementById('slider-zoom').value = '100';
      document.getElementById('val-zoom').textContent = '100%';
      document.getElementById('slider-align-x').value = '0';
      document.getElementById('slider-align-y').value = '0';
      document.getElementById('slider-align-scale').value = '100';
      document.getElementById('lbl-align-xy').textContent = '0, 0 (100%)';
      document.getElementById('left-zoom-layer').style.transform = '';
      document.getElementById('right-zoom-layer').style.transform = '';
    });

    document.getElementById('chk-show-reticle').addEventListener('change', (e) => {
      document.getElementById('left-reticle').style.display = e.target.checked ? 'block' : 'none';
      document.getElementById('right-reticle').style.display = e.target.checked ? 'block' : 'none';
    });
    document.getElementById('chk-show-anchors').addEventListener('change', renderAnchors);

    // ── Street View Buttons & Cost Drawer ──
    document.getElementById('btn-manual-sync-sv').addEventListener('click', () => {
      ensureStreetViewLoadedAndSynced('manual-top-button');
    });
    document.getElementById('btn-connect-sv').addEventListener('click', () => {
      ensureStreetViewLoadedAndSynced('connect-key-button');
    });
    document.getElementById('btn-toggle-cost-log').addEventListener('click', () => {
      const d = document.getElementById('api-cost-log-drawer');
      d.style.display = d.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('input-budget-cap').addEventListener('change', (e) => {
      costState.budgetCapUsd = Math.max(0.05, Number(e.target.value) || 0.50);
      document.getElementById('cost-cap-label').textContent = '$' + costState.budgetCapUsd.toFixed(2) + ' USD';
    });
    document.getElementById('chk-auto-sync-sv').addEventListener('change', (e) => {
      const pill = document.getElementById('cost-pill-status');
      if (e.target.checked) {
        pill.textContent = '⚡ API Guard: AUTO-SYNC ON (800ms debounce)';
        pill.classList.remove('zero-cost');
      } else {
        pill.textContent = '🛡️ API Guard: MANUAL CLICK-TO-CALL';
        pill.classList.add('zero-cost');
      }
    });

    // ── Local Photo File Loader ──
    document.getElementById('input-local-photo-file').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        userUploadedDataUrl = reader.result;
        userUploadedName = file.name;
        leftSource = 'user-file';
        document.getElementById('select-left-source').value = 'user-file';
        renderLocationView();
      };
      reader.readAsDataURL(file);
    });

    // ── Reset & Copy Pose ──
    document.getElementById('btn-reset-pose').addEventListener('click', () => selectLocation(currentLocIndex));
    document.getElementById('btn-copy-pose-json').addEventListener('click', () => {
      const json = JSON.stringify(pose, null, 2);
      navigator.clipboard?.writeText(json).catch(() => {});
      alert('Copied synced camera pose JSON to clipboard:\\n' + json);
    });

    // ── Export Side-by-Side Comparison PNG (Section 4.F) ──
    document.getElementById('btn-export-side-by-side').addEventListener('click', () => {
      const loc = DATA.locations[currentLocIndex];
      const c = document.createElement('canvas');
      c.width = 1600; c.height = 560;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0b1017';
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = '#e7eef8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('REAL NARROMINE vs REPOSITORY TOWN — ' + (loc?.title || ''), 24, 32);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '13px monospace';
      ctx.fillText(
        'Synced Pose: WGS84 (' + pose.lat.toFixed(6) + ', ' + pose.lon.toFixed(6) + ') <-> Game (' +
        pose.x.toFixed(1) + ', ' + pose.z.toFixed(1) + ', eye=' + pose.eyeHeightM.toFixed(2) + 'm) | Heading ' +
        pose.headingDeg.toFixed(1) + '° | Pitch ' + pose.pitchDeg.toFixed(1) + '° | FOV ' + pose.fovDeg.toFixed(0) + '°',
        24, 54
      );

      const leftImg = document.getElementById('left-ref-img');
      const rightImg = document.getElementById('right-game-img');
      if (leftImg.style.display !== 'none' && leftImg.complete && leftImg.naturalWidth) {
        ctx.drawImage(leftImg, 24, 70, 760, 470);
      } else {
        ctx.fillStyle = '#131b26';
        ctx.fillRect(24, 70, 760, 470);
        ctx.fillStyle = '#fcd34d';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Live Street View / External Reference Mode (Google pixels not exported per ToS)', 48, 290);
      }
      if (rightImg.complete && rightImg.naturalWidth) {
        ctx.drawImage(rightImg, 816, 70, 760, 470);
      }

      const a = document.createElement('a');
      a.download = 'narromine-compare-' + (loc?.id || 'view') + '.png';
      a.href = c.toDataURL('image/png');
      a.click();
    });

    // ── Export Discrepancy Register & Cost Audit JSON ──
    document.getElementById('btn-export-discrepancies').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ discrepancies, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.download = 'narromine-discrepancy-register.json';
      a.href = URL.createObjectURL(blob);
      a.click();
    });
    document.getElementById('btn-export-cost-log').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(costState, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.download = 'narromine-streetview-api-cost-audit.json';
      a.href = URL.createObjectURL(blob);
      a.click();
    });

    // ── Discrepancy Filter & Add Form ──
    document.getElementById('filter-discrepancy-loc').addEventListener('change', renderDiscrepancyTable);
    document.getElementById('form-add-discrepancy').addEventListener('submit', (e) => {
      e.preventDefault();
      const loc = DATA.locations[currentLocIndex];
      const [sev, score] = document.getElementById('disc-severity').value.split('|');
      const newEntry = {
        id: 'DISC-NR-' + String(discrepancies.length + 1).padStart(3, '0'),
        locationId: loc.id,
        buildingId: document.getElementById('disc-building-id').value.trim(),
        buildingName: loc.title,
        address: loc.street,
        category: document.getElementById('disc-category').value,
        classification: document.getElementById('disc-classification').value,
        severity: sev,
        visualImpactScore: Number(score),
        realPhotoRef: 'Synced Pose (' + pose.lat.toFixed(6) + ', ' + pose.lon.toFixed(6) + ', heading ' + pose.headingDeg.toFixed(1) + '°)',
        inGameScreenshotRef: 'Game (' + pose.x.toFixed(1) + ', ' + pose.z.toFixed(1) + ')',
        observedDiscrepancy: document.getElementById('disc-observed').value.trim(),
        evidenceAndUncertainty: 'Recorded interactively at matched camera pose.',
        suggestedCorrection: document.getElementById('disc-correction').value.trim(),
        responsibleFiles: loc.responsibleFiles,
        claimedByOtherAgent: loc.activeAgentClaims.length > 0,
        agentClaimRef: loc.activeAgentClaims.join('; ') || 'Unclaimed',
      };
      discrepancies.unshift(newEntry);
      document.getElementById('disc-observed').value = '';
      document.getElementById('disc-correction').value = '';
      renderDiscrepancyTable();
    });

    // Auto-populate API key if passed via ?gmapsKey=... in URL
    const initUrlKey = new URLSearchParams(location.search).get('gmapsKey');
    if (initUrlKey) {
      document.getElementById('input-gmaps-key').value = initUrlKey;
    }

    renderAnchors();
    selectLocation(0);
  })();
  </script>
</body>
</html>`;
}
