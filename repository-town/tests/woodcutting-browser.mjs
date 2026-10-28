// Real Chromium playthrough of the first skilling slice (docs/RUNESCAPE_ROADMAP.md): buy a hatchet and
// tinderbox at Central West Hardware & Timber, walk up to a tree at the Town Woodlot and chop it with
// E/✋ until it falls to a stump, light a fire from the bag, see XP in 📊 Skills, then sell logs.
//   node tests/woodcutting-browser.mjs [--mobile] [--url u]
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
  const T = (f, a) => page.evaluate(f, a), st = () => T(() => window.__town.state()), status = () => T(() => document.getElementById('status')?.textContent || '');
  const click = (re) => T((src) => { const r = new RegExp(src, 'i'); const btn = [...document.querySelectorAll('#panel-actions button')].find((x) => r.test(x.textContent)); btn?.click(); return !!btn; }, re.source);
  const use = async () => { if (mobile) await page.tap('#t-use'); else { await page.keyboard.down('e'); await page.waitForTimeout(120); await page.keyboard.up('e'); } await page.waitForTimeout(300); };
  await T(() => { window.__town.closePanel?.(); window.__town.life.setTime(10 * 60); window.__town.life.run(15); });
  // Exercise the real HUD teleport, not just the direct test hook. Missing
  // optional destination metadata must never send the game to its red screen.
  await T(() => { const input = document.getElementById('search'); input.value = 'Central West Hardware & Timber'; document.getElementById('search-form').requestSubmit(); });
  await page.waitForTimeout(400);
  step(/Outside .*Hardware|Outside .*Timber/.test(await status()), 'HUD search teleports to the hardware store without a fatal error');
  step(!errors.length && await T(() => document.getElementById('loading').hidden), 'teleport did not trigger the red-screen fatal overlay');
  // The hidden property lookup shares the town-place list. A non-existent name
  // must return a refusal even if some civic records have no display name.
  await T(() => window.__town.cheats.open());
  await page.locator('#cheat-password').fill('CHEAT123');
  await page.locator('#cheat-unlock').click();
  await page.locator('#cheat-prop').fill('__not_a_real_property__');
  await page.locator('button[data-a="buyKey"]').click();
  const propertyMessage = await page.locator('#cheat-menu .msg').textContent();
  step(/No property matches/.test(propertyMessage || ''), 'unnamed destination lookup fails safely: ' + propertyMessage);
  await T(() => window.__town.cheats.close());

  // 1. The hardware store sells the tools; the money goes into its till.
  await T(() => window.__town.goPlace('hardware')); await page.waitForTimeout(1200);
  for (let i = 0; i < 4 && !(await st()).panel && (await st()).mode !== 'house'; i++) await use();
  let s = await st();
  if (s.mode === 'house') { const desk = s.interactables.find((x) => x.do === 'civic-ledger'); await T((k) => window.__town.approach(k), desk.key); await page.waitForTimeout(400); for (let i = 0; i < 3 && !(await st()).panel; i++) await use(); }
  s = await st(); step(/Hardware/.test(s.panel?.title || '') && /Timber yard/.test(s.panel?.text || ''), `hardware counter with a timber yard (${s.panel?.title})`);
  const wallet0 = await T(() => window.__town.life.ledger().civic.player.wallet);
  step(await click(/Buy a hatchet/), 'bought a hatchet'); step(await click(/Buy a tinderbox/), 'bought a tinderbox');
  const wallet1 = await T(() => window.__town.life.ledger().civic.player.wallet);
  step(wallet0 - wallet1 === 31, `paid $31 for both (wallet ${wallet0} → ${wallet1})`);
  await T(() => { window.__town.closePanel?.(); window.__town.exitShop?.(); });

  // 2. Walk up to a normal tree at the Woodlot and chop until it falls.
  const tree = (await T(() => window.__town.skills().trees)).find((t) => t.type === 'tree');
  await T(([x, z]) => window.__town.place(x - 1.8, z, -Math.PI / 2), [tree.x, tree.z]); await page.waitForTimeout(800);
  await page.waitForFunction(() => /Chop the tree/.test(document.getElementById('prompt')?.textContent || ''), null, { timeout: 3000 }).catch(() => {});
  step(/Chop the tree/.test(await T(() => document.getElementById('prompt')?.textContent || '')), 'prompt offers to chop the tree');
  await page.screenshot({ path: `test-results/woodlot-${mobile ? 'mobile' : 'desktop'}.png` }).catch(() => {});
  let felled = false;
  for (let i = 0; i < 6 && !felled; i++) {
    await use();
    await page.waitForFunction((id) => { const k = window.__town.skills(); return !k.chopping || k.trees.find((t) => t.id === id).stump; }, tree.id, { timeout: 60000 }).catch(() => {});
    felled = (await T(() => window.__town.skills().trees)).find((t) => t.id === tree.id).stump;
  }
  let k = await T(() => window.__town.skills());
  step(felled, 'the tree fell to a stump'); step(k.logs.logs >= 1, `logs in the bag (${k.logs.logs})`);
  step(k.report.find((x) => x.id === 'woodcutting').xp >= 25, `woodcutting XP ${k.report.find((x) => x.id === 'woodcutting').xp}`);
  await page.waitForFunction(() => /stump/.test(document.getElementById('prompt')?.textContent || ''), null, { timeout: 3000 }).catch(() => {});
  const stumpPrompt = await T(() => document.getElementById('prompt')?.textContent || '');
  step(/stump/.test(stumpPrompt), 'the stump says it will grow back: ' + stumpPrompt);

  // 2b. Any tree in town can be chopped, with the hatchet swinging like RuneScape's loop.
  const all = await T(() => window.__town.skills().trees);
  const yard = all.find((t) => t.id.startsWith('scenery:') && !t.stump);
  step(all.filter((t) => t.id.startsWith('scenery:')).length >= 50, `${all.length} choppable trees in town (${all.filter((t) => t.id.startsWith('scenery:')).length} scenery trees beyond the Woodlot)`);
  // Stand on a clear side of the yard tree, facing it.
  for (const [dx, dz] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2.4, 0], [0, 2.4]]) {
    if (await T(([x, z]) => window.__town.probe(x, z), [yard.x + dx, yard.z + dz])) continue;
    await T(([x, z, yaw]) => window.__town.place(x, z, yaw), [yard.x + dx, yard.z + dz, Math.atan2(dx, dz)]); break;
  }
  await page.waitForFunction(() => /Chop the tree/.test(document.getElementById('prompt')?.textContent || ''), null, { timeout: 3000 }).catch(() => {});
  const angles = [];
  await use();
  for (let i = 0; i < 12; i++) { await page.waitForTimeout(110); const h = await T(() => window.__town.skills().hatchet); angles.push(h.angle); }
  step((await T(() => window.__town.skills().chopping)) === yard.id, 'chopping a yard tree: ' + yard.id);
  step(Math.max(...angles) - Math.min(...angles) > 1.2, `the hatchet swings (angle ${Math.min(...angles).toFixed(2)} → ${Math.max(...angles).toFixed(2)})`);
  await page.screenshot({ path: `test-results/chop-${mobile ? 'mobile' : 'desktop'}.png` }).catch(() => {});
  await page.waitForFunction((id) => !window.__town.skills().chopping || window.__town.skills().trees.find((t) => t.id === id).stump, yard.id, { timeout: 60000 }).catch(() => {});
  if (!(await T((id) => window.__town.skills().trees.find((t) => t.id === id).stump, yard.id))) { await use(); await page.waitForFunction((id) => window.__town.skills().trees.find((t) => t.id === id).stump, yard.id, { timeout: 60000 }).catch(() => {}); }
  step(await T((id) => window.__town.skills().trees.find((t) => t.id === id).stump, yard.id), 'the yard tree fell to a stump');
  await page.screenshot({ path: `test-results/yard-stump-${mobile ? 'mobile' : 'desktop'}.png` }).catch(() => {});

  // 3. Light a fire from the bag.
  await T(() => document.getElementById('btn-bag').click()); await page.waitForTimeout(300);
  let lit = false;
  for (let i = 0; i < 6 && !lit; i++) { await click(/Light logs here/); await page.waitForTimeout(200); lit = (await T(() => window.__town.skills().fires)) > 0; if (!lit && !(await st()).panel) await T(() => document.getElementById('btn-bag').click()); }
  k = await T(() => window.__town.skills());
  step(lit && k.report.find((x) => x.id === 'firemaking').xp >= 40, `a fire is burning (${k.fires}); firemaking XP ${k.report.find((x) => x.id === 'firemaking').xp}`);
  await T(() => window.__town.closePanel?.()); await page.waitForTimeout(400);
  await page.screenshot({ path: `test-results/fire-${mobile ? 'mobile' : 'desktop'}.png` }).catch(() => {});

  // 4. The Skills panel shows levels and XP.
  await T(() => document.getElementById('btn-skills').click()); await page.waitForTimeout(300);
  s = await st(); step(/Skills/.test(s.panel?.title || '') && /Woodcutting · level/.test(s.panel?.text || '') && /Firemaking · level/.test(s.panel?.text || ''), 'Skills panel lists woodcutting and firemaking');
  await T(() => window.__town.closePanel?.());

  // 5. More logs, then sell them back to the timber yard.
  await T(() => { window.__town.life.run(40); });
  await T(([x, z]) => window.__town.place(x - 1.8, z, -Math.PI / 2), [tree.x, tree.z]); await page.waitForTimeout(500);
  await use(); await page.waitForFunction(() => !window.__town.skills().chopping, null, { timeout: 60000 }).catch(() => {});
  const have = (await T(() => window.__town.skills().logs)).logs || 0;
  await T(() => window.__town.goPlace('hardware')); await page.waitForTimeout(1200);
  for (let i = 0; i < 4 && !(await st()).panel && (await st()).mode !== 'house'; i++) await use();
  s = await st(); if (s.mode === 'house') { const desk = s.interactables.find((x) => x.do === 'civic-ledger'); await T((key) => window.__town.approach(key), desk.key); await page.waitForTimeout(400); for (let i = 0; i < 3 && !(await st()).panel; i++) await use(); }
  if (have) { step(await click(/Sell \d+ logs/), `sold ${have} logs`); step(!(await T(() => window.__town.skills().logs)).logs, 'no logs left after selling'); }
  step(!errors.length, 'no page errors ' + errors.join('; '));
} finally { await b.close(); }
console.log(process.exitCode ? 'Woodcutting playthrough FAILED' : `All woodcutting checks passed (${mobile ? 'mobile' : 'desktop'}).`);
