// End-to-end Chromium/WebGL acceptance for the real startup indicator.
// Build before running: npm run build. No production data or browser saves modified.
import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const local = await startStaticServer(path.resolve('dist/public'));
const browser = await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results = [];
const ready = () => window.__town && window.TownLoading?.snapshot().ready && document.getElementById('loading').hidden;

async function checkReady(page, label) {
  await page.waitForFunction(ready, null, {timeout:90000});
  const state = await page.evaluate(() => ({
    loading: window.TownLoading.snapshot(),
    overlayDisplay: getComputedStyle(document.getElementById('loading')).display,
    progressValue: document.getElementById('loading-progress').value,
    progressMax: document.getElementById('loading-progress').max,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
  }));
  assert.equal(state.overlayDisplay, 'none', label + ': loader genuinely disappears');
  assert.equal(state.loading.ready, true, label + ': first frame ready');
  assert.equal(state.loading.failed, false, label + ': no fatal startup failure');
  assert.equal(state.loading.completed, 12, label + ': 12 completed stages');
  assert.equal(state.progressValue, state.progressMax, label + ': progress bar complete');
  assert.equal(state.loading.stages.length, 12, label + ': all detailed stages');
  assert(state.loading.stages.every(x => Number.isFinite(x.ms) && x.ms >= 0), label + ': real stage timing');
  assert.equal(state.horizontalOverflow, false, label + ': no horizontal overflow');
  results.push({label, elapsedSeconds: Math.round(state.loading.stages.reduce((sum,x)=>sum+x.ms,0)/1000), requests:state.loading.downloads});
}

try {
  for (const mobile of [false, true]) {
    const label = mobile ? 'phone-emulated-cold' : 'desktop-cold';
    const page = await browser.newPage(mobile
      ? {viewport:{width:375,height:812},hasTouch:true,isMobile:true,deviceScaleFactor:1}
      : {viewport:{width:1280,height:800},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(local.url, {waitUntil:'domcontentloaded'});
    await checkReady(page, label);
    assert.equal(errors.length, 0, label + ': uncaught errors: ' + errors.join(' | '));
    await page.reload({waitUntil:'domcontentloaded'});
    await checkReady(page, mobile ? 'phone-emulated-warm' : 'desktop-warm');
    assert.equal(errors.length, 0, label + ': uncaught errors after reload');
    await page.close();
  }
  const failed = await browser.newPage({viewport:{width:1200,height:760}});
  await failed.route('**/main.js', route => route.abort('failed'));
  await failed.goto(local.url, {waitUntil:'domcontentloaded'});
  await failed.waitForFunction(() => window.TownLoading?.snapshot().failed === true, null, {timeout:25000});
  assert.equal(await failed.locator('#loading-retry').isVisible(),true,'required game module failure offers Retry');
  assert.equal(await failed.locator('#loading').isVisible(),true,'failed loader remains visible');
  await failed.unroute('**/main.js');
  await failed.locator('#loading-retry').click();
  await checkReady(failed, 'error-then-retry');
  await failed.close();
  console.log('PASS real startup indicator: desktop + phone cold/warm, visible stages, hidden completed overlay, real stage timings, failure/retry, no JS errors. '+JSON.stringify(results));
} finally {
  await browser.close();
  await local.close();
}
