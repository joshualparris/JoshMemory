// Generates the labelled PNG contact sheet and self-contained HTML report for Narromine Visual QA.
import fs from 'node:fs';
import path from 'node:path';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Renders a labelled PNG contact sheet (contact-sheet.png) using Playwright's browser canvas
 * so every location, viewport, lighting preset, coordinate, and metric is clearly readable.
 */
export async function renderContactSheetPng({ browser, manifest, outputDir }) {
  const page = await browser.newPage({
    viewport: { width: 1960, height: 1400 },
    deviceScaleFactor: 1,
  });
  try {
    const cardsHtml = [];
    for (const loc of manifest.locations) {
      const locCaptures = manifest.captures.filter((c) => c.locationId === loc.id);
      const cellHtml = locCaptures
        .map((c) => {
          const absImg = path.join(outputDir, c.image.relativePath);
          const b64 = fs.existsSync(absImg)
            ? fs.readFileSync(absImg).toString('base64')
            : '';
          const badgeColor = c.diagnostics.passed ? '#166534' : '#991b1b';
          const badgeText = c.diagnostics.passed ? 'PASS' : 'FAIL';
          return `
            <div class="shot-cell">
              <div class="shot-header">
                <span class="shot-tag">${esc(c.viewport.toUpperCase())} · ${esc(c.timeLabel)} (${esc(c.lighting)})</span>
                <span class="shot-badge" style="background:${badgeColor}">${badgeText}</span>
              </div>
              <div class="shot-img-wrap">
                ${b64 ? `<img src="data:image/png;base64,${b64}" alt="${esc(c.id)}" />` : '<div class="missing">MISSING</div>'}
              </div>
              <div class="shot-meta">
                ${c.image.width}×${c.image.height} · ${c.metrics.fps.toFixed(1)} fps · p95 ${c.metrics.frameTimeMs.p95.toFixed(1)}ms · ${c.metrics.drawCalls} calls · ${(c.metrics.triangles / 1000).toFixed(1)}k tris · luma ${c.image.lumaMean}
              </div>
            </div>
          `;
        })
        .join('\n');

      cardsHtml.push(`
        <section class="loc-row">
          <div class="loc-info">
            <h2>${esc(loc.order)}. ${esc(loc.title)}</h2>
            <div class="loc-sub">${esc(loc.street)}</div>
            <div class="loc-coords">
              Camera: (${loc.camera.x.toFixed(2)}, ${loc.camera.z.toFixed(2)}) ·
              Target: (${loc.target.x.toFixed(2)}, ${loc.target.z.toFixed(2)}) ·
              Yaw: ${loc.camera.yawRad.toFixed(4)} rad ·
              Heading: ${loc.camera.headingDeg.toFixed(1)}° (${esc(loc.camera.cardinal)})
            </div>
          </div>
          <div class="shot-grid">${cellHtml}</div>
        </section>
      `);
    }

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0f172a;
    color: #f8fafc;
    padding: 20px;
    width: 1920px;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 14px 20px;
    margin-bottom: 16px;
  }
  header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; }
  header .meta { font-size: 13px; color: #94a3b8; text-align: right; line-height: 1.5; }
  .loc-row {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 14px;
  }
  .loc-info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
    border-bottom: 1px solid #334155;
    padding-bottom: 6px;
  }
  .loc-info h2 { font-size: 16px; color: #e2e8f0; }
  .loc-sub { font-size: 13px; color: #38bdf8; font-weight: 600; }
  .loc-coords { font-size: 12px; font-family: monospace; color: #cbd5e1; }
  .shot-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }
  .shot-cell {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 6px;
    display: flex;
    flex-direction: column;
  }
  .shot-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #e2e8f0;
  }
  .shot-badge {
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
    color: #fff;
  }
  .shot-img-wrap {
    height: 168px;
    background: #020617;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 4px;
  }
  .shot-img-wrap img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .shot-meta {
    margin-top: 5px;
    font-size: 10px;
    font-family: monospace;
    color: #94a3b8;
    line-height: 1.35;
  }
</style>
</head>
<body>
  <header>
    <div>
      <h1>Narromine Visual QA — Contact Sheet (${manifest.captures.length} Captures)</h1>
      <div style="font-size:13px;color:#cbd5e1;margin-top:4px;">
        Deterministic Desktop &amp; Mobile WebGL captures across Morning (08:00), Midday (12:30), and Late Afternoon (16:45)
      </div>
    </div>
    <div class="meta">
      <div>Commit SHA: <strong>${esc(manifest.commitSha)}</strong> (${esc(manifest.branch)})</div>
      <div>Generated: ${esc(manifest.generatedAt)} · Status: <strong>${manifest.summary.passed ? 'ALL PASSED' : 'ISSUES DETECTED'}</strong></div>
    </div>
  </header>
  ${cardsHtml.join('\n')}
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    const contactSheetPath = path.join(outputDir, 'contact-sheet.png');
    await page.screenshot({ path: contactSheetPath, fullPage: true });
    return 'contact-sheet.png';
  } finally {
    await page.close();
  }
}

/**
 * Generates a standalone HTML report (report.html) for reviewing each Narromine location,
 * separate desktop & mobile performance diagnostics, daylight progression, and optional baseline comparison.
 */
export function generateHtmlReport({ manifest, comparison = null, outputDir }) {
  const perfDesktop = manifest.performance?.desktop || {};
  const perfMobile = manifest.performance?.mobile || {};

  const renderPerfRow = (label, p) => {
    if (!p || !p.captureCount) {
      return `<tr><td>${esc(label)}</td><td colspan="8">No captures recorded</td></tr>`;
    }
    return `
      <tr>
        <td><strong>${esc(label)}</strong> (${p.captureCount} shots)</td>
        <td>${esc(p.dimensions)}</td>
        <td><strong>${p.meanFps?.toFixed(1) ?? '0.0'}</strong> fps (min ${p.minFps?.toFixed(1) ?? '0.0'})</td>
        <td>p50: ${p.frameTimeMs?.p50?.toFixed(1) ?? '0'} ms · p95: ${p.frameTimeMs?.p95?.toFixed(1) ?? '0'} ms · max: ${p.frameTimeMs?.max?.toFixed(1) ?? '0'} ms</td>
        <td>${p.meanDrawCalls?.toFixed(1) ?? '0'} (max ${p.maxDrawCalls ?? 0})</td>
        <td>${p.meanTriangles?.toLocaleString() ?? '0'} (max ${p.maxTriangles?.toLocaleString() ?? 0})</td>
        <td>${p.browserErrorCount ?? 0}</td>
        <td><span class="badge ${p.browserErrorCount === 0 ? 'pass' : 'fail'}">${p.browserErrorCount === 0 ? 'CLEAN' : 'ERRORS'}</span></td>
      </tr>
    `;
  };

  const cmpById = new Map((comparison?.results || []).map((r) => [r.id, r]));

  const locationSections = manifest.locations
    .map((loc) => {
      const locCaptures = manifest.captures.filter((c) => c.locationId === loc.id);
      const dlDesktop = manifest.daylightChecks?.find(
        (d) => d.locationId === loc.id && d.viewport === 'desktop'
      );
      const dlMobile = manifest.daylightChecks?.find(
        (d) => d.locationId === loc.id && d.viewport === 'mobile'
      );

      const refHtml = loc.referencePhoto
        ? `<div class="ref-box">
             <strong>Verified Reference Photo:</strong> ${esc(loc.referencePhoto.id)} ·
             Licence: ${esc(loc.referencePhoto.licenceOrPermission)} ·
             Source: ${esc(loc.referencePhoto.locallyOwnedFile)}
           </div>`
        : `<div class="ref-box empty">
             <strong>Photographic Reference:</strong> <em>Empty (no verified licensed ground-level photograph in <code>data/narromine-photo-references.json</code>; unverified imagery is never fabricated).</em>
           </div>`;

      const viewportBlocks = ['desktop', 'mobile']
        .map((vp) => {
          const vpCaptures = locCaptures.filter((c) => c.viewport === vp);
          if (!vpCaptures.length) return '';
          const dl = vp === 'desktop' ? dlDesktop : dlMobile;

          const cards = vpCaptures
            .map((c) => {
              const cmp = cmpById.get(c.id);
              const cmpHtml = cmp
                ? `<div class="cmp-box ${cmp.isRegression ? 'fail' : 'pass'}">
                     <div><strong>Baseline vs Candidate:</strong> <code>${esc(cmp.classification)}</code></div>
                     <div>${esc(cmp.summary)}</div>
                     ${
                       cmp.metrics
                         ? `<div class="mono">RMSE: ${cmp.metrics.rmse} · Changed: ${(cmp.metrics.changedRatio * 100).toFixed(2)}% · Edge r: ${cmp.metrics.edgeCorrelation}</div>`
                         : ''
                     }
                     ${
                       cmp.diffRelativePath
                         ? `<div style="margin-top:4px;"><a href="${esc(cmp.diffRelativePath)}" target="_blank">View Diff Heatmap (${esc(cmp.diffRelativePath)})</a></div>`
                         : ''
                     }
                   </div>`
                : '';

              return `
                <div class="capture-card">
                  <div class="capture-head">
                    <span><strong>${esc(c.lighting.toUpperCase())}</strong> · ${esc(c.timeLabel)}</span>
                    <span class="badge ${c.diagnostics.passed ? 'pass' : 'fail'}">${c.diagnostics.passed ? 'PASS' : 'FAIL'}</span>
                  </div>
                  <a href="${esc(c.image.relativePath)}" target="_blank" class="img-link">
                    <img src="${esc(c.image.relativePath)}" alt="${esc(c.id)}" loading="lazy" />
                  </a>
                  <div class="capture-stats mono">
                    <div>Dims: ${c.image.width}×${c.image.height} (${(c.image.byteSize / 1024).toFixed(1)} KB)</div>
                    <div>FPS: ${c.metrics.fps.toFixed(1)} (1% low ${c.metrics.low1Fps.toFixed(1)}) · p50 ${c.metrics.frameTimeMs.p50.toFixed(1)}ms / p95 ${c.metrics.frameTimeMs.p95.toFixed(1)}ms</div>
                    <div>WebGL: ${c.metrics.drawCalls} draw calls · ${c.metrics.triangles.toLocaleString()} triangles</div>
                    <div>Luma: ${c.image.lumaMean} (σ=${c.image.lumaStdDev}) · RGB: [${c.image.meanRgb.join(', ')}]</div>
                    <div>Sun Y: ${c.solar?.sunlight?.y?.toFixed(2) ?? 'n/a'} · Intensity: ${c.solar?.sunlight?.intensity?.toFixed(2) ?? 'n/a'}</div>
                    <div>Pose Δ: ${(c.camera.poseError ?? 0).toFixed(5)} · SHA256: ${c.image.sha256.slice(0, 12)}…</div>
                  </div>
                  ${
                    c.diagnostics.issues?.length
                      ? `<div class="issues">${c.diagnostics.issues.map(esc).join('<br>')}</div>`
                      : ''
                  }
                  ${cmpHtml}
                </div>
              `;
            })
            .join('\n');

          return `
            <div class="vp-section">
              <div class="vp-header">
                <h4>${vp === 'desktop' ? 'Desktop Viewport (1280×800)' : 'Mobile Viewport (393×852)'}</h4>
                ${
                  dl
                    ? `<span class="badge ${dl.visibleDifference ? 'pass' : 'fail'}">
                         Daylight Δ: ${dl.visibleDifference ? 'VISIBLE' : 'FLAT'}
                         (Luma span ${dl.lumaSpan}, RGB Δ ${dl.maxMeanRgbDelta}, Morning ${dl.morningLuma} / Midday ${dl.middayLuma} / Late Afternoon ${dl.lateAfternoonLuma})
                       </span>`
                    : ''
                }
              </div>
              <div class="capture-grid">${cards}</div>
            </div>
          `;
        })
        .join('\n');

      return `
        <section class="location-card" id="loc-${esc(loc.id)}">
          <div class="location-header">
            <div>
              <h2>${esc(loc.order)}. ${esc(loc.title)}</h2>
              <p class="loc-desc">${esc(loc.description)}</p>
            </div>
            <div class="loc-meta mono">
              <div>Location ID: <strong>${esc(loc.id)}</strong></div>
              <div>Street: ${esc(loc.street)}</div>
              <div>Camera (x, z): (${loc.camera.x.toFixed(2)}, ${loc.camera.z.toFixed(2)})</div>
              <div>Target (x, z): (${loc.target.x.toFixed(2)}, ${loc.target.z.toFixed(2)})</div>
              <div>Yaw: ${loc.camera.yawRad.toFixed(4)} rad · Heading: ${loc.camera.headingDeg.toFixed(1)}° (${esc(loc.camera.cardinal)})</div>
            </div>
          </div>
          ${refHtml}
          ${viewportBlocks}
        </section>
      `;
    })
    .join('\n');

  const comparisonBanner = comparison
    ? `<section class="panel">
         <h2>Baseline Comparison Summary</h2>
         <p>
           Baseline SHA: <code>${esc(comparison.baselineCommitSha)}</code> →
           Candidate SHA: <code>${esc(comparison.candidateCommitSha)}</code> ·
           Compared: <strong>${comparison.totalCompared}</strong> ·
           Identical/Noise: <strong>${comparison.identicalOrNoiseCount}</strong> ·
           Expected Time/Weather/Lighting Shifts: <strong>${comparison.expectedShiftCount}</strong> ·
           Regressions: <strong class="${comparison.regressionCount === 0 ? 'ok-text' : 'err-text'}">${comparison.regressionCount}</strong>
         </p>
       </section>`
    : '';

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Narromine Visual QA Report — ${esc(manifest.commitSha)}</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --pass: #15803d;
      --fail: #b91c1c;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .container { max-width: 1680px; margin: 0 auto; }
    header, .panel, .location-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    h1 { margin: 0 0 6px 0; font-size: 24px; }
    h2 { margin: 0 0 10px 0; font-size: 20px; color: #e2e8f0; }
    h4 { margin: 0; font-size: 15px; color: var(--accent); }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
    }
    .badge.pass { background: var(--pass); }
    .badge.fail { background: var(--fail); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
    th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
    th { background: #0f172a; color: #cbd5e1; }
    .ref-box {
      background: #0f172a;
      border-left: 4px solid var(--accent);
      padding: 8px 12px;
      font-size: 13px;
      margin: 12px 0;
      border-radius: 4px;
    }
    .ref-box.empty { border-left-color: #64748b; color: #cbd5e1; }
    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }
    .loc-desc { margin: 4px 0 0 0; color: #cbd5e1; font-size: 14px; max-width: 900px; }
    .loc-meta { color: var(--muted); text-align: right; }
    .vp-section { margin-top: 16px; }
    .vp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .capture-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 14px;
    }
    .capture-card {
      background: #0f172a;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
    }
    .capture-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .img-link {
      display: block;
      background: #020617;
      border-radius: 6px;
      overflow: hidden;
      height: 240px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .img-link img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .capture-stats { margin-top: 8px; color: #cbd5e1; line-height: 1.45; }
    .issues {
      margin-top: 8px;
      padding: 6px 8px;
      background: rgba(185, 28, 28, 0.25);
      border: 1px solid var(--fail);
      border-radius: 4px;
      font-size: 12px;
      color: #fca5a5;
    }
    .cmp-box {
      margin-top: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .cmp-box.pass { background: rgba(21, 128, 61, 0.2); border: 1px solid var(--pass); }
    .cmp-box.fail { background: rgba(185, 28, 28, 0.25); border: 1px solid var(--fail); }
    .contact-preview { max-width: 100%; border-radius: 6px; border: 1px solid var(--border); margin-top: 8px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .ok-text { color: #4ade80; }
    .err-text { color: #f87171; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Narromine Visual QA &amp; Screenshot Comparison Report</h1>
        <div style="color:var(--muted);font-size:14px;">
          Repository Town · Deterministic 3D Visual Fidelity &amp; WebGL Diagnostic Suite
        </div>
      </div>
      <div class="mono" style="text-align:right;">
        <div>Commit: <strong>${esc(manifest.commitSha)}</strong> (${esc(manifest.branch)})</div>
        <div>Timestamp: ${esc(manifest.generatedAt)}</div>
        <div>Environment: ${esc(manifest.environment?.platform)} · Node ${esc(manifest.environment?.nodeVersion)}</div>
        <div style="margin-top:6px;">
          <span class="badge ${manifest.summary.passed ? 'pass' : 'fail'}">
            ${manifest.summary.passed ? 'ALL CHECKS PASSED' : 'QA ISSUES FOUND'}
            (${manifest.summary.passedCaptures}/${manifest.summary.totalCaptures} captures)
          </span>
        </div>
      </div>
    </header>

    <section class="panel">
      <h2>Desktop vs Mobile Performance &amp; Diagnostic Summary</h2>
      <p style="margin:0 0 8px 0;color:var(--muted);font-size:13px;">
        Measurements are strictly separated between Desktop and Mobile viewports without altering game rendering settings.
        GPU Renderer: <code>${esc(manifest.environment?.gpu || 'WebGL')}</code>
      </p>
      <table>
        <thead>
          <tr>
            <th>Viewport Profile</th>
            <th>Screenshot Dimensions</th>
            <th>Frame Rate (FPS)</th>
            <th>Frame-Time Distribution</th>
            <th>WebGL Draw Calls</th>
            <th>Triangle Count</th>
            <th>Browser Errors</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${renderPerfRow('Desktop', perfDesktop)}
          ${renderPerfRow('Mobile', perfMobile)}
        </tbody>
      </table>
      <div class="mono" style="margin-top:10px;color:#cbd5e1;">
        Camera Reproducibility Check: <strong>${manifest.reproducibilityCheck?.passed ? 'VERIFIED DETERMINISTIC' : 'FAILED'}</strong>
        (pose Δ = ${manifest.reproducibilityCheck?.poseDelta ?? 0}, pixel RMSE = ${manifest.reproducibilityCheck?.pixelRmse ?? 0}) ·
        Daylight Progression Checks: <strong>${manifest.summary.daylightChecksPassed}/${manifest.summary.daylightChecksTotal} passed</strong>
      </div>
    </section>

    ${comparisonBanner}

    ${
      manifest.contactSheet
        ? `<section class="panel">
             <h2>Labelled Contact Sheet</h2>
             <p style="margin:0;font-size:13px;color:var(--muted);">
               Click to open full-resolution contact sheet: <a href="${esc(manifest.contactSheet)}" target="_blank"><code>${esc(manifest.contactSheet)}</code></a>
             </p>
             <a href="${esc(manifest.contactSheet)}" target="_blank">
               <img class="contact-preview" src="${esc(manifest.contactSheet)}" alt="Narromine Visual QA Contact Sheet" loading="lazy" />
             </a>
           </section>`
        : ''
    }

    ${locationSections}
  </div>
</body>
</html>`;

  const reportPath = path.join(outputDir, 'report.html');
  fs.writeFileSync(reportPath, html, 'utf8');
  return 'report.html';
}
