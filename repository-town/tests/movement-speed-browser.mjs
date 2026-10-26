// Real browser regression for the town's visitor speed Settings; both desktop and touch.
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const url=process.env.TOWN_PLAYTEST_URL||'http://127.0.0.1:8091/';
const browser=await chromium.launch({headless:true,args:[
 '--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'
]});
try {
 for (const mode of ['desktop','phone']) {
  const opts=mode==='phone'?devices['Pixel 7']:{viewport:{width:1280,height:720}};
  const context=await browser.newContext(opts);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const open=async()=>{
   if(await page.locator('#btn-hud-toggle').getAttribute('aria-expanded')==='false')
    await page.locator('#btn-hud-toggle').click();
   await page.locator('#btn-settings').click();
   assert(await page.locator('#settings').isVisible(),mode+': settings dialogue visible');
   assert(await page.locator('#btn-hud-toggle').getAttribute('aria-expanded')==='false'||mode==='desktop',
     mode+': phone controls collapse when opening settings');
  };
  try {
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden===true,null,{timeout:90000});
   await open();
   assert.equal(await page.locator('#movement-speed-value').textContent(),'1.0×');
   // Exercise the same input event emitted by the on-screen slider.
   await page.locator('#movement-speed').evaluate(el=>{
    el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}));
   });
   assert.equal(await page.locator('#movement-speed-value').textContent(),'3.0×');
   assert.match(await page.locator('#movement-speed-preview').textContent(),/Run 22.8 m\/s/);
   assert.equal(await page.evaluate(()=>localStorage.getItem('repository-town.movement-speed.v1')),'3');
   await page.locator('#settings-close').click();
   assert(await page.locator('#settings').isHidden(),'game view restored');
   if(mode==='phone') {
    // One real tap must flip Run only once, even with a synthetic click.
    await page.tap('#t-run');
    assert.equal(await page.locator('#t-run').getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(()=>window.__town.driveDiagnostics().input.running),true);
    await page.tap('#t-run');
    assert.equal(await page.locator('#t-run').getAttribute('aria-pressed'),'false');
   }
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden===true,null,{timeout:90000});
   await open();
   assert.equal(await page.locator('#movement-speed-value').textContent(),'3.0×','saved across reload');
   await page.locator('#movement-speed-reset').click();
   assert.equal(await page.locator('#movement-speed-value').textContent(),'1.0×');
   assert.equal(await page.evaluate(()=>localStorage.getItem('repository-town.movement-speed.v1')),'1');
   await page.locator('#settings-close').click();
   assert.equal(errors.length,0,mode+': uncaught browser errors: '+errors.join(' | '));
   console.log('PASS '+mode+': settings slider changes immediately, saved after reload, reset, touch Run toggles once');
  } finally {await context.close();}
 }
} finally {await browser.close();}
