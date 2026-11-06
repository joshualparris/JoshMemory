// NR-REAL-023: performance benchmark along the Narromine route (desktop + Android emulation).
// READ-ONLY QA: reuses the already-merged visual-QA capture helper and the deterministic
// NARROMINE_QA_LOCATIONS poses, so no game source, rendering, LOD or collision code changes.
// It records real requestAnimationFrame frame times (avg fps, 1% low, p95, worst, >50 ms
// hitches), draw calls, triangles, render pixel ratio and GPU per stop, and writes JSON + CSV.
//   node tools/narromine-visual-qa/perf-route.mjs [--url U] [--sample-frames N]
//        [--stops id1,id2] [--viewports desktop,mobile]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { NARROMINE_QA_LOCATIONS, VIEWPORTS, REPO_TOWN_ROOT } from './locations.mjs';
import { positionAndMeasureInPage, resolveChromiumExecutable, startStaticServer } from './run.mjs';
import { frameStats, perfVerdict } from '../../src/ui/perf-meter.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const SAMPLE_FRAMES = Math.max(10, Math.min(300, Number(arg('--sample-frames', 30))));
const MINUTE = 12 * 60 + 30; // midday, matching the visual-QA baseline
const WEATHER = 'clear';
const MIN_TRIANGLES = 1000;
const MIN_CALLS = 5;

function selectViewports(spec) {
  const all = [VIEWPORTS.desktop, VIEWPORTS.mobile];
  if (!spec) return all;
  const ids = new Set(String(spec).split(',').map((s) => s.trim()).filter(Boolean));
  return all.filter((vp) => ids.has(vp.id));
}
function selectStops(spec) {
  if (!spec) return NARROMINE_QA_LOCATIONS;
  const ids = new Set(String(spec).split(',').map((s) => s.trim()).filter(Boolean));
  return NARROMINE_QA_LOCATIONS.filter((loc) => ids.has(loc.id));
}

const outDir = path.join(REPO_TOWN_ROOT, 'test-results', 'narromine-perf');
fs.mkdirSync(outDir, { recursive: true });

const distPublic = path.join(REPO_TOWN_ROOT, 'dist', 'public');
if (!fs.existsSync(path.join(distPublic, 'index.html'))) {
  console.error('dist/public/index.html is missing — run `npm run build` first.');
  process.exit(1);
}

const stops = selectStops(arg('--stops', ''));
const viewports = selectViewports(arg('--viewports', ''));
if (!stops.length) { console.error('No route stops selected.'); process.exit(1); }
if (!viewports.length) { console.error('No viewports selected.'); process.exit(1); }

let serverHandle = null;
const url = arg('--url', process.env.TOWN_URL || '') || (serverHandle = await startStaticServer(distPublic)).url;

const executablePath = resolveChromiumExecutable();
const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const rows = [];
const errors = [];
try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(`${vp.id}: ${String(e?.message || e)}`));
    await page.addInitScript(() => { try { sessionStorage.setItem('town-cheats', '1'); } catch {} });
    await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__town && document.getElementById('loading')?.hidden, null, { timeout: 90000 });
    const ua = await page.evaluate(() => navigator.userAgent);
    const dpr = await page.evaluate(() => window.devicePixelRatio);

    for (const loc of stops) {
      const measured = await positionAndMeasureInPage(page, {
        x: loc.camera.x,
        z: loc.camera.z,
        yawRad: loc.camera.yawRad,
        pitchRad: loc.camera.pitchRad || 0,
        eyeHeightM: loc.camera.eyeHeightM || 1.65,
        fovDeg: loc.camera.fovDeg || 72,
        minute: MINUTE,
        weather: WEATHER,
        sampleFrames: SAMPLE_FRAMES,
        hideHud: true,
      });
      const stats = frameStats(measured.frameTimes);
      rows.push({
        viewport: vp.id,
        viewportSize: `${vp.width}x${vp.height}`,
        deviceScaleFactor: vp.deviceScaleFactor,
        isMobile: vp.isMobile,
        devicePixelRatio: dpr,
        userAgent: ua,
        stop: loc.id,
        stopOrder: loc.order,
        title: loc.title,
        pos: { x: Number(measured.state.pos.x.toFixed(2)), z: Number(measured.state.pos.z.toFixed(2)) },
        narromineVisible: measured.narromineVisible,
        drawCalls: measured.state.calls,
        triangles: measured.state.triangles,
        renderPixelRatio: measured.state.renderPixelRatio,
        gpu: measured.gpu,
        fps: Number(stats.fps.toFixed(2)),
        low1: Number(stats.low1.toFixed(2)),
        p95: Number(stats.p95.toFixed(2)),
        worst: Number(stats.worst.toFixed(2)),
        stutters: stats.stutters,
        seconds: Number(stats.seconds.toFixed(2)),
        verdict: perfVerdict(stats),
      });
      console.log(
        `  ${vp.id} ${loc.id}: ${stats.fps.toFixed(1)} fps · 1% low ${stats.low1.toFixed(1)} · ` +
        `${measured.state.calls} calls · ${measured.state.triangles} tris · ${stats.stutters} hitches · ${perfVerdict(stats)}`
      );
    }
    await context.close();
  }
} finally {
  await browser.close();
  if (serverHandle) await serverHandle.close();
}

const csv = [
  'viewport,stop,order,title,drawCalls,triangles,fps,low1,p95,worst,stutters,seconds,verdict,gpu',
  ...rows
    .slice()
    .sort((a, b) => a.viewport.localeCompare(b.viewport) || a.stopOrder - b.stopOrder)
    .map((r) =>
      [r.viewport, r.stop, r.stopOrder, JSON.stringify(r.title), r.drawCalls, r.triangles,
        r.fps, r.low1, r.p95, r.worst, r.stutters, r.seconds, r.verdict, JSON.stringify(r.gpu)].join(',')
    ),
].join('\n') + '\n';
fs.writeFileSync(path.join(outDir, 'perf-route.csv'), csv);
fs.writeFileSync(
  path.join(outDir, 'perf-route.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      method:
        'Real requestAnimationFrame frame times at deterministic Narromine QA poses (positionAndMeasureInPage). Draw calls, triangles and render pixel ratio come from the live renderer. Desktop 1280x800 and Android 412x915 Chromium emulation; midday clear lighting; town simulation clock frozen for a reproducible per-stop render cost.',
      limitations: [
        'Chromium emulation is not a physical handset.',
        'CI runs software SwiftShader, not a real GPU; absolute fps is not a device benchmark.',
        'The simulation clock is frozen so each stop measures reproducible render cost, not moving-traffic load.',
        'Measurement only: no LOD or culling was changed and no photographic accuracy is claimed.',
      ],
      sampleFrames: SAMPLE_FRAMES,
      minute: MINUTE,
      stops: stops.length,
      viewports: viewports.map((vp) => ({ id: vp.id, width: vp.width, height: vp.height, isMobile: vp.isMobile })),
      rows,
    },
    null,
    2
  ) + '\n'
);

const bad = rows.filter((r) => !r.narromineVisible || r.triangles < MIN_TRIANGLES || r.drawCalls < MIN_CALLS || !(r.fps > 0));
const summary = {};
for (const r of rows) {
  summary[r.viewport] ??= { stops: 0, fps: 0, drawCalls: 0, triangles: 0 };
  summary[r.viewport].stops += 1;
  summary[r.viewport].fps += r.fps;
  summary[r.viewport].drawCalls += r.drawCalls;
  summary[r.viewport].triangles += r.triangles;
}
for (const k of Object.keys(summary)) {
  const n = summary[k].stops;
  summary[k].fps = Number((summary[k].fps / n).toFixed(2));
  summary[k].drawCalls = Math.round(summary[k].drawCalls / n);
  summary[k].triangles = Math.round(summary[k].triangles / n);
}

const pass = bad.length === 0 && errors.length === 0;
console.log(`\n${pass ? 'PASS' : 'FAIL'} NR-REAL-023 performance route: ${rows.length} stop-measurements across ${viewports.length} viewport(s) / ${stops.length} stops`);
for (const [k, v] of Object.entries(summary)) {
  console.log(`  ${k}: mean ${v.fps} fps · ${v.drawCalls} draw calls · ${v.triangles} triangles over ${v.stops} stops`);
}
if (bad.length) {
  console.error('Stops without rendered Narromine geometry or a recorded metric:', bad.map((r) => `${r.stop}@${r.viewport}`));
  process.exitCode = 1;
}
if (errors.length) {
  console.error('Browser page errors:', errors);
  process.exitCode = 1;
}
console.log(`Artifacts: ${path.relative(REPO_TOWN_ROOT, path.join(outDir, 'perf-route.json'))} and perf-route.csv`);
