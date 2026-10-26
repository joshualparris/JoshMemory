// Test actual rendered regional Post Office, not just source strings.
// Runs within the recorded WebGL GitHub workflow on desktop and Pixel 7 emulation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,devices} from 'playwright';
const url=process.env.TOWN_PLAYTEST_URL||'http://127.0.0.1:8091/';
const folder='test-results/webgl-playtest/post-office';
fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 for(const [kind,opts] of [['desktop',{viewport:{width:1280,height:720}}],['mobile',{...devices['Pixel 7']}]]) {
  const context=await browser.newContext(opts);
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   const reply=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   assert.equal(reply?.status(),200,kind+' game loads successfully');
   await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden===true,{timeout:90000});
   const webgl=await page.evaluate(()=>[...document.querySelectorAll('canvas')].some(c=>{const g=c.getContext('webgl2')||c.getContext('webgl');return !!g&&!g.isContextLost();}));
   assert(webgl,kind+' real WebGL context is available');
   const site=await page.evaluate(()=>window.__town.shops().find(p=>p.id==='post'));
   assert(site&&site.door,kind+' external Post Office site is present');
   await page.evaluate(()=>window.__town.life.setTime(9*60));
   let access=null;
   for(let i=0;i<32;i++) {
     access=await page.evaluate(()=>window.__town.facilityState('post'));
     if(access?.allowed)break;
     await page.evaluate(()=>window.__town.advanceSimulation(10));
   }
   assert(access?.allowed,kind+' Post Office should be physically staffed during opening hours: '+JSON.stringify(access));
   const entered=await page.evaluate(()=>window.__town.enterShop('post'));
   assert(entered!==false,kind+' real shop entry succeeds');
   await page.waitForFunction(()=>window.__town.state().mode==='house',null,{timeout:15000});
   const inside=await page.evaluate(()=>window.__town.state());
   for(const k of ['post:counter','post:queue','post:collection','post:lower-counter','post:postage','post:letterbox','post:tracking','post:boxes','post:parcels','post:packing'])
     assert(inside.interactables.some(v=>v.key===k),kind+' interactive station '+k+' exists in 3D');
   assert(inside.windows>=4&&inside.rooms===1,kind+' fitted post interior and windows are present');
   const image=await page.screenshot({path:folder+'/'+kind+'-counter.png'});
   assert(image.length>9000,kind+' real post office image is non-empty');
   await page.evaluate(()=>window.__town.exitShop());
   const outside=await page.evaluate(()=>window.__town.state());
   assert.equal(outside.mode,'town',kind+' returns to street after Postal counter');
   const dx=outside.pos.x-site.door.x,dz=outside.pos.z-site.door.z;
   assert(Math.hypot(dx,dz)<14,kind+' returned by the same street frontage');
   assert.equal(errors.length,0,kind+' has no JS page errors: '+errors.join(', '));
   console.log('PASS',kind,'Post Office 3D frontage, secure service counter and physical entry/exit',{pos:outside.pos,door:site.door});
  }finally{await context.close();}
 }
}finally{await browser.close();}
