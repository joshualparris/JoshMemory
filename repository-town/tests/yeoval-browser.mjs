// Real Chromium gameplay coverage for Yeoval campus, desktop + mobile:
//   TOWN_PLAYTEST_URL=http://127.0.0.1:8091 node tests/yeoval-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const url=process.env.TOWN_PLAYTEST_URL||'http://127.0.0.1:8091/';
const dir='test-results/yeoval-campus';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try {
  for (const device of [{id:'desktop',width:1100,height:720,mobile:false},{id:'android',width:393,height:852,mobile:true}]) {
    const context=await browser.newContext({
      viewport:{width:device.width,height:device.height},
      isMobile:device.mobile,hasTouch:device.mobile,
      deviceScaleFactor:1
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
    const campus=await page.evaluate(()=>window.__town.campuses().find(x=>x.id==='yeoval-aged-care'));
    assert.ok(campus,device.id+': yeoval campus registered');
    assert.ok(campus.door.z < -240,device.id+': campus north of existing eight streets');
    assert.ok(campus.wings.length>=3,device.id+': multi-wing footprint');
    await page.evaluate(s=>window.__town.place(s.door.x,s.door.z-1.0,0),campus);
    await page.waitForFunction(()=>window.__town.state().mode==='house',null,{timeout:12000});
    let state=await page.evaluate(()=>window.__town.state());
    assert.equal(state.coordinate,'YEOVAL',device.id+': entered target care home');
    assert.ok(state.rooms>=4,device.id+': linked indoor zones');
    assert.ok(state.props>=15,device.id+': resident care furniture');
    assert.ok(state.interactables.some(x=>x.key==='yeoval:dining'),device.id+': dining exhibit');
    await page.screenshot({path:path.join(dir,device.id+'-interior.png')});
    await page.evaluate(()=>window.__town.place(0,16.15,Math.PI));
    await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:10000});
    state=await page.evaluate(()=>window.__town.state());
    assert.ok(Math.abs(state.pos.x-campus.door.x)<1,device.id+': exited at entrance x');
    assert.ok(state.pos.z<campus.door.z-2.5,device.id+': exited on north FRONT, not back wall');
    assert.ok(!errors.length,device.id+': no JavaScript page errors ('+errors.join('; ')+')');
    await page.screenshot({path:path.join(dir,device.id+'-outside.png')});
    await context.close();
    console.log(device.id+': actual WebGL campus entry, interior and north-exit verified.');
  }
}finally{await browser.close();}
