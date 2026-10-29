// Desktop chats keep "Try asking" and Recorded conversations visible; touch
// devices still enter typing mode to make room for the on-screen keyboard.
// Regression for the 2026-10-29 playtest: on desktop, any NPC without a scripted
// conversation auto-focused the composer, which hid every suggestion.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = (process.env.TOWN_BASE_URL || 'http://127.0.0.1:8091').replace(/\/$/, '');
const browser = await chromium.launch();
try {
  for (const touch of [false, true]) {
    const ctx = await browser.newContext(touch ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 844 } });
    const page = await ctx.newPage();
    await page.route('**/api/npc-chat', (r) => r.abort());
    await page.goto(base + '/people.html', { waitUntil: 'networkidle' });
    const ids = await page.evaluate(() => [...document.querySelectorAll('[data-npc-id]')].map((b) => b.dataset.npcId));
    for (const id of touch ? ids.slice(0, 3) : ids) {
      await page.locator(`[data-npc-id="${id}"]`).first().click();
      await page.waitForTimeout(150);
      if (touch) await page.locator('#npc-input, #npc-form input, #npc-form textarea').first().focus();
      const s = await page.evaluate(() => ({ typing: document.getElementById('npc-chat').classList.contains('npc-typing'), activities: getComputedStyle(document.getElementById('npc-activities')).display !== 'none' }));
      if (touch) assert.equal(s.typing, true, `${id}: touch focus should enter typing mode`);
      else {
        assert.equal(s.typing, false, `${id}: desktop must not enter typing mode`);
        assert.equal(s.activities, true, `${id}: desktop must keep Try asking / Recorded conversations visible`);
      }
      // On phones the chat covers the roster: close it before choosing the next person.
      if (touch && await page.locator('#npc-close').isVisible()) await page.locator('#npc-close').click();
      else await page.evaluate(() => document.activeElement?.blur());
      await page.waitForTimeout(150);
    }
    await ctx.close();
  }
  console.log('npc-desktop-prompts-browser: desktop keeps chat suggestions; touch still gets typing mode.');
} finally { await browser.close(); }
