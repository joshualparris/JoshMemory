// Actual browser/Three.js regression for the Narromine public post office.
// Tests the physical entry sensor, counter, door exit, and save/reload on both
// desktop and an Android-sized touchscreen; this is not an imagined unit mock.
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';

const URL=process.argv.includes('--url')?process.argv[process.argv.indexOf('--url')+1]:(process.env.TOWN_URL||'http://localhost:8091/');
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [device,options] of [
   ['desktop',{viewport:{width:1180,height:760}}],
   ['android',{...devices['Pixel 7']}],
 ]){
  const context=await browser.newContext(options);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
  await page.goto(URL);
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  await page.evaluate(()=>window.__town.closePanel?.());
  const e=await page.evaluate(()=>window.__town.narrominePostOfficeEntrance());
  assert(Math.hypot(e.x-e.outside.x,e.z-e.outside.z)>1.3,device+': outside and threshold are distinct');
  const outsideClear=await page.evaluate(e=>!window.__town.probeStatic(e.outside.x,e.outside.z,.36),e);
  assert(outsideClear,device+': north-side sidewalk clear of external building colliders');
  await page.evaluate(e=>window.__town.place(e.x,e.z,e.yaw),e);
  await page.waitForFunction(()=>window.__town.state().mode==='house',null,{timeout:12000});
  let state=await page.evaluate(()=>window.__town.state());
  assert.equal(state.coordinate,'NARROMINE-PO',device+': entering the actual doorway loads postal interior');
  assert(state.interactables.some(x=>x.key==='narromine-post-office:counter'),device+': dedicated postal service counter');
  assert(state.interactables.some(x=>x.key==='narromine-post-office:boxes'),device+': PO boxes and retail');
  assert(state.interactables.some(x=>x.key==='narromine-post-office:packing'),device+': packing bench');
  assert.equal(state.floor,0,device+': ground-floor public retail only');
  assert(state.props>=0,device+': scene is initialised');
  const approach=await page.evaluate(()=>window.__town.approach('narromine-post-office:counter'));
  assert(approach,device+': accessible position at postal counter');
  await page.keyboard.press('e');
  await page.waitForFunction(()=>/Narromine Post Office.*Service counter/i.test(window.__town.state().panel?.title||''),null,{timeout:5000});
  state=await page.evaluate(()=>window.__town.state());
  assert(/Letters and postage/.test(state.panel?.buttons.join(' ')||''),device+': real counter menu available');
  await page.evaluate(()=>window.__town.closePanel?.());
  await page.evaluate(()=>window.__town.place(0,5.1,Math.PI));
  await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:12000});
  state=await page.evaluate(()=>window.__town.state());
  assert(Math.hypot(state.pos.x-e.returnPose.x,state.pos.z-e.returnPose.z)<.2,device+': door exits back onto correct north-side footpath');
  assert(await page.evaluate(()=>!window.__town.probeStatic(window.__town.state().pos.x,window.__town.state().pos.z,.36)),device+': exterior exit does not clip into building');
  // Save while inside; use the existing pagehide persistence and reload path.
  await page.evaluate(e=>window.__town.place(e.x,e.z,e.yaw),e);
  await page.waitForFunction(()=>window.__town.state().coordinate==='NARROMINE-PO',null,{timeout:12000});
  await page.reload();
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading')?.hidden,null,{timeout:90000});
  state=await page.evaluate(()=>window.__town.state());
  assert.equal(state.coordinate,'NARROMINE-PO',device+': reload restores indoor postal state');
  await page.evaluate(()=>window.__town.place(0,5.15,Math.PI));
  await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:12000});
  // Narromine Coles is a *separate* walk-in venue, not Repository Town's
  // small supermarket. Verify front door, six retail zones, checkout and exit.
  const coles=await page.evaluate(()=>window.__town.narromineColesEntrance());
  assert(Math.hypot(coles.x-coles.outside.x,coles.z-coles.outside.z)>1.12,device+': Coles outside position is not an auto-enter trap');
  assert(await page.evaluate(e=>!window.__town.probeStatic(e.outside.x,e.outside.z,.25),coles),
    device+': Coles outside door is not inside a solid Narromine wall');
  await page.evaluate(e=>window.__town.place(e.x,e.z,e.yaw),coles);
  await page.waitForFunction(()=>window.__town.state().coordinate==='NARROMINE-COLES',null,{timeout:12000});
  state=await page.evaluate(()=>window.__town.state());
  assert.equal(state.coordinate,'NARROMINE-COLES',device+': enters separate real-town Coles');
  for(const zone of ['produce','pantry','bakery','chilled','freezer','checkout'])assert(
    state.interactables.some(e=>e.key==='narromine-coles:'+zone),device+': '+zone+' retail zone');
  const reachable=await page.evaluate(()=>window.__town.approach('narromine-coles:checkout'));
  assert(reachable,device+': walkable customer checkout from entry');
  await page.evaluate(()=>window.__town.closePanel?.());
  await page.evaluate(()=>window.__town.place(0,25.1,0));
  await page.waitForFunction(()=>window.__town.state().mode==='town',null,{timeout:12000});
  state=await page.evaluate(()=>window.__town.state());
  assert(Math.hypot(state.pos.x-coles.returnPose.x,state.pos.z-coles.returnPose.z)<.2,
    device+': Coles exit returns outside real mapped store');
  assert(await page.evaluate(()=>!window.__town.probeStatic(window.__town.state().pos.x,window.__town.state().pos.z,.25)),
    device+': Coles exit is not trapped in exterior walls');
  const leah=await page.evaluate(()=>window.__town.narrominePostalResident());
  assert.equal(leah.id,'narromine:post-office:leah-bennett',device+': unique physical Narromine worker ID');
  assert.equal(leah.homeOsmIndex,203,device+': same mapped OSM home after Coles visit');
  assert(!errors.length,device+': no browser errors '+errors.join('; '));
  console.log('PASS '+device+': Post Office entry, service desk, footpath exit, reload, WebGL scene');
  await context.close();
 }
}finally{await browser.close();}
