// End-to-end Narromine regional drive on the actual bundled WebGL build.
// Node / Playwright Chromium, accelerated real driving steps (not teleporting).
// Desktop: enter an owned car, drive continuously from Wattle Street, park,
// inspect a site, search the map and verify position on reload.
// Phone: touchscreen landmark Use and searchable map in the same rendered scene.
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const URL=process.env.TOWN_PLAYTEST_URL||process.env.TOWN_URL||'http://127.0.0.1:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const failures=[];
const contexts=[];
try {
 for(const mobile of [false,true]){
  const context=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1200,height:800}});
  contexts.push(context);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
  await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:120000});
  const tag=mobile?'Android':'Desktop';
  const sites=await page.evaluate(()=>window.__town.narromineSites());
  assert(sites.length>=10,`${tag}: Narromine landmark list appears in real game`);
  const roads=await page.evaluate(()=>window.__town.regionalRoads());
  assert(roads.some(r=>r.id==='western-regional-link'),`${tag}: regional road available`);
  if(!mobile){
   await page.evaluate(()=>{
    const t=window.__town;
    t.closePanel();t.place(-1320,277,Math.PI/2);
    t.cheats.open();document.getElementById('cheat-vehicle').value='hatch';
    t.cheats.run('carHere');t.cheats.close();
   });
   const starting=await page.evaluate(()=>window.__town.driveDiagnostics());
   assert(starting.active,`Desktop: car starts on Wattle Street: ${JSON.stringify(starting)}`);
   assert(Math.abs(starting.vehicle.z-277)<3,'Desktop: car starts on connected road');
   // Genuine input.keyboard feeds the game's real input state; the hooked update
   // simulates time without hundreds of seconds waiting for real frames.
   await page.keyboard.down('w');
   const drive=await page.evaluate(()=>{
    const t=window.__town,trace=[];
    for(let step=0;step<3600;step++){
      t.stepVehicle(.05);
      if(step%80===0){
        const v=t.driveDiagnostics().vehicle;
        trace.push({x:v?.x,z:v?.z,fuel:v?.fuel,odometer:v?.odometer,step});
      }
      if((t.driveDiagnostics().vehicle?.x??Infinity)<-2590)break;
    }
    return {trace,last:t.driveDiagnostics(),region:t.regionAt(t.state().pos.x,t.state().pos.z)};
   });
   await page.keyboard.up('w');
   const last=drive.last.vehicle;
   assert(last?.x<-2590,`Desktop: drove full route without teleporting; last x=${last?.x}; trace=${JSON.stringify(drive.trace.slice(-8))}`);
   assert(Math.abs(last.z-277)<4,`Desktop: road trajectory stays on westbound carriageway (z=${last.z})`);
   assert(drive.trace.some(t=>t.x<-1750)&&drive.trace.some(t=>t.x<-2200),'Desktop: passed through intermediate rural road');
   assert(drive.trace.at(0).fuel>last.fuel && last.odometer>drive.trace[0].odometer,'Desktop: real vehicle fuel and odometer updated');
   assert(drive.region,'Desktop: reached named Narromine region in connected world');
   // Brake using existing vehicle physics, then exit using its real parking rules.
   const parked=await page.evaluate(()=>{
     const t=window.__town;
     for(let step=0;step<60;step++)t.stepVehicle(.05);
     return {message:t.leaveVehicle(),state:t.state()};
   });
   assert(/Parked/.test(parked.message),`Desktop: parked safely: ${parked.message}`);
   assert(!parked.state.driving,'Desktop: returned to normal on-foot movement');
  }
  // On foot, test real input binding and the exact source-backed discovery panel.
  await page.evaluate(()=>{window.__town.closePanel();window.__town.place(-2641,210,Math.PI/2);});
  await page.waitForFunction(()=>/Explore Narromine Library/.test(document.getElementById('prompt')?.textContent||''),null,{timeout:12000});
  if(mobile)await page.tap('#t-use');
  else await page.keyboard.press('e');
  await page.waitForFunction(()=>/Narromine Library/.test(window.__town.state().panel?.title||''),null,{timeout:10000});
  const info=await page.evaluate(()=>window.__town.state().panel);
  assert(/https?:/.test(info.text||'')||info.title.includes('Library'),`${tag}: real landmark panel opened`);
  await page.evaluate(()=>{window.__town.closePanel();window.__town.townMap.open();});
  const selected=await page.evaluate(()=>window.__town.townMap.select('Narromine Aviation Museum'));
  assert(selected?.name==='Narromine Aviation Museum',`${tag}: Narromine museum searchable in actual map`);
  await page.evaluate(()=>window.__town.townMap.close());
  // Travel on land, not inside a fictional building: persist and restore.
  if(!mobile){
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:120000});
    const saved=await page.evaluate(()=>window.__town.state());
    assert(saved.region==='Narromine'&&Math.hypot(saved.pos.x+2641,saved.pos.z-210)<5,`Desktop: arrival and pedestrian save restore: ${JSON.stringify(saved.pos)}`);
  }
  assert.deepEqual(errors,[],`${tag} browser JS errors`);
  console.log(`PASS Narromine ${tag}: ${mobile?'touch Use + map':'real driving corridor + fuel + park + landmark + map + reload'}`);
  await context.close();
 }
} catch(e){failures.push(e.stack||String(e));}
finally {for(const c of contexts)await c.close().catch(()=>{});await browser.close();}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
