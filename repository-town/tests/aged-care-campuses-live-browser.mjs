// Live playable-build verification of both researched UPA campuses AND southside
// care-worker accommodation. Browser must render and support real player interaction.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const url=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1240,height:780},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  await page.evaluate(()=>window.__town.life.setTime(12*60));
  for(const [id,capacity] of [['bracken-house',72],['yeoval-aged-care',25]]){
   const result=await page.evaluate(id=>window.__town.enterCampus(id),id);
   assert(result,'campus entrance works '+id);
   await page.waitForTimeout(350);
   const state=await page.evaluate(()=>window.__town.state());
   assert.equal(state.mode,'house');
   assert(state.rooms>=4,'walkable care rooms '+id);
   assert(state.people.some(p=>p.visible&&p.key.includes(':resident:')),'living residents '+id);
   assert(state.people.some(p=>p.visible&&p.key.includes(':staff:')),'on-duty care staff '+id);
   assert(state.interactables.some(p=>p.key==='care:'+id+':noticeboard'),'care team noticeboard '+id);
   const census=await page.evaluate(id=>window.__town.carePopulation(id),id);
   assert.equal(census.residents,capacity);
   assert(census.onDuty.some(p=>p.role==='rn'),'registered nurse on duty '+id);
   // Use the real in-game keyboard interaction at the care team noticeboard.
   const approached=await page.evaluate(id=>window.__town.approach('care:'+id+':noticeboard'),id);
   assert(approached,'care noticeboard walkable and usable '+id);
   await page.keyboard.press('e');
   await page.waitForFunction(()=>!!window.__town.state().panel,null,{timeout:4500});
   assert.match((await page.evaluate(()=>window.__town.state().panel.text)),/fictional|simulated|NOT real/i);
   await page.evaluate(()=>window.__town.closePanel());
   await page.evaluate(()=>window.__town.life.setTime(23*60+30));
   await page.waitForTimeout(250);
   const night=await page.evaluate(campusId=>window.__town.carePopulation(campusId),id);
   assert(night.onDuty.some(p=>p.role==='rn'),'RN visible in night roster '+id);
   assert.equal(await page.evaluate(()=>window.__town.exitCampus()),true);
   assert.equal((await page.evaluate(()=>window.__town.state())).mode,'town');
   await page.evaluate(()=>window.__town.life.setTime(12*60));
  }
  const homes=await page.evaluate(()=>window.__town.careHomes());
  assert(homes.length>0,'actual vacant southern staff houses have been allocated');
  const home=homes.find(h=>h.people.some(w=>w.facility==='yeoval-aged-care'))||homes[0];
  assert(await page.evaluate(c=>window.__town.enterHome(c),home.coordinate),'enter allocated staff house');
  const household=await page.evaluate(()=>window.__town.state());
  assert(household.interactables.some(p=>p.key.startsWith('care-house:')),'care staff shift and residence details');
  assert(household.interactables.some(p=>/Care-worker bedroom/.test(p.room||'')||/Private bed/.test(p.label)),'staff bedrooms furnished');
  assert(household.rooms>=5,'domestic kitchen bathroom living room and bedrooms');
  assert.deepEqual(errors,[],'runtime exceptions');
  await context.close();
  console.log('PASS: both live care facilities, RN day/night, residents, physical note boards and share house on '+(mobile?'Android':'desktop'));
 }
}finally{await browser.close();}
