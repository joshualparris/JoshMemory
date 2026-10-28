// Real Chromium: tap-to-walk (RuneScape engine step 2). A quick tap on the view walks there by an
// A* route; tapping a tree walks up to it and starts chopping; steering by hand cancels the walk;
// a drag still just looks around.
//   node tests/tap-walk-browser.mjs [--desktop] [--url u]
import { chromium } from 'playwright';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const desktop = process.argv.includes('--desktop');
const URL = arg('--url', process.env.TOWN_URL || 'http://localhost:8091/');
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext(desktop ? { viewport: { width: 1200, height: 760 }, hasTouch: true } : { viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage(), errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  const T = (f, a) => page.evaluate(f, a), where = () => T(() => window.__town.state().pos);
  await T(() => { window.__town.closePanel?.(); window.__town.life.setTime(10 * 60); });

  // 1. A real touchscreen tap on open ground ahead starts a walk there; a drag does not.
  await T(() => window.__town.place(14, -190, Math.PI)); await page.waitForTimeout(800);   // on the Woodlot road, facing north
  const vp = page.viewportSize();
  const start = await where();
  await page.touchscreen.tap(Math.round(vp.width * 0.62), Math.round(vp.height * 0.72));
  await page.waitForTimeout(300);
  const walk = await T(() => window.__town.autoWalk());
  step(!!walk, 'a tap on the ground ahead starts tap-to-walk: ' + JSON.stringify(walk));
  await page.waitForFunction(() => !window.__town.autoWalk(), null, { timeout: 20000 }).catch(() => {});
  const end = await where();
  step(Math.hypot(end.x - start.x, end.z - start.z) > 1.5, `walked there (${Math.hypot(end.x - start.x, end.z - start.z).toFixed(1)} m)`);

  // 2. Tap a tree (via the same route planner): walk up to it and start chopping, as in RuneScape.
  await T(() => window.__town.place(13.5, -199.6, 0)); await page.waitForTimeout(600);
  for (let i = 0; i < 4 && !(await T(() => window.__town.inventory().items.includes('hatchet'))); i++) {
    if (desktop) { await page.keyboard.down('e'); await page.waitForTimeout(120); await page.keyboard.up('e'); } else await page.tap('#t-use');
    await page.waitForTimeout(300);
  }
  step(await T(() => window.__town.inventory().items.includes('hatchet')), 'took a hatchet from the rack');
  const trees = await T(() => window.__town.skills().trees.filter((t) => t.id.startsWith('woodlot:') && t.type === 'tree' && !t.stump));
  const far = trees.sort((a, b) => Math.hypot(b.x - 13.5, b.z + 199.6) - Math.hypot(a.x - 13.5, a.z + 199.6))[0];
  const plan = await T((t) => { window.__town.walkTo(t.x, t.z, t.id); return window.__town.autoWalk(); }, far);
  step(!!plan && plan.tree === far.id, `routed to the far ${far.type} at (${far.x}, ${far.z}) in ${plan?.legs} legs`);
  await page.waitForFunction((id) => window.__town.skills().chopping === id, far.id, { timeout: 40000 }).catch(() => {});
  const k = await T(() => window.__town.skills());
  const me = await where();
  step(k.chopping === far.id, `arrived beside the tree and started chopping (${Math.hypot(me.x - far.x, me.z - far.z).toFixed(1)} m from the trunk)`);

  // 2b. From the far side of the Woodlot, the route crosses the rail corridor at the level crossing.
  await T(() => window.__town.place(43, -218.4, 0)); await page.waitForTimeout(400);
  const cross = await T(() => window.__town.walkTo(14, -186) || window.__town.autoWalk());
  step(cross?.legs >= 2, 'routes from the far willow across the rail corridor to the road: ' + JSON.stringify(cross));

  // 3. Steering by hand cancels a walk at once.
  const again = await T(() => window.__town.walkTo(14, -186)); await page.waitForTimeout(400);
  step(!!(await T(() => window.__town.autoWalk())), 'a new walk is under way' + (again ? ' (' + again + ': ' + await T(() => document.getElementById('status')?.textContent) + ')' : ''));
  // Hold the key for at least a few frames (software rendering can be a few frames a second).
  await page.keyboard.down('s'); await page.waitForFunction(() => !window.__town.autoWalk(), null, { timeout: 3000 }).catch(() => {}); await page.keyboard.up('s');
  step(!(await T(() => window.__town.autoWalk())), 'steering by hand cancels it' + (await T(() => window.__town.autoWalk()) ? ' — debug ' + JSON.stringify(await T(() => ({ walk: window.__town.autoWalk(), panel: window.__town.state().panel?.title || null, focus: document.activeElement?.id || document.activeElement?.tagName, pos: window.__town.state().pos }))) : ''));

  // 4. A drag on the view looks around and does not walk.
  await page.evaluate(([x, y]) => {
    const c = document.querySelector('canvas'), mk = (type, px) => { const t = new Touch({ identifier: 7, target: c, clientX: px, clientY: y }); return new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], changedTouches: [t], bubbles: true, cancelable: true }); };
    c.dispatchEvent(mk('touchstart', x)); c.dispatchEvent(mk('touchmove', x + 60)); c.dispatchEvent(mk('touchend', x + 60));
  }, [Math.round(vp.width * 0.7), Math.round(vp.height * 0.5)]);
  await page.waitForTimeout(300);
  step(!(await T(() => window.__town.autoWalk())), 'a drag looks around and does not start a walk');
  step(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await page.screenshot({ path: `test-results/tap-walk-${desktop ? 'desktop' : 'mobile'}.png` }).catch(() => {});
} catch (e) { console.error(e); process.exitCode = 1; }
await b.close();
console.log(process.exitCode ? 'FAIL: tap-to-walk' : `PASS: tap-to-walk routes, tree walk-and-chop, manual override, drag still looks (${desktop ? 'desktop' : 'mobile'})`);
