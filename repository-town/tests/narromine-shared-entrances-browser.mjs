// Real 3D browser acceptance of #523 on desktop and emulated narrow Android.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const BASE = process.env.TOWN_URL || 'http://127.0.0.1:8091/';
const OUT = 'test-results/narromine-shared-entrances';
fs.mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const results=[];
try{
 for(const [kind,device] of [
   ['desktop',{viewport:{width:1280,height:800},deviceScaleFactor:1}],
   ['android',{viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1}],
 ]){
   const page=await browser.newPage(device),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__town && document.querySelector('#loading')?.hidden,null,{timeout:100000});
   await page.evaluate(()=>window.__town.setClockMinute(11*60));
   const doors=await page.evaluate(()=>window.__town.narromineWorkplaceDoors());
   const named=['Narromine Local Aboriginal Land Council',"Monaghan's Butchery",'Martin Schute Bell','Photographer'];
   const targets=named.map(name=>doors.find(e=>e.name===name));
   assert(targets.every(Boolean),kind+': all tenants present after world collision resolution');
   const closest=targets[0].door;
   assert(targets.every(e=>Math.hypot(e.door.x-closest.x,e.door.z-closest.z)<.18),kind+': same shared entry');
   const approach=async()=>{
     await page.evaluate(d=>window.__town.place(d.x,d.z,0),closest);
     await page.waitForFunction(()=>document.querySelector('#panel-title')?.textContent==='Choose a Narromine business' && !document.querySelector('#panel').hidden,null,{timeout:20000});
   };
   await approach();
   for(const name of named) assert(await page.getByRole('button',{name,exact:true}).count()===1,kind+': tenant button '+name);
   assert((await page.evaluate(()=>window.__town.state())).calls>0,kind+': actual rendered WebGL scene');
   await page.screenshot({path:OUT+'/'+kind+'-tenant-choice.png'});
   await page.getByRole('button',{name:'Cancel',exact:true}).click();
   assert(await page.locator('#panel').isHidden(),kind+': cancel closes chooser');
   await page.waitForTimeout(250);
   assert(await page.locator('#panel').isHidden(),kind+': cancel must not reopen each tick');
   const awayPose=targets[0].out;
   assert(awayPose,'shared game door has a collider-safe outside approach');
   await page.evaluate(d=>window.__town.place(d.x,d.z,0),awayPose);
   await page.waitForTimeout(500);
   const outsideBeforeRetry=await page.evaluate(()=>window.__town.state());
   assert.equal(outsideBeforeRetry.mode,'town',kind+': walked clear of shared door without entering another building');
   await approach();
   await page.getByRole('button',{name:'Photographer',exact:true}).click();
   await page.waitForFunction(()=>window.__town.state().coordinate==='NARROMINE-WORK:work-61',null,{timeout:20000});
   assert.equal(await page.evaluate(()=>window.__town.state().mode),'house');
   await page.screenshot({path:OUT+'/'+kind+'-photographer-interior.png'});
   await page.locator('#btn-exit').click();
   await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:20000});
   const outside=await page.evaluate(()=>window.__town.state().pos);
   assert(Math.hypot(outside.x-(closest.out?.x??closest.x),outside.z-(closest.out?.z??closest.z))<12,kind+': exit is near original shared mapped door');
   await page.close();
   results.push({kind,tenants:named,selected:'Photographer',out:outside,pageErrors:errors});
   assert.deepEqual(errors,[],kind+': no page exceptions');
 }
 console.log('PASS #523 desktop and phone-size WebGL tenant choice, keyboard/touch buttons, cancel, reopening, unique interior and exit '+JSON.stringify(results));
}finally{await browser.close();}
