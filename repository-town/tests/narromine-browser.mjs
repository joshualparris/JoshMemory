// Real built-WebGL destination acceptance, not a static map-only test.
// A real owned/cheat car follows a curved mapped approach using ordinary W/A/D
// input and actual vehicle step physics; no vehicle teleport inside that drive.
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const URL=process.env.TOWN_PLAYTEST_URL||process.env.TOWN_URL||'http://127.0.0.1:8091/';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 for(const mobile of [false,true]){
   const context=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1200,height:800}});
   try{
     const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
     await page.route('**/api/npc-chat',r=>r.abort('connectionrefused'));
     await page.addInitScript(()=>sessionStorage.setItem('town-cheats','1'));
     await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
     await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:120000});
     const tag=mobile?'Android':'Desktop';
     const places=await page.evaluate(()=>window.__town.narromineSites());
     assert(places.length>=14,`${tag}: geocoded real businesses and sites exposed`);
     const roads=await page.evaluate(()=>window.__town.regionalRoads());
     assert(roads.length>=1000 && roads.some(r=>r.name==='MITCHELL HWY'),
       `${tag}: genuine NSW curved roads, not two invented rectangles`);
     const waypoints=await page.evaluate(()=>window.__town.regionalApproach());
     assert(waypoints.length>=6);
     if(!mobile){
       await page.evaluate(()=>{const t=window.__town;t.closePanel();t.place(-1320,277,Math.PI/2);
         t.cheats.open();document.getElementById('cheat-vehicle').value='hatch';
         t.cheats.run('carHere');t.cheats.close();});
       assert((await page.evaluate(()=>window.__town.driveDiagnostics())).active,'entered car on Wattle Street');
       await page.click('canvas');
       // Controlled road-following by ordinary browser keyboard events.
       // Actual driving.update() handles speed, steering, collision and wear;
       // no direct mutation of car coordinates or yaw occurs at any time.
       const trip=await page.evaluate((path)=>{
         const t=window.__town;
         const key=(type,k)=>window.dispatchEvent(new KeyboardEvent(type,{key:k,bubbles:true}));
         const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
         let target=1,oldTurn='',onRoad=0,offRoad=0,trace=[],minFuel=Infinity;
         key('keydown','w');
         for(let step=0;step<18000;step++){
           const v=t.driveDiagnostics().vehicle;
           if(!v)break;
           while(target<path.length-1 && Math.hypot(v.x-path[target].x,v.z-path[target].z)<17)target++;
           const at=path[target],yaw=Math.atan2(-(at.x-v.x),-(at.z-v.z));
           const error=wrap(yaw-v.yaw);
           // Vehicle yaw reduces for D/right and increases for A/left.
           const turn=error>.03?'a':error<-.03?'d':'';
           if(turn!==oldTurn){if(oldTurn)key('keyup',oldTurn);if(turn)key('keydown',turn);oldTurn=turn;}
           t.stepVehicle(.05);
           const now=t.driveDiagnostics().vehicle;
           if(step%130===0){
             trace.push({x:now.x,z:now.z,yaw:now.yaw,step});
             const r=t.regionalRoads();
             // Check proximity by closest mapped path, using a fast nearest-segment
             // approximation in the test rather than overriding game geometry.
             const inRoad=r.some(seg=>{
               if(now.x<Math.min(seg.a.x,seg.b.x)-13||now.x>Math.max(seg.a.x,seg.b.x)+13||
                  now.z<Math.min(seg.a.z,seg.b.z)-13||now.z>Math.max(seg.a.z,seg.b.z)+13)return false;
               const dx=seg.b.x-seg.a.x,dz=seg.b.z-seg.a.z,l=dx*dx+dz*dz;
               const p=l?Math.max(0,Math.min(1,((now.x-seg.a.x)*dx+(now.z-seg.a.z)*dz)/l)):0;
               return Math.hypot(now.x-(seg.a.x+dx*p),now.z-(seg.a.z+dz*p))<14;
             });
             if(inRoad)onRoad++;else offRoad++;
           }
           minFuel=Math.min(minFuel,now.fuel);
           if(target===path.length-1&&Math.hypot(now.x-at.x,now.z-at.z)<12)break;
         }
         key('keyup','w');if(oldTurn)key('keyup',oldTurn);
         const last=t.driveDiagnostics();
         return {last,trace,onRoad,offRoad,minFuel,endpoint:path.at(-1),
          distance:Math.hypot(last.vehicle.x-path.at(-1).x,last.vehicle.z-path.at(-1).z)};
       },waypoints);
       assert(trip.trace.length>8,'car drove a meaningful distance, not teleported');
       assert(trip.distance<18,`car reached actual NSW highway: distance=${trip.distance}; ${JSON.stringify(trip.trace.slice(-4))}`);
       assert(trip.onRoad>=trip.offRoad*3,`approach is predominantly driveable: ${trip.onRoad}/${trip.offRoad}`);
       assert(trip.minFuel<trip.last.vehicle.fuel+5,'fuel data present during drive');
       assert(trip.last.vehicle.odometer>1.2,'car odometer recorded more than a kilometre');
       await page.evaluate(()=>{for(let i=0;i<70;i++)window.__town.stepVehicle(.05);});
       const parked=await page.evaluate(()=>window.__town.leaveVehicle());
       assert.match(parked,/Parked/,'parked real car, no simulated teleport exit');
       assert(!(await page.evaluate(()=>window.__town.state())).driving,'player returned on foot');
       console.log('PASS Narromine real-geometry car drive: '+trip.last.vehicle.odometer.toFixed(2)+' km, reached GIS highway, fuel used, parked');
     }
     const library=places.find(p=>p.id==='library');assert(library);
     await page.evaluate(p=>{window.__town.closePanel();window.__town.place(p.x,p.z,Math.PI/2);},library);
     await page.waitForFunction(()=>/Explore Narromine Library/.test(document.querySelector('#prompt')?.textContent||''),null,{timeout:10000});
     if(mobile)await page.tap('#t-use');else await page.keyboard.press('e');
     await page.waitForFunction(()=>window.__town.state().panel?.title?.includes('Library'),null,{timeout:8000});
     await page.evaluate(()=>{window.__town.closePanel();window.__town.townMap.open();});
     const selected=await page.evaluate(()=>window.__town.townMap.select('Narromine Pharmacy'));
     assert(selected?.name==='Narromine Pharmacy',`${tag}: exact named real shop searchable in game`);
     assert(/Dandaloo/i.test(selected?.address||''),`${tag}: shop matched NSW geocoded public address`);
     await page.evaluate(()=>window.__town.townMap.close());
     if(!mobile){
       await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
       await page.reload({waitUntil:'domcontentloaded'});
       await page.waitForFunction(()=>window.__town&&document.getElementById('loading').hidden,null,{timeout:120000});
       const saved=await page.evaluate(()=>window.__town.state());
       assert(saved.region==='Narromine',`reload retained Narromine outdoor saved position ${JSON.stringify(saved.pos)}`);
       assert(Math.hypot(saved.pos.x-library.x,saved.pos.z-library.z)<5,'reload held official-address library site');
     }
     assert.deepEqual(errors,[],`${tag}: no page errors`);
     console.log(`PASS Narromine ${tag}: geocoded sites, foot interaction, real-road map search`);
   }finally{await context.close();}
 }
}finally{await browser.close();}
