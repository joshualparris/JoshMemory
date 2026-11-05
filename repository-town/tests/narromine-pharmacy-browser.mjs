// Desktop + phone-size actual game: approach mapped door, load the individual shop,
// check rendered fixtures and an unobstructed route, then use the real Exit button.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, devices } from 'playwright';

const url=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const folder='test-results/narromine-pharmacy';
fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 for (const [device,options] of [['desktop',{viewport:{width:1180,height:760}}],['android',{...devices['Pixel 7']}]]) {
  const ctx=await browser.newContext(options),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  await page.evaluate(()=>{
    window.__town.closePanel?.();
    window.__town.life.setDay(2);window.__town.life.setTime(10*60+30);
  });
  const e=await page.evaluate(()=>window.__town.narromineWorkplaceDoors().find(x=>x.name==='Narromine Pharmacy'));
  assert(e && e.door && e.id,device+': mapped pharmacy workplace has a resolved public door');
  const outsideClear=await page.evaluate(e=>!window.__town.probeStatic(e.out.x,e.out.z,.3),e);
  assert(outsideClear,device+': pharmacy street approach is physically unblocked');
  await page.evaluate(e=>window.__town.place(e.door.x,e.door.z,0),e);
  await page.waitForFunction(()=>window.__town.state().coordinate?.startsWith('NARROMINE-WORK:')&&window.__town.state().mode==='house',
    null,{timeout:16000});
  let state=await page.evaluate(()=>window.__town.state());
  assert(state.interactables.some(x=>x.label==='Eyewear and gifts'),device+': unique photographed merchandising types visible in shop');
  assert(state.interactables.some(x=>x.label==='Sleep health and CPAP enquiries'),device+': specific service zone');
  assert(state.interactables.some(x=>x.label==='Robotic dose-aid packing station'),device+': specific known pharmacy process');
  assert(state.interactables.some(x=>x.label==='Pharmacy services and hours'),device+': original shop information hotspot');
  for(let z=-1.4;z>=-10.5;z-=0.7){
   assert(!await page.evaluate(z=>window.__town.probeStatic(0,z,.32),z),
     device+': walkable front central aisle at z='+z.toFixed(1));
  }
  await page.screenshot({path:`${folder}/${device}-pharmacy-interior.png`});
  assert(await page.evaluate(()=>window.__town.approach('narromine-pharmacy:services')),
    device+': original services hotspot is reachable by a customer');
  await page.keyboard.press('e');
  await page.waitForFunction(()=>/Pharmacy services and hours/.test(window.__town.state().panel?.title||''),
    null,{timeout:6000});
  assert(/09:00/.test(await page.evaluate(()=>document.body.innerText)),device+': real published pharmacy hours appear');
  await page.evaluate(()=>window.__town.closePanel?.());
  // A genuine UI action leaves the shop and returns to its mapped street door.
  await page.locator('#btn-exit').click();
  await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:16000});
  state=await page.evaluate(()=>window.__town.state());
  assert(Math.hypot(state.pos.x-e.out.x,state.pos.z-e.out.z)<3,
    device+': exit returns to the actual pharmacy frontage, not a fictional warehouse');
  assert(!errors.length,device+': zero script errors: '+errors.join('; '));
  console.log('PASS '+device+': mapped pharmacy threshold, bespoke shop, service information, real navigation and street return');
  await ctx.close();
 }
}finally{await browser.close();}
