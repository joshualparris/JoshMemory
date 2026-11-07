// Actual WebGL entry/exit tests for #439's new specialist premises.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const BASE=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const OUT='test-results/town-linked-premises';
fs.mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const data=[];
try{
 for(const [form,device] of [['desktop',{viewport:{width:1280,height:800}}],
                             ['phone',{viewport:{width:393,height:852},isMobile:true,hasTouch:true}]]){
   const page=await browser.newPage(device),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__town&&document.querySelector('#loading')?.hidden,null,{timeout:100000});
   await page.evaluate(()=>{window.__town.life.setTime(11*60);window.__town.life.run(10);});
   for(const id of ['vet','hardware']){
     const entered=await page.evaluate(id=>window.__town.enterShop(id),id);
     assert(entered,form+': '+id+' must be accessible during staffed game time');
     await page.waitForFunction(()=>window.__town.state().mode==='house',null,{timeout:15000});
     const state=await page.evaluate(()=>window.__town.state());
     if(id==='vet')assert.equal(state.rooms,3,form+': vet three distinct rooms rendered');
     else assert(state.rooms>=1,form+': pre-existing hardware layout preserved');
     // The new veterinary premises has eight or more meaningful exhibits.
     // Existing bespoke hardware has fewer original interactions by design;
     // preserve those controls instead of forcing a new threshold onto it.
     assert(state.interactables.length>=(id==='vet'?8:3),form+': '+id+' usable fixtures and staff');
     assert(state.calls>0&&state.triangles>1000,form+': renderer has active 3D scene');
     await page.screenshot({path:OUT+'/'+form+'-'+id+'.png'});
     await page.evaluate(()=>document.querySelector('#btn-exit').click());
     await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:15000});
     data.push({form,id,props:state.props,rooms:state.rooms,windows:state.windows});
   }
   assert.deepEqual(errors,[],form+': page errors');
   await page.close();
 }
 fs.writeFileSync(OUT+'/acceptance.json',JSON.stringify(data,null,2));
 console.log('PASS #439 real desktop and phone-size WebGL vet/hardware interiors '+JSON.stringify(data));
}finally{await browser.close();}
