// Smoke-tests every packed game the way the offline zip runs it (file://):
// the page must load without script errors and show something; Python games
// must answer typed commands.  node tests/games.mjs [--only id,id] [--shots dir] [--http url]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { TOWN } from '../tools/lib.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const only = opt('--only')?.split(',');
const SHOTS = opt('--shots');
const HTTP = opt('--http');
const games = JSON.parse(fs.readFileSync(path.join(TOWN, 'data', 'games.json'), 'utf8')).games.filter((g) => !only || only.includes(g.id));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const results = {};
// Errors from network-only extras (CDNs, analytics, fonts) are not game failures offline.
const benign = /\.(mp3|ogg|wav|m4a)\b|Potential permissions policy violation|net::ERR_|Failed to load resource|ERR_FILE_NOT_FOUND|favicon|fonts\.g|AudioContext|play\(\) failed|NotAllowedError|serviceWorker|ServiceWorker|service worker|manifest/i;

for (const g of games) {
  const file = path.join(TOWN, 'games', g.id, 'index.html');
  const r = { id: g.id, kind: g.kind, errors: [], ok: false };
  results[g.id] = r;
  if (!fs.existsSync(file)) { r.errors.push('not packed'); console.log(`✗ ${g.id}: not packed`); continue; }
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, locale: 'en-US' });
  page.on('pageerror', (e) => { if (!benign.test(e.message) && !offlineOnly(e.message)) r.errors.push('pageerror: ' + e.message.slice(0, 200)); });
  // Games marked online load libraries from a CDN; offline, only their absence is expected.
  const offlineOnly = (m) => g.online && /is not defined|Failed to fetch|NetworkError/.test(m);
  const ignored = (t) => (g.ignoreErrors || []).some((x) => t.includes(x));
  page.on('console', (m) => { if (m.type() === 'error' && !benign.test(m.text()) && !ignored(m.text()) && !offlineOnly(m.text())) r.errors.push('console: ' + m.text().slice(0, 200)); });
  try {
    await page.goto(HTTP ? `${HTTP}/games/${g.id}/index.html` : pathToFileURL(file).href, { waitUntil: 'load', timeout: 30000 });
    if (g.kind === 'python') {
      await page.waitForFunction(() => document.getElementById('status')?.textContent !== 'Loading Python…', null, { timeout: 60000 });
      const first = await page.evaluate(() => document.getElementById('screen').textContent.length);
      for (const cmd of g.test || ['1', 'look', 'help']) {
        if (await page.evaluate(() => document.getElementById('cmd').disabled)) break;
        await page.fill('#cmd', cmd); await page.press('#cmd', 'Enter'); await page.waitForTimeout(400);
      }
      const after = await page.evaluate(() => ({ len: document.getElementById('screen').textContent.length, text: document.getElementById('screen').textContent, err: document.querySelector('#screen .err')?.textContent || '' }));
      r.text = after.text.slice(0, 300);
      if (first < 20) r.errors.push('game printed nothing at start');
      if (after.len <= first) r.errors.push('typed commands produced no output');
      if (after.err) r.errors.push('python: ' + after.err.trim().split('\n').slice(-2).join(' ').slice(0, 300));
    } else {
      await page.waitForTimeout(3000);
      const seen = await page.evaluate(() => ({ text: document.body?.innerText?.trim().length || 0, canvas: document.querySelectorAll('canvas').length, nodes: document.body?.querySelectorAll('*').length || 0 }));
      r.visible = seen;
      if (seen.text < 20 && !seen.canvas) r.errors.push(`page looks empty (${JSON.stringify(seen)})`);
    }
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `game-${g.id}.png`) });
  } catch (e) { r.errors.push('load: ' + e.message.split('\n')[0]); }
  r.ok = !r.errors.length;
  console.log(`${r.ok ? '✓' : '✗'} ${g.id}${r.ok ? '' : ': ' + r.errors.slice(0, 3).join(' | ')}`);
  await page.close();
}
await browser.close();
const out = path.join(TOWN, 'test-results', 'games.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
fs.writeFileSync(out, JSON.stringify({ ...prev, ...results }, null, 1));
console.log(`\n${Object.values(results).filter((r) => r.ok).length}/${games.length} games load cleanly`);
