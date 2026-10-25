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
    await page.locator('#btn-electrical-grid').click();
    await page.waitForTimeout(200);
    const text=await page.locator('#panel').innerText();
    assert(/Railway Hotel/.test(text));
    assert(/kWh/.test(text));
    assert(/post office/i.test(text));
    assert(/Railway Hotel/.test(text));
    assert(/wiring/i.test(text));
    await page.screenshot({path:shots+'/grid-inspector-'+viewport.width+'.png'});
    let status=await page.evaluate(()=>window.__town.pilotAction('fault:SERVICE:B:pub'));
    assert(status.includes('fault:SERVICE:B:pub'));
    const isolated=await page.evaluate(()=>window.__town.pilotGrid());
    assert.equal(isolated.siteById['B:pub'].mains,false);
    assert.equal(isolated.siteById['B:post'].mains,true);
    assert.equal(isolated.siteById['B:hotel'].mains,true);
    assert.equal(isolated.siteById['B:bakery'].mains,true);
    await page.evaluate(()=>window.__town.pilotAction('fault:SERVICE:B:hotel'));
    const hotel=await page.evaluate(()=>window.__town.pilotGrid());
    assert.equal(hotel.siteById['B:hotel'].mains,false);
    assert.equal(hotel.siteById['B:post'].mains,true);
    await page.evaluate(()=>window.__town.pilotAction('fault:SERVICE:B:hotel'));
    await page.evaluate(()=>window.__town.pilotAction('toggleOverlay'));
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
  console.log('PASS: live desktop & 390px mobile 3D game loaded; grid HUD, 16 site meters, local pub blackout, neighbour separation, north-house transformer faults and wiring overlay');
} finally { await browser.close(); }
