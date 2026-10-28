// Real Chromium: at 11 pm, with every shop shut, take a hatchet and tinderbox from the Woodlot
// tool rack and chop a tree. Then check that an error after start no longer replaces the
// game with "Could not start": it shows in the status line (with file:line) and play goes on.
//   node tests/woodlot-rack-browser.mjs [--mobile] [--url u]
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
  const T = (f, a) => page.evaluate(f, a), prompt = () => T(() => document.getElementById('prompt')?.textContent || ''), status = () => T(() => document.getElementById('status')?.textContent || '');
  const use = async () => { if (mobile) await page.tap('#t-use'); else { await page.keyboard.down('e'); await page.waitForTimeout(120); await page.keyboard.up('e'); } await page.waitForTimeout(300); };
  await T(() => { window.__town.closePanel?.(); window.__town.life.setTime(23 * 60); });
  step(!(await T(() => window.__town.inventory().items.includes('hatchet'))), 'no hatchet to start with');

  // Stand in front of the rack (13.5, -201.5), facing it from the road side.
  await T(() => window.__town.place(13.5, -199.6, 0)); await page.waitForTimeout(800);
  await page.waitForFunction(() => /tool rack/.test(document.getElementById('prompt')?.textContent || ''), null, { timeout: 4000 }).catch(() => {});
  step(/tool rack/.test(await prompt()), 'prompt offers the Woodlot tool rack: ' + await prompt());
  // A tap can land between frames on a busy phone; tap again until the rack answers.
  for (let i = 0; i < 4 && !/take a hatchet/.test(await status()); i++) await use();
  step(/take a hatchet and a tinderbox/.test(await status()), 'took the tools at 11 pm: ' + await status());
  const k = await T(() => window.__town.skills());
  step(k.hatchet.visible, 'the hatchet is in hand');

  // Chop the nearest Woodlot tree with the rack hatchet.
  const tree = k.trees.find((t) => t.id.startsWith('woodlot:') && t.type === 'tree' && !t.stump);
  await T(([x, z]) => window.__town.place(x - 1.8, z, -Math.PI / 2), [tree.x, tree.z]); await page.waitForTimeout(800);
  await page.waitForFunction(() => /Chop the tree/.test(document.getElementById('prompt')?.textContent || ''), null, { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 4 && !(await T(() => window.__town.skills().chopping)); i++) await use();
  await page.waitForFunction(() => (window.__town.skills().report.find((x) => x.id === 'woodcutting')?.xp || 0) > 0 || /logs/.test(document.getElementById('status')?.textContent || ''), null, { timeout: 60000 }).catch(() => {});
  const xp = (await T(() => window.__town.skills().report.find((x) => x.id === 'woodcutting').xp));
  step(xp > 0, `chopped with the rack hatchet (woodcutting XP ${xp})`);

  // An error after start is reported, not fatal.
  const frames0 = await T(() => new Promise((r) => { let n = 0; const f = () => (++n < 5 ? requestAnimationFrame(f) : r(n)); requestAnimationFrame(f); }));
  await T(() => { setTimeout(() => { throw new Error('rack test probe'); }); });
  await page.waitForTimeout(600);
  const fatal = await page.locator('#loading.error').isVisible();
  step(!fatal, 'a runtime error does not replace the game with "Could not start"');
  step(/still running: rack test probe/.test(await status()), 'the error shows in the status line: ' + await status());
  const t0 = await T(() => window.__town.state().minute);
  await page.waitForTimeout(1500);
  const t1 = await T(() => window.__town.state().minute);
  step(frames0 === 5 && t1 !== t0, `the game keeps running after the error (clock ${t0} → ${t1})`);
  const unexpected = errors.filter((e) => !/rack test probe/.test(e));
  step(unexpected.length === 0, 'no other page errors' + (unexpected.length ? ': ' + unexpected.join(' | ') : ''));
  // 11 pm, bank shut: the 24-hour ATM in its front wall still pays out from savings.
  const atm = await T(() => window.__town.atm());
  const before = await T(() => { const p = window.__town.life.ledger().civic.player; return { wallet: p.wallet, bank: p.bank }; });
  // Stand at the ATM facing the bank wall (the wall is back toward the door line).
  await T((a) => window.__town.place(a.x, a.z, a.yaw), atm);
  await page.waitForFunction(() => /24-hour ATM/.test(document.getElementById('prompt')?.textContent || ''), null, { timeout: 4000 }).catch(() => {});
  step(/24-hour ATM/.test(await prompt()), 'prompt offers the 24-hour ATM at 11 pm: ' + await prompt());
  for (let i = 0; i < 4 && !/ATM/.test((await T(() => window.__town.state().panel?.title || ''))); i++) await use();
  step(await T(() => window.__town.answer(1)), 'withdrew $50 at the ATM');
  const after = await T(() => { const p = window.__town.life.ledger().civic.player; return { wallet: p.wallet, bank: p.bank }; });
  const got = Math.min(50, before.bank);
  step(after.wallet - before.wallet === got && before.bank - after.bank === got, `ATM paid $${got} from savings (wallet ${before.wallet} → ${after.wallet}, savings ${before.bank} → ${after.bank})`);
  await T(() => window.__town.closePanel());

  // Settings → Start a new game wipes progress (the rack tools, the clock) but keeps preferences.
  await T(() => { localStorage.setItem('repository-town.movement-speed.v1', '1.5'); window.dispatchEvent(new Event('pagehide')); });
  await T(() => document.getElementById('btn-settings').click());
  await T(() => document.getElementById('settings-new-game').click());
  step(await page.locator('#settings-new-game-note').isVisible(), 'new game asks for confirmation first');
  await Promise.all([page.waitForEvent('load'), T(() => document.getElementById('settings-new-game-confirm').click())]);
  await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  const fresh = await T(() => ({ items: window.__town.inventory().items, xp: window.__town.skills().report.find((x) => x.id === 'woodcutting').xp, day: window.__town.state().day, speed: localStorage.getItem('repository-town.movement-speed.v1'), status: document.getElementById('status').textContent }));
  step(!fresh.items.includes('hatchet') && fresh.xp === 0 && fresh.day === 1, `new game starts fresh (items ${JSON.stringify(fresh.items)}, XP ${fresh.xp}, day ${fresh.day})`);
  step(fresh.speed === '1.5', 'preferences survive a new game');
  step(/New game started/.test(fresh.status), 'welcome message: ' + fresh.status);
  await page.screenshot({ path: `test-results/woodlot-rack-${mobile ? 'mobile' : 'desktop'}.png` }).catch(() => {});
} catch (e) { console.error(e); process.exitCode = 1; }
await b.close();
console.log(process.exitCode ? 'FAIL: Woodlot rack' : `PASS: Woodlot tool rack at night and non-fatal runtime errors (${mobile ? 'mobile' : 'desktop'})`);
