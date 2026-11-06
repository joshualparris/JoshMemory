// Real Chromium playthrough of cooking on a fire (docs/RUNESCAPE_ROADMAP.md item 9):
// light a fire from the bag, cook lamb into roast lamb at the fire, see Cooking XP in
// 📊 Skills, then eat the roast lamb and watch hunger fall.
//   node tests/cooking-browser.mjs [--mobile] [--url u]
import { chromium } from 'playwright';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const mobile = process.argv.includes('--mobile');
const URL = arg('--url', process.env.TOWN_URL || 'http://localhost:8091/');
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext(mobile ? { viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1200, height: 760 } });
const page = await ctx.newPage(), errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  const T = (f, a) => page.evaluate(f, a), st = () => T(() => window.__town.state());
  // Use physical Chromium pointer/touch hit testing for gameplay actions; a JS
  // element.click() would incorrectly pass when another panel masks a control.
  const press = async locator => mobile ? locator.tap({timeout:12000}) : locator.click({timeout:12000});
  const click = async re => {
    const target = page.locator('#panel-actions button').filter({hasText:re}).first();
    if (!await target.count()) return false;
    await press(target);
    return true;
  };
  const nav = async id => {
    const panel = page.locator('#panel');
    if (await panel.isVisible()) {
      await press(page.locator('#panel-close'));
      await panel.waitFor({state:'hidden',timeout:10000});
    }
    // On phones the HUD starts minimised, hiding #hud-details (bag and skills).
    // Expand it with the visible + control before the real tap.
    const target = page.locator(id);
    if (!(await target.isVisible())) {
      const expand = page.locator('#btn-hud-toggle');
      if (await expand.isVisible()) await press(expand);
    }
    await press(target);
  };
  // Deterministic setup through the exposed live simulation: a tinderbox, logs and lamb.
  await T(() => {
    window.__town.closePanel?.();
    window.__town.life.setTime(10 * 60);
    const me = window.__town.life.ledger().civic.player;
    me.bag = { ...(me.bag || {}), lamb: 5, veg: 1 };
    me.logs = { ...(me.logs || {}), logs: 3 };
    me.items = (me.items || []).filter((i) => i.type !== 'tinderbox');
    me.items.push({ id: 'tinderbox:guest:cook', type: 'tinderbox' });
  });
  // Stand in a clear spot at the Woodlot and light a fire from the bag.
  await T(() => window.__town.place(12, -206, 0)); await page.waitForTimeout(400);
  await nav('#btn-bag'); await page.waitForTimeout(200);
  let lit = false;
  for (let i = 0; i < 6 && !lit; i++) {
    await click(/Light logs here/);
    await page.waitForFunction(() => window.__town.skills().fires > 0 || !window.__town.skills().lighting, null, { timeout: 15000 }).catch(() => {});
    lit = (await T(() => window.__town.skills().fires)) > 0;
    if (!lit) await nav('#btn-bag');
  }
  step(lit, 'a fire is burning beside the player');
  // Seed a high level only to suppress random flakiness. Prove *new* XP is
  // earned after real touch, not just that the preloaded XP remains nonzero.
  await T(() => { const me = window.__town.life.ledger().civic.player; me.skills = { ...(me.skills || {}), cooking: { xp: 500000 } }; });
  const xpBefore = await T(() => window.__town.skills().report.find(x=>x.id==='cooking').xp);
  let cooked = (await T(() => (window.__town.life.ledger().civic.player.bag || {}).cooked_lamb || 0)) > 0;
  for (let i = 0; i < 5 && !cooked; i++) {
    await nav('#btn-bag'); await page.waitForTimeout(150);
    await click(/Cook lamb here/); await page.waitForTimeout(200);
    cooked = (await T(() => (window.__town.life.ledger().civic.player.bag || {}).cooked_lamb || 0)) > 0;
  }
  step(cooked, 'cooked roast lamb from the bag at the fire');
  const cookXp = await T(() => window.__town.skills().report.find((x) => x.id === 'cooking').xp);
  step(cookXp >= xpBefore + 30, 'Cooking XP gained from the actual cooked meal (' + xpBefore + ' → ' + cookXp + ')');
  // Skills panel lists Cooking.
  await T(() => window.__town.closePanel?.());
  await nav('#btn-skills'); await page.waitForTimeout(300);
  const skillText = (await st()).panel?.text || '';
  step(/Cooking · level/.test(skillText), 'Skills panel lists Cooking');
  await T(() => window.__town.closePanel?.());
  // Eat the roast lamb and confirm hunger falls.
  const hunger0 = (await st()).needs.hunger;
  await nav('#btn-needs'); await page.waitForTimeout(300);
  const ate = await click(/Eat cooked_lamb/);
  step(ate, 'needs panel offers the cooked meal');
  const hunger1 = (await st()).needs.hunger;
  step(hunger1 < hunger0, `hunger fell from ${Math.round(hunger0)} to ${Math.round(hunger1)}`);
  await page.screenshot({ path: `test-results/cooking-${mobile ? 'mobile' : 'desktop'}.png` }).catch(() => {});
  step(!errors.length, 'no page errors ' + errors.join('; '));
} finally { await b.close(); }
console.log(process.exitCode ? 'Cooking playthrough FAILED' : `All cooking checks passed (${mobile ? 'mobile' : 'desktop'}).`);
