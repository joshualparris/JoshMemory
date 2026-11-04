// Teleport (the Find a building box) must survive the key-less keydown that Chrome fires when a
// suggestion is picked from the datalist or an autofill entry is chosen. Regression for
// 2026-11-04: expedition.js called e.key.toLowerCase() on that event, threw on every pick, and
// teleport broke ("Cannot read properties of undefined (reading 'toLowerCase')").
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url = process.env.TOWN_URL || 'http://localhost:8091/';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(url);
  await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 150000 });
  const where = () => page.evaluate(() => window.__town.state().pos);
  for (const dest of ['Narromine · Dandaloo Street', 'Commit Café']) {
    const before = await where();
    await page.fill('#search', dest);
    // What Chrome dispatches when a datalist suggestion or autofill value is chosen: a keydown with no key.
    await page.evaluate(() => {
      const ev = new Event('keydown', { bubbles: true, cancelable: true });
      document.getElementById('search').dispatchEvent(ev);
      document.dispatchEvent(new Event('keydown', { bubbles: true }));
    });
    await page.click('#search-form button[type="submit"]');
    await page.waitForTimeout(1500);
    const after = await where();
    const moved = Math.hypot(after.x - before.x, after.z - before.z);
    assert.ok(moved > 5, `teleport to "${dest}" did not move the player (moved ${moved.toFixed(1)} m); status: ${await page.textContent('#status')}`);
    console.log(`  teleported to ${dest}: moved ${moved.toFixed(0)} m`);
  }
  // Picking a suggestion teleports without pressing Go.
  const before = await where();
  await page.evaluate(() => { const s = document.getElementById('search'); s.value = 'Railway Hotel · ' + [...document.querySelectorAll('#house-list option')].map((o) => o.value).find((v) => v.startsWith('Railway Hotel · ')).split(' · ')[1];
    s.dispatchEvent(new Event('keydown', { bubbles: true })); s.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' })); });
  await page.waitForTimeout(1500);
  const picked = await where();
  assert.ok(Math.hypot(picked.x - before.x, picked.z - before.z) > 5, 'picking a suggestion teleports straight away; status: ' + await page.textContent('#status'));
  console.log('  picked a suggestion: teleported without pressing Go');
  // Typing alone (no pick) does not jump anywhere mid-word.
  const still = await where();
  await page.fill('#search', ''); await page.type('#search', 'Comm');
  await page.waitForTimeout(800);
  const typed = await where();
  assert.ok(Math.hypot(typed.x - still.x, typed.z - still.z) < 1, 'typing does not teleport');
  assert.deepEqual(errors, [], 'no page errors while picking and teleporting');
  // J still toggles the journal after a key-less event.
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('j');
  assert.equal(await page.evaluate(() => !document.getElementById('journal').hidden), true, 'J opens the journal');
  console.log('PASS: teleport survives key-less keydown from datalist/autofill picks; J still opens the journal');
} finally { await browser.close(); }
