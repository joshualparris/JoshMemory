// Esc closes every HUD overlay even though clicking its HUD button leaves focus on
// that button, and opening one overlay dismisses the others instead of stacking.
// Regression for the 2026-10-29 playtest: Settings, Quest Journal, Yarns and
// Dialogue settings ignored Esc, and the journal stayed open under later panels.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url = process.env.TOWN_URL || 'http://localhost:8091/';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  // 1. Input module alone: Esc with a focused button reaches 'back'; Esc in a text box does not.
  const page = await browser.newPage();
  await page.route('**/hud-escape-harness.html', (r) => r.fulfill({ contentType: 'text/html', body: '<canvas id="c"></canvas><div id="touch"><div id="stick"><div id="knob"></div></div><button id="t-jump"></button><button id="t-use"></button><button id="t-view"></button><button id="t-run"></button><button id="t-crouch"></button></div><button id="b">HUD</button><input id="t" type="text"><input id="r" type="range">' }));
  await page.goto(new URL('hud-escape-harness.html', url).href);
  const unit = await page.evaluate(async () => {
    const { Input } = await import('./engine/input.js');
    const input = new Input(document.querySelector('#c'), document.querySelector('#touch'));
    const esc = (id) => { document.getElementById(id).focus(); document.getElementById(id).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return input.consume('back'); };
    const e = (id, key) => { document.getElementById(id).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); document.getElementById(id).dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true })); return input.consume('use'); };
    return { button: esc('b'), range: esc('r'), text: esc('t'), buttonUseStillIgnored: e('b', 'e') };
  });
  assert.equal(unit.button, true, 'Esc from a focused HUD button must close the open overlay');
  assert.equal(unit.range, true, 'Esc from a settings slider must close Settings');
  assert.equal(unit.text, false, 'Esc inside a text field belongs to the field');
  assert.equal(unit.buttonUseStillIgnored, false, 'E on a focused button must not also use an exhibit');
  await page.close();

  // 2. Whole game: each overlay opens alone and Esc closes it.
  const game = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await game.goto(url);
  await game.waitForFunction(() => window.__town, null, { timeout: 90000 });
  const visible = () => game.evaluate(() => ['journal', 'npc-roster', 'town-yarns', 'town-dialogue-settings', 'help', 'settings', 'panel', 'town-companion']
    .filter((id) => { const e = document.getElementById(id); return e && !e.hidden && getComputedStyle(e).display !== 'none'; }));
  const frames = (n) => game.evaluate((n) => new Promise((res) => { let i = 0; const f = () => (++i >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  const press = async (id) => { await game.evaluate((id) => document.getElementById(id).click(), id); await game.evaluate((id) => document.getElementById(id).focus(), id); await frames(3); };
  const cases = [['btn-journal', 'journal'], ['btn-npcs', 'npc-roster'], ['btn-town-yarns', 'town-yarns'], ['btn-town-dialogue-settings', 'town-dialogue-settings'], ['btn-help', 'help'], ['btn-settings', 'settings'], ['btn-guide', 'panel'], ['town-companion-button', 'town-companion']];
  for (const [id, overlay] of cases) {
    await press(id);
    assert.deepEqual(await visible(), [overlay], `${id} should open ${overlay} on its own`);
    if (id !== 'btn-settings' && id !== 'town-companion-button') await game.evaluate((id) => document.getElementById(id).focus(), id);
    await game.keyboard.press('Escape'); await frames(3);
    assert.deepEqual(await visible(), [], `Esc should close ${overlay}`);
  }
  // Opening a second overlay replaces the first.
  await press('btn-journal'); await press('btn-town-dialogue-settings'); await press('btn-npcs');
  assert.deepEqual(await visible(), ['npc-roster'], 'overlays must not stack');
  // The same button still toggles its own overlay closed.
  await press('btn-npcs');
  assert.deepEqual(await visible(), [], 'second press toggles the roster closed');
  // The version/saves badge must sit under panels (it covered panel text on phones).
  const z = await game.evaluate(() => { const badge = [...document.querySelectorAll('a')].find((a) => /^Version .* · saves$/.test(a.textContent)); return badge ? [Number(getComputedStyle(badge).zIndex), Number(getComputedStyle(document.getElementById('panel')).zIndex), Number(getComputedStyle(document.getElementById('card')).zIndex)] : null; });
  if (z) assert.ok(z[0] < z[1] && z[0] < z[2], `version badge z-index ${z[0]} must be below panel ${z[1]} and card ${z[2]}`);
  console.log('hud-escape-browser: Esc closes every HUD overlay; overlays open one at a time.');
} finally { await browser.close(); }
