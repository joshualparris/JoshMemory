import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const origin='http://127.0.0.1:8091/';
let visits=0;
try {
 for(const viewport of [{width:1280,height:900,kind:'desktop'},{width:390,height:844,kind:'phone'}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.kind==='phone',isMobile:viewport.kind==='phone'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin);await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:60000});
  const shops=await page.evaluate(()=>window.__town.shops());
  assert(shops.length>=20,'expected 20+ civic locations');
  for(const site of (viewport.kind==='phone'?shops.slice(0,8):shops)){
   const ok=await page.evaluate(id=>window.__town.enterShop(id),site.id);
   assert(ok,site.id+' failed to enter');
   const state=await page.evaluate(()=>window.__town.state());
   assert.equal(state.mode,'house',site.id+' not indoors');
   assert(state.rooms>=1,site.id+' no room');
   assert(state.interactables.some(x=>x.do==='civic-ledger'),site.id+' no ledger counter');
   const leave=await page.evaluate(()=>window.__town.exitShop());
   assert.equal(leave,true,site.id+' exit failed');
   assert.equal((await page.evaluate(()=>window.__town.state())).mode,'town',site.id+' stuck in shop');
   visits++;
  }
  // Independent front-door check, in addition to test-hook entry.
  const first=shops.find(x=>x.id==='bakery')||shops[0];
  await page.evaluate(site=>window.__town.place(site.door.x,site.door.z+0.4,0),first);
  await page.waitForFunction(()=>window.__town.state().mode==='house',{timeout:12000}).catch(()=>{});
  assert.equal((await page.evaluate(()=>window.__town.state())).mode,'house','front-door walk-in transition');
  await page.evaluate(()=>window.__town.exitShop());
  assert.equal(errors.length,0,viewport.kind+': '+errors.join('|'));
  console.log('PASS: '+viewport.kind+' '+(viewport.kind==='phone'?8:shops.length)+' shop interiors, interactables and exits');
  await page.close();
 }
 console.log('PASS: '+visits+' civic indoor visits across desktop and mobile');
}finally{await browser.close();}
