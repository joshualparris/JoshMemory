// Browser-grade acceptance for the ACTUAL built Repository Town game.
// Invokes the live HUD and real simulation; not a mock screen.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import fs from 'node:fs';
const origin=process.env.TOWN_URL||'http://127.0.0.1:8080/';
const shots=process.env.TOWN_SHOTS||'audit/electricity/pilot-playtest';
fs.mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const errors=[];
try{
  for(const viewport of [{width:1240,height:760},{width:390,height:844}]){
    const page=await browser.newPage({viewport});
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(origin,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:100000});
    const snap=await page.evaluate(()=>window.__town.pilotGrid());
    assert.equal(snap.siteCount,16);
    assert.equal(snap.siteById['B:hotel'].mains,true);
    assert.equal(snap.siteById['B:pub'].mains,true);
    assert.equal(snap.siteById['H:N7'].mains,true);
    // Grid and AI launchers belong to the collapsible town controls.
    // Both must disappear in the compact mobile HUD (no floating overlays).
    const grid=page.locator('#btn-electrical-grid');
    const ask=page.locator('#town-companion-button');
    const menu=page.locator('#btn-hud-toggle');
    await ask.waitFor({state:'attached'});
    assert(await grid.evaluate(el=>!!el.closest('#hud-details .row')),'Grid belongs to the + menu');
    assert(await ask.evaluate(el=>!!el.closest('#hud-details .row')),'Ask AI belongs to the + menu');
    assert.equal(await grid.evaluate(el=>getComputedStyle(el).position),'static');
    assert.equal(await ask.evaluate(el=>getComputedStyle(el).position),'static');
    if(viewport.width<=700){
      assert.equal(await grid.isVisible(),false,'Grid must not float over collapsed phone controls');
      assert.equal(await ask.isVisible(),false,'Ask AI must not float over collapsed phone controls');
      await menu.click();
    }
    assert(await grid.isVisible()&&await ask.isVisible(), 'Both controls must show inside expanded menu');
    // Real on-screen AI launcher works and collapses the huge menu behind the dialog.
    await ask.click();
    await page.waitForTimeout(120);
    assert(await page.locator('#town-companion').isVisible(),'Ask AI opens from + menu');
    if(viewport.width<=700)assert.equal(await grid.isVisible(),false,'Menu minimises after Ask AI opens');
    await page.locator('#companion-close').click();
    if(viewport.width<=700)await menu.click();
    await grid.click();
    if(viewport.width<=700)assert.equal(await grid.isVisible(),false,'Menu minimises after Grid opens');
    await page.waitForTimeout(200);
    const text=await page.locator('#panel').innerText();
    assert(/Railway Hotel/.test(text));
    assert(/kWh/.test(text));
    assert(/post office/i.test(text));
    assert(/Railway Hotel/.test(text));
    assert(/wiring/i.test(text));
    await page.screenshot({path:shots+'/grid-inspector-'+viewport.width+'.png'});
    // Actually scroll to and CLICK the public panel controls on both viewport
    // sizes; exercising debug hooks alone would miss unreachable mobile buttons.
    const tripPub=page.locator('#panel-actions button').filter({hasText:'Trip pub service'});
    await tripPub.scrollIntoViewIfNeeded();
    await tripPub.click();
    const isolated=await page.evaluate(()=>window.__town.pilotGrid());
    assert.equal(isolated.siteById['B:pub'].mains,false);
    assert.equal(isolated.siteById['B:post'].mains,true);
    assert.equal(isolated.siteById['B:hotel'].mains,true);
    assert.equal(isolated.siteById['B:bakery'].mains,true);
    const tripHotel=page.locator('#panel-actions button').filter({hasText:'Trip Railway Hotel service'});
    await tripHotel.scrollIntoViewIfNeeded();
    await tripHotel.click();
    const hotel=await page.evaluate(()=>window.__town.pilotGrid());
    assert.equal(hotel.siteById['B:hotel'].mains,false);
    assert.equal(hotel.siteById['B:post'].mains,true);
    const restoreHotel=page.locator('#panel-actions button').filter({hasText:'Restore Railway Hotel service'});
    await restoreHotel.scrollIntoViewIfNeeded();await restoreHotel.click();
    const toggle=page.locator('#panel-actions button').filter({hasText:'Show ⚡ wiring overlay'});
    await toggle.scrollIntoViewIfNeeded();await toggle.click();
    await page.screenshot({path:shots+'/pub-outage-'+viewport.width+'.png'});
    await page.evaluate(()=>window.__town.pilotAction('fault:SERVICE:B:pub'));
    await page.evaluate(()=>window.__town.pilotAction('fault:MV-TX-R7-B3'));
    const houses=await page.evaluate(()=>window.__town.pilotGrid());
    assert.equal(houses.siteById['H:N7'].mains,false);
    assert.equal(houses.siteById['H:K7'].mains,true);
    assert.equal(houses.siteById['B:pub'].mains,true);
    await page.close();
  }
  assert.deepEqual(errors,[],'browser pageerrors: '+errors.join(' | '));
  console.log('PASS: compact + menu houses AI and Grid launchers, expands/auto-collapses, plus live desktop & 390px mobile 3D game loaded; grid HUD with touch-clicked action buttons, 16 site meters, local pub blackout, neighbour separation, north-house transformer faults and wiring overlay');
} finally { await browser.close(); }
