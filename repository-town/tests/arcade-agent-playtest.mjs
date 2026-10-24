// Browser-driven arcade playtest. Run from repository-town/ after npm install.
// No AI claims: bugs are observed runtime failures; game feel/balance require review.
// Example: node tests/arcade-agent-playtest.mjs --url http://localhost:8091/arcade.html
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const option = (name, fallback) => {
  const i = argv.indexOf(name);
  return i < 0 ? fallback : argv[i + 1];
};
const url = option('--url', 'https://repository-town-claude-complete.vercel.app/arcade.html');
const selected = option('--games', 'Mysterious Depths,AA Game Adventure');
const allGames = selected.trim().toUpperCase() === 'ALL';
const titles = allGames ? [] : selected.trim().startsWith('[') ? JSON.parse(selected) : selected.split(',').map(s => s.trim()).filter(Boolean);
const maxActions = Math.min(20, Math.max(1, Number(option('--max-actions', '20')) || 20));
const output = path.resolve(option('--output', 'test-results/arcade-agent-playtest.json'));
const screenshotDir = path.join(path.dirname(output), 'arcade-evidence');
const mobile = argv.includes('--mobile');
const viewport = mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 };
if ((!allGames && !titles.length) || !titles.every(t => typeof t === 'string' && t.trim()) || !/^https?:$/.test(new URL(url).protocol)) {
  throw Error('Provide an http(s) --url and one or more --games');
}
await fs.mkdir(screenshotDir, { recursive: true });

const summary = {
  source: 'Repository Town Playwright arcade agent (Skyvern-compatible findings)',
  arcade_url: url,
  tested_at: new Date().toISOString(),
  viewport,
  interaction_limit: maxActions,
  requested_titles: titles,
  games: [],
};
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const safeName = value => value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0,70);
const snapshot = async frame => frame.evaluate(() => ({
  text: (document.body?.innerText || '').trim().slice(0, 1600),
  controls: document.querySelectorAll('button, [role="button"], input, select, textarea').length,
  canvases: document.querySelectorAll('canvas').length,
  url: location.href,
  ready: document.readyState,
}));
const ignoreButton = /exit|back to library|home|reset|erase|delete|clear all|purchase|buy|quit|log ?in|sign ?up|share|download|privacy/i;

async function interact(frame, step) {
  const buttons = frame.locator('button:not([disabled]), [role="button"]:not([aria-disabled="true"])');
  const count = Math.min(await buttons.count(), 70);
  const choices = [];
  for (let j = 0; j < count; j++) {
    const candidate = buttons.nth(j);
    if (!(await candidate.isVisible().catch(() => false))) continue;
    const label = ((await candidate.innerText().catch(() => '')) || (await candidate.getAttribute('aria-label')) || '').trim();
    if (ignoreButton.test(label)) continue;
    choices.push({ candidate, label });
  }
  if (choices.length) {
    const picked = choices[step % choices.length];
    try {
      await picked.candidate.click({ timeout: 1500 });
      return 'Clicked ' + (picked.label || 'unlabelled control');
    } catch (error) {
      return 'Click blocked: ' + String(error.message).split('\n')[0].slice(0, 120);
    }
  }
  const keys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Enter', 'Space', 'w', 'a', 's', 'd', '1', '2'];
  const key = keys[step % keys.length];
  await frame.locator('body').press(key, { timeout: 1500 }).catch(async () => {
    await frame.page().keyboard.press(key);
  });
  return 'Pressed ' + key;
}

async function testCard(title, index, position) {
  const context = await browser.newContext({ viewport, locale: 'en-AU' });
  const page = await context.newPage();
  const errors = [];
  const httpFailures = [];
  const interactions = [];
  const findings = {
    game_title: title,
    game_id: null,
    variant: position,
    playable: false,
    reached_ending_or_progressed: 'Not verified',
    bugs: [],
    confusing_ux: [],
    balance_issues: [],
    summary: '',
    interactions: [],
    evidence: { screenshot: null, initial: null, final: null, console_errors: [], http_failures: [] },
  };
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith(new URL(url).origin) && !/favicon/i.test(response.url())) {
      httpFailures.push(response.status() + ' ' + new URL(response.url()).pathname);
    }
  });
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    if (!response?.ok()) throw Error('Arcade returned HTTP ' + response?.status());
    await page.waitForFunction(() => {
      const count = document.getElementById('count')?.textContent || '';
      return /available|found|could not load/i.test(count);
    }, null, { timeout: 20000 });
    await page.locator('#filter').fill(title);
    const card = page.locator('#cards article').nth(index);
    const shownTitle = (await card.locator('h2').innerText()).trim();
    if (shownTitle !== title) throw Error('Search result shifted: expected ' + title + ', saw ' + shownTitle);
    await card.getByRole('button', { name: /Play/i }).click();
    await page.locator('#game:not([hidden])').waitFor({ timeout: 10000 });
    const gameFrame = await page.locator('#game-frame').elementHandle();
    const src = await gameFrame.getAttribute('src');
    findings.game_id = decodeURIComponent(src.match(/games\/([^/]+)\/index\.html/)?.[1] || '');
    const frame = await gameFrame.contentFrame();
    if (!frame) throw Error('Game iframe was not accessible');
    await frame.waitForLoadState('domcontentloaded', { timeout: 20000 });
    findings.evidence.initial = await snapshot(frame);
    const start = findings.evidence.initial;
    if (!start.text && !start.canvases && !start.controls) throw Error('Game frame contains no visible content or controls');
    const filename = safeName(title) + '-' + safeName(findings.game_id || String(position)) + (mobile ? '-mobile' : '-desktop') + '.png';
    findings.evidence.screenshot = path.join('arcade-evidence', filename).replaceAll('\\', '/');
    await page.screenshot({ path: path.join(screenshotDir, filename), fullPage: false });
    for (let i = 0; i < maxActions; i++) {
      interactions.push(await interact(frame, i));
      await page.waitForTimeout(180);
    }
    findings.evidence.final = await snapshot(frame);
    const afterName = filename.replace(/\.png$/, '-after.png');
    await page.screenshot({ path: path.join(screenshotDir, afterName), fullPage: false });
    findings.evidence.after_screenshot = path.join('arcade-evidence', afterName).replaceAll('\\', '/');
    findings.playable = interactions.some(s => s.startsWith('Clicked ') || s.startsWith('Pressed '));
    findings.reached_ending_or_progressed =
      start.text !== findings.evidence.final.text || start.url !== findings.evidence.final.url
        ? 'Observed on-screen text or route change; ending not verified'
        : 'Actions sent, but no textual progress was detected; canvas/visual progress requires review';
    await page.locator('#game-exit').click();
    if (await page.locator('#game').isVisible()) findings.bugs.push('Back to library failed to close game overlay');
  } catch (error) {
    findings.bugs.push('Playtest blocked: ' + String(error.message).split('\n')[0].slice(0, 250));
  } finally {
    findings.bugs.push(...[...new Set(errors)].map(s => 'JavaScript: ' + s.slice(0, 250)));
    findings.bugs.push(...[...new Set(httpFailures)].map(s => 'HTTP: ' + s));
    findings.interactions = interactions;
    findings.evidence.console_errors = errors;
    findings.evidence.http_failures = httpFailures;
    findings.summary = findings.playable
      ? interactions.length + ' browser interactions sent; ' + (findings.bugs.length ? findings.bugs.length + ' observed failures' : 'no observed runtime failures') + '. UX and balance need visual/human assessment.'
      : 'Could not verify playable interactions. See observed errors.';
    await context.close();
  }
  return findings;
}

try {
  const discovery = await browser.newPage({ viewport });
  const response = await discovery.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
  if (!response?.ok()) throw Error('Arcade returned HTTP ' + response?.status());
  await discovery.waitForFunction(() => /available|could not load/i.test(document.getElementById('count')?.textContent || ''), null, { timeout: 20000 });
  if (allGames) titles.push(...new Set((await discovery.locator('#cards article h2').allTextContents()).map(t => t.trim()).filter(Boolean)));
  for (const title of titles) {
    await discovery.locator('#filter').fill(title);
    const visibleTitles = await discovery.locator('#cards article h2').allTextContents();
    const matching = visibleTitles.flatMap((t, index) => t.trim() === title ? [index] : []);
    if (!matching.length) {
      summary.games.push({
        game_title: title, playable: false, reached_ending_or_progressed: 'Not found',
        bugs: ['No exact title match in arcade catalogue'], confusing_ux: [], balance_issues: [],
        summary: 'The requested game could not be found using the arcade search',
      });
      continue;
    }
    for (let i = 0; i < matching.length; i++) {
      summary.games.push(await testCard(title, matching[i], i + 1));
    }
  }
  await discovery.close();
} catch (error) {
  summary.error = String(error.message);
  console.error('Arcade discovery failed:', summary.error);
} finally {
  await browser.close();
  await fs.writeFile(output, JSON.stringify(summary, null, 2) + '\n');
}
console.log('Wrote ' + output);
for (const game of summary.games) {
  console.log((game.playable && !game.bugs.length ? 'PASS' : 'CHECK') + ' ' + game.game_title + ' (' + (game.game_id || '?') + '): ' + game.summary);
}
if (summary.error || !summary.games.length || summary.games.some(game => !game.playable || game.bugs.length)) process.exitCode = 1;
