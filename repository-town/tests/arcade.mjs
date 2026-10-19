// Arcade library: continue-playing row, ratings, sorting and Surprise me, on desktop
// and phone widths. Serve a build first:  node tools/serve.mjs dist/public 8091 &
//   node tests/arcade.mjs [--url http://localhost:8091/]
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const URL = arg('--url', 'http://localhost:8091/');
const b = await chromium.launch({ headless: true });
const errors=[];
for (const vp of [{width:1280,height:900,name:'desktop'},{width:390,height:844,name:'phone'}]) {
  const p = await b.newPage({viewport:vp});
  p.on('pageerror',e=>errors.push(vp.name+': '+e.message));
  await p.goto(new globalThis.URL('arcade.html', URL).href);
  await p.waitForFunction(()=>/available/.test(document.getElementById('count').textContent));
  const count=await p.textContent('#count'); console.log(vp.name,'|',count);
  assert(await p.isHidden('#continue'),'continue hidden before any play');
  // Play the first game, come back.
  const first=await p.locator('#cards article h2').first().textContent();
  await p.locator('#cards article button',{hasText:'Play'}).first().click();
  await p.waitForSelector('#game:not([hidden])'); await p.waitForTimeout(800);
  await p.click('#game-exit');
  assert(await p.isVisible('#continue'),'continue row appears after a play');
  const cont=await p.locator('#continue-cards h2').allTextContents(); assert.deepEqual(cont,[first]);
  assert.match(await p.locator('#continue-cards .stats').first().textContent(),/Played 1×/);
  // Rate it up, sort by favourites: it comes first.
  await p.locator('#cards article').nth(3).getByRole('button',{name:/^Like/}).click();
  const liked=await p.locator('#cards article').nth(3).locator('h2').textContent();
  await p.selectOption('#sort','liked');
  assert.equal(await p.locator('#cards article h2').first().textContent(),liked,'liked game sorts first');
  assert.equal(await p.locator('#cards article').first().getByRole('button',{name:/^Like/}).getAttribute('aria-pressed'),'true');
  // Rating persists across reload.
  await p.reload(); await p.waitForFunction(()=>/available/.test(document.getElementById('count').textContent));
  await p.selectOption('#sort','liked');
  assert.equal(await p.locator('#cards article h2').first().textContent(),liked,'rating survives reload');
  // Surprise me opens an unplayed game.
  await p.click('#surprise'); await p.waitForSelector('#game:not([hidden])');
  const surprise=await p.textContent('#game-title'); assert.notEqual(surprise,first,'surprise prefers unplayed');
  await p.click('#game-exit');
  // Filter hides the continue row; toys tab hides tools.
  await p.fill('#filter','zzzz-none'); assert(await p.isHidden('#continue'));
  await p.fill('#filter',''); await p.click('#toys-tab'); assert(await p.isHidden('#tools'));
  await p.click('#games-tab'); await p.selectOption('#sort','recent');
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth); assert(!overflow,'no horizontal scroll');
  console.log(vp.name,'| played',first,'| liked',liked,'| surprise',surprise,'| OK');
  await p.context().close();
}
await b.close();
assert.deepEqual(errors, [], 'page errors');
console.log('PASS: arcade continue row, ratings, sorting and Surprise me on desktop and phone');
