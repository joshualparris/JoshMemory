// Genuine WebGL interior acceptance on desktop and Pixel-7-size Chromium.
// The map-to-building location is explicitly *provisional*: this checks the
// simulated candidate and never mislabels it a verified surveyed entrance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium,devices } from 'playwright';
const base=process.env.TOWN_URL||'http://127.0.0.1:8091/';
const out='test-results/narromine-soul-food';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [device,options] of [['desktop',{viewport:{width:1180,height:760}}],['phone',{...devices['Pixel 7']}]]) {
  const ctx=await browser.newContext(options),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  await page.evaluate(()=>{
    window.__town.closePanel?.();
    window.__town.life.setDay(2);
    window.__town.life.setTime(10*60+30);
  });
  const e=await page.evaluate(()=>window.__town.narromineWorkplaceDoors().find(p=>p.name==='Soul Food Depot & Gallery'));
  assert(e && e.door && e.out,device+': named venue has a resolved doorway in actual 3D scene');
  assert(await page.evaluate(p=>!window.__town.probeStatic(p.out.x,p.out.z,.27),e),
    device+': outdoor approach is free of solid walls');
  await page.evaluate(p=>window.__town.place(p.door.x,p.door.z,0),e);
  await page.waitForFunction(()=>window.__town.state().coordinate?.startsWith('NARROMINE-WORK:')&&window.__town.state().mode==='house',
    null,{timeout:20000});
  let state=await page.evaluate(()=>window.__town.state());
  assert.equal(state.coordinate,'NARROMINE-WORK:'+e.id,device+': correct named venue loaded');
  assert(state.interactables.some(x=>x.key==='narromine-soulfood:history'),device+': converted citrus shed history');
  assert(state.interactables.some(x=>x.key==='narromine-soulfood:hours'),device+': verified cafe hours and conflict');
  assert(state.interactables.some(x=>x.key==='narromine-soulfood:events'),device+': event room');
  assert(state.interactables.some(x=>x.key==='narromine-soulfood:meeting'),device+': boardroom capacities');
  assert(state.interactables.some(x=>x.label==='Loading Dock takeaway collection'),device+': takeaway collection area');
  assert(state.interactables.some(x=>x.label==='Catering preparation'),device+': commercial cooking');
  const before=await page.evaluate(()=>window.__town.state());
  assert(before.triangles>2000,device+': actual WebGL meshes drawn');
  await page.screenshot({path:`${out}/${device}-soul-food-interior.png`});
  assert(await page.evaluate(()=>window.__town.approach('narromine-soulfood:history')),
    device+': sourced history information station is physically reachable');
  await page.keyboard.press('e');
  await page.waitForFunction(()=>/From citrus packing shed to gallery/.test(window.__town.state().panel?.title||''),null,{timeout:8000});
  assert(/2014/.test(await page.evaluate(()=>document.body.innerText)),device+': public venue history shown');
  await page.evaluate(()=>window.__town.closePanel?.());
  // Phones start with a collapsed HUD. Open the real controls before tapping Exit.
  if (await page.locator('#hud').evaluate(h=>h.classList.contains('hud-minimised')))
    await page.locator('#btn-hud-toggle').click();
  await page.locator('#btn-exit').click();
  await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:16000});
  state=await page.evaluate(()=>window.__town.state());
  assert(Math.hypot(state.pos.x-e.out.x,state.pos.z-e.out.z)<3.2,device+': exit returns to candidate actual footprint, not a duplicate generic shop');
  assert(!errors.length,device+': zero browser errors: '+errors.join('; '));
  console.log('PASS '+device+': named Dandaloo candidate entrance, unique Soul Food zones, real service panel, GPU draw, exit, zero JS errors');
  await ctx.close();
 }
}finally{await browser.close();}
