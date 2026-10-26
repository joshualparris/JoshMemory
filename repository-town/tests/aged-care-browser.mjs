// End-to-end aged-care entry, room interactions, exit and re-entry on desktop and mobile.
// Run against a built/served game: node tests/aged-care-browser.mjs --url http://localhost:8091/
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const args=process.argv.slice(2);
const url=args.includes('--url')?args[args.indexOf('--url')+1]:'http://localhost:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
let failures=0;
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1200,height:800},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,{timeout:90000});
   await page.evaluate(()=>{window.__town.life.setTime(9*60);window.__town.life.run(90);});
   const site=await page.evaluate(()=>window.__town.shops().find(s=>s.id==='agedcare'));
   assert(site,'aged-care civic site missing');
   await page.evaluate(s=>window.__town.place(s.door.x,s.door.z+.4,0),site);
   await page.waitForFunction(()=>window.__town.state().mode==='house',{timeout:12000});
   const state=await page.evaluate(()=>window.__town.state());
   assert(state.rooms>=6,'aged-care rooms missing');
   assert(state.interactables.some(x=>x.key==='agedcare:welcome'),'welcome hotspot missing');
   for(const key of ['agedcare:welcome','agedcare:bedrooms','agedcare:activities','agedcare:dining','agedcare:handover']){
    const approached=await page.evaluate(k=>window.__town.approach(k),key);
    assert(approached,'unreachable interaction: '+key);
    await page.keyboard.press('e');
    await page.waitForFunction(()=>!!window.__town.state().panel,{timeout:3000});
    await page.evaluate(()=>window.__town.closePanel());
   }
   const exited=await page.evaluate(()=>window.__town.exitShop());
   assert(exited,'exitShop returned false');
   assert.equal(await page.evaluate(()=>window.__town.state().mode),'town','exit did not restore town');
   await page.evaluate(s=>window.__town.place(s.door.x,s.door.z+.4,0),site);
   await page.waitForFunction(()=>window.__town.state().mode==='house',{timeout:12000});
   assert.equal(errors.length,0,'uncaught browser errors: '+errors.join(' | '));
   console.log('PASS aged-care browser '+(mobile?'Android-sized touch':'desktop')+': enter, five interactions, exit, re-enter');
  }catch(e){failures++;console.error('FAIL '+(mobile?'mobile':'desktop')+': '+e.stack);}
  await context.close();
 }
}finally{await browser.close();}
process.exitCode=failures?1:0;
