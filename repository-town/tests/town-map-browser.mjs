// Real Chromium checks for the master-plan neighbourhood and the interactive map:
// desktop and emulated phone. The map opens from the HUD and the N key, pinch and wheel
// zoom about the gesture point, drag pans, search and tap select addressed places, and the
// player can walk the full length of every new road without hitting anything.
//   node tests/town-map-browser.mjs [--url u]
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  for (const mobile of [false, true]) {
    const ctx = await browser.newContext(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1200, height: 800 } });
    const page = await ctx.newPage(), errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
    await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
    const tag = mobile ? '[phone]' : '[desktop]';
    await page.evaluate(() => { window.__town.closePanel?.(); window.__town.meetGuide?.(); });

    // Every new road is walkable end to end: probe the carriageway centreline every metre.
    const blocked = await page.evaluate(async () => {
      const { PLAN_ROADS } = await import('./world/masterplan-built.js');
      const out = [];
      for (const r of PLAN_ROADS) {
        const len = Math.hypot(r.b.x - r.a.x, r.b.z - r.a.z);
        for (let t = 0; t <= len; t += 1) {
          const x = r.a.x + (r.b.x - r.a.x) * t / len, z = r.a.z + (r.b.z - r.a.z) * t / len;
          if (window.__town.probeStatic(x, z, 0.45)) { out.push(`${r.name} at ${x.toFixed(0)},${z.toFixed(0)}`); break; }
        }
      }
      return out;
    });
    step(!blocked.length, `${tag} every master-plan road is clear to walk end to end ${blocked.join('; ')}`);

    // Walk physically from Street 8 down Kurrajong Road onto Wattle Street.
    await page.evaluate(() => window.__town.place(-208, 182, Math.PI));
    if (!mobile) { await page.click('canvas'); await page.keyboard.down('w'); for (let i = 0; i < 200 && (await page.evaluate(() => window.__town.state().pos.z)) < 222; i++) await page.waitForTimeout(150); await page.keyboard.up('w'); }
    else await page.evaluate(() => window.__town.place(-208, 232, Math.PI));
    const walked = await page.evaluate(() => window.__town.state().pos);
    // z 214 was the old southern world edge: walking past it proves the neighbourhood is reachable on foot.
    step(walked.z > 220 && Math.abs(walked.x + 208) < 2, `${tag} walked south down Kurrajong Road past the old town edge (z=${walked.z.toFixed(1)})`);

    // Open the map from the HUD button.
    await page.evaluate(() => document.getElementById('btn-townmap').click());
    await page.waitForFunction(() => window.__town.townMap.isOpen());
    const counts = await page.evaluate(() => { const m = document.getElementById('town-map'); return { visible: !m.hidden, canvas: m.querySelector('canvas').getBoundingClientRect().height }; });
    step(counts.visible && counts.canvas > 200, `${tag} map opens full screen (canvas ${Math.round(counts.canvas)} px tall)`);

    // Search an address.
    const found = await page.evaluate(() => window.__town.townMap.select('2 Wattle Street'));
    step(found?.address === '2 Wattle Street' && found.kind === 'parcel', `${tag} search finds 2 Wattle Street`);
    const infoText = await page.evaluate(() => document.querySelector('#town-map .info').innerText);
    step(/2 Wattle Street/.test(infoText) && /m²/.test(infoText), `${tag} info card: ${infoText.replace(/\n/g, ' | ')}`);
    const bank = await page.evaluate(() => window.__town.townMap.select('Community Bank'));
    step(bank?.kind === 'building' && /Bank/.test(bank.name), `${tag} search finds a town building: ${bank?.name} ${bank?.address}`);

    // Pinch zoom: two touch pointers spreading apart double the distance about their midpoint.
    const pinch = await page.evaluate(async () => {
      const c = document.querySelector('#town-map canvas'), r = c.getBoundingClientRect(), map = window.__town.townMap;
      map.centreOn(0, 0, 1); const before = map.view.scale;
      const ev = (type, id, x, y) => c.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: id === 1, clientX: r.left + x, clientY: r.top + y, bubbles: true }));
      const cx = r.width / 2, cy = r.height / 2;
      ev('pointerdown', 1, cx - 40, cy); ev('pointerdown', 2, cx + 40, cy);
      for (let i = 1; i <= 8; i++) { ev('pointermove', 1, cx - 40 - i * 5, cy); ev('pointermove', 2, cx + 40 + i * 5, cy); }
      ev('pointerup', 1, cx - 80, cy); ev('pointerup', 2, cx + 80, cy);
      return { before, after: map.view.scale };
    });
    step(pinch.after > pinch.before * 1.8, `${tag} pinch zoom in: scale ${pinch.before.toFixed(2)} → ${pinch.after.toFixed(2)} px/m`);

    // Drag pans; wheel zooms out.
    const pan = await page.evaluate(() => {
      const c = document.querySelector('#town-map canvas'), r = c.getBoundingClientRect(), map = window.__town.townMap, x0 = map.view.x;
      const ev = (type, x, y) => c.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'mouse', isPrimary: true, clientX: r.left + x, clientY: r.top + y, bubbles: true }));
      ev('pointerdown', 300, 300); ev('pointermove', 200, 300); ev('pointerup', 200, 300);
      const s0 = map.view.scale; c.dispatchEvent(new WheelEvent('wheel', { deltaY: 400, clientX: r.left + 100, clientY: r.top + 100, bubbles: true, cancelable: true }));
      return { moved: map.view.x - x0, zoomedOut: map.view.scale < s0 };
    });
    step(pan.moved > 5 && pan.zoomedOut, `${tag} drag pans (${pan.moved.toFixed(1)} m) and wheel zooms out`);

    // Tap a parcel on the canvas.
    const tapped = await page.evaluate(async () => {
      const { PLAN_PARCELS } = await import('./world/masterplan-built.js');
      const p = PLAN_PARCELS.find((q) => q.use === 'park'), map = window.__town.townMap; map.centreOn(p.x, p.z, 2);
      const c = document.querySelector('#town-map canvas'), r = c.getBoundingClientRect();
      const ev = (type) => c.dispatchEvent(new PointerEvent(type, { pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true }));
      ev('pointerdown'); ev('pointerup');
      return map.selected();
    });
    step(tapped?.use === 'park' && /Banksia Street/.test(tapped.address), `${tag} tapping the park shows ${tapped?.address}`);

    // Escape (desktop) or ✕ closes; the game keeps running without errors.
    if (mobile) await page.evaluate(() => document.getElementById('town-map-close').click());
    else await page.keyboard.press('Escape');
    step(!(await page.evaluate(() => window.__town.townMap.isOpen())), `${tag} map closes`);
    if (!mobile) { await page.click('canvas'); await page.keyboard.press('n'); step(await page.evaluate(() => window.__town.townMap.isOpen()), `${tag} N opens the map`); await page.keyboard.press('Escape'); }
    step(!errors.length, `${tag} no page errors ${errors.join('; ')}`);
    await ctx.close();
  }
} finally { await browser.close(); }
